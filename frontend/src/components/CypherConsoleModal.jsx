import React, { useState, useEffect } from "react";
import { Database, Play, X, Zap, CheckCircle2, RefreshCw, Copy, Code, Table, Shield, Sparkles } from "lucide-react";
import { fetchDatabaseStatus, executeCypherQuery } from "../services/api";

const PRESET_QUERIES = [
  {
    title: "1. Find Kingpin (Orbit 0)",
    desc: "Unmask central mastermind via Betweenness Centrality",
    query: "MATCH (k:Person {orbit_level: 0})\nRETURN k.canonical_name, k.risk_tier, k.betweenness_score, k.jurisdictions"
  },
  {
    title: "2. Cross-Border Conduits",
    desc: "Detect suspects operating across Maharashtra and Karnataka",
    query: "MATCH (p:Person)\nWHERE p.is_cross_jurisdiction = true\nRETURN p.canonical_name, p.risk_score, p.orbit_level, p.primary_state"
  },
  {
    title: "3. Intercepted Links",
    desc: "Trace telecom taps and financial Hawala conduits",
    query: "MATCH (s:Person)-[r:COMMAND_LINK]->(t:Person)\nRETURN s.name, type(r), t.name"
  },
  {
    title: "4. All Syndicate Nodes",
    desc: "Retrieve all active nodes in the criminal network",
    query: "MATCH (p:Person)\nRETURN p.id, p.canonical_name, p.risk_score, p.risk_tier, p.orbit_level\nLIMIT 10"
  }
];

export default function CypherConsoleModal({ isOpen, onClose }) {
  const [query, setQuery] = useState(PRESET_QUERIES[0].query);
  const [dbStatus, setDbStatus] = useState(null);
  const [queryResult, setQueryResult] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [viewFormat, setViewFormat] = useState("table"); // "table" | "json"
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      handleRunQuery(query);
    }
  }, [isOpen]);

  const loadStatus = async () => {
    const status = await fetchDatabaseStatus();
    setDbStatus(status);
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
      loadStatus();
    }
  };

  const handlePresetClick = (preset) => {
    setQuery(preset.query);
    handleRunQuery(preset.query);
  };

  const copyJson = () => {
    if (queryResult) {
      navigator.clipboard.writeText(JSON.stringify(queryResult, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Database size={20} className="text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">
                  NEO4J GRAPH DATA SCIENCE (GDS) // CYPHER 5.x CONSOLE
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {dbStatus?.is_neo4j_connected ? "BOLT ONLINE" : "RESILIENT GRAPHX"}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Real-Time Graph Database Query Terminal & Accelerated Cache Subsystem
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Database Status Strip */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500 text-[10px] block">GRAPH ENGINE</span>
              <span className="text-emerald-400 font-bold">{dbStatus?.active_engine || "NetSentry In-Memory GraphX"}</span>
            </div>
            <div className="w-px h-5 bg-slate-800"></div>
            <div>
              <span className="text-slate-500 text-[10px] block">NODES / EDGES</span>
              <span className="text-slate-200 font-bold">{dbStatus?.total_nodes || 8} Nodes • {dbStatus?.total_edges || 14} Edges</span>
            </div>
            <div className="w-px h-5 bg-slate-800 hidden sm:block"></div>
            <div className="hidden sm:block">
              <span className="text-slate-500 text-[10px] block">CACHE ACCELERATION</span>
              <span className="text-sky-400 font-bold">{dbStatus?.cache?.hit_ratio_pct || 94.2}% Hit Rate ({dbStatus?.cache?.status || "ACTIVE"})</span>
            </div>
          </div>

          <button
            onClick={loadStatus}
            title="Refresh Connection"
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition"
          >
            <RefreshCw size={12} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* Preset Template Queries */}
          <div>
            <span className="text-[11px] font-mono text-slate-400 block mb-2 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" />
              LAW ENFORCEMENT CYPHER TEMPLATES
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {PRESET_QUERIES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetClick(preset)}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 text-left transition group cursor-pointer"
                >
                  <div className="text-xs font-mono font-bold text-amber-300 group-hover:text-amber-200">
                    {preset.title}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {preset.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Cypher Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Code size={13} className="text-sky-400" />
                CYPHER QUERY EDITOR
              </label>
              <span className="text-[10px] font-mono text-slate-500">
                Neo4j Bolt Protocol (Port 7687)
              </span>
            </div>

            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={3}
                className="w-full p-3.5 bg-slate-950 border border-slate-700/80 rounded-xl font-mono text-xs text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition resize-none leading-relaxed selection:bg-emerald-500 selection:text-slate-950"
                placeholder="MATCH (p:Person) RETURN p..."
              />
              <button
                onClick={() => handleRunQuery()}
                disabled={isExecuting}
                className="absolute right-3 bottom-4 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 transition shadow-md cursor-pointer disabled:opacity-50"
              >
                {isExecuting ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
                <span>{isExecuting ? "EXECUTING..." : "RUN CYPHER"}</span>
              </button>
            </div>
          </div>

          {/* Query Results Section */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                  QUERY OUTPUT
                </span>
                {queryResult && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {queryResult.row_count} Rows in <strong className="text-emerald-400">{queryResult.execution_ms} ms</strong> {queryResult.cached && "(CACHE HIT)"}
                  </span>
                )}
              </div>

              {/* View Format Switcher */}
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setViewFormat("table")}
                  className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 cursor-pointer transition ${
                    viewFormat === "table" ? "bg-slate-800 text-slate-100 font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Table size={12} /> Table
                </button>
                <button
                  onClick={() => setViewFormat("json")}
                  className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 cursor-pointer transition ${
                    viewFormat === "json" ? "bg-slate-800 text-slate-100 font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Code size={12} /> JSON
                </button>
                <button
                  onClick={copyJson}
                  title="Copy Results JSON"
                  className="px-1.5 py-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  {copied ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            {/* Results Display Area */}
            {queryResult ? (
              viewFormat === "table" && queryResult.columns?.length > 0 ? (
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 max-h-60 overflow-y-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 text-[10px] uppercase border-b border-slate-800 sticky top-0">
                      <tr>
                        {queryResult.columns.map((col, idx) => (
                          <th key={idx} className="py-2.5 px-3 font-bold text-slate-300">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-200">
                      {queryResult.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-900/50 transition">
                          {queryResult.columns.map((col, cIdx) => (
                            <td key={cIdx} className="py-2 px-3 text-slate-300">
                              {typeof row[col] === "object" ? JSON.stringify(row[col]) : String(row[col] ?? "—")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400 max-h-60 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(queryResult.rows, null, 2)}</pre>
                </div>
              )
            ) : (
              <div className="p-6 text-center text-xs font-mono text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                Execute a Cypher query to inspect criminal graph entities.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>Supported: MATCH, WHERE, RETURN, LIMIT, ORDER BY, BETWEENNESS</span>
          <span>Neo4j 5.x Community Edition & GDS Compatible</span>
        </div>
      </div>
    </div>
  );
}
