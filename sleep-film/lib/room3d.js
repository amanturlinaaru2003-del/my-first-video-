/* room3d.js — the bedroom, the boy's acting and the camera, keyed in FILM time (seconds 0–50).
 * Scenes s1, s4, s5, s6 all render this one world, so every cut between them is seamless. */
(function () {
  const T3 = THREE, F = F3D, { K, E, rng, noise3, clamp, lerp, smooth, V3 } = F.util;
  const { ell, cap, roundedBox } = F.geo;

  function plankTex() {
    return F.canvasTex(1024, 1024, (ctx, w, h) => {
      ctx.fillStyle = '#3a2a22'; ctx.fillRect(0, 0, w, h); const r = rng(3);
      for (let i = 0; i < 8; i++) { ctx.fillStyle = `hsl(20,${25 + r() * 10}%,${16 + r() * 6}%)`; ctx.fillRect(i * 128, 0, 126, h); for (let k = 0; k < 40; k++) { ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.beginPath(); const x = i * 128 + r() * 126; ctx.moveTo(x, 0); ctx.bezierCurveTo(x + 6, h * 0.3, x - 6, h * 0.6, x + 3, h); ctx.stroke(); } }
    });
  }
  function wallTex() {
    return F.canvasTex(512, 512, (ctx, w, h) => { const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a5f7c'); g.addColorStop(1, '#1b4459'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 0.1; for (let x = 0; x < w; x += 32) { ctx.fillStyle = '#0d2a3a'; ctx.fillRect(x, 0, 3, h); } });
  }
  function clockTex() { return F.canvasTex(512, 256, (ctx, w, h, txt = '02:47') => { ctx.fillStyle = '#07090c'; ctx.fillRect(0, 0, w, h); ctx.font = 'bold 170px "DejaVu Sans Mono", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = '#ff2a2a'; ctx.shadowBlur = 30; ctx.fillStyle = '#ff4a3d'; ctx.fillText(txt, w / 2, h / 2 + 8); }); }
  function feedTex() {
    return F.canvasTex(256, 1536, (ctx, w, h) => {
      ctx.fillStyle = '#0d1b33'; ctx.fillRect(0, 0, w, h); const cols = ['#ff6b8b', '#ffd166', '#06d6a0', '#7aa2ff', '#c77dff', '#ff9f43']; const r = rng(31);
      for (let i = 0; i < 22; i++) { const y = 10 + i * 70; ctx.fillStyle = cols[i % 6]; ctx.beginPath(); ctx.roundRect(14, y, w - 28, 60, 10); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(36, y + 18, 9, 0, 7); ctx.fill(); ctx.fillRect(54, y + 12, 60 + r() * 80, 10); ctx.fillRect(28, y + 38, 120 + r() * 70, 8); }
    });
  }
  function moonTex() {
    return F.canvasTex(512, 256, (ctx, w, h) => { ctx.fillStyle = '#f2ead0'; ctx.fillRect(0, 0, w, h); const r = rng(8); for (let i = 0; i < 60; i++) { const x = r() * w, y = r() * h, s = 4 + r() * 22; ctx.fillStyle = `rgba(170,160,130,${0.25 + r() * 0.35})`; ctx.beginPath(); ctx.ellipse(x, y, s, s * 0.8, 0, 0, 7); ctx.fill(); } });
  }

  F.makeRoom = function (canvas) {
    const renderer = F.renderer(canvas, { exposure: 1.25 });
    const env = F.envMap(renderer, 0x5d86b8, 0x10202e, 0xffd9b0);
    const scene = new T3.Scene(); scene.background = new T3.Color(0x08131d);
    const camera = new T3.PerspectiveCamera(30, 1080 / 1920, 0.05, 400);
    const W = {}; // handles

    // ---- floor + walls (with a real window opening)
    const pt = plankTex(); pt.tex.wrapS = pt.tex.wrapT = T3.RepeatWrapping; pt.tex.repeat.set(3, 3);
    const floor = new T3.Mesh(new T3.PlaneGeometry(40, 40), F.std(0xffffff, { map: pt.tex, roughness: 0.75 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const wt = wallTex(); wt.tex.wrapS = wt.tex.wrapT = T3.RepeatWrapping; wt.tex.repeat.set(4, 2);
    const wallM = F.std(0xffffff, { map: wt.tex, roughness: 0.95 });
    const WZ = -8.6, wx0 = 2.6, wx1 = 6.4, wy0 = 4.7, wy1 = 8.5;
    const wallBox = (x0, x1, y0, y1) => { const m = new T3.Mesh(new T3.BoxGeometry(x1 - x0, y1 - y0, 0.3), wallM); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, WZ); m.receiveShadow = true; scene.add(m); };
    wallBox(-20, wx0, 0, 20); wallBox(wx1, 20, 0, 20); wallBox(wx0, wx1, 0, wy0); wallBox(wx0, wx1, wy1, 20);
    const sideWall = new T3.Mesh(new T3.PlaneGeometry(30, 20), wallM); sideWall.position.set(-9.5, 10, 0); sideWall.rotation.y = Math.PI / 2; scene.add(sideWall);
    const frameM = F.std(0x2a2f3a, { roughness: 0.6 });
    const fb = (w, h, x, y) => { const m = new T3.Mesh(new T3.BoxGeometry(w, h, 0.45), frameM); m.position.set(x, y, WZ + 0.05); scene.add(m); };
    fb(wx1 - wx0 + 0.3, 0.18, (wx0 + wx1) / 2, wy0); fb(wx1 - wx0 + 0.3, 0.18, (wx0 + wx1) / 2, wy1); fb(0.18, wy1 - wy0, wx0, (wy0 + wy1) / 2); fb(0.18, wy1 - wy0, wx1, (wy0 + wy1) / 2);
    fb(0.08, wy1 - wy0, (wx0 + wx1) / 2, (wy0 + wy1) / 2); fb(wx1 - wx0, 0.08, (wx0 + wx1) / 2, (wy0 + wy1) / 2 + 0.3);
    const sill = new T3.Mesh(new T3.BoxGeometry(wx1 - wx0 + 0.8, 0.14, 0.7), F.std(0x3b4656)); sill.position.set((wx0 + wx1) / 2, wy0 - 0.12, WZ + 0.3); scene.add(sill);
    // curtains
    W.curtains = [];
    for (const s of [0, 1]) {
      const g = new T3.PlaneGeometry(1.5, 4.6, 24, 8); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 7) * 0.12); g.computeVertexNormals();
      const c = new T3.Mesh(g, F.std(0x2f6378, { roughness: 0.9, side: T3.DoubleSide })); c.position.set(s ? wx1 + 0.5 : wx0 - 0.5, (wy0 + wy1) / 2 + 0.1, WZ + 0.4); c.castShadow = true; scene.add(c); W.curtains.push(c);
    }
    // ---- outside: sky dome, stars, moon, clouds
    const sky = new T3.Mesh(new T3.SphereGeometry(180, 32, 16), new T3.ShaderMaterial({ side: T3.BackSide, depthWrite: false,
      uniforms: { a: { value: new T3.Color(0x050b1f) }, b: { value: new T3.Color(0x1c3d70) } },
      vertexShader: 'varying vec3 p; void main(){ p=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: 'uniform vec3 a; uniform vec3 b; varying vec3 p; void main(){ float k=clamp(normalize(p).y*1.2+0.35,0.,1.); gl_FragColor=vec4(mix(b,a,k),1.); }' }));
    sky.position.set(0, 0, -20); scene.add(sky);
    { const R = rng(17); const n = 900, pos = new Float32Array(n * 3), ph = new Float32Array(n); for (let i = 0; i < n; i++) { const u = R() * 0.9 + 0.05, th = R() * Math.PI * 2; const r = 150, y = u * r, rr = Math.sqrt(r * r - y * y); pos.set([Math.cos(th) * rr, y - 20, Math.sin(th) * rr - 20], i * 3); ph[i] = R() * 6.28; }
      const g = new T3.BufferGeometry(); g.setAttribute('position', new T3.BufferAttribute(pos, 3)); g.setAttribute('ph', new T3.BufferAttribute(ph, 1));
      W.starMat = new T3.ShaderMaterial({ transparent: true, depthWrite: false, blending: T3.AdditiveBlending, uniforms: { t: { value: 0 } },
        vertexShader: 'attribute float ph; uniform float t; varying float a; void main(){ a=0.55+0.45*sin(t*2.2+ph*3.); vec4 mv=modelViewMatrix*vec4(position,1.); gl_PointSize=2.2+2.*fract(ph); gl_Position=projectionMatrix*mv; }',
        fragmentShader: 'varying float a; void main(){ vec2 c=gl_PointCoord-.5; float d=length(c); gl_FragColor=vec4(vec3(1.),a*smoothstep(.5,0.,d)); }' });
      scene.add(new T3.Points(g, W.starMat)); }
    const mt = moonTex();
    W.moon = new T3.Mesh(new T3.SphereGeometry(5, 48, 32), new T3.MeshBasicMaterial({ map: mt.tex, color: 0xfff6dc })); W.moon.position.set(16, 24, -78); scene.add(W.moon);
    W.moonGlow = F.sprite('#fff1c8', 42, 0.75, 0.25); W.moonGlow.position.copy(W.moon.position); scene.add(W.moonGlow);
    W.clouds = []; { const R = rng(4); for (let i = 0; i < 9; i++) { const c = F.sprite('#6d8fc4', 18 + R() * 16, 0.22, 0.6); c.material.blending = T3.NormalBlending; c.position.set(-20 + R() * 50, 6 + R() * 18, -45 - R() * 40); c.scale.y *= 0.35; scene.add(c); W.clouds.push(c); } }

    // ---- bed
    const woodM = F.std(0x4a3022, { roughness: 0.55, envMap: env, envMapIntensity: 0.3 });
    const frame = new T3.Mesh(roundedBox(6.6, 0.6, 9.2, 0.12), woodM); frame.position.set(0, 0.6, -3.8); frame.castShadow = frame.receiveShadow = true; scene.add(frame);
    const mat = new T3.Mesh(roundedBox(6.4, 0.8, 9.0, 0.3), F.std(0x2a8b92, { roughness: 0.85 })); mat.position.set(0, 1.25, -3.8); mat.castShadow = mat.receiveShadow = true; scene.add(mat);
    // crumpled duvet
    { const g = new T3.PlaneGeometry(6.8, 8.2, 90, 100); const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); let z = 0.12 * noise3(x * 0.6, y * 0.6, 1) + 0.06 * noise3(x * 1.7, y * 1.7, 4) + 0.15; const edge = Math.max(0, Math.abs(x) - 3.05); z -= edge * edge * 3.5; p.setZ(i, z); }
      g.computeVertexNormals(); const d = new T3.Mesh(g, F.phys(0x2c9aa0, { roughness: 0.8, sheen: 0.6, sheenColor: new T3.Color(0x7de0e0) })); d.rotation.x = -Math.PI / 2; d.position.set(0, 1.62, -4.4); d.receiveShadow = true; d.castShadow = true; scene.add(d);
      const lip = new T3.Mesh(new T3.CylinderGeometry(0.35, 0.35, 6.6, 24, 1, false, 0, Math.PI), d.material); lip.rotation.z = Math.PI / 2; lip.rotation.y = 0; lip.position.set(0, 1.48, -0.3); lip.scale.set(1, 1, 0.7); scene.add(lip); }
    // pillows
    const pilM = F.phys(0x8fd3cf, { roughness: 0.85, sheen: 0.8, sheenColor: new T3.Color(0xd8ffff) });
    for (const s of [-1, 1]) { const g = roundedBox(2.9, 0.9, 1.5, 0.42, 6); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setY(i, y * (1 - 0.35 * Math.pow(Math.abs(x) / 1.45, 2))); } g.computeVertexNormals();
      const m = new T3.Mesh(g, pilM); m.position.set(1.55 * s, 2.15, -7.3); m.rotation.set(-0.35, 0.05 * s, 0.04 * s); m.castShadow = m.receiveShadow = true; scene.add(m); }
    // headboard
    const hb = new T3.Mesh(roundedBox(7.0, 3.6, 0.4, 0.15), woodM); hb.position.set(0, 2.9, -8.3); hb.castShadow = hb.receiveShadow = true; scene.add(hb);
    const rail = new T3.Mesh(roundedBox(7.4, 0.35, 0.6, 0.15), F.std(0x5c3d2b, { roughness: 0.5 })); rail.position.set(0, 4.75, -8.25); scene.add(rail);
    for (let i = -3; i <= 3; i++) { const g = new T3.Mesh(new T3.BoxGeometry(0.05, 3.0, 0.05), F.std(0x2a1a12)); g.position.set(i * 0.95, 2.9, -8.08); scene.add(g); }

    // ---- side tables, lamp, mug, clock, phone
    const tableM = F.std(0x3d2a20, { roughness: 0.6 });
    const mkTable = (x) => { const t = new T3.Mesh(roundedBox(1.5, 2.0, 1.2, 0.08), tableM); t.position.set(x, 1.0, 1.75); t.castShadow = t.receiveShadow = true; scene.add(t);
      const top = new T3.Mesh(roundedBox(1.62, 0.12, 1.32, 0.05), F.std(0x5a3d2d, { roughness: 0.45, envMap: env, envMapIntensity: 0.3 })); top.position.set(x, 2.05, 1.75); top.receiveShadow = true; scene.add(top);
      const dr = new T3.Mesh(new T3.BoxGeometry(1.2, 0.5, 0.05), F.std(0x2f2018)); dr.position.set(x, 1.4, 2.36); scene.add(dr); const kn = ell(0.06, 0.06, 0.06, F.std(0xb08a50, { metalness: 0.6, roughness: 0.3 })); kn.position.set(x, 1.4, 2.4); scene.add(kn); };
    mkTable(-2.55); mkTable(2.55);
    const TOP = 2.11;
    // lamp (left)
    W.lamp = new T3.Group(); W.lamp.position.set(-2.9, TOP, 1.55); scene.add(W.lamp);
    const lb = ell(0.32, 0.36, 0.32, F.phys(0x3b2b25, { roughness: 0.3, clearcoat: 0.6, envMap: env })); lb.position.y = 0.34; W.lamp.add(lb);
    const ls = cap(0.04, 0.6, F.std(0xc9a46a, { metalness: 0.7, roughness: 0.3 })); ls.position.y = 0.95; W.lamp.add(ls);
    W.shadeM = F.std(0xf3dfb5, { roughness: 0.8, side: T3.DoubleSide, emissive: new T3.Color(0xffb35a), emissiveIntensity: 0 });
    const shade = new T3.Mesh(new T3.CylinderGeometry(0.42, 0.62, 0.7, 32, 1, true), W.shadeM); shade.position.y = 1.45; W.lamp.add(shade);
    W.button = ell(0.07, 0.04, 0.07, F.std(0xd8c49a, { metalness: 0.4, roughness: 0.4 })); W.button.position.set(0.24, 0.6, 0.2); W.lamp.add(W.button);
    W.lampLight = new T3.PointLight(0xffb05a, 0, 16, 1.6); W.lampLight.position.set(-2.9, TOP + 1.4, 1.55); scene.add(W.lampLight);
    W.lampGlow = F.sprite('#ffc27a', 3.2, 0.0, 0.3); W.lampGlow.position.copy(W.lampLight.position); scene.add(W.lampGlow);
    // mug (left table, nearer the boy)
    W.mug = new T3.Group(); scene.add(W.mug);
    const mugM = F.phys(0xece6da, { roughness: 0.25, clearcoat: 0.8, envMap: env, envMapIntensity: 0.6 });
    const mb = new T3.Mesh(new T3.CylinderGeometry(0.17, 0.15, 0.36, 28), mugM); mb.position.y = 0.18; mb.castShadow = true; W.mug.add(mb);
    const coffee = new T3.Mesh(new T3.CircleGeometry(0.15, 24), F.std(0x3b1f12, { roughness: 0.2 })); coffee.rotation.x = -Math.PI / 2; coffee.position.y = 0.33; W.mug.add(coffee);
    const handle = new T3.Mesh(new T3.TorusGeometry(0.09, 0.028, 10, 20, Math.PI * 1.2), mugM); handle.position.set(0.19, 0.19, 0); handle.rotation.z = -Math.PI * 0.6; W.mug.add(handle);
    W.steam = []; for (let i = 0; i < 3; i++) { const s = F.sprite('#e8f2ff', 0.25, 0.25, 0.6); s.material.blending = T3.NormalBlending; W.mug.add(s); W.steam.push(s); }
    // clock (right)
    W.clockTex = clockTex();
    const clock = new T3.Group(); clock.position.set(2.75, TOP, 1.7); clock.rotation.y = -0.35; scene.add(clock);
    const cb = new T3.Mesh(roundedBox(1.05, 0.58, 0.42, 0.1), F.phys(0x1a1d24, { roughness: 0.35, clearcoat: 0.5, envMap: env })); cb.position.y = 0.3; cb.castShadow = true; clock.add(cb);
    const face = new T3.Mesh(new T3.PlaneGeometry(0.88, 0.44), new T3.MeshBasicMaterial({ map: W.clockTex.tex, toneMapped: false })); face.position.set(0, 0.3, 0.215); clock.add(face);
    W.clockLight = new T3.PointLight(0xff3b30, 0.6, 3, 2); W.clockLight.position.set(2.7, TOP + 0.4, 2.2); scene.add(W.clockLight);
    W.clockFace = face;
    // phone
    W.feed = feedTex(); W.feed.tex.wrapT = T3.RepeatWrapping; W.feed.tex.repeat.set(1, 0.25);
    W.phone = new T3.Group(); scene.add(W.phone);
    const pb = new T3.Mesh(roundedBox(0.42, 0.8, 0.05, 0.03), F.phys(0x16191f, { roughness: 0.3, clearcoat: 1, envMap: env })); pb.castShadow = true; W.phone.add(pb);
    W.screenM = new T3.MeshBasicMaterial({ map: W.feed.tex, toneMapped: false, color: 0xffffff });
    W.screen = new T3.Mesh(new T3.PlaneGeometry(0.37, 0.74), W.screenM); W.screen.position.z = 0.028; W.phone.add(W.screen);
    W.phoneLight = new T3.PointLight(0x6fb8ff, 0, 5, 1.8); scene.add(W.phoneLight);
    // light rays from the phone to the eyes (blue light)
    W.rays = new T3.Mesh(new T3.ConeGeometry(0.55, 1.8, 24, 1, true), new T3.MeshBasicMaterial({ color: 0x7cc4ff, transparent: true, opacity: 0, blending: T3.AdditiveBlending, depthWrite: false, side: T3.DoubleSide })); scene.add(W.rays);

    // ---- the boy
    const B = F.makeBoy(env); W.boy = B; B.root.position.set(0, 1.72, 0.55); scene.add(B.root);
    // thought bubble with a tiny melatonin inside (scene 4)
    W.bubble = new T3.Group(); scene.add(W.bubble);
    W.bubble.add(new T3.Mesh(new T3.SphereGeometry(0.75, 32, 24), F.phys(0xbfd4ff, { roughness: 0.05, transparent: true, opacity: 0.18, clearcoat: 1, envMap: env, depthWrite: false })));
    W.miniMela = F.makeMela ? F.makeMela(env, 0.45) : null; if (W.miniMela) W.bubble.add(W.miniMela.root);
    W.bubDots = [0.16, 0.26].map((r) => { const m = new T3.Mesh(new T3.SphereGeometry(r, 16, 12), W.bubble.children[0].material); scene.add(m); return m; });
    // caffeine sparks + worry swirl + floating thoughts
    W.sparks = [0, 1, 2, 3].map(() => { const s = F.sprite('#ffe36b', 0.5, 0, 0.3); scene.add(s); return s; });
    { const pts = []; for (let i = 0; i <= 120; i++) { const a = i / 120 * Math.PI * 6, r = 0.15 + i / 120 * 0.45; pts.push(V3(Math.cos(a) * r, i / 120 * 0.2, Math.sin(a) * r * 0.5)); }
      W.swirl = new T3.Mesh(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 240, 0.03, 8), new T3.MeshBasicMaterial({ color: 0xc8d4ff, transparent: true, opacity: 0.9 })); scene.add(W.swirl); }
    W.floaters = []; { const cols = ['#ffffff', '#b8c6ff', '#ffd7a8']; for (let i = 0; i < 7; i++) { const s = F.sprite(cols[i % 3], 0.35, 0, 0.5); scene.add(s); W.floaters.push(s); } }
    W.zz = [0, 1, 2].map(() => { const s = F.sprite('#cfe3ff', 0.3, 0, 0.5); scene.add(s); return s; });

    // ---- lights
    const hemi = new T3.HemisphereLight(0x4f86b5, 0x0b1622, 1.15); scene.add(hemi);
    const moonL = new T3.DirectionalLight(0x9cc4ff, 1.9); moonL.position.set(9, 16, -14); moonL.target.position.set(0, 2, 0); moonL.castShadow = true; moonL.shadow.mapSize.set(1024, 1024);
    Object.assign(moonL.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 50 }); moonL.shadow.bias = -0.0008; moonL.shadow.radius = 4; scene.add(moonL); scene.add(moonL.target);
    const fill = new T3.DirectionalLight(0xbcd6ff, 0.45); fill.position.set(3, 5, 12); scene.add(fill);
    const key = new T3.DirectionalLight(0xffd6b0, 1.3); key.position.set(-6, 9, 9); scene.add(key);
    const rim = new T3.PointLight(0x66e0ff, 1.4, 14, 1.6); rim.position.set(-3.5, 6.5, -4); scene.add(rim);
    W.lights = { hemi, moonL, fill, rim };
    return { renderer, scene, camera, W, B };
  };

  // ======================================================================= acting, keyed in film time
  const BOY0 = V3(0, 1.72, 0.55);
  const CLOCK = [[0, '02:47'], [25, '03:12'], [34.3, '03:13'], [34.62, '03:14'], [34.94, '03:21'], [35.26, '03:33'], [35.58, '03:47'], [35.9, '03:58'], [44, '04:02']];
  const BLINKS = [2.15, 3.6, 26.45, 28.9, 33.6, 37.0, 38.25, 39.9, 41.4];
  // camera [pos, target] keys
  const CAM = [
    [0, [0.55, 3.9, 13.8, 0, 3.35, 0.6]],
    [4.3, [0.12, 4.75, 4.6, 0, 4.66, 0.9], 'io2'],
    [25.0, [3.2, 4.2, 7.8, 0, 3.8, 0.8]],
    [25.5, [0.5, 4.2, 7.6, 0, 3.8, 0.8], 'out3'],
    [28.0, [0.25, 4.35, 5.6, 0, 3.95, 0.9], 'io2'],
    [29.8, [-0.4, 4.4, 6.4, -0.3, 4.0, 0.8], 'io2'],
    [31.2, [-1.4, 3.7, 6.9, -1.2, 3.2, 1.0], 'io2'],
    [32.0, [-0.3, 4.4, 5.3, -0.2, 4.2, 1.0], 'io2'],
    [33.4, [0.0, 4.3, 5.8, 0, 4.0, 0.9], 'io2'],
    [34.4, [2.25, 2.9, 4.4, 2.75, 2.45, 1.7], 'io2'],
    [35.9, [2.1, 2.95, 4.0, 2.75, 2.45, 1.7], 'lin'],
    [37.0, [0.7, 4.3, 6.4, 0.3, 4.1, 0.9], 'io2'],
    [38.6, [0.35, 4.1, 8.4, 0, 3.7, 0.7], 'io2'],
    [39.3, [1.4, 3.9, 8.0, 0.8, 3.4, 0.9], 'io2'],
    [40.2, [-1.3, 3.9, 8.0, -0.8, 3.3, 0.9], 'io2'],
    [41.6, [0.2, 7.6, 2.2, 0, 2.0, -2.0], 'io2'],
    [45.5, [0.15, 6.9, 0.6, 0, 2.05, -2.35], 'sine'],
    [46.6, [1.6, 7.0, -2.0, 3.6, 6.6, -8.6], 'io2'],
    [47.8, [4.5, 6.6, -7.2, 4.5, 6.6, -12], 'in2'],
    [48.6, [4.7, 7.0, -11.5, 9, 13, -40], 'lin'],
    [50.0, [6.2, 8.6, -19, 16, 24, -78], 'out2'],
  ];
  const FOV = [[0, 30], [4.4, 30], [5.4, 24, 'in3'], [25, 30], [34.4, 26], [35.9, 24, 'lin'], [37, 30], [46.6, 30], [48.6, 42, 'io2'], [50, 36]];
  // phone pose: [x,y,z, rotX, rotY, rotZ]
  const PH_TABLE = [2.45, 2.2, 1.35, -1.5708, 0, 0.3];
  const PHONE = [
    [0, PH_TABLE], [25.0, [0, 2.95, 1.42, -0.85, 0, 0]],
    [30.3, [0, 2.95, 1.42, -0.85, 0, 0]], [30.85, [0.6, 2.25, 1.5, -1.25, 0, -0.25], 'io2'],
    [38.35, [0.6, 2.25, 1.5, -1.25, 0, -0.25]], [39.1, [2.45, 2.32, 1.35, -1.5, 0, 0.25], 'io2'], [39.15, PH_TABLE, 'out2'],
  ];
  const MUG_TABLE = [-2.25, 2.11, 1.45, 0];
  const MUG = [[0, MUG_TABLE], [31.15, MUG_TABLE], [31.5, [-1.2, 2.75, 1.75, 0], 'io2'], [31.85, [-0.12, 3.92, 1.62, 0], 'io2'], [31.95, [-0.1, 4.0, 1.6, 0.15]], [32.4, [-0.1, 4.05, 1.55, 0.5], 'io2'], [32.75, [-0.15, 3.95, 1.6, 0.05], 'io2'],
    [33.05, [-1.2, 2.8, 1.75, 0], 'io2'], [33.38, MUG_TABLE, 'io2']];
  // body: [spineLeanZ, spineTwistY, spineBackX, neckYaw, neckPitch, neckRoll]
  const BODY = [
    [0, [0, 0, 0.0, 0, -0.02, 0.06]], [1.0, [0, 0, 0, 0.12, -0.02, 0.04]], [2.5, [0, 0, 0, -0.03, 0.0, 0.07]], [5.6, [0, 0, 0, 0, 0, 0.05]],
    [25.0, [0, 0, 0.08, 0, 0.32, 0]], [30.3, [0, 0, 0.08, 0, 0.32, 0]],
    [30.45, [0.22, 0.25, 0.05, -0.3, 0.22, -0.05], 'io2'], [31.15, [0.32, 0.3, 0.05, -0.32, 0.25, -0.05], 'io2'],
    [31.85, [0.0, 0.05, -0.05, -0.05, -0.12, 0.02], 'io2'], [32.45, [0.0, 0.05, -0.1, -0.05, -0.22, 0.02], 'io2'], [32.75, [0, 0.02, -0.04, 0, 0, 0], 'io2'],
    [33.05, [0.2, 0.25, 0.02, -0.2, 0.15, 0], 'io2'], [33.38, [0.3, 0.3, 0.04, -0.25, 0.2, 0], 'io2'], [33.9, [0, 0, 0.02, 0.0, 0.05, 0], 'io2'],
    [34.1, [0, -0.08, 0.02, 0.55, 0.1, 0], 'io2'], [36.1, [0, -0.05, 0.02, 0.45, 0.1, 0]], [36.5, [0, 0, 0.0, 0, 0.0, 0.04], 'io2'], [37.4, [0, 0, 0.1, 0, 0.18, 0], 'sine'], [38.0, [0, 0, 0.04, 0, 0.05, 0.03], 'sine'],
    [38.35, [0, 0, 0.04, 0, 0.05, 0.03]], [39.0, [-0.3, -0.3, 0.04, 0.35, 0.18, 0], 'io2'], [39.3, [0, 0, 0.04, 0.1, 0.05, 0], 'io2'],
    [39.95, [0.3, 0.3, 0.06, -0.35, 0.2, 0], 'io2'], [40.15, [0.3, 0.3, 0.06, -0.35, 0.22, 0]], [40.55, [0, 0, 0.04, 0, 0, 0], 'io2'],
    [41.45, [0, 0, -1.42, 0, -0.25, 0], 'io2'], [41.7, [0, 0, -1.38, 0, -0.22, 0], 'out2'], [50, [0, 0, -1.38, 0, -0.22, 0]],
  ];
  const EYES = [[0, [0, 0]], [1.0, [0.45, -0.05], 'out3'], [2.55, [0.45, -0.05]], [2.75, [0, 0], 'out3'], [25, [0, 0.35]], [30.4, [0, 0.35]], [30.6, [-0.5, 0.2], 'out3'], [31.9, [-0.1, 0.2], 'io2'], [32.8, [0, 0]],
    [34.0, [0, 0]], [34.2, [0.55, 0.15], 'out3'], [36.2, [0.5, 0.1]], [36.4, [0, 0], 'out3'], [37.2, [0, 0.3]], [37.8, [0, 0]], [38.4, [0, 0.1]], [38.6, [0.5, 0.3], 'out3'], [39.6, [0, 0]], [39.8, [-0.5, 0.25], 'out3'], [40.6, [0, 0]]];
  const LIDS = [[0, 0.88], [2.8, 1.0, 'out3'], [3.4, 0.9], [25, 0.62], [31.9, 0.62], [32.0, 0.05, 'io2'], [32.45, 0.08], [32.55, 1.05, 'out4'], [33.9, 1.0], [34.3, 0.8], [35.6, 0.95], [36.5, 0.62], [38.0, 0.6],
    [41.3, 0.6], [42.0, 0.42, 'sine'], [43.4, 0.25, 'sine'], [44.8, 0.0, 'sine'], [50, 0]];
  // brows: [innerRaise, bothUp]
  const BROWS = [[0, [0.25, 0.0]], [1.6, [0.55, 0.05]], [3.0, [0.5, 0.15]], [25, [0.2, 0]], [32.5, [0.2, 0]], [32.6, [0.0, 0.6], 'out3'], [33.6, [0.1, 0.2]], [35.0, [0.6, 0.1], 'io2'], [36.5, [0.7, 0.05]], [38.6, [0.6, 0.0]], [39.4, [0.25, 0]], [42.0, [0, 0]], [50, [0, 0]]];
  const MOUTHS = [[0, 'nervous'], [0.6, 'frown'], [2.8, 'grin', 'io2'], [5.6, 'grin'], [25, 'flat'], [31.85, 'flat'], [31.95, 'o', 'io2'], [32.45, 'o'], [32.6, 'flat', 'io2'], [35.0, 'flat'], [35.3, 'nervous', 'io2'], [38.6, 'nervous'], [39.0, 'flat', 'io2'],
    [42.6, 'smile', 'sine'], [44.6, 'sleep', 'sine'], [50, 'sleep']];

  function blinkAt(T) { let b = 0; for (const t0 of BLINKS) { const x = (T - t0) / 0.2; if (x >= 0 && x <= 1) b = Math.max(b, x < 0.35 ? x / 0.35 : 1 - (x - 0.35) / 0.65); } return b; }
  function phoneAt(T) { return K(T, PHONE); }

  F.roomRender = function (R, T) {
    const { W, B, camera, renderer, scene } = R;
    // camera
    const c = K(T, CAM); camera.position.set(c[0], c[1], c[2]); camera.lookAt(c[3], c[4], c[5]);
    camera.fov = K(T, FOV); camera.updateProjectionMatrix();
    // lighting moods: lamp dim (s1), on (s4/s5 until the click), then moonlight
    const lamp = T < 20 ? 0.45 : T < 40.0 ? 1 : 1 - smooth(40.0, 40.18, T);
    W.lampLight.intensity = 34 * lamp; W.shadeM.emissiveIntensity = 1.6 * lamp; W.lampGlow.material.opacity = 0.55 * lamp;
    const lb = 1 - smooth(40.0, 40.18, T) * (T > 38 ? 1 : 0); W.button.position.y = 0.6 - 0.025 * (smooth(39.85, 40.0, T) - smooth(40.05, 40.3, T));
    W.lights.hemi.intensity = T > 40 ? lerp(1.15, 0.85, smooth(40, 40.4, T)) : 1.15;
    W.lights.moonL.intensity = T > 40 ? lerp(1.9, 2.6, smooth(40, 41, T)) : 1.9;
    W.starMat.uniforms.t.value = T;
    W.curtains.forEach((cu, i) => { cu.rotation.y = Math.sin(T * 1.1 + i * 1.7) * 0.06; cu.rotation.z = Math.sin(T * 0.8 + i) * 0.015; });
    W.clouds.forEach((cl, i) => { cl.position.x += 0; cl.material.rotation = 0; cl.position.x = (-20 + ((i * 7.3) % 50)) + T * 0.35 * (i % 2 ? 1 : -1); });
    // clock digits
    let txt = CLOCK[0][1]; for (const [t0, s] of CLOCK) if (T >= t0) txt = s; if (W._clk !== txt) { W.clockTex.draw(txt); W._clk = txt; }
    W.clockLight.intensity = 0.6 + 1.6 * Math.max(0, ...CLOCK.filter((k) => k[0] > 30).map((k) => (T >= k[0] && T < k[0] + 0.3 ? 1 - (T - k[0]) / 0.3 : 0)));
    // phone
    const ph = phoneAt(T); W.phone.position.set(ph[0], ph[1], ph[2]); W.phone.rotation.set(ph[3], ph[4], ph[5]);
    const scrolling = T >= 25 && T < 39.15;
    const flick = T >= 25.5 && T < 30.3 ? Math.floor((T - 25.5) / 0.6) + E.out3(clamp(((T - 25.5) % 0.6) / 0.35, 0, 1)) : T >= 30.3 ? 8 : 0;
    W.feed.tex.offset.y = 0.75 - flick * 0.045;
    const glow = T < 24 ? 0.0 : T < 39.1 ? (scrolling ? 1 : 0) : 0;
    W.screenM.color.setScalar(glow > 0 ? 1 : 0.05);
    W.phoneLight.position.copy(W.phone.position).add(V3(0, 0.5, 0.2)); W.phoneLight.intensity = glow * (5 + 1.5 * Math.sin(T * 9) * (T < 30.3 ? 1 : 0.3));
    // rays (blue light toward the eyes), scene 4
    const rayA = smooth(28.0, 28.4, T) * (1 - smooth(29.9, 30.2, T));
    // mug
    const mg = K(T, MUG); W.mug.position.set(mg[0], mg[1], mg[2]); W.mug.rotation.set(0, -0.6, mg[3]);
    W.steam.forEach((s, i) => { const k = ((T * 0.45 + i / 3) % 1); s.position.set(Math.sin(T * 2 + i) * 0.05, 0.4 + k * 0.6, 0); s.material.opacity = 0.28 * Math.sin(k * Math.PI); s.scale.setScalar(0.18 + k * 0.3); });

    // ---- boy
    const body = K(T, BODY);
    B.spine.rotation.set(body[2], body[1], body[0]);
    const br = Math.sin(T * (T > 41 ? 1.6 : 2.6)) * (T > 41 ? 0.035 : 0.02);
    B.chest.scale.set(1 + br * 0.6, 1 + br, 1 + br * 1.2);
    B.neck.rotation.set(body[4], body[3], body[5]);
    // hair follows with a little lag
    const lag = (k) => K(T - 0.12, BODY)[k] - body[k];
    B.hair.rotation.set(lag(4) * 0.6 + Math.sin(T * 1.7) * 0.01, lag(3) * 0.5, lag(5) * 0.5);
    B.fringe.rotation.x = lag(4) * 0.8 + Math.sin(T * 2.1) * 0.02;
    const eye = K(T, EYES); for (const s of ['L', 'R']) B.eyes[s].rotation.set(eye[1], eye[0], 0);
    const open = Math.max(0, K(T, LIDS) - blinkAt(T) * 1.2);
    for (const s of ['L', 'R']) B.lids[s].rotation.x = lerp(1.62, -0.95, clamp(open, -0.1, 1.1));
    const bw = K(T, BROWS); B.brows.L.rotation.z = -bw[0] * 0.45; B.brows.R.rotation.z = bw[0] * 0.45; B.brows.L.position.y = B.brows.R.position.y = 1.43 + bw[1] * 0.12 + bw[0] * 0.03;
    const mo = F.mouthAt(T, MOUTHS); const mk = JSON.stringify(mo); if (B._mk !== mk) { B.mouthTex.draw(mo); B._mk = mk; }
    B.sweat.visible = T > 35.2 && T < 36.8; if (B.sweat.visible) B.sweat.position.y = 1.35 - (T - 35.2) * 0.12;
    B.root.updateMatrixWorld(true);
    // hands: resting on the mattress (photo pose), on the phone, the mug, the lamp button, the belly
    const sp = (x, y, z) => V3(x, y, z);
    const poleOf = (s) => { const sh = new T3.Vector3(); B.arms[s].shoulder.getWorldPosition(sh); return sh.add(V3(s === 'L' ? -1.2 : 1.2, -0.6, -1.0)); };
    const phonePt = (dx) => { const p = V3(dx, -0.1, -0.02); W.phone.updateMatrixWorld(); return p.applyMatrix4(W.phone.matrixWorld); };
    const mugPt = () => { W.mug.updateMatrixWorld(); return V3(0.3, 0.19, 0).applyMatrix4(W.mug.matrixWorld); };
    const lampPt = () => { W.lamp.updateMatrixWorld(); return W.button.position.clone().add(V3(0.05, 0.05, 0.06)).applyMatrix4(W.lamp.matrixWorld); };
    const chestPt = (x, y, z) => { B.chest.updateMatrixWorld(); return V3(x, y, z).applyMatrix4(B.chest.matrixWorld); };
    const bedL = sp(-0.98, 1.74, 0.62), bedR = sp(0.98, 1.74, 0.62), lapL = sp(-0.42, 1.95, 1.25), lapR = sp(0.42, 1.95, 1.25);
    const mixP = (a, b, k) => a.clone().lerp(b, clamp(k, 0, 1));
    let tL = bedL, tR = bedR;
    if (T >= 24) {
      // left hand
      if (T < 30.3) tL = phonePt(-0.24);
      else if (T < 31.15) tL = mixP(phonePt(-0.24), mugPt(), E.io2((T - 30.3) / 0.85));
      else if (T < 33.38) tL = mugPt();
      else if (T < 34.0) tL = mixP(mugPt(), lapL, E.io2((T - 33.38) / 0.62));
      else if (T < 39.3) tL = lapL;
      else if (T < 39.95) tL = mixP(lapL, lampPt(), E.io2((T - 39.3) / 0.65));
      else if (T < 40.15) tL = lampPt();
      else if (T < 40.7) tL = mixP(lampPt(), lapL, E.io2((T - 40.15) / 0.55));
      else tL = mixP(lapL, chestPt(-0.25, 0.55, 0.42), E.io2((T - 40.7) / 0.9));
      // right hand
      if (T < 39.15) tR = phonePt(0.24);
      else if (T < 39.7) tR = mixP(phonePt(0.24), lapR, E.io2((T - 39.15) / 0.55));
      else tR = mixP(lapR, chestPt(0.3, 0.75, 0.42), E.io2((T - 40.6) / 0.9));
    }
    F.ik(B.arms.L, tL, poleOf('L')); F.ik(B.arms.R, tR, poleOf('R'));
    // palms: down on the bed, around the phone, gripping the mug
    for (const s of ['L', 'R']) {
      const arm = B.arms[s]; arm.hand.quaternion.identity(); arm.fingers.rotation.x = 0.3;
      if (T < 24 || T > 40.6) F.handFace(arm, V3(0, -1, 0.15), V3(s === 'L' ? 0.4 : -0.4, 0, -1));
      else F.handFace(arm, V3(s === 'L' ? 1 : -1, 0.2, 0.2), V3(0, 0, -1));
    }
    B.arms.R.thumb.rotation.x = T >= 25.5 && T < 30.3 ? -0.9 * Math.max(0, Math.sin(((T - 25.5) % 0.6) / 0.6 * Math.PI)) : 0;
    // scene-4 extras
    B.head.updateMatrixWorld(true);
    const headW = V3(0, 1.0, 0.2).applyMatrix4(B.head.matrixWorld);
    W.rays.material.opacity = rayA * (0.16 + 0.08 * Math.sin(T * 14));
    if (rayA > 0) { const from = W.phone.position.clone(), to = headW.clone().add(V3(0, 0.05, 0.4)); const mid = from.clone().add(to).multiplyScalar(0.5); W.rays.position.copy(mid); W.rays.scale.set(1, from.distanceTo(to) / 1.8, 1); W.rays.quaternion.setFromUnitVectors(V3(0, 1, 0), to.clone().sub(from).normalize().negate()); }
    const bub = smooth(28.35, 28.7, T) * (1 - smooth(30.0, 30.3, T));
    W.bubble.visible = bub > 0.01; W.bubble.position.copy(headW).add(V3(-1.45, 1.35, 0.2)); W.bubble.scale.setScalar(0.25 + 0.75 * E.back(clamp((T - 28.35) / 0.45, 0, 1)) * (bub > 0 ? 1 : 0));
    if (W.miniMela) { const sh = 1 - 0.55 * smooth(29.0, 29.9, T); W.miniMela.root.scale.setScalar(sh); W.miniMela.pose(T, { sleepy: 1, dim: smooth(29.0, 29.9, T) }); }
    W.bubDots.forEach((d, i) => { d.visible = W.bubble.visible; d.position.copy(headW).add(V3(-0.55 - i * 0.35, 0.65 + i * 0.3, 0.3)); });
    // caffeine sparks around the head
    const sp1 = smooth(32.5, 32.6, T) * (1 - smooth(33.2, 33.5, T));
    W.sparks.forEach((s, i) => { const a = i * 1.57 + 0.6; s.position.copy(headW).add(V3(Math.cos(a) * 1.25, 0.4 + Math.sin(a) * 0.8, 0.3)); s.material.opacity = sp1 * (0.6 + 0.4 * Math.sin(T * 30 + i)); });
    // worry swirl over the head while watching the clock
    const sw = smooth(35.1, 35.3, T) * (1 - smooth(36.9, 37.3, T)); W.swirl.visible = sw > 0.01; W.swirl.position.copy(headW).add(V3(0.1, 1.45, 0)); W.swirl.rotation.y = T * 2.5;
    W.swirl.geometry.setDrawRange(0, Math.floor(W.swirl.geometry.index.count * clamp((T - 35.15) / 0.9, 0, 1) / 3) * 3); W.swirl.material.opacity = 0.85 * sw;
    // thoughts drifting away while he falls asleep
    W.floaters.forEach((s, i) => { const t0 = 42.2 + i * 0.32; const k = clamp((T - t0) / 2.2, 0, 1); s.position.copy(headW).add(V3((i - 3) * 0.25 * (1 + k), 0.6 + k * 2.2, 0.2)); s.material.opacity = k > 0 && k < 1 ? Math.sin(k * Math.PI) * 0.8 : 0; s.scale.setScalar(0.4 - k * 0.2); });
    W.zz.forEach((s, i) => { const t0 = 45.6 + i * 0.4; const k = clamp((T - t0) / 1.6, 0, 1); s.position.copy(headW).add(V3(0.5 + k * 0.6, 0.5 + k * 1.2, 0.3)); s.material.opacity = k > 0 && k < 1 ? Math.sin(k * Math.PI) * 0.6 : 0; });
    renderer.render(scene, camera);
  };
})();
