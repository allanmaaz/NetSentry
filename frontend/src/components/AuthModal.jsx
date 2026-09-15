import React, { useState } from "react";
import { User, Shield, Check, X, LogIn } from "lucide-react";

export const DEMO_OFFICERS = [
  {
    badge_id: "KA-CID-4109",
    name: "Ananya Hegde",
    rank: "Sub-Inspector",
    station: "Bengaluru Police",
    state: "Karnataka",
    role: "Analyst",
    color: "sky",
    tag: "Analyst"
  },
  {
    badge_id: "MH-POL-8821",
    name: "Rajesh Patil",
    rank: "Inspector",
    station: "Pune Police",
    state: "Maharashtra",
    role: "Supervisory Officer",
    color: "amber",
    tag: "Supervisor"
  },
  {
    badge_id: "NCRB-DIR-0001",
    name: "Dr. V. Sharma, IPS",
    rank: "Director",
    station: "NCRB New Delhi",
    state: "National Grid",
    role: "System Admin",
    color: "purple",
    tag: "Admin"
  }
];

export default function AuthModal({ isOpen, onClose, currentOfficer, onSelectOfficer }) {
  const [badgeInput, setBadgeInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleManualLogin = (e) => {
    e.preventDefault();
    setErrorMsg("");
    const matched = DEMO_OFFICERS.find(
      (o) => o.badge_id.toLowerCase() === badgeInput.trim().toLowerCase()
    );

    if (matched && pinInput === "1234") {
      onSelectOfficer(matched);
      onClose();
    } else {
      setErrorMsg("Incorrect badge or PIN. (Hint: PIN is 1234 or tap a profile above)");
    }
  };

  const handleQuickSwitch = (officer) => {
    onSelectOfficer(officer);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-100 flex flex-col">
        {/* Simple Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
              <Shield size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Officer Profile</h2>
              <p className="text-xs text-slate-400">Switch profile or sign in with badge</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Active Profile */}
          {currentOfficer && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                  <User size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    {currentOfficer.name}
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-sky-500/10 text-sky-300 border border-sky-500/20">
                      {currentOfficer.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {currentOfficer.rank} • {currentOfficer.station}
                  </div>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <Check size={14} /> Active
              </span>
            </div>
          )}

          {/* 3 Quick Profiles */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Tap to Switch Officer:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {DEMO_OFFICERS.map((officer) => {
                const isSelected = currentOfficer?.badge_id === officer.badge_id;
                return (
                  <button
                    key={officer.badge_id}
                    onClick={() => handleQuickSwitch(officer)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between min-h-[90px] cursor-pointer ${
                      isSelected
                        ? "bg-slate-800 border-sky-400 ring-1 ring-sky-400/30"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {officer.tag}
                      </span>
                      {isSelected && <Check size={14} className="text-sky-400" />}
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-bold text-white">{officer.name}</div>
                      <div className="text-[11px] text-slate-400">{officer.station}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Simple Sign In */}
          <div className="pt-4 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300 block mb-2.5">
              Or Sign In With Badge ID:
            </label>

            {errorMsg && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleManualLogin} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={badgeInput}
                  onChange={(e) => setBadgeInput(e.target.value)}
                  placeholder="Badge ID (e.g. MH-POL-8821)"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="PIN (1234)"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogIn size={15} />
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
