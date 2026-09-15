import React, { useRef, useEffect, useState, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ZoomIn, ZoomOut, Compass, RefreshCw, Layers } from "lucide-react";
import { matchesDept } from "../services/deptFilter";

/**
 * Sovereign 3D WebGL Galactic Universe Component
 * High-contrast Light Mode network topology with Three.js WebGL:
 * - Deterministic concentric 3D orbital rings
 * - Luminous wireframe halos & high-contrast spheres
 * - Responsive 3D billboarded text label sprites
 * - Interactive Raycast selection and hover inspection
 */
export default function Galaxy3DGraph({
  data,
  selectedNodeId,
  onSelectNode,
  filterState = "all",
  filterTier = "all",
  neutralizedNodeId = null,
  timeProgress = 100
}) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animationFrameRef = useRef(null);

  const nodeMeshesRef = useRef([]);
  const linkLinesRef = useRef([]);
  const labelSpritesRef = useRef([]);
  const ringMeshesRef = useRef([]);

  const [hoveredNode, setHoveredNode] = useState(null);

  const colors = useMemo(
    () => ({
      bg: 0xf0f4f8,
      grid: 0xcbd5e1,
      ring: 0xcbd5e1,
      kingpin: 0xf97316,
      lieutenant: 0x0ea5e9,
      operative: 0x8b5cf6,
      transit: 0x06b6d4,
      neutralized: 0xef4444,
      link: 0x94a3b8,
      linkActive: 0x0ea5e9,
      textNavy: "#0F172A",
      pillBg: "rgba(255, 255, 255, 0.96)",
      pillBorder: "#CBD5E1"
    }),
    []
  );

  // Filter nodes according to state, threat tier, and timeline progress
  // T2.4 — non-matching department nodes are DIMMED to 10% opacity, not removed
  const filteredNodes = useMemo(() => {
    if (!data?.nodes) return [];
    return data.nodes
      .filter((node) => {
        if (filterTier !== "all" && node.threat_tier !== filterTier) return false;
        if (timeProgress < 100 && node.timeline_month) {
          const totalMonths = 14;
          const currentCutoff = Math.ceil((timeProgress / 100) * totalMonths);
          if (node.timeline_month > currentCutoff) return false;
        }
        return true;
      })
      .map((node) => ({ ...node, _dimmed: !matchesDept(node, filterState) }));
  }, [data?.nodes, filterState, filterTier, timeProgress]);

  // Links between currently visible filtered nodes
  const filteredLinks = useMemo(() => {
    if (!data?.links) return [];
    const validIds = new Set(filteredNodes.map((n) => n.id));
    return data.links.filter((l) => {
      const sourceId = typeof l.source === "object" ? l.source.id : l.source;
      const targetId = typeof l.target === "object" ? l.target.id : l.target;
      return validIds.has(sourceId) && validIds.has(targetId);
    });
  }, [data?.links, filteredNodes]);

  // 1. Initialize Three.js Scene, Camera, Renderer, Controls
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(colors.bg);
    scene.fog = new THREE.FogExp2(colors.bg, 0.0028);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    camera.position.set(0, 85, 150);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 450;
    controls.minDistance = 25;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Lighting (Studio Bright Sovereign Lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.65);
    dirLight1.position.set(60, 120, 60);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xe0f2fe, 0.45);
    dirLight2.position.set(-60, -40, -60);
    scene.add(dirLight2);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(320, 32, colors.grid, 0xe2e8f0);
    gridHelper.position.y = -12;
    scene.add(gridHelper);

    // Raycasting for click and hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshesRef.current);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        renderer.domElement.style.cursor = "pointer";
        if (hit.userData) {
          setHoveredNode(hit.userData);
        }
      } else {
        renderer.domElement.style.cursor = "default";
        setHoveredNode(null);
      }
    };

    const handleClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshesRef.current);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData && hit.userData.id && onSelectNode) {
          onSelectNode(hit.userData.id);
        }
      }
    };

    renderer.domElement.addEventListener("mousemove", handlePointerMove);
    renderer.domElement.addEventListener("click", handleClick);

    // Resize listener
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Subtle slow planetary rotation
      nodeMeshesRef.current.forEach((mesh) => {
        mesh.rotation.y += 0.005;
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("mousemove", handlePointerMove);
      renderer.domElement.removeEventListener("click", handleClick);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [colors, onSelectNode]);

  // Helper to create high-contrast billboarded text label sprites
  const createTextSprite = (text) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 256;
    canvas.height = 64;

    // Draw high-contrast rounded white pill
    ctx.fillStyle = colors.pillBg;
    ctx.strokeStyle = colors.pillBorder;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(8, 8, 240, 48, 24);
    ctx.fill();
    ctx.stroke();

    // Draw crisp text
    ctx.fillStyle = colors.textNavy;
    ctx.font = "bold 20px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const truncated = text.length > 18 ? text.slice(0, 17) + "…" : text;
    ctx.fillText(truncated, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.renderOrder = 999;
    sprite.scale.set(16, 4, 1);
    return sprite;
  };

  // 2. Build / Update 3D Solar Graph Entities & Links
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old graph objects
    nodeMeshesRef.current.forEach((m) => scene.remove(m));
    linkLinesRef.current.forEach((l) => scene.remove(l));
    labelSpritesRef.current.forEach((s) => scene.remove(s));
    ringMeshesRef.current.forEach((r) => scene.remove(r));

    nodeMeshesRef.current = [];
    linkLinesRef.current = [];
    labelSpritesRef.current = [];
    ringMeshesRef.current = [];

    const orbitRadii = [0, 40, 78];
    const orbitBuckets = { 0: [], 1: [], 2: [] };

    filteredNodes.forEach((node) => {
      const orbit = node.orbit_level !== undefined ? node.orbit_level : 2;
      const bucket = orbitBuckets[orbit] || orbitBuckets[2];
      bucket.push(node);
    });

    // Draw 3D Orbital Guide Rings
    [orbitRadii[1], orbitRadii[2]].forEach((r) => {
      const ringGeo = new THREE.RingGeometry(r - 0.25, r + 0.25, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colors.ring,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
      ringMeshesRef.current.push(ring);
    });

    const positions = new Map();

    const createNode = (entity, position, radius, colorHex) => {
      const isNeutralized = neutralizedNodeId === entity.id;
      const finalColor = isNeutralized ? colors.neutralized : colorHex;
      // T2.4 — dim non-matching department nodes to 10% opacity
      const dimOpacity = entity._dimmed ? 0.1 : 1;

      // Sphere Mesh
      const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: finalColor,
        roughness: 0.3,
        metalness: 0.2,
        emissive: finalColor,
        emissiveIntensity: isNeutralized ? 0.8 : 0.25,
        transparent: entity._dimmed === true,
        opacity: dimOpacity
      });
      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.copy(position);
      mesh.userData = { ...entity, baseRadius: radius, baseColor: finalColor };

      // Wireframe glow halo
      const glowGeo = new THREE.SphereGeometry(radius * 1.35, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color: finalColor,
        transparent: true,
        opacity: 0.22,
        wireframe: true
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      mesh.add(glow);

      // Multi-state candidate pulse ring
      if (entity.cross_state || entity.is_bridge) {
        const haloGeo = new THREE.RingGeometry(radius * 1.45, radius * 1.6, 32);
        const haloMat = new THREE.MeshBasicMaterial({
          color: 0x8b5cf6,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.65
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.rotation.x = Math.PI / 2;
        mesh.add(halo);
      }

      scene.add(mesh);
      nodeMeshesRef.current.push(mesh);

      // Billboard Text Sprite
      const displayName = entity.canonical_name || entity.name || "Suspect";
      const labelSprite = createTextSprite(displayName);
      labelSprite.position.copy(position);
      labelSprite.position.y -= radius + 4.5;
      if (entity._dimmed) labelSprite.material.opacity = 0.1;
      scene.add(labelSprite);
      labelSpritesRef.current.push(labelSprite);
    };

    // Orbit 0 (Kingpin Sun at center)
    orbitBuckets[0].forEach((e) => {
      const pos = new THREE.Vector3(0, 0, 0);
      positions.set(e.id, pos);
      createNode(e, pos, 6.8, colors.kingpin);
    });

    // Orbit 1 (Lieutenants)
    const count1 = orbitBuckets[1].length;
    orbitBuckets[1].forEach((e, i) => {
      const angle = (i / (count1 || 1)) * Math.PI * 2;
      const pos = new THREE.Vector3(
        Math.cos(angle) * orbitRadii[1],
        Math.sin(angle * 2) * 5,
        Math.sin(angle) * orbitRadii[1]
      );
      positions.set(e.id, pos);
      createNode(e, pos, 4.8, colors.lieutenant);
    });

    // Orbit 2 (Operatives, Transit, Money Mules)
    const count2 = orbitBuckets[2].length;
    orbitBuckets[2].forEach((e, i) => {
      const angle = (i / (count2 || 1)) * Math.PI * 2;
      const pos = new THREE.Vector3(
        Math.cos(angle) * orbitRadii[2],
        Math.sin(angle * 3) * 7,
        Math.sin(angle) * orbitRadii[2]
      );
      positions.set(e.id, pos);
      const isVehicle = e.role && e.role.toLowerCase().includes("vehicle");
      const color = isVehicle ? colors.transit : colors.operative;
      createNode(e, pos, 3.6, color);
    });

    // Draw 3D Intercept Links
    filteredLinks.forEach((l) => {
      const sourceId = typeof l.source === "object" ? l.source.id : l.source;
      const targetId = typeof l.target === "object" ? l.target.id : l.target;
      const posS = positions.get(sourceId);
      const posT = positions.get(targetId);
      if (!posS || !posT) return;

      const points = [posS, posT];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      // T2.4 — dim links touching dimmed nodes
      const dimNodeIds = new Set(filteredNodes.filter((n) => n._dimmed).map((n) => n.id));
      const lineDimmed = dimNodeIds.has(sourceId) || dimNodeIds.has(targetId);
      const lineMat = new THREE.LineBasicMaterial({
        color: colors.link,
        transparent: true,
        opacity: lineDimmed ? 0.1 : 0.55,
        linewidth: 2
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.userData = { source: sourceId, target: targetId };
      scene.add(line);
      linkLinesRef.current.push(line);
    });
  }, [filteredNodes, filteredLinks, colors, neutralizedNodeId]);

  // 3. Highlight Selected Node and Connected Links
  useEffect(() => {
    nodeMeshesRef.current.forEach((mesh) => {
      const isSelected = mesh.userData.id === selectedNodeId;
      mesh.scale.setScalar(isSelected ? 1.4 : 1.0);
      if (mesh.material && mesh.material.emissiveIntensity !== undefined) {
        mesh.material.emissiveIntensity = isSelected ? 0.75 : 0.25;
      }
    });

    linkLinesRef.current.forEach((line) => {
      const isConn =
        line.userData.source === selectedNodeId ||
        line.userData.target === selectedNodeId;
      line.material.color.setHex(isConn ? colors.linkActive : colors.link);
      line.material.opacity = isConn ? 0.95 : 0.25;
    });
  }, [selectedNodeId, colors]);

  // Navigation Control Actions
  const handleZoom = (factor) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    cam.position.multiplyScalar(1 / factor);
    controlsRef.current.update();
  };

  const handleReset = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, 85, 150);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  const handleFocusKingpin = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, 50, 75);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-slate-100">
      {/* Floating 3D Navigation Controls */}
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
          title="Reset Orbit View"
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 transition"
        >
          <Compass size={18} />
        </button>
        <button
          onClick={handleFocusKingpin}
          title="Focus Sun (Kingpin)"
          className="p-2 hover:bg-amber-50 rounded-lg text-amber-600 transition"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* 3D Legend Pill */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-xs text-slate-600 flex items-center gap-4 z-10">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-500 shadow-sm"></span>
          <span className="font-bold text-slate-900">3D Sun (Kingpin)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-sky-500 shadow-sm"></span>
          <span>Lieutenant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm"></span>
          <span>Operative</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-purple-500 border-dashed"></span>
          <span className="text-purple-700 font-semibold">Multi-State</span>
        </div>
      </div>

      {/* Hover Inspect Card */}
      {hoveredNode && (
        <div
          className="absolute pointer-events-none bg-slate-900/95 text-white px-4 py-3 rounded-xl shadow-2xl text-xs z-20 backdrop-blur border border-slate-700 transition-all"
          style={{ bottom: 24, left: 24 }}
        >
          <div className="font-bold text-sm text-white">
            {hoveredNode.canonical_name || hoveredNode.name}
          </div>
          <div className="text-slate-400 font-mono text-[11px] mt-0.5">
            Jurisdiction: {hoveredNode.state || "Interstate"} • Orbit {hoveredNode.orbit_level ?? 2}
          </div>
          {hoveredNode.threat_tier && (
            <div className="mt-1 flex items-center gap-1.5">
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  hoveredNode.threat_tier === "critical"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : hoveredNode.threat_tier === "high"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                }`}
              >
                {hoveredNode.threat_tier.toUpperCase()} THREAT
              </span>
            </div>
          )}
          {hoveredNode.details?.phones?.length > 0 && (
            <div className="text-sky-400 font-mono text-[11px] mt-1">
              MSISDN: {hoveredNode.details.phones[0]}
            </div>
          )}
          {hoveredNode.details?.vehicles?.length > 0 && (
            <div className="text-amber-400 font-mono text-[11px]">
              Reg: {hoveredNode.details.vehicles[0]}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
