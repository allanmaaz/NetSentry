/**
 * NetSentry — Celestial Solar System 2D Canvas Engine
 * Problem Statement 26189 | Ministry of Home Affairs / NCRB
 * 
 * Deterministic orbital layout anchored to Betweenness Centrality bottlenecks:
 * - Orbit 0 (The Sun): Kingpin / Central Bottleneck
 * - Orbit I (Inner Ring): Core Operational Lieutenants (Radius 160px)
 * - Orbit II (Outer Ring): Ground Operatives, Fleet Sedans, MSISDN Taps (Radius 290px)
 * 
 * Includes high-DPI vector iconography (Crown, Person, Sedan, Phone) with zero emojis,
 * rock-solid click interactions, and in-canvas tactical arrest neutralization effects.
 */

export class SolarSystem2D {
  constructor(canvasElement, onSelectNode, onSelectEdge = null) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.onSelectNode = onSelectNode;
    this.onSelectEdge = onSelectEdge; // T2.2 — edge click callback

    // View state
    this.scale = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;

    // Data state
    this.nodes = [];
    this.links = [];
    this.selectedNodeId = null;
    this.hoveredNodeId = null;
    this.neutralizedNodeId = null;
    this.tracedPath = []; // T5.3 — BFS path node ids
    this.spawnedAt = new Map(); // T5.1 — spawn pulse timestamps
    this.knownIds = new Set();

    // Config
    this.orbitRadii = [0, 160, 290];
    this.orbitScale = 1; // C5 — shrinks on small screens so orbits fit
    // C5 — coarse pointers (touch) get bigger tap targets
    this.coarsePointer = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    this.lastTouchTime = 0;
    this.colors = {
      orbitRing: '#E2E8F0',
      orbitRingActive: '#CBD5E1',
      linkDefault: '#CBD5E1',
      linkActive: '#0EA5E9',
      kingpin: '#F97316',
      lieutenant: '#0EA5E9',
      operative: '#8B5CF6',
      transit: '#06B6D4',
      neutralized: '#EF4444',
      textPrimary: '#0F172A',
      textSecondary: '#64748B'
    };

    this.initEvents();
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;

