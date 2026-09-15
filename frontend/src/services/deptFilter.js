// Shared department/agency filter + jurisdiction helpers (T2.4, T4.4)

export const DEPT_FILTERS = ["all", "MH_POLICE", "KA_POLICE", "DL_STF", "NIA", "NCB"];

// Returns true if a node belongs to the selected department/agency.
export function matchesDept(node, dept) {
  if (!dept || dept === "all") return true;
  const state = (node.state || "").toLowerCase();
  const agencies = (node.agencies || node.details?.agencies || []).map((a) => String(a).toUpperCase());
  const hasAgency = (code) => agencies.some((a) => a.includes(code));
  switch (dept) {
    case "MH_POLICE":
      return state.includes("maharashtra") || hasAgency("MH_POLICE") || hasAgency("MH ");
    case "KA_POLICE":
      return state.includes("karnataka") || hasAgency("KA_POLICE") || hasAgency("KA ");
    case "DL_STF":
      return state.includes("delhi") || hasAgency("DL_STF") || hasAgency("DELHI");
    case "NIA":
      return hasAgency("NIA") || node.is_cross_jurisdiction === true;
    case "NCB":
      return hasAgency("NCB");
    default:
      return true;
  }
}

// T4.4 — jurisdiction count derived from agencies / cross-state flag
export function jurisdictionCount(node) {
  if (node.jurisdictionCount != null) return node.jurisdictionCount;
  if (node.jurisdiction_count != null) return node.jurisdiction_count;
  const agencies = node.agencies || node.details?.agencies || [];
  if (agencies.length >= 2) return agencies.length;
  if (node.is_cross_jurisdiction) return 2;
  return 1;
}
