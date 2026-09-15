import React, { useRef, useEffect, useState, useMemo } from "react";
import * as d3 from "d3";
import { ZoomIn, ZoomOut, Compass, RefreshCw } from "lucide-react";

// Canvas Vector Icon Renderers (Crisp, High-DPI, Zero-Lag)
function drawPersonIcon(ctx, x, y, size, color = "#ffffff") {
  ctx.save();
  ctx.fillStyle = color;
  // Head
  ctx.beginPath();
  ctx.arc(x, y - size * 0.28, size * 0.32, 0, Math.PI * 2);
  ctx.fill();
  // Shoulders & Chest
  ctx.beginPath();
  ctx.arc(x, y + size * 0.65, size * 0.6, Math.PI * 1.25, Math.PI * 1.75);
  ctx.lineTo(x + size * 0.42, y + size * 0.45);
  ctx.arc(x, y + size * 0.65, size * 0.6, Math.PI * 1.75, Math.PI * 1.25, true);
  ctx.fill();
  ctx.restore();
}

function drawLicenseIcon(ctx, x, y, size, color = "#ffffff") {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  const w = size * 1.2;
  const h = size * 0.85;
  // Card boundary
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h / 2, w, h, 1.5);
  ctx.stroke();
  // Photo box
  ctx.fillRect(x - w / 2 + 2, y - h / 2 + 2, w * 0.32, h * 0.45);
  // Lines
  ctx.fillRect(x - w / 2 + w * 0.42, y - h / 2 + 2.5, w * 0.45, 1.2);
  ctx.fillRect(x - w / 2 + w * 0.42, y - h / 2 + 5.5, w * 0.35, 1.2);
  ctx.fillRect(x - w / 2 + 2, y + h / 2 - 3, w * 0.75, 1.2);
  ctx.restore();
}

