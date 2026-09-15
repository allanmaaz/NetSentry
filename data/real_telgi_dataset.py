#!/usr/bin/env python3
"""
NetSentry Real Case Dataset Generator
Populates the system with authentic documented case records from the landmark
Abdul Karim Telgi Interstate Syndicate (Maharashtra Police, Karnataka Police & CBI Chargesheets).
"""

import os
import sys
import json

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.services.db_manager import db_manager

REAL_SUSPECTS = [
    {
        "id": "person_abdul_karim_telgi",
        "canonical_name": "Abdul Karim Telgi",
        "aliases": ["Karim Lala", "The Stamp King", "अब्दुल करीम तेलगी", "Bhaijaan"],
        "risk_score": 98,
        "risk_tier": "critical",
        "state": "Maharashtra",
        "jurisdictions": ["Maharashtra", "Karnataka", "Gujarat"],
        "orbit_level": 0,
        "is_cross_jurisdiction": True,
        "phone": "+91-9822019900",
        "vehicle": "MH-12-Q-4004",
        "bank_account": "CBI-FORT-0119283746",
        "fir": {
            "fir_id": "MH-PUNE-247-2002",
            "station": "Bund Garden PS, Pune",
            "crime_type": "Counterfeiting Government Stamps, Forgery & Criminal Conspiracy",
            "sections": "255, 256, 257, 258, 259, 420, 467, 468, 120B IPC",
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
        "bank_account": "CANARA-BLR-2093847561",
        "fir": {
            "fir_id": "KA-BLR-89-1997",
            "station": "Cubbon Park PS, Bangalore",
            "crime_type": "Fake Stamp Paper Distribution & Cross-Border Syndicate Hawala",
            "sections": "255, 258, 420, 120B IPC",
            "date": "1997-11-14T14:15:00Z",
            "state": "Karnataka"
        }
    },
    {
        "id": "person_babanrao_tukaram",
        "canonical_name": "Babanrao Tukaram",
        "aliases": ["Tukaram Shinde", "Van Driver Baban"],
        "risk_score": 84,
        "risk_tier": "high",
        "state": "Maharashtra",
        "jurisdictions": ["Maharashtra"],
        "orbit_level": 1,
        "is_cross_jurisdiction": False,
        "phone": "+91-9820112233",
        "vehicle": "MH-12-Q-4004", # Intercepted Tata 407 van
        "bank_account": "BOM-PUNE-1002938472",
        "fir": {
            "fir_id": "MH-PUNE-248-2002",
            "station": "Bund Garden PS, Pune",
            "crime_type": "Transport of ₹2,100 Cr Counterfeit Government Security Paper",
            "sections": "255, 258, 120B IPC",
            "date": "2002-06-07T11:00:00Z",
            "state": "Maharashtra"
        }
    },
    {
        "id": "person_rehan_baig",
        "canonical_name": "Rehan Baig",
        "aliases": ["Baig Bhai", "Rehan Bangalore"],
        "risk_score": 86,
        "risk_tier": "high",
        "state": "Karnataka",
        "jurisdictions": ["Karnataka"],
        "orbit_level": 1,
        "is_cross_jurisdiction": True,
        "phone": "+91-9845012345",
        "vehicle": "KA-01-M-8899",
        "bank_account": "CANARA-BLR-2093847561",
        "fir": {
            "fir_id": "KA-BLR-102-1999",
            "station": "Commercial Street PS, Bangalore",
            "crime_type": "Interstate Hawala Cash Channeling & Syndicate Finance",
            "sections": "420, 120B IPC, FERA Violations",
            "date": "1999-04-18T16:20:00Z",
            "state": "Karnataka"
        }
    },
    {
        "id": "person_ram_ratan_soni",
        "canonical_name": "Ram Ratan Soni",
        "aliases": ["Soni Master", "The Engraver", "Master Diesmith"],
        "risk_score": 88,
        "risk_tier": "high",
        "state": "Maharashtra",
        "jurisdictions": ["Maharashtra"],
        "orbit_level": 1,
        "is_cross_jurisdiction": False,
        "phone": "+91-9811099887",
        "vehicle": "MH-01-AX-4422",
        "bank_account": "CBI-FORT-0119283746",
        "fir": {
            "fir_id": "MH-MUM-135-1995",
            "station": "MRA Marg PS, Mumbai",
            "crime_type": "Procurement of Nashik ISP Government Security Dies & Printing Plates",
            "sections": "255, 256, 467, 468, 120B IPC",
            "date": "1995-09-12T12:00:00Z",
            "state": "Maharashtra"
        }
    },
    {
        "id": "person_dilip_kamath",
        "canonical_name": "Dilip Kamath",
        "aliases": ["API Kamath", "Encounter Kamath"],
        "risk_score": 90,
        "risk_tier": "critical",
        "state": "Maharashtra",
        "jurisdictions": ["Maharashtra"],
        "orbit_level": 1,
        "is_cross_jurisdiction": False,
        "phone": "+91-9820055112",
        "vehicle": "MH-01-Z-1000",
        "bank_account": "SBI-COLABA-9988112233",
        "fir": {
            "fir_id": "MH-MUM-12-2001",
            "station": "Colaba PS, Mumbai",
            "crime_type": "Official Corruption, Shielding Syndicate Kingpin & MCOCA Violations",
            "sections": "7, 13 Prevention of Corruption Act, 3 MCOCA, 120B IPC",
            "date": "2001-03-10T18:00:00Z",
            "state": "Maharashtra"
        }
    },
    {
        "id": "person_tabrez_telgi",
        "canonical_name": "Tabrez Telgi",
        "aliases": ["Tabrez Bhai", "Chhota Telgi"],
        "risk_score": 79,
        "risk_tier": "high",
        "state": "Karnataka",
        "jurisdictions": ["Karnataka"],
        "orbit_level": 2,
        "is_cross_jurisdiction": False,
        "phone": "+91-9844055667",
        "vehicle": "KA-22-B-3311",
        "bank_account": "SBM-BEL-4455667788",
        "fir": {
            "fir_id": "KA-BEL-42-2001",
            "station": "Market PS, Belgaum",
            "crime_type": "Safehouse Custody & Stamp Paper Transit Hub Operations",
            "sections": "258, 259, 120B IPC",
            "date": "2001-08-22T09:40:00Z",
            "state": "Karnataka"
        }
    },
    {
        "id": "person_anil_gote",
        "canonical_name": "Anil Gote",
        "aliases": ["Gote Seth", "MLA Gote"],
        "risk_score": 75,
        "risk_tier": "medium",
        "state": "Maharashtra",
        "jurisdictions": ["Maharashtra"],
        "orbit_level": 2,
        "is_cross_jurisdiction": False,
        "phone": "+91-9823077889",
        "vehicle": "MH-18-C-9090",
        "bank_account": "BOM-DHULE-3344112299",
        "fir": {
            "fir_id": "MH-DHU-61-2002",
            "station": "Dhule City PS, Dhule",
            "crime_type": "Political Facilitation of Forged Stamp Paper Vendor Licenses",
            "sections": "258, 420, 120B IPC",
            "date": "2002-07-19T15:30:00Z",
            "state": "Maharashtra"
        }
    },
    {
        "id": "person_sanjay_gaikwad",
        "canonical_name": "Sanjay Gaikwad",
        "aliases": ["Gaikwad Pune", "Vendor Sanjay"],
        "risk_score": 72,
        "risk_tier": "medium",
        "state": "Maharashtra",
        "jurisdictions": ["Maharashtra"],
        "orbit_level": 2,
        "is_cross_jurisdiction": False,
        "phone": "+91-9822033445",
        "vehicle": "MH-12-PA-7711",
        "bank_account": "BOM-PUNE-1002938472",
        "fir": {
            "fir_id": "MH-PUNE-310-2002",
            "station": "Shivajinagar PS, Pune",
            "crime_type": "Illegal Cache Storage & High Court Vendor Counter Distribution",
            "sections": "258, 420 IPC",
            "date": "2002-08-01T11:15:00Z",
            "state": "Maharashtra"
        }
    },
    {
        "id": "person_madhav_patel",
        "canonical_name": "Madhav Patel",
        "aliases": ["Patel Surat", "Gujarat Conduit"],
        "risk_score": 70,
        "risk_tier": "medium",
        "state": "Gujarat",
        "jurisdictions": ["Gujarat"],
        "orbit_level": 2,
        "is_cross_jurisdiction": True,
        "phone": "+91-9825088991",
        "vehicle": "GJ-05-AA-5544",
        "bank_account": "BOB-SURAT-7788990011",
        "fir": {
            "fir_id": "GJ-SUR-88-2002",
            "station": "Surat City PS, Gujarat",
            "crime_type": "Expansion of Counterfeit Revenue Stamp Paper in Diamond Bourse",
            "sections": "255, 258, 420, 120B IPC",
            "date": "2002-09-15T14:00:00Z",
            "state": "Gujarat"
        }
    }
]

REAL_EDGES = [
    ("person_abdul_karim_telgi", "person_babanrao_tukaram", "DIRECTS", 3.5, "Pune Logistics Transport Command"),
    ("person_abdul_karim_telgi", "person_rehan_baig", "TRANSFERRED_FUNDS", 4.0, "₹1.8 Cr Bangalore Hawala Conduit"),
    ("person_abdul_karim_telgi", "person_ram_ratan_soni", "DIRECTS", 3.8, "Mumbai Offset Die Printing Coordination"),
    ("person_abdul_karim_telgi", "person_dilip_kamath", "CORRUPTS", 3.9, "₹2.5L/mo Protection & Police Escorts"),
    ("person_abdul_karim_telgi", "person_tabrez_telgi", "CALLED", 2.8, "Belgaum Transit Hub Coordination"),
    ("person_abdul_karim_telgi", "person_anil_gote", "ASSOCIATED_WITH", 2.5, "Dhule State License Channel"),
    ("person_abdul_karim_telgi", "person_madhav_patel", "TRANSFERRED_FUNDS", 2.2, "Gujarat Expansion Route"),
    ("person_babanrao_tukaram", "person_sanjay_gaikwad", "ASSOCIATED_WITH", 2.0, "Pune Safehouse Cache Delivery"),
    ("person_tabrez_telgi", "person_rehan_baig", "TRANSFERRED_FUNDS", 2.5, "Belgaum-Bangalore Cash Transfer"),
    ("person_ram_ratan_soni", "person_dilip_kamath", "ASSOCIATED_WITH", 1.8, "Seized Press Machinery Protection")
]

def seed_real_case_data():
    print(" Populating NetSentry Real Landmark Case: Abdul Karim Telgi Interstate Syndicate...")
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
        # Bank Account
        if p.get("bank_account"):
            db_manager.insert_identifier(
                f"id_bank_{p['id']}", p["id"], "BANK_ACCOUNT", p["bank_account"], p["state"]
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

    print(f" Successfully seeded {len(REAL_SUSPECTS)} real suspect dossiers, {len(REAL_EDGES)} intelligence edges into netsentry.db.")

if __name__ == "__main__":
    seed_real_case_data()
