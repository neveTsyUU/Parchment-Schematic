/**
     * ============================================================================
     * 1. FUNCTIONAL MATERIALS — STRUCTURE, PROPULSION, STAGING, SPACECRAFT BUS, INSTRUMENTS
     * ============================================================================
     * Every pixel stores { matId, color }. 1 pixel ≈ 0.25 m × 0.25 m.
     * Each material carries mass, cost and (for bus parts) power / data properties, so the
     * mass, power, data, Δv and cost budgets are computed directly from the drawing.
     * `source` explains where each number comes from (shown as a tooltip in the palette).
     */
    const SRC = {
      soaPower: 'NASA Small Spacecraft Technology State-of-the-Art report (Power chapter): multi-junction III-V cells (~29–32% efficient), rigid panels up to ~165 W/kg, Li-ion up to ~265 Wh/kg (cell). Game uses conservative pack-level values.',
      soaComms: 'NASA SOA report & NASA GSFC CubeSat radio surveys: S-band radios ~1–15 Mbps, X-band ~12.5–150+ Mbps from LEO.',
      soaGnc: 'NASA SOA report (GNC chapter): small reaction wheels enable off-nadir pointing; values are representative.',
      soaAvionics: 'NASA SOA report (Avionics chapter): small-sat flight computers draw a few watts; redundancy protects against radiation upsets.',
      optics: 'Diffraction limit: GSD ≈ 1.22·λ·h / D (λ = 550 nm). Same physics NASA uses to size Earth-observation telescopes.',
      sar: 'Synthetic Aperture Radar sees through clouds and at night (e.g., NASA-ISRO NISAR). Representative small-SAR values.',
      wide: 'Wide-field imager modelled on MODIS-class sensors (NASA Terra/Aqua: 250 m–1 km pixels, ~2,300 km swath).',
      rocket: 'Typical published values: liquid engines Isp ≈ 300–350 s, solid motors ≈ 250–290 s; modern tanks hold ~90% propellant by mass.',
      structure: 'Representative aerospace structural materials. Aerodynamic coefficients are simplified for the 2D sim.',
      cost: 'Costs are an illustrative game economy (relative prices), not real quotes.'
    };

    const MATERIALS = [
      // ---------- STRUCTURE ----------
      { id: 'carbon', group: 'Structure', name: 'Carbon Nosecone / Frame', shortName: 'Carbon', badgeColor: '#2b2b2b',
        dryMass: 0.30, fuelMass: 0, fuelType: null, mu: 0.12, drag: 0.12, lift: 0.10, thrust: 0, thrusterType: null, cost: 2,
        description: 'Low-drag leading edge & light structural framing.', source: SRC.structure,
        swatches: ['#1c1c1c', '#2b2b2b', '#404040', '#696969'] },
      { id: 'alloy', group: 'Structure', name: 'Alloy Hull Plating', shortName: 'Alloy Hull', badgeColor: '#949494',
        dryMass: 0.45, fuelMass: 0, fuelType: null, mu: 0.25, drag: 0.28, lift: 0.20, thrust: 0, thrusterType: null, cost: 1,
        description: 'Aluminium-lithium fuselage skin.', source: SRC.structure,
        swatches: ['#d4d4d4', '#b8b8b8', '#a3a3a3', '#8c8c8c', '#737373'] },
      { id: 'canopy', group: 'Structure', name: 'Armored Canopy Glass', shortName: 'Canopy', badgeColor: '#4c6b7a',
        dryMass: 0.35, fuelMass: 0, fuelType: null, mu: 0.15, drag: 0.16, lift: 0.18, thrust: 0, thrusterType: null, cost: 3,
        description: 'Quartz glazing (decorative for uncrewed craft).', source: SRC.structure,
        swatches: ['#4c6b7a', '#3a525e', '#2a3c45', '#688c9e'] },
      { id: 'wing', group: 'Structure', name: 'Aero Fin / Wing Foil', shortName: 'Fin', badgeColor: '#bfa980',
        dryMass: 0.30, fuelMass: 0, fuelType: null, mu: 0.18, drag: 0.22, lift: 1.65, thrust: 0, thrusterType: null, cost: 2,
        description: 'Fins placed LOW move the Center of Lift aft → stable flight.', source: SRC.structure,
        swatches: ['#d9c7a3', '#bfa980', '#a68f65', '#8c754d'] },

      // ---------- PROPULSION ----------
      { id: 'liquid_tank', group: 'Propulsion', name: 'Liquid Fuel Tank', shortName: 'Liq. Tank', badgeColor: '#3b7ea1',
        dryMass: 0.18, fuelMass: 1.62, fuelType: 'liquid', mu: 0.22, drag: 0.26, lift: 0.12, thrust: 0, thrusterType: null, cost: 3,
        description: '1.62 kg propellant + 0.18 kg tank (90% propellant fraction).', source: SRC.rocket,
        swatches: ['#3b7ea1', '#2b617d', '#5499bd', '#7ab5d4'] },
      { id: 'solid_tank', group: 'Propulsion', name: 'Solid Motor Grain', shortName: 'Sol. Grain', badgeColor: '#c97b36',
        dryMass: 0.25, fuelMass: 1.75, fuelType: 'solid', mu: 0.30, drag: 0.30, lift: 0.10, thrust: 0, thrusterType: null, cost: 1.5,
        description: '1.75 kg solid propellant + 0.25 kg casing. Cheap, cannot throttle.', source: SRC.rocket,
        swatches: ['#c97b36', '#a86123', '#e0954f', '#8a4c17'] },
      { id: 'liquid_thruster', group: 'Propulsion', name: 'Liquid Engine', shortName: 'Liq. Engine', badgeColor: '#255c85',
        dryMass: 0.65, fuelMass: 0, fuelType: null, mu: 0.28, drag: 0.34, lift: 0.05, thrust: 600.0, isp: 320, thrusterType: 'liquid', cost: 45,
        description: '600 N/px, Isp 320 s, throttleable. Burns liquid tanks in its own stage.', source: SRC.rocket,
        swatches: ['#255c85', '#1c4666', '#4a7fa6', '#2b343b'] },
      { id: 'solid_thruster', group: 'Propulsion', name: 'Solid Motor Nozzle', shortName: 'Sol. Nozzle', badgeColor: '#d9534f',
        dryMass: 0.75, fuelMass: 0, fuelType: null, mu: 0.34, drag: 0.38, lift: 0.05, thrust: 900.0, isp: 265, thrusterType: 'solid', cost: 12,
        description: '900 N/px, Isp 265 s. High thrust, low efficiency, burns until empty.', source: SRC.rocket,
        swatches: ['#d9534f', '#b53834', '#e88d4f', '#382c26'] },
      { id: 'decoupler', group: 'Propulsion', name: 'Stage Decoupler', shortName: 'Decoupler', badgeColor: '#e8b931',
        dryMass: 0.25, fuelMass: 0, fuelType: null, mu: 0.20, drag: 0.20, lift: 0.05, thrust: 0, thrusterType: null, cost: 4,
        description: 'Any row containing a decoupler splits the rocket into stages. Everything below it drops away.', source: SRC.rocket,
        swatches: ['#e8b931', '#c99a1a', '#f2d16b'] },

      // ---------- SPACECRAFT BUS (only counts if it is in the TOP stage = your satellite) ----------
      { id: 'computer', group: 'Spacecraft Bus', name: 'Flight Computer', shortName: 'Computer', badgeColor: '#6b3fa0',
        dryMass: 0.30, fuelMass: 0, fuelType: null, mu: 0.2, drag: 0.2, lift: 0.05, thrust: 0, thrusterType: null, cost: 25,
        powerW: 4, description: 'Required. 4 W. Two or more = radiation-upset redundancy.', source: SRC.soaAvionics,
        swatches: ['#6b3fa0', '#55307f', '#8a5fc0'] },
      { id: 'solar', group: 'Spacecraft Bus', name: 'Solar Panel', shortName: 'Solar', badgeColor: '#1f3f8a',
        dryMass: 0.20, fuelMass: 0, fuelType: null, mu: 0.2, drag: 0.25, lift: 0.1, thrust: 0, thrusterType: null, cost: 18,
        genW: 20, description: '20 W peak/px (29.5% triple-junction × 0.0625 m² × 1361 W/m², derated).', source: SRC.soaPower,
        swatches: ['#1f3f8a', '#172f68', '#3456a8', '#0f1f45'] },
      { id: 'battery', group: 'Spacecraft Bus', name: 'Li-ion Battery', shortName: 'Battery', badgeColor: '#3c8d5a',
        dryMass: 0.40, fuelMass: 0, fuelType: null, mu: 0.2, drag: 0.2, lift: 0.05, thrust: 0, thrusterType: null, cost: 6,
        capWh: 60, description: '60 Wh/px (150 Wh/kg pack). Only 30% depth-of-discharge per orbit for long life.', source: SRC.soaPower,
        swatches: ['#3c8d5a', '#2e6e46', '#56aa74'] },
      { id: 'antenna_s', group: 'Spacecraft Bus', name: 'S-band Antenna', shortName: 'S-band', badgeColor: '#c0c0c0',
        dryMass: 0.25, fuelMass: 0, fuelType: null, mu: 0.2, drag: 0.22, lift: 0.05, thrust: 0, thrusterType: null, cost: 12,
        rateMbps: 2, powerW: 6, description: '2 Mbps downlink, 6 W while transmitting.', source: SRC.soaComms,
        swatches: ['#c0c0c0', '#e6e6e6', '#9a9a9a'] },
      { id: 'antenna_x', group: 'Spacecraft Bus', name: 'X-band Antenna', shortName: 'X-band', badgeColor: '#d4a017',
        dryMass: 0.50, fuelMass: 0, fuelType: null, mu: 0.2, drag: 0.24, lift: 0.05, thrust: 0, thrusterType: null, cost: 40,
        rateMbps: 50, powerW: 20, description: '50 Mbps downlink, 20 W while transmitting.', source: SRC.soaComms,
        swatches: ['#d4a017', '#b08510', '#e8c04a'] },
      { id: 'wheel', group: 'Spacecraft Bus', name: 'Reaction Wheel', shortName: 'Wheel', badgeColor: '#7a5c3a',
        dryMass: 0.50, fuelMass: 0, fuelType: null, mu: 0.2, drag: 0.2, lift: 0.05, thrust: 0, thrusterType: null, cost: 30,
        powerW: 3, description: '3 W. 1–2 wheels: point ±30° off-nadir. 3+: ±45°. Faster revisit.', source: SRC.soaGnc,
        swatches: ['#7a5c3a', '#5e4529', '#9b7a52'] },

      // ---------- INSTRUMENTS ----------
      { id: 'imager_wide', group: 'Instruments', name: 'Wide-Field Imager', shortName: 'Wide Imager', badgeColor: '#2a9d8f',
        dryMass: 0.60, fuelMass: 0, fuelType: null, mu: 0.2, drag: 0.2, lift: 0.05, thrust: 0, thrusterType: null, cost: 80,
        powerW: 6, duty: 0.25, description: '300 m pixels, 1,500 km swath @500 km. Sees whole storms. Daylight + clear sky only.', source: SRC.wide,
        swatches: ['#2a9d8f', '#1f7a6f', '#45bfb0'] },
      { id: 'telescope', group: 'Instruments', name: 'Telescope Aperture', shortName: 'Telescope', badgeColor: '#0b0b2a',
        dryMass: 0.80, fuelMass: 0, fuelType: null, mu: 0.2, drag: 0.2, lift: 0.05, thrust: 0, thrusterType: null, cost: 150,
        powerW: 12, duty: 0.05, description: 'More pixels = bigger mirror = sharper image (≈1.2 m @500 km for 1 px), but narrow swath.', source: SRC.optics,
        swatches: ['#0b0b2a', '#1a1a4a', '#2d2d6b'] },
      { id: 'radar', group: 'Instruments', name: 'SAR Radar Panel', shortName: 'SAR', badgeColor: '#8e2c48',
        dryMass: 1.20, fuelMass: 0, fuelType: null, mu: 0.2, drag: 0.3, lift: 0.05, thrust: 0, thrusterType: null, cost: 200,
        powerW: 60, duty: 0.03, description: 'Needs ≥4 px. 10 m pixels, 40 km swath. Sees through clouds & at night. Power hungry (60 W/px).', source: SRC.sar,
        swatches: ['#8e2c48', '#6e1f37', '#b0445f'] }
    ];

    const MATERIAL_MAP = Object.fromEntries(MATERIALS.map(m => [m.id, m]));
    const ISP = { liquid: 320, solid: 265 }; // seconds — real-world ballpark (liquid > solid)
    const G0 = 9.80665;

    /**
     * ============================================================================
     * 1b. REAL NASA DATA SNAPSHOTS (offline fallback — the game also fetches live data)
     * ============================================================================
     */
    const MISSION_SNAPSHOT = [
      { key: 'haiyan', title: 'Super Typhoon Yolanda (Haiyan) — historical replay', category: 'severeStorms',
        lat: 11.0, lon: 125.7, date: '2013-11-08', place: 'Eastern Samar, Philippines', origin: 'Historical scenario',
        note: 'One of the strongest tropical cyclones ever to make landfall. PAGASA needed images every day.' },
      { key: 'kanlaon', title: 'Kanlaon Volcano eruption', category: 'volcanoes',
        lat: 10.412, lon: 123.132, date: '2024-12-09', place: 'Negros Island, Philippines', origin: 'Historical scenario',
        note: 'Ash plume and lava monitoring for evacuation planning. Needs fine detail on the summit.' },
      { key: 'carina', title: 'Metro Manila floods (Typhoon Carina + habagat)', category: 'floods',
        lat: 14.6, lon: 121.0, date: '2024-07-24', place: 'Metro Manila, Philippines', origin: 'Historical scenario',
        note: 'Flood extent mapping under thick monsoon clouds — optical cameras will mostly see cloud tops.' },
      { key: 'EONET_25728', title: 'Super Typhoon In-fa', category: 'severeStorms', eonetId: 'EONET_25728',
        lat: 23.8, lon: 138.7, date: '2026-11-03', place: 'Western Pacific', origin: 'NASA EONET snapshot', magnitude: '130 kts',
        note: 'Real EONET event (Oct 23 – Nov 3, 2026). Note the latitude: can your orbit reach 23.8°N?' },
      { key: 'EONET_26157', title: 'Typhoon Cempaka', category: 'severeStorms', eonetId: 'EONET_26157',
        lat: 30.2, lon: 154.1, date: '2026-11-11', place: 'Western Pacific', origin: 'NASA EONET snapshot',
        note: 'Real EONET event (Nov 7–11, 2026), tracking north to 30°N.' },
      { key: 'EONET_23681', title: 'Wildfire Plaskett, Monterey, California', category: 'wildfires', eonetId: 'EONET_23681',
        lat: 35.905667, lon: -121.4125, date: '2026-08-26', place: 'California, USA', origin: 'NASA EONET snapshot', magnitude: '15,479 acres',
        note: 'Real EONET event. Fire-line mapping needs fine resolution and frequent revisits.' }
    ];

    // Mission requirements by EONET category
    const MISSION_RULES = {
      severeStorms: { label: 'Typhoon / severe storm tracking', gsd: 2000, revisit: 1.5, images: 8, budget: 3200, sceneKm: 900, cloud: 0.0,
        why: 'Storm structure (eye, spiral bands) is ~10–1,000 km across: coarse pixels are fine, but you need an image almost every day.' },
      volcanoes:    { label: 'Volcano plume & lava monitoring', gsd: 30, revisit: 5, images: 3, budget: 3600, sceneKm: 40, cloud: 0.35,
        why: 'Craters and lava flows are tens of metres across: you need fine resolution.' },
      floods:       { label: 'Flood extent mapping', gsd: 30, revisit: 3, images: 4, budget: 4200, sceneKm: 80, cloud: 0.8,
        why: 'Flooded streets need fine resolution, and monsoon clouds block optical cameras most of the time.' },
      wildfires:    { label: 'Wildfire perimeter mapping', gsd: 60, revisit: 4, images: 3, budget: 3600, sceneKm: 60, cloud: 0.15,
        why: 'Fire lines move daily and are tens of metres wide.' },
      default:      { label: 'Natural-event monitoring', gsd: 100, revisit: 5, images: 3, budget: 3600, sceneKm: 100, cloud: 0.3,
        why: 'General monitoring of an evolving natural event.' }
    };

    // Real space-weather windows (NASA DONKI / NOAA SWPC records) used to replay mission operations
    const SPACE_WEATHER_SNAPSHOTS = {
      may2024: { label: 'May 8–21, 2024 — "Gannon" G5 storm (real)', start: '2024-05-08', events: [
        { date: '2024-05-08', type: 'FLR', cls: 'X1.0', text: 'X1.0 solar flare from region AR3664' },
        { date: '2024-05-09', type: 'FLR', cls: 'X2.2', text: 'X2.2 solar flare + Earth-directed CME' },
        { date: '2024-05-10', type: 'FLR', cls: 'X3.9', text: 'X3.9 solar flare' },
        { date: '2024-05-10', type: 'GST', kp: 9, text: 'G5 "extreme" geomagnetic storm begins (Kp 9)' },
        { date: '2024-05-11', type: 'FLR', cls: 'X5.7', text: 'X5.7 solar flare' },
        { date: '2024-05-11', type: 'GST', kp: 9, text: 'G5 storm peak — strongest since 2003' },
        { date: '2024-05-14', type: 'FLR', cls: 'X8.7', text: 'X8.7 flare — largest of Solar Cycle 25 at the time' }
      ]},
      oct2024: { label: 'Oct 1–14, 2024 — X9.0 flare + G4 storm (real)', start: '2024-10-01', events: [
        { date: '2024-10-03', type: 'FLR', cls: 'X9.0', text: 'X9.0 solar flare — strongest of 2024' },
        { date: '2024-10-10', type: 'GST', kp: 8, text: 'G4 severe geomagnetic storm (Kp 8)' }
      ]},
      quiet: { label: 'Quiet Sun (no events) — baseline', start: null, events: [] }
    };

    /**
     * ============================================================================
     * 1c. MISSION ENGINE — staging, rocket equation, orbit, power, data, cost, lifetime
     * ============================================================================
     */
    const R_E = 6378.137;      // km
    const MU_E = 398600.4418;  // km^3/s^2
    const LAUNCH_LAT = 13.0;   // hypothetical Philippine east-coast spaceport
    const GROUND_STATION_LAT = 14.6;

    function getSeparationRows(grid, cols, rows) {
      const sep = [];
      for (let y = 0; y < rows; y++) {
        const row = grid[y];
        if (!row) continue;
        for (let x = 0; x < cols; x++) {
          if (row[x] && row[x].matId === 'decoupler') { sep.push(y); break; }
        }
      }
      return sep.sort((a, b) => b - a); // lowest on screen first
    }

    function stageOfRow(y, sepRows) {
      let k = 0;
      for (const r of sepRows) if (r > y) k++;
      return k; // 0 = bottom (first) stage
    }

    function analyzeStages(grid, cols, rows) {
      const sepRows = getSeparationRows(grid, cols, rows);
      const nStages = sepRows.length + 1;
      const stages = Array.from({ length: nStages }, (_, i) => ({
        index: i, pixels: 0, dry: 0, liqFuel: 0, solFuel: 0, nLiqEng: 0, nSolEng: 0, cost: 0, counts: {}
      }));
      for (let y = 0; y < rows; y++) {
        const row = grid[y];
        if (!row) continue;
        const k = stageOfRow(y, sepRows);
        for (let x = 0; x < cols; x++) {
          const cell = row[x];
          if (!cell) continue;
          const m = MATERIAL_MAP[cell.matId] || MATERIAL_MAP.alloy;
          const s = stages[k];
          s.pixels++;
          s.dry += m.dryMass;
          s.cost += m.cost || 0;
          if (m.fuelType === 'liquid') s.liqFuel += m.fuelMass;
          if (m.fuelType === 'solid') s.solFuel += m.fuelMass;
          if (m.thrusterType === 'liquid') s.nLiqEng++;
          if (m.thrusterType === 'solid') s.nSolEng++;
          s.counts[m.id] = (s.counts[m.id] || 0) + 1;
        }
      }
      // drop empty stages caused by back-to-back decoupler rows
      const filtered = stages.filter(s => s.pixels > 0);
      filtered.forEach((s, i) => s.index = i);
      return { sepRows, stages: filtered };
    }

    function circVel(hKm) { return Math.sqrt(MU_E / (R_E + hKm)); } // km/s
    function orbitPeriodS(hKm) { return 2 * Math.PI * Math.sqrt(Math.pow(R_E + hKm, 3) / MU_E); }
    function hohmannDv(h1, h2) { // m/s
      const r1 = R_E + h1, r2 = R_E + h2, a = (r1 + r2) / 2;
      const v1 = Math.sqrt(MU_E / r1), v2 = Math.sqrt(MU_E / r2);
      const vp = Math.sqrt(MU_E * (2 / r1 - 1 / a)), va = Math.sqrt(MU_E * (2 / r2 - 1 / a));
      return (Math.abs(vp - v1) + Math.abs(v2 - va)) * 1000;
    }
    function requiredDeltaV(hKm, incDeg) {
      const ascentLosses = 1800; // gravity + drag + steering losses, m/s (typical 1.5–2 km/s)
      const rotationBonus = 465.1 * Math.cos(incDeg * Math.PI / 180); // Earth's spin helps prograde, hurts retrograde (SSO)
      return circVel(200) * 1000 + hohmannDv(200, Math.max(200, hKm)) + ascentLosses - rotationBonus;
    }
    function eclipseFraction(hKm) { return Math.asin(R_E / (R_E + hKm)) / Math.PI; } // worst case (beta = 0)
    function contactSecondsPerDay(hKm, elevMinDeg = 10) {
      const e = elevMinDeg * Math.PI / 180;
      const lam = Math.acos((R_E * Math.cos(e)) / (R_E + hKm)) - e; // Earth central half-angle of visibility
      return 86400 * (1 - Math.cos(lam)) / 2;
    }
    // Rough orbital lifetime (no propulsion, moderate solar activity, small satellite)
    const LIFETIME_TABLE = [[200, 0.01], [250, 0.05], [300, 0.15], [350, 0.5], [400, 1.5], [450, 4], [500, 8], [550, 15], [600, 30], [650, 50], [700, 90], [800, 200], [1000, 1000]];
    function lifetimeYears(hKm) {
      const t = LIFETIME_TABLE;
      if (hKm <= t[0][0]) return t[0][1];
      if (hKm >= t[t.length - 1][0]) return t[t.length - 1][1];
      for (let i = 0; i < t.length - 1; i++) {
        if (hKm >= t[i][0] && hKm <= t[i + 1][0]) {
          const f = (hKm - t[i][0]) / (t[i + 1][0] - t[i][0]);
          return Math.exp(Math.log(t[i][1]) + f * (Math.log(t[i + 1][1]) - Math.log(t[i][1])));
        }
      }
      return 1;
    }
    function revisitDays(forKm, hKm, incDeg, latDeg, dayOnly) {
      const iEff = incDeg > 90 ? 180 - incDeg : incDeg;
      const lat = Math.abs(latDeg);
      // Field of regard lets you reach a few degrees beyond the inclination
      const reachDeg = (forKm / 2) / 111.2;
      if (lat > iEff + reachDeg) return Infinity;
      const cosI = Math.cos(incDeg * Math.PI / 180), cosL = Math.cos(Math.min(lat, iEff - 0.01) * Math.PI / 180);
      const sinBeta = Math.max(0.12, Math.sqrt(Math.max(0, 1 - (cosI * cosI) / (cosL * cosL))));
      const orbitsPerDay = 86400 / orbitPeriodS(hKm);
      const crossings = 2 * orbitsPerDay * (dayOnly ? 0.5 : 1);
      const circ = 2 * Math.PI * R_E * Math.cos(lat * Math.PI / 180);
      const coverage = crossings * forKm / (sinBeta * circ);
      return 1 / Math.max(1e-6, coverage);
    }

    function computeStageDeltaV(stages) {
      const n = stages.length;
      const out = [];
      let extraLoss = 0;
      let liftoffTWR = 0;
      for (let k = 0; k < n; k++) {
        let m0 = 0;
        for (let j = k; j < n; j++) m0 += stages[j].dry + stages[j].liqFuel + stages[j].solFuel;
        const s = stages[k];
        const Tl = s.nLiqEng * MATERIAL_MAP.liquid_thruster.thrust;
        const Ts = s.nSolEng * MATERIAL_MAP.solid_thruster.thrust;
        const usableL = s.nLiqEng > 0 ? s.liqFuel : 0;
        const usableS = s.nSolEng > 0 ? s.solFuel : 0;
        const deadFuel = (s.liqFuel - usableL) + (s.solFuel - usableS);
        const usable = usableL + usableS;
        const T = (usableL > 0 ? Tl : 0) + (usableS > 0 ? Ts : 0);
        let isp = 0;
        if (T > 0) {
          const mdot = (usableL > 0 ? Tl / (ISP.liquid * G0) : 0) + (usableS > 0 ? Ts / (ISP.solid * G0) : 0);
          isp = T / (mdot * G0);
        }
        const dv = (T > 0 && usable > 0) ? isp * G0 * Math.log(m0 / (m0 - usable)) : 0;
        const twr = m0 > 0 ? T / (m0 * G0) : 0;
        const burnS = T > 0 ? usable / (T / (isp * G0)) : 0;
        if (k === 0) {
          liftoffTWR = twr;
          if (twr >= 1 && twr < 1.3) extraLoss += (1.3 - twr) * 2500;
        } else if (dv > 0 && twr < 0.4) {
          extraLoss += (0.4 - twr) * 1500;
        }
        out.push({ index: k, m0, mf: m0 - usable, usable, deadFuel, thrust: T, isp, dv, twr, burnS, nLiqEng: s.nLiqEng, nSolEng: s.nSolEng });
      }
      const totalDv = out.reduce((a, s) => a + s.dv, 0);
      return { stages: out, totalDv, extraLoss, liftoffTWR };
    }

    function evaluateInstruments(c, hKm, incDeg, lat, rules) {
      const wheels = c.wheel || 0;
      const offNadirDeg = wheels >= 3 ? 45 : wheels >= 1 ? 30 : 0;
      const agilityKm = 2 * hKm * Math.tan(offNadirDeg * Math.PI / 180);
      const list = [];
      if (c.imager_wide) {
        const gsd = 300 * hKm / 500, swath = Math.min(2500, 1500 * hKm / 500);
        list.push({ id: 'imager_wide', name: 'Wide-Field Imager', gsd, swath, forKm: swath + agilityKm, dayOnly: true, cloudOK: false, bands: 3, bits: 12 });
      }
      if (c.telescope) {
        const D = 2 * Math.sqrt(c.telescope * 0.0625 / Math.PI);
        const gsd = 1.22 * 550e-9 * hKm * 1000 / D;
        const swath = 4096 * gsd / 1000;
        list.push({ id: 'telescope', name: `Telescope (D = ${(D * 100).toFixed(0)} cm)`, gsd, swath, forKm: swath + agilityKm, dayOnly: true, cloudOK: false, bands: 4, bits: 12, aperture: D });
      }
      if ((c.radar || 0) >= 4) {
        list.push({ id: 'radar', name: 'SAR Radar', gsd: 10, swath: 40, forKm: 40 + agilityKm, dayOnly: false, cloudOK: true, bands: 1, bits: 16 });
      }
      for (const ins of list) {
        ins.rawRevisit = revisitDays(ins.forKm, hKm, incDeg, lat, ins.dayOnly);
        const clearFrac = ins.cloudOK ? 1 : (1 - rules.cloud);
        ins.revisit = ins.rawRevisit / Math.max(0.05, clearFrac);
        ins.meetsGsd = ins.gsd <= rules.gsd;
        const sceneKm = Math.min(ins.swath, rules.sceneKm);
        ins.imageMbit = Math.pow(sceneKm * 1000 / ins.gsd, 2) * ins.bands * ins.bits / 2 / 1e6; // 2:1 compression
      }
      // choose: meets GSD with fastest revisit; else finest GSD
      const good = list.filter(i => i.meetsGsd && isFinite(i.revisit)).sort((a, b) => a.revisit - b.revisit);
      const best = good[0] || list.slice().sort((a, b) => a.gsd - b.gsd)[0] || null;
      return { list, best, offNadirDeg };
    }

    /**
     * Full mission analysis — called live while drawing.
     * mission = { rules, target:{lat,lon,...} }, orbit = { altitudeKm, inclination }
     */
    function computeMission(grid, cols, rows, mission, orbit) {
      const { stages } = analyzeStages(grid, cols, rows);
      const rules = mission.rules;
      const h = orbit.altitudeKm, inc = orbit.inclination;
      const totalPixels = stages.reduce((a, s) => a + s.pixels, 0);
      const res = { empty: totalPixels === 0, stages, orbit, rules, mission };
      if (res.empty) return res;

      const dvInfo = computeStageDeltaV(stages);
      const dvReq = requiredDeltaV(h, inc) + dvInfo.extraLoss;
      const payload = stages[stages.length - 1];
      const c = payload.counts;
      // subsystems stranded on lower stages (they get thrown away)
      let stranded = 0;
      for (let k = 0; k < stages.length - 1; k++) {
        for (const id of ['computer', 'solar', 'battery', 'antenna_s', 'antenna_x', 'wheel', 'imager_wide', 'telescope', 'radar']) stranded += stages[k].counts[id] || 0;
      }

      const totalMass = stages.reduce((a, s) => a + s.dry + s.liqFuel + s.solFuel, 0);
      const payloadMass = payload.dry + payload.liqFuel + payload.solFuel;
      const pixelCost = stages.reduce((a, s) => a + s.cost, 0);
      const opsCost = 200; // ground segment + operations, $k
      const totalCost = pixelCost + opsCost;

      // ---- Orbit geometry
      const period = orbitPeriodS(h);
      const eclFrac = eclipseFraction(h);
      const sunFrac = 1 - eclFrac;
      const eclipseH = period * eclFrac / 3600;
      const contactS = contactSecondsPerDay(h);
      const contactFrac = contactS / 86400;

      // ---- Instruments
      const ins = evaluateInstruments(c, h, inc, mission.target.lat, rules);

      // ---- Power budget
      const n = id => c[id] || 0;
      const baseLoad = 3 /* thermal/heaters */ + n('computer') * 4 + n('wheel') * 3;
      const instLoad = n('imager_wide') * 6 * 0.25 + n('telescope') * 12 * 0.05 + ((n('radar') >= 4) ? n('radar') * 60 * 0.03 : 0);
      const commsLoad = (n('antenna_s') ? 6 : 0) * contactFrac + (n('antenna_x') ? 20 : 0) * contactFrac;
      const loadAvg = baseLoad + instLoad + commsLoad;
      const genPeak = n('solar') * 20;
      const genAvg = genPeak * 0.7 * sunFrac; // 0.7 = average sun-angle / pointing factor
      const powerMargin = genAvg * 0.9 - loadAvg; // 90% charge efficiency
      const eclipseWh = (baseLoad + instLoad) * eclipseH;
      const batteryUsableWh = n('battery') * 60 * 0.30;

      // ---- Data budget
      const rateMbps = (n('antenna_x') ? 50 : 0) + (n('antenna_s') ? 2 : 0);
      const downlinkMbitDay = rateMbps * contactS;
      const best = ins.best;
      const imagesPerDay = best && isFinite(best.revisit) ? 1 / best.revisit : 0;
      const dataMbitDay = best ? imagesPerDay * best.imageMbit : 0;

      // ---- Lifetime
      const life = lifetimeYears(h);

      // ---- Requirements & score
      const reqs = [];
      const add = (id, label, pass, points, value, target, why, fix) => reqs.push({ id, label, pass, points, value, target, why, fix });
      const reachesOrbit = dvInfo.liftoffTWR >= 1 && dvInfo.totalDv >= dvReq;
      add('liftoff', 'Rocket lifts off (thrust-to-weight > 1)', dvInfo.liftoffTWR >= 1, 5,
        `TWR ${dvInfo.liftoffTWR.toFixed(2)}`, '> 1.00 (≥1.3 ideal)',
        dvInfo.liftoffTWR >= 1 ? `Liftoff thrust beats weight by ${(dvInfo.liftoffTWR * 100 - 100).toFixed(0)}%.` : `First-stage thrust (${(dvInfo.stages[0]?.thrust || 0).toFixed(0)} N) is less than the weight of the whole stack (${(totalMass * G0).toFixed(0)} N). The rocket never leaves the pad.`,
        'Add engines to the bottom stage, or remove mass.');
      add('orbit', 'Enough Δv to reach the chosen orbit', reachesOrbit, 20,
        `${(dvInfo.totalDv / 1000).toFixed(2)} km/s`, `≥ ${(dvReq / 1000).toFixed(2)} km/s`,
        reachesOrbit ? `Δv margin ${(dvInfo.totalDv - dvReq).toFixed(0)} m/s.` :
          `Short by ${(dvReq - dvInfo.totalDv).toFixed(0)} m/s. The rocket equation Δv = Isp·g₀·ln(m₀/m_f) punishes carrying empty tanks — ${stages.length === 1 ? 'a single stage almost never reaches orbit.' : 'each stage must be mostly propellant.'}`,
        stages.length === 1 ? 'Add a Stage Decoupler row and split into 2–3 stages.' : 'Add propellant to the upper stage, use liquid engines (higher Isp), lower the orbit, or choose a prograde (low-inclination) orbit.');
      add('budget', 'Within mission budget', totalCost <= rules.budget, 10,
        `$${(totalCost / 1000).toFixed(2)}M`, `≤ $${(rules.budget / 1000).toFixed(2)}M`,
        totalCost <= rules.budget ? `$${((rules.budget - totalCost) / 1000).toFixed(2)}M left over.` : `Over budget by $${((totalCost - rules.budget) / 1000).toFixed(2)}M. Liquid engines ($45k each) and instruments dominate cost.`,
        'Use cheaper solid motors for the first stage, or fewer/lighter instruments.');
      add('computer', 'Satellite has a flight computer + downlink', n('computer') > 0 && rateMbps > 0, 5,
        `${n('computer')} computer, ${rateMbps} Mbps`, '≥1 computer & ≥1 antenna',
        n('computer') > 0 && rateMbps > 0 ? 'The satellite can think and talk to the ground.' : (n('computer') === 0 ? 'No flight computer in the top stage — the satellite is dead on arrival.' : 'No antenna in the top stage — images can never reach the ground.'),
        'Put a Flight Computer and an S-band/X-band Antenna ABOVE the top decoupler.');
      const canSee = best && isFinite(best.revisit);
      add('coverage', 'Orbit can see the target', !!canSee, 5,
        best ? (isFinite(best.rawRevisit) ? `${Math.abs(mission.target.lat).toFixed(1)}° lat reachable` : 'never overflies') : 'no instrument',
        `inclination ≥ ${Math.abs(mission.target.lat).toFixed(1)}°`,
        !best ? 'No working instrument in the top stage (SAR needs ≥4 pixels).' : isFinite(best.rawRevisit) ? 'The ground track passes over the target.' : `A ${inc}° orbit never goes higher than ~${(inc > 90 ? 180 - inc : inc).toFixed(0)}° latitude, but the target is at ${mission.target.lat.toFixed(1)}°.`,
        'Pick Sun-synchronous (97.6°) for high-latitude targets.');
      add('gsd', 'Resolution sharp enough', !!(best && best.meetsGsd), 15,
        best ? `${best.gsd >= 1000 ? (best.gsd / 1000).toFixed(1) + ' km' : best.gsd.toFixed(1) + ' m'} (${best.name})` : '—', `≤ ${rules.gsd >= 1000 ? rules.gsd / 1000 + ' km' : rules.gsd + ' m'}`,
        best && best.meetsGsd ? 'Pixels are small enough to see what matters.' : `${rules.why}`,
        'Add Telescope pixels (bigger mirror) or fly lower. Wide imagers cannot resolve small targets.');
      add('revisit', 'Revisits the target often enough', !!(best && best.revisit <= rules.revisit), 10,
        best && isFinite(best.revisit) ? `every ${best.revisit.toFixed(1)} days` : '—', `≤ ${rules.revisit} days`,
        best && best.revisit <= rules.revisit ? 'Frequent looks at the event.' :
          (best && rules.cloud > 0.5 && !best.cloudOK ? `Clouds hide the ground ${(rules.cloud * 100).toFixed(0)}% of the time for optical cameras, so usable looks are rare.` : 'A narrow swath means the target slides between passes.'),
        rules.cloud > 0.5 ? 'Use SAR radar (sees through clouds), add reaction wheels for off-nadir pointing, or use a low-inclination orbit.' : 'Add reaction wheels (off-nadir pointing), use a wider instrument, or a low-inclination orbit for tropical targets.');
      add('power', 'Power positive (solar ≥ average load)', powerMargin >= 0, 10,
        `${genAvg.toFixed(1)} W gen / ${loadAvg.toFixed(1)} W load`, 'margin ≥ 0 W',
        powerMargin >= 0 ? `+${powerMargin.toFixed(1)} W orbit-average margin.` : `Short by ${(-powerMargin).toFixed(1)} W on average — the battery drains a little every orbit until the satellite browns out.`,
        'Add Solar Panel pixels to the top stage.');
      add('battery', 'Battery survives eclipse', batteryUsableWh >= eclipseWh && n('battery') > 0, 10,
        `${batteryUsableWh.toFixed(1)} Wh usable / ${eclipseWh.toFixed(1)} Wh needed`, `${(eclipseH * 60).toFixed(0)} min of darkness`,
        batteryUsableWh >= eclipseWh && n('battery') > 0 ? 'Enough stored energy to get through Earth\'s shadow.' : `Each orbit spends ${(eclipseH * 60).toFixed(0)} min in Earth's shadow needing ${eclipseWh.toFixed(1)} Wh, but only ${batteryUsableWh.toFixed(1)} Wh can be used without damaging the cells.`,
        'Add Li-ion Battery pixels, or reduce always-on loads.');
      add('downlink', 'Downlink keeps up with data', rateMbps > 0 && downlinkMbitDay >= dataMbitDay, 5,
        `${(downlinkMbitDay / 1000).toFixed(1)} Gbit/day capacity`, `${(dataMbitDay / 1000).toFixed(1)} Gbit/day produced`,
        rateMbps > 0 && downlinkMbitDay >= dataMbitDay ? `Only ${(contactS / 60).toFixed(0)} min/day of ground-station contact, and that's enough.` : `Only ${(contactS / 60).toFixed(0)} min/day over the ground station — data piles up on board.`,
        'Add an X-band antenna (50 Mbps) or fly higher (longer passes).');
      const lifeOK = life >= 2, debrisOK = life <= 25;
      add('lifetime', 'Lives ≥2 yr, deorbits ≤25 yr', lifeOK && debrisOK, 5,
        `≈${life < 1 ? (life * 12).toFixed(0) + ' months' : life.toFixed(0) + ' years'}`, '2–25 years',
        !lifeOK ? `At ${h} km, air drag pulls the satellite down in about ${life < 1 ? (life * 12).toFixed(0) + ' months' : life.toFixed(1) + ' years'}.` : !debrisOK ? `At ${h} km it would stay in orbit ~${life.toFixed(0)} years as space junk — beyond the 25-year guideline in NASA-STD-8719.14.` : 'Long enough to be useful, short enough not to become debris.',
        !lifeOK ? 'Raise the orbit (~420 km or higher).' : 'Lower the orbit (below ~600 km) or add propulsion to deorbit.');

      const score = reqs.reduce((a, r) => a + (r.pass ? r.points : 0), 0);
      Object.assign(res, {
        dvInfo, dvReq, reachesOrbit, totalMass, payloadMass, totalCost, pixelCost, payload, counts: c, stranded,
        period, eclFrac, eclipseH, contactS, ins, best, loadAvg, genAvg, genPeak, powerMargin, eclipseWh, batteryUsableWh,
        rateMbps, downlinkMbitDay, dataMbitDay, imagesPerDay, life, reqs, designScore: score
      });
      return res;
    }

    /**
     * Operations replay: day-by-day using a real space-weather window.
     * Returns a log the UI animates.
     */
    function simulateOperations(analysis, swEvents, days = 14, startDate = null) {
      const a = analysis;
      const best = a.best;
      const c = a.counts || {};
      const out = { days: [], images: 0, delivered: 0, lost: false, lostReason: '', safeDays: 0, log: [], opsScore: 0 };
      if (!a.reachesOrbit) { out.lost = true; out.lostReason = 'Never reached orbit.'; return out; }
      if (!(c.computer > 0)) { out.lost = true; out.lostReason = 'No flight computer.'; return out; }
      let h = a.orbit.altitudeKm;
      let soc = 1.0; // battery state of charge
      let backlogMbit = 0;
      let sentTotal = 0;
      let nextLook = best && isFinite(best.rawRevisit) ? best.rawRevisit / 2 : Infinity;
      const rules = a.rules;
      let seed = 1234567;
      const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      const base = startDate ? new Date(startDate + 'T00:00:00Z') : null;
      for (let d = 0; d < days; d++) {
        const dateStr = base ? new Date(base.getTime() + d * 86400000).toISOString().slice(0, 10) : `Day ${d + 1}`;
        const day = { d, date: dateStr, events: [], safe: false, images: 0, h: 0, soc: 0, notes: [] };
        const todays = swEvents.filter(e => e.date === dateStr);
        for (const ev of todays) {
          day.events.push(ev);
          if (ev.type === 'FLR' && /^X/.test(ev.cls || '')) {
            if ((c.computer || 0) >= 2) {
              day.notes.push(`${ev.cls} flare: energetic particles flipped a bit, the backup computer took over. Redundancy saved the day.`);
            } else {
              day.safe = true;
              day.notes.push(`${ev.cls} flare: energetic particles caused a single-event upset — single computer rebooted into SAFE MODE for the day.`);
            }
          }
          if (ev.type === 'GST') {
            const kp = ev.kp || 5;
            const drop = Math.max(0, (kp - 4) * 2.2 * Math.exp(-(h - 300) / 55));
            h -= drop;
            day.notes.push(`Kp ${kp} geomagnetic storm heated & expanded the upper atmosphere: drag dropped the orbit ${drop.toFixed(drop < 1 ? 2 : 1)} km.`);
          }
        }
        // natural decay (rough): altitude loss per day from lifetime
        const lifeDays = lifetimeYears(h) * 365;
        h -= Math.min(5, (h - 180) / Math.max(1, lifeDays));
        if (h < 230) { out.lost = true; out.lostReason = `Orbit decayed to ${h.toFixed(0)} km and the satellite re-entered on ${dateStr}.`; day.notes.push('Re-entry! Mission lost.'); day.h = h; out.days.push(day); break; }

        // power
        const dailyBalanceWh = (a.genAvg * 0.9 - a.loadAvg) * 24;
        const capWh = Math.max(1, (c.battery || 0) * 60);
        const eclipseOK = a.batteryUsableWh >= a.eclipseWh && (c.battery || 0) > 0;
        soc = Math.max(0, Math.min(1, soc + dailyBalanceWh / capWh));
        if (!eclipseOK || soc <= 0.05) { day.safe = true; day.notes.push(eclipseOK ? 'Battery empty — low-power safe mode.' : 'Battery browned out in eclipse — safe mode.'); }
        if (day.safe) out.safeDays++;

        // imaging
        if (best && isFinite(best.rawRevisit)) {
          while (nextLook < d + 1) {
            const clear = best.cloudOK || rnd() > rules.cloud;
            if (!day.safe && clear && best.meetsGsd) { day.images++; out.images++; backlogMbit += best.imageMbit; }
            else if (!day.safe && !clear) day.notes.push('Pass over target — clouds blocked the view.');
            else if (!day.safe && !best.meetsGsd) day.notes.push('Pass over target — image too blurry to be useful.');
            nextLook += best.rawRevisit;
          }
        }
        // downlink
        const cap = a.downlinkMbitDay;
        const sent = Math.min(backlogMbit, cap);
        backlogMbit -= sent;
        sentTotal += sent;
        if (best && best.imageMbit > 0) out.delivered = Math.min(out.images, Math.floor(sentTotal / best.imageMbit + 1e-6));
        day.h = h; day.soc = soc; day.backlog = backlogMbit;
        out.days.push(day);
      }
      out.finalAlt = h;
      out.opsScore = out.lost ? 0 : Math.min(1, out.delivered / Math.max(1, rules.images));
      return out;
    }
    /**
     * ============================================================================
     * 1d. PIXEL ICON SET — hand-drawn 12×12 pixel icons (no emoji anywhere)
     * ============================================================================
     * '#' = current text colour, other letters = fixed palette colours.
     */
    const PX_COLORS = { '#': 'currentColor', k: '#2b241b', r: '#b83a2d', o: '#e07a2d', a: '#e8a23a', y: '#e8b931', b: '#255c85', c: '#5499bd', g: '#246b50', w: '#f3ead6', s: '#9a9a9a' };
    const PX_ICONS = {
      severeStorms: [
        '......##....',
        '.....##.....',
        '....##......',
        '...######...',
        '..##....##..',
        '..#..##..#..',
        '..#..##..#..',
        '..##....##..',
        '...######...',
        '......##....',
        '.....##.....',
        '....##......'],
      volcanoes: [
        '...aa..aa...',
        '..a..aa..a..',
        '.....rr.....',
        '.....rr.....',
        '....#rr#....',
        '....#ro#....',
        '...##ro##...',
        '...###r##...',
        '..########..',
        '..########..',
        '.##########.',
        '############'],
      floods: [
        '............',
        '..cc....cc..',
        '.c..c..c..c.',
        'c....cc....c',
        '............',
        '..bb....bb..',
        '.b..b..b..b.',
        'b....bb....b',
        '............',
        '..bb....bb..',
        '.b..b..b..b.',
        'b....bb....b'],
      wildfires: [
        '.....r......',
        '....rr......',
        '....rrr..r..',
        '...rrrr.rr..',
        '..rrrorrrr..',
        '..rrooorrr..',
        '.rrrooorrrr.',
        '.rrooaoorrr.',
        '.rrooayoorr.',
        '.rroayyaorr.',
        '..rrooaorr..',
        '...rrrrrr...'],
      satellite: [
        '.....#......',
        '.....#......',
        '....###.....',
        'bbb.###.bbb.',
        'bcb#####bcb.',
        'bbb.###.bbb.',
        'bcb.###.bcb.',
        'bbb.###.bbb.',
        '....#.#.....',
        '...#...#....',
        '............',
        '............'],
      flare: [
        '.....a......',
        '..a..a..a...',
        '...a.a.a....',
        '....ooo.....',
        '...ooyoo....',
        'aaaoyyyoaaa.',
        '...ooyoo....',
        '....ooo.....',
        '...a.a.a....',
        '..a..a..a...',
        '.....a......',
        '............'],
      geostorm: [
        '.sss...sss..',
        '.sss...sss..',
        '.rrr...rrr..',
        '.rr.....rr..',
        '.rr.....rr..',
        '.rr.....rr..',
        '.rrr...rrr..',
        '..rrrrrrr...',
        '...rrrrr....',
        '............',
        '.c.c.c.c.c..',
        'c.c.c.c.c.c.'],
      camera: [
        '............',
        '....###.....',
        '.##########.',
        '.#........#.',
        '.#..bbbb..#.',
        '.#.bc..bb.#.',
        '.#.bb..bb.#.',
        '.#..bbbb..#.',
        '.#........#.',
        '.##########.',
        '............',
        '............'],
      warning: [
        '.....kk.....',
        '....kaak....',
        '....kaak....',
        '...kakkak...',
        '...kakkak...',
        '..kaakkaak..',
        '..kaakkaak..',
        '.kaaaaaaaak.',
        '.kaaakkaaak.',
        'kaaaaaaaaaak',
        'kkkkkkkkkkkk',
        '............'],
      rocket: [
        '.....##.....',
        '....####....',
        '....#cc#....',
        '....####....',
        '....####....',
        '....####....',
        '...######...',
        '..##.##.##..',
        '..#..##..#..',
        '.....ao.....',
        '.....oo.....',
        '......o.....'],
      fuel: [
        '.#####......',
        '.#...#..#...',
        '.#...#...#..',
        '.#####...#..',
        '.#####.#.#..',
        '.#####.#.#..',
        '.#####.###..',
        '.#####......',
        '.#####......',
        '#######.....',
        '............',
        '............'],
      fire: [
        '.....o......',
        '....oo......',
        '....ooo.o...',
        '...ooooooo..',
        '..ooooyooo..',
        '..oooyyooo..',
        '.oooyyyyooo.',
        '.ooyyyyyooo.',
        '.ooyywyyyoo.',
        '..oyywwyyo..',
        '...oyyyyo...',
        '....oooo....'],
      stop: [
        '...######...',
        '..########..',
        '.##########.',
        '.##########.',
        '.#wwwwwwww#.',
        '.#wwwwwwww#.',
        '.##########.',
        '.##########.',
        '..########..',
        '...######...',
        '............',
        '............'],
      check: [
        '............',
        '..........##',
        '.........##.',
        '........##..',
        '.##....##...',
        '..##..##....',
        '...####.....',
        '....##......',
        '............',
        '............',
        '............',
        '............'],
      cross: [
        '............',
        '.##......##.',
        '..##....##..',
        '...##..##...',
        '....####....',
        '.....##.....',
        '....####....',
        '...##..##...',
        '..##....##..',
        '.##......##.',
        '............',
        '............'],
      partial: [
        '.....##.....',
        '....#..#....',
        '....#..#....',
        '...#....#...',
        '...#....#...',
        '..#......#..',
        '..#......#..',
        '.#........#.',
        '.#........#.',
        '############',
        '............',
        '............'],
      play: [
        '..#.........',
        '..##........',
        '..###.......',
        '..####......',
        '..#####.....',
        '..######....',
        '..#####.....',
        '..####......',
        '..###.......',
        '..##........',
        '..#.........',
        '............'],
      warp: [
        '............',
        '#.....#.....',
        '##....##....',
        '###...###...',
        '####..####..',
        '#####.#####.',
        '####..####..',
        '###...###...',
        '##....##....',
        '#.....#.....',
        '............',
        '............'],
      stage: [
        '.....##.....',
        '....####....',
        '...######...',
        '..########..',
        '.##########.',
        '............',
        '.##########.',
        '.##########.',
        '............',
        '..y.y.y.y.y.',
        '.y.y.y.y.y..',
        '............'],
      refresh: [
        '...####.#...',
        '..#....##...',
        '.#....###...',
        '.#..........',
        '#...........',
        '#..........#',
        '#..........#',
        '.#........#.',
        '.#.......#..',
        '..#.....#...',
        '...#####....',
        '............'],
      download: [
        '.....##.....',
        '.....##.....',
        '.....##.....',
        '.....##.....',
        '..##.##.##..',
        '...######...',
        '....####....',
        '.....##.....',
        '............',
        '#..........#',
        '############',
        '............'],
      pencil: [
        '.........##.',
        '........#yy#',
        '.......#yy#.',
        '......#yy#..',
        '.....#yy#...',
        '....#yy#....',
        '...#yy#.....',
        '..#yy#......',
        '.#ww#.......',
        '.###........',
        '##..........',
        '............'],
      info: [
        '...######...',
        '..#......#..',
        '.#...##...#.',
        '#....##....#',
        '#..........#',
        '#....##....#',
        '#....##....#',
        '#....##....#',
        '.#...##...#.',
        '..#......#..',
        '...######...',
        '............'],
      bulb: [
        '....aaaa....',
        '...aaaaaa...',
        '..aayyyyaa..',
        '..ayyyyyya..',
        '..ayyyyyya..',
        '..aayyyyaa..',
        '...aayyaa...',
        '....kkkk....',
        '....ssss....',
        '....kkkk....',
        '.....kk.....',
        '............'],
      reentry: [
        '...........r',
        '.........roo',
        '.......rooa.',
        '.....rooa...',
        '...rooa.....',
        '..rooa......',
        '.rooy.......',
        'rooy........',
        'roy.........',
        'ry..........',
        '............',
        '............'],
      target: [
        '...######...',
        '..#......#..',
        '.#..####..#.',
        '#..#....#..#',
        '#..#.##.#..#',
        '#..#.##.#..#',
        '#..#....#..#',
        '.#..####..#.',
        '..#......#..',
        '...######...',
        '............',
        '............'],
      station: [
        '.#........#.',
        '..#......#..',
        '...######...',
        '.....##.....',
        '.....##.....',
        '.....##.....',
        '....####....',
        '...######...',
        '..########..',
        '############',
        '............',
        '............'],
      sun: [
        '.....a......',
        '..a..a..a...',
        '...a...a....',
        '....yyy.....',
        '...yyyyy....',
        'aa.yyyyy.aa.',
        '...yyyyy....',
        '....yyy.....',
        '...a...a....',
        '..a..a..a...',
        '.....a......',
        '............'],
      arrowRight: [
        '............',
        '......#.....',
        '......##....',
        '......###...',
        '############',
        '############',
        '......###...',
        '......##....',
        '......#.....',
        '............',
        '............',
        '............']
    };
    PX_ICONS.default = PX_ICONS.satellite;

    function pxIcon(name, size = 14, extraClass = '') {
      const rows = PX_ICONS[name];
      if (!rows) return '';
      const h = rows.length, w = Math.max(...rows.map(r => r.length));
      const n = Math.max(w, h);
      let rects = '';
      rows.forEach((row, y) => {
        let x = 0;
        while (x < row.length) {
          const ch = row[x];
          const col = PX_COLORS[ch];
          if (!col) { x++; continue; }
          let run = 1;
          while (x + run < row.length && row[x + run] === ch) run++;
          rects += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${col}"/>`;
          x += run;
        }
      });
      return `<svg class="px-ico ${extraClass}" width="${size}" height="${size}" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${rects}</svg>`;
    }
    // Center-of-Mass / Center-of-Lift legend markers (same look as the canvas markers)
    const COM_MARK = '<svg class="px-ico" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="5" fill="#e8b931" stroke="#2b241b" stroke-width="1.2"/><path d="M6 6 L11 6 A5 5 0 0 1 6 11 Z M6 6 L1 6 A5 5 0 0 1 6 1 Z" fill="#2b241b"/></svg>';
    const COL_MARK = '<svg class="px-ico" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect x="2.5" y="2.5" width="7" height="7" transform="rotate(45 6 6)" fill="#255c85" stroke="#f3ead6" stroke-width="1"/></svg>';
    function hydrateIcons(root = document) {
      root.querySelectorAll('[data-ico]').forEach(el => {
        if (!el.dataset.icoDone) { el.insertAdjacentHTML('afterbegin', pxIcon(el.dataset.ico, Number(el.dataset.icoSize) || 14)); el.dataset.icoDone = '1'; }
      });
    }

    /**
     * ============================================================================
     * 2. MULTI-PIXEL PART STAMPS LIBRARY (7 PRE-BUILT ASSEMBLIES)
     * ============================================================================
     */
    const PART_STAMPS = [
      {
        id: 'nosecone',
        name: 'Tapered Nosecone',
        dims: '5×6 px',
        desc: 'Carbon low-drag tip',
        width: 5,
        height: 6,
        pixels: [
          [null, null, ['carbon', '#696969'], null, null],
          [null, ['carbon', '#404040'], ['carbon', '#2b2b2b'], ['carbon', '#404040'], null],
          [null, ['carbon', '#2b2b2b'], ['carbon', '#1c1c1c'], ['carbon', '#2b2b2b'], null],
          [['carbon', '#2b2b2b'], ['carbon', '#1c1c1c'], ['carbon', '#1c1c1c'], ['carbon', '#1c1c1c'], ['carbon', '#2b2b2b']],
          [['carbon', '#1c1c1c'], ['carbon', '#2b2b2b'], ['carbon', '#1c1c1c'], ['carbon', '#2b2b2b'], ['carbon', '#1c1c1c']],
          [['alloy', '#b8b8b8'], ['carbon', '#2b2b2b'], ['carbon', '#1c1c1c'], ['carbon', '#2b2b2b'], ['alloy', '#8c8c8c']]
        ]
      },
      {
        id: 'canopy',
        name: 'Teardrop Canopy',
        dims: '6×10 px',
        desc: 'Armored cockpit glazing',
        width: 6,
        height: 10,
        pixels: [
          [null, null, ['carbon', '#1c1c1c'], ['carbon', '#1c1c1c'], null, null],
          [null, ['carbon', '#1c1c1c'], ['canopy', '#688c9e'], ['canopy', '#4c6b7a'], ['carbon', '#1c1c1c'], null],
          [null, ['carbon', '#1c1c1c'], ['canopy', '#4c6b7a'], ['canopy', '#3a525e'], ['carbon', '#1c1c1c'], null],
          [['carbon', '#1c1c1c'], ['canopy', '#4c6b7a'], ['canopy', '#3a525e'], ['canopy', '#2a3c45'], ['carbon', '#1c1c1c'], null],
          [['carbon', '#1c1c1c'], ['canopy', '#4c6b7a'], ['canopy', '#3a525e'], ['canopy', '#3a525e'], ['canopy', '#2a3c45'], ['carbon', '#1c1c1c']],
          [['carbon', '#1c1c1c'], ['canopy', '#3a525e'], ['canopy', '#2a3c45'], ['canopy', '#3a525e'], ['canopy', '#2a3c45'], ['carbon', '#1c1c1c']],
          [['carbon', '#1c1c1c'], ['canopy', '#2a3c45'], ['canopy', '#3a525e'], ['canopy', '#2a3c45'], ['carbon', '#1c1c1c'], null],
          [['carbon', '#1c1c1c'], ['canopy', '#2a3c45'], ['canopy', '#2a3c45'], ['carbon', '#1c1c1c'], null, null],
          [null, ['carbon', '#1c1c1c'], ['carbon', '#1c1c1c'], null, null, null],
          [null, null, null, null, null, null]
        ]
      },
      {
        id: 'liquid_tank_pod',
        name: 'Liquid Fuel Tank Pod',
        dims: '4×8 px',
        desc: 'Cryo-liquid propellant tank',
        width: 4,
        height: 8,
        pixels: [
          [null, ['carbon', '#2b2b2b'], ['carbon', '#2b2b2b'], null],
          [['carbon', '#2b2b2b'], ['liquid_tank', '#5499bd'], ['liquid_tank', '#3b7ea1'], ['carbon', '#2b2b2b']],
          [['carbon', '#2b2b2b'], ['liquid_tank', '#5499bd'], ['liquid_tank', '#3b7ea1'], ['carbon', '#2b2b2b']],
          [['carbon', '#2b2b2b'], ['liquid_tank', '#3b7ea1'], ['liquid_tank', '#2b617d'], ['carbon', '#2b2b2b']],
          [['carbon', '#2b2b2b'], ['liquid_tank', '#3b7ea1'], ['liquid_tank', '#2b617d'], ['carbon', '#2b2b2b']],
          [['carbon', '#2b2b2b'], ['liquid_tank', '#3b7ea1'], ['liquid_tank', '#2b617d'], ['carbon', '#2b2b2b']],
          [['carbon', '#2b2b2b'], ['liquid_tank', '#2b617d'], ['liquid_tank', '#2b617d'], ['carbon', '#2b2b2b']],
          [null, ['carbon', '#2b2b2b'], ['carbon', '#2b2b2b'], null]
        ]
      },
      {
        id: 'solid_booster_seg',
        name: 'Solid Booster Segment',
        dims: '4×9 px',
        desc: 'Solid grain booster stack',
        width: 4,
        height: 9,
        pixels: [
          [null, ['carbon', '#404040'], ['carbon', '#2b2b2b'], null],
          [['carbon', '#2b2b2b'], ['carbon', '#2b2b2b'], ['carbon', '#1c1c1c'], ['carbon', '#2b2b2b']],
          [['alloy', '#b8b8b8'], ['solid_tank', '#e0954f'], ['solid_tank', '#c97b36'], ['alloy', '#8c8c8c']],
          [['alloy', '#b8b8b8'], ['solid_tank', '#e0954f'], ['solid_tank', '#c97b36'], ['alloy', '#8c8c8c']],
          [['alloy', '#a3a3a3'], ['solid_tank', '#c97b36'], ['solid_tank', '#a86123'], ['alloy', '#737373']],
          [['alloy', '#a3a3a3'], ['solid_tank', '#c97b36'], ['solid_tank', '#a86123'], ['alloy', '#737373']],
          [['alloy', '#a3a3a3'], ['solid_tank', '#c97b36'], ['solid_tank', '#a86123'], ['alloy', '#737373']],
          [['carbon', '#2b2b2b'], ['solid_tank', '#a86123'], ['solid_tank', '#a86123'], ['carbon', '#2b2b2b']],
          [null, ['solid_thruster', '#d9534f'], ['solid_thruster', '#b53834'], null]
        ]
      },
      {
        id: 'deltawing',
        name: 'Delta Wing Foil',
        dims: '6×9 px',
        desc: 'High-lift cambered wing',
        width: 6,
        height: 9,
        pixels: [
          [null, null, null, null, null, ['carbon', '#2b2b2b']],
          [null, null, null, null, ['carbon', '#2b2b2b'], ['wing', '#d9c7a3']],
          [null, null, null, ['carbon', '#2b2b2b'], ['wing', '#d9c7a3'], ['wing', '#bfa980']],
          [null, null, ['carbon', '#2b2b2b'], ['wing', '#d9c7a3'], ['wing', '#bfa980'], ['wing', '#bfa980']],
          [null, ['carbon', '#2b2b2b'], ['wing', '#d9c7a3'], ['wing', '#bfa980'], ['wing', '#bfa980'], ['wing', '#a68f65']],
          [['carbon', '#2b2b2b'], ['wing', '#d9c7a3'], ['wing', '#bfa980'], ['wing', '#bfa980'], ['wing', '#a68f65'], ['wing', '#a68f65']],
          [['carbon', '#1c1c1c'], ['wing', '#bfa980'], ['wing', '#bfa980'], ['wing', '#a68f65'], ['wing', '#a68f65'], ['alloy', '#8c8c8c']],
          [['carbon', '#1c1c1c'], ['wing', '#a68f65'], ['wing', '#a68f65'], ['alloy', '#8c8c8c'], ['alloy', '#737373'], ['alloy', '#737373']],
          [null, ['carbon', '#1c1c1c'], ['carbon', '#2b2b2b'], ['carbon', '#2b2b2b'], ['carbon', '#1c1c1c'], null]
        ]
      },
      {
        id: 'liquid_nozzle',
        name: 'Liquid Thruster',
        dims: '4×4 px',
        desc: 'Throttleable cryo-bell',
        width: 4,
        height: 4,
        pixels: [
          [['carbon', '#1c1c1c'], ['alloy', '#8c8c8c'], ['alloy', '#737373'], ['carbon', '#1c1c1c']],
          [['carbon', '#1c1c1c'], ['liquid_thruster', '#2b343b'], ['liquid_thruster', '#2b343b'], ['carbon', '#1c1c1c']],
          [['carbon', '#2b2b2b'], ['liquid_thruster', '#255c85'], ['liquid_thruster', '#1c4666'], ['carbon', '#2b2b2b']],
          [null, ['liquid_thruster', '#4a7fa6'], ['liquid_thruster', '#255c85'], null]
        ]
      },
      {
        id: 'solid_nozzle',
        name: 'Solid Nozzle',
        dims: '4×4 px',
        desc: 'High-impulse solid motor',
        width: 4,
        height: 4,
        pixels: [
          [['carbon', '#1c1c1c'], ['alloy', '#8c8c8c'], ['alloy', '#737373'], ['carbon', '#1c1c1c']],
          [['carbon', '#1c1c1c'], ['solid_thruster', '#382c26'], ['solid_thruster', '#382c26'], ['carbon', '#1c1c1c']],
          [['carbon', '#2b2b2b'], ['solid_thruster', '#d9534f'], ['solid_thruster', '#b53834'], ['carbon', '#2b2b2b']],
          [null, ['solid_thruster', '#e88d4f'], ['solid_thruster', '#d9534f'], null]
        ]
      }
    ];

    /**
     * ============================================================================
     * 3. GLOBAL APPLICATION STATE
     * ============================================================================
     */
    const state = {
      mode: 'build', // 'build' | 'sim'
      cols: 32,
      rows: 48,
      grid: [], // 2D array [y][x] -> null | { matId, color }
      craftName: 'BANTAY-1',

      // Active Drafting Tool State
      tool: 'brush', // 'brush' | 'line' | 'box' | 'fill' | 'eraser' | 'picker' | 'pan' | 'stamp'
      activeStamp: null,
      brushSize: 1,
      mirrorX: false,
      activeMatId: 'carbon',
      activeColor: '#2b2b2b',

      // Viewport & Camera State
      zoom: 12,
      panX: 0,
      panY: 0,
      showGrid: true,

      // Minimizable FBD Tab State
      fbdMinimized: false,
      testFuelPercent: 100, // Build-mode fuel preview slider (0 - 100%)
      testAirspeed: 65,     // Build-mode airspeed preview slider (0 - 250 m/s)

      // Pointer / Gesture State
      isDrawing: false,
      isPanning: false,
      spacePressed: false,
      panStart: { x: 0, y: 0 },
      dragStartCell: null,
      hoverCell: null,

      // Undo / Redo Stacks
      undoStack: [],
      redoStack: [],

      // Cached Physics & FBD Analysis
      physics: null
    };

    /**
     * ============================================================================
     * 4. STARTER CRAFT GENERATOR ("ORBITAL SHUTTLE MK-I")
     * ============================================================================
     * Preloads a shaded multi-pixel spacecraft featuring:
     * - Tapered Carbon Nosecone
     * - Shaded Alloy Hull & Asymmetric Armored Canopy Glass
     * - Core Liquid Fuel Tanks feeding central Liquid Thrusters
     * - Twin outboard Solid Fuel Tank boosters feeding Solid Booster Nozzles
     * - Swept Aero Wing Foils
     */
    function buildOrbitalShuttlePreset(cols, rows) {
      const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
      const setPx = (gx, gy, matId, color) => {
        if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) {
          grid[gy][gx] = { matId, color };
        }
      };

      // Center the 20x42 shuttle assembly inside the grid
      const ox = Math.floor((cols - 20) / 2);
      const oy = Math.max(2, Math.floor((rows - 42) / 2));

      const spriteRows = [
        '.........T..........', // 0
        '........TG..........', // 1
        '.......GGD..........', // 2
        '.......GDD..........', // 3
        '......GDDKK.........', // 4
        '......DDDKK.........', // 5
        '......DDKKK.........', // 6
        '......DDKKK.........', // 7
        '.....LGDKKKS........', // 8
        '.....LLMMSMS........', // 9
        '.....LLMMMMS........', // 10
        '....LLMMMMMS........', // 11
        '....LLMMMMMSH.......', // 12
        '....LLMMMMMSS.......', // 13
        '....LLMMMMMSS.......', // 14
        '....LLMMMMMSS.......', // 15
        '....LLMMKKKKK.......', // 16
        '...LLMKKCCBKK.......', // 17
        '...LLMKCCCBBKK......', // 18
        '...LLMKCCBBBKK......', // 19
        '..GLLMKCCBBBKKG.....', // 20 - Twin solid booster tips start
        '.KDDLMKCCBNBBKKDK...', // 21
        '.KZZLMKCCBNBBKKZYK..', // 22 - Solid Fuel Tanks on flanks + Canopy
        '.KZZLMKCBBNBBKKZYK..', // 23
        '.KZZLMKCBBNBBKKZYK..', // 24
        '.KZYLMKKBBNBBKKYXK..', // 25
        '.KZYMMKKBBBKKKKYXK..', // 26
        '.KZYMMKKBBKLLMSYXK..', // 27
        'WKZYMMKKBKKLLMSYXKW.', // 28 - Outer Aero Wing Foils + Liquid Core Tanks
        'VKZYMMKKQQPPPMUYXKV.', // 29
        'VKZYMMLLQQPPPMUYXKV.', // 30
        'VKZYMMLLQQPPPMUYXKV.', // 31
        'AKZYMMLLQQPPPMUYXKA.', // 32
        'AKYXMMLLQQPPPMUXXKA.', // 33
        'AKYXMMLLQPPPOMUXXKA.', // 34
        'AKYXMMLLQPPPOMUXXKA.', // 35
        '.KYXMMLLQPPPOMUXXK..', // 36
        '.KYXMMLLQPPPOMUXXK..', // 37
        '.KKKMMLLOOOOOMUKKK..', // 38
        '..KKMMLLKKKKKLMUK...', // 39
        '..RR..KKEEEEEJK.FF..', // 40 - Solid Booster Nozzles (RR/FF) & Liquid Thrusters (EE/J)
        '..RR...KEEEEJK..FF..'  // 41
      ];

      const charToPixel = {
        'K': ['carbon', '#1c1c1c'],
        'D': ['carbon', '#2b2b2b'],
        'G': ['carbon', '#404040'],
        'T': ['carbon', '#696969'],
        'H': ['alloy', '#d4d4d4'],
        'L': ['alloy', '#b8b8b8'],
        'M': ['alloy', '#a3a3a3'],
        'S': ['alloy', '#8c8c8c'],
        'U': ['alloy', '#737373'],
        'C': ['canopy', '#4c6b7a'],
        'B': ['canopy', '#3a525e'],
        'N': ['canopy', '#2a3c45'],
        'W': ['wing', '#d9c7a3'],
        'V': ['wing', '#bfa980'],
        'A': ['wing', '#a68f65'],
        'Q': ['liquid_tank', '#5499bd'],
        'P': ['liquid_tank', '#3b7ea1'],
        'O': ['liquid_tank', '#2b617d'],
        'Z': ['solid_tank', '#e0954f'],
        'Y': ['solid_tank', '#c97b36'],
        'X': ['solid_tank', '#a86123'],
        'E': ['liquid_thruster', '#255c85'],
        'J': ['liquid_thruster', '#1c4666'],
        'R': ['solid_thruster', '#d9534f'],
        'F': ['solid_thruster', '#b53834']
      };

      for (let r = 0; r < spriteRows.length; r++) {
        const line = spriteRows[r];
        for (let c = 0; c < line.length; c++) {
          const ch = line[c];
          if (ch !== '.' && charToPixel[ch]) {
            const [matId, color] = charToPixel[ch];
            setPx(ox + c, oy + r, matId, color);
          }
        }
      }

      return grid;
    }

    /**
     * ============================================================================
     * 4b. MISSION-READY PRESET: "BANTAY-1" two-stage launcher + typhoon-watch microsat
     * ============================================================================
     * Verified with the mission engine: reaches a 500 km / 20° orbit with ~100 m/s Δv margin
     * and passes every check for the typhoon mission — but NOT for volcano or flood missions.
     */
    const BANTAY_ROWS = [
      '...........TT...........', // 0  fairing tip
      '..........GisG..........', // 1  wide imager + S-band antenna
      '.......PQ.HkbS.QP.......', // 2  solar wings, computer, battery
      '.......QP.MwwU.PQ.......', // 3  reaction wheels
      '..........DDDD..........', // 4
      '..........dddd..........', // 5  ── decoupler: satellite separates here
      '.........KOPPOK.........', // 6  stage 2 tanks
      '.........OPPPPO.........',
      '.........OPPPPO.........',
      '.........OPPPPO.........',
      '.........OPPPPO.........',
      '.........OPPPPO.........',
      '.........OPPPPO.........',
      '.........KOOOOK.........', // 13
      '...........EJ...........', // 14 stage 2 engines
      '....dddddddddddddddd....', // 15 ── decoupler: first stage drops here
      '....KOOOOOOOOOOOOOOK....', // 16 stage 1 tanks
      '....QPPPPPPPPPPPPPPO....',
      '....QPPPPPPPPPPPPPPO....',
      '....QPPPPPPPPPPPPPPO....',
      '....QPPPPPPPPPPPPPPO....',
      '....QPPPPPPPPPPPPPPO....',
      '....QPPPPPPPPPPPPPPO....',
      '....QPPPPPPPPPPPPPPO....',
      '....QPPPPPPPPPPPPPPO....',
      '....QPPPPPPPPPPPPPPO....',
      '....QPPPPPPPPPPPPPPO....',
      '....QPPPPPPPPPPPPPPO....',
      '....QPPPPPPPPPPPPPPO....',
      '....QPPPPPPPPPPPPPPO....',
      '....QPPPPPPPPPPPPPPO....',
      '...WQPPPPPPPPPPPPPPOW...',
      '...WQPPPPPPPPPPPPPPOW...',
      '...WQPPPPPPPPPPPPPPOW...',
      '..VVQPPPPPPPPPPPPPPOVV..',
      '..VVQPPPPPPPPPPPPPPOVV..',
      '..VVQPPPPPPPPPPPPPPOVV..',
      '.AAAQPPPPPPPPPPPPPPOAAA.',
      '.AAAQPPPPPPPPPPPPPPOAAA.',
      '.AAAOOOOOOOOOOOOOOOOAAA.',
      '...EJEJEJEJEJEJEJEJEJ...'  // 40 stage 1 engines (18)
    ];

    const BANTAY_CHARS = {
      'T': ['carbon', '#696969'], 'G': ['carbon', '#404040'], 'D': ['carbon', '#2b2b2b'], 'K': ['carbon', '#1c1c1c'],
      'H': ['alloy', '#d4d4d4'], 'L': ['alloy', '#b8b8b8'], 'M': ['alloy', '#a3a3a3'], 'S': ['alloy', '#8c8c8c'], 'U': ['alloy', '#737373'],
      'W': ['wing', '#d9c7a3'], 'V': ['wing', '#bfa980'], 'A': ['wing', '#a68f65'],
      'Q': ['liquid_tank', '#5499bd'], 'P': ['liquid_tank', '#3b7ea1'], 'O': ['liquid_tank', '#2b617d'],
      'E': ['liquid_thruster', '#255c85'], 'J': ['liquid_thruster', '#1c4666'],
      'd': ['decoupler', '#e8b931'],
      'i': ['imager_wide', '#2a9d8f'], 's': ['antenna_s', '#c0c0c0'], 'k': ['computer', '#6b3fa0'],
      'b': ['battery', '#3c8d5a'], 'w': ['wheel', '#7a5c3a']
    };
    function buildBantayPreset(cols, rows) {
      const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
      const w = BANTAY_ROWS[0].length;
      const ox = Math.floor((cols - w) / 2);
      const oy = Math.max(1, rows - BANTAY_ROWS.length - 2);
      BANTAY_ROWS.forEach((line, r) => {
        for (let c = 0; c < line.length; c++) {
          const ch = line[c];
          let px = null;
          // rows 2–3 use P/Q as solar-panel shades outside the bus (columns < 10 or > 13)
          if ((r === 2 || r === 3) && (ch === 'P' || ch === 'Q')) px = ['solar', ch === 'P' ? '#1f3f8a' : '#3456a8'];
          else if (r === 1 && (ch === 'G')) px = ['carbon', '#404040'];
          else px = BANTAY_CHARS[ch] || null;
          if (px && ox + c >= 0 && ox + c < cols && oy + r < rows) grid[oy + r][ox + c] = { matId: px[0], color: px[1] };
        }
      });
      return grid;
    }

    // Extra multi-pixel stamps for spacecraft design
    PART_STAMPS.push(
      {
        id: 'decoupler_ring', name: 'Stage Decoupler Ring', dims: '8×1 px', desc: 'Splits rocket into stages', width: 8, height: 1,
        pixels: [Array(8).fill(['decoupler', '#e8b931'])]
      },
      {
        id: 'typhoon_sat', name: 'Typhoon-Watch Satellite', dims: '10×4 px', desc: 'Wide imager bus + solar wings', width: 10, height: 4,
        pixels: [
          [null, null, null, null, ['carbon', '#696969'], ['carbon', '#696969'], null, null, null, null],
          [null, null, null, ['carbon', '#404040'], ['imager_wide', '#2a9d8f'], ['antenna_s', '#c0c0c0'], ['carbon', '#404040'], null, null, null],
          [['solar', '#1f3f8a'], ['solar', '#3456a8'], null, ['alloy', '#d4d4d4'], ['computer', '#6b3fa0'], ['battery', '#3c8d5a'], ['alloy', '#8c8c8c'], null, ['solar', '#3456a8'], ['solar', '#1f3f8a']],
          [['solar', '#3456a8'], ['solar', '#1f3f8a'], null, ['alloy', '#a3a3a3'], ['wheel', '#7a5c3a'], ['wheel', '#7a5c3a'], ['alloy', '#737373'], null, ['solar', '#1f3f8a'], ['solar', '#3456a8']]
        ]
      },
      {
        id: 'telescope_sat', name: 'High-Res Telescope Satellite', dims: '8×5 px', desc: '2×2 mirror, redundant computers', width: 8, height: 5,
        pixels: [
          [null, null, null, ['carbon', '#404040'], ['carbon', '#404040'], null, null, null],
          [null, null, ['carbon', '#404040'], ['telescope', '#0b0b2a'], ['telescope', '#1a1a4a'], ['carbon', '#404040'], null, null],
          [['solar', '#1f3f8a'], null, ['antenna_x', '#d4a017'], ['telescope', '#1a1a4a'], ['telescope', '#0b0b2a'], ['computer', '#6b3fa0'], null, ['solar', '#1f3f8a']],
          [['solar', '#3456a8'], null, ['battery', '#3c8d5a'], ['wheel', '#7a5c3a'], ['wheel', '#7a5c3a'], ['computer', '#55307f'], null, ['solar', '#3456a8']],
          [['solar', '#1f3f8a'], null, ['alloy', '#a3a3a3'], ['battery', '#2e6e46'], ['wheel', '#5e4529'], ['alloy', '#737373'], null, ['solar', '#1f3f8a']]
        ]
      },
      {
        id: 'sar_panel', name: 'SAR Radar Panel', dims: '4×1 px', desc: 'All-weather radar (needs 4 px)', width: 4, height: 1,
        pixels: [[['radar', '#8e2c48'], ['radar', '#6e1f37'], ['radar', '#8e2c48'], ['radar', '#6e1f37']]]
      },
      {
        id: 'solar_wing', name: 'Solar Array Wing', dims: '2×3 px', desc: '60 W peak', width: 2, height: 3,
        pixels: [
          [['solar', '#1f3f8a'], ['solar', '#3456a8']],
          [['solar', '#3456a8'], ['solar', '#1f3f8a']],
          [['solar', '#1f3f8a'], ['solar', '#3456a8']]
        ]
      },
      {
        id: 'fin_set', name: 'Stabilizer Fin', dims: '2×4 px', desc: 'Place LOW for stability', width: 2, height: 4,
        pixels: [
          [null, ['wing', '#d9c7a3']],
          [['wing', '#d9c7a3'], ['wing', '#bfa980']],
          [['wing', '#bfa980'], ['wing', '#a68f65']],
          [['wing', '#a68f65'], ['wing', '#a68f65']]
        ]
      }
    );

    /**
     * ============================================================================
     * 5. PROPELLANT FILL LEVEL & REAL-TIME FREE BODY DIAGRAM (FBD) CALCULATOR
     * ============================================================================
     * - Calculates which tank pixels still contain propellant based on liquidFuelFrac
     *   (0..1) and solidFuelFrac (0..1), draining from top to bottom.
     * - Computes live wet/dry mass, Center of Mass (CoM), Center of Lift (CoL),
     *   active Liquid/Solid thrust (0 N when fuel == 0), aerodynamic drag (D),
     *   aerodynamic lift (L), and per-material surface friction (F_f).
     */
    // U.S. Standard Atmosphere 1976 (NOAA/NASA/USAF) — density in kg/m³ up to 86 km
    const STD_ATM_LAYERS = [
      // [base geopotential altitude m, base temperature K, lapse rate K/m, base pressure Pa]
      [0, 288.15, -0.0065, 101325],
      [11000, 216.65, 0, 22632.06],
      [20000, 216.65, 0.001, 5474.889],
      [32000, 228.65, 0.0028, 868.0187],
      [47000, 270.65, 0, 110.9063],
      [51000, 270.65, -0.0028, 66.93887],
      [71000, 214.65, -0.002, 3.956420]
    ];
    function stdAtmDensity(altM) {
      const R = 287.053, g = 9.80665, M = 0.0289644, Rstar = 8.3144598;
      const z = Math.max(0, altM);
      const h = (6356766 * z) / (6356766 + z); // geopotential altitude
      if (h > 84852) return 6.958e-6 * Math.exp(-(h - 84852) / 6500);
      let L = STD_ATM_LAYERS[0];
      for (const layer of STD_ATM_LAYERS) if (h >= layer[0]) L = layer;
      const [hb, Tb, Lb, Pb] = L;
      let T, P;
      if (Lb === 0) { T = Tb; P = Pb * Math.exp(-g * M * (h - hb) / (Rstar * Tb)); }
      else { T = Tb + Lb * (h - hb); P = Pb * Math.pow(Tb / T, g * M / (Rstar * Lb)); }
      return P / (R * T);
    }

    /**
     * Craft physics for the FBD panel and the 2D flight test.
     * Staging: rows containing a Stage Decoupler split the craft. Only the BOTTOM stage's
     * engines fire and only its tanks drain; upper stages wait (full) until you stage.
     */
    function computeCraftPhysics(grid, cols, rows, options = {}) {
      const liquidFrac = options.liquidFrac !== undefined ? Math.max(0, Math.min(1, options.liquidFrac)) : 1.0;
      const solidFrac = options.solidFrac !== undefined ? Math.max(0, Math.min(1, options.solidFrac)) : 1.0;
      const airspeed = options.airspeed !== undefined ? Math.max(0, options.airspeed) : 0;
      const pitchRad = options.pitchRad !== undefined ? options.pitchRad : 0;
      const aoaRad = options.aoaRad !== undefined ? options.aoaRad : pitchRad;
      const altitude = options.altitude !== undefined ? Math.max(0, options.altitude) : 0;
      const throttle = options.throttle !== undefined ? Math.max(0, Math.min(1, options.throttle)) : 1.0;
      const armLiquid = options.armLiquid !== undefined ? options.armLiquid : true;
      const armSolid = options.armSolid !== undefined ? options.armSolid : true;
      const solidActive = options.solidActive !== undefined ? options.solidActive : true;

      const sepRows = getSeparationRows(grid, cols, rows);
      const activeStageOf = (y) => stageOfRow(y, sepRows) === 0;

      // Collect ACTIVE-stage tank pixel coordinates (sorted top-to-bottom) for draining
      const liquidTankCells = [];
      const solidTankCells = [];
      for (let y = 0; y < rows; y++) {
        const row = grid[y];
        if (!row) continue;
        if (!activeStageOf(y)) continue;
        for (let x = 0; x < cols; x++) {
          const cell = row[x];
          if (!cell) continue;
          if (cell.matId === 'liquid_tank') liquidTankCells.push({ x, y });
          else if (cell.matId === 'solid_tank') solidTankCells.push({ x, y });
        }
      }

      const pixelFuelFill = new Map();
      const fillCells = (cells, frac) => {
        const total = cells.length;
        const filled = total * frac;
        cells.forEach((pt, idx) => {
          const idxFromBottom = total - 1 - idx;
          pixelFuelFill.set(`${pt.x},${pt.y}`, Math.max(0, Math.min(1, filled - idxFromBottom)));
        });
      };
      fillCells(liquidTankCells, liquidFrac);
      fillCells(solidTankCells, solidFrac);

      let pixelCount = 0, dryMass = 0, currentMass = 0, sumMassX = 0, sumMassY = 0;
      let liquidFuelMaxKg = 0, liquidFuelCurKg = 0, solidFuelMaxKg = 0, solidFuelCurKg = 0;
      let totalAeroWeight = 0, sumAeroX = 0, sumAeroY = 0, totalLiftCoeff = 0, totalDragCoeff = 0;
      let liquidThrusterCount = 0, solidThrusterCount = 0;
      const thrusterPixels = [];
      let exteriorPixelCount = 0, sumExteriorMu = 0;
      const frictionByMat = {};
      const occupiedCols = new Set();
      let minX = cols, maxX = -1, minY = rows, maxY = -1;
      const massCells = [];

      for (let y = 0; y < rows; y++) {
        const row = grid[y];
        if (!row) continue;
        const active = activeStageOf(y);
        for (let x = 0; x < cols; x++) {
          const cell = row[x];
          if (!cell) continue;
          const mat = MATERIAL_MAP[cell.matId] || MATERIAL_MAP.alloy;
          pixelCount++;
          occupiedCols.add(x);
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;

          let cellMass = mat.dryMass;
          dryMass += mat.dryMass;
          if (mat.fuelType) {
            const f = active ? (pixelFuelFill.get(`${x},${y}`) ?? 1) : 1;
            cellMass += mat.fuelMass * f;
            if (active && mat.fuelType === 'liquid') { liquidFuelMaxKg += mat.fuelMass; liquidFuelCurKg += mat.fuelMass * f; }
            if (active && mat.fuelType === 'solid') { solidFuelMaxKg += mat.fuelMass; solidFuelCurKg += mat.fuelMass * f; }
          }
          currentMass += cellMass;
          sumMassX += cellMass * (x + 0.5);
          sumMassY += cellMass * (y + 0.5);
          massCells.push([x + 0.5, y + 0.5, cellMass]);

          totalDragCoeff += mat.drag;

          if (mat.thrusterType && active) {
            if (mat.thrusterType === 'liquid') liquidThrusterCount++; else solidThrusterCount++;
            thrusterPixels.push({ x: x + 0.5, y: y + 0.5, type: mat.thrusterType, thrust: mat.thrust });
          }

          const isBoundary = y === 0 || y === rows - 1 || x === 0 || x === cols - 1 ||
            !grid[y - 1]?.[x] || !grid[y + 1]?.[x] || !grid[y]?.[x - 1] || !grid[y]?.[x + 1];
          if (isBoundary) {
            // Center of Lift / pressure: aerodynamic forces act on the EXPOSED surface only
            const aeroW = mat.lift + mat.drag * 0.45;
            totalAeroWeight += aeroW;
            sumAeroX += aeroW * (x + 0.5);
            sumAeroY += aeroW * (y + 0.5);
            totalLiftCoeff += mat.lift;
            exteriorPixelCount++;
            sumExteriorMu += mat.mu;
            if (!frictionByMat[mat.id]) frictionByMat[mat.id] = { mat, extCount: 0, mu: mat.mu, forceN: 0 };
            frictionByMat[mat.id].extCount++;
          }
        }
      }

      if (pixelCount === 0) {
        return {
          pixelCount: 0, dryMass: 0, currentMass: 0, weightN: 0,
          liquidFuelMaxKg: 0, liquidFuelCurKg: 0, solidFuelMaxKg: 0, solidFuelCurKg: 0,
          hasLiquidFuel: false, hasSolidFuel: false, liquidThrusterCount: 0, solidThrusterCount: 0,
          liquidThrustN: 0, solidThrustN: 0, totalThrustN: 0, dragN: 0, frictionN: 0, liftN: 0, muEff: 0,
          frictionBreakdown: [], twr: 0, com: { x: cols / 2, y: rows / 2 }, col: { x: cols / 2, y: rows / 2 },
          thrustCenter: { x: cols / 2, y: rows * 0.85 }, thrusterPixels: [], pixelFuelFill, momentOfInertia: 100,
          inertiaKgM2: 10, sepRows, stageCount: 1, rho: 1.225, q: 0, refAreaM2: 0,
          bounds: { minX: 0, maxX: cols, minY: 0, maxY: rows }
        };
      }

      const g = 9.81;
      const weightN = currentMass * g;
      const com = { x: sumMassX / currentMass, y: sumMassY / currentMass };
      const col = totalAeroWeight > 0 ? { x: sumAeroX / totalAeroWeight, y: sumAeroY / totalAeroWeight } : { ...com };

      const hasLiquidFuel = liquidFuelCurKg > 0.001;
      const hasSolidFuel = solidFuelCurKg > 0.001;
      const liquidThrustN = (armLiquid && hasLiquidFuel) ? liquidThrusterCount * MATERIAL_MAP.liquid_thruster.thrust * throttle : 0;
      const solidThrustN = (armSolid && solidActive && hasSolidFuel) ? solidThrusterCount * MATERIAL_MAP.solid_thruster.thrust : 0;
      const totalThrustN = liquidThrustN + solidThrustN;

      let thrustCenter = { x: com.x, y: maxY + 0.5 };
      if (thrusterPixels.length > 0) {
        let txSum = 0, tySum = 0, twSum = 0;
        for (const tp of thrusterPixels) {
          const w = tp.type === 'liquid'
            ? (armLiquid && hasLiquidFuel ? tp.thrust : 0.1)
            : (armSolid && solidActive && hasSolidFuel ? tp.thrust : 0.1);
          txSum += tp.x * w; tySum += tp.y * w; twSum += w;
        }
        thrustCenter = { x: txSum / twSum, y: tySum / twSum };
      }

      // Atmosphere: U.S. Standard Atmosphere 1976
      const rho = stdAtmDensity(altitude);
      const q = 0.5 * rho * airspeed * airspeed;

      // Drag. AERO_SCALE: pixel rockets are far lighter than real rockets of the same size, so
      // aerodynamic areas are scaled down to give a realistic ballistic coefficient (m / CdA).
      const AERO_SCALE = 0.06;
      const frontalWidthM = Math.max(1, occupiedCols.size) * 0.25;
      const refAreaM2 = frontalWidthM * frontalWidthM * 0.785 * AERO_SCALE;
      const avgCd = (totalDragCoeff / pixelCount) * 1.45;
      const aoaFactor = 1 + 1.8 * Math.pow(Math.sin(aoaRad), 2);
      const pressureDragN = q * refAreaM2 * avgCd * aoaFactor;

      // Lift: zero at zero angle of attack, grows with |AoA| (thin-airfoil-like, capped at stall)
      const wingAreaM2 = totalLiftCoeff * 0.085 * AERO_SCALE;
      const effectiveCl = Math.min(1.2, 2 * Math.PI * Math.abs(Math.sin(aoaRad)));
      const liftN = q * wingAreaM2 * effectiveCl;

      // Skin friction (part of total drag): exterior pixels exposed to the airflow
      const muEff = exteriorPixelCount > 0 ? sumExteriorMu / exteriorPixelCount : 0;
      const wettedAreaM2 = exteriorPixelCount * 0.042 * AERO_SCALE;
      const frictionN = q * wettedAreaM2 * (muEff * 0.22);
      const dragN = pressureDragN;

      const frictionBreakdown = Object.values(frictionByMat)
        .map(item => {
          const share = sumExteriorMu > 0 ? (item.extCount * item.mu) / sumExteriorMu : 0;
          return { ...item, share, forceN: frictionN * share };
        })
        .sort((a, b) => b.forceN - a.forceN);

      // Moment of inertia about CoM (game units for legacy code + real kg·m²)
      let momentOfInertia = 0, inertiaKgM2 = 0;
      for (const [cx, cy, m] of massCells) {
        const dx = cx - com.x, dy = cy - com.y;
        momentOfInertia += m * (dx * dx + dy * dy + 0.5);
        inertiaKgM2 += m * ((dx * dx + dy * dy) * 0.0625 + 0.01);
      }

      const twr = weightN > 0 ? totalThrustN / weightN : 0;

      return {
        pixelCount, dryMass, currentMass, weightN,
        liquidFuelMaxKg, liquidFuelCurKg, solidFuelMaxKg, solidFuelCurKg,
        hasLiquidFuel, hasSolidFuel, liquidThrusterCount, solidThrusterCount,
        liquidThrustN, solidThrustN, totalThrustN, dragN, frictionN, liftN, muEff, frictionBreakdown,
        twr, com, col, thrustCenter, thrusterPixels, pixelFuelFill,
        momentOfInertia: Math.max(12, momentOfInertia), inertiaKgM2: Math.max(1, inertiaKgM2),
        sepRows, stageCount: sepRows.length + 1, rho, q, refAreaM2, wingAreaM2,
        bounds: { minX, maxX, minY, maxY }
      };
    }

    /**
     * ============================================================================
     * 6. UNDO / REDO SNAPSHOTS & GRID MANIPULATION HELPERS
     * ============================================================================
     */
    function cloneGrid(grid) {
      return grid.map(row => row.map(cell => (cell ? { ...cell } : null)));
    }

    function pushUndoSnapshot() {
      state.undoStack.push(cloneGrid(state.grid));
      if (state.undoStack.length > 40) state.undoStack.shift();
      state.redoStack = [];
    }

    function performUndo() {
      if (state.undoStack.length === 0) return;
      state.redoStack.push(cloneGrid(state.grid));
      state.grid = state.undoStack.pop();
      recalculateAndRefreshUI();
      showToast('Undo applied');
    }

    function performRedo() {
      if (state.redoStack.length === 0) return;
      state.undoStack.push(cloneGrid(state.grid));
      state.grid = state.redoStack.pop();
      recalculateAndRefreshUI();
      showToast('Redo applied');
    }

    function setGridCell(x, y, value, applyMirror = true) {
      if (x < 0 || x >= state.cols || y < 0 || y >= state.rows) return;
      state.grid[y][x] = value ? { ...value } : null;
      if (applyMirror && state.mirrorX) {
        const mx = state.cols - 1 - x;
        if (mx >= 0 && mx < state.cols) {
          state.grid[y][mx] = value ? { ...value } : null;
        }
      }
    }

    function applyBrushAt(cx, cy, erase = false) {
      const val = erase ? null : { matId: state.activeMatId, color: state.activeColor };
      const half = Math.floor((state.brushSize - 1) / 2);
      for (let dy = -half; dy < state.brushSize - half; dy++) {
        for (let dx = -half; dx < state.brushSize - half; dx++) {
          setGridCell(cx + dx, cy + dy, val, true);
        }
      }
    }

    function getLineCells(x0, y0, x1, y1) {
      const pts = [];
      let dx = Math.abs(x1 - x0);
      let dy = Math.abs(y1 - y0);
      let sx = x0 < x1 ? 1 : -1;
      let sy = y0 < y1 ? 1 : -1;
      let err = dx - dy;

      while (true) {
        pts.push({ x: x0, y: y0 });
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
      }
      return pts;
    }

    function applyLine(x0, y0, x1, y1) {
      const val = { matId: state.activeMatId, color: state.activeColor };
      for (const pt of getLineCells(x0, y0, x1, y1)) {
        setGridCell(pt.x, pt.y, val, true);
      }
    }

    function applyBox(x0, y0, x1, y1) {
      const minX = Math.max(0, Math.min(x0, x1));
      const maxX = Math.min(state.cols - 1, Math.max(x0, x1));
      const minY = Math.max(0, Math.min(y0, y1));
      const maxY = Math.min(state.rows - 1, Math.max(y0, y1));
      const val = { matId: state.activeMatId, color: state.activeColor };

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          setGridCell(x, y, val, true);
        }
      }
    }

    function applyFloodFill(startX, startY) {
      if (startX < 0 || startX >= state.cols || startY < 0 || startY >= state.rows) return;
      const target = state.grid[startY][startX];
      const targetKey = target ? `${target.matId}|${target.color}` : 'EMPTY';
      const replacement = { matId: state.activeMatId, color: state.activeColor };
      const replKey = `${replacement.matId}|${replacement.color}`;
      if (targetKey === replKey) return;

      const visited = new Set();
      const queue = [[startX, startY]];

      while (queue.length > 0) {
        const [x, y] = queue.shift();
        const key = `${x},${y}`;
        if (visited.has(key)) continue;
        visited.add(key);

        if (x < 0 || x >= state.cols || y < 0 || y >= state.rows) continue;
        const cur = state.grid[y][x];
        const curKey = cur ? `${cur.matId}|${cur.color}` : 'EMPTY';
        if (curKey !== targetKey) continue;

        setGridCell(x, y, replacement, true);
        queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
    }

    function applyStampAt(cx, cy, stamp) {
      const startX = cx - Math.floor(stamp.width / 2);
      const startY = cy - Math.floor(stamp.height / 2);
      for (let r = 0; r < stamp.height; r++) {
        const row = stamp.pixels[r];
        if (!row) continue;
        for (let c = 0; c < stamp.width; c++) {
          const px = row[c];
          if (!px) continue;
          const [matId, color] = px;
          setGridCell(startX + c, startY + r, { matId, color }, state.mirrorX);
        }
      }
    }

    /**
     * ============================================================================
     * 7. PARCHMENT BUILD CANVAS RENDERER
     * ============================================================================
     */
    const viewportEl = document.getElementById('canvas-viewport');
    const mainCanvas = document.getElementById('main-canvas');
    const ctx = mainCanvas.getContext('2d');

    function resizeCanvas() {
      const rect = viewportEl.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      mainCanvas.width = Math.max(1, Math.floor(rect.width * dpr));
      mainCanvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function fitBlueprintToViewport() {
      const rect = viewportEl.getBoundingClientRect();
      const availW = Math.max(120, rect.width - 70);
      const availH = Math.max(160, rect.height - 95);
      const fitZoom = Math.max(4, Math.min(20, Math.floor(Math.min(availW / state.cols, availH / state.rows))));
      state.zoom = fitZoom;
      state.panX = Math.round((rect.width - state.cols * state.zoom) / 2);
      state.panY = Math.round((rect.height - state.rows * state.zoom) / 2) + 12;
      syncZoomUI();
    }

    function syncZoomUI() {
      document.getElementById('slider-zoom').value = state.zoom;
      document.getElementById('zoom-readout').textContent = `${state.zoom}x`;
    }

    function screenToGrid(clientX, clientY) {
      const rect = mainCanvas.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      const gx = Math.floor((sx - state.panX) / state.zoom);
      const gy = Math.floor((sy - state.panY) / state.zoom);
      return { x: gx, y: gy, sx, sy };
    }

    function drawArrowVector(targetCtx, x0, y0, dx, dy, color, label, opts = {}) {
      const mag = Math.hypot(dx, dy);
      if (mag < 2) return;
      const x1 = x0 + dx;
      const y1 = y0 + dy;
      const angle = Math.atan2(dy, dx);
      const headLen = Math.min(10, Math.max(6, mag * 0.25));

      targetCtx.save();
      targetCtx.strokeStyle = color;
      targetCtx.fillStyle = color;
      targetCtx.lineWidth = 2.3;
      targetCtx.lineCap = 'round';

      targetCtx.beginPath();
      targetCtx.moveTo(x0, y0);
      targetCtx.lineTo(x1, y1);
      targetCtx.stroke();

      targetCtx.beginPath();
      targetCtx.moveTo(x1, y1);
      targetCtx.lineTo(x1 - headLen * Math.cos(angle - Math.PI / 6), y1 - headLen * Math.sin(angle - Math.PI / 6));
      targetCtx.lineTo(x1 - headLen * Math.cos(angle + Math.PI / 6), y1 - headLen * Math.sin(angle + Math.PI / 6));
      targetCtx.closePath();
      targetCtx.fill();

      if (label) {
        targetCtx.font = '700 10px "IBM Plex Mono", monospace';
        targetCtx.textAlign = 'left';
        targetCtx.textBaseline = 'alphabetic';

        const textW = targetCtx.measureText(label).width;
        const align = opts.align || (dx >= 0 ? 'right' : 'left');
        let lx = align === 'left'
          ? x1 - textW - 7
          : align === 'center'
            ? x1 - textW / 2
            : x1 + 7;
        let ly = y1 + (opts.offsetY !== undefined ? opts.offsetY : (dy >= 0 ? 11 : -4));

        if (opts.boundsW && opts.boundsH) {
          lx = Math.max(6, Math.min(opts.boundsW - textW - 6, lx));
          ly = Math.max(14, Math.min(opts.boundsH - 6, ly));
        }

        targetCtx.fillStyle = 'rgba(243, 234, 214, 0.96)';
        targetCtx.fillRect(lx - 3, ly - 9, textW + 6, 12);
        targetCtx.strokeStyle = 'rgba(43, 36, 27, 0.35)';
        targetCtx.lineWidth = 1;
        targetCtx.strokeRect(lx - 3, ly - 9, textW + 6, 12);

        targetCtx.fillStyle = color;
        targetCtx.fillText(label, lx, ly);
      }
      targetCtx.restore();
    }

    function drawCoMMarker(targetCtx, cx, cy, r = 6.5) {
      targetCtx.save();
      targetCtx.translate(cx, cy);
      targetCtx.beginPath();
      targetCtx.arc(0, 0, r, 0, Math.PI * 2);
      targetCtx.fillStyle = '#e8b931';
      targetCtx.fill();
      targetCtx.lineWidth = 1.5;
      targetCtx.strokeStyle = '#2b241b';
      targetCtx.stroke();

      targetCtx.fillStyle = '#2b241b';
      targetCtx.beginPath();
      targetCtx.moveTo(0, 0);
      targetCtx.arc(0, 0, r, 0, Math.PI / 2);
      targetCtx.closePath();
      targetCtx.fill();

      targetCtx.beginPath();
      targetCtx.moveTo(0, 0);
      targetCtx.arc(0, 0, r, Math.PI, Math.PI * 1.5);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.restore();
    }

    function drawCoLMarker(targetCtx, cx, cy, r = 5.5) {
      targetCtx.save();
      targetCtx.translate(cx, cy);
      targetCtx.rotate(Math.PI / 4);
      targetCtx.fillStyle = '#255c85';
      targetCtx.strokeStyle = '#f3ead6';
      targetCtx.lineWidth = 1.5;
      targetCtx.fillRect(-r, -r, r * 2, r * 2);
      targetCtx.strokeRect(-r, -r, r * 2, r * 2);
      targetCtx.restore();
    }

    /**
     * Renders a single material pixel, including live propellant drain visualization
     * inside Liquid Fuel Tank and Solid Fuel Tank pixels.
     */
    function drawCraftPixel(targetCtx, px, py, size, cell, fuelFillFrac) {
      const matId = cell.matId;
      if (matId === 'liquid_tank' || matId === 'solid_tank') {
        const fill = fuelFillFrac !== undefined ? fuelFillFrac : 1.0;
        targetCtx.fillStyle = matId === 'liquid_tank' ? '#24343d' : '#3a2d24';
        targetCtx.fillRect(px, py, size, size);

        if (fill > 0.01) {
          const fillH = size * fill;
          targetCtx.fillStyle = cell.color;
          targetCtx.fillRect(px, py + (size - fillH), size, fillH);
        }
        if (size >= 6) {
          targetCtx.strokeStyle = 'rgba(43, 36, 27, 0.28)';
          targetCtx.lineWidth = 0.8;
          targetCtx.strokeRect(px + 0.4, py + 0.4, size - 0.8, size - 0.8);
        }
      } else {
        targetCtx.fillStyle = cell.color;
        targetCtx.fillRect(px, py, size, size);
      }
    }

    function renderBuildCanvas() {
      const rect = viewportEl.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;

      // 1. Aged Parchment Desk Background
      ctx.fillStyle = '#e8dcc4';
      ctx.fillRect(0, 0, W, H);

      const gx0 = Math.round(state.panX);
      const gy0 = Math.round(state.panY);
      const z = state.zoom;
      const sheetW = state.cols * z;
      const sheetH = state.rows * z;

      // 2. Crisp Parchment Drafting Sheet (#f3ead6) with Ink Border & Offset Shadow
      ctx.fillStyle = 'rgba(43, 36, 27, 0.14)';
      ctx.fillRect(gx0 + 5, gy0 + 5, sheetW, sheetH);

      ctx.fillStyle = '#f3ead6';
      ctx.fillRect(gx0, gy0, sheetW, sheetH);

      // 3. Minor (1x1) and Major (8x8) Blueprint Grid Lines
      if (state.showGrid) {
        if (z >= 6) {
          ctx.strokeStyle = '#dfd3bc';
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let x = 1; x < state.cols; x++) {
            if (x % 8 === 0) continue;
            const px = Math.round(gx0 + x * z) + 0.5;
            ctx.moveTo(px, gy0);
            ctx.lineTo(px, gy0 + sheetH);
          }
          for (let y = 1; y < state.rows; y++) {
            if (y % 8 === 0) continue;
            const py = Math.round(gy0 + y * z) + 0.5;
            ctx.moveTo(gx0, py);
            ctx.lineTo(gx0 + sheetW, py);
          }
          ctx.stroke();
        }

        // Major 8x8 Blueprint Grid Lines (#c9b99a)
        ctx.strokeStyle = '#c9b99a';
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        for (let x = 8; x < state.cols; x += 8) {
          const px = Math.round(gx0 + x * z) + 0.5;
          ctx.moveTo(px, gy0);
          ctx.lineTo(px, gy0 + sheetH);
        }
        for (let y = 8; y < state.rows; y += 8) {
          const py = Math.round(gy0 + y * z) + 0.5;
          ctx.moveTo(gx0, py);
          ctx.lineTo(gx0 + sheetW, py);
        }
        ctx.stroke();
      }

      // 4. Coordinate Rulers along Top & Left Blueprint Margins
      ctx.fillStyle = '#635645';
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      for (let x = 0; x <= state.cols; x += 8) {
        ctx.fillText(String(x), gx0 + x * z, gy0 - 5);
      }
      ctx.textAlign = 'right';
      for (let y = 0; y <= state.rows; y += 8) {
        ctx.fillText(String(y), gx0 - 5, gy0 + y * z + 3);
      }

      // 5. Mirror Symmetry Vertical Centerline Indicator
      if (state.mirrorX) {
        const midX = gx0 + (state.cols / 2) * z;
        ctx.save();
        ctx.strokeStyle = '#b83a2d';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(midX, gy0 - 8);
        ctx.lineTo(midX, gy0 + sheetH + 8);
        ctx.stroke();
        ctx.restore();
      }

      // 6. Render All Painted Pixels (with live fuel fill preview)
      const phys = state.physics;
      for (let y = 0; y < state.rows; y++) {
        const row = state.grid[y];
        if (!row) continue;
        for (let x = 0; x < state.cols; x++) {
          const cell = row[x];
          if (!cell) continue;
          const fillFrac = phys?.pixelFuelFill?.get(`${x},${y}`);
          drawCraftPixel(ctx, gx0 + x * z, gy0 + y * z, z, cell, fillFrac);
        }
      }

      // 7. Render Active Tool Hover / Drag Ghost Preview
      if (state.hoverCell && !state.isPanning) {
        const hx = state.hoverCell.x;
        const hy = state.hoverCell.y;

        if (state.tool === 'stamp' && state.activeStamp) {
          const st = state.activeStamp;
          const sx = hx - Math.floor(st.width / 2);
          const sy = hy - Math.floor(st.height / 2);
          ctx.save();
          ctx.globalAlpha = 0.72;
          for (let r = 0; r < st.height; r++) {
            const stampRow = st.pixels[r];
            if (!stampRow) continue;
            for (let c = 0; c < st.width; c++) {
              const p = stampRow[c];
              if (!p) continue;
              const gx = sx + c;
              const gy = sy + r;
              if (gx >= 0 && gx < state.cols && gy >= 0 && gy < state.rows) {
                ctx.fillStyle = p[1];
                ctx.fillRect(gx0 + gx * z, gy0 + gy * z, z, z);
              }
              if (state.mirrorX) {
                const mx = state.cols - 1 - gx;
                if (mx >= 0 && mx < state.cols && gy >= 0 && gy < state.rows) {
                  ctx.fillStyle = p[1];
                  ctx.fillRect(gx0 + mx * z, gy0 + gy * z, z, z);
                }
              }
            }
          }
          ctx.restore();
        } else if (state.isDrawing && state.dragStartCell && (state.tool === 'line' || state.tool === 'box')) {
          ctx.save();
          ctx.globalAlpha = 0.65;
          ctx.fillStyle = state.activeColor;
          const previewPts = state.tool === 'line'
            ? getLineCells(state.dragStartCell.x, state.dragStartCell.y, hx, hy)
            : (() => {
                const arr = [];
                const xMin = Math.min(state.dragStartCell.x, hx);
                const xMax = Math.max(state.dragStartCell.x, hx);
                const yMin = Math.min(state.dragStartCell.y, hy);
                const yMax = Math.max(state.dragStartCell.y, hy);
                for (let yy = yMin; yy <= yMax; yy++) {
                  for (let xx = xMin; xx <= xMax; xx++) arr.push({ x: xx, y: yy });
                }
                return arr;
              })();

          for (const pt of previewPts) {
            if (pt.x >= 0 && pt.x < state.cols && pt.y >= 0 && pt.y < state.rows) {
              ctx.fillRect(gx0 + pt.x * z, gy0 + pt.y * z, z, z);
            }
            if (state.mirrorX) {
              const mx = state.cols - 1 - pt.x;
              if (mx >= 0 && mx < state.cols && pt.y >= 0 && pt.y < state.rows) {
                ctx.fillRect(gx0 + mx * z, gy0 + pt.y * z, z, z);
              }
            }
          }
          ctx.restore();
        } else if (hx >= 0 && hx < state.cols && hy >= 0 && hy < state.rows && state.tool !== 'pan') {
          const half = Math.floor((state.brushSize - 1) / 2);
          const bx = hx - half;
          const by = hy - half;
          ctx.save();
          ctx.strokeStyle = state.tool === 'eraser' ? '#b83a2d' : '#2b241b';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(gx0 + bx * z, gy0 + by * z, state.brushSize * z, state.brushSize * z);
          ctx.restore();
        }
      }

      // 8. Blueprint Outer Border
      ctx.strokeStyle = '#2b241b';
      ctx.lineWidth = 1.75;
      ctx.strokeRect(gx0, gy0, sheetW, sheetH);
    }

    /**
     * ============================================================================
     * 8. SEPARATE MINIMIZABLE "APPLIED FORCES & FBD" DIAGRAM RENDERER
     * ============================================================================
     */
    const fbdCanvas = document.getElementById('fbd-diagram-canvas');
    const fbdCtx = fbdCanvas.getContext('2d');

    function renderDedicatedFBDCanvas(phys) {
      if (state.fbdMinimized || !fbdCanvas) return;
      const rect = fbdCanvas.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10) return;

      const dpr = window.devicePixelRatio || 1;
      fbdCanvas.width = Math.floor(rect.width * dpr);
      fbdCanvas.height = Math.floor(rect.height * dpr);
      fbdCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const W = rect.width;
      const H = rect.height;

      fbdCtx.fillStyle = '#f3ead6';
      fbdCtx.fillRect(0, 0, W, H);

      fbdCtx.strokeStyle = '#dfd3bc';
      fbdCtx.lineWidth = 1;
      fbdCtx.beginPath();
      for (let x = 16; x < W; x += 16) {
        fbdCtx.moveTo(x, 0);
        fbdCtx.lineTo(x, H);
      }
      for (let y = 16; y < H; y += 16) {
        fbdCtx.moveTo(0, y);
        fbdCtx.lineTo(W, y);
      }
      fbdCtx.stroke();

      const cx = Math.round(W * 0.48);
      const cy = Math.round(H * 0.50);
      fbdCtx.strokeStyle = '#c9b99a';
      fbdCtx.setLineDash([4, 3]);
      fbdCtx.beginPath();
      fbdCtx.moveTo(cx, 8);
      fbdCtx.lineTo(cx, H - 8);
      fbdCtx.moveTo(8, cy);
      fbdCtx.lineTo(W - 8, cy);
      fbdCtx.stroke();
      fbdCtx.setLineDash([]);

      if (!phys || phys.pixelCount === 0) {
        fbdCtx.fillStyle = '#635645';
        fbdCtx.font = '600 11px "IBM Plex Mono", monospace';
        fbdCtx.textAlign = 'center';
        fbdCtx.fillText('NO CRAFT PIXELS ON SHEET', W / 2, H / 2);
        return;
      }

      const b = phys.bounds;
      const spanX = Math.max(4, b.maxX - b.minX + 1);
      const spanY = Math.max(4, b.maxY - b.minY + 1);
      const pxScale = Math.max(2.5, Math.min(6.0, Math.min((W * 0.30) / spanX, (H * 0.52) / spanY)));

      const pitch = state.mode === 'sim' ? sim.pitch : 0;

      fbdCtx.save();
      fbdCtx.translate(cx, cy);
      fbdCtx.rotate(pitch);

      for (let y = b.minY; y <= b.maxY; y++) {
        const row = activeGrid()[y];
        if (!row) continue;
        for (let x = b.minX; x <= b.maxX; x++) {
          const cell = row[x];
          if (!cell) continue;
          const rx = (x - phys.com.x) * pxScale;
          const ry = (y - phys.com.y) * pxScale;
          const fillFrac = phys.pixelFuelFill?.get(`${x},${y}`);
          drawCraftPixel(fbdCtx, rx, ry, pxScale, cell, fillFrac);
        }
      }

      const colRelX = (phys.col.x - phys.com.x) * pxScale;
      const colRelY = (phys.col.y - phys.com.y) * pxScale;
      const thrRelX = (phys.thrustCenter.x - phys.com.x) * pxScale;
      const thrRelY = (phys.thrustCenter.y - phys.com.y) * pxScale;

      if (phys.totalThrustN > 0) {
        const tLen = Math.min(56, Math.max(18, phys.totalThrustN * 0.016));
        drawArrowVector(fbdCtx, thrRelX, thrRelY, 0, -tLen, '#246b50', `T=${phys.totalThrustN.toFixed(0)}N`, {
          align: 'right',
          offsetY: 3
        });
      } else {
        fbdCtx.fillStyle = '#b83a2d';
        fbdCtx.font = '700 9px "IBM Plex Mono", monospace';
        fbdCtx.textAlign = 'center';
        fbdCtx.fillText('T=0N (NO FUEL)', thrRelX, thrRelY + 14);
      }

      drawCoLMarker(fbdCtx, colRelX, colRelY, 4.5);
      fbdCtx.restore();

      const labelBounds = { boundsW: W, boundsH: H };

      const wLen = Math.min(56, Math.max(18, phys.weightN * 0.022));
      drawArrowVector(fbdCtx, cx, cy, 0, wLen, '#b83a2d', `W=${phys.weightN.toFixed(0)}N`, {
        align: 'left',
        offsetY: 4,
        ...labelBounds
      });

      if (phys.dragN > 0.2) {
        const dLen = Math.min(52, Math.max(16, phys.dragN * 0.05));
        drawArrowVector(fbdCtx, cx - 6, cy, -dLen * 0.65, dLen * 0.75, '#b36b1d', `D=${phys.dragN.toFixed(1)}N`, {
          align: 'left',
          offsetY: 3,
          ...labelBounds
        });
      }

      if (phys.frictionN > 0.1) {
        const fLen = Math.min(50, Math.max(16, phys.frictionN * 0.13));
        drawArrowVector(fbdCtx, cx + 6, cy + 4, fLen * 0.65, fLen * 0.75, '#6b3fa0', `Ff=${phys.frictionN.toFixed(1)}N`, {
          align: 'right',
          offsetY: 4,
          ...labelBounds
        });
      }

      if (phys.liftN > 0.2) {
        const lLen = Math.min(52, Math.max(16, phys.liftN * 0.045));
        drawArrowVector(fbdCtx, cx + 6, cy - 6, lLen * 0.85, -lLen * 0.52, '#255c85', `L=${phys.liftN.toFixed(1)}N`, {
          align: 'right',
          offsetY: 2,
          ...labelBounds
        });
      }

      drawCoMMarker(fbdCtx, cx, cy, 6);
    }

    /**
     * ============================================================================
     * 9. INTERACTIVE 2D FLIGHT TEST & WIND TUNNEL SIMULATION ENGINE
     * ============================================================================
     */
    const sim = {
      active: false,
      windTunnel: false,
      ignited: false,
      throttle: 0,
      armLiquid: true,
      armSolid: true,
      solidLit: false,
      liquidFuelFrac: 1.0,
      solidFuelFrac: 1.0,
      grid: null,          // working copy of the craft (stages get removed from it)
      stageNum: 1,
      timeWarp: 1,
      x: 0, y: 0, vx: 0, vy: 0,
      pitch: 0, omega: 0,
      maxAlt: 0, maxQ: 0, maxSpeed: 0, tumbled: false,
      keyPitchLeft: false,
      keyPitchRight: false,
      sas: true,           // autopilot "pitch hold" (like real launch-vehicle guidance)
      targetPitch: 0,
      particles: [],
      debris: [],
      lastPhys: null
    };

    function activeGrid() {
      return (state.mode === 'sim' && sim.grid) ? sim.grid : state.grid;
    }

    function resetSimulation(refuel = false) {
      sim.x = 0; sim.y = 0; sim.vx = 0; sim.vy = 0;
      sim.pitch = 0; sim.omega = 0; sim.targetPitch = 0;
      sim.ignited = false; sim.solidLit = false; sim.throttle = 0;
      sim.particles = []; sim.debris = [];
      sim.grid = cloneGrid(state.grid);
      sim.stageNum = 1;
      sim.maxAlt = 0; sim.maxQ = 0; sim.maxSpeed = 0; sim.tumbled = false;
      sim.liquidFuelFrac = refuel ? 1.0 : (state.testFuelPercent / 100);
      sim.solidFuelFrac = refuel ? 1.0 : (state.testFuelPercent / 100);
      if (refuel) {
        state.testFuelPercent = 100;
        document.getElementById('slider-test-fuel').value = 100;
        document.getElementById('fbd-test-fuel-label').textContent = '100%';
      }
      document.getElementById('sim-throttle-slider').value = 0;
      document.getElementById('sim-throttle-val').textContent = '0%';
      document.getElementById('btn-sim-launch').innerHTML = `${pxIcon('fire')} IGNITION [SPACE]`;
      recalculateAndRefreshUI();
    }

    /** Drop the bottom stage (everything at or below the lowest decoupler row). */
    function performStaging() {
      if (state.mode !== 'sim' || !sim.grid) return;
      const sep = getSeparationRows(sim.grid, state.cols, state.rows);
      if (sep.length === 0) { showToast('No decoupler row left — this is the final stage.'); return; }
      const cut = sep[0];
      const phys = sim.lastPhys;
      const dropped = [];
      for (let y = cut; y < state.rows; y++) {
        for (let x = 0; x < state.cols; x++) {
          const cell = sim.grid[y][x];
          if (cell) { dropped.push({ x, y, color: cell.color }); sim.grid[y][x] = null; }
        }
      }
      if (phys && dropped.length) {
        sim.debris.push({ cells: dropped, comX: phys.com.x, comY: phys.com.y, x: sim.x, y: sim.y, vx: sim.vx * 0.98, vy: sim.vy - 2, pitch: sim.pitch, omega: (Math.random() - 0.5) * 0.6, life: 0 });
      }
      sim.liquidFuelFrac = 1.0;
      sim.solidFuelFrac = 1.0;
      sim.solidLit = false;
      sim.stageNum++;
      showToast(`STAGE SEPARATION — stage ${sim.stageNum} active (${dropped.length} px dropped)`);
    }

    function stepSimulation(dt) {
      const safeDt = Math.min(0.05, dt);
      const grid = sim.grid || state.grid;

      const vMag = Math.hypot(sim.vx, sim.vy);
      const speed = sim.windTunnel ? Math.max(75, vMag) : vMag;
      // Angle of attack = body pitch minus flight-path direction (both measured from vertical)
      const flightPath = (vMag > 3 && !sim.windTunnel) ? Math.atan2(sim.vx, sim.vy) : 0;
      let aoa = sim.pitch - flightPath;
      aoa = Math.atan2(Math.sin(aoa), Math.cos(aoa));

      const solidShouldBurn = sim.ignited && sim.armSolid && (sim.solidLit || sim.throttle > 0.05) && sim.solidFuelFrac > 0;
      if (solidShouldBurn) sim.solidLit = true;

      const phys = computeCraftPhysics(grid, state.cols, state.rows, {
        liquidFrac: sim.liquidFuelFrac,
        solidFrac: sim.solidFuelFrac,
        airspeed: speed,
        pitchRad: sim.pitch,
        aoaRad: aoa,
        altitude: sim.windTunnel ? 0 : sim.y,
        throttle: sim.ignited ? sim.throttle : 0,
        armLiquid: sim.armLiquid,
        armSolid: sim.armSolid,
        solidActive: sim.solidLit
      });
      state.physics = phys;
      sim.lastPhys = phys;
      if (phys.pixelCount === 0) return;

      // Propellant consumption: ṁ = T / (Isp · g₀)
      if (phys.liquidThrustN > 0 && phys.liquidFuelMaxKg > 0) {
        const burnKg = (phys.liquidThrustN / (ISP.liquid * G0)) * safeDt;
        sim.liquidFuelFrac = Math.max(0, phys.liquidFuelCurKg - burnKg) / phys.liquidFuelMaxKg;
      }
      if (phys.solidThrustN > 0 && phys.solidFuelMaxKg > 0) {
        const burnKg = (phys.solidThrustN / (ISP.solid * G0)) * safeDt;
        sim.solidFuelFrac = Math.max(0, phys.solidFuelCurKg - burnKg) / phys.solidFuelMaxKg;
        if (sim.solidFuelFrac <= 0.0001) { sim.solidFuelFrac = 0; sim.solidLit = false; }
      }

      // Exhaust particles (only from thrusters that have fuel)
      if (phys.totalThrustN > 0 && sim.particles.length < 900) {
        for (const tp of phys.thrusterPixels) {
          const canFire = (tp.type === 'liquid' && phys.liquidThrustN > 0) || (tp.type === 'solid' && phys.solidThrustN > 0);
          if (!canFire) continue;
          if (Math.random() > (tp.type === 'solid' ? 0.5 : 0.4)) continue;
          const relX = (tp.x - phys.com.x) * 0.25;
          const relY = (tp.y - phys.com.y) * 0.25;
          const cosP = Math.cos(sim.pitch), sinP = Math.sin(sim.pitch);
          const worldX = sim.x + relX * cosP - relY * sinP;
          const worldY = sim.y - (relX * sinP + relY * cosP);
          const exhaustSpeed = tp.type === 'solid' ? 60 : 45;
          const spread = (Math.random() - 0.5) * (tp.type === 'solid' ? 0.35 : 0.22);
          const dirAngle = sim.pitch + spread;
          sim.particles.push({
            x: worldX, y: worldY,
            vx: sim.vx - Math.sin(dirAngle) * exhaustSpeed,
            vy: sim.vy - Math.cos(dirAngle) * exhaustSpeed,
            life: 0, maxLife: tp.type === 'solid' ? 0.42 : 0.32,
            size: tp.type === 'solid' ? 4.2 : 3.4, type: tp.type
          });
        }
      }
      for (let i = sim.particles.length - 1; i >= 0; i--) {
        const p = sim.particles[i];
        p.life += safeDt;
        if (p.life >= p.maxLife) { sim.particles.splice(i, 1); continue; }
        p.x += p.vx * safeDt; p.y += p.vy * safeDt;
      }
      for (let i = sim.debris.length - 1; i >= 0; i--) {
        const d = sim.debris[i];
        d.life += safeDt;
        d.vy -= 9.81 * safeDt;
        d.x += d.vx * safeDt; d.y += d.vy * safeDt; d.pitch += d.omega * safeDt;
        if (d.life > 12 || d.y < -50) sim.debris.splice(i, 1);
      }

      // ---- Rotational dynamics (real units: N·m and kg·m²)
      const I = phys.inertiaKgM2;
      const leverM = Math.max(0.25, (phys.thrustCenter.y - phys.com.y) * 0.25);
      let torque = 0;
      // Engine gimbal (±4°) — needs thrust to steer. With SAS on, keys move the target pitch
      // and a PD controller drives the gimbal; with SAS off, keys drive the gimbal directly.
      const keyInput = (sim.keyPitchRight ? 1 : 0) - (sim.keyPitchLeft ? 1 : 0);
      let gimbal = keyInput;
      if (sim.sas) {
        sim.targetPitch = Math.max(-1.4, Math.min(1.4, sim.targetPitch + keyInput * 0.5 * safeDt));
        let err = sim.pitch - sim.targetPitch;
        err = Math.atan2(Math.sin(err), Math.cos(err));
        gimbal = Math.max(-1, Math.min(1, -(4 * err + 2.5 * sim.omega)));
      }
      torque += gimbal * phys.totalThrustN * Math.sin(4 * Math.PI / 180) * leverM;
      // Small reaction-control authority so you can still turn with engines off
      torque += gimbal * 0.02 * I;
      // Off-axis thrust: engines not centred under the CoM spin the craft
      const thrustArmM = (phys.thrustCenter.x - phys.com.x) * 0.25;
      torque -= phys.totalThrustN * thrustArmM;
      // Aerodynamic stability: CoL behind CoM (larger y) → restoring torque; ahead → flips you
      const stabilityArmM = (phys.col.y - phys.com.y) * 0.25;
      if (speed > 3) {
        const normalForce = phys.q * (phys.refAreaM2 + phys.wingAreaM2) * 2.0 * Math.sin(aoa);
        torque -= normalForce * stabilityArmM;
        // aerodynamic pitch damping
        torque -= sim.omega * phys.q * (phys.refAreaM2 + phys.wingAreaM2) * 0.5 * Math.max(0.5, Math.abs(stabilityArmM)) * 0.5;
      }
      torque -= sim.omega * 0.15 * I; // structural/RCS damping
      sim.omega += (torque / I) * safeDt;
      sim.omega = Math.max(-6, Math.min(6, sim.omega));
      sim.pitch += sim.omega * safeDt;
      sim.pitch = Math.atan2(Math.sin(sim.pitch), Math.cos(sim.pitch));
      if (Math.abs(aoa) > 1.2 && speed > 60 && !sim.windTunnel) sim.tumbled = true;

      // ---- Translational dynamics
      const sinP = Math.sin(sim.pitch), cosP = Math.cos(sim.pitch);
      const thrustX = phys.totalThrustN * sinP;
      const thrustY = phys.totalThrustN * cosP;
      const weightY = -phys.weightN;
      const resistN = phys.dragN + phys.frictionN;
      let dragX = 0, dragY = 0, liftX = 0, liftY = 0;
      if (speed > 0.05) {
        const vxUnit = sim.windTunnel ? 0 : sim.vx / speed;
        const vyUnit = sim.windTunnel ? 1 : sim.vy / speed;
        dragX = -vxUnit * resistN;
        dragY = -vyUnit * resistN;
        // lift acts perpendicular to the velocity, toward the side the nose points
        const side = Math.sign(aoa) || 0;
        liftX = vyUnit * phys.liftN * side;
        liftY = -vxUnit * phys.liftN * side;
      }
      const netFx = thrustX + dragX + liftX;
      const netFy = thrustY + weightY + dragY + liftY;

      if (!sim.windTunnel) {
        const ax = netFx / Math.max(1, phys.currentMass);
        const ay = netFy / Math.max(1, phys.currentMass);
        sim.vx += ax * safeDt; sim.vy += ay * safeDt;
        sim.x += sim.vx * safeDt; sim.y += sim.vy * safeDt;
        if (sim.y <= 0) {
          sim.y = 0;
          if (sim.vy < 0) sim.vy = 0;
          sim.vx *= 0.85;
          sim.pitch *= 0.90;
          sim.omega *= 0.5;
        }
        sim.maxAlt = Math.max(sim.maxAlt, sim.y);
        sim.maxQ = Math.max(sim.maxQ, phys.q);
        sim.maxSpeed = Math.max(sim.maxSpeed, vMag);
      } else {
        sim.x = 0; sim.y = 150; sim.vx = 0; sim.vy = 0;
      }
      sim.aoa = aoa;
    }

    function updateSimHUD(phys, speed) {
      const fmtAlt = (m) => m >= 10000 ? `${(m / 1000).toFixed(2)} km` : `${m.toFixed(1)} m`;
      document.getElementById('sim-alt').textContent = fmtAlt(sim.y);
      document.getElementById('sim-vel').textContent = `${speed.toFixed(1)} m/s (Mach ${(speed / 340).toFixed(2)})`;
      document.getElementById('sim-vspd').textContent = `${sim.vy.toFixed(1)} m/s`;
      document.getElementById('sim-pitch').textContent = `${(sim.pitch * 180 / Math.PI).toFixed(1)}° / ${((sim.aoa || 0) * 180 / Math.PI).toFixed(1)}°`;
      document.getElementById('sim-q').textContent = `${(phys.q / 1000).toFixed(2)} kPa (max ${(sim.maxQ / 1000).toFixed(1)})`;
      document.getElementById('sim-mass-live').textContent = `${phys.currentMass.toFixed(1)} / ${phys.dryMass.toFixed(1)} kg`;
      const stEl = document.getElementById('sim-stage-readout');
      if (stEl) stEl.textContent = `STAGE ${sim.stageNum} of ${sim.stageNum + (phys.sepRows ? phys.sepRows.length : 0)} • max alt ${fmtAlt(sim.maxAlt)}`;

      const liqPct = phys.liquidFuelMaxKg > 0 ? Math.round((phys.liquidFuelCurKg / phys.liquidFuelMaxKg) * 100) : 0;
      const solPct = phys.solidFuelMaxKg > 0 ? Math.round((phys.solidFuelCurKg / phys.solidFuelMaxKg) * 100) : 0;
      document.getElementById('sim-liq-text').textContent = `${phys.liquidFuelCurKg.toFixed(1)} kg (${liqPct}%)`;
      document.getElementById('sim-liq-bar').style.width = `${liqPct}%`;
      document.getElementById('sim-sol-text').textContent = `${phys.solidFuelCurKg.toFixed(1)} kg (${solPct}%)`;
      document.getElementById('sim-sol-bar').style.width = `${solPct}%`;

      const alertEl = document.getElementById('sim-fuel-alert');
      const missingLiq = phys.liquidThrusterCount > 0 && !phys.hasLiquidFuel;
      const missingSol = phys.solidThrusterCount > 0 && !phys.hasSolidFuel;
      const canStage = phys.sepRows && phys.sepRows.length > 0;
      if (sim.tumbled) {
        alertEl.classList.remove('hidden');
        alertEl.innerHTML = `${pxIcon('warning')} LOSS OF CONTROL — craft tumbled. Is the Center of Lift ${COL_MARK} below the Center of Mass ${COM_MARK}? Add fins low.`;
      } else if ((missingLiq || missingSol) && canStage && phys.totalThrustN === 0) {
        alertEl.classList.remove('hidden');
        alertEl.innerHTML = `${pxIcon('warning')} STAGE EMPTY — press STAGE [G] to drop it and light the next stage`;
      } else if (missingLiq && missingSol) {
        alertEl.classList.remove('hidden');
        alertEl.innerHTML = `${pxIcon('warning')} ALL PROPELLANT EXHAUSTED — THRUSTERS OFFLINE`;
      } else if (missingSol && sim.armSolid && phys.solidThrusterCount > 0) {
        alertEl.classList.remove('hidden');
        alertEl.innerHTML = `${pxIcon('warning')} SOLID FUEL 0% — SOLID MOTORS BURNED OUT`;
      } else if (missingLiq && sim.armLiquid && phys.liquidThrusterCount > 0) {
        alertEl.classList.remove('hidden');
        alertEl.innerHTML = `${pxIcon('warning')} LIQUID FUEL 0% — LIQUID ENGINES SHUT OFF`;
      } else {
        alertEl.classList.add('hidden');
      }

      const badge = document.getElementById('sim-status-badge');
      if (sim.windTunnel) { badge.textContent = 'WIND TUNNEL'; badge.className = 'text-[#255c85]'; }
      else if (sim.tumbled) { badge.textContent = 'TUMBLING'; badge.className = 'text-[#b83a2d]'; }
      else if (phys.totalThrustN > 0) { badge.textContent = 'BURN ACTIVE'; badge.className = 'text-[#b83a2d]'; }
      else if (sim.y > 0.5) { badge.textContent = 'COASTING'; badge.className = 'text-[#b36b1d]'; }
      else { badge.textContent = 'PAD READY'; badge.className = 'text-[#246b50]'; }
    }

    function niceStep(raw) {
      const p = Math.pow(10, Math.floor(Math.log10(Math.max(1e-6, raw))));
      const n = raw / p;
      return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * p;
    }

    function renderSimCanvas() {
      const rect = viewportEl.getBoundingClientRect();
      const W = rect.width, H = rect.height;

      // Sky darkens with altitude (parchment → dusk → space)
      const t = Math.min(1, sim.y / 60000);
      const lerp = (a, b) => Math.round(a + (b - a) * t);
      ctx.fillStyle = `rgb(${lerp(239, 30)}, ${lerp(228, 28)}, ${lerp(204, 46)})`;
      ctx.fillRect(0, 0, W, H);
      if (t > 0.4) { // stars
        ctx.fillStyle = `rgba(243,234,214,${(t - 0.4) * 1.4})`;
        for (let i = 0; i < 60; i++) ctx.fillRect((i * 97.3) % W, (i * 53.7 + i * i) % H, 1.5, 1.5);
      }

      // Camera zooms out as the craft climbs so speed stays readable
      const pxPerMeter = 6.5 / (1 + sim.y / 120);
      const camWorldX = sim.x;
      const camWorldY = Math.max(18 / (1 + sim.y / 120), sim.y + 12 / (1 + sim.y / 600));
      const worldToScreen = (wx, wy) => ({ sx: W / 2 + (wx - camWorldX) * pxPerMeter, sy: H * 0.65 - (wy - camWorldY) * pxPerMeter });

      const viewHalfM = (H / pxPerMeter);
      const gridStepM = niceStep(viewHalfM / 5);
      const startM = Math.floor((camWorldY - viewHalfM) / gridStepM) * gridStepM;
      const endM = Math.ceil((camWorldY + viewHalfM) / gridStepM) * gridStepM;
      ctx.strokeStyle = t > 0.5 ? 'rgba(243,234,214,0.12)' : 'rgba(43, 36, 27, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let m = Math.max(0, startM); m <= endM; m += gridStepM) {
        const pt = worldToScreen(0, m);
        ctx.moveTo(0, pt.sy); ctx.lineTo(W, pt.sy);
      }
      ctx.stroke();
      ctx.fillStyle = t > 0.5 ? '#d8cdb5' : '#635645';
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'left';
      for (let m = Math.max(0, startM); m <= endM; m += gridStepM) {
        const pt = worldToScreen(0, m);
        ctx.fillText(m >= 1000 ? `${(m / 1000).toFixed(m % 1000 ? 1 : 0)} km` : `${m}m`, 10, pt.sy - 3);
      }

      const groundPt = worldToScreen(0, 0);
      if (groundPt.sy < H + 40) {
        ctx.fillStyle = '#d8c8a8';
        ctx.fillRect(0, groundPt.sy, W, H - groundPt.sy + 40);
        ctx.strokeStyle = '#2b241b';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, groundPt.sy); ctx.lineTo(W, groundPt.sy); ctx.stroke();
        const padPt = worldToScreen(0, 0);
        ctx.fillStyle = '#635645';
        ctx.fillRect(padPt.sx - 28, padPt.sy - 4, 56, 6);
        ctx.strokeStyle = '#2b241b'; ctx.lineWidth = 1.5;
        ctx.strokeRect(padPt.sx - 22, padPt.sy - 68 * Math.min(1, pxPerMeter / 6.5), 8, 64 * Math.min(1, pxPerMeter / 6.5));
      }

      for (const p of sim.particles) {
        const pt = worldToScreen(p.x, p.y);
        const alpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.type === 'solid' ? (p.life < 0.14 ? '#fff3b0' : '#e07a2d') : (p.life < 0.12 ? '#a8e6ff' : '#4a90e2');
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, p.size * (0.6 + p.life * 1.4), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      const cellPx = 4.2;
      for (const d of sim.debris) {
        const pt = worldToScreen(d.x, d.y);
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - d.life / 12);
        ctx.translate(pt.sx, pt.sy);
        ctx.rotate(d.pitch);
        for (const c of d.cells) {
          ctx.fillStyle = c.color;
          ctx.fillRect((c.x - d.comX) * cellPx, (c.y - d.comY) * cellPx, cellPx, cellPx);
        }
        ctx.restore();
      }

      const phys = state.physics;
      const grid = sim.grid || state.grid;
      if (phys && phys.pixelCount > 0) {
        const craftPt = worldToScreen(sim.x, sim.y);
        ctx.save();
        ctx.translate(craftPt.sx, craftPt.sy);
        ctx.rotate(sim.pitch);
        for (let y = 0; y < state.rows; y++) {
          const row = grid[y];
          if (!row) continue;
          for (let x = 0; x < state.cols; x++) {
            const cell = row[x];
            if (!cell) continue;
            const fillFrac = phys.pixelFuelFill?.get(`${x},${y}`);
            drawCraftPixel(ctx, (x - phys.com.x) * cellPx, (y - phys.com.y) * cellPx, cellPx, cell, fillFrac);
          }
        }
        // CoM and CoL markers right on the craft (stability lesson)
        drawCoMMarker(ctx, 0, 0, 4);
        drawCoLMarker(ctx, (phys.col.x - phys.com.x) * cellPx, (phys.col.y - phys.com.y) * cellPx, 3.5);
        ctx.restore();
      }

      // Time warp badge
      if (sim.timeWarp > 1) {
        ctx.fillStyle = '#b83a2d';
        ctx.font = '700 12px "IBM Plex Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`TIME WARP ${sim.timeWarp}×`, W / 2, 70);
      }
    }

    /**
     * ============================================================================
     * 10. UI SYNCHRONIZATION & DYNAMIC PANELS RENDERING
     * ============================================================================
     */
    function recalculateAndRefreshUI() {
      const isSim = state.mode === 'sim';
      const grid = (isSim && sim.grid) ? sim.grid : state.grid;
      const phys = computeCraftPhysics(grid, state.cols, state.rows, {
        liquidFrac: isSim ? sim.liquidFuelFrac : state.testFuelPercent / 100,
        solidFrac: isSim ? sim.solidFuelFrac : state.testFuelPercent / 100,
        airspeed: isSim ? Math.hypot(sim.vx, sim.vy) : state.testAirspeed,
        pitchRad: isSim ? sim.pitch : 0,
        aoaRad: isSim ? (sim.aoa || 0) : 0,
        altitude: isSim ? sim.y : 0,
        throttle: isSim ? (sim.ignited ? sim.throttle : 0) : 1.0,
        armLiquid: isSim ? sim.armLiquid : true,
        armSolid: isSim ? sim.armSolid : true,
        solidActive: isSim ? sim.solidLit : true
      });
      state.physics = phys;
      updateAllUIReadouts(phys);
      if (!isSim && typeof refreshMissionUI === 'function') refreshMissionUI();
    }

    function updateAllUIReadouts(phys) {
      if (!phys) return;

      document.getElementById('status-pixel-count').textContent = String(phys.pixelCount);

      document.getElementById('dock-mass-cur').textContent = `${phys.currentMass.toFixed(1)} kg`;
      document.getElementById('dock-mass-dry').textContent = `${phys.dryMass.toFixed(1)} kg`;

      const liqPct = phys.liquidFuelMaxKg > 0 ? Math.round((phys.liquidFuelCurKg / phys.liquidFuelMaxKg) * 100) : 0;
      const solPct = phys.solidFuelMaxKg > 0 ? Math.round((phys.solidFuelCurKg / phys.solidFuelMaxKg) * 100) : 0;

      document.getElementById('dock-liq-val').textContent = `${phys.liquidFuelCurKg.toFixed(1)} kg (${liqPct}%)`;
      document.getElementById('dock-liq-bar').style.width = `${liqPct}%`;

      const liqNote = document.getElementById('dock-liq-engine-note');
      if (phys.liquidThrusterCount === 0) {
        liqNote.textContent = '• No Liquid Thrusters installed';
        liqNote.className = 'mt-1 text-[10px] text-[#635645]';
      } else if (phys.hasLiquidFuel) {
        liqNote.innerHTML = `${pxIcon('check', 11)} ${phys.liquidThrusterCount} Liquid Thruster(s) Ready (${phys.liquidThrustN.toFixed(0)} N)`;
        liqNote.className = 'mt-1 text-[10px] text-[#246b50] font-semibold';
      } else {
        liqNote.innerHTML = `${pxIcon('cross', 11)} NO LIQUID FUEL — Liquid Thrusters Disabled (0 N)`;
        liqNote.className = 'mt-1 text-[10px] text-[#b83a2d] font-bold';
      }

      document.getElementById('dock-sol-val').textContent = `${phys.solidFuelCurKg.toFixed(1)} kg (${solPct}%)`;
      document.getElementById('dock-sol-bar').style.width = `${solPct}%`;

      const solNote = document.getElementById('dock-sol-engine-note');
      if (phys.solidThrusterCount === 0) {
        solNote.textContent = '• No Solid Boosters installed';
        solNote.className = 'mt-1 text-[10px] text-[#635645]';
      } else if (phys.hasSolidFuel) {
        solNote.innerHTML = `${pxIcon('check', 11)} ${phys.solidThrusterCount} Solid Booster(s) Ready (${phys.solidThrustN.toFixed(0)} N)`;
        solNote.className = 'mt-1 text-[10px] text-[#246b50] font-semibold';
      } else {
        solNote.innerHTML = `${pxIcon('cross', 11)} NO SOLID FUEL — Solid Boosters Disabled (0 N)`;
        solNote.className = 'mt-1 text-[10px] text-[#b83a2d] font-bold';
      }

      const dockStatus = document.getElementById('dock-thruster-status');
      if (phys.totalThrustN > 0) {
        dockStatus.textContent = 'THRUST READY';
        dockStatus.className = 'font-mono-tech text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#246b50] text-[#f3ead6]';
      } else {
        dockStatus.textContent = 'NO THRUST';
        dockStatus.className = 'font-mono-tech text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#b83a2d] text-[#f3ead6]';
      }

      // Minimized FBD Pill Readouts
      document.getElementById('min-w').textContent = `${phys.weightN.toFixed(0)}N`;
      document.getElementById('min-t').textContent = `${phys.totalThrustN.toFixed(0)}N`;
      document.getElementById('min-d').textContent = `${phys.dragN.toFixed(0)}N`;
      document.getElementById('min-ff').textContent = `${phys.frictionN.toFixed(1)}N`;

      // Expanded FBD Tab Readouts
      document.getElementById('fbd-twr-badge').textContent = `TWR: ${phys.twr.toFixed(2)}`;
      document.getElementById('fbd-val-weight').textContent = `${phys.weightN.toFixed(1)} N (${phys.currentMass.toFixed(1)} kg)`;
      document.getElementById('fbd-val-thrust').textContent = `${phys.totalThrustN.toFixed(1)} N`;
      document.getElementById('fbd-val-drag').textContent = `${phys.dragN.toFixed(1)} N`;
      document.getElementById('fbd-val-friction').textContent = `${phys.frictionN.toFixed(2)} N`;
      document.getElementById('fbd-val-lift').textContent = `${phys.liftN.toFixed(1)} N`;
      document.getElementById('fbd-val-com').textContent = `X:${phys.com.x.toFixed(1)}, Y:${phys.com.y.toFixed(1)}`;
      document.getElementById('fbd-val-mu').textContent = `μ_eff = ${phys.muEff.toFixed(3)}`;

      // Material Friction Breakdown List
      const breakdownEl = document.getElementById('fbd-friction-breakdown');
      if (phys.frictionBreakdown.length === 0) {
        breakdownEl.innerHTML = '<div class="text-[#635645]">No exterior surface pixels.</div>';
      } else {
        breakdownEl.innerHTML = phys.frictionBreakdown.map(item => `
          <div class="flex items-center justify-between gap-1">
            <span class="flex items-center gap-1 truncate">
              <span class="inline-block w-2 h-2 rounded-xs border border-[#2b241b]" style="background:${item.mat.badgeColor}"></span>
              <span class="truncate">${item.mat.shortName} (${item.extCount}px, μ=${item.mu.toFixed(2)})</span>
            </span>
            <span class="font-bold text-[#6b3fa0] shrink-0">${item.forceN.toFixed(2)} N</span>
          </div>
        `).join('');
      }

      renderDedicatedFBDCanvas(phys);
    }

    function renderMaterialsPaletteUI() {
      const container = document.getElementById('materials-list');
      container.innerHTML = '';
      let lastGroup = null;
      for (const mat of MATERIALS) {
        if (mat.group !== lastGroup) {
          lastGroup = mat.group;
          const h = document.createElement('div');
          h.className = 'mat-group-head';
          h.textContent = mat.group === 'Spacecraft Bus' ? 'Spacecraft Bus (put in TOP stage)' : mat.group;
          container.appendChild(h);
        }
        const isActive = state.activeMatId === mat.id && state.tool !== 'stamp';
        const card = document.createElement('div');
        card.className = `p-2 rounded border-[1.5px] transition-all cursor-pointer ${
          isActive ? 'bg-[#e4d6b9] border-[#2b241b] draft-shadow-sm' : 'bg-[#ebe0c7] border-[#c9b99a] hover:border-[#2b241b]'
        }`;
        const massLabel = mat.fuelMass > 0
          ? `${(mat.dryMass + mat.fuelMass).toFixed(2)}kg (${mat.dryMass.toFixed(2)} dry)`
          : `${mat.dryMass.toFixed(2)}kg/px`;
        const tags = [];
        if (mat.thrusterType) tags.push(`<span class="mat-tag">${mat.thrust} N · Isp ${mat.isp}s</span>`);
        if (mat.genW) tags.push(`<span class="mat-tag">+${mat.genW} W</span>`);
        if (mat.capWh) tags.push(`<span class="mat-tag">${mat.capWh} Wh</span>`);
        if (mat.rateMbps) tags.push(`<span class="mat-tag">${mat.rateMbps} Mbps</span>`);
        if (mat.powerW) tags.push(`<span class="mat-tag">−${mat.powerW} W</span>`);
        tags.push(`<span class="mat-tag">$${mat.cost}k</span>`);
        card.innerHTML = `
          <div class="flex items-center justify-between gap-1.5">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="w-3.5 h-3.5 rounded-xs border border-[#2b241b] shrink-0" style="background:${mat.badgeColor}"></span>
              <span class="text-xs font-bold leading-tight truncate">${mat.name}</span>
              <span class="mat-src" title="${(mat.source || '').replace(/"/g, '&quot;')}">${pxIcon('info', 12)}</span>
            </div>
            <span class="font-mono-tech text-[10px] text-[#635645] shrink-0">${massLabel}</span>
          </div>
          <div class="font-mono-tech text-[10px] text-[#635645] mt-0.5">${mat.description}</div>
          <div class="flex flex-wrap gap-1 mt-1">${tags.join('')}</div>
          <div class="flex items-center gap-1.5 mt-1.5">
            ${mat.swatches.map(hex => `
              <button type="button" data-mat="${mat.id}" data-hex="${hex}"
                class="swatch-btn w-5 h-5 rounded-xs border ${
                  isActive && state.activeColor.toLowerCase() === hex.toLowerCase() ? 'border-2 border-[#2b241b] scale-110' : 'border-[#2b241b]/60'
                }"
                style="background:${hex}" title="Select ${mat.shortName} (${hex})"></button>
            `).join('')}
          </div>`;
        card.addEventListener('click', (e) => {
          const swatchBtn = e.target.closest('.swatch-btn');
          state.activeMatId = mat.id;
          if (swatchBtn) state.activeColor = swatchBtn.dataset.hex;
          else if (!mat.swatches.includes(state.activeColor)) state.activeColor = mat.swatches[0];
          if (state.tool === 'stamp' || state.tool === 'eraser' || state.tool === 'pan') setActiveTool('brush');
          document.getElementById('input-custom-color').value = state.activeColor;
          document.getElementById('status-active-mat').textContent = mat.name;
          renderMaterialsPaletteUI();
          renderStampsLibraryUI();
        });
        container.appendChild(card);
      }
    }

    function renderStampsLibraryUI() {
      const container = document.getElementById('stamps-list');
      container.innerHTML = '';

      for (const stamp of PART_STAMPS) {
        const isSelected = state.tool === 'stamp' && state.activeStamp?.id === stamp.id;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `w-full p-1.5 rounded border-[1.5px] flex items-center gap-2.5 text-left transition-all ${
          isSelected
            ? 'bg-[#2b241b] text-[#f3ead6] border-[#2b241b] draft-shadow-sm'
            : 'bg-[#ebe0c7] text-[#2b241b] border-[#c9b99a] hover:border-[#2b241b]'
        }`;

        const miniCanvas = document.createElement('canvas');
        miniCanvas.width = 28;
        miniCanvas.height = 28;
        miniCanvas.className = 'w-7 h-7 rounded-xs bg-[#f3ead6] border border-[#2b241b] shrink-0';
        const mctx = miniCanvas.getContext('2d');
        const scale = Math.floor(24 / Math.max(stamp.width, stamp.height));
        const ox = Math.floor((28 - stamp.width * scale) / 2);
        const oy = Math.floor((28 - stamp.height * scale) / 2);
        for (let r = 0; r < stamp.height; r++) {
          for (let c = 0; c < stamp.width; c++) {
            const p = stamp.pixels[r]?.[c];
            if (!p) continue;
            mctx.fillStyle = p[1];
            mctx.fillRect(ox + c * scale, oy + r * scale, scale, scale);
          }
        }

        const infoDiv = document.createElement('div');
        infoDiv.className = 'flex-1 min-w-0';
        infoDiv.innerHTML = `
          <div class="flex items-center justify-between gap-1">
            <span class="text-xs font-bold truncate">${stamp.name}</span>
            <span class="font-mono-tech text-[10px] opacity-75 shrink-0">${stamp.dims}</span>
          </div>
          <div class="font-mono-tech text-[10px] opacity-80 truncate">${stamp.desc}</div>
        `;

        btn.appendChild(miniCanvas);
        btn.appendChild(infoDiv);

        btn.addEventListener('click', () => {
          state.activeStamp = stamp;
          setActiveTool('stamp');
          renderStampsLibraryUI();
          renderMaterialsPaletteUI();
          showToast(`Selected Stamp: ${stamp.name}`);
        });

        container.appendChild(btn);
      }
    }

    function setActiveTool(toolName) {
      state.tool = toolName;
      if (toolName !== 'stamp') {
        state.activeStamp = null;
      }
      document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tool === toolName);
      });
      mainCanvas.style.cursor = toolName === 'pan' ? 'grab' : 'crosshair';
      renderStampsLibraryUI();
    }

    /**
     * ============================================================================
     * 11. TOAST NOTIFICATIONS & INLINE CONFIRMATION MODAL
     * ============================================================================
     */
    function showToast(message) {
      const container = document.getElementById('toast-container');
      const el = document.createElement('div');
      el.className = 'bg-[#2b241b] text-[#f3ead6] font-mono-tech text-xs px-3 py-2 rounded draft-border draft-shadow-sm transition-opacity duration-200';
      el.textContent = message;
      container.appendChild(el);
      setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 220);
      }, 2200);
    }

    function showConfirmModal(title, message, onConfirm) {
      const modal = document.getElementById('custom-modal');
      document.getElementById('modal-title').textContent = title;
      document.getElementById('modal-message').textContent = message;
      modal.classList.remove('hidden');

      const cleanup = () => modal.classList.add('hidden');
      const confirmBtn = document.getElementById('modal-confirm');
      const cancelBtn = document.getElementById('modal-cancel');

      const handleConfirm = () => {
        cleanup();
        onConfirm();
      };
      confirmBtn.onclick = handleConfirm;
      cancelBtn.onclick = cleanup;
    }

    /**
     * ============================================================================
     * 12. POINTER, TOUCH, KEYBOARD & WORKBENCH EVENT LISTENERS
     * ============================================================================
     */
    function bindAllEvents() {
      // Mission phase stepper
      document.querySelectorAll('.phase-btn').forEach(btn => btn.addEventListener('click', () => setPhase(btn.dataset.phase)));
      document.getElementById('btn-help').addEventListener('click', showHelpModal);
      document.getElementById('btn-sources').addEventListener('click', showSourcesModal);
      document.getElementById('info-modal-close').addEventListener('click', () => document.getElementById('info-modal').classList.add('hidden'));
      document.getElementById('info-modal').addEventListener('click', (e) => { if (e.target.id === 'info-modal') e.currentTarget.classList.add('hidden'); });
      document.getElementById('btn-sim-stage').addEventListener('click', performStaging);
      document.getElementById('btn-sim-warp').addEventListener('click', (e) => {
        const steps = [1, 2, 5, 10];
        sim.timeWarp = steps[(steps.indexOf(sim.timeWarp) + 1) % steps.length];
        e.currentTarget.innerHTML = `${pxIcon('warp')} ${sim.timeWarp}×`;
      });
      document.getElementById('btn-sim-sas').addEventListener('click', (e) => {
        sim.sas = !sim.sas;
        sim.targetPitch = sim.pitch;
        e.currentTarget.classList.toggle('active', sim.sas);
        e.currentTarget.textContent = sim.sas ? 'SAS ON' : 'SAS OFF';
      });

      // Minimizable "Applied Forces & FBD" Tab Controls
      const fbdTab = document.getElementById('fbd-floating-tab');
      const fbdMinBar = document.getElementById('fbd-minimized-bar');
      const fbdExpCard = document.getElementById('fbd-expanded-card');

      const setFBDMinimized = (minimized) => {
        state.fbdMinimized = minimized;
        if (minimized) {
          fbdExpCard.classList.add('hidden');
          fbdMinBar.classList.remove('hidden');
          fbdTab.classList.remove('w-[calc(100%-1.5rem)]', 'sm:max-w-[375px]');
          fbdTab.classList.add('w-auto', 'max-w-[calc(100%-1.5rem)]');
        } else {
          fbdMinBar.classList.add('hidden');
          fbdExpCard.classList.remove('hidden');
          fbdTab.classList.remove('w-auto', 'max-w-[calc(100%-1.5rem)]');
          fbdTab.classList.add('w-[calc(100%-1.5rem)]', 'sm:max-w-[375px]');
          renderDedicatedFBDCanvas(state.physics);
        }
      };

      document.getElementById('btn-fbd-minimize').addEventListener('click', () => setFBDMinimized(true));
      document.getElementById('btn-fbd-expand').addEventListener('click', () => setFBDMinimized(false));
      fbdMinBar.addEventListener('click', () => setFBDMinimized(false));

      // Build-mode Test Fuel Load & Test Airspeed Sliders inside FBD Tab
      document.getElementById('slider-test-fuel').addEventListener('input', (e) => {
        state.testFuelPercent = Number(e.target.value);
        document.getElementById('fbd-test-fuel-label').textContent = `${state.testFuelPercent}%`;
        recalculateAndRefreshUI();
      });

      document.getElementById('slider-test-speed').addEventListener('input', (e) => {
        state.testAirspeed = Number(e.target.value);
        document.getElementById('fbd-test-speed-label').textContent = `${state.testAirspeed} m/s`;
        recalculateAndRefreshUI();
      });

      // Refuel Buttons
      const refuelAllTanks = () => {
        state.testFuelPercent = 100;
        sim.liquidFuelFrac = 1.0;
        sim.solidFuelFrac = 1.0;
        document.getElementById('slider-test-fuel').value = 100;
        document.getElementById('fbd-test-fuel-label').textContent = '100%';
        recalculateAndRefreshUI();
        showToast('Liquid & Solid Fuel Tanks Refueled to 100%');
      };
      document.getElementById('btn-refuel-top').addEventListener('click', refuelAllTanks);
      document.getElementById('btn-fbd-refuel').addEventListener('click', refuelAllTanks);
      document.getElementById('btn-sim-refuel').addEventListener('click', refuelAllTanks);

      // Grid Resolution Selector
      document.getElementById('select-grid-size').addEventListener('change', (e) => {
        const [newCols, newRows] = e.target.value.split('x').map(Number);
        pushUndoSnapshot();
        const nextGrid = Array.from({ length: newRows }, () => Array(newCols).fill(null));
        const offsetX = Math.floor((newCols - state.cols) / 2);
        const offsetY = Math.floor((newRows - state.rows) / 2);

        for (let y = 0; y < state.rows; y++) {
          for (let x = 0; x < state.cols; x++) {
            const cell = state.grid[y]?.[x];
            if (!cell) continue;
            const nx = x + offsetX;
            const ny = y + offsetY;
            if (nx >= 0 && nx < newCols && ny >= 0 && ny < newRows) {
              nextGrid[ny][nx] = { ...cell };
            }
          }
        }
        state.cols = newCols;
        state.rows = newRows;
        state.grid = nextGrid;
        fitBlueprintToViewport();
        recalculateAndRefreshUI();
        showToast(`Grid resized to ${newCols}×${newRows} px`);
      });

      // Preset & Clear Buttons
      document.getElementById('select-preset').addEventListener('change', (e) => {
        const which = e.target.value;
        e.target.value = '';
        if (!which) return;
        const label = which === 'bantay' ? 'BANTAY-1 (two-stage launcher + typhoon-watch satellite)' : 'Orbital Shuttle MK-I (single stage — and aerodynamically unstable!)';
        showConfirmModal(`Load ${label}?`, 'This replaces your current blueprint. You can recover with Undo (Ctrl+Z).', () => {
          pushUndoSnapshot();
          if (which === 'bantay') {
            if (state.cols < 32 || state.rows < 48) { state.cols = 32; state.rows = 48; document.getElementById('select-grid-size').value = '32x48'; }
            state.grid = buildBantayPreset(state.cols, state.rows);
            state.craftName = 'BANTAY-1';
          } else {
            state.grid = buildOrbitalShuttlePreset(state.cols, state.rows);
            state.craftName = 'ORBITAL SHUTTLE MK-I';
          }
          document.getElementById('input-craft-name').value = state.craftName;
          refuelAllTanks();
          fitBlueprintToViewport();
          recalculateAndRefreshUI();
          showToast(`Loaded ${state.craftName}`);
        });
      });

      document.getElementById('btn-clear-canvas').addEventListener('click', () => {
        showConfirmModal(
          'Clear Blueprint Canvas?',
          'All pixels on the drafting sheet will be erased. You can still recover with Undo (Ctrl+Z).',
          () => {
            pushUndoSnapshot();
            state.grid = Array.from({ length: state.rows }, () => Array(state.cols).fill(null));
            recalculateAndRefreshUI();
            showToast('Drafting sheet cleared');
          }
        );
      });

      // Tool & Brush Size Buttons
      document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => setActiveTool(btn.dataset.tool));
      });

      document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          state.brushSize = Number(btn.dataset.size);
          document.querySelectorAll('.size-btn').forEach(b => b.classList.toggle('active', b === btn));
        });
      });

      // Mirror Symmetry Toggle
      const toggleMirror = () => {
        state.mirrorX = !state.mirrorX;
        const btn = document.getElementById('btn-toggle-mirror');
        btn.textContent = state.mirrorX ? 'ON' : 'OFF';
        btn.classList.toggle('active', state.mirrorX);
      };
      document.getElementById('btn-toggle-mirror').addEventListener('click', toggleMirror);

      // Custom Color Input
      document.getElementById('input-custom-color').addEventListener('input', (e) => {
        state.activeColor = e.target.value;
        renderMaterialsPaletteUI();
      });

      // Craft Name Input
      document.getElementById('input-craft-name').addEventListener('input', (e) => {
        state.craftName = e.target.value || 'UNTITLED CRAFT';
      });

      // Viewport Grid Toggle
      document.getElementById('btn-toggle-grid').addEventListener('click', (e) => {
        state.showGrid = !state.showGrid;
        const btn = e.currentTarget;
        btn.classList.toggle('active', state.showGrid);
        btn.textContent = `GRID: ${state.showGrid ? 'ON' : 'OFF'}`;
      });

      // Undo / Redo Buttons
      document.getElementById('btn-undo').addEventListener('click', performUndo);
      document.getElementById('btn-redo').addEventListener('click', performRedo);

      // Zoom Controls
      const setZoomAroundCenter = (newZoom) => {
        const clamped = Math.max(4, Math.min(24, newZoom));
        const rect = viewportEl.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const ratio = clamped / state.zoom;
        state.panX = Math.round(cx - (cx - state.panX) * ratio);
        state.panY = Math.round(cy - (cy - state.panY) * ratio);
        state.zoom = clamped;
        syncZoomUI();
      };

      document.getElementById('slider-zoom').addEventListener('input', (e) => setZoomAroundCenter(Number(e.target.value)));
      document.getElementById('btn-zoom-in').addEventListener('click', () => setZoomAroundCenter(state.zoom + 2));
      document.getElementById('btn-zoom-out').addEventListener('click', () => setZoomAroundCenter(state.zoom - 2));
      document.getElementById('btn-zoom-fit').addEventListener('click', fitBlueprintToViewport);

      // Mouse Wheel Zoom on Canvas
      mainCanvas.addEventListener('wheel', (e) => {
        if (state.mode !== 'build') return;
        e.preventDefault();
        const rect = mainCanvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const delta = e.deltaY < 0 ? 1 : -1;
        const newZoom = Math.max(4, Math.min(24, state.zoom + delta));
        const ratio = newZoom / state.zoom;
        state.panX = Math.round(mx - (mx - state.panX) * ratio);
        state.panY = Math.round(my - (my - state.panY) * ratio);
        state.zoom = newZoom;
        syncZoomUI();
      }, { passive: false });

      mainCanvas.addEventListener('contextmenu', (e) => e.preventDefault());

      // Pointer Events for Drawing, Stamping & Panning
      mainCanvas.addEventListener('pointerdown', (e) => {
        if (state.mode !== 'build') return;
        mainCanvas.setPointerCapture(e.pointerId);

        if (e.button === 1 || e.button === 2 || state.spacePressed || state.tool === 'pan') {
          state.isPanning = true;
          state.panStart = { x: e.clientX - state.panX, y: e.clientY - state.panY };
          mainCanvas.style.cursor = 'grabbing';
          return;
        }

        const cellPos = screenToGrid(e.clientX, e.clientY);
        state.hoverCell = cellPos;

        if (cellPos.x < 0 || cellPos.x >= state.cols || cellPos.y < 0 || cellPos.y >= state.rows) return;

        if (state.tool === 'picker') {
          const picked = state.grid[cellPos.y]?.[cellPos.x];
          if (picked) {
            state.activeMatId = picked.matId;
            state.activeColor = picked.color;
            document.getElementById('input-custom-color').value = picked.color;
            document.getElementById('status-active-mat').textContent = MATERIAL_MAP[picked.matId]?.name || picked.matId;
            setActiveTool('brush');
            renderMaterialsPaletteUI();
            showToast(`Picked ${MATERIAL_MAP[picked.matId]?.shortName} (${picked.color})`);
          }
          return;
        }

        pushUndoSnapshot();
        state.isDrawing = true;
        state.dragStartCell = { x: cellPos.x, y: cellPos.y };

        if (state.tool === 'brush') {
          applyBrushAt(cellPos.x, cellPos.y, false);
          recalculateAndRefreshUI();
        } else if (state.tool === 'eraser') {
          applyBrushAt(cellPos.x, cellPos.y, true);
          recalculateAndRefreshUI();
        } else if (state.tool === 'fill') {
          applyFloodFill(cellPos.x, cellPos.y);
          state.isDrawing = false;
          recalculateAndRefreshUI();
        } else if (state.tool === 'stamp' && state.activeStamp) {
          applyStampAt(cellPos.x, cellPos.y, state.activeStamp);
          state.isDrawing = false;
          recalculateAndRefreshUI();
        }
      });

      mainCanvas.addEventListener('pointermove', (e) => {
        if (state.mode !== 'build') return;

        if (state.isPanning) {
          state.panX = Math.round(e.clientX - state.panStart.x);
          state.panY = Math.round(e.clientY - state.panStart.y);
          return;
        }

        const cellPos = screenToGrid(e.clientX, e.clientY);
        state.hoverCell = cellPos;

        const coordsEl = document.getElementById('status-coords');
        const cellInfoEl = document.getElementById('status-cell-info');
        if (cellPos.x >= 0 && cellPos.x < state.cols && cellPos.y >= 0 && cellPos.y < state.rows) {
          coordsEl.textContent = `X: ${cellPos.x}, Y: ${cellPos.y}`;
          const hovered = state.grid[cellPos.y]?.[cellPos.x];
          if (hovered) {
            const mat = MATERIAL_MAP[hovered.matId];
            cellInfoEl.textContent = `${mat ? mat.name : hovered.matId} (μ=${mat?.mu.toFixed(2)})`;
          } else {
            cellInfoEl.textContent = 'Empty Parchment';
          }
        } else {
          coordsEl.textContent = 'X: --, Y: --';
          cellInfoEl.textContent = 'Margin';
        }

        if (!state.isDrawing) return;

        if (state.tool === 'brush') {
          applyBrushAt(cellPos.x, cellPos.y, false);
          recalculateAndRefreshUI();
        } else if (state.tool === 'eraser') {
          applyBrushAt(cellPos.x, cellPos.y, true);
          recalculateAndRefreshUI();
        }
      });

      const finishPointer = (e) => {
        if (state.isPanning) {
          state.isPanning = false;
          mainCanvas.style.cursor = state.tool === 'pan' ? 'grab' : 'crosshair';
        }

        if (state.isDrawing && state.dragStartCell && state.hoverCell) {
          if (state.tool === 'line') {
            applyLine(state.dragStartCell.x, state.dragStartCell.y, state.hoverCell.x, state.hoverCell.y);
            recalculateAndRefreshUI();
          } else if (state.tool === 'box') {
            applyBox(state.dragStartCell.x, state.dragStartCell.y, state.hoverCell.x, state.hoverCell.y);
            recalculateAndRefreshUI();
          }
        }
        state.isDrawing = false;
        state.dragStartCell = null;
      };

      mainCanvas.addEventListener('pointerup', finishPointer);
      mainCanvas.addEventListener('pointercancel', finishPointer);
      mainCanvas.addEventListener('pointerleave', () => {
        if (!state.isDrawing && !state.isPanning) {
          state.hoverCell = null;
          document.getElementById('status-coords').textContent = 'X: --, Y: --';
          document.getElementById('status-cell-info').textContent = 'Empty Parchment';
        }
      });

      // Flight Simulation Controls
      const throttleSlider = document.getElementById('sim-throttle-slider');
      throttleSlider.addEventListener('input', (e) => {
        sim.throttle = Number(e.target.value) / 100;
        document.getElementById('sim-throttle-val').textContent = `${e.target.value}%`;
        if (sim.throttle > 0 && !sim.ignited) {
          sim.ignited = true;
          document.getElementById('btn-sim-launch').innerHTML = `${pxIcon('stop')} CUTOFF [SPACE]`;
        }
      });

      document.getElementById('btn-sim-launch').addEventListener('click', () => {
        sim.ignited = !sim.ignited;
        if (sim.ignited && sim.throttle === 0) {
          sim.throttle = 1.0;
          throttleSlider.value = 100;
          document.getElementById('sim-throttle-val').textContent = '100%';
        }
        document.getElementById('btn-sim-launch').innerHTML = sim.ignited ? `${pxIcon('stop')} CUTOFF [SPACE]` : `${pxIcon('fire')} IGNITION [SPACE]`;
      });

      document.getElementById('btn-sim-windtunnel').addEventListener('click', (e) => {
        sim.windTunnel = !sim.windTunnel;
        e.currentTarget.classList.toggle('active', sim.windTunnel);
        e.currentTarget.textContent = `WIND TUNNEL TETHER: ${sim.windTunnel ? 'ON' : 'OFF'}`;
      });

      document.getElementById('btn-sim-arm-liq').addEventListener('click', (e) => {
        sim.armLiquid = !sim.armLiquid;
        e.currentTarget.classList.toggle('active', sim.armLiquid);
        e.currentTarget.textContent = `LIQ ENG: ${sim.armLiquid ? 'ON' : 'OFF'}`;
      });

      document.getElementById('btn-sim-arm-sol').addEventListener('click', (e) => {
        sim.armSolid = !sim.armSolid;
        e.currentTarget.classList.toggle('active', sim.armSolid);
        e.currentTarget.textContent = `SOL BST: ${sim.armSolid ? 'ON' : 'OFF'}`;
      });

      document.getElementById('btn-sim-reset').addEventListener('click', () => resetSimulation(true));

      const bindHoldBtn = (id, flagName) => {
        const el = document.getElementById(id);
        el.addEventListener('pointerdown', (e) => { e.preventDefault(); sim[flagName] = true; });
        el.addEventListener('pointerup', () => { sim[flagName] = false; });
        el.addEventListener('pointerleave', () => { sim[flagName] = false; });
      };
      bindHoldBtn('btn-pitch-left', 'keyPitchLeft');
      bindHoldBtn('btn-pitch-right', 'keyPitchRight');

      // Keyboard Shortcuts
      window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

        if (e.code === 'Space') {
          e.preventDefault();
          if (state.mode === 'build') {
            state.spacePressed = true;
            mainCanvas.style.cursor = 'grab';
          } else {
            document.getElementById('btn-sim-launch').click();
          }
          return;
        }

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
          e.preventDefault();
          performUndo();
          return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
          e.preventDefault();
          performRedo();
          return;
        }

        if (state.mode === 'build') {
          const k = e.key.toLowerCase();
          if (k === 'b') setActiveTool('brush');
          else if (k === 'l') setActiveTool('line');
          else if (k === 'r') setActiveTool('box');
          else if (k === 'g') setActiveTool('fill');
          else if (k === 'e') setActiveTool('eraser');
          else if (k === 'i') setActiveTool('picker');
          else if (k === 'h') setActiveTool('pan');
          else if (k === 'm') toggleMirror();
        } else {
          const k = e.key.toLowerCase();
          if (k === 'g') performStaging();
          if (k === 'a' || e.key === 'ArrowLeft') sim.keyPitchLeft = true;
          if (k === 'd' || e.key === 'ArrowRight') sim.keyPitchRight = true;
          if (k === 'w' || e.key === 'ArrowUp') {
            const next = Math.min(100, Math.round(sim.throttle * 100) + 10);
            throttleSlider.value = next;
            throttleSlider.dispatchEvent(new Event('input'));
          }
          if (k === 's' || e.key === 'ArrowDown') {
            const next = Math.max(0, Math.round(sim.throttle * 100) - 10);
            throttleSlider.value = next;
            throttleSlider.dispatchEvent(new Event('input'));
          }
        }
      });

      window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
          state.spacePressed = false;
          if (!state.isPanning) mainCanvas.style.cursor = state.tool === 'pan' ? 'grab' : 'crosshair';
        }
        const k = e.key.toLowerCase();
        if (k === 'a' || e.key === 'ArrowLeft') sim.keyPitchLeft = false;
        if (k === 'd' || e.key === 'ArrowRight') sim.keyPitchRight = false;
      });

      // JSON & PNG Export / Import
      document.getElementById('btn-export-json').addEventListener('click', () => {
        const payload = {
          version: '5.0',
          name: state.craftName,
          cols: state.cols,
          rows: state.rows,
          grid: state.grid
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${state.craftName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Exported JSON Blueprint');
      });

      document.getElementById('btn-export-png').addEventListener('click', () => {
        const scale = 16;
        const out = document.createElement('canvas');
        out.width = state.cols * scale;
        out.height = state.rows * scale;
        const octx = out.getContext('2d');

        for (let y = 0; y < state.rows; y++) {
          const row = state.grid[y];
          if (!row) continue;
          for (let x = 0; x < state.cols; x++) {
            const cell = row[x];
            if (!cell) continue;
            octx.fillStyle = cell.color;
            octx.fillRect(x * scale, y * scale, scale, scale);
          }
        }

        const url = out.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `${state.craftName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_sprite.png`;
        a.click();
        showToast('Exported PNG Sprite');
      });

      document.getElementById('input-import-file').addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.name.endsWith('.json') || file.type === 'application/json') {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const data = JSON.parse(reader.result);
              if (!Array.isArray(data.grid)) throw new Error('Invalid grid format');
              pushUndoSnapshot();
              const newCols = Math.max(8, Math.min(128, Number(data.cols) || 32));
              const newRows = Math.max(8, Math.min(128, Number(data.rows) || 48));
              const normalizedGrid = Array.from({ length: newRows }, (_, y) =>
                Array.from({ length: newCols }, (_, x) => {
                  const cell = data.grid[y]?.[x];
                  return cell && cell.color ? { matId: cell.matId || 'alloy', color: cell.color } : null;
                })
              );
              state.cols = newCols;
              state.rows = newRows;
              state.grid = normalizedGrid;
              if (data.name) {
                state.craftName = String(data.name).toUpperCase();
                document.getElementById('input-craft-name').value = state.craftName;
              }
              fitBlueprintToViewport();
              recalculateAndRefreshUI();
              showToast('Imported JSON Schematic');
            } catch (err) {
              showToast('Failed to parse JSON schematic');
            }
          };
          reader.readAsText(file);
        } else if (file.type.startsWith('image/')) {
          const img = new Image();
          const objUrl = URL.createObjectURL(file);
          img.onload = () => {
            pushUndoSnapshot();
            const tmp = document.createElement('canvas');
            tmp.width = state.cols;
            tmp.height = state.rows;
            const tctx = tmp.getContext('2d');
            tctx.imageSmoothingEnabled = false;

            const scale = Math.min(state.cols / img.width, state.rows / img.height);
            const dw = Math.max(1, Math.floor(img.width * scale));
            const dh = Math.max(1, Math.floor(img.height * scale));
            const dx = Math.floor((state.cols - dw) / 2);
            const dy = Math.floor((state.rows - dh) / 2);
            tctx.drawImage(img, dx, dy, dw, dh);

            const imgData = tctx.getImageData(0, 0, state.cols, state.rows).data;
            const nextGrid = Array.from({ length: state.rows }, () => Array(state.cols).fill(null));

            for (let y = 0; y < state.rows; y++) {
              for (let x = 0; x < state.cols; x++) {
                const idx = (y * state.cols + x) * 4;
                const r = imgData[idx], g = imgData[idx + 1], b = imgData[idx + 2], a = imgData[idx + 3];
                if (a < 128) continue;
                const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
                let matId = 'alloy';
                if (b > r + 20 && b > g + 10) matId = r < 70 ? 'canopy' : 'liquid_tank';
                else if (r > b + 45 && g > 70 && g < 180) matId = 'solid_tank';
                else if (r > g + 50 && r > b + 50) matId = 'solid_thruster';
                else if (r < 75 && g < 75 && b < 75) matId = 'carbon';
                nextGrid[y][x] = { matId, color: hex };
              }
            }
            state.grid = nextGrid;
            recalculateAndRefreshUI();
            URL.revokeObjectURL(objUrl);
            showToast('Imported Pixel Image to Blueprint');
          };
          img.src = objUrl;
        }
        e.target.value = '';
      });

      // Mobile Tab Switcher (< lg screens)
      document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const tab = btn.dataset.mobileTab;
          document.querySelectorAll('.mobile-tab-btn').forEach(b => {
            b.classList.toggle('bg-[#2b241b]', b === btn);
            b.classList.toggle('text-[#f3ead6]', b === btn);
          });
          const pCanvas = document.getElementById('panel-canvas');
          const pTools = document.getElementById('panel-tools');
          const pMats = document.getElementById('panel-materials');

          if (window.innerWidth < 1024) {
            pCanvas.classList.toggle('hidden', tab !== 'canvas');
            pTools.classList.toggle('hidden', tab !== 'tools');
            pMats.classList.toggle('hidden', tab !== 'materials');
            if (tab === 'canvas') {
              resizeCanvas();
              renderDedicatedFBDCanvas(state.physics);
            }
          }
        });
      });

      window.addEventListener('resize', () => {
        resizeCanvas();
        if (window.innerWidth >= 1024) {
          document.getElementById('panel-canvas').classList.remove('hidden');
          document.getElementById('panel-tools').classList.remove('hidden');
          document.getElementById('panel-materials').classList.remove('hidden');
        }
        renderDedicatedFBDCanvas(state.physics);
      });
    }

    /**
     * ============================================================================
     * 15. MISSION LAYER — phases, NASA data (EONET · GIBS · DONKI), budgets, review
     * ============================================================================
     */
    const PHASES = ['brief', 'design', 'flight', 'launch', 'ops', 'review'];
    const catIcon = (cat, size = 14) => pxIcon(PX_ICONS[cat] ? cat : 'default', size);
    const REQ_SHORT = {
      liftoff: 'Liftoff TWR', orbit: 'Δv to orbit', budget: 'Cost', computer: 'Computer + radio', coverage: 'Target coverage',
      gsd: 'Resolution', revisit: 'Revisit', power: 'Power', battery: 'Eclipse battery', downlink: 'Downlink', lifetime: 'Orbit lifetime'
    };
    const ORBIT_INCLINATIONS = [
      { value: 20, label: '20° Low-inclination', hint: 'Lingers over the tropics, Earth\'s spin gives a free ~440 m/s' },
      { value: 51.6, label: '51.6° ISS-like', hint: 'Mid-latitudes' },
      { value: 97.6, label: '97.6° Sun-synchronous', hint: 'Whole globe, same lighting every pass — but launching against Earth\'s spin costs Δv' }
    ];

    Object.assign(state, {
      phase: 'brief',
      mission: null,
      orbit: { altitudeKm: 500, inclination: 20 },
      analysis: null,
      liveMissions: [],
      eonetStatus: 'idle', // idle | loading | live | offline
      spaceWeatherKey: 'may2024',
      liveSpaceWeather: null,
      lastOps: null,
      launchResult: null,
      attempts: []
    });

    function escapeHtml(s) {
      return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
    function fmtKm(m) { return m >= 1000 ? `${(m / 1000).toFixed(m >= 10000 ? 0 : 1)} km` : `${m < 10 ? m.toFixed(1) : m.toFixed(0)} m`; }
    function makeMission(ev) { return { ...ev, target: { lat: ev.lat, lon: ev.lon }, rules: MISSION_RULES[ev.category] || MISSION_RULES.default }; }
    function storageGet(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }
    function storageSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage unavailable */ } }
    function fetchWithTimeout(url, ms = 9000) {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), ms);
      return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(t));
    }

    /* ---------------- NASA EONET: live mission briefs ---------------- */
    async function fetchEonetLive() {
      state.eonetStatus = 'loading';
      if (state.phase === 'brief') renderBriefPhase();
      try {
        const r = await fetchWithTimeout('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=45&limit=120');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const j = await r.json();
        const out = [];
        for (const e of j.events || []) {
          const cat = e.categories?.[0]?.id;
          if (!['severeStorms', 'volcanoes', 'floods', 'wildfires'].includes(cat)) continue;
          const geo = e.geometry?.[e.geometry.length - 1];
          if (!geo) continue;
          let lon, lat;
          if (geo.type === 'Point') [lon, lat] = geo.coordinates;
          else if (geo.type === 'Polygon') {
            const ring = geo.coordinates[0];
            lon = ring.reduce((a, p) => a + p[0], 0) / ring.length;
            lat = ring.reduce((a, p) => a + p[1], 0) / ring.length;
          } else continue;
          if (!isFinite(lat) || !isFinite(lon)) continue;
          const dist = Math.hypot(lat - 12.5, (lon - 122) * Math.cos(12.5 * Math.PI / 180));
          out.push({
            key: e.id, eonetId: e.id, title: e.title, category: cat, lat, lon,
            date: String(geo.date || '').slice(0, 10), place: `${lat.toFixed(1)}°, ${lon.toFixed(1)}°`,
            origin: 'LIVE · NASA EONET', magnitude: geo.magnitudeValue ? `${geo.magnitudeValue} ${geo.magnitudeUnit || ''}`.trim() : '',
            note: 'Open event right now in NASA\'s Earth Observatory Natural Event Tracker.', dist
          });
        }
        // Prefer events near the Philippines, keep a mix of categories
        out.sort((a, b) => a.dist - b.dist);
        const picked = [];
        const perCat = {};
        for (const ev of out) {
          perCat[ev.category] = (perCat[ev.category] || 0) + 1;
          if (perCat[ev.category] <= 3) picked.push(ev);
          if (picked.length >= 8) break;
        }
        state.liveMissions = picked;
        state.eonetStatus = picked.length ? 'live' : 'offline';
      } catch (err) {
        state.liveMissions = [];
        state.eonetStatus = 'offline';
      }
      if (state.phase === 'brief') renderBriefPhase();
    }

    /* ---------------- NASA GIBS: real satellite imagery ---------------- */
    function gibsDate(dateStr) {
      const d = new Date((dateStr || '2024-01-01') + 'T00:00:00Z');
      const limit = new Date(Date.now() - 2 * 86400000);
      return (d > limit ? limit : d).toISOString().slice(0, 10);
    }
    function gibsLayersFor(dateStr) {
      const y = parseInt((dateStr || '2020').slice(0, 4), 10);
      return y < 2018
        ? ['MODIS_Terra_CorrectedReflectance_TrueColor', 'MODIS_Aqua_CorrectedReflectance_TrueColor']
        : ['VIIRS_NOAA20_CorrectedReflectance_TrueColor', 'VIIRS_SNPP_CorrectedReflectance_TrueColor', 'MODIS_Aqua_CorrectedReflectance_TrueColor', 'MODIS_Terra_CorrectedReflectance_TrueColor'];
    }
    function gibsUrl(layer, lat, lon, dateStr, sceneKm, px, withTime = true) {
      const dLat = sceneKm / 111.2 / 2;
      const dLon = dLat / Math.max(0.2, Math.cos(lat * Math.PI / 180));
      const bbox = [lon - dLon, lat - dLat, lon + dLon, lat + dLat].map(v => v.toFixed(4)).join(',');
      return `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1&LAYERS=${layer}&STYLES=&FORMAT=image/jpeg&SRS=EPSG:4326&BBOX=${bbox}&WIDTH=${px}&HEIGHT=${px}${withTime ? `&TIME=${gibsDate(dateStr)}` : ''}`;
    }
    const gibsCache = new Map();
    function loadImage(url, cors) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        if (cors) img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('load failed'));
        img.src = url;
      });
    }
    function imageLooksEmpty(img) {
      try {
        const c = document.createElement('canvas');
        c.width = 32; c.height = 32;
        const cx = c.getContext('2d');
        cx.drawImage(img, 0, 0, 32, 32);
        const d = cx.getImageData(0, 0, 32, 32).data;
        let sum = 0;
        for (let i = 0; i < d.length; i += 4) sum += d[i] + d[i + 1] + d[i + 2];
        return sum / (d.length / 4) / 3 < 6;
      } catch (e) { return false; } // tainted (no CORS): assume fine
    }
    async function loadGibsScene(lat, lon, dateStr, sceneKm, px = 512) {
      const key = [lat.toFixed(3), lon.toFixed(3), dateStr, sceneKm, px].join('|');
      if (gibsCache.has(key)) return gibsCache.get(key);
      for (const layer of gibsLayersFor(dateStr)) {
        const url = gibsUrl(layer, lat, lon, dateStr, sceneKm, px);
        for (const cors of [true, false]) {
          try {
            const img = await loadImage(url, cors);
            if (cors && imageLooksEmpty(img)) break; // empty swath gap → try next layer
            const res = { img, layer, date: gibsDate(dateStr), sceneKm, px };
            gibsCache.set(key, res);
            return res;
          } catch (e) { /* try next */ }
        }
      }
      gibsCache.set(key, null);
      return null;
    }
    let blueMarblePromise = null;
    function loadBlueMarble() {
      if (!blueMarblePromise) {
        const url = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1&LAYERS=BlueMarble_ShadedRelief_Bathymetry&STYLES=&FORMAT=image/jpeg&SRS=EPSG:4326&BBOX=-180,-90,180,90&WIDTH=1024&HEIGHT=512';
        blueMarblePromise = loadImage(url, false).catch(() => null);
      }
      return blueMarblePromise;
    }

    /** Draw NASA image into canvas; if gsdM given, degrade to that ground resolution. */
    function drawSceneToCanvas(canvas, scene, gsdM, label) {
      const cx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      cx.fillStyle = '#1c1c1c';
      cx.fillRect(0, 0, W, H);
      if (!scene) {
        // Offline placeholder (clearly labelled)
        cx.fillStyle = '#2b241b';
        cx.fillRect(0, 0, W, H);
        cx.strokeStyle = '#635645';
        for (let i = 0; i < W; i += 16) { cx.beginPath(); cx.moveTo(i, 0); cx.lineTo(i, H); cx.stroke(); }
        cx.fillStyle = '#e4d6b9';
        cx.font = '700 12px "IBM Plex Mono", monospace';
        cx.textAlign = 'center';
        cx.fillText('NASA GIBS IMAGERY OFFLINE', W / 2, H / 2 - 8);
        cx.font = '500 10px "IBM Plex Mono", monospace';
        cx.fillText('Connect to the internet to load', W / 2, H / 2 + 8);
        cx.fillText('real MODIS / VIIRS imagery', W / 2, H / 2 + 22);
        return;
      }
      const srcRes = scene.sceneKm * 1000 / scene.px;
      if (gsdM && gsdM > srcRes * 1.05) {
        const n = Math.max(2, Math.round(scene.sceneKm * 1000 / gsdM));
        const tmp = document.createElement('canvas');
        tmp.width = n; tmp.height = n;
        const tx = tmp.getContext('2d');
        tx.imageSmoothingEnabled = true;
        tx.drawImage(scene.img, 0, 0, n, n);
        cx.imageSmoothingEnabled = false;
        cx.drawImage(tmp, 0, 0, W, H);
      } else {
        cx.imageSmoothingEnabled = true;
        cx.drawImage(scene.img, 0, 0, W, H);
      }
      // target crosshair
      cx.strokeStyle = 'rgba(232,185,49,0.9)';
      cx.lineWidth = 1.5;
      cx.beginPath();
      cx.arc(W / 2, H / 2, 10, 0, Math.PI * 2);
      cx.moveTo(W / 2 - 18, H / 2); cx.lineTo(W / 2 - 6, H / 2);
      cx.moveTo(W / 2 + 6, H / 2); cx.lineTo(W / 2 + 18, H / 2);
      cx.stroke();
      if (label) {
        cx.fillStyle = 'rgba(43,36,27,0.82)';
        cx.fillRect(0, H - 20, W, 20);
        cx.fillStyle = '#f3ead6';
        cx.font = '600 10px "IBM Plex Mono", monospace';
        cx.textAlign = 'left';
        cx.fillText(label, 6, H - 6);
      }
    }

    /* ---------------- NASA DONKI: live space weather ---------------- */
    async function fetchDonkiLive(startStr, endStr) {
      const bases = [
        b => `https://api.nasa.gov/DONKI/${b}?startDate=${startStr}&endDate=${endStr}&api_key=DEMO_KEY`,
        b => `https://ccmc.gsfc.nasa.gov/DONKI-API/get/${b}?startDate=${startStr}&endDate=${endStr}`,
        b => `https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/${b}?startDate=${startStr}&endDate=${endStr}`
      ];
      for (const mk of bases) {
        try {
          const [fr, gr] = await Promise.all([fetchWithTimeout(mk('FLR')), fetchWithTimeout(mk('GST'))]);
          if (!fr.ok || !gr.ok) throw new Error('HTTP');
          const flr = await fr.json();
          const gst = await gr.json();
          const events = [];
          for (const f of Array.isArray(flr) ? flr : []) {
            const cls = f.classType || '';
            if (!/^[XM]/.test(cls)) continue;
            events.push({ date: String(f.peakTime || f.beginTime).slice(0, 10), type: 'FLR', cls, text: `${cls} solar flare (DONKI ${f.flrID || ''})` });
          }
          for (const g of Array.isArray(gst) ? gst : []) {
            const kp = Math.max(0, ...(g.allKpIndex || []).map(k => k.kpIndex || 0));
            events.push({ date: String(g.startTime).slice(0, 10), type: 'GST', kp: Math.round(kp), text: `Geomagnetic storm, Kp ${kp} (DONKI ${g.gstID || ''})` });
          }
          return events;
        } catch (e) { /* try next endpoint */ }
      }
      return null;
    }

    /* ---------------- Phase control ---------------- */
    function enterBuildMode() {
      state.mode = 'build';
      sim.active = false;
      document.getElementById('sim-hud').classList.add('hidden');
      document.getElementById('build-status-bar').classList.remove('hidden');
      document.getElementById('fbd-build-test-controls').classList.remove('hidden');
      recalculateAndRefreshUI();
    }
    function enterSimMode() {
      if (!state.physics || computeCraftPhysics(state.grid, state.cols, state.rows, {}).pixelCount === 0) {
        showToast('Draw a spacecraft on the parchment sheet first!');
        return false;
      }
      state.mode = 'sim';
      sim.active = true;
      resetSimulation(false);
      document.getElementById('sim-hud').classList.remove('hidden');
      document.getElementById('build-status-bar').classList.add('hidden');
      document.getElementById('fbd-build-test-controls').classList.add('hidden');
      // keep the flight controls clear: collapse the FBD panel to its compact bar
      if (!state.fbdMinimized) document.getElementById('btn-fbd-minimize').click();
      recalculateAndRefreshUI();
      return true;
    }

    function setPhase(phase) {
      if (!PHASES.includes(phase)) return;
      if (phase === 'flight') {
        if (!enterSimMode()) return;
      } else if (state.mode === 'sim') {
        enterBuildMode();
      }
      state.phase = phase;
      document.querySelectorAll('.phase-btn').forEach(b => b.classList.toggle('active', b.dataset.phase === phase));
      const overlay = document.getElementById('mission-overlay');
      const overlayPhase = ['brief', 'launch', 'ops', 'review'].includes(phase);
      overlay.classList.toggle('hidden', !overlayPhase);
      if (phase === 'brief') renderBriefPhase();
      if (phase === 'launch') renderLaunchPhase();
      if (phase === 'ops') renderOpsPhase();
      if (phase === 'review') renderReviewPhase();
      if (phase === 'design' && window.innerWidth < 1024) {
        document.querySelector('[data-mobile-tab="canvas"]')?.click();
      }
      refreshMissionUI();
    }

    /* ---------------- Live budget dock (the drawing IS the budget) ---------------- */
    function refreshMissionUI() {
      if (!state.mission) return;
      state.analysis = computeMission(state.grid, state.cols, state.rows, state.mission, state.orbit);
      renderBudgetDock(state.analysis);
    }

    function reqRatio(a, id) {
      switch (id) {
        case 'liftoff': return a.dvInfo.liftoffTWR / 1.3;
        case 'orbit': return a.dvInfo.totalDv / Math.max(1, a.dvReq);
        case 'budget': return a.rules.budget / Math.max(1, a.totalCost);
        case 'power': return (a.genAvg * 0.9) / Math.max(0.1, a.loadAvg);
        case 'battery': return a.batteryUsableWh / Math.max(0.1, a.eclipseWh);
        case 'downlink': return a.dataMbitDay > 0 ? a.downlinkMbitDay / a.dataMbitDay : (a.rateMbps > 0 ? 2 : 0);
        case 'gsd': return a.best ? a.rules.gsd / a.best.gsd : 0;
        case 'revisit': return a.best && isFinite(a.best.revisit) ? a.rules.revisit / a.best.revisit : 0;
        default: return null;
      }
    }

    function orbitControlsHtml(prefix) {
      const o = state.orbit;
      return `
        <div class="bd-orbit">
          <label class="bd-lbl">ALTITUDE <strong id="${prefix}-alt-val">${o.altitudeKm} km</strong></label>
          <input id="${prefix}-alt" type="range" min="250" max="900" step="10" value="${o.altitudeKm}" class="w-full" />
          <label class="bd-lbl mt-1">INCLINATION</label>
          <div class="bd-inc">
            ${ORBIT_INCLINATIONS.map(i => `<button type="button" data-inc="${i.value}" title="${escapeHtml(i.hint)}" class="draft-btn bd-inc-btn ${o.inclination === i.value ? 'active' : ''}">${i.label}</button>`).join('')}
          </div>
        </div>`;
    }
    function bindOrbitControls(prefix, rerender) {
      const alt = document.getElementById(`${prefix}-alt`);
      if (alt) alt.addEventListener('input', (e) => {
        state.orbit.altitudeKm = Number(e.target.value);
        document.getElementById(`${prefix}-alt-val`).textContent = `${state.orbit.altitudeKm} km`;
        refreshMissionUI();
        if (rerender) rerender(true);
      });
      document.querySelectorAll(`#${prefix}-wrap .bd-inc-btn`).forEach(btn => btn.addEventListener('click', () => {
        state.orbit.inclination = Number(btn.dataset.inc);
        refreshMissionUI();
        if (rerender) rerender(false); else renderBudgetDock(state.analysis);
      }));
    }

    function renderBudgetDock(a) {
      const el = document.getElementById('budget-dock');
      if (!el || !state.mission) return;
      const m = state.mission;
      if (!a || a.empty) {
        el.innerHTML = `<div class="bd-head"><span>MISSION BUDGETS</span></div><p class="bd-note">Draw a rocket + satellite to see the mass, Δv, power, data and cost budgets.</p>`;
        return;
      }
      const score = a.designScore;
      const scoreColor = score >= 85 ? '#246b50' : score >= 60 ? '#b36b1d' : '#b83a2d';
      const stageTxt = a.dvInfo.stages.map((s, i) => i === a.dvInfo.stages.length - 1 && s.dv < 1
        ? `${pxIcon('satellite', 12)} Satellite ${a.payloadMass.toFixed(1)} kg`
        : `S${i + 1} ${(s.dv / 1000).toFixed(2)} km/s`).join(' · ');
      const c = a.counts || {};
      const parts = ['computer', 'solar', 'battery', 'antenna_s', 'antenna_x', 'wheel', 'imager_wide', 'telescope', 'radar']
        .filter(id => c[id]).map(id => `${c[id]}× ${MATERIAL_MAP[id].shortName}`).join(', ') || 'no subsystems yet';
      el.innerHTML = `
        <div class="bd-head">
          <span>MISSION BUDGETS <span class="bd-sub">(live from your drawing)</span></span>
          <span class="bd-score" style="background:${scoreColor}">${score}/100</span>
        </div>
        <button type="button" id="bd-mission" class="bd-mission" title="Change mission">
          <span>${catIcon(m.category)}</span>
          <span class="truncate">${escapeHtml(m.title)}</span>
          <span class="bd-change">change ›</span>
        </button>
        <div id="bd-wrap">${orbitControlsHtml('bd')}</div>
        <div class="bd-stages" title="Stages are split by rows containing a yellow Stage Decoupler. The TOP stage is your satellite.">${stageTxt}</div>
        <div class="bd-parts" title="Subsystems in the top stage (your satellite)">${pxIcon('satellite', 12)} ${escapeHtml(parts)}</div>
        ${a.stranded ? `<div class="bd-warn">${pxIcon('warning', 12)} ${a.stranded} subsystem pixel(s) sit on a lower stage and will be thrown away. Move them above the top decoupler.</div>` : ''}
        <div class="bd-rows">
          ${a.reqs.map(r => {
            const ratio = reqRatio(a, r.id);
            const pct = ratio === null ? (r.pass ? 100 : 0) : Math.max(4, Math.min(100, ratio * 100));
            return `
              <div class="bd-row ${r.pass ? 'pass' : 'fail'}" title="${escapeHtml(r.why + (r.pass ? '' : ' → ' + r.fix))}">
                <div class="bd-row-top"><span class="bd-dot"></span><span class="bd-name">${REQ_SHORT[r.id] || r.label}</span><span class="bd-val">${escapeHtml(r.value)}</span></div>
                <div class="bd-bar"><div style="width:${pct}%"></div></div>
                <div class="bd-target">target ${escapeHtml(r.target)}</div>
              </div>`;
          }).join('')}
        </div>
        <div class="bd-foot">Hover a row to see why it passes or fails. <button type="button" id="bd-to-launch" class="draft-btn-primary bd-go">Launch ›</button></div>`;
      document.getElementById('bd-mission').addEventListener('click', () => setPhase('brief'));
      document.getElementById('bd-to-launch').addEventListener('click', () => setPhase('launch'));
      bindOrbitControls('bd', null);
    }

    /* ---------------- Phase 1: BRIEF ---------------- */
    let briefSelectedKey = null;
    function allMissions() {
      return [...state.liveMissions, ...MISSION_SNAPSHOT];
    }
    function renderBriefPhase() {
      const body = document.getElementById('mission-overlay-body');
      const list = allMissions();
      if (!briefSelectedKey) briefSelectedKey = state.mission?.key || list[0].key;
      const sel = list.find(m => m.key === briefSelectedKey) || list[0];
      const rules = MISSION_RULES[sel.category] || MISSION_RULES.default;
      const statusPill = {
        idle: '<span class="mo-pill">EONET: not loaded</span>',
        loading: '<span class="mo-pill mo-pill-amber">EONET: loading live events…</span>',
        live: `<span class="mo-pill mo-pill-green">EONET: ${state.liveMissions.length} LIVE events</span>`,
        offline: '<span class="mo-pill mo-pill-red">EONET offline — using saved NASA snapshot</span>'
      }[state.eonetStatus];
      body.innerHTML = `
        <div class="mo-header">
          <div>
            <div class="mo-kicker">PHASE 1 OF 6 · MISSION BRIEF</div>
            <h2 class="mo-h1">Earth needs a satellite. Pick a real event.</h2>
            <p class="mo-lead">Missions come from <strong>NASA EONET</strong> (Earth Observatory Natural Event Tracker). Each event type sets real requirements: how sharp, how often, and how cheap.</p>
          </div>
          <div class="mo-actions">${statusPill}<button type="button" id="brief-refresh" class="draft-btn mo-btn">${pxIcon('refresh')} Refresh live</button></div>
        </div>
        <div class="mo-brief-layout">
          <div class="mo-grid">
            ${list.map(m => `
              <button type="button" class="mo-mission-card ${m.key === sel.key ? 'selected' : ''}" data-key="${escapeHtml(m.key)}">
                <div class="mo-mc-top"><span class="mo-mc-icon">${catIcon(m.category, 22)}</span><span class="mo-mc-origin ${m.origin.startsWith('LIVE') ? 'live' : ''}">${escapeHtml(m.origin)}</span></div>
                <div class="mo-mc-title">${escapeHtml(m.title)}</div>
                <div class="mo-mc-meta">${escapeHtml(m.place)} · ${escapeHtml(m.date)}${m.magnitude ? ' · ' + escapeHtml(m.magnitude) : ''}</div>
              </button>`).join('')}
          </div>
          <div class="mo-card mo-detail">
            <div class="mo-kicker">${escapeHtml(rules.label.toUpperCase())}${sel.eonetId ? ' · ' + escapeHtml(sel.eonetId) : ''}</div>
            <h3 class="mo-h2">${catIcon(sel.category, 18)} ${escapeHtml(sel.title)}</h3>
            <div class="mo-img-wrap">
              <canvas id="brief-gibs" width="360" height="360" class="mo-img"></canvas>
              <div id="brief-gibs-cap" class="mo-cap">Loading NASA GIBS imagery for ${escapeHtml(gibsDate(sel.date))}…</div>
            </div>
            <p class="mo-note">${escapeHtml(sel.note || '')}</p>
            <div class="mo-reqs">
              <div><span>Resolution</span><strong>≤ ${fmtKm(rules.gsd)}</strong></div>
              <div><span>Revisit</span><strong>≤ ${rules.revisit} days</strong></div>
              <div><span>Images in 14 days</span><strong>≥ ${rules.images}</strong></div>
              <div><span>Budget</span><strong>$${(rules.budget / 1000).toFixed(1)}M</strong></div>
              <div><span>Target latitude</span><strong>${sel.lat.toFixed(1)}°</strong></div>
              <div><span>Cloud cover</span><strong>${Math.round(rules.cloud * 100)}%</strong></div>
            </div>
            <p class="mo-why">${pxIcon('bulb')} ${escapeHtml(rules.why)}</p>
            <button type="button" id="brief-accept" class="draft-btn-primary mo-btn-big">Accept mission → Design your spacecraft</button>
          </div>
        </div>
        <div class="mo-card mo-howto">
          <strong>How NASA data drives the game:</strong>
          <span>EONET → mission briefs</span><span>GIBS → what your satellite actually sees</span><span>DONKI → real space weather in operations</span><span>SmallSat State-of-the-Art report → part specs</span><span>US Standard Atmosphere 1976 → drag</span>
          <button type="button" id="brief-sources" class="draft-btn mo-btn">See all sources</button>
        </div>`;
      body.querySelectorAll('.mo-mission-card').forEach(btn => btn.addEventListener('click', () => { briefSelectedKey = btn.dataset.key; renderBriefPhase(); }));
      document.getElementById('brief-refresh').addEventListener('click', fetchEonetLive);
      document.getElementById('brief-sources').addEventListener('click', showSourcesModal);
      document.getElementById('brief-accept').addEventListener('click', () => {
        state.mission = makeMission(sel);
        const iEff = state.orbit.inclination > 90 ? 180 - state.orbit.inclination : state.orbit.inclination;
        if (Math.abs(sel.lat) > iEff + 8) showToast(`Heads up: target at ${sel.lat.toFixed(1)}° — consider a Sun-synchronous orbit.`);
        state.lastOps = null;
        state.launchResult = null;
        showToast(`Mission accepted: ${sel.title}`);
        setPhase('design');
      });
      const canvas = document.getElementById('brief-gibs');
      drawSceneToCanvas(canvas, null);
      const sceneKm = Math.max(rules.sceneKm, 60);
      loadGibsScene(sel.lat, sel.lon, sel.date, sceneKm, 512).then(scene => {
        if (briefSelectedKey !== sel.key || !document.getElementById('brief-gibs')) return;
        drawSceneToCanvas(canvas, scene, null, scene ? `${scene.layer.split('_')[0]} ${scene.layer.split('_')[1]} · ${scene.date}` : '');
        document.getElementById('brief-gibs-cap').textContent = scene
          ? `Real NASA GIBS image (${scene.layer.replace(/_/g, ' ')}), ${scene.date}, ${sceneKm} km across.`
          : 'Imagery unavailable offline — the mission still works with the saved snapshot.';
      });
    }

    /* ---------------- Phase 4: LAUNCH & ORBIT ---------------- */
    let launchAnim = null;
    function renderLaunchPhase(keepCanvas) {
      const a = state.analysis;
      const body = document.getElementById('mission-overlay-body');
      if (!a || a.empty) {
        body.innerHTML = `<div class="mo-card"><h2 class="mo-h1">Nothing to launch yet</h2><p>Draw a rocket in the Design phase first.</p><button type="button" class="draft-btn-primary mo-btn" onclick="setPhase('design')">Go to Design</button></div>`;
        return;
      }
      const dvParts = {
        orbital: circVel(200) * 1000,
        climb: hohmannDv(200, Math.max(200, state.orbit.altitudeKm)),
        losses: 1800 + a.dvInfo.extraLoss,
        rotation: -465.1 * Math.cos(state.orbit.inclination * Math.PI / 180)
      };
      const lifeTxt = a.life < 1 ? `${(a.life * 12).toFixed(0)} months` : `${a.life.toFixed(a.life < 10 ? 1 : 0)} years`;
      const statsHtml = `
        <div class="mo-stats">
          <div><span>Orbital period</span><strong>${(a.period / 60).toFixed(1)} min</strong></div>
          <div><span>Time in Earth's shadow</span><strong>${(a.eclipseH * 60).toFixed(0)} min / orbit</strong></div>
          <div><span>Ground-station contact</span><strong>${(a.contactS / 60).toFixed(0)} min / day</strong></div>
          <div><span>Orbit lifetime (drag)</span><strong>${lifeTxt}</strong></div>
          <div><span>Revisit of target</span><strong>${a.best && isFinite(a.best.revisit) ? a.best.revisit.toFixed(1) + ' days' : 'never'}</strong></div>
          <div><span>Ground resolution</span><strong>${a.best ? fmtKm(a.best.gsd) : '—'}</strong></div>
        </div>
        <div class="mo-dvtable">
          <div class="mo-kicker">WHERE THE Δv GOES (required ${(a.dvReq / 1000).toFixed(2)} km/s)</div>
          <div><span>Orbital speed at 200 km</span><strong>${(dvParts.orbital / 1000).toFixed(2)} km/s</strong></div>
          <div><span>Climb to ${state.orbit.altitudeKm} km (Hohmann)</span><strong>+${dvParts.climb.toFixed(0)} m/s</strong></div>
          <div><span>Gravity + drag losses${a.dvInfo.extraLoss > 0 ? ' (low TWR penalty incl.)' : ''}</span><strong>+${dvParts.losses.toFixed(0)} m/s</strong></div>
          <div><span>Earth's rotation (${state.orbit.inclination}°) ${dvParts.rotation < 0 ? 'helps' : 'hurts'}</span><strong>${dvParts.rotation < 0 ? '−' : '+'}${Math.abs(dvParts.rotation).toFixed(0)} m/s</strong></div>
        </div>`;
      if (keepCanvas && document.getElementById('launch-stats')) {
        document.getElementById('launch-stats').innerHTML = statsHtml;
        drawDvChart();
        drawGroundTrack();
        return;
      }
      body.innerHTML = `
        <div class="mo-header">
          <div>
            <div class="mo-kicker">PHASE 4 OF 6 · LAUNCH &amp; ORBIT</div>
            <h2 class="mo-h1">Can your rocket get there?</h2>
            <p class="mo-lead">The <strong>rocket equation</strong> Δv = Isp · g₀ · ln(m₀ / m_f) is applied to every stage you drew. Choose the orbit, then launch.</p>
          </div>
          <div class="mo-actions"><button type="button" class="draft-btn mo-btn" id="launch-back">‹ Back to Design</button></div>
        </div>
        <div class="mo-launch-layout">
          <div class="mo-card">
            <div id="lp-wrap">${orbitControlsHtml('lp')}</div>
            <canvas id="dv-chart" width="420" height="190" class="mo-chart"></canvas>
            <div id="launch-stats">${statsHtml}</div>
          </div>
          <div class="mo-card">
            <canvas id="orbit-canvas" width="460" height="300" class="mo-chart"></canvas>
            <div class="mo-row">
              <button type="button" id="btn-launch-go" class="draft-btn-primary mo-btn-big">${pxIcon('rocket', 16)} LAUNCH</button>
              <button type="button" id="btn-launch-next" class="draft-btn mo-btn ${state.launchResult?.success ? '' : 'opacity-50'}">Operations ›</button>
            </div>
            <ol id="launch-log" class="mo-log">${state.launchResult ? state.launchResult.log.map(l => `<li class="${l.cls || ''}">${l.text}</li>`).join('') : '<li>Press LAUNCH to fly the mission.</li>'}</ol>
            <canvas id="groundtrack-canvas" width="460" height="230" class="mo-chart"></canvas>
            <div class="mo-cap">Ground track over NASA Blue Marble (GIBS). Shaded band = latitudes your orbit can see. ${pxIcon('target', 12)} target · ${pxIcon('station', 12)} ground station (Manila).</div>
          </div>
        </div>`;
      document.getElementById('launch-back').addEventListener('click', () => setPhase('design'));
      document.getElementById('btn-launch-go').addEventListener('click', runLaunch);
      document.getElementById('btn-launch-next').addEventListener('click', () => setPhase('ops'));
      bindOrbitControls('lp', (keep) => { state.launchResult = null; renderLaunchPhase(keep); });
      drawDvChart();
      drawOrbitScene(state.launchResult ? (state.launchResult.success ? 1 : state.launchResult.frac) : 0, !!state.launchResult?.success);
      drawGroundTrack();
    }

    function drawDvChart() {
      const a = state.analysis;
      const cv = document.getElementById('dv-chart');
      if (!cv || !a) return;
      const cx = cv.getContext('2d');
      const W = cv.width, H = cv.height;
      cx.clearRect(0, 0, W, H);
      cx.fillStyle = '#f3ead6'; cx.fillRect(0, 0, W, H);
      const maxV = Math.max(a.dvReq, a.dvInfo.totalDv) * 1.12;
      const x0 = 40, x1 = W - 14, yBar = 70, bh = 34;
      const sx = v => x0 + (v / maxV) * (x1 - x0);
      cx.font = '700 11px "IBM Plex Mono", monospace';
      cx.fillStyle = '#2b241b';
      cx.textAlign = 'left';
      cx.fillText('Δv YOU HAVE (per stage)', x0, 20);
      let acc = 0;
      const colors = ['#255c85', '#3b7ea1', '#5499bd', '#7ab5d4'];
      a.dvInfo.stages.forEach((s, i) => {
        if (s.dv <= 0) return;
        cx.fillStyle = colors[i % colors.length];
        cx.fillRect(sx(acc), yBar - bh, sx(acc + s.dv) - sx(acc), bh);
        cx.strokeStyle = '#2b241b'; cx.lineWidth = 1.2;
        cx.strokeRect(sx(acc), yBar - bh, sx(acc + s.dv) - sx(acc), bh);
        cx.fillStyle = '#fdf9f0';
        cx.font = '700 10px "IBM Plex Mono", monospace';
        if (sx(acc + s.dv) - sx(acc) > 50) cx.fillText(`S${i + 1} ${(s.dv / 1000).toFixed(2)}`, sx(acc) + 4, yBar - bh / 2 + 4);
        acc += s.dv;
      });
      cx.fillStyle = '#2b241b';
      cx.font = '700 11px "IBM Plex Mono", monospace';
      cx.fillText('Δv YOU NEED', x0, 108);
      cx.fillStyle = 'rgba(184,58,45,0.25)';
      cx.fillRect(x0, 116, sx(a.dvReq) - x0, 26);
      cx.strokeStyle = '#b83a2d'; cx.strokeRect(x0, 116, sx(a.dvReq) - x0, 26);
      cx.fillStyle = '#b83a2d';
      cx.fillText(`${(a.dvReq / 1000).toFixed(2)} km/s`, x0 + 6, 133);
      // requirement line
      cx.setLineDash([4, 3]);
      cx.beginPath(); cx.moveTo(sx(a.dvReq), 26); cx.lineTo(sx(a.dvReq), 146); cx.stroke();
      cx.setLineDash([]);
      const ok = a.dvInfo.totalDv >= a.dvReq && a.dvInfo.liftoffTWR >= 1;
      cx.fillStyle = ok ? '#246b50' : '#b83a2d';
      cx.font = '700 12px "IBM Plex Mono", monospace';
      cx.fillText(a.dvInfo.liftoffTWR < 1 ? `NO LIFTOFF — TWR ${a.dvInfo.liftoffTWR.toFixed(2)} — cannot lift off` :
        ok ? `MAKES ORBIT — ${(a.dvInfo.totalDv / 1000).toFixed(2)} km/s, margin ${(a.dvInfo.totalDv - a.dvReq).toFixed(0)} m/s` :
          `FALLS SHORT — ${(a.dvInfo.totalDv / 1000).toFixed(2)} km/s, short ${(a.dvReq - a.dvInfo.totalDv).toFixed(0)} m/s`, x0, 172);
      cx.fillStyle = '#635645';
      cx.font = '500 9px "IBM Plex Mono", monospace';
      cx.fillText('0', x0 - 8, yBar + 12);
    }

    function drawOrbitScene(progress, success, falling) {
      const cv = document.getElementById('orbit-canvas');
      if (!cv) return;
      const cx = cv.getContext('2d');
      const W = cv.width, H = cv.height;
      cx.fillStyle = '#1e1c2e'; cx.fillRect(0, 0, W, H);
      cx.fillStyle = 'rgba(243,234,214,0.6)';
      for (let i = 0; i < 70; i++) cx.fillRect((i * 131.7) % W, (i * 71.3 + i * i * 0.7) % H, 1.2, 1.2);
      const ecx = W * 0.42, ecy = H * 0.55, Re = Math.min(W, H) * 0.3;
      const exag = 3;
      const Ro = Re * (1 + exag * state.orbit.altitudeKm / R_E);
      // shadow
      cx.fillStyle = 'rgba(0,0,0,0.45)';
      cx.beginPath();
      cx.moveTo(ecx, ecy - Re); cx.lineTo(W, ecy - Re); cx.lineTo(W, ecy + Re); cx.lineTo(ecx, ecy + Re); cx.closePath(); cx.fill();
      // Earth
      const grd = cx.createRadialGradient(ecx - Re * 0.3, ecy - Re * 0.3, Re * 0.1, ecx, ecy, Re);
      grd.addColorStop(0, '#5499bd'); grd.addColorStop(1, '#1c4666');
      cx.fillStyle = grd;
      cx.beginPath(); cx.arc(ecx, ecy, Re, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = '#246b50';
      cx.beginPath(); cx.ellipse(ecx - Re * 0.2, ecy - Re * 0.1, Re * 0.25, Re * 0.4, 0.4, 0, Math.PI * 2); cx.fill();
      // orbit ring
      cx.strokeStyle = 'rgba(232,185,49,0.8)'; cx.setLineDash([5, 4]); cx.lineWidth = 1.5;
      cx.beginPath(); cx.arc(ecx, ecy, Ro, 0, Math.PI * 2); cx.stroke(); cx.setLineDash([]);
      cx.fillStyle = '#e8b931';
      cx.font = '600 10px "IBM Plex Mono", monospace';
      cx.textAlign = 'left';
      cx.fillText(`${state.orbit.altitudeKm} km orbit (altitude ×${exag} for visibility)`, 8, 16);
      cx.fillStyle = '#d8cdb5';
      cx.fillText('sunlight →', W - 78, 16);
      cx.fillStyle = '#e8b931'; cx.beginPath(); cx.arc(W - 88, 12, 5, 0, Math.PI * 2); cx.fill();
      cx.fillText('Earth\'s shadow (eclipse)', W - 160, ecy + Re + 14);
      // trajectory
      const launchAng = -Math.PI / 2 - 0.15;
      const pts = [];
      const N = 80;
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        const r = Re + (Ro - Re) * Math.sin(t * Math.PI / 2);
        const ang = launchAng + t * 1.1;
        pts.push([ecx + r * Math.cos(ang), ecy + r * Math.sin(ang)]);
      }
      if (progress > 0) {
        const upto = Math.floor(Math.min(1, progress) * N);
        cx.strokeStyle = success ? '#e8b931' : '#e07a2d';
        cx.lineWidth = 2;
        cx.beginPath();
        pts.slice(0, upto + 1).forEach((p, i) => i ? cx.lineTo(p[0], p[1]) : cx.moveTo(p[0], p[1]));
        cx.stroke();
        let pos = pts[upto];
        if (falling) {
          const f = Math.min(1, falling);
          const end = [ecx + Re * Math.cos(launchAng + progress * 1.1 + 0.2), ecy + Re * Math.sin(launchAng + progress * 1.1 + 0.2)];
          pos = [pos[0] + (end[0] - pos[0]) * f, pos[1] + (end[1] - pos[1]) * f];
          cx.strokeStyle = '#b83a2d'; cx.setLineDash([3, 3]);
          cx.beginPath(); cx.moveTo(pts[upto][0], pts[upto][1]); cx.lineTo(pos[0], pos[1]); cx.stroke(); cx.setLineDash([]);
        }
        if (success && progress >= 1) {
          const ang = launchAng + 1.1 + (performance.now() / 4000) % (Math.PI * 2);
          pos = [ecx + Ro * Math.cos(ang), ecy + Ro * Math.sin(ang)];
        }
        cx.fillStyle = success ? '#f3ead6' : '#e07a2d';
        cx.beginPath(); cx.arc(pos[0], pos[1], 4, 0, Math.PI * 2); cx.fill();
      }
    }

    function drawGroundTrack() {
      const cv = document.getElementById('groundtrack-canvas');
      if (!cv) return;
      const cx = cv.getContext('2d');
      const W = cv.width, H = cv.height;
      const draw = (bm) => {
        cx.fillStyle = '#d8c8a8'; cx.fillRect(0, 0, W, H);
        if (bm) cx.drawImage(bm, 0, 0, W, H);
        else {
          cx.strokeStyle = '#c9b99a';
          for (let x = 0; x <= W; x += W / 12) { cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, H); cx.stroke(); }
          for (let y = 0; y <= H; y += H / 6) { cx.beginPath(); cx.moveTo(0, y); cx.lineTo(W, y); cx.stroke(); }
        }
        const toXY = (lat, lon) => [((lon + 180) / 360) * W, ((90 - lat) / 180) * H];
        const inc = state.orbit.inclination;
        const iEff = inc > 90 ? 180 - inc : inc;
        cx.fillStyle = 'rgba(232,185,49,0.18)';
        const yTop = toXY(iEff, 0)[1], yBot = toXY(-iEff, 0)[1];
        cx.fillRect(0, yTop, W, yBot - yTop);
        // ground track for ~3 orbits
        const T = orbitPeriodS(state.orbit.altitudeKm);
        const we = 2 * Math.PI / 86164;
        const n = 2 * Math.PI / T;
        const iR = inc * Math.PI / 180;
        cx.strokeStyle = 'rgba(184,58,45,0.9)'; cx.lineWidth = 1.4;
        let prev = null;
        const lon0 = (state.mission?.lon ?? 122) - 40;
        for (let t = 0; t <= T * 3; t += 30) {
          const u = n * t;
          const lat = Math.asin(Math.sin(iR) * Math.sin(u)) * 180 / Math.PI;
          let lon = lon0 + (Math.atan2(Math.cos(iR) * Math.sin(u), Math.cos(u)) - we * t) * 180 / Math.PI;
          lon = ((lon + 540) % 360) - 180;
          const p = toXY(lat, lon);
          if (prev && Math.abs(p[0] - prev[0]) < W / 2) { cx.beginPath(); cx.moveTo(prev[0], prev[1]); cx.lineTo(p[0], p[1]); cx.stroke(); }
          prev = p;
        }
        // ground station & target
        const gs = toXY(14.6, 121.0);
        cx.fillStyle = '#2b241b';
        cx.beginPath(); cx.moveTo(gs[0], gs[1] - 6); cx.lineTo(gs[0] - 5, gs[1] + 4); cx.lineTo(gs[0] + 5, gs[1] + 4); cx.closePath(); cx.fill();
        if (state.mission) {
          const tp = toXY(state.mission.lat, state.mission.lon);
          cx.strokeStyle = '#e8b931'; cx.lineWidth = 2;
          cx.beginPath(); cx.arc(tp[0], tp[1], 6, 0, Math.PI * 2); cx.stroke();
          cx.beginPath(); cx.arc(tp[0], tp[1], 2, 0, Math.PI * 2); cx.stroke();
        }
        cx.fillStyle = 'rgba(43,36,27,0.8)';
        cx.fillRect(0, 0, 170, 16);
        cx.fillStyle = '#f3ead6';
        cx.font = '600 10px "IBM Plex Mono", monospace';
        cx.textAlign = 'left';
        cx.fillText(`${inc}° orbit · 3 revolutions`, 5, 12);
      };
      draw(null);
      loadBlueMarble().then(bm => { if (bm && document.getElementById('groundtrack-canvas') === cv) draw(bm); });
    }

    function runLaunch() {
      const a = state.analysis;
      if (!a || a.empty) return;
      if (launchAnim) cancelAnimationFrame(launchAnim);
      const log = [];
      const stages = a.dvInfo.stages;
      let t = 0;
      const success = a.reachesOrbit;
      const frac = a.dvInfo.liftoffTWR < 1 ? 0 : Math.min(0.97, a.dvInfo.totalDv / a.dvReq);
      if (a.dvInfo.liftoffTWR < 1) {
        log.push({ text: `T+0 s — Ignition. Thrust ${stages[0].thrust.toFixed(0)} N vs weight ${(a.totalMass * G0).toFixed(0)} N.`, cls: '' });
        log.push({ text: `${pxIcon('cross')} The rocket cannot leave the pad (TWR ${a.dvInfo.liftoffTWR.toFixed(2)}). Add engines or remove mass.`, cls: 'bad' });
      } else {
        log.push({ text: `T+0 s — Liftoff! TWR ${a.dvInfo.liftoffTWR.toFixed(2)}, mass ${a.totalMass.toFixed(0)} kg.`, cls: '' });
        let dvAcc = 0;
        stages.forEach((s, i) => {
          if (s.dv <= 0 && i === stages.length - 1) return;
          t += s.burnS;
          dvAcc += s.dv;
          if (s.dv > 0) log.push({ text: `T+${t.toFixed(0)} s — Stage ${i + 1} burnout: +${s.dv.toFixed(0)} m/s (Isp ${s.isp.toFixed(0)} s, ${s.burnS.toFixed(0)} s burn). Total ${(dvAcc / 1000).toFixed(2)} km/s.`, cls: '' });
          if (s.deadFuel > 0.01) log.push({ text: `${pxIcon('warning')} Stage ${i + 1} carries ${s.deadFuel.toFixed(1)} kg of fuel no engine in that stage can burn.`, cls: 'warn' });
          if (i < stages.length - 1) log.push({ text: i === stages.length - 2 ? `T+${(t + 2).toFixed(0)} s — ${pxIcon('satellite')} Satellite separation` : `T+${(t + 2).toFixed(0)} s — Stage ${i + 1} separation.`, cls: '' });
        });
        if (success) {
          log.push({ text: `${pxIcon('check')} ORBIT! ${state.orbit.altitudeKm} km × ${state.orbit.inclination}°, ${(a.period / 60).toFixed(1)} min per lap. Δv margin ${(a.dvInfo.totalDv - a.dvReq).toFixed(0)} m/s.`, cls: 'good' });
          if (!(a.counts.computer > 0)) log.push({ text: `${pxIcon('cross')} …but the satellite has no flight computer. It is a very expensive brick.`, cls: 'bad' });
        } else {
          log.push({ text: `${pxIcon('cross')} Out of propellant ${(a.dvReq - a.dvInfo.totalDv).toFixed(0)} m/s short of orbital speed. The upper stage falls back and burns up.`, cls: 'bad' });
          log.push({ text: `${pxIcon('bulb')} Fix: ${a.reqs.find(r => r.id === 'orbit').fix}`, cls: 'warn' });
        }
      }
      state.launchResult = { success, frac, log };
      const logEl = document.getElementById('launch-log');
      logEl.innerHTML = '';
      const start = performance.now();
      const dur = 3200;
      let shown = 0;
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const prog = success ? p : Math.min(frac, p);
        const falling = !success && p > frac ? (p - frac) / Math.max(0.05, 1 - frac) : 0;
        drawOrbitScene(prog, success && p >= 1, falling);
        const target = Math.ceil(p * log.length);
        while (shown < target) {
          const li = document.createElement('li');
          li.className = log[shown].cls || '';
          li.innerHTML = log[shown].text;
          logEl.appendChild(li);
          shown++;
        }
        if (p < 1 || success) {
          launchAnim = requestAnimationFrame(step);
          if (p >= 1 && success && !document.getElementById('orbit-canvas')) cancelAnimationFrame(launchAnim);
        }
        if (p >= 1) {
          const nb = document.getElementById('btn-launch-next');
          if (nb) nb.classList.toggle('opacity-50', !success);
          if (p >= 1 && !success) launchAnim = null;
        }
      };
      launchAnim = requestAnimationFrame(step);
    }

    /* ---------------- Phase 5: OPERATIONS ---------------- */
    let opsTimer = null;
    function currentSpaceWeather() {
      if (state.spaceWeatherKey === 'live' && state.liveSpaceWeather) return state.liveSpaceWeather;
      return SPACE_WEATHER_SNAPSHOTS[state.spaceWeatherKey] || SPACE_WEATHER_SNAPSHOTS.may2024;
    }
    function renderOpsPhase() {
      const a = state.analysis;
      const body = document.getElementById('mission-overlay-body');
      const sw = currentSpaceWeather();
      body.innerHTML = `
        <div class="mo-header">
          <div>
            <div class="mo-kicker">PHASE 5 OF 6 · MISSION OPERATIONS</div>
            <h2 class="mo-h1">14 days in orbit — with real space weather</h2>
            <p class="mo-lead">Replay a real window of solar flares and geomagnetic storms from <strong>NASA DONKI</strong> (Space Weather Database Of Notifications, Knowledge, Information). Your margins decide what survives.</p>
          </div>
          <div class="mo-actions">
            <select id="ops-sw" class="draft-btn mo-btn">
              ${Object.entries(SPACE_WEATHER_SNAPSHOTS).map(([k, v]) => `<option value="${k}" ${state.spaceWeatherKey === k ? 'selected' : ''}>${escapeHtml(v.label)}</option>`).join('')}
              <option value="live" ${state.spaceWeatherKey === 'live' ? 'selected' : ''}>LIVE: last 14 days from DONKI</option>
            </select>
            <button type="button" id="ops-run" class="draft-btn-primary mo-btn-big">${pxIcon('play')} Run operations</button>
          </div>
        </div>
        ${!a || !a.reachesOrbit ? `<div class="mo-card mo-alert">${pxIcon('warning')} Your current design does not reach orbit, so operations will fail immediately. <button type="button" class="draft-btn mo-btn" id="ops-to-launch">Check Launch &amp; Orbit</button></div>` : ''}
        <div class="mo-card">
          <div id="ops-timeline" class="mo-timeline"></div>
          <div class="mo-ops-layout">
            <canvas id="ops-chart" width="520" height="170" class="mo-chart"></canvas>
            <div id="ops-summary" class="mo-stats"></div>
          </div>
          <ol id="ops-log" class="mo-log"><li>Choose a space-weather window and press Run. Source: ${escapeHtml(sw.label)}</li></ol>
          <div class="mo-row"><button type="button" id="ops-next" class="draft-btn-primary mo-btn">Mission Review ›</button></div>
        </div>`;
      document.getElementById('ops-sw').addEventListener('change', async (e) => {
        state.spaceWeatherKey = e.target.value;
        if (e.target.value === 'live' && !state.liveSpaceWeather) {
          showToast('Fetching DONKI space weather…');
          const end = new Date(Date.now() - 86400000);
          const start = new Date(end.getTime() - 13 * 86400000);
          const iso = d => d.toISOString().slice(0, 10);
          const events = await fetchDonkiLive(iso(start), iso(end));
          if (events) {
            state.liveSpaceWeather = { label: `LIVE DONKI ${iso(start)} → ${iso(end)} (${events.length} events)`, start: iso(start), events };
            showToast(`DONKI: ${events.length} flare/storm events loaded`);
          } else {
            showToast('DONKI unreachable — using the May 2024 snapshot');
            state.spaceWeatherKey = 'may2024';
          }
          renderOpsPhase();
        }
      });
      document.getElementById('ops-run').addEventListener('click', runOps);
      document.getElementById('ops-next').addEventListener('click', () => setPhase('review'));
      document.getElementById('ops-to-launch')?.addEventListener('click', () => setPhase('launch'));
      if (state.lastOps) paintOps(state.lastOps, state.lastOps.days.length);
    }

    function runOps() {
      const a = state.analysis;
      if (!a || a.empty) return;
      const sw = currentSpaceWeather();
      const result = simulateOperations(a, sw.events, 14, sw.start);
      result.swLabel = sw.label;
      state.lastOps = result;
      if (opsTimer) clearInterval(opsTimer);
      let shown = 0;
      paintOps(result, 0);
      opsTimer = setInterval(() => {
        shown++;
        if (!document.getElementById('ops-timeline')) { clearInterval(opsTimer); return; }
        paintOps(result, shown);
        if (shown >= result.days.length) clearInterval(opsTimer);
      }, 280);
    }

    function paintOps(r, upto) {
      const tl = document.getElementById('ops-timeline');
      if (!tl) return;
      const a = state.analysis;
      const days = r.days.slice(0, upto);
      tl.innerHTML = (r.lost && r.days.length === 0)
        ? `<div class="mo-alert">${pxIcon('cross')} ${escapeHtml(r.lostReason)}</div>`
        : r.days.map((d, i) => {
            const vis = i < upto;
            const icons = [
              ...d.events.map(e => `<span title="${escapeHtml(e.text)}">${pxIcon(e.type === 'FLR' ? 'flare' : 'geostorm', 16)}</span>`),
              d.images ? `<span class="mo-day-img" title="${d.images} image(s)">${pxIcon('camera', 16)}${d.images > 1 ? d.images : ''}</span>` : '',
              d.safe ? `<span title="Safe mode">${pxIcon('warning', 16)}</span>` : ''
            ].join('');
            return `<div class="mo-day ${vis ? 'on' : ''} ${d.safe ? 'safe' : ''}"><div class="mo-day-date">${escapeHtml(d.date.slice(5))}</div><div class="mo-day-icons">${vis ? icons : ''}</div></div>`;
          }).join('');
      // chart
      const cv = document.getElementById('ops-chart');
      const cx = cv.getContext('2d');
      const W = cv.width, H = cv.height;
      cx.fillStyle = '#f3ead6'; cx.fillRect(0, 0, W, H);
      cx.strokeStyle = '#dfd3bc';
      for (let i = 0; i <= 14; i++) { const x = 30 + i * (W - 40) / 14; cx.beginPath(); cx.moveTo(x, 10); cx.lineTo(x, H - 20); cx.stroke(); }
      const px = i => 30 + (i + 0.5) * (W - 40) / 14;
      cx.font = '600 10px "IBM Plex Mono", monospace';
      cx.fillStyle = '#3c8d5a'; cx.fillText('Battery charge', 34, 20);
      cx.fillStyle = '#b83a2d'; cx.fillText('Altitude', 150, 20);
      if (days.length) {
        cx.strokeStyle = '#3c8d5a'; cx.lineWidth = 2;
        cx.beginPath();
        days.forEach((d, i) => { const y = (H - 24) - d.soc * (H - 50); i ? cx.lineTo(px(i), y) : cx.moveTo(px(i), y); });
        cx.stroke();
        const h0 = state.orbit.altitudeKm;
        const minH = Math.min(h0 - 5, ...days.map(d => d.h));
        cx.strokeStyle = '#b83a2d';
        cx.beginPath();
        days.forEach((d, i) => { const y = 28 + (h0 - d.h) / Math.max(1, h0 - minH) * (H - 60); i ? cx.lineTo(px(i), y) : cx.moveTo(px(i), y); });
        cx.stroke();
        cx.fillStyle = '#635645';
        cx.fillText(`${h0} km`, W - 60, 34);
        cx.fillText(`${minH.toFixed(0)} km`, W - 60, H - 26);
      }
      // summary
      const done = upto >= r.days.length;
      const imgsSoFar = days.reduce((s, d) => s + d.images, 0);
      document.getElementById('ops-summary').innerHTML = `
        <div><span>Images captured</span><strong>${imgsSoFar}</strong></div>
        <div><span>Delivered to ground</span><strong>${done ? r.delivered : '…'} / ${a?.rules.images ?? '?'} needed</strong></div>
        <div><span>Safe-mode days</span><strong>${days.filter(d => d.safe).length}</strong></div>
        <div><span>Altitude now</span><strong>${days.length ? days[days.length - 1].h.toFixed(1) : state.orbit.altitudeKm} km</strong></div>
        <div><span>Status</span><strong>${r.lost && done ? pxIcon('cross') + ' LOST' : done ? (r.delivered >= (a?.rules.images || 1) ? pxIcon('check') + ' SUCCESS' : pxIcon('partial') + ' PARTIAL') : 'running…'}</strong></div>`;
      const log = document.getElementById('ops-log');
      const lines = [];
      days.forEach(d => {
        d.events.forEach(e => lines.push(`<li class="ev">${pxIcon(e.type === 'FLR' ? 'flare' : 'geostorm')} <strong>${escapeHtml(d.date)}</strong> — NASA DONKI: ${escapeHtml(e.text)}</li>`));
        d.notes.forEach(n => {
          const cls = /SAFE|safe mode|lost|Re-entry/i.test(n) ? 'bad' : /Redundancy/.test(n) ? 'good' : '';
          const ico = /Re-entry/.test(n) ? 'reentry' : cls === 'bad' ? 'warning' : cls === 'good' ? 'check' : /clouds/i.test(n) ? 'floods' : /drag/i.test(n) ? 'geostorm' : 'info';
          lines.push(`<li class="${cls}">${pxIcon(ico)} ${escapeHtml(d.date)} · ${escapeHtml(n)}</li>`);
        });
        if (d.images) lines.push(`<li class="good">${pxIcon('camera')} ${escapeHtml(d.date)} · ${d.images} usable image(s) of the target</li>`);
      });
      if (done && r.lost) lines.push(`<li class="bad">${pxIcon('cross')} ${escapeHtml(r.lostReason)}</li>`);
      log.innerHTML = lines.length ? lines.join('') : `<li>Replaying: ${escapeHtml(r.swLabel || '')}</li>`;
    }

    /* ---------------- Phase 6: REVIEW ---------------- */
    function finalScore(a, ops) {
      if (!a || a.empty) return 0;
      const o = ops && isFinite(ops.opsScore) ? ops.opsScore : 0;
      let score = Math.round(a.designScore * 0.8 + o * 20);
      if (!a.reachesOrbit) score = Math.min(score, 35);      // never reached orbit = failed mission
      else if (ops && ops.lost) score = Math.min(score, 50); // lost in operations
      return score;
    }
    function renderReviewPhase() {
      const a = state.analysis;
      const body = document.getElementById('mission-overlay-body');
      if (!a || a.empty) {
        body.innerHTML = `<div class="mo-card"><h2 class="mo-h1">No mission to review</h2><button type="button" class="draft-btn-primary mo-btn" onclick="setPhase('design')">Go to Design</button></div>`;
        return;
      }
      if (!state.lastOps) {
        const sw = currentSpaceWeather();
        state.lastOps = simulateOperations(a, sw.events, 14, sw.start);
        state.lastOps.swLabel = sw.label;
      }
      const ops = state.lastOps;
      const score = finalScore(a, ops);
      const grade = score >= 90 ? 'MISSION SUCCESS' : score >= 70 ? 'PARTIAL SUCCESS' : score >= 40 ? 'MISSION IMPAIRED' : 'MISSION FAILED';
      const color = score >= 90 ? '#246b50' : score >= 70 ? '#b36b1d' : '#b83a2d';
      // save attempt for the trade-space chart
      const attempt = { t: Date.now(), mission: state.mission.title, category: state.mission.category, score, cost: a.totalCost, mass: a.totalMass, craft: state.craftName, orbit: `${state.orbit.altitudeKm} km / ${state.orbit.inclination}°` };
      const last = state.attempts[state.attempts.length - 1];
      if (!last || last.score !== attempt.score || Math.abs(last.cost - attempt.cost) > 0.5 || last.mission !== attempt.mission) {
        state.attempts.push(attempt);
        state.attempts = state.attempts.slice(-40);
        storageSet('ps_attempts', state.attempts);
      }
      const failed = a.reqs.filter(r => !r.pass);
      body.innerHTML = `
        <div class="mo-header">
          <div>
            <div class="mo-kicker">PHASE 6 OF 6 · MISSION REVIEW BOARD</div>
            <h2 class="mo-h1">${escapeHtml(state.craftName)} → ${escapeHtml(state.mission.title)}</h2>
            <p class="mo-lead">Every result below is traced back to a choice you made on the drawing board.</p>
          </div>
          <div class="mo-actions">
            <button type="button" id="rv-redesign" class="draft-btn-primary mo-btn">${pxIcon('pencil')} Redesign</button>
            <button type="button" id="rv-newmission" class="draft-btn mo-btn">New mission</button>
            <button type="button" id="rv-export" class="draft-btn mo-btn">${pxIcon('download')} Report</button>
          </div>
        </div>
        <div class="mo-review-top">
          <div class="mo-card mo-score">
            <div class="mo-score-ring" style="--c:${color};--p:${score}"><span>${score}</span><small>/100</small></div>
            <div class="mo-grade" style="color:${color}">${grade}</div>
            <div class="mo-mono mo-small">Design ${a.designScore}/100 × 0.8 + Operations ${(ops.opsScore * 20).toFixed(0)}/20${!a.reachesOrbit ? ' · capped: no orbit' : ops.lost ? ' · capped: craft lost' : ''}</div>
            <div class="mo-mono mo-small">${ops.lost ? pxIcon('cross') + ' ' + escapeHtml(ops.lostReason) : `${ops.delivered} of ${a.rules.images} required images delivered · ${ops.safeDays} safe-mode day(s)`}</div>
            ${failed.length ? `<div class="mo-next"><strong>Biggest fix:</strong> ${escapeHtml(failed.sort((x, y) => y.points - x.points)[0].fix)}</div>` : '<div class="mo-next good">Every requirement met. Try a harder mission or cut cost!</div>'}
          </div>
          <div class="mo-card">
            <div class="mo-kicker">WHAT YOUR SATELLITE SEES — REAL NASA GIBS IMAGERY</div>
            <div class="mo-compare">
              <figure><canvas id="rv-ref" width="260" height="260"></canvas><figcaption id="rv-ref-cap">NASA reference</figcaption></figure>
              <figure><canvas id="rv-you" width="260" height="260"></canvas><figcaption id="rv-you-cap">Your satellite</figcaption></figure>
            </div>
          </div>
        </div>
        <div class="mo-review-bottom">
          <div class="mo-card">
            <div class="mo-kicker">REQUIREMENTS · CAUSE → EFFECT</div>
            <table class="mo-table">
              <thead><tr><th></th><th>Requirement</th><th>You</th><th>Needed</th><th>Why</th></tr></thead>
              <tbody>${a.reqs.map(r => `
                <tr class="${r.pass ? 'pass' : 'fail'}">
                  <td>${pxIcon(r.pass ? 'check' : 'cross')}</td><td>${escapeHtml(r.label)} <span class="mo-pts">${r.pass ? r.points : 0}/${r.points}</span></td>
                  <td>${escapeHtml(r.value)}</td><td>${escapeHtml(r.target)}</td>
                  <td>${escapeHtml(r.why)}${r.pass ? '' : `<div class="mo-fix">→ ${escapeHtml(r.fix)}</div>`}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
          <div class="mo-card mo-trade-wrap">
            <div class="mo-kicker">YOUR TRADE SPACE (every review is saved)</div>
            <canvas id="rv-trade" width="380" height="250" class="mo-chart"></canvas>
            <div class="mo-cap">Each dot is one design. Real engineers look for the top-left: high score, low cost.</div>
            <button type="button" id="rv-clear" class="draft-btn mo-btn">Clear history</button>
          </div>
        </div>`;
      document.getElementById('rv-redesign').addEventListener('click', () => setPhase('design'));
      document.getElementById('rv-newmission').addEventListener('click', () => setPhase('brief'));
      document.getElementById('rv-export').addEventListener('click', exportMissionReport);
      document.getElementById('rv-clear').addEventListener('click', () => { state.attempts = []; storageSet('ps_attempts', []); drawTradeSpace(); });
      drawTradeSpace();
      // GIBS comparison
      const m = state.mission;
      const sceneKm = Math.max(m.rules.sceneKm, 40);
      const refC = document.getElementById('rv-ref'), youC = document.getElementById('rv-you');
      drawSceneToCanvas(refC, null); drawSceneToCanvas(youC, null);
      loadGibsScene(m.lat, m.lon, m.date, sceneKm, 512).then(scene => {
        if (!document.getElementById('rv-ref')) return;
        const srcRes = scene ? scene.sceneKm * 1000 / scene.px : 0;
        drawSceneToCanvas(refC, scene, null, scene ? `NASA ${scene.layer.split('_')[0]} · ${fmtKm(srcRes)} px` : '');
        const best = a.best;
        let yourGsd = null, cap = '';
        if (!a.reachesOrbit) { cap = 'No image — never reached orbit.'; }
        else if (!best) { cap = 'No working instrument on the satellite.'; }
        else if (!isFinite(best.rawRevisit)) { cap = 'No image — orbit never passes over the target.'; }
        else { yourGsd = Math.max(best.gsd, srcRes); cap = `${best.name}: ${fmtKm(best.gsd)} pixels${best.gsd < srcRes ? ' (sharper than this NASA reference can show)' : ''}. Needed ≤ ${fmtKm(m.rules.gsd)}.`; }
        if (yourGsd) drawSceneToCanvas(youC, scene, yourGsd, `YOUR VIEW · ${fmtKm(best.gsd)} px`);
        else {
          const cx = youC.getContext('2d');
          cx.fillStyle = '#2b241b'; cx.fillRect(0, 0, youC.width, youC.height);
          cx.fillStyle = '#b83a2d'; cx.font = '700 13px "IBM Plex Mono", monospace'; cx.textAlign = 'center';
          cx.fillText('NO DATA', youC.width / 2, youC.height / 2);
        }
        document.getElementById('rv-ref-cap').textContent = scene ? `NASA GIBS ${scene.layer.replace(/_/g, ' ')} · ${scene.date} · ${sceneKm} km scene` : 'NASA imagery offline';
        document.getElementById('rv-you-cap').textContent = cap;
      });
    }

    function drawTradeSpace() {
      const cv = document.getElementById('rv-trade');
      if (!cv) return;
      const cx = cv.getContext('2d');
      const W = cv.width, H = cv.height;
      cx.fillStyle = '#f3ead6'; cx.fillRect(0, 0, W, H);
      const pts = state.attempts;
      const x0 = 40, y0 = H - 30, x1 = W - 12, y1 = 14;
      const maxCost = Math.max(4000, ...pts.map(p => p.cost)) * 1.05;
      const sx = c => x0 + (c / maxCost) * (x1 - x0);
      const sy = s => y0 - (s / 100) * (y0 - y1);
      cx.strokeStyle = '#c9b99a';
      for (let s = 0; s <= 100; s += 25) { cx.beginPath(); cx.moveTo(x0, sy(s)); cx.lineTo(x1, sy(s)); cx.stroke(); }
      cx.strokeStyle = '#2b241b'; cx.lineWidth = 1.5;
      cx.beginPath(); cx.moveTo(x0, y1); cx.lineTo(x0, y0); cx.lineTo(x1, y0); cx.stroke();
      cx.fillStyle = '#635645';
      cx.font = '600 10px "IBM Plex Mono", monospace';
      cx.textAlign = 'right';
      for (let s = 0; s <= 100; s += 25) cx.fillText(String(s), x0 - 4, sy(s) + 3);
      cx.textAlign = 'center';
      for (let c = 0; c <= maxCost; c += 1000) cx.fillText(`$${c / 1000}M`, sx(c), y0 + 14);
      cx.fillText('mission cost →', (x0 + x1) / 2, H - 2);
      cx.save(); cx.translate(10, (y0 + y1) / 2); cx.rotate(-Math.PI / 2); cx.fillText('score →', 0, 0); cx.restore();
      const colors = { severeStorms: '#255c85', volcanoes: '#b83a2d', floods: '#246b50', wildfires: '#b36b1d' };
      pts.forEach((p, i) => {
        const last = i === pts.length - 1;
        cx.fillStyle = colors[p.category] || '#6b3fa0';
        cx.beginPath(); cx.arc(sx(p.cost), sy(p.score), last ? 6 : 4, 0, Math.PI * 2); cx.fill();
        if (last) { cx.strokeStyle = '#2b241b'; cx.lineWidth = 2; cx.beginPath(); cx.arc(sx(p.cost), sy(p.score), 9, 0, Math.PI * 2); cx.stroke(); }
      });
      if (!pts.length) { cx.fillStyle = '#635645'; cx.fillText('No attempts yet', W / 2, H / 2); }
    }

    function exportMissionReport() {
      const a = state.analysis, ops = state.lastOps, m = state.mission;
      const lines = [
        `# Mission Report — ${state.craftName}`,
        `Mission: ${m.title} (${m.origin}${m.eonetId ? ', ' + m.eonetId : ''}) — ${m.place}, ${m.date}`,
        `Orbit: ${state.orbit.altitudeKm} km, ${state.orbit.inclination}° inclination`,
        `Final score: ${finalScore(a, ops)}/100 (design ${a.designScore}, operations ${(ops.opsScore * 20).toFixed(0)}/20)`,
        '',
        `Launch mass ${a.totalMass.toFixed(1)} kg · satellite ${a.payloadMass.toFixed(1)} kg · cost $${(a.totalCost / 1000).toFixed(2)}M`,
        `Δv ${(a.dvInfo.totalDv / 1000).toFixed(2)} km/s vs required ${(a.dvReq / 1000).toFixed(2)} km/s · liftoff TWR ${a.dvInfo.liftoffTWR.toFixed(2)}`,
        '',
        '## Requirements',
        ...a.reqs.map(r => `- [${r.pass ? 'x' : ' '}] ${r.label}: ${r.value} (target ${r.target}) — ${r.why}${r.pass ? '' : ' Fix: ' + r.fix}`),
        '',
        `## Operations (${ops.swLabel || 'space weather replay'})`,
        ...ops.days.flatMap(d => [...d.events.map(e => `- ${d.date}: ${e.text}`), ...d.notes.map(n => `- ${d.date}: ${n}`)]),
        `Images delivered: ${ops.delivered}/${a.rules.images}`,
        '',
        'Data: NASA EONET, NASA GIBS, NASA DONKI, NASA Small Spacecraft Technology State-of-the-Art report, U.S. Standard Atmosphere 1976.'
      ];
      const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const el = document.createElement('a');
      el.href = url;
      el.download = `${state.craftName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_mission_report.md`;
      el.click();
      URL.revokeObjectURL(url);
    }

    /* ---------------- Help & sources ---------------- */
    function showInfoModal(title, html) {
      document.getElementById('info-modal-title').textContent = title;
      document.getElementById('info-modal-body').innerHTML = html;
      document.getElementById('info-modal').classList.remove('hidden');
    }
    function showHelpModal() {
      showInfoModal('How to play — design a whole space mission', `
        <ol class="mo-steps">
          <li><span class="phase-num">1</span> <strong>Brief</strong> — pick a real natural event from NASA EONET (typhoon, volcano, flood, wildfire). It sets your resolution, revisit and budget targets.</li>
          <li><span class="phase-num">2</span> <strong>Design</strong> — draw your rocket <em>and</em> satellite pixel by pixel. Rows with a yellow <strong>Stage Decoupler</strong> split stages; everything above the top decoupler is your satellite. The <strong>Mission Budgets</strong> panel (right) updates live: mass, Δv, cost, power, battery, data, resolution, revisit, lifetime.</li>
          <li><span class="phase-num">3</span> <strong>Flight Test</strong> — fly it. Keep the Center of Lift ${COL_MARK} below the Center of Mass ${COM_MARK} or it tumbles. Press <strong>G</strong> to stage, <strong>W/S</strong> throttle, <strong>A/D</strong> steer, ${pxIcon('warp')} for time warp.</li>
          <li><span class="phase-num">4</span> <strong>Launch &amp; Orbit</strong> — choose altitude and inclination. The rocket equation decides if you make it.</li>
          <li><span class="phase-num">5</span> <strong>Operations</strong> — 14 days in orbit replaying real NASA DONKI solar flares and geomagnetic storms.</li>
          <li><span class="phase-num">6</span> <strong>Review</strong> — score, cause-and-effect for every requirement, real NASA imagery degraded to <em>your</em> resolution, and your trade-space chart.</li>
        </ol>
        <p class="mo-note">Tip: load the <strong>BANTAY-1</strong> preset — it flies the typhoon mission. Then switch to the volcano or flood mission and find out why it fails.</p>`);
    }
    function showSourcesModal() {
      showInfoModal('NASA data & references', `
        <ul class="mo-sources">
          <li><strong>NASA EONET v3</strong> — live natural events used as mission briefs. <a href="https://eonet.gsfc.nasa.gov/docs/v3" target="_blank" rel="noopener">eonet.gsfc.nasa.gov</a></li>
          <li><strong>NASA GIBS</strong> — MODIS / VIIRS true-colour imagery and Blue Marble used for "what your satellite sees" and ground tracks. <a href="https://nasa-gibs.github.io/gibs-api-docs/" target="_blank" rel="noopener">GIBS API docs</a><br><em>We acknowledge the use of imagery provided by services from NASA's Global Imagery Browse Services (GIBS), part of NASA's Earth Science Data and Information System (ESDIS).</em></li>
          <li><strong>NASA DONKI</strong> — solar flares (FLR) and geomagnetic storms (GST) replayed in operations; offline snapshots of May &amp; Oct 2024 events. <a href="https://ccmc.gsfc.nasa.gov/tools/DONKI/" target="_blank" rel="noopener">CCMC DONKI</a></li>
          <li><strong>NASA Small Spacecraft Technology State-of-the-Art report (2026)</strong> — solar cell, battery, radio, reaction-wheel and avionics values. <a href="https://www.nasa.gov/smallsat-institute/sst-soa/" target="_blank" rel="noopener">nasa.gov/smallsat-institute/sst-soa</a></li>
          <li><strong>U.S. Standard Atmosphere 1976</strong> (NOAA/NASA/USAF) — air density in the flight test.</li>
          <li><strong>NASA-STD-8719.14</strong> (Process for Limiting Orbital Debris) — 25-year post-mission deorbit guideline.</li>
          <li>Physics: Tsiolkovsky rocket equation, Hohmann transfers, circular-orbit eclipse geometry, diffraction-limited optics (GSD ≈ 1.22 λ h / D).</li>
        </ul>
        <p class="mo-note">Simplifications: 2D flight with aerodynamic scaling; lifetime and revisit are first-order estimates; costs are an illustrative game economy. Every material's tooltip shows where its numbers come from.</p>`);
    }

    // Persisted trade-space history
    state.attempts = storageGet('ps_attempts', []);

    /**
     * ============================================================================
     * 13. MAIN RENDER & PHYSICS LOOP
     * ============================================================================
     */
    let lastTimestamp = performance.now();

    function mainLoop(timestamp) {
      const dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (state.mode === 'sim') {
        let remaining = Math.min(0.05, Math.max(0, dt)) * sim.timeWarp;
        let guard = 0;
        while (remaining > 1e-6 && guard++ < 80) {
          const h = Math.min(1 / 120, remaining);
          stepSimulation(h);
          remaining -= h;
        }
        if (state.physics && state.physics.pixelCount > 0) {
          const spd = sim.windTunnel ? Math.max(75, Math.hypot(sim.vx, sim.vy)) : Math.hypot(sim.vx, sim.vy);
          updateSimHUD(state.physics, spd);
          updateAllUIReadouts(state.physics);
        }
        renderSimCanvas();
      } else {
        renderBuildCanvas();
      }

      requestAnimationFrame(mainLoop);
    }

    /**
     * ============================================================================
     * 14. INITIALIZATION ON READY / WINDOW LOAD
     * ============================================================================
     */
    let appInitialized = false;
    function initApp() {
      if (appInitialized) return;
      appInitialized = true;

      state.grid = buildBantayPreset(state.cols, state.rows);
      state.craftName = 'BANTAY-1';
      document.getElementById('input-craft-name').value = state.craftName;
      state.mission = makeMission(MISSION_SNAPSHOT[0]);
      bindAllEvents();
      renderMaterialsPaletteUI();
      renderStampsLibraryUI();
      recalculateAndRefreshUI();
      resizeCanvas();
      fitBlueprintToViewport();
      mainCanvas.style.cursor = 'crosshair';
      if (document.getElementById('panel-canvas').getBoundingClientRect().width < 900) document.getElementById('btn-fbd-minimize').click();
      if (window.innerWidth < 1024) document.querySelector('[data-mobile-tab="canvas"]')?.click();
      hydrateIcons();
      setPhase('brief');
      fetchEonetLive();
      if (!storageGet('ps_seen_help', false)) { showHelpModal(); storageSet('ps_seen_help', true); }
      lastTimestamp = performance.now();
      requestAnimationFrame(mainLoop);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initApp);
    } else {
      initApp();
    }
    window.addEventListener('load', initApp);
