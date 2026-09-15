# 🎯 NetSentry — Task Assignments
## 6-Member Team: Meer · Maaz · Sadiya · Prithvi · Rabiya · Nabiya

> **Meer & Maaz** → Core ML, AI, Graph Intelligence, Mega-Upgrades (most complex)  
> **Sadiya** → HITL & UX redesign  
> **Prithvi** → PRD-specified backend-adjacent features & data pipeline  
> **Rabiya** → Documentation, README, CSV dataset files  
> **Nabiya** → Polish, animations, test suite, QoL improvements  

---

## 👑 MEER — Core Intelligence Engine & Mega-Upgrades Lead

*Meer owns the hardest algorithmic and graph-intelligence tasks.*

- `[x]` **T1.1 — XAI Plain-English Legal Justification Engine** 🔴 CRITICAL
  - Create `src/intelligence/xaiExplainer.js`
  - Generates court-worded justification per suspect using template synthesis:
    - Betweenness percentile → *"Acts as critical communication bridge (Top 2% BC)..."*
    - Jurisdiction count → *"Active across 3 distinct police jurisdictions..."*
    - Alias count → *"Resolved across records using 2 known aliases with 91% confidence..."*
    - Phone count → *"Maintains 4 distinct phone numbers within 30-day window..."*
  - Wire output into Inspector Drawer below the threat meter.

- `[x]` **T1.3 — Isolation Forest Anomaly Score Badge** 🔴 CRITICAL
  - Implement `isolationScore()` in `src/intelligence/relationshipEngine.js`
  - Feature vector: `[betweenness, degree, phoneCount, jurisdictionCount, txnVelocity, burstDelta]`
  - Normalize scores to 0–100. Display as a red/orange/green badge on inspector drawer.
  - Overlay a small anomaly indicator on 2D canvas nodes with score ≥ 70.

- `[x]` **T5.1 — Live FIR Narrative → Instant Graph Spawn** 🔵 MEGA
  - Wire `nlpParser.js` → extract entities from pasted FIR text → call `solarSystem2D.js` orbital insert.
  - Show split-panel in ingest modal: raw text left, parsed entities (name, phone, plate, IPC) right.
  - Animate new node spawning into Orbit II with a glowing pulse on insertion.
  - **This is the #1 wow-moment demo for judges.**

- `[x]` **T5.3 — Multi-Hop Path Finder (BFS Graph Tracer)** 🔵 MEGA
  - Add "Trace Path" button in Inspector Drawer (appears when a node is selected).
  - User selects a target node from dropdown → BFS shortest path computation.
  - Animate the path as a glowing green trace across the 2D canvas.
  - Show hop count and intermediate node names in a path summary panel.

---

## 👑 MAAZ — Graph Analytics, ML Model & 3D Engine Lead

*Maaz owns the centrality upgrades, real ML, and 3D visualization improvements.*

- `[x]` **T1.4 — PageRank Centrality Computation** 🔴 CRITICAL
  - Add `computePageRank(nodes, edges, dampingFactor=0.85, iterations=50)` to `relationshipEngine.js`
  - Return normalized 0–100 PageRank scores per node.
  - Display alongside Betweenness and Degree in a 3-column stat grid in Inspector Drawer.

- `[x]` **T1.2 — Real Trained Random Forest Model** 🔴 CRITICAL
  - Create `backend/` folder with a minimal FastAPI app:
    - `backend/app/main.py` — FastAPI root + CORS
    - `backend/app/ml/train_alias_matcher.py` — train sklearn RF on synthetic 500-sample Indic name pairs
    - `backend/app/api/match.py` — `POST /api/ml/match` → returns confidence score + feature breakdown
  - Update `rfAliasMatcher.js` to call the backend API (with localStorage fallback).
  - Add `backend/requirements.txt` and quick-start instructions.

