/* cine.js — cinematic-CGI toolkit for «Өлім сәтінде ми қалай жұмыс істейді?»
 * Night, fog, cold rim light + warm under-light, ACES tone mapping, additive glows, ever-drifting camera.
 * Everything visible is a pure function of the film's global time T (seconds). Requires THREE (UMD) global. */
(function () {
  const T3 = THREE;
  const C = {};
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const smooth = (a, b, x) => { const k = clamp((x - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };
  const pulse = (x, a, b, f = 0.25) => smooth(a - f, a, x) * (1 - smooth(b, b + f, x));
  const E = {
    lin: (x) => x, io2: (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),
    io3: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2), out3: (x) => 1 - Math.pow(1 - x, 3),
    in3: (x) => x * x * x, out4: (x) => 1 - Math.pow(1 - x, 4), sine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
    expo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  };
  const lerpV = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * k) : a + (b - a) * k);
  // keyed track: [[time, value, ease]] — ease shapes the segment that ends at that key
  function K(t, keys) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e] = keys[i];
      if (t <= t1) { const [t0, v0] = keys[i - 1]; const x = (t - t0) / (t1 - t0 || 1); return lerpV(v0, v1, E[e || 'io3'](x)); }
    }
    return keys[keys.length - 1][1];
  }
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const P = new Uint8Array(512); { const r = rng(1234); const p = [...Array(256).keys()]; for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } for (let i = 0; i < 512; i++) P[i] = p[i & 255]; }
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  function grad(h, x, y, z) { const u = h < 8 ? x : y, v = h < 4 ? y : h === 12 || h === 14 ? x : z; return ((h & 1) ? -u : u) + ((h & 2) ? -v : v); }
  function noise3(x, y, z) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255; x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
    const u = fade(x), v = fade(y), w = fade(z); const A = P[X] + Y, AA = P[A] + Z, AB = P[A + 1] + Z, B = P[X + 1] + Y, BA = P[B] + Z, BB = P[B + 1] + Z;
    return lerp(lerp(lerp(grad(P[AA] & 15, x, y, z), grad(P[BA] & 15, x - 1, y, z), u), lerp(grad(P[AB] & 15, x, y - 1, z), grad(P[BB] & 15, x - 1, y - 1, z), u), v),
      lerp(lerp(grad(P[AA + 1] & 15, x, y, z - 1), grad(P[BA + 1] & 15, x - 1, y, z - 1), u), lerp(grad(P[AB + 1] & 15, x, y - 1, z - 1), grad(P[BB + 1] & 15, x - 1, y - 1, z - 1), u), v), w);
  }
  C.u = { K, E, rng, noise3, clamp, lerp, smooth, pulse };

  // ------------------------------------------------------------------ textures
  C.canvasTex = function (w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const ctx = c.getContext('2d');
    const tex = new T3.CanvasTexture(c); tex.colorSpace = T3.SRGBColorSpace;
    const o = { c, ctx, tex, last: null, draw: (...a) => { ctx.clearRect(0, 0, w, h); (typeof a[0] === 'function' ? a.shift() : draw)(ctx, w, h, ...a); tex.needsUpdate = true; } };
    o.draw(); return o;
  };
  const glowCache = {};
  C.glowTex = function (soft = 0.35) {
    if (glowCache[soft]) return glowCache[soft];
    const t = C.canvasTex(128, 128, (ctx) => { const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(soft, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128); });
    glowCache[soft] = t.tex; return t.tex;
  };
  let fogTexC = null;
  C.fogTex = function () {
    if (fogTexC) return fogTexC;
    const r = rng(77);
    fogTexC = C.canvasTex(256, 256, (ctx) => {
      for (let i = 0; i < 22; i++) {
        const x = 100 + r() * 56, y = 100 + r() * 56, rad = 20 + r() * 50;
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, 'rgba(255,255,255,0.22)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
      }
      ctx.globalCompositeOperation = 'destination-in'; const m = ctx.createRadialGradient(128, 128, 0, 128, 128, 128); m.addColorStop(0.5, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = m; ctx.fillRect(0, 0, 256, 256); ctx.globalCompositeOperation = 'source-over';
    }).tex;
    return fogTexC;
  };
  C.glow = function (color, size, opacity = 1, soft = 0.35) {
    const s = new T3.Sprite(new T3.SpriteMaterial({ map: C.glowTex(soft), color, transparent: true, depthWrite: false, blending: T3.AdditiveBlending, opacity, fog: false }));
    s.scale.set(size, size, 1); return s;
  };

  // ------------------------------------------------------------------ stage: renderer, night set, lights, fog, drifting camera
  C.stage = function (canvas, o = {}) {
    const S = {};
    const r = new T3.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, alpha: false, powerPreference: 'high-performance' });
    r.setPixelRatio(1); r.setSize(1080, 1920, false);
    r.outputColorSpace = T3.SRGBColorSpace; r.toneMapping = T3.ACESFilmicToneMapping; r.toneMappingExposure = o.exposure || 1.0;
    S.renderer = r; S.baseExposure = o.exposure || 1.0;
    const scene = new T3.Scene(); S.scene = scene;
    const bg = new T3.Color(o.bg || 0x03060d); scene.background = bg;
    scene.fog = new T3.FogExp2(o.fogColor || 0x04070e, (o.fog || 0.045) * 0.6);
    S.fogBase = (o.fog || 0.045) * 0.6;
    // environment for glossy metal/clearcoat reflections: dark room with a cold strip and a warm strip
    const es = new T3.Scene();
    es.add(new T3.Mesh(new T3.SphereGeometry(10, 32, 16), new T3.MeshBasicMaterial({ color: 0x05080f, side: T3.BackSide })));
    const strip = (c, x, y, z, w, h) => { const m = new T3.Mesh(new T3.PlaneGeometry(w, h), new T3.MeshBasicMaterial({ color: c, side: T3.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); es.add(m); };
    strip(0x6f9cff, -6, 4, -5, 2, 9); strip(0xffa060, 5, -3, 4, 6, 1.2); strip(0xdde8ff, 0, 8, 2, 5, 1.2);
    const pm = new T3.PMREMGenerator(r); scene.environment = pm.fromScene(es, 0.03).texture; pm.dispose();
    S.cam = new T3.PerspectiveCamera(o.fov || 34, 1080 / 1920, 0.05, 400);
    // lights: cold rim from behind, warm from below, faint fill
    S.rim = new T3.DirectionalLight(0x9cc0ff, 2.6); S.rim.position.set(-3, 4, -6); scene.add(S.rim);
    S.rim2 = new T3.DirectionalLight(0x7fa6ff, 1.2); S.rim2.position.set(4, 2, -5); scene.add(S.rim2);
    S.warm = new T3.PointLight(0xff8a3c, 30, 14, 2); S.warm.position.set(0.5, -2.2, 2.0); scene.add(S.warm);
    S.fill = new T3.HemisphereLight(0x223355, 0x110805, 0.15); scene.add(S.fill);
    // distant city-like small lights across a huge dark set
    if (o.lights !== false) {
      const R = rng(o.seed || 9), N = 900, pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const a = R() * Math.PI * 2, d = 40 + R() * 120;
        pos[i * 3] = Math.cos(a) * d; pos[i * 3 + 1] = -6 + Math.pow(R(), 3) * 22; pos[i * 3 + 2] = Math.sin(a) * d;
        const warm = R() < 0.55; const c = new T3.Color(warm ? 0xffb066 : 0x8fb4ff).multiplyScalar(0.5 + R() * 0.8);
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      }
      const g = new T3.BufferGeometry(); g.setAttribute('position', new T3.BufferAttribute(pos, 3)); g.setAttribute('color', new T3.BufferAttribute(col, 3));
      S.city = new T3.Points(g, new T3.PointsMaterial({ size: 0.9, map: C.glowTex(0.2), vertexColors: true, transparent: true, depthWrite: false, blending: T3.AdditiveBlending, fog: false, opacity: 0.8 }));
      scene.add(S.city);
    }
    // ground: wet dark floor catching the lights
    if (o.floor !== false) {
      S.floor = new T3.Mesh(new T3.PlaneGeometry(400, 400), new T3.MeshStandardMaterial({ color: 0x0a0e16, roughness: 0.38, metalness: 0.6, envMapIntensity: 0.12 }));
      S.floor.rotation.x = -Math.PI / 2; S.floor.position.y = o.floorY != null ? o.floorY : -2.2; scene.add(S.floor);
    }
    // drifting fog sprites (normal blending, very soft)
    const fogMat = (op) => new T3.SpriteMaterial({ map: C.fogTex(), color: o.fogTint || 0x6d84a8, transparent: true, depthWrite: false, opacity: op, fog: false });
    S.fogs = [];
    const FR = rng((o.seed || 9) + 3);
    for (let i = 0; i < (o.fogCount != null ? o.fogCount : 16); i++) {
      const s = new T3.Sprite(fogMat(0.025 + FR() * 0.035)); const sz = 5 + FR() * 9; s.scale.set(sz, sz, 1);
      s.userData = { x: (FR() - 0.5) * 16, y: -1.8 + FR() * 3.5, z: -8 + FR() * 14, sp: 0.08 + FR() * 0.2, ph: FR() * 10 };
      scene.add(s); S.fogs.push(s);
    }
    // camera: keyed position/target + a slow float that never stops
    S.shot = function (T, pos, tgt, o2 = {}) {
      const amp = o2.float != null ? o2.float : 0.06;
      const fx = noise3(T * 0.23, 1.3, 0) * amp, fy = noise3(T * 0.19, 5.1, 2) * amp, fz = noise3(T * 0.21, 9.7, 4) * amp;
      S.cam.position.set(pos[0] + fx, pos[1] + fy, pos[2] + fz);
      S.cam.lookAt(tgt[0] + fx * 0.4, tgt[1] + fy * 0.4, tgt[2]);
      if (o2.roll) S.cam.rotateZ(o2.roll);
      if (o2.fov && S.cam.fov !== o2.fov) { S.cam.fov = o2.fov; S.cam.updateProjectionMatrix(); }
      if (o2.shake) { S.cam.rotateZ(noise3(T * 40, 1, 1) * o2.shake * 0.02); S.cam.rotateX(noise3(T * 37, 2, 2) * o2.shake * 0.015); }
    };
    // chapter in/out: through a burst of light-fog
    S.render = function (T, a, b, o3 = {}) {
      const tin = 1 - smooth(a, a + 0.7, T), tout = smooth(b - 0.55, b, T);
      const flash = Math.max(tin * (o3.inFlash != null ? o3.inFlash : 1), tout * (o3.outFlash != null ? o3.outFlash : 1));
      r.toneMappingExposure = S.baseExposure * (o3.exposure || 1) * (1 + flash * 1.4);
      scene.fog.density = S.fogBase * (o3.fog || 1) * (1 + flash * 4);
      S.fogs.forEach((s) => { const u = s.userData; s.position.set(S.cam.position.x + u.x + Math.sin(T * u.sp + u.ph) * 1.6, u.y + Math.sin(T * 0.3 + u.ph) * 0.2, S.cam.position.z + u.z - 6); s.material.rotation = T * 0.03 + u.ph; });
      r.render(scene, S.cam);
    };
    return S;
  };

  // ------------------------------------------------------------------ neuron points shader (activity, colour, death-wave, flicker)
  function neuronMaterial(size) {
    return new T3.ShaderMaterial({
      transparent: true, depthWrite: false, blending: T3.AdditiveBlending,
      uniforms: { uT: { value: 0 }, uAct: { value: 1 }, uSize: { value: size }, uColA: { value: new T3.Color(0x5fc8ff) }, uColB: { value: new T3.Color(0xffd27a) }, uMix: { value: 0 },
        uWave: { value: -99 }, uWaveW: { value: 0.35 }, uDead: { value: 0 }, uSurge: { value: 0 }, uRevive: { value: 0 }, uMap: { value: C.glowTex(0.22) } },
      vertexShader: `attribute float aPh; attribute float aK; uniform float uT, uAct, uSize, uWave, uWaveW, uDead, uSurge, uRevive; varying float vI; varying float vEdge; varying float vK;
        void main(){ vec4 mv = modelViewMatrix * vec4(position,1.);
          float fl = 0.55 + 0.45*sin(uT*(2.+aK*5.) + aPh*6.283);
          float spark = pow(max(0., sin(uT*(0.9+aK*1.7) + aPh*40.)), 18.);
          float behind = step(position.z, uWave);                // passed by the death wave
          float edge = exp(-pow((position.z-uWave)/uWaveW,2.));
          float alive = mix(1., 0.03, max(behind, uDead));
          float rev = uRevive * step(0.72, fract(aPh*13.7));    // only some cells come back
          vI = (uAct*(0.35+0.65*fl) + spark*uAct*1.6 + uSurge*(1.0+fl)) * alive + edge*0.8*step(-50.,uWave) + rev*(0.6+0.4*fl);
          vEdge = edge; vK = aK;
          gl_PointSize = min(46., uSize * (0.6+aK*0.8) * (1.+uSurge*0.6+edge*0.6) * (300. / -mv.z));
          gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform sampler2D uMap; uniform vec3 uColA, uColB; uniform float uMix; varying float vI; varying float vEdge; varying float vK;
        void main(){ vec4 m = texture2D(uMap, gl_PointCoord); vec3 c = mix(uColA, uColB, clamp(uMix + vK*0.15,0.,1.)); c = mix(c, vec3(0.75,0.9,1.), clamp(vEdge*0.5,0.,1.)); gl_FragColor = vec4(c*vI, 1.)*m.a; }`,
    });
  }
  C.neuronField = function (points, size, seed) {
    const R = rng(seed || 5), n = points.length / 3;
    const g = new T3.BufferGeometry(); g.setAttribute('position', new T3.BufferAttribute(points, 3));
    const ph = new Float32Array(n), k = new Float32Array(n); for (let i = 0; i < n; i++) { ph[i] = R(); k[i] = R(); }
    g.setAttribute('aPh', new T3.BufferAttribute(ph, 1)); g.setAttribute('aK', new T3.BufferAttribute(k, 1));
    const pts = new T3.Points(g, neuronMaterial(size)); pts.frustumCulled = false;
    // connections + travelling signals
    const segs = [], maxD2 = Math.pow(size * 0.0 + (C.linkDist || 0.32), 2);
    for (let i = 0; i < n && segs.length < 2600; i += 1) {
      let c = 0;
      for (let j = i + 1; j < n && c < 3; j++) {
        const dx = points[i * 3] - points[j * 3], dy = points[i * 3 + 1] - points[j * 3 + 1], dz = points[i * 3 + 2] - points[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < maxD2) { segs.push(i, j); c++; }
      }
    }
    const lp = new Float32Array(segs.length * 3); segs.forEach((idx, s) => { lp[s * 3] = points[idx * 3]; lp[s * 3 + 1] = points[idx * 3 + 1]; lp[s * 3 + 2] = points[idx * 3 + 2]; });
    const lg = new T3.BufferGeometry(); lg.setAttribute('position', new T3.BufferAttribute(lp, 3));
    const lines = new T3.LineSegments(lg, new T3.LineBasicMaterial({ color: 0x4aa8ff, transparent: true, opacity: 0.18, blending: T3.AdditiveBlending, depthWrite: false }));
    lines.frustumCulled = false;
    const NS = Math.min(420, segs.length / 2), sp = new Float32Array(NS * 3), sg = new T3.BufferGeometry(); sg.setAttribute('position', new T3.BufferAttribute(sp, 3));
    const sigSeg = [], sigPh = []; for (let i = 0; i < NS; i++) { sigSeg.push(Math.floor(R() * segs.length / 2)); sigPh.push(R()); }
    const sig = new T3.Points(sg, new T3.PointsMaterial({ color: 0xbfe9ff, size: size * 0.09, map: C.glowTex(0.25), transparent: true, depthWrite: false, blending: T3.AdditiveBlending, opacity: 1 }));
    sig.frustumCulled = false;
    const grp = new T3.Group(); grp.add(lines, pts, sig);
    const F = { group: grp, pts, lines, sig, mat: pts.material, n };
    F.set = function (T, o = {}) {
      const u = F.mat.uniforms; u.uT.value = T;
      u.uAct.value = o.act != null ? o.act : 1; u.uMix.value = o.mix || 0; u.uSurge.value = o.surge || 0; u.uDead.value = o.dead || 0; u.uRevive.value = o.revive || 0;
      u.uWave.value = o.wave != null ? o.wave : -99;
      const act = (o.act != null ? o.act : 1) * (1 - (o.dead || 0)) + (o.surge || 0) * 1.5;
      lines.material.opacity = 0.08 + 0.3 * act; lines.material.color.set(o.mix > 0.5 ? 0xffc46a : 0x4aa8ff);
      const sigOn = clamp(act, 0, 2); sig.material.opacity = Math.min(1, sigOn); sig.material.color.set(o.mix > 0.5 ? 0xfff0c0 : 0xbfe9ff);
      const speed = 0.8 + (o.surge || 0) * 3;
      for (let i = 0; i < NS; i++) {
        const s = sigSeg[i], a = segs[s * 2], b = segs[s * 2 + 1], f = (sigPh[i] + T * speed * (0.6 + (i % 7) * 0.1)) % 1;
        let x = lerp(points[a * 3], points[b * 3], f), y = lerp(points[a * 3 + 1], points[b * 3 + 1], f), z = lerp(points[a * 3 + 2], points[b * 3 + 2], f);
        if (o.wave != null && z < o.wave) { x = 0; y = -999; z = 0; }
        sp[i * 3] = x; sp[i * 3 + 1] = y; sp[i * 3 + 2] = z;
      }
      sg.attributes.position.needsUpdate = true;
    };
    return F;
  };

  // ------------------------------------------------------------------ the brain: folded two-hemisphere mesh + neurons inside
  let brainGeo = null, brainPts = null;
  function buildBrainGeo() {
    const g = new T3.SphereGeometry(1, 300, 220); const p = g.attributes.position; const v = new T3.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i); const nx = v.x, ny = v.y, nz = v.z;
      let x = nx * 0.78, y = ny * 0.66, z = nz * 1.0;
      if (y < -0.3) y = -0.3 + (y + 0.3) * 0.7;                          // flatter base
      const tl = Math.exp(-Math.pow((nz - 0.05) / 0.45, 2)) * smooth(-0.1, -0.6, ny); x *= 1 + tl * 0.18; y -= tl * 0.1; // temporal lobes
      if (nz < -0.6) y *= 0.92;                                            // occipital taper
      const mid = Math.exp(-Math.pow(nx / 0.09, 2)) * smooth(-0.3, 0.3, ny); // longitudinal fissure
      const n1 = noise3(nx * 5.2 + 7, ny * 5.2, nz * 5.2) + 0.4 * noise3(nx * 10, ny * 10 + 3, nz * 10);
      const groove = 1 - smooth(0.0, 0.13, Math.abs(n1));                  // winding sulci where the noise crosses zero
      const n3 = noise3(nx * 2.0 + 3, ny * 2.0, nz * 2.0);
      const lateral = Math.exp(-Math.pow((ny + 0.05 + nz * 0.35) / 0.05, 2)) * smooth(0.3, 0.6, Math.abs(nx)); // lateral fissure
      const cb = Math.exp(-Math.pow((nz + 0.78) / 0.22, 2) - Math.pow((ny + 0.55) / 0.25, 2)) * 0.12; // cerebellum bulge
      const d = 1 + n3 * 0.03 - groove * 0.035 - mid * 0.12 - lateral * 0.05 + cb;
      p.setXYZ(i, x * d, y * d, z * d);
    }
    g.computeVertexNormals(); return g;
  }
  function brainSurfacePoints(geo, n, seed) {
    const R = rng(seed), p = geo.attributes.position, nm = geo.attributes.normal, out = new Float32Array(n * 3);
    for (let k = 0; k < n; k++) { const i = Math.floor(R() * p.count); const lift = 0.006 + R() * 0.012; out[k * 3] = p.getX(i) + nm.getX(i) * lift; out[k * 3 + 1] = p.getY(i) + nm.getY(i) * lift; out[k * 3 + 2] = p.getZ(i) + nm.getZ(i) * lift; }
    return out;
  }
  function brainPoints(n, seed) {
    const R = rng(seed), out = new Float32Array(n * 3); let k = 0, guard = 0;
    while (k < n && guard++ < n * 40) {
      const x = (R() * 2 - 1) * 0.78, y = (R() * 2 - 1) * 0.66, z = (R() * 2 - 1);
      const q = (x * x) / 0.6 + (y * y) / 0.43 + z * z; if (q > 0.92) continue;
      if (y < -0.25 && Math.abs(z) > 0.7) continue;
      if (Math.abs(x) < 0.04) continue;
      out[k * 3] = x * 0.96; out[k * 3 + 1] = y * 0.96; out[k * 3 + 2] = z * 0.96; k++;
    }
    return out;
  }
  C.brain = function (o = {}) {
    if (!brainGeo) brainGeo = buildBrainGeo();
    if (!brainPts) brainPts = brainSurfacePoints(brainGeo, o.n || 2600, 21);
    C.linkDist = 0.13; const field = C.neuronField(brainPts, 0.085, 33); C.linkDist = null;
    const mat = new T3.MeshPhysicalMaterial({ color: 0xd9b7b4, roughness: 0.42, metalness: 0.15, clearcoat: 0.9, clearcoatRoughness: 0.3, sheen: 0.6, sheenColor: new T3.Color(0xffc0c0), transparent: true, opacity: 0.97, side: T3.FrontSide, emissive: 0x1a2c55, emissiveIntensity: 0.25 });
    const mesh = new T3.Mesh(brainGeo, mat); mesh.renderOrder = 0; field.group.renderOrder = 3;
    const core = C.glow(0x6fb8ff, 3.4, 0.2, 0.3); core.position.z = -0.6;
    const grp = new T3.Group(); grp.add(field.group, mesh, core);
    const B = { group: grp, mesh, mat, field, core };
    const cA = new T3.Color(0xd9b7b4), cGrey = new T3.Color(0x55575e), cGold = new T3.Color(0xffc27a);
    B.set = function (T, s = {}) {
      field.set(T, s);
      const grey = s.grey || 0, surge = s.surge || 0;
      mat.color.copy(cA).lerp(cGrey, grey).lerp(cGold, surge * 0.5);
      mat.emissive.set(surge > 0.01 ? 0xff8a2a : 0x0e1a38); mat.emissiveIntensity = 0.3 * (1 - grey) * (s.act != null ? s.act : 1) + surge * 0.45;
      mat.opacity = 0.97;
      core.material.opacity = (0.08 + 0.15 * (s.act != null ? s.act : 1)) * (1 - (s.dead || 0)) + surge * 0.3;
      core.material.color.set(surge > 0.3 ? 0xffd08a : 0x6fb8ff); core.scale.setScalar(3.4 + surge * 2.5);
      const beat = s.beat || 0; grp.scale.setScalar((s.scale || 1) * (1 + beat * 0.01));
      grp.rotation.y = -Math.PI / 2 + 0.35 * Math.sin(s.rotY != null ? s.rotY : T * 0.12);
      grp.rotation.x = s.rotX || 0.05;
    };
    return B;
  };

  // average normals of vertices that share a position (non-indexed geometry → smooth shading)
  function smoothNormals(g) {
    const p = g.attributes.position, n = g.attributes.normal, map = new Map(), key = (i) => Math.round(p.getX(i) * 1e3) + ',' + Math.round(p.getY(i) * 1e3) + ',' + Math.round(p.getZ(i) * 1e3);
    for (let i = 0; i < p.count; i++) { const k = key(i); const a = map.get(k) || [0, 0, 0]; a[0] += n.getX(i); a[1] += n.getY(i); a[2] += n.getZ(i); map.set(k, a); }
    for (let i = 0; i < p.count; i++) { const a = map.get(key(i)); const l = Math.hypot(a[0], a[1], a[2]) || 1; n.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
    n.needsUpdate = true;
  }
  // ------------------------------------------------------------------ the heart: puffy extruded heart + vessels
  C.heart = function () {
    const sh = new T3.Shape();
    const N = 80; for (let i = 0; i <= N; i++) { const t = (i / N) * Math.PI * 2; const x = 16 * Math.pow(Math.sin(t), 3); const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t); i ? sh.lineTo(x / 17, y / 17) : sh.moveTo(x / 17, y / 17); }
    const g = new T3.ExtrudeGeometry(sh, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.42, bevelSize: 0.3, bevelSegments: 18, curveSegments: 140 });
    g.center(); g.computeVertexNormals();
    // organic bumps
    const p = g.attributes.position, v = new T3.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = noise3(v.x * 2.4, v.y * 2.4, v.z * 2.4) * 0.04; p.setXYZ(i, v.x * (1 + n), v.y * (1 + n), v.z * (1 + n)); }
    g.computeVertexNormals(); smoothNormals(g);
    const mat = new T3.MeshPhysicalMaterial({ color: 0x8e1020, roughness: 0.3, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.18, emissive: 0x3a0208, emissiveIntensity: 0.6 });
    const m = new T3.Mesh(g, mat); m.rotation.y = 0.35; m.rotation.z = -0.25; m.scale.setScalar(0.62);
    const grp = new T3.Group(); grp.add(m);
    const vmat = new T3.MeshPhysicalMaterial({ color: 0x7a1424, roughness: 0.35, metalness: 0.2, clearcoat: 1 });
    [[[-0.15, 0.4, 0], [-0.2, 0.95, 0.05], [0.25, 1.25, 0], [0.55, 1.0, 0]], [[0.2, 0.45, 0.05], [0.25, 0.9, 0.12], [0.1, 1.2, 0.1]], [[-0.35, 0.35, -0.05], [-0.5, 0.8, -0.1], [-0.6, 1.15, -0.1]]].forEach((pts, i) => {
      const curve = new T3.CatmullRomCurve3(pts.map((q) => new T3.Vector3(...q)));
      const tb = new T3.Mesh(new T3.TubeGeometry(curve, 30, i ? 0.045 : 0.065, 14, false), vmat); tb.scale.setScalar(0.62); tb.position.y = -0.05; grp.add(tb);
    });
    const glow = C.glow(0xff3040, 2.2, 0.5, 0.3); glow.position.z = -0.5; grp.add(glow);
    const H = { group: grp, mesh: m, mat, glow };
    // beat(T): lub-dub envelope, stops at stopAt
    H.beatAt = function (T, bpm, stopAt) {
      if (stopAt != null && T > stopAt) return 0;
      const ph = (T * bpm / 60) % 1; return Math.exp(-Math.pow((ph - 0.05) / 0.045, 2)) + 0.6 * Math.exp(-Math.pow((ph - 0.24) / 0.05, 2));
    };
    H.set = function (T, s = {}) {
      const b = s.beat || 0; m.scale.setScalar(0.62 * (1 + b * 0.09));
      const life = s.life != null ? s.life : 1;
      mat.emissiveIntensity = 0.2 + 1.2 * b * life; mat.color.set(life > 0.5 ? 0x8e1020 : 0x4a1018);
      glow.material.opacity = (0.15 + 0.6 * b) * life; grp.rotation.y = Math.sin(T * 0.4) * 0.25;
    };
    return H;
  };

  // ------------------------------------------------------------------ blood / oxygen stream along a curve
  C.stream = function (curve, n, o = {}) {
    const pos = new Float32Array(n * 3), g = new T3.BufferGeometry(); g.setAttribute('position', new T3.BufferAttribute(pos, 3));
    const pts = new T3.Points(g, new T3.PointsMaterial({ color: o.color || 0xff3a3a, size: o.size || 0.07, map: C.glowTex(0.3), transparent: true, depthWrite: false, blending: T3.AdditiveBlending }));
    pts.frustumCulled = false;
    const R = rng(o.seed || 4), ph = [], off = []; for (let i = 0; i < n; i++) { ph.push(R()); off.push([(R() - 0.5), (R() - 0.5), (R() - 0.5)]); }
    const tube = new T3.Mesh(new T3.TubeGeometry(curve, 120, o.radius || 0.09, 16, false), new T3.MeshPhysicalMaterial({ color: 0x3a0a12, roughness: 0.2, metalness: 0.1, transmission: 0, transparent: true, opacity: 0.35, clearcoat: 1, depthWrite: false }));
    const grp = new T3.Group(); grp.add(tube, pts);
    const v = new T3.Vector3();
    return {
      group: grp, pts, tube,
      set(T, flow, speed = 0.25, spread = 1) { // flow 0..1 how much is moving; after stop the particles drain out
        pts.material.opacity = clamp(flow * 1.2, 0, 1);
        for (let i = 0; i < n; i++) {
          const f = (ph[i] + T * speed) % 1; curve.getPointAt(f, v);
          const r = (o.radius || 0.09) * 0.7 * spread;
          pos[i * 3] = v.x + off[i][0] * r; pos[i * 3 + 1] = v.y + off[i][1] * r; pos[i * 3 + 2] = v.z + off[i][2] * r;
        }
        g.attributes.position.needsUpdate = true;
      },
    };
  };

  // ------------------------------------------------------------------ hologram panel (canvas-drawn, additive)
  C.holo = function (w, h, pxW, pxH, draw, color = 0x9fd4ff) {
    const t = C.canvasTex(pxW, pxH, draw);
    const m = new T3.Mesh(new T3.PlaneGeometry(w, h), new T3.MeshBasicMaterial({ map: t.tex, color, transparent: true, depthWrite: false, blending: T3.AdditiveBlending, side: T3.DoubleSide, fog: false }));
    return { mesh: m, tex: t, draw: t.draw };
  };

  // ------------------------------------------------------------------ patient monitor with ECG/EEG trace
  C.monitor = function () {
    const grp = new T3.Group();
    const body = new T3.Mesh(new T3.BoxGeometry(1.7, 1.15, 0.22), new T3.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.35, metalness: 0.8 }));
    grp.add(body);
    const scr = C.canvasTex(512, 340, () => {});
    const screen = new T3.Mesh(new T3.PlaneGeometry(1.52, 1.0), new T3.MeshBasicMaterial({ map: scr.tex, toneMapped: false }));
    screen.position.z = 0.115; grp.add(screen);
    const glow = C.glow(0x40ff90, 2.6, 0.18, 0.3); glow.position.z = -0.3; grp.add(glow);
    const stand = new T3.Mesh(new T3.CylinderGeometry(0.04, 0.04, 2.2, 12), body.material); stand.position.y = -1.6; grp.add(stand);
    const M = { group: grp, glow };
    // amp: 1 = healthy EEG, 0 = flat line; heart: show ECG spikes until stopAt
    M.set = function (T, amp, flatColor) {
      scr.draw((ctx, w, h) => {
        ctx.fillStyle = '#020806'; ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(40,140,80,0.25)'; ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
        for (let y = 0; y < h; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
        const col = amp < 0.05 ? (flatColor || '#ff4a4a') : '#5dff9a';
        ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.shadowColor = col; ctx.shadowBlur = 14; ctx.beginPath();
        for (let x = 0; x <= w; x += 2) {
          const tt = T * 2.2 - (w - x) / 140; // scrolling
          const a = amp * (Math.sin(tt * 23) * 0.5 + Math.sin(tt * 51 + 1) * 0.3 + noise3(tt * 9, 2, 3) * 0.9);
          const y = h * 0.5 - a * 70; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke(); ctx.shadowBlur = 0;
        ctx.fillStyle = col; ctx.font = 'bold 34px KzSans, sans-serif'; ctx.fillText('EEG', 18, 44);
        ctx.font = 'bold 30px KzSans, sans-serif'; ctx.fillText(amp < 0.05 ? '— —' : Math.round(8 + amp * 32) + ' Hz', w - 150, 44);
      });
      M.glow.material.color.set(amp < 0.05 ? 0xff4040 : 0x40ff90);
    };
    return M;
  };

  // ------------------------------------------------------------------ mannequin (capsule figure) for patients and the body
  C.figure = function (color = 0x9aa3b5, o = {}) {
    const mat = new T3.MeshPhysicalMaterial({ color, roughness: 0.35, metalness: 0.6, clearcoat: 0.6, transparent: !!o.ghost, opacity: o.ghost ? 0.35 : 1, emissive: o.ghost ? 0x8fc8ff : 0x000000, emissiveIntensity: o.ghost ? 0.8 : 0, depthWrite: !o.ghost });
    const g = new T3.Group();
    const add = (geo, x, y, z, rx = 0, rz = 0) => { const m = new T3.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.x = rx; m.rotation.z = rz; g.add(m); return m; };
    add(new T3.SphereGeometry(0.16, 24, 18), 0, 1.62, 0);
    add(new T3.CapsuleGeometry(0.2, 0.5, 6, 14), 0, 1.12, 0);
    add(new T3.CapsuleGeometry(0.07, 0.5, 6, 10), -0.3, 1.1, 0, 0, 0.12);
    add(new T3.CapsuleGeometry(0.07, 0.5, 6, 10), 0.3, 1.1, 0, 0, -0.12);
    add(new T3.CapsuleGeometry(0.09, 0.62, 6, 10), -0.11, 0.42, 0);
    add(new T3.CapsuleGeometry(0.09, 0.62, 6, 10), 0.11, 0.42, 0);
    return { group: g, mat };
  };

  window.CINE = C;
})();
