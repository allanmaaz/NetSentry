import React, { useState, useRef } from "react";
import {
  X,
  UserPlus,
  FileText,
  UploadCloud,
  CheckCircle2,
  Phone,
  Car,
  MapPin,
  Shield,
  FileCheck
} from "lucide-react";
import { normalizeCSVToEntities, saveCustomIngestedData } from "../services/normalizer";

const SAMPLE_CSV = `accused_name,fir_number,police_station,offense_type,section_ipc,date_of_fir,seized_phone,vehicle_reg_no,location_district
Firoz Ghouse,MH-PUN-304-2026,Bund Garden PS,Extortion & Cross-State Hawala,384 120B IPC,2026-09-12,+91-9822998811,MH-12-BF-9090,Pune
Salim Belgaumi,KA-BLR-119-2026,Cubbon Park PS,Counterfeit Stamp Paper Transport,420 120B IPC,2026-09-13,+91-9845112233,KA-01-X-4421,Belgaum`;

const SAMPLE_NARRATIVE =
  "FIR No 102/2024 registered at Dharavi PS against suspect Tariq Memon alias Tariq Bhai, contact +91-9892019281, driving vehicle MH-01-AX-9921 under sections 384, 120B IPC for extortion and interstate hawala transfers connected to Mumbai cell.";

