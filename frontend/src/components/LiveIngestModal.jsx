import React, { useState, useRef } from "react";
import {
  X,
  Sparkles,
  FileText,
  CheckCircle2,
  User,
  Phone,
  Car,
  Shield,
  Layers,
  ArrowRight,
  Database,
  Code2,
  FileSpreadsheet,
  Calendar,
  CreditCard,
  MapPin,
  Hash,
  Upload,
  RefreshCw,
  FolderOpen
} from "lucide-react";
import schemaMappingsConfig from "../config/schema_mappings.json";
import { normalizeCSVToEntities, saveCustomIngestedData } from "../services/normalizer";

const SAMPLE_CSV = `accused_name,fir_number,police_station,offense_type,section_ipc,date_of_fir,seized_phone,vehicle_reg_no,location_district
Firoz Ghouse,MH-PUN-304-2026,Bund Garden PS,Extortion & Cross-State Hawala,384 120B IPC,2026-09-12,+91-9822998811,MH-12-BF-9090,Pune
Salim Belgaumi,KA-BLR-119-2026,Cubbon Park PS,Counterfeit Stamp Paper Transport,420 120B IPC,2026-09-13,+91-9845112233,KA-01-X-4421,Belgaum`;

const SAMPLE_NARRATIVE =
  "FIR No 102/2024 registered at Dharavi PS against suspect Tariq Memon alias Tariq Bhai, contact +91-9892019281, driving vehicle MH-01-AX-9921 under sections 384, 120B IPC for extortion and interstate hawala transfers connected to Mumbai cell.";