- `[x]` **T4.5 — 3D Galaxy: Always-Visible Billboarded Labels** 🟢 POLISH
  - In `universe3D.js` and `universe3DLight.js`, fix label sprites to always face camera.
  - Use `sprite.material.depthTest = false` so labels are never occluded.
  - Add white pill background with slate text for light mode readability.

- `[x]` **T5.2 — Temporal Timeline: Animate Syndicate Growth** 🔵 MEGA
  - Wire `timelinePlayer.js` to read `date_added` / `date_first_fir` fields from `canonicalSyndicates.js`.
  - Show/hide nodes progressively as the timeline scrubber moves.
  - Play button → 5-second animated growth sequence showing syndicate formation.
  - Add "Formation Story" label overlay at key milestone dates.

---

## 🎨 SADIYA — HITL & User Experience Lead

*Sadiya owns all Human-in-the-Loop redesigns and interactive UX improvements.*

- `[x]` **T2.1 — HITL Side-by-Side Comparison Modal** 🟠 HIGH
  - Redesign the HITL bottom dock into a full modal (triggered by "Review" button).
  - Layout: two side-by-side cards (Candidate A | Candidate B).
  - Highlight matching fields (phone, plate, alias) with green pill badges.
  - Non-matching fields shown in amber.
  - "Confirm Merge" → triggers animated node collapse in 2D canvas + writes to audit trail.
  - "Reject Match" → removes item + writes rejection to audit trail.
  - Show confidence score breakdown as 4 mini progress bars: Fuzzy | Phonetic | Token | Corroboration.

- `[x]` **T2.5 — HITL Confidence Score Breakdown** 🟠 HIGH
  - *(Integrated into T2.1 above — Sadiya handles both together)*
  - Show scores: fuzzy `+0.35`, phonetic `+0.35`, token `+0.30`, corroboration `+0.40`.

- `[x]` **T2.3 — PII Masking "Redaction Mode" Toggle** 🟠 HIGH
  - Add a lock/shield icon button in the top bar.
  - When active: masks phone digits (`+91-98765-XXXXX`), bank accounts (`HDFC-XXXX-XXXX`), partial address.
  - Uses CSS class `.redacted` that renders a blurred/starred overlay on PII fields.
  - Add animated lock-close transition on activation.

- `[x]` **T2.4 — Risk Filter by Department/Agency** 🟠 HIGH
  - Add a filter chip row below the threat filter: `[ALL] [MH_POLICE] [KA_POLICE] [DL_STF] [NIA] [NCB]`
  - Filters nodes in the 2D canvas to dim non-matching nodes to 10% opacity.
  - Syncs with 3D Galaxy and India Map views.

---

## 🔧 PRITHVI — Data Pipeline & PRD Quick-Wins Lead

*Prithvi owns backend-adjacent features, ingest pipeline, and schema config.*

- `[x]` **T4.2 — Fix Ingest Modal: Live CSV Parse → Graph Spawn** 🟢 POLISH
  - When CSV is pasted/uploaded in the Ingest modal, parse using `normalizer.js` schema adapter.
  - Extract entities → add to `window.currentSyndicateData` → trigger canvas re-render.
  - New nodes animate in with a glowing orbital insertion (Orbit II, default).
  - Persist parsed data in `localStorage` so it survives page refresh.

- `[x]` **T3.4 — Schema Mapping Config Display** 🟡 QUICK WIN
  - Create `config/schema_mappings.json` with field mapping rules for `MH_POLICE`, `KA_POLICE`, `FINANCIAL_INTEL`.
  - In the Ingest modal, add a "Schema Adapter" tab showing the mapping for the selected department.
  - Visual table: Source Field → Canonical Field with type icons.

- `[x]` **T2.2 — Edge Click → Call/Transaction Detail Modal** 🟠 HIGH
  - In `solarSystem2D.js`, detect edge clicks and identify the edge source + target.
  - Look up CDR records from `canonicalCDR.js` and transactions from `canonicalTransactions.js`.
  - Pop up a modal showing:
    - Call logs table (timestamp, duration, direction)
    - Transaction table (amount, date, flag status)
    - Evidence type badge: `CO_ACCUSED` | `CALL_OVERLAP` | `FINANCIAL`

