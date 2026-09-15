#!/usr/bin/env python3
"""
NetSentry — T3.3 Synthetic CSV Dataset Generator (SIH 2026)
Generates 4 realistic multi-state law enforcement datasets:
1. sample-data/mh_firs.csv (150 records)
2. sample-data/ka_crime_records.csv (120 records)
3. sample-data/fiu_transactions.csv (500 records)
4. sample-data/telco_cdr_noise.csv (200 records)
"""
import os
import csv
import random
from datetime import datetime, timedelta

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIRS = [
    os.path.join(ROOT_DIR, "sample-data"),
    os.path.join(ROOT_DIR, "client_engine", "sample-data")
]

for d in OUT_DIRS:
    os.makedirs(d, exist_ok=True)

random.seed(26189)

FIRST_NAMES_MH = [
    "Suresh", "Vikram", "Sunil", "Ramesh", "Anil", "Deepak", "Ganesh", "Mahesh",
    "Sanjay", "Manoj", "Pradeep", "Dinesh", "Kishore", "Sachin", "Ajay", "Rajesh",
    "Mohammad", "Irfan", "Imran", "Farhan", "Nasir", "Tariq", "Salim", "Shakeel"
]
LAST_NAMES_MH = [
    "Patil", "Deshmukh", "Shinde", "Jadhav", "Pawar", "Chavan", "Kadam", "Sawant",
    "Khan", "Qureshi", "Shaikh", "Ansari", "Siddiqui", "Memon", "Sayed", "Pathan"
]
MH_STATIONS = [
    "Bund Garden PS, Pune", "Faraskhana PS, Pune", "MRA Marg PS, Mumbai",
    "Dharavi PS, Mumbai", "Naupada PS, Thane", "Khadki PS, Pune",
    "Sitabuldi PS, Nagpur", "Panchavati PS, Nashik", "Bandra PS, Mumbai"
]

FIRST_NAMES_KA = [
    "Arjun", "Kiran", "Vijay", "Santosh", "Prakash", "Manjunath", "Basavaraj",
    "Shreedhar", "Girish", "Raghavendra", "Prashanth", "Naveen", "Chethan",
    "Abdul", "Khaleel", "Noor", "Mustafa", "Iqbal", "Zaheer", "Javed"
]
LAST_NAMES_KA = [
    "Shetty", "Gowda", "Hegde", "Naik", "Reddy", "Rao", "Kamath", "Bhat",
    "Kulkarni", "Patil", "Inamdar", "Bijapur", "Mirajkar", "Lala"
]
KA_STATIONS = [
    "Commercial Street PS, Bangalore", "Cubbon Park PS, Bangalore", "Cottonpet PS, Bangalore",
    "Market PS, Belgaum", "Khade Bazar PS, Belgaum", "Sub-Urban PS, Hubli",
    "Bunder PS, Mangalore", "Devaraja PS, Mysore", "Kalaburagi City PS"
]

# Planted Cross-State Entities (Target Ground Truth for Cross-Border Match)
PLANTED_ENTITIES = [
    {
        "mh_name": "Mohd. Aslam",
        "mh_alias": "Aslam Seth; Chhota Aslam",
        "ka_name": "Aslam Bhai",
        "ka_alias": "Bangalore Aslam; Bhaijaan",
        "phone": "+91-9820091100",
        "vehicle": "MH-01-DX-9009",
        "mh_crime": "Extortion, Hawala couriering, and counterfeit currency logistics",
        "ka_crime": "Interstate financial routing and benami property acquisitions in Belgaum"
    },
    {
        "mh_name": "Abdul Karim Telgi",
        "mh_alias": "Karim Bhai; The Stamp Man",
        "ka_name": "Karim Lala",
        "ka_alias": "Khan Belgaum; A.K. Lala",
        "phone": "+91-9822019900",
        "vehicle": "MH-12-Q-4004",
        "mh_crime": "Nationwide counterfeit revenue and non-judicial stamp paper printing ring",
        "ka_crime": "Distribution of forged government security stamps via legal stamp vendors"
    },
    {
        "mh_name": "Tariq Memon",
        "mh_alias": "Tariq Bhai; Tiger",
        "ka_name": "Tariq Bhai",
        "ka_alias": "Memon Seth",
        "phone": "+91-9892019281",
        "vehicle": "MH-01-AX-9921",
        "mh_crime": "Extortion racket, hawala transfers via Mumbai dockyards and gold smurfing",
        "ka_crime": "Real estate cash layering and hawala drop accounts in Shivajinagar"
    },
    {
        "mh_name": "Rehan Baig",
        "mh_alias": "Rehan Pune; Mechanic",
        "ka_name": "Rehan Belgaum",
        "ka_alias": "Baig Saab",
        "phone": "+91-9844011223",
        "vehicle": "KA-22-M-3344",
        "mh_crime": "Machinery procurement from government press auctions; counterfeit dye engraving",
        "ka_crime": "Operating underground offset printing press facility near Khanapur forest"
    }
]

