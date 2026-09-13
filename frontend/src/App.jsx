import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import SolarSystemGraph from "./components/SolarSystemGraph";
import InspectorDrawer from "./components/InspectorDrawer";
import HITLReviewQueue from "./components/HITLReviewQueue";
import DossierModal from "./components/DossierModal";
import {
  fetchGraph,
  fetchEntityDetail,
  fetchPendingResolutions,
  submitResolutionDecision,
  reloadDatasets
} from "./services/api";

export default function App() {
  const [graphData, setGraphData] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [entityDetail, setEntityDetail] = useState(null);
  const [pendingResolutions, setPendingResolutions] = useState([]);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [dossierEntity, setDossierEntity] = useState(null);

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
      showToast(`Adjudication confirmed: ${action} successfully applied to graph.`);
      // Reload graph and pending list to show real-time node collapse
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
      showToast("Datasets regenerated! Deccan-Konkan syndicate reset.");
      await loadData();
    } catch (err) {
      console.error("Reload failed:", err);
      showToast("Failed to reload datasets.");
    }
  };

  const handleOpenDossier = (entity) => {
    setDossierEntity(entity);
    setIsDossierOpen(true);
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-100 select-none">
      {/* Top Header */}
      <Header
        stats={graphData?.stats}
        filterState={filterState}
        onFilterStateChange={setFilterState}
        filterTier={filterTier}
        onFilterTierChange={setFilterTier}
        onReloadData={handleReload}
        isLoading={isLoading}
      />

      {/* Main Solar System Graph Workspace */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {isLoading && !graphData ? (
          <div className="flex items-center justify-center w-full h-full text-slate-500 font-mono text-sm">
            Initializing NetSentry Graph Canvas...
          </div>
        ) : (
          <SolarSystemGraph
            data={graphData}
            selectedNodeId={selectedNodeId}
            onSelectNode={handleSelectNode}
            filterState={filterState}
            filterTier={filterTier}
          />
        )}

        {/* Right Inspector Drawer */}
        <InspectorDrawer
          entity={entityDetail}
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          onOpenDossier={handleOpenDossier}
        />

        {/* Bottom HITL Review Queue */}
        <HITLReviewQueue
          candidates={pendingResolutions}
          onResolve={handleResolve}
          isProcessing={isLoading}
        />

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-2xl text-xs font-mono border border-slate-700 z-50 animate-bounce">
            {toastMessage}
          </div>
        )}
      </main>

      {/* Section 65B Dossier Modal */}
      <DossierModal
        entity={dossierEntity}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
      />
    </div>
  );
}
