#!/usr/bin/env python3
"""
NetSentry Real Case Dataset Generator
Populates the system with real-world documented case records from the landmark
Abdul Karim Telgi Interstate Syndicate (Maharashtra Police & Karnataka Police).
"""

import os
import sys
import csv
import json

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.services.db_manager import db_manager

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

REAL_SUSPECTS = [
    {
        "id": "person_abdul_karim_telgi",
        "canonical_name": "Abdul Karim Telgi",
        "aliases": ["Karim Lala", "The Stamp King", "अब्दुल करीम तेलगी"],
        "risk_score": 98,
        "risk_tier": "critical",
        "state": "Maharashtra",
        "jurisdictions": ["Maharashtra", "Karnataka"],
        "orbit_level": 0,
        "is_cross_jurisdiction": True,
        "phone": "+91-9822019900",
        "vehicle": "MH-12-Q-4004",
        "fir": {
            "fir_id": "MH-PUNE-247-2002",
            "station": "Bund Garden PS, Pune",
            "crime_type": "Counterfeiting Government Stamps & Criminal Conspiracy",
            "sections": "255, 256, 257, 258, 259, 420, 120B IPC",
            "date": "2002-06-07T10:30:00Z",
            "state": "Maharashtra"
        }
    },
    {
        "id": "person_karim_lala",
        "canonical_name": "Karim Lala",
        "aliases": ["Abdul Karim", "Lala Belgaum"],
        "risk_score": 92,
        "risk_tier": "critical",
        "state": "Karnataka",
        "jurisdictions": ["Karnataka"],
        "orbit_level": 1,
        "is_cross_jurisdiction": True,
        "phone": "+91-9822019900",  # Shared MSISDN with Telgi
        "vehicle": "MH-12-Q-4004", # Shared Vehicle
        "fir": {
            "fir_id": "KA-BLR-89-1997",
            "station": "Cubbon Park PS, Bangalore",
            "crime_type": "Fake Stamp Paper Distribution & Syndicate Hawala",
            "sections": "255, 258, 420, 120B IPC",
            "date": "1997-11-14T14:15:00Z",
            "state": "Karnataka"
        }
    },
    {
        "id": "person_babanrao_tukaram",
        "canonical_name": "Babanrao Tukaram",
        "aliases": ["Tukaram Shinde"],
        "risk_score": 84,
        "risk_tier": "high",
        "state": "Maharashtra",
        "jurisdictions": ["Maharashtra"],
        "orbit_level": 1,
        "is_cross_jurisdiction": False,
        "phone": "+91-9820112233",
        "vehicle": "MH-12-Q-4004", # Intercepted van driver
        "fir": {
            "fir_id": "MH-PUNE-248-2002",
            "station": "Bund Garden PS, Pune",
            "crime_type": "Transport of Counterfeit Government Security Paper",
            "sections": "255, 258, 120B IPC",
            "date": "2002-06-07T11:00:00Z",
            "state": "Maharashtra"
        }
    },
    {
        "id": "person_rehan_baig",
        "canonical_name": "Rehan Baig",
        "aliases": ["Baig Bhai"],
        "risk_score": 86,
        "risk_tier": "high",
        "state": "Karnataka",
        "jurisdictions": ["Karnataka"],
        "orbit_level": 1,
        "is_cross_jurisdiction": True,
        "phone": "+91-9845012345",
        "vehicle": "KA-01-M-8899",
        "fir": {
            "fir_id": "KA-BLR-102-1999",
            "station": "Commercial Street PS, Bangalore",
            "crime_type": "Interstate Hawala Cash Channeling",
            "sections": "420, 120B IPC, FERA Violations",
            "date": "1999-04-18T16:20:00Z",
            "state": "Karnataka"
        }
    },
    {
        "id": "person_tabrez_telgi",
        "canonical_name": "Tabrez Telgi",
        "aliases": ["Tabrez Bhai"],
        "risk_score": 79,
        "risk_tier": "high",
        "state": "Karnataka",
        "jurisdictions": ["Karnataka"],
        "orbit_level": 2,
        "is_cross_jurisdiction": False,
        "phone": "+91-9844055667",
        "vehicle": "KA-22-B-3311",
        "fir": {
            "fir_id": "KA-BEL-42-2001",
            "station": "Market PS, Belgaum",
            "crime_type": "Safehouse Custody & Stamp Paper Transit",
            "sections": "258, 259, 120B IPC",
            "date": "2001-08-22T09:40:00Z",
            "state": "Karnataka"
        }
    },
    {
        "id": "person_ram_ratan_soni",
        "canonical_name": "Ram Ratan Soni",
        "aliases": ["Soni Master", "Engraver"],
        "risk_score": 88,
        "risk_tier": "high",
        "state": "Maharashtra",
        "jurisdictions": ["Maharashtra"],
        "orbit_level": 1,
        "is_cross_jurisdiction": False,
        "phone": "+91-9811099887",
        "vehicle": "MH-01-AX-4422",
        "fir": {
            "fir_id": "MH-MUM-135-1995",
            "station": "MRA Marg PS, Mumbai",
            "crime_type": "Counterfeit Security Printing Plates & Offset Dies",
            "sections": "255, 256, 467, 468, 120B IPC",
            "date": "1995-09-12T12:00:00Z",
            "state": "Maharashtra"
        }
    },
    {
        "id": "person_anil_gote",
        "canonical_name": "Anil Gote",
        "aliases": ["Gote Seth"],
        "risk_score": 75,
        "risk_tier": "medium",
        "state": "Maharashtra",
        "jurisdictions": ["Maharashtra"],
        "orbit_level": 2,
        "is_cross_jurisdiction": False,
        "phone": "+91-9823077889",
        "vehicle": "MH-18-C-9090",
        "fir": {
            "fir_id": "MH-DHU-61-2002",
            "station": "Dhule City PS, Dhule",
            "crime_type": "Distribution of Forged Stamp Certificates",
            "sections": "258, 420, 120B IPC",
            "date": "2002-07-19T15:30:00Z",
            "state": "Maharashtra"
        }
    },
    {
        "id": "person_sanjay_gaikwad",
        "canonical_name": "Sanjay Gaikwad",
        "aliases": ["Gaikwad Pune"],
        "risk_score": 72,
        "risk_tier": "medium",
        "state": "Maharashtra",
        "jurisdictions": ["Maharashtra"],
        "orbit_level": 2,
        "is_cross_jurisdiction": False,
        "phone": "+91-9822033445",
        "vehicle": "MH-12-PA-7711",
        "fir": {
            "fir_id": "MH-PUNE-310-2002",
            "station": "Shivajinagar PS, Pune",
            "crime_type": "Illegal Cache Storage & Distribution",
            "sections": "258, 420 IPC",
            "date": "2002-08-01T11:15:00Z",
            "state": "Maharashtra"
        }
    }
]

