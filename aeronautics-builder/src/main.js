/**
 * CREATE AERONAUTICS — CONTRAPTION DIAGRAM & AIRSHIP BUILDER
 * High-craft pixel-art blueprint editor & 2D aerodynamics simulator.
 * Flight test physics powered by Rapier 2D (see physics.js).
 */

import {
  initPhysics,
  createContraption,
  stepContraption,
  constrainContraption,
  getBodyState,
  destroyContraption
} from './physics.js';

const canvas = document.getElementById('blueprintCanvas');
const ctx = canvas.getContext('2d');

// Grid dimensions (logical cells)
const GRID_COLS = 39; // Odd number so column 19 is exact center axis (x = 0)
const GRID_ROWS = 23;
const CENTER_COL = Math.floor(GRID_COLS / 2); // 19
const CENTER_ROW = Math.floor(GRID_ROWS / 2); // 11

// Block Definitions tailored to Create Mod / Create Aeronautics
const BLOCK_TYPES = {
  wing: {
    id: 'wing',
    name: 'WING',
    fullName: 'Bearing Wing / Sail',
    mass: 12,
    lift: 42,
    thrust: 0,
    buoyancy: 0,
    desc: 'Generates upward aerodynamic lift vectors.'
  },
  propeller: {
    id: 'propeller',
    name: 'ROTOR',
    fullName: 'Aeronautics Propeller / Ring Thruster',
    mass: 22,
    lift: 18,
    thrust: 55,
    buoyancy: 0,
    desc: 'Glowing blue turbine ring providing thrust & rotor wash.'
  },
  hull: {
    id: 'hull',
    name: 'HULL',
    fullName: 'Andesite Airship Casing',
    mass: 28,
    lift: 0,
    thrust: 0,
    buoyancy: 0,
    desc: 'Sturdy structural casing for airship fuselages.'
  },
  frame: {
    id: 'frame',
    name: 'FRAME',
    fullName: 'Brass Truss Frame',
    mass: 10,
    lift: 0,
    thrust: 0,
    buoyancy: 0,
    desc: 'Lightweight brass chassis connecting wing spars.'
  },
  engine: {
    id: 'engine',
    name: 'CORE',
    fullName: 'Encased Cogwheel / Rotational Core',
    mass: 65,
    lift: 0,
    thrust: 25,
    buoyancy: 0,
    desc: 'Heavy central rotational engine core powering rotors.'
  },
  fin: {
    id: 'fin',
    name: 'FIN',
    fullName: 'Vertical Tail Stabilizer',
    mass: 14,
    lift: 10,
    thrust: 0,
    buoyancy: 0,
    desc: 'Stabilizes pitch & yaw torque during flight.'
  },
  helm: {
    id: 'helm',
    name: 'HELM',
    fullName: 'Brass Ship Helm / Pilot Seat',
    mass: 20,
    lift: 0,
    thrust: 0,
    buoyancy: 0,
    desc: 'Control station required to pilot the contraption.'
  },
  balloon: {
    id: 'balloon',
    name: 'BALLOON',
    fullName: 'Aether Buoyancy Balloon',
    mass: 8,
    lift: 0,
    thrust: 0,
    buoyancy: 52,
    desc: 'Passive lighter-than-air lift even at zero throttle.'
  },
  eraser: {
    id: 'eraser',
    name: 'ERASE',
    fullName: 'Wrench / Remove Block',
    mass: 0,
    lift: 0,
    thrust: 0,
    buoyancy: 0,
    desc: 'Click or drag to dismantle blocks.'
  }
};

// Application State
const state = {
  grid: Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(null)),
  selectedBlock: 'wing',
  mirrorMode: true,
  showSpecs: false,
  showVectors: true,
  showCoM: false,
  showMassHeatmap: false,
  viewMode: 0, // 0 = Front Elevation, 1 = Side Profile, 2 = Top-Down Plan
  panOffsetX: 0,
  panOffsetY: 0,
  hoverCell: null,
  isMouseDown: false,
  mouseButton: 0,
  presetIndex: 0,
  animTime: 0,
  // Flight Simulation State
  // x / y / angle are now READ from the Rapier body each frame (see updateFlightSimulation).
  // x / y are in pixels, angle in radians.
  simulating: false,
  sim: {
    x: 0,
    y: 0,
    angle: 0,
    throttle: 0.72,
    keys: {}
  }
};

const VIEW_NAMES = ['FRONT ELEVATION', 'SIDE PROFILE', 'TOP-DOWN BLUEPRINT'];

// Handwritten Pixel Physics Equations scattered in the parchment background (matching screenshot)
const BACKGROUND_NOTES = [
  { xRatio: 0.34, yRatio: 0.25, text: 'f(x)', scale: 2 },
  { xRatio: 0.41, yRatio: 0.23, text: '∫ ρ·v² dx', scale: 1.5 },
  { xRatio: 0.49, yRatio: 0.28, text: 'M = r × F', scale: 1.7 },
  { xRatio: 0.71, yRatio: 0.35, text: 'dL/dt = τ', scale: 1.6 },
  { xRatio: 0.76, yRatio: 0.56, text: '∑mr = R', scale: 2 },
  { xRatio: 0.73, yRatio: 0.81, text: 'E = ½mv²', scale: 2 },
  { xRatio: 0.21, yRatio: 0.76, text: 'C_L = 2π·α', scale: 1.5 }
];

