import React from "react";
import { Shield, RefreshCw, Filter, Layers, Database } from "lucide-react";

export default function Header({
  stats,
  filterState,
  onFilterStateChange,
  filterTier,
  onFilterTierChange,
  onReloadData,
  isLoading
}) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm z-20">
      {/* Brand & Status */}
      <div className="flex items-center gap-3">
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
            Cross-Jurisdiction Syndicate Intelligence Engine
          </p>
        </div>
      </div>

      {/* KPI Stats Pill Bar */}
      {stats && (
        <div className="hidden lg:flex items-center gap-5 px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[10px] block">TOTAL GRAPH</span>
            <span className="font-bold text-slate-800">{stats.total_nodes} Entities</span>
          </div>
          <div className="w-px h-6 bg-slate-200"></div>
          <div>
            <span className="text-slate-400 text-[10px] block">CROSS-STATE</span>
            <span className="font-bold text-purple-600">{stats.cross_state_entities} Syndicates</span>
          </div>
          <div className="w-px h-6 bg-slate-200"></div>
          <div>
            <span className="text-slate-400 text-[10px] block">KINGPIN (SUN)</span>
            <span className="font-bold text-red-600">Mohd. Aslam</span>
          </div>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="flex items-center gap-3">
        {/* State Filter */}
        <select
          value={filterState}
          onChange={(e) => onFilterStateChange(e.target.value)}
          className="text-xs font-medium px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none hover:bg-slate-100 transition cursor-pointer"
        >
          <option value="all">All Jurisdictions (MH + KA)</option>
          <option value="Maharashtra">Maharashtra Police</option>
          <option value="Karnataka">Karnataka State Police</option>
        </select>

        {/* Tier Filter */}
        <select
          value={filterTier}
          onChange={(e) => onFilterTierChange(e.target.value)}
          className="text-xs font-medium px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none hover:bg-slate-100 transition cursor-pointer"
        >
          <option value="all">All Risk Tiers</option>
          <option value="critical">Critical (Sun Core)</option>
          <option value="high">High Risk (Orbit 1)</option>
          <option value="medium">Medium Risk (Orbit 2)</option>
        </select>

        {/* Reload Data Button */}
        <button
          onClick={onReloadData}
          disabled={isLoading}
          title="Reload Synthetic Datasets"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition disabled:opacity-50"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>
      </div>
    </header>
  );
}