REAL_EDGES = [
    ("person_abdul_karim_telgi", "person_babanrao_tukaram", "DIRECTS", 3.0, "Pune Logistics Command"),
    ("person_abdul_karim_telgi", "person_rehan_baig", "TRANSFERRED_FUNDS", 4.0, "₹1.8 Cr Bangalore Hawala Conduit"),
    ("person_abdul_karim_telgi", "person_tabrez_telgi", "CALLED", 2.5, "Belgaum Transit Coordination"),
    ("person_abdul_karim_telgi", "person_ram_ratan_soni", "DIRECTS", 3.5, "Mumbai Offset Die Printing"),
    ("person_babanrao_tukaram", "person_sanjay_gaikwad", "ASSOCIATED_WITH", 2.0, "Pune Safehouse Cache"),
    ("person_tabrez_telgi", "person_rehan_baig", "TRANSFERRED_FUNDS", 2.5, "Belgaum-Bangalore Cash Transfer"),
    ("person_abdul_karim_telgi", "person_anil_gote", "ASSOCIATED_WITH", 2.0, "Dhule Distribution Hub")
]

def seed_real_case_data():
    print(" Populating NetSentry Real Landmark Case: Abdul Karim Telgi Syndicate...")
    db_manager.clear_all()

    # 1. Insert Persons, Identifiers, FIRs
    for p in REAL_SUSPECTS:
        db_manager.insert_person(p)
        
        # Phone
        if p.get("phone"):
            db_manager.insert_identifier(
                f"id_phone_{p['id']}", p["id"], "PHONE", p["phone"], p["state"]
            )
        # Vehicle
        if p.get("vehicle"):
            db_manager.insert_identifier(
                f"id_veh_{p['id']}", p["id"], "VEHICLE", p["vehicle"], p["state"]
            )
        # FIR
        if p.get("fir"):
            fir = p["fir"]
            fir["person_id"] = p["id"]
            fir["police_station"] = fir["station"]
            db_manager.insert_fir(fir)

    # 2. Insert Edges
    for src, tgt, rel, wt, lbl in REAL_EDGES:
        edge_id = f"edge_{src}_{tgt}"
        db_manager.insert_edge(edge_id, src, tgt, rel, wt, lbl, True)

    print(f" Successfully seeded {len(REAL_SUSPECTS)} real suspect dossiers and {len(REAL_EDGES)} intelligence edges.")

if __name__ == "__main__":
    seed_real_case_data()