/**
 * Load Preset Contraptions
 * Preset 0 replicates the exact silhouette & thruster layout in the user's screenshot!
 */
function loadPreset(index) {
  state.grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(null));
  state.panOffsetX = 0;
  state.panOffsetY = 0;

  const setSymmetric = (dx, dy, type) => {
    const r = CENTER_ROW + dy;
    const c1 = CENTER_COL + dx;
    const c2 = CENTER_COL - dx;
    if (r >= 0 && r < GRID_ROWS) {
      if (c1 >= 0 && c1 < GRID_COLS) state.grid[r][c1] = type;
      if (c2 >= 0 && c2 < GRID_COLS) state.grid[r][c2] = type;
    }
  };

  if (index === 0) {
    // Screenshot Contraption: Heavy Winged Rotorcraft / Sky-Cruiser
    // Vertical Tail Fin spire
    setSymmetric(0, -3, 'fin');
    setSymmetric(0, -2, 'fin');
    setSymmetric(0, -1, 'fin');

    // Central fuselage & engine core
    setSymmetric(0, 0, 'hull');
    setSymmetric(0, 1, 'helm');
    setSymmetric(0, 2, 'engine');
    setSymmetric(0, 3, 'hull');

    // Inner cockpit/sail pods flanking center
    setSymmetric(1, 0, 'frame');
    setSymmetric(2, 0, 'frame');
    setSymmetric(2, 1, 'hull');
    setSymmetric(1, 3, 'hull');
    setSymmetric(2, 3, 'frame');

    // Long horizontal wing spars extending 10 blocks left and right
    for (let dx = 3; dx <= 10; dx++) {
      setSymmetric(dx, 0, 'wing');
    }

    // Inner glowing blue thruster ring row (dx = 1, 2, 3, 5 at dy = 2; plus dx = 2 at dy = 3)
    setSymmetric(1, 2, 'propeller');
    setSymmetric(2, 2, 'propeller');
    setSymmetric(2, 3, 'propeller');
    setSymmetric(3, 2, 'propeller');
    setSymmetric(4, 2, 'frame'); // Dark spacer hub
    setSymmetric(5, 2, 'propeller');

    // Outer 4-ring cross thruster cluster around hub at dx = 7, dy = 2
    setSymmetric(7, 2, 'hull');      // Center hub block
    setSymmetric(7, 1, 'propeller'); // Top ring
    setSymmetric(7, 3, 'propeller'); // Bottom ring
    setSymmetric(6, 2, 'propeller'); // Left ring
    setSymmetric(8, 2, 'propeller'); // Right ring

    showToast('Loaded Preset: Aeronautics Winged Cruiser (Screenshot Layout)');
  } else if (index === 1) {
    // Preset 1: Brass Zeppelin / Aether Balloon Airship
    for (let dx = 0; dx <= 6; dx++) {
      setSymmetric(dx, -4, 'balloon');
      setSymmetric(dx, -3, 'balloon');
    }
    for (let dx = 0; dx <= 4; dx++) {
      setSymmetric(dx, -2, 'frame');
    }
    setSymmetric(0, 0, 'helm');
    setSymmetric(1, 0, 'engine');
    setSymmetric(2, 0, 'hull');
    setSymmetric(3, 0, 'propeller');
    setSymmetric(4, 0, 'wing');
    setSymmetric(5, 0, 'wing');
    setSymmetric(0, 1, 'hull');
    setSymmetric(1, 1, 'hull');
    setSymmetric(2, 1, 'propeller');
    showToast('Loaded Preset: Brass Aether Airship');
  } else {
    // Preset 2: Compact Quad-Rotor Scout
    setSymmetric(0, -1, 'fin');
    setSymmetric(0, 0, 'helm');
    setSymmetric(0, 1, 'engine');
    setSymmetric(1, 0, 'frame');
    setSymmetric(2, 0, 'wing');
    setSymmetric(3, 0, 'wing');
    setSymmetric(4, 0, 'propeller');
    setSymmetric(4, -1, 'propeller');
    setSymmetric(2, 1, 'propeller');
    showToast('Loaded Preset: Quad-Rotor Sky Scout');
  }

  updateTelemetry();
}

/**
 * Build the Bottom Block Palette UI
 */
function initPaletteUI() {
  const container = document.getElementById('paletteSlots');
  container.innerHTML = '';

  Object.values(BLOCK_TYPES).forEach((block) => {
    const btn = document.createElement('button');
    btn.className = `slot-btn ${state.selectedBlock === block.id ? 'selected' : ''}`;
    btn.dataset.blockId = block.id;
    btn.title = `${block.fullName}: ${block.desc}`;

    // Mini pixel canvas icon for each block
    const miniCanvas = document.createElement('canvas');
    miniCanvas.width = 24;
    miniCanvas.height = 24;
    miniCanvas.style.imageRendering = 'pixelated';
    const mCtx = miniCanvas.getContext('2d');
    drawBlockSprite(mCtx, block.id, 0, 0, 24, 0);

    const label = document.createElement('span');
    label.className = 'slot-label';
    label.textContent = block.name;

    btn.appendChild(miniCanvas);
    btn.appendChild(label);

    btn.addEventListener('click', () => {
      state.selectedBlock = block.id;
      document.querySelectorAll('.slot-btn').forEach(el => {
        el.classList.toggle('selected', el.dataset.blockId === block.id);
      });
    });

    container.appendChild(btn);
  });
}

