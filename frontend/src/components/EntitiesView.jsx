import React, { useState } from "react";
import { Users, Search, Phone, Car, ArrowUpRight, FileText, ChevronRight, X } from "lucide-react";

export default function EntitiesView({
  nodes,
  onSelectNode,
  onOpenDossier,
  onNavigateToGraph
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [filterTier, setFilterTier] = useState("all");

  const filteredNodes = (nodes || []).filter((node) => {
    if (filterState !== "all" && node.state !== filterState) return false;
    if (filterTier !== "all" && node.risk_tier !== filterTier) return false;
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
    if (onOpenDossier) onOpenDossier(node);
  };

  const handleViewGraph = (nodeId) => {
    onSelectNode(nodeId);
    if (onNavigateToGraph) onNavigateToGraph("graph");
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-4 font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Users size={20} className="text-sky-400" />
              Suspect Registry
            </h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
              {filteredNodes.length} suspects
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Active criminal profiles, alias records, and seized physical identifiers
          </p>
        </div>

        {onNavigateToGraph && (
          <button
            onClick={() => onNavigateToGraph("graph")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-medium transition border border-slate-800 cursor-pointer self-start sm:self-auto"
          >
            <span>Open Network Map</span>
            <ArrowUpRight size={14} className="text-sky-400" />
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by suspect name, alias, phone, or vehicle..."
            className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* State Quick Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 shrink-0">
          <button
            onClick={() => setFilterState("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap cursor-pointer ${
              filterState === "all"
                ? "bg-sky-500 text-slate-950 font-bold shadow-sm"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            All States
          </button>
          <button
            onClick={() => setFilterState(filterState === "Maharashtra" ? "all" : "Maharashtra")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap cursor-pointer ${
              filterState === "Maharashtra"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            Maharashtra
          </button>
          <button
            onClick={() => setFilterState(filterState === "Karnataka" ? "all" : "Karnataka")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap cursor-pointer ${
              filterState === "Karnataka"
                ? "bg-sky-500 text-slate-950 font-bold shadow-sm"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            Karnataka
          </button>
          <button
            onClick={() => setFilterTier(filterTier === "critical" ? "all" : "critical")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap cursor-pointer ${
              filterTier === "critical"
                ? "bg-red-500 text-white font-bold shadow-sm"
                : "bg-slate-950 text-red-400 hover:text-red-300 border border-red-500/30"
            }`}
          >
            Critical Only
          </button>
        </div>
      </div>

      {/* MOBILE VIEW: Clean Cards (< 768px) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredNodes.map((node) => {
          const phone = node.details?.phones?.[0];
          const vehicle = node.details?.vehicles?.[0];
          const aliases = node.details?.aliases || [];
          const isCritical = node.risk_score >= 85;

          return (
            <div
              key={node.id}
              onClick={() => handleInspect(node)}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3 cursor-pointer hover:border-slate-700 transition"
            >
              {/* Top Row: Name + State + Risk */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-base text-white truncate">
                    {node.name}
                  </h3>
                  {aliases.length > 0 && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      aka {aliases.join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      isCritical
                        ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    Risk {node.risk_score}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {node.state}
                  </span>
                </div>
              </div>

              {/* Middle: Identifiers */}
              {(phone || vehicle) && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {phone && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 text-sky-400 text-xs font-mono border border-slate-800">
                      <Phone size={12} /> {phone}
                    </span>
                  )}
                  {vehicle && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 text-amber-400 text-xs font-mono border border-slate-800">
                      <Car size={12} /> {vehicle}
                    </span>
                  )}
                </div>
              )}

              {/* Bottom: Action */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Orbit {node.orbit_level} Hierarchy</span>
                <span className="text-sky-400 font-semibold flex items-center gap-1">
                  View Dossier <ChevronRight size={14} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP VIEW: Non-Truncated Table (>= 768px) */}
      <div className="hidden md:block border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/90 shadow-md">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/90 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 pl-6 pr-4">Suspect Profile</th>
              <th className="py-3.5 px-4">State</th>
              <th className="py-3.5 px-4">Phone & Vehicle</th>
              <th className="py-3.5 px-4">Threat Level</th>
              <th className="py-3.5 pl-4 pr-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850">
            {filteredNodes.map((node) => {
              const phone = node.details?.phones?.[0];
              const vehicle = node.details?.vehicles?.[0];
              const aliases = node.details?.aliases || [];
              const isCritical = node.risk_score >= 85;

              return (
                <tr
                  key={node.id}
                  onClick={() => handleInspect(node)}
                  className="hover:bg-slate-800/50 transition cursor-pointer group"
                >
                  {/* Suspect Column with Generous Left Padding */}
                  <td className="py-4 pl-6 pr-4">
                    <div className="font-bold text-white group-hover:text-sky-300 transition text-sm">
                      {node.name}
                    </div>
                    {aliases.length > 0 && (
                      <div className="text-xs text-slate-400 mt-0.5">
                        aka {aliases.join(", ")}
                      </div>
                    )}
                  </td>

                  {/* State */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                        node.state === "Maharashtra"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : "bg-sky-500/10 text-sky-300 border-sky-500/20"
                      }`}
                    >
                      {node.state}
                    </span>
                  </td>

                  {/* Identifiers */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {phone && (
                        <div className="flex items-center gap-1.5 text-xs text-sky-400 font-mono">
                          <Phone size={12} /> {phone}
                        </div>
                      )}
                      {vehicle && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono">
                          <Car size={12} /> {vehicle}
                        </div>
                      )}
                      {!phone && !vehicle && (
                        <span className="text-slate-500 italic">—</span>
                      )}
                    </div>
                  </td>

                  {/* Threat Level */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isCritical ? "bg-red-500 shadow-sm shadow-red-500/50" : "bg-amber-500 shadow-sm shadow-amber-500/50"
                        }`}
                      />
                      <span className="font-bold text-white text-xs">
                        {node.risk_score}
                      </span>
                      <span className="text-[11px] text-slate-400 uppercase">
                        {node.risk_tier}
                      </span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInspect(node);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white text-xs font-medium transition border border-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText size={13} />
                      <span>Dossier</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredNodes.length === 0 && (
        <div className="p-8 text-center text-slate-500 text-xs">
          No suspects match the filter criteria.
        </div>
      )}
    </div>
  );
}
