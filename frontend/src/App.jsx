import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import SolarSystemGraph from "./components/SolarSystemGraph";
import InspectorDrawer from "./components/InspectorDrawer";
import HITLReviewQueue from "./components/HITLReviewQueue";
import DossierModal from "./components/DossierModal";
import TimelinePlayer from "./components/TimelinePlayer";
import TacticalSimModal from "./components/TacticalSimModal";
import LiveIngestModal from "./components/LiveIngestModal";
import ModelMetricsModal from "./components/ModelMetricsModal";
import UploadDatasetModal from "./components/UploadDatasetModal";
import {
  fetchGraph,
  fetchEntityDetail,
  fetchPendingResolutions,
  submitResolutionDecision,
  reloadDatasets,
  simulateArrest
} from "./services/api";

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
      />

      {/* Main Solar System Graph Workspace */}
      <main id="graph-workspace" className="relative flex-1 w-full h-full overflow-hidden">
        {isLoading && !graphData ? (
          <div className="flex items-center justify-center w-full h-full text-slate-500 font-mono text-sm">
            Connecting to NetSentry Intelligence Database...
          </div>
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
    </div>
  );
}
