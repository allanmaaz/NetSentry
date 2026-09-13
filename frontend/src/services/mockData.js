// NetSentry Real Landmark Case Investigation Baseline
// Case Study: Abdul Karim Telgi Cross-State Counterfeit & Hawala Syndicate (MH & KA)

export const MOCK_GRAPH = {
  "nodes": [
    {
      "id": "person_abdul_karim_telgi",
      "label": "Abdul Karim Telgi",
      "name": "Abdul Karim Telgi",
      "type": "Person",
      "risk_score": 98,
      "risk_tier": "critical",
      "betweenness": 0.3842,
      "pagerank": 0.1250,
      "orbit_level": 0,
      "is_cross_jurisdiction": true,
      "state": "Maharashtra",
      "radius": 32,
      "details": {
        "phones": ["+91-9822019900"],
        "vehicles": ["MH-12-Q-4004"],
        "firs_count": 3,
        "aliases": ["Karim Lala", "The Stamp King", "अब्दुल करीम तेलगी"]
      }
    },
    {
      "id": "person_karim_lala",
      "label": "Karim Lala",
      "name": "Karim Lala",
      "type": "Person",
      "risk_score": 92,
      "risk_tier": "critical",
      "betweenness": 0.1815,
      "pagerank": 0.0831,
      "orbit_level": 1,
      "is_cross_jurisdiction": true,
      "state": "Karnataka",
      "radius": 22,
      "details": {
        "phones": ["+91-9822019900"],
        "vehicles": ["MH-12-Q-4004"],
        "firs_count": 1,
        "aliases": ["Abdul Karim", "Lala Belgaum"]
      }
    },
    {
      "id": "person_babanrao_tukaram",
      "label": "Babanrao Tukaram",
      "name": "Babanrao Tukaram",
      "type": "Person",
      "risk_score": 84,
      "risk_tier": "high",
      "betweenness": 0.1221,
      "pagerank": 0.0684,
      "orbit_level": 1,
      "is_cross_jurisdiction": false,
      "state": "Maharashtra",
      "radius": 20,
      "details": {
        "phones": ["+91-9820112233"],
        "vehicles": ["MH-12-Q-4004"],
        "firs_count": 1,
        "aliases": ["Tukaram Shinde"]
      }
    },
    {
      "id": "person_rehan_baig",
      "label": "Rehan Baig",
      "name": "Rehan Baig",
      "type": "Person",
      "risk_score": 86,
      "risk_tier": "high",
      "betweenness": 0.1541,
      "pagerank": 0.0712,
      "orbit_level": 1,
      "is_cross_jurisdiction": true,
      "state": "Karnataka",
      "radius": 20,
      "details": {
        "phones": ["+91-9845012345"],
        "vehicles": ["KA-01-M-8899"],
        "firs_count": 1,
        "aliases": ["Baig Bhai"]
      }
    },
    {
      "id": "person_ram_ratan_soni",
      "label": "Ram Ratan Soni",
      "name": "Ram Ratan Soni",
      "type": "Person",
      "risk_score": 88,
      "risk_tier": "high",
      "betweenness": 0.0912,
      "pagerank": 0.0512,
      "orbit_level": 1,
      "is_cross_jurisdiction": false,
      "state": "Maharashtra",
      "radius": 20,
      "details": {
        "phones": ["+91-9811099887"],
        "vehicles": ["MH-01-AX-4422"],
        "firs_count": 1,
        "aliases": ["Soni Master", "Engraver"]
      }
    },
    {
      "id": "person_tabrez_telgi",
      "label": "Tabrez Telgi",
      "name": "Tabrez Telgi",
      "type": "Person",
      "risk_score": 79,
      "risk_tier": "high",
      "betweenness": 0.0612,
      "pagerank": 0.0412,
      "orbit_level": 2,
      "is_cross_jurisdiction": false,
      "state": "Karnataka",
      "radius": 16,
      "details": {
        "phones": ["+91-9844055667"],
        "vehicles": ["KA-22-B-3311"],
        "firs_count": 1,
        "aliases": ["Tabrez Bhai"]
      }
    },
    {
      "id": "person_anil_gote",
      "label": "Anil Gote",
      "name": "Anil Gote",
      "type": "Person",
      "risk_score": 75,
      "risk_tier": "medium",
      "betweenness": 0.0412,
      "pagerank": 0.0312,
      "orbit_level": 2,
      "is_cross_jurisdiction": false,
      "state": "Maharashtra",
      "radius": 15,
      "details": {
        "phones": ["+91-9823077889"],
        "vehicles": ["MH-18-C-9090"],
        "firs_count": 1,
        "aliases": ["Gote Seth"]
      }
    },
    {
      "id": "person_sanjay_gaikwad",
      "label": "Sanjay Gaikwad",
      "name": "Sanjay Gaikwad",
      "type": "Person",
      "risk_score": 72,
      "risk_tier": "medium",
      "betweenness": 0.0321,
      "pagerank": 0.0284,
      "orbit_level": 2,
      "is_cross_jurisdiction": false,
      "state": "Maharashtra",
      "radius": 15,
      "details": {
        "phones": ["+91-9822033445"],
        "vehicles": ["MH-12-PA-7711"],
        "firs_count": 1,
        "aliases": ["Gaikwad Pune"]
      }
    }
  ],
  "edges": [
    {
      "source": "person_abdul_karim_telgi",
      "target": "person_babanrao_tukaram",
      "type": "DIRECTS",
      "weight": 3.0,
      "label": "Pune Logistics Command",
      "is_cross_jurisdiction": false
    },
    {
      "source": "person_abdul_karim_telgi",
      "target": "person_rehan_baig",
      "type": "TRANSFERRED_FUNDS",
      "weight": 4.0,
      "label": "₹1.8 Cr Bangalore Hawala Conduit",
      "is_cross_jurisdiction": true
    },
    {
      "source": "person_abdul_karim_telgi",
      "target": "person_tabrez_telgi",
      "type": "CALLED",
      "weight": 2.5,
      "label": "Belgaum Transit Coordination",
      "is_cross_jurisdiction": true
    },
    {
      "source": "person_abdul_karim_telgi",
      "target": "person_ram_ratan_soni",
      "type": "DIRECTS",
      "weight": 3.5,
      "label": "Mumbai Offset Die Printing",
      "is_cross_jurisdiction": false
    },
    {
      "source": "person_babanrao_tukaram",
      "target": "person_sanjay_gaikwad",
      "type": "ASSOCIATED_WITH",
      "weight": 2.0,
      "label": "Pune Safehouse Cache",
      "is_cross_jurisdiction": false
    },
    {
      "source": "person_tabrez_telgi",
      "target": "person_rehan_baig",
      "type": "TRANSFERRED_FUNDS",
      "weight": 2.5,
      "label": "Belgaum-Bangalore Cash Transfer",
      "is_cross_jurisdiction": false
    },
    {
      "source": "person_abdul_karim_telgi",
      "target": "person_anil_gote",
      "type": "ASSOCIATED_WITH",
      "weight": 2.0,
      "label": "Dhule Distribution Hub",
      "is_cross_jurisdiction": false
    },
    {
      "source": "person_abdul_karim_telgi",
      "target": "person_karim_lala",
      "type": "CALLED",
      "weight": 3.0,
      "label": "Shared MSISDN +91-9822019900",
      "is_cross_jurisdiction": true
    }
  ],
  "stats": {
    "total_nodes": 8,
    "displayed_nodes": 8,
    "total_edges": 8,
    "kingpin_id": "person_abdul_karim_telgi",
    "cross_state_entities": 3,
    "pending_hitl_count": 1,
    "database_backend": "SQLite (backend/netsentry.db)"
  }
};

