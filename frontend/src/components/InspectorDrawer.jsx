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
  ChevronUp,
  ChevronDown
} from "lucide-react";

export default function InspectorDrawer({
  entity,
  isOpen,
  onClose,
  onOpenDossier,
  onSimulateArrest,
  currentOfficer,
  onOpenAuthModal
}) {
  // R4 — mobile sheet expand/collapse (hooks before early return)
  const [sheetExpanded, setSheetExpanded] = useState(false);

  if (!isOpen || !entity) return null;

  const getRiskColor = (score) => {
    if (score >= 85) return "#dc2626";
    if (score >= 70) return "#d97706";
    if (score >= 50) return "#0284c7";
    return "#059669";
  };

  const riskColor = getRiskColor(entity.risk_score);
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (entity.risk_score / 100) * circumference;

  return (
    <>
      {/* R4 — backdrop scrim on phones/tablets */}
      <div className="sheet-backdrop lg:hidden" onClick={onClose} />
      {/* R4 — bottom sheet on <lg, side drawer on lg+ */}
      <aside className={`absolute z-30 flex flex-col bg-white shadow-2xl transition-all duration-300 max-lg:left-2 max-lg:right-2 max-lg:bottom-[74px] max-lg:top-auto max-lg:rounded-2xl max-lg:border max-lg:border-slate-200 max-lg:overflow-hidden ${sheetExpanded ? "max-lg:max-h-[78dvh]" : "max-lg:max-h-[48dvh]"} lg:top-0 lg:right-0 lg:w-96 lg:h-full lg:border-l lg:border-slate-200`}>
      {/* R4 — drag handle (visual) on phones/tablets */}
      <div className="sheet-handle lg:hidden" onClick={() => setSheetExpanded((v) => !v)} />
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldAlert size={18} className="text-red-600 shrink-0" />
          <span className="text-xs font-bold tracking-wider text-slate-700 uppercase font-mono truncate">
            CRIMINAL INTELLIGENCE DOSSIER
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {/* R4 — expand/collapse on phones/tablets */}
          <button
            onClick={() => setSheetExpanded((v) => !v)}
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            aria-label={sheetExpanded ? "Collapse panel" : "Expand panel"}
          >
            {sheetExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Profile Card */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-900 break-words">{entity.canonical_name}</h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                {entity.risk_tier} RISK
              </span>
              {entity.is_cross_jurisdiction && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                  <MapPin size={10} /> Multi-State Syndicate
                </span>
              )}
            </div>
          </div>

          {/* Donut Score Gauge */}
          <div className="relative flex items-center justify-center w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="#e2e8f0"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke={riskColor}
                strokeWidth="7"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 * (1 - entity.risk_score / 100)}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-lg font-extrabold text-slate-900 leading-none">
                {entity.risk_score}
              </span>
              <span className="text-[9px] font-bold text-slate-400 font-mono uppercase">
                RISK
              </span>
            </div>
          </div>
        </div>

        {/* XAI Legal Justification Card */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <Gavel size={14} className="text-slate-600" />
            <span>AI Legal Explainability (Sec. 65B Audit)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed italic">
            &ldquo;{entity.legal_justification}&rdquo;
          </p>
        </div>

        {/* Known Aliases */}
        {entity.aliases && entity.aliases.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
              Identified Aliases ({entity.aliases.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {entity.aliases.map((alias, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-800 rounded-md border border-slate-200"
                >
                  {alias}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Digital & Physical Assets */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
            Digital & Physical Corroboration
          </h4>

          {entity.phones && entity.phones.length > 0 && (
            <div className="flex items-center gap-2.5 text-xs text-slate-700 p-2 rounded-lg bg-slate-50 border border-slate-100 font-mono">
              <Phone size={14} className="text-sky-600 shrink-0" />
              <span>{entity.phones.join(", ")}</span>
            </div>
          )}

          {entity.vehicles && entity.vehicles.length > 0 && (
            <div className="flex items-center gap-2.5 text-xs text-slate-700 p-2 rounded-lg bg-slate-50 border border-slate-100 font-mono">
              <Car size={14} className="text-amber-600 shrink-0" />
              <span>{entity.vehicles.join(", ")}</span>
            </div>
          )}

          {entity.bank_accounts && entity.bank_accounts.length > 0 && (
            <div className="flex items-center gap-2.5 text-xs text-slate-700 p-2 rounded-lg bg-slate-50 border border-slate-100 font-mono">
              <CreditCard size={14} className="text-emerald-600 shrink-0" />
              <span>{entity.bank_accounts.join(", ")}</span>
            </div>
          )}
        </div>

        {/* Associated FIRs */}
        {entity.firs && entity.firs.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 font-mono">
              Connected Law Enforcement FIRs ({entity.firs.length})
            </h4>
            <div className="space-y-2">
              {entity.firs.map((fir, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 font-mono">{fir.fir_id}</span>
                    <span className="text-[10px] text-slate-500">{fir.date?.split(" ")[0]}</span>
                  </div>
                  <div className="text-slate-600 font-medium">{fir.crime_type}</div>
                  <div className="text-[11px] text-slate-400">
                    {fir.station} • {fir.sections}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Network Associates */}
        {entity.associates && entity.associates.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
              Direct Associates ({entity.associates.length})
            </h4>
            <div className="space-y-1.5">
              {entity.associates.map((asc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                >
                  <span className="font-medium text-slate-800">{asc.name}</span>
                  <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {asc.relation}
                  </span>
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
          className="w-full flex items-center justify-center gap-2 py-2 max-lg:py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-sm cursor-pointer max-lg:min-h-[44px]"
        >
          <ShieldAlert size={14} />
          Simulate Arrest (Tactical Impact)
        </button>
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
            className="w-full flex items-center justify-center gap-2 py-2 max-lg:py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition shadow-sm cursor-pointer max-lg:min-h-[44px]"
          >
            <FileText size={14} />
            Export Court Dossier (Section 65B)
          </button>
        )}
      </div>
    </aside>
    </>
  );
}
