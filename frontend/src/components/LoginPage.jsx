import React, { useState } from "react";
import { Shield, Lock, Key, CheckCircle2, AlertTriangle, Fingerprint, ChevronRight, Eye, EyeOff, UserCheck } from "lucide-react";
import { loginOfficer, setStoredOfficer, setAuthToken } from "../services/api";

export const DESIGNATED_OFFICERS = [
  {
    badge_id: "MH-POL-8821",
    pin: "1234",
    name: "Rajesh Patil",
    rank: "Inspector / Station House Officer (SHO)",
    station: "Bund Garden PS, Pune",
    state: "Maharashtra",
    role: "STATION_ADMIN",
    roleTitle: "Station Admin",
    accent: "amber",
    description: "Can ingest FIRs, approve HITL syndicate merges, and run arrest impact simulations.",
    badgeColor: "from-amber-500 to-amber-700",
    borderClass: "border-amber-500/40 hover:border-amber-400 bg-slate-900/80 hover:bg-slate-800/90",
    badgePill: "bg-amber-500/20 text-amber-300 border-amber-500/30"
  },
  {
    badge_id: "KA-CID-4109",
    pin: "1234",
    name: "Ananya Hegde",
    rank: "Sub-Inspector / Field IO",
    station: "Cubbon Park PS, Bengaluru",
    state: "Karnataka",
    role: "FIELD_INVESTIGATOR",
    roleTitle: "Field Investigator",
    accent: "sky",
    description: "Specialized in field surveillance, multilingual search, and deep criminal dossier inspection.",
    badgeColor: "from-sky-500 to-sky-700",
    borderClass: "border-sky-500/40 hover:border-sky-400 bg-slate-900/80 hover:bg-slate-800/90",
    badgePill: "bg-sky-500/20 text-sky-300 border-sky-500/30"
  },
  {
    badge_id: "NCRB-DIR-0001",
    pin: "1234",
    name: "Dr. Vikramaditya Sharma, IPS",
    rank: "Special Task Force Director",
    station: "NCRB HQ, New Delhi",
    state: "National Crime Grid",
    role: "SUPER_ADMIN",
    roleTitle: "Super Admin",
    accent: "purple",
    description: "Unrestricted national jurisdiction with full database synchronization and Section 65B forensic export.",
    badgeColor: "from-purple-500 to-purple-700",
    borderClass: "border-purple-500/40 hover:border-purple-400 bg-slate-900/80 hover:bg-slate-800/90",
    badgePill: "bg-purple-500/20 text-purple-300 border-purple-500/30"
  }
];

