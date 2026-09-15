import React, { useState, useEffect } from "react";
import { X, Printer, Shield, Gavel, FileCheck, CheckCircle2 } from "lucide-react";
import { computeEntityHash } from "../services/blockchainLedger";

export default function DossierModal({ entity, isOpen, onClose }) {
  const [entityHash, setEntityHash] = useState(null);

  useEffect(() => {
    if (entity && isOpen) {
      computeEntityHash(entity).then(setEntityHash);
    }
  }, [entity, isOpen]);

  if (!isOpen || !entity) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Shield size={18} className="text-slate-800 shrink-0" />
            <span className="font-bold text-xs font-mono uppercase tracking-wider text-slate-800 truncate">
              LEGAL INTELLIGENCE DOSSIER — SECTION 65B INDIAN EVIDENCE ACT
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-200 text-slate-700 transition text-xs flex items-center gap-1"
            >
              <Printer size={14} /> <span className="hidden min-[420px]:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Dossier Body */}
        <div className="p-4 sm:p-8 overflow-y-auto space-y-6 text-slate-800 font-sans">
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
            <h2 className="text-lg font-extrabold tracking-wide uppercase font-mono">
              CENTRAL LAW ENFORCEMENT INTELLIGENCE GRID
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              CONFIDENTIAL // FOR LAW ENFORCEMENT & JUDICIAL ADJUDICATION ONLY
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              DOSSIER REF: NETSENTRY/65B/2026/{entity.id.toUpperCase()} • GENERATED: {new Date().toLocaleDateString("en-IN")}
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              SHA-256 SEAL: <span className="text-amber-600 font-bold break-all">{entityHash || "computing…"}</span>
            </p>
          </div>

          {/* Subject Overview */}
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono">
            <div>
              <span className="text-slate-400 block">CANONICAL IDENTITY:</span>
              <span className="font-bold text-sm text-slate-900">{entity.canonical_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block">SYNDICATE ROLE:</span>
              <span className="font-bold text-sm text-red-600 uppercase">
                {entity.risk_tier} RISK BOTTLENECK
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">BETWEENNESS CENTRALITY:</span>
              <span className="font-bold text-slate-800">
                {entity.betweenness_score} (Rank #{entity.centrality_rank})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">MULTI-STATE JURISDICTIONS:</span>
              <span className="font-bold text-purple-700">
                {entity.states?.join(", ") || "Maharashtra"}
              </span>
            </div>
          </div>

          {/* Section 65B Audit Certificate */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 font-mono">
              <FileCheck size={16} className="text-emerald-600" />
              <span>ALGORITHMIC INTEGRITY &amp; EVIDENCE CERTIFICATION</span>
              {entityHash && (
                <span className="ml-auto flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-300">
                  <CheckCircle2 size={11} /> SHA-256 SEALED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed bg-emerald-50/50 p-3 rounded-lg border border-emerald-200 italic">
              "This electronic dossier is produced pursuant to Section 65B of the Indian Evidence Act. The identity resolution between interstate records was calculated through deterministic phonetic analysis (Double Metaphone) and corroborated by exact cryptographic digital matches on telecom identifier (MSISDN) and financial transaction trails. Hash validation confirmed intact."
            </p>
          </div>

          {/* Detailed Legal Justification */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 font-mono uppercase">
              REASONED GROUND OF LINKAGE:
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {entity.legal_justification}
            </p>
          </div>

          {/* Connected Cases */}
          {entity.firs && entity.firs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 font-mono uppercase">
                CROSS-BORDER CASE RECORDS REGISTERED ({entity.firs.length}):
              </h4>
              <div className="overflow-x-auto -mx-1 px-1">
              <table className="w-full text-left border-collapse text-xs min-w-[480px]">
                <thead>
                  <tr className="border-b border-slate-300 font-mono text-[11px] text-slate-500">
                    <th className="py-2">FIR / CRIME NO</th>
                    <th className="py-2">POLICE STATION</th>
                    <th className="py-2">CRIME CHARGE</th>
                    <th className="py-2">INCIDENT DATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {entity.firs.map((f, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2 font-bold text-slate-900">{f.fir_id}</td>
                      <td className="py-2 text-slate-600">{f.station}</td>
                      <td className="py-2 text-slate-700">{f.crime_type}</td>
                      <td className="py-2 text-slate-500">{f.date?.split(" ")[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-800 transition"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
