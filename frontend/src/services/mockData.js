// Resilient Fallback Dataset for NetSentry
// Provides instant offline & HTTPS Cloudflare Pages resilience

export const MOCK_GRAPH = {
  "nodes": [
    {
      "id": "person_mohd_aslam",
      "label": "Mohd. Aslam",
      "name": "Mohd. Aslam",
      "type": "Person",
      "risk_score": 94,
      "risk_tier": "critical",
      "betweenness": 0.0842,
      "pagerank": 0.0512,
      "orbit_level": 0,
      "is_cross_jurisdiction": true,
      "state": "Maharashtra",
      "radius": 28,
      "details": {
        "phones": ["+91-9876543210"],
        "vehicles": ["MH-12-DE-1001"],
        "firs_count": 2,
        "aliases": ["Aslam Bhai", "Mohammed Aslam Shaikh"]
      }
    },
    {
      "id": "person_aslam_bhai",
      "label": "Aslam Bhai",
      "name": "Aslam Bhai",
      "type": "Person",
      "risk_score": 92,
      "risk_tier": "critical",
      "betweenness": 0.0715,
      "pagerank": 0.0431,
      "orbit_level": 1,
      "is_cross_jurisdiction": true,
      "state": "Karnataka",
      "radius": 22,
      "details": {
        "phones": ["+91-9876543210"],
        "vehicles": ["KA-01-MJ-9912"],
        "firs_count": 1,
        "aliases": ["Mohd. Aslam"]
      }
    },
    {
      "id": "person_vikram_jadhav",
      "label": "Vikram Jadhav",
      "name": "Vikram Jadhav",
      "type": "Person",
      "risk_score": 82,
      "risk_tier": "high",
      "betweenness": 0.0521,
      "pagerank": 0.0384,
      "orbit_level": 1,
      "is_cross_jurisdiction": false,
      "state": "Maharashtra",
      "radius": 20,
      "details": {
        "phones": ["+91-9822019283"],
        "vehicles": ["MH-12-AB-4491"],
        "firs_count": 1,
        "aliases": []
      }
    },
    {
      "id": "person_suresh_shetty",
      "label": "Suresh Shetty",
      "name": "Suresh Shetty",
      "type": "Person",
      "risk_score": 84,
      "risk_tier": "high",
      "betweenness": 0.0612,
      "pagerank": 0.0391,
      "orbit_level": 1,
      "is_cross_jurisdiction": true,
      "state": "Karnataka",
      "radius": 20,
      "details": {
        "phones": ["+91-9845012390"],
        "vehicles": ["MH-12-DE-1001"],
        "firs_count": 1,
        "aliases": []
      }
    },
    {
      "id": "person_farhan_sheikh",
      "label": "Farhan Sheikh",
      "name": "Farhan Sheikh",
      "type": "Person",
      "risk_score": 79,
      "risk_tier": "high",
      "betweenness": 0.0489,
      "pagerank": 0.0321,
      "orbit_level": 1,
      "is_cross_jurisdiction": false,
      "state": "Karnataka",
      "radius": 19,
      "details": {
        "phones": ["+91-9988771122"],
        "vehicles": ["KA-05-AB-7711"],
        "firs_count": 1,
        "aliases": []
      }
    },
    {
      "id": "person_mohd_iqbal",
      "label": "Mohd. Iqbal",
      "name": "Mohd. Iqbal",
      "type": "Person",
      "risk_score": 74,
      "risk_tier": "high",
      "betweenness": 0.0412,
      "pagerank": 0.0298,
      "orbit_level": 1,
      "is_cross_jurisdiction": false,
      "state": "Maharashtra",
      "radius": 18,
      "details": {
        "phones": ["+91-9811223344"],
        "vehicles": ["MH-04-KL-8821"],
        "firs_count": 1,
        "aliases": []
      }
    },
    {
      "id": "person_iqbal_painter",
      "label": "Iqbal Painter",
      "name": "Iqbal Painter",
      "type": "Person",
      "risk_score": 72,
      "risk_tier": "high",
      "betweenness": 0.0398,
      "pagerank": 0.0284,
      "orbit_level": 2,
      "is_cross_jurisdiction": false,
      "state": "Karnataka",
      "radius": 17,
      "details": {
        "phones": ["+91-9811223344"],
        "vehicles": ["KA-03-TR-5510"],
        "firs_count": 1,
        "aliases": []
      }
    },
    {
      "id": "person_rahul_patil",
      "label": "Rahul Patil",
      "name": "Rahul Patil",
      "type": "Person",
      "risk_score": 64,
      "risk_tier": "medium",
      "betweenness": 0.0312,
      "pagerank": 0.0241,
      "orbit_level": 2,
      "is_cross_jurisdiction": false,
      "state": "Maharashtra",
      "radius": 14,
      "details": { "phones": [], "vehicles": [], "firs_count": 1, "aliases": [] }
    },
    {
      "id": "person_amit_deshmukh",
      "label": "Amit Deshmukh",
      "name": "Amit Deshmukh",
      "type": "Person",
      "risk_score": 62,
      "risk_tier": "medium",
      "betweenness": 0.0294,
      "pagerank": 0.0221,
      "orbit_level": 2,
      "is_cross_jurisdiction": false,
      "state": "Maharashtra",
      "radius": 14,
      "details": { "phones": [], "vehicles": [], "firs_count": 1, "aliases": [] }
    },
    {
      "id": "person_dinesh_gowda",
      "label": "Dinesh Gowda",
      "name": "Dinesh Gowda",
      "type": "Person",
      "risk_score": 58,
      "risk_tier": "medium",
      "betweenness": 0.0261,
      "pagerank": 0.0198,
      "orbit_level": 2,
      "is_cross_jurisdiction": false,
      "state": "Karnataka",
      "radius": 13,
      "details": { "phones": [], "vehicles": [], "firs_count": 1, "aliases": [] }
    },
    {
      "id": "person_santosh_reddy",
      "label": "Santosh Reddy",
      "name": "Santosh Reddy",
      "type": "Person",
      "risk_score": 56,
      "risk_tier": "medium",
      "betweenness": 0.0241,
      "pagerank": 0.0184,
      "orbit_level": 2,
      "is_cross_jurisdiction": false,
      "state": "Karnataka",
      "radius": 13,
      "details": { "phones": [], "vehicles": [], "firs_count": 1, "aliases": [] }
    },
    {
      "id": "person_ganesh_shinde",
      "label": "Ganesh Shinde",
      "name": "Ganesh Shinde",
      "type": "Person",
      "risk_score": 38,
      "risk_tier": "low",
      "betweenness": 0.0121,
      "pagerank": 0.0112,
      "orbit_level": 3,
      "is_cross_jurisdiction": false,
      "state": "Maharashtra",
      "radius": 10,
      "details": { "phones": [], "vehicles": [], "firs_count": 1, "aliases": [] }
    },
    {
      "id": "person_ramesh_kadam",
      "label": "Ramesh Kadam",
      "name": "Ramesh Kadam",
      "type": "Person",
      "risk_score": 36,
      "risk_tier": "low",
      "betweenness": 0.0105,
      "pagerank": 0.0104,
      "orbit_level": 3,
      "is_cross_jurisdiction": false,
      "state": "Maharashtra",
      "radius": 10,
      "details": { "phones": [], "vehicles": [], "firs_count": 1, "aliases": [] }
    },
    {
      "id": "person_prakash_hegde",
      "label": "Prakash Hegde",
      "name": "Prakash Hegde",
      "type": "Person",
      "risk_score": 35,
      "risk_tier": "low",
      "betweenness": 0.0094,
      "pagerank": 0.0098,
      "orbit_level": 3,
      "is_cross_jurisdiction": false,
      "state": "Karnataka",
      "radius": 10,
      "details": { "phones": [], "vehicles": [], "firs_count": 1, "aliases": [] }
    }
  ],
  "edges": [
    {
      "source": "person_mohd_aslam",
      "target": "person_aslam_bhai",
      "type": "CALLED",
      "weight": 3.5,
      "label": "Shared MSISDN +91-9876543210",
      "is_cross_jurisdiction": true
    },
    {
      "source": "person_mohd_aslam",
      "target": "person_vikram_jadhav",
      "type": "TRANSFERRED_FUNDS",
      "weight": 2.8,
      "label": "INR 1,500,000 Hawala",
      "is_cross_jurisdiction": false
    },
    {
      "source": "person_vikram_jadhav",
      "target": "person_suresh_shetty",
      "type": "TRANSFERRED_FUNDS",
      "weight": 2.2,
      "label": "INR 1,250,000 Transit Escrow",
      "is_cross_jurisdiction": true
    },
    {
      "source": "person_suresh_shetty",
      "target": "person_farhan_sheikh",
      "type": "TRANSFERRED_FUNDS",
      "weight": 2.0,
      "label": "INR 1,100,000 Hawala Remittance",
      "is_cross_jurisdiction": false
    },
    {
      "source": "person_farhan_sheikh",
      "target": "person_aslam_bhai",
      "type": "TRANSFERRED_FUNDS",
      "weight": 1.9,
      "label": "INR 950,000 Beneficiary Dispersal",
      "is_cross_jurisdiction": false
    },
    {
      "source": "person_mohd_aslam",
      "target": "person_suresh_shetty",
      "type": "ASSOCIATED_WITH",
      "weight": 2.5,
      "label": "Shared Vehicle MH-12-DE-1001",
      "is_cross_jurisdiction": true
    },
    {
      "source": "person_mohd_aslam",
      "target": "person_mohd_iqbal",
      "type": "TRANSFERRED_FUNDS",
      "weight": 1.5,
      "label": "INR 450,000 Equipment Rent",
      "is_cross_jurisdiction": false
    },
    {
      "source": "person_mohd_iqbal",
      "target": "person_iqbal_painter",
      "type": "CALLED",
      "weight": 3.0,
      "label": "Shared Phone +91-9811223344",
      "is_cross_jurisdiction": true
    },
    {
      "source": "person_vikram_jadhav",
      "target": "person_rahul_patil",
      "type": "ASSOCIATED_WITH",
      "weight": 1.2,
      "label": "Co-accused",
      "is_cross_jurisdiction": false
    },
    {
      "source": "person_rahul_patil",
      "target": "person_amit_deshmukh",
      "type": "ASSOCIATED_WITH",
      "weight": 1.0,
      "label": "Logistics Conduit",
      "is_cross_jurisdiction": false
    },
    {
      "source": "person_farhan_sheikh",
      "target": "person_dinesh_gowda",
      "type": "TRANSFERRED_FUNDS",
      "weight": 1.1,
      "label": "INR 250,000 Courier",
      "is_cross_jurisdiction": false
    },
    {
      "source": "person_dinesh_gowda",
      "target": "person_santosh_reddy",
      "type": "ASSOCIATED_WITH",
      "weight": 1.0,
      "label": "Local Courier",
      "is_cross_jurisdiction": false
    },
    {
      "source": "person_amit_deshmukh",
      "target": "person_ganesh_shinde",
      "type": "ASSOCIATED_WITH",
      "weight": 0.8,
      "label": "Peripheral Handler",
      "is_cross_jurisdiction": false
    },
    {
      "source": "person_ganesh_shinde",
      "target": "person_ramesh_kadam",
      "type": "ASSOCIATED_WITH",
      "weight": 0.7,
      "label": "Storage Ground",
      "is_cross_jurisdiction": false
    },
    {
      "source": "person_santosh_reddy",
      "target": "person_prakash_hegde",
      "type": "ASSOCIATED_WITH",
      "weight": 0.8,
      "label": "Transit Handler",
      "is_cross_jurisdiction": false
    }
  ],
  "stats": {
    "total_nodes": 613,
    "displayed_nodes": 14,
    "total_edges": 15,
    "kingpin_id": "person_mohd_aslam",
    "cross_state_entities": 4,
    "pending_hitl_count": 2,
    "database_backend": "Supabase Cloud Grid"
  }
};

