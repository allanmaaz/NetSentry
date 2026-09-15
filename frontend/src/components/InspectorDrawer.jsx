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
  MapPin,
  Lock,
  Route
} from "lucide-react";

export default function InspectorDrawer({
  entity,
  isOpen,
  onClose,
  onOpenDossier,
  onSimulateArrest,
  currentOfficer,
  onOpenAuthModal,
  onTracePath,
  graphNodes = []
}) {
  const [traceTargetId, setTraceTargetId] = useState("");
  const [showTracePicker, setShowTracePicker] = useState(false);

  if (!isOpen || !entity) return null;

  const getRiskColor = (score) => {
    if (score >= 85) return "#ef4444";
    if (score >= 70) return "#f59e0b";
    return "#0ea5e9";
  };

  const riskScore = entity.risk_score || 50;
  const isCritical = riskScore >= 85;

  // Short, clear 2-sentence summary for non-developers
  const shortSummary =
    riskScore >= 85
      ? `Primary syndicate kingpin operating cross-border logistics and counterfeit operations across Maharashtra and Karnataka.`
      : `Active syndicate operative coordinating transport routes, distribution safehouses, and communications.`;

  return (
    <aside
      aria-label="Suspect Dossier"
      className="fixed top-14 right-0 bottom-0 w-full sm:w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl z-30 flex flex-col transition-all duration-200"
    >
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: getRiskColor(riskScore) }}
          />
          <h2 className="font-bold text-xs tracking-wider text-slate-200 uppercase font-mono">
            SUSPECT DOSSIER
          </h2>
          {entity.is_cross_jurisdiction && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded">
              INTER-STATE
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Profile Card */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-base text-white">
                {entity.canonical_name || entity.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5 text-slate-400 text-xs">
                <MapPin size={13} className="text-slate-500" />
                <span>{(entity.states || [entity.state || "Maharashtra"]).join(", ")}</span>
              </div>
            </div>
            <div className="text-right">
              <span
                className="text-xl font-bold font-mono"
                style={{ color: getRiskColor(riskScore) }}
              >
                {riskScore}
              </span>
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Risk Score
              </div>
            </div>
          </div>

          {/* Aliases */}
          {entity.aliases && entity.aliases.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-[11px] text-slate-400 mb-1">Known Aliases:</div>
              <div className="flex flex-wrap gap-1.5">
                {entity.aliases.map((a, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3 Simple Metric Boxes */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-sm font-bold text-white font-mono">
              {Number(entity.betweenness || entity.betweenness_score || 0.05).toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400 uppercase mt-0.5">Influence</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-sm font-bold text-white font-mono">
              {entity.firs?.length || 1}
            </div>
            <div className="text-[10px] text-slate-400 uppercase mt-0.5">Cases / FIRs</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-sm font-bold text-white font-mono">
              {entity.associates?.length || 2}
            </div>
            <div className="text-[10px] text-slate-400 uppercase mt-0.5">Associates</div>
          </div>
        </div>

        {/* Seized Identifiers */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            Seized Identifiers:
          </label>
          <div className="space-y-1.5">
            {(entity.phones || []).map((p, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-sky-400">
                <Phone size={13} className="shrink-0" />
                <span>{p}</span>
              </div>
            ))}
            {(entity.vehicles || []).map((v, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-amber-400">
                <Car size={13} className="shrink-0" />
                <span>{v}</span>
              </div>
            ))}
            {(entity.bank_accounts || []).map((b, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-emerald-400">
                <CreditCard size={13} className="shrink-0" />
                <span>{b}</span>
              </div>
            ))}
            {!entity.phones?.length && !entity.vehicles?.length && !entity.bank_accounts?.length && (
              <div className="p-2 text-slate-500 italic text-xs">No physical identifiers recorded.</div>
            )}
          </div>
        </div>

        {/* Simple Plain-English Summary */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Gavel size={14} />
            <span>Case Intelligence Summary</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {shortSummary}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950 space-y-2 shrink-0">
        <button
          onClick={() => onSimulateArrest && onSimulateArrest(entity.id)}
          className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
        >
          <ShieldAlert size={14} />
          Simulate Arrest (Test Impact)
        </button>

        {/* 2 Side-by-Side Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowTracePicker((v) => !v)}
            className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Route size={14} />
            <span className="truncate">Trace Route</span>
          </button>

          {currentOfficer?.role === "Analyst" ? (
            <button
              onClick={onOpenAuthModal}
              className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-amber-400 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lock size={13} />
              <span className="truncate">Court Dossier</span>
            </button>
          ) : (
            <button
              onClick={() => onOpenDossier(entity)}
              className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white border border-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <FileText size={14} />
              <span className="truncate">Court Dossier</span>
            </button>
          )}
        </div>

        {/* Trace Route Picker (Expandable if toggled) */}
        {showTracePicker && (
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <select
              value={traceTargetId}
              onChange={(e) => setTraceTargetId(e.target.value)}
              className="w-full text-xs p-2 bg-slate-950 border border-slate-800 rounded-lg text-white outline-none"
            >
              <option value="">— Select Target Suspect —</option>
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
              className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition disabled:opacity-40"
            >
              Trace Connection
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