/**
 * Crisp Pixel-Art Sprite Renderer for each Create Aeronautics block
 */
function drawBlockSprite(c, type, x, y, size, animPhase = 0) {
  const p = size / 16; // 1 pixel unit in 16x16 sprite grid
  const px = (gx, gy, gw, gh, color) => {
    c.fillStyle = color;
    c.fillRect(Math.round(x + gx * p), Math.round(y + gy * p), Math.ceil(gw * p), Math.ceil(gh * p));
  };

  if (type === 'wing') {
    // Horizontal dark-iron & spruce bearing wing spar matching screenshot
    px(0, 6, 16, 4, '#4e5256');
    px(0, 6, 16, 1, '#787d82');
    px(0, 9, 16, 1, '#2f3235');
    // Ribs / brackets
    px(3, 5, 2, 6, '#383b3e');
    px(11, 5, 2, 6, '#383b3e');
    px(7, 6, 2, 4, '#9e8256');
  } else if (type === 'propeller') {
    // Signature glowing light-blue concentric ring/orb from screenshot!
    // Outer white-blue aura
    px(3, 1, 10, 14, '#e3f6ff');
    px(1, 3, 14, 10, '#e3f6ff');
    // Crisp sky-blue ring
    px(4, 1, 8, 2, '#78bce0');
    px(4, 13, 8, 2, '#78bce0');
    px(1, 4, 2, 8, '#78bce0');
    px(13, 4, 2, 8, '#78bce0');
    px(3, 3, 2, 2, '#78bce0');
    px(11, 3, 2, 2, '#78bce0');
    px(3, 11, 2, 2, '#78bce0');
    px(11, 11, 2, 2, '#78bce0');
    // Inner white core
    px(4, 4, 8, 8, '#f7fcff');
    px(5, 5, 6, 6, '#bce4fa');
    // Spinning blade blur effect when animated
    if (animPhase > 0) {
      const offset = Math.floor(animPhase * 8) % 2 === 0 ? 0 : 1;
      px(6 + offset, 2, 3, 12, 'rgba(92, 167, 212, 0.55)');
    }
  } else if (type === 'hull') {
    // Andesite Casing block
    px(1, 1, 14, 14, '#6d7072');
    px(1, 1, 14, 2, '#8b8f92');
    px(1, 13, 14, 2, '#47494b');
    px(1, 1, 2, 14, '#8b8f92');
    px(13, 1, 2, 14, '#47494b');
    // Inner stone texture
    px(4, 4, 8, 8, '#5a5d5f');
    px(5, 5, 3, 3, '#767a7d');
    px(9, 8, 2, 3, '#4c4e50');
  } else if (type === 'frame') {
    // Brass Truss / Scaffolding Frame
    px(1, 1, 14, 2, '#c8963e');
    px(1, 13, 14, 2, '#9c7025');
    px(1, 1, 2, 14, '#c8963e');
    px(13, 1, 2, 14, '#9c7025');
    // Diagonal cross brace
    for (let i = 3; i < 12; i += 2) {
      px(i, i, 2, 2, '#b38230');
      px(14 - i, i, 2, 2, '#b38230');
    }
  } else if (type === 'engine') {
    // Encased Cogwheel / Rotational Core (matches central brown/brass core in screenshot)
    px(1, 1, 14, 14, '#59422b');
    px(2, 2, 12, 12, '#87633e');
    // Brass ring
    px(4, 3, 8, 10, '#d6a449');
    px(3, 4, 10, 8, '#d6a449');
    // Dark center axle
    px(6, 6, 4, 4, '#3d2e1e');
    px(7, 7, 2, 2, '#b8b2a6');
  } else if (type === 'fin') {
    // Vertical Tail Stabilizer spire
    px(6, 1, 4, 14, '#4a4e52');
    px(7, 0, 2, 15, '#686d73');
    px(4, 11, 8, 4, '#3a3d40');
    px(5, 12, 6, 2, '#9e7838');
  } else if (type === 'helm') {
    // Brass Ship Helm / Pilot Seat
    px(3, 10, 10, 4, '#7d562d');
    px(4, 11, 8, 2, '#a8753e');
    // Wheel spokes
    px(7, 3, 2, 8, '#d9a74a');
    px(4, 6, 8, 2, '#d9a74a');
    px(5, 4, 6, 6, '#b8862e');
    px(6, 5, 4, 4, '#f5eedc');
  } else if (type === 'balloon') {
    // Cream & Red/Brass Aether Buoyancy Cell
    px(3, 1, 10, 13, '#e8dec3');
    px(2, 3, 12, 9, '#e8dec3');
    px(2, 6, 12, 3, '#b84a39');
    px(5, 13, 6, 2, '#8c6528');
    px(4, 3, 3, 2, '#fffdf7');
  } else if (type === 'eraser') {
    // Create Mod Wrench icon
    px(9, 2, 4, 4, '#d9a74a');
    px(10, 3, 2, 2, '#353739');
    px(7, 5, 3, 3, '#8d9296');
    px(5, 7, 3, 3, '#8d9296');
    px(3, 9, 3, 4, '#b87a3d');
  }
}

