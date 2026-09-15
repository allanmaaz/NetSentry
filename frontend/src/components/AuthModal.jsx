import React, { useState } from "react";
import { Shield, Lock, UserCheck, Key, CheckCircle2, AlertTriangle, X, ChevronRight, Fingerprint } from "lucide-react";

export const DEMO_OFFICERS = [
  {
    badge_id: "KA-CID-4109",
    name: "Ananya Hegde",
    rank: "Sub-Inspector / Field IO",
    station: "Cubbon Park PS, Bengaluru",
    state: "Karnataka",
    role: "Analyst",
    color: "sky",
    tag: "Intelligence Analyst",
    permissions: ["Read Dossiers", "Multilingual Search", "Topology Exploration"]
  },
  {
    badge_id: "MH-POL-8821",
    name: "Rajesh Patil",
    rank: "Inspector / SHO",
    station: "Bund Garden PS, Pune",
    state: "Maharashtra",
    role: "Supervisory Officer",
    color: "amber",
    tag: "Supervisory Officer",
    permissions: ["Read Dossiers", "Approve HITL Merges", "Simulate Arrests", "Ingest FIRs"]
  },
  {
    badge_id: "NCRB-DIR-0001",
    name: "Dr. Vikramaditya Sharma, IPS",
    rank: "Special Task Force Director",
    station: "NCRB HQ, New Delhi",
    state: "National Grid",
    role: "System Admin",
    color: "purple",
    tag: "System Admin",
    permissions: ["Full Override", "Section 65B Export", "Cross-State Sync", "All Permissions"]
  }
];

export default function AuthModal({ isOpen, onClose, currentOfficer, onSelectOfficer }) {
  const [badgeInput, setBadgeInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleManualLogin = (e) => {
    e.preventDefault();
    setErrorMsg("");
    const matched = DEMO_OFFICERS.find(
      (o) => o.badge_id.toLowerCase() === badgeInput.trim().toLowerCase()
    );

    if (matched && pinInput === "1234") {
      setIsSuccess(true);
      setTimeout(() => {
        onSelectOfficer(matched);
        setIsSuccess(false);
        onClose();
      }, 600);
    } else {
      setErrorMsg("Invalid Officer Badge ID or PIN. (Hint: Use 1234 or click a quick persona below).");
    }
  };

  const handleQuickSwitch = (officer) => {
    onSelectOfficer(officer);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden text-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 flex items-center justify-center shadow-md font-bold">
              <Shield size={22} className="text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">
                  SOVEREIGN OFFICER ACCESS CONTROL (RBAC)
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  JWT ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Central Law Enforcement Identity & Cryptographic Token Authority
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Active Officer Identity Card */}
          {currentOfficer && (
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-200 border border-slate-600">
                  <UserCheck size={20} className="text-amber-400" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">LOGGED IN OFFICER:</span>
                  <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    {currentOfficer.rank} {currentOfficer.name}
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-700 text-amber-300 border border-amber-500/30">
                      {currentOfficer.role}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Badge: <strong className="text-slate-300">{currentOfficer.badge_id}</strong> • {currentOfficer.station}
                  </div>
                </div>
              </div>
              <div className="text-right text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={14} /> ACTIVE
              </div>
            </div>
          )}

          {/* Quick Demo Personas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
                <Fingerprint size={14} className="text-sky-400" />
                1-CLICK DEMO PERSONA SWITCHER (SIH EVALUATION)
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Live Role Switching</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DEMO_OFFICERS.map((officer) => {
                const isSelected = currentOfficer?.badge_id === officer.badge_id;
                const borderClass =
                  officer.color === "purple"
                    ? "hover:border-purple-500/60 border-slate-700"
                    : officer.color === "sky"
                    ? "hover:border-sky-500/60 border-slate-700"
                    : "hover:border-amber-500/60 border-slate-700";

                return (
                  <button
                    key={officer.badge_id}
                    onClick={() => handleQuickSwitch(officer)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between group cursor-pointer ${borderClass} ${
                      isSelected ? "bg-slate-800 border-amber-400 ring-1 ring-amber-400/40" : "bg-slate-950/60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          officer.role === "System Admin" || officer.role === "SUPER_ADMIN" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" :
                          officer.role === "Supervisory Officer" || officer.role === "STATION_ADMIN" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                          "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                        }`}>
                          {officer.tag}
                        </span>
                        {isSelected && <CheckCircle2 size={14} className="text-amber-400" />}
                      </div>
                      <div className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition">
                        {officer.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {officer.rank}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono mt-1 line-clamp-1">
                        {officer.station}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                      <span>{officer.badge_id}</span>
                      <ChevronRight size={12} className="group-hover:translate-x-0.5 transition" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manual Credential Verification Form */}
          <div className="pt-3 border-t border-slate-800">
            <h4 className="text-xs font-mono text-slate-400 mb-3 flex items-center gap-1.5">
              <Lock size={13} className="text-slate-400" />
              MANUAL BADGE AUTHENTICATION (CCTNS / ICJS SSO)
            </h4>

            {errorMsg && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-center gap-2">
                <AlertTriangle size={14} />
                {errorMsg}
              </div>
            )}

            {isSuccess && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 size={14} />
                Authentication successful. Generating cryptographic officer session...
              </div>
            )}

            <form onSubmit={handleManualLogin} className="space-y-3">
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    OFFICER BADGE ID
                  </label>
                  <input
                    type="text"
                    value={badgeInput}
                    onChange={(e) => setBadgeInput(e.target.value)}
                    placeholder="e.g. MH-POL-8821"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    SECURITY PIN (DEMO: 1234)
                  </label>
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="••••"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
              >
                <Key size={14} />
                VERIFY CREDENTIALS & ISSUE BEARER TOKEN
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
