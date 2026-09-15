import React from "react";
import {
  Shield,
  Orbit,
  Users,
  ArrowUpRight,
  MapPin,
  Activity,
  Zap,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

export default function DashboardView({
  stats: propStats,
  nodes = [],
  links = [],
  graphData,
  pendingCount = 0,
  pendingResolutions = [],
  onNavigateTab,
  onSelectNode,
  onOpenDossier,
  onOpenCypherModal
}) {
  const allNodes = nodes.length > 0 ? nodes : (graphData?.nodes || []);
  const stats = propStats || graphData?.stats || {
    total_nodes: allNodes.length || 8,
    cross_state_entities: 3,
    avg_betweenness: 0.24,
    high_risk_entities: 5
  };

  const totalNodesCount = stats.total_nodes || allNodes.length || 8;
  const kingpinNode = allNodes.find((n) => n.orbit_level === 0) || allNodes[0];
  const kingpinName = kingpinNode?.name || "Abdul Karim Telgi";

  const mhCount = allNodes.filter((n) => n.state === "Maharashtra")?.length || 5;
  const kaCount = allNodes.filter((n) => n.state === "Karnataka")?.length || 3;
  const unresolvedCount = pendingCount || pendingResolutions?.length || 1;

  const activityFeed = [
    {
      id: 1,
      title: "Phone Intercept Logged",
      desc: "Call flagged between Pune (+91-9822019900) and Bengaluru (+91-9845012345)",
      time: "12 mins ago",
      tag: "MH ↔ KA Link",
      accent: "text-sky-400 bg-sky-500/10 border-sky-500/20"
    },
    {
      id: 2,
      title: "Vehicle Sighting Alert",
      desc: "Suspect vehicle MH-12-Q-4004 scanned at Kognoli Toll Plaza (State border)",
      time: "48 mins ago",
      tag: "Border Transit",
      accent: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    },
    {
      id: 3,
      title: "New Case Recorded",
      desc: "Bund Garden Police Station registered counterfeit stamp seizure case",
      time: "2 hours ago",
      tag: "Pune Case",
      accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      id: 4,
      title: "Evidence Logged",
      desc: "Digital evidence tamper-proof ledger certificate recorded for court filing",
      time: "3 hours ago",
      tag: "Court Ready",
      accent: "text-purple-400 bg-purple-500/10 border-purple-500/20"
    }
  ];

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-4 sm:space-y-6 font-sans">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Case Dashboard
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live System
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-state criminal network intelligence and live case tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab("graph")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Orbit size={14} />
              <span>Open Network Map</span>
              <ArrowUpRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Tracked Suspects */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Tracked Suspects</span>
            <Users size={16} className="text-sky-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">
              {totalNodesCount} <span className="text-xs text-slate-400 font-normal">Persons</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-emerald-400 font-medium">{mhCount} Maharashtra</span>
              <span>•</span>
              <span className="text-sky-400 font-medium">{kaCount} Karnataka</span>
            </div>
          </div>
          <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden mt-3 flex">
            <div style={{ width: `${(mhCount / totalNodesCount) * 100}%` }} className="bg-emerald-500 h-full"></div>
            <div style={{ width: `${(kaCount / totalNodesCount) * 100}%` }} className="bg-sky-500 h-full"></div>
          </div>
        </div>

        {/* Card 2: Primary Target (Kingpin) */}
        <div
          onClick={() => {
            if (kingpinNode && onSelectNode) onSelectNode(kingpinNode.id);
            else if (onNavigateTab) onNavigateTab("graph");
          }}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-md flex flex-col justify-between hover:border-slate-700 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Primary Target</span>
            <Orbit size={16} className="text-amber-400" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-amber-300 truncate mb-1">
              {kingpinName}
            </div>
            <div className="text-xs text-slate-400">
              Risk Level: <strong className="text-red-400 font-semibold">Critical (Orbit 0)</strong>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Network Centrality</span>
            <span className="text-amber-400 font-bold">Highest Control</span>
          </div>
        </div>

        {/* Card 3: Cross-State Links */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Cross-State Links</span>
            <MapPin size={16} className="text-purple-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-300 mb-1">
              {stats.cross_state_entities || 3} <span className="text-xs text-slate-400 font-normal">Conduits</span>
            </div>
            <div className="text-xs text-slate-400">
              Corridor: <span className="text-purple-300 font-medium">Pune ↔ Belgaum ↔ Bengaluru</span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Inter-State Highway</span>
            <span className="text-purple-400 font-bold">NH-48 Transit</span>
          </div>
        </div>

        {/* Card 4: Pending Identity Matches */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Identity Matches</span>
            <Shield size={16} className="text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">
              {unresolvedCount} <span className="text-xs text-slate-400 font-normal">To Review</span>
            </div>
            <div className="text-xs text-slate-400">
              Shared phones & vehicle evidence
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Officer Action</span>
            <span className="text-emerald-400 font-bold">Requires Approval</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Structure & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left Column: Network Hierarchy & Route */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          
          {/* Card: Network Hierarchy */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-white">
                  Network Hierarchy
                </h2>
                <p className="text-xs text-slate-400">
                  Key figures organized by operational control and influence
                </p>
              </div>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab("graph")}
                  className="text-xs text-amber-400 hover:text-amber-300 transition flex items-center gap-1 cursor-pointer font-medium"
                >
                  <span>View Map</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {/* Level 0 */}
              <div
                onClick={() => kingpinNode && onSelectNode && onSelectNode(kingpinNode.id)}
                className="p-3 rounded-xl bg-slate-950/80 border border-red-500/30 flex items-center justify-between hover:border-red-500/50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold text-xs">
                    0
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{kingpinName}</span>
                      <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.2 rounded border border-red-500/30">
                        Kingpin
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Controls inter-state communication and cash distribution
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs text-red-400 font-bold shrink-0">
                  Risk: 95
                </div>
              </div>

              {/* Level 1 */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>State Lieutenants</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                        Lieutenants
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Sanjay Gaikwad (Mumbai) • Tabrez Telgi (Bengaluru)
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs text-amber-400 font-bold shrink-0">
                  Risk: 85-88
                </div>
              </div>

              {/* Level 2 */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Couriers, Vehicles & Phones</span>
                      <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded border border-sky-500/30">
                        Logistics
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Mohd. Aslam, Transit Sedans (MH-12-Q-4004), Burner Phones
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs text-sky-400 font-bold shrink-0">
                  Risk: 70-79
                </div>
              </div>
            </div>
          </div>

          {/* Card: Transit Corridor */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin size={15} className="text-purple-400" />
                <span>Inter-State Transit Corridor (NH-48)</span>
              </h2>
              <span className="text-xs text-slate-400">840 km Highway</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Documented transit route connecting key police jurisdictions:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-emerald-400 block font-semibold">Maharashtra Hub</span>
                <span className="font-bold text-white">Bund Garden PS</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Pune, Maharashtra</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/30">
                <span className="text-[10px] text-purple-400 block font-semibold">Border Checkpoint</span>
                <span className="font-bold text-white">Belgaum Market PS</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Kognoli Border</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-sky-400 block font-semibold">Karnataka Hub</span>
                <span className="font-bold text-white">Cubbon Park PS</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Bengaluru, Karnataka</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Recent Activity & Quick Actions */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          
          {/* Recent Activity */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity size={15} className="text-sky-400" />
                <span>Recent Activity</span>
              </h2>
              <span className="text-xs text-slate-400">Live feed</span>
            </div>

            <div className="space-y-2.5">
              {activityFeed.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{item.title}</span>
                    <span className="text-[10px] text-slate-400">{item.time}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="pt-1 flex items-center justify-between">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${item.accent}`}>
                      {item.tag}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Ref #{item.id}048
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-md space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Zap size={14} />
              <span>Quick Actions</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Quickly browse suspects or perform a targeted database query:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab("entities")}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-700 text-slate-200 hover:text-white transition text-center cursor-pointer font-semibold"
                >
                  View Suspects
                </button>
              )}
              {onOpenCypherModal && (
                <button
                  onClick={onOpenCypherModal}
                  className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition text-center cursor-pointer font-semibold"
                >
                  Database Search
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