/**
 * Calculate Aerodynamics, Mass, Center of Mass (CoM), and Center of Lift (CoL)
 */
function calculatePhysics() {
  let totalMass = 0;
  let totalLift = 0;
  let totalThrust = 0;
  let totalBuoyancy = 0;
  let blockCount = 0;
  let hasHelm = false;

  let massMomentX = 0;
  let massMomentY = 0;
  let liftMomentX = 0;
  let liftMomentY = 0;
  let liftWeightSum = 0;

  // Also track column lift profiles so stacked/adjacent wings create tall vs short blue arrows like the screenshot
  const colLift = Array(GRID_COLS).fill(0);
  const colTopWingRow = Array(GRID_COLS).fill(null);

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const type = state.grid[r][c];
      if (!type) continue;
      const spec = BLOCK_TYPES[type];
      blockCount++;
      if (type === 'helm') hasHelm = true;

      const relX = c - CENTER_COL;
      const relY = r - CENTER_ROW;

      totalMass += spec.mass;
      massMomentX += relX * spec.mass;
      massMomentY += relY * spec.mass;

      const upwardForce = spec.lift + spec.buoyancy;
      totalLift += spec.lift;
      totalBuoyancy += spec.buoyancy;
      totalThrust += spec.thrust;

      if (upwardForce > 0) {
        liftMomentX += relX * upwardForce;
        liftMomentY += relY * upwardForce;
        liftWeightSum += upwardForce;
      }

      if (type === 'wing' || type === 'balloon') {
        colLift[c] += upwardForce;
        if (colTopWingRow[c] === null || r < colTopWingRow[c]) {
          colTopWingRow[c] = r;
        }
      }
    }
  }

  const comX = totalMass > 0 ? massMomentX / totalMass : 0;
  const comY = totalMass > 0 ? massMomentY / totalMass : 0;
  const colX = liftWeightSum > 0 ? liftMomentX / liftWeightSum : comX;
  const colY = liftWeightSum > 0 ? liftMomentY / liftWeightSum : comY;

  const weightForce = totalMass * 0.98;
  const effectiveLift = totalLift + totalBuoyancy + totalThrust * 0.35;
  const lwr = weightForce > 0 ? effectiveLift / weightForce : 0;

  return {
    blockCount,
    totalMass,
    totalLift,
    totalBuoyancy,
    totalThrust,
    lwr,
    hasHelm,
    comX,
    comY,
    colX,
    colY,
    colLift,
    colTopWingRow
  };
}

/**
 * Update Telemetry Panel Readouts
 */
function updateTelemetry() {
  const stats = calculatePhysics();
  document.getElementById('statBlocks').textContent = stats.blockCount;
  document.getElementById('statMass').textContent = `${stats.totalMass} kg`;
  document.getElementById('statLift').textContent = `${stats.totalLift + stats.totalBuoyancy} kN`;
  document.getElementById('statThrust').textContent = `${stats.totalThrust} kN`;

  const lwrEl = document.getElementById('statLWR');
  lwrEl.textContent = stats.lwr.toFixed(2);
  lwrEl.style.color = stats.lwr >= 1.0 ? '#2a7d38' : '#b5382a';

  const offset = Math.abs(stats.comX - stats.colX);
  const balEl = document.getElementById('statBalance');
  if (stats.blockCount === 0) {
    balEl.textContent = 'EMPTY';
    balEl.style.color = '#6b5e4c';
  } else if (offset < 0.35) {
    balEl.textContent = 'OPTIMAL';
    balEl.style.color = '#2a7d38';
  } else {
    balEl.textContent = `OFFSET (${(stats.colX - stats.comX).toFixed(1)})`;
    balEl.style.color = '#c46d16';
  }

  const helmEl = document.getElementById('statHelm');
  helmEl.textContent = stats.hasHelm ? 'INSTALLED' : 'MISSING';
  helmEl.style.color = stats.hasHelm ? '#2a7d38' : '#b5382a';
}

/**
 * Draw Faint Pixel Handwritten Physics Notes on Parchment
 */
function drawParchmentEquations(w, h) {
  ctx.save();
  ctx.fillStyle = 'rgba(95, 84, 70, 0.48)';
  ctx.font = 'bold 18px "Press Start 2P", monospace';
  ctx.textBaseline = 'middle';

  BACKGROUND_NOTES.forEach(note => {
    const nx = Math.round(w * note.xRatio);
    const ny = Math.round(h * note.yRatio);
    ctx.save();
    ctx.translate(nx, ny);
    ctx.scale(note.scale * 0.55, note.scale * 0.55);
    ctx.fillText(note.text, 0, 0);
    ctx.restore();
  });
  ctx.restore();
}

/**
 * Draw Upward Pixel Lift Vector Arrows (Matching the tall/short blue arrows in screenshot)
 */
