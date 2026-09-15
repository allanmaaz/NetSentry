import React, { useState } from "react";
import { Check, X, ChevronUp, ChevronDown, Phone, Car, Scale, ShieldCheck } from "lucide-react";

export default function HITLReviewQueue({
  candidates,
  onResolve,
  isProcessing,
  currentOfficer,
  onOpenAuthModal,
  userRole = null
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [reviewCandidate, setReviewCandidate] = useState(null);

  if (!candidates || candidates.length === 0) return null;

  const isAnalyst = currentOfficer?.role === "Analyst" || userRole === "Analyst";

  const handleConfirm = (cand) => {
    onResolve(cand.candidate_id, "MERGE");
    setReviewCandidate(null);
  };

  const handleReject = (cand) => {
    onResolve(cand.candidate_id, "REJECT");
    setReviewCandidate(null);
  };

  return (
    <>
      <div className="absolute bottom-3 left-3 right-3 sm:left-6 sm:right-6 max-w-3xl mx-auto z-20 transition-all duration-200">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
          {/* Dock Header */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-950 text-white text-xs font-semibold hover:bg-slate-900 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-amber-400" />
              <span className="font-bold">Suspect Identity Match Alert</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                {candidates.length} to review
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <span>{isExpanded ? "Hide" : "Show"}</span>
              {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </div>
          </button>

          {/* List of Candidates */}
          {isExpanded && (
            <div className="p-3 space-y-2.5 max-h-60 overflow-y-auto bg-slate-900/50">
              {candidates.map((cand) => {
                const scorePct = Math.round(cand.confidence_score * 100);
                const phone = cand.shared_identifiers?.phones?.[0];
                const vehicle = cand.shared_identifiers?.vehicles?.[0];

                return (
                  <div
                    key={cand.candidate_id}
                    className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    {/* Left: Entities */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 font-bold text-white text-sm">
                        <span>{cand.primary_name}</span>
                        <span className="text-slate-500 font-normal">⟷</span>
                        <span>{cand.secondary_name}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {scorePct}% Match
                        </span>
                      </div>

                      {/* Shared Evidence Chips */}
                      <div className="flex flex-wrap gap-2 pt-0.5 text-xs">
                        {phone && (
                          <span className="inline-flex items-center gap-1 text-sky-400 font-mono">
                            <Phone size={11} /> {phone}
                          </span>
                        )}
                        {vehicle && (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-mono">
                            <Car size={11} /> {vehicle}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setReviewCandidate(cand)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
                      >
                        Compare
                      </button>

                      {isAnalyst ? (
                        <button
                          onClick={onOpenAuthModal}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition cursor-pointer"
                        >
                          Merge (Supervisor)
                        </button>
                      ) : (
                        <button
                          onClick={() => handleConfirm(cand)}
                          disabled={isProcessing}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Check size={13} />
                          Confirm Merge
                        </button>
                      )}

                      <button
                        onClick={() => handleReject(cand)}
                        disabled={isProcessing}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                        title="Keep Separate"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Side-by-side Review Modal */}
      {reviewCandidate && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 max-w-xl w-full overflow-hidden text-slate-100">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Scale size={18} className="text-amber-400" />
                <h3 className="font-bold text-sm text-white">Compare Suspect Records</h3>
              </div>
              <button
                onClick={() => setReviewCandidate(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Candidate A */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-sky-400 uppercase">Record 1</span>
                  <div className="font-bold text-sm text-white">{reviewCandidate.primary_name}</div>
                  <div className="text-xs text-slate-400">{reviewCandidate.primary_dept}</div>
                </div>

                {/* Candidate B */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-purple-400 uppercase">Record 2</span>
                  <div className="font-bold text-sm text-white">{reviewCandidate.secondary_name}</div>
                  <div className="text-xs text-slate-400">{reviewCandidate.secondary_dept}</div>
                </div>
              </div>

              {/* Shared Evidence Summary */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300">Matching Identifiers:</div>
                <div className="space-y-1.5 text-xs font-mono">
                  {reviewCandidate.shared_identifiers?.phones?.[0] && (
                    <div className="flex items-center justify-between text-sky-400">
                      <span className="flex items-center gap-1.5"><Phone size={13} /> Same Phone</span>
                      <span>{reviewCandidate.shared_identifiers.phones[0]}</span>
                    </div>
                  )}
                  {reviewCandidate.shared_identifiers?.vehicles?.[0] && (
                    <div className="flex items-center justify-between text-amber-400">
                      <span className="flex items-center gap-1.5"><Car size={13} /> Same Vehicle</span>
                      <span>{reviewCandidate.shared_identifiers.vehicles[0]}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                {isAnalyst ? (
                  <button
                    onClick={() => {
                      setReviewCandidate(null);
                      if (onOpenAuthModal) onOpenAuthModal();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold cursor-pointer"
                  >
                    Switch to Supervisor to Merge
                  </button>
                ) : (
                  <button
                    onClick={() => handleConfirm(reviewCandidate)}
                    disabled={isProcessing}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Check size={16} />
                    Confirm Merge
                  </button>
                )}
                <button
                  onClick={() => handleReject(reviewCandidate)}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Keep Separate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
