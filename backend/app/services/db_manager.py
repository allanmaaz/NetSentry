import os
import sqlite3
import json
from typing import Dict, List, Any, Optional
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "netsentry.db")

class DatabaseManager:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._init_db()

    def get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.executescript("""
            CREATE TABLE IF NOT EXISTS persons (
                id TEXT PRIMARY KEY,
                canonical_name TEXT NOT NULL,
                risk_score INTEGER DEFAULT 50,
                risk_tier TEXT DEFAULT 'medium',
                betweenness_centrality REAL DEFAULT 0.0,
                orbit_level INTEGER DEFAULT 2,
                is_cross_jurisdiction INTEGER DEFAULT 0,
                primary_state TEXT DEFAULT 'Maharashtra',
                jurisdictions TEXT DEFAULT '["Maharashtra"]',
                aliases TEXT DEFAULT '[]',
                metadata TEXT DEFAULT '{}',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS identifiers (
                id TEXT PRIMARY KEY,
                person_id TEXT NOT NULL,
                identifier_type TEXT NOT NULL,
                value TEXT NOT NULL,
                state TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS firs (
                fir_id TEXT PRIMARY KEY,
                person_id TEXT NOT NULL,
                police_station TEXT NOT NULL,
                crime_type TEXT NOT NULL,
                sections TEXT NOT NULL,
                incident_date TEXT,
                state TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS network_edges (
                id TEXT PRIMARY KEY,
                source_id TEXT NOT NULL,
                target_id TEXT NOT NULL,
                relation_type TEXT NOT NULL,
                weight REAL DEFAULT 1.0,
                label TEXT,
                is_cross_jurisdiction INTEGER DEFAULT 0,
                metadata TEXT DEFAULT '{}',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (source_id) REFERENCES persons(id) ON DELETE CASCADE,
                FOREIGN KEY (target_id) REFERENCES persons(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS hitl_resolutions (
                candidate_id TEXT PRIMARY KEY,
                primary_id TEXT NOT NULL,
                primary_name TEXT NOT NULL,
                primary_dept TEXT NOT NULL,
                secondary_id TEXT NOT NULL,
                secondary_name TEXT NOT NULL,
                secondary_dept TEXT NOT NULL,
                confidence_score REAL NOT NULL,
                adjudication_tier TEXT NOT NULL,
                breakdown TEXT NOT NULL,
                shared_identifiers TEXT NOT NULL,
                legal_reasoning TEXT NOT NULL,
                status TEXT DEFAULT 'PENDING',
                officer_notes TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS audit_log (
                id TEXT PRIMARY KEY,
                action TEXT NOT NULL,
                entity_id TEXT NOT NULL,
                officer_id TEXT NOT NULL,
                details TEXT NOT NULL,
                timestamp TEXT DEFAULT CURRENT_TIMESTAMP
            );
            """)
            conn.commit()

    def count_persons(self) -> int:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM persons")
            return cursor.fetchone()[0]

    def insert_person(self, person: Dict[str, Any]):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT OR REPLACE INTO persons (
                id, canonical_name, risk_score, risk_tier, betweenness_centrality,
                orbit_level, is_cross_jurisdiction, primary_state, jurisdictions, aliases, metadata, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (
                person["id"],
                person.get("canonical_name") or person.get("name"),
                person.get("risk_score", 50),
                person.get("risk_tier", "medium"),
                person.get("betweenness_centrality", 0.0),
                person.get("orbit_level", 2),
                1 if person.get("is_cross_jurisdiction") else 0,
                person.get("primary_state") or person.get("state", "Maharashtra"),
                json.dumps(list(person.get("jurisdictions", ["Maharashtra"]))),
                json.dumps(person.get("aliases", [])),
                json.dumps(person.get("metadata", {}))
            ))
            conn.commit()

    def insert_identifier(self, id_val: str, person_id: str, id_type: str, value: str, state: str = "Maharashtra"):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT OR REPLACE INTO identifiers (id, person_id, identifier_type, value, state)
            VALUES (?, ?, ?, ?, ?)
            """, (id_val, person_id, id_type, value, state))
            conn.commit()

    def insert_fir(self, fir: Dict[str, Any]):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT OR REPLACE INTO firs (fir_id, person_id, police_station, crime_type, sections, incident_date, state)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                fir["fir_id"],
                fir["person_id"],
                fir["police_station"],
                fir.get("crime_type", "IPC Offense"),
                fir.get("sections", "120B IPC"),
                fir.get("incident_date") or datetime.now().isoformat(),
                fir.get("state", "Maharashtra")
            ))
            conn.commit()

    def insert_edge(self, edge_id: str, source_id: str, target_id: str, relation_type: str, weight: float = 1.0, label: str = "", is_cross: bool = False):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT OR REPLACE INTO network_edges (id, source_id, target_id, relation_type, weight, label, is_cross_jurisdiction)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (edge_id, source_id, target_id, relation_type, weight, label, 1 if is_cross else 0))
            conn.commit()

    def get_all_persons(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM persons")
            rows = cursor.fetchall()
            result = []
            for r in rows:
                item = dict(r)
                item["jurisdictions"] = json.loads(item["jurisdictions"])
                item["aliases"] = json.loads(item["aliases"])
                item["metadata"] = json.loads(item["metadata"])
                item["is_cross_jurisdiction"] = bool(item["is_cross_jurisdiction"])
                result.append(item)
            return result

    def get_person(self, person_id: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM persons WHERE id = ?", (person_id,))
            r = cursor.fetchone()
            if not r:
                return None
            item = dict(r)
            item["jurisdictions"] = json.loads(item["jurisdictions"])
            item["aliases"] = json.loads(item["aliases"])
            item["metadata"] = json.loads(item["metadata"])
            item["is_cross_jurisdiction"] = bool(item["is_cross_jurisdiction"])
            return item

    def get_identifiers_for_person(self, person_id: str) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM identifiers WHERE person_id = ?", (person_id,))
            return [dict(r) for r in cursor.fetchall()]

    def get_firs_for_person(self, person_id: str) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM firs WHERE person_id = ?", (person_id,))
            return [dict(r) for r in cursor.fetchall()]

    def get_all_edges(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM network_edges")
            return [dict(r) for r in cursor.fetchall()]

    def log_audit(self, action: str, entity_id: str, officer_id: str, details: Dict[str, Any]):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            audit_id = f"AUDIT-{datetime.now().strftime('%Y%m%d%H%M%S%f')}"
            cursor.execute("""
            INSERT INTO audit_log (id, action, entity_id, officer_id, details)
            VALUES (?, ?, ?, ?, ?)
            """, (audit_id, action, entity_id, officer_id, json.dumps(details)))
            conn.commit()

    def clear_all(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.executescript("""
            DELETE FROM audit_log;
            DELETE FROM hitl_resolutions;
            DELETE FROM network_edges;
            DELETE FROM firs;
            DELETE FROM identifiers;
            DELETE FROM persons;
            """)
            conn.commit()

db_manager = DatabaseManager()