function drawLiftArrow(cx, baseY, heightPx, pulseOffset = 0) {
  const tipY = Math.round(baseY - heightPx - pulseOffset);
  const startY = Math.round(baseY);
  const x = Math.round(cx);

  // Base square anchor block on wing
  ctx.fillStyle = '#9acae3';
  ctx.fillRect(x - 6, startY - 6, 12, 12);

  // Vertical arrow shaft
  ctx.fillStyle = '#8cc5e3';
  ctx.fillRect(x - 2, tipY + 6, 4, Math.max(4, startY - tipY - 12));

  // Pixel arrowhead chevron
  const headRows = [
    [0, 1],
    [-2, 5],
    [-4, 9],
    [-6, 13],
    [-8, 17]
  ];
  headRows.forEach(([dx, width], idx) => {
    ctx.fillStyle = '#8cc5e3';
    ctx.fillRect(x + dx, tipY + idx * 2, width, 2);
  });
  // Hollow inner chevron highlight matching screenshot's pixel outline arrow
  ctx.fillStyle = '#f6efe0';
  ctx.fillRect(x - 3, tipY + 6, 6, 2);
  ctx.fillRect(x - 5, tipY + 8, 10, 2);
}

/**
 * Draw Center of Mass (Checkered Yellow/Black) & Center of Lift (Blue Crosshair)
 */
function drawBalanceMarkers(originX, originY, cellSize, stats) {
  if (stats.blockCount === 0) return;

  // Center of Mass (CoM)
  const comPx = Math.round(originX + (CENTER_COL + stats.comX + 0.5) * cellSize);
  const comPy = Math.round(originY + (CENTER_ROW + stats.comY + 0.5) * cellSize);

  ctx.save();
  ctx.translate(comPx, comPy);
  // Checkered circle
  ctx.fillStyle = '#2b241d';
  ctx.fillRect(-10, -10, 20, 20);
  ctx.fillStyle = '#f2c14e';
  ctx.fillRect(-8, -8, 8, 8);
  ctx.fillRect(0, 0, 8, 8);
  ctx.fillStyle = '#3b332b';
  ctx.fillRect(0, -8, 8, 8);
  ctx.fillRect(-8, 0, 8, 8);
  // Label
  ctx.fillStyle = '#2b241d';
  ctx.font = 'bold 14px "VT323", monospace';
  ctx.fillText('CoM', 13, 4);
  ctx.restore();

  // Center of Lift (CoL)
  const colPx = Math.round(originX + (CENTER_COL + stats.colX + 0.5) * cellSize);
  const colPy = Math.round(originY + (CENTER_ROW + stats.colY + 0.5) * cellSize);

  ctx.save();
  ctx.translate(colPx, colPy);
  ctx.fillStyle = '#3c8ec7';
  ctx.fillRect(-8, -8, 16, 16);
  ctx.fillStyle = '#c9ebff';
  ctx.fillRect(-6, -6, 12, 12);
  ctx.fillStyle = '#3c8ec7';
  ctx.fillRect(-2, -14, 4, 10);
  ctx.fillText('CoL', 13, -4);
  ctx.restore();
}

/**
 * Main Render Loop
 */
