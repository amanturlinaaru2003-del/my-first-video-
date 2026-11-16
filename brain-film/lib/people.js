/* people.js — a modelled human (face with eyes and closed mouth, full hair, shirt with long sleeves, trousers, shoes)
 * and a hospital ward set (tiled walls, bed, monitor, IV drip, curtain, night window, ceiling lights).
 * Adds CINE.human, CINE.bed, CINE.hospital. Requires THREE and CINE. */
(function () {
  const T3 = THREE, C = CINE, { rng, clamp, noise3 } = C.u;

  // ------------------------------------------------------------------ materials
  const mats = {};
  function M(key, make) { return mats[key] || (mats[key] = make()); }
  const skin = () => M('skin', () => new T3.MeshPhysicalMaterial({ color: 0xd8a184, roughness: 0.55, metalness: 0, sheen: 0.5, sheenColor: new T3.Color(0xffc8b0), clearcoat: 0.15 }));
  const hair = () => M('hair', () => new T3.MeshStandardMaterial({ color: 0x2a1c14, roughness: 0.7 }));
  const gown = (c = 0x86a8bd) => M('gown' + c, () => new T3.MeshStandardMaterial({ color: c, roughness: 0.85, metalness: 0 }));
  const ghostMat = () => new T3.MeshPhysicalMaterial({ color: 0x9fd4ff, roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0.35, emissive: 0x8fc8ff, emissiveIntensity: 0.9, depthWrite: false });

  function lathe(pts, seg = 40) { return new T3.LatheGeometry(pts.map(([r, y]) => new T3.Vector2(r, y)), seg); }
  function cap(r, len, seg = 16) { return new T3.CapsuleGeometry(r, len, 8, seg); }

  // ------------------------------------------------------------------ the human (1.75 m, feet at y = 0, facing +z)
  C.human = function (o = {}) {
    const ghost = !!o.ghost, gm = ghost ? ghostMat() : null;
    const mSkin = gm || skin(), mHair = gm || hair();
    const mGown = gm || new T3.MeshStandardMaterial({ color: o.shirt || o.gown || 0x86a8bd, roughness: 0.85 });   // shirt / pyjama top
    const mPants = gm || M('pants' + (o.pants || 0x5d7f96), () => new T3.MeshStandardMaterial({ color: o.pants || 0x5d7f96, roughness: 0.9 }));
    const mShoe = gm || M('shoe', () => new T3.MeshStandardMaterial({ color: 0x1d1d22, roughness: 0.45, metalness: 0.1 }));
    const mBtn = gm || M('btn', () => new T3.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.3 }));
    const root = new T3.Group();
    const add = (parent, geo, mat, x, y, z, sx = 1, sy = 1, sz = 1) => { const m = new T3.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); parent.add(m); return m; };
    // shirt: chest, waist, hem at the hips; trousers: pelvis
    const torso = lathe([[0.001, 0.84], [0.185, 0.845], [0.19, 0.92], [0.168, 1.04], [0.16, 1.1], [0.178, 1.24], [0.188, 1.33], [0.172, 1.4], [0.13, 1.45], [0.06, 1.48], [0.001, 1.485]]);
    add(root, torso, mGown, 0, 0, 0, 1, 1, 0.62);
    const pelvis = lathe([[0.001, 0.74], [0.17, 0.75], [0.185, 0.86], [0.178, 0.92], [0.001, 0.925]]);
    add(root, pelvis, mPants, 0, 0, 0, 1, 1, 0.66);
    if (!ghost) { for (let i = 0; i < 4; i++) add(root, new T3.SphereGeometry(0.008, 10, 8), mBtn, 0, 1.36 - i * 0.12, 0.118 - (i === 3 ? 0.004 : 0)); // buttons
      const collar = add(root, new T3.TorusGeometry(0.06, 0.014, 8, 24), mGown, 0, 1.46, 0.0, 1, 1, 0.9); collar.rotation.x = Math.PI / 2; }
    // neck, head, face, hair
    add(root, new T3.CylinderGeometry(0.048, 0.055, 0.12, 20), mSkin, 0, 1.52, 0);
    const head = new T3.Group(); head.position.set(0, 1.64, 0.005); root.add(head);
    add(head, new T3.SphereGeometry(0.1, 32, 24), mSkin, 0, 0, 0, 0.9, 1.15, 1.0);
    add(head, new T3.SphereGeometry(0.06, 20, 16), mSkin, 0, -0.055, 0.015, 1.0, 0.8, 0.9);     // jaw
    // nose: bridge from between the eyes, a wide round bulb, side wings and two nostrils
    const br = add(head, cap(0.0068, 0.024, 10), mSkin, 0, -0.002, 0.097, 1, 1, 0.9); br.rotation.x = -0.25;
    add(head, new T3.SphereGeometry(0.014, 24, 16), mSkin, 0, -0.022, 0.104, 1.45, 1.0, 1.0);          // bulb
    [-1, 1].forEach((s) => add(head, new T3.SphereGeometry(0.0095, 16, 12), mSkin, s * 0.016, -0.025, 0.099, 1, 0.95, 0.9)); // wings
    if (!ghost) [-1, 1].forEach((s) => { const n = add(head, new T3.SphereGeometry(0.0042, 12, 8), M('nostril', () => new T3.MeshStandardMaterial({ color: 0x3a1a16, roughness: 0.8 })), s * 0.0085, -0.0322, 0.109, 1.1, 0.55, 0.8); n.rotation.z = s * 0.4; });
    [-1, 1].forEach((s) => add(head, new T3.SphereGeometry(0.022, 12, 10), mSkin, s * 0.09, 0, 0, 0.5, 1, 0.8)); // ears
    // face: eyes (white, iris, pupil, eyelid, brow) and mouth (lips)
    const lids = [];
    if (!ghost) {
      const white = M('eyeW', () => new T3.MeshPhysicalMaterial({ color: 0xf4f1ec, roughness: 0.15, clearcoat: 1 }));
      const iris = M('iris', () => new T3.MeshStandardMaterial({ color: 0x5a3a22, roughness: 0.3 }));
      const pupil = M('pupil', () => new T3.MeshStandardMaterial({ color: 0x050505, roughness: 0.1 }));
      const brow = M('brow', () => new T3.MeshStandardMaterial({ color: 0x2a1c14, roughness: 0.8 }));
      [-1, 1].forEach((s) => {
        const eye = new T3.Group(); eye.position.set(s * 0.034, 0.016, 0.08); head.add(eye);
        add(eye, new T3.SphereGeometry(0.016, 20, 14), white, 0, 0, 0);
        add(eye, new T3.CircleGeometry(0.0078, 20), iris, 0, 0, 0.0161);
        add(eye, new T3.CircleGeometry(0.0038, 16), pupil, 0, 0, 0.0163);
        const lid = add(eye, new T3.SphereGeometry(0.0172, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), mSkin, 0, 0, 0); lid.rotation.x = -0.35; lids.push(lid);
        const b = add(head, cap(0.0045, 0.03, 6), brow, s * 0.037, 0.047, 0.094); b.rotation.z = Math.PI / 2 + s * 0.12;
      });
      // closed mouth: upper and lower lip meeting on a soft line
      const lipM = M('lip', () => new T3.MeshStandardMaterial({ color: 0xb06a5e, roughness: 0.45 }));
      const ul = add(head, cap(0.0042, 0.022, 8), lipM, 0, -0.056, 0.0905, 1, 1, 0.8); ul.rotation.z = Math.PI / 2;
      const ll = add(head, cap(0.0052, 0.018, 8), lipM, 0, -0.062, 0.0895, 1, 1, 0.8); ll.rotation.z = Math.PI / 2;
      const ml = add(head, cap(0.0012, 0.026, 6), M('mouthLine', () => new T3.MeshStandardMaterial({ color: 0x5a2420, roughness: 0.6 })), 0, -0.059, 0.094); ml.rotation.z = Math.PI / 2;
    }
    // hair: a full cap over the top, back and sides, a side-swept fringe and a few tufts for volume
    const hcap = new T3.SphereGeometry(0.108, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.58);
    const hc = add(head, hcap, mHair, 0, 0.012, -0.012, 0.95, 1.2, 1.06); hc.rotation.x = -0.55;
    const fr = add(head, new T3.SphereGeometry(0.06, 20, 12), mHair, 0.018, 0.075, 0.055, 1.35, 0.42, 0.75); fr.rotation.z = -0.25;
    [[-0.05, 0.09, 0.0], [0.045, 0.1, -0.01], [0.0, 0.115, -0.03], [-0.03, 0.1, -0.06], [0.04, 0.085, -0.07]].forEach(([x, y, z], i) => add(head, new T3.SphereGeometry(0.04, 14, 10), mHair, x, y, z, 1.1, 0.6, 1.0));
    [-1, 1].forEach((s) => add(head, new T3.SphereGeometry(0.035, 14, 10), mHair, s * 0.083, 0.035, -0.02, 0.45, 1.0, 1.2));      // sideburns
    // arms: shoulder → elbow → hand, each joint a pivot group
    const arms = [-1, 1].map((s) => {
      const sh = new T3.Group(); sh.position.set(s * 0.215, 1.39, 0); root.add(sh);
      add(sh, new T3.SphereGeometry(0.06, 16, 12), mGown, 0, 0, 0);
      add(sh, cap(0.05, 0.22), mGown, 0, -0.15, 0);                        // long sleeve (upper arm)
      const el = new T3.Group(); el.position.set(0, -0.3, 0); sh.add(el);
      add(el, cap(0.043, 0.19), mGown, 0, -0.12, 0);                       // long sleeve (forearm)
      add(el, new T3.CylinderGeometry(0.046, 0.046, 0.025, 16), mGown, 0, -0.225, 0);  // cuff
      add(el, cap(0.026, 0.02, 8), mSkin, 0, -0.245, 0);                   // wrist
      add(el, new T3.SphereGeometry(0.04, 16, 12), mSkin, 0, -0.29, 0.005, 0.75, 1.4, 0.45); // hand
      add(el, cap(0.011, 0.04, 8), mSkin, s * -0.032, -0.27, 0.018).rotation.z = s * 0.5;  // thumb
      return { sh, el, s };
    });
    // legs: hip → knee → foot
    const legs = [-1, 1].map((s) => {
      const hp = new T3.Group(); hp.position.set(s * 0.095, 0.9, 0); root.add(hp);
      add(hp, cap(0.075, 0.32), mPants, 0, -0.2, 0);                       // trouser leg (thigh)
      const kn = new T3.Group(); kn.position.set(0, -0.44, 0); hp.add(kn);
      add(kn, cap(0.06, 0.32), mPants, 0, -0.2, 0);                        // trouser leg (shin)
      add(kn, new T3.SphereGeometry(0.055, 16, 12), mShoe, 0, -0.43, 0.05, 0.9, 0.55, 1.95); // shoe
      add(kn, new T3.BoxGeometry(0.1, 0.012, 0.2), mShoe, 0, -0.455, 0.05);                  // sole
      return { hp, kn, s };
    });
    const H = { group: root, arms, legs, head, mat: gm || mGown, ghost };
    H.eyes = function (closed) { lids.forEach((l) => { l.rotation.x = -0.35 + closed * 1.95; }); };
    // pose: 'stand' | 'lie' (arms along the body, palms down)
    H.pose = function (p = 'stand', k = 0) {
      arms.forEach(({ sh, el, s }) => { sh.rotation.set(0, 0, s * (p === 'lie' ? 0.12 : 0.08 + k)); el.rotation.set(p === 'lie' ? 0 : -0.15, 0, 0); });
      legs.forEach(({ hp, kn, s }) => { hp.rotation.set(0, 0, s * 0.02); kn.rotation.set(p === 'lie' ? 0.02 : 0.04, 0, 0); });
    };
    H.pose(o.pose || 'stand');
    // gentle breathing / idle sway
    H.idle = function (T, amp = 1) { head.rotation.y = Math.sin(T * 0.6) * 0.06 * amp; arms.forEach(({ sh, s }, i) => { sh.rotation.x = Math.sin(T * 0.9 + i) * 0.04 * amp; }); };
    return H;
  };

  // ------------------------------------------------------------------ textures for the ward
  let tileTex = null, floorTex = null, nightTex = null;
  function wallTexture() {
    if (tileTex) return tileTex;
    tileTex = C.canvasTex(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#9fb7b9'; ctx.fillRect(0, 0, w, h * 0.5);                       // painted upper wall
      ctx.fillStyle = '#3f8f96'; ctx.fillRect(0, h * 0.5, w, h * 0.5);                 // teal tiles below
      ctx.strokeStyle = '#2b6d73'; ctx.lineWidth = 3;
      for (let x = 0; x <= w; x += 64) { ctx.beginPath(); ctx.moveTo(x, h * 0.5); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = h * 0.5; y <= h; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.fillStyle = '#d9e4e2'; ctx.fillRect(0, h * 0.5 - 8, w, 10);                  // trim strip
    }).tex;
    tileTex.wrapS = T3.RepeatWrapping; tileTex.wrapT = T3.ClampToEdgeWrapping; tileTex.repeat.set(2, 1);
    return tileTex;
  }
  function floorTexture() {
    if (floorTex) return floorTex;
    floorTex = C.canvasTex(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#58646a'; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = '#46525a'; ctx.lineWidth = 2;
      for (let x = 0; x <= w; x += 128) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, x); ctx.lineTo(w, x); ctx.stroke(); }
      const r = rng(4); for (let i = 0; i < 500; i++) { ctx.fillStyle = `rgba(255,255,255,${r() * 0.05})`; ctx.fillRect(r() * w, r() * h, 3, 3); }
    }).tex;
    floorTex.wrapS = floorTex.wrapT = T3.RepeatWrapping; floorTex.repeat.set(3, 3);
    return floorTex;
  }
  function nightTexture() {
    if (nightTex) return nightTex;
    nightTex = C.canvasTex(512, 640, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#060b1c'); g.addColorStop(1, '#1c2440'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const r = rng(12);
      for (let i = 0; i < 70; i++) { ctx.fillStyle = '#fff'; ctx.globalAlpha = r() * 0.7; ctx.fillRect(r() * w, r() * h * 0.4, 2, 2); } ctx.globalAlpha = 1;
      for (let i = 0; i < 9; i++) {
        const bw = 40 + r() * 70, bh = 120 + r() * 260, x = r() * w, y = h - bh;
        ctx.fillStyle = '#0a0f1e'; ctx.fillRect(x, y, bw, bh);
        for (let wy = y + 10; wy < h - 8; wy += 16) for (let wx = x + 6; wx < x + bw - 6; wx += 12) if (r() < 0.35) { ctx.fillStyle = r() < 0.7 ? '#ffc46a' : '#bfe0ff'; ctx.fillRect(wx, wy, 6, 8); }
      }
    }).tex;
    return nightTex;
  }

  // ------------------------------------------------------------------ hospital bed (mattress top at y = 0.62), head toward −z
  C.bed = function () {
    const g = new T3.Group();
    const metal = M('bedMetal', () => new T3.MeshStandardMaterial({ color: 0xc9d0d6, roughness: 0.3, metalness: 0.85 }));
    const white = M('sheet', () => new T3.MeshStandardMaterial({ color: 0xe9eef0, roughness: 0.8 }));
    const blanket = M('blanket', () => new T3.MeshStandardMaterial({ color: 0x5f86a3, roughness: 0.9 }));
    const box = (w, h, d, mat, x, y, z) => { const m = new T3.Mesh(new T3.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); g.add(m); return m; };
    box(0.95, 0.08, 2.1, metal, 0, 0.42, 0);                                   // frame
    [[-0.42, -0.98], [0.42, -0.98], [-0.42, 0.98], [0.42, 0.98]].forEach(([x, z]) => { box(0.05, 0.42, 0.05, metal, x, 0.21, z); const w = new T3.Mesh(new T3.SphereGeometry(0.05, 12, 8), M('wheel', () => new T3.MeshStandardMaterial({ color: 0x1a1c20, roughness: 0.5 }))); w.position.set(x, 0.05, z); g.add(w); });
    const mat = new T3.Mesh(C.geo ? C.geo.roundedBox(0.9, 0.16, 2.0, 0.06) : new T3.BoxGeometry(0.9, 0.16, 2.0), white); mat.position.set(0, 0.54, 0); g.add(mat);
    box(0.95, 0.75, 0.05, metal, 0, 0.75, -1.05);                              // head board
    box(0.95, 0.45, 0.05, metal, 0, 0.6, 1.05);                                // foot board
    [-1, 1].forEach((s) => { box(0.03, 0.03, 1.1, metal, s * 0.47, 0.82, -0.25); box(0.03, 0.25, 0.03, metal, s * 0.47, 0.7, 0.28); box(0.03, 0.25, 0.03, metal, s * 0.47, 0.7, -0.78); });
    const pillow = new T3.Mesh(new T3.SphereGeometry(0.3, 24, 12), white); pillow.scale.set(1.15, 0.28, 0.6); pillow.position.set(0, 0.68, -0.78); g.add(pillow);
    const bl = new T3.Mesh(new T3.BoxGeometry(0.98, 0.14, 0.42), blanket); bl.position.set(0, 0.8, 0.82); g.add(bl);
    const fold = new T3.Mesh(new T3.BoxGeometry(0.98, 0.05, 0.12), white); fold.position.set(0, 0.86, 0.6); g.add(fold);
    return { group: g, top: 0.62 };
  };

  // a patient lying on a bed whose group sits at the bed origin (head toward −z)
  C.patient = function (o = {}) { const h = o.preset && C.character ? C.character(o.preset) : C.human(Object.assign({ pose: 'lie' }, o)); h.pose('lie'); h.group.rotation.x = -Math.PI / 2; h.group.position.set(0, 0.74, 0.88); return h; };

  // ------------------------------------------------------------------ the ward: 5 m × 6 m room around the bed (bed centre at origin, floor y = 0)
  C.hospital = function (o = {}) {
    const g = new T3.Group();
    const wall = new T3.MeshStandardMaterial({ map: wallTexture(), roughness: 0.55, metalness: 0.05 });
    const W = 5, D = 6, Hh = 3;
    const plane = (w, h, mat, x, y, z, ry = 0, rx = 0) => { const m = new T3.Mesh(new T3.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); g.add(m); return m; };
    plane(W, D, new T3.MeshStandardMaterial({ map: floorTexture(), roughness: 0.28, metalness: 0.15, envMapIntensity: 0.4 }), 0, 0.001, 0, 0, -Math.PI / 2);
    plane(W, Hh, wall, 0, Hh / 2, -D / 2);                                      // back wall
    plane(D, Hh, wall, -W / 2, Hh / 2, 0, Math.PI / 2);                        // left wall
    plane(D, Hh, wall, W / 2, Hh / 2, 0, -Math.PI / 2);                        // right wall
    plane(W, D, new T3.MeshStandardMaterial({ color: 0x8c999c, roughness: 0.9 }), 0, Hh, 0, 0, Math.PI / 2); // ceiling
    // ceiling light panels
    const panelMat = new T3.MeshBasicMaterial({ color: 0xe8f4ff, toneMapped: true });
    [[0, -0.6], [0, 1.6]].forEach(([x, z]) => { plane(0.6, 1.2, panelMat, x, Hh - 0.01, z, 0, Math.PI / 2); });
    const l1 = new T3.PointLight(0xd6ecff, 9, 7, 1.6); l1.position.set(0, Hh - 0.3, -0.4); g.add(l1);
    const l2 = new T3.PointLight(0xd6ecff, 5, 7, 1.6); l2.position.set(0, Hh - 0.3, 1.8); g.add(l2);
    // night window on the right wall
    const win = plane(1.4, 1.7, new T3.MeshBasicMaterial({ map: nightTexture() }), W / 2 - 0.02, 1.55, -0.9, -Math.PI / 2);
    const frame = M('frame', () => new T3.MeshStandardMaterial({ color: 0xdfe6e8, roughness: 0.4, metalness: 0.3 }));
    [[0, 0.88, 1.5, 0.06], [0, -0.88, 1.5, 0.06], [0.73, 0, 0.06, 1.8], [-0.73, 0, 0.06, 1.8], [0, 0, 0.04, 1.7]].forEach(([dz, dy, w, h]) => { const b = new T3.Mesh(new T3.BoxGeometry(0.06, h, w), frame); b.position.set(W / 2 - 0.03, 1.55 + dy, -0.9 + dz); g.add(b); });
    const moon = new T3.PointLight(0x7fa6ff, 3, 5, 1.8); moon.position.set(W / 2 - 0.4, 1.7, -0.9); g.add(moon);
    // bed + patient
    const bed = C.bed(); g.add(bed.group);
    const patient = o.patient === false ? null : C.patient({ preset: o.preset || 'comaElder' }); if (patient) g.add(patient.group);
    const staff = (o.staff || []).map(([name, x, z, ry]) => { const h = C.character(name); h.group.position.set(x, 0, z); h.group.rotation.y = ry || 0; g.add(h.group); return h; });
    // monitor on a stand at the head of the bed (left)
    const mon = C.monitor(); mon.group.scale.setScalar(0.42); mon.group.position.set(-0.95, 1.55, -1.0); mon.group.rotation.y = 0.45; g.add(mon.group);
    // IV drip (right)
    const metal = M('bedMetal', () => new T3.MeshStandardMaterial({ color: 0xc9d0d6, roughness: 0.3, metalness: 0.85 }));
    const pole = new T3.Mesh(new T3.CylinderGeometry(0.015, 0.015, 1.95, 10), metal); pole.position.set(0.85, 0.98, -0.75); g.add(pole);
    const base = new T3.Mesh(new T3.CylinderGeometry(0.25, 0.25, 0.03, 20), metal); base.position.set(0.85, 0.03, -0.75); g.add(base);
    const bag = new T3.Mesh(new T3.SphereGeometry(0.1, 16, 12), new T3.MeshPhysicalMaterial({ color: 0xdff2ff, roughness: 0.1, transmission: 0, transparent: true, opacity: 0.6, clearcoat: 1 })); bag.scale.set(0.8, 1.4, 0.35); bag.position.set(0.85, 1.82, -0.75); g.add(bag);
    const tube = new T3.CatmullRomCurve3([[0.85, 1.68, -0.75], [0.7, 1.2, -0.6], [0.5, 0.95, -0.3], [0.3, 0.86, -0.1]].map((q) => new T3.Vector3(...q)));
    g.add(new T3.Mesh(new T3.TubeGeometry(tube, 30, 0.006, 6), new T3.MeshStandardMaterial({ color: 0xeef6ff, roughness: 0.2, transparent: true, opacity: 0.7 })));
    // privacy curtain (left), with folds
    const cg = new T3.PlaneGeometry(2.4, 2.2, 60, 4); const cp = cg.attributes.position;
    for (let i = 0; i < cp.count; i++) cp.setZ(i, Math.sin(cp.getX(i) * 9) * 0.06);
    cg.computeVertexNormals();
    const curtain = new T3.Mesh(cg, new T3.MeshStandardMaterial({ color: 0x9cc6b6, roughness: 0.9, side: T3.DoubleSide })); curtain.position.set(-1.7, 1.35, 0.8); curtain.rotation.y = Math.PI / 2; g.add(curtain);
    const rail = new T3.Mesh(new T3.CylinderGeometry(0.012, 0.012, 2.6, 8), metal); rail.rotation.x = Math.PI / 2; rail.position.set(-1.7, 2.48, 0.8); g.add(rail);
    // bedside cabinet with a glass of water
    const cab = new T3.Mesh(new T3.BoxGeometry(0.45, 0.6, 0.45), new T3.MeshStandardMaterial({ color: 0xe3e7e5, roughness: 0.5 })); cab.position.set(1.25, 0.3, -1.05); g.add(cab);
    const glass = new T3.Mesh(new T3.CylinderGeometry(0.035, 0.03, 0.12, 16), new T3.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, roughness: 0.05 })); glass.position.set(1.2, 0.66, -1.0); g.add(glass);
    // monitor glow spills onto the wall
    const spill = C.glow(0x40ff90, 1.6, 0.25, 0.3); spill.position.set(-1.05, 1.55, -1.25); g.add(spill);
    const R = { group: g, bed, patient, staff, monitor: mon, spill, lights: [l1, l2] };
    R.set = function (T, s = {}) {
      mon.set(T, s.amp != null ? s.amp : 1, null, s.ecg);
      spill.material.color.set((s.amp != null ? s.amp : 1) < 0.05 ? 0xff4040 : 0x40ff90);
      const dim = s.dim != null ? s.dim : 1; l1.intensity = 9 * dim; l2.intensity = 5 * dim;
    };
    return R;
  };
})();
