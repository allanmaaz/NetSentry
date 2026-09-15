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
  Link2,
  X
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
  pendingCount = 0,
  isMobileOpen = false,
  onCloseMobile
}) {
  const handleSelectTab = (id) => {
    if (onTabChange) onTabChange(id);
    if (setActiveTab) setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const handleToolClick = (callback) => {
    if (callback) callback();
    if (onCloseMobile) onCloseMobile();
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "graph", label: "Network Graph", icon: Orbit },
    { id: "entities", label: "Suspects & Entities", icon: Users }
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full bg-slate-950 select-none font-sans">
      {/* Top Section: Brand & Navigation */}
      <div>
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              <Shield size={20} className="text-slate-950" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-sm tracking-wider text-white">
                  NETSENTRY
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                Crime Intelligence Grid
              </p>
            </div>
          </div>

          {/* Close button on mobile drawer */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 md:hidden cursor-pointer"
              title="Close Menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Primary Views */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition group cursor-pointer ${
                  isActive
                    ? "bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-xs"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className={isActive ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Tools */}
        <div className="p-3 pt-2 space-y-1 border-t border-slate-900">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            Tools
          </div>

          <button
            onClick={() => handleToolClick(onOpenCypherModal)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition group cursor-pointer border border-transparent hover:border-emerald-500/20"
          >
            <div className="flex items-center gap-2.5">
              <Database size={15} className="text-emerald-400" />
              <span>Database Search</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          <button
            onClick={() => handleToolClick(onOpenIngest)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-sky-400 hover:bg-slate-900 transition group cursor-pointer border border-transparent hover:border-sky-500/20"
          >
            <div className="flex items-center gap-2.5">
              <PlusCircle size={15} className="text-sky-400" />
              <span>Add Case / FIR</span>
            </div>
          </button>

          <button
            onClick={() => handleToolClick(onOpenUploadCsv)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition group cursor-pointer border border-transparent hover:border-slate-700"
          >
            <div className="flex items-center gap-2.5">
              <UploadCloud size={15} className="text-slate-400" />
              <span>Upload Records (CSV)</span>
            </div>
          </button>

          <button
            onClick={() => handleToolClick(onOpenMetrics)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-purple-400 hover:bg-slate-900 transition group cursor-pointer border border-transparent hover:border-purple-500/20"
          >
            <div className="flex items-center gap-2.5">
              <Cpu size={15} className="text-purple-400" />
              <span>AI Accuracy & Stats</span>
            </div>
          </button>

          <button
            onClick={() => handleToolClick(onOpenLedger)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-amber-400 hover:bg-slate-900 transition group cursor-pointer border border-transparent hover:border-amber-500/30"
          >
            <div className="flex items-center gap-2.5">
              <Link2 size={15} className="text-amber-400" />
              <span>Evidence History</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">Audit</span>
          </button>
        </div>
      </div>

      {/* Bottom Section: Active Officer Profile Card & Sign Out */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 space-y-2">
        {currentOfficer && (
          <div
            onClick={() => handleToolClick(onOpenAuthModal)}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer flex items-center justify-between group"
            title="Click to Switch Officer Profile"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-200 shrink-0 border border-slate-700">
                <UserCheck size={16} className="text-amber-400" />
              </div>
              <div className="overflow-hidden leading-tight">
                <div className="text-xs font-bold text-slate-100 truncate group-hover:text-amber-300 transition">
                  {currentOfficer.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {currentOfficer.badge_id} • {currentOfficer.rank}
                </div>
              </div>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold shrink-0 bg-sky-500/10 text-sky-300 border-sky-500/20">
              {currentOfficer.role === "Supervisory Officer" ? "Supervisor" : currentOfficer.role === "System Admin" ? "Admin" : "Analyst"}
            </span>
          </div>
        )}

        {/* Sign Out Button */}
        <button
          onClick={() => handleToolClick(onLogout)}
          className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR (>= 768px): Fixed width, in layout flow */}
      <aside className="hidden md:flex w-60 bg-slate-950 border-r border-slate-800/80 flex-col justify-between shrink-0 z-30 h-full">
        {sidebarContent}
      </aside>

      {/* MOBILE DRAWER (< 768px): Slide-out drawer with backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Dimmed backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity duration-200"
          />

          {/* Drawer sheet */}
          <div className="relative w-72 max-w-[80vw] h-full bg-slate-950 border-r border-slate-800 shadow-2xl z-10 flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
