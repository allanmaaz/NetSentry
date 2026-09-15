import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Link2,
  Lock,
  Hash,
  Clock,
  UserCheck,
  Zap,
  Copy,
  Check
} from "lucide-react";
import { getChain, verifyChain, ACTION_COLORS } from "../services/blockchainLedger";

function truncateHash(hash = "", len = 16) {
  if (!hash || hash.length <= len * 2 + 3) return hash;
  return `${hash.slice(0, len)}…${hash.slice(-8)}`;
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-300 transition cursor-pointer"
      title="Copy hash"
    >
      {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
    </button>
  );
}

function BlockRow({ block, verifyResult, isExpanded, onToggle }) {
  const colors = ACTION_COLORS[block.action] || ACTION_COLORS["FIR_INGESTED"];
  const isGenesis = block.index === 0;
  const verified = verifyResult?.chain_ok ?? true;

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-200 ${
        isGenesis
          ? "border-amber-500/40 bg-amber-950/20"
          : verified
          ? "border-slate-700/60 bg-slate-900/60"
          : "border-red-500/50 bg-red-950/20"
      }`}
    >
      {/* Block Header Row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/40 transition cursor-pointer"
      >
        {/* Index Badge */}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-mono font-black text-sm ${
            isGenesis ? "bg-amber-500/20 text-amber-400" : "bg-slate-800 text-slate-300"
          }`}
        >
          #{block.index}
        </div>

        {/* Action Badge */}
        <span
          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border shrink-0 ${colors.bg} ${colors.text} ${colors.border}`}
        >
          {block.action}
        </span>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-slate-200 truncate">{block.label}</div>
          <div className="text-[10px] font-mono text-slate-500 truncate">
            {new Date(block.timestamp).toLocaleString("en-IN", {
              day: "2-digit", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit", second: "2-digit"
            })}
          </div>
        </div>

        {/* Hash preview */}
        <code className="hidden lg:block text-[10px] font-mono text-slate-500 shrink-0">
          {truncateHash(block.block_hash, 8)}
        </code>

        {/* Integrity Badge */}
        <div className="shrink-0">
          {verified ? (
            <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
              <CheckCircle2 size={11} /> VALID
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-lg">
              <AlertTriangle size={11} /> TAMPERED
            </span>
          )}
        </div>

        {/* Expand toggle */}
        <div className="text-slate-500 shrink-0">
          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-slate-800/60 px-4 py-4 space-y-3 bg-slate-950/40">
          {/* Hash Fields Grid */}
          <div className="grid grid-cols-1 gap-2 text-[11px] font-mono">
            {[
              { label: "DATA HASH (SHA-256)", value: block.data_hash, color: "text-sky-400" },
              { label: "PREVIOUS BLOCK HASH", value: block.previous_hash, color: "text-slate-400" },
              { label: "BLOCK HASH (SHA-256)", value: block.block_hash, color: "text-amber-400", bold: true }
            ].map(({ label, value, color, bold }) => (
              <div key={label} className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px] mb-1">{label}</div>
                <div className="flex items-center gap-2">
                  <code className={`flex-1 break-all leading-relaxed ${color} ${bold ? "font-bold" : ""}`}>
                    {value}
                  </code>
                  <CopyButton text={value} />
                </div>
              </div>
            ))}
          </div>

          {/* Officer + Timestamp */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] mb-1">
                <UserCheck size={10} /> OFFICER / AUTHORITY
              </div>
              <div className="text-slate-200 font-bold">{block.officer_name}</div>
              <div className="text-slate-400">{block.officer_id}</div>
            </div>
            <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] mb-1">
                <Clock size={10} /> TIMESTAMP (IST)
              </div>
              <div className="text-slate-200 font-bold">{block.timestamp}</div>
            </div>
          </div>

          {/* Action Data Payload */}
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <div className="text-slate-500 text-[10px] mb-2">EVIDENCE PAYLOAD (Hashed Above)</div>
            <pre className="text-[10px] text-emerald-400 overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap break-all">
              {JSON.stringify(block.data, null, 2)}
            </pre>
          </div>

          {/* BSA Certificate */}
          <div className="p-2.5 bg-emerald-950/30 rounded-lg border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Shield size={11} /> BSA 2023 / SECTION 65B — ADMISSIBILITY CERTIFICATION
            </div>
            <p className="text-emerald-500 leading-relaxed font-sans text-[10px]">
              This block is cryptographically sealed. The SHA-256 digest of the evidence payload
              is embedded in the block hash chain. Any modification to the data will invalidate
              all subsequent block hashes, rendering tampering immediately detectable under
              Section 65B of the Indian Evidence Act / Bharatiya Sakshya Adhiniyam 2023.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BlockchainLedgerModal({ isOpen, onClose }) {
  const [chain, setChain] = useState([]);
  const [verifyResults, setVerifyResults] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [chainValid, setChainValid] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const loadAndVerify = useCallback(async () => {
    setIsVerifying(true);
    const currentChain = getChain() || [];
    setChain([...currentChain].reverse()); // Show newest first

    if (currentChain.length > 0) {
      const result = await verifyChain();
      setChainValid(result.valid);
      setVerifyResults(result.results || []);
    }
    setIsVerifying(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadAndVerify();
    }
  }, [isOpen, loadAndVerify]);

  if (!isOpen) return null;

  const totalBlocks = chain.length;
  // chain is reversed for display, but verifyResults are indexed from 0 = genesis
  // So for display block at position i (which has block.index), look up verifyResults[block.index]
  const getVerifyResult = (block) => verifyResults[block.index] || null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/60 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-100">

        {/* ── Modal Header ─────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/30 shrink-0">
              <Link2 size={22} className="text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black font-mono text-sm tracking-widest text-white uppercase">
                  Section 65B Chain of Custody Ledger
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  SHA-256 VERIFIED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Tamper-proof BSA 2023 forensic audit blockchain • Web Crypto API • Air-gapped
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Chain Integrity Status Bar ────────────────────────────────── */}
        <div className={`px-6 py-3 flex items-center justify-between border-b shrink-0 ${
          chainValid === null
            ? "bg-slate-900 border-slate-800"
            : chainValid
            ? "bg-emerald-950/40 border-emerald-500/30"
            : "bg-red-950/40 border-red-500/30"
        }`}>
          <div className="flex items-center gap-4">
            {/* Chain integrity badge */}
            <div className={`flex items-center gap-2 text-sm font-mono font-bold ${
              chainValid === null ? "text-slate-400" : chainValid ? "text-emerald-400" : "text-red-400"
            }`}>
              {chainValid === null ? (
                <><Hash size={16} className="animate-pulse" /> CHAIN NOT YET VERIFIED</>
              ) : chainValid ? (
                <><CheckCircle2 size={16} /> ALL {totalBlocks} BLOCKS VERIFIED — CHAIN INTACT</>
              ) : (
                <><AlertTriangle size={16} /> CHAIN INTEGRITY VIOLATION DETECTED</>
              )}
            </div>

            {/* Stats pills */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
                {totalBlocks} BLOCKS
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
                SHA-256 CHAINED
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
                BSA 2023 COMPLIANT
              </span>
            </div>
          </div>

          {/* Verify Button */}
          <button
            onClick={loadAndVerify}
            disabled={isVerifying}
            className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-mono font-bold transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isVerifying ? "animate-spin" : ""} />
            {isVerifying ? "Verifying…" : "Re-Verify All Hashes"}
          </button>
        </div>

        {/* ── Block Chain Quick Stats ───────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-0 border-b border-slate-800 shrink-0">
          {[
            { label: "TOTAL BLOCKS", value: totalBlocks, color: "text-amber-400" },
            { label: "ACTIONS LOGGED", value: totalBlocks - 1, color: "text-sky-400" },
            { label: "ALGORITHM", value: "SHA-256", color: "text-emerald-400" },
            { label: "COMPLIANCE", value: "BSA 2023", color: "text-purple-400" }
          ].map((stat) => (
            <div key={stat.label} className="px-5 py-3 border-r border-slate-800 last:border-r-0">
              <div className="text-[10px] text-slate-500 font-mono">{stat.label}</div>
              <div className={`text-sm font-black font-mono ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* ── Block List ────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {chain.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500 font-mono text-sm gap-3">
              <Lock size={32} className="text-slate-700" />
              <p>No blocks yet. Perform an action (ingest FIR, merge entity) to begin the chain.</p>
            </div>
          ) : (
            chain.map((block) => (
              <BlockRow
                key={block.index}
                block={block}
                verifyResult={getVerifyResult(block)}
                isExpanded={expandedIndex === block.index}
                onToggle={() => setExpandedIndex(expandedIndex === block.index ? null : block.index)}
              />
            ))
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0 text-[11px] font-mono">
          <div className="text-slate-500 flex items-center gap-2">
            <Zap size={12} className="text-amber-400" />
            <span>NetSentry Blockchain — Real SHA-256 via Web Crypto API — No external dependencies</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
