#!/usr/bin/env python3
"""
NetSentry Synthetic Data Generator
Generates realistic multi-jurisdictional law enforcement and financial intelligence datasets
for Smart India Hackathon 2026.

Dataset components:
1. data/mh_firs.csv (Maharashtra Police FIR records)
2. data/ka_crime_records.json (Karnataka State Police records)
3. data/fiu_transactions.csv (Financial Intelligence Unit STR/CTR records)

Planted Criminal Syndicate: "Deccan-Konkan Syndicate"
Kingpin: "Mohd. Aslam" (MH) / "Aslam Bhai" (KA)
Shared Phone: +91-9876543210
Shared Vehicle: MH-12-DE-1001
"""

import os
import csv
import json
import random
from datetime import datetime, timedelta

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

# Indian first names and last names
FIRST_NAMES = [
    "Rahul", "Amit", "Suresh", "Vikram", "Sunil", "Ramesh", "Anil", "Deepak",
    "Ganesh", "Mahesh", "Sanjay", "Manoj", "Pradeep", "Dinesh", "Kishore",
    "Mohammad", "Irfan", "Imran", "Farhan", "Nasir", "Tariq", "Salim", "Shakeel",
    "Arjun", "Kiran", "Vijay", "Santosh", "Prakash", "Sachin", "Ajay", "Rajesh"
]

LAST_NAMES = [
    "Patil", "Deshmukh", "Shinde", "Jadhav", "Pawar", "Chavan", "Kadam", "Sawant",
    "Khan", "Qureshi", "Shaikh", "Ansari", "Siddiqui", "Memon", "Sayed", "Pathan",
    "Shetty", "Gowda", "Hegde", "Naik", "Reddy", "Rao", "Kamath", "Bhat"
]

MH_STATIONS = [
    ("MRA Marg PS", "Mumbai"), ("Dharavi PS", "Mumbai"), ("Bandra PS", "Mumbai"),
    ("Shivajinagar PS", "Pune"), ("Khadki PS", "Pune"), ("Faraskhana PS", "Pune"),
    ("Naupada PS", "Thane"), ("Mumbra PS", "Thane"), ("Kalyan Town PS", "Thane"),
    ("Sitabuldi PS", "Nagpur"), ("Panchavati PS", "Nashik"), ("Shahupuri PS", "Kolhapur")
]

KA_STATIONS = [
    ("Commercial Street PS", "Bangalore"), ("Shivajinagar PS", "Bangalore"),
    ("Cottonpet PS", "Bangalore"), ("Kalaburagi City PS", "Kalaburagi"),
    ("Market PS", "Belgaum"), ("Khade Bazar PS", "Belgaum"),
    ("Sub-Urban PS", "Hubli"), ("Bunder PS", "Mangalore"),
    ("Devaraja PS", "Mysore"), ("Lashkar PS", "Mysore")
]

CRIME_TYPES = [
    ("Extortion & Robbery", "384, 392 IPC"),
    ("Arms Act & Gang Violence", "307 IPC, 25 Arms Act"),
    ("Hawala & Money Laundering", "420, 120B IPC"),
    ("Narcotics Trafficking", "8, 20, 29 NDPS Act"),
    ("Cyber Fraud & Syndicate Operations", "419, 420 IPC, 66D IT Act"),
    ("Smuggling & Contraband", "135 Customs Act, 120B IPC")
]

def random_date(start_days_ago=730, end_days_ago=10):
    days = random.randint(end_days_ago, start_days_ago)
    date = datetime.now() - timedelta(days=days)
    return date.strftime("%Y-%m-%d %H:%M:%S")

def random_phone():
    prefixes = ["98", "97", "99", "93", "88", "87", "70", "77"]
    return f"+91-{random.choice(prefixes)}{random.randint(10000000, 99999999)}"

def random_plate(state="MH"):
    dist = f"{random.randint(1, 48):02d}"
    letters = random.choice(["AB", "CD", "EF", "GH", "JK", "LM", "DE", "BC"])
    num = f"{random.randint(1000, 9999)}"
    return f"{state}-{dist}-{letters}-{num}"

