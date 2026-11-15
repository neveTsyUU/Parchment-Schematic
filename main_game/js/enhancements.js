/**
 * enhancements.js — load AFTER js/app.js:  <script src="js/enhancements.js"></script>
 * Implements: stage tint overlay, mobile pinned mini budget bar, Max-Q breakup limit,
 * stamp flip/rotate, accessibility (ARIA, patterned swatches, pass/fail glyphs).
 */
(() => {
  'use strict';

  /* ---------- CSS (uses the existing :root custom properties) ---------- */
  const css = `
  #mini-budget{position:sticky;top:0;z-index:35;display:none;gap:10px;justify-content:space-between;
    padding:4px 10px;background:var(--parchment-card);border-bottom:1.5px solid var(--ink-dark);
    font:700 11px 'IBM Plex Mono',monospace;color:var(--ink-dark)}
  #mini-budget span.fail{color:var(--accent-crimson)} #mini-budget span.pass{color:var(--accent-emerald)}
  @media (max-width:1023px){#mini-budget{display:flex}}
  /* colour-independent pass/fail */
  .bd-row.pass .bd-name::after{content:' \\2713'} .bd-row.fail .bd-name::after{content:' \\2717'}
  /* swatch patterns so materials differ without colour */
  .swatch-btn{position:relative}
  .swatch-btn::after{content:'';position:absolute;inset:0;pointer-events:none;border-radius:inherit}
  .pat-0::after{background:repeating-linear-gradient(45deg,rgba(255,255,255,.5) 0 2px,transparent 2px 5px)}
  .pat-1::after{background:repeating-linear-gradient(-45deg,rgba(0,0,0,.35) 0 2px,transparent 2px 5px)}
  .pat-2::after{background:radial-gradient(rgba(255,255,255,.6) 1px,transparent 1.5px) 0 0/5px 5px}
  .pat-3::after{background:repeating-linear-gradient(0deg,rgba(255,255,255,.5) 0 1px,transparent 1px 4px)}
  .pat-4::after{background:repeating-linear-gradient(90deg,rgba(0,0,0,.35) 0 1px,transparent 1px 4px)}
  .pat-5::after{background:linear-gradient(45deg,rgba(255,255,255,.5) 25%,transparent 25% 75%,rgba(255,255,255,.5) 75%) 0 0/6px 6px}
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ---------- Mobile pinned mini budget bar ---------- */
  const mini = document.createElement('div');
  mini.id = 'mini-budget';
  mini.setAttribute('role', 'status');
  mini.setAttribute('aria-live', 'polite');
  document.body.prepend(mini);

  function updateMini() {
    const a = state.analysis;
    if (!a || a.empty) { mini.textContent = 'Draw a rocket to see budgets'; return; }
    const ok = id => (a.reqs.find(r => r.id === id) || {}).pass ? 'pass' : 'fail';
    mini.innerHTML =
      `<span class="${ok('orbit')}">\u0394v ${(a.dvInfo.totalDv / 1000).toFixed(1)}/${(a.dvReq / 1000).toFixed(1)}</span>` +
      `<span class="${ok('budget')}">$${(a.totalCost / 1000).toFixed(2)}M</span>` +
      `<span class="${ok('power')}">Pwr ${a.powerMargin >= 0 ? '+' : ''}${a.powerMargin.toFixed(1)}W</span>` +
      `<span>${a.totalMass.toFixed(0)}kg</span>`;
  }
  const _refresh = window.refreshMissionUI;
  window.refreshMissionUI = function () { _refresh.apply(this, arguments); updateMini(); };

  /* ---------- Stage tint overlay (Design mode) ---------- */
  let showStages = false;
  const STAGE_COL = ['rgba(37,92,133,.38)', 'rgba(36,107,80,.38)', 'rgba(179,107,29,.38)', 'rgba(107,63,160,.38)'];
  const SAT_COL = 'rgba(184,58,45,.38)';
  const gridBtn = document.getElementById('btn-toggle-grid');
  if (gridBtn) {
    const b = document.createElement('button');
    b.className = 'draft-btn px-2.5 py-1 rounded text-xs font-mono-tech font-bold draft-shadow-sm';
    b.textContent = 'STAGES: OFF';
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => {
      showStages = !showStages;
      b.textContent = `STAGES: ${showStages ? 'ON' : 'OFF'}`;
      b.classList.toggle('active', showStages);
      b.setAttribute('aria-pressed', String(showStages));
    });
    gridBtn.parentElement.prepend(b);
  }
  const _renderBuild = window.renderBuildCanvas;
  window.renderBuildCanvas = function () {
    _renderBuild();
    if (!showStages) return;
    const sep = getSeparationRows(state.grid, state.cols, state.rows);
    const top = sep.length; // index of the satellite stage
    const z = state.zoom, gx0 = Math.round(state.panX), gy0 = Math.round(state.panY);
    const firstRow = {};
    for (let y = 0; y < state.rows; y++) {
      const row = state.grid[y];
      if (!row) continue;
      const k = stageOfRow(y, sep);
      ctx.fillStyle = k === top && top > 0 ? SAT_COL : STAGE_COL[k % STAGE_COL.length];
      for (let x = 0; x < state.cols; x++) {
        if (!row[x]) continue;
        ctx.fillRect(gx0 + x * z, gy0 + y * z, z, z);
        if (firstRow[k] === undefined) firstRow[k] = y;
      }
    }
    ctx.fillStyle = '#2b241b';
    ctx.font = '700 11px "IBM Plex Mono", monospace';
    ctx.textAlign = 'left';
    for (const k in firstRow) {
      const label = (+k === top && top > 0) ? 'SAT' : `S${+k + 1}`;
      ctx.fillText(label, gx0 + state.cols * z + 6, gy0 + firstRow[k] * z + 11);
    }
  };

  /* ---------- Max-Q structural limit ---------- */
  const MAXQ_PA = 35000;
  let qWarned = false;
  const _step = window.stepSimulation;
  window.stepSimulation = function (dt) {
    _step(dt);
    if (state.mode !== 'sim' || sim.windTunnel || sim.brokenUp) return;
    const q = (state.physics && state.physics.q) || 0;
    if (q > MAXQ_PA * 0.8 && !qWarned) { qWarned = true; showToast('Approaching Max-Q (' + (MAXQ_PA / 1000) + ' kPa limit): throttle down!'); }
    if (q > MAXQ_PA) {
      sim.brokenUp = true; sim.tumbled = true; sim.ignited = false; sim.throttle = 0;
      sim.omega += (Math.random() - 0.5) * 5;
      showToast('MAX-Q BREAKUP: dynamic pressure exceeded structural limit');
    }
  };
  const _reset = window.resetSimulation;
  window.resetSimulation = function () { sim.brokenUp = false; qWarned = false; _reset.apply(this, arguments); };

  /* ---------- Stamp flip [X] and rotate [T] ---------- */
  window.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (state.mode !== 'build' || state.tool !== 'stamp' || !state.activeStamp) return;
    const s = state.activeStamp, k = e.key.toLowerCase();
    if (k === 'x') {
      state.activeStamp = { ...s, pixels: s.pixels.map(r => r.slice().reverse()) };
      showToast('Stamp flipped');
    } else if (k === 't') {
      const h = s.height, w = s.width, px = [];
      for (let r = 0; r < w; r++) {
        px.push([]);
        for (let c = 0; c < h; c++) px[r].push((s.pixels[h - 1 - c] || [])[r] || null);
      }
      state.activeStamp = { ...s, width: h, height: w, pixels: px, dims: `${h}\u00d7${w} px` };
      showToast('Stamp rotated 90\u00b0');
    }
  });

  /* ---------- Accessibility ---------- */
  function applyA11y() {
    const cv = document.getElementById('main-canvas');
    if (cv) { cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Spacecraft blueprint drawing canvas'); }
    document.querySelectorAll('button[title]:not([aria-label])').forEach(b => b.setAttribute('aria-label', b.title));
    document.querySelectorAll('.swatch-btn').forEach(b => {
      const i = Math.max(0, MATERIALS.findIndex(m => m.id === b.dataset.mat));
      b.classList.add('pat-' + (i % 6));
      b.setAttribute('aria-label', `${(MATERIAL_MAP[b.dataset.mat] || {}).name || 'material'} ${b.dataset.hex}`);
    });
  }
  ['materials-list', 'stamps-list', 'budget-dock'].forEach(id => {
    const el = document.getElementById(id);
    if (el) new MutationObserver(applyA11y).observe(el, { childList: true, subtree: true });
  });
  applyA11y();
  updateMini();
})();