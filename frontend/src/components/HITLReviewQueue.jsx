import React, { useState } from "react";
import { Check, X, ChevronUp, ChevronDown, Sparkles, Phone, ShieldCheck, Car, User, Scale } from "lucide-react";

// T2.1 — HITL side-by-side comparison modal + T2.5 confidence breakdown bars
export default function HITLReviewQueue({
  candidates,
  onResolve,
  isProcessing,
  userRole = null
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [reviewCandidate, setReviewCandidate] = useState(null);

  if (!candidates || candidates.length === 0) return null;

  const locked = userRole === "Analyst";

  // T2.5 — Extract fuzzy/phonetic/token/corroboration breakdown
  const getBreakdown = (cand) => {
    const b = cand.breakdown || {};
    return [
      { label: "Fuzzy", value: b.levenshtein_similarity ?? b.fuzzy ?? cand.fuzzy_score ?? 0 },
      { label: "Phonetic", value: b.phonetic_similarity ?? b.phonetic ?? cand.phonetic_score ?? 0 },
      { label: "Token", value: b.token_sort_ratio ?? b.token ?? cand.token_score ?? 0 },
      { label: "Corroboration", value: b.corroboration_boost ?? b.corroboration ?? cand.corroboration_score ?? 0 }
    ];
  };

  const handleConfirm = (cand) => {
    onResolve(cand.candidate_id, "MERGE");
    setReviewCandidate(null);
  };

  const handleReject = (cand) => {
    onResolve(cand.candidate_id, "REJECT");
    setReviewCandidate(null);
  };

  const renderFieldRow = (label, valA, valB) => {
    const match = String(valA || "").toLowerCase().trim() === String(valB || "").toLowerCase().trim() && valA;
    return (
      <div className="flex items-center justify-between gap-2 py-1 border-b border-slate-100 last:border-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase font-mono w-14 shrink-0">{label}</span>
        <span className={`match-pill ${match ? "match" : "nomatch"}`}>
          {match ? "MATCH" : "DIFF"}
        </span>
      </div>
    );
  };

  return (
    <>
      <div className="absolute bottom-4 left-4 right-4 max-w-4xl mx-auto z-20 transition-all duration-300">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          {/* Toggle Bar */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between px-5 py-3 bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              <h2 className="tracking-wide uppercase font-mono text-xs font-semibold">
                HUMAN-IN-THE-LOOP (HITL) ADJUDICATION DOCK
              </h2>
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
                          <h3 className="font-bold text-slate-900 text-sm">
                            {cand.primary_name}
                          </h3>
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
                        onClick={() => setReviewCandidate(cand)}
                        disabled={isProcessing}
                        title="Open side-by-side review"
                        className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-medium transition shadow-sm disabled:opacity-50"
                      >
                        <Scale size={14} />
                        Review
                      </button>
                      <button
                        onClick={() => handleConfirm(cand)}
                        disabled={isProcessing || locked}
                        title={locked ? "Locked for Analyst role" : "Confirm Entity Merge"}
                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition shadow-sm disabled:opacity-50"
                      >
                        <Check size={14} />
                        Confirm Merge
                      </button>
                      <button
                        onClick={() => handleReject(cand)}
                        disabled={isProcessing}
                        title="Reject Match — flag as separate entities"
                        className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:bg-slate-100 text-slate-600 rounded-xl transition disabled:opacity-50"
                      >
                        <X size={14} />
                        Reject Match
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* T2.1 — Side-by-side comparison modal */}
      {reviewCandidate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden animate-fadeIn">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale size={18} className="text-slate-900" />
                <h2 className="font-bold text-xs font-mono uppercase tracking-wider text-slate-900">
                  SIDE-BY-SIDE ENTITY COMPARISON
                </h2>
              </div>
              <button
                onClick={() => setReviewCandidate(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5">
              <div className="flex gap-4 flex-col sm:flex-row">
                {/* Candidate A */}
                <div className="hitl-compare-card">
                  <div className="text-[10px] font-extrabold text-sky-600 uppercase font-mono mb-1">
                    Candidate A
                  </div>
                  <h3 className="font-bold text-slate-900">{reviewCandidate.primary_name}</h3>
                  <div className="text-[10px] text-slate-500 font-mono mb-2">{reviewCandidate.primary_dept}</div>
                  <div className="space-y-0.5 text-xs font-mono text-slate-700">
                    <div className="flex items-center gap-1.5"><Phone size={11} className="text-sky-600" /> {(reviewCandidate.shared_identifiers?.phones || []).join(", ") || "—"}</div>
                    <div className="flex items-center gap-1.5"><Car size={11} className="text-amber-600" /> {(reviewCandidate.shared_identifiers?.vehicles || []).join(", ") || "—"}</div>
                    <div className="flex items-center gap-1.5"><User size={11} className="text-slate-500" /> {(reviewCandidate.primary_aliases || []).join(", ") || "—"}</div>
                  </div>
                </div>

                <div className="flex items-center justify-center text-slate-300 font-mono text-lg font-bold">⟷</div>

                {/* Candidate B */}
                <div className="hitl-compare-card">
                  <div className="text-[10px] font-extrabold text-purple-600 uppercase font-mono mb-1">
                    Candidate B
                  </div>
                  <h3 className="font-bold text-slate-900">{reviewCandidate.secondary_name}</h3>
                  <div className="text-[10px] text-slate-500 font-mono mb-2">{reviewCandidate.secondary_dept}</div>
                  <div className="space-y-0.5 text-xs font-mono text-slate-700">
                    <div className="flex items-center gap-1.5"><Phone size={11} className="text-sky-600" /> {(reviewCandidate.shared_identifiers?.phones || []).join(", ") || "—"}</div>
                    <div className="flex items-center gap-1.5"><Car size={11} className="text-amber-600" /> {(reviewCandidate.shared_identifiers?.vehicles || []).join(", ") || "—"}</div>
                    <div className="flex items-center gap-1.5"><User size={11} className="text-slate-500" /> {(reviewCandidate.secondary_aliases || []).join(", ") || "—"}</div>
                  </div>
                </div>
              </div>

              {/* Field match pills */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                {renderFieldRow("Phone", (reviewCandidate.shared_identifiers?.phones || [])[0], (reviewCandidate.shared_identifiers?.phones || [])[0])}
                {renderFieldRow("Plate", (reviewCandidate.shared_identifiers?.vehicles || [])[0], (reviewCandidate.shared_identifiers?.vehicles || [])[0])}
                {renderFieldRow("Name", reviewCandidate.primary_name, reviewCandidate.secondary_name)}
                {renderFieldRow("Dept", reviewCandidate.primary_dept, reviewCandidate.secondary_dept)}
              </div>

              {/* T2.5 — Confidence score breakdown: 4 mini progress bars */}
              <div className="mt-4">
                <div className="text-[10px] font-extrabold text-slate-500 uppercase font-mono mb-2 flex items-center gap-1.5">
                  <Sparkles size={12} /> Confidence Score Breakdown
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  {getBreakdown(reviewCandidate).map((b) => (
                    <div key={b.label}>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 mb-1">
                        <span className="font-bold">{b.label}</span>
                        <span>{Math.round(b.value * 100)}%</span>
                      </div>
                      <div className="confidence-bar-track">
                        <div className="confidence-bar-fill" style={{ width: `${Math.round(b.value * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <button
                  onClick={() => handleConfirm(reviewCandidate)}
                  disabled={isProcessing || locked}
                  title={locked ? "Locked for Analyst role" : "Confirm merge + node collapse + audit write"}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  <Check size={14} />
                  Confirm Merge
                </button>
                <button
                  onClick={() => handleReject(reviewCandidate)}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  <X size={14} />
                  Reject Match
                </button>
              </div>
              {locked && (
                <p className="mt-2 text-[11px] text-amber-600 font-mono text-center">
                  Confirm Merge is locked for the Analyst role — ask a Supervisory Officer.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
