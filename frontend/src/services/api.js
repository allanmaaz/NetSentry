const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export async function fetchGraph() {
  const res = await fetch(`${API_BASE}/graph`);
  if (!res.ok) throw new Error("Failed to fetch graph data");
  return res.json();
}

export async function fetchEntityDetail(id) {
  const res = await fetch(`${API_BASE}/entities/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Failed to fetch entity details");
  return res.json();
}

export async function fetchPendingResolutions() {
  const res = await fetch(`${API_BASE}/resolve/pending`);
  if (!res.ok) throw new Error("Failed to fetch pending resolutions");
  return res.json();
}

export async function submitResolutionDecision(candidateId, action, notes = "") {
  const res = await fetch(`${API_BASE}/resolve/decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      candidate_id: candidateId,
      action: action,
      officer_id: "OFFICER-MH-881",
      notes: notes
    })
  });
  if (!res.ok) throw new Error("Failed to submit resolution decision");
  return res.json();
}

export async function reloadDatasets() {
  const res = await fetch(`${API_BASE}/ingest/reload`, {
    method: "POST"
  });
  if (!res.ok) throw new Error("Failed to reload datasets");
  return res.json();
}
