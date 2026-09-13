import React, { useState, useRef, useEffect } from "react";
import { Search, X, MapPin, Phone, Car, FileText } from "lucide-react";

export default function GlobalSearchBar({ nodes, onSelectNode }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Filter matching suspects
  const matches = query.trim()
    ? (nodes || []).filter((node) => {
        const q = query.toLowerCase().trim();
        const nameMatch = node.name?.toLowerCase().includes(q);
        const aliasMatch = (node.details?.aliases || []).some((a) => a.toLowerCase().includes(q));
        const phoneMatch = (node.details?.phones || []).some((p) => p.includes(q));
        const vehMatch = (node.details?.vehicles || []).some((v) => v.toLowerCase().includes(q));
        const stateMatch = node.state?.toLowerCase().includes(q);
        return nameMatch || aliasMatch || phoneMatch || vehMatch || stateMatch;
      }).slice(0, 6)
    : [];

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (nodeId) => {
    onSelectNode(nodeId);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-72">
      <div className="relative flex items-center">
        <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search name, phone, plate, or 'अस्लम'..."
          className="w-full pl-8 pr-7 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && matches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 divide-y divide-slate-100">
          <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-mono text-slate-400 uppercase font-bold">
            Identified Suspects ({matches.length})
          </div>
          {matches.map((node) => (
            <button
              key={node.id}
              onClick={() => handleSelect(node.id)}
              className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-slate-50 transition text-xs"
            >
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  {node.name}
                  {node.orbit_level === 0 && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-bold">
                      SUN
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                  <span>{node.state}</span>
                  {node.details?.phones?.length > 0 && (
                    <span className="text-sky-600 flex items-center gap-0.5">
                      <Phone size={10} /> {node.details.phones[0]}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-full ${
                  node.risk_tier === "critical"
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : node.risk_tier === "high"
                    ? "bg-amber-50 text-amber-600 border border-amber-200"
                    : "bg-sky-50 text-sky-600 border border-sky-200"
                }`}
              >
                {node.risk_score}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