export const MOCK_DETAILS = {
  "person_abdul_karim_telgi": {
    "id": "person_abdul_karim_telgi",
    "canonical_name": "Abdul Karim Telgi",
    "aliases": ["Karim Lala", "The Stamp King", "अब्दुल करीम तेलगी"],
    "risk_score": 98,
    "risk_tier": "critical",
    "centrality_rank": 1,
    "betweenness_score": 0.3842,
    "is_cross_jurisdiction": true,
    "states": ["Maharashtra", "Karnataka"],
    "phones": ["+91-9822019900"],
    "vehicles": ["MH-12-Q-4004"],
    "bank_accounts": ["Corporation Bank A/C 9901-4421"],
    "firs": [
      {
        "fir_id": "MH-PUNE-247-2002",
        "station": "Bund Garden PS, Pune",
        "crime_type": "Counterfeiting Government Stamps & Criminal Conspiracy",
        "sections": "255, 256, 257, 258, 259, 420, 120B IPC",
        "date": "2002-06-07T10:30:00Z",
        "state": "Maharashtra"
      },
      {
        "fir_id": "KA-BLR-89-1997",
        "station": "Cubbon Park PS, Bangalore",
        "crime_type": "Fake Stamp Paper Distribution & Syndicate Hawala",
        "sections": "255, 258, 420, 120B IPC",
        "date": "1997-11-14T14:15:00Z",
        "state": "Karnataka"
      },
      {
        "fir_id": "MH-MUM-135-1995",
        "station": "MRA Marg PS, Mumbai",
        "crime_type": "Counterfeit Security Printing Plates & Offset Dies",
        "sections": "255, 256, 467, 468, 120B IPC",
        "date": "1995-09-12T12:00:00Z",
        "state": "Maharashtra"
      }
    ],
    "associates": [
      { "id": "person_babanrao_tukaram", "name": "Babanrao Tukaram", "relation": "DIRECTS", "details": "Pune Logistics Command" },
      { "id": "person_rehan_baig", "name": "Rehan Baig", "relation": "TRANSFERRED_FUNDS", "details": "₹1.8 Cr Bangalore Hawala Conduit" },
      { "id": "person_ram_ratan_soni", "name": "Ram Ratan Soni", "relation": "DIRECTS", "details": "Mumbai Offset Die Printing" },
      { "id": "person_tabrez_telgi", "name": "Tabrez Telgi", "relation": "CALLED", "details": "Belgaum Transit Coordination" }
    ],
    "legal_justification": "Primary syndicate kingpin identified via graph betweenness centrality bottleneck. Directly bridges Maharashtra printing safehouses to Karnataka distribution conduits. Matches Section 65B evidential thresholds."
  }
};

