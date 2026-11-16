/* photo2d.js — brings the reference photo of the boy to life (scenes s1, s4, s5, s6).
 * Layers cut from the photo (background plate, body, head with re-drawable pupils) are composed on a 2D canvas.
 * Every frame is a pure function of FILM time T, so scenes cut seamlessly. Needs F3D.util (film3d.js). */
(function () {
  const { K, E, clamp, lerp, smooth, rng } = F3D.util;
  const P = { ready: null, img: {}, meta: null };
  const load = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  P.load = function (base = 'assets/photo/') {
    if (!P.ready) P.ready = Promise.all([load(base + 'bg.jpg'), load(base + 'body.png'), load(base + 'head.png'), fetch(base + 'meta.json').then((r) => r.json())])
      .then(([bg, body, head, meta]) => { P.img = { bg, body, head }; P.meta = meta; return P; });
    return P.ready;
  };

  // ---------------------------------------------------------------- film-time keys (pic coordinates: the photo is 1080 x 1579)
  // camera: [centre x, centre y, zoom]
  const CAM = [
    [0, [540, 800, 1.0]], [4.3, [538, 545, 2.5], 'io2'], [5.45, [509, 531, 34], 'in3'],
    [25.0, [700, 880, 1.12]], [25.45, [560, 880, 1.12], 'out3'], [28.0, [600, 930, 1.22], 'io2'], [30.2, [520, 760, 1.3], 'io2'],
    [31.0, [300, 650, 1.75], 'io2'], [32.6, [380, 620, 1.55], 'sine'], [33.6, [560, 620, 1.5], 'io2'],
    [34.4, [905, 690, 2.6], 'io2'], [35.9, [905, 690, 2.85], 'lin'], [37.0, [600, 600, 1.7], 'io2'], [38.6, [545, 760, 1.15], 'io2'],
    [39.4, [600, 900, 1.12], 'io2'], [40.3, [430, 700, 1.12], 'io2'], [41.2, [545, 700, 1.2], 'io2'], [46.0, [545, 600, 1.75], 'sine'],
    [47.4, [545, -650, 1.6], 'in3'], [50, [545, -700, 1.6]],
  ];
  const LOOK = [[0, [0, 0]], [1.0, [1, -0.1], 'out3'], [2.55, [1, -0.1]], [2.75, [0, 0], 'out3'], [4.3, [0, 0]],
    [25, [0.45, 1]], [30.6, [0.45, 1]], [30.8, [-1, -0.1], 'out3'], [32.6, [-1, -0.1]], [32.8, [0, 0], 'out3'],
    [34.0, [0, 0]], [34.2, [1, -0.3], 'out3'], [36.3, [1, -0.3]], [36.5, [0, 0.2], 'out3'], [37.5, [0, 0.6]], [38.2, [0, 0]],
    [38.4, [0.5, 1]], [39.4, [0, 0]], [39.6, [-1, -0.4], 'out3'], [40.4, [0, 0]], [50, [0, 0]]];
  const LIDS = [[0, 0], [25, 0.25], [32.4, 0.25], [32.5, 0, 'out3'], [34.0, 0], [36.6, 0.2], [41.3, 0.2], [42.6, 0.45, 'sine'], [44.0, 0.72, 'sine'], [45.4, 1, 'sine'], [50, 1]];
  const BLINKS = [2.15, 3.6, 26.45, 28.9, 31.7, 33.6, 37.0, 38.25, 39.9, 41.6];
  const HEAD = [[0, [0, 0, 0]], [1.0, [-1.2, 1, 0], 'sine'], [2.6, [1.0, 0, 0], 'sine'], [4.3, [0, 0, 0], 'sine'],
    [25, [1.5, 6, 0]], [30.5, [1.5, 6, 0]], [31.0, [-2.5, 0, 0], 'io2'], [32.6, [-2.5, 0, 0]], [33.4, [0, 0, 0], 'io2'], [34.1, [2.8, -2, 0], 'io2'], [36.3, [2.5, -2, 0]], [36.9, [0, 2, 0], 'io2'],
    [37.6, [0, 7, 0], 'sine'], [38.3, [0, 2, 0], 'sine'], [39.4, [1.5, 4, 0], 'io2'], [40.4, [-2, 0, 0], 'io2'], [41.4, [0, 0, 0], 'io2'], [44.5, [2.2, 9, 0], 'sine'], [50, [3, 12, 0], 'sine']];
  const CLOCK = [[0, '02:47'], [25, '03:12'], [34.3, '03:13'], [34.62, '03:14'], [34.94, '03:21'], [35.26, '03:33'], [35.58, '03:47'], [35.9, '03:58'], [44, '04:02']];

  function blinkAt(T) { let b = 0; for (const t0 of BLINKS) { const x = (T - t0) / 0.2; if (x >= 0 && x <= 1) b = Math.max(b, x < 0.35 ? x / 0.35 : 1 - (x - 0.35) / 0.65); } return b; }
  const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  // ---------------------------------------------------------------- drawing helpers (pic space)
  function drawEyes(ctx, m, look, lid, hlA = 0.85) {
    const LID = [172, 146, 124], LID2 = [146, 112, 94];
    for (const s of ['L', 'R']) {
      const e = m.eyes[s]; const [cx, cy] = e.c, [rx, ry] = e.r;
      ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, rx * (0.97 + 0.07 * lid), ry * (0.97 + 0.08 * lid), 0, 0, Math.PI * 2); ctx.clip();
      // pupil (the original sits a little inward; we move it with the gaze)
      const px = e.p[0] + look[0] * (s === 'L' ? 16 : 22) - (s === 'L' ? 6 : -2) * Math.max(0, look[0]), py = e.p[1] + look[1] * 13;
      const g = ctx.createRadialGradient(px - 2, py - 2, 1, px, py, 12); g.addColorStop(0, '#2a1a12'); g.addColorStop(0.55, '#0c0909'); g.addColorStop(1, '#050404');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(px, py, 11, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${hlA})`; ctx.beginPath(); ctx.arc(px - 3.5, py - 4.5, 2.6, 0, Math.PI * 2); ctx.fill();
      // upper lid: soft-edged skin with shading, so a closed eye reads as skin, not a disc
      if (lid > 0.005) {
        const top = cy - ry - 10, edge = cy - ry + (2 * ry + 8) * lid, sag = 10 * lid;
        const path = () => { ctx.beginPath(); ctx.moveTo(cx - rx - 10, top); ctx.lineTo(cx + rx + 10, top); ctx.lineTo(cx + rx + 10, edge); ctx.quadraticCurveTo(cx, edge + sag * 2, cx - rx - 10, edge); ctx.closePath(); };
        ctx.save(); ctx.filter = 'blur(1.6px)';
        const lg = ctx.createLinearGradient(0, top, 0, edge + sag); lg.addColorStop(0, 'rgb(178,152,130)'); lg.addColorStop(0.55, 'rgb(168,137,116)'); lg.addColorStop(1, 'rgb(142,104,88)');
        path(); ctx.fillStyle = lg; ctx.fill();
        const side = ctx.createRadialGradient(cx - rx * 0.15, cy - ry * 0.35, rx * 0.2, cx, cy, rx * 1.15); side.addColorStop(0, 'rgba(255,232,210,0.22)'); side.addColorStop(0.7, 'rgba(0,0,0,0)'); side.addColorStop(1, 'rgba(70,35,25,0.28)');
        path(); ctx.fillStyle = side; ctx.fill();
        ctx.restore();
        ctx.strokeStyle = 'rgba(58,32,24,0.9)'; ctx.lineWidth = 3.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - rx * 0.92, edge + 1); ctx.quadraticCurveTo(cx, edge + sag * 2 + 1, cx + rx * 0.92, edge + 1); ctx.stroke();
        if (lid > 0.85) { ctx.strokeStyle = 'rgba(120,80,64,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - rx * 0.7, cy - ry * 0.45); ctx.quadraticCurveTo(cx, cy - ry * 0.65, cx + rx * 0.7, cy - ry * 0.45); ctx.stroke(); }
      }
      ctx.restore();
    }
  }
  function drawCalmMouth(ctx, m, calm) {
    if (calm <= 0.01) return;
    const [cx, cy] = m.mouth.c;
    ctx.save(); ctx.globalAlpha = calm;
    const g = ctx.createRadialGradient(cx, cy + 2, 4, cx, cy + 2, 92); g.addColorStop(0, 'rgb(170,124,104)'); g.addColorStop(0.62, 'rgba(160,116,98,0.96)'); g.addColorStop(1, 'rgba(150,108,92,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy + 2, 92, 40, 0.06, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(105,52,44,0.9)'; ctx.lineWidth = 4.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - 44, cy - 4); ctx.quadraticCurveTo(cx, cy + 12, cx + 46, cy - 6); ctx.stroke();
    ctx.restore();
  }
  function drawPhone(ctx, x, y, glow, scroll, T) {
    ctx.save(); ctx.translate(x, y); ctx.transform(1, 0, -0.35, 0.55, 0, 0); // lying on the bed, seen in perspective
    ctx.fillStyle = '#121418'; ctx.beginPath(); ctx.roundRect(-60, -110, 120, 220, 18); ctx.fill();
    ctx.beginPath(); ctx.roundRect(-52, -100, 104, 200, 12); ctx.clip();
    ctx.fillStyle = glow > 0 ? '#0d1b33' : '#050608'; ctx.fillRect(-52, -100, 104, 200);
    if (glow > 0) { const cols = ['#ff6b8b', '#ffd166', '#06d6a0', '#7aa2ff', '#c77dff', '#ff9f43']; ctx.globalAlpha = glow;
      for (let i = 0; i < 14; i++) { const yy = -96 + i * 58 - (scroll % (58 * 6)); ctx.fillStyle = cols[i % 6]; ctx.beginPath(); ctx.roundRect(-46, yy, 92, 50, 8); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(-36, yy + 10, 46, 7); ctx.fillRect(-36, yy + 24, 66, 6); } }
    ctx.restore();
  }
  function drawMug(ctx, x, y, T) {
    ctx.save(); ctx.translate(x, y);
    const g = ctx.createLinearGradient(-30, 0, 30, 0); g.addColorStop(0, '#9c968c'); g.addColorStop(0.45, '#f1ece2'); g.addColorStop(1, '#8c867c');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-30, -60); ctx.lineTo(30, -60); ctx.lineTo(27, 0); ctx.quadraticCurveTo(0, 8, -27, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3b2016'; ctx.beginPath(); ctx.ellipse(0, -60, 30, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#d8d2c6'; ctx.lineWidth = 4; ctx.stroke();
    ctx.strokeStyle = '#cfc9bd'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(32, -32, 14, -1.2, 1.2); ctx.stroke();
    for (let i = 0; i < 3; i++) { const k = (T * 0.45 + i / 3) % 1; ctx.strokeStyle = `rgba(230,240,255,${0.35 * Math.sin(k * Math.PI)})`; ctx.lineWidth = 5; ctx.beginPath(); const sx = -12 + i * 12, sy = -70 - k * 70; ctx.moveTo(sx, sy); ctx.bezierCurveTo(sx + 12, sy - 15, sx - 12, sy - 30, sx + 4, sy - 45); ctx.stroke(); }
    ctx.restore();
  }
  function drawClock(ctx, x, y, txt, flash) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#1a1d24'; ctx.beginPath(); ctx.roundRect(-82, -50, 164, 92, 18); ctx.fill(); ctx.strokeStyle = '#3b4250'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#07090c'; ctx.beginPath(); ctx.roundRect(-70, -38, 140, 66, 8); ctx.fill();
    ctx.font = 'bold 50px "DejaVu Sans Mono", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = '#ff2a2a'; ctx.shadowBlur = 14 + 20 * flash; ctx.fillStyle = '#ff4a3d'; ctx.fillText(txt, 0, -4);
    ctx.restore();
    const g = ctx.createRadialGradient(x, y, 10, x, y, 220); g.addColorStop(0, `rgba(255,60,40,${0.18 + 0.25 * flash})`); g.addColorStop(1, 'rgba(255,60,40,0)'); ctx.fillStyle = g; ctx.fillRect(x - 220, y - 220, 440, 440);
  }
  function drawOrb(ctx, x, y, r, dim) { // a tiny melatonin (same lavender character as in scene 3)
    ctx.save(); ctx.globalAlpha = 1 - dim * 0.65;
    const halo = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 1.8); halo.addColorStop(0, 'rgba(170,185,255,0.5)'); halo.addColorStop(1, 'rgba(170,185,255,0)'); ctx.fillStyle = halo; ctx.fillRect(x - r * 2, y - r * 2, r * 4, r * 4);
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.1, x, y, r); g.addColorStop(0, '#e2e8ff'); g.addColorStop(0.6, '#9daaf8'); g.addColorStop(1, '#5f6fd8'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#2a2a5a'; ctx.lineWidth = r * 0.07; ctx.lineCap = 'round'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(x + s * r * 0.33, y, r * 0.16, 0.2, Math.PI - 0.2); ctx.stroke(); }
    ctx.fillStyle = '#2c3a92'; ctx.beginPath(); ctx.moveTo(x - r * 0.75, y - r * 0.55); ctx.quadraticCurveTo(x, y - r * 1.5, x + r * 1.1, y - r * 0.9); ctx.quadraticCurveTo(x + r * 0.3, y - r * 0.75, x + r * 0.7, y - r * 0.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffe27a'; ctx.beginPath(); ctx.arc(x + r * 1.1, y - r * 0.9, r * 0.16, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function drawSky(ctx, T, a) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#050b20'); g.addColorStop(0.65, '#14305c'); g.addColorStop(1, '#2a4f86'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
    const R = rng(9); for (let i = 0; i < 160; i++) { const x = R() * 1080, y = R() * 1600, s = 0.8 + R() * 2.4, ph = R() * 6.3; ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.6 * (0.5 + 0.5 * Math.sin(T * 2.3 + ph))})`; ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill(); }
    const z = 1 + (T - 47) * 0.04, mx = 560, my = 1020;
    const mg = ctx.createRadialGradient(mx, my, 60 * z, mx, my, 430 * z); mg.addColorStop(0, `rgba(255,244,210,${0.55 + 0.1 * Math.sin(T * 2)})`); mg.addColorStop(1, 'rgba(255,244,210,0)'); ctx.fillStyle = mg; ctx.fillRect(0, 0, 1080, 1920);
    const mo = ctx.createRadialGradient(mx - 40 * z, my - 50 * z, 10, mx, my, 160 * z); mo.addColorStop(0, '#fffdf0'); mo.addColorStop(1, '#e6d9ab'); ctx.fillStyle = mo; ctx.beginPath(); ctx.arc(mx, my, 160 * z, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(190,175,135,0.55)'; [[-50, -40, 28], [55, 35, 20], [20, -70, 12], [-60, 60, 15]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(mx + dx * z, my + dy * z, r * z, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = 'rgba(70,105,160,0.45)'; [[200 + (T - 46) * 25, 1520, 330], [880 - (T - 46) * 30, 1680, 380]].forEach(([x, y, w]) => { ctx.beginPath(); ctx.ellipse(x, y, w, 60, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(x + 90, y - 40, w * 0.45, 55, 0, 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
  }

  // ---------------------------------------------------------------- one frame at film time T
  P.render = function (ctx, T) {
    const m = P.meta, I = P.img; if (!m) return;
    const BASE = 1920 / m.H; // the photo fills the frame height at zoom 1
    let [cx, cy, z] = K(T, CAM);
    let blurPx = 0;
    if (T >= 25 && T < 25.5) { const k = 1 - E.out3((T - 25) / 0.5); blurPx = 18 * k; }
    if (T > 46.2 && T < 47.6) blurPx = 10 * Math.sin(clamp((T - 46.2) / 1.4, 0, 1) * Math.PI);
    const S = BASE * z;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#071420'; ctx.fillRect(0, 0, 1080, 1920);
    ctx.save(); if (blurPx > 0.3) ctx.filter = `blur(${blurPx.toFixed(1)}px)`;
    // background plate, with parallax (moves and zooms less than the boy)
    const zb = 1 + (z - 1) * 0.82, Sb = BASE * zb, cxb = 540 + (cx - 540) * 0.8, cyb = 790 + (cy - 790) * 0.8;
    ctx.setTransform(Sb, 0, 0, Sb, 540 - cxb * Sb, 960 - cyb * Sb);
    ctx.drawImage(I.bg, 0, -m.padTop);
    // lamp glow (left nightstand lamp in the photo)
    const lampOn = T < 40 ? (T < 20 ? 0.55 : 1) : 1 - smooth(40.0, 40.2, T);
    if (lampOn > 0) { const lg = ctx.createRadialGradient(60, 470, 20, 60, 470, 560); lg.addColorStop(0, `rgba(255,190,110,${0.5 * lampOn})`); lg.addColorStop(1, 'rgba(255,170,90,0)'); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = lg; ctx.fillRect(-500, -100, 1300, 1300); ctx.globalCompositeOperation = 'source-over'; }
    // props behind the boy: mug on the nightstand, clock on the headboard
    if (T >= 24) drawMug(ctx, 250, 684, T);
    let txt = CLOCK[0][1]; for (const [t0, s] of CLOCK) if (T >= t0) txt = s;
    const flash = Math.max(0, ...CLOCK.filter((k) => k[0] > 30).map((k) => (T >= k[0] && T < k[0] + 0.3 ? 1 - (T - k[0]) / 0.3 : 0)));
    drawClock(ctx, 905, 690, txt, flash);
    // the boy
    ctx.setTransform(S, 0, 0, S, 540 - cx * S, 960 - cy * S);
    const br = Math.sin(T * (T > 41 ? 1.5 : 2.4)) * (T > 41 ? 0.012 : 0.006);
    const hd = K(T, HEAD); const [nx, ny] = m.neck;
    ctx.save(); ctx.translate(0, 1450); ctx.scale(1 + br * 0.5, 1 + br); ctx.translate(0, -1450); ctx.drawImage(I.body, 0, 0); ctx.restore();
    ctx.save(); ctx.translate(nx + hd[2], ny + hd[1] - br * 690); ctx.rotate(hd[0] * Math.PI / 180); ctx.translate(-nx, -ny);
    ctx.drawImage(I.head, 0, 0);
    const look = K(T, LOOK); const lid = clamp(Math.max(K(T, LIDS), blinkAt(T)), 0, 1);
    drawEyes(ctx, m, look, lid, 0.85 * (1 - smooth(4.5, 4.9, T) * (T < 6 ? 1 : 0)));
    drawCalmMouth(ctx, m, smooth(42.5, 44.5, T));
    // sweat drop while watching the clock
    const sw = smooth(35.1, 35.3, T) * (1 - smooth(36.6, 36.9, T)); if (sw > 0) { const yy = 470 + (T - 35.1) * 30; ctx.fillStyle = `rgba(200,235,255,${0.85 * sw})`; ctx.beginPath(); ctx.moveTo(655, yy - 22); ctx.quadraticCurveTo(672, yy + 4, 655, yy + 12); ctx.quadraticCurveTo(638, yy + 4, 655, yy - 22); ctx.fill(); ctx.fillStyle = `rgba(255,255,255,${0.9 * sw})`; ctx.beginPath(); ctx.arc(651, yy, 3, 0, 7); ctx.fill(); }
    ctx.restore();
    // phone on the bed in front of him
    const phoneY = 1450 + 400 * E.in3(clamp((T - 38.4) / 0.9, 0, 1));
    const glow = T >= 25 && T < 38.9 ? 1 : 0;
    if (T >= 24 && T < 39.4) drawPhone(ctx, 700, phoneY, glow, T >= 25.5 && T < 30.3 ? Math.floor((T - 25.5) / 0.6) * 58 + 58 * E.out3(clamp(((T - 25.5) % 0.6) / 0.35, 0, 1)) : 0, T);
    // light on the face: the phone's blue glow, rays, the little melatonin dimming
    if (glow) { const fl = 0.75 + 0.25 * Math.sin(T * 11); const pg = ctx.createRadialGradient(560, 760, 40, 560, 760, 520); pg.addColorStop(0, `rgba(90,165,255,${0.42 * fl})`); pg.addColorStop(1, 'rgba(90,165,255,0)'); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = pg; ctx.fillRect(0, 200, 1080, 1300); ctx.globalCompositeOperation = 'source-over'; }
    const rays = smooth(28.0, 28.4, T) * (1 - smooth(29.9, 30.2, T));
    if (rays > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 5; i++) { const a = rays * (0.18 + 0.1 * Math.sin(T * 13 + i)); ctx.fillStyle = `rgba(120,190,255,${a})`; ctx.beginPath(); ctx.moveTo(690 + i * 6, 1430); ctx.lineTo(470 + i * 30, 520); ctx.lineTo(500 + i * 30, 520); ctx.closePath(); ctx.fill(); } ctx.restore(); }
    const orb = smooth(28.3, 28.7, T) * (1 - smooth(30.0, 30.3, T)); if (orb > 0) { ctx.save(); ctx.globalAlpha = orb; drawOrb(ctx, 330, 440, 60 * (1 - 0.45 * smooth(28.9, 29.9, T)), smooth(28.9, 29.9, T)); ctx.restore(); }
    // caffeine sparks and the worry swirl
    const sp = smooth(32.45, 32.55, T) * (1 - smooth(33.2, 33.5, T)); if (sp > 0) { ctx.strokeStyle = `rgba(255,228,110,${sp})`; ctx.lineWidth = 7; ctx.lineCap = 'round'; [[380, 300, -1], [720, 300, 1], [350, 470, -1], [750, 470, 1]].forEach(([x, y, s], i) => { const j = Math.sin(T * 40 + i) * 4; ctx.beginPath(); ctx.moveTo(x + j, y); ctx.lineTo(x + s * 22 + j, y - 18); ctx.lineTo(x + s * 8 + j, y - 26); ctx.lineTo(x + s * 30 + j, y - 46); ctx.stroke(); }); }
    const swl = smooth(35.15, 35.35, T) * (1 - smooth(36.9, 37.3, T)); if (swl > 0) { ctx.save(); ctx.strokeStyle = `rgba(200,212,255,${0.9 * swl})`; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); const n = Math.floor(120 * clamp((T - 35.15) / 0.9, 0, 1)); for (let i = 0; i <= n; i++) { const a = i / 120 * Math.PI * 6 + T * 3, r = 10 + i * 0.75; const x = 545 + Math.cos(a) * r, y = 150 + Math.sin(a) * r * 0.45; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore(); }
    // calm: thoughts drifting away, z's while asleep
    for (let i = 0; i < 7; i++) { const t0 = 42.2 + i * 0.32, k = clamp((T - t0) / 2.2, 0, 1); if (k <= 0 || k >= 1) continue; const x = 545 + (i - 3) * 50 * (1 + k), y = 330 - k * 380; ctx.fillStyle = `rgba(${['255,255,255', '184,198,255', '255,215,168'][i % 3]},${Math.sin(k * Math.PI) * 0.7})`; ctx.beginPath(); ctx.arc(x, y, 14 - k * 6, 0, 7); ctx.fill(); }
    ctx.font = 'bold 54px sans-serif'; for (let i = 0; i < 3; i++) { const k = clamp((T - 45.5 - i * 0.4) / 1.6, 0, 1); if (k <= 0 || k >= 1) continue; ctx.fillStyle = `rgba(207,227,255,${Math.sin(k * Math.PI) * 0.85})`; ctx.fillText('z', 690 + k * 70 + i * 20, 330 - k * 160 - i * 30); }
    ctx.restore();
    // grade: night tint and the moonlight after the lamp goes out
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const dark = smooth(40.0, 40.3, T);
    if (dark > 0) { ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(${Math.round(lerp(255, 120, dark))},${Math.round(lerp(255, 140, dark))},${Math.round(lerp(255, 200, dark))},1)`; ctx.fillRect(0, 0, 1080, 1920);
      ctx.globalCompositeOperation = 'screen'; const mg = ctx.createRadialGradient(780, 300, 50, 780, 300, 1100); mg.addColorStop(0, `rgba(90,130,200,${0.35 * dark})`); mg.addColorStop(1, 'rgba(90,130,200,0)'); ctx.fillStyle = mg; ctx.fillRect(0, 0, 1080, 1920); ctx.globalCompositeOperation = 'source-over'; }
    // the sky beyond the window, as the camera tilts up at the end
    drawSky(ctx, T, smooth(46.7, 47.5, T));
    const v = ctx.createRadialGradient(540, 900, 500, 540, 900, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,4,10,0.6)'); ctx.fillStyle = v; ctx.fillRect(0, 0, 1080, 1920);
  };
  window.PHOTO = P;
})();
