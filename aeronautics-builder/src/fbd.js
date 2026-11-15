// Free Body Diagram, drawn directly on the blueprint canvas.
// Anchored at the craft's center of mass. All forces are in Newtons.
//   thrust       > 0 pushes UP
//   weight       > 0 pulls DOWN
//   frictionDown > 0 pulls DOWN (air drag while climbing); negative while descending

const COLORS = {
  thrust: '#3c8ec7',
  weight: '#b5382a',
  friction: '#c46d16',
  total: '#2a7d38',
  ink: '#4b4237',
  halo: '#f5eedc'
};

/** Blocky pixel-style vertical arrow. dy < 0 points up, dy > 0 points down. pad grows it (for the halo). */
function arrowShape(ctx, x, baseY, dy, color, pad) {
  ctx.fillStyle = color;
  const dir = dy < 0 ? -1 : 1;
  const tipY = baseY + dy;
  const headLen = Math.min(15, Math.abs(dy));
  const shaftEnd = tipY - dir * headLen;

  ctx.fillRect(x - 2 - pad, Math.min(baseY, shaftEnd) - pad, 4 + pad * 2, Math.abs(shaftEnd - baseY) + pad * 2);

  const rows = 5;
  const rowH = Math.max(2, Math.floor(headLen / rows));
  for (let i = 0; i < rows; i++) {
    const half = Math.round((rows - i) * 1.6) + pad;
    const y = dir < 0 ? shaftEnd - (i + 1) * rowH : shaftEnd + i * rowH;
    ctx.fillRect(x - half, y - pad, half * 2, rowH + pad * 2);
  }
}

function drawArrow(ctx, x, baseY, dy, color) {
  if (dy === 0) {
    ctx.fillStyle = COLORS.halo;
    ctx.fillRect(x - 5, baseY - 5, 10, 10);
    ctx.fillStyle = color;
    ctx.fillRect(x - 3, baseY - 3, 6, 6); // zero force: just a dot
    return;
  }
  arrowShape(ctx, x, baseY, dy, COLORS.halo, 2); // light outline so it reads over the blocks
  arrowShape(ctx, x, baseY, dy, color, 0);
}

function haloText(ctx, text, x, y) {
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = COLORS.halo;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

function drawLabel(ctx, x, tipY, pointsUp, name, value, color) {
  ctx.textAlign = 'center';
  const nameY = pointsUp ? tipY - 20 : tipY + 16;
  ctx.font = 'bold 17px "VT323", monospace';
  ctx.fillStyle = color;
  haloText(ctx, name, x, nameY);
  ctx.font = '15px "VT323", monospace';
  ctx.fillStyle = COLORS.ink;
  haloText(ctx, value, x, nameY + 14);
}

/**
 * @param ctx       main canvas context
 * @param x, y      screen position of the center of mass
 * @param cellSize  current grid cell size in px (arrows scale with it)
 * @param forces    { thrust, weight, frictionDown }
 */
export function drawFreeBodyDiagram(ctx, x, y, cellSize, forces) {
  const { thrust, weight, frictionDown } = forces;
  const net = thrust - weight - frictionDown;
  const r = Math.round;

  ctx.save();
  ctx.textBaseline = 'alphabetic';

  // Arrow lengths share one scale so they are comparable
  const maxLen = cellSize * 4.2;
  const maxAbs = Math.max(Math.abs(thrust), Math.abs(weight), Math.abs(frictionDown), Math.abs(net), 1);
  const len = (v) => (Math.abs(v) < 0.5 ? 0 : Math.max(6, (maxLen * Math.abs(v)) / maxAbs));

  const side = Math.max(60, cellSize * 2.8); // horizontal spacing for Friction / Total

  // Dashed connectors showing every force acts at the center of mass
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(75, 66, 55, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - side, y);
  ctx.lineTo(x + side, y);
  ctx.stroke();
  ctx.setLineDash([]);

  // THRUST: up
  {
    const l = len(thrust);
    drawArrow(ctx, x, y, -l, COLORS.thrust);
    drawLabel(ctx, x, y - l, true, 'Thrust', `${r(thrust)} N`, COLORS.thrust);
  }

  // WEIGHT: down
  {
    const l = len(weight);
    drawArrow(ctx, x, y, l, COLORS.weight);
    drawLabel(ctx, x, y + l, false, 'Weight', `${r(weight)} N`, COLORS.weight);
  }

  // FRICTION (air drag): right side. Down while climbing, up while descending.
  {
    const down = frictionDown >= 0;
    const l = len(frictionDown);
    drawArrow(ctx, x + side, y, down ? l : -l, COLORS.friction);
    drawLabel(ctx, x + side, y + (down ? l : -l), !down, 'Friction', `${r(Math.abs(frictionDown))} N`, COLORS.friction);
  }

  // TOTAL (net force): left side. Up if lifting, down if sinking.
  {
    const up = net >= 0;
    const l = len(net);
    drawArrow(ctx, x - side, y, up ? -l : l, COLORS.total);
    drawLabel(ctx, x - side, y + (up ? -l : l), up, 'Total', `${r(net)} N`, COLORS.total);
  }

  // Center-of-mass dot on top
  ctx.fillStyle = COLORS.halo;
  ctx.fillRect(x - 6, y - 6, 12, 12);
  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(x - 4, y - 4, 8, 8);

  ctx.restore();
}