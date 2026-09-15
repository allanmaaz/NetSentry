"""
NetSentry Intelligence Database & Graph Service
Powered by Persistent SQLite Storage (netsentry.db) & Supabase Integration.
Provides real-world criminal network intelligence, dynamic betweenness centrality,
automated Indic entity resolution, and Section 65B compliance.
"""

import os
import csv
import json
import io
from typing import Dict, List, Any, Optional
import networkx as nx

from backend.app.core.config import settings
from backend.app.services.db_manager import db_manager
from backend.app.services.alias_engine import resolve_entity_pair
from backend.app.services.xai_explainer import (
    generate_entity_resolution_justification,
    generate_risk_score_justification
)

class SupabaseService:
    def __init__(self):
        self.client = None
        self.is_connected = False
        self._init_supabase()

        # In-memory graph representation synchronized with SQLite
        self.nx_graph = nx.Graph()
        self.nodes_data: Dict[str, Dict[str, Any]] = {}
        self.pending_resolutions: List[Dict[str, Any]] = []

        # Load database records into graph
        self.load_dataset()

    def _init_supabase(self):
        """Initializes Supabase Client if credentials are provided in settings."""
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                from supabase import create_client
                self.client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
                self.is_connected = True
                print(f" Connected to Supabase at {settings.SUPABASE_URL}")
            except Exception as e:
                self.is_connected = False
                print(f" Supabase init failed ({e}). Using persistent local SQLite database.")
        else:
            self.is_connected = False
            print(" Operating on Persistent SQLite Database (backend/netsentry.db).")

    def load_dataset(self):
        """Loads records from SQLite database into memory graph."""
        self.nx_graph.clear()
        self.nodes_data.clear()
        self.pending_resolutions.clear()

        # If DB is empty, auto-seed with real Telgi syndicate records
        if db_manager.count_persons() == 0:
            from data.real_telgi_dataset import seed_real_case_data
            seed_real_case_data()

        # 1. Load Persons
        persons = db_manager.get_all_persons()
        for p in persons:
            pid = p["id"]
            identifiers = db_manager.get_identifiers_for_person(pid)
            firs = db_manager.get_firs_for_person(pid)

            phones = [i["value"] for i in identifiers if i["identifier_type"] == "PHONE"]
            vehicles = [i["value"] for i in identifiers if i["identifier_type"] == "VEHICLE"]
            banks = [i["value"] for i in identifiers if i["identifier_type"] == "BANK_ACCOUNT"]

            self.nodes_data[pid] = {
                "id": pid,
                "label": p["canonical_name"],
                "name": p["canonical_name"],
                "type": "Person",
                "state": p.get("primary_state", "Maharashtra"),
                "jurisdictions": set(p.get("jurisdictions", ["Maharashtra"])),
                "risk_score": p.get("risk_score", 50),
                "risk_tier": p.get("risk_tier", "medium"),
                "betweenness": p.get("betweenness_centrality", 0.0),
                "orbit_level": p.get("orbit_level", 2),
                "is_cross_jurisdiction": bool(p.get("is_cross_jurisdiction", False)),
                "phones": phones,
                "vehicles": vehicles,
                "bank_accounts": banks,
                "firs": [
                    {
                        "fir_id": f["fir_id"],
                        "station": f["police_station"],
                        "crime_type": f["crime_type"],
                        "sections": f["sections"],
                        "date": f["incident_date"],
                        "state": f["state"]
                    }
                    for f in firs
                ],
                "aliases": p.get("aliases", [])
            }
            self.nx_graph.add_node(pid)

        # 2. Load Edges
        edges = db_manager.get_all_edges()
        for e in edges:
            src = e["source_id"]
            tgt = e["target_id"]
            if self.nx_graph.has_node(src) and self.nx_graph.has_node(tgt):
                self.nx_graph.add_edge(
                    src, tgt,
                    id=e["id"],
                    type=e["relation_type"],
                    weight=e.get("weight", 1.0),
                    label=e.get("label", e["relation_type"]),
                    is_cross_jurisdiction=bool(e.get("is_cross_jurisdiction", False))
                )

        # 3. Build Dynamic Cross-Jurisdiction Edges from Shared Identifiers
        self._link_shared_identifiers()

        # 4. Detect Cross-Jurisdiction Duplicates (HITL Queue)
        self._build_resolution_candidates()

    def _link_shared_identifiers(self):
        """Connects nodes that share identical telecom MSISDN or vehicle plates."""
        phone_map: Dict[str, List[str]] = {}
        vehicle_map: Dict[str, List[str]] = {}

        for pid, d in self.nodes_data.items():
            for ph in d.get("phones", []):
                phone_map.setdefault(ph, []).append(pid)
            for vh in d.get("vehicles", []):
                vehicle_map.setdefault(vh, []).append(pid)

        for ph, pids in phone_map.items():
            if len(pids) > 1:
                for i in range(len(pids)):
                    for j in range(i + 1, len(pids)):
                        p1, p2 = pids[i], pids[j]
                        if not self.nx_graph.has_edge(p1, p2):
                            self.nx_graph.add_edge(
                                p1, p2,
                                type="CALLED",
                                weight=3.0,
                                label=f"Shared Phone {ph}"
                            )

        for vh, pids in vehicle_map.items():
            if len(pids) > 1:
                for i in range(len(pids)):
                    for j in range(i + 1, len(pids)):
                        p1, p2 = pids[i], pids[j]
                        if not self.nx_graph.has_edge(p1, p2):
                            self.nx_graph.add_edge(
                                p1, p2,
                                type="ASSOCIATED_WITH",
                                weight=2.5,
                                label=f"Shared Vehicle {vh}"
                            )

    def _build_resolution_candidates(self):
        """Dynamically scans all pairs across jurisdictions using Indic matching & ML."""
        self.pending_resolutions = []
        node_ids = list(self.nodes_data.keys())

        candidate_counter = 1
        for i in range(len(node_ids)):
            for j in range(i + 1, len(node_ids)):
                p1_id = node_ids[i]
                p2_id = node_ids[j]
                p1 = self.nodes_data[p1_id]
                p2 = self.nodes_data[p2_id]

                # Compare pairs that share jurisdiction or have shared identifiers or similar names
                res = resolve_entity_pair(p1, p2)
                if res["total_score"] >= settings.HITL_MIN_THRESHOLD:
                    justification = generate_entity_resolution_justification(
                        p1["name"], p2["name"], res,
                        f"{p1.get('state', 'State')} Police",
                        f"{p2.get('state', 'State')} Police"
                    )

                    self.pending_resolutions.append({
                        "candidate_id": f"RES-2026-{candidate_counter:03d}",
                        "primary_id": p1_id,
                        "primary_name": p1["name"],
                        "primary_dept": f"{p1.get('state')} Police",
                        "secondary_id": p2_id,
                        "secondary_name": p2["name"],
                        "secondary_dept": f"{p2.get('state')} Police",
                        "confidence_score": res["total_score"],
                        "adjudication_tier": res["tier"],
                        "breakdown": {
                            "levenshtein_similarity": res["breakdown"]["lev"],
                            "phonetic_similarity": res["breakdown"]["phonetic"],
                            "token_sort_ratio": res["breakdown"]["token"],
                            "base_name_score": res["base_name_score"],
                            "corroboration_boost": res["corroboration_boost"],
                            "total_score": res["total_score"]
                        },
                        "shared_identifiers": res["shared_identifiers"],
                        "legal_reasoning": justification
                    })
                    candidate_counter += 1

    def get_solar_system_graph(self) -> Dict[str, Any]:
        """Dynamically computes Betweenness Centrality and structures the Solar System hierarchy."""
        if len(self.nx_graph) > 0:
            betweenness = nx.betweenness_centrality(self.nx_graph)
            degree_scores = nx.degree_centrality(self.nx_graph)
        else:
            betweenness = {}
            degree_scores = {}

        sorted_nodes = sorted(betweenness.items(), key=lambda x: x[1], reverse=True)
        kingpin_id = sorted_nodes[0][0] if sorted_nodes else ""

        nodes = []
        cross_state_count = 0

        for pid, data in self.nodes_data.items():
            b_score = betweenness.get(pid, 0.0)
            p_score = degree_scores.get(pid, 0.0)

            # Assign dynamic orbits based on graph bottleneck centrality
            if pid == kingpin_id:
                orbit = 0
                radius = 32
                risk_score = 98
                tier = "critical"
            elif b_score > 0.15 or (kingpin_id and self.nx_graph.has_edge(pid, kingpin_id)):
                orbit = 1
                radius = 20
                risk_score = 86
                tier = "high"
            elif b_score > 0.02 or len(data.get("phones", [])) > 1:
                orbit = 2
                radius = 15
                risk_score = 70
                tier = "medium"
            else:
                orbit = 3
                radius = 12
                risk_score = 45
                tier = "low"

            is_cross = len(data.get("jurisdictions", [])) > 1 or data.get("is_cross_jurisdiction", False)
            if is_cross:
                cross_state_count += 1

            nodes.append({
                "id": pid,
                "label": data["name"],
                "name": data["name"],
                "type": "Person",
                "risk_score": risk_score,
                "risk_tier": tier,
                "betweenness": round(b_score, 4),
                "pagerank": round(p_score, 4),
                "orbit_level": orbit,
                "is_cross_jurisdiction": is_cross,
                "state": data.get("state", "Maharashtra"),
                "radius": radius,
                "details": {
                    "phones": data.get("phones", []),
                    "vehicles": data.get("vehicles", []),
                    "firs_count": len(data.get("firs", [])),
                    "aliases": data.get("aliases", [])
                }
            })

        edges = []
        for u, v, attrs in self.nx_graph.edges(data=True):
            u_data = self.nodes_data.get(u, {})
            v_data = self.nodes_data.get(v, {})
            cross_link = u_data.get("state") != v_data.get("state")

            edges.append({
                "source": u,
                "target": v,
                "type": attrs.get("type", "ASSOCIATED_WITH"),
                "weight": attrs.get("weight", 1.0),
                "label": attrs.get("label", attrs.get("type", "")),
                "is_cross_jurisdiction": cross_link
            })

        return {
            "nodes": nodes,
            "edges": edges,
            "stats": {
                "total_nodes": len(self.nodes_data),
                "displayed_nodes": len(nodes),
                "total_edges": len(edges),
                "kingpin_id": kingpin_id,
                "cross_state_entities": cross_state_count,
                "pending_hitl_count": len(self.pending_resolutions),
                "database_backend": "SQLite (netsentry.db) + Supabase" if self.is_connected else "SQLite Persistent (netsentry.db)"
            }
        }

    def get_entity_detail(self, entity_id: str) -> Optional[Dict[str, Any]]:
        """Returns verified criminal dossier directly from persistent database."""
        data = self.nodes_data.get(entity_id)
        if not data:
            return None

        betweenness = nx.betweenness_centrality(self.nx_graph) if len(self.nx_graph) > 0 else {}
        b_score = betweenness.get(entity_id, 0.0)

        sorted_ranks = sorted(betweenness.items(), key=lambda x: x[1], reverse=True)
        rank = 1
        for idx, (nid, _) in enumerate(sorted_ranks):
            if nid == entity_id:
                rank = idx + 1
                break

        is_cross = len(data.get("jurisdictions", [])) > 1 or data.get("is_cross_jurisdiction", False)

        associates = []
        if self.nx_graph.has_node(entity_id):
            for neighbor in self.nx_graph.neighbors(entity_id):
                edge_data = self.nx_graph.get_edge_data(entity_id, neighbor)
                n_data = self.nodes_data.get(neighbor, {})
                associates.append({
                    "id": neighbor,
                    "name": n_data.get("name", neighbor),
                    "relation": edge_data.get("type", "ASSOCIATED_WITH"),
                    "details": edge_data.get("label", "")
                })

        risk_score = 95 if rank == 1 else (85 if rank <= 3 else (70 if rank <= 6 else 45))
        risk_tier = "critical" if risk_score >= 90 else ("high" if risk_score >= 75 else "medium")

        justification = generate_risk_score_justification(
            data["name"], risk_score, b_score, is_cross,
            len(data.get("firs", [])), len(associates)
        )

        return {
            "id": entity_id,
            "canonical_name": data["name"],
            "aliases": data.get("aliases", []),
            "risk_score": risk_score,
            "risk_tier": risk_tier,
            "centrality_rank": rank,
            "betweenness_score": round(b_score, 4),
            "is_cross_jurisdiction": is_cross,
            "states": list(data.get("jurisdictions", [data.get("state", "Maharashtra")])),
            "phones": data.get("phones", []),
            "vehicles": data.get("vehicles", []),
            "bank_accounts": data.get("bank_accounts", []),
            "firs": data.get("firs", []),
            "associates": associates,
            "legal_justification": justification
        }

    def get_pending_resolutions(self) -> List[Dict[str, Any]]:
        return self.pending_resolutions

    def apply_resolution_decision(self, candidate_id: str, action: str, officer_id: str = "OFFICER-001", notes: str = "") -> Dict[str, Any]:
        """
        Executes atomic merge or rejection in the persistent SQLite database
        and updates the live graph in real-time.
        """
        candidate = next((c for c in self.pending_resolutions if c["candidate_id"] == candidate_id), None)
        if not candidate:
            return {"status": "error", "message": "Candidate not found"}

        primary_id = candidate["primary_id"]
        secondary_id = candidate["secondary_id"]

        if action == "MERGE":
            primary = self.nodes_data.get(primary_id)
            secondary = self.nodes_data.get(secondary_id)

            if primary and secondary:
                # 1. Merge Aliases, Phones, Vehicles, FIRs
                merged_aliases = list(set(primary.get("aliases", []) + [secondary["name"]] + secondary.get("aliases", [])))
                primary["aliases"] = merged_aliases
                primary["jurisdictions"].update(secondary.get("jurisdictions", set()))
                primary["is_cross_jurisdiction"] = True

                for p in secondary.get("phones", []):
                    if p not in primary["phones"]:
                        primary["phones"].append(p)
                for v in secondary.get("vehicles", []):
                    if v not in primary["vehicles"]:
                        primary["vehicles"].append(v)
                for f in secondary.get("firs", []):
                    primary["firs"].append(f)

                # 2. Reroute graph edges from secondary to primary
                if self.nx_graph.has_node(secondary_id):
                    for neighbor in list(self.nx_graph.neighbors(secondary_id)):
                        if neighbor != primary_id:
                            edge_data = self.nx_graph.get_edge_data(secondary_id, neighbor)
                            self.nx_graph.add_edge(primary_id, neighbor, **edge_data)
                    self.nx_graph.remove_node(secondary_id)

                # 3. Update SQLite Database Permanently
                with db_manager.get_connection() as conn:
                    cursor = conn.cursor()
                    # Update secondary FIRs and identifiers to point to primary
                    cursor.execute("UPDATE firs SET person_id = ? WHERE person_id = ?", (primary_id, secondary_id))
                    cursor.execute("UPDATE identifiers SET person_id = ? WHERE person_id = ?", (primary_id, secondary_id))
                    cursor.execute("DELETE FROM persons WHERE id = ?", (secondary_id,))
                    cursor.execute("DELETE FROM network_edges WHERE source_id = ? OR target_id = ?", (secondary_id, secondary_id))
                    conn.commit()

                # Update primary person in SQLite
                db_manager.insert_person(primary)

                # Remove from in-memory cache
                self.nodes_data.pop(secondary_id, None)

        # Log Section 65B Audit Trail
        db_manager.log_audit(
            action=action,
            entity_id=primary_id,
            officer_id=officer_id,
            details={
                "candidate_id": candidate_id,
                "secondary_id": secondary_id,
                "notes": notes,
                "confidence": candidate["confidence_score"]
            }
        )

        # Remove from pending list
        self.pending_resolutions = [c for c in self.pending_resolutions if c["candidate_id"] != candidate_id]

        return {
            "status": "success",
            "action": action,
            "candidate_id": candidate_id,
            "canonical_id": primary_id
        }

    # Compatibility alias for resolution router
    apply_merge_decision = apply_resolution_decision

    def ingest_csv_data(self, csv_text: str) -> Dict[str, Any]:
        """
        Ingests user-uploaded raw CSV text, inserts records into SQLite,
        and dynamically rebuilds the network graph.
        """
        reader = csv.DictReader(io.StringIO(csv_text.strip()))
        ingested_count = 0

        for row in reader:
            name = row.get("name") or row.get("accused_name") or row.get("suspect")
            if not name:
                continue
            name = name.strip()
            person_id = f"person_{name.lower().replace(' ', '_').replace('.', '')}"
            state = row.get("state") or row.get("jurisdiction") or "Maharashtra"
            station = row.get("police_station") or row.get("station") or "General PS"
            sections = row.get("sections") or row.get("ipc_sections") or "120B IPC"
            phone = row.get("phone") or row.get("contact") or ""
            vehicle = row.get("vehicle") or row.get("plate") or ""
            alias = row.get("alias") or ""
            aliases = [alias.strip()] if alias.strip() else []

            person_data = {
                "id": person_id,
                "canonical_name": name,
                "risk_score": int(row.get("risk_score", 70)),
                "risk_tier": "high",
                "betweenness_centrality": 0.05,
                "orbit_level": 2,
                "is_cross_jurisdiction": False,
                "primary_state": state,
                "jurisdictions": [state],
                "aliases": aliases
            }
            db_manager.insert_person(person_data)

            if phone:
                db_manager.insert_identifier(f"id_phone_{person_id}_{phone}", person_id, "PHONE", phone, state)
            if vehicle:
                db_manager.insert_identifier(f"id_veh_{person_id}_{vehicle}", person_id, "VEHICLE", vehicle, state)

            fir_id = row.get("fir_id") or row.get("crime_no") or f"FIR-{person_id[:10]}-{ingested_count}"
            db_manager.insert_fir({
                "fir_id": fir_id,
                "person_id": person_id,
                "police_station": station,
                "crime_type": row.get("crime_type", "IPC Offense"),
                "sections": sections,
                "incident_date": row.get("date"),
                "state": state
            })
            ingested_count += 1

        # Re-index dataset into memory graph
        self.load_dataset()

        return {
            "status": "success",
            "ingested_records": ingested_count,
            "total_graph_nodes": len(self.nodes_data)
        }

supabase_service = SupabaseService()
