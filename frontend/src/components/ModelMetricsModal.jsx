import React from "react";
import { X, Award, CheckCircle2, Shield, Phone, Car, User, Sparkles } from "lucide-react";

export default function ModelMetricsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const factors = [
    {
      icon: Phone,
      title: "Shared Phone Numbers",
      weight: 35.2,
      desc: "Direct call intercepts, shared SIMs, or common contacts across state borders",
      color: "bg-sky-500",
      textColor: "text-sky-400"
    },
    {
      icon: User,
      title: "Name Sound & Regional Spelling",
      weight: 26.1,
      desc: "Matches names pronounced the same across Hindi, Marathi, and Kannada scripts",
      color: "bg-amber-500",
      textColor: "text-amber-400"
    },
    {
      icon: Car,
      title: "Shared Vehicles & Transport",
      weight: 18.4,
      desc: "Vehicle registration plates scanned at toll plazas and border checkpoints",
      color: "bg-purple-500",
      textColor: "text-purple-400"
    },
    {
      icon: Shield,
      title: "Name Order & Word Permutations",
      weight: 11.8,
      desc: "Recognizes flipped first/last names (e.g. 'Abdul Karim' vs 'Karim Abdul')",
      color: "bg-emerald-500",
      textColor: "text-emerald-400"
    },
    {
      icon: Sparkles,
      title: "Street Nicknames & Aliases",
      weight: 8.5,
      desc: "Common underworld aliases and known moniker correlations",
      color: "bg-rose-500",
      textColor: "text-rose-400"
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold">
              <Award size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">
                AI Accuracy & Intelligence
              </h2>
              <p className="text-xs text-slate-400">
                How NetSentry links suspects, phone intercepts, and alias records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* Top Score Banner */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Overall Model Performance
              </span>
              <div className="text-2xl font-black text-white mt-0.5">
                99.4% <span className="text-xs text-emerald-400 font-normal">Match Accuracy</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Trained on 20,000 documented Indian police chargesheet records
              </p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs">
                Zero Blind Merges
              </span>
            </div>
          </div>

          {/* Feature Importance Breakdown */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-slate-300 block">
              How the AI Decides Suspect Matches:
            </label>

            {factors.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className={f.textColor} />
                      <span className="font-bold text-white">{f.title}</span>
                    </div>
                    <span className="font-bold text-slate-300 font-mono">
                      {f.weight}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {f.desc}
                  </p>
                  <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${f.color} rounded-full`}
                      style={{ width: `${f.weight * 2.5}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Verification Stats */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Verification Results (Test Benchmark)
            </span>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-base font-bold text-emerald-400 block">623</span>
                <span className="text-[10px] text-slate-400">Correct Suspect Matches</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-base font-bold text-sky-400 block">617</span>
                <span className="text-[10px] text-slate-400">Distinct Suspects Preserved</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Human-in-the-loop review protects all decisions</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
