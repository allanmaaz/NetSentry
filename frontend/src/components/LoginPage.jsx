import React, { useState } from "react";
import { Shield, UserCheck, Check, ArrowRight, Lock } from "lucide-react";
import { setStoredOfficer, setAuthToken } from "../services/api";
import NetSentryLogo from "./NetSentryLogo";

export const DEMO_PROFILES = [
  {
    role: "Analyst",
    name: "Inspector Vikram Rane",
    badge_id: "MH-CID-8841",
    rank: "Intelligence Analyst",
    station: "CID Crime Branch, Pune"
  },
  {
    role: "Supervisory Officer",
    name: "DCP Rajesh Patil",
    badge_id: "MH-IPS-1092",
    rank: "Supervisory Officer",
    station: "Zone-II, Pune Police"
  },
  {
    role: "System Admin",
    name: "Director Ananya Deshmukh",
    badge_id: "MH-DIR-0001",
    rank: "System Administrator",
    station: "State Cyber Police HQ"
  }
];

export default function LoginPage({ onLoginSuccess }) {
  const [selectedProfile, setSelectedProfile] = useState(DEMO_PROFILES[0]);
  const [officerName, setOfficerName] = useState(DEMO_PROFILES[0].name);
  const [badgeId, setBadgeId] = useState(DEMO_PROFILES[0].badge_id);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectProfile = (profile) => {
    setSelectedProfile(profile);
    setOfficerName(profile.name);
    setBadgeId(profile.badge_id);
  };

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    const officerSession = {
      name: officerName || selectedProfile.name,
      badge_id: badgeId || selectedProfile.badge_id,
      role: selectedProfile.role,
      rank: selectedProfile.rank,
      station: selectedProfile.station
    };

    setStoredOfficer(officerSession);
    setAuthToken(`token-${officerSession.badge_id}`);

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(officerSession);
    }, 300);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Bar */}
      <header className="flex items-center justify-between max-w-4xl mx-auto w-full pb-6">
        <NetSentryLogo size={32} showText={true} subtitle="Law Enforcement Grid" />
        <span className="text-xs text-slate-400 font-medium">National Police Portal</span>
      </header>

      {/* Center Card */}
      <main className="max-w-xl mx-auto w-full my-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <NetSentryLogo size={64} showText={false} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Sign In to NetSentry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Choose a quick demo profile or sign in with your badge
          </p>
        </div>

        {/* 3 Simple Profile Cards */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-slate-300 block">
            Select Officer Profile:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {DEMO_PROFILES.map((p) => {
              const isSelected = selectedProfile.role === p.role;
              return (
                <div
                  key={p.role}
                  onClick={() => handleSelectProfile(p)}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between min-h-[105px] ${
                    isSelected
                      ? "bg-slate-900 border-sky-400 ring-1 ring-sky-400/40 shadow-lg"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {p.role}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center">
                        <Check size={11} />
                      </span>
                    )}
                  </div>
                  <div className="mt-2.5">
                    <div className="font-bold text-xs sm:text-sm text-white">{p.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{p.station}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Simple Credentials Form */}
        <form onSubmit={handleLogin} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Officer Name</label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Badge ID</label>
              <input
                type="text"
                value={badgeId}
                onChange={(e) => setBadgeId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
          >
            <span>{isLoading ? "Signing In..." : "Enter Workspace"}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </main>

      {/* Simple Footer */}
      <footer className="text-center text-xs text-slate-500 max-w-4xl mx-auto w-full pt-6">
        Smart India Hackathon 2026 • Autonomous Criminal Network Intelligence
      </footer>
    </div>
  );
}