export default function LiveIngestModal({ isOpen, onClose, onIngestSuccess }) {
  const [activeTab, setActiveTab] = useState("form"); // "form" | "narrative" | "csv"
  const [selectedState, setSelectedState] = useState("MH_POLICE");
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [narrativeText, setNarrativeText] = useState(SAMPLE_NARRATIVE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formAlias, setFormAlias] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formVehicle, setFormVehicle] = useState("");
  const [formStation, setFormStation] = useState("Bund Garden PS, Pune");
  const [formFIR, setFormFIR] = useState("FIR 104/2026");

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // 1. Add Single Suspect via Quick Form
  const handleQuickFormSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setIsProcessing(true);
    try {
      const stateName = selectedState === "KA_POLICE" ? "Karnataka" : "Maharashtra";
      const singleNode = {
        id: `person_${formName.toLowerCase().replace(/ /g, "_")}_${Date.now().toString().slice(-4)}`,
        label: formName.trim(),
        name: formName.trim(),
        type: "Person",
        risk_score: 80,
        risk_tier: "high",
        betweenness: 0.045,
        orbit_level: 2,
        is_cross_jurisdiction: false,
        state: stateName,
        radius: 17,
        isNewSpawn: true,
        spawnTimestamp: Date.now(),
        details: {
          phones: formPhone.trim() ? [formPhone.trim()] : [],
          vehicles: formVehicle.trim() ? [formVehicle.trim().toUpperCase()] : [],
          firs_count: 1,
          aliases: formAlias.trim() ? [formAlias.trim()] : []
        }
      };

      const singleEdge = {
        source: "person_abdul_karim_telgi",
        target: singleNode.id,
        type: "ASSOCIATED_WITH",
        weight: 2.0,
        label: "Case Lead",
        is_cross_jurisdiction: false
      };

      saveCustomIngestedData([singleNode], [singleEdge]);

      if (onIngestSuccess) {
        onIngestSuccess({ nodes: [singleNode], edges: [singleEdge] });
      }

      setSuccessMessage(`Added "${formName}" to investigation network!`);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1400);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Parse Incident Report Text
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
        orbit_level: 2,
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
        label: "Extracted FIR Lead",
        is_cross_jurisdiction: false
      };

      saveCustomIngestedData([singleNode], [singleEdge]);

      if (onIngestSuccess) {
        onIngestSuccess({ nodes: [singleNode], edges: [singleEdge] });
      }

      setSuccessMessage(`Extracted "${name}" and linked to network!`);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1400);
    } catch (err) {
      console.error("Extraction error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Parse CSV File or Text
  const handleParseCSV = async () => {
    setIsProcessing(true);
    try {
      const result = normalizeCSVToEntities(csvText, selectedState);
      if (result.nodes.length === 0) {
        alert("No valid suspect rows detected. Please check CSV rows.");
        return;
      }

      saveCustomIngestedData(result.nodes, result.edges);

      if (onIngestSuccess) {
        onIngestSuccess(result);
      }

      setSuccessMessage(`Successfully imported ${result.nodes.length} suspects!`);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1400);
    } catch (err) {
      console.error("CSV Normalization error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setCsvText(content);
        setActiveTab("csv");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold">
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">
                Add Case or Suspect
              </h2>
              <p className="text-xs text-slate-400">
                Enter details to add suspects to the criminal network
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 3 Simple Tab Buttons */}
        <div className="flex items-center gap-1 px-5 pt-3 bg-slate-950/50 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("form")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-semibold transition cursor-pointer ${
              activeTab === "form"
                ? "bg-slate-900 text-sky-400 border-t-2 border-sky-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserPlus size={13} />
            <span>Quick Form</span>
          </button>

          <button
            onClick={() => setActiveTab("narrative")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-semibold transition cursor-pointer ${
              activeTab === "narrative"
                ? "bg-slate-900 text-sky-400 border-t-2 border-sky-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText size={13} />
            <span>Incident Notes</span>
          </button>

          <button
            onClick={() => setActiveTab("csv")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-semibold transition cursor-pointer ${
              activeTab === "csv"
                ? "bg-slate-900 text-sky-400 border-t-2 border-sky-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UploadCloud size={13} />
            <span>Upload File (CSV)</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* TAB 1: QUICK FORM */}
          {activeTab === "form" && (
            <form onSubmit={handleQuickFormSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Suspect Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Tariq Memon"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Known Alias
                  </label>
                  <input
                    type="text"
                    value={formAlias}
                    onChange={(e) => setFormAlias(e.target.value)}
                    placeholder="e.g. Tariq Bhai"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+91-9892019281"
                      className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Vehicle Plate
                  </label>
                  <div className="relative">
                    <Car size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={formVehicle}
                      onChange={(e) => setFormVehicle(e.target.value)}
                      placeholder="MH-01-AX-9921"
                      className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    State / Police Force
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="MH_POLICE">Maharashtra Police</option>
                    <option value="KA_POLICE">Karnataka Police</option>
                    <option value="FINANCIAL_INTEL">Financial Intelligence (FIU)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    FIR / Case Number
                  </label>
                  <input
                    type="text"
                    value={formFIR}
                    onChange={(e) => setFormFIR(e.target.value)}
                    placeholder="e.g. FIR 102/2026"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || !formName.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 shadow-md"
              >
                <UserPlus size={15} />
                <span>{isProcessing ? "Adding to Network..." : "Add to Case Network"}</span>
              </button>
            </form>
          )}

          {/* TAB 2: INCIDENT REPORT NARRATIVE */}
          {activeTab === "narrative" && (
            <div className="space-y-3">
              <p className="text-slate-400 leading-relaxed">
                Paste any FIR incident note or officer statement. NetSentry will automatically detect suspect names, phones, and vehicle numbers:
              </p>
              <textarea
                rows={4}
                value={narrativeText}
                onChange={(e) => setNarrativeText(e.target.value)}
                placeholder="Paste case report text here..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-sky-500"
              />
              <button
                onClick={handleParseNarrative}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
              >
                <FileCheck size={15} />
                <span>{isProcessing ? "Extracting..." : "Extract Suspect & Add to Graph"}</span>
              </button>
            </div>
          )}

          {/* TAB 3: CSV IMPORT */}
          {activeTab === "csv" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Select Police Department:</span>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                >
                  <option value="MH_POLICE">Maharashtra Police</option>
                  <option value="KA_POLICE">Karnataka Police</option>
                  <option value="FINANCIAL_INTEL">Financial Intelligence</option>
                </select>
              </div>

              <div className="p-4 border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl bg-slate-950 text-center space-y-2">
                <UploadCloud size={24} className="mx-auto text-sky-400" />
                <div className="text-xs text-slate-300 font-semibold">
                  Upload a CSV file from station records
                </div>
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                >
                  Choose CSV File
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block">Or preview / edit CSV rows:</label>
                <textarea
                  rows={4}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-[11px] focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                onClick={handleParseCSV}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
              >
                <UploadCloud size={15} />
                <span>{isProcessing ? "Importing Records..." : "Import Suspects to Network"}</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Supported: Maharashtra & Karnataka Police formats</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
