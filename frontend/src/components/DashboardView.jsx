import React from "react";
import {
  Shield,
  Orbit,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Database,
  Crosshair,
  TrendingUp,
  MapPin,
  Phone,
  Car,
  FileText,
  Activity,
  Zap,
  CheckCircle2,
  Clock
} from "lucide-react";

export default function DashboardView({
  graphData,
  pendingResolutions,
  onNavigateTab,
  onOpenDossier,
  onSimulateArrest,
  onOpenIngest,
  onOpenCypherModal
}) {
  const stats = graphData?.stats || {
    total_nodes: 8,
    cross_state_entities: 3,
    avg_betweenness: 0.24,
    high_risk_entities: 5
  };

  const kingpinNode = graphData?.nodes?.find((n) => n.orbit_level === 0) || graphData?.nodes?.[0];
  const kingpinName = kingpinNode?.name || "Abdul Karim Telgi";

  const mhCount = graphData?.nodes?.filter((n) => n.state === "Maharashtra")?.length || 5;
  const kaCount = graphData?.nodes?.filter((n) => n.state === "Karnataka")?.length || 3;

  const activityFeed = [
    {
      id: 1,
      type: "INTERCEPT",
      title: "Telecom MSISDN Intercept",
      desc: "Intercepted call between +91-9822019900 (Pune) and +91-9845012345 (Bengaluru)",
      time: "12 mins ago",
      tag: "MH ↔ KA LINK",
      accent: "text-sky-400"
    },
    {
      id: 2,
      type: "VEHICLE",
      title: "Vehicle ANPR Transit Alert",
      desc: "Suspect vehicle MH-12-Q-4004 flagged passing Kognoli Toll Plaza (Belgaum border)",
      time: "48 mins ago",
      tag: "NH-48 CORRIDOR",
      accent: "text-amber-400"
    },
    {
      id: 3,
      type: "CHARGESHEET",
      title: "FIR Filed under Section 255/120B",
      desc: "Bund Garden Police Station logs counterfeit government stamp seized in transit",
      time: "2 hours ago",
      tag: "BUND GARDEN PS",
      accent: "text-emerald-400"
    },
    {
      id: 4,
      type: "AUDIT",
      title: "Section 65B Audit Certificate Stamped",
      desc: "Forensic SHA-256 evidence hash generated for judicial court submission",
      time: "3 hours ago",
      tag: "COURT READY",
      accent: "text-purple-400"
    }
  ];

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-900 text-slate-100 p-6 space-y-6 font-sans">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black font-mono tracking-tight text-white uppercase">
              EXECUTIVE INTELLIGENCE DASHBOARD
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              NATIONAL GRID LIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Cross-Jurisdiction Syndicate Correlation • Crime and Criminal Tracking Network & Systems (CCTNS)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab("graph")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold transition shadow-md cursor-pointer"
          >
            <Orbit size={14} />
            <span>LAUNCH CELESTIAL GRAPH</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* 4 Primary Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Syndicate Entities */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-bold uppercase">TRACKED ENTITIES</span>
            <Users size={16} className="text-sky-400" />
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-white mb-1">
              {stats.total_nodes} <span className="text-xs text-slate-400 font-sans font-normal">Operatives</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="text-emerald-400 font-bold">{mhCount} Maharashtra</span>
              <span>•</span>
              <span className="text-sky-400 font-bold">{kaCount} Karnataka</span>
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3 flex">
            <div style={{ width: `${(mhCount / stats.total_nodes) * 100}%` }} className="bg-emerald-500 h-full"></div>
            <div style={{ width: `${(kaCount / stats.total_nodes) * 100}%` }} className="bg-sky-500 h-full"></div>
          </div>
        </div>

        {/* Card 2: Kingpin Bottleneck (Orbit 0) */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-bold uppercase">KINGPIN (ORBIT 0)</span>
            <Orbit size={16} className="text-amber-400" />
          </div>
          <div>
            <div className="text-xl font-black font-mono text-amber-300 truncate mb-1">
              {kingpinName}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Betweenness Centrality: <strong className="text-red-400">0.892 (CRITICAL)</strong>
            </div>
          </div>
          <div className="mt-3 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>Central Cash Bottleneck</span>
            <span className="text-amber-400 font-bold">100% Loop Flow</span>
          </div>
        </div>

        {/* Card 3: Cross-Jurisdiction Conduits */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-bold uppercase">CROSS-BORDER LINKS</span>
            <MapPin size={16} className="text-purple-400" />
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-purple-300 mb-1">
              {stats.cross_state_entities} <span className="text-xs text-slate-400 font-sans font-normal">Conduits</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Corridor: <strong className="text-purple-300">Pune ↔ Belgaum ↔ Bengaluru</strong>
            </div>
          </div>
          <div className="mt-3 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>Inter-State Police Alert</span>
            <span className="text-purple-400 font-bold">NH-48 Transit</span>
          </div>
        </div>

        {/* Card 4: Pending HITL Reviews */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-bold uppercase">HITL ADJUDICATIONS</span>
            <Shield size={16} className="text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-white mb-1">
              {pendingResolutions?.length || 1} <span className="text-xs text-slate-400 font-sans font-normal">Pending</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Sec 65B Forensic Adjudication Queue
            </div>
          </div>
          <div className="mt-3 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>Evidence Verification</span>
            <span className="text-emerald-400 font-bold">Officer Sign-Off</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Syndicate Architecture & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns: Orbital Architecture & Cross-Border Corridors */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card: Syndicate Celestial Topology Overview */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                  SOLAR SYSTEM CRIMINAL TOPOLOGY HIERARCHY
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Concentric orbits determined by Betweenness Centrality bottleneck math
                </p>
              </div>
              <button
                onClick={() => onNavigateTab("graph")}
                className="text-xs font-mono text-amber-400 hover:text-amber-300 transition flex items-center gap-1 cursor-pointer"
              >
                <span>View Graph</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Orbit 0 */}
              <div className="p-3 rounded-xl bg-slate-900 border border-red-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-mono font-bold text-xs">
                    O-0
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>THE SUN // MASTERMIND BOTTLENECK</span>
                      <span className="text-[9px] font-mono bg-red-500/20 text-red-300 px-1.5 py-0.2 rounded border border-red-500/30">
                        ORBIT 0
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      {kingpinName} • Controls all interstate communication & cash flow
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono text-xs text-red-400 font-bold">
                  Score: 95/100
                </div>
              </div>

              {/* Orbit 1 */}
              <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-xs">
                    O-1
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>INNER PLANETS // STATE LIEUTENANTS</span>
                      <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                        ORBIT 1
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Sanjay Gaikwad (Mumbai) • Tabrez Telgi (Bengaluru)
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono text-xs text-amber-400 font-bold">
                  Score: 85-88
                </div>
              </div>

              {/* Orbit 2 */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-mono font-bold text-xs">
                    O-2
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>OUTER ORBIT // COURIERS, VEHICLES & SIMS</span>
                      <span className="text-[9px] font-mono bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded border border-sky-500/30">
                        ORBIT 2
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Mohd. Aslam, Burner MSISDNs, Transit Sedans (MH-12-Q-4004)
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono text-xs text-sky-400 font-bold">
                  Score: 70-79
                </div>
              </div>
            </div>
          </div>

          {/* Card: Cross-Border Crime Corridor (NH-48) */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin size={15} className="text-purple-400" />
                INTER-STATE TRANSIT CORRIDOR (NH-48)
              </h2>
              <span className="text-[10px] font-mono text-slate-400">840 km Pipeline</span>
            </div>
            <p className="text-xs text-slate-400 mb-4 font-sans">
              Vehicular transit & courier routes documented across Maharashtra and Karnataka chargesheets:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-emerald-400 block font-bold">NORTHERN HUB (MH)</span>
                <span className="font-bold text-white">Bund Garden PS</span>
                <span className="text-[10px] text-slate-500 block mt-1">Pune, Maharashtra</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-purple-500/30">
                <span className="text-[10px] text-purple-400 block font-bold">BORDER CONDUIT</span>
                <span className="font-bold text-white">Belgaum Market PS</span>
                <span className="text-[10px] text-slate-500 block mt-1">Kognoli Border Checkpoint</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-sky-400 block font-bold">SOUTHERN HUB (KA)</span>
                <span className="font-bold text-white">Cubbon Park PS</span>
                <span className="text-[10px] text-slate-500 block mt-1">Bengaluru, Karnataka</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right 5 Columns: Live Activity Feed & Quick Actions */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Recent Chronological Intelligence Feed */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                <Activity size={15} className="text-sky-400" />
                INTELLIGENCE ACTIVITY FEED
              </h2>
              <span className="text-[10px] font-mono text-slate-500">Live CCTNS Sync</span>
            </div>

            <div className="space-y-3">
              {activityFeed.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{item.title}</span>
                    <span className="text-[9px] font-mono text-slate-500">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {item.desc}
                  </p>
                  <div className="pt-1 flex items-center justify-between">
                    <span className={`text-[9px] font-mono font-bold ${item.accent}`}>
                      {item.tag}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">
                      CCTNS REF #{item.id}048
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tactical Action Launcher */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase">
              <Zap size={14} />
              QUICK TACTICAL OPERATIONS
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Launch instant arrest simulations or query the criminal graph directly via Cypher:
            </p>

            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <button
                onClick={() => onNavigateTab("entities")}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white transition text-center cursor-pointer font-bold"
              >
                Suspects Directory
              </button>
              <button
                onClick={onOpenCypherModal}
                className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition text-center cursor-pointer font-bold"
              >
                Neo4j Cypher Console
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
