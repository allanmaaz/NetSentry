import React, { useState, useEffect } from "react";
import {
  Database,
  Search,
  X,
  RefreshCw,
  Table,
  Code,
  Shield,
  Sparkles,
  Users,
  MapPin,
  Phone,
  Play
} from "lucide-react";
import { fetchDatabaseStatus, executeCypherQuery } from "../services/api";

const PRESET_SEARCHES = [
  {
    id: "kingpin",
    title: "Syndicate Kingpin",
    desc: "Unmask central mastermind controlling operations",
    query: "MATCH (k:Person {orbit_level: 0})\nRETURN k.canonical_name, k.risk_tier, k.betweenness_score, k.jurisdictions"
  },
  {
    id: "cross_border",
    title: "Cross-State Suspects",
    desc: "Suspects operating in Maharashtra & Karnataka",
    query: "MATCH (p:Person)\nWHERE p.is_cross_jurisdiction = true\nRETURN p.canonical_name, p.risk_score, p.orbit_level, p.primary_state"
  },
  {
    id: "links",
    title: "Linked Phone Intercepts",
    desc: "Trace connected communications & couriers",
    query: "MATCH (s:Person)-[r:COMMAND_LINK]->(t:Person)\nRETURN s.name, type(r), t.name"
  },
  {
    id: "all",
    title: "All Suspects",
    desc: "Complete active roster of tracked figures",
    query: "MATCH (p:Person)\nRETURN p.id, p.canonical_name, p.risk_score, p.risk_tier, p.orbit_level\nLIMIT 10"
  }
];

export default function CypherConsoleModal({ isOpen, onClose }) {
  const [activePreset, setActivePreset] = useState(PRESET_SEARCHES[0].id);
  const [query, setQuery] = useState(PRESET_SEARCHES[0].query);
  const [dbStatus, setDbStatus] = useState(null);
  const [queryResult, setQueryResult] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showTechnicalQuery, setShowTechnicalQuery] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      handleRunQuery(query);
    }
  }, [isOpen]);

  const loadStatus = async () => {
    try {
      const status = await fetchDatabaseStatus();
      setDbStatus(status);
    } catch (e) {
      console.warn("DB status check:", e);
    }
  };

  const handleRunQuery = async (queryToRun) => {
    const targetQuery = queryToRun || query;
    setIsExecuting(true);
    try {
      const res = await executeCypherQuery(targetQuery);
      setQueryResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id);
    setQuery(preset.query);
    handleRunQuery(preset.query);
  };

  if (!isOpen) return null;

  // Filter rows if user types in search bar
  const displayedRows = (queryResult?.rows || []).filter((row) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <Database size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-white">
                  Search Criminal Database
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Find suspects, cross-border connections, and phone or vehicle links
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

        {/* 4 Quick Investigation Presets (Clean Buttons) */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Quick Investigation Filters:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_SEARCHES.map((preset) => {
              const isSelected = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-slate-800 border-amber-500/50 text-white shadow-sm"
                      : "bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700"
                  }`}
                >
                  <div className={`text-xs font-bold ${isSelected ? "text-amber-300" : "text-slate-200"}`}>
                    {preset.title}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {preset.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 pb-0 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter results by suspect name, state, phone, or plate..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
          <button
            onClick={() => handleRunQuery()}
            disabled={isExecuting}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw size={13} className={isExecuting ? "animate-spin text-amber-400" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Results Area */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing <strong className="text-white">{displayedRows.length}</strong> matching records
            </span>
            {queryResult?.execution_ms && (
              <span className="text-[11px] text-slate-500">
                Queried in {queryResult.execution_ms} ms
              </span>
            )}
          </div>

          {/* Clean Results Table */}
          {displayedRows.length > 0 ? (
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 text-[11px] uppercase font-semibold border-b border-slate-800">
                  <tr>
                    {queryResult?.columns?.map((col, idx) => (
                      <th key={idx} className="py-2.5 px-3">
                        {col.replace(/_/g, " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-200">
                  {displayedRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-900/50 transition">
                      {queryResult.columns.map((col, cIdx) => (
                        <td key={cIdx} className="py-2.5 px-3">
                          {typeof row[col] === "object" ? JSON.stringify(row[col]) : String(row[col] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/50 rounded-xl border border-slate-800">
              {isExecuting ? "Searching database..." : "No records found matching your filter."}
            </div>
          )}

          {/* Technical Query Disclosure (Collapsed by Default) */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowTechnicalQuery(!showTechnicalQuery)}
              className="text-[11px] text-slate-500 hover:text-slate-400 flex items-center gap-1 cursor-pointer"
            >
              <span>{showTechnicalQuery ? "▼ Hide technical query" : "▶ Show technical database query"}</span>
            </button>
            {showTechnicalQuery && (
              <div className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400">
                <pre className="whitespace-pre-wrap">{query}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>{dbStatus?.total_nodes || 8} Suspects • {dbStatus?.total_edges || 14} Connections</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
