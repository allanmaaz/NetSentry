# 🛡️ NetSentry — Autonomous Criminal Network & Cross-Jurisdiction Intelligence Platform

> **Smart India Hackathon (SIH) 2026**  
> *Category:* Law Enforcement / AI & Graph Analytics  
> *Mission:* Unify fragmented inter-state police records, unmask aliases with Indic phonetic NLP, and expose kingpin bottlenecks through solar-system graph topology.

---

## 🏗️ Architecture Overview

- **Frontend:** React 18 + Vite 5 + Tailwind CSS 3.4 + D3.js Force-Directed Canvas (Solar-System White Theme, Zero Emojis, Pure SVG Icons).
- **Backend:** Python FastAPI + Pydantic V2 + RapidFuzz + Double Metaphone + Indic Transliteration + NetworkX / Neo4j Graph Service.
- **Database:** Supabase (PostgreSQL with JSONB, Relational Graph Modeling, and RLS) + Resilient In-Memory Fallback.
- **Deployment:** Cloudflare Pages (Frontend CDN) + Cloudflare Tunnel (`cloudflared` for Backend API).

---

## ⚡ Quick Start

### 1. Run Backend Engine
```bash
# Activate python virtual environment
source backend/venv/bin/activate

# Start FastAPI server on port 8000
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
Interactive API docs available at: `http://127.0.0.1:8000/docs`

### 2. Run Frontend UI
```bash
cd frontend
npm run dev
```
Open in your browser: `http://localhost:5175/`

---

## ☁️ Cloudflare Deployment

### 1. Frontend on Cloudflare Pages
```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name netsentry
```

### 2. Backend on Cloudflare Tunnel
```bash
# Instant free public HTTPS tunnel without a domain:
cloudflared tunnel --url http://localhost:8000
```

---
 
 ## 🗄️ Supabase Database Setup
 
 1. Create a free project at [supabase.com](https://supabase.com).
 2. Go to **SQL Editor** in your Supabase dashboard and run the contents of [`data/supabase_schema.sql`](file:///Users/apple/Desktop/SIH%20WINNERS%202026/data/supabase_schema.sql).
 3. Seed your project with synthetic criminal records:
 ```bash
 python data/seed_supabase.py --url "https://<YOUR_PROJECT_ID>.supabase.co" --key "<YOUR_SERVICE_ROLE_OR_ANON_KEY>"
 ```
 4. Add your Supabase credentials to your environment or `.env`:
 ```bash
 export SUPABASE_URL="https://<YOUR_PROJECT_ID>.supabase.co"
 export SUPABASE_KEY="<YOUR_KEY>"
 ```
 *(Note: If you don't configure Supabase credentials, the backend automatically uses its resilient in-memory graph cache, so the demo always works offline!)*
 
 ---

## 🗂️ Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/  # /graph, /entities, /resolve, /ingest
│   │   ├── core/              # config.py, database.py
│   │   ├── models/            # schemas.py (Pydantic V2)
│   │   ├── services/
│   │   │   ├── alias_engine.py      # Indic NLP & Corroboration Engine
│   │   │   ├── neo4j_service.py     # Graph Analytics & Atomic Node Merge
│   │   │   └── xai_explainer.py     # Section 65B Legal Justifications
│   │   └── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SolarSystemGraph.jsx  # D3 Canvas with Orbit Rings & Sun
│   │   │   ├── InspectorDrawer.jsx   # Donut Risk Gauge & Dossier
│   │   │   ├── HITLReviewQueue.jsx   # Bottom Dock Adjudication
│   │   │   ├── Header.jsx            # KPI Counters & Filters
│   │   │   └── DossierModal.jsx      # Section 65B Printable Dossier
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── wrangler.toml
├── data/
│   ├── synthetic_generator.py # Planted "Deccan-Konkan Syndicate" data
│   ├── schema_mappings.yaml   # Multi-LEA Schema translation
│   ├── mh_firs.csv            # 150 Maharashtra Police FIRs
│   ├── ka_crime_records.json  # 120 Karnataka Crime records
│   └── fiu_transactions.csv   # 500 FIU Hawala transfers
├── cloudflare/
│   └── tunnel_config.yml      # Cloudflared ingress configuration
├── docker-compose.yml         # Full-stack Docker orchestration
└── README.md
```

---

## ⚖️ Compliance & Standards
- **Section 65B Indian Evidence Act:** Automated algorithmic integrity certificates for electronic records.
- **Human-in-the-Loop (HITL):** Strict officer confirmation required for match scores between 0.60 and 0.84.
- **Air-Gapped Sovereign:** Zero external commercial APIs; operates 100% offline within sovereign infrastructure.
