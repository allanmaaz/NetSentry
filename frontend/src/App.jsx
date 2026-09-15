import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import SolarSystemGraph from "./components/SolarSystemGraph";
import Galaxy3DGraph from "./components/Galaxy3DGraph";
import InspectorDrawer from "./components/InspectorDrawer";
import HITLReviewQueue from "./components/HITLReviewQueue";
import DossierModal from "./components/DossierModal";
import TimelinePlayer from "./components/TimelinePlayer";
import TacticalSimModal from "./components/TacticalSimModal";
import LiveIngestModal from "./components/LiveIngestModal";
import ModelMetricsModal from "./components/ModelMetricsModal";
import UploadDatasetModal from "./components/UploadDatasetModal";
import LoginOverlay from "./components/LoginOverlay";
import AuditLogPanel from "./components/AuditLogPanel";
import EdgeEvidenceModal from "./components/EdgeEvidenceModal";
import {
  fetchGraph,
  fetchEntityDetail,
  fetchPendingResolutions,
  submitResolutionDecision,
  reloadDatasets,
  simulateArrest
} from "./services/api";
import { bfsShortestPath, pathNodeNames } from "./services/pathFinder";

// T3.1 — audit log persistence key
const AUDIT_KEY = "netsentry_audit_log";
const loadAuditLog = () => {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]");
  } catch {
    return [];
  }
};

