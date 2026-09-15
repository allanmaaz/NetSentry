import React, { useState } from "react";
import { X, UploadCloud, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { uploadCsvText } from "../services/api";
import { normalizeCSVToEntities, saveCustomIngestedData } from "../services/normalizer";
import { addBlock } from "../services/blockchainLedger";

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
      setStatusMessage(`Successfully imported ${res.ingested_records} records into the network!`);
      addBlock("DATASET_UPLOADED", `CSV Records Uploaded — ${res.ingested_records} Records`, { records: res.ingested_records, source: "CSV Upload" });
      if (onUploadSuccess) onUploadSuccess();
      setTimeout(() => {
        onClose();
        setStatusMessage(null);
      }, 1500);
    } catch (err) {
      try {
        const result = normalizeCSVToEntities(csvText, "MH_POLICE");
        if (result.nodes.length > 0) {
          saveCustomIngestedData(result.nodes, result.edges);
          setIsError(false);
          setStatusMessage(`Successfully imported ${result.nodes.length} records into investigation network!`);
          addBlock("DATASET_UPLOADED", `CSV Records Uploaded — ${result.nodes.length} Records`, { records: result.nodes.length });
          if (onUploadSuccess) onUploadSuccess();
          setTimeout(() => {
            onClose();
            setStatusMessage(null);
          }, 1500);
        } else {
          setIsError(true);
          setStatusMessage("Could not read records. Please verify CSV columns.");
        }
      } catch (parseErr) {
        setIsError(true);
        setStatusMessage("Could not read records. Please verify CSV columns.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold">
              <UploadCloud size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">
                Upload Records (CSV)
              </h2>
              <p className="text-xs text-slate-400">
                Import police chargesheet files and add suspects to the case network
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

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3.5 text-xs">
          {/* File Dropzone */}
          <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl p-4 bg-slate-950 text-center space-y-1.5 cursor-pointer relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <UploadCloud size={24} className="mx-auto text-sky-400" />
            <div className="font-semibold text-slate-200">
              Click to browse or drop a CSV file
            </div>
            <div className="text-[11px] text-slate-500">
              Columns: name, alias, phone, vehicle, police_station, state
            </div>
          </div>

          {/* Textarea preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400">
                Or review / edit CSV rows directly:
              </label>
              <button
                type="button"
                onClick={() => setCsvText(SAMPLE_CSV_TEMPLATE)}
                className="text-[11px] text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
              >
                Reset to Sample
              </button>
            </div>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full text-xs font-mono p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 ${
                isError
                  ? "bg-red-500/10 text-red-300 border border-red-500/30"
                  : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
              <span className="font-semibold">{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-slate-400 hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleIngest}
            disabled={isUploading || !csvText.trim()}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-md"
          >
            {isUploading ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Importing Records...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={13} />
                <span>Import to Case Network</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