function drawCarIcon(ctx, x, y, size, color = "#ffffff") {
  ctx.save();
  ctx.fillStyle = color;
  const w = size * 1.3;
  // Body & roof
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - size * 0.05, w, size * 0.42, 2);
  ctx.roundRect(x - w * 0.32, y - size * 0.42, w * 0.64, size * 0.4, 2);
  ctx.fill();
  // Wheels
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(x - w * 0.28, y + size * 0.35, size * 0.18, 0, Math.PI * 2);
  ctx.arc(x + w * 0.28, y + size * 0.35, size * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPhoneIcon(ctx, x, y, size, color = "#ffffff") {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.3;
  const w = size * 0.7;
  const h = size * 1.2;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h / 2, w, h, 2);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y + h * 0.35, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawKingpinCrown(ctx, x, y, size, color = "#ffffff") {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.65, y + size * 0.4);
  ctx.lineTo(x - size * 0.65, y - size * 0.25);
  ctx.lineTo(x - size * 0.25, y + size * 0.1);
  ctx.lineTo(x, y - size * 0.55);
  ctx.lineTo(x + size * 0.25, y + size * 0.1);
  ctx.lineTo(x + size * 0.65, y - size * 0.25);
  ctx.lineTo(x + size * 0.65, y + size * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export default function SolarSystemGraph({
  data,
  selectedNodeId,
  onSelectNode,
  filterState,
  filterTier,
  neutralizedNodeId = null,
  timeProgress = 100,
  onSelectEdge,
  selectedEdge
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const transformRef = useRef(d3.zoomIdentity);
  const selectedNodeIdRef = useRef(selectedNodeId);
  const neutralizedNodeIdRef = useRef(neutralizedNodeId);
  const timeProgressRef = useRef(timeProgress);
  const hoveredNodeRef = useRef(null);
  const hoveredEdgeRef = useRef(null);
  const selectedEdgeRef = useRef(selectedEdge);
  const renderRef = useRef(null);

  const [hoveredNodeState, setHoveredNodeState] = useState(null);

  // Keep selectedNodeId in ref so selection NEVER restarts the physics engine!
  useEffect(() => {
    selectedNodeIdRef.current = selectedNodeId;
    if (renderRef.current) renderRef.current();
  }, [selectedNodeId]);

  useEffect(() => {
    selectedEdgeRef.current = selectedEdge;
    if (renderRef.current) renderRef.current();
  }, [selectedEdge]);

  useEffect(() => {
    neutralizedNodeIdRef.current = neutralizedNodeId;
    if (renderRef.current) renderRef.current();
  }, [neutralizedNodeId]);

  useEffect(() => {
    timeProgressRef.current = timeProgress;
    if (renderRef.current) renderRef.current();
  }, [timeProgress]);

  // Real-time animation loop for glowing orbital insertion (T4.2)
  useEffect(() => {
    let animId;
    const hasSpawns = data?.nodes?.some(
      (n) => n.isNewSpawn || (n.spawnTimestamp && Date.now() - n.spawnTimestamp < 60000)
    );

    if (hasSpawns) {
      const loop = () => {
        if (renderRef.current) renderRef.current();
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [data]);


  // Color Palette
  const colors = {
    critical: "#dc2626", // Crimson
    high: "#d97706",     // Amber
    medium: "#0284c7",   // Sky
    low: "#059669",      // Emerald
    sunGlow: "rgba(220, 38, 38, 0.25)",
    crossHalo: "#7c3aed", // Purple
    edgeCalls: "#0284c7",
    edgeFunds: "#059669",
    edgeDefault: "#cbd5e1"
  };

  const orbitRadii = [0, 150, 280, 420];

  // Deterministic Cosmic Background Stars
  const stars = useMemo(() => {
    const starList = [];
    for (let i = 0; i < 90; i++) {
      starList.push({
        x: (Math.sin(i * 997) * 0.5 + 0.5) * 1600 - 300,
        y: (Math.cos(i * 733) * 0.5 + 0.5) * 1200 - 200,
        r: (i % 5 === 0) ? 1.5 : (i % 2 === 0 ? 1 : 0.7),
        alpha: 0.2 + ((i % 10) / 20)
      });
    }
    return starList;
  }, []);

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

    // Filter nodes
    const filteredNodes = data.nodes
      .filter((n) => {
        if (filterTier !== "all" && n.risk_tier !== filterTier) return false;
        if (filterState !== "all" && n.state !== filterState) return false;
        return true;
      })
      .map((d) => ({ ...d }));

    const nodeMap = new Map(filteredNodes.map((n) => [n.id, n]));

    const filteredLinks = data.edges
      .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
      .map((e) => ({
        ...e,
        source: nodeMap.get(e.source),
        target: nodeMap.get(e.target)
      }));

    const cx = width / 2;
    const cy = height / 2;

    // Arrange nodes into stable, peaceful celestial orbits
    const orbitGroups = { 0: [], 1: [], 2: [], 3: [] };
    filteredNodes.forEach((n) => {
      const lvl = n.orbit_level || 2;
      orbitGroups[lvl] ? orbitGroups[lvl].push(n) : orbitGroups[2].push(n);
    });

    // Sun node sits dead center
    if (orbitGroups[0].length > 0) {
      orbitGroups[0][0].x = cx;
      orbitGroups[0][0].y = cy;
      orbitGroups[0][0].fx = cx;
      orbitGroups[0][0].fy = cy;
    }

    // Distribute planets on Orbit 1, 2, 3 with fixed angles
    [1, 2, 3].forEach((lvl) => {
      const group = orbitGroups[lvl];
      const radius = orbitRadii[lvl];
      const total = group.length;
      group.forEach((node, idx) => {
        const angle = (2 * Math.PI * idx) / total - Math.PI / 2;
        node.x = cx + radius * Math.cos(angle);
        node.y = cy + radius * Math.sin(angle);
        // Anchor them so they NEVER move like a "touch-me-not plant"!
        node.fx = node.x;
        node.fy = node.y;
      });
    });

    // Shared node visibility predicate — uses timeProgressRef so it's always current
    function isNodeVisible(node) {
      const prog = timeProgressRef.current;
      if (prog === undefined || prog === null || prog >= 95) return true;
      const orbit = node.orbit_level ?? 2;
      if (orbit === 0) return true;
      if (orbit === 1) return prog >= 20;
      if (orbit === 2) return prog >= 50;
      return prog >= 75;
    }

    nodesRef.current = filteredNodes;
    linksRef.current = filteredLinks;

    // Render Canvas Scene
    function render() {
      ctx.save();
      ctx.clearRect(0, 0, width, height);

      const transform = transformRef.current;
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      // 1. Draw Cosmic Starfield
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148, 163, 184, ${star.alpha})`;
        ctx.fill();

        // 4-point twinkle cross
        if (star.r > 1.2) {
          ctx.strokeStyle = `rgba(148, 163, 184, ${star.alpha * 0.6})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(star.x - 3, star.y);
          ctx.lineTo(star.x + 3, star.y);
          ctx.moveTo(star.x, star.y - 3);
          ctx.lineTo(star.x, star.y + 3);
          ctx.stroke();
        }
      });

      // 2. Draw Concentric Solar Orbital Tracks
      orbitRadii.forEach((r, idx) => {
        if (r === 0) return;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Orbit Labels cleanly placed on top rim
        ctx.font = "bold 9px 'JetBrains Mono', monospace";
        ctx.fillStyle = "#94a3b8";
        const label =
          idx === 1
            ? "ORBIT I // CORE COMMAND & LIEUTENANTS"
            : idx === 2
            ? "ORBIT II // INTERSTATE CONDUITS & ASSETS"
            : "ORBIT III // PERIPHERY NETWORK";
        ctx.fillText(label, cx - 140, cy - r - 6);
      });


      linksRef.current.forEach((link) => {
        if (!isNodeVisible(link.source) || !isNodeVisible(link.target)) return;

        const isEdgeSelected = selectedEdgeRef.current && (
          (selectedEdgeRef.current.source?.id === link.source?.id && selectedEdgeRef.current.target?.id === link.target?.id) ||
          (selectedEdgeRef.current.source?.id === link.target?.id && selectedEdgeRef.current.target?.id === link.source?.id)
        );
        const isEdgeHovered = hoveredEdgeRef.current && (
          (hoveredEdgeRef.current.source?.id === link.source?.id && hoveredEdgeRef.current.target?.id === link.target?.id) ||
          (hoveredEdgeRef.current.source?.id === link.target?.id && hoveredEdgeRef.current.target?.id === link.source?.id)
        );

        // Highlight Halo when selected or hovered
        if (isEdgeSelected || isEdgeHovered) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(link.source.x, link.source.y);
          ctx.lineTo(link.target.x, link.target.y);
          ctx.strokeStyle = isEdgeSelected ? "rgba(99, 102, 241, 0.7)" : "rgba(14, 165, 233, 0.5)";
          ctx.lineWidth = 7;
          ctx.stroke();
          ctx.restore();
        }

        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);

        if (link.type === "TRANSFERRED_FUNDS") {
          ctx.strokeStyle = colors.edgeFunds;
          ctx.lineWidth = isEdgeSelected ? 3.5 : 2.2;
          ctx.setLineDash([]);
        } else if (link.type === "CALLED") {
          ctx.strokeStyle = colors.edgeCalls;
          ctx.lineWidth = isEdgeSelected ? 3.0 : 1.8;
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = isEdgeSelected ? "#475569" : colors.edgeDefault;
          ctx.lineWidth = isEdgeSelected ? 2.5 : 1.2;
          ctx.setLineDash([3, 4]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 4. Draw Nodes / Celestial Planets
      nodesRef.current.forEach((node) => {
        if (!isNodeVisible(node)) return;

        const isSun = node.orbit_level === 0;
        const isSelected = selectedNodeIdRef.current === node.id;
        const isHovered = hoveredNodeRef.current && hoveredNodeRef.current.id === node.id;
        const radius = isSun ? 32 : node.radius || 15;

        // Radiant Sun Corona Glow
        if (isSun) {
          const glowGrad = ctx.createRadialGradient(
            node.x, node.y, radius * 0.5,
            node.x, node.y, radius * 2.8
          );
          glowGrad.addColorStop(0, "rgba(220, 38, 38, 0.4)");
          glowGrad.addColorStop(0.5, "rgba(234, 88, 12, 0.15)");
          glowGrad.addColorStop(1, "rgba(220, 38, 38, 0)");

          ctx.beginPath();
          ctx.arc(node.x, node.y, radius * 2.8, 0, 2 * Math.PI);
          ctx.fillStyle = glowGrad;
          ctx.fill();
        }

        // Cross-Jurisdiction Halo
        if (node.is_cross_jurisdiction) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 7, 0, 2 * Math.PI);
          ctx.strokeStyle = colors.crossHalo;
          ctx.lineWidth = 2.5;
          ctx.setLineDash([2, 2]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Glowing Orbital Insertion Animation (T4.2 for Orbit II new spawns)
        if (node.isNewSpawn || (node.spawnTimestamp && Date.now() - node.spawnTimestamp < 60000)) {
          const pulse = (Math.sin(Date.now() / 220) * 0.5 + 0.5);
          ctx.save();

          // Outer pulsating ring
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 14 + pulse * 8, 0, 2 * Math.PI);
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + pulse * 0.5})`;
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();

          // Inner glowing halo
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 7 + pulse * 4, 0, 2 * Math.PI);
          ctx.strokeStyle = `rgba(168, 85, 247, ${0.6 + pulse * 0.4})`;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Insertion Banner
          ctx.font = "bold 9px 'JetBrains Mono', monospace";
          ctx.fillStyle = "#0284c7";
          ctx.textAlign = "center";
          ctx.fillText("✦ ORBIT II INSERTION", node.x, node.y - radius - 14);

          ctx.restore();
        }

        // Selected Planet Ring
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 9, 0, 2 * Math.PI);
          ctx.strokeStyle = "#0f172a";
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // Planet Body
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = colors[node.risk_tier] || colors.medium;
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = isSun ? 3.5 : 2;
        ctx.stroke();

        // Real Icon inside Planet
        const iconSize = radius * 0.7;
        if (isSun) {
          drawKingpinCrown(ctx, node.x, node.y, iconSize, "#ffffff");
        } else if (node.details?.vehicles?.length > 0) {
          drawCarIcon(ctx, node.x, node.y, iconSize, "#ffffff");
        } else if (node.details?.phones?.length > 0) {
          drawPhoneIcon(ctx, node.x, node.y, iconSize, "#ffffff");
        } else {
          drawPersonIcon(ctx, node.x, node.y, iconSize, "#ffffff");
        }

        // Neutralized / Arrested Indicator
        if (node.id === neutralizedNodeIdRef.current) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 8, 0, 2 * Math.PI);
          ctx.strokeStyle = "#dc2626";
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 3]);
          ctx.stroke();

          // Red X strike
          ctx.beginPath();
          ctx.moveTo(node.x - radius * 0.6, node.y - radius * 0.6);
          ctx.lineTo(node.x + radius * 0.6, node.y + radius * 0.6);
          ctx.moveTo(node.x + radius * 0.6, node.y - radius * 0.6);
          ctx.lineTo(node.x - radius * 0.6, node.y + radius * 0.6);
          ctx.strokeStyle = "#dc2626";
          ctx.lineWidth = 2.5;
          ctx.stroke();

          ctx.font = "bold 9px 'JetBrains Mono', monospace";
          ctx.fillStyle = "#dc2626";
          ctx.textAlign = "center";
          ctx.fillText("[ARRESTED // NEUTRALIZED]", node.x, node.y - radius - 8);
          ctx.restore();
        }

        // Node Label
        ctx.font = isSun
          ? "bold 13px 'Inter', sans-serif"
          : "600 11px 'Inter', sans-serif";
        ctx.textAlign = "center";

        // White shadow for legibility
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3.5;
        ctx.strokeText(node.name, node.x, node.y + radius + 15);

        ctx.fillStyle = isSun ? "#991b1b" : "#0f172a";
        ctx.fillText(node.name, node.x, node.y + radius + 15);

        // Tagline under Kingpin
        if (isSun) {
          ctx.font = "bold 9px 'JetBrains Mono', monospace";
          ctx.fillStyle = "#dc2626";
          ctx.fillText("[KINGPIN // SUN]", node.x, node.y + radius + 27);
        }
      });

      ctx.restore();
    }

    renderRef.current = render;
    render();

    // Zoom setup
    const zoom = d3
      .zoom()
      .scaleExtent([0.3, 3.5])
      .on("zoom", (event) => {
        transformRef.current = event.transform;
        render();
      });

    d3.select(canvas).call(zoom);

    // Hit Testing
    function getNodeAt(x, y) {
      const transform = transformRef.current;
      const tx = (x - transform.x) / transform.k;
      const ty = (y - transform.y) / transform.k;

      for (let i = nodesRef.current.length - 1; i >= 0; i--) {
        const n = nodesRef.current[i];
        if (!isNodeVisible(n)) continue;
        const r = (n.orbit_level === 0 ? 32 : n.radius || 15) + 6;
        const dx = tx - n.x;
        const dy = ty - n.y;
        if (dx * dx + dy * dy <= r * r) {
          return n;
        }
      }
      return null;
    }

    // Point to Segment Euclidean Distance Squared
    function distToSegmentSquared(px, py, x1, y1, x2, y2) {
      const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
      if (l2 === 0) return (px - x1) * (px - x1) + (py - y1) * (py - y1);
      let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
      t = Math.max(0, Math.min(1, t));
      const projX = x1 + t * (x2 - x1);
      const projY = y1 + t * (y2 - y1);
      return (px - projX) * (px - projX) + (py - projY) * (py - projY);
    }

    // Edge Hit Testing
    function getEdgeAt(x, y) {
      const transform = transformRef.current;
      const tx = (x - transform.x) / transform.k;
      const ty = (y - transform.y) / transform.k;
      // Generous click tolerance (at least 7px in screen space)
      const threshold = Math.max(7, 9 / transform.k);
      const thresholdSq = threshold * threshold;

      for (let i = linksRef.current.length - 1; i >= 0; i--) {
        const link = linksRef.current[i];
        if (!link.source || !link.target) continue;
        if (!isNodeVisible(link.source) || !isNodeVisible(link.target)) continue;

        const dSq = distToSegmentSquared(tx, ty, link.source.x, link.source.y, link.target.x, link.target.y);
        if (dSq <= thresholdSq) {
          return link;
        }
      }
      return null;
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const node = getNodeAt(mouseX, mouseY);
      const edge = node ? null : getEdgeAt(mouseX, mouseY);

      canvas.style.cursor = node || edge ? "pointer" : "default";

      let needsRender = false;
      if (hoveredNodeRef.current !== node) {
        hoveredNodeRef.current = node;
        setHoveredNodeState(node);
        needsRender = true;
      }
      if (hoveredEdgeRef.current !== edge) {
        hoveredEdgeRef.current = edge;
        needsRender = true;
      }

      if (needsRender) {
        render();
      }
    };

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const node = getNodeAt(mouseX, mouseY);
      if (node && onSelectNode) {
        onSelectNode(node.id); // Triggers drawer, but NO physics restart!
        return;
      }

      const edge = getEdgeAt(mouseX, mouseY);
      if (edge && onSelectEdge) {
        onSelectEdge(edge);
        render();
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
    };
  }, [data, filterState, filterTier]); // NOTICE: selectedNodeId removed from deps to eliminate jumping!

  // Controls
  const handleZoom = (factor) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    d3.select(canvas).transition().duration(250).call(d3.zoom().scaleBy, factor);
  };

  const handleReset = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    d3.select(canvas).transition().duration(400).call(d3.zoom().transform, d3.zoomIdentity);
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

      {/* Legend Card with Real Icon Guide */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm text-xs text-slate-600 flex items-center gap-5 z-10">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-600"></span>
          <span className="font-semibold text-slate-900">Sun (Kingpin)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span>Lieutenant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-sky-600"></span>
          <span>Operative</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-purple-600 border-dashed"></span>
          <span className="text-purple-700 font-semibold">Multi-State Halo</span>
        </div>
      </div>

      {/* Hover Tooltip Card */}
      {hoveredNodeState && (
        <div
          className="absolute pointer-events-none bg-slate-900/95 text-white px-3.5 py-2.5 rounded-xl shadow-2xl text-xs z-20 backdrop-blur border border-slate-700"
          style={{ bottom: 20, left: 20 }}
        >
          <div className="font-bold text-sm text-white">{hoveredNodeState.name}</div>
          <div className="text-slate-400 font-mono text-[11px] mt-0.5">
            Jurisdiction: {hoveredNodeState.state} • Risk Score: {hoveredNodeState.risk_score}/100
          </div>
          {hoveredNodeState.details?.phones?.length > 0 && (
            <div className="text-sky-400 font-mono text-[11px] mt-1">
              MSISDN: {hoveredNodeState.details.phones[0]}
            </div>
          )}
          {hoveredNodeState.details?.vehicles?.length > 0 && (
            <div className="text-amber-400 font-mono text-[11px]">
              Reg: {hoveredNodeState.details.vehicles[0]}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
