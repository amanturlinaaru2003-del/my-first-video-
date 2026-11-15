/* worlds3d.js — the brain world (scene 2), the hormone world (scene 3) and the two hormone characters. */
(function () {
  const T3 = THREE, F = F3D, { K, E, rng, noise3, clamp, lerp, smooth, V3 } = F.util;
  const { ell, cap, roundedBox } = F.geo;

  function fresnelMat(color, power = 2.5, strength = 1) {
    return new T3.ShaderMaterial({ transparent: true, depthWrite: false, blending: T3.AdditiveBlending, uniforms: { c: { value: new T3.Color(color) }, p: { value: power }, s: { value: strength } },
      vertexShader: 'varying vec3 n; varying vec3 v; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); n=normalize(normalMatrix*normal); v=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }',
      fragmentShader: 'uniform vec3 c; uniform float p; uniform float s; varying vec3 n; varying vec3 v; void main(){ float f=pow(1.-abs(dot(n,v)),p)*s; gl_FragColor=vec4(c*f,f); }' });
  }
  function gradientSky(top, bottom, r = 150) {
    return new T3.Mesh(new T3.SphereGeometry(r, 32, 16), new T3.ShaderMaterial({ side: T3.BackSide, depthWrite: false, uniforms: { a: { value: new T3.Color(top) }, b: { value: new T3.Color(bottom) } },
      vertexShader: 'varying vec3 p; void main(){ p=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: `uniform vec3 a; uniform vec3 b; varying vec3 p; void main(){ float k=clamp(normalize(p).y*0.7+0.5,0.,1.); gl_FragColor=vec4(mix(b,a,k),1.); }` }));
  }
  function starShape(r1, r2, n = 5) { const s = new T3.Shape(); for (let i = 0; i <= n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2; const r = i % 2 ? r2 : r1; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); } return s; }
  F.starShape = starShape;

  // ---------------------------------------------------------------- melatonin: a sleepy lavender blob in a nightcap
  F.makeMela = function (env, size = 1) {
    const root = new T3.Group(), body = new T3.Group(); root.add(body); root.scale.setScalar(size);
    const g = new T3.SphereGeometry(1, 64, 48); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const k = y > 0 ? 1 - 0.18 * y * y : 1 + 0.08 * (1 - (1 + y) * (1 + y)); x *= k; z *= k; y *= y < 0 ? 0.82 : 1; p.setXYZ(i, x, y, z); }
    g.computeVertexNormals();
    const mat = F.phys(0x9daaf8, { roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.15, sheen: 0.25, sheenColor: new T3.Color(0x7d88d8), envMap: env, envMapIntensity: 0.8, emissive: new T3.Color(0x2a2f80), emissiveIntensity: 0.35 });
    const blob = new T3.Mesh(g, mat); blob.castShadow = true; body.add(blob);
    const halo = new T3.Mesh(new T3.SphereGeometry(1.08, 32, 24), fresnelMat(0xa9b8ff, 2.2, 1.2)); body.add(halo);
    // face
    const face = new T3.Group(); face.position.set(0, 0.05, 0.86); body.add(face);
    const sleepy = new T3.Group(); face.add(sleepy);
    const lidM = F.std(0x2a2a5a, { roughness: 0.5 });
    for (const s of [-1, 1]) { const a = new T3.Mesh(new T3.TorusGeometry(0.16, 0.035, 8, 24, Math.PI), lidM); a.position.set(0.34 * s, 0.05, 0.02); a.rotation.z = Math.PI; sleepy.add(a); }
    const awake = new T3.Group(); face.add(awake); awake.visible = false;
    for (const s of [-1, 1]) { const w = ell(0.2, 0.22, 0.12, F.phys(0xffffff, { roughness: 0.1, clearcoat: 1, envMap: env })); w.position.set(0.34 * s, 0.06, 0); awake.add(w); const pp = ell(0.08, 0.09, 0.06, F.std(0x14143a)); pp.position.set(0.34 * s, 0.05, 0.1); awake.add(pp); }
    for (const s of [-1, 1]) { const c = new T3.Mesh(new T3.CircleGeometry(0.15, 20), new T3.MeshBasicMaterial({ map: F.glowTex('#ff9ab8', 0.2), transparent: true, opacity: 0.7, depthWrite: false })); c.position.set(0.58 * s, -0.18, -0.05); c.lookAt(1.5 * s, -0.4, 3); face.add(c); }
    const mouth = ell(0.09, 0.04, 0.03, F.std(0x3b2050)); mouth.position.set(0, -0.26, 0.02); face.add(mouth);
    // moon emblem on the belly
    const moon = new T3.Mesh(new T3.TorusGeometry(0.16, 0.05, 10, 24, Math.PI * 1.25), F.std(0xf6e7a8, { emissive: new T3.Color(0xf6d76a), emissiveIntensity: 0.6 })); moon.position.set(0.1, -0.55, 0.82); moon.rotation.z = 2.3; body.add(moon);
    // nightcap
    const capG = new T3.Group(); capG.position.set(-0.1, 0.72, 0); body.add(capG);
    const cg = new T3.ConeGeometry(0.62, 1.4, 40, 16, true); const cp = cg.attributes.position; for (let i = 0; i < cp.count; i++) { const y = cp.getY(i) + 0.7; const k = y / 1.4; cp.setX(i, cp.getX(i) + k * k * 0.9); cp.setY(i, cp.getY(i) - k * k * 0.35); } cg.computeVertexNormals(); cg.translate(0, 0.7, 0);
    const capM = F.phys(0x2b3a92, { roughness: 0.7, sheen: 1, sheenColor: new T3.Color(0x7d8cff), side: T3.DoubleSide });
    const capMesh = new T3.Mesh(cg, capM); capG.add(capMesh);
    const band = new T3.Mesh(new T3.TorusGeometry(0.6, 0.11, 12, 40), F.phys(0xeef1ff, { roughness: 0.9, sheen: 1, sheenColor: new T3.Color(0xffffff) })); band.rotation.x = Math.PI / 2; capG.add(band);
    const pom = new T3.Mesh(new T3.ExtrudeGeometry(starShape(0.22, 0.1), { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), F.std(0xffe27a, { emissive: new T3.Color(0xffc93c), emissiveIntensity: 1.2 })); pom.position.set(0.95, 1.0, 0); capG.add(pom);
    // arms + wand
    const armM = mat;
    const armL = new T3.Group(); armL.position.set(-0.92, -0.15, 0.1); body.add(armL); const al = cap(0.13, 0.28, armM); al.rotation.z = 0.9; al.position.set(-0.12, -0.08, 0); armL.add(al);
    const armR = new T3.Group(); armR.position.set(0.92, -0.15, 0.1); body.add(armR); const ar = cap(0.13, 0.28, armM); ar.rotation.z = -0.9; ar.position.set(0.12, -0.08, 0); armR.add(ar);
    const wand = new T3.Group(); wand.position.set(0.3, -0.2, 0); armR.add(wand);
    const stick = cap(0.03, 0.8, F.std(0xe8d7a8, { metalness: 0.4, roughness: 0.3 })); stick.rotation.z = -0.6; stick.position.set(0.25, 0.35, 0); wand.add(stick);
    const star = new T3.Mesh(new T3.ExtrudeGeometry(starShape(0.22, 0.1), { depth: 0.06, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), F.std(0xfff0a0, { emissive: new T3.Color(0xffd84a), emissiveIntensity: 1.6 })); star.position.set(0.52, 0.72, 0); wand.add(star);
    const starGlow = F.sprite('#ffe27a', 1.2, 0.9, 0.3); starGlow.position.copy(star.position); wand.add(starGlow);
    const M = { root, body, sleepy, awake, mouth, capG, armL, armR, wand, star, blob, mat, starGlow };
    M.pose = function (t, o = {}) {
      const sq = Math.sin(t * 3.2) * 0.035; body.scale.set(1 + sq, 1 - sq, 1 + sq);
      capG.rotation.z = Math.sin(t * 2.4) * 0.12 + (o.capFly || 0);
      armL.rotation.z = Math.sin(t * 2.0) * 0.15; armR.rotation.z = (o.wave || 0) * Math.sin(t * 9) * 0.45 - 0.2;
      const y = o.yawn || 0; mouth.scale.set(0.09 * (1 + y * 0.6), 0.04 * (1 + y * 4), 0.03);
      sleepy.visible = !o.awake; awake.visible = !!o.awake;
      const d = o.dim || 0; mat.emissiveIntensity = 0.35 * (1 - d); mat.color.setRGB(lerp(0.616, 0.42, d), lerp(0.667, 0.45, d), lerp(0.973, 0.65, d));
      starGlow.material.opacity = 0.9 * (1 - d);
    };
    return M;
  };

  // ---------------------------------------------------------------- cortisol: a spiky, jittery spark
  function mouthTexAngry() { return F.canvasTex(256, 128, (ctx, w, h) => { ctx.fillStyle = '#4a0f0b'; ctx.beginPath(); ctx.moveTo(20, 30); ctx.quadraticCurveTo(128, 50, 236, 30); ctx.quadraticCurveTo(128, 140, 20, 30); ctx.fill(); ctx.save(); ctx.clip(); ctx.fillStyle = '#fffaf0'; ctx.fillRect(0, 20, w, 34); ctx.strokeStyle = '#d8c8b8'; ctx.lineWidth = 3; for (let x = 40; x < 230; x += 28) { ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x, 54); ctx.stroke(); } ctx.restore(); }); }
  F.makeCorti = function (env) {
    const root = new T3.Group(), body = new T3.Group(); root.add(body);
    const coreM = F.phys(0xff7a22, { roughness: 0.3, clearcoat: 1, envMap: env, envMapIntensity: 0.7, emissive: new T3.Color(0xff3a10), emissiveIntensity: 0.45 });
    const core = new T3.Mesh(new T3.SphereGeometry(1, 48, 32), coreM); core.castShadow = true; body.add(core);
    const ico = new T3.IcosahedronGeometry(1, 1); const vp = ico.attributes.position; const seen = new Set(); const dirs = [];
    for (let i = 0; i < vp.count; i++) { const v = V3(vp.getX(i), vp.getY(i), vp.getZ(i)).normalize(); const k = v.toArray().map((x) => x.toFixed(3)).join(); if (!seen.has(k)) { seen.add(k); dirs.push(v); } }
    const coneG = new T3.ConeGeometry(0.26, 0.75, 16); coneG.translate(0, 0.375, 0);
    const spikes = new T3.InstancedMesh(coneG, F.phys(0xff4a1a, { roughness: 0.3, clearcoat: 1, envMap: env, emissive: new T3.Color(0xc41b0b), emissiveIntensity: 0.5 }), dirs.length);
    const m4 = new T3.Matrix4(), q = new T3.Quaternion();
    dirs.forEach((d, i) => { q.setFromUnitVectors(V3(0, 1, 0), d); const len = d.y > 0.3 ? 1.15 : 0.95; m4.compose(d.clone().multiplyScalar(0.82), q, V3(1, len, 1)); spikes.setMatrixAt(i, m4); }); spikes.castShadow = true; body.add(spikes);
    body.add(new T3.Mesh(new T3.SphereGeometry(1.25, 32, 24), fresnelMat(0xff6a2a, 2, 1.3)));
    const face = new T3.Group(); face.position.set(0, 0.05, 0.92); body.add(face);
    for (const s of [-1, 1]) { const w = ell(0.24, 0.26, 0.12, F.phys(0xffffff, { roughness: 0.1, clearcoat: 1, envMap: env })); w.position.set(0.3 * s, 0.12, 0); face.add(w); const pp = ell(0.08, 0.09, 0.06, F.std(0x200807)); pp.position.set(0.28 * s, 0.1, 0.11); face.add(pp); pp.name = 'p' + s;
      const br = new T3.Mesh(roundedBox(0.36, 0.09, 0.08, 0.03), F.std(0x5a1410)); br.position.set(0.32 * s, 0.42, 0.06); br.rotation.z = -0.45 * s; face.add(br); }
    const mt = mouthTexAngry(); const mouth = new T3.Mesh(new T3.PlaneGeometry(0.75, 0.38), new T3.MeshBasicMaterial({ map: mt.tex, transparent: true })); mouth.position.set(0, -0.32, 0.08); face.add(mouth);
    const boltShape = new T3.Shape(); [[0, 0], [-0.25, -0.55], [0, -0.5], [-0.15, -1.0], [0.3, -0.35], [0.05, -0.38], [0.2, 0]].forEach(([x, y], i) => (i ? boltShape.lineTo(x, y) : boltShape.moveTo(x, y)));
    const bolt = new T3.Mesh(new T3.ExtrudeGeometry(boltShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 }), F.std(0xffe14d, { emissive: new T3.Color(0xffc800), emissiveIntensity: 1.4 })); bolt.position.set(0.05, 2.1, 0); bolt.scale.setScalar(0.9); body.add(bolt);
    // electric arcs (re-shaped every frame from a seeded jitter)
    const arcs = []; for (let i = 0; i < 4; i++) { const g = new T3.BufferGeometry(); g.setAttribute('position', new T3.BufferAttribute(new Float32Array(8 * 3), 3)); const l = new T3.Line(g, new T3.LineBasicMaterial({ color: 0xfff27a, transparent: true })); body.add(l); arcs.push(l); }
    const glow = F.sprite('#ff7a2a', 5, 0.55, 0.3); body.add(glow);
    const light = new T3.PointLight(0xff7a30, 8, 8, 1.6); body.add(light);
    const C = { root, body, face, arcs, light, glow };
    C.pose = function (t, o = {}) {
      const f = Math.floor(t * 24); const r = rng(f * 7 + 3);
      body.position.set((r() - 0.5) * 0.06, (r() - 0.5) * 0.06, 0);
      arcs.forEach((l, i) => { const a = (i / 4) * Math.PI * 2 + f * 0.3; const pos = l.geometry.attributes.position; for (let k = 0; k < 8; k++) { const rr = 1.5 + k * 0.12; pos.setXYZ(k, Math.cos(a + k * 0.08) * rr + (r() - 0.5) * 0.25, Math.sin(a + k * 0.08) * rr + (r() - 0.5) * 0.25, (r() - 0.5) * 0.3); } pos.needsUpdate = true; l.material.opacity = r() > 0.35 ? 1 : 0.15; });
      light.intensity = 6 + 4 * r(); glow.material.opacity = 0.45 + 0.2 * r();
    };
    return C;
  };

  // ======================================================================= scene 2: inside the head
  F.makeBrainWorld = function (canvas) {
    const renderer = F.renderer(canvas, { exposure: 1.15, shadows: false });
    const env = F.envMap(renderer, 0x8a7bd8, 0x0a0c24, 0xffd0f0);
    const scene = new T3.Scene(); scene.background = new T3.Color(0x050818); scene.fog = new T3.FogExp2(0x070b24, 0.022);
    const camera = new T3.PerspectiveCamera(40, 1080 / 1920, 0.05, 400);
    scene.add(new T3.HemisphereLight(0x8fa8ff, 0x1a0a2a, 1.0));
    const key = new T3.DirectionalLight(0xffe6f4, 1.6); key.position.set(4, 6, 8); scene.add(key);
    const rimL = new T3.DirectionalLight(0x6fd6ff, 1.4); rimL.position.set(-6, 2, -6); scene.add(rimL);
    const heatL = new T3.PointLight(0xff6a2a, 0, 14, 1.5); heatL.position.set(0, 0.5, 3); scene.add(heatL);
    // neural network
    const R = rng(21); const N = 260, nodes = [];
    for (let i = 0; i < N; i++) { let p; do { p = V3((R() - 0.5) * 30, (R() - 0.5) * 34, -12 + R() * 44); } while (Math.abs(p.x) < 4 && Math.abs(p.y) < 4 && p.z > -4 && p.z < 4); nodes.push(p); }
    const nodeMesh = new T3.InstancedMesh(new T3.SphereGeometry(1, 12, 8), new T3.MeshBasicMaterial({ color: 0x7fd8ff }), N);
    const m4 = new T3.Matrix4(); nodes.forEach((p, i) => { const k = 0.06 + R() * 0.1; m4.makeScale(k, k, k).setPosition(p); nodeMesh.setMatrixAt(i, m4); }); scene.add(nodeMesh);
    const edges = []; nodes.forEach((a, i) => { nodes.map((b, j) => [a.distanceTo(b), j]).sort((x, y) => x[0] - y[0]).slice(1, 3).forEach(([, j]) => { if (j > i) edges.push([i, j]); }); });
    const lp = new Float32Array(edges.length * 6); edges.forEach(([i, j], k) => { lp.set([nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z], k * 6); });
    const lg = new T3.BufferGeometry(); lg.setAttribute('position', new T3.BufferAttribute(lp, 3));
    scene.add(new T3.LineSegments(lg, new T3.LineBasicMaterial({ color: 0x3f6fd8, transparent: true, opacity: 0.45, blending: T3.AdditiveBlending, depthWrite: false })));
    const pulses = []; for (let i = 0; i < 46; i++) { const s = F.sprite(i % 3 ? '#9ff0ff' : '#ffb8f0', 0.55, 1, 0.3); scene.add(s); pulses.push({ s, e: edges[Math.floor(R() * edges.length)], sp: 0.4 + R() * 0.8, ph: R() }); }
    { const n = 1500, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) pos.set([(R() - 0.5) * 50, (R() - 0.5) * 60, -20 + R() * 60], i * 3); const g = new T3.BufferGeometry(); g.setAttribute('position', new T3.BufferAttribute(pos, 3));
      scene.add(new T3.Points(g, new T3.PointsMaterial({ color: 0x9fb8ff, size: 0.06, transparent: true, opacity: 0.7, depthWrite: false, blending: T3.AdditiveBlending }))); }
    // the brain
    const brain = new T3.Group(); scene.add(brain);
    const bg = new T3.SphereGeometry(1, 220, 160); const bp = bg.attributes.position;
    for (let i = 0; i < bp.count; i++) {
      const v = V3(bp.getX(i), bp.getY(i), bp.getZ(i)); const n = v.clone();
      let r = 1;
      const fis = Math.exp(-Math.pow(v.x / 0.07, 2)) * smooth(-0.3, 0.2, v.y); r -= 0.16 * fis;
      const nz = noise3(v.x * 3.1 + 7, v.y * 3.1, v.z * 3.1); r -= 0.09 * Math.pow(1 - Math.abs(nz), 7); r += 0.018 * noise3(v.x * 7, v.y * 7, v.z * 7);
      if (v.y < -0.25) r *= 1 - 0.25 * smooth(-0.25, -1, v.y);
      v.multiplyScalar(r); v.x *= 1.05; v.y *= 0.82; v.z *= 1.32;
      if (v.y < -0.1 && Math.abs(v.z) < 0.6) v.y += 0.12 * smooth(-0.1, -0.7, v.y) * (1 - Math.abs(v.z) / 0.6);
      bp.setXYZ(i, v.x * 1.6, v.y * 1.6, v.z * 1.6);
    }
    bg.computeVertexNormals();
    const brainM = F.phys(0xf2a3c6, { roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.25, sheen: 1, sheenColor: new T3.Color(0xff7fb8), sheenRoughness: 0.5, envMap: env, envMapIntensity: 0.6, emissive: new T3.Color(0x4a1033), emissiveIntensity: 0.4 });
    const brainMesh = new T3.Mesh(bg, brainM); brain.add(brainMesh);
    const cb = new T3.SphereGeometry(1, 96, 64); const cbp = cb.attributes.position; for (let i = 0; i < cbp.count; i++) { const y = cbp.getY(i); const k = 1 - 0.03 * Math.abs(Math.sin(y * 28)); cbp.setXYZ(i, cbp.getX(i) * k, y * k, cbp.getZ(i) * k); } cb.computeVertexNormals();
    const cereb = new T3.Mesh(cb, brainM.clone()); cereb.material.color.set(0xe48ab4); cereb.scale.set(0.95, 0.55, 0.62); cereb.position.set(0, -0.95, -1.5); brain.add(cereb);
    const stem = cap(0.28, 0.9, brainM.clone()); stem.material.color.set(0xd889b0); stem.position.set(0, -1.35, -0.75); stem.rotation.x = 0.35; brain.add(stem);
    const rimGlow = new T3.Mesh(bg, fresnelMat(0xff8fd0, 2.4, 1.1)); rimGlow.scale.setScalar(1.04); brain.add(rimGlow);
    const halo = F.sprite('#c48cff', 11, 0.6, 0.35); halo.position.z = -1.5; brain.add(halo);
    const heat = F.sprite('#ff7a3a', 11, 0, 0.35); heat.position.z = -1; brain.add(heat);
    // sparks racing along the surface
    const surf = (dir) => { const ray = new T3.Raycaster(dir.clone().multiplyScalar(6), dir.clone().negate()); const h = ray.intersectObject(brainMesh)[0]; return h ? h.point.add(h.face.normal.clone().multiplyScalar(0.03)) : dir.clone().multiplyScalar(1.6); };
    const sparkPaths = []; for (let i = 0; i < 22; i++) { let d = V3(R() - 0.5, R() * 0.8, R() - 0.5).normalize(); const ax = V3(R() - 0.5, R() - 0.5, R() - 0.5).normalize(); const pts = []; for (let k = 0; k < 14; k++) { pts.push(surf(d)); d.applyAxisAngle(ax, 0.11); d.y += (R() - 0.5) * 0.05; d.normalize(); } sparkPaths.push({ curve: new T3.CatmullRomCurve3(pts), sp: 0.35 + R() * 0.4, ph: R(), trail: [0, 1, 2, 3, 4].map((k) => { const s = F.sprite(k ? '#b8f6ff' : '#ffffff', 0.32 - k * 0.04, 1, 0.3); brain.add(s); return s; }) }); }
    // pineal glow (where the camera dives in the end)
    const pin = F.sprite('#fff3ff', 0.6, 0, 0.3); pin.position.set(0, -0.45, 1.2); brain.add(pin);
    // thoughts orbiting the brain
    const glossy = (c) => F.phys(c, { roughness: 0.2, clearcoat: 1, envMap: env, envMapIntensity: 0.8 });
    const cardTex = F.canvasTex(256, 320, (ctx, w, h) => { ctx.fillStyle = '#f8f6f0'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#5b7cfa'; ctx.fillRect(0, 0, w, 60); ctx.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { ctx.fillRect(30 + i * 52, 18, 26, 26); }
      for (let i = 0; i < 4; i++) { const y = 95 + i * 55; ctx.strokeStyle = '#5b7cfa'; ctx.lineWidth = 6; ctx.strokeRect(26, y, 30, 30); ctx.fillStyle = '#9aa3b8'; ctx.fillRect(72, y + 9, [140, 110, 125, 90][i], 12); if (i === 0) { ctx.strokeStyle = '#2bbf6a'; ctx.beginPath(); ctx.moveTo(30, y + 15); ctx.lineTo(40, y + 26); ctx.lineTo(58, y + 2); ctx.stroke(); } } });
    const todo = new T3.Group(); const card = new T3.Mesh(roundedBox(1.1, 1.4, 0.08, 0.04), glossy(0xf8f6f0)); todo.add(card);
    const cardFace = new T3.Mesh(new T3.PlaneGeometry(1.02, 1.3), new T3.MeshStandardMaterial({ map: cardTex.tex, roughness: 0.4 })); cardFace.position.z = 0.045; todo.add(cardFace);
    const badge = ell(0.16, 0.16, 0.08, glossy(0xff4a4a)); badge.position.set(0.5, 0.66, 0.06); todo.add(badge);
    const bub = (w, h) => { const s = new T3.Shape(); const r = 0.22; s.moveTo(-w / 2 + r, -h / 2); s.lineTo(-w / 2 + 0.55, -h / 2); s.lineTo(-w / 2 + 0.25, -h / 2 - 0.35); s.lineTo(-w / 2 + 0.8, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2); return new T3.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 4 }); };
    const talk = new T3.Group(); const b1 = new T3.Mesh(bub(1.5, 0.9), glossy(0xffffff)); talk.add(b1); const b2 = new T3.Mesh(bub(1.1, 0.7), glossy(0xd9ccff)); b2.position.set(0.7, -0.9, -0.2); b2.scale.x = -1; talk.add(b2);
    const dots = [-0.38, 0, 0.38].map((x) => { const d = ell(0.11, 0.11, 0.11, glossy(0x7a5af8)); d.position.set(x, 0, 0.22); talk.add(d); return d; });
    const storm = new T3.Group(); const cloudM = F.phys(0x5a6380, { roughness: 0.7, sheen: 1, sheenColor: new T3.Color(0x9aa6c8) });
    [[-0.6, 0, 0.45], [-0.1, 0.3, 0.6], [0.5, 0.05, 0.5], [0.05, -0.15, 0.55], [0.9, -0.2, 0.35], [-0.95, -0.2, 0.35]].forEach(([x, y, r]) => { const c = ell(r, r * 0.85, r, cloudM, 24); c.position.set(x, y, 0); storm.add(c); });
    const boltS = new T3.Shape(); [[0.05, 0], [-0.25, -0.6], [0.02, -0.55], [-0.18, -1.15], [0.35, -0.38], [0.08, -0.42], [0.25, 0]].forEach(([x, y], i) => (i ? boltS.lineTo(x, y) : boltS.moveTo(x, y)));
    const bolt = new T3.Mesh(new T3.ExtrudeGeometry(boltS, { depth: 0.06, bevelEnabled: false }), new T3.MeshBasicMaterial({ color: 0xffe14d })); bolt.position.set(0, -0.45, 0.2); storm.add(bolt);
    const flashL = new T3.PointLight(0xfff0a0, 0, 6, 1.5); flashL.position.set(0, -0.6, 0.8); storm.add(flashL);
    const rain = []; for (let i = 0; i < 9; i++) { const r = cap(0.015, 0.22, new T3.MeshBasicMaterial({ color: 0x8fb3ff, transparent: true, opacity: 0.7 }), 4); r.position.set(-0.8 + i * 0.2, -0.6, 0.1); storm.add(r); rain.push(r); }
    const thoughts = [{ g: todo, t0: 2.25, a0: 2.6 }, { g: talk, t0: 3.65, a0: 0.5 }, { g: storm, t0: 5.35, a0: 4.6 }];
    thoughts.forEach((o) => scene.add(o.g));
    const angle = (t, a0, t0) => { // integrate a speed that ramps up after 6.2 s
      const w0 = 0.55, w1 = 1.5; const s1 = Math.min(t, 6.2) - t0, s2 = clamp(t - 6.2, 0, 1), s3 = Math.max(0, t - 7.2);
      return a0 + w0 * Math.max(0, s1) + (t > 6.2 ? w0 * s2 + 0.5 * (w1 - w0) * s2 * s2 : 0) + w1 * s3;
    };
    const CAM = [[0, [0, 0.2, 30, 0, 0, 0]], [2.2, [0.3, 0.6, 10.8, 0, 0.1, 0], 'out3'], [6.2, [-0.6, 0.9, 9.6, 0, 0.1, 0], 'sine'], [9.4, [0.6, 0.2, 8.6, 0, 0, 0], 'sine'], [10.6, [0, -0.4, 1.35, 0, -0.45, 1.0], 'in3']];
    const W = { renderer, scene, camera };
    W.renderAt = function (t) {
      const c = K(t, CAM); camera.position.set(c[0], c[1], c[2]); camera.lookAt(c[3], c[4], c[5]); camera.fov = t < 9.4 ? 40 : lerp(40, 55, E.in2(clamp((t - 9.4) / 1.2, 0, 1))); camera.updateProjectionMatrix();
      brain.rotation.y = Math.sin(t * 0.35) * 0.35 + 0.25; brain.rotation.x = 0.12 + Math.sin(t * 0.5) * 0.04;
      const pulse = 1 + 0.015 * Math.sin(t * 4.5); brain.scale.setScalar(pulse * (t < 0.5 ? 0.6 : lerp(0.6, 1, E.out3(clamp((t - 0.5) / 1.6, 0, 1)))));
      const hot = smooth(6.3, 7.9, t);
      brainM.emissive.setRGB(lerp(0.29, 0.75, hot), lerp(0.06, 0.18, hot), lerp(0.2, 0.05, hot)); brainM.emissiveIntensity = 0.4 + 0.5 * hot;
      heat.material.opacity = 0.75 * hot; halo.material.opacity = 0.6 * (1 - hot * 0.5) + 0.1 * Math.sin(t * 3); heatL.intensity = 10 * hot;
      pulses.forEach((p) => { const k = (t * p.sp + p.ph) % 1; const a = nodes[p.e[0]], b = nodes[p.e[1]]; p.s.position.copy(a).lerp(b, k); p.s.material.opacity = Math.sin(k * Math.PI); });
      const sp = 1 + hot * 1.5;
      sparkPaths.forEach((s) => { s.trail.forEach((tr, k) => { const u = ((t * s.sp * sp + s.ph) - k * 0.025) % 1; tr.position.copy(s.curve.getPoint((u + 1) % 1)); tr.material.opacity = Math.sin(((u + 1) % 1) * Math.PI) * (1 - k * 0.18); }); });
      thoughts.forEach((o, i) => {
        const k = clamp((t - o.t0) / 0.6, 0, 1); o.g.visible = t > o.t0;
        const a = angle(t, o.a0, o.t0 + 0.6); const R0 = V3(Math.cos(a) * 1.9, 2.45 + Math.sin(a * 1.3 + i) * 0.35, Math.sin(a) * 1.9);
        o.g.position.copy(V3(0, 0, 0).lerp(R0, E.out3(k))); o.g.scale.setScalar(E.back(k) * 0.72); o.g.lookAt(camera.position); o.g.rotation.z += Math.sin(t * 2 + i) * 0.1;
      });
      dots.forEach((d, i) => { d.position.y = Math.max(0, Math.sin(t * 9 - i * 0.8)) * 0.15; });
      const fl = t > 5.8 ? (Math.floor((t - 5.8) / 0.62) % 1 === 0 && ((t - 5.8) % 0.62) < 0.18 ? 1 : 0) : 0; bolt.visible = fl > 0; flashL.intensity = fl * 8;
      rain.forEach((r, i) => { r.position.y = -0.55 - (((t * 1.6 + i * 0.37) % 1) * 0.6); });
      pin.material.opacity = smooth(9.3, 10.2, t); pin.scale.setScalar(0.6 + 6 * E.in3(clamp((t - 9.6) / 1.0, 0, 1)));
      renderer.render(scene, camera);
    };
    return W;
  };

  // ======================================================================= scene 3: melatonin and cortisol
  F.makeHormWorld = function (canvas) {
    const renderer = F.renderer(canvas, { exposure: 1.15, shadows: false });
    const env = F.envMap(renderer, 0x9a8cff, 0x120a30, 0xfff0d0);
    const scene = new T3.Scene(); scene.fog = new T3.FogExp2(0x1a1250, 0.028);
    scene.add(gradientSky(0x2a1d78, 0x0b0826));
    const camera = new T3.PerspectiveCamera(38, 1080 / 1920, 0.05, 400);
    scene.add(new T3.HemisphereLight(0xb8a8ff, 0x1a0f3a, 1.1));
    const key = new T3.DirectionalLight(0xfff0ff, 1.6); key.position.set(5, 8, 10); scene.add(key);
    const rimL = new T3.DirectionalLight(0x60e0ff, 1.3); rimL.position.set(-6, 3, -5); scene.add(rimL);
    const R = rng(33);
    // drifting cells
    const cells = []; for (let i = 0; i < 16; i++) { const g = new T3.Group(); const r = 0.6 + R() * 1.4; g.add(new T3.Mesh(new T3.SphereGeometry(r, 32, 24), fresnelMat([0x6fe3ff, 0xb58cff, 0xff8fcf][i % 3], 2.2, 0.9))); const nuc = ell(r * 0.28, r * 0.28, r * 0.28, F.std([0x3fb0d0, 0x8a5ad8, 0xd85aa0][i % 3], { emissive: new T3.Color([0x1a6080, 0x40207a, 0x701a50][i % 3]), emissiveIntensity: 0.6 })); nuc.position.set(r * 0.2, -r * 0.1, 0); g.add(nuc);
      g.position.set((R() - 0.5) * 22, (R() - 0.5) * 26, -6 - R() * 18); scene.add(g); cells.push({ g, ph: R() * 6, sp: 0.2 + R() * 0.3 }); }
    // molecules (ball-and-stick rings)
    const mols = []; const ballM = F.phys(0x9ff0ff, { roughness: 0.2, clearcoat: 1, envMap: env, emissive: new T3.Color(0x2a8aa8), emissiveIntensity: 0.4 }); const stickM = F.std(0xd8f6ff, { roughness: 0.4 });
    for (let i = 0; i < 6; i++) { const g = new T3.Group(); for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2, b = ((k + 1) / 6) * Math.PI * 2; const p = V3(Math.cos(a) * 0.6, Math.sin(a) * 0.6, 0), q = V3(Math.cos(b) * 0.6, Math.sin(b) * 0.6, 0); const s = ell(0.14, 0.14, 0.14, ballM, 16); s.position.copy(p); g.add(s); const st = new T3.Mesh(new T3.CylinderGeometry(0.04, 0.04, p.distanceTo(q), 8), stickM); st.position.copy(p).add(q).multiplyScalar(0.5); st.quaternion.setFromUnitVectors(V3(0, 1, 0), q.clone().sub(p).normalize()); g.add(st); }
      g.position.set((R() - 0.5) * 12, (R() - 0.5) * 16, -3 - R() * 8); scene.add(g); mols.push({ g, sp: (R() - 0.5) * 1.2 }); }
    { const n = 600, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) pos.set([(R() - 0.5) * 40, (R() - 0.5) * 50, -25 + R() * 30], i * 3); const g = new T3.BufferGeometry(); g.setAttribute('position', new T3.BufferAttribute(pos, 3)); scene.add(new T3.Points(g, new T3.PointsMaterial({ color: 0xd8c8ff, size: 0.08, transparent: true, opacity: 0.8, depthWrite: false, blending: T3.AdditiveBlending }))); }
    // pineal gland: a glowing golden pinecone
    const gland = new T3.Group(); gland.position.set(0, -3.1, 0); scene.add(gland);
    const scaleG = new T3.SphereGeometry(1, 16, 12); const nS = 120; const scales = new T3.InstancedMesh(scaleG, F.phys(0xe6a85a, { roughness: 0.35, clearcoat: 0.8, envMap: env, emissive: new T3.Color(0x8a4a10), emissiveIntensity: 0.35 }), nS);
    { const m4 = new T3.Matrix4(), q = new T3.Quaternion(); for (let i = 0; i < nS; i++) { const y = -0.95 + (i / nS) * 1.9; const r = Math.sqrt(Math.max(0, 1 - y * y)) * 0.75 * (1 - 0.15 * y); const a = i * 2.39996; const p = V3(Math.cos(a) * r, y * 1.15, Math.sin(a) * r); q.setFromUnitVectors(V3(0, 0, 1), V3(p.x, 0.4, p.z).normalize()); m4.compose(p, q, V3(0.2, 0.15, 0.08)); scales.setMatrixAt(i, m4); } }
    gland.add(scales); gland.add(ell(0.62, 0.95, 0.62, F.std(0xc07a3a))); const gGlow = F.sprite('#ffcf7a', 6, 0.6, 0.3); gland.add(gGlow); const gl = new T3.PointLight(0xffc070, 6, 8, 1.5); gland.add(gl);
    // characters
    const mela = F.makeMela(env, 1); scene.add(mela.root);
    const corti = F.makeCorti(env); scene.add(corti.root);
    const dust = []; for (let i = 0; i < 26; i++) { const s = F.sprite('#fff2a8', 0.35, 0, 0.25); scene.add(s); dust.push({ s, dx: (R() - 0.5) * 2.6, dy: -1.5 - R() * 2.5, d: i * 0.17 }); }
    const zapG = new T3.BufferGeometry(); zapG.setAttribute('position', new T3.BufferAttribute(new Float32Array(10 * 3), 3)); const zap = new T3.Line(zapG, new T3.LineBasicMaterial({ color: 0xfff27a, transparent: true, opacity: 0 })); scene.add(zap);
    const zapGlow = F.sprite('#fff27a', 3, 0, 0.3); scene.add(zapGlow);
    const CAM = [[0, [0, -2.2, 9.5, 0, -2.6, 0]], [3.0, [-0.3, 0.2, 11, -0.4, -0.2, 0], 'io2'], [5.2, [0.2, 0.3, 11.5, -0.1, 0, 0], 'sine'], [5.6, [0.6, 0.3, 12.5, 0.4, 0, 0], 'out3'], [8.4, [0.2, 0.3, 12.5, 0, 0, 0], 'sine'], [10.0, [-4.5, 0.3, 12.5, -5.5, 0, 0], 'io2'], [10.6, [-12, 0.3, 12.5, -14, 0, 0], 'in3']];
    const MELA = [[0, [0, -3.1, 0, 0.1]], [0.55, [0, -3.1, 0, 0.1]], [1.65, [-0.35, -0.9, 0.4, 1.0], 'back'], [3.85, [-0.9, 0.9, 0.2, 1.0], 'sine'], [5.7, [-1.1, 0.8, 0.2, 1.0], 'sine'], [7.3, [-1.6, 0.6, 0.2, 0.92], 'io2'], [8.4, [-1.7, 0.5, 0.2, 0.92]], [9.6, [-9, 0.7, 0.2, 0.85], 'in3']];
    const CORTI = [[0, [9, 0.6, 0, 1]], [5.3, [9, 0.6, 0, 1]], [5.85, [1.6, 0.6, 0.3, 1], 'expo'], [6.55, [1.6, 0.6, 0.3, 1]], [7.1, [1.5, 0.7, 0.3, 1.3], 'back'], [8.75, [1.5, 0.7, 0.3, 1.3]], [10.05, [-7, 0.7, 0.3, 1.15], 'in2']];
    const W = { renderer, scene, camera, mela, corti };
    W.renderAt = function (t) {
      const c = K(t, CAM); const shake = t > 5.4 && t < 5.75 ? Math.sin(t * 90) * 0.06 : 0; camera.position.set(c[0] + shake, c[1] + shake, c[2]); camera.lookAt(c[3], c[4], c[5]); camera.updateProjectionMatrix();
      cells.forEach((o, i) => { o.g.position.y += 0; o.g.rotation.y = t * o.sp; o.g.position.x += Math.sin(t * o.sp + o.ph) * 0.004; });
      mols.forEach((o) => { o.g.rotation.set(t * o.sp * 0.6, t * o.sp, 0); });
      gland.rotation.y = t * 0.4; gGlow.material.opacity = 0.5 + 0.15 * Math.sin(t * 4);
      const m = K(t, MELA); mela.root.position.set(m[0], m[1], m[2]); mela.root.scale.setScalar(m[3]); mela.root.rotation.z = Math.sin(t * 1.3) * 0.08 - (t > 8.4 ? 0.3 : 0); mela.root.rotation.y = Math.sin(t * 0.9) * 0.2;
      const yawn = smooth(1.9, 2.25, t) * (1 - smooth(2.6, 3.0, t));
      mela.pose(t, { yawn, wave: smooth(2.4, 2.6, t) * (1 - smooth(7.2, 7.5, t)), awake: t > 7.55, capFly: t > 7.55 ? -0.6 * E.back(clamp((t - 7.55) / 0.3, 0, 1)) : 0 });
      if (t > 7.55 && t < 7.7) mela.body.scale.set(0.85, 1.2, 0.85);
      const co = K(t, CORTI); corti.root.position.set(co[0], co[1], co[2]); corti.root.scale.setScalar(co[3]); corti.root.rotation.z = t > 8.75 ? 0.35 : -0.1 + Math.sin(t * 3) * 0.05; corti.pose(t); corti.root.visible = t > 5.25;
      // stardust from the wand
      mela.wand.updateMatrixWorld(true); const wp = V3(0.52, 0.72, 0).applyMatrix4(mela.wand.matrixWorld);
      dust.forEach((d) => { const k = clamp((t - 2.5 - d.d) / 1.6, 0, 1); const on = t < 7.6; d.s.position.copy(wp).add(V3(d.dx * k, d.dy * k * 0.8, 0.3)); d.s.material.opacity = on && k > 0 && k < 1 ? Math.sin(k * Math.PI) : 0; d.s.scale.setScalar(0.4 * (1 - k * 0.5)); });
      // the zap
      const z = t > 7.4 && t < 7.75 ? (Math.floor(t * 30) % 2 ? 1 : 0.3) : 0; zap.material.opacity = z; zapGlow.material.opacity = z * 0.8;
      if (z) { const a = corti.root.position.clone().add(V3(-0.8, 0, 0.5)), b = mela.root.position.clone().add(V3(0.6, 0, 0.5)); const r = rng(Math.floor(t * 30)); const pos = zapG.attributes.position; for (let k = 0; k < 10; k++) { const p = a.clone().lerp(b, k / 9); if (k && k < 9) p.add(V3(0, (r() - 0.5) * 0.6, (r() - 0.5) * 0.3)); pos.setXYZ(k, p.x, p.y, p.z); } pos.needsUpdate = true; zapGlow.position.copy(a.clone().lerp(b, 0.5)); }
      renderer.render(scene, camera);
    };
    return W;
  };
})();
