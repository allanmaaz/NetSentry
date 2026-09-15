// NetSentry — Section 65B Blockchain Chain-of-Custody Audit Ledger
// Real SHA-256 hash chaining via Web Crypto API (browser-native, air-gapped safe)
// Each block: index → timestamp → action_data → previous_hash → block_hash

const STORAGE_KEY = "netsentry_blockchain_ledger";
const GENESIS_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

// ─── Real SHA-256 via browser Web Crypto API ───────────────────────────────
export async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ─── Block Structure ────────────────────────────────────────────────────────
// {
//   index, timestamp, action, data,
//   data_hash (SHA-256 of JSON.stringify(data)),
//   officer_id, officer_name,
//   previous_hash, block_hash (SHA-256 of all the above combined)
// }

// ─── Genesis Block (Created Once) ──────────────────────────────────────────
async function createGenesisBlock() {
  const timestamp = "2026-09-01T00:00:00.000Z";
  const data = {
    system: "NetSentry Sovereign Intelligence Grid v2.0",
    mandate: "Section 65B BSA 2023 / Indian Evidence Act — Tamper-Proof Forensic Audit Chain",
    jurisdiction: "NCRB HQ, New Delhi — National Crime Records Bureau",
    initialized_by: "NCRB-DIR-0001"
  };
  const data_hash = await sha256(JSON.stringify(data));
  const block_input = `0::${timestamp}::GENESIS::${data_hash}::${GENESIS_HASH}`;
  const block_hash = await sha256(block_input);

  return {
    index: 0,
    timestamp,
    action: "GENESIS",
    label: "Chain of Custody Initialized",
    data,
    data_hash,
    previous_hash: GENESIS_HASH,
    block_hash,
    officer_id: "NCRB-DIR-0001",
    officer_name: "Dr. Vikramaditya Sharma, IPS",
    verified: true
  };
}

// ─── Read Chain from localStorage ──────────────────────────────────────────
export function getChain() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveChain(chain) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chain));
  } catch (e) {
    console.error("BlockchainLedger: Failed to persist chain:", e);
  }
}

// ─── Initialize Chain (idempotent) ─────────────────────────────────────────
export async function initChain() {
  const existing = getChain();
  if (existing && existing.length > 0) return existing;
  const genesis = await createGenesisBlock();
  const chain = [genesis];
  saveChain(chain);
  return chain;
}

// ─── Mine a New Block ───────────────────────────────────────────────────────
export async function addBlock(action, label, data, officer = null) {
  let chain = getChain();
  if (!chain || chain.length === 0) {
    chain = await initChain();
  }

  const prev = chain[chain.length - 1];
  const index = prev.index + 1;
  const timestamp = new Date().toISOString();

  const officer_id = officer?.badge_id || "SYSTEM";
  const officer_name = officer?.name || "NetSentry Auto-Chain";

  const data_hash = await sha256(JSON.stringify(data));
  const block_input = `${index}::${officer_id}::${timestamp}::${action}::${data_hash}::${prev.block_hash}`;
  const block_hash = await sha256(block_input);

  const block = {
    index,
    timestamp,
    action,
    label,
    data,
    data_hash,
    previous_hash: prev.block_hash,
    block_hash,
    officer_id,
    officer_name,
    verified: true
  };

  chain.push(block);
  saveChain(chain);
  return block;
}

// ─── Verify Entire Chain Integrity ─────────────────────────────────────────
export async function verifyChain() {
  const chain = getChain();
  if (!chain || chain.length === 0) return { valid: false, broken_at: -1, chain: [] };

  const results = [];

  for (let i = 0; i < chain.length; i++) {
    const block = chain[i];

    // Re-compute data_hash
    const recomputed_data_hash = await sha256(JSON.stringify(block.data));
    const data_ok = recomputed_data_hash === block.data_hash;

    // Re-compute block_hash
    let block_ok = false;
    if (i === 0) {
      // Genesis: verify against known genesis structure
      const recomputed = await sha256(
        `0::${block.timestamp}::GENESIS::${block.data_hash}::${GENESIS_HASH}`
      );
      block_ok = recomputed === block.block_hash;
    } else {
      const prev = chain[i - 1];
      const recomputed = await sha256(
        `${block.index}::${block.officer_id}::${block.timestamp}::${block.action}::${block.data_hash}::${prev.block_hash}`
      );
      block_ok = recomputed === block.block_hash;

      // Check previous_hash linkage
      if (block.previous_hash !== prev.block_hash) {
        results.push({ index: i, data_ok, block_ok: false, chain_ok: false });
        continue;
      }
    }

    results.push({ index: i, data_ok, block_ok, chain_ok: data_ok && block_ok });
  }

  const broken_at = results.findIndex((r) => !r.chain_ok);
  return {
    valid: broken_at === -1,
    broken_at,
    total: chain.length,
    results
  };
}

// ─── Compute Real SHA-256 for a Given Entity (Dossier Use) ──────────────────
export async function computeEntityHash(entity) {
  const payload = `${entity.id}::${entity.canonical_name}::${entity.risk_score}::${JSON.stringify(entity.states || [])}::${(entity.firs || []).map(f => f.fir_id).join(",")}`;
  return sha256(payload);
}

// ─── Compute Real SHA-256 for an Edge (Evidence Modal Use) ──────────────────
export async function computeEdgeHash(sourceId, targetId, cdrCount, txnCount, edgeType) {
  const payload = `${sourceId}::${targetId}::${edgeType}::CDR:${cdrCount}::TXN:${txnCount}::NETSENTRY-65B`;
  return sha256(payload);
}

// ─── Action Type Labels ─────────────────────────────────────────────────────
export const ACTION_COLORS = {
  GENESIS:             { bg: "bg-amber-500/15", text: "text-amber-300", border: "border-amber-500/30" },
  FIR_INGESTED:        { bg: "bg-sky-500/15",   text: "text-sky-300",   border: "border-sky-500/30" },
  ENTITY_INGESTED:     { bg: "bg-sky-500/15",   text: "text-sky-300",   border: "border-sky-500/30" },
  HITL_MERGE_APPROVED: { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/30" },
  HITL_MERGE_REJECTED: { bg: "bg-red-500/15",   text: "text-red-300",   border: "border-red-500/30" },
  ARREST_SIMULATED:    { bg: "bg-red-500/15",   text: "text-red-300",   border: "border-red-500/30" },
  DATASET_UPLOADED:    { bg: "bg-purple-500/15", text: "text-purple-300", border: "border-purple-500/30" },
  DOSSIER_EXPORTED:    { bg: "bg-indigo-500/15", text: "text-indigo-300", border: "border-indigo-500/30" }
};
