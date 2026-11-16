/* characters.js — character presets built on CINE.human: outfits, hair styles, beards, glasses, hats, props.
 * CINE.character(name) → a human group dressed as that character. Requires people.js. */
(function () {
  const T3 = THREE, C = CINE;
  const std = (color, o = {}) => new T3.MeshStandardMaterial(Object.assign({ color, roughness: 0.75 }, o));
  const cap = (r, len, seg = 12) => new T3.CapsuleGeometry(r, len, 6, seg);
  const lathe = (pts, seg = 40) => new T3.LatheGeometry(pts.map(([r, y]) => new T3.Vector2(r, y)), seg);
  function add(parent, geo, mat, x, y, z, sx = 1, sy = 1, sz = 1) { const m = new T3.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); parent.add(m); return m; }

  // find the meshes of the default hair / skin so they can be recoloured or hidden
  function partsBy(H, test) { const out = []; H.group.traverse((m) => { if (m.isMesh && test(m)) out.push(m); }); return out; }
  const isHair = (m) => m.material && m.material.color && m.material.color.getHex() === 0x2a1c14 && Math.abs(m.material.roughness - 0.7) < 1e-6;
  function hairColor(H, color) { const mat = std(color, { roughness: 0.7 }); partsBy(H, isHair).forEach((m) => { m.material = mat; }); return mat; }
  function browColor(H, color) { const mat = std(color, { roughness: 0.8 }); partsBy(H, (m) => m.material && m.material.color && m.material.color.getHex() === 0x2a1c14 && Math.abs(m.material.roughness - 0.8) < 1e-6).forEach((m) => { m.material = mat; }); }
  function bald(H) { partsBy(H, isHair).forEach((m) => { m.visible = false; }); }
  function skinTone(H, color) { const ref = H.head.children[0].material; const mat = ref.clone(); mat.color.set(color); partsBy(H, (m) => m.material === ref).forEach((m) => { m.material = mat; }); }
  function sleeves(H, mat, r1 = 0.056, r2 = 0.05) { H.arms.forEach(({ sh, el }) => { add(sh, cap(r1, 0.22), mat, 0, -0.15, 0); add(el, cap(r2, 0.18), mat, 0, -0.11, 0); }); }

  const X = {
    coat(H, color = 0xf4f6f8) {
      const m = std(color, { roughness: 0.6 });
      add(H.group, lathe([[0.001, 0.5], [0.215, 0.5], [0.222, 0.9], [0.198, 1.04], [0.19, 1.1], [0.2, 1.24], [0.207, 1.33], [0.192, 1.4], [0.15, 1.45], [0.07, 1.485], [0.001, 1.49]]), m, 0, 0, 0, 1, 1, 0.68);
      sleeves(H, m);
      add(H.group, new T3.BoxGeometry(0.006, 0.9, 0.006), std(0xb8c0c8), 0, 0.98, 0.142);                     // front opening
      add(H.group, new T3.BoxGeometry(0.09, 0.08, 0.006), std(0xe2e6ea), 0.1, 1.27, 0.13);                    // breast pocket
      add(H.group, new T3.BoxGeometry(0.01, 0.06, 0.008), std(0x2255aa), 0.09, 1.31, 0.135);                  // pen
      return m;
    },
    stethoscope(H) {
      const dark = std(0x22262c, { roughness: 0.4 }), steel = std(0xd8dde2, { roughness: 0.2, metalness: 0.9 });
      const t = add(H.group, new T3.TorusGeometry(0.085, 0.007, 8, 40, Math.PI * 1.25), dark, 0, 1.43, 0.0, 1, 1, 0.75); t.rotation.set(Math.PI / 2, 0, -Math.PI * 0.125 + Math.PI);
      [-1, 1].forEach((s) => add(H.group, cap(0.006, 0.2, 6), dark, s * 0.07, 1.3, 0.12));
      add(H.group, new T3.CylinderGeometry(0.022, 0.022, 0.01, 20), steel, 0.07, 1.18, 0.13).rotation.x = Math.PI / 2;
    },
    glasses(H, color = 0x1a1a1a) {
      const m = std(color, { roughness: 0.3, metalness: 0.5 });
      [-1, 1].forEach((s) => { add(H.head, new T3.TorusGeometry(0.019, 0.0025, 8, 28), m, s * 0.034, 0.016, 0.1); add(H.head, cap(0.0018, 0.07, 6), m, s * 0.088, 0.02, 0.06).rotation.x = Math.PI / 2; });
      add(H.head, cap(0.002, 0.014, 6), m, 0, 0.02, 0.103).rotation.z = Math.PI / 2;
    },
    bun(H, mat) { add(H.head, new T3.SphereGeometry(0.045, 20, 14), mat, 0, 0.07, -0.1); },
    longHair(H, mat) {
      add(H.head, cap(0.085, 0.16, 16), mat, 0, -0.06, -0.06, 1.15, 1, 0.6);
      [-1, 1].forEach((s) => add(H.head, cap(0.03, 0.17, 10), mat, s * 0.085, -0.07, 0.0, 1, 1, 0.9));
    },
    nurseCap(H) { const w = std(0xffffff, { roughness: 0.5 }); add(H.head, new T3.BoxGeometry(0.12, 0.04, 0.07), w, 0, 0.125, 0.02).rotation.x = -0.3; add(H.head, new T3.BoxGeometry(0.03, 0.03, 0.005), std(0xd23b3b), 0, 0.13, 0.058).rotation.x = -0.3; },
    surgical(H, color = 0x4f9a8a) {
      const m = std(color, { roughness: 0.85 });
      add(H.head, new T3.SphereGeometry(0.112, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), m, 0, 0.02, -0.01, 0.95, 1.15, 1.05).rotation.x = -0.4;
      const mask = add(H.head, new T3.SphereGeometry(0.075, 32, 16, -Math.PI * 0.42, Math.PI * 0.84, Math.PI * 0.42, Math.PI * 0.32), std(0x9fd0e6, { roughness: 0.9, side: T3.DoubleSide }), 0, -0.02, 0.035, 1, 1.0, 0.95);
      mask.rotation.y = 0;
    },
    beard(H, color, full = true) {
      const m = std(color, { roughness: 0.9 });
      if (full) add(H.head, new T3.SphereGeometry(0.07, 24, 16, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55), m, 0, -0.03, 0.025, 1.05, 1.15, 1.0);
      add(H.head, cap(0.0075, 0.03, 8), m, 0, -0.045, 0.094).rotation.z = Math.PI / 2;                          // moustache
    },
    cane(H) { const m = std(0x5a3a22, { roughness: 0.5 }); const r = H.arms[1].el; add(r, new T3.CylinderGeometry(0.012, 0.012, 0.95, 10), m, 0.0, -0.75, 0.08); const h = add(r, new T3.TorusGeometry(0.035, 0.012, 8, 16, Math.PI), m, 0.035, -0.28, 0.08); },
    dress(H, color) {
      const m = std(color, { roughness: 0.7 });
      add(H.group, lathe([[0.001, 0.42], [0.3, 0.42], [0.25, 0.7], [0.19, 0.95], [0.001, 0.96]]), m, 0, 0, 0, 1, 1, 0.75);
      return m;
    },
    chapan(H) {
      const m = std(0x1d2f6a, { roughness: 0.55 }), gold = std(0xd6a43a, { roughness: 0.35, metalness: 0.7 });
      add(H.group, lathe([[0.001, 0.22], [0.25, 0.22], [0.245, 0.6], [0.225, 0.95], [0.2, 1.1], [0.205, 1.25], [0.21, 1.34], [0.195, 1.4], [0.15, 1.45], [0.07, 1.485], [0.001, 1.49]]), m, 0, 0, 0, 1, 1, 0.7);
      sleeves(H, m, 0.065, 0.062);
      const hem = add(H.group, new T3.TorusGeometry(0.25, 0.01, 8, 48), gold, 0, 0.23, 0, 1, 1, 0.7); hem.rotation.x = Math.PI / 2;
      add(H.group, new T3.BoxGeometry(0.02, 1.2, 0.012), gold, 0, 0.85, 0.172);
      const belt = add(H.group, new T3.TorusGeometry(0.2, 0.018, 8, 40), std(0x8a1f1f, { roughness: 0.6 }), 0, 0.95, 0, 1, 1, 0.68); belt.rotation.x = Math.PI / 2;
    },
    taqiya(H) {
      const m = std(0x7a1730, { roughness: 0.6 }), gold = std(0xe2b24a, { roughness: 0.3, metalness: 0.7 });
      add(H.head, new T3.CylinderGeometry(0.085, 0.098, 0.05, 32), m, 0, 0.105, -0.015);
      add(H.head, new T3.TorusGeometry(0.097, 0.005, 6, 40), gold, 0, 0.083, -0.015).rotation.x = Math.PI / 2;
      add(H.head, new T3.TorusGeometry(0.06, 0.004, 6, 30), gold, 0, 0.131, -0.015).rotation.x = Math.PI / 2;
    },
  };

  const PRESETS = {
    patient: () => C.human({ shirt: 0x86a8bd, pants: 0x5d7f96 }),
    doctor: () => { const H = C.human({ shirt: 0x8fb3e0, pants: 0x2c3442 }); X.coat(H); X.stethoscope(H); X.glasses(H); return H; },
    nurse: () => { const H = C.human({ shirt: 0x58b3b0, pants: 0x58b3b0 }); skinTone(H, 0xe6b394); const hm = hairColor(H, 0x4a2a18); X.bun(H, hm); X.nurseCap(H); return H; },
    surgeon: () => { const H = C.human({ shirt: 0x4f9a8a, pants: 0x4f9a8a }); X.surgical(H); return H; },
    elder: () => { const H = C.human({ shirt: 0x8a6a4a, pants: 0x4a4038 }); hairColor(H, 0xd9d9d9); browColor(H, 0xcfcfcf); X.beard(H, 0xe6e6e6); X.glasses(H, 0x7a6a50); X.cane(H); return H; },
    woman: () => { const H = C.human({ shirt: 0xb83a4a, pants: 0xb83a4a }); skinTone(H, 0xeab99c); const hm = hairColor(H, 0x2a1810); X.longHair(H, hm); X.dress(H, 0xb83a4a); return H; },
    child: () => { const H = C.human({ shirt: 0xf2c230, pants: 0x3a5a8a }); H.head.scale.setScalar(1.3); H.group.scale.setScalar(0.6); hairColor(H, 0x6a4020); return H; },
    kazakh: () => { const H = C.human({ shirt: 0xf0ece0, pants: 0x2a2a2a }); X.chapan(H); X.taqiya(H); X.beard(H, 0x1a120c, false); return H; },
    spirit: () => C.human({ ghost: true }),
    // the patient in a coma: an old man in hospital pyjamas, eyes closed, oxygen cannula under the nose
    comaElder: () => {
      const H = C.human({ shirt: 0x86a8bd, pants: 0x5d7f96 }); hairColor(H, 0xd9d9d9); browColor(H, 0xcfcfcf); X.beard(H, 0xe6e6e6); H.eyes(1);
      const tubeM = std(0xeaf6ff, { roughness: 0.2, transparent: true, opacity: 0.85 });
      const c = add(H.head, new T3.TorusGeometry(0.085, 0.004, 8, 48, Math.PI * 1.1), tubeM, 0, -0.035, 0.0, 1.05, 1, 1.15); c.rotation.set(Math.PI / 2, 0, Math.PI * 0.95);
      [-1, 1].forEach((sg) => add(H.head, cap(0.004, 0.008, 6), tubeM, sg * 0.007, -0.037, 0.106).rotation.x = Math.PI / 2);
      return H;
    },
  };
  // doctor doing chest compressions (bpm), standing at the bed side
  C.cprPose = function (H, T, bpm = 110) {
    const ph = (T * bpm / 60) % 1, push = Math.exp(-Math.pow((ph - 0.25) / 0.16, 2));
    H.group.rotation.order = 'YXZ'; H.group.rotation.x = 0.55 + push * 0.12;
    H.arms.forEach(({ sh, el, s }) => { sh.rotation.set(-1.15 - push * 0.05, 0, -s * 0.28); el.rotation.set(-0.1, 0, 0); });
    H.head.rotation.x = 0.25;
  };
  C.X = X;
  C.character = function (name) { return (PRESETS[name] || PRESETS.patient)(); };
  C.characterNames = Object.keys(PRESETS);
})();
