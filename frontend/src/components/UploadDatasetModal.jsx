import React, { useState } from "react";
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { uploadCsvText, uploadCsvFile } from "../services/api";

const SAMPLE_CSV_TEMPLATE = `name,alias,phone,vehicle,police_station,state,sections,crime_type,risk_score
"Dawood Ibrahim","Muchhad","+91-9820099881","MH-01-BK-1111","Dongri PS","Maharashtra","302, 120B IPC, MCOCA","Organized Crime & Extortion",99
"Chhota Shakeel","Babu","+91-9820099881","MH-01-BK-1111","Pydhonie PS","Maharashtra","387, 120B IPC","Extortion & Hawala Command",95
"Tiger Memon","Mustafa","+91-9821033442","MH-04-AX-5522","Mahim PS","Maharashtra","120B, 307 IPC, Explosives Act","Arms & Explosives Smuggling",96
"Fahim Khan","Fahim Bangalore","+91-9845077881","KA-01-EE-2200","Shivajinagar PS","Karnataka","420, 120B IPC","Interstate Cash Conduit",82
"Ramesh Shetty","Shetty Mangalore","+91-9844011223","KA-19-M-9900","Bunder PS","Karnataka","384, 120B IPC","Hawala Port Infiltration",79`;

export default function UploadDatasetModal({ isOpen, onClose, onUploadSuccess }) {
  const [csvText, setCsvText] = useState(SAMPLE_CSV_TEMPLATE);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setCsvText(evt.target.result);
    };
    reader.readAsText(file);
  };

  const handleIngest = async () => {
    if (!csvText.trim()) return;
    setIsUploading(true);
    setStatusMessage(null);
    setIsError(false);

    try {
      const res = await uploadCsvText(csvText);
      setStatusMessage(`Successfully ingested ${res.ingested_records} records into persistent database!`);
      if (onUploadSuccess) onUploadSuccess();
      setTimeout(() => {
        onClose();
        setStatusMessage(null);
      }, 1800);
    } catch (err) {
      console.error("Upload error:", err);
      setIsError(true);
      setStatusMessage("Failed to ingest records. Please check CSV format.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud size={18} className="text-sky-600" />
            <span className="font-bold text-xs font-mono uppercase tracking-wider text-slate-900">
              INGEST REAL POLICE / COURT DATASET (CSV)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Upload or paste any real law enforcement CSV dataset. NetSentry will insert records into the persistent SQLite database, run the Random Forest entity linkage engine, and recompute betweenness centrality in real-time.
          </p>

          {/* File Picker */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition cursor-pointer relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center gap-1.5 pointer-events-none">
              <UploadCloud size={24} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-700">
                Click to browse or drag & drop a .csv file
              </span>
              <span className="text-[10px] text-slate-400">
                Supported columns: name, alias, phone, vehicle, police_station, state, sections
              </span>
            </div>
          </div>

          {/* CSV Textarea Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 font-mono">
                CSV Payload Editor
              </label>
              <button
                onClick={() => setCsvText(SAMPLE_CSV_TEMPLATE)}
                className="text-[11px] text-sky-600 hover:text-sky-800 font-medium transition"
              >
                Reset to Sample
              </button>
            </div>
            <textarea
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition resize-none leading-relaxed text-slate-800"
              placeholder="Paste raw CSV data here..."
            />
          </div>

          {/* Status Alert */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                isError ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
              }`}
            >
              {isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
              {statusMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleIngest}
            disabled={isUploading || !csvText.trim()}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Ingesting into Database...
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                Ingest Dataset & Rebuild Graph
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
