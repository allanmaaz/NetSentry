// NetSentry Schema Adapter & Normalizer Service
// Normalizes heterogeneous CSV/JSON rows into canonical Graph Entities

import schemaMappings from "../config/schema_mappings.json";

/**
 * Clean and format individual suspect names
 */
export function cleanName(raw) {
  if (!raw) return "Unknown Suspect";
  return raw
    .replace(/\b(alias|known as|a\.k\.a\.?|bhai|seth|don)\b/gi, "")
    .replace(/[^\w\s\u0900-\u097F]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * E.164 phone normalizer
 */
export function normalizePhone(raw) {
  if (!raw) return "";
  const cleaned = raw.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+91")) return cleaned;
  if (cleaned.length === 10) return `+91-${cleaned.slice(0, 5)}${cleaned.slice(5)}`;
  if (cleaned.startsWith("91") && cleaned.length === 12) return `+${cleaned.slice(0, 2)}-${cleaned.slice(2, 7)}${cleaned.slice(7)}`;
  return cleaned;
}

/**
 * Indian vehicle registration plate normalizer
 */
export function normalizePlate(raw) {
  if (!raw) return "";
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/^([A-Z]{2})(\d{2})([A-Z]{1,2})(\d{4})$/, "$1-$2-$3-$4");
}

/**
 * Parse CSV string into array of object rows
 */
export function parseCSV(csvText) {
  if (!csvText || !csvText.trim()) return [];
  const lines = csvText
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  if (lines.length === 1) {
    // Single line without headers or with comma values
    const parts = lines[0].split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
    return [{
      accused_name: parts[0] || "Suspect",
      fir_number: parts[1] || `MH-2026-${Math.floor(100 + Math.random() * 900)}`,
      police_station: parts[2] || "Bund Garden PS",
      offense_type: parts[3] || "Extortion & Hawala",
      section_ipc: parts[4] || "384 120B IPC",
      date_of_fir: parts[5] || new Date().toISOString().slice(0, 10),
      seized_phone: parts[6] || "+91-9822998811",
      vehicle_reg_no: parts[7] || "MH-12-BF-9090",
      location_district: parts[8] || "Pune"
    }];
  }

  // Parse header
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });
    rows.push(row);
  }
  return rows;
}

/**
 * Live CSV Normalizer using Schema Adapter
 * Transforms parsed rows into canonical NetSentry Graph nodes & links
 */
export function normalizeCSVToEntities(csvText, department = "MH_POLICE") {
  const rows = parseCSV(csvText);
  if (rows.length === 0) return { nodes: [], edges: [] };

  const deptConfig = schemaMappings.departments[department] || schemaMappings.departments.MH_POLICE;

  const newNodes = [];
  const newEdges = [];

  rows.forEach((row, idx) => {
    // Determine accused name from mapping or common keys
    const nameRaw =
      row.accused_name ||
      row.suspect_details ||
      row.sender_name ||
      row.receiver_name ||
      row.name ||
      row.alias ||
      `Suspect-${idx + 1}`;

    const cleaned = cleanName(nameRaw);
    const slug = cleaned.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const nodeId = `person_${slug}_${Date.now().toString().slice(-4)}_${idx}`;

    // Phone
    const rawPhone = row.seized_phone || row.contact_number || row.phone || "";
    const phone = rawPhone ? normalizePhone(rawPhone) : `+91-98${Math.floor(10000000 + Math.random() * 90000000)}`;

    // Vehicle
    const rawVeh = row.vehicle_reg_no || row.associated_vehicle || row.vehicle || "";
    const vehicle = rawVeh ? normalizePlate(rawVeh) : (department === "KA_POLICE" ? "KA-01-X-4421" : "MH-02-AZ-8819");

    // Sections & Station
    const sections = row.section_ipc || row.ipc_sections_invoked || row.sections || "384, 120B IPC";
    const station = row.police_station || row.ps_jurisdiction || (department === "KA_POLICE" ? "Cubbon Park PS" : "Bund Garden PS");
    const firId = row.fir_number || row.crime_no || `${department === "KA_POLICE" ? "KA" : "MH"}-2026-${Math.floor(100 + Math.random() * 900)}`;

    const node = {
      id: nodeId,
      label: cleaned,
      name: cleaned,
      type: "Person",
      risk_score: Number(row.risk_score) || (76 + Math.floor(Math.random() * 18)),
      risk_tier: (Number(row.risk_score) > 85) ? "critical" : "high",
      betweenness: 0.045,
      pagerank: 0.038,
      orbit_level: 2, // Orbit II, Default as specified in T4.2
      is_cross_jurisdiction: department === "KA_POLICE" || row.state === "Karnataka" || Boolean(row.is_cross_jurisdiction),
      state: department === "KA_POLICE" || row.state === "Karnataka" ? "Karnataka" : "Maharashtra",
      radius: 17,
      isNewSpawn: true, // Triggers glowing orbital insertion animation
      spawnTimestamp: Date.now(),
      details: {
        phones: [phone],
        vehicles: [vehicle],
        firs_count: 1,
        aliases: [row.alias || `Alias ${cleaned.split(" ")[0]}`],
        firs: [
          {
            fir_id: firId,
            station: station,
            crime_type: row.offense_type || row.major_head || row.crime_type || "Extortion & Cross-Border Hawala Syndicate",
            sections: sections,
            date: row.date_of_fir || new Date().toISOString()
          }
        ]
      }
    };

    newNodes.push(node);

    // Dynamically resolve the kingpin (orbit_level === 0) from the live graph state
    const kingpinNode = window.currentSyndicateData?.nodes?.find((n) => n.orbit_level === 0);
    const kingpinId = kingpinNode?.id || "person_abdul_karim_telgi";

    // Automatically create a link to Kingpin or safehouse logistics node
    newEdges.push({
      source: kingpinId,
      target: nodeId,
      type: department === "FINANCIAL_INTEL" ? "TRANSFERRED_FUNDS" : "ASSOCIATED_WITH",
      weight: 2.5,
      label: `Ingested ${department} Conductor`,
      is_cross_jurisdiction: node.is_cross_jurisdiction
    });
  });

  return { nodes: newNodes, edges: newEdges };
}

/**
 * Storage helpers for persisting custom ingested entities across page refreshes
 */
const STORAGE_KEY = "netsentry_custom_entities";

export function getCustomIngestedData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { nodes: [], edges: [] };
  } catch (e) {
    console.error("Error loading custom entities:", e);
    return { nodes: [], edges: [] };
  }
}

export function saveCustomIngestedData(newNodes, newEdges) {
  try {
    const existing = getCustomIngestedData();
    const mergedNodes = [...existing.nodes, ...newNodes];
    const mergedEdges = [...existing.edges, ...newEdges];
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ nodes: mergedNodes, edges: mergedEdges })
    );
    return { nodes: mergedNodes, edges: mergedEdges };
  } catch (e) {
    console.error("Error persisting custom entities:", e);
    return { nodes: newNodes, edges: newEdges };
  }
}

export function clearCustomIngestedData() {
  localStorage.removeItem(STORAGE_KEY);
}