def make_date(start_days=900, end_days=15):
    days = random.randint(end_days, start_days)
    dt = datetime.now() - timedelta(days=days)
    return dt.strftime("%Y-%m-%d")

def make_phone():
    return f"+91-{random.choice(['98', '97', '99', '94', '88', '70'])}{random.randint(10000000, 99999999)}"

def make_vehicle(state):
    return f"{state}-{random.randint(1, 48):02d}-{chr(random.randint(65, 90))}{chr(random.randint(65, 90))}-{random.randint(1000, 9999)}"

# 1. Generate MH FIRs (150 rows)
def generate_mh_firs():
    rows = []
    # Include planted
    for idx, p in enumerate(PLANTED_ENTITIES, start=1):
        rows.append({
            "fir_number": f"MH-FIR-2023-{idx:04d}",
            "accused_name": p["mh_name"],
            "known_aliases": p["mh_alias"],
            "mobile_no": p["phone"],
            "vehicle_reg": p["vehicle"],
            "case_summary": p["mh_crime"],
            "date_of_incident": make_date(700, 30)
        })

    for idx in range(len(PLANTED_ENTITIES) + 1, 151):
        name = f"{random.choice(FIRST_NAMES_MH)} {random.choice(LAST_NAMES_MH)}"
        alias = f"{name.split()[0]} Bhai" if random.random() > 0.5 else ""
        rows.append({
            "fir_number": f"MH-FIR-2023-{idx:04d}",
            "accused_name": name,
            "known_aliases": alias,
            "mobile_no": make_phone(),
            "vehicle_reg": make_vehicle("MH"),
            "case_summary": f"Booked under IPC 384/420 at {random.choice(MH_STATIONS)} for syndicate operations.",
            "date_of_incident": make_date()
        })
    return rows

# 2. Generate KA Crime Records (120 rows)
def generate_ka_crimes():
    rows = []
    for idx, p in enumerate(PLANTED_ENTITIES, start=1):
        rows.append({
            "crime_no": f"KA-CC-2023-{idx:04d}",
            "suspect_full_name": p["ka_name"],
            "alias_or_nickname": p["ka_alias"],
            "phone": p["phone"],
            "rto_vehicle_number": p["vehicle"],
            "fir_brief": p["ka_crime"]
        })

    for idx in range(len(PLANTED_ENTITIES) + 1, 121):
        name = f"{random.choice(FIRST_NAMES_KA)} {random.choice(LAST_NAMES_KA)}"
        alias = f"{name.split()[0]} Anna" if random.random() > 0.5 else ""
        rows.append({
            "crime_no": f"KA-CC-2023-{idx:04d}",
            "suspect_full_name": name,
            "alias_or_nickname": alias,
            "phone": make_phone(),
            "rto_vehicle_number": make_vehicle("KA"),
            "fir_brief": f"Special Investigation Unit charge registered at {random.choice(KA_STATIONS)}."
        })
    return rows

