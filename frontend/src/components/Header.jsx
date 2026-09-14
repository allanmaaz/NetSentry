import React from "react";
import { Shield, RefreshCw, Cpu, PlusCircle, UploadCloud, Orbit, Box } from "lucide-react";
import GlobalSearchBar from "./GlobalSearchBar";

export default function Header({
  nodes,
  stats,
  onSelectNode,
  filterState,
  onFilterStateChange,
  filterTier,
  onFilterTierChange,
  onReloadData,
  onOpenIngest,
  onOpenMetrics,
  onOpenUploadCsv,
  isLoading,
  viewMode = "2d",
  onViewModeChange
}) {
  const kingpinNode = nodes?.find((n) => n.orbit_level === 0) || nodes?.[0];
  const kingpinName = kingpinNode?.name || "Abdul Karim Telgi";

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-5 flex items-center justify-between shrink-0 shadow-sm z-20 gap-4">
      {/* Brand & Status */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
          <Shield size={20} className="text-sky-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 font-mono">
              NETSENTRY
            </h1>
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              AIR-GAPPED LIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Cross-Jurisdiction Syndicate Intelligence Platform
          </p>
        </div>
      </div>

      {/* Global Multilingual Search Bar */}
      <div className="flex-1 max-w-sm hidden md:block">
        <GlobalSearchBar nodes={nodes} onSelectNode={onSelectNode} />
      </div>

      {/* KPI Stats Pill Bar */}
      {stats && (
        <div className="hidden xl:flex items-center gap-4 px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono shrink-0">
          <div>
            <span className="text-slate-400 text-[10px] block">TOTAL GRAPH</span>
            <span className="font-bold text-slate-800">{stats.total_nodes} Entities</span>
          </div>
          <div className="w-px h-5 bg-slate-200"></div>
          <div>
            <span className="text-slate-400 text-[10px] block">CROSS-STATE</span>
            <span className="font-bold text-purple-600">{stats.cross_state_entities} Syndicates</span>
          </div>
          <div className="w-px h-5 bg-slate-200"></div>
          <div>
            <span className="text-slate-400 text-[10px] block">KINGPIN (SUN)</span>
            <span className="font-bold text-red-600">{kingpinName}</span>
          </div>
        </div>
      )}

      {/* Action Buttons & Filters */}
      <div className="flex items-center gap-2 shrink-0">
        {/* 2D / 3D Engine View Mode Toggle */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => onViewModeChange && onViewModeChange("2d")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
              viewMode === "2d"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Switch to 2D Solar System View"
          >
            <Orbit size={13} className={viewMode === "2d" ? "text-amber-500" : ""} />
            <span>2D Solar</span>
          </button>
          <button
            onClick={() => onViewModeChange && onViewModeChange("3d")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
              viewMode === "3d"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Switch to 3D Galactic WebGL Universe"
          >
            <Box size={13} className={viewMode === "3d" ? "text-sky-500" : ""} />
            <span>3D Galaxy</span>
          </button>
        </div>

        {/* State Filter */}
        <select
          value={filterState}
          onChange={(e) => onFilterStateChange(e.target.value)}
          className="text-xs font-medium px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none hover:bg-slate-100 transition cursor-pointer"
        >
          <option value="all">All States (MH + KA)</option>
          <option value="Maharashtra">Maharashtra Police</option>
          <option value="Karnataka">Karnataka Police</option>
        </select>

        {/* Upload Custom Real Dataset (CSV) Button */}
        <button
          onClick={onOpenUploadCsv}
          title="Upload Custom Law Enforcement Dataset (CSV)"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition shadow-sm"
        >
          <UploadCloud size={14} />
          <span className="hidden sm:inline">Upload CSV</span>
        </button>

        {/* Live Case Ingestion Modal Button */}
        <button
          onClick={onOpenIngest}
          title="Ingest Live FIR Narrative"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold rounded-lg transition"
        >
          <PlusCircle size={14} />
          <span className="hidden sm:inline">Live FIR</span>
        </button>

        {/* AI Model Health & Benchmark Button */}
        <button
          onClick={onOpenMetrics}
          title="View AI Model Benchmark & ROC-AUC"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold rounded-lg transition"
        >
          <Cpu size={14} />
          <span className="hidden sm:inline">AI Metrics</span>
        </button>

        {/* Synchronize Database Button */}
        <button
          onClick={onReloadData}
          disabled={isLoading}
          title="Synchronize Investigation Database"
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition disabled:opacity-50"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>
    </header>
  );
}
