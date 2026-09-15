import React from "react";
import { RefreshCw, Orbit, Box, UserCheck, Shield } from "lucide-react";
import GlobalSearchBar from "./GlobalSearchBar";

export default function Header({
  activeTab = "dashboard",
  nodes,
  stats,
  onSelectNode,
  filterState,
  onFilterStateChange,
  filterTier,
  onFilterTierChange,
  onReloadData,
  isLoading,
  viewMode = "2d",
  onViewModeChange,
  currentOfficer,
  onOpenAuthModal
}) {
  const getTabTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "EXECUTIVE COMMAND DASHBOARD";
      case "graph":
        return "SYNDICATE CELESTIAL TOPOLOGY";
      case "entities":
        return "SUSPECT REGISTRY & IDENTIFIERS";
      default:
        return "INTELLIGENCE GRID";
    }
  };

  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-20 gap-4 font-sans select-none">
      {/* Left: Active View Title */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-xs font-mono font-bold tracking-wider text-slate-100 uppercase">
            {getTabTitle()}
          </h1>
          <span className="hidden md:inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
            CCTNS • ICJS
          </span>
        </div>
      </div>

      {/* Center: Global Multilingual Search */}
      <div className="flex-1 max-w-sm hidden sm:block">
        <GlobalSearchBar nodes={nodes} onSelectNode={onSelectNode} />
      </div>

      {/* Right: View-Specific Controls & Officer Badge */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Graph-Only Controls */}
        {activeTab === "graph" && (
          <>
            {/* 2D / 3D Engine View Mode Toggle */}
            <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 shrink-0">
              <button
                onClick={() => onViewModeChange && onViewModeChange("2d")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold transition cursor-pointer ${
                  viewMode === "2d"
                    ? "bg-slate-800 text-amber-400 shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Switch to 2D Solar System View"
              >
                <Orbit size={13} className={viewMode === "2d" ? "text-amber-400" : ""} />
                <span>2D Solar</span>
              </button>
              <button
                onClick={() => onViewModeChange && onViewModeChange("3d")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold transition cursor-pointer ${
                  viewMode === "3d"
                    ? "bg-slate-800 text-sky-400 shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Switch to 3D Galactic WebGL Universe"
              >
                <Box size={13} className={viewMode === "3d" ? "text-sky-400" : ""} />
                <span>3D Galaxy</span>
              </button>
            </div>

            {/* State Filter */}
            <select
              value={filterState}
              onChange={(e) => onFilterStateChange(e.target.value)}
              className="text-xs font-mono px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 outline-none hover:bg-slate-850 transition cursor-pointer shrink-0"
            >
              <option value="all">All States</option>
              <option value="Maharashtra">Maharashtra Police</option>
              <option value="Karnataka">Karnataka Police</option>
            </select>

            {/* Risk Tier Filter */}
            <select
              value={filterTier || "all"}
              onChange={(e) => onFilterTierChange && onFilterTierChange(e.target.value)}
              className="text-xs font-mono px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 outline-none hover:bg-slate-850 transition cursor-pointer shrink-0"
            >
              <option value="all">All Tiers</option>
              <option value="critical">Critical Risk</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </>
        )}

        {/* Database Synchronize Button */}
        <button
          onClick={onReloadData}
          disabled={isLoading}
          title="Synchronize Investigation Database"
          className="flex items-center gap-1 px-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono rounded-lg transition disabled:opacity-50 shrink-0 cursor-pointer"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin text-amber-400" : ""} />
        </button>

        {/* Officer Badge Pill */}
        <button
          id="officer-badge-btn"
          onClick={onOpenAuthModal}
          title="Active Officer Clearance / Click to Switch"
          className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-bold transition border cursor-pointer ${
            currentOfficer?.role === "System Admin" || currentOfficer?.role === "SUPER_ADMIN"
              ? "bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/30"
              : currentOfficer?.role === "Supervisory Officer" || currentOfficer?.role === "STATION_ADMIN"
              ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30"
              : "bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border-sky-500/30"
          }`}
        >
          <UserCheck size={14} />
          <div className="flex flex-col text-left leading-tight hidden lg:block">
            <span className="text-[9px] text-slate-400 font-mono">{currentOfficer?.badge_id || "OFFICER"}</span>
            <span className="truncate max-w-[120px] text-[11px] text-slate-200 font-bold">{currentOfficer?.name || "Officer"}</span>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
            currentOfficer?.role === "System Admin" || currentOfficer?.role === "SUPER_ADMIN"
              ? "bg-purple-950/60 border-purple-500/40 text-purple-300"
              : currentOfficer?.role === "Supervisory Officer" || currentOfficer?.role === "STATION_ADMIN"
              ? "bg-amber-950/60 border-amber-500/40 text-amber-300"
              : "bg-sky-950/60 border-sky-500/40 text-sky-300"
          }`}>
            {currentOfficer?.role === "System Admin" || currentOfficer?.role === "SUPER_ADMIN"
              ? "System Admin"
              : currentOfficer?.role === "Supervisory Officer" || currentOfficer?.role === "STATION_ADMIN"
              ? "Supervisory Officer"
              : "Analyst"}
          </span>
        </button>
      </div>
    </header>
  );
}