export const MOCK_DETAILS = {
  "person_mohd_aslam": {
    "id": "person_mohd_aslam",
    "canonical_name": "Mohd. Aslam",
    "aliases": ["Aslam Bhai", "Mohammed Aslam Shaikh", "अस्लम भाई"],
    "risk_score": 94,
    "risk_tier": "critical",
    "centrality_rank": 1,
    "betweenness_score": 0.0842,
    "is_cross_jurisdiction": true,
    "states": ["Maharashtra", "Karnataka"],
    "phones": ["+91-9876543210"],
    "vehicles": ["MH-12-DE-1001", "KA-01-MJ-9912"],
    "bank_accounts": ["SBI-9928100234", "ICICI-8819201920"],
    "firs": [
      {
        "fir_id": "MH-2023-MRA-0142",
        "station": "MRA Marg PS",
        "crime_type": "Extortion & Organised Syndicate",
        "sections": "384, 387, 120B IPC",
        "date": "2023-04-14 11:20:00",
        "state": "Maharashtra"
      },
      {
        "fir_id": "KA-2023-SHV-0412",
        "station": "Shivajinagar PS",
        "crime_type": "Hawala & Unexplained High Value Transfers",
        "sections": "120B, 420 IPC",
        "date": "2023-07-19 15:40:00",
        "state": "Karnataka"
      }
    ],
    "associates": [
      { "id": "person_aslam_bhai", "name": "Aslam Bhai", "relation": "CALLED", "details": "Shared Phone +91-9876543210" },
      { "id": "person_vikram_jadhav", "name": "Vikram Jadhav", "relation": "TRANSFERRED_FUNDS", "details": "INR 1,500,000 Hawala" },
      { "id": "person_suresh_shetty", "name": "Suresh Shetty", "relation": "ASSOCIATED_WITH", "details": "Shared Vehicle MH-12-DE-1001" },
      { "id": "person_mohd_iqbal", "name": "Mohd. Iqbal", "relation": "TRANSFERRED_FUNDS", "details": "INR 450,000 Equipment Rent" }
    ],
    "legal_justification": "Composite Risk Rating 94/100. Operates as a high-betweenness structural bottleneck (Centrality Index: 8.42%), bridging geographically separated criminal cells. Multi-jurisdictional syndicate footprint verified across Maharashtra and Karnataka. Directs 6 identified subordinate conduits and logistics handlers."
  },
  "person_aslam_bhai": {
    "id": "person_aslam_bhai",
    "canonical_name": "Aslam Bhai",
    "aliases": ["Mohd. Aslam"],
    "risk_score": 92,
    "risk_tier": "critical",
    "centrality_rank": 2,
    "betweenness_score": 0.0715,
    "is_cross_jurisdiction": true,
    "states": ["Karnataka", "Maharashtra"],
    "phones": ["+91-9876543210"],
    "vehicles": ["KA-01-MJ-9912"],
    "bank_accounts": ["ICICI-8819201920"],
    "firs": [
      {
        "fir_id": "KA-2023-SHV-0412",
        "station": "Shivajinagar PS",
        "crime_type": "Hawala & Unexplained High Value Transfers",
        "sections": "120B, 420 IPC",
        "date": "2023-07-19 15:40:00",
        "state": "Karnataka"
      }
    ],
    "associates": [
      { "id": "person_mohd_aslam", "name": "Mohd. Aslam", "relation": "CALLED", "details": "Shared Phone +91-9876543210" },
      { "id": "person_farhan_sheikh", "name": "Farhan Sheikh", "relation": "TRANSFERRED_FUNDS", "details": "INR 950,000 Dispersal" }
    ],
    "legal_justification": "Composite Risk Rating 92/100. Identified key Karnataka node of the Deccan-Konkan syndicate, receiving hawala transfers routed through transit accounts in Belgaum."
  },
  "person_vikram_jadhav": {
    "id": "person_vikram_jadhav",
    "canonical_name": "Vikram Jadhav",
    "aliases": [],
    "risk_score": 82,
    "risk_tier": "high",
    "centrality_rank": 3,
    "betweenness_score": 0.0521,
    "is_cross_jurisdiction": false,
    "states": ["Maharashtra"],
    "phones": ["+91-9822019283"],
    "vehicles": ["MH-12-AB-4491"],
    "bank_accounts": ["HDFC-1092837482"],
    "firs": [
      {
        "fir_id": "MH-2023-PUN-0711",
        "station": "Shivajinagar PS",
        "crime_type": "Armed Extortion & Assault",
        "sections": "384, 324 IPC",
        "date": "2023-09-10 14:10:00",
        "state": "Maharashtra"
      }
    ],
    "associates": [
      { "id": "person_mohd_aslam", "name": "Mohd. Aslam", "relation": "TRANSFERRED_FUNDS", "details": "INR 1,500,000" },
      { "id": "person_suresh_shetty", "name": "Suresh Shetty", "relation": "TRANSFERRED_FUNDS", "details": "INR 1,250,000 Transit" }
    ],
    "legal_justification": "Composite Risk Rating 82/100. Operates as Pune regional enforcer and primary transit account holder for interstate fund layering."
  },
  "person_suresh_shetty": {
    "id": "person_suresh_shetty",
    "canonical_name": "Suresh Shetty",
    "aliases": [],
    "risk_score": 84,
    "risk_tier": "high",
    "centrality_rank": 4,
    "betweenness_score": 0.0612,
    "is_cross_jurisdiction": true,
    "states": ["Karnataka", "Maharashtra"],
    "phones": ["+91-9845012390"],
    "vehicles": ["MH-12-DE-1001"],
    "bank_accounts": ["CAN-5582910293"],
    "firs": [
      {
        "fir_id": "KA-2023-BEL-0188",
        "station": "Market PS",
        "crime_type": "Inter-State Smuggling & Transit Logistics",
        "sections": "120B, 379 IPC",
        "date": "2023-08-30 09:15:00",
        "state": "Karnataka"
      }
    ],
    "associates": [
      { "id": "person_mohd_aslam", "name": "Mohd. Aslam", "relation": "ASSOCIATED_WITH", "details": "Shared Vehicle MH-12-DE-1001" },
      { "id": "person_vikram_jadhav", "name": "Vikram Jadhav", "relation": "TRANSFERRED_FUNDS", "details": "Transit Escrow" }
    ],
    "legal_justification": "Composite Risk Rating 84/100. Belgaum border corridor coordinator utilizing vehicles registered in Maharashtra for Karnataka contraband delivery."
  }
};

