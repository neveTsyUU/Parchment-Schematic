import RAPIER from '@dimforge/rapier2d-compat';

// ---- Tuning knobs -------------------------------------------------------
// Your block stats ("lift 42", "mass 12") aren't real units, so these scale
// them into something Rapier (meters / kg / Newtons) can use.
const LIFT_SCALE = 12;       // lift stat -> Newtons. Preset 0 hovers at roughly 80% throttle.
const TORQUE_SCALE = 20000;  // pilot A/D input -> torque. Raise if steering feels sluggish.
const GRAVITY = 9.81;

let world = null;
let body = null;
let initialized = false;

/** Load the Rapier WASM. Call once at startup and await it. */
export async function initPhysics() {
  if (initialized) return;
  await RAPIER.init();
  initialized = true;
}

/**
 * Build a rigid body from the blueprint grid.
 * 1 grid cell = 1 meter. +y points DOWN so it matches the canvas.
 * The body's origin is the center of the middle grid cell.
 */
export function createContraption(grid, blockTypes, centerCol, centerRow) {
  world = new RAPIER.World({ x: 0, y: GRAVITY });

  body = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(0, 0)
      .setLinearDamping(0.4)
      .setAngularDamping(1.5)
  );

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const type = grid[r][c];
      if (!type) continue;
      const spec = blockTypes[type];
      const collider = RAPIER.ColliderDesc.cuboid(0.5, 0.5)
        .setTranslation(c - centerCol, r - centerRow)
        .setMass(spec.mass);
      world.createCollider(collider, body);
    }
  }
}

/** Apply lift/buoyancy/steering forces, then advance the world one step. */
export function stepContraption(grid, blockTypes, centerCol, centerRow, throttle, pilotTorque) {
  if (!world || !body) return;

  body.resetForces(true);
  body.resetTorques(true);

  const pos = body.translation();
  const ang = body.rotation();
  const cos = Math.cos(ang);
  const sin = Math.sin(ang);

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const type = grid[r][c];
      if (!type) continue;
      const spec = blockTypes[type];
      if (spec.lift <= 0 && spec.buoyancy <= 0) continue;

      // Block position in world space (rotate local offset by body angle)
      const lx = c - centerCol;
      const ly = r - centerRow;
      const point = {
        x: pos.x + lx * cos - ly * sin,
        y: pos.y + lx * sin + ly * cos
      };

      // Wing lift pushes "up" relative to the craft, so it tilts with the craft
      if (spec.lift > 0) {
        const f = spec.lift * throttle * LIFT_SCALE;
        body.addForceAtPoint({ x: sin * f, y: -cos * f }, point, true);
      }

      // Balloon buoyancy always pushes world-up, regardless of tilt
      if (spec.buoyancy > 0) {
        const f = spec.buoyancy * LIFT_SCALE;
        body.addForceAtPoint({ x: 0, y: -f }, point, true);
      }
    }
  }

  body.addTorque(pilotTorque * TORQUE_SCALE, true);
  world.step();
}

/**
 * Keep the craft inside the parchment (replaces the old clamp in main.js).
 * Limits are in meters (grid cells) from the starting position.
 */
export function constrainContraption(maxX, maxY) {
  if (!body) return;
  const t = body.translation();
  const v = body.linvel();
  let x = t.x, y = t.y, vx = v.x, vy = v.y;
  let hit = false;

  if (x < -maxX) { x = -maxX; vx *= -0.4; hit = true; }
  if (x > maxX)  { x = maxX;  vx *= -0.4; hit = true; }
  if (y < -maxY) { y = -maxY; vy *= -0.4; hit = true; }
  if (y > maxY)  { y = maxY;  vy *= -0.4; hit = true; }

  if (hit) {
    body.setTranslation({ x, y }, true);
    body.setLinvel({ x: vx, y: vy }, true);
  }
}

/** Current position (meters), angle (radians), and vertical speed (m/s, +down). */
export function getBodyState() {
  if (!body) return { x: 0, y: 0, angle: 0, vy: 0 };
  const t = body.translation();
  return { x: t.x, y: t.y, angle: body.rotation(), vy: body.linvel().y };
}

export function destroyContraption() {
  if (world) world.free();
  world = null;
  body = null;
}