import React, { useState } from "react";
import { Users, Search, Filter, Phone, Car, Shield, FileText, Crosshair, ArrowUpRight } from "lucide-react";

export default function EntitiesView({
  nodes,
  onSelectNode,
  onOpenDossier,
  onSimulateArrest,
  onNavigateToGraph
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [filterTier, setFilterTier] = useState("all");

  const filteredNodes = (nodes || []).filter((node) => {
    // State filter
    if (filterState !== "all" && node.state !== filterState) {
      return false;
    }
    // Tier filter
    if (filterTier !== "all" && node.risk_tier !== filterTier) {
      return false;
    }
    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = node.name?.toLowerCase().includes(q);
      const matchState = node.state?.toLowerCase().includes(q);
      const matchAliases = node.details?.aliases?.some((a) => a.toLowerCase().includes(q));
      const matchPhone = node.details?.phones?.some((p) => p.includes(q));
      const matchVehicle = node.details?.vehicles?.some((v) => v.toLowerCase().includes(q));
      return matchName || matchState || matchAliases || matchPhone || matchVehicle;
    }
    return true;
  });

  const handleInspect = (node) => {
    onSelectNode(node.id);
    onOpenDossier(node);
  };

  const handleLocateOnGraph = (nodeId) => {
    onSelectNode(nodeId);
    onNavigateToGraph("graph");
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-900 text-slate-100 p-6 space-y-5 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black font-mono tracking-tight text-white uppercase flex items-center gap-2">
              <Users size={20} className="text-sky-400" />
              SUSPECTS & IDENTIFIER REGISTRY
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {filteredNodes.length} OF {nodes?.length || 8} RECORDS
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Cross-Jurisdiction Criminal Identities, Phone Intercepts & Seized Vehicles
          </p>
        </div>

        <button
          onClick={() => onNavigateToGraph("graph")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold transition border border-slate-700 cursor-pointer self-start sm:self-auto"
        >
          <span>VIEW IN 2D/3D GRAPH</span>
          <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by suspect name, alias, phone (+91), or vehicle (MH-12)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 outline-none hover:bg-slate-850 transition cursor-pointer"
          >
            <option value="all">All States</option>
            <option value="Maharashtra">Maharashtra Police</option>
            <option value="Karnataka">Karnataka Police</option>
          </select>

          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 outline-none hover:bg-slate-850 transition cursor-pointer"
          >
            <option value="all">All Threat Tiers</option>
            <option value="critical">Critical Risk</option>
            <option value="high">High Risk</option>
            <option value="moderate">Moderate Risk</option>
          </select>
        </div>
      </div>

      {/* Suspects Table */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/80 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-bold text-slate-300">Suspect / Identity</th>
                <th className="py-3 px-4 font-bold text-slate-300">Aliases</th>
                <th className="py-3 px-4 font-bold text-slate-300">Jurisdiction</th>
                <th className="py-3 px-4 font-bold text-slate-300">Intercepted MSISDN</th>
                <th className="py-3 px-4 font-bold text-slate-300">Vehicle Transit</th>
                <th className="py-3 px-4 font-bold text-slate-300">Orbit</th>
                <th className="py-3 px-4 font-bold text-slate-300">Risk Score</th>
                <th className="py-3 px-4 font-bold text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-200">
              {filteredNodes.map((node) => {
                const phone = node.details?.phones?.[0] || "—";
                const vehicle = node.details?.vehicles?.[0] || "—";
                const aliases = node.details?.aliases?.join(", ") || "—";
                const isKingpin = node.orbit_level === 0;

                return (
                  <tr key={node.id} className="hover:bg-slate-900/60 transition group">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white group-hover:text-amber-300 transition">
                        {node.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {node.id}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 max-w-[180px] truncate text-[11px]">
                      {aliases}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                        node.state === "Maharashtra"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : "bg-sky-500/10 text-sky-300 border-sky-500/20"
                      }`}>
                        {node.state}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 text-[11px] whitespace-nowrap">
                      {phone !== "—" ? (
                        <span className="flex items-center gap-1 text-sky-400">
                          <Phone size={12} /> {phone}
                        </span>
                      ) : "—"}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 text-[11px] whitespace-nowrap">
                      {vehicle !== "—" ? (
                        <span className="flex items-center gap-1 text-amber-400">
                          <Car size={12} /> {vehicle}
                        </span>
                      ) : "—"}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                        isKingpin
                          ? "bg-red-500/20 text-red-300 border-red-500/40"
                          : node.orbit_level === 1
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}>
                        Orbit {node.orbit_level}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-sm ${
                          node.risk_score >= 85 ? "text-red-400" : "text-amber-400"
                        }`}>
                          {node.risk_score}
                        </span>
                        <span className="text-[9px] uppercase text-slate-500 font-bold">
                          {node.risk_tier}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleLocateOnGraph(node.id)}
                          title="Locate on Celestial Canvas"
                          className="p-1.5 bg-slate-900 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 border border-slate-750 rounded-lg transition cursor-pointer"
                        >
                          <Crosshair size={14} />
                        </button>

                        <button
                          onClick={() => handleInspect(node)}
                          title="View Section 65B Dossier"
                          className="p-1.5 bg-slate-900 hover:bg-sky-500/20 text-slate-400 hover:text-sky-300 border border-slate-750 rounded-lg transition cursor-pointer"
                        >
                          <FileText size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
