import React, { useState } from "react";
import { Shield, User, Eye, Crown, Settings, LogIn } from "lucide-react";

// T3.2 — RBAC officer login: 3 role cards → sessionStorage → top-bar badge
const ROLES = [
  {
    key: "Analyst",
    icon: Eye,
    desc: "View intelligence graph, run searches. HITL merge & 65B export locked.",
    locked: true
  },
  {
    key: "Supervisory Officer",
    icon: User,
    desc: "Full adjudication rights. Confirm merges, export court dossiers.",
    locked: false
  },
  {
    key: "System Admin",
    icon: Settings,
    desc: "All rights + dataset reload, schema config and audit export.",
    locked: false
  }
];

export default function LoginOverlay({ onLogin }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Supervisory Officer");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!name.trim()) {
      setError("Please enter your officer name to proceed.");
      return;
    }
    const officer = { name: name.trim(), role };
    try {
      sessionStorage.setItem("netsentry_officer", JSON.stringify(officer));
    } catch (e) {
      console.warn("sessionStorage unavailable:", e);
    }
    if (onLogin) onLogin(officer);
  };

  return (
    <div className="login-overlay">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-8 animate-fadeIn">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Shield size={22} className="text-sky-400" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 font-mono">NETSENTRY</h1>
            <p className="text-xs text-slate-500">Restricted Law-Enforcement Access • Section 65B Audit Enforced</p>
          </div>
        </div>

        <div className="mt-5">
          <label className="text-xs font-bold text-slate-600 uppercase font-mono block mb-1.5">
            Officer Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="e.g. Insp. A. Sharma"
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition"
          />
        </div>

        <div className="mt-4">
          <label className="text-xs font-bold text-slate-600 uppercase font-mono block mb-2">
            Select Role
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const selected = role === r.key;
              return (
                <div
                  key={r.key}
                  onClick={() => setRole(r.key)}
                  className={`role-card ${selected ? "selected" : ""}`}
                >
                  <Icon size={22} className="mx-auto text-slate-800" />
                  <div className="mt-2 text-xs font-extrabold text-slate-900">{r.key}</div>
                  <div className="mt-1 text-[10px] text-slate-500 leading-snug">{r.desc}</div>
                  {selected && (
                    <div className="mt-2 text-[10px] font-bold text-emerald-600 font-mono">● SELECTED</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mt-3 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition"
        >
          <LogIn size={15} />
          Authenticate & Enter Workspace
        </button>
        <p className="mt-3 text-[10px] text-slate-400 text-center font-mono">
          Every action after login is written to the immutable Section 65B audit trail.
        </p>
      </div>
    </div>
  );
}