def generate_mh_firs():
    firs = []
    
    # 1. Plant Kingpin Mohd. Aslam & Key Lieutenants
    firs.append({
        "fir_number": "MH-2023-MRA-0142",
        "police_station": "MRA Marg PS",
        "accused_name": "Mohd. Aslam",
        "offense_type": "Extortion & Organised Syndicate",
        "section_ipc": "384, 387, 120B IPC",
        "date_of_fir": "2023-04-14 11:20:00",
        "seized_phone": "+91-9876543210",
        "vehicle_reg_no": "MH-12-DE-1001",
        "location_district": "Mumbai"
    })
    
    firs.append({
        "fir_number": "MH-2023-BND-0389",
        "police_station": "Bandra PS",
        "accused_name": "Mohammed Aslam Shaikh",
        "offense_type": "Arms Act & Syndicate Financing",
        "section_ipc": "307 IPC, 3/25 Arms Act",
        "date_of_fir": "2023-08-22 19:45:00",
        "seized_phone": "+91-9876543210",
        "vehicle_reg_no": "MH-12-DE-1001",
        "location_district": "Mumbai"
    })

    firs.append({
        "fir_number": "MH-2023-PUN-0711",
        "police_station": "Shivajinagar PS",
        "accused_name": "Vikram Jadhav",
        "offense_type": "Armed Extortion & Assault",
        "section_ipc": "384, 324 IPC",
        "date_of_fir": "2023-09-10 14:10:00",
        "seized_phone": "+91-9822019283",
        "vehicle_reg_no": "MH-12-AB-4491",
        "location_district": "Pune"
    })

    # HITL candidate: Mohd. Iqbal (MH side)
    firs.append({
        "fir_number": "MH-2023-MUM-0902",
        "police_station": "Mumbra PS",
        "accused_name": "Mohd. Iqbal",
        "offense_type": "Forged Identity & Logistics",
        "section_ipc": "468, 471 IPC",
        "date_of_fir": "2023-11-05 16:30:00",
        "seized_phone": "+91-9811223344",
        "vehicle_reg_no": "MH-04-KL-8821",
        "location_district": "Thane"
    })

    # Devanagari test record
    firs.append({
        "fir_number": "MH-2024-KLY-0023",
        "police_station": "Kalyan Town PS",
        "accused_name": "अस्लम भाई",
        "offense_type": "Cross-Border Hawala Distribution",
        "section_ipc": "420, 120B IPC",
        "date_of_fir": "2024-01-18 10:15:00",
        "seized_phone": "+91-9876543210",
        "vehicle_reg_no": "MH-12-DE-1001",
        "location_district": "Thane"
    })

    # Generate remaining records up to 150
    for i in range(len(firs) + 1, 151):
        station, district = random.choice(MH_STATIONS)
        name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        crime, sections = random.choice(CRIME_TYPES)
        firs.append({
            "fir_number": f"MH-2023-{district[:3].upper()}-{i:04d}",
            "police_station": station,
            "accused_name": name,
            "offense_type": crime,
            "section_ipc": sections,
            "date_of_fir": random_date(),
            "seized_phone": random_phone(),
            "vehicle_reg_no": random_plate("MH"),
            "location_district": district
        })
        
    return firs

def generate_ka_crime():
    cases = []
    
    # 1. Plant Kingpin Alias: "Aslam Bhai" / "Mohd Aslam"
    cases.append({
        "crime_no": "KA-2023-SHV-0412",
        "ps_jurisdiction": "Shivajinagar PS",
        "suspect_details": "Aslam Bhai",
        "major_head": "Hawala & Unexplained High Value Transfers",
        "ipc_sections_invoked": "120B, 420 IPC",
        "reported_datetime": "2023-07-19 15:40:00",
        "contact_number": "+91-9876543210", # EXACT MATCH to MH Kingpin!
        "associated_vehicle": "KA-01-MJ-9912",
        "district": "Bangalore"
    })

    cases.append({
        "crime_no": "KA-2023-BEL-0188",
        "ps_jurisdiction": "Market PS",
        "suspect_details": "Suresh Shetty",
        "major_head": "Inter-State Smuggling & Transit Logistics",
        "ipc_sections_invoked": "120B, 379 IPC",
        "reported_datetime": "2023-08-30 09:15:00",
        "contact_number": "+91-9845012390",
        "associated_vehicle": "MH-12-DE-1001", # EXACT MATCH to MH Kingpin Vehicle!
        "district": "Belgaum"
    })

    # HITL candidate: Iqbal Painter (KA side)
    cases.append({
        "crime_no": "KA-2023-BLR-0651",
        "ps_jurisdiction": "Commercial Street PS",
        "suspect_details": "Iqbal Painter",
        "major_head": "Document Forgery & Fake Vehicle Registration",
        "ipc_sections_invoked": "468, 471, 420 IPC",
        "reported_datetime": "2023-11-20 18:25:00",
        "contact_number": "+91-9811223344", # Matches Mohd. Iqbal!
        "associated_vehicle": "KA-03-TR-5510",
        "district": "Bangalore"
    })

    # Lieutenant in Bangalore: Farhan Sheikh
    cases.append({
        "crime_no": "KA-2024-COT-0081",
        "ps_jurisdiction": "Cottonpet PS",
        "suspect_details": "Farhan Sheikh",
        "major_head": "Hawala Cash Distribution & Courier Syndicate",
        "ipc_sections_invoked": "120B, 420 IPC",
        "reported_datetime": "2024-02-14 12:00:00",
        "contact_number": "+91-9988771122",
        "associated_vehicle": "KA-05-AB-7711",
        "district": "Bangalore"
    })

    # Generate remaining up to 120
    for i in range(len(cases) + 1, 121):
        station, district = random.choice(KA_STATIONS)
        name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        crime, sections = random.choice(CRIME_TYPES)
        cases.append({
            "crime_no": f"KA-2023-{district[:3].upper()}-{i:04d}",
            "ps_jurisdiction": station,
            "suspect_details": name,
            "major_head": crime,
            "ipc_sections_invoked": sections,
            "reported_datetime": random_date(),
            "contact_number": random_phone(),
            "associated_vehicle": random_plate("KA"),
            "district": district
        })
        
    return cases

