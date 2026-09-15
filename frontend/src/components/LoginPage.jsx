import React, { useState } from "react";
import {
  Shield,
  Lock,
  UserCheck,
  ChevronRight,
  Fingerprint,
  Building2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles
} from "lucide-react";
import { setStoredOfficer, setAuthToken } from "../services/api";

export const ROLE_DEFINITIONS = [
  {
    role: "Analyst",
    title: "Intelligence Analyst",
    level: "Tier 1 Clearance",
    badgeColor: "from-sky-500 to-sky-700",
    borderClass: "border-sky-500/40 hover:border-sky-400 bg-slate-900/90",
    selectedClass: "border-sky-400 ring-2 ring-sky-500/40 bg-sky-950/40",
    badgePill: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    accentText: "text-sky-400",
    description: "Read-heavy investigative access. Analyze network topology, query records, inspect dossiers, and review cross-border ties.",
    restrictions: "Restricted: Cannot approve HITL entity merges or sign Sec. 65B forensic export certificates.",
    defaultName: "Ananya Hegde",
    defaultRank: "Sub-Inspector / Field IO",
    defaultStation: "Cubbon Park PS, Bengaluru",
    defaultState: "Karnataka",
    badgeId: "KA-CID-4109"
  },
  {
    role: "Supervisory Officer",
    title: "Supervisory Officer (SHO / ACP)",
    level: "Tier 2 Clearance",
    badgeColor: "from-amber-500 to-amber-700",
    borderClass: "border-amber-500/40 hover:border-amber-400 bg-slate-900/90",
    selectedClass: "border-amber-400 ring-2 ring-amber-500/40 bg-amber-950/40",
    badgePill: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    accentText: "text-amber-400",
    description: "Station command authority. Authorized to adjudicate HITL identity merges, sanction tactical arrest impact runs, and oversee operations.",
    restrictions: "Full operational authority across registered FIRs and multi-state syndicates.",
    defaultName: "Rajesh Patil",
    defaultRank: "Inspector / SHO",
    defaultStation: "Bund Garden PS, Pune",
    defaultState: "Maharashtra",
    badgeId: "MH-POL-8821"
  },
  {
    role: "System Admin",
    title: "System Administrator (Director)",
    level: "Tier 3 Clearance",
    badgeColor: "from-purple-500 to-purple-700",
    borderClass: "border-purple-500/40 hover:border-purple-400 bg-slate-900/90",
    selectedClass: "border-purple-400 ring-2 ring-purple-500/40 bg-purple-950/40",
    badgePill: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    accentText: "text-purple-400",
    description: "Unrestricted sovereign grid clearance. Cross-state database sync, forensic Section 65B legal export stamping, and ontology management.",
    restrictions: "Unrestricted national grid master clearance.",
    defaultName: "Dr. Vikramaditya Sharma, IPS",
    defaultRank: "Special Task Force Director",
    defaultStation: "NCRB HQ, New Delhi",
    defaultState: "National Crime Grid",
    badgeId: "NCRB-DIR-0001"
  }
];