export const MOCK_PENDING = [
  {
    "candidate_id": "RES-2026-001",
    "primary_id": "person_abdul_karim_telgi",
    "primary_name": "Abdul Karim Telgi",
    "primary_dept": "Maharashtra Police (Bund Garden PS, Pune)",
    "secondary_id": "person_karim_lala",
    "secondary_name": "Karim Lala",
    "secondary_dept": "Karnataka State Police (Cubbon Park PS, Bangalore)",
    "confidence_score": 1.0,
    "adjudication_tier": "AUTO_MERGE",
    "breakdown": {
      "levenshtein_similarity": 0.88,
      "phonetic_similarity": 0.95,
      "token_sort_ratio": 0.90,
      "base_name_score": 0.91,
      "corroboration_boost": 0.75,
      "total_score": 1.0
    },
    "shared_identifiers": {
      "shared_phones": ["+91-9822019900"],
      "shared_vehicles": ["MH-12-Q-4004"],
      "shared_banks": []
    },
    "legal_reasoning": "High-confidence cross-jurisdictional alias match (100.0%). Entity 'Abdul Karim Telgi' registered in Pune Bund Garden PS shares identical intercepted MSISDN (+91-9822019900) and transport vehicle (MH-12-Q-4004) with 'Karim Lala' recorded in Bangalore Cubbon Park PS. Meets Section 65B Indian Evidence Act corroboration standards."
  }
];
