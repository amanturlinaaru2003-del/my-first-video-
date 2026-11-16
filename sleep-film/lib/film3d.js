/* film3d.js — 3D worlds for «НЕГЕ ҰЙЫҚТАЙ АЛМАЙСЫҢ?»
 * Everything visible is a pure function of time: each scene calls F3D.<world>.renderAt(t).
 * Requires THREE (r159 UMD) as a global. */
(function () {
  const T3 = THREE;
  const F = {};
  const V3 = (x, y, z) => new T3.Vector3(x, y, z);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const smooth = (a, b, x) => { const k = clamp((x - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };

  // ---------------------------------------------------------------- easing + keyed tracks
  const E = {
    lin: (x) => x, in2: (x) => x * x, out2: (x) => 1 - (1 - x) * (1 - x), io2: (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),
    io3: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2), in3: (x) => x * x * x, out3: (x) => 1 - Math.pow(1 - x, 3),
    out4: (x) => 1 - Math.pow(1 - x, 4), sine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
    back: (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
    expo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  };
  const lerpV = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * k) : a + (b - a) * k);
  // keys: [[time, value, ease]]; the ease shapes the segment that ends at that key
  function K(t, keys) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e] = keys[i];
      if (t <= t1) { const [t0, v0] = keys[i - 1]; const x = (t - t0) / (t1 - t0 || 1); return lerpV(v0, v1, E[e || 'io2'](x)); }
    }
    return keys[keys.length - 1][1];
  }
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  // smooth 3D value noise
  const P = new Uint8Array(512); { const r = rng(1234); const p = [...Array(256).keys()]; for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } for (let i = 0; i < 512; i++) P[i] = p[i & 255]; }
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  function grad(h, x, y, z) { const u = h < 8 ? x : y, v = h < 4 ? y : h === 12 || h === 14 ? x : z; return ((h & 1) ? -u : u) + ((h & 2) ? -v : v); }
  function noise3(x, y, z) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255; x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
    const u = fade(x), v = fade(y), w = fade(z); const A = P[X] + Y, AA = P[A] + Z, AB = P[A + 1] + Z, B = P[X + 1] + Y, BA = P[B] + Z, BB = P[B + 1] + Z;
    return lerp(lerp(lerp(grad(P[AA] & 15, x, y, z), grad(P[BA] & 15, x - 1, y, z), u), lerp(grad(P[AB] & 15, x, y - 1, z), grad(P[BB] & 15, x - 1, y - 1, z), u), v),
      lerp(lerp(grad(P[AA + 1] & 15, x, y, z - 1), grad(P[BA + 1] & 15, x - 1, y, z - 1), u), lerp(grad(P[AB + 1] & 15, x, y - 1, z - 1), grad(P[BB + 1] & 15, x - 1, y - 1, z - 1), u), v), w);
  }
  F.util = { K, E, rng, noise3, clamp, lerp, smooth, V3 };

  // ---------------------------------------------------------------- renderer, env, textures
  F.renderer = function (canvas, { exposure = 1.0, shadows = true } = {}) {
    const r = new T3.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, alpha: false });
    r.setPixelRatio(1); r.setSize(1080, 1920, false);
    r.outputColorSpace = T3.SRGBColorSpace; r.toneMapping = T3.ACESFilmicToneMapping; r.toneMappingExposure = exposure;
    r.shadowMap.enabled = shadows; r.shadowMap.type = T3.PCFSoftShadowMap;
    return r;
  };
  // soft studio-ish environment for reflections on eyes, clearcoat and glossy toys
  F.envMap = function (renderer, top = 0x6b8cc7, bottom = 0x1a2233, key = 0xffe2c0) {
    const s = new T3.Scene();
    const g = new T3.SphereGeometry(10, 32, 16);
    const m = new T3.ShaderMaterial({ side: T3.BackSide, uniforms: { a: { value: new T3.Color(top) }, b: { value: new T3.Color(bottom) } },
      vertexShader: 'varying vec3 p; void main(){ p=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: 'uniform vec3 a; uniform vec3 b; varying vec3 p; void main(){ float k=clamp(p.y/10.*0.5+0.5,0.,1.); gl_FragColor=vec4(mix(b,a,k),1.); }' });
    s.add(new T3.Mesh(g, m));
    const panel = new T3.Mesh(new T3.PlaneGeometry(6, 4), new T3.MeshBasicMaterial({ color: key }));
    panel.position.set(4, 5, 6); panel.lookAt(0, 0, 0); s.add(panel);
    const pm = new T3.PMREMGenerator(renderer); const tex = pm.fromScene(s, 0.04).texture; pm.dispose();
    return tex;
  };
  F.canvasTex = function (w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const ctx = c.getContext('2d');
    const tex = new T3.CanvasTexture(c); tex.colorSpace = T3.SRGBColorSpace; tex.anisotropy = 4;
    const o = { c, ctx, tex, draw: (...a) => { ctx.clearRect(0, 0, w, h); draw(ctx, w, h, ...a); tex.needsUpdate = true; } };
    o.draw(); return o;
  };
  F.glowTex = (function () { let cache = {}; return function (color = '#ffffff', soft = 0.5) {
    const k = color + soft; if (cache[k]) return cache[k];
    const t = F.canvasTex(128, 128, (ctx, w, h) => { const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, color); g.addColorStop(soft, color + '55'); g.addColorStop(1, color + '00'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
    cache[k] = t.tex; return t.tex; }; })();
  F.sprite = function (color, size, opacity = 1, soft = 0.4) {
    const s = new T3.Sprite(new T3.SpriteMaterial({ map: F.glowTex(color, soft), transparent: true, depthWrite: false, blending: T3.AdditiveBlending, opacity }));
    s.scale.set(size, size, 1); return s;
  };
  F.std = (color, o = {}) => new T3.MeshStandardMaterial(Object.assign({ color, roughness: 0.6, metalness: 0 }, o));
  F.phys = (color, o = {}) => new T3.MeshPhysicalMaterial(Object.assign({ color, roughness: 0.45, metalness: 0 }, o));
  function ell(rx, ry, rz, mat, seg = 32) { const m = new T3.Mesh(new T3.SphereGeometry(1, seg, Math.round(seg * 0.75)), mat); m.scale.set(rx, ry, rz); m.castShadow = true; m.receiveShadow = true; return m; }
  function cap(r, len, mat, seg = 16) { const m = new T3.Mesh(new T3.CapsuleGeometry(r, len, 8, seg), mat); m.castShadow = true; m.receiveShadow = true; return m; }
  function roundedBox(w, h, d, r, seg = 4) {
    const shape = new T3.Shape(); const x = -w / 2 + r, y = -h / 2 + r, W = w - 2 * r, H = h - 2 * r;
    shape.moveTo(x, y - r); shape.lineTo(x + W, y - r); shape.quadraticCurveTo(x + W + r, y - r, x + W + r, y); shape.lineTo(x + W + r, y + H);
    shape.quadraticCurveTo(x + W + r, y + H + r, x + W, y + H + r); shape.lineTo(x, y + H + r); shape.quadraticCurveTo(x - r, y + H + r, x - r, y + H); shape.lineTo(x - r, y); shape.quadraticCurveTo(x - r, y - r, x, y - r);
    const g = new T3.ExtrudeGeometry(shape, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r * 0.98, bevelSegments: seg, curveSegments: seg * 2 });
    g.translate(0, 0, -(d - 2 * r) / 2); g.computeVertexNormals(); return g;
  }
  F.geo = { ell, cap, roundedBox };

  // ---------------------------------------------------------------- the boy (modelled on the reference photo)
  const SKIN = 0xf2c29e, SKIN2 = 0xeaa58a, HAIR = 0x3a2115, TEE = 0x9aa0a6, TRIM = 0xb3262f, PANTS = 0x2f6f99;
  function duckPants() {
    return F.canvasTex(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#2f6f99'; ctx.fillRect(0, 0, w, h);
      const r = rng(5);
      for (let i = 0; i < 26; i++) {
        const x = r() * w, y = r() * h, s = 18 + r() * 6;
        ctx.save(); ctx.translate(x, y); ctx.rotate((r() - 0.5) * 0.8);
        ctx.fillStyle = '#f2c94c'; ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.62, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(s * 0.75, -s * 0.55, s * 0.45, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e8892b'; ctx.beginPath(); ctx.moveTo(s * 1.15, -s * 0.55); ctx.lineTo(s * 1.55, -s * 0.45); ctx.lineTo(s * 1.15, -s * 0.35); ctx.fill();
        ctx.fillStyle = '#1b2b3a'; ctx.beginPath(); ctx.arc(s * 0.85, -s * 0.65, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 0.08; for (let y = 0; y < h; y += 4) { ctx.fillStyle = y % 8 ? '#000' : '#fff'; ctx.fillRect(0, y, w, 2); }
    });
  }
  function eyeTex() {
    return F.canvasTex(1024, 512, (ctx, w, h) => {
      ctx.fillStyle = '#fbfaf6'; ctx.fillRect(0, 0, w, h);
      const g0 = ctx.createRadialGradient(w * 0.25, h / 2, 0, w * 0.25, h / 2, 300); g0.addColorStop(0.6, 'rgba(0,0,0,0)'); g0.addColorStop(1, 'rgba(200,150,140,0.35)'); ctx.fillStyle = g0; ctx.fillRect(0, 0, w, h);
      const cx = w * 0.25, cy = h / 2;
      const gi = ctx.createRadialGradient(cx, cy, 10, cx, cy, 62); gi.addColorStop(0, '#5a3a22'); gi.addColorStop(0.7, '#3b2414'); gi.addColorStop(1, '#1d120a');
      ctx.fillStyle = gi; ctx.beginPath(); ctx.arc(cx, cy, 62, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0b0705'; ctx.beginPath(); ctx.arc(cx, cy, 34, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(120,80,50,0.5)'; ctx.lineWidth = 2; for (let a = 0; a < 40; a++) { const t = (a / 40) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(t) * 36, cy + Math.sin(t) * 36); ctx.lineTo(cx + Math.cos(t) * 60, cy + Math.sin(t) * 60); ctx.stroke(); }
    });
  }
  // mouth drawn on a canvas each frame from a few parameters
  function drawMouth(ctx, w, h, m) {
    m = m || { wid: 0.6, smile: 0.2, open: 0.1, teeth: 0, round: 0 };
    const cx = w / 2, cy = h / 2;
    const hw = (w * 0.42) * lerp(m.wid, 0.18, m.round), sm = m.smile * h * 0.28, op = m.open * h * 0.5 + 2;
    ctx.lineJoin = 'round';
    const path = () => { ctx.beginPath(); ctx.moveTo(cx - hw, cy - sm * 0.6); ctx.quadraticCurveTo(cx, cy + sm * 0.7 - op * 0.15, cx + hw, cy - sm * 0.6);
      ctx.quadraticCurveTo(cx, cy + sm * 0.7 + op * (1 + m.round * 0.6), cx - hw, cy - sm * 0.6); ctx.closePath(); };
    path(); ctx.fillStyle = '#3e1116'; ctx.fill();
    ctx.save(); path(); ctx.clip();
    if (m.teeth > 0) { ctx.fillStyle = '#fffaf0'; ctx.fillRect(cx - hw, cy - sm * 0.6 - 30, hw * 2, 30 + (sm * 0.7 + op * 0.45) * m.teeth); ctx.strokeStyle = 'rgba(160,140,120,0.35)'; ctx.lineWidth = 2; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(cx + i * hw * 0.27, cy - 40); ctx.lineTo(cx + i * hw * 0.27, cy + sm * 0.5 + op * 0.4); ctx.stroke(); } }
    ctx.fillStyle = '#c4545e'; ctx.beginPath(); ctx.ellipse(cx, cy + sm * 0.7 + op * 0.9, hw * 0.5, op * 0.45 + 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    path(); ctx.strokeStyle = '#a7574a'; ctx.lineWidth = 7; ctx.stroke();
    // corners
    ctx.strokeStyle = 'rgba(167,87,74,0.6)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx - hw - 4, cy - sm * 0.6, 8, -1, 1); ctx.stroke(); ctx.beginPath(); ctx.arc(cx + hw + 4, cy - sm * 0.6, 8, Math.PI - 1, Math.PI + 1); ctx.stroke();
  }
  F.MOUTH = {
    grin: { wid: 0.95, smile: 0.75, open: 0.35, teeth: 1, round: 0 },
    nervous: { wid: 0.9, smile: 0.45, open: 0.25, teeth: 1, round: 0 },
    flat: { wid: 0.55, smile: 0.05, open: 0.02, teeth: 0, round: 0 },
    frown: { wid: 0.55, smile: -0.45, open: 0.03, teeth: 0, round: 0 },
    o: { wid: 0.5, smile: 0, open: 0.55, teeth: 0, round: 1 },
    smile: { wid: 0.7, smile: 0.55, open: 0.05, teeth: 0, round: 0 },
    sleep: { wid: 0.45, smile: 0.35, open: 0.01, teeth: 0, round: 0 },
  };
  const mixMouth = (a, b, k) => { const o = {}; for (const key in a) o[key] = lerp(a[key], b[key], k); return o; };
  F.mouthAt = function (t, keys) { // keys: [[time, name, ease]]
    if (t <= keys[0][0]) return F.MOUTH[keys[0][1]];
    for (let i = 1; i < keys.length; i++) { const [t1, n1, e] = keys[i]; if (t <= t1) { const [t0, n0] = keys[i - 1]; return mixMouth(F.MOUTH[n0], F.MOUTH[n1], E[e || 'io2'](clamp((t - t0) / (t1 - t0 || 1), 0, 1))); } }
    return F.MOUTH[keys[keys.length - 1][1]];
  };

  F.makeBoy = function (env) {
    const skin = F.phys(SKIN, { roughness: 0.55, sheen: 0.6, sheenColor: new T3.Color(0xff9c80), sheenRoughness: 0.6, envMap: env, envMapIntensity: 0.35 });
    const skin2 = F.phys(SKIN2, { roughness: 0.5, sheen: 0.6, sheenColor: new T3.Color(0xff8a70), envMap: env, envMapIntensity: 0.35 });
    const hairM = F.phys(HAIR, { roughness: 0.48, sheen: 1, sheenColor: new T3.Color(0x8a5a3a), sheenRoughness: 0.4, envMap: env, envMapIntensity: 0.5 });
    const hairM2 = F.phys(0x5b3622, { roughness: 0.42, sheen: 1, sheenColor: new T3.Color(0xb07a50), envMap: env, envMapIntensity: 0.6 });
    const teeM = F.std(TEE, { roughness: 0.95 });
    const trimM = F.std(TRIM, { roughness: 0.85 });
    const pantsTex = duckPants(); pantsTex.tex.wrapS = pantsTex.tex.wrapT = T3.RepeatWrapping; pantsTex.tex.repeat.set(2, 2);
    const pantsM = F.std(0xffffff, { map: pantsTex.tex, roughness: 0.9 });
    const B = { root: new T3.Group() };
    const hips = (B.hips = new T3.Group()); B.root.add(hips);
    // pelvis + legs (sitting: thighs forward, shins down)
    const pelvis = ell(0.5, 0.32, 0.42, pantsM); pelvis.position.set(0, 0.08, 0); hips.add(pelvis);
    const band = new T3.Mesh(new T3.TorusGeometry(0.47, 0.045, 10, 40), F.std(0x2a6189, { roughness: 0.9 })); band.rotation.x = Math.PI / 2; band.scale.set(1, 0.86, 1); band.position.y = 0.3; hips.add(band);
    const cordM = F.std(0xf4f1ea, { roughness: 0.8 });
    [[-0.07, 0.02], [0.07, -0.02]].forEach(([x, r]) => { const c = cap(0.018, 0.34, cordM, 8); c.position.set(x, 0.12, 0.41); c.rotation.z = r; hips.add(c); });
    B.legs = {};
    for (const s of [-1, 1]) {
      const thigh = new T3.Group(); thigh.position.set(0.27 * s, 0.02, 0.05); hips.add(thigh);
      const tm = cap(0.2, 0.75, pantsM); tm.rotation.x = Math.PI / 2; tm.position.z = 0.45; thigh.add(tm);
      const knee = new T3.Group(); knee.position.set(0, 0, 0.92); thigh.add(knee);
      const sm = cap(0.17, 0.85, pantsM); sm.position.y = -0.5; knee.add(sm);
      const cuff = new T3.Mesh(new T3.CylinderGeometry(0.19, 0.2, 0.12, 20), pantsM); cuff.position.y = -0.98; knee.add(cuff);
      const foot = ell(0.13, 0.09, 0.27, skin); foot.position.set(0, -1.12, 0.1); knee.add(foot);
      const ankle = cap(0.08, 0.12, skin); ankle.position.set(0, -1.05, 0); knee.add(ankle);
      B.legs[s < 0 ? 'L' : 'R'] = { thigh, knee };
    }
    // spine / torso (t-shirt)
    const spine = (B.spine = new T3.Group()); spine.position.y = 0.12; hips.add(spine);
    const chest = (B.chest = new T3.Group()); spine.add(chest);
    const prof = [[0.0, 0.0], [0.47, 0.02], [0.5, 0.25], [0.47, 0.6], [0.5, 0.95], [0.58, 1.2], [0.52, 1.38], [0.3, 1.47], [0.0, 1.5]].map(([r, y]) => new T3.Vector2(r, y));
    const torso = new T3.Mesh(new T3.LatheGeometry(prof, 40), teeM); torso.scale.set(1.12, 1, 0.74); torso.castShadow = torso.receiveShadow = true; chest.add(torso);
    const hem = new T3.Mesh(new T3.TorusGeometry(0.5, 0.035, 8, 40), F.std(0x8d9399, { roughness: 1 })); hem.rotation.x = Math.PI / 2; hem.scale.set(1.12, 0.74, 1); hem.position.y = 0.04; chest.add(hem);
    const collar = new T3.Mesh(new T3.TorusGeometry(0.21, 0.055, 12, 40), trimM); collar.rotation.x = Math.PI / 2 - 0.25; collar.position.set(0, 1.46, 0.03); collar.scale.set(1.08, 1, 1); chest.add(collar);
    // arms with 2-bone IK
    B.arms = {};
    for (const s of [-1, 1]) {
      const side = s < 0 ? 'L' : 'R';
      const shoulder = new T3.Group(); shoulder.position.set(0.6 * s, 1.3, 0); chest.add(shoulder);
      const upper = new T3.Group(); shoulder.add(upper);
      const sleeve = new T3.Mesh(new T3.CylinderGeometry(0.19, 0.165, 0.42, 24, 1, true), teeM); sleeve.position.y = -0.12; sleeve.castShadow = true; upper.add(sleeve);
      const shCap = ell(0.2, 0.17, 0.2, teeM); shCap.position.y = 0.06; upper.add(shCap);
      const cuffT = new T3.Mesh(new T3.TorusGeometry(0.165, 0.04, 10, 28), trimM); cuffT.rotation.x = Math.PI / 2; cuffT.position.y = -0.33; upper.add(cuffT);
      const um = cap(0.085, 0.55, skin); um.position.y = -0.36; upper.add(um);
      const fore = new T3.Group(); fore.position.y = -0.68; upper.add(fore);
      const fm = cap(0.078, 0.5, skin); fm.position.y = -0.3; fore.add(fm);
      const hand = new T3.Group(); hand.position.y = -0.62; fore.add(hand);
      const palm = ell(0.11, 0.13, 0.06, skin); palm.position.y = -0.1; hand.add(palm);
      const fingers = new T3.Group(); fingers.position.y = -0.2; hand.add(fingers);
      for (let i = 0; i < 4; i++) { const f = cap(0.026, 0.11, skin, 8); f.position.set((i - 1.5) * 0.052, -0.07, 0); fingers.add(f); }
      const thumb = new T3.Group(); thumb.position.set(-0.09 * s, -0.08, 0.04); hand.add(thumb);
      const tm = cap(0.03, 0.1, skin, 8); tm.position.y = -0.06; thumb.add(tm); thumb.rotation.z = -0.6 * s;
      B.arms[side] = { s, shoulder, upper, fore, hand, fingers, thumb, a: 0.68, b: 0.84 };
    }
    // neck + head
    const neck = (B.neck = new T3.Group()); neck.position.set(0, 1.42, 0.02); chest.add(neck);
    const nm = new T3.Mesh(new T3.CylinderGeometry(0.16, 0.18, 0.3, 20), skin); nm.position.y = 0.1; nm.castShadow = true; neck.add(nm);
    const head = (B.head = new T3.Group()); head.position.y = 0.12; neck.add(head);
    // face: elongated, narrow chin
    const fg = new T3.SphereGeometry(1, 72, 56); const pa = fg.attributes.position;
    for (let i = 0; i < pa.count; i++) { let x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i); if (y < 0) { const k = 1 - 0.15 * Math.pow(Math.min(1, -y), 1.5); x *= k; z *= lerp(1, k, 0.5); y *= 0.86; } if (y > 0.2 && z > 0) { z *= 1 - 0.05 * (y - 0.2); } pa.setXYZ(i, x, y, z); }
    fg.computeVertexNormals();
    const face = new T3.Mesh(fg, skin); face.scale.set(0.78, 0.98, 0.8); face.position.y = 0.95; face.castShadow = face.receiveShadow = true; head.add(face);
    for (const s of [-1, 1]) {
      const ear = new T3.Group(); ear.position.set(0.72 * s, 0.98, -0.04); ear.rotation.set(0, 0.45 * s, -0.12 * s); head.add(ear);
      ear.add(ell(0.11, 0.33, 0.24, skin2)); const inner = ell(0.05, 0.22, 0.14, F.phys(0xe98b78, { roughness: 0.6 })); inner.position.set(0.07 * s, 0, 0.02); ear.add(inner);
    }
    // eyes
    const eT = eyeTex();
    const eyeM = F.phys(0xffffff, { map: eT.tex, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05, envMap: env, envMapIntensity: 0.9 });
    const lidM = F.phys(0xeeb592, { roughness: 0.55, sheen: 0.5, sheenColor: new T3.Color(0xff9c80), side: T3.DoubleSide });
    B.eyes = {}; B.lids = {};
    for (const s of [-1, 1]) {
      const side = s < 0 ? 'L' : 'R';
      const socket = new T3.Group(); socket.position.set(0.255 * s, 1.1, 0.6); head.add(socket);
      const ball = new T3.Mesh(new T3.SphereGeometry(0.255, 48, 32), eyeM); ball.castShadow = false; socket.add(ball);
      const lid = new T3.Group(); socket.add(lid);
      const lm = new T3.Mesh(new T3.SphereGeometry(0.268, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), lidM); lid.add(lm);
      const lash = new T3.Mesh(new T3.TorusGeometry(0.268, 0.016, 8, 48), F.std(0x3a1f14, { roughness: 0.7 })); lash.rotation.x = Math.PI / 2; lid.add(lash);
      const low = new T3.Mesh(new T3.SphereGeometry(0.262, 32, 10, 0, Math.PI * 2, Math.PI * 0.72, Math.PI * 0.28), lidM); socket.add(low);
      const hl = F.sprite('#ffffff', 0.09, 0.9, 0.3); hl.position.set(0.07, 0.08, 0.27); socket.add(hl);
      B.eyes[side] = ball; B.lids[side] = lid;
    }
    // brows
    B.brows = {};
    for (const s of [-1, 1]) {
      const g = new T3.Group(); g.position.set(0.27 * s, 1.45, 0.74); head.add(g);
      const curve = new T3.QuadraticBezierCurve3(V3(-0.2 * s, -0.02, -0.04), V3(0, 0.06, 0.03), V3(0.2 * s, -0.01, -0.06));
      const b = new T3.Mesh(new T3.TubeGeometry(curve, 16, 0.045, 8), F.std(0x2b170e, { roughness: 0.8 })); g.add(b);
      B.brows[s < 0 ? 'L' : 'R'] = g;
    }
    // nose
    const nose = ell(0.17, 0.15, 0.16, F.phys(0xf3a48d, { roughness: 0.4, sheen: 0.8, sheenColor: new T3.Color(0xff7d6a), clearcoat: 0.3, envMap: env, envMapIntensity: 0.5 }), 40); nose.position.set(0, 0.86, 0.86); head.add(nose);
    // blush
    for (const s of [-1, 1]) { const b = new T3.Mesh(new T3.CircleGeometry(0.14, 24), new T3.MeshBasicMaterial({ map: F.glowTex('#ff8a80', 0.2), transparent: true, opacity: 0.55, depthWrite: false })); b.position.set(0.43 * s, 0.74, 0.66); b.lookAt(0.43 * s * 3, 0.74, 3); head.add(b); }
    // mouth (canvas on a curved plane)
    B.mouthTex = F.canvasTex(512, 256, drawMouth);
    const mg = new T3.PlaneGeometry(0.62, 0.31, 24, 4); const mp = mg.attributes.position; for (let i = 0; i < mp.count; i++) { const x = mp.getX(i); mp.setZ(i, -x * x * 0.85); } mg.computeVertexNormals();
    const mouth = new T3.Mesh(mg, new T3.MeshStandardMaterial({ map: B.mouthTex.tex, transparent: true, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2 })); mouth.position.set(0, 0.6, 0.745); mouth.rotation.x = -0.18; head.add(mouth);
    // hair: a big mop of springy curls (like the reference photo)
    const hair = (B.hair = new T3.Group()); hair.position.set(0, 1.64, -0.08); head.add(hair);
    const hb = ell(0.9, 0.62, 0.88, hairM); hair.add(hb);
    const R = rng(77);
    const helix = (turns, rad, len, tube) => { const pts = []; for (let i = 0; i <= 40; i++) { const a = (i / 40) * turns * Math.PI * 2; pts.push(V3(Math.cos(a) * rad, (i / 40) * len, Math.sin(a) * rad)); } return new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 60, tube, 8); };
    const curlG = helix(1.6, 0.075, 0.26, 0.05), blobG = new T3.SphereGeometry(1, 16, 12);
    const NC = 170, NB = 120;
    const curls = new T3.InstancedMesh(curlG, hairM2, NC), blobs = new T3.InstancedMesh(blobG, hairM, NB); curls.castShadow = blobs.castShadow = true;
    const m4 = new T3.Matrix4(), q = new T3.Quaternion(), sc = new T3.Vector3();
    const sample = () => { for (;;) { const u = R() * 2 - 1, th = R() * Math.PI * 2; const rr = Math.sqrt(1 - u * u); const x = rr * Math.cos(th), y = u, z = rr * Math.sin(th); if (y > -0.45 && !(z > 0.5 && y < 0.1 && Math.abs(x) < 0.8)) return V3(x, y, z); } };
    for (let i = 0; i < NB; i++) { const n = sample(); const p = V3(n.x * 0.9, n.y * 0.62, n.z * 0.88); const k = 0.12 + R() * 0.1; q.identity(); sc.set(k, k, k); m4.compose(p, q, sc); blobs.setMatrixAt(i, m4); }
    for (let i = 0; i < NC; i++) { const n = sample(); const p = V3(n.x * 0.95, n.y * 0.66, n.z * 0.93); const dir = V3(n.x, n.y * 0.6 - 0.35, n.z).normalize(); q.setFromUnitVectors(V3(0, -1, 0), dir); q.multiply(new T3.Quaternion().setFromAxisAngle(V3(0, 1, 0), R() * 6.28)); const k = 0.9 + R() * 0.6; sc.set(k, k * (0.8 + R() * 0.5), k); m4.compose(p, q, sc); curls.setMatrixAt(i, m4); }
    hair.add(blobs); hair.add(curls);
    // fringe: springy curls falling on the forehead, above the brows
    const fringe = (B.fringe = new T3.Group()); fringe.position.set(0, -0.08, 0.66); hair.add(fringe);
    [[-0.5, 0.04, -0.06], [-0.3, -0.02, 0.04], [-0.1, -0.05, 0.08], [0.1, -0.05, 0.08], [0.3, -0.02, 0.04], [0.5, 0.04, -0.06], [-0.2, 0.12, 0.02], [0.2, 0.12, 0.02], [0.0, 0.14, 0.0]]
      .forEach(([x, y, z], i) => { const b = ell(0.14, 0.13, 0.13, hairM, 16); b.position.set(x, y + 0.08, z - 0.06); fringe.add(b); const c = new T3.Mesh(curlG, hairM2); c.position.set(x, y + 0.05, z); c.rotation.set(Math.PI + 0.3, R() * 6, 0.2 * (x > 0 ? -1 : 1)); c.scale.set(1.2, 1.1, 1.2); c.castShadow = true; fringe.add(c); });
    // little extras: sweat drop
    B.sweat = ell(0.05, 0.08, 0.05, F.phys(0xbfe6ff, { roughness: 0.05, transmission: 0, clearcoat: 1, transparent: true, opacity: 0.9 })); B.sweat.position.set(0.62, 1.35, 0.5); B.sweat.visible = false; head.add(B.sweat);
    B.root.traverse((o) => { if (o.isMesh && o.castShadow === undefined) o.castShadow = true; });
    return B;
  };

  // 2-bone IK: point the arm's hand at a world-space target, elbow toward a pole
  const _m = new T3.Matrix4(), _q = new T3.Quaternion(), DOWN = V3(0, -1, 0);
  F.ik = function (arm, targetW, poleW) {
    arm.shoulder.updateWorldMatrix(true, false);
    _m.copy(arm.shoulder.matrixWorld).invert();
    const T = targetW.clone().applyMatrix4(_m), Pp = poleW.clone().applyMatrix4(_m);
    const a = arm.a, b = arm.b; let d = T.length(); const dir = T.clone().normalize(); d = clamp(d, Math.abs(a - b) + 1e-3, a + b - 1e-3);
    const A = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1));
    const pv = Pp.clone().sub(dir.clone().multiplyScalar(Pp.dot(dir))); if (pv.lengthSq() < 1e-6) pv.set(0, 0, -1); pv.normalize();
    const u = dir.clone().multiplyScalar(Math.cos(A)).add(pv.multiplyScalar(Math.sin(A))).normalize();
    arm.upper.quaternion.setFromUnitVectors(DOWN, u);
    const E = u.clone().multiplyScalar(a);
    const fw = dir.clone().multiplyScalar(d).sub(E).normalize().applyQuaternion(arm.upper.quaternion.clone().invert());
    arm.fore.quaternion.setFromUnitVectors(DOWN, fw);
  };
  // orient a hand so its palm faces a world direction (palm normal = +z of the hand)
  F.handFace = function (arm, palmDirW, upW) {
    arm.fore.updateWorldMatrix(true, false);
    const m = new T3.Matrix4().lookAt(V3(0, 0, 0), palmDirW.clone().negate(), upW || V3(0, 1, 0));
    const want = new T3.Quaternion().setFromRotationMatrix(m);
    const parentQ = new T3.Quaternion(); arm.fore.getWorldQuaternion(parentQ);
    arm.hand.quaternion.copy(parentQ.invert().multiply(want));
  };

  window.F3D = F;
})();
