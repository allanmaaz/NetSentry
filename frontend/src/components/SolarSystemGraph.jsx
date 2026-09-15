import React, { useRef, useEffect, useState, useMemo } from "react";
import * as d3 from "d3";
import { ZoomIn, ZoomOut, Compass, RefreshCw } from "lucide-react";
import { matchesDept, jurisdictionCount } from "../services/deptFilter";

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
  tracedPath = []
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
  const renderRef = useRef(null);
  const tracedPathRef = useRef(tracedPath);
  const spawnedAtRef = useRef(new Map()); // T5.1 — spawn pulse timestamps
  const knownIdsRef = useRef(new Set());

  const [hoveredNodeState, setHoveredNodeState] = useState(null);

  // Keep selectedNodeId in ref so selection NEVER restarts the physics engine!
  useEffect(() => {
    selectedNodeIdRef.current = selectedNodeId;
    if (renderRef.current) renderRef.current();
  }, [selectedNodeId]);

  useEffect(() => {
    neutralizedNodeIdRef.current = neutralizedNodeId;
    if (renderRef.current) renderRef.current();
  }, [neutralizedNodeId]);

  useEffect(() => {
    timeProgressRef.current = timeProgress;
    if (renderRef.current) renderRef.current();
  }, [timeProgress]);

  useEffect(() => {
    tracedPathRef.current = tracedPath;
    if (renderRef.current) renderRef.current();
  }, [tracedPath]);


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

    // Filter nodes — T2.4: non-matching nodes are DIMMED to 10% opacity, not removed
    const filteredNodes = data.nodes
      .filter((n) => {
        if (filterTier !== "all" && n.risk_tier !== filterTier) return false;
        return true;
      })
      .map((d) => ({ ...d, _dimmed: !matchesDept(d, filterState) }));

    // T5.1 — track newly spawned nodes for glowing orbital-insertion pulse
    const now = Date.now();
    filteredNodes.forEach((n) => {
      if (!knownIdsRef.current.has(n.id)) {
        knownIdsRef.current.add(n.id);
        spawnedAtRef.current.set(n.id, now);
      }
    });

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

      function isNodeVisible(node) {
        const prog = timeProgressRef.current;
        if (prog === undefined || prog === null || prog >= 95) return true;
        const orbit = node.orbit_level ?? 2;
        if (orbit === 0) return true;
        if (orbit === 1) return prog >= 20;
        if (orbit === 2) return prog >= 50;
        return prog >= 75;
      }

      // 3. Draw Links / Constellations
      linksRef.current.forEach((link) => {
        if (!isNodeVisible(link.source) || !isNodeVisible(link.target)) return;

        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);

        // T2.4 — dim links touching dimmed nodes to 10% opacity
        const linkDimmed = link.source._dimmed || link.target._dimmed;
        ctx.save();
        if (linkDimmed) ctx.globalAlpha = 0.1;

        if (link.type === "TRANSFERRED_FUNDS") {
          ctx.strokeStyle = colors.edgeFunds;
          ctx.lineWidth = 2.2;
          ctx.setLineDash([]);
        } else if (link.type === "CALLED") {
          ctx.strokeStyle = colors.edgeCalls;
          ctx.lineWidth = 1.8;
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = colors.edgeDefault;
          ctx.lineWidth = 1.2;
          ctx.setLineDash([3, 4]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore(); // T2.4 link dim restore
      });

      // T5.3 — Glowing green BFS path trace overlay
      const traceIds = tracedPathRef.current || [];
      if (traceIds.length >= 2) {
        const traceMap = new Map(nodesRef.current.map((n) => [n.id, n]));
        ctx.save();
        ctx.shadowColor = "rgba(16, 185, 129, 0.9)";
        ctx.shadowBlur = 14;
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        let started = false;
        traceIds.forEach((id) => {
          const n = traceMap.get(id);
          if (!n) return;
          if (!started) { ctx.moveTo(n.x, n.y); started = true; }
          else ctx.lineTo(n.x, n.y);
        });
        ctx.stroke();
        ctx.restore();
        // Hop markers
        traceIds.forEach((id, idx) => {
          const n = traceMap.get(id);
          if (!n || !isNodeVisible(n)) return;
          ctx.save();
          ctx.beginPath();
          ctx.arc(n.x, n.y - 26, 9, 0, 2 * Math.PI);
          ctx.fillStyle = "#059669";
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 9px 'JetBrains Mono', monospace";
          ctx.textAlign = "center";
          ctx.fillText(String(idx), n.x, n.y - 23);
          ctx.restore();
        });
      }

      // 4. Draw Nodes / Celestial Planets
      nodesRef.current.forEach((node) => {
        if (!isNodeVisible(node)) return;

        const isSun = node.orbit_level === 0;
        const isSelected = selectedNodeIdRef.current === node.id;
        const isHovered = hoveredNodeRef.current && hoveredNodeRef.current.id === node.id;
        const radius = isSun ? 32 : node.radius || 15;
        // T2.4 — dim non-matching department nodes to 10% opacity
        const dimmed = node._dimmed === true;

        ctx.save();
        if (dimmed) ctx.globalAlpha = 0.1;

        // T5.1 — Glowing spawn pulse for newly inserted nodes (1.6s)
        const spawnAge = Date.now() - (spawnedAtRef.current.get(node.id) || 0);
        if (spawnAge < 1600) {
          const pulseR = radius + 10 + (spawnAge / 1600) * 26;
          ctx.beginPath();
          ctx.arc(node.x, node.y, pulseR, 0, 2 * Math.PI);
          ctx.strokeStyle = `rgba(16, 185, 129, ${0.85 * (1 - spawnAge / 1600)})`;
          ctx.lineWidth = 4;
          ctx.shadowColor = "rgba(16, 185, 129, 0.8)";
          ctx.shadowBlur = 18;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

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

        // T4.4 — Jurisdiction badge (🏛 n) + purple halo for cross-jurisdiction nodes
        const jCount = jurisdictionCount(node);
        if (jCount >= 2) {
          const bx = node.x + radius * 0.75;
          const by = node.y - radius * 0.85;
          // Glowing purple halo ring (dashed)
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 5, 0, 2 * Math.PI);
          ctx.strokeStyle = "rgba(124, 58, 237, 0.55)";
          ctx.lineWidth = 2;
          ctx.setLineDash([3, 3]);
          ctx.shadowColor = "rgba(124, 58, 237, 0.7)";
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.shadowBlur = 0;
          // Purple count badge
          ctx.beginPath();
          ctx.arc(bx, by, 9, 0, 2 * Math.PI);
          ctx.fillStyle = "#7c3aed";
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 9px 'JetBrains Mono', monospace";
          ctx.textAlign = "center";
          ctx.fillText(String(jCount), bx, by + 3);
        }

        // T1.3 — Anomaly indicator overlay on nodes with anomaly score >= 70
        const aScore =
          node.anomaly_score ??
          node.anomalyScore ??
          (node.betweenness_score > 0.4 || (node.details?.phones?.length || 0) >= 3 || node.risk_score >= 85 ? 78 : null);
        if (aScore && aScore >= 70) {
          const ax = node.x - radius * 0.75;
          const ay = node.y - radius * 0.85;
          ctx.beginPath();
          ctx.arc(ax, ay, 7.5, 0, 2 * Math.PI);
          ctx.fillStyle = "#ef4444";
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 9px 'JetBrains Mono', monospace";
          ctx.textAlign = "center";
          ctx.fillText("⚠", ax, ay + 3);
        }

        ctx.restore(); // T2.4 dim restore
      });

      ctx.restore();
    }

    renderRef.current = render;
    render();

    // T5.1 — animate spawn pulses (~1.6s of re-renders after new nodes appear)
    const hasFreshSpawn = filteredNodes.some(
      (n) => Date.now() - (spawnedAtRef.current.get(n.id) || 0) < 1600
    );
    if (hasFreshSpawn) {
      let frames = 0;
      const pulseTimer = setInterval(() => {
        if (renderRef.current) renderRef.current();
        frames += 1;
        if (frames > 24) clearInterval(pulseTimer);
      }, 70);
    }

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

      const prog = timeProgressRef.current;
      const isVisible = (node) => {
        if (prog === undefined || prog === null || prog >= 95) return true;
        const orbit = node.orbit_level ?? 2;
        if (orbit === 0) return true;
        if (orbit === 1) return prog >= 20;
        if (orbit === 2) return prog >= 50;
        return prog >= 75;
      };

      for (let i = nodesRef.current.length - 1; i >= 0; i--) {
        const n = nodesRef.current[i];
        if (!isVisible(n)) continue;
        const r = (n.orbit_level === 0 ? 32 : n.radius || 15) + 6;
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
      hoveredNodeRef.current = node;
      setHoveredNodeState(node);
      render();
    };

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const node = getNodeAt(e.clientX - rect.left, e.clientY - rect.top);
      if (node && onSelectNode) {
        onSelectNode(node.id); // Triggers drawer, but NO physics restart!
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
    };
  }, [data, filterState, filterTier, tracedPath]); // NOTICE: selectedNodeId removed from deps to eliminate jumping!

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
