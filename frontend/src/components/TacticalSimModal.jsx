import React from "react";
import { X, ShieldAlert, GitFork, Target, AlertOctagon, CheckCircle2 } from "lucide-react";

export default function TacticalSimModal({
  result,
  isOpen,
  onClose,
  onApplyNeutralize,
  isNeutralized
}) {
  if (!isOpen || !result) return null;

  const { neutralized_target, metrics, tactical_assessment } = result;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-red-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-red-600" />
            <h2 className="font-bold text-xs font-mono uppercase tracking-wider text-red-900">
              TACTICAL ARREST IMPACT SIMULATION
            </h2>

          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-white transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Target Banner */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
                SIMULATED TARGET FOR ARREST
              </span>
              <span className="text-base font-extrabold text-slate-900">
                {neutralized_target?.name}
              </span>
            </div>
            <span className="text-xs font-mono uppercase font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
              {neutralized_target?.former_role} ROLE
            </span>
          </div>

          {/* Impact Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-red-50/50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-1 text-red-600 mb-1">
                <AlertOctagon size={13} />
                <span className="text-[10px] uppercase font-bold">FRAGMENTATION</span>
              </div>
              <div className="text-2xl font-extrabold text-red-700">
                {metrics?.network_fragmentation_pct}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Syndicate Capacity Drop</div>
            </div>

            <div className="p-3 bg-purple-50/50 border border-purple-200 rounded-xl">
              <div className="flex items-center gap-1 text-purple-600 mb-1">
                <GitFork size={13} />
                <span className="text-[10px] uppercase font-bold">ISOLATED CELLS</span>
              </div>
              <div className="text-2xl font-extrabold text-purple-700">
                {metrics?.components_after}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Disjoint Groups</div>
            </div>
          </div>

          {/* Successor Leadership */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold mb-1">
              <Target size={14} className="text-amber-600" />
              <span>SECONDARY BOTTLENECK SUCCESSOR</span>
            </div>
            <div className="text-slate-900 font-bold text-sm">
              {metrics?.secondary_successor || "None (Network Decapitated)"}
            </div>
          </div>

          {/* Tactical Assessment */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed italic">
            "{tactical_assessment}"
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            Dismiss
          </button>
          <button
            onClick={() => {
              onApplyNeutralize(neutralized_target?.id);
              onClose();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isNeutralized
                ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                : "bg-red-600 hover:bg-red-700 text-white shadow-sm"
            }`}
          >
            {isNeutralized ? (
              <>
                <CheckCircle2 size={14} /> Restore Suspect to Canvas
              </>
            ) : (
              <>
                <AlertOctagon size={14} /> Confirm Tactical Removal
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