function render(timestamp) {
  state.animTime = timestamp * 0.001;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
  }

  ctx.save();
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = rect.height;

  // 1. Parchment Background Fill
  ctx.fillStyle = '#f5eedc';
  ctx.fillRect(0, 0, w, h);

  // Compute responsive cell size so grid fills the parchment nicely
  const cellSize = Math.max(16, Math.floor(Math.min(w / (GRID_COLS + 2), h / (GRID_ROWS + 2))));
  const gridPixelW = GRID_COLS * cellSize;
  const gridPixelH = GRID_ROWS * cellSize;
  const baseOriginX = Math.floor((w - gridPixelW) / 2);
  const baseOriginY = Math.floor((h - gridPixelH) / 2);

  // 2. Draw Subtle Parchment Grid (Minor & Major squares matching screenshot)
  for (let c = 0; c <= GRID_COLS; c++) {
    const gx = baseOriginX + c * cellSize;
    const isMajor = (c - CENTER_COL) % 3 === 0;
    ctx.strokeStyle = isMajor ? 'rgba(182, 168, 142, 0.45)' : 'rgba(205, 193, 168, 0.25)';
    ctx.lineWidth = isMajor ? 1.5 : 1;
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, h);
    ctx.stroke();
  }
  for (let r = 0; r <= GRID_ROWS; r++) {
    const gy = baseOriginY + r * cellSize;
    const isMajor = (r - CENTER_ROW) % 3 === 0;
    ctx.strokeStyle = isMajor ? 'rgba(182, 168, 142, 0.45)' : 'rgba(205, 193, 168, 0.25)';
    ctx.lineWidth = isMajor ? 1.5 : 1;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
  }

  // 3. Draw Handwritten Equations in Background
  drawParchmentEquations(w, h);

  // 4. Mirror Symmetry Center Line (in Build Mode)
  if (!state.simulating && state.mirrorMode) {
    const mirrorX = baseOriginX + (CENTER_COL + 0.5) * cellSize;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(116, 174, 212, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(mirrorX, baseOriginY);
    ctx.lineTo(mirrorX, baseOriginY + gridPixelH);
    ctx.stroke();
    ctx.restore();
  }

  // Update Flight Simulation Physics if active
  const stats = calculatePhysics();
  if (state.simulating) {
    updateFlightSimulation(stats, cellSize); // CHANGED: cellSize is needed to convert meters -> pixels
  }

  // Apply Contraption Transform (Pan offset in editor OR Flight position/pitch in simulation)
  ctx.save();
  if (state.simulating) {
    const craftCenterX = baseOriginX + (CENTER_COL + 0.5) * cellSize + state.sim.x;
    const craftCenterY = baseOriginY + (CENTER_ROW + 0.5) * cellSize + state.sim.y;
    ctx.translate(craftCenterX, craftCenterY);
    ctx.rotate(state.sim.angle);
    ctx.translate(-(baseOriginX + (CENTER_COL + 0.5) * cellSize), -(baseOriginY + (CENTER_ROW + 0.5) * cellSize));
  }

  const drawOriginX = baseOriginX + (state.simulating ? 0 : state.panOffsetX * cellSize);
  const drawOriginY = baseOriginY + (state.simulating ? 0 : state.panOffsetY * cellSize);

  // 5. Render Contraption Blocks
  const animSpeed = state.simulating ? (0.4 + state.sim.throttle * 2.5) : 0.35;
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const type = state.grid[r][c];
      if (!type) continue;

      // Adjust projection visually if user cycled Front / Side / Top view
      let drawCol = c;
      let drawRow = r;
      if (state.viewMode === 1) {
        // Side profile compression
        drawCol = CENTER_COL + Math.round((c - CENTER_COL) * 0.35);
      } else if (state.viewMode === 2) {
        // Top-down plan shift
        drawRow = CENTER_ROW + Math.round((r - CENTER_ROW) * 0.65);
      }

      const bx = drawOriginX + drawCol * cellSize;
      const by = drawOriginY + drawRow * cellSize;

      drawBlockSprite(ctx, type, bx, by, cellSize, state.animTime * animSpeed);

      // Mass Heatmap Overlay (Button 4)
      if (state.showMassHeatmap) {
        const m = BLOCK_TYPES[type].mass;
        const intensity = Math.min(1, m / 65);
        ctx.fillStyle = `rgba(${Math.round(230 * intensity)}, ${Math.round(140 * (1 - intensity))}, 40, 0.45)`;
        ctx.fillRect(bx, by, cellSize, cellSize);
        ctx.strokeStyle = '#6e2c14';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 0.5, by + 0.5, cellSize - 1, cellSize - 1);
      }
    }
  }

  // 6. Render Lift Vector Arrows (Button 2 — Matching the 4 signature blue arrows in screenshot)
  if (state.showVectors) {
    const throttleFactor = state.simulating ? (0.35 + state.sim.throttle * 1.15) : 1.0;
    const wave = state.simulating ? Math.sin(state.animTime * 10) * 3 : 0;

    // Place prominent lift vectors on inner and outer wing stations just like the screenshot
    for (let c = 0; c < GRID_COLS; c++) {
      const topWingRow = stats.colTopWingRow[c];
      if (topWingRow === null) continue;

      const distFromCenter = Math.abs(c - CENTER_COL);
      // Match screenshot's aesthetic placement: arrows on key wing stations (e.g., dist 4 and 5, or every 3rd wing block)
      const isPrimaryStation = (distFromCenter === 4 || distFromCenter === 5) ||
                               (distFromCenter > 5 && distFromCenter % 4 === 1);

      if (isPrimaryStation) {
        const isOuter = distFromCenter >= 5;
        const baseHeight = isOuter ? cellSize * 4.4 : cellSize * 2.5;
        const arrowX = drawOriginX + (c + 0.5) * cellSize;
        const arrowY = drawOriginY + topWingRow * cellSize;
        drawLiftArrow(arrowX, arrowY, baseHeight * throttleFactor, wave);
      }
    }
  }

  // 7. Render Center of Mass & Center of Lift Markers (Button 3)
  if (state.showCoM) {
    drawBalanceMarkers(drawOriginX, drawOriginY, cellSize, stats);
  }

  ctx.restore();

  // 8. Hover Ghost Preview in Build Mode
  if (!state.simulating && state.hoverCell) {
    const { r, c } = state.hoverCell;
    if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
      const drawGhost = (gc) => {
        const gx = drawOriginX + gc * cellSize;
        const gy = drawOriginY + r * cellSize;
        ctx.save();
        ctx.globalAlpha = 0.55;
        if (state.selectedBlock === 'eraser') {
          ctx.fillStyle = 'rgba(214, 69, 69, 0.35)';
          ctx.fillRect(gx, gy, cellSize, cellSize);
          ctx.strokeStyle = '#b82e2e';
          ctx.lineWidth = 2;
          ctx.strokeRect(gx + 1, gy + 1, cellSize - 2, cellSize - 2);
        } else {
          drawBlockSprite(ctx, state.selectedBlock, gx, gy, cellSize, 0);
          ctx.strokeStyle = '#4e96c7';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(gx + 0.5, gy + 0.5, cellSize - 1, cellSize - 1);
        }
        ctx.restore();
      };

      drawGhost(c);
      if (state.mirrorMode) {
        const mirrorC = CENTER_COL - (c - CENTER_COL);
        if (mirrorC !== c && mirrorC >= 0 && mirrorC < GRID_COLS) {
          drawGhost(mirrorC);
        }
      }
    }
  }

  ctx.restore();
  requestAnimationFrame(render);
}

/**
 * Live flight test, now driven by Rapier 2D.
 * This function only handles input and reads the result back;
 * the actual forces and integration live in physics.js.
 */
