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
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import EntitiesView from "./components/EntitiesView";
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

  const [filterState, setFilterState] = useState("all");
  const [filterTier, setFilterTier] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [gData, pData] = await Promise.all([
        fetchGraph(),
        fetchPendingResolutions()
      ]);
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
  };

  const handleIngestSuccess = (newNode) => {
    if (!newNode) return;
    loadData();
    showToast(`Live FIR narrative ingested: '${newNode.name}' committed to database.`);
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
    <div className="flex w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 select-none font-sans">
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
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-4 py-2 rounded-xl shadow-2xl text-xs font-mono border border-slate-700 z-50 animate-bounce backdrop-blur-md">
              {toastMessage}
            </div>
          )}
        </div>

        {/* Accessible Semantic SEO Footer */}
        <footer className="h-7 bg-slate-950 border-t border-slate-800/80 px-5 flex items-center justify-between text-[11px] text-slate-500 font-mono shrink-0 z-20">
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
    </div>
  );
}
