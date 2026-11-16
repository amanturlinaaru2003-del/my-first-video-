/* organs.js — an anatomical heart (ventricles, atria, aorta with its arch and branches, pulmonary trunk,
 * venae cavae, coronary vessels) and a glowing oxygen blood stream (red cells, cyan O₂ sparks, floating "O₂" marks).
 * Replaces CINE.heart and adds CINE.oxyStream. Requires cine.js. */
(function () {
  const T3 = THREE, C = CINE, { rng, clamp, noise3, smooth } = C.u;
  const V = (x, y, z) => new T3.Vector3(x, y, z);
  function deform(geo, fn) { const p = geo.attributes.position, v = new T3.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; }
  const tube = (pts, r, mat, seg = 40) => new T3.Mesh(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts.map((q) => V(...q))), seg, r, 16, false), mat);
  function capEnd(parent, pt, r, mat) { const s = new T3.Mesh(new T3.SphereGeometry(r, 16, 12), mat); s.position.set(...pt); parent.add(s); }

  C.heart = function () {
    const grp = new T3.Group(), body = new T3.Group(); grp.add(body);
    const muscle = new T3.MeshPhysicalMaterial({ color: 0xa3222e, roughness: 0.32, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.2, sheen: 0.5, sheenColor: new T3.Color(0xff8080), emissive: 0x3a0208, emissiveIntensity: 0.5 });
    const atrium = muscle.clone(); atrium.color.set(0x8e1a28);
    const artery = new T3.MeshPhysicalMaterial({ color: 0xc23a40, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.15, emissive: 0x400408, emissiveIntensity: 0.4 });
    const vein = new T3.MeshPhysicalMaterial({ color: 0x4d58a8, roughness: 0.35, clearcoat: 0.8, emissive: 0x0a0c30, emissiveIntensity: 0.4 });
    const fat = new T3.MeshStandardMaterial({ color: 0xe8c77a, roughness: 0.6 });
    // ventricles: a cone-like ellipsoid with the apex down-left, organic bumps
    const vg = deform(new T3.SphereGeometry(1, 96, 72), (v) => {
      const t = (v.y + 1) / 2;                                   // 0 apex … 1 base
      const taper = 0.32 + 0.68 * Math.pow(t, 0.55);
      v.x *= 0.44 * taper; v.z *= 0.38 * taper; v.y *= 0.56;
      const n = noise3(v.x * 6, v.y * 6, v.z * 6) * 0.012; v.multiplyScalar(1 + n);
      v.x -= (1 - t) * 0.12;                                     // apex leans left
    });
    const vent = new T3.Mesh(vg, muscle); vent.rotation.z = 0.42; vent.position.set(0, -0.1, 0); body.add(vent);
    const rv = new T3.Mesh(new T3.SphereGeometry(0.3, 48, 36), muscle); rv.scale.set(1.05, 1.25, 0.85); rv.position.set(0.14, -0.04, 0.12); rv.rotation.z = 0.5; body.add(rv);
    // atria and the left auricle
    const la = new T3.Mesh(new T3.SphereGeometry(0.2, 32, 24), atrium); la.position.set(-0.14, 0.36, -0.12); la.scale.set(1.2, 0.9, 1); body.add(la);
    const ra = new T3.Mesh(new T3.SphereGeometry(0.22, 32, 24), atrium); ra.position.set(0.3, 0.3, 0.02); ra.scale.set(0.9, 1.1, 1); body.add(ra);
    const aur = new T3.Mesh(new T3.SphereGeometry(0.09, 24, 16), atrium); aur.position.set(-0.3, 0.3, 0.12); aur.scale.set(1.3, 0.7, 0.8); aur.rotation.z = 0.5; body.add(aur);
    // fat along the grooves
    body.add(Object.assign(tube([[0.32, 0.12, 0.2], [0.12, 0.16, 0.3], [-0.12, 0.12, 0.3], [-0.3, 0.05, 0.22]], 0.035, fat), {}));
    // great vessels
    body.add(tube([[0.02, 0.32, 0.02], [0.03, 0.62, 0.04], [-0.02, 0.86, 0.02], [-0.22, 0.95, -0.04], [-0.38, 0.82, -0.12], [-0.42, 0.45, -0.18]], 0.085, artery)); // aorta
    [[-0.05, 0.9, 0.02], [-0.16, 0.95, -0.02], [-0.27, 0.93, -0.06]].forEach(([x, y, z], i) => { body.add(tube([[x, y, z], [x - 0.02 * i, y + 0.16, z], [x - 0.04 * i, y + 0.3, z]], 0.026, artery, 12)); capEnd(body, [x - 0.04 * i, y + 0.3, z], 0.026, artery); });
    body.add(tube([[0.1, 0.3, 0.16], [0.1, 0.55, 0.2], [0.0, 0.72, 0.18], [-0.18, 0.74, 0.1]], 0.075, vein)); // pulmonary trunk
    body.add(tube([[0.0, 0.72, 0.18], [0.2, 0.8, 0.14], [0.36, 0.78, 0.06]], 0.05, vein, 16)); capEnd(body, [0.36, 0.78, 0.06], 0.05, vein); capEnd(body, [-0.18, 0.74, 0.1], 0.06, vein);
    body.add(tube([[0.34, 0.38, -0.02], [0.36, 0.7, -0.05], [0.36, 1.0, -0.06]], 0.065, vein, 16)); capEnd(body, [0.36, 1.0, -0.06], 0.065, vein);       // superior vena cava
    body.add(tube([[0.34, 0.15, -0.05], [0.38, -0.15, -0.1], [0.38, -0.4, -0.12]], 0.06, vein, 16)); capEnd(body, [0.38, -0.4, -0.12], 0.06, vein);     // inferior vena cava
    capEnd(body, [-0.42, 0.45, -0.18], 0.085, artery);
    // coronary arteries and veins running over the ventricles
    const cor = new T3.MeshStandardMaterial({ color: 0xe0484a, roughness: 0.3, emissive: 0x500808, emissiveIntensity: 0.6 });
    const cvn = new T3.MeshStandardMaterial({ color: 0x5560b0, roughness: 0.4 });
    const onSurf = (pts) => pts.map(([x, y, z]) => [x, y, z]);
    [[[0.02, 0.24, 0.33], [-0.05, 0.0, 0.38], [-0.14, -0.25, 0.32], [-0.26, -0.45, 0.18]], [[-0.08, 0.2, 0.33], [-0.25, 0.08, 0.3], [-0.38, -0.08, 0.14]], [[0.16, 0.2, 0.33], [0.3, 0.0, 0.3], [0.36, -0.2, 0.18]]].forEach((p) => body.add(tube(onSurf(p), 0.014, cor, 24)));
    [[[0.08, 0.22, 0.34], [0.06, -0.05, 0.4], [-0.04, -0.3, 0.33]], [[-0.18, 0.15, 0.32], [-0.3, -0.12, 0.26]]].forEach((p) => body.add(tube(onSurf(p), 0.012, cvn, 20)));
    body.rotation.y = 0.25;
    const glow = C.glow(0xff3040, 2.0, 0.5, 0.3); glow.position.z = -0.6; grp.add(glow);
    const H = { group: grp, mat: muscle, glow };
    H.beatAt = function (T, bpm, stopAt) {
      if (stopAt != null && T > stopAt) return 0;
      const ph = (T * bpm / 60) % 1; return Math.exp(-Math.pow((ph - 0.05) / 0.045, 2)) + 0.6 * Math.exp(-Math.pow((ph - 0.24) / 0.05, 2));
    };
    H.set = function (T, s = {}) {
      const b = s.beat || 0, life = s.life != null ? s.life : 1;
      vent.scale.set(1 - b * 0.05, 1 - b * 0.04, 1 - b * 0.05); rv.scale.set(1.05 * (1 - b * 0.06), 1.25 * (1 - b * 0.04), 0.85);
      const a = 1 + b * 0.05; la.scale.set(1.2 * a, 0.9 * a, a); ra.scale.set(0.9 * a, 1.1 * a, a);
      muscle.emissiveIntensity = 0.2 + 1.1 * b * life; atrium.emissiveIntensity = muscle.emissiveIntensity * 0.8;
      muscle.color.set(life > 0.5 ? 0xa3222e : 0x5a1a22); cor.emissiveIntensity = 0.3 + 0.9 * b * life;
      glow.material.opacity = (0.12 + 0.55 * b) * life;
      grp.rotation.y = Math.sin(T * 0.4) * 0.25;
    };
    return H;
  };

  // oxygen stream: red cells + cyan oxygen sparks spiralling inside a softly glowing vessel, with "O₂" marks
  let o2Tex = null;
  function o2Texture() {
    if (o2Tex) return o2Tex;
    o2Tex = C.canvasTex(128, 128, (ctx) => { ctx.font = '800 64px KzSans, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#bff3ff'; ctx.shadowColor = '#3fd0ff'; ctx.shadowBlur = 14; ctx.fillText('O₂', 64, 66); }).tex;
    return o2Tex;
  }
  C.oxyStream = function (curve, n, o = {}) {
    const R = rng(o.seed || 4), rad = o.radius || 0.06;
    const tubeM = new T3.MeshPhysicalMaterial({ color: 0x5a0a14, roughness: 0.15, clearcoat: 1, transparent: true, opacity: 0.4, depthWrite: false, emissive: 0x6a0a18, emissiveIntensity: 0.6 });
    const tb = new T3.Mesh(new T3.TubeGeometry(curve, 140, rad, 16, false), tubeM);
    const mk = (count, color, size) => { const p = new Float32Array(count * 3), g = new T3.BufferGeometry(); g.setAttribute('position', new T3.BufferAttribute(p, 3)); const m = new T3.Points(g, new T3.PointsMaterial({ color, size, map: C.glowTex(0.3), transparent: true, depthWrite: false, blending: T3.AdditiveBlending })); m.frustumCulled = false; return { p, g, m, ph: Array.from({ length: count }, () => R()), a: Array.from({ length: count }, () => R() * Math.PI * 2), r: Array.from({ length: count }, () => 0.3 + R() * 0.6) }; };
    const cells = mk(n, 0xff3a3a, (o.size || 0.06)), sparks = mk(Math.round(n * 0.45), 0x7fe8ff, (o.size || 0.06) * 0.7);
    const marks = []; const grp = new T3.Group(); grp.add(tb, cells.m, sparks.m);
    if (o.marks !== false) for (let i = 0; i < 3; i++) { const s = new T3.Sprite(new T3.SpriteMaterial({ map: o2Texture(), transparent: true, depthWrite: false, blending: T3.AdditiveBlending, opacity: 0.9 })); s.scale.setScalar(rad * 4.2); s.userData.ph = R(); grp.add(s); marks.push(s); }
    const v = new T3.Vector3(), tg = new T3.Vector3(), nx = new T3.Vector3(), ny = new T3.Vector3(), up = new T3.Vector3(0, 0, 1);
    function place(set, T, speed, spiral, flowAmt) {
      for (let i = 0; i < set.ph.length; i++) {
        const f = (set.ph[i] + T * speed) % 1; curve.getPointAt(f, v); curve.getTangentAt(f, tg);
        nx.crossVectors(tg, up).normalize(); if (nx.lengthSq() < 1e-6) nx.set(1, 0, 0); ny.crossVectors(tg, nx).normalize();
        const ang = set.a[i] + T * spiral + f * 12, rr = rad * 0.75 * set.r[i];
        set.p[i * 3] = v.x + (nx.x * Math.cos(ang) + ny.x * Math.sin(ang)) * rr; set.p[i * 3 + 1] = v.y + (nx.y * Math.cos(ang) + ny.y * Math.sin(ang)) * rr; set.p[i * 3 + 2] = v.z + (nx.z * Math.cos(ang) + ny.z * Math.sin(ang)) * rr;
      }
      set.g.attributes.position.needsUpdate = true; set.m.material.opacity = clamp(flowAmt * 1.2, 0, 1);
    }
    return {
      group: grp, pts: cells.m, tube: tb,
      set(T, flow, speed = 0.25) {
        place(cells, T, speed, 2.0, flow); place(sparks, T, speed * 1.5, -3.0, flow);
        tubeM.emissiveIntensity = 0.25 + 0.6 * flow;
        marks.forEach((s) => { const f = (s.userData.ph + T * speed * 0.8) % 1; curve.getPointAt(f, v); s.position.set(v.x + rad * 2.2, v.y, v.z + rad); s.material.opacity = flow * Math.sin(Math.PI * f) * 0.9; });
      },
    };
  };
})();
