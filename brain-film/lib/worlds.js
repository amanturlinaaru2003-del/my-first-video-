/* worlds.js — the nine chapter worlds. Each W.cX(canvas, a, b) returns { renderAt(T) } with T = film time.
 * Shot changes are tied to caption-group start times from NAR (lib/narration.js). */
(function () {
  const T3 = THREE, C = CINE, { K, rng, clamp, lerp, smooth, pulse, noise3 } = C.u;
  const g = (i) => NAR.g[i][0], ge = (i) => NAR.g[i][1];
  const W = {};
  const lerp3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
  const io3 = C.u.E.io3, sine = C.u.E.sine;
  // shots: [{t, p, q?, l, m?, burst?, fov?, shake?}] — slow dolly p→q looking l→m, then a fast fly into the next shot
  function cam(S, T, shots, b, fly = 0.5) {
    let i = 0; while (i < shots.length - 1 && T >= shots[i + 1].t - fly) i++;
    const s = shots[i], n = shots[i + 1];
    const end = n ? n.t - fly : b;
    let pos, tgt, burst = 0;
    const holdEnd = s.q || s.p, holdL = s.m || s.l;
    if (T < end || !n) {
      const k = sine(clamp((T - s.t) / Math.max(0.01, end - s.t), 0, 1));
      pos = lerp3(s.p, holdEnd, k); tgt = lerp3(s.l, holdL, k);
    } else {
      const k = io3(clamp((T - end) / fly, 0, 1));
      pos = lerp3(holdEnd, n.p, k); tgt = lerp3(holdL, n.l, k);
      if (n.burst) burst = Math.sin(Math.PI * k);
    }
    S.shot(T, pos, tgt, { fov: s.fov || 34, shake: s.shake || 0, float: s.float });
    return burst;
  }
  function fin(S, T, a, b, burst, o = {}) { S.render(T, a, b, Object.assign({ exposure: (o.exposure || 1) * (1 + burst * 1.6), fog: (o.fog || 1) * (1 + burst * 3) }, o.extra || {})); }

  // shared body set: ghost giant figure, heart in chest, brain in head, blood stream heart→brain
  function bodySet(S, o = {}) {
    const B = C.brain(); S.scene.add(B.group);
    const H = C.heart(); H.group.position.set(0.05, -2.95, 0.25); H.group.scale.setScalar(0.8); S.scene.add(H.group);
    const fig = C.human({ ghost: true }); fig.group.scale.setScalar(8.6); fig.group.position.y = -1.64 * 8.6; S.scene.add(fig.group);
    fig.mat.opacity = 0.16;
    const curves = [
      new T3.CatmullRomCurve3([[0.1, -2.5, 0.3], [0.25, -1.9, 0.35], [0.22, -1.2, 0.2], [0.15, -0.55, 0.05], [0.1, 0.05, 0]].map((q) => new T3.Vector3(...q))),
      new T3.CatmullRomCurve3([[-0.1, -2.5, 0.3], [-0.3, -1.9, 0.25], [-0.25, -1.2, 0.1], [-0.18, -0.55, -0.1], [-0.12, 0.0, -0.1]].map((q) => new T3.Vector3(...q))),
    ];
    const streams = curves.map((c, i) => { const s = C.stream(c, 170, { radius: 0.06, size: 0.06, seed: 10 + i }); S.scene.add(s.group); return s; });
    return { B, H, fig, streams };
  }
  // deep neuron "space" far from the body set: what we fly into for close-ups
  function neuronSpace(S, at, seed = 3, n = 2400) {
    const R = rng(seed), p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { p[i * 3] = (R() - 0.5) * 7; p[i * 3 + 1] = (R() - 0.5) * 11; p[i * 3 + 2] = (R() - 0.5) * 9; }
    C.linkDist = 0.9; const F = C.neuronField(p, 0.8, seed); C.linkDist = null;
    F.group.position.set(...at); S.scene.add(F.group); return F;
  }
  const at = (v, off) => [v[0] + off[0], v[1] + off[1], v[2] + off[2]];

  // ================================================================ c1 — the heart stops
  W.c1 = function (cv, a, b) {
    const S = C.stage(cv, { fog: 0.05, seed: 1 , floorY: -14.2 });
    const { B, H, fig, streams } = bodySet(S);
    const STOP = 1.05;
    const HX = 60, hosp = C.hospital(); hosp.group.position.set(HX, 0, 0); S.scene.add(hosp.group);
    const shots = [
      { t: a, p: [HX + 0.1, 1.55, -0.2], q: [HX + 0.18, 1.62, 0.0], l: [HX, 0.86, -0.78], fov: 26 },
      { t: 1.25, p: [HX + 1.5, 2.2, 3.1], q: [HX + 1.3, 2.05, 2.9], l: [HX - 0.25, 0.75, -0.35] },
      { t: g(1), p: [1.6, -1.2, 9.0], q: [0.9, -1.0, 7.8], l: [0, -1.0, 0], burst: false },
    ];
    return { renderAt(T) {
      const beat = H.beatAt(T, 78, STOP);
      const life = 1 - smooth(STOP, STOP + 0.6, T);
      hosp.set(T, { amp: 1, ecg: { bpm: 78, stop: STOP } }); hosp.patient.eyes(smooth(STOP - 0.1, STOP + 0.35, T));
      H.set(T, { beat, life });
      streams.forEach((s) => s.set(T, 0.3 + 0.7 * life, 0.35 * life + 0.02));
      B.set(T, { act: 1 - smooth(2.4, 3.6, T) * 0.4, rotY: 0.4 + T * 0.1 });
      fig.mat.opacity = 0.07;
      S.warm.intensity = 8 + beat * 40 * life;
      const burst = cam(S, T, shots, b, 0.55);
      fin(S, T, a, b, burst, { extra: { inFlash: 0 } });
    } };
  };

  // ================================================================ c2 — a hungry organ
  W.c2 = function (cv, a, b) {
    const S = C.stage(cv, { fog: 0.035, seed: 2 , floorY: -14.2 });
    const { B, H, fig, streams } = bodySet(S);
    const NS = [30, 0, 0], F = neuronSpace(S, NS, 7);
    const tank = C.holo(1.4, 1.4, 512, 512, (ctx, w, h) => {
      ctx.strokeStyle = '#9fd4ff'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(w / 2, h / 2, w * 0.42, 0, Math.PI * 2); ctx.stroke();
      ctx.font = '800 230px KzSans, sans-serif'; ctx.fillStyle = '#ff6a6a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('O₂', w / 2, h / 2 + 10);
    });
    tank.mesh.position.set(1.35, 0.45, 0.4); S.scene.add(tank.mesh);
    const shots = [
      { t: a, p: [0, -2.4, 18], q: [0, -2.2, 15.5], l: [0, -1.9, 0] },                         // the whole body: brain is tiny (2%)
      { t: g(5), p: [2.4, -0.9, 7.6], q: [1.8, -0.8, 6.8], l: [0, -1.0, 0] },               // streams of oxygen climbing into it (20%)
      { t: g(7), p: [30, 0, 9], q: [30, 0, 5], l: [30, 0, 0], burst: true },                // inside: 86 billion
      { t: g(9), p: [31.2, 0.8, 2.6], q: [30.6, 0.4, 1.2], l: [30, 0, -1.5] },              // signals
      { t: g(11), p: [0.4, 0.5, 3.6], q: [0.1, 0.35, 2.7], l: [0.4, 0.2, 0], burst: true },  // no reserve
      { t: g(13), p: [-2.0, -1.0, 8.2], q: [-1.4, -1.1, 7.4], l: [0, -1.0, 0] },            // every second: heart → brain
    ];
    return { renderAt(T) {
      const beat = H.beatAt(T, 72);
      H.set(T, { beat, life: 1 });
      const surgeFlow = smooth(g(5), g(5) + 0.6, T);
      streams.forEach((s) => s.set(T, 0.55 + 0.45 * surgeFlow, 0.3 + 0.08 * beat, 1));
      B.set(T, { act: 1, rotY: 0.2 + T * 0.08 });
      F.set(T, { act: 0.7 + smooth(g(9), g(9) + 0.5, T) * 0.8 });
      fig.mat.opacity = 0.16 * (1 - smooth(g(5) - 0.5, g(5), T)) + 0.04;
      tank.mesh.material.opacity = pulse(T, g(11) + 0.2, ge(12), 0.3) * (0.75 + 0.25 * Math.sin(T * 8));
      tank.mesh.lookAt(S.cam.position);
      S.warm.intensity = 9 + beat * 30;
      const burst = cam(S, T, shots, b);
      fin(S, T, a, b, burst);
    } };
  };

  // ================================================================ c3 — the lights go out
  W.c3 = function (cv, a, b) {
    const S = C.stage(cv, { fog: 0.04, seed: 3 , floorY: -14.2 });
    const { B, H, fig, streams } = bodySet(S);
    const NS = [30, 0, 0], F = neuronSpace(S, NS, 11);
    const hosp = C.hospital(); hosp.group.position.set(-26, 0, 0); S.scene.add(hosp.group);
    const shots = [
      { t: a, p: [2.0, -1.2, 8.0], q: [1.4, -1.1, 7.2], l: [0, -1.0, 0] },                  // heart stops, blood stops
      { t: g(17), p: [0, 0.3, 4.4], q: [0, 0.2, 3.3], l: [0, 0.1, 0] },                     // consciousness fades
      { t: g(19), p: [30, 0, 7], q: [30, 0.3, 4], l: [30, 0, 0], burst: true },             // neurons without energy
      { t: g(21), p: [31.5, -1, 3], q: [30.8, -0.6, 1.8], l: [30, 0, -1] },                 // they stop talking
      { t: g(23), p: [-0.9, 0.5, 3.2], q: [-0.6, 0.35, 2.5], l: [0, 0, 0], burst: true },   // waves weaken
      { t: g(25), p: [-25.1, 1.65, 2.6], q: [-25.5, 1.55, 1.6], l: [-26.9, 1.3, -1.0], burst: true }, // flat line
    ];
    return { renderAt(T) {
      H.set(T, { beat: 0, life: 0.15 });
      const drain = 1 - smooth(a, g(16) + 0.8, T);
      streams.forEach((s) => s.set(T, drain, 0.05 + 0.25 * drain));
      const fadeAct = 1 - smooth(g(17), ge(18) + 0.5, T) * 0.75 - smooth(g(23), ge(24), T) * 0.22;
      B.set(T, { act: Math.max(0.02, fadeAct), rotY: 0.6 + T * 0.04, shell: 0.5 });
      F.set(T, { act: Math.max(0.03, 0.9 - smooth(g(19), ge(22), T) * 0.87) });
      fig.mat.opacity = 0.05;
      const amp = 1 - smooth(g(25) - 1.2, g(26) + 0.1, T);
      hosp.set(T, { amp: amp * 0.5 + 0.0001 * amp, dim: 0.8 });
      S.warm.intensity = 4;
      const burst = cam(S, T, shots, b);
      fin(S, T, a, b, burst, { exposure: 1 - smooth(a, b, T) * 0.2 });
    } };
  };

  // ================================================================ c4 — the last surge (gamma)
  W.c4 = function (cv, a, b) {
    const S = C.stage(cv, { fog: 0.035, seed: 4, exposure: 1.05 });
    const B = C.brain(); S.scene.add(B.group);
    const F = neuronSpace(S, [30, 0, 0], 13);
    const rings = []; for (let i = 0; i < 6; i++) { const r = new T3.Mesh(new T3.TorusGeometry(1, 0.012, 8, 160), new T3.MeshBasicMaterial({ color: 0xffd27a, transparent: true, blending: T3.AdditiveBlending, depthWrite: false, fog: false })); r.rotation.x = Math.PI / 2 + (i % 3 - 1) * 0.5; r.rotation.y = i * 0.6; S.scene.add(r); rings.push(r); }
    const flare = C.glow(0xfff0d0, 6, 0, 0.3); S.scene.add(flare);
    // holograms: rat (2013), elderly man EEG (2022), four beds (2023)
    const ratH = C.holo(3.4, 2.2, 768, 500, (ctx, w, h) => {
      ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.shadowColor = '#ffb040'; ctx.shadowBlur = 18;
      ctx.beginPath(); ctx.moveTo(190, 330); ctx.bezierCurveTo(200, 200, 470, 170, 560, 250); ctx.lineTo(560, 330); ctx.bezierCurveTo(470, 380, 260, 390, 190, 330); ctx.stroke(); // body
      ctx.beginPath(); ctx.moveTo(560, 250); ctx.lineTo(720, 305); ctx.lineTo(560, 330); ctx.stroke(); // snout
      ctx.beginPath(); ctx.arc(585, 215, 34, 0, Math.PI * 2); ctx.stroke();                                // ear
      ctx.fillStyle = '#ffd27a'; ctx.beginPath(); ctx.arc(640, 290, 8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(190, 330); ctx.bezierCurveTo(60, 340, 120, 450, 20, 440); ctx.stroke();   // tail
      [[290, 368], [480, 360]].forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 12, y + 45); ctx.stroke(); });
      ctx.beginPath(); ctx.ellipse(575, 270, 30, 22, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,210,122,0.6)'; ctx.fill(); // brain spot
    }, 0xffffff);
    ratH.mesh.position.set(-9, 0.3, -2); S.scene.add(ratH.mesh);
    const manH = C.holo(2.6, 3.0, 520, 600, (ctx, w, h) => {
      ctx.strokeStyle = '#9fd4ff'; ctx.lineWidth = 7; ctx.shadowColor = '#5fb0ff'; ctx.shadowBlur = 16; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(300, 560); ctx.lineTo(300, 470); ctx.quadraticCurveTo(360, 450, 360, 400); ctx.lineTo(390, 360); ctx.lineTo(362, 330);
      ctx.quadraticCurveTo(380, 150, 250, 120); ctx.quadraticCurveTo(110, 120, 110, 280); ctx.quadraticCurveTo(110, 420, 180, 470); ctx.lineTo(180, 560); ctx.stroke(); // profile
      ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = 4; for (let k = 0; k < 4; k++) { ctx.beginPath(); for (let x = 0; x < 330; x += 4) { const y = 200 + k * 34 + Math.sin(x * 0.25 + k) * (6 + k * 3) + Math.sin(x * 0.07) * 4; x ? ctx.lineTo(120 + x * 0.75, y) : ctx.moveTo(120, y); } ctx.stroke(); }
    }, 0xffffff);
    manH.mesh.position.set(9, 0.4, -2); S.scene.add(manH.mesh);
    const beds = []; for (let i = 0; i < 4; i++) {
      const bd = C.bed(); bd.group.position.set(-2.4 + i * 1.6, -2.2, -24); S.scene.add(bd.group);
      const f = C.patient(); bd.group.add(f.group);
      const gl = C.glow(0xffc46a, 1.4, 0, 0.35); gl.position.set(-2.4 + i * 1.6, -1.1, -24.75); S.scene.add(gl);
      beds.push({ f, gl, lit: i === 1 || i === 2 });
    }
    const SURGE = g(31) + 0.05; // "жарқ етеді"
    const shots = [
      { t: a, p: [2.6, 0.6, 4.8], q: [1.8, 0.4, 3.8], l: [0, 0, 0] },
      { t: g(29), p: [0, 0.2, 3.6], q: [0, 0.1, 2.9], l: [0, 0, 0] },
      { t: g(31), p: [0, 0.4, 5.2], q: [0.4, 0.3, 4.4], l: [0, 0, 0], shake: 1, fov: 38 },
      { t: g(33), p: [30, 0, 6.5], q: [30.6, 0.3, 3.5], l: [30, 0, 0], burst: true },
      { t: g(34), p: [1.8, 1.6, 3.4], q: [-1.4, 1.2, 3.2], l: [0, 0, 0] },
      { t: g(36), p: [-9, 0.5, 4.4], q: [-9, 0.4, 3.4], l: [-9, 0.3, -2], burst: true },
      { t: g(39), p: [2.2, -0.4, 4], q: [1.4, -0.2, 3.2], l: [0, 0, 0], burst: true },
      { t: g(44), p: [9, 0.6, 4.6], q: [9, 0.5, 3.6], l: [9, 0.4, -2], burst: true },
      { t: g(47), p: [0.4, 2.6, -16], q: [0.3, 1.8, -18.4], l: [0, -1.4, -24], burst: true },
    ];
    return { renderAt(T) {
      const s1 = smooth(SURGE - 0.1, SURGE + 0.25, T);
      const later = T > g(39) && T < g(44) ? 0.85 : 0.45 + 0.2 * Math.sin(T * 3);
      const surge = s1 * (T < g(34) ? 1 : later) * (1 - smooth(b - 1.5, b, T) * 0.5);
      B.set(T, { act: 0.05 + 0.1 * (1 - s1), surge, mix: s1, rotY: 0.3 + T * 0.1, shell: 0.45 + 0.2 * s1 });
      F.set(T, { act: 0.2, surge: s1 * 0.9, mix: 1 });
      rings.forEach((r, i) => { const ph = ((T - SURGE) * 0.9 + i / rings.length) % 1; const on = s1 * (T > SURGE ? 1 : 0); r.scale.setScalar(0.9 + ph * 3.2); r.material.opacity = on * (1 - ph) * 0.9; });
      flare.material.opacity = Math.exp(-Math.pow((T - SURGE - 0.1) / 0.35, 2)) * 1.4; flare.scale.setScalar(6 + 10 * flare.material.opacity);
      ratH.mesh.material.opacity = 0.9 * smooth(g(36), g(36) + 0.5, T) * (0.85 + 0.15 * Math.sin(T * 14));
      manH.mesh.material.opacity = 0.9 * smooth(g(44), g(44) + 0.5, T) * (0.85 + 0.15 * Math.sin(T * 13));
      beds.forEach((bd, i) => { bd.gl.material.opacity = bd.lit ? smooth(g(48) + i * 0.25, g(48) + 0.5 + i * 0.25, T) * (0.8 + 0.2 * Math.sin(T * 9 + i)) : 0.0; });
      S.warm.color.set(0xffa040); S.warm.intensity = 4 + surge * 60;
      const burst = cam(S, T, shots, b);
      fin(S, T, a, b, burst);
    } };
  };

  // ================================================================ c5 — a life before your eyes?
  const MEM = [
    (c, w, h) => { sky(c, w, h, '#ff9e5a', '#5a2a5e'); sun(c, w * 0.7, h * 0.62, 60); hill(c, w, h, 0.72); person(c, w * 0.35, h * 0.72, 1, true); c.strokeStyle = '#1a0d14'; c.lineWidth = 3; c.beginPath(); c.moveTo(w * 0.35, h * 0.55); c.lineTo(w * 0.55, h * 0.25); c.stroke(); c.fillStyle = '#1a0d14'; c.beginPath(); c.moveTo(w * 0.55, h * 0.18); c.lineTo(w * 0.6, h * 0.25); c.lineTo(w * 0.55, h * 0.32); c.lineTo(w * 0.5, h * 0.25); c.fill(); },
    (c, w, h) => { sky(c, w, h, '#ffcf8a', '#a65a3a'); hill(c, w, h, 0.8); person(c, w * 0.42, h * 0.8, 1.6); person(c, w * 0.58, h * 0.8, 1.0, true); },
    (c, w, h) => { sky(c, w, h, '#2a3a6a', '#090d1f'); stars(c, w, h); c.fillStyle = '#0b0b14'; c.fillRect(w * 0.3, h * 0.45, w * 0.4, h * 0.4); c.beginPath(); c.moveTo(w * 0.25, h * 0.47); c.lineTo(w * 0.5, h * 0.25); c.lineTo(w * 0.75, h * 0.47); c.fill(); c.fillStyle = '#ffc46a'; c.fillRect(w * 0.38, h * 0.55, w * 0.09, h * 0.1); c.fillRect(w * 0.53, h * 0.55, w * 0.09, h * 0.1); },
    (c, w, h) => { sky(c, w, h, '#ff7a6a', '#3a1a4a'); sun(c, w * 0.5, h * 0.75, 90); c.fillStyle = '#2a1030'; c.fillRect(0, h * 0.78, w, h); person(c, w * 0.44, h * 0.8, 1.5); person(c, w * 0.56, h * 0.8, 1.4); },
    (c, w, h) => { sky(c, w, h, '#ffd89a', '#c2704a'); c.fillStyle = '#5a2a1a'; c.fillRect(w * 0.3, h * 0.55, w * 0.4, h * 0.2); c.fillStyle = '#ffeacc'; c.fillRect(w * 0.3, h * 0.52, w * 0.4, h * 0.05); for (let i = 0; i < 5; i++) { c.fillStyle = '#fff'; c.fillRect(w * (0.36 + i * 0.07), h * 0.42, 6, h * 0.1); c.fillStyle = '#ffb030'; c.beginPath(); c.ellipse(w * (0.36 + i * 0.07) + 3, h * 0.39, 7, 12, 0, 0, 7); c.fill(); } },
    (c, w, h) => { sky(c, w, h, '#ffb070', '#6a3a6a'); hill(c, w, h, 0.78); person(c, w * 0.4, h * 0.78, 1.5, false, true); person(c, w * 0.55, h * 0.78, 0.9, true); },
  ];
  function sky(c, w, h, a, b) { const gr = c.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, a); gr.addColorStop(1, b); c.fillStyle = gr; c.fillRect(0, 0, w, h); }
  function sun(c, x, y, r) { const gr = c.createRadialGradient(x, y, 0, x, y, r * 2.4); gr.addColorStop(0, 'rgba(255,240,200,1)'); gr.addColorStop(0.35, 'rgba(255,200,120,0.8)'); gr.addColorStop(1, 'rgba(255,160,80,0)'); c.fillStyle = gr; c.fillRect(0, 0, c.canvas.width, c.canvas.height); }
  function hill(c, w, h, y) { c.fillStyle = '#1a0d14'; c.beginPath(); c.moveTo(0, h); c.lineTo(0, h * y); c.quadraticCurveTo(w * 0.5, h * (y - 0.12), w, h * y); c.lineTo(w, h); c.fill(); }
  function stars(c, w, h) { const r = rng(5); c.fillStyle = '#fff'; for (let i = 0; i < 60; i++) c.fillRect(r() * w, r() * h * 0.5, 2, 2); }
  function person(c, x, y, s, child, cane) { c.fillStyle = '#1a0d14'; const k = (child ? 0.65 : 1) * s * 40; c.beginPath(); c.arc(x, y - k * 3.4, k * 0.55, 0, 7); c.fill(); c.beginPath(); c.moveTo(x - k * 0.7, y); c.lineTo(x - k * 0.55, y - k * 2.8); c.lineTo(x + k * 0.55, y - k * 2.8); c.lineTo(x + k * 0.7, y); c.fill(); if (cane) { c.strokeStyle = '#1a0d14'; c.lineWidth = 4; c.beginPath(); c.moveTo(x + k, y - k * 1.6); c.lineTo(x + k * 1.2, y); c.stroke(); } }
  W.c5 = function (cv, a, b) {
    const S = C.stage(cv, { fog: 0.03, seed: 5, fogTint: 0x8a7060 });
    const B = C.brain(); B.group.position.set(0, 0, -30); S.scene.add(B.group);
    const frames = MEM.concat(MEM.slice(0, 2)).map((d, i) => {
      const h = C.holo(2.4, 1.8, 512, 384, (ctx, w, hh) => { d(ctx, w, hh); ctx.strokeStyle = 'rgba(255,230,190,0.9)'; ctx.lineWidth = 10; ctx.strokeRect(5, 5, w - 10, hh - 10); }, 0xffffff);
      h.mesh.material.blending = T3.NormalBlending; h.mesh.material.opacity = 0.92;
      const side = i % 2 ? 1 : -1; h.mesh.position.set(side * (1.3 + (i % 3) * 0.3), (i % 3 - 1) * 1.3, -i * 2.6); h.mesh.rotation.y = -side * 0.35;
      const gl = C.glow(0xffb070, 3.6, 0.35, 0.4); gl.position.copy(h.mesh.position); gl.position.z -= 0.2; S.scene.add(gl);
      S.scene.add(h.mesh); return { h, gl };
    });
    const q = C.holo(0.9, 1.1, 400, 500, (ctx, w, h) => { ctx.font = '800 420px KzSans, sans-serif'; ctx.fillStyle = '#ffd27a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = '#ffb040'; ctx.shadowBlur = 30; ctx.fillText('?', w / 2, h / 2 + 20); }, 0xffffff);
    q.mesh.position.set(0, 1.25, -29.4); S.scene.add(q.mesh);
    const shots = [
      { t: a, p: [0, 0, 6], q: [0, 0, -9], l: [0, 0, -14], float: 0.15 },
      { t: g(53), p: [0, 0.2, -24.5], q: [0.4, 0.1, -26.4], l: [0, 0, -30], burst: true },
      { t: g(57), p: [-1.6, 0.6, -25.5], q: [-0.8, 0.4, -26.2], l: [0, 0, -30] },
      { t: g(59), p: [0, 0.5, -25.0], q: [0, 0.5, -25.8], l: [0, 0.6, -29.6] },
    ];
    return { renderAt(T) {
      const surge = 0.22 + 0.12 * Math.sin(T * 5);
      B.set(T, { act: 0.2, surge: surge * (1 - smooth(g(59), b, T) * 0.7), mix: 1, rotY: T * 0.15, shell: 0.6 });
      frames.forEach((f, i) => { const o = 0.92 * (1 - smooth(g(59) - 0.3, g(59) + 0.6, T)); f.h.mesh.material.opacity = o; f.gl.material.opacity = 0.3 * o; f.h.mesh.position.y += Math.sin(T * 0.8 + i) * 0.002; });
      q.mesh.material.opacity = smooth(g(59), g(59) + 0.5, T) * 0.95;
      S.warm.intensity = 13;
      const burst = cam(S, T, shots, b);
      fin(S, T, a, b, burst);
    } };
  };

  // ================================================================ c6 — the wave of death (spreading depolarization)
  W.c6 = function (cv, a, b) {
    const S = C.stage(cv, { fog: 0.04, seed: 6, floor: false });
    const B = C.brain(); S.scene.add(B.group);
    const F = neuronSpace(S, [30, 0, 0], 17, 1700);
    const label = C.holo(1.7, 0.42, 900, 220, (ctx, w, h) => { ctx.font = '800 92px KzSans, sans-serif'; ctx.fillStyle = '#9fd4ff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = '#5fb0ff'; ctx.shadowBlur = 20; ctx.fillText('ДЕПОЛЯРИЗАЦИЯ', w / 2, h / 2); }, 0xffffff);
    label.mesh.position.set(0, 0.95, 0.3);
    const shots = [
      { t: a, p: [3.4, 0.9, 2.2], q: [2.8, 0.7, 1.4], l: [0, 0, 0] },
      { t: g(63), p: [33, 1, 2], q: [31.5, 0.6, 1], l: [30, 0, -2], burst: true },
      { t: g(67), p: [3.6, 1.2, -0.4], q: [3.2, 1.0, -1.6], l: [0, 0, 0], burst: true },
      { t: g(69), p: [0, 0.4, 4.6], q: [0, 0.35, 3.8], l: [0, 0.4, 0] },
    ];
    return { renderAt(T) {
      const w1 = lerp(1.1, -1.15, smooth(g(61), ge(68), T)); // the front travels front → back through the brain
      B.set(T, { act: 0.75, wave: w1, rotY: -0.2, shell: 0.4 });
      const w2 = lerp(5, -5, smooth(g(63) - 0.3, ge(66) + 0.4, T));
      F.set(T, { act: 0.8, wave: w2 });
      label.mesh.material.opacity = smooth(g(70), g(70) + 0.4, T) * 0.95;
      S.warm.intensity = 5;
      const burst = cam(S, T, shots, b);
      fin(S, T, a, b, burst);
    } };
  };

  // ================================================================ c7 — not in a moment: minutes, hours, CPR
  W.c7 = function (cv, a, b) {
    const S = C.stage(cv, { fog: 0.035, seed: 7 , floorY: -14.2 });
    const { B, H, fig, streams } = bodySet(S);
    const timer = C.holo(2.4, 1.0, 720, 300, () => {}, 0xffffff); timer.mesh.position.set(0, 1.25, 0.3);
    // the lab: glass cylinder, blue liquid, a second brain
    const LAB = [-30, 0, 0];
    const LB = C.brain(); LB.group.position.set(LAB[0], 0, 0); LB.group.scale.setScalar(0.85); S.scene.add(LB.group);
    const glass = new T3.Mesh(new T3.CylinderGeometry(1.25, 1.25, 3.0, 64, 1, true), new T3.MeshPhysicalMaterial({ color: 0x8fc0ff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.18, clearcoat: 1, side: T3.DoubleSide, depthWrite: false }));
    glass.position.set(LAB[0], 0, 0); S.scene.add(glass);
    const cap = new T3.MeshStandardMaterial({ color: 0x2a3140, roughness: 0.3, metalness: 0.9 });
    [1.55, -1.55].forEach((y) => { const c = new T3.Mesh(new T3.CylinderGeometry(1.35, 1.35, 0.18, 64), cap); c.position.set(LAB[0], y, 0); S.scene.add(c); });
    const liquid = C.glow(0x3a8cff, 5.5, 0.35, 0.5); liquid.position.set(LAB[0], 0, -0.4); S.scene.add(liquid);
    [[-0.9, 1], [0.9, 1], [0, 1]].forEach(([x], i) => { const cu = new T3.CatmullRomCurve3([[LAB[0] + x * 0.6, 1.6, 0], [LAB[0] + x * 1.6, 2.4, -0.6], [LAB[0] + x * 3.2, 1.0, -1.8], [LAB[0] + x * 3.6, -2.2, -2]].map((q) => new T3.Vector3(...q))); S.scene.add(new T3.Mesh(new T3.TubeGeometry(cu, 40, 0.05, 10), cap)); });
    const yale = C.holo(2.6, 0.7, 760, 200, (ctx, w, h) => { ctx.font = '800 96px KzSans, sans-serif'; ctx.fillStyle = '#9fd4ff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = '#5fb0ff'; ctx.shadowBlur = 18; ctx.fillText('ЙЕЛЬ · 2019', w / 2, h / 2); }, 0xffffff);
    yale.mesh.position.set(LAB[0], 2.25, 0.4);
    const shots = [
      { t: a, p: [0.6, 0.4, 3.4], q: [0.3, 0.3, 2.7], l: [0, 0.1, 0] },
      { t: g(74), p: [0, 0.6, 4.6], q: [0, 0.6, 3.8], l: [0, 0.55, 0] },
      { t: g(77), p: [LAB[0] + 2.4, 1.4, 6.8], q: [LAB[0] + 1.4, 1.0, 5.6], l: [LAB[0], 0.6, 0], burst: true },
      { t: g(79), p: [LAB[0] + 1.2, 0.3, 3.2], q: [LAB[0] + 0.5, 0.2, 2.5], l: [LAB[0], 0, 0] },
      { t: g(83), p: [LAB[0] - 2, 0.8, 6.4], q: [LAB[0] - 1.2, 0.6, 5.6], l: [LAB[0], 0, 0] },
      { t: g(85), p: [1.6, -2.3, 4.2], q: [1.0, -2.2, 3.4], l: [0, -2.4, 0], burst: true },
      { t: g(87), p: [0.8, -0.8, 6.6], q: [0.4, -0.6, 5.8], l: [0, -0.9, 0] },
    ];
    return { renderAt(T) {
      const tmin = clamp((T - g(74)) / (ge(76) - g(74)), 0, 1) * 6; // 0 → 6 minutes on the hologram
      timer.draw((ctx, w, h) => {
        const m = Math.floor(tmin), s = Math.floor((tmin - m) * 60);
        ctx.font = '800 170px KzSans, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const danger = tmin >= 4; ctx.fillStyle = danger ? '#ff5a4a' : '#9fd4ff'; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 26;
        ctx.fillText('0' + m + ':' + (s < 10 ? '0' : '') + s, w / 2, h / 2 + 8);
      });
      timer.mesh.material.opacity = pulse(T, g(74), ge(76) + 0.3, 0.3);
      const grey = smooth(g(75), ge(76), T) * (1 - smooth(g(85), g(87), T));
      const cpr = smooth(g(85), g(85) + 0.4, T);
      const beat = cpr * H.beatAt(T, 110);
      H.set(T, { beat: cpr ? beat * 1.6 : 0, life: 0.2 + cpr * 0.8 });
      streams.forEach((s) => s.set(T, cpr, 0.3 * cpr + 0.01));
      B.set(T, { act: 0.12 + smooth(g(86), g(87) + 0.6, T) * 0.88, grey, rotY: 0.5 + T * 0.05, shell: 0.5 });
      fig.mat.opacity = 0.05 + cpr * 0.05;
      const rev = smooth(g(81), ge(82), T);
      LB.set(T, { act: 0.02, dead: 0.95, grey: 0.85, revive: rev, rotY: 0.3 + T * 0.05, shell: 0.45 });
      liquid.material.opacity = 0.25 + 0.15 * Math.sin(T * 1.3);
      yale.mesh.material.opacity = pulse(T, g(77) + 0.3, ge(78) + 0.6, 0.3) * 0.95;
      S.warm.intensity = 5 + beat * 40;
      const burst = cam(S, T, shots, b);
      fin(S, T, a, b, burst);
    } };
  };

  // ================================================================ c8 — the tunnel and the light (near-death experiences)
  W.c8 = function (cv, a, b) {
    const S = C.stage(cv, { fog: 0.035, seed: 8 });
    // hospital bed + body + rising ghost
    const hosp = C.hospital(); hosp.group.position.set(0, -2.2, 0); S.scene.add(hosp.group);
    const ghost = C.patient({ ghost: true }); hosp.group.add(ghost.group);
    // tunnel of light rings
    const TZ = -20; const rings = [];
    for (let i = 0; i < 26; i++) {
      const r = new T3.Mesh(new T3.TorusGeometry(2.2, 0.03, 8, 120), new T3.MeshBasicMaterial({ color: i % 2 ? 0x9fc8ff : 0xffe2b0, transparent: true, blending: T3.AdditiveBlending, depthWrite: false, opacity: 0.7 }));
      r.position.set(Math.sin(i * 0.4) * 0.4, Math.cos(i * 0.3) * 0.4, TZ - i * 2.2); S.scene.add(r); rings.push(r);
    }
    const end = C.glow(0xfff6e6, 18, 1, 0.3); end.position.set(0, 0, TZ - 60); S.scene.add(end);
    // ten figures, one lit (≈10 %)
    const ten = []; for (let i = 0; i < 10; i++) { const f = C.human({ shirt: [0x86a8bd, 0x9c6b5a, 0x6f8f6a, 0xc9b28a, 0x5b6f9c, 0x8a6f9c, 0xb7b7b7, 0x7a9c9a, 0xa0544c, 0x4f6178][i], pants: i % 2 ? 0x2c3442 : 0x4a4038 }); const ang = (i / 10) * Math.PI * 2; f.group.position.set(40 + Math.sin(ang) * 2.6, -2.2, Math.cos(ang) * 2.6); f.idle(i * 3.1, 1); f.group.rotation.y = ang + Math.PI; S.scene.add(f.group); ten.push(f); }
    const tenL = new T3.SpotLight(0xcfe2ff, 60, 14, 0.7, 0.6, 1.5); tenL.position.set(40, 6, 3); tenL.target.position.set(40, -2, 0); S.scene.add(tenL, tenL.target);
    const lit = C.glow(0xffd27a, 3.4, 0, 0.35); lit.position.copy(ten[0].group.position); lit.position.y = -0.8; S.scene.add(lit);
    const B = C.brain(); B.group.position.set(-40, 0, 0); S.scene.add(B.group);
    const shots = [
      { t: a, p: [1.6, 0.25, 3.6], q: [1.2, 0.05, 3.0], l: [-0.15, -1.45, -0.3] },
      { t: g(91), p: [0, 0, TZ + 8], q: [0, 0, TZ - 30], l: [0, 0, TZ - 60], burst: true, float: 0.2 },
      { t: g(93), p: [1.3, 0.2, 2.6], q: [1.0, 0.05, 2.2], l: [0, -1.0, 0.0], burst: true },
      { t: g(95), p: [40, 3.6, 8.5], q: [40, 3.0, 7.0], l: [40, -1, 0], burst: true },
      { t: g(99), p: [-40, 0.3, 3.6], q: [-40, 0.2, 2.8], l: [-40, 0, 0], burst: true },
    ];
    return { renderAt(T) {
      const rise = smooth(g(93), ge(94) + 0.6, T);
      ghost.group.position.y = 0.74 + rise * 1.1; ghost.group.rotation.x = -Math.PI / 2 + rise * 0.3; ghost.mat.opacity = 0.02 + rise * 0.4; ghost.mat.emissiveIntensity = 0.4 + rise * 0.8;
      hosp.set(T, { amp: 0.0001, dim: 0.7 });
      rings.forEach((r, i) => { r.rotation.z = T * 0.3 + i * 0.2; r.material.opacity = 0.35 + 0.35 * Math.sin(T * 4 - i * 0.5); });
      end.material.opacity = 1; end.scale.setScalar(18 + smooth(g(92), ge(92), T) * 30);
      lit.material.opacity = smooth(g(98), g(98) + 0.5, T) * (0.8 + 0.2 * Math.sin(T * 7));
      ten[0].mat.emissive.set(0xffa040); ten[0].mat.emissiveIntensity = smooth(g(98), g(98) + 0.5, T) * 0.8;
      const flick = 0.5 + 0.5 * noise3(T * 6, 1, 1);
      B.set(T, { act: 0.25 + flick * 0.5, surge: smooth(g(101), ge(102), T) * 0.7 * flick, mix: smooth(g(101), ge(102), T), rotY: T * 0.12, shell: 0.5 });
      const burst = cam(S, T, shots, b);
      fin(S, T, a, b, burst);
    } };
  };

  // ================================================================ c9 — a process, not a moment
  W.c9 = function (cv, a, b) {
    const S = C.stage(cv, { fog: 0.03, seed: 9 });
    const B = C.brain(); S.scene.add(B.group);
    const dust = (() => { const n = 1400, R = rng(91), p = new Float32Array(n * 3), v = []; for (let i = 0; i < n; i++) { v.push([R() - 0.5, R() - 0.5, R() - 0.5].map((x) => x * 2)); } const gg = new T3.BufferGeometry(); gg.setAttribute('position', new T3.BufferAttribute(p, 3)); const m = new T3.Points(gg, new T3.PointsMaterial({ color: 0xffd8a0, size: 0.05, map: C.glowTex(0.3), transparent: true, depthWrite: false, blending: T3.AdditiveBlending })); m.frustumCulled = false; S.scene.add(m); return { m, p, v, gg }; })();
    const FINAL = g(109);
    const shots = [
      { t: a, p: [-2.6, 0.6, 3.6], q: [-1.6, 0.4, 3.0], l: [0, 0, 0] },
      { t: g(105), p: [1.8, 1.4, 3.4], q: [1.2, 1.0, 2.8], l: [0, 0, 0] },
      { t: g(107), p: [0, 0.2, 3.2], q: [0, 0.15, 2.6], l: [0, 0, 0], shake: 0.6 },
      { t: g(110), p: [0, 0.4, 3.6], q: [0, 2.4, 14], l: [0, 0, 0] },
    ];
    return { renderAt(T) {
      const wave = lerp(1.1, -1.15, smooth(g(105), ge(106) + 0.6, T));
      const fs = Math.exp(-Math.pow((T - FINAL - 0.15) / 0.5, 2));
      const after = smooth(FINAL + 0.3, FINAL + 2, T);
      B.set(T, { act: 0.7 * (1 - after * 0.8), wave: T < FINAL - 0.3 ? wave : -99, dead: T < FINAL - 0.3 ? 0 : after * 0.85, surge: fs * 1.2, mix: fs > 0.05 ? 1 : 0, rotY: 0.3 + T * 0.08, shell: 0.55 - after * 0.3 });
      const k = smooth(FINAL, b, T);
      for (let i = 0; i < dust.v.length; i++) { const v = dust.v[i], r = 0.6 + k * 7 * (0.5 + (i % 5) * 0.15); dust.p[i * 3] = v[0] * r * 0.6; dust.p[i * 3 + 1] = v[1] * r * 0.5 + k * 1.2; dust.p[i * 3 + 2] = v[2] * r * 0.7; }
      dust.gg.attributes.position.needsUpdate = true; dust.m.material.opacity = smooth(FINAL - 0.1, FINAL + 0.2, T) * (1 - smooth(b - 3, b - 0.4, T));
      S.warm.intensity = 6 + fs * 60;
      const burst = cam(S, T, shots, b);
      fin(S, T, a, b, burst, { extra: { outFlash: 0 }, exposure: 1 - smooth(b - 1.6, b - 0.2, T) * 0.95 });
    } };
  };

  window.WORLDS = W;
})();
