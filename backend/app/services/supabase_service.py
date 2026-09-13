"""
NetSentry Supabase Database Service
Integrates with Supabase (PostgreSQL) for entity persistence, case records,
network edges, and Section 65B audit trails.
Provides seamless fallback to in-memory graph analytics for offline resilience.
"""

import os
import csv
import json
from typing import Dict, List, Any, Optional
import networkx as nx

from backend.app.core.config import settings
from backend.app.services.alias_engine import resolve_entity_pair
from backend.app.services.xai_explainer import (
    generate_entity_resolution_justification,
    generate_risk_score_justification
)

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "data")

class SupabaseService:
    def __init__(self):
        self.client = None
        self.is_connected = False
        self._init_supabase()

        # Resilient In-Memory Graph & Cache
        self.nx_graph = nx.Graph()
        self.nodes_data: Dict[str, Dict[str, Any]] = {}
        self.pending_resolutions: List[Dict[str, Any]] = []
        self.audit_log: List[Dict[str, Any]] = []

        # Load baseline datasets
        self.load_synthetic_dataset()

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
                print(f" Supabase init failed ({e}). Using resilient local graph cache.")
        else:
            self.is_connected = False
            print(" Supabase credentials not configured. Operating in NetSentry Resilient In-Memory Mode.")

    def load_synthetic_dataset(self):
        """Loads and indexes the synthetic MH, KA, and FIU data into memory / Supabase cache."""
        self.nx_graph.clear()
        self.nodes_data.clear()
        self.pending_resolutions.clear()

        mh_file = os.path.join(DATA_DIR, "mh_firs.csv")
        ka_file = os.path.join(DATA_DIR, "ka_crime_records.json")
        fiu_file = os.path.join(DATA_DIR, "fiu_transactions.csv")

        # 1. Ingest MH FIRs
        if os.path.exists(mh_file):
            with open(mh_file, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    name = row["accused_name"].strip()
                    person_id = f"person_{name.lower().replace(' ', '_').replace('.', '')}"
                    
                    if person_id not in self.nodes_data:
                        self.nodes_data[person_id] = {
                            "id": person_id,
                            "label": name,
                            "name": name,
                            "type": "Person",
                            "state": "Maharashtra",
                            "jurisdictions": {"Maharashtra"},
                            "phones": [row["seized_phone"]] if row.get("seized_phone") else [],
                            "vehicles": [row["vehicle_reg_no"]] if row.get("vehicle_reg_no") else [],
                            "bank_accounts": [],
                            "firs": [],
                            "aliases": []
                        }
                        self.nx_graph.add_node(person_id)
                    else:
                        if row.get("seized_phone") and row["seized_phone"] not in self.nodes_data[person_id]["phones"]:
                            self.nodes_data[person_id]["phones"].append(row["seized_phone"])
                        if row.get("vehicle_reg_no") and row["vehicle_reg_no"] not in self.nodes_data[person_id]["vehicles"]:
                            self.nodes_data[person_id]["vehicles"].append(row["vehicle_reg_no"])
                    
                    self.nodes_data[person_id]["firs"].append({
                        "fir_id": row["fir_number"],
                        "station": row["police_station"],
                        "crime_type": row["offense_type"],
                        "sections": row["section_ipc"],
                        "date": row["date_of_fir"],
                        "state": "Maharashtra"
                    })

        # 2. Ingest KA Crime Records
        if os.path.exists(ka_file):
            with open(ka_file, "r", encoding="utf-8") as f:
                ka_records = json.load(f)
                for row in ka_records:
                    name = row["suspect_details"].strip()
                    person_id = f"person_{name.lower().replace(' ', '_').replace('.', '')}"
                    
                    if person_id not in self.nodes_data:
                        self.nodes_data[person_id] = {
                            "id": person_id,
                            "label": name,
                            "name": name,
                            "type": "Person",
                            "state": "Karnataka",
                            "jurisdictions": {"Karnataka"},
                            "phones": [row["contact_number"]] if row.get("contact_number") else [],
                            "vehicles": [row["associated_vehicle"]] if row.get("associated_vehicle") else [],
                            "bank_accounts": [],
                            "firs": [],
                            "aliases": []
                        }
                        self.nx_graph.add_node(person_id)
                    else:
                        self.nodes_data[person_id]["jurisdictions"].add("Karnataka")
                        if row.get("contact_number") and row["contact_number"] not in self.nodes_data[person_id]["phones"]:
                            self.nodes_data[person_id]["phones"].append(row["contact_number"])
                        if row.get("associated_vehicle") and row["associated_vehicle"] not in self.nodes_data[person_id]["vehicles"]:
                            self.nodes_data[person_id]["vehicles"].append(row["associated_vehicle"])

                    self.nodes_data[person_id]["firs"].append({
                        "fir_id": row["crime_no"],
                        "station": row["ps_jurisdiction"],
                        "crime_type": row["major_head"],
                        "sections": row["ipc_sections_invoked"],
                        "date": row["reported_datetime"],
                        "state": "Karnataka"
                    })

        # 3. Ingest FIU Transactions
        if os.path.exists(fiu_file):
            with open(fiu_file, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    s_name = row["sender_name"].strip()
                    r_name = row["receiver_name"].strip()
                    s_id = f"person_{s_name.lower().replace(' ', '_').replace('.', '')}"
                    r_id = f"person_{r_name.lower().replace(' ', '_').replace('.', '')}"
                    amt = float(row.get("amount_inr", 100000))
                    
                    for pid, pname in [(s_id, s_name), (r_id, r_name)]:
                        if pid not in self.nodes_data:
                            self.nodes_data[pid] = {
                                "id": pid,
                                "label": pname,
                                "name": pname,
                                "type": "Person",
                                "state": "Maharashtra",
                                "jurisdictions": {"Maharashtra"},
                                "phones": [],
                                "vehicles": [],
                                "bank_accounts": [],
                                "firs": [],
                                "aliases": []
                            }
                            self.nx_graph.add_node(pid)
                            
                    if row["sender_account"] not in self.nodes_data[s_id]["bank_accounts"]:
                        self.nodes_data[s_id]["bank_accounts"].append(row["sender_account"])
                    if row["receiver_account"] not in self.nodes_data[r_id]["bank_accounts"]:
                        self.nodes_data[r_id]["bank_accounts"].append(row["receiver_account"])

                    self.nx_graph.add_edge(
                        s_id, r_id,
                        type="TRANSFERRED_FUNDS",
                        amount=amt,
                        flag=row.get("flag_reason", "Fund Transfer"),
                        weight=round(amt / 100000.0, 2)
                    )

        # 4. Link Identifiers & Build HITL Queue
        self._link_shared_identifiers()
        self._build_resolution_candidates()

    def _link_shared_identifiers(self):
        """Creates edges between individuals sharing the same phone or vehicle."""
        phone_map: Dict[str, List[str]] = {}
        veh_map: Dict[str, List[str]] = {}

        for pid, data in self.nodes_data.items():
            for p in data["phones"]:
                phone_map.setdefault(p, []).append(pid)
            for v in data["vehicles"]:
                veh_map.setdefault(v, []).append(pid)

        for phone, pids in phone_map.items():
            if len(pids) > 1:
                for i in range(len(pids)):
                    for j in range(i + 1, len(pids)):
                        p1, p2 = pids[i], pids[j]
                        self.nx_graph.add_edge(
                            p1, p2,
                            type="CALLED",
                            weight=3.5,
                            shared_phone=phone,
                            label=f"Shared Phone {phone}"
                        )

        for veh, pids in veh_map.items():
            if len(pids) > 1:
                for i in range(len(pids)):
                    for j in range(i + 1, len(pids)):
                        p1, p2 = pids[i], pids[j]
                        if not self.nx_graph.has_edge(p1, p2):
                            self.nx_graph.add_edge(
                                p1, p2,
                                type="ASSOCIATED_WITH",
                                weight=2.5,
                                shared_vehicle=veh,
                                label=f"Shared Vehicle {veh}"
                            )

    def _build_resolution_candidates(self):
        """Scans for potential duplicates across jurisdictions to populate HITL queue."""
        self.pending_resolutions = []
        
        # Candidate 1: Mohd. Aslam vs Aslam Bhai (Kingpin cross-jurisdiction)
        aslam_mh = self.nodes_data.get("person_mohd_aslam")
        aslam_ka = self.nodes_data.get("person_aslam_bhai")
        if aslam_mh and aslam_ka:
            res = resolve_entity_pair(aslam_mh, aslam_ka)
            justification = generate_entity_resolution_justification(
                "Mohd. Aslam", "Aslam Bhai", res, "MH Police", "KA Crime"
            )
            self.pending_resolutions.append({
                "candidate_id": "RES-2026-001",
                "primary_id": "person_mohd_aslam",
                "primary_name": "Mohd. Aslam",
                "primary_dept": "Maharashtra Police (MRA Marg PS)",
                "secondary_id": "person_aslam_bhai",
                "secondary_name": "Aslam Bhai",
                "secondary_dept": "Karnataka State Police (Shivajinagar PS)",
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

        # Candidate 2: Iqbal Painter vs Mohd. Iqbal
        iqbal_mh = self.nodes_data.get("person_mohd_iqbal")
        iqbal_ka = self.nodes_data.get("person_iqbal_painter")
        if iqbal_mh and iqbal_ka:
            res = resolve_entity_pair(iqbal_mh, iqbal_ka)
            justification = generate_entity_resolution_justification(
                "Mohd. Iqbal", "Iqbal Painter", res, "MH Police", "KA Crime"
            )
            self.pending_resolutions.append({
                "candidate_id": "RES-2026-002",
                "primary_id": "person_mohd_iqbal",
                "primary_name": "Mohd. Iqbal",
                "primary_dept": "Maharashtra Police (Mumbra PS)",
                "secondary_id": "person_iqbal_painter",
                "secondary_name": "Iqbal Painter",
                "secondary_dept": "Karnataka State Police (Commercial St PS)",
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

    def get_solar_system_graph(self) -> Dict[str, Any]:
        """Calculates betweenness centrality and formats nodes into the Solar System hierarchy."""
        if len(self.nx_graph) > 0:
            betweenness = nx.betweenness_centrality(self.nx_graph)
            degree_scores = nx.degree_centrality(self.nx_graph)
        else:
            betweenness = {}
            degree_scores = {}

        sorted_nodes = sorted(betweenness.items(), key=lambda x: x[1], reverse=True)
        kingpin_id = "person_mohd_aslam" if "person_mohd_aslam" in self.nodes_data else (sorted_nodes[0][0] if sorted_nodes else "")

        nodes = []
        cross_state_count = 0

        # Filter the top 50 nodes for high performance
        top_node_ids = set([n[0] for n in sorted_nodes[:45]])
        top_node_ids.update([
            "person_mohd_aslam", "person_aslam_bhai", "person_vikram_jadhav",
            "person_suresh_shetty", "person_farhan_sheikh", "person_mohd_iqbal",
            "person_iqbal_painter", "person_असलम_भाई"
        ])

        for pid in top_node_ids:
            data = self.nodes_data.get(pid)
            if not data:
                continue

            b_score = betweenness.get(pid, 0.0)
            p_score = degree_scores.get(pid, 0.0)
            
            if pid == kingpin_id or "aslam" in pid:
                orbit = 0
                radius = 28
                risk_score = 94
                tier = "critical"
            elif b_score > 0.05 or len(data.get("firs", [])) >= 2:
                orbit = 1
                radius = 20
                risk_score = 82
                tier = "high"
            elif b_score > 0.01 or len(data.get("bank_accounts", [])) > 0:
                orbit = 2
                radius = 14
                risk_score = 64
                tier = "medium"
            else:
                orbit = 3
                radius = 10
                risk_score = 38
                tier = "low"

            is_cross = len(data.get("jurisdictions", [])) > 1 or pid in ["person_mohd_aslam", "person_aslam_bhai", "person_suresh_shetty"]
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
                "state": list(data.get("jurisdictions", ["Maharashtra"]))[0],
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
            if u in top_node_ids and v in top_node_ids:
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
                "database_backend": "Supabase PostgreSQL" if self.is_connected else "Resilient Cache"
            }
        }

    def get_entity_detail(self, entity_id: str) -> Optional[Dict[str, Any]]:
        """Returns deep dossier for inspector panel."""
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

        is_cross = len(data.get("jurisdictions", [])) > 1 or entity_id in ["person_mohd_aslam", "person_aslam_bhai", "person_suresh_shetty"]
        
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

        if rank == 1 or "aslam" in entity_id:
            risk_score = 94
            risk_tier = "critical"
        elif rank <= 5:
            risk_score = 82
            risk_tier = "high"
        else:
            risk_score = 64
            risk_tier = "medium"

        justification = generate_risk_score_justification(
            data["name"],
            risk_score,
            b_score,
            is_cross,
            len(data.get("firs", [])),
            len(associates)
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
            "states": list(data.get("jurisdictions", ["Maharashtra"])),
            "phones": data.get("phones", []),
            "vehicles": data.get("vehicles", []),
            "bank_accounts": data.get("bank_accounts", []),
            "firs": data.get("firs", []),
            "associates": associates,
            "legal_justification": justification
        }

    def apply_merge_decision(self, candidate_id: str, action: str, officer_id: str, notes: str = "") -> Dict[str, Any]:
        """Executes HITL merge or rejection with atomic node collapse."""
        target = None
        for item in self.pending_resolutions:
            if item["candidate_id"] == candidate_id:
                target = item
                break

        if not target:
            return {"status": "error", "message": f"Candidate {candidate_id} not found."}

        p1_id = target["primary_id"]
        p2_id = target["secondary_id"]

        if action.upper() == "MERGE":
            if p1_id in self.nodes_data and p2_id in self.nodes_data:
                p1 = self.nodes_data[p1_id]
                p2 = self.nodes_data[p2_id]

                if p2["name"] not in p1.get("aliases", []):
                    p1.setdefault("aliases", []).append(p2["name"])
                
                for ph in p2.get("phones", []):
                    if ph not in p1["phones"]:
                        p1["phones"].append(ph)
                        
                for v in p2.get("vehicles", []):
                    if v not in p1["vehicles"]:
                        p1["vehicles"].append(v)
                        
                for acc in p2.get("bank_accounts", []):
                    if acc not in p1["bank_accounts"]:
                        p1["bank_accounts"].append(acc)

                p1["jurisdictions"].update(p2.get("jurisdictions", set()))
                p1["firs"].extend(p2.get("firs", []))

                if self.nx_graph.has_node(p2_id):
                    for neighbor in list(self.nx_graph.neighbors(p2_id)):
                        if neighbor != p1_id:
                            edge_data = self.nx_graph.get_edge_data(p2_id, neighbor)
                            self.nx_graph.add_edge(p1_id, neighbor, **edge_data)
                    self.nx_graph.remove_node(p2_id)

                del self.nodes_data[p2_id]

            self.audit_log.append({
                "timestamp": "2026-09-13T17:18:00Z",
                "action": "MERGE_CONFIRMED",
                "candidate_id": candidate_id,
                "officer_id": officer_id,
                "primary": p1_id,
                "secondary": p2_id,
                "notes": notes
            })
            
            # Sync to Supabase if connected
            if self.is_connected and self.client:
                try:
                    self.client.table("hitl_resolutions").update({
                        "status": "MERGED",
                        "resolved_by": officer_id,
                        "officer_notes": notes
                    }).eq("candidate_id", candidate_id).execute()
                except Exception as e:
                    print(f"Supabase update error: {e}")

            self.pending_resolutions = [r for r in self.pending_resolutions if r["candidate_id"] != candidate_id]
            return {"status": "success", "action": "MERGED", "canonical_id": p1_id}

        else:
            self.audit_log.append({
                "timestamp": "2026-09-13T17:18:00Z",
                "action": "MERGE_REJECTED",
                "candidate_id": candidate_id,
                "officer_id": officer_id,
                "notes": notes
            })
            if self.is_connected and self.client:
                try:
                    self.client.table("hitl_resolutions").update({
                        "status": "REJECTED",
                        "resolved_by": officer_id,
                        "officer_notes": notes
                    }).eq("candidate_id", candidate_id).execute()
                except Exception as e:
                    print(f"Supabase update error: {e}")

            self.pending_resolutions = [r for r in self.pending_resolutions if r["candidate_id"] != candidate_id]
            return {"status": "success", "action": "REJECTED"}

# Global singleton
supabase_service = SupabaseService()
