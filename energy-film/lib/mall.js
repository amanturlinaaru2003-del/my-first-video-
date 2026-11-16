/* Night-mall escalator world: one canvas renderer shared by every scene.
   Everything drawn is a pure function of the scene state for time t, so any
   frame can be rendered in any order (HyperFrames seeks frame by frame). */
(function () {
  const W = 1080, H = 1920;
  const A = (30 * Math.PI) / 180, CA = Math.cos(A), SA = Math.sin(A);
  const L = 2600;            // escalator length along the incline
  const D = 52;              // one step along the incline
  const RISE = D * SA, RUN = D * CA;
  const HR = 150;            // handrail height above the steps
  const TOP = { x: L * CA, y: -L * SA };

  // Labels above each character (edit here to rename them).
  const LABELS = { motiv: 'МОТИВАЦИЯ', ego: 'ЭГО', fear: 'ҚОРҚЫНЫШ', disc: 'ТӘРТІП', energy: 'ЭНЕРГЕТИК ІШЕДІ', calm: 'ЭНЕРГЕТИК ІШПЕЙДІ' };

  const LOOK = {
    ground: '#0b0d18', slab: '#14162a', ceiling: '#232539',
    wood0: '#3f2f22', wood1: '#7a5a3d', lamp: '#f6e7c8',
    neon: ['#3d6fd6', '#c84a8a', '#d7a640', '#5fb3a8'],
    head0: '#f3eee5', head1: '#cfc7ba', skin: '#ebe5da',
    label: '#d9d4e6', accent: '#f0c46a',
  };

  const KIND = {
    motiv: { scale: 1.0, top: '#d9752e', top2: '#b85f22', pants: '#2a2b33', shoe: '#ecebe6', shirt: null, tie: null },
    ego: { scale: 1.04, top: '#1d1e26', top2: '#15161c', pants: '#1a1b22', shoe: '#0e0e12', shirt: '#e9e3d6', tie: '#d9a520' },
    fear: { scale: 0.9, top: '#55635d', top2: '#46524d', pants: '#2b2f31', shoe: '#3a3632', shirt: '#cfc8b8', tie: null },
    energy: { scale: 1.0, top: '#5fbf34', top2: '#4a9a27', pants: '#24262e', shoe: '#ecebe6', shirt: null, tie: null },
    calm: { scale: 1.0, top: '#2f6f80', top2: '#265a68', pants: '#2b2f3a', shoe: '#e6e2da', shirt: '#eeeae2', tie: null },
    disc: { scale: 1.0, top: '#1c2438', top2: '#161c2c', pants: '#161b29', shoe: '#0c0d12', shirt: '#eeeae2', tie: '#7d9cc4' },
  };

  // ---------- helpers ----------
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const smooth = (u) => { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); };
  const ease = (t, t0, t1) => smooth((t - t0) / (t1 - t0));

  function P(s) {
    if (s <= 0) return { x: s, y: 0 };
    if (s >= L) return { x: TOP.x + (s - L), y: TOP.y };
    return { x: s * CA, y: -s * SA };
  }
  // Height of the tread a foot at incline position s stands on.
  function treadY(s, belt) {
    if (s <= 30) return 0;
    if (s >= L - 30) return TOP.y;
    const off = ((belt % D) + D) % D;
    const k = Math.floor((s - off) / D);
    const sn = off + (k + 1) * D;
    return Math.max(TOP.y, -sn * SA);
  }
  function footX(s) { return P(s).x; }

  function ik(hx, hy, fx, fy, l1, l2, bend) {
    let dx = fx - hx, dy = fy - hy;
    let d = Math.hypot(dx, dy);
    const maxd = l1 + l2 - 0.5;
    if (d > maxd) { fx = hx + (dx / d) * maxd; fy = hy + (dy / d) * maxd; d = maxd; }
    d = Math.max(d, 1);
    const a = Math.atan2(fy - hy, fx - hx);
    const c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
    const al = Math.acos(c);
    const ka = a - bend * al;
    return { kx: hx + Math.cos(ka) * l1, ky: hy + Math.sin(ka) * l1, fx, fy };
  }

  // ---------- background (far wall, floors, lamps) ----------
  function drawBg(g, cam, env) {
    const p = 0.42, z = cam.zoom * 0.8;
    const pw = env.power;
    g.save();
    g.fillStyle = LOOK.ground;
    g.fillRect(0, 0, W, H);
    g.translate(W / 2, H * (cam.ay || 0.5));
    g.scale(z, z);
    g.translate(-cam.x * p - 400, -cam.y * p);

    const levels = [380, -520, -1420, -2320];
    const x0 = -3000, x1 = 5200;
    // ceiling cable arcs
    g.strokeStyle = LOOK.ceiling; g.lineWidth = 7;
    for (let x = x0; x < x1; x += 420) {
      g.beginPath(); g.moveTo(x, -2700);
      g.quadraticCurveTo(x + 210, -2380, x + 420, -2700); g.stroke();
    }
    const r = rng(7);
    for (let i = 0; i < levels.length - 1; i++) {
      const yb = levels[i], yt = levels[i + 1] + 60;
      // shop fronts: warm wood panels
      for (let x = x0; x < x1; x += 150) {
        const lit = r();
        const gr = g.createLinearGradient(0, yt, 0, yb);
        const k = (0.35 + 0.65 * pw) * (0.55 + 0.45 * lit);
        gr.addColorStop(0, shade(LOOK.wood0, k * 0.8));
        gr.addColorStop(0.55, shade(LOOK.wood1, k));
        gr.addColorStop(1, shade(LOOK.wood0, k * 0.7));
        g.fillStyle = gr;
        g.fillRect(x + 8, yt + 90, 134, yb - yt - 150);
      }
      // lamps hanging under the slab above
      for (let x = x0 + 200 + i * 130; x < x1; x += 560) {
        const lr = 46;
        const a = 0.25 + 0.75 * pw;
        const gl = g.createRadialGradient(x, yt + 40, 0, x, yt + 40, lr * 4.5);
        gl.addColorStop(0, `rgba(246,231,200,${0.5 * a})`);
        gl.addColorStop(1, 'rgba(246,231,200,0)');
        g.fillStyle = gl; g.beginPath(); g.arc(x, yt + 40, lr * 4.5, 0, 7); g.fill();
        g.fillStyle = `rgba(250,240,220,${0.35 + 0.65 * a})`;
        g.beginPath(); g.arc(x, yt + 40, lr, 0, 7); g.fill();
      }
    }
    // floor slabs with neon strips
    for (let i = 0; i < levels.length; i++) {
      const y = levels[i];
      g.fillStyle = LOOK.slab; g.fillRect(x0, y - 30, x1 - x0, 70);
      g.fillStyle = '#20233a'; g.fillRect(x0, y - 32, x1 - x0, 5);
      const rr = rng(100 + i);
      for (let x = x0; x < x1; x += 260 + rr() * 300) {
        const c = LOOK.neon[Math.floor(rr() * LOOK.neon.length)];
        g.globalAlpha = 0.15 + 0.85 * pw;
        g.fillStyle = c; g.fillRect(x, y + 6, 120 + rr() * 220, 9);
        g.globalAlpha = 0.25 * pw; g.fillRect(x - 10, y + 2, 140 + rr() * 220, 18);
        g.globalAlpha = 1;
      }
    }
    // exit glow at the top of the escalator (the ending)
    if (env.topGlow > 0) {
      const gx = TOP.x * p + 400 + 260, gy = TOP.y * p - 40;
      const gl = g.createRadialGradient(gx, gy, 0, gx, gy, 900);
      gl.addColorStop(0, `rgba(255,214,150,${0.65 * env.topGlow})`);
      gl.addColorStop(1, 'rgba(255,214,150,0)');
      g.fillStyle = gl; g.beginPath(); g.arc(gx, gy, 900, 0, 7); g.fill();
    }
    g.restore();
  }
  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.round(((n >> 16) & 255) * k), gg = Math.round(((n >> 8) & 255) * k), b = Math.round((n & 255) * k);
    return `rgb(${clamp(r, 0, 255)},${clamp(gg, 0, 255)},${clamp(b, 0, 255)})`;
  }

  // ---------- escalator ----------
  function drawEscalatorBack(g, env) {
    const belt = env.belt;
    // skirt / truss under the steps
    g.beginPath();
    g.moveTo(-900, 0); g.lineTo(0, 0); g.lineTo(TOP.x, TOP.y); g.lineTo(TOP.x + 900, TOP.y);
    g.lineTo(TOP.x + 900, TOP.y + 190); g.lineTo(TOP.x + 40, TOP.y + 190);
    g.lineTo(60, 190); g.lineTo(-900, 190); g.closePath();
    const gr = g.createLinearGradient(0, TOP.y, 0, 200);
    gr.addColorStop(0, '#2a2c36'); gr.addColorStop(1, '#1b1c24');
    g.fillStyle = gr; g.fill();
    // steps (sawtooth), clipped to the incline
    const off = ((belt % D) + D) % D;
    g.save();
    g.beginPath(); g.rect(4, TOP.y - 60, TOP.x - 8, -TOP.y + 70); g.clip();
    g.fillStyle = '#3b3e4a';
    g.beginPath();
    let s = off - D;
    let p = P(Math.max(s, 0));
    g.moveTo(p.x, p.y + 6);
    for (; s < L + D; s += D) {
      const a = { x: s * CA, y: -s * SA };
      g.lineTo(a.x, a.y);
      g.lineTo(a.x, a.y - RISE);
      g.lineTo(a.x + RUN, a.y - RISE);
    }
    g.lineTo(TOP.x + 100, TOP.y + 40); g.lineTo(0, 40); g.closePath(); g.fill();
    // tread edges
    g.lineWidth = 3;
    for (s = off - D; s < L + D; s += D) {
      const a = { x: s * CA, y: -s * SA };
      g.strokeStyle = '#a7acba';
      g.beginPath(); g.moveTo(a.x, a.y - RISE); g.lineTo(a.x + RUN, a.y - RISE); g.stroke();
      g.strokeStyle = 'rgba(214,179,58,0.9)';
      g.beginPath(); g.moveTo(a.x + RUN - 12, a.y - RISE); g.lineTo(a.x + RUN, a.y - RISE); g.stroke();
    }
    g.restore();
    // landings
    g.fillStyle = '#4a4d59'; g.fillRect(-900, -6, 905, 8); g.fillRect(TOP.x - 5, TOP.y - 6, 905, 8);
    g.fillStyle = 'rgba(214,179,58,0.9)'; g.fillRect(-40, -8, 36, 5); g.fillRect(TOP.x + 4, TOP.y - 8, 36, 5);
    // skirt edge highlight
    g.strokeStyle = '#7d8292'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(-900, 2); g.lineTo(0, 2); g.lineTo(TOP.x, TOP.y + 2); g.lineTo(TOP.x + 900, TOP.y + 2); g.stroke();
  }
  function railPath(g, lift) {
    const h = HR + lift;
    g.beginPath();
    g.moveTo(-170, -h * 0.25);
    g.arc(-170, -h * 0.625, h * 0.375, Math.PI / 2, -Math.PI / 2, false);
    g.lineTo(-40, -h);
    g.lineTo(TOP.x - 40 * CA, TOP.y - h);
    g.lineTo(TOP.x + 130, TOP.y - h);
    g.arc(TOP.x + 130, TOP.y - h * 0.625, h * 0.375, -Math.PI / 2, Math.PI / 2, false);
  }
  function drawEscalatorFront(g) {
    // glass balustrade
    g.beginPath();
    g.moveTo(-170, -10); g.lineTo(-170, -HR);
    g.lineTo(-40, -HR); g.lineTo(TOP.x - 40 * CA, TOP.y - HR); g.lineTo(TOP.x + 130, TOP.y - HR);
    g.lineTo(TOP.x + 130, TOP.y - 10); g.lineTo(TOP.x, TOP.y - 10); g.lineTo(0, -10); g.closePath();
    g.fillStyle = 'rgba(150,165,195,0.13)'; g.fill();
    g.strokeStyle = 'rgba(200,210,230,0.25)'; g.lineWidth = 2; g.stroke();
    // handrail
    railPath(g, 0);
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = '#0c0d11'; g.lineWidth = 20; g.stroke();
    railPath(g, 7);
    g.strokeStyle = 'rgba(120,126,145,0.55)'; g.lineWidth = 3; g.stroke();
  }

  // ---------- characters ----------
  function legPose(c, belt) {
    const dir = c.facing || 1;
    const base = c.s0 + belt;
    const o = [0, D];
    const feet = [];
    let lift0 = 0;
    for (let i = 0; i < 2; i++) {
      const q = c.w + o[i];
      const n = Math.floor(q / (2 * D));
      const fr = q / (2 * D) - n;
      const plantRel = n * 2 * D - o[i] + D / 2;            // relative to base, in walk units
      let rel, lift = 0;
      if (fr < 0.5) rel = plantRel;
      else {
        const u = smooth((fr - 0.5) / 0.5);
        rel = lerp(plantRel, plantRel + 2 * D, u);
        lift = Math.sin(Math.PI * u) * (c.flat ? 14 : 34);
      }
      let s = base + dir * rel;
      if (fr < 0.5 && !c.flat) {
        const off = ((belt % D) + D) % D;
        s = off + D * Math.round((s - off - D / 2) / D) + D / 2;
      }
      const y = c.flat ? P(s).y : treadY(s, belt);
      feet.push({ x: footX(s), y: y - lift, s, lift });
      if (i === 0) lift0 = fr;
    }
    return { feet, phase: lift0 };
  }

  function drawChar(g, c, env, t) {
    const k = KIND[c.kind];
    const sc = (c.scale || 1) * k.scale;
    const dir = c.facing || 1;
    const fr = Math.floor(t * 15);
    const belt = c.onBelt === false ? 0 : env.belt;
    const thigh = 82 * sc, shin = 82 * sc, torso = 120 * sc, hr = 40 * sc;
    const upper = 62 * sc, fore = 60 * sc;

    let feet, hip, phase = 0;
    if (c.pose === 'sit') {
      const s = c.s0 + belt;
      hip = { x: footX(s), y: treadY(s, belt) - 12 * sc };
      const fs = s - 2.3 * D, fs2 = s - 2.0 * D;
      feet = [{ x: footX(fs), y: treadY(fs, belt) }, { x: footX(fs2) + 6, y: treadY(fs2, belt) }];
    } else {
      const lp = legPose(c, belt);
      feet = lp.feet; phase = lp.phase;
      const sb = c.s0 + belt + dir * (c.w + D * 0.5);
      const gy = Math.min(feet[0].y + feet[0].lift, feet[1].y + feet[1].lift);
      const walking = c.walking ? 1 : 0;
      const bob = walking * Math.abs(Math.sin(phase * Math.PI * 2)) * 7 * sc;
      hip = { x: footX(sb), y: Math.max(gy, P(sb).y - RISE * 0.5) - (thigh + shin) * 0.94 - bob };
      if (!c.flat && walking) hip.y = Math.min(hip.y, (feet[0].y + feet[1].y) / 2 - (thigh + shin) * 0.9);
    }
    if (c.tremble) {
      const r = rng(fr * 31 + 5);
      hip.x += (r() * 2 - 1) * c.tremble; hip.y += (r() * 2 - 1) * c.tremble * 0.5;
    }
    if (c.dx) hip.x += c.dx;
    const lean = (c.lean || 0) + (c.lurch || 0);
    const sh = { x: hip.x + Math.sin(lean) * torso * dir, y: hip.y - Math.cos(lean) * torso };
    const tilt = c.tilt || 0;
    const ha = lean + tilt;
    const neck = { x: sh.x + Math.sin(lean) * 10 * sc * dir, y: sh.y - Math.cos(lean) * 10 * sc };
    const head = { x: neck.x + Math.sin(ha) * hr * 0.95 * dir, y: neck.y - Math.cos(ha) * hr * 0.95 };
    const ctx = { head, hr, sh, hip, sc, dir, t };

    g.lineCap = 'round'; g.lineJoin = 'round';
    const legs = feet.map((f) => ik(hip.x, hip.y, f.x, f.y, thigh, shin, dir));
    // near/far: foot 0 is the near leg
    function leg(L2, col, shoe) {
      g.strokeStyle = col; g.lineWidth = 27 * sc;
      g.beginPath(); g.moveTo(hip.x, hip.y); g.lineTo(L2.kx, L2.ky); g.lineTo(L2.fx, L2.fy - 6 * sc); g.stroke();
      g.fillStyle = shoe;
      g.beginPath(); g.ellipse(L2.fx + 9 * sc * dir, L2.fy - 6 * sc, 21 * sc, 8 * sc, 0, 0, 7); g.fill();
    }
    const arms = {
      far: armTarget(c.far || c.near || 'hang', ctx, 1, c, env),
      near: armTarget(c.near || 'hang', ctx, 0, c, env),
    };
    function arm(tg, col, w) {
      const a = ik(sh.x, sh.y + 6 * sc, tg.x, tg.y, upper, fore, -dir);
      g.strokeStyle = col; g.lineWidth = w * sc;
      g.beginPath(); g.moveTo(sh.x, sh.y + 6 * sc); g.lineTo(a.kx, a.ky); g.lineTo(a.fx, a.fy); g.stroke();
      g.fillStyle = LOOK.skin; g.beginPath(); g.arc(a.fx, a.fy, 9 * sc, 0, 7); g.fill();
      return a;
    }
    // far side
    arm(arms.far, k.top2, 21);
    leg(legs[1], shade(k.pants.length === 7 ? k.pants : '#222222', 0.75), shade(k.shoe, 0.75));
    // torso
    const px = Math.cos(lean) * dir, py = Math.sin(lean);
    const hw = 27 * sc, sw = 33 * sc;
    g.fillStyle = k.top; g.strokeStyle = k.top; g.lineWidth = 12 * sc;
    g.beginPath();
    g.moveTo(hip.x - px * hw, hip.y - py * hw * dir);
    g.lineTo(hip.x + px * hw, hip.y + py * hw * dir);
    g.lineTo(sh.x + px * sw, sh.y + py * sw * dir);
    g.lineTo(sh.x - px * sw, sh.y - py * sw * dir);
    g.closePath(); g.fill(); g.stroke();
    if (k.shirt) {
      const f0 = { x: sh.x + px * (sw - 2), y: sh.y + py * (sw - 2) * dir };
      const down = { x: -Math.sin(lean) * dir, y: Math.cos(lean) };
      g.fillStyle = k.shirt;
      g.beginPath();
      g.moveTo(f0.x, f0.y - 4 * sc);
      g.lineTo(f0.x + down.x * torso * 0.55 + px * 2, f0.y + down.y * torso * 0.55);
      g.lineTo(f0.x - px * 16 * sc, f0.y - py * 16 * sc * dir);
      g.closePath(); g.fill();
      if (k.tie) {
        g.strokeStyle = k.tie; g.lineWidth = 7 * sc;
        g.beginPath(); g.moveTo(f0.x - px * 3 * sc, f0.y);
        g.lineTo(f0.x + down.x * torso * 0.62 - px * 3 * sc, f0.y + down.y * torso * 0.62); g.stroke();
      }
    }
    if (c.kind === 'motiv' || c.kind === 'energy') { // hood bunched at the back of the neck
      g.fillStyle = k.top2;
      g.beginPath(); g.ellipse(sh.x - px * 22 * sc, sh.y - 4 * sc, 22 * sc, 16 * sc, 0, 0, 7); g.fill();
    }
    // near leg
    leg(legs[0], k.pants, k.shoe);
    // neck + head
    g.strokeStyle = LOOK.head1; g.lineWidth = 14 * sc;
    g.beginPath(); g.moveTo(sh.x, sh.y); g.lineTo(neck.x, neck.y - 6 * sc); g.stroke();
    const hg = g.createRadialGradient(head.x - hr * 0.35 * dir, head.y - hr * 0.4, hr * 0.1, head.x, head.y, hr * 1.05);
    hg.addColorStop(0, LOOK.head0); hg.addColorStop(1, LOOK.head1);
    if (c.glow) { // phone light on the face
      hg.addColorStop(0, '#ffffff');
    }
    g.fillStyle = hg; g.beginPath(); g.arc(head.x, head.y, hr, 0, 7); g.fill();
    accessories(g, c, ctx, env);
    // near arm last
    const na = arm(arms.near, k.top, 22);
    if (c.near === 'phoneUp' || c.near === 'phoneEar') phone(g, na, ctx, c);
    if (c.hold) prop(g, na, ctx, c);
    return { head, hr };
  }

  function armTarget(mode, ctx, far, c, env) {
    const { sh, head, hr, sc, dir, t } = ctx;
    const off = far ? -10 * sc : 0;
    if (typeof mode === 'object') return mode;
    switch (mode) {
      case 'rail': {
        const s = c.s0 + env.belt + dir * ((c.w || 0) + D / 2) + (far ? 30 : 55) * dir;
        const p = P(s);
        return { x: p.x + off, y: p.y - HR - 4 + (c.railDy || 0) };
      }
      case 'phoneUp': return { x: head.x + 70 * sc * dir, y: head.y + 22 * sc };
      case 'phoneEar': return { x: head.x + 4 * sc * dir, y: head.y + 18 * sc };
      case 'head': return { x: head.x + (far ? -8 : 22) * sc * dir, y: head.y + 16 * sc };
      case 'gesture': return { x: sh.x + 64 * sc * dir, y: sh.y + 18 * sc - Math.abs(Math.sin(t * 7)) * 46 * sc };
      case 'swing': {
        const ph = ((c.w || 0) / (2 * D)) * Math.PI * 2 + (far ? Math.PI : 0);
        const a = Math.sin(ph) * 0.55 * (c.armAmp || 1);
        return { x: sh.x + Math.sin(a) * 110 * sc * dir + 8 * sc * dir, y: sh.y + Math.cos(a) * 112 * sc };
      }
      case 'drink': return { x: head.x + hr * 0.75 * dir, y: head.y + hr * 0.45 };
      case 'chest': return { x: sh.x + 42 * sc * dir, y: sh.y + 62 * sc };
      case 'pocket': return { x: sh.x - 4 * sc * dir, y: sh.y + 112 * sc };
      default: return { x: sh.x + 10 * sc * dir + off, y: sh.y + 118 * sc };
    }
  }
  function phone(g, a, ctx, c) {
    const { sc, dir } = ctx;
    g.save();
    g.translate(a.fx, a.fy);
    g.rotate(c.near === 'phoneEar' ? -0.2 * dir : 0.1 * dir);
    g.fillStyle = '#0d0e12';
    g.fillRect(-7 * sc, -30 * sc, 14 * sc, 44 * sc);
    if (c.near === 'phoneUp') {
      const gl = g.createRadialGradient(-30 * sc * dir, -10 * sc, 0, -30 * sc * dir, -10 * sc, 120 * sc);
      gl.addColorStop(0, `rgba(190,215,255,${0.35 + 0.65 * (c.flash || 0)})`);
      gl.addColorStop(1, 'rgba(190,215,255,0)');
      g.fillStyle = gl; g.beginPath(); g.arc(-30 * sc * dir, -10 * sc, 120 * sc, 0, 7); g.fill();
    }
    g.restore();
  }
  function prop(g, a, ctx, c) {
    const { sc, dir } = ctx;
    g.save();
    g.translate(a.fx, a.fy);
    const ang = c.near === 'drink' ? -2.0 * dir : 0;
    g.rotate(ang);
    if (c.hold === 'can' || c.hold === 'can2') {
      g.fillStyle = '#121316'; g.fillRect(-10 * sc, -24 * sc, 20 * sc, 40 * sc);
      g.fillStyle = '#7cff4f'; g.fillRect(-10 * sc, -12 * sc, 20 * sc, 9 * sc);
      g.fillStyle = '#b8bcc6'; g.fillRect(-10 * sc, -27 * sc, 20 * sc, 4 * sc);
    } else if (c.hold === 'bottle') {
      g.fillStyle = 'rgba(150,200,240,0.75)'; g.fillRect(-9 * sc, -34 * sc, 18 * sc, 52 * sc);
      g.fillStyle = '#e8f3ff'; g.fillRect(-5 * sc, -42 * sc, 10 * sc, 9 * sc);
      g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(-6 * sc, -30 * sc, 3 * sc, 40 * sc);
    }
    g.restore();
  }
  function speedLines(g, c, h, t) {
    const r = rng(Math.floor(t * 20) * 7 + 3);
    const ux = CA * (c.facing || 1), uy = -SA;
    g.save(); g.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      const back = 70 + r() * 90, len = 120 + r() * 160;
      const oy = -40 + i * 45 + r() * 20;
      const x0 = h.head.x - ux * back, y0 = h.head.y + oy - uy * back;
      g.strokeStyle = `rgba(190,255,150,${0.25 + 0.45 * r()})`;
      g.lineWidth = 3 + r() * 3;
      g.globalAlpha = c.speed;
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 - ux * len, y0 - uy * len); g.stroke();
    }
    g.restore();
  }
  function heart(g, x, y, s) {
    g.beginPath();
    g.moveTo(x, y + s * 0.35);
    g.bezierCurveTo(x - s * 1.1, y - s * 0.35, x - s * 0.45, y - s * 1.05, x, y - s * 0.45);
    g.bezierCurveTo(x + s * 0.45, y - s * 1.05, x + s * 1.1, y - s * 0.35, x, y + s * 0.35);
    g.fill();
  }
  function hud(g, c, x, y, size, t) {
    const la = (c.label == null ? 1 : c.label);
    g.save(); g.globalAlpha = la;
    if (c.battery != null) {
      const b = clamp(c.battery, 0, 1);
      const bw = size * 2.0, bh = size * 0.9, bx = x - bw / 2 - size * 0.9, by = y - size * 2.05;
      const col = b > 0.5 ? '#63d471' : b > 0.25 ? '#f0b545' : '#ff4d4d';
      const blink = b <= 0.12 ? (Math.floor(t * 4) % 2 ? 0.35 : 1) : 1;
      g.strokeStyle = '#e6e2ee'; g.lineWidth = 3;
      g.strokeRect(bx, by, bw, bh);
      g.fillStyle = '#e6e2ee'; g.fillRect(bx + bw, by + bh * 0.3, size * 0.16, bh * 0.4);
      g.globalAlpha = la * blink; g.fillStyle = col;
      g.fillRect(bx + 4, by + 4, Math.max(2, (bw - 8) * b), bh - 8);
      g.globalAlpha = la;
      g.font = `800 ${Math.round(size * 0.9)}px KzSans`;
      try { g.letterSpacing = '0px'; } catch (e) {}
      g.textAlign = 'left'; g.fillStyle = col;
      g.fillText(Math.round(b * 100) + '%', bx + bw + size * 0.45, by + bh * 0.82);
      g.textAlign = 'center';
    }
    if (c.bpm) {
      const beat = (t * c.bpm / 60) % 1;
      const k = 1 + 0.35 * Math.exp(-beat * 8);
      const hx = x - size * 1.6, hy = y - size * 2.75;
      g.fillStyle = '#ff4d5e'; heart(g, hx, hy, size * 0.55 * k);
      g.font = `800 ${Math.round(size * 0.85)}px KzSans`;
      g.textAlign = 'left';
      g.fillText(c.bpm + ' BPM', hx + size * 0.9, hy + size * 0.32);
      g.textAlign = 'center';
    }
    g.restore();
  }
  function accessories(g, c, ctx) {
    const { head, hr, sc, dir } = ctx;
    const ha = (c.lean || 0) + (c.tilt || 0);
    g.save();
    g.translate(head.x, head.y);
    g.rotate(ha * dir);
    if (c.kind === 'motiv') {
      g.strokeStyle = '#1b1b20'; g.lineWidth = 8 * sc;
      g.beginPath(); g.arc(0, 0, hr + 5 * sc, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
      g.fillStyle = '#e8892f';
      g.beginPath(); g.ellipse(-hr * 0.62 * dir, 2 * sc, 10 * sc, 17 * sc, 0, 0, 7); g.fill();
    }
    if (c.kind === 'ego') {
      g.fillStyle = '#d9a520';
      const y0 = -hr * 0.82, w = hr * 0.95;
      g.beginPath();
      g.moveTo(-w / 2, y0); g.lineTo(-w / 2, y0 - 26 * sc); g.lineTo(-w / 4, y0 - 12 * sc);
      g.lineTo(0, y0 - 32 * sc); g.lineTo(w / 4, y0 - 12 * sc); g.lineTo(w / 2, y0 - 26 * sc);
      g.lineTo(w / 2, y0); g.closePath(); g.fill();
    }
    if (c.kind === 'disc') {
      // short neat hair line
      g.strokeStyle = '#2a2a30'; g.lineWidth = 9 * sc; g.lineCap = 'round';
      g.beginPath(); g.arc(0, 0, hr - 3 * sc, Math.PI * (dir > 0 ? 1.08 : 1.45), Math.PI * (dir > 0 ? 1.55 : 1.92)); g.stroke();
    }
    g.restore();
  }

  // ---------- frame ----------
  let bgCanvas = null;
  function render(canvas, st, t) {
    const g = canvas.getContext('2d');
    const env = { belt: st.belt || 0, power: st.power == null ? 1 : st.power, topGlow: st.topGlow || 0 };
    const cam = st.cam;
    if (!bgCanvas) { bgCanvas = document.createElement('canvas'); bgCanvas.width = W; bgCanvas.height = H; }
    const bg = bgCanvas.getContext('2d');
    drawBg(bg, cam, env);
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.filter = `blur(${st.bgBlur == null ? 8 : st.bgBlur}px)`;
    g.drawImage(bgCanvas, 0, 0);
    g.filter = 'none';
    // world
    g.translate(W / 2, H * (cam.ay || 0.5));
    g.scale(cam.zoom, cam.zoom);
    g.translate(-cam.x, -cam.y);
    drawEscalatorBack(g, env);
    const heads = [];
    for (const c of st.chars) {
      g.globalAlpha = c.alpha == null ? 1 : c.alpha;
      if (c.speed > 0) { const h0 = { head: { x: P(c.s0 + env.belt + (c.facing || 1) * ((c.w || 0) + D / 2)).x, y: P(c.s0 + env.belt + (c.facing || 1) * ((c.w || 0) + D / 2)).y - 260 } }; speedLines(g, c, h0, t); }
      const h = drawChar(g, c, env, t);
      heads.push({ c, h });
      g.globalAlpha = 1;
    }
    drawEscalatorFront(g);
    g.restore();
    // power-out darkness
    const dark = 0.42 * (1 - env.power);
    if (dark > 0) { g.fillStyle = `rgba(4,5,12,${dark})`; g.fillRect(0, 0, W, H); }
    if (env.topGlow > 0) {
      const gx = W / 2 + (TOP.x + 260 - cam.x) * cam.zoom, gy = H * (cam.ay || 0.5) + (TOP.y - 160 - cam.y) * cam.zoom;
      const gl = g.createRadialGradient(gx, gy, 0, gx, gy, 700 * cam.zoom + 200);
      gl.addColorStop(0, `rgba(255,214,150,${0.32 * env.topGlow})`);
      gl.addColorStop(1, 'rgba(255,214,150,0)');
      g.fillStyle = gl; g.fillRect(0, 0, W, H);
    }
    // foreground bokeh
    if (st.fg) {
      for (const b of st.fg) {
        const x = W / 2 + (b.x - cam.x * 1.6) * cam.zoom * 0.5, y = H / 2 + (b.y - cam.y * 1.0) * cam.zoom * 0.5;
        const gl = g.createRadialGradient(x, y, 0, x, y, b.r);
        gl.addColorStop(0, `rgba(250,232,200,${b.a * (0.3 + 0.7 * env.power)})`);
        gl.addColorStop(0.7, `rgba(250,232,200,${b.a * 0.6 * (0.3 + 0.7 * env.power)})`);
        gl.addColorStop(1, 'rgba(250,232,200,0)');
        g.fillStyle = gl; g.beginPath(); g.arc(x, y, b.r, 0, 7); g.fill();
      }
    }
    // labels
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    for (const { c, h } of heads) {
      const la = (c.label == null ? 1 : c.label) * (c.alpha == null ? 1 : c.alpha);
      if (la <= 0.01) continue;
      const sx = W / 2 + (h.head.x - cam.x) * cam.zoom;
      const sy = H * (cam.ay || 0.5) + (h.head.y - h.hr - 46 - cam.y) * cam.zoom;
      const size = clamp(15 * cam.zoom + 12, 28, 46);
      g.font = `600 ${size}px KzSans`;
      try { g.letterSpacing = `${Math.round(size * 0.22)}px`; } catch (e) {}
      const half = g.measureText(c.text || LABELS[c.kind]).width / 2;
      const sxc = clamp(sx, 70 + half, W - 70 - half);
      { // soft dark plate so the tag reads over bright lamps
        const top = sy - size * (c.bpm ? 3.6 : c.battery != null ? 2.5 : 1.3), bot = sy + size * 0.5;
        const pw2 = half + size * 1.2, cy = (top + bot) / 2, ry = (bot - top) / 2 + size * 0.6;
        g.save(); g.globalAlpha = la * 0.55;
        const pg = g.createRadialGradient(sxc, cy, 0, sxc, cy, 1);
        g.translate(sxc, cy); g.scale(pw2, ry); g.translate(-sxc, -cy);
        pg.addColorStop(0, 'rgba(4,5,12,0.9)'); pg.addColorStop(0.6, 'rgba(4,5,12,0.6)'); pg.addColorStop(1, 'rgba(4,5,12,0)');
        g.fillStyle = pg; g.beginPath(); g.arc(sxc, cy, 1, 0, 7); g.fill(); g.restore();
      }
      g.fillStyle = c.labelColor || LOOK.label;
      g.globalAlpha = la;
      g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 12;
      g.fillText(c.text || LABELS[c.kind], sxc, sy);
      g.shadowBlur = 0; try { g.letterSpacing = '0px'; } catch (e) {}
      hud(g, c, sxc + half * 0 , sy, size, t);
      g.shadowBlur = 0; g.globalAlpha = 1;
    }
    try { g.letterSpacing = '0px'; } catch (e) {}
    // vignette + fine grain
    const vg = g.createRadialGradient(W / 2, H * 0.45, H * 0.28, W / 2, H * 0.5, H * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
    const r = rng(Math.floor(t * 30) * 13 + 1);
    g.fillStyle = 'rgba(255,255,255,0.035)';
    for (let i = 0; i < 900; i++) g.fillRect(r() * W, r() * H, 2, 2);
    if (st.fade) { g.fillStyle = `rgba(0,0,0,${st.fade})`; g.fillRect(0, 0, W, H); }
  }

  // Mount a scene: canvas id, composition id, duration, state(t) builder.
  function mount(canvasId, compId, dur, build) {
    const canvas = document.getElementById(canvasId);
    const clock = { t: 0 };
    const draw = () => render(canvas, build(clock.t), clock.t);
    window.__hf = window.__hf || {};
    window.__hf.buildReady = window.__hf.buildReady || {};
    window.__hf.buildReady['fonts-' + compId] = document.fonts.load('600 30px KzSans', 'ҚӘМОТИВАЦИЯ').then(draw);
    const tl = gsap.timeline({ paused: true });
    tl.to(clock, { t: dur, duration: dur, ease: 'none', onUpdate: draw }, 0);
    draw();
    return tl;
  }

  window.Mall = { mount, P, L, D, TOP, HR, ease, smooth, lerp, clamp, rng, LABELS };
})();
