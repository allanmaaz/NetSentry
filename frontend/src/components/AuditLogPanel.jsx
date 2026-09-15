import React from "react";
import { X, ScrollText, Download } from "lucide-react";

// T3.1 — Immutable audit trail slide-out panel
// Row format: [ISO timestamp] [Officer Name / Role] [Action] [Target Entity]
export default function AuditLogPanel({ entries = [], isOpen, onClose, onExport }) {
  if (!isOpen) return null;

  const sorted = [...entries].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="audit-log-panel">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <ScrollText size={16} className="text-slate-700" />
          <span className="text-xs font-bold tracking-wider text-slate-700 uppercase font-mono">
            IMMUTABLE AUDIT TRAIL
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold">
            {entries.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sorted.length === 0 && (
          <div className="text-center text-xs text-slate-400 font-mono py-8">
            No audit entries yet.<br />Actions will be logged here.
          </div>
        )}
        {sorted.map((e, i) => (
          <div key={i} className={`audit-entry action-${e.actionType || "node_click"}`}>
            <div className="text-slate-500">[{e.timestamp}]</div>
            <div className="font-bold text-slate-800">
              [{e.officerName || "Unknown"} / {e.officerRole || "—"}]
            </div>
            <div className="text-slate-700">
              [{e.action}] → {e.target}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-slate-200 bg-slate-50/70">
        <button
          onClick={onExport}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
        >
          <Download size={13} />
          Export Audit Log (.txt)
        </button>
      </div>
    </div>
  );
}
