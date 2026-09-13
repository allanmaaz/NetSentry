import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { ZoomIn, ZoomOut, Compass, RefreshCw } from "lucide-react";

export default function SolarSystemGraph({
  data,
  selectedNodeId,
  onSelectNode,
  filterState,
  filterTier
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const simulationRef = useRef(null);
  const transformRef = useRef(d3.zoomIdentity);
  const [hoveredNode, setHoveredNode] = useState(null);

  // Color palette
  const colors = {
    critical: "#dc2626", // Crimson
    high: "#d97706",     // Amber
    medium: "#0284c7",   // Sky
    low: "#059669",      // Emerald
    sunHalo: "rgba(220, 38, 38, 0.18)",
    crossHalo: "#7c3aed", // Purple
    edgeCalls: "#0284c7",
    edgeFunds: "#059669",
    edgeDefault: "#94a3b8"
  };

  const orbitRadii = [0, 140, 270, 400];

  useEffect(() => {
    if (!data || !data.nodes || data.nodes.length === 0) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    // Deep clone nodes and edges for D3 mutation
    const nodes = data.nodes
      .filter((n) => {
        if (filterTier !== "all" && n.risk_tier !== filterTier) return false;
        if (filterState !== "all" && n.state !== filterState) return false;
        return true;
      })
      .map((d) => ({ ...d }));

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    const links = data.edges
      .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
      .map((e) => ({
        ...e,
        source: nodeMap.get(e.source),
        target: nodeMap.get(e.target)
      }));

    // Identify Kingpin / Sun node
    const sunNode = nodes.find((n) => n.orbit_level === 0) || nodes[0];
    if (sunNode) {
      sunNode.fx = width / 2;
      sunNode.fy = height / 2;
    }

    // Force Simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d) => d.id).distance((d) => (d.is_cross_jurisdiction ? 120 : 80)))
      .force("charge", d3.forceManyBody().strength((d) => (d.orbit_level === 0 ? -900 : -280)))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d) => (d.radius || 15) + 18))
      .force("r", d3.forceRadial((d) => orbitRadii[d.orbit_level || 2], width / 2, height / 2).strength(0.65));

    simulationRef.current = simulation;

    // Zoom setup
    const zoom = d3
      .zoom()
      .scaleExtent([0.3, 3.5])
      .on("zoom", (event) => {
        transformRef.current = event.transform;
        render();
      });

    d3.select(canvas).call(zoom);

    // Initial render function
    function render() {
      ctx.save();
      ctx.clearRect(0, 0, width, height);

      const transform = transformRef.current;
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      const cx = width / 2;
      const cy = height / 2;

      // 1. Draw Concentric Solar Orbital Rings
      ctx.save();
      orbitRadii.forEach((r, idx) => {
        if (r === 0) return;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();

        // Orbit labels
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.fillStyle = "#94a3b8";
        ctx.setLineDash([]);
        const label =
          idx === 1
            ? "ORBIT 1 // LIEUTENANTS & COMMAND"
            : idx === 2
            ? "ORBIT 2 // OPERATIVES & CONDUITS"
            : "ORBIT 3 // PERIPHERY NETWORK";
        ctx.fillText(label, cx - r + 8, cy - 6);
      });
      ctx.restore();

      // 2. Draw Edges
      links.forEach((link) => {
        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);

        if (link.type === "TRANSFERRED_FUNDS") {
          ctx.strokeStyle = colors.edgeFunds;
          ctx.lineWidth = Math.min(3.5, 1.2 + (link.weight || 1));
          ctx.setLineDash([]);
        } else if (link.type === "CALLED") {
          ctx.strokeStyle = colors.edgeCalls;
          ctx.lineWidth = 1.8;
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = colors.edgeDefault;
          ctx.lineWidth = 1.2;
          ctx.setLineDash([3, 3]);
        }
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // 3. Draw Nodes
      nodes.forEach((node) => {
        const isSun = node.orbit_level === 0;
        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredNode && hoveredNode.id === node.id;
        const radius = isSun ? 30 : node.radius || 14;

        // Radiant glow for Sun Kingpin
        if (isSun) {
          const gradient = ctx.createRadialGradient(
            node.x, node.y, radius * 0.4,
            node.x, node.y, radius * 2.2
          );
          gradient.addColorStop(0, "rgba(220, 38, 38, 0.45)");
          gradient.addColorStop(0.6, "rgba(220, 38, 38, 0.15)");
          gradient.addColorStop(1, "rgba(220, 38, 38, 0)");
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius * 2.2, 0, 2 * Math.PI);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Purple halo for cross-jurisdiction entities
        if (node.is_cross_jurisdiction) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 7, 0, 2 * Math.PI);
          ctx.strokeStyle = colors.crossHalo;
          ctx.lineWidth = 2.5;
          ctx.setLineDash([2, 2]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Selected halo indicator
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 9, 0, 2 * Math.PI);
          ctx.strokeStyle = "#0f172a";
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // Core Node Body
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = colors[node.risk_tier] || colors.medium;
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = isSun ? 3.5 : 2;
        ctx.stroke();

        // Node Label
        ctx.font = isSun
          ? "bold 13px 'Inter', sans-serif"
          : "500 11px 'Inter', sans-serif";
        ctx.textAlign = "center";
        
        // Shadow outline for label legibility
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3.5;
        ctx.strokeText(node.name, node.x, node.y + radius + 15);

        ctx.fillStyle = isSun ? "#991b1b" : "#0f172a";
        ctx.fillText(node.name, node.x, node.y + radius + 15);

        // Subtitle tag for Kingpin
        if (isSun) {
          ctx.font = "bold 9px 'JetBrains Mono', monospace";
          ctx.fillStyle = "#dc2626";
          ctx.fillText("[KINGPIN // SUN]", node.x, node.y + radius + 27);
        }
      });

      ctx.restore();
    }

    simulation.on("tick", render);

    // Mouse Interaction for Hover and Click
    function getNodeAt(x, y) {
      const transform = transformRef.current;
      const tx = (x - transform.x) / transform.k;
      const ty = (y - transform.y) / transform.k;

      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        const r = (n.orbit_level === 0 ? 30 : n.radius || 14) + 6;
        const dx = tx - n.x;
        const dy = ty - n.y;
        if (dx * dx + dy * dy <= r * r) {
          return n;
        }
      }
      return null;
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const node = getNodeAt(e.clientX - rect.left, e.clientY - rect.top);
      canvas.style.cursor = node ? "pointer" : "default";
      setHoveredNode(node);
    };

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const node = getNodeAt(e.clientX - rect.left, e.clientY - rect.top);
      if (node && onSelectNode) {
        onSelectNode(node.id);
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);

    return () => {
      simulation.stop();
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
    };
  }, [data, selectedNodeId, filterState, filterTier]);

  // Controls
  const handleZoom = (factor) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    d3.select(canvas)
      .transition()
      .duration(250)
      .call(d3.zoom().scaleBy, factor);
  };

  const handleReset = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    d3.select(canvas)
      .transition()
      .duration(400)
      .call(d3.zoom().transform, d3.zoomIdentity);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-slate-50">
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Floating Canvas Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-sm z-10">
        <button
          onClick={() => handleZoom(1.3)}
          title="Zoom In"
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 transition"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={() => handleZoom(0.7)}
          title="Zoom Out"
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 transition"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={handleReset}
          title="Center Orbit View"
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 transition"
        >
          <Compass size={18} />
        </button>
      </div>

      {/* Legend Card */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-sm text-xs text-slate-600 flex items-center gap-4 z-10">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-600"></span>
          <span className="font-medium text-slate-800">Critical (Sun)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span>High Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-sky-600"></span>
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-purple-600 border-dashed"></span>
          <span className="text-purple-700 font-medium">Cross-State Halo</span>
        </div>
      </div>

      {/* Hover Card Tooltip */}
      {hoveredNode && (
        <div
          className="absolute pointer-events-none bg-slate-900/95 text-white px-3 py-2 rounded-lg shadow-xl text-xs z-20 backdrop-blur"
          style={{ bottom: 16, left: 16 }}
        >
          <div className="font-semibold text-sm">{hoveredNode.name}</div>
          <div className="text-slate-400 font-mono text-[11px] mt-0.5">
            Jurisdiction: {hoveredNode.state} | Risk: {hoveredNode.risk_score}/100
          </div>
          {hoveredNode.details?.phones?.length > 0 && (
            <div className="text-emerald-400 font-mono text-[10px] mt-1">
              MSISDN: {hoveredNode.details.phones[0]}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