- `[x]` **T3.2 — RBAC Officer Login Screen** 🟡 QUICK WIN
  - Add a full-screen login overlay on first load (before the graph renders).
  - 3 role cards to select: `Analyst` | `Supervisory Officer` | `System Admin`.
  - Name input field + role selection → stores in `sessionStorage`.
  - Show officer name + role badge in the top command bar after login.
  - Lock HITL "Confirm Merge" and "Section 65B Export" buttons if role is `Analyst`.

---

## 📄 RABIYA — Documentation, Dataset & Compliance Lead

*Rabiya owns all documentation, CSV files, and the audit trail system.*

- `[x]` **T4.1 — Upgrade README to PRD Quality** 🟢 POLISH
  - Add Mermaid architecture flowchart (matching the PRD topology diagram).
  - Add REST API reference table (even for the JS module API surface).
  - Add 5-minute hackathon demo script (table format: Step | Action | Judge Impact).
  - Add SIH 2026 evaluation rubric compliance table.
  - Add team member attribution section with GitHub handles.
  - Add badges: SIH 2026, GitHub Pages deploy, npm test status.

- `[x]` **T3.3 — Synthetic CSV Dataset Files** 🟡 QUICK WIN
  - Create `sample-data/mh_firs.csv` — 150 realistic Maharashtra FIR records.
    - Fields: `fir_number, accused_name, known_aliases, mobile_no, vehicle_reg, case_summary, date_of_incident`
  - Create `sample-data/ka_crime_records.csv` — 120 Karnataka crime records.
    - Fields: `crime_no, suspect_full_name, alias_or_nickname, phone, rto_vehicle_number, fir_brief`
  - Create `sample-data/fiu_transactions.csv` — 500 hawala/financial transactions.
    - Fields: `transaction_id, account_holder_name, account_number, amount_inr, transaction_time`
  - Create `sample-data/telco_cdr_noise.csv` — 200 benign CDR call records (noise).
  - Embed 3–4 cross-state matching entities across MH + KA files (plantable demo).

- `[x]` **T3.1 — Immutable Audit Trail Panel** 🟡 QUICK WIN
  - Add a slide-out "Audit Log" panel (keyboard shortcut `A` or button in topbar).
  - Every action (node click, HITL decision, arrest sim, 65B export, login) appends a row.
  - Row format: `[ISO timestamp] [Officer Name / Role] [Action] [Target Entity]`
  - Store entries in `localStorage` as a JSON array.
  - Panel shows entries in reverse-chronological order with color-coded action types.
  - Add "Export Audit Log" button → downloads as `.txt` file.

---

## ✨ NABIYA — Polish, Animations & Test Suite Lead

*Nabiya owns all UI polish, micro-animations, transition effects, and test coverage.*

- `[x]` **T4.7 — View Switch Loading Skeleton / Transition Animations** 🟢 POLISH
  - When switching between 2D / 3D / India Map views, add a 300ms fade-out → fade-in transition.
  - When switching syndicates, show a brief skeleton loader (gray pulsing circles) before graph renders.
  - Add CSS `@keyframes` for skeleton pulse in `styles.css`.

- `[x]` **T4.4 — Jurisdiction Badge Count on Canvas Node Icons** 🟢 POLISH
  - In `solarSystem2D.js`, after drawing a node icon, check `jurisdictionCount`.
  - If ≥ 2, draw a small purple circle badge `(🏛️ n)` at top-right of the node.
  - Add a glowing purple halo ring (dashed) around cross-jurisdiction nodes.