export default function LoginPage({ onLoginSuccess }) {
  const [officerName, setOfficerName] = useState("Rajesh Patil");
  const [selectedRole, setSelectedRole] = useState("Supervisory Officer");
  const [badgeId, setBadgeId] = useState("MH-POL-8821");
  const [station, setStation] = useState("Bund Garden PS, Pune");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRoleSelect = (roleDef) => {
    setSelectedRole(roleDef.role);
    setOfficerName(roleDef.defaultName);
    setBadgeId(roleDef.badgeId);
    setStation(roleDef.defaultStation);
    setErrorMsg("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!officerName.trim()) {
      setErrorMsg("Please enter an Officer Name before entering the command grid.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    const roleDef = ROLE_DEFINITIONS.find((r) => r.role === selectedRole) || ROLE_DEFINITIONS[0];

    const officerSession = {
      name: officerName.trim(),
      role: selectedRole, // "Analyst" | "Supervisory Officer" | "System Admin"
      rank: roleDef.defaultRank,
      badge_id: badgeId.trim() || `OFF-${Math.floor(1000 + Math.random() * 9000)}`,
      station: station.trim() || roleDef.defaultStation,
      state: roleDef.defaultState,
      authenticated_at: new Date().toISOString()
    };

    // Store in sessionStorage (and persistent fallback)
    setStoredOfficer(officerSession);
    setAuthToken(`netsentry-token-${officerSession.badge_id}`);

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(officerSession);
    }, 400);
  };

  const activeDef = ROLE_DEFINITIONS.find((r) => r.role === selectedRole) || ROLE_DEFINITIONS[0];

  return (
    <div className="relative w-screen h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-y-auto select-none font-sans">
      {/* Background Ambience & Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(59,130,246,0.18),transparent_80%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Banner */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-slate-800/80 backdrop-blur-md bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wider font-mono uppercase text-white">NetSentry</span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-mono text-indigo-300 font-bold">SOVEREIGN v2.0</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Central Law Enforcement Knowledge Graph & Syndicate Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            BSA Section 65B Audit Compliant
          </span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 my-auto">
        <div className="w-full max-w-4xl bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
              <Fingerprint size={14} className="text-sky-400" />
              Role-Based Access Control (RBAC) Gateway
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
              OFFICER AUTHENTICATION & CREDENTIALING
            </h1>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Select your assigned law enforcement clearance profile and provide officer identification to initialize the multi-jurisdiction graph workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 3 Role Selection Cards */}
            <div>
              <label className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider block mb-2.5">
                Select Operational Role Clearance:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ROLE_DEFINITIONS.map((def) => {
                  const isSelected = selectedRole === def.role;
                  return (
                    <div
                      key={def.role}
                      onClick={() => handleRoleSelect(def)}
                      className={`cursor-pointer rounded-2xl p-4.5 border transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                        isSelected ? def.selectedClass : def.borderClass
                      }`}
                    >
                      {/* Selection Glow Bar */}
                      {isSelected && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400" />
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${def.badgePill}`}>
                            {def.level}
                          </span>
                          {isSelected && <CheckCircle2 size={16} className={def.accentText} />}
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-white font-mono">{def.title}</h3>
                          <span className={`text-xs font-semibold ${def.accentText}`}>{def.role}</span>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {def.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
                        {def.restrictions}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Officer Name & Badge Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
              <div>
                <label className="text-xs font-mono font-semibold text-slate-300 block mb-1.5 uppercase">
                  Officer Full Name: <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  placeholder="e.g. Rajesh Patil"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-semibold text-slate-300 block mb-1.5 uppercase">
                  Police Badge / IO ID:
                </label>
                <input
                  type="text"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  placeholder="e.g. MH-POL-8821"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition"
                />
              </div>
            </div>

            {/* Quick Demo Pre-fill Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-[11px]">Quick Pre-fills:</span>
              {ROLE_DEFINITIONS.map((def) => (
                <button
                  type="button"
                  key={def.defaultName}
                  onClick={() => handleRoleSelect(def)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition text-[11px]"
                >
                  {def.defaultName} ({def.role})
                </button>
              ))}
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition duration-150 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authorizing Clearance Session...</span>
                </>
              ) : (
                <>
                  <Lock size={15} />
                  <span>Authorize & Enter Command Grid as {selectedRole}</span>
                  <ChevronRight size={15} />
                </>
              )}
            </button>
          </form>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-8 border-t border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono">
        <div>
          Official Law Enforcement Portal • NetSentry Sovereign Grid
        </div>
        <div className="flex items-center gap-3">
          <span>Confidential // Restricted Access</span>
          <span>•</span>
          <span>SIH 2026 Problem 26189</span>
        </div>
      </footer>
    </div>
  );
}
