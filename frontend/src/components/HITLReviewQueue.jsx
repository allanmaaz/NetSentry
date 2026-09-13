import React, { useState } from "react";
import { Check, X, ChevronUp, ChevronDown, Sparkles, Phone, ShieldCheck } from "lucide-react";

export default function HITLReviewQueue({
  candidates,
  onResolve,
  isProcessing
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!candidates || candidates.length === 0) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 max-w-4xl mx-auto z-20 transition-all duration-300">
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        {/* Toggle Bar */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-5 py-3 bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span className="tracking-wide uppercase font-mono">
              HUMAN-IN-THE-LOOP (HITL) ADJUDICATION DOCK
            </span>
            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold">
              {candidates.length} PENDING
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span className="text-[11px] font-mono">
              {isExpanded ? "Minimize" : "Expand Review Queue"}
            </span>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </div>
        </button>

        {/* Collapsible Content */}
        {isExpanded && (
          <div className="p-4 space-y-3 max-h-64 overflow-y-auto bg-slate-50/50">
            {candidates.map((cand) => {
              const scorePct = Math.round(cand.confidence_score * 100);
              const isHigh = scorePct >= 85;

              return (
                <div
                  key={cand.candidate_id}
                  className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4 text-xs"
                >
                  {/* Entity Comparison */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {cand.primary_name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {cand.primary_dept}
                        </div>
                      </div>

                      <span className="text-slate-400 font-mono text-xs">⟷</span>

                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {cand.secondary_name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {cand.secondary_dept}
                        </div>
                      </div>
                    </div>

                    {/* Shared Identifiers */}
                    {cand.shared_identifiers?.phones && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-mono">
                        <Phone size={12} className="text-sky-600" />
                        <span>Shared MSISDN: {cand.shared_identifiers.phones.join(", ")}</span>
                      </div>
                    )}
                  </div>

                  {/* Confidence Badge */}
                  <div className="flex flex-col items-center justify-center px-4 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span
                      className={`text-base font-extrabold font-mono ${
                        isHigh ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {scorePct}%
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">
                      MATCH CONFIDENCE
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onResolve(cand.candidate_id, "MERGE")}
                      disabled={isProcessing}
                      title="Confirm Entity Merge"
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition shadow-sm disabled:opacity-50"
                    >
                      <Check size={14} />
                      Confirm Merge
                    </button>
                    <button
                      onClick={() => onResolve(cand.candidate_id, "REJECT")}
                      disabled={isProcessing}
                      title="Reject and Flag as Separate Entities"
                      className="p-2 border border-slate-300 hover:bg-slate-100 text-slate-600 rounded-xl transition disabled:opacity-50"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