def generate_fiu_transactions():
    txs = []
    
    # Syndicate Hawala Transactions
    syndicate_hops = [
        ("Mohd. Aslam", "SBI-9928100234", "Vikram Jadhav", "HDFC-1092837482", 1500000.0, "High Value Cash Layering"),
        ("Vikram Jadhav", "HDFC-1092837482", "Suresh Shetty", "CAN-5582910293", 1250000.0, "Transit Escrow Split"),
        ("Suresh Shetty", "CAN-5582910293", "Farhan Sheikh", "AXIS-7719203918", 1100000.0, "Inter-State Hawala Remittance"),
        ("Farhan Sheikh", "AXIS-7719203918", "Aslam Bhai", "ICICI-8819201920", 950000.0, "Dispersal to Beneficiary Alias"),
        ("Mohd. Aslam", "SBI-9928100234", "Mohd. Iqbal", "PNB-4419201938", 450000.0, "Shell Company Equipment Rent")
    ]
    
    tx_id_counter = 10001
    for s_name, s_acc, r_name, r_acc, amt, flag in syndicate_hops:
        txs.append({
            "transaction_id": f"TXN-FIU-{tx_id_counter}",
            "sender_name": s_name,
            "sender_account": s_acc,
            "receiver_name": r_name,
            "receiver_account": r_acc,
            "amount_inr": amt,
            "flag_reason": flag,
            "timestamp": random_date(start_days_ago=180, end_days_ago=15)
        })
        tx_id_counter += 1

    # Remaining realistic transactions
    accounts_pool = [
        f"{random.choice(['SBI', 'HDFC', 'ICICI', 'AXIS', 'PNB'])}-{random.randint(1000000000, 9999999999)}"
        for _ in range(50)
    ]
    
    for i in range(len(txs) + 1, 501):
        s_name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        r_name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        s_acc = random.choice(accounts_pool)
        r_acc = random.choice(accounts_pool)
        while r_acc == s_acc:
            r_acc = random.choice(accounts_pool)
            
        amt = round(random.uniform(50000, 3500000), 2)
        flags = [
            "Rapid Succession Transfers", "Structured Deposits <50k",
            "Dormant Account Spike", "High-Risk Geography Outflow",
            "Round Trip Transactions", "Normal Trade Settlement"
        ]
        
        txs.append({
            "transaction_id": f"TXN-FIU-{tx_id_counter}",
            "sender_name": s_name,
            "sender_account": s_acc,
            "receiver_name": r_name,
            "receiver_account": r_acc,
            "amount_inr": amt,
            "flag_reason": random.choice(flags),
            "timestamp": random_date()
        })
        tx_id_counter += 1
        
    return txs

def main():
    os.makedirs(DATA_DIR, exist_ok=True)
    
    # 1. Write MH FIRs CSV
    mh_file = os.path.join(DATA_DIR, "mh_firs.csv")
    mh_data = generate_mh_firs()
    with open(mh_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(mh_data[0].keys()))
        writer.writeheader()
        writer.writerows(mh_data)
    print(f"✅ Generated {len(mh_data)} Maharashtra Police FIRs -> {mh_file}")

    # 2. Write KA Crime JSON
    ka_file = os.path.join(DATA_DIR, "ka_crime_records.json")
    ka_data = generate_ka_crime()
    with open(ka_file, "w", encoding="utf-8") as f:
        json.dump(ka_data, f, indent=2, ensure_ascii=False)
    print(f"✅ Generated {len(ka_data)} Karnataka Crime Records -> {ka_file}")

    # 3. Write FIU Transactions CSV
    fiu_file = os.path.join(DATA_DIR, "fiu_transactions.csv")
    fiu_data = generate_fiu_transactions()
    with open(fiu_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(fiu_data[0].keys()))
        writer.writeheader()
        writer.writerows(fiu_data)
    print(f"✅ Generated {len(fiu_data)} FIU Financial Records -> {fiu_file}")

if __name__ == "__main__":
    main()