function updateFlightSimulation(stats, cellSize) {
  const sim = state.sim;
  const dt = 1 / 60;

  // Throttle controls (W/S or Up/Down)
  if (sim.keys['KeyW'] || sim.keys['ArrowUp']) {
    sim.throttle = Math.min(1.5, sim.throttle + 0.7 * dt);
  }
  if (sim.keys['KeyS'] || sim.keys['ArrowDown']) {
    sim.throttle = Math.max(0.0, sim.throttle - 0.7 * dt);
  }

  // Pitch controls (A/D or Left/Right)
  let pilotTorque = 0;
  if (sim.keys['KeyA'] || sim.keys['ArrowLeft']) pilotTorque -= 1.6;
  if (sim.keys['KeyD'] || sim.keys['ArrowRight']) pilotTorque += 1.6;

  // Apply forces + step the Rapier world
  stepContraption(state.grid, BLOCK_TYPES, CENTER_COL, CENTER_ROW, sim.throttle, pilotTorque);

  // Keep the craft on the parchment (limits converted from pixels to meters)
  constrainContraption(240 / cellSize, 140 / cellSize);

  // Read the result back (meters -> pixels) for the renderer
  const b = getBodyState();
  sim.x = b.x * cellSize;
  sim.y = b.y * cellSize;
  sim.angle = b.angle;

  // Update Flight HUD
  document.getElementById('hudThrottle').textContent = `${Math.round(sim.throttle * 100)}%`;
  document.getElementById('hudAlt').textContent = `${Math.max(0, Math.round(120 - sim.y * 0.5))} m`;
  document.getElementById('hudPitch').textContent = `${(sim.angle * 57.3).toFixed(1)}°`;

  // Status now comes from the real vertical velocity (+y is down)
  const statusEl = document.getElementById('hudStatus');
  if (b.vy < -0.3) {
    statusEl.textContent = 'CLIMBING';
    statusEl.style.color = '#7ce889';
  } else if (b.vy > 0.3) {
    statusEl.textContent = 'DESCENDING';
    statusEl.style.color = '#f5b856';
  } else {
    statusEl.textContent = 'LEVEL';
    statusEl.style.color = '#7ce889';
  }
}

/**
 * Place or Erase Block on Grid (with Mirror Symmetry support)
 */
function applyToolAt(r, c, isErase) {
  if (state.simulating) return;
  if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) return;

  const value = (isErase || state.selectedBlock === 'eraser') ? null : state.selectedBlock;
  state.grid[r][c] = value;

  if (state.mirrorMode) {
    const mirrorC = CENTER_COL - (c - CENTER_COL);
    if (mirrorC >= 0 && mirrorC < GRID_COLS) {
      state.grid[r][mirrorC] = value;
    }
  }

  updateTelemetry();
}

/**
 * Convert Client Mouse/Touch Coordinates to Grid Cell
 */
function getCellFromEvent(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  const cellSize = Math.max(16, Math.floor(Math.min(w / (GRID_COLS + 2), h / (GRID_ROWS + 2))));
  const gridPixelW = GRID_COLS * cellSize;
  const gridPixelH = GRID_ROWS * cellSize;
  const drawOriginX = Math.floor((w - gridPixelW) / 2) + state.panOffsetX * cellSize;
  const drawOriginY = Math.floor((h - gridPixelH) / 2) + state.panOffsetY * cellSize;

  const localX = clientX - rect.left - drawOriginX;
  const localY = clientY - rect.top - drawOriginY;

  const c = Math.floor(localX / cellSize);
  const r = Math.floor(localY / cellSize);
  return { r, c };
}

// Canvas Mouse & Touch Events
canvas.addEventListener('mousedown', (e) => {
  e.preventDefault();
  state.isMouseDown = true;
  state.mouseButton = e.button;
  const cell = getCellFromEvent(e.clientX, e.clientY);
  applyToolAt(cell.r, cell.c, e.button === 2);
});

canvas.addEventListener('mousemove', (e) => {
  const cell = getCellFromEvent(e.clientX, e.clientY);
  state.hoverCell = cell;
  document.getElementById('coordIndicator').textContent =
    `GRID: (${cell.c - CENTER_COL}, ${CENTER_ROW - cell.r}) | L-CLICK: PLACE • R-CLICK: ERASE`;

  if (state.isMouseDown) {
    applyToolAt(cell.r, cell.c, state.mouseButton === 2);
  }
});

window.addEventListener('mouseup', () => {
  state.isMouseDown = false;
});

canvas.addEventListener('mouseleave', () => {
  state.hoverCell = null;
});

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

// Touch Support for Mobile/Tablet Building
canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    e.preventDefault();
    const t = e.touches[0];
    const cell = getCellFromEvent(t.clientX, t.clientY);
    state.hoverCell = cell;
    applyToolAt(cell.r, cell.c, false);
  }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  if (e.touches.length === 1) {
    e.preventDefault();
    const t = e.touches[0];
    const cell = getCellFromEvent(t.clientX, t.clientY);
    state.hoverCell = cell;
    applyToolAt(cell.r, cell.c, false);
  }
}, { passive: false });

// Top-Left 4 Parchment Toggle Buttons
const btnSpecs = document.getElementById('btnSpecs');
const btnVectors = document.getElementById('btnVectors');
const btnCoM = document.getElementById('btnCoM');
const btnMass = document.getElementById('btnMass');
const telemetryPanel = document.getElementById('telemetryPanel');

