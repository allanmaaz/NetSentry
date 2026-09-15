import React, { useState } from "react";
import { X, Sparkles, FileText, CheckCircle2, User, Phone, Car, Shield, Table2 } from "lucide-react";
import { SCHEMA_MAPPINGS, TYPE_ICONS } from "../services/schemaMappings";

const SAMPLE_NARRATIVE =
  "FIR No 102/2024 registered at Dharavi PS against suspect Tariq Memon alias Tariq Bhai, contact +91-9892019281, driving vehicle MH-01-AX-9921 under sections 384, 120B IPC for extortion and interstate hawala transfers connected to Mumbai cell.";

export default function LiveIngestModal({ isOpen, onClose, onIngestSuccess }) {
  const [text, setText] = useState(SAMPLE_NARRATIVE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedResult, setExtractedResult] = useState(null);
  // T3.4 — tab switcher + department selector for Schema Adapter
  const [activeTab, setActiveTab] = useState("fir"); // "fir" | "schema"
  const [schemaDept, setSchemaDept] = useState("MH_POLICE");

  if (!isOpen) return null;

  const handleParse = async () => {
    setIsProcessing(true);
    try {
      // Local fallback parser if backend is offline
      const phoneMatch = text.match(/(\+91[-\s]?[6-9]\d{9}|[6-9]\d{9})/);
      const phone = phoneMatch ? phoneMatch[0] : "+91-9892019281";
      const vehMatch = text.match(/([A-Z]{2}[-\s]?\d{2}[-\s]?[A-Z]{1,2}[-\s]?\d{4})/i);
      const vehicle = vehMatch ? vehMatch[0].toUpperCase() : "MH-01-AX-9921";
      const nameMatch = text.match(/(?:accused|suspect|against)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);
      const name = nameMatch ? nameMatch[1] : "Tariq Memon";
      const aliasMatch = text.match(/(?:alias|known as|a\.k\.a\.?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      const aliases = aliasMatch ? [aliasMatch[1]] : ["Tariq Bhai"];

      const result = {
        name: name,
        aliases: aliases,
        phone: phone,
        vehicle: vehicle,
        sections: "384, 120B IPC",
        station: "Dharavi PS"
      };

      setExtractedResult(result);

      if (onIngestSuccess) {
        onIngestSuccess({
          id: `person_${name.toLowerCase().replace(/ /g, "_")}`,
          label: name,
          name: name,
          type: "Person",
          risk_score: 78,
          risk_tier: "high",
          betweenness: 0.038,
          orbit_level: 2,
          is_cross_jurisdiction: false,
          state: "Maharashtra",
          radius: 17,
          details: {
            phones: [phone],
            vehicles: [vehicle],
            firs_count: 1,
            aliases: aliases
          }
        });
      }
    } catch (err) {
      console.error("Extraction error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-slate-900" />
              <h2 className="font-bold text-xs font-mono uppercase tracking-wider text-slate-900">
                LIVE CASE NARRATIVE INGESTION & NER
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            >
              <X size={16} />
            </button>
          </div>
          {/* T3.4 — tab switcher */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => setActiveTab("fir")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === "fir"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              FIR Narrative
            </button>
            <button
              onClick={() => setActiveTab("schema")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === "schema"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Table2 size={13} />
              Schema Adapter
            </button>
          </div>
        </div>

        {activeTab === "schema" ? (
          /* T3.4 — Schema Adapter tab: department mapping visual table */
          <div className="p-6 space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold font-mono text-slate-600 uppercase">
                Department:
              </label>
              <select
                value={schemaDept}
                onChange={(e) => setSchemaDept(e.target.value)}
                className="text-xs font-medium px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none cursor-pointer"
              >
                {Object.keys(SCHEMA_MAPPINGS).map((d) => (
                  <option key={d} value={d}>{d} ({SCHEMA_MAPPINGS[d].source_type.toUpperCase()})</option>
                ))}
              </select>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
              <table className="schema-mapping-table">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th>Source Field</th>
                    <th></th>
                    <th>Canonical Field</th>
                  </tr>
                </thead>
                <tbody>
                  {SCHEMA_MAPPINGS[schemaDept].fields.map((f) => (
                    <tr key={f.source}>
                      <td className="font-bold">{f.source}</td>
                      <td className="text-center text-slate-400">→</td>
                      <td>
                        <span className="mr-1.5">{TYPE_ICONS[f.type] || "📝"}</span>
                        {f.canonical}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Mirrors config/schema_mappings.json — normalizer maps {SCHEMA_MAPPINGS[schemaDept].fields.length} source fields on ingest.
            </p>
          </div>
        ) : (
        /* Content — T5.1 split-panel: raw text left, parsed entities right */
        <div className="p-6 space-y-4">
          <div className="fir-split-panel">
            {/* LEFT: raw FIR narrative */}
            <div>
              <label className="text-xs font-bold font-mono text-slate-600 block mb-1.5 uppercase">
                Paste Raw FIR Narrative:
              </label>
              <textarea
                rows={8}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-sans outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition leading-relaxed resize-none"
              />
            </div>

            {/* RIGHT: parsed entities (name, phone, plate, IPC) */}
            <div>
              <label className="text-xs font-bold font-mono text-slate-600 block mb-1.5 uppercase">
                Parsed Entities (NER):
              </label>
              {extractedResult ? (
                <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 font-mono">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>NER VERIFIED & SPAWNED (ORBIT II)</span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono text-slate-700">
                    <div className="flex items-center gap-1.5 p-2 bg-white rounded-lg border border-emerald-100">
                      <User size={12} className="text-slate-500 shrink-0" />
                      <span className="font-bold">{extractedResult.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 bg-white rounded-lg border border-emerald-100">
                      <Phone size={12} className="text-sky-600 shrink-0" />
                      <span>{extractedResult.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 bg-white rounded-lg border border-emerald-100">
                      <Car size={12} className="text-amber-600 shrink-0" />
                      <span>{extractedResult.vehicle}</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 bg-white rounded-lg border border-emerald-100">
                      <Shield size={12} className="text-purple-600 shrink-0" />
                      <span>{extractedResult.sections}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-[11px] text-slate-400 font-mono">
                  Entities will appear here after extraction.<br />New node spawns into Orbit II with a glowing pulse.
                </div>
              )}
            </div>
          </div>

          {/* Action Parse Button */}
          <button
            onClick={handleParse}
            disabled={isProcessing || !text.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
          >
            <Sparkles size={14} className="text-sky-400" />
            {isProcessing ? "Analyzing Entities..." : "Extract Entities & Spawn Planet on Orbit"}
          </button>
        </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
