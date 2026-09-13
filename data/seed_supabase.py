#!/usr/bin/env python3
"""
NetSentry Supabase Seeder
Populates a remote Supabase project with synthetic multi-jurisdiction criminal records,
identifiers (MSISDN, Plates, Accounts), FIRs, and financial/telecom network edges.

Usage:
  python data/seed_supabase.py --url https://xyz.supabase.co --key <SERVICE_ROLE_KEY>
  Or set SUPABASE_URL and SUPABASE_KEY in environment.
"""

import os
import sys
import csv
import json
import argparse

def main():
    parser = argparse.ArgumentParser(description="Seed Supabase with NetSentry datasets")
    parser.add_argument("--url", default=os.getenv("SUPABASE_URL", ""), help="Supabase Project URL")
    parser.add_argument("--key", default=os.getenv("SUPABASE_KEY", ""), help="Supabase API Key (Anon or Service Role)")
    parser.add_argument("--dry-run", action="store_true", help="Validate parsing without network calls")
    args = parser.parse_args()

    if not args.dry_run and (not args.url or not args.key):
        print(" Error: SUPABASE_URL and SUPABASE_KEY must be provided via arguments or environment variables.")
        print("Example: python data/seed_supabase.py --url https://your-id.supabase.co --key your-key")
        sys.exit(1)

    data_dir = os.path.dirname(os.path.abspath(__file__))
    mh_file = os.path.join(data_dir, "mh_firs.csv")
    ka_file = os.path.join(data_dir, "ka_crime_records.json")
    fiu_file = os.path.join(data_dir, "fiu_transactions.csv")

    print(" Reading local synthetic datasets...")

    persons = {}
    identifiers = []
    firs = []
    edges = []

    # 1. Parse MH FIRs
    if os.path.exists(mh_file):
        with open(mh_file, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                name = row["accused_name"].strip()
                pid = f"person_{name.lower().replace(' ', '_').replace('.', '')}"
                
                if pid not in persons:
                    persons[pid] = {
                        "id": pid,
                        "canonical_name": name,
                        "risk_score": 94 if "aslam" in pid else 64,
                        "risk_tier": "critical" if "aslam" in pid else "medium",
                        "betweenness_centrality": 0.05 if "aslam" in pid else 0.01,
                        "orbit_level": 0 if "aslam" in pid else 2,
                        "is_cross_jurisdiction": "aslam" in pid,
                        "primary_state": "Maharashtra",
                        "jurisdictions": ["Maharashtra"],
                        "aliases": []
                    }

                if row.get("seized_phone"):
                    identifiers.append({
                        "person_id": pid,
                        "identifier_type": "PHONE",
                        "value": row["seized_phone"],
                        "state": "Maharashtra"
                    })
                if row.get("vehicle_reg_no"):
                    identifiers.append({
                        "person_id": pid,
                        "identifier_type": "VEHICLE",
                        "value": row["vehicle_reg_no"],
                        "state": "Maharashtra"
                    })

                firs.append({
                    "fir_id": row["fir_number"],
                    "person_id": pid,
                    "police_station": row["police_station"],
                    "crime_type": row["offense_type"],
                    "sections": row["section_ipc"],
                    "incident_date": row["date_of_fir"],
                    "state": "Maharashtra"
                })

    # 2. Parse KA Crime Records
    if os.path.exists(ka_file):
        with open(ka_file, "r", encoding="utf-8") as f:
            ka_records = json.load(f)
            for row in ka_records:
                name = row["suspect_details"].strip()
                pid = f"person_{name.lower().replace(' ', '_').replace('.', '')}"

                if pid not in persons:
                    persons[pid] = {
                        "id": pid,
                        "canonical_name": name,
                        "risk_score": 94 if "aslam" in pid else 64,
                        "risk_tier": "critical" if "aslam" in pid else "medium",
                        "betweenness_centrality": 0.05 if "aslam" in pid else 0.01,
                        "orbit_level": 0 if "aslam" in pid else 2,
                        "is_cross_jurisdiction": "aslam" in pid,
                        "primary_state": "Karnataka",
                        "jurisdictions": ["Karnataka"],
                        "aliases": []
                    }
                else:
                    if "Karnataka" not in persons[pid]["jurisdictions"]:
                        persons[pid]["jurisdictions"].append("Karnataka")
                        persons[pid]["is_cross_jurisdiction"] = True

                if row.get("contact_number"):
                    identifiers.append({
                        "person_id": pid,
                        "identifier_type": "PHONE",
                        "value": row["contact_number"],
                        "state": "Karnataka"
                    })
                if row.get("associated_vehicle"):
                    identifiers.append({
                        "person_id": pid,
                        "identifier_type": "VEHICLE",
                        "value": row["associated_vehicle"],
                        "state": "Karnataka"
                    })

                firs.append({
                    "fir_id": row["crime_no"],
                    "person_id": pid,
                    "police_station": row["ps_jurisdiction"],
                    "crime_type": row["major_head"],
                    "sections": row["ipc_sections_invoked"],
                    "incident_date": row["reported_datetime"],
                    "state": "Karnataka"
                })

    # 3. Parse FIU Transactions
    if os.path.exists(fiu_file):
        with open(fiu_file, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                s_name = row["sender_name"].strip()
                r_name = row["receiver_name"].strip()
                s_id = f"person_{s_name.lower().replace(' ', '_').replace('.', '')}"
                r_id = f"person_{r_name.lower().replace(' ', '_').replace('.', '')}"
                amt = float(row.get("amount_inr", 100000))

                for p_id, p_name in [(s_id, s_name), (r_id, r_name)]:
                    if p_id not in persons:
                        persons[p_id] = {
                            "id": p_id,
                            "canonical_name": p_name,
                            "risk_score": 60,
                            "risk_tier": "medium",
                            "betweenness_centrality": 0.01,
                            "orbit_level": 2,
                            "is_cross_jurisdiction": False,
                            "primary_state": "Maharashtra",
                            "jurisdictions": ["Maharashtra"],
                            "aliases": []
                        }

                edges.append({
                    "source_id": s_id,
                    "target_id": r_id,
                    "relation_type": "TRANSFERRED_FUNDS",
                    "weight": round(amt / 100000.0, 2),
                    "label": f"INR {amt:,.0f} Hawala",
                    "is_cross_jurisdiction": False,
                    "metadata": {"amount": amt, "flag": row.get("flag_reason")}
                })

    print(f" Parsed {len(persons)} Persons, {len(identifiers)} Identifiers, {len(firs)} FIRs, {len(edges)} Edges.")

    if args.dry_run:
        print(" Dry-run complete. All synthetic records validated successfully.")
        return

    # Seed into Supabase
    try:
        from supabase import create_client
        client = create_client(args.url, args.key)

        print(" Seeding public.persons table...")
        person_list = list(persons.values())
        # Batch insert persons
        for i in range(0, len(person_list), 50):
            client.table("persons").upsert(person_list[i:i+50]).execute()

        print(" Seeding public.identifiers table...")
        for i in range(0, len(identifiers), 100):
            client.table("identifiers").insert(identifiers[i:i+100]).execute()

        print(" Seeding public.firs table...")
        for i in range(0, len(firs), 100):
            client.table("firs").upsert(firs[i:i+100]).execute()

        print(" Seeding public.network_edges table...")
        for i in range(0, len(edges), 100):
            client.table("network_edges").upsert(edges[i:i+100]).execute()

        print(" Supabase seeding successfully completed! All tables populated.")
    except Exception as e:
        print(f" Error writing to Supabase: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