# 3. Generate FIU Transactions (500 rows)
def generate_fiu_transactions():
    rows = []
    known_accounts = {
        "Mohd. Aslam": "HDFC-0044102981",
        "Aslam Bhai": "HDFC-0044102981",
        "Abdul Karim Telgi": "ICIC-0911440019",
        "Karim Lala": "ICIC-0911440019",
        "Tariq Memon": "SBIN-9911228833",
        "Tariq Bhai": "SBIN-9911228833"
    }

    # High-value structured transactions for planted entities
    for i in range(1, 41):
        p = PLANTED_ENTITIES[i % len(PLANTED_ENTITIES)]
        name = p["mh_name"] if i % 2 == 0 else p["ka_name"]
        acc = known_accounts.get(name, f"HDFC-00{i:08d}")
        rows.append({
            "transaction_id": f"FIU-TXN-2024-{i:06d}",
            "account_holder_name": name,
            "account_number": acc,
            "amount_inr": random.randint(450000, 25000000),
            "transaction_time": f"{make_date(360, 5)} {random.randint(10, 20):02d}:{random.randint(10, 59):02d}:00"
        })

    # Remaining transactions
    all_names = [f"{f} {l}" for f in FIRST_NAMES_MH + FIRST_NAMES_KA for l in LAST_NAMES_MH + LAST_NAMES_KA]
    for i in range(41, 501):
        name = random.choice(all_names)
        bank = random.choice(["HDFC", "ICIC", "SBIN", "AXIS", "KKBK", "PUNB"])
        rows.append({
            "transaction_id": f"FIU-TXN-2024-{i:06d}",
            "account_holder_name": name,
            "account_number": f"{bank}-{random.randint(1000000000, 9999999999)}",
            "amount_inr": random.randint(25000, 1500000),
            "transaction_time": f"{make_date(500, 1)} {random.randint(8, 23):02d}:{random.randint(10, 59):02d}:{random.randint(10, 59):02d}"
        })
    return rows

# 4. Generate Telco CDR Noise (200 rows)
def generate_cdr_noise():
    rows = []
    towers = [
        ("TOWER-MUM-01", "Mumbai Gateway"), ("TOWER-PUN-04", "Pune Shivajinagar"),
        ("TOWER-BLR-09", "Bangalore MG Road"), ("TOWER-BEL-02", "Belgaum Market"),
        ("TOWER-DEL-11", "Delhi Connaught Place"), ("TOWER-NAG-03", "Nagpur Central")
    ]
    for i in range(1, 201):
        call_dur = random.randint(15, 1800)
        tow, loc = random.choice(towers)
        rows.append({
            "cdr_record_id": f"CDR-2024-{i:06d}",
            "calling_msisdn": make_phone(),
            "called_msisdn": make_phone(),
            "duration_seconds": call_dur,
            "cell_tower_id": tow,
            "tower_location": loc,
            "timestamp": f"{make_date(180, 1)} {random.randint(0, 23):02d}:{random.randint(0, 59):02d}:00",
            "call_type": random.choice(["VOICE", "VOICE", "SMS", "DATA_SESSION"])
        })
    return rows

def write_csv(filename, rows, fieldnames):
    for d in OUT_DIRS:
        filepath = os.path.join(d, filename)
        with open(filepath, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        print(f"✓ Created {filepath} ({len(rows)} records)")

if __name__ == "__main__":
    print("Generating NetSentry T3.3 Synthetic CSV Datasets...")

    mh = generate_mh_firs()
    write_csv("mh_firs.csv", mh, ["fir_number", "accused_name", "known_aliases", "mobile_no", "vehicle_reg", "case_summary", "date_of_incident"])

    ka = generate_ka_crimes()
    write_csv("ka_crime_records.csv", ka, ["crime_no", "suspect_full_name", "alias_or_nickname", "phone", "rto_vehicle_number", "fir_brief"])

    fiu = generate_fiu_transactions()
    write_csv("fiu_transactions.csv", fiu, ["transaction_id", "account_holder_name", "account_number", "amount_inr", "transaction_time"])

    cdr = generate_cdr_noise()
    write_csv("telco_cdr_noise.csv", cdr, ["cdr_record_id", "calling_msisdn", "called_msisdn", "duration_seconds", "cell_tower_id", "tower_location", "timestamp", "call_type"])

    print("All 4 synthetic datasets generated successfully!")
