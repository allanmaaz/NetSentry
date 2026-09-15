/**
 * NetSentry — Temporal Syndicate Expansion Timeline Player (T5.2)
 * Problem Statement 26189 | Ministry of Home Affairs / NCRB
 *
 * Wired to date_added / date_first_fir fields from canonicalSyndicates.js.
 * Show/hide nodes progressively as the scrubber moves; Play runs a 5-second
 * animated growth sequence; "Formation Story" overlay at milestone dates.
 */

const MILESTONES = [
  { year: 2022, label: 'Genesis — first FIRs filed, kingpin surfaces' },
  { year: 2023, label: 'Expansion — lieutenants recruited across districts' },
  { year: 2024, label: 'Interstate leap — conduits open in second state' },
  { year: 2025, label: 'Peak network — hawala + telecom mesh complete' },
  { year: 2026, label: 'Crackdown window — full syndicate mapped' }
];

export class TimelinePlayer {
  constructor(containerElement, onTimeChange) {
    this.container = containerElement;
    this.onTimeChange = onTimeChange;

    this.isPlaying = false;
    this.currentYear = 2026;
    this.timer = null;
    // T5.2 — entity date index: entityId → first-active year
    this.entityYears = new Map();

    this.init();
  }

  /**
   * T5.2 — index date_added / date_first_fir fields from syndicate data.
   * Accepts the active entity list; falls back to orbit-based staging.
   */
  indexEntities(entities = []) {
    this.entityYears.clear();
    entities.forEach((e) => {
      const raw = e.date_added || e.date_first_fir || e.first_seen || null;
      let year = 2026;
      if (raw) {
        const parsed = new Date(raw).getFullYear();
        if (!Number.isNaN(parsed)) year = Math.min(2026, Math.max(2022, parsed));
      } else {
        // Fallback staging: kingpin first, then outward by orbit
        const orbit = e.orbit_level ?? 2;
        year = orbit === 0 ? 2022 : orbit === 1 ? 2023 : 2024;
      }
      this.entityYears.set(e.id, year);
    });
  }

  /** T5.2 — progressive visibility: entity visible if its year <= scrubber year */
  isEntityVisible(entityId, year) {
    const y = this.entityYears.get(entityId);
    if (y == null) return true;
    return y <= (year ?? this.currentYear);
  }

  milestoneFor(year) {
    const m = MILESTONES.filter((x) => x.year <= year).pop();
    return m || MILESTONES[0];
  }

  init() {
    this.container.innerHTML = `
      <div id="timeline-controls-bar" style="
        position: absolute;
        bottom: 58px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 30;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid #E2E8F0;
        border-radius: 16px;
        padding: 6px 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
        min-width: 280px;
      ">
        <div style="display: flex; align-items: center; gap: 12px; width: 100%;">
          <button id="btn-timeline-play" style="
            background: #0EA5E9;
            border: none;
            color: #FFFFFF;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
          ">▶</button>
          <span style="font-size: 11px; font-weight: 700; color: #0F172A; min-width: 48px;" id="timeline-year-display">2026</span>
          <input type="range" id="timeline-slider" min="2022" max="2026" value="2026" step="1" style="
            width: 140px;
            cursor: pointer;
            accent-color: #0EA5E9;
          " />
          <span style="font-size: 10px; color: #64748B; font-weight: 600;">TEMPORAL PLAYBACK</span>
        </div>
        <div id="timeline-story-label" style="
          font-size: 10px; font-weight: 700; color: #7C3AED;
          font-family: monospace; text-align: center;
        ">Formation Story: Crackdown window — full syndicate mapped</div>
      </div>
    `;

    const btnPlay = document.getElementById('btn-timeline-play');
    const slider = document.getElementById('timeline-slider');
    const display = document.getElementById('timeline-year-display');
    const story = document.getElementById('timeline-story-label');

    const emit = () => {
      if (display) display.textContent = this.currentYear;
      if (story) story.textContent = `Formation Story: ${this.milestoneFor(this.currentYear).label}`;
      if (this.onTimeChange) this.onTimeChange(this.currentYear);
    };

    slider?.addEventListener('input', (e) => {
      this.currentYear = parseInt(e.target.value);
      emit();
    });

    btnPlay?.addEventListener('click', () => {
      this.togglePlay();
    });
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    const btnPlay = document.getElementById('btn-timeline-play');
    const slider = document.getElementById('timeline-slider');
    const display = document.getElementById('timeline-year-display');
    const story = document.getElementById('timeline-story-label');

    if (this.isPlaying) {
      if (btnPlay) btnPlay.textContent = '⏸';
      // T5.2 — 5-second animated growth sequence (2022 → 2026, 1s per year)
      this.currentYear = 2022;
      const step = () => {
        if (slider) slider.value = this.currentYear;
        if (display) display.textContent = this.currentYear;
        if (story) story.textContent = `Formation Story: ${this.milestoneFor(this.currentYear).label}`;
        if (this.onTimeChange) this.onTimeChange(this.currentYear);
        if (this.currentYear >= 2026) {
          this.isPlaying = false;
          if (btnPlay) btnPlay.textContent = '▶';
          clearInterval(this.timer);
          return;
        }
        this.currentYear += 1;
      };
      step();
      this.timer = setInterval(step, 1000);
    } else {
      if (btnPlay) btnPlay.textContent = '▶';
      clearInterval(this.timer);
    }
  }
}