export default function LoginPage({ onLoginSuccess }) {
  const [badgeId, setBadgeId] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successOfficer, setSuccessOfficer] = useState(null);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!badgeId.trim() || !pin.trim()) {
      setErrorMsg("Please enter both Officer Badge ID and Security PIN.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      // Try backend authentication
      const result = await loginOfficer(badgeId.trim().toUpperCase(), pin.trim());
      if (result && result.officer) {
        setSuccessOfficer(result.officer);
        setTimeout(() => {
          onLoginSuccess(result.officer);
        }, 600);
        return;
      }
    } catch (err) {
      // Backend offline or error -> check designated officers
    }

    // Offline / Local designated officer check
    const matched = DESIGNATED_OFFICERS.find(
      (o) => o.badge_id.toLowerCase() === badgeId.trim().toLowerCase()
    );

    if (matched && pin.trim() === matched.pin) {
      setSuccessOfficer(matched);
      setStoredOfficer(matched);
      setAuthToken(`mock-token-${matched.badge_id}`);
      setTimeout(() => {
        onLoginSuccess(matched);
      }, 600);
    } else {
      setIsLoading(false);
      setErrorMsg("Authentication Failed: Invalid Badge ID or PIN. (Default PIN: 1234)");
    }
  };

  const handleQuickLogin = async (officer) => {
    setIsLoading(true);
    setErrorMsg("");
    setSuccessOfficer(officer);

    try {
      const result = await loginOfficer(officer.badge_id, officer.pin);
      if (result && result.officer) {
        setTimeout(() => onLoginSuccess(result.officer), 400);
        return;
      }
    } catch (err) {}

    // Fallback to local offline session
    setStoredOfficer(officer);
    setAuthToken(`mock-token-${officer.badge_id}`);
    setTimeout(() => {
      onLoginSuccess(officer);
    }, 400);
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Background Subtle Cyber Security Grid Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Security Header Strip */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 flex items-center justify-center font-black shadow-md">
            <Shield size={18} className="text-slate-950" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold tracking-widest text-slate-200">
              MINISTRY OF HOME AFFAIRS • NCRB NATIONAL GRID
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              SMART INDIA HACKATHON 2026 // PS ID: 26189
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          AIR-GAPPED SOVEREIGN GRID
        </div>
      </header>

      {/* Central Login Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Panel: Welcome, Legal Warning & Manual Login Form */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-bold uppercase mb-3">
                <Lock size={12} /> RESTRICTED LAW ENFORCEMENT ACCESS
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white mb-2">
                NETSENTRY GATEWAY
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mb-6">
                Autonomous Criminal Network Intelligence System. Authenticate using your departmental service credentials to access the cross-jurisdiction graph.
              </p>

              {/* Error Message Alert */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2.5 animate-in fade-in duration-150">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Message Alert */}
              {successOfficer && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2.5 animate-in fade-in duration-150">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>Authenticated: {successOfficer.rank} {successOfficer.name}. Entering Grid...</span>
                </div>
              )}

              {/* Manual Login Form */}
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    OFFICER SERVICE BADGE ID
                  </label>
                  <input
                    type="text"
                    value={badgeId}
                    onChange={(e) => setBadgeId(e.target.value)}
                    placeholder="e.g. MH-POL-8821"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    SECURITY PIN (DEMO: 1234)
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? "text" : "password"}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                    >
                      {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
                >
                  <Key size={15} />
                  <span>{isLoading ? "AUTHENTICATING SESSION..." : "VERIFY BADGE & ENTER GRID"}</span>
                </button>
              </form>
            </div>

            {/* Statutory Compliance Footer */}
            <div className="pt-6 mt-6 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>Section 65B IEA & BSA 2023 Compliant</span>
              <span>256-Bit HS256 JWT</span>
            </div>
          </div>

          {/* Right Panel: Evaluator 1-Click Designated Officer Selection */}
          <div className="lg:col-span-6 p-6 sm:p-8 bg-slate-950/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Fingerprint size={16} className="text-amber-400" />
                  <h2 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                    SIH EVALUATOR QUICK ACCESS
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-slate-500">1-Click Role Login</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans mb-4">
                Click any designated officer below to instantly authenticate and evaluate how NetSentry's Role-Based Access Controls (RBAC) adapt in real time:
              </p>

              {/* Designated Officer Cards */}
              <div className="space-y-3">
                {DESIGNATED_OFFICERS.map((officer) => (
                  <button
                    key={officer.badge_id}
                    onClick={() => handleQuickLogin(officer)}
                    disabled={isLoading}
                    className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between group cursor-pointer ${officer.borderClass}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${officer.badgeColor} text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-sm mt-0.5`}>
                        <UserCheck size={18} className="text-slate-950" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition">
                            {officer.name}
                          </span>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${officer.badgePill}`}>
                            {officer.roleTitle}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {officer.rank} • {officer.station}
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1 font-sans pt-0.5">
                          {officer.description}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition">
                      <ChevronRight size={16} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Demo Credentials Info */}
            <div className="mt-6 p-3 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span>DEMO PIN FOR ALL OFFICERS: <strong className="text-amber-400">1234</strong></span>
              <span className="text-slate-500">CCTNS / ICJS SSO</span>
            </div>
          </div>

        </div>
      </main>

      {/* Bottom Footer Notice */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-2.5 text-center text-[11px] font-mono text-slate-500">
        CONFIDENTIAL & PROPRIETARY // FOR LAW ENFORCEMENT & JUDICIAL AGENCIES ONLY • SMART INDIA HACKATHON 2026
      </footer>
    </div>
  );
}
