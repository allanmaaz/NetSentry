import React, { useState } from "react";
import {
  X,
  ShieldAlert,
  Gavel,
  Phone,
  Car,
  CreditCard,
  FileText,
  Users,
  ExternalLink,
  MapPin,
  Lock,
  Route,
  Activity
} from "lucide-react";
import { generateLegalJustification, computeIsolationScore } from "../services/xaiExplainer";

export default function InspectorDrawer({
  entity,
  isOpen,
  onClose,
  onOpenDossier,
  onSimulateArrest,
  currentOfficer,
  onOpenAuthModal,
  onTracePath,
  graphNodes = [],
  redactionMode = false
}) {
  const [traceTargetId, setTraceTargetId] = useState("");
  const [showTracePicker, setShowTracePicker] = useState(false);

  if (!isOpen || !entity) return null;

  // T2.3 — PII masking helper: returns masked text + data-masked attr value
  const mask = (raw, kind) => {
    if (!redactionMode) return { text: raw, masked: null };
    if (kind === "phone") return { text: raw, masked: "+91-XXXXX-XXXXX" };
    if (kind === "bank") return { text: raw, masked: "XXXX-XXXX-XXXX" };
    if (kind === "address") {
      const parts = String(raw).split(",");
      return { text: raw, masked: parts.length > 1 ? `XXXX, ${parts[parts.length - 1].trim()}` : "XXXX-XXXX" };
    }
    return { text: raw, masked: "••••••••" };
  };

  const getRiskColor = (score) => {
    if (score >= 85) return "#dc2626";
    if (score >= 70) return "#d97706";
    if (score >= 50) return "#0284c7";
    return "#059669";
  };

  const isCross = entity.is_cross_jurisdiction || (entity.jurisdictions && entity.jurisdictions.length > 1);

  // T1.1 — Dynamic XAI legal justification (fallback to static legal_justification if present)
  const legalText =
    entity.legal_justification ||
    generateLegalJustification(entity, {
      betweennessPercentile: Math.round((entity.betweenness || entity.betweenness_score || 0.1) * 100),
      jurisdictionCount: (entity.states || entity.jurisdictions || []).length || 1,
      hawalaRiskRatio: 0.72
    });

  // T1.3 — Isolation Forest anomaly badge
  const anomalyScore = computeIsolationScore(entity);

  return (
    <aside aria-label="Suspect Dossier Inspector" className="fixed top-14 right-0 bottom-0 w-96 bg-white/95 backdrop-blur-md border-l border-slate-200 shadow-2xl z-30 flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getRiskColor(entity.risk_score || 50) }}
          />
          <h2 className="font-bold text-sm tracking-wide text-slate-800 uppercase font-mono">
            SUSPECT DOSSIER
          </h2>
          {isCross && (
            <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono bg-purple-100 text-purple-700 border border-purple-200 rounded">
              INTER-STATE
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Profile Card */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-tight">
                {entity.canonical_name || entity.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5 text-slate-500 font-mono text-[11px]">
                <MapPin size={12} />
                <span>{(entity.states || [entity.state || "Maharashtra"]).join(", ")}</span>
              </div>
            </div>
            <div className="text-right">
              <span
                className="text-lg font-black font-mono"
                style={{ color: getRiskColor(entity.risk_score || 50) }}
              >
                {entity.risk_score || 50}
              </span>
              <div className="text-[9px] font-bold text-slate-400 font-mono uppercase">
                RISK SCORE
              </div>
            </div>
          </div>

          {/* Aliases */}
          {entity.aliases && entity.aliases.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">
                Known Aliases
              </span>
              <div className="flex flex-wrap gap-1">
                {entity.aliases.map((a, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono text-[10px]"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* T4.3 — 3-column Network Centrality Metric Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="metric-box">
            <span className="metric-val">{Number(entity.betweenness || entity.betweenness_score || 0.05).toFixed(3)}</span>
            <span className="metric-lbl">Betweenness</span>
          </div>
          <div className="metric-box">
            <span className="metric-val">{entity.degree ?? (entity.associates?.length || 2)}</span>
            <span className="metric-lbl">Degree</span>
          </div>
          <div className="metric-box">
            <span className="metric-val">{Number(entity.pagerank || 0.04).toFixed(3)}</span>
            <span className="metric-lbl">PageRank</span>
          </div>
        </div>

        {/* T1.3 — Isolation Forest Anomaly Badge */}
        {anomalyScore > 65 && (
          <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-purple-600 animate-pulse" />
              <span className="font-mono text-[11px] font-bold text-purple-800">
                Isolation Forest Anomaly
              </span>
            </div>
            <span className="font-mono text-xs font-black text-purple-700">
              {anomalyScore}/100
            </span>
          </div>
        )}

        {/* Identifiers */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
            Seized Identifiers
          </span>
          <div className="space-y-1">
            {(entity.phones || []).map((p, i) => {
              const m = mask(p, "phone");
              return (
                <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg font-mono text-[11px] text-slate-700 border border-slate-100">
                  <Phone size={13} className="text-sky-600 shrink-0" />
                  <span data-masked={m.masked}>{m.text}</span>
                </div>
              );
            })}
            {(entity.vehicles || []).map((v, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg font-mono text-[11px] text-slate-700 border border-slate-100">
                <Car size={13} className="text-amber-600 shrink-0" />
                <span>{v}</span>
              </div>
            ))}
            {(entity.bank_accounts || []).map((b, i) => {
              const m = mask(b, "bank");
              return (
                <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg font-mono text-[11px] text-slate-700 border border-slate-100">
                  <CreditCard size={13} className="text-emerald-600 shrink-0" />
                  <span data-masked={m.masked}>{m.text}</span>
                </div>
              );
            })}
            {!entity.phones?.length && !entity.vehicles?.length && !entity.bank_accounts?.length && (
              <div className="p-2 text-slate-400 font-mono text-[11px] italic">
                No physical identifiers linked yet.
              </div>
            )}
          </div>
        </div>

        {/* FIR Records */}
        {entity.firs && entity.firs.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
              Registered Chargesheets & FIRs ({entity.firs.length})
            </span>
            <div className="space-y-1.5">
              {entity.firs.map((f, i) => (
                <div key={i} className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px] space-y-0.5">
                  <div className="flex items-center justify-between font-mono font-bold text-slate-800">
                    <span>{f.fir_id}</span>
                    <span className="text-[10px] text-slate-500">{f.station}</span>
                  </div>
                  <div className="text-slate-600">{f.crime_type}</div>
                  <div className="font-mono text-[10px] text-red-600 font-semibold">{f.sections}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explainable AI (XAI) Justification */}
        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-800 font-mono font-bold text-[11px]">
            <Gavel size={14} />
            <span>XAI LEGAL JUSTIFICATION (SEC. 65B)</span>
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed font-sans">
            {legalText}
          </p>
        </div>

        {/* Direct Network Associates */}
        {entity.associates && entity.associates.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
              Direct Syndicate Associates ({entity.associates.length})
            </span>
            <div className="space-y-1">
              {entity.associates.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px]">
                  <div className="flex items-center gap-1.5 font-medium text-slate-800">
                    <Users size={12} className="text-slate-400" />
                    <span>{a.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">{a.relation}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-2">
        <button
          onClick={() => onSimulateArrest && onSimulateArrest(entity.id)}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-sm cursor-pointer"
        >
          <ShieldAlert size={14} />
          Simulate Arrest (Tactical Impact)
        </button>

        {/* T5.3 — Multi-hop BFS path tracer */}
        <button
          onClick={() => setShowTracePicker((v) => !v)}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm cursor-pointer"
        >
          <Route size={14} />
          Trace Path (BFS Graph Tracer)
        </button>
        {showTracePicker && (
          <div className="p-2.5 bg-white rounded-xl border border-emerald-200 space-y-2 animate-fadeIn">
            <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">
              Select target node:
            </label>
            <select
              value={traceTargetId}
              onChange={(e) => setTraceTargetId(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
            >
              <option value="">— Choose target —</option>
              {graphNodes
                .filter((n) => n.id !== entity.id)
                .map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.canonical_name || n.name || n.label || n.id}
                  </option>
                ))}
            </select>
            <button
              onClick={() => {
                if (traceTargetId && onTracePath) {
                  onTracePath(entity.id, traceTargetId);
                  setShowTracePicker(false);
                }
              }}
              disabled={!traceTargetId}
              className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition disabled:opacity-40"
            >
              Compute Shortest Path
            </button>
          </div>
        )}

        {currentOfficer?.role === "Analyst" || currentOfficer?.role === "FIELD_INVESTIGATOR" ? (
          <button
            onClick={onOpenAuthModal}
            title="Clearance Restricted: Section 65B court evidence export requires Supervisory Officer or System Admin elevation. Click to switch persona."
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-mono text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Lock size={14} className="text-amber-600" />
            <span>Section 65B Export (Clearance Locked)</span>
          </button>
        ) : (
          <button
            onClick={() => onOpenDossier(entity)}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition shadow-sm cursor-pointer"
          >
            <FileText size={14} />
            Export Court Dossier (Section 65B)
          </button>
        )}
      </div>
    </aside>
  );
}