export const MOCK_PENDING = [
  {
    "candidate_id": "RES-2026-001",
    "primary_id": "person_mohd_aslam",
    "primary_name": "Mohd. Aslam",
    "primary_dept": "Maharashtra Police (MRA Marg PS)",
    "secondary_id": "person_aslam_bhai",
    "secondary_name": "Aslam Bhai",
    "secondary_dept": "Karnataka State Police (Shivajinagar PS)",
    "confidence_score": 0.9562,
    "adjudication_tier": "AUTO_MERGE",
    "breakdown": {
      "levenshtein_similarity": 0.3571,
      "phonetic_similarity": 0.375,
      "token_sort_ratio": 1.0,
      "base_name_score": 0.5562,
      "corroboration_boost": 0.4,
      "total_score": 0.9562
    },
    "shared_identifiers": {
      "phones": ["+91-9876543210"]
    },
    "legal_reasoning": "High-confidence match (95%) between 'Mohd. Aslam' (MH Police) and 'Aslam Bhai' (KA Crime). Token permutation analysis (100%) confirms identical core name elements with differing honorifics or abbreviations. Direct CDR correlation: Shared seized MSISDN (+91-9876543210) active across both MH Police and KA Crime case records. Entity merge strongly recommended. Recommended action: Consolidate criminal history and update interstate intelligence bulletin."
  },
  {
    "candidate_id": "RES-2026-002",
    "primary_id": "person_mohd_iqbal",
    "primary_name": "Mohd. Iqbal",
    "primary_dept": "Maharashtra Police (Mumbra PS)",
    "secondary_id": "person_iqbal_painter",
    "secondary_name": "Iqbal Painter",
    "secondary_dept": "Karnataka State Police (Commercial St PS)",
    "confidence_score": 0.9562,
    "adjudication_tier": "AUTO_MERGE",
    "breakdown": {
      "levenshtein_similarity": 0.3571,
      "phonetic_similarity": 0.375,
      "token_sort_ratio": 1.0,
      "base_name_score": 0.5562,
      "corroboration_boost": 0.4,
      "total_score": 0.9562
    },
    "shared_identifiers": {
      "phones": ["+91-9811223344"]
    },
    "legal_reasoning": "High-confidence match (95%) between 'Mohd. Iqbal' (MH Police) and 'Iqbal Painter' (KA Crime). Token permutation analysis (100%) confirms identical core name elements with differing honorifics or abbreviations. Direct CDR correlation: Shared seized MSISDN (+91-9811223344) active across both MH Police and KA Crime case records. Entity merge strongly recommended."
  }
];