    // Center view if not panned yet
    if (this.panX === 0 && this.panY === 0) {
      this.panX = this.width / 2;
      this.panY = this.height / 2;
    }
    this.render();
  }

  setData(entities, links) {
    this.links = links || [];
    this.nodes = this.calculateOrbitalPositions(entities || []);
    // T5.1 — record spawn timestamps for new nodes (glowing pulse)
    const now = Date.now();
    this.nodes.forEach((n) => {
      if (!this.knownIds.has(n.id)) {
        this.knownIds.add(n.id);
        this.spawnedAt.set(n.id, now);
      }
    });
    this.render();
    // Animate spawn pulses briefly
    const fresh = this.nodes.some((n) => now - (this.spawnedAt.get(n.id) || 0) < 1600);
    if (fresh) {
      let frames = 0;
      const t = setInterval(() => {
        this.render();
        if (++frames > 24) clearInterval(t);
      }, 70);
    }
  }

  // T5.3 — set BFS traced path (array of node ids) and render glow trace
  setTracedPath(pathIds = []) {
    this.tracedPath = pathIds || [];
    this.render();
  }

  calculateOrbitalPositions(entities) {
    const nodes = [];
    const orbitBuckets = { 0: [], 1: [], 2: [] };

    // C5 — scale orbits to the viewport so the system fits phones
    this.orbitScale = Math.min(1, Math.min(this.width || 800, this.height || 600) / 640);
    const R1 = this.orbitRadii[1] * this.orbitScale;
    const R2 = this.orbitRadii[2] * this.orbitScale;

    entities.forEach((entity) => {
      const orbit = entity.orbit_level !== undefined ? entity.orbit_level : 2;
      const bucket = orbitBuckets[orbit] || orbitBuckets[2];
      bucket.push(entity);
    });

    // Orbit 0: Kingpin at exact center (0, 0)
    orbitBuckets[0].forEach((e) => {
      nodes.push({
        ...e,
        x: 0,
        y: 0,
        radius: 34,
        orbit: 0
      });
    });

    // Orbit 1: Lieutenants arranged evenly in circle
    const count1 = orbitBuckets[1].length;
    orbitBuckets[1].forEach((e, idx) => {
      const angle = (idx / count1) * Math.PI * 2 - Math.PI / 2;
      nodes.push({
        ...e,
        x: Math.cos(angle) * R1,
        y: Math.sin(angle) * R1,
        radius: 24,
        orbit: 1
      });
    });

    // Orbit 2: Operatives, vehicles, and phone taps
    const count2 = orbitBuckets[2].length;
    orbitBuckets[2].forEach((e, idx) => {
      const angle = (idx / count2) * Math.PI * 2 - Math.PI / 4;
      nodes.push({
        ...e,
        x: Math.cos(angle) * R2,
        y: Math.sin(angle) * R2,
        radius: 20,
        orbit: 2
      });
    });

    return nodes;
  }

  selectNode(nodeId) {
    this.selectedNodeId = nodeId;
    this.render();
  }

  setNeutralized(nodeId) {
    this.neutralizedNodeId = nodeId;
    this.render();
  }

  initEvents() {
    // C5 — prevent page scroll/zoom gestures hijacking canvas touches
    this.canvas.style.touchAction = 'none';

    this.canvas.addEventListener('mousedown', (e) => {
      // C5 — ignore synthetic mouse events fired after touch handling
      if (Date.now() - this.lastTouchTime < 600) return;
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Check node hit
      const hitNode = this.getNodeAt(clickX, clickY);
      if (hitNode) {
        this.selectedNodeId = hitNode.id;
        if (this.onSelectNode) this.onSelectNode(hitNode.id);
        this.render();
        return;
      }

      // T2.2 — Check edge hit (call/transaction detail modal)
      const hitEdge = this.getEdgeAt(clickX, clickY);
      if (hitEdge && this.onSelectEdge) {
        const s = typeof hitEdge.source === 'object' ? hitEdge.source.id : hitEdge.source;
        const t = typeof hitEdge.target === 'object' ? hitEdge.target.id : hitEdge.target;
        this.onSelectEdge(s, t, hitEdge);
        return;
      }

      this.isDragging = true;
      this.dragStartX = clickX - this.panX;
      this.dragStartY = clickY - this.panY;
    });

    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const curX = e.clientX - rect.left;
      const curY = e.clientY - rect.top;

      if (this.isDragging) {
        this.panX = curX - this.dragStartX;
        this.panY = curY - this.dragStartY;
        this.render();
        return;
      }

      const hitNode = this.getNodeAt(curX, curY);
      const newHover = hitNode ? hitNode.id : null;
      if (newHover !== this.hoveredNodeId) {
        this.hoveredNodeId = newHover;
        this.canvas.style.cursor = hitNode ? 'pointer' : 'grab';
        this.render();
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const newScale = Math.min(Math.max(0.4, this.scale * zoomFactor), 2.8);
      this.scale = newScale;
      this.render();
    }, { passive: false });

    // C5 — touch support: tap selects nodes/edges, single-finger drag pans
    this.canvas.addEventListener('touchstart', (e) => {
      this.lastTouchTime = Date.now();
      if (e.touches.length !== 1) return;
      const rect = this.canvas.getBoundingClientRect();
      const t = e.touches[0];
      const x = t.clientX - rect.left;
      const y = t.clientY - rect.top;

      const hitNode = this.getNodeAt(x, y);
      if (hitNode) {
        this.selectedNodeId = hitNode.id;
        if (this.onSelectNode) this.onSelectNode(hitNode.id);
        this.render();
        return;
      }
      const hitEdge = this.getEdgeAt(x, y);
      if (hitEdge && this.onSelectEdge) {
        const s = typeof hitEdge.source === 'object' ? hitEdge.source.id : hitEdge.source;
        const tId = typeof hitEdge.target === 'object' ? hitEdge.target.id : hitEdge.target;
        this.onSelectEdge(s, tId, hitEdge);
        return;
      }
      this.isDragging = true;
      this.dragStartX = x - this.panX;
      this.dragStartY = y - this.panY;
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const t = e.touches[0];
      this.panX = (t.clientX - rect.left) - this.dragStartX;
      this.panY = (t.clientY - rect.top) - this.dragStartY;
      this.render();
    }, { passive: false });

    this.canvas.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  }

  getNodeAt(screenX, screenY) {
    // Invert world transform
    const worldX = (screenX - this.panX) / this.scale;
    const worldY = (screenY - this.panY) / this.scale;

    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const n = this.nodes[i];
      const dist = Math.hypot(n.x - worldX, n.y - worldY);
      if (dist <= n.radius + (this.coarsePointer ? 12 : 6)) return n;
    }
    return null;
  }

  // T2.2 — edge hit-testing: distance from click point to segment < 6px
  getEdgeAt(screenX, screenY) {
    const worldX = (screenX - this.panX) / this.scale;
    const worldY = (screenY - this.panY) / this.scale;
    const nodeMap = new Map(this.nodes.map((n) => [n.id, n]));
    const tol = this.coarsePointer ? 12 : 7;

    for (const l of this.links) {
      const sId = typeof l.source === 'object' ? l.source.id : l.source;
      const tId = typeof l.target === 'object' ? l.target.id : l.target;
      const s = nodeMap.get(sId);
      const t = nodeMap.get(tId);
      if (!s || !t) continue;
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const lenSq = dx * dx + dy * dy;
      if (lenSq === 0) continue;
      let u = ((worldX - s.x) * dx + (worldY - s.y) * dy) / lenSq;
      u = Math.max(0, Math.min(1, u));
      const px = s.x + u * dx;
      const py = s.y + u * dy;
      if (Math.hypot(worldX - px, worldY - py) <= tol) return l;
    }
    return null;
  }

  jurisdictionCountOf(node) {
    if (node.jurisdictionCount != null) return node.jurisdictionCount;
    if (node.jurisdiction_count != null) return node.jurisdiction_count;
    const agencies = node.agencies || [];
    if (agencies.length >= 2) return agencies.length;
    if (node.is_cross_jurisdiction) return 2;
    return 1;
  }

  focusNode(nodeId) {
    const node = this.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    this.panX = this.width / 2 - node.x * this.scale;
    this.panY = this.height / 2 - node.y * this.scale;
    this.selectedNodeId = nodeId;
    this.render();
  }

  resetView() {
    this.scale = 1.0;
    this.panX = this.width / 2;
    this.panY = this.height / 2;
    this.render();
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.scale, this.scale);

    // 1. Draw concentric orbits
    this.drawOrbits(ctx);

    // 2. Draw relationship links
    this.drawLinks(ctx);

    // T5.3 — glowing green BFS path trace
    this.drawPathTrace(ctx);

    // 3. Draw nodes & iconography
    this.drawNodes(ctx);

    ctx.restore();
  }

  drawOrbits(ctx) {
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = this.colors.orbitRing;

    // Orbit I
    ctx.beginPath();
    ctx.arc(0, 0, this.orbitRadii[1] * this.orbitScale, 0, Math.PI * 2);
    ctx.stroke();

    // Orbit II
    ctx.beginPath();
    ctx.arc(0, 0, this.orbitRadii[2] * this.orbitScale, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([]);
  }

  drawLinks(ctx) {
    const nodeMap = new Map(this.nodes.map((n) => [n.id, n]));

    this.links.forEach((l) => {
      const sId = typeof l.source === 'object' ? l.source.id : l.source;
      const tId = typeof l.target === 'object' ? l.target.id : l.target;
      const s = nodeMap.get(sId);
      const t = nodeMap.get(tId);
      if (!s || !t) return;

      const isHighlighted =
        this.selectedNodeId === s.id ||
        this.selectedNodeId === t.id ||
        this.hoveredNodeId === s.id ||
        this.hoveredNodeId === t.id;

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);
      ctx.lineWidth = isHighlighted ? 2.5 : 1.2;
      ctx.strokeStyle = isHighlighted ? this.colors.linkActive : this.colors.linkDefault;
      ctx.stroke();
    });
  }

  // T5.3 — draw glowing green trace across path node ids with hop markers
  drawPathTrace(ctx) {
    const path = this.tracedPath || [];
    if (path.length < 2) return;
    const nodeMap = new Map(this.nodes.map((n) => [n.id, n]));

    ctx.save();
    ctx.shadowColor = 'rgba(16, 185, 129, 0.9)';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    let started = false;
    path.forEach((id) => {
      const n = nodeMap.get(id);
      if (!n) return;
      if (!started) { ctx.moveTo(n.x, n.y); started = true; }
      else ctx.lineTo(n.x, n.y);
    });
    ctx.stroke();
    ctx.restore();

    path.forEach((id, idx) => {
      const n = nodeMap.get(id);
      if (!n) return;
      ctx.save();
      ctx.beginPath();
      ctx.arc(n.x, n.y - 30, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#059669';
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(idx), n.x, n.y - 27);
      ctx.restore();
    });
  }

  drawNodes(ctx) {
    this.nodes.forEach((node) => {
      const isSelected = this.selectedNodeId === node.id;
      const isHovered = this.hoveredNodeId === node.id;
      const isNeutralized = this.neutralizedNodeId === node.id;

      ctx.save();
      ctx.translate(node.x, node.y);

      // T5.1 — glowing spawn pulse for newly inserted nodes (1.6s)
      const spawnAge = Date.now() - (this.spawnedAt.get(node.id) || 0);
      if (spawnAge < 1600) {
        const pulseR = node.radius + 10 + (spawnAge / 1600) * 26;
        ctx.beginPath();
        ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(16, 185, 129, ${0.85 * (1 - spawnAge / 1600)})`;
        ctx.lineWidth = 4;
        ctx.shadowColor = 'rgba(16, 185, 129, 0.8)';
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Pulse ring on selected
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(0, 0, node.radius + 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.4)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Neutralized perimeter dash
      if (isNeutralized) {
        ctx.beginPath();
        ctx.arc(0, 0, node.radius + 6, 0, Math.PI * 2);
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = this.colors.neutralized;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Node background fill
      ctx.beginPath();
      ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = isSelected ? 'rgba(14, 165, 233, 0.3)' : 'rgba(15, 23, 42, 0.1)';
      ctx.shadowBlur = isSelected ? 12 : 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Node colored ring
      let ringColor = this.colors.operative;
      if (node.orbit === 0) ringColor = this.colors.kingpin;
      else if (node.orbit === 1) ringColor = this.colors.lieutenant;
      else if (node.role && node.role.includes('Vehicle')) ringColor = this.colors.transit;

      if (isNeutralized) ringColor = this.colors.neutralized;

      ctx.lineWidth = isSelected ? 3.5 : 2.5;
      ctx.strokeStyle = ringColor;
      ctx.stroke();

      // Vector Iconography
      this.drawVectorIcon(ctx, node, ringColor);

      // Strikethrough if arrested
      if (isNeutralized) {
        ctx.strokeStyle = this.colors.neutralized;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-node.radius * 0.7, -node.radius * 0.7);
        ctx.lineTo(node.radius * 0.7, node.radius * 0.7);
        ctx.stroke();

        // Strikethrough banner
        ctx.fillStyle = this.colors.neutralized;
        ctx.fillRect(-60, -node.radius - 22, 120, 16);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('[NEUTRALIZED]', 0, -node.radius - 11);
      }

      // Label below node
      ctx.fillStyle = this.colors.textPrimary;
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      const label = node.canonical_name || node.name || 'Entity';
      ctx.fillText(label, 0, node.radius + 15);

      // Sub-label (Role or City)
      ctx.fillStyle = this.colors.textSecondary;
      ctx.font = '500 9px Inter, sans-serif';
      const subLabel = node.role || node.city || '';
      ctx.fillText(subLabel, 0, node.radius + 26);

      // T4.4 — jurisdiction badge (count) + glowing purple halo for cross-jurisdiction nodes
      const jCount = this.jurisdictionCountOf(node);
      if (jCount >= 2) {
        const bx = node.radius * 0.75;
        const by = -node.radius * 0.85;
        ctx.beginPath();
        ctx.arc(0, 0, node.radius + 5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(124, 58, 237, 0.55)';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.shadowColor = 'rgba(124, 58, 237, 0.7)';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(bx, by, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#7C3AED';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(jCount), bx, by + 3);
      }

      ctx.restore();
    });
  }

  drawVectorIcon(ctx, node, color) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const role = (node.role || '').toLowerCase();

    if (node.orbit === 0) {
      // 👑 Crown Silhouette for Kingpin
      ctx.beginPath();
      ctx.moveTo(-10, 5);
      ctx.lineTo(10, 5);
      ctx.lineTo(10, -5);
      ctx.lineTo(5, -1);
      ctx.lineTo(0, -7);
      ctx.lineTo(-5, -1);
      ctx.lineTo(-10, -5);
      ctx.closePath();
      ctx.fill();
    } else if (role.includes('vehicle')) {
      // 🚗 Sedan Car Silhouette
      ctx.beginPath();
      ctx.moveTo(-8, 3);
      ctx.lineTo(8, 3);
      ctx.lineTo(7, -1);
      ctx.lineTo(3, -4);
      ctx.lineTo(-3, -4);
      ctx.lineTo(-6, -1);
      ctx.closePath();
      ctx.stroke();
      // Wheels
      ctx.beginPath();
      ctx.arc(-5, 4, 1.8, 0, Math.PI * 2);
      ctx.arc(5, 4, 1.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (role.includes('telecom') || role.includes('tap')) {
      // 📞 Telecom Handset
      ctx.beginPath();
      ctx.arc(0, 0, 5, Math.PI * 0.2, Math.PI * 1.8, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 👤 Person Silhouette
      ctx.beginPath();
      ctx.arc(0, -4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 6, 6.5, Math.PI, 0, false);
      ctx.fill();
    }
  }
}
