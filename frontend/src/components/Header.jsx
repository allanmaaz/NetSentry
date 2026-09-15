import React from "react";
import { RefreshCw, Orbit, Box, User, Menu } from "lucide-react";
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
  onOpenAuthModal,
  onToggleMobileMenu
}) {
  const getTabTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard";
      case "graph":
        return "Network Graph";
      case "entities":
        return "Suspects";
      default:
        return "Intelligence";
    }
  };

  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800/80 px-3 sm:px-6 flex items-center justify-between shrink-0 z-20 gap-2 sm:gap-3 font-sans select-none">
      {/* Left: Mobile Menu Toggle & View Title */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <button
          onClick={onToggleMobileMenu}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white md:hidden cursor-pointer"
          title="Open Menu"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-sm font-bold text-white tracking-tight">
          {getTabTitle()}
        </h1>
      </div>

      {/* Center: Search (hidden on very small phones) */}
      <div className="flex-1 max-w-sm hidden sm:block">
        <GlobalSearchBar nodes={nodes} onSelectNode={onSelectNode} />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Graph-Only Controls */}
        {activeTab === "graph" && (
          <div className="flex items-center gap-1.5">
            {/* 2D / 3D Toggle */}
            <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => onViewModeChange && onViewModeChange("2d")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                  viewMode === "2d"
                    ? "bg-slate-800 text-amber-300 font-bold shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Orbit size={13} />
                <span className="hidden md:inline">2D Map</span>
              </button>
              <button
                onClick={() => onViewModeChange && onViewModeChange("3d")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                  viewMode === "3d"
                    ? "bg-slate-800 text-sky-400 font-bold shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Box size={13} />
                <span className="hidden md:inline">3D Space</span>
              </button>
            </div>

            {/* State Filter (hidden on mobile) */}
            <select
              value={filterState}
              onChange={(e) => onFilterStateChange(e.target.value)}
              className="hidden lg:block text-xs px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 outline-none hover:bg-slate-850 transition cursor-pointer"
            >
              <option value="all">All States</option>
              <option value="Maharashtra">Maharashtra Police</option>
              <option value="Karnataka">Karnataka Police</option>
            </select>
          </div>
        )}

        {/* Database Reload / Sync */}
        <button
          onClick={onReloadData}
          disabled={isLoading}
          title="Refresh Data"
          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-lg transition disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin text-amber-400" : ""} />
        </button>

        {/* Officer Badge Pill */}
        <button
          id="officer-badge-btn"
          onClick={onOpenAuthModal}
          title="Switch Officer Profile"
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs transition border border-slate-800 bg-slate-900 hover:bg-slate-850 cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
            <User size={12} />
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <span className="text-xs font-bold text-white truncate max-w-[100px] block">
              {currentOfficer?.name?.split(" ")[0] || "Officer"}
            </span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-sky-500/10 text-sky-300 border border-sky-500/20">
            {currentOfficer?.role === "Supervisory Officer" ? "Supervisor" : currentOfficer?.role === "System Admin" ? "Admin" : "Analyst"}
          </span>
        </button>
      </div>
    </header>
  );
}
