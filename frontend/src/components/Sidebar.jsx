import React from "react";
import {
  LayoutDashboard,
  Orbit,
  Users,
  Database,
  Cpu,
  PlusCircle,
  UploadCloud,
  LogOut,
  Shield,
  UserCheck,
  ChevronRight,
  Link2
} from "lucide-react";

export default function Sidebar({
  activeTab,
  onTabChange,
  setActiveTab,
  currentOfficer,
  onOpenAuthModal,
  onLogout,
  onOpenIngest,
  onOpenMetrics,
  onOpenUploadCsv,
  onOpenCypherModal,
  onOpenLedger,
  pendingCount = 0
}) {
  const handleSelectTab = (id) => {
    if (onTabChange) onTabChange(id);
    if (setActiveTab) setActiveTab(id);
  };
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null },
    { id: "graph", label: "Syndicate Graph", icon: Orbit, badge: null },
    { id: "entities", label: "Suspects & Entities", icon: Users, badge: null }
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 hidden lg:flex flex-col justify-between shrink-0 select-none z-30 font-sans">
      {/* Top Section: Brand & Navigation */}
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
            <Shield size={20} className="text-slate-950" />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-black text-sm tracking-wider text-white">
                NETSENTRY
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                LIVE
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 truncate">
              Law Enforcement Intel Grid
            </p>
          </div>
        </div>

        {/* Primary Operational Views */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            OPERATIONAL VIEWS
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono font-bold transition group cursor-pointer ${
                  isActive
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-xs"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className={isActive ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Intelligence Actions & Tools */}
        <div className="p-3 pt-2 space-y-1 border-t border-slate-900">
          <div className="px-3 py-1.5 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            INTELLIGENCE TOOLS
          </div>

          <button
            onClick={onOpenCypherModal}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition group cursor-pointer border border-transparent hover:border-emerald-500/20"
          >
            <div className="flex items-center gap-2.5">
              <Database size={15} className="text-emerald-500" />
              <span>Neo4j Cypher Terminal</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          <button
            onClick={onOpenIngest}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-sky-400 hover:bg-slate-900 transition group cursor-pointer border border-transparent hover:border-sky-500/20"
          >
            <div className="flex items-center gap-2.5">
              <PlusCircle size={15} className="text-sky-500" />
              <span>Live FIR Ingestion</span>
            </div>
          </button>

          <button
            onClick={onOpenUploadCsv}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition group cursor-pointer border border-transparent hover:border-slate-700"
          >
            <div className="flex items-center gap-2.5">
              <UploadCloud size={15} className="text-slate-400" />
              <span>Upload Dataset (CSV)</span>
            </div>
          </button>

          <button
            onClick={onOpenMetrics}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-purple-400 hover:bg-slate-900 transition group cursor-pointer border border-transparent hover:border-purple-500/20"
          >
            <div className="flex items-center gap-2.5">
              <Cpu size={15} className="text-purple-500" />
              <span>AI Model ROC-AUC</span>
            </div>
          </button>

          {/* Chain of Custody Ledger */}
          <button
            onClick={onOpenLedger}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-amber-400 hover:bg-slate-900 transition group cursor-pointer border border-transparent hover:border-amber-500/30"
          >
            <div className="flex items-center gap-2.5">
              <Link2 size={15} className="text-amber-500" />
              <span>Chain of Custody</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">65B</span>
          </button>
        </div>
      </div>

      {/* Bottom Section: Active Officer Profile Card & Sign Out */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/90 space-y-2">
        {currentOfficer && (
          <div
            onClick={onOpenAuthModal}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer flex items-center justify-between group"
            title="Click to Switch Officer Persona / Permissions"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-200 shrink-0 border border-slate-700">
                <UserCheck size={16} className="text-amber-400" />
              </div>
              <div className="overflow-hidden leading-tight">
                <div className="text-xs font-bold text-slate-100 truncate group-hover:text-amber-300 transition">
                  {currentOfficer.name}
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  {currentOfficer.badge_id} • {currentOfficer.rank}
                </div>
              </div>
            </div>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold shrink-0 ${
              currentOfficer.role === "SUPER_ADMIN"
                ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                : currentOfficer.role === "STATION_ADMIN"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                : "bg-sky-500/20 text-sky-300 border-sky-500/30"
            }`}>
              {currentOfficer.role === "SUPER_ADMIN" ? "SUPER" : currentOfficer.role === "STATION_ADMIN" ? "ADMIN" : "IO"}
            </span>
          </div>
        )}

        {/* Sign Out Button */}
        <button
          onClick={onLogout}
          className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 text-xs font-mono font-bold flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <LogOut size={13} />
          <span>SIGN OUT GATEWAY</span>
        </button>
      </div>
    </aside>
  );
}