- `[x]` **T4.6 — Expand Unit Test Suite to 10 Tests** 🟢 POLISH
  - Open `tests/test_intelligence.js` and add 5 new tests:
    - **Test 6**: Cross-jurisdiction link detection (two nodes same phone number → linked)
    - **Test 7**: XAI plain-English generator output (non-empty, contains risk tier)
    - **Test 8**: Isolation Forest anomaly scorer (high-degree node scores > 70)
    - **Test 9**: CDR + FIU data ingestion pipeline (parse 5 rows → 5 entities created)
    - **Test 10**: Section 65B SHA-256 hash integrity (hash of known input matches expected)

- `[x]` **T4.3 — Inspector Drawer: 3-Column Centrality Stat Grid** 🟢 POLISH
  - Below the threat meter in the Inspector Drawer, add a compact 3-column layout:
    ```
    [ Betweenness ]  [ Degree ]  [ PageRank ]
         87%            14         92/100
    ```
  - Use the existing CSS card style, add stat-grid class in `styles.css`.

- `[x]` **T5.4 — Section 65B Dossier: Print-Optimized PDF Export** 🔵 STRETCH
  - Add `@media print` CSS rules in `styles.css` that:
    - Hide the canvas, header, dock, modals
    - Show only the dossier content in A4 layout
    - Apply proper page-break rules between sections
  - Add a "🖨️ Print / Download PDF" button that triggers `window.print()`.

- `[x]` **T5.5 — Real-Time Collaboration Indicator (Cosmetic)** 🔵 STRETCH
  - Add a `LIVE • 3 Officers Online` badge in the top command bar.
  - Green pulsing dot animation (CSS `@keyframes` scale pulse).
  - Simulates multi-user investigation workspace — psychological impact on judges.

---

## 📋 Team Assignment Summary

| Member | Tier | Tasks | Complexity |
|:---|:---:|:---|:---:|
| **Meer** | 1, 5 | T1.1, T1.3, T5.1, T5.3 | ⭐⭐⭐⭐⭐ |
| **Maaz** | 1, 4, 5 | T1.4, T1.2, T4.5, T5.2 | ⭐⭐⭐⭐⭐ |
| **Sadiya** | 2 | T2.1, T2.3, T2.4, T2.5 | ⭐⭐⭐⭐ |
| **Prithvi** | 2, 3, 4 | T2.2, T3.2, T3.4, T4.2 | ⭐⭐⭐ |
| **Rabiya** | 3, 4 | T3.1, T3.3, T4.1 | ⭐⭐ |
| **Nabiya** | 4, 5 | T4.3, T4.4, T4.6, T4.7, T5.4, T5.5 | ⭐⭐ |

---

## 🗓️ Recommended Execution Order

```
Day 1-2:   Meer(T1.1) + Maaz(T1.4) + Sadiya(T2.1) + Prithvi(T3.2) + Rabiya(T3.3) + Nabiya(T4.6)
Day 3-4:   Meer(T1.3) + Maaz(T1.2) + Sadiya(T2.3) + Prithvi(T4.2) + Rabiya(T4.1) + Nabiya(T4.7)
Day 5-6:   Meer(T5.1) + Maaz(T5.2) + Sadiya(T2.4) + Prithvi(T2.2) + Rabiya(T3.1) + Nabiya(T4.4)
Day 7:     Meer(T5.3) + Maaz(T4.5) + Prithvi(T3.4) + Nabiya(T4.3 + T5.4 + T5.5)
```

---

## 📊 Estimated Score Impact per Member

| Member | SIH Rubric Criteria | Est. Score Contribution |
|:---|:---|:---:|
| **Meer** | Technical Innovation (20%) + Tactical Impact (15%) | **+12 pts** |
| **Maaz** | Technical Innovation (20%) + User Experience (15%) | **+11 pts** |
| **Sadiya** | User Experience & Tactical UI (15%) | **+7 pts** |
| **Prithvi** | Feasibility (15%) + Problem Relevance (20%) | **+6 pts** |
| **Rabiya** | Court Admissibility (15%) + Problem Relevance (20%) | **+5 pts** |
| **Nabiya** | User Experience (15%) + Technical Quality | **+4 pts** |
| **TOTAL** | All rubric criteria covered | **+45 pts potential** |