btnSpecs.addEventListener('click', () => {
  state.showSpecs = !state.showSpecs;
  btnSpecs.classList.toggle('active', state.showSpecs);
  telemetryPanel.classList.toggle('hidden', !state.showSpecs);
});

document.getElementById('closeTelemetry').addEventListener('click', () => {
  state.showSpecs = false;
  btnSpecs.classList.remove('active');
  telemetryPanel.classList.add('hidden');
});

btnVectors.addEventListener('click', () => {
  state.showVectors = !state.showVectors;
  btnVectors.classList.toggle('active', state.showVectors);
  showToast(state.showVectors ? 'Aerodynamic Lift Vectors: ON' : 'Aerodynamic Lift Vectors: OFF');
});

btnCoM.addEventListener('click', () => {
  state.showCoM = !state.showCoM;
  btnCoM.classList.toggle('active', state.showCoM);
  showToast(state.showCoM ? 'Center of Mass & Lift Markers: ON' : 'Center of Mass & Lift Markers: OFF');
});

btnMass.addEventListener('click', () => {
  state.showMassHeatmap = !state.showMassHeatmap;
  btnMass.classList.toggle('active', state.showMassHeatmap);
  showToast(state.showMassHeatmap ? 'Mass & Structural Stress Heatmap: ON' : 'Mass & Structural Stress Heatmap: OFF');
});

// Top-Right Compass Dial Controls
document.getElementById('panUp').addEventListener('click', () => { state.panOffsetY -= 1; });
document.getElementById('panDown').addEventListener('click', () => { state.panOffsetY += 1; });
document.getElementById('panLeft').addEventListener('click', () => { state.panOffsetX -= 1; });
document.getElementById('panRight').addEventListener('click', () => { state.panOffsetX += 1; });

const cycleView = (dir) => {
  state.viewMode = (state.viewMode + dir + VIEW_NAMES.length) % VIEW_NAMES.length;
  document.getElementById('viewModeBadge').textContent = `VIEW: ${VIEW_NAMES[state.viewMode]}`;
  showToast(`Projection Switched: ${VIEW_NAMES[state.viewMode]}`);
};
document.getElementById('rotLeft').addEventListener('click', () => cycleView(-1));
document.getElementById('rotRight').addEventListener('click', () => cycleView(1));

// Bottom Dock Controls
const btnMirror = document.getElementById('btnMirror');
btnMirror.addEventListener('click', () => {
  state.mirrorMode = !state.mirrorMode;
  btnMirror.classList.toggle('active', state.mirrorMode);
  showToast(state.mirrorMode ? 'X-Axis Mirror Symmetry: ENABLED' : 'X-Axis Mirror Symmetry: DISABLED');
});

const cyclePreset = () => {
  if (state.simulating) toggleSimulation();
  state.presetIndex = (state.presetIndex + 1) % 3;
  loadPreset(state.presetIndex);
};
document.getElementById('btnPreset').addEventListener('click', cyclePreset);
document.getElementById('tabPreset').addEventListener('click', cyclePreset);

document.getElementById('btnClear').addEventListener('click', () => {
  if (state.simulating) toggleSimulation();
  state.grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(null));
  updateTelemetry();
  showToast('Blueprint Grid Cleared');
});

// Simulation Toggle
const btnSimulate = document.getElementById('btnSimulate');
const simBtnText = document.getElementById('simBtnText');
const flightHud = document.getElementById('flightHud');

function toggleSimulation() {
  const stats = calculatePhysics();
  if (!state.simulating && stats.blockCount === 0) {
    showToast('Place blocks on the blueprint before launching!');
    return;
  }

  state.simulating = !state.simulating;
  btnSimulate.classList.toggle('sim-active', state.simulating);
  simBtnText.textContent = state.simulating ? 'STOP TEST' : 'TEST FLIGHT';
  flightHud.classList.toggle('hidden', !state.simulating);

  if (state.simulating) {
    state.sim.x = 0;
    state.sim.y = 0;
    state.sim.angle = 0;
    state.sim.throttle = 0.85;
    state.showVectors = true;
    btnVectors.classList.add('active');

    // NEW: build the Rapier body from the current blueprint
    createContraption(state.grid, BLOCK_TYPES, CENTER_COL, CENTER_ROW);

    showToast('Flight Test Active! Use [W/S] Throttle & [A/D] Pitch');
  } else {
    // NEW: throw the Rapier body away when the test ends
    destroyContraption();
    showToast('Returned to Blueprint Editor');
  }
}

btnSimulate.addEventListener('click', toggleSimulation);

// Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
  state.sim.keys[e.code] = true;
  if (!state.simulating) {
    if (e.key === '1') btnSpecs.click();
    if (e.key === '2') btnVectors.click();
    if (e.key === '3') btnCoM.click();
    if (e.key === '4') btnMass.click();
    if (e.key.toLowerCase() === 'm') btnMirror.click();
  }
});

window.addEventListener('keyup', (e) => {
  state.sim.keys[e.code] = false;
});

// Toast Helper
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toastBanner');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
  }, 2400);
}

// Initialize App.
// CHANGED: window.onload is replaced by an async start() so we can wait for
// Rapier's WASM to load before the first frame.
async function start() {
  await initPhysics();
  initPaletteUI();
  loadPreset(0); // Starts with exact contraption layout from screenshot
  requestAnimationFrame(render);
}

start();