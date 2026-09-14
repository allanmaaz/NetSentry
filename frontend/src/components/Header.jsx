import React from "react";
import { Shield, RefreshCw, Cpu, PlusCircle, UploadCloud, Orbit, Box, UserCheck, LogOut, Database } from "lucide-react";
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
  onViewModeChange,
  currentOfficer,
  onOpenAuthModal,
  onLogout,
  onOpenCypherModal
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
      <div className="flex-1 max-w-[220px] 2xl:max-w-xs hidden md:block">
        <GlobalSearchBar nodes={nodes} onSelectNode={onSelectNode} />
      </div>

      {/* KPI Stats Pill Bar (shown on large 2xl screens) */}
      {stats && (
        <div className="hidden 2xl:flex items-center gap-3 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono shrink-0">
          <div>
            <span className="text-slate-400 text-[10px] block">TOTAL GRAPH</span>
            <span className="font-bold text-slate-800">{stats.total_nodes} Entities</span>
          </div>
          <div className="w-px h-4 bg-slate-200"></div>
          <div>
            <span className="text-slate-400 text-[10px] block">CROSS-STATE</span>
            <span className="font-bold text-purple-600">{stats.cross_state_entities} Syndicates</span>
          </div>
          <div className="w-px h-4 bg-slate-200"></div>
          <div>
            <span className="text-slate-400 text-[10px] block">KINGPIN (SUN)</span>
            <span className="font-bold text-red-600">{kingpinName}</span>
          </div>
        </div>
      )}

      {/* Action Buttons & Filters */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Authenticated Officer Badge & RBAC Switcher (HIGH PRIORITY) */}
        <button
          id="officer-badge-btn"
          onClick={onOpenAuthModal}
          title="Switch Officer Persona / RBAC Permissions"
          className={`flex items-center gap-2 px-2.5 py-1.5 border rounded-lg text-xs font-bold transition shadow-xs shrink-0 cursor-pointer ${
            currentOfficer?.role === "SUPER_ADMIN"
              ? "bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-300"
              : currentOfficer?.role === "STATION_ADMIN"
              ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300"
              : "bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-300"
          }`}
        >
          <UserCheck size={15} />
          <div className="flex flex-col text-left leading-tight">
            <span className="text-[10px] text-slate-500 font-mono">{currentOfficer?.badge_id || "MH-POL-8821"}</span>
            <span className="truncate max-w-[100px] text-[11px]">{currentOfficer?.name || "Officer"}</span>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-white rounded border border-slate-300 text-slate-700 uppercase font-bold">
            {currentOfficer?.role === "SUPER_ADMIN" ? "SUPER" : currentOfficer?.role === "STATION_ADMIN" ? "ADMIN" : "IO"}
          </span>
        </button>

        {/* Sign Out to Police Gateway */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Sign Out to National Security Gateway"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-300 border border-slate-200 text-slate-600 rounded-lg text-xs font-mono transition cursor-pointer shrink-0"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline text-[11px]">Sign Out</span>
          </button>
        )}

        {/* 2D / 3D Engine View Mode Toggle */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
          <button
            onClick={() => onViewModeChange && onViewModeChange("2d")}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
              viewMode === "2d"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Switch to 2D Solar System View"
          >
            <Orbit size={13} className={viewMode === "2d" ? "text-amber-500" : ""} />
            <span className="hidden sm:inline">2D</span>
          </button>
          <button
            onClick={() => onViewModeChange && onViewModeChange("3d")}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
              viewMode === "3d"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Switch to 3D Galactic WebGL Universe"
          >
            <Box size={13} className={viewMode === "3d" ? "text-sky-500" : ""} />
            <span className="hidden sm:inline">3D</span>
          </button>
        </div>

        {/* State Filter */}
        <select
          value={filterState}
          onChange={(e) => onFilterStateChange(e.target.value)}
          className="text-xs font-medium px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none hover:bg-slate-100 transition cursor-pointer shrink-0 max-w-[130px] sm:max-w-none truncate"
        >
          <option value="all">All States</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Karnataka">Karnataka</option>
        </select>

        {/* Upload Custom Real Dataset (CSV) Button */}
        <button
          onClick={onOpenUploadCsv}
          title="Upload Custom Law Enforcement Dataset (CSV)"
          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition shadow-sm shrink-0"
        >
          <UploadCloud size={14} />
          <span className="hidden lg:inline">Upload CSV</span>
        </button>

        {/* Live Case Ingestion Modal Button */}
        <button
          onClick={onOpenIngest}
          title="Ingest Live FIR Narrative"
          className="flex items-center gap-1 px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold rounded-lg transition shrink-0"
        >
          <PlusCircle size={14} />
          <span className="hidden lg:inline">Live FIR</span>
        </button>

        {/* AI Model Health & Benchmark Button */}
        <button
          onClick={onOpenMetrics}
          title="View AI Model Benchmark & ROC-AUC"
          className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold rounded-lg transition shrink-0"
        >
          <Cpu size={14} />
          <span className="hidden lg:inline">AI Metrics</span>
        </button>

        {/* Neo4j Cypher & Graph Database Console Button */}
        <button
          onClick={onOpenCypherModal}
          title="Open Neo4j Cypher Terminal & Graph Database Console"
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-lg transition shadow-2xs shrink-0 cursor-pointer"
        >
          <Database size={13} className="text-emerald-600" />
          <span className="hidden sm:inline">Graph DB</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </button>

        {/* Synchronize Database Button */}
        <button
          onClick={onReloadData}
          disabled={isLoading}
          title="Synchronize Investigation Database"
          className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition disabled:opacity-50 shrink-0"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>
    </header>
  );
}
