/* synapse3d.js — one continuous 3D shot inside the brain for «СИНАПС».
 * Everything visible is a pure function of time: W.renderAt(t). Requires THREE (r159 UMD) as a global.
 * Set 1 (0–16.3 s): flight through a neuron forest, a hero neuron fires, the impulse runs down its axon.
 * Set 2 (16.3–37 s): macro of one synapse: vesicles fuse, neurotransmitters cross the cleft, receptors light up.
 * Set 3 (37–50 s): pull back through a whole brain lighting up in a chain reaction. */
(function () {
  const T3 = THREE;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const smooth = (a, b, x) => { const k = clamp((x - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };
  const E = {
    lin: (x) => x, in2: (x) => x * x, out2: (x) => 1 - (1 - x) * (1 - x), io2: (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),
    io3: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2), in3: (x) => x * x * x, out3: (x) => 1 - Math.pow(1 - x, 3),
    sine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
  };
  const lerpV = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * k) : a + (b - a) * k);
  function K(t, keys) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e] = keys[i];
      if (t <= t1) { const [t0, v0] = keys[i - 1]; const x = (t - t0) / (t1 - t0 || 1); return lerpV(v0, v1, E[e || 'io2'](x)); }
    }
    return keys[keys.length - 1][1];
  }
  const pulse = (t, at, up, down) => (t < at - up ? 0 : t < at ? E.out2((t - (at - up)) / up) : Math.exp(-(t - at) / down));
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
  const V = (x, y, z) => new T3.Vector3(x, y, z);
  const C = (h) => new T3.Color(h);

  // ---------------------------------------------------------------- shaders
  const VS = `
    attribute float aU; attribute float aSeed;
    varying vec3 vN; varying vec3 vV; varying float vU; varying float vSeed; varying float vDepth;
    void main(){
      vec4 lp = vec4(position,1.0); vec3 nn = normal;
      #ifdef USE_INSTANCING
        lp = instanceMatrix * lp; nn = mat3(instanceMatrix) * nn;
      #endif
      vec4 mv = modelViewMatrix * lp;
      vN = normalize(normalMatrix * nn); vV = -mv.xyz; vU = aU; vSeed = aSeed; vDepth = -mv.z;
      gl_Position = projectionMatrix * mv;
    }`;
  const FS = `
    uniform float uTime, uFogNear, uFogFar, uOpacity, uBaseAmt, uRimPow, uPulses, uPeriod, uSpeed, uPW;
    uniform float uImp, uImpW, uImpAmp, uTrail, uFlash, uAlphaBase, uLit;
    uniform vec3 uBase, uRim, uPulse;
    varying vec3 vN; varying vec3 vV; varying float vU; varying float vSeed; varying float vDepth;
    void main(){
      vec3 n = normalize(vN), v = normalize(vV);
      float fres = pow(1.0 - abs(dot(n, v)), uRimPow);
      float tr = (uPeriod - mod(uTime + vSeed * 13.7, uPeriod)) * uSpeed - 4.0;
      float dp = (vU - tr) / uPW; float g = exp(-dp * dp) * uPulses;
      float di = vU - uImp; float gi = exp(-di * di / (uImpW * uImpW)) * uImpAmp;
      gi += uTrail * exp(min(di, 0.0) / (uImpW * 10.0)) * step(di, 0.0);
      gi += uLit * step(di, 0.0);
      float e = g + gi + uFlash;
      vec3 col = uBase * uBaseAmt + uRim * fres + uPulse * e * (0.45 + fres);
      float f = clamp((vDepth - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0); f = f * f * (3.0 - 2.0 * f);
      float a = clamp(uOpacity * (uAlphaBase + (1.0 - uAlphaBase) * fres + e * 0.6), 0.0, 1.0) * (1.0 - f) * smoothstep(0.15, 1.2, vDepth);
      gl_FragColor = vec4(col, a);
    }`;
  const PVS = `
    attribute float aSize; attribute vec3 aCol; attribute float aAlpha; attribute float aSeed;
    uniform float uTime, uScale, uFogNear, uFogFar, uDrift;
    varying vec3 vCol; varying float vA;
    void main(){
      vec3 p = position + uDrift * vec3(sin(uTime*0.31 + aSeed*6.0), cos(uTime*0.23 + aSeed*4.0), sin(uTime*0.17 + aSeed*9.0));
      vec4 mv = modelViewMatrix * vec4(p, 1.0); float d = -mv.z;
      gl_PointSize = clamp(aSize * uScale / max(d, 0.05), 0.0, 380.0);
      float f = clamp((d - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);
      vA = aAlpha * (1.0 - f) * smoothstep(0.2, 1.6, d); vCol = aCol;
      gl_Position = projectionMatrix * mv;
    }`;
  const PFS = `
    varying vec3 vCol; varying float vA;
    void main(){ vec2 c = gl_PointCoord - 0.5; float r = dot(c, c) * 4.0; if (r > 1.0) discard;
      float a = (exp(-r * 4.0) * 0.85 + exp(-r * 30.0) * 0.6) * (1.0 - r); gl_FragColor = vec4(vCol, a * vA); }`;
  const LVS = `
    attribute vec3 aCol; attribute float aAlpha; uniform float uFogNear, uFogFar;
    varying vec3 vCol; varying float vA;
    void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); float d = -mv.z;
      float f = clamp((d - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0); vA = aAlpha * (1.0 - f); vCol = aCol; gl_Position = projectionMatrix * mv; }`;
  const LFS = `varying vec3 vCol; varying float vA; void main(){ gl_FragColor = vec4(vCol, vA); }`;

  // ---------------------------------------------------------------- geometry builders
  const Bld = () => ({ pos: [], nor: [], u: [], seed: [], idx: [] });
  function toGeo(B) {
    const g = new T3.BufferGeometry();
    g.setAttribute('position', new T3.Float32BufferAttribute(B.pos, 3));
    g.setAttribute('normal', new T3.Float32BufferAttribute(B.nor, 3));
    g.setAttribute('aU', new T3.Float32BufferAttribute(B.u, 1));
    g.setAttribute('aSeed', new T3.Float32BufferAttribute(B.seed, 1));
    g.setIndex(B.idx); g.computeBoundingSphere(); return g;
  }
  function tube(B, pts, radial, r0, r1, u0, seed) {
    const curve = new T3.CatmullRomCurve3(pts);
    const len = curve.getLength();
    const n = clamp(Math.ceil(len * 1.1), 4, 140);
    const fr = curve.computeFrenetFrames(n, false);
    const base = B.pos.length / 3;
    for (let i = 0; i <= n; i++) {
      const s = i / n, p = curve.getPointAt(s), N = fr.normals[i], Bn = fr.binormals[i];
      const r = lerp(r0, r1, s) * (1 + 0.12 * noise3(p.x * 0.4, p.y * 0.4, p.z * 0.4 + seed));
      for (let j = 0; j < radial; j++) {
        const a = (j / radial) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
        const nx = c * N.x + sn * Bn.x, ny = c * N.y + sn * Bn.y, nz = c * N.z + sn * Bn.z;
        B.pos.push(p.x + nx * r, p.y + ny * r, p.z + nz * r); B.nor.push(nx, ny, nz); B.u.push(u0 + s * len); B.seed.push(seed);
      }
    }
    for (let i = 0; i < n; i++) for (let j = 0; j < radial; j++) {
      const a = base + i * radial + j, b = base + (i + 1) * radial + j, c = base + (i + 1) * radial + ((j + 1) % radial), d = base + i * radial + ((j + 1) % radial);
      B.idx.push(a, b, d, b, c, d);
    }
    return { curve, len };
  }
  function blob(B, c, r, sc, seed, uFn, ws, hs, rough) {
    const g = new T3.SphereGeometry(1, ws || 32, hs || 22); const p = g.attributes.position; const v = new T3.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n = noise3(v.x * 1.6 + seed, v.y * 1.6, v.z * 1.6 - seed) * rough + noise3(v.x * 4 + seed * 2, v.y * 4, v.z * 4) * rough * 0.35;
      v.multiplyScalar(r * (1 + n)); p.setXYZ(i, v.x * sc[0], v.y * sc[1], v.z * sc[2]);
    }
    g.computeVertexNormals();
    const base = B.pos.length / 3, nr = g.attributes.normal;
    for (let i = 0; i < p.count; i++) {
      const x = c.x + p.getX(i), y = c.y + p.getY(i), z = c.z + p.getZ(i);
      B.pos.push(x, y, z); B.nor.push(nr.getX(i), nr.getY(i), nr.getZ(i)); B.u.push(uFn ? uFn(x, y, z) : 0); B.seed.push(seed);
    }
    const ix = g.index.array; for (let k = 0; k < ix.length; k++) B.idx.push(base + ix[k]);
  }
  function grow(B, start, dir, len, r0, depth, u0, seed, R, avoid, radial) {
    const pts = [start.clone()]; let p = start.clone(); const d = dir.clone();
    for (let k = 0; k < 4; k++) {
      d.x += (R() - 0.5) * 0.7; d.y += (R() - 0.5) * 0.7; d.z += (R() - 0.5) * 0.7; d.normalize();
      p = p.clone().addScaledVector(d, len / 4); if (avoid && avoid(p)) break; pts.push(p);
    }
    if (pts.length < 3) return;
    const r1 = Math.max(0.16, r0 * 0.6); const res = tube(B, pts, radial, r0, r1, u0, seed);
    if (depth > 0) for (let b = 0; b < 2; b++) {
      const nd = d.clone().add(V(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(1.4)).normalize();
      grow(B, pts[pts.length - 1], nd, len * 0.68, r1, depth - 1, u0 + res.len, seed, R, avoid, radial);
    }
  }
  function neuron(B, c, r, seed, R, o) {
    blob(B, c, r, [1, 1, 1], seed, null, 24, 16, 0.25);
    const nd = o.nd || 5 + Math.floor(R() * 4);
    for (let i = 0; i < nd; i++) {
      const d = V(R() - 0.5, R() - 0.5, R() - 0.5).normalize();
      grow(B, c.clone().addScaledVector(d, r * 0.8), d, o.len * (0.7 + R() * 0.6), r * 0.42, o.depth, 0, seed, R, o.avoid, o.radial || 6);
    }
  }

  // ---------------------------------------------------------------- world
  function makeWorld(canvas, bloomCanvas) {
    const renderer = new T3.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, alpha: false });
    renderer.setPixelRatio(1); renderer.setSize(1080, 1920, false); renderer.setClearColor(0x01030a, 1);
    const scene = new T3.Scene();
    const cam = new T3.PerspectiveCamera(55, 1080 / 1920, 0.1, 1400);
    const uTime = { value: 0 }, FN = { value: 30 }, FF = { value: 170 }, uScale = { value: 1800 };
    const bctx = bloomCanvas.getContext('2d');

    function mem(o) {
      return new T3.ShaderMaterial({
        uniforms: {
          uTime, uFogNear: FN, uFogFar: FF, uOpacity: { value: o.opacity == null ? 1 : o.opacity }, uBase: { value: C(o.base) }, uBaseAmt: { value: o.baseAmt == null ? 0.12 : o.baseAmt },
          uRim: { value: C(o.rim) }, uRimPow: { value: o.rimPow || 2.2 }, uPulse: { value: C(o.pulse || 0xfff1c9) }, uPulses: { value: o.pulses || 0 }, uPeriod: { value: o.period || 5 },
          uSpeed: { value: o.speed || 12 }, uPW: { value: o.pw || 1.8 }, uImp: { value: -1e4 }, uImpW: { value: o.impW || 2 }, uImpAmp: { value: 0 }, uTrail: { value: 0 }, uLit: { value: 0 },
          uFlash: { value: 0 }, uAlphaBase: { value: o.alphaBase == null ? 0.22 : o.alphaBase },
        },
        vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, blending: T3.AdditiveBlending,
      });
    }
    function points(n, drift) {
      const g = new T3.BufferGeometry();
      const Pp = new Float32Array(n * 3), S = new Float32Array(n), Cc = new Float32Array(n * 3), A = new Float32Array(n), Sd = new Float32Array(n);
      g.setAttribute('position', new T3.BufferAttribute(Pp, 3)); g.setAttribute('aSize', new T3.BufferAttribute(S, 1));
      g.setAttribute('aCol', new T3.BufferAttribute(Cc, 3)); g.setAttribute('aAlpha', new T3.BufferAttribute(A, 1)); g.setAttribute('aSeed', new T3.BufferAttribute(Sd, 1));
      const m = new T3.ShaderMaterial({ uniforms: { uTime, uScale, uFogNear: FN, uFogFar: FF, uDrift: { value: drift || 0 } }, vertexShader: PVS, fragmentShader: PFS, transparent: true, depthWrite: false, blending: T3.AdditiveBlending });
      const o = new T3.Points(g, m); o.frustumCulled = false;
      return {
        o, P: Pp, S, C: Cc, A, Sd, n,
        set(i, p, size, col, a) { Pp[i * 3] = p.x; Pp[i * 3 + 1] = p.y; Pp[i * 3 + 2] = p.z; S[i] = size; if (col) { Cc[i * 3] = col.r; Cc[i * 3 + 1] = col.g; Cc[i * 3 + 2] = col.b; } A[i] = a; },
        dirty() { for (const k of ['position', 'aSize', 'aCol', 'aAlpha']) g.attributes[k].needsUpdate = true; },
      };
    }
    function dust(n, center, ext, seed, cols, size, alpha, drift) {
      const D = points(n, drift); const R = rng(seed);
      for (let i = 0; i < n; i++) {
        const col = C(cols[Math.floor(R() * cols.length)]);
        D.set(i, V(center.x + (R() - 0.5) * ext[0], center.y + (R() - 0.5) * ext[1], center.z + (R() - 0.5) * ext[2]), size[0] + R() * R() * (size[1] - size[0]), col, alpha * (0.3 + R() * 0.7));
        D.Sd[i] = R() * 10;
      }
      D.dirty(); return D;
    }

    // ============================================================== SET 1 — neuron forest + hero neuron + axon
    const S1 = new T3.Group(); scene.add(S1);
    const HERO = V(0, 0, -120);
    const AX = [V(0, -2.6, -121.5), V(3, -5, -129), V(-2, -9.5, -141), V(4, -14, -155), V(-1, -19, -170), V(5, -23, -186), V(1, -27, -200)];
    const axCurve = new T3.CatmullRomCurve3(AX); const AXL = axCurve.getLength();
    const axSamples = []; for (let i = 0; i <= 60; i++) axSamples.push(axCurve.getPointAt(i / 60));
    // camera flight time for a given z (inverse of the out2 flight curve) so branches keep clear of the path
    const zt = (z) => { const k = clamp((26 - z) / 123, 0, 1); return 9.6 * (1 - Math.sqrt(1 - k)); };
    function avoidForest(p) {
      if (p.z > -116 && p.z < 32 && Math.hypot(p.x - 6.5 * Math.sin(0.5 * zt(p.z) + 0.3), p.y - 3.5 * Math.sin(0.37 * zt(p.z) + 1)) < 4.5) return true;
      if (p.distanceTo(HERO) < 14) return true;
      for (const s of axSamples) if (p.distanceTo(s) < 7) return true;
      return false;
    }
    const forestMats = [
      mem({ base: 0x1d2f7a, rim: 0x3f8dff, pulse: 0xbfe9ff, pulses: 1.6, period: 4.6, speed: 11, alphaBase: 0.5, baseAmt: 1.05 }),
      mem({ base: 0x3a1a6e, rim: 0xa45cff, pulse: 0xffd6ff, pulses: 1.6, period: 5.3, speed: 10, alphaBase: 0.5, baseAmt: 1.05 }),
      mem({ base: 0x0e3a4a, rim: 0x2fe0d0, pulse: 0xe6fff9, pulses: 1.6, period: 4.1, speed: 12, alphaBase: 0.5, baseAmt: 1.05 }),
    ];
    const FB = [Bld(), Bld(), Bld()];
    const somaGlow = [];
    {
      const R = rng(7); let placed = 0, tries = 0;
      while (placed < 78 && tries < 4000) {
        tries++;
        const c = V((R() - 0.5) * 64, (R() - 0.5) * 100, 40 - R() * 250);
        if (Math.hypot(c.x, c.y) < 9 && c.z > -118) continue;
        if (c.distanceTo(HERO) < 22) continue;
        if (axSamples.some((s) => c.distanceTo(s) < 13)) continue;
        const k = placed % 3; const r = 1.5 + R() * 1.3;
        neuron(FB[k], c, r, placed * 1.37 + 0.2, R, { len: 13 + R() * 9, depth: 2, avoid: avoidForest, radial: 6 });
        somaGlow.push({ c, r, k, seed: placed * 1.37 + 0.2 }); placed++;
      }
    }
    FB.forEach((B, k) => S1.add(new T3.Mesh(toGeo(B), forestMats[k])));
    const forestGlow = points(somaGlow.length);
    const fcols = [C(0x6fb4ff), C(0xc28cff), C(0x5ff0e0)];
    somaGlow.forEach((s, i) => { forestGlow.set(i, s.c, s.r * 6, fcols[s.k], 0.6); forestGlow.Sd[i] = s.seed; });
    forestGlow.dirty(); S1.add(forestGlow.o);

    // hero neuron (dendrites + soma) and its axon (own materials so they can flash)
    const heroMat = mem({ base: 0x23409a, rim: 0x7fd4ff, pulse: 0xfff3d1, pulses: 1.0, period: 3.4, speed: 9, alphaBase: 0.35, baseAmt: 0.75 });
    const HB = Bld(); { const R = rng(99); neuron(HB, HERO, 3.3, 5.5, R, { len: 20, depth: 3, nd: 9, radial: 8, avoid: (p) => p.z > -108 && Math.hypot(p.x - 9, p.y - 4.5) < 9 }); }
    S1.add(new T3.Mesh(toGeo(HB), heroMat));
    const axMat = mem({ base: 0x23409a, rim: 0x8fdcff, pulse: 0xfff3d1, impW: 2.6, alphaBase: 0.4, baseAmt: 0.8 });
    const AB = Bld();
    tube(AB, AX, 8, 0.55, 0.45, 0, 3);
    // myelin sleeves with nodes of Ranvier between them
    for (let s0 = 3; s0 + 6 < AXL - 4; s0 += 8.5) {
      const pts = []; for (let k = 0; k <= 6; k++) pts.push(axCurve.getPointAt((s0 + k) / AXL));
      tube(AB, pts, 12, 1.15, 1.15, s0, 3);
    }
    const TERM = axCurve.getPointAt(1);
    blob(AB, TERM, 1.5, [1, 1, 1], 4, () => AXL + 1, 24, 16, 0.18);
    { const R = rng(5); for (let b = 0; b < 3; b++) {
      const st = axCurve.getPointAt(0.9 + b * 0.02); const d = V(R() - 0.5, -0.4, R() - 0.5).normalize();
      const e = st.clone().addScaledVector(d, 6 + R() * 3); const m = st.clone().lerp(e, 0.5).add(V(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(2));
      const u0 = 0.9 * AXL + b * 0.02 * AXL; tube(AB, [st, m, e], 6, 0.35, 0.3, u0, 4); blob(AB, e, 0.9, [1, 1, 1], 6 + b, () => u0 + 8, 16, 12, 0.2);
    } }
    S1.add(new T3.Mesh(toGeo(AB), axMat));
    // postsynaptic neighbour near the terminal
    const postMat = mem({ base: 0x3a1a6e, rim: 0xc07cff, pulse: 0xffe0ff, pulses: 1.0, period: 6, speed: 9, alphaBase: 0.5, baseAmt: 1.2 });
    const PB = Bld(); { const R = rng(31); neuron(PB, V(9, -38, -214), 2.6, 9.1, R, { len: 16, depth: 2, nd: 8, radial: 7 }); tube(PB, [V(9, -38, -214), V(5, -32, -206), V(1.6, -28.8, -201.2)], 7, 0.8, 0.6, 0, 9.1); }
    S1.add(new T3.Mesh(toGeo(PB), postMat));
    const heroGlow = points(3); S1.add(heroGlow.o);
    const imp = points(14); S1.add(imp.o);
    S1.add(dust(2600, V(0, 0, -80), [150, 220, 300], 11, [0x6aa8ff, 0xb48cff, 0x7ff5ff, 0xffffff], [0.08, 0.5], 0.55, 0.6).o);
    S1.add(dust(160, V(0, 0, -60), [40, 60, 220], 12, [0x9fd0ff, 0xd8b8ff], [0.6, 1.6], 0.22, 1.2).o); // soft bokeh flecks near the path

    // ============================================================== SET 2 — the synapse (macro)
    const O2 = V(1000, 0, 0);
    const S2 = new T3.Group(); S2.position.copy(O2); scene.add(S2);
    const boutonMat = mem({ base: 0x203a9a, rim: 0x7cc8ff, pulse: 0xd8f4ff, impW: 3.5, alphaBase: 0.1, rimPow: 2.6 });
    const BB = Bld();
    const NECK = [V(3, 46, -7), V(1.5, 30, -3), V(0, 18, 0), V(0, 13, 0)];
    const neckRes = tube(BB, NECK, 20, 2.4, 3.6, 0, 1.2);
    blob(BB, V(0, 8.6, 0), 8, [1, 0.88, 1], 2.2, (x, y) => neckRes.len + (13 - y), 64, 44, 0.07);
    S2.add(new T3.Mesh(toGeo(BB), boutonMat));
    const spineMat = mem({ base: 0x3b1670, rim: 0xc77dff, pulse: 0xffe3a6, impW: 3, alphaBase: 0.1, rimPow: 2.6 });
    const SB = Bld();
    const HEADTOP = -1.4;
    blob(SB, V(0, -7, 0), 7.5, [1.1, 0.75, 1.1], 3.3, (x, y) => HEADTOP - y, 64, 44, 0.06);
    const sneck = tube(SB, [V(0, -10.5, 0), V(0, -16, 0.5), V(-1, -23, 1.5), V(-2, -30, 2)], 18, 3.0, 2.3, 9, 3.3);
    const SHAFT_U = 9 + sneck.len;
    tube(SB, [V(-2, -33, 2), V(-25, -35, 4), V(-50, -31, 0), V(-80, -36, -4)], 24, 6, 6, SHAFT_U, 3.3);
    tube(SB, [V(-2, -33, 2), V(22, -34, 0), V(48, -38, -3), V(80, -33, -6)], 24, 6, 6, SHAFT_U, 3.3);
    S2.add(new T3.Mesh(toGeo(SB), spineMat));
    // cleft glow disc
    const cleftMat = new T3.ShaderMaterial({
      uniforms: { uA: { value: 0 } }, transparent: true, depthWrite: false, blending: T3.AdditiveBlending, side: T3.DoubleSide,
      vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
      fragmentShader: 'uniform float uA; varying vec2 vP; void main(){ float r = length(vP)/9.0; float a = smoothstep(1.0,0.0,r)*(0.55+0.45*smoothstep(0.75,0.95,r)); gl_FragColor = vec4(vec3(0.45,0.95,1.0)*a*uA, a*uA); }',
    });
    const cleft = new T3.Mesh(new T3.CircleGeometry(9, 64), cleftMat); cleft.rotation.x = -Math.PI / 2; cleft.position.y = 0.05; S2.add(cleft);
    // vesicles
    const NV = 46; const vesMat = mem({ base: 0x1c5a7a, rim: 0x9ff3ff, pulse: 0xfff0b0, alphaBase: 0.12, rimPow: 1.8 });
    const vesGeo = new T3.SphereGeometry(0.95, 20, 14); vesGeo.setAttribute('aU', new T3.Float32BufferAttribute(new Float32Array(vesGeo.attributes.position.count), 1)); vesGeo.setAttribute('aSeed', new T3.Float32BufferAttribute(new Float32Array(vesGeo.attributes.position.count), 1));
    const ves = new T3.InstancedMesh(vesGeo, vesMat, NV); ves.frustumCulled = false; S2.add(ves);
    const vesCore = points(NV); S2.add(vesCore.o);
    const VES = []; const FUSE = [24.9, 25.35, 25.8, 26.25, 26.75, 27.2];
    { const R = rng(21);
      for (let i = 0; i < NV; i++) {
        let p;
        if (i < FUSE.length) { const a = (i / FUSE.length) * Math.PI * 2 + 0.4, rr = 1.2 + (i % 3) * 1.1; p = V(Math.cos(a) * rr, 2.9, Math.sin(a) * rr); }
        else { do { p = V((R() - 0.5) * 12, 2.6 + R() * 9, (R() - 0.5) * 12); } while (Math.hypot(p.x / 6.2, (p.y - 8.2) / 5.6, p.z / 6.2) > 1 || (p.y < 3.4 && Math.hypot(p.x, p.z) < 4.8)); }
        VES.push({ p, seed: R() * 50, fuse: i < FUSE.length ? FUSE[i] : null });
      } }
    // receptors on the spine head
    const NR = 34; const recGeo = new T3.CylinderGeometry(0.3, 0.42, 0.9, 10);
    const recMat = new T3.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, blending: T3.AdditiveBlending, depthWrite: false });
    const rec = new T3.InstancedMesh(recGeo, recMat, NR); rec.frustumCulled = false; rec.instanceColor = new T3.InstancedBufferAttribute(new Float32Array(NR * 3), 3); S2.add(rec);
    const REC = []; const recGlow = points(NR); S2.add(recGlow.o);
    { const R = rng(41); const m = new T3.Matrix4(), q = new T3.Quaternion();
      for (let i = 0; i < NR; i++) {
        const a = i * 2.39996, rr = 4.9 * Math.sqrt((i + 0.5) / NR);
        const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
        // surface of the ellipsoid head: (x/8.25)^2 + ((y+7)/5.625)^2 + (z/8.25)^2 = 1
        const y = -7 + 5.625 * Math.sqrt(Math.max(0, 1 - (x * x + z * z) / (8.25 * 8.25)));
        const n = V(x / (8.25 * 8.25), (y + 7) / (5.625 * 5.625), z / (8.25 * 8.25)).normalize();
        q.setFromUnitVectors(V(0, 1, 0), n); m.compose(V(x, y + 0.25, z), q, V(1, 1, 1)); rec.setMatrixAt(i, m);
        REC.push({ p: V(x, y + 0.45, z), top: V(x, y + 0.75, z), on: 99 });
      } }
    // neurotransmitters
    const NT = 960; const nt = points(NT); S2.add(nt.o); const NTD = [];
    { const R = rng(77);
      for (let i = 0; i < NT; i++) {
        const k = i % FUSE.length; const v = VES[k];
        const r0 = FUSE[k] + 0.05 + R() * 0.3; const th = R() * Math.PI * 2; const rho = 1.2 + R() * 6.5;
        const toRec = R() < 0.55; const j = Math.floor(R() * NR);
        const L = 30.3 + R() * 3.0;
        NTD.push({ k, r0, th, rho, yb: 1.0 - R() * 2.0, toRec, j, L, fadeAt: 29.2 + R() * 3.5, s: R() * 100, size: 0.16 + R() * 0.16 });
        if (toRec) REC[j].on = Math.min(REC[j].on, L);
      }
      REC.forEach((r, i) => { if (r.on > 90) r.on = 31 + (i % 7) * 0.35; });
    }
    S2.add(dust(1400, V(0, 0, 0), [140, 120, 120], 23, [0x5c9dff, 0xb98cff, 0x77f0ff], [0.05, 0.35], 0.4, 0.8).o);
    S2.add(dust(60, V(0, 0, 0), [60, 40, 60], 24, [0xb0d8ff, 0xe0c0ff], [0.5, 1.4], 0.16, 1.5).o);
    const s2imp = points(10); S2.add(s2imp.o);

    // ============================================================== SET 3 — the whole brain lights up
    const O3 = V(-3000, 0, 0);
    const S3 = new T3.Group(); S3.position.copy(O3); scene.add(S3);
    const BR = [62, 52, 84];
    function insideBrain(p) {
      const hx = Math.abs(p.x) - 4; if (hx < 0) return false;
      const q = V((hx - 32) / 34, (p.y + (p.z > 30 ? 0 : 0)) / BR[1], p.z / BR[2]);
      return q.length() < 0.96;
    }
    const N3 = 640; const NODES = []; const N0 = V(14, 10, 24);
    { const R = rng(55); NODES.push({ p: N0.clone() });
      let guard = 0;
      while (NODES.length < N3 && guard < 100000) { guard++; const p = V((R() - 0.5) * 140, (R() - 0.5) * 110, (R() - 0.5) * 175); if (insideBrain(p)) NODES.push({ p }); } }
    NODES.forEach((nd, i) => { const R = rng(i + 900); nd.a = 37.15 + nd.p.distanceTo(N0) / 17 + R() * 0.5; nd.seed = R() * 10; if (i === 0) nd.a = 37.05; });
    const EDGES = [];
    for (let i = 0; i < NODES.length; i++) {
      const ds = []; for (let j = 0; j < NODES.length; j++) if (j !== i) ds.push([NODES[i].p.distanceToSquared(NODES[j].p), j]);
      ds.sort((a, b) => a[0] - b[0]);
      for (let m = 0; m < 3; m++) { const j = ds[m][1]; if (i < j || !EDGES.some((e) => e[0] === j && e[1] === i)) EDGES.push([i, j]); }
    }
    const eg = new T3.BufferGeometry(); const EP = new Float32Array(EDGES.length * 6), EC = new Float32Array(EDGES.length * 6), EA = new Float32Array(EDGES.length * 2);
    EDGES.forEach((e, k) => { const a = NODES[e[0]].p, b = NODES[e[1]].p; EP.set([a.x, a.y, a.z, b.x, b.y, b.z], k * 6); });
    eg.setAttribute('position', new T3.BufferAttribute(EP, 3)); eg.setAttribute('aCol', new T3.BufferAttribute(EC, 3)); eg.setAttribute('aAlpha', new T3.BufferAttribute(EA, 1));
    const lines = new T3.LineSegments(eg, new T3.ShaderMaterial({ uniforms: { uFogNear: FN, uFogFar: FF }, vertexShader: LVS, fragmentShader: LFS, transparent: true, depthWrite: false, blending: T3.AdditiveBlending }));
    lines.frustumCulled = false; S3.add(lines);
    const nodesP = points(NODES.length); S3.add(nodesP.o); NODES.forEach((n, i) => (nodesP.Sd[i] = n.seed));
    const flow = points(EDGES.length); S3.add(flow.o);
    // brain surface: two folded hemispheres made of glowing dust
    const NS = 15000; const shell = points(NS); S3.add(shell.o); const SHELL = [];
    { const R = rng(66);
      for (let i = 0; i < NS; i++) {
        const side = i % 2 ? 1 : -1; const u = R() * 2 - 1, ph = R() * Math.PI * 2; const s = Math.sqrt(1 - u * u);
        let d = V(s * Math.cos(ph), u, s * Math.sin(ph));
        if (d.x * side < -0.15) d.x = -d.x;
        const fold = 1 + 0.07 * Math.abs(noise3(d.x * 3.2 + side * 7, d.y * 3.2, d.z * 3.2)) * 2 - 0.05;
        const p = V(side * (4 + 34 + d.x * side * 34) , d.y * BR[1], d.z * BR[2]).multiplyScalar(fold);
        p.x = side * Math.max(3.2, Math.abs(p.x)); if (p.y < -30 && Math.abs(p.z) < 30) p.y = -30 + (p.y + 30) * 0.4;
        SHELL.push({ p, a: 37.4 + p.distanceTo(N0) / 17 + R() * 0.6, seed: R() * 10 });
      } }
    S3.add(dust(1500, V(0, 0, 0), [700, 700, 700], 88, [0x3f6fd0, 0x8a5cd8, 0x40c8d8], [0.4, 2.6], 0.35, 4).o);

    // ---------------------------------------------------------------- per-frame state
    const tmp = V(0, 0, 0), up = V(0, 1, 0);
    const axPt = (s) => { if (s <= 0) { const t0 = axCurve.getTangentAt(0); return AX[0].clone().addScaledVector(t0, s); } if (s >= AXL) { const t1 = axCurve.getTangentAt(1); return TERM.clone().addScaledVector(t1, s - AXL); } return axCurve.getPointAt(s / AXL); };
    const IMP0 = 11.25, IMP1 = 15.75;
    const impS = (t) => AXL * E.sine(clamp((t - IMP0) / (IMP1 - IMP0), 0, 1));
    function camSet1(t) {
      // flight
      const z = K(t, [[0, 26], [9.6, -90, 'out2']]);
      const k = smooth(4.8, 9.6, t);
      const fp = V(lerp(6.5 * Math.sin(0.5 * t + 0.3), 9, k), lerp(3.5 * Math.sin(0.37 * t + 1), 4.5, k), z);
      const fl = V(lerp(fp.x * 0.4, HERO.x, k), lerp(fp.y * 0.4, HERO.y, k), lerp(z - 30, HERO.z, k));
      // chase along the axon
      const s = impS(t); const a = 0.6 + 0.22 * (t - IMP0);
      const cp = axPt(s - 12).add(V(9 * Math.cos(a), 4.5, 9 * Math.sin(a)));
      const cl = axPt(s + 2);
      const w = smooth(9.7, 11.6, t);
      let pos = fp.lerp(cp, w), look = fl.lerp(cl, w);
      // dive into the terminal
      const dv = smooth(15.55, 16.3, t);
      if (dv > 0) { pos.lerp(TERM.clone().add(V(0.6, 0.6, 1.2)), E.in2(dv)); look.lerp(TERM.clone().add(V(0, -1, -2)), dv); }
      const roll = 0.09 * Math.sin(0.3 * t) * (1 - w) + 0.05 * Math.sin(t * 0.7) * w;
      const fov = 56 + 26 * E.in2(dv) + 6 * (1 - smooth(0, 1.2, t));
      return { pos, look, roll, fov };
    }
    const CAM2 = [
      [16.3, [5, 32, 15, 0, 20, 0]],
      [17.7, [11, 15, 22, 0, 6, 0], 'out2'],
      [19.4, [17, 4.5, 30, 0, 1.5, 0]],
      [22.6, [2.5, 0.8, 27, 0, 0.2, 0], 'sine'],
      [24.6, [1.5, 1.2, 20.5, 0, 0.4, 0]],
      [29.2, [-6, -0.2, 12.5, 0, 0.7, 0], 'sine'],
      [33.6, [13, 3.2, 15.5, 0, -1.6, 0], 'sine'],
      [35.4, [13, -12, 15, -0.5, -18, 1], 'io2'],
      [37.0, [3, -28, 7, -2, -33, 2], 'in2'],
    ];
    function camSet2(t) {
      const v = K(t, CAM2); const pos = V(v[0], v[1], v[2]).add(O2), look = V(v[3], v[4], v[5]).add(O2);
      const fov = K(t, [[16.3, 76], [17.6, 50, 'out2'], [36.3, 50], [37.0, 80, 'in2']]);
      return { pos, look, roll: 0.04 * Math.sin(t * 0.45), fov };
    }
    function camSet3(t) {
      const d = K(t, [[37.0, 3], [39.0, 22, 'out2'], [45.2, 330, 'io3'], [50, 300, 'sine']]);
      const az = K(t, [[37, 0.25], [45.2, 0.95, 'io2'], [50, 1.22, 'lin']]);
      const el = K(t, [[37, 0.05], [45.2, 0.33, 'io2'], [50, 0.38, 'lin']]);
      const tgt = N0.clone().lerp(V(0, 0, 0), smooth(38.2, 44.5, t));
      const pos = V(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(d).add(tgt).add(O3);
      const fov = K(t, [[37.0, 80], [38.6, 52, 'out2']]);
      return { pos, look: tgt.add(O3), roll: 0.05 * Math.sin(t * 0.4) * (1 - smooth(44, 47, t)), fov };
    }
    const cWhite = C(0xffffff), cGold = C(0xffd27a), cCyan = C(0x8fe6ff), cVio = C(0xb98cff), cDim = C(0x2a48a0), tc = C(0);
    const m4 = new T3.Matrix4(), qq = new T3.Quaternion();

    function renderAt(t) {
      uTime.value = t;
      const set = t < 16.3 ? 1 : t < 37.0 ? 2 : 3;
      S1.visible = set === 1; S2.visible = set === 2; S3.visible = set === 3;
      let c;
      if (set === 1) {
        FN.value = 45; FF.value = 230; c = camSet1(t);
        // hero soma fires at 10.9, impulse runs IMP0→IMP1
        const fire = pulse(t, 10.9, 0.25, 0.9);
        heroMat.uniforms.uFlash.value = fire * 0.45;
        const s = impS(t); const on = t > IMP0 - 0.3 && t < 16.4 ? 1 : 0;
        axMat.uniforms.uImp.value = t < IMP0 ? -1e4 : s; axMat.uniforms.uImpAmp.value = on * 1.6; axMat.uniforms.uTrail.value = on * 0.45;
        axMat.uniforms.uFlash.value = fire * 0.5 + pulse(t, 15.8, 0.15, 0.4) * 0.6;
        postMat.uniforms.uFlash.value = pulse(t, 15.95, 0.2, 0.5) * 0.6;
        heroGlow.set(0, HERO, 16 + fire * 18, cCyan, 0.5 + fire * 0.5);
        heroGlow.set(1, HERO, 5 + fire * 8, cWhite, 0.5 + fire);
        heroGlow.set(2, TERM, 6 + pulse(t, 15.8, 0.2, 0.5) * 22, cGold, 0.25 + pulse(t, 15.8, 0.2, 0.5));
        heroGlow.dirty();
        for (let i = 0; i < 14; i++) {
          const ss = s - i * 1.1; const p = axPt(clamp(ss, 0, AXL));
          const a = on * (i === 0 ? 1 : 0.7 * Math.exp(-i * 0.25)) * (ss < 0 ? 0 : 1);
          imp.set(i, p, i === 0 ? 3.4 : i === 1 ? 7 : 2.2 * Math.exp(-i * 0.08), i === 1 ? cCyan : i === 0 ? cWhite : cGold, a * (i === 1 ? 0.5 : 1));
        }
        imp.dirty();
        // forest somas breathe with their pulses
        for (let i = 0; i < somaGlow.length; i++) { const g = somaGlow[i]; forestGlow.A[i] = 0.35 + 0.25 * Math.sin(t * 1.3 + g.seed * 5); }
        forestGlow.dirty();
      } else if (set === 2) {
        FN.value = 22; FF.value = 115; c = camSet2(t);
        // impulse arrives down the neck into the bouton
        const s = K(t, [[16.3, 0], [17.6, 42, 'lin']]);
        boutonMat.uniforms.uImp.value = s; boutonMat.uniforms.uImpAmp.value = t < 17.9 ? 1.4 : 0; boutonMat.uniforms.uTrail.value = 0.25 * (1 - smooth(18, 20, t));
        boutonMat.uniforms.uFlash.value = pulse(t, 17.7, 0.2, 1.4) * 0.35 + 0.18 * smooth(24.4, 25.2, t) * (1 - smooth(28, 30, t));
        const impP = V(0, 0, 0); { const k = clamp(s / neckRes.len, 0, 1); impP.copy(neckRes.curve.getPointAt(k)); }
        for (let i = 0; i < 10; i++) s2imp.set(i, impP.clone().add(V(0, i * 1.4, 0)), i === 0 ? 4.5 : 2.6, i === 0 ? cWhite : cCyan, t < 17.65 ? (i === 0 ? 1 : 0.5 * Math.exp(-i * 0.3)) : 0);
        s2imp.dirty();
        cleftMat.uniforms.uA.value = pulse(t, 21.7, 0.4, 1.2) * 0.9 + 0.12 * smooth(20.5, 22, t) * (1 - smooth(25, 27, t));
        // vesicles
        for (let i = 0; i < NV; i++) {
          const v = VES[i]; let p = v.p.clone(), sc = 1, glowA = 0.55;
          p.x += 0.35 * noise3(v.seed, t * 0.35, 0); p.y += 0.35 * noise3(0, v.seed, t * 0.35); p.z += 0.35 * noise3(t * 0.35, 0, v.seed);
          if (v.fuse) {
            const dock = smooth(v.fuse - 2.2, v.fuse - 0.35, t); p.y = lerp(p.y, 1.95, dock); p.x = lerp(p.x, v.p.x, dock); p.z = lerp(p.z, v.p.z, dock);
            const f = smooth(v.fuse - 0.05, v.fuse + 0.45, t); sc = 1 - f; glowA = 0.55 + pulse(t, v.fuse + 0.05, 0.1, 0.35) * 1.6;
            glowA *= 1 - smooth(v.fuse + 0.2, v.fuse + 0.9, t);
          }
          m4.compose(p, qq.identity(), V(sc, sc * (1 - 0.3 * (1 - sc)), sc)); ves.setMatrixAt(i, m4);
          vesCore.set(i, p, 1.8 + (v.fuse ? pulse(t, v.fuse + 0.05, 0.1, 0.35) * 5 : 0), cGold, glowA);
        }
        ves.instanceMatrix.needsUpdate = true; vesCore.dirty();
        // neurotransmitters
        for (let i = 0; i < NT; i++) {
          const d = NTD[i];
          if (t < d.r0) { nt.A[i] = 0; continue; }
          const F = VES[d.k].p; const e = E.out3(clamp((t - d.r0) / 1.7, 0, 1));
          const bp = V(F.x + Math.cos(d.th) * d.rho * e, lerp(1.6, d.yb, e), F.z + Math.sin(d.th) * d.rho * e);
          const wig = 0.45 * (1 - smooth(d.L - 0.6, d.L, t));
          bp.x += wig * noise3(d.s, t * 0.9, 1); bp.y += wig * 0.5 * noise3(2, d.s, t * 0.9); bp.z += wig * noise3(t * 0.9, 3, d.s);
          let a = 0.95 * smooth(d.r0, d.r0 + 0.1, t), col = cGold, size = d.size;
          if (d.toRec) {
            const st = d.r0 + 1.7; const b = E.io2(clamp((t - st) / (d.L - st), 0, 1));
            bp.lerp(REC[d.j].top, b);
            if (t > d.L) { const k = pulse(t, d.L + 0.05, 0.05, 0.5); col = tc.copy(cGold).lerp(cWhite, k); size = d.size * (1 + 1.4 * k); a = 1 - smooth(d.L + 0.8, d.L + 2.6, t); }
          } else a *= 1 - smooth(d.fadeAt, d.fadeAt + 1.4, t);
          nt.set(i, bp, size, col, a);
        }
        nt.dirty();
        // receptors light up, then the spine depolarises
        for (let i = 0; i < NR; i++) {
          const r = REC[i]; const k = smooth(r.on, r.on + 0.25, t) * (0.65 + 0.35 * pulse(t, r.on + 0.25, 0.01, 0.6));
          tc.copy(cVio).multiplyScalar(0.35).lerp(cGold, k); rec.setColorAt(i, tc);
          recGlow.set(i, r.p, 1.4 + 2.6 * k, cGold, 0.15 + 0.85 * k);
        }
        rec.instanceColor.needsUpdate = true; recGlow.dirty();
        const w = K(t, [[33.7, -2], [36.9, 75, 'in2']]);
        spineMat.uniforms.uImp.value = w; spineMat.uniforms.uImpAmp.value = t > 33.7 ? 1.3 : 0; spineMat.uniforms.uTrail.value = 0; spineMat.uniforms.uLit.value = t > 33.7 ? 0.35 : 0;
        spineMat.uniforms.uFlash.value = 0.25 * smooth(31, 33.5, t);
      } else {
        FN.value = 60; FF.value = 900; c = camSet3(t);
        const grow = smooth(45.2, 48.5, t);
        for (let i = 0; i < NODES.length; i++) {
          const n = NODES[i]; const f = t > n.a ? Math.exp(-(t - n.a) / 0.45) : 0; const lit = smooth(n.a - 0.05, n.a + 0.3, t);
          tc.copy(cDim).lerp(i % 3 ? cCyan : cVio, lit).lerp(cWhite, f * 0.8);
          nodesP.set(i, n.p, 1.6 + 2.6 * f + 0.8 * lit + 0.9 * grow, tc, 0.3 + 0.75 * lit + 0.8 * f);
        }
        nodesP.dirty();
        for (let k = 0; k < EDGES.length; k++) {
          const [i, j] = EDGES[k]; const A = NODES[i], B = NODES[j];
          const [a, b] = A.a < B.a ? [A, B] : [B, A];
          const lit = smooth(b.a - 0.1, b.a + 0.4, t);
          const fl = (t > a.a && t < b.a + 0.4) ? 1 : 0;
          const ca = tc.copy(cDim).lerp(k % 3 ? cCyan : cVio, lit);
          for (let q = 0; q < 2; q++) { EC[k * 6 + q * 3] = ca.r; EC[k * 6 + q * 3 + 1] = ca.g; EC[k * 6 + q * 3 + 2] = ca.b; EA[k * 2 + q] = 0.12 + 0.65 * lit + 0.4 * grow * lit; }
          // a spark travels each edge when the wave reaches it; later the links pulse with traffic (strengthening)
          let u = clamp((t - a.a) / Math.max(0.15, b.a - a.a), 0, 1); let fa = fl * (1 - u * 0.3);
          if (t > 45.4) { const ph = ((t - 45.4) * 0.7 + (k * 0.618) % 1) % 1; u = ph; fa = Math.max(fa, grow * 0.9); }
          tmp.copy(a.p).lerp(b.p, u);
          flow.set(k, tmp, 0.9 + 0.7 * grow, k % 2 ? cGold : cWhite, fa);
        }
        eg.attributes.aCol.needsUpdate = true; eg.attributes.aAlpha.needsUpdate = true; flow.dirty();
        for (let i = 0; i < NS; i++) {
          const s = SHELL[i]; const lit = smooth(s.a - 0.1, s.a + 0.6, t); const f = t > s.a ? Math.exp(-(t - s.a) / 0.6) : 0;
          tc.copy(cDim).lerp(i % 2 ? cVio : cCyan, lit).lerp(cWhite, f * 0.6);
          shell.set(i, s.p, 0.55 + 0.4 * f + 0.25 * grow, tc, 0.12 + 0.45 * lit + 0.5 * f + 0.15 * grow);
        }
        shell.dirty();
      }
      cam.fov = c.fov; cam.updateProjectionMatrix(); uScale.value = 1920 / (2 * Math.tan((c.fov * Math.PI) / 360));
      cam.position.copy(c.pos); cam.up.copy(up); cam.lookAt(c.look);
      cam.rotateZ(c.roll);
      renderer.render(scene, cam);
      // cheap bloom: blurred, contrast-boosted copy screened on top
      bctx.globalCompositeOperation = 'copy'; bctx.filter = 'blur(7px) brightness(1.15) contrast(1.6)';
      bctx.drawImage(canvas, 0, 0, bloomCanvas.width, bloomCanvas.height); bctx.filter = 'none';
    }
    // screen-space projection for labels
    const anchors = {
      pre: V(9.5, 11, 0).add(O2), post: V(10, -8.5, 0).add(O2), cleft: V(-8.6, 0.05, 0).add(O2), nt: V(-4.5, 0.4, 3).add(O2), rec: V(-3.2, -1.3, 3).add(O2),
      hero: HERO.clone(), axon: null,
    };
    function project(name, t) {
      let p = anchors[name]; if (name === 'axon') p = axPt(impS(t) - 4).add(V(2.2, 0, 0));
      const v = p.clone().project(cam); return { x: (v.x * 0.5 + 0.5) * 1080, y: (-v.y * 0.5 + 0.5) * 1920, vis: v.z < 1 };
    }
    return { renderAt, project };
  }
  window.SYN = { makeWorld };
})();