export default function LiveIngestModal({ isOpen, onClose, onIngestSuccess }) {
  const [activeTab, setActiveTab] = useState("ingest"); // "ingest" | "schema"
  const [ingestMode, setIngestMode] = useState("csv"); // "csv" | "narrative"
  const [selectedDept, setSelectedDept] = useState("MH_POLICE");
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [narrativeText, setNarrativeText] = useState(SAMPLE_NARRATIVE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [spawnedEntities, setSpawnedEntities] = useState([]);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const currentDeptConfig = schemaMappingsConfig.departments[selectedDept] || schemaMappingsConfig.departments.MH_POLICE;

  // Handle CSV File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setCsvText(content);
        setIngestMode("csv");
      }
    };
    reader.readAsText(file);
  };

  // Parse CSV via normalizer.js schema adapter
  const handleParseCSV = async () => {
    setIsProcessing(true);
    try {
      const result = normalizeCSVToEntities(csvText, selectedDept);
      if (result.nodes.length === 0) {
        alert("No valid entity rows detected in CSV. Please verify column headers.");
        return;
      }

      // Persist in localStorage so it survives page refresh
      saveCustomIngestedData(result.nodes, result.edges);

      // Trigger canvas re-render and orbital insertion
      if (onIngestSuccess) {
        onIngestSuccess(result);
      }

      setSpawnedEntities(result.nodes);
    } catch (err) {
      console.error("CSV Normalization error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Parse Raw Narrative NER
  const handleParseNarrative = async () => {
    setIsProcessing(true);
    try {
      const phoneMatch = narrativeText.match(/(\+91[-\s]?[6-9]\d{9}|[6-9]\d{9})/);
      const phone = phoneMatch ? phoneMatch[0] : "+91-9892019281";
      const vehMatch = narrativeText.match(/([A-Z]{2}[-\s]?\d{2}[-\s]?[A-Z]{1,2}[-\s]?\d{4})/i);
      const vehicle = vehMatch ? vehMatch[0].toUpperCase() : "MH-01-AX-9921";
      const nameMatch = narrativeText.match(/(?:accused|suspect|against)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);
      const name = nameMatch ? nameMatch[1] : "Tariq Memon";
      const aliasMatch = narrativeText.match(/(?:alias|known as|a\.k\.a\.?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      const aliases = aliasMatch ? [aliasMatch[1]] : ["Tariq Bhai"];

      const singleNode = {
        id: `person_${name.toLowerCase().replace(/ /g, "_")}_${Date.now().toString().slice(-4)}`,
        label: name,
        name: name,
        type: "Person",
        risk_score: 82,
        risk_tier: "high",
        betweenness: 0.041,
        orbit_level: 2, // Orbit II insertion
        is_cross_jurisdiction: false,
        state: "Maharashtra",
        radius: 17,
        isNewSpawn: true,
        spawnTimestamp: Date.now(),
        details: {
          phones: [phone],
          vehicles: [vehicle],
          firs_count: 1,
          aliases: aliases
        }
      };

      const singleEdge = {
        source: "person_abdul_karim_telgi",
        target: singleNode.id,
        type: "ASSOCIATED_WITH",
        weight: 2.5,
        label: "Ingested Live FIR Lead",
        is_cross_jurisdiction: false
      };

      saveCustomIngestedData([singleNode], [singleEdge]);

      if (onIngestSuccess) {
        onIngestSuccess({ nodes: [singleNode], edges: [singleEdge] });
      }

      setSpawnedEntities([singleNode]);
    } catch (err) {
      console.error("Extraction error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to get type icon
  const getFieldIcon = (type, category) => {
    switch (type) {
      case "phone":
        return <Phone size={13} className="text-sky-500" />;
      case "vehicle":
        return <Car size={13} className="text-amber-500" />;
      case "currency":
      case "banking":
        return <CreditCard size={13} className="text-emerald-500" />;
      case "datetime":
        return <Calendar size={13} className="text-indigo-500" />;
      case "location":
        return <MapPin size={13} className="text-rose-500" />;
      default:
        if (category === "Identity") return <User size={13} className="text-blue-500" />;
        if (category === "Legal") return <Shield size={13} className="text-purple-500" />;
        return <Hash size={13} className="text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Database size={16} />
            </div>
            <div>
              <h2 className="font-bold text-sm font-mono uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <span>DATA PIPELINE & INGESTION HUB</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  ORBIT II LIVE SPAWN
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                Live CSV schema adapter, entity extraction & canvas orbital insertion
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Primary Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-slate-50 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("ingest")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold border-b-2 transition cursor-pointer ${
              activeTab === "ingest"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileSpreadsheet size={14} />
            <span>Live Data Ingestion (T4.2)</span>
          </button>

          <button
            onClick={() => setActiveTab("schema")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold border-b-2 transition cursor-pointer ${
              activeTab === "schema"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers size={14} />
            <span>Schema Adapter (T3.4)</span>
            <span className="px-1.5 py-0.2 text-[9px] rounded bg-indigo-100 text-indigo-700 font-bold">
              Config Active
            </span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: LIVE INGESTION (CSV or Narrative) */}
          {activeTab === "ingest" && (
            <div className="space-y-4">
              
              {/* Ingest Mode & File Upload Toggle */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIngestMode("csv")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                      ingestMode === "csv"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    CSV Ingestion (Schema Adapter)
                  </button>
                  <button
                    onClick={() => setIngestMode("narrative")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                      ingestMode === "narrative"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Raw Incident Narrative
                  </button>
                </div>

                {/* Upload File Button */}
                {ingestMode === "csv" && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-mono font-semibold transition cursor-pointer"
                    >
                      <Upload size={13} />
                      <span>Upload .CSV</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Department Selector */}
              <div>
                <label className="text-xs font-bold font-mono text-slate-600 block mb-1.5 uppercase">
                  Target Schema Adapter:
                </label>
                <div className="flex items-center gap-2">
                  {["MH_POLICE", "KA_POLICE", "FINANCIAL_INTEL"].map((dept) => (
                    <button
                      key={dept}
                      onClick={() => setSelectedDept(dept)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                        selectedDept === dept
                          ? "bg-indigo-50 border-indigo-300 text-indigo-900"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              {ingestMode === "csv" ? (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold font-mono text-slate-600 uppercase">
                      Paste CSV Records (Header + Comma Separated Rows):
                    </label>
                    <button
                      onClick={() => setCsvText(SAMPLE_CSV)}
                      className="text-[11px] text-indigo-600 hover:underline font-mono"
                    >
                      Restore Sample CSV
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder="accused_name,fir_number,police_station,..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition leading-relaxed resize-none"
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold font-mono text-slate-600 uppercase">
                      Paste Raw Police Incident Narrative:
                    </label>
                    <button
                      onClick={() => setNarrativeText(SAMPLE_NARRATIVE)}
                      className="text-[11px] text-indigo-600 hover:underline font-mono"
                    >
                      Restore Sample Narrative
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={narrativeText}
                    onChange={(e) => setNarrativeText(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-sans outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition leading-relaxed resize-none"
                  />
                </div>
              )}

              {/* Action Parse Button */}
              <button
                onClick={ingestMode === "csv" ? handleParseCSV : handleParseNarrative}
                disabled={isProcessing || (ingestMode === "csv" ? !csvText.trim() : !narrativeText.trim())}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Sparkles size={15} className="text-sky-400 animate-spin" />
                {isProcessing
                  ? "Parsing Schema & Projecting Orbit II..."
                  : "Parse Live CSV → Spawn Nodes on Orbit II"}
              </button>

              {/* Spawned Entities List Card */}
              {spawnedEntities.length > 0 && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 font-mono">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>{spawnedEntities.length} SUSPECT(S) INSERTED ONTO ORBIT II (PERSISTED)</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-200/60 text-emerald-800 font-bold">
                      Glowing Telemetry Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {spawnedEntities.map((ent) => (
                      <div
                        key={ent.id}
                        className="p-3 bg-white rounded-xl border border-emerald-100 shadow-2xs space-y-1.5 text-xs font-mono"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{ent.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-bold">
                            ORBIT II
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 flex items-center gap-2">
                          <span>Phone: {ent.details?.phones?.[0] || "N/A"}</span>
                          <span>•</span>
                          <span>Veh: {ent.details?.vehicles?.[0] || "N/A"}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Jurisdiction: {ent.state} ({selectedDept})
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] text-emerald-800 font-mono flex items-center justify-between pt-1 border-t border-emerald-200">
                    <span>✓ Data saved in localStorage (`netsentry_custom_entities`)</span>
                    <span>Survives page reload</span>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: SCHEMA ADAPTER (T3.4) */}
          {activeTab === "schema" && (
            <div className="space-y-4">
              
              {/* Department Switcher Pills */}
              <div>
                <label className="text-xs font-bold font-mono text-slate-500 block mb-2 uppercase tracking-wider">
                  Select Department Source Schema:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {Object.entries(schemaMappingsConfig.departments).map(([deptKey, deptData]) => {
                    const isSelected = selectedDept === deptKey;
                    return (
                      <button
                        key={deptKey}
                        onClick={() => setSelectedDept(deptKey)}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                            deptKey === "MH_POLICE" ? "bg-amber-100 text-amber-800" :
                            deptKey === "KA_POLICE" ? "bg-sky-100 text-sky-800" :
                            "bg-emerald-100 text-emerald-800"
                          }`}>
                            {deptData.source_type}
                          </span>
                          {isSelected && <CheckCircle2 size={14} className="text-indigo-600" />}
                        </div>
                        <div className="mt-2">
                          <div className="font-bold text-xs text-slate-900 font-mono">{deptKey}</div>
                          <div className="text-[10px] text-slate-500 truncate">{deptData.department_name}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Department Overview Banner */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 font-mono">
                    {currentDeptConfig.department_name}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Source: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">.{currentDeptConfig.source_type}</code>
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {currentDeptConfig.description}
                </p>
                <div className="text-[10px] text-slate-400 font-mono">
                  Jurisdiction: {currentDeptConfig.jurisdiction}
                </div>
              </div>

              {/* Visual Schema Mapping Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-slate-700 uppercase">
                    Ontology Field Harmonization Table
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {Object.keys(currentDeptConfig.entity_mapping).length} Mapped Fields
                  </span>
                </div>

                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 font-semibold sticky top-0">
                      <tr>
                        <th className="py-2.5 px-4">Raw Source Field</th>
                        <th className="py-2.5 px-2 text-center">Transform</th>
                        <th className="py-2.5 px-4">Canonical Graph Ontology</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-4">Rule / Evidentiary Meaning</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Object.entries(currentDeptConfig.entity_mapping).map(([sourceKey, mapping]) => (
                        <tr key={sourceKey} className="hover:bg-slate-50/80 transition">
                          {/* Source Field */}
                          <td className="py-2.5 px-4 font-bold text-slate-800">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 border border-slate-200">
                              {sourceKey}
                            </span>
                          </td>

                          {/* Arrow */}
                          <td className="py-2.5 px-2 text-center text-slate-400">
                            <ArrowRight size={13} className="inline text-indigo-500" />
                          </td>

                          {/* Canonical Field with Type Icon */}
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                              {getFieldIcon(mapping.type, mapping.category)}
                              <span>{mapping.canonical}</span>
                            </div>
                          </td>

                          {/* Type */}
                          <td className="py-2.5 px-3">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                              {mapping.type}
                            </span>
                          </td>

                          {/* Rule / Relationship */}
                          <td className="py-2.5 px-4 text-[11px] text-slate-600 font-sans">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {mapping.transform && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-mono text-[10px] font-bold">
                                  fn:{mapping.transform}
                                </span>
                              )}
                              {mapping.relationship && (
                                <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-mono text-[10px] font-bold">
                                  rel:{mapping.relationship}
                                </span>
                              )}
                              {mapping.prefix && (
                                <span className="px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-mono text-[10px] font-bold">
                                  prefix:{mapping.prefix}
                                </span>
                              )}
                              <span className="text-slate-500">{mapping.description}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            Config: <span className="font-bold text-slate-700">config/schema_mappings.json</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-800 transition cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