export default function App() {
  const [graphData, setGraphData] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [entityDetail, setEntityDetail] = useState(null);
  const [pendingResolutions, setPendingResolutions] = useState([]);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [dossierEntity, setDossierEntity] = useState(null);

  // New High-Impact Tactical Features
  const [isTacticalModalOpen, setIsTacticalModalOpen] = useState(false);
  const [tacticalResult, setTacticalResult] = useState(null);
  const [neutralizedNodeId, setNeutralizedNodeId] = useState(null);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [timelineProgress, setTimelineProgress] = useState(100);
  const [viewMode, setViewMode] = useState("2d"); // "2d" | "3d"

  const [filterState, setFilterState] = useState("all");
  const [filterTier, setFilterTier] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // T3.2 — RBAC officer session (sessionStorage)
  const [officer, setOfficer] = useState(() => {
    try {
      const raw = sessionStorage.getItem("netsentry_officer");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // T2.3 — PII redaction mode
  const [redactionMode, setRedactionMode] = useState(false);

  // T3.1 — Immutable audit trail (localStorage)
  const [auditLog, setAuditLog] = useState(loadAuditLog);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const officerRef = useRef(officer);
  officerRef.current = officer;

  // T5.3 — BFS traced path state
  const [tracedPath, setTracedPath] = useState([]);

  // T2.2 — Edge detail evidence modal state
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [isEdgeModalOpen, setIsEdgeModalOpen] = useState(false);

  // T4.7 — View transition state (300ms fade-out → fade-in)
  const [viewTransitioning, setViewTransitioning] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // T3.1 — append audit entry: [ISO timestamp] [Officer / Role] [Action] [Target]
  const logAudit = (action, target, actionType = "node_click") => {
    const off = officerRef.current;
    const entry = {
      timestamp: new Date().toISOString(),
      officerName: off?.name || "Unknown",
      officerRole: off?.role || "—",
      action,
      target,
      actionType
    };
    setAuditLog((prev) => {
      const next = [...prev, entry];
      try {
        localStorage.setItem(AUDIT_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn("audit persist failed:", e);
      }
      return next;
    });
  };

  const handleExportAudit = () => {
    const lines = auditLog
      .slice()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map((e) => `[${e.timestamp}] [${e.officerName} / ${e.officerRole}] [${e.action}] [${e.target}]`);
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "netsentry_audit_log.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [gData, pData] = await Promise.all([
        fetchGraph(),
        fetchPendingResolutions()
      ]);
      // T4.2 — merge locally persisted ingested nodes so they survive refresh
      let merged = gData;
      try {
        const local = JSON.parse(localStorage.getItem("netsentry_ingested_nodes") || "[]");
        if (local.length > 0 && gData?.nodes) {
          const ids = new Set(gData.nodes.map((n) => n.id));
          const fresh = local.filter((n) => !ids.has(n.id));
          merged = { ...gData, nodes: [...gData.nodes, ...fresh] };
        }
      } catch (e) {
        console.warn("ingested nodes restore failed:", e);
      }
      setGraphData(merged);
      setPendingResolutions(pData || []);

      // Auto-select Kingpin on initial load
      const kingpinNode = merged?.nodes?.find((n) => n.orbit_level === 0) || merged?.nodes?.[0];
      if (kingpinNode) {
        setSelectedNodeId(kingpinNode.id);
        const detail = await fetchEntityDetail(kingpinNode.id);
        setEntityDetail(detail);
        setIsInspectorOpen(true);
      }
    } catch (err) {
      console.warn("NetSentry initialization note:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // T3.1 — keyboard shortcut "A" toggles audit panel
  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === "a" || e.key === "A") && !e.ctrlKey && !e.metaKey) {
        const tag = (e.target?.tagName || "").toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select") return;
        setIsAuditOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogin = (off) => {
    setOfficer(off);
    logAudit("OFFICER_LOGIN", `${off.name}`, "login");
    showToast(`Welcome, ${off.name} (${off.role}). Session bound to Section 65B audit.`);
  };

  const handleSelectNode = async (nodeId) => {
    setSelectedNodeId(nodeId);
    try {
      const detail = await fetchEntityDetail(nodeId);
      setEntityDetail(detail);
      setIsInspectorOpen(true);
      logAudit("NODE_INSPECT", detail?.canonical_name || nodeId, "node_click");
    } catch (err) {
      console.error("Failed to fetch entity details:", err);
    }
  };

  const handleResolve = async (candidateId, action) => {
    try {
      const res = await submitResolutionDecision(candidateId, action);
      logAudit(action === "MERGE" ? "HITL_CONFIRM_MERGE" : "HITL_REJECT_MATCH", candidateId, "hitl");
      showToast(`Adjudication confirmed: ${action} successfully committed to database.`);
      // Reload graph and pending list from database
      const [gData, pData] = await Promise.all([
        fetchGraph(),
        fetchPendingResolutions()
      ]);
      setGraphData(gData);
      setPendingResolutions(pData);

      if (res.canonical_id) {
        handleSelectNode(res.canonical_id);
      }
    } catch (err) {
      console.error("Adjudication failed:", err);
      showToast("Adjudication failed to submit.");
    }
  };

  const handleReload = async () => {
    try {
      await reloadDatasets();
      setNeutralizedNodeId(null);
      showToast("Investigation database synchronized and re-indexed.");
      await loadData();
    } catch (err) {
      console.error("Reload failed:", err);
      showToast("Failed to reload database.");
    }
  };

  const handleOpenDossier = (entity) => {
    // T3.2 — Analyst role locked out of Section 65B export
    if (officer?.role === "Analyst") {
      showToast("Section 65B Export locked for Analyst role — Supervisory Officer required.");
      return;
    }
    setDossierEntity(entity);
    setIsDossierOpen(true);
    logAudit("65B_DOSSIER_EXPORT", entity?.canonical_name || entity?.id, "export");
  };

  const handleSimulateArrest = async (nodeId) => {
    try {
      showToast("Running Network Fragmentation Graph Analysis...");
      const sim = await simulateArrest(nodeId);
      setTacticalResult(sim);
      setIsTacticalModalOpen(true);
      logAudit("ARREST_SIMULATION", sim?.neutralized_target?.name || nodeId, "arrest");
    } catch (err) {
      console.error("Failed to simulate arrest:", err);
      showToast("Arrest simulation failed.");
    }
  };

  const handleApplyNeutralize = (nodeId) => {
    setNeutralizedNodeId(nodeId);
    setIsTacticalModalOpen(false);
    logAudit("TARGET_NEUTRALIZED", nodeId, "arrest");
    showToast(`Tactical neutralization confirmed: Target marked as ARRESTED. Network routes severed.`);
  };

  const handleIngestSuccess = (newNode) => {
    if (!newNode) return;
    // T4.2 — persist ingested node in localStorage so it survives refresh
    try {
      const existing = JSON.parse(localStorage.getItem("netsentry_ingested_nodes") || "[]");
      existing.push(newNode);
      localStorage.setItem("netsentry_ingested_nodes", JSON.stringify(existing));
    } catch (e) {
      console.warn("ingested persist failed:", e);
    }
    logAudit("FIR_INGEST_SPAWN", newNode.name || newNode.id, "ingest");
    loadData();
    showToast(`Live FIR narrative ingested: '${newNode.name}' committed to database.`);
  };

  // T5.3 — BFS shortest path trace handler
  const handleTracePath = (sourceId, targetId) => {
    const nodes = graphData?.nodes || [];
    const edges = graphData?.edges || graphData?.links || [];
    const path = bfsShortestPath(nodes, edges, sourceId, targetId);
    if (!path) {
      showToast("No connected path found between the selected nodes.");
      setTracedPath([]);
      return;
    }
    setTracedPath(path);
    const names = pathNodeNames(path, nodes);
    logAudit("BFS_PATH_TRACE", `${names[0]} → ${names[names.length - 1]} (${path.length - 1} hops)`, "node_click");
    showToast(`Path traced: ${path.length - 1} hop(s) — ${names.join(" → ")}`);
  };

  // T4.7 — view switch with 300ms fade-out → fade-in
  const handleViewModeChange = (mode) => {
    if (mode === viewMode) return;
    setViewTransitioning(true);
    setTimeout(() => {
      setViewMode(mode);
      setViewTransitioning(false);
    }, 300);
  };

  // T3.2 — login gate: full-screen overlay until authenticated
  if (!officer) {
    return <LoginOverlay onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-100 select-none">
      {/* Top Header */}
      <Header
        nodes={graphData?.nodes || []}
        stats={graphData?.stats}
        onSelectNode={handleSelectNode}
        filterState={filterState}
        onFilterStateChange={setFilterState}
        filterTier={filterTier}
        onFilterTierChange={setFilterTier}
        onReloadData={handleReload}
        onOpenIngest={() => setIsIngestModalOpen(true)}
        onOpenMetrics={() => setIsMetricsModalOpen(true)}
        onOpenUploadCsv={() => setIsUploadModalOpen(true)}
        isLoading={isLoading}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        redactionMode={redactionMode}
        onToggleRedaction={() => setRedactionMode((v) => !v)}
        officer={officer}
        onOpenAudit={() => setIsAuditOpen((v) => !v)}
        userRole={officer?.role}
      />

      {/* Main Solar System Graph Workspace */}
      <main id="graph-workspace" className="relative flex-1 w-full h-full overflow-hidden">
        {isLoading && !graphData ? (
          <div className="flex flex-col items-center justify-center w-full h-full gap-4">
            {/* T4.7 — skeleton loader while graph initializes */}
            <div className="skeleton-loader">
              <div className="skeleton-circle"></div>
              <div className="skeleton-circle"></div>
              <div className="skeleton-circle"></div>
              <div className="skeleton-circle"></div>
              <div className="skeleton-circle"></div>
            </div>
            <div className="text-slate-500 font-mono text-sm">
              Connecting to NetSentry Intelligence Database...
            </div>
          </div>
        ) : (
          <div className={`w-full h-full ${viewTransitioning ? "view-transition-out" : "view-transition-in"}`}>
            {viewMode === "3d" ? (
              <Galaxy3DGraph
                data={graphData}
                selectedNodeId={selectedNodeId}
                onSelectNode={handleSelectNode}
                filterState={filterState}
                filterTier={filterTier}
                neutralizedNodeId={neutralizedNodeId}
                timeProgress={timelineProgress}
              />
            ) : (
              <SolarSystemGraph
                data={graphData}
                selectedNodeId={selectedNodeId}
                onSelectNode={handleSelectNode}
                filterState={filterState}
                filterTier={filterTier}
                neutralizedNodeId={neutralizedNodeId}
                timeProgress={timelineProgress}
                tracedPath={tracedPath}
                onSelectEdge={(edge) => {
                  setSelectedEdge(edge);
                  setIsEdgeModalOpen(true);
                }}
              />
            )}
          </div>
        )}

        {/* T5.3 — BFS path summary panel (hop count + intermediate nodes) */}
        {tracedPath.length >= 2 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 max-w-xl w-[90%]">
            <div className="path-summary-panel shadow-xl animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-800 font-mono">
                  BFS PATH TRACE • {tracedPath.length - 1} HOP{tracedPath.length - 1 === 1 ? "" : "S"}
                </span>
                <button
                  onClick={() => setTracedPath([])}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 font-mono"
                >
                  ✕ CLEAR
                </button>
              </div>
              <div className="mt-1.5 text-xs text-slate-700 font-mono leading-relaxed">
                {pathNodeNames(tracedPath, graphData?.nodes || []).join("  →  ")}
              </div>
            </div>
          </div>
        )}

        {/* Temporal Timeline Playback Scrubber */}
        <TimelinePlayer onTimeChange={(val) => setTimelineProgress(val)} />

        {/* Right Inspector Drawer */}
        <InspectorDrawer
          entity={entityDetail}
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          onOpenDossier={handleOpenDossier}
          onSimulateArrest={handleSimulateArrest}
          onTracePath={handleTracePath}
          graphNodes={graphData?.nodes || []}
          redactionMode={redactionMode}
        />

        {/* T3.1 — Slide-out audit trail panel */}
        <AuditLogPanel
          entries={auditLog}
          isOpen={isAuditOpen}
          onClose={() => setIsAuditOpen(false)}
          onExport={handleExportAudit}
        />

        {/* Bottom HITL Review Queue */}
        <div id="hitl-adjudication">
          <HITLReviewQueue
            candidates={pendingResolutions}
            onResolve={handleResolve}
            isProcessing={isLoading}
            userRole={officer?.role}
          />
        </div>

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-2xl text-xs font-mono border border-slate-700 z-50 animate-bounce">
            {toastMessage}
          </div>
        )}
      </main>

      {/* Accessible Semantic SEO Footer */}
      <footer className="h-7 bg-white border-t border-slate-200 px-5 flex items-center justify-between text-[11px] text-slate-500 font-mono shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span>NetSentry Platform v1.0</span>
          <span className="text-slate-300">•</span>
          <span>Section 65B Compliant</span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">Smart India Hackathon 2026</span>
        </div>
        <nav aria-label="Quick Access Navigation" className="flex items-center gap-3">
          <a href="#graph-workspace" className="hover:text-slate-900 transition">Canvas</a>
          <span className="text-slate-300">•</span>
          <a href="#hitl-adjudication" className="hover:text-slate-900 transition">Adjudication</a>
          <span className="text-slate-300">•</span>
          <a href="https://github.com/allanmaaz/NetSentry" target="_blank" rel="noopener noreferrer" className="hover:text-sky-600 transition">GitHub</a>
          <span className="text-slate-300">•</span>
          <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-sky-600 transition">Sitemap</a>
        </nav>
      </footer>


      {/* Section 65B Court Dossier Modal */}
      <DossierModal
        entity={dossierEntity}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
      />

      {/* Tactical Arrest Impact Modal */}
      <TacticalSimModal
        result={tacticalResult}
        isOpen={isTacticalModalOpen}
        onClose={() => setIsTacticalModalOpen(false)}
        onApplyNeutralize={handleApplyNeutralize}
        isNeutralized={neutralizedNodeId === tacticalResult?.neutralized_target?.id}
      />

      {/* Live FIR Narrative Ingestion Modal */}
      <LiveIngestModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onIngestSuccess={handleIngestSuccess}
      />

      {/* AI Model Evaluation & Training Metrics Modal */}
      <ModelMetricsModal
        isOpen={isMetricsModalOpen}
        onClose={() => setIsMetricsModalOpen(false)}
      />

      {/* Real CSV Law Enforcement Dataset Ingestion Modal */}
      <UploadDatasetModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={loadData}
      />

      {/* T2.2 — Edge Click Call / Transaction Evidence Detail Modal */}
      <EdgeEvidenceModal
        isOpen={isEdgeModalOpen}
        onClose={() => setIsEdgeModalOpen(false)}
        edge={selectedEdge}
        onSelectNode={handleSelectNode}
      />
    </div>
  );
}
