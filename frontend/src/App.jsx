import React, { useState, useEffect } from "react";
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
import AuthModal, { DEMO_OFFICERS } from "./components/AuthModal";
import LoginPage from "./components/LoginPage";
import CypherConsoleModal from "./components/CypherConsoleModal";
import EdgeEvidenceModal from "./components/EdgeEvidenceModal";
import BlockchainLedgerModal from "./components/BlockchainLedgerModal";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import EntitiesView from "./components/EntitiesView";
import { getCustomIngestedData } from "./services/normalizer";
import { addBlock, initChain } from "./services/blockchainLedger";
import {
  fetchGraph,
  fetchEntityDetail,
  fetchPendingResolutions,
  submitResolutionDecision,
  reloadDatasets,
  simulateArrest,
  getStoredOfficer,
  setStoredOfficer,
  setAuthToken
} from "./services/api";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "graph" | "entities"
  const [currentOfficer, setCurrentOfficer] = useState(() => getStoredOfficer() || null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getStoredOfficer());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCypherModalOpen, setIsCypherModalOpen] = useState(false);
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
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [isEdgeModalOpen, setIsEdgeModalOpen] = useState(false);

  const [filterState, setFilterState] = useState("all");
  const [filterTier, setFilterTier] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSelectEdge = (edge) => {
    setSelectedEdge(edge);
    setIsEdgeModalOpen(true);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [gData, pData] = await Promise.all([
        fetchGraph(),
        fetchPendingResolutions()
      ]);

      // Merge persisted custom entities from localStorage (T4.2)
      const customData = getCustomIngestedData();
      if (customData?.nodes?.length > 0) {
        const existingNodeIds = new Set((gData.nodes || []).map((n) => n.id));
        const customNodesToAdd = customData.nodes.filter((n) => !existingNodeIds.has(n.id));
        gData.nodes = [...(gData.nodes || []), ...customNodesToAdd];
        gData.edges = [...(gData.edges || []), ...(customData.edges || [])];
        if (gData.stats) {
          gData.stats.total_nodes = gData.nodes.length;
          gData.stats.displayed_nodes = gData.nodes.length;
          gData.stats.total_edges = gData.edges.length;
        }
      }

      window.currentSyndicateData = gData;
      setGraphData(gData);
      setPendingResolutions(pData || []);

      // Auto-select Kingpin on initial load
      const kingpinNode = gData?.nodes?.find((n) => n.orbit_level === 0) || gData?.nodes?.[0];
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
    initChain(); // Initialize blockchain genesis block on first run
    loadData();
  }, []);

  const handleSelectNode = async (nodeId) => {
    setSelectedNodeId(nodeId);
    try {
      const detail = await fetchEntityDetail(nodeId);
      setEntityDetail(detail);
      setIsInspectorOpen(true);
    } catch (err) {
      console.error("Failed to fetch entity details:", err);
    }
  };

  const handleResolve = async (candidateId, action) => {
    try {
      const res = await submitResolutionDecision(candidateId, action);
      showToast(`Adjudication confirmed: ${action} successfully committed to database.`);

      // Record merge/reject in blockchain ledger
      addBlock(
        action === "MERGE" ? "HITL_MERGE_APPROVED" : "HITL_MERGE_REJECTED",
        `Entity ${action === "MERGE" ? "Merge Confirmed" : "Merge Rejected"} — HITL Adjudication`,
        { candidate_id: candidateId, action, officer: currentOfficer?.badge_id },
        currentOfficer
      );

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
    setDossierEntity(entity);
    setIsDossierOpen(true);
  };

  const handleSimulateArrest = async (nodeId) => {
    try {
      showToast("Running Network Fragmentation Graph Analysis...");
      const sim = await simulateArrest(nodeId);
      setTacticalResult(sim);
      setIsTacticalModalOpen(true);
    } catch (err) {
      console.error("Failed to simulate arrest:", err);
      showToast("Arrest simulation failed.");
    }
  };

  const handleApplyNeutralize = (nodeId) => {
    setNeutralizedNodeId(nodeId);
    setIsTacticalModalOpen(false);
    showToast(`Tactical neutralization confirmed: Target marked as ARRESTED. Network routes severed.`);

    // Record arrest simulation in blockchain ledger
    addBlock(
      "ARREST_SIMULATED",
      `Network Fragmentation Arrest Simulation — Node Neutralized`,
      { neutralized_node_id: nodeId, simulated_by: currentOfficer?.badge_id, network_impact: tacticalResult?.network_fragmentation_score },
      currentOfficer
    );
  };

  const handleIngestSuccess = (result) => {
    if (!result) return;
    const newNodes = result.nodes || [result];
    const newEdges = result.edges || [];

    setGraphData((prev) => {
      if (!prev) return prev;
      const existingIds = new Set(prev.nodes.map((n) => n.id));
      const filteredNodes = newNodes.filter((n) => !existingIds.has(n.id));
      const updated = {
        ...prev,
        nodes: [...prev.nodes, ...filteredNodes],
        edges: [...prev.edges, ...newEdges],
        stats: prev.stats
          ? {
              ...prev.stats,
              total_nodes: prev.nodes.length + filteredNodes.length,
              displayed_nodes: prev.nodes.length + filteredNodes.length,
              total_edges: prev.edges.length + newEdges.length
            }
          : prev.stats
      };
      window.currentSyndicateData = updated;
      return updated;
    });

    const firstNode = newNodes[0];
    showToast(`Live Ingest Verified: ${newNodes.length} suspect(s) inserted on Orbit II with glowing telemetry.`);

    // Record block in chain-of-custody ledger
    addBlock(
      "ENTITY_INGESTED",
      `${newNodes.length} Suspect(s) Ingested via Live FIR Pipeline`,
      { count: newNodes.length, names: newNodes.map(n => n.name || n.id), edges_added: newEdges.length },
      currentOfficer
    );

    if (firstNode) {
      handleSelectNode(firstNode.id);
    }
  };

  const handleLoginSuccess = (officer) => {
    setCurrentOfficer(officer);
    setStoredOfficer(officer);
    setIsAuthenticated(true);
    showToast(`Grid Access Authorized: ${officer.rank} ${officer.name}`);
  };

  const handleLogout = () => {
    setStoredOfficer(null);
    setAuthToken("");
    setCurrentOfficer(null);
    setIsAuthenticated(false);
  };

  const handleSelectOfficer = (officer) => {
    setCurrentOfficer(officer);
    setStoredOfficer(officer);
    showToast(`Active Officer: ${officer.rank} ${officer.name} (${officer.role})`);
  };

  // If not authenticated, present the full-screen Law Enforcement Login Portal
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex w-screen app-dvh overflow-hidden bg-slate-950 text-slate-100 select-none font-sans">
      {/* Persistent Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onTabChange={setActiveTab}
        currentOfficer={currentOfficer}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenIngest={() => setIsIngestModalOpen(true)}
        onOpenUploadCsv={() => setIsUploadModalOpen(true)}
        onOpenMetrics={() => setIsMetricsModalOpen(true)}
        onOpenCypherModal={() => setIsCypherModalOpen(true)}
        onOpenLedger={() => setIsLedgerOpen(true)}
        onLogout={handleLogout}
        pendingCount={pendingResolutions?.length || 0}
      />

      {/* Main Operational Container */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden bg-slate-950">
        {/* Top Contextual Header */}
        <Header
          activeTab={activeTab}
          nodes={graphData?.nodes || []}
          stats={graphData?.stats}
          onSelectNode={(id) => {
            handleSelectNode(id);
            setActiveTab("graph");
          }}
          filterState={filterState}
          onFilterStateChange={setFilterState}
          filterTier={filterTier}
          onFilterTierChange={setFilterTier}
          onReloadData={handleReload}
          isLoading={isLoading}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          currentOfficer={currentOfficer}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Dynamic Multi-View Workspace */}
        <div className="relative flex-1 w-full h-full overflow-hidden">
          {activeTab === "dashboard" && (
            <DashboardView
              stats={graphData?.stats}
              nodes={graphData?.nodes || []}
              links={graphData?.links || []}
              pendingCount={pendingResolutions?.length || 0}
              onSelectNode={(id) => {
                handleSelectNode(id);
                setActiveTab("graph");
              }}
              onNavigateTab={setActiveTab}
              currentOfficer={currentOfficer}
            />
          )}

          {activeTab === "entities" && (
            <EntitiesView
              nodes={graphData?.nodes || []}
              onSelectNode={(id) => {
                handleSelectNode(id);
                setActiveTab("graph");
              }}
              onOpenDossier={(entity) => {
                setDossierEntity(entity);
                setIsDossierOpen(true);
              }}
            />
          )}

          {activeTab === "graph" && (
            <main id="graph-workspace" className="relative flex-1 w-full h-full overflow-hidden">
              {isLoading && !graphData ? (
                <div className="flex items-center justify-center w-full h-full text-slate-500 font-mono text-sm">
                  Connecting to NetSentry Intelligence Database...
                </div>
              ) : viewMode === "3d" ? (
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
                  onSelectEdge={handleSelectEdge}
                  selectedEdge={selectedEdge}
                />
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
                currentOfficer={currentOfficer}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
              />

              {/* Bottom HITL Review Queue */}
              <div id="hitl-adjudication">
                <HITLReviewQueue
                  candidates={pendingResolutions}
                  onResolve={handleResolve}
                  isProcessing={isLoading}
                  currentOfficer={currentOfficer}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                />
              </div>
            </main>
          )}

          {/* Toast Notification Banner (Globally Visible) */}
          {toastMessage && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 max-w-[92vw] bg-slate-900/95 text-white px-4 py-2 rounded-xl shadow-2xl text-xs font-mono border border-slate-700 z-50 animate-bounce backdrop-blur-md text-center break-words">
              {toastMessage}
            </div>
          )}
        </div>

        {/* Accessible Semantic SEO Footer — hidden on phones (bottom nav replaces it) */}
        <footer className="h-7 bg-slate-950 border-t border-slate-800/80 px-5 hidden md:flex items-center justify-between text-[11px] text-slate-500 font-mono shrink-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">NetSentry Sovereign v2.0</span>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-400">BSA Section 65B Certified</span>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <span className="text-slate-500 hidden sm:inline">SIH 2026 Problem 26189</span>
          </div>
          <nav aria-label="Quick Access Navigation" className="flex items-center gap-3">
            <button onClick={() => setActiveTab("dashboard")} className={`hover:text-slate-200 transition ${activeTab === 'dashboard' ? 'text-indigo-400 font-bold' : ''}`}>Dashboard</button>
            <span className="text-slate-700">•</span>
            <button onClick={() => setActiveTab("graph")} className={`hover:text-slate-200 transition ${activeTab === 'graph' ? 'text-indigo-400 font-bold' : ''}`}>Graph</button>
            <span className="text-slate-700">•</span>
            <button onClick={() => setActiveTab("entities")} className={`hover:text-slate-200 transition ${activeTab === 'entities' ? 'text-indigo-400 font-bold' : ''}`}>Directory</button>
            <span className="text-slate-700">•</span>
            <a href="https://github.com/allanmaaz/NetSentry" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition">GitHub</a>
          </nav>
        </footer>
      </div>

      {/* Global Modals Accessible Across All Views */}
      <DossierModal
        entity={dossierEntity}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
      />

      <TacticalSimModal
        result={tacticalResult}
        isOpen={isTacticalModalOpen}
        onClose={() => setIsTacticalModalOpen(false)}
        onApplyNeutralize={handleApplyNeutralize}
        isNeutralized={neutralizedNodeId === tacticalResult?.neutralized_target?.id}
      />

      <LiveIngestModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onIngestSuccess={handleIngestSuccess}
      />

      <ModelMetricsModal
        isOpen={isMetricsModalOpen}
        onClose={() => setIsMetricsModalOpen(false)}
      />

      <UploadDatasetModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={loadData}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentOfficer={currentOfficer}
        onSelectOfficer={handleSelectOfficer}
      />

      <CypherConsoleModal
        isOpen={isCypherModalOpen}
        onClose={() => setIsCypherModalOpen(false)}
      />

      <EdgeEvidenceModal
        isOpen={isEdgeModalOpen}
        edge={selectedEdge}
        onClose={() => setIsEdgeModalOpen(false)}
        onSelectNode={(id) => {
          handleSelectNode(id);
          setIsEdgeModalOpen(false);
        }}
      />

      <BlockchainLedgerModal
        isOpen={isLedgerOpen}
        onClose={() => setIsLedgerOpen(false)}
      />
    </div>
  );
}
