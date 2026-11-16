// Shared building blocks for "НЕГЕ ҰЙЫҚТАЙ АЛМАЙСЫҢ?".
// Every scene is generated from these helpers so the character, the bedroom
// and the palette stay identical across the film. Run: node tools/build.mjs

export const C = {
  skin: '#f2c6a2', skinSh: '#d9997a', skinLid: '#e7ab88', blush: '#f2867f', nose: '#f5a993',
  hair: '#3b2418', hairHi: '#6e4632', hairSh: '#21130c',
  tee: '#a7acb1', teeSh: '#7c838a', trim: '#b8333c',
  eyeW: '#fbfaf5', pupil: '#1c1717', mouth: '#5c1d22', teeth: '#fff8ee', brow: '#2b180f',
  wallA: '#12304a', wallB: '#0a1b2b', wood: '#4a3226', woodD: '#2c1d16',
  pillow: '#86c9c6', pillowSh: '#4c9497', blanket: '#1f7b82', blanketD: '#125058', blanketHi: '#36a0a3',
  moon: '#f6f0d6', warm: '#ffb661', phone: '#5aa9ff',
};

// Mouth shapes share one command structure so GSAP can tween between them.
export const MOUTH = {
  grin: 'M-56 106 Q0 126 56 106 Q0 158 -56 106 Z',
  flat: 'M-34 118 Q0 121 34 118 Q0 129 -34 118 Z',
  frown: 'M-36 126 Q0 106 36 126 Q0 115 -36 126 Z',
  o: 'M-17 112 Q0 94 17 112 Q0 142 -17 112 Z',
  smile: 'M-40 110 Q0 136 40 110 Q0 124 -40 110 Z',
  sleep: 'M-24 117 Q0 129 24 117 Q0 123 -24 117 Z',
};

// Seeded PRNG (mulberry32) so every generated particle is identical on every build.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const r1 = (n) => Math.round(n * 10) / 10;

// ---------- character: head ----------
export function head(p) {
  const R = rng(7);
  // hair mass: curls around the top of the skull
  let back = '', curls = '';
  for (let i = 0; i <= 16; i++) {
    const th = Math.PI + (Math.PI * i) / 16;
    const rr = 54 + R() * 16;
    const x = Math.cos(th) * 168, y = -66 + Math.sin(th) * 168;
    back += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(rr)}"/>`;
    const cx = Math.cos(th) * 176, cy = -66 + Math.sin(th) * 176;
    curls += `<path d="M${r1(cx - 18)} ${r1(cy + 6)} q6 -26 26 -18 q16 10 2 24" />`;
  }
  const fringe = [[-96, -118, 44], [-48, -136, 46], [4, -142, 48], [56, -134, 46], [104, -112, 42], [-130, -84, 36], [136, -80, 36]]
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('');
  const fringeCurls = [[-110, -96], [-60, -112], [-8, -118], [46, -112], [96, -94]]
    .map(([x, y]) => `<path d="M${x} ${y} q8 -22 28 -12 q14 12 -4 24" />`).join('');
  const eye = (s, cx) => `
    <g transform="translate(${cx} -6)">
      <clipPath id="${p}-ec${s}"><ellipse cx="0" cy="0" rx="45" ry="52"/></clipPath>
      <ellipse cx="0" cy="0" rx="45" ry="52" fill="${C.eyeW}"/>
      <g clip-path="url(#${p}-ec${s})">
        <ellipse cx="0" cy="34" rx="45" ry="26" fill="#e6e2da" opacity="0.6"/>
        <g id="${p}-pup${s}" transform="translate(0 0)">
          <circle cx="${s === 'L' ? 6 : -6}" cy="6" r="15" fill="${C.pupil}"/>
          <circle cx="${s === 'L' ? 11 : -1}" cy="0" r="5" fill="#fff"/>
        </g>
        <g transform="translate(0 -56)"><rect id="${p}-lid${s}" transform="scale(1 0.3)" x="-52" y="0" width="104" height="113" fill="${C.skinLid}" stroke="#8a5238" stroke-width="5" vector-effect="non-scaling-stroke"/></g>
      </g>
      <ellipse cx="0" cy="0" rx="45" ry="52" fill="none" stroke="#3b2a22" stroke-width="3.5"/>
    </g>`;
  return `
  <g id="${p}-head">
    <g fill="${C.hair}">${back}<ellipse cx="0" cy="-90" rx="170" ry="120"/></g>
    <g fill="none" stroke="${C.hairHi}" stroke-width="6" stroke-linecap="round" opacity="0.8">${curls}</g>
    <ellipse cx="-142" cy="18" rx="40" ry="56" fill="${C.skin}"/><ellipse cx="-140" cy="20" rx="20" ry="32" fill="${C.skinSh}" opacity="0.7"/>
    <ellipse cx="142" cy="18" rx="40" ry="56" fill="${C.skin}"/><ellipse cx="140" cy="20" rx="20" ry="32" fill="${C.skinSh}" opacity="0.7"/>
    <ellipse cx="0" cy="22" rx="134" ry="160" fill="url(#${p}-skinG)"/>
    <ellipse cx="-86" cy="74" rx="28" ry="16" fill="${C.blush}" opacity="0.45"/>
    <ellipse cx="86" cy="74" rx="28" ry="16" fill="${C.blush}" opacity="0.45"/>
    ${eye('L', -50)}${eye('R', 50)}
    <g transform="translate(-96 -76)"><path id="${p}-browL" transform="rotate(0)" d="M0 0 Q34 -16 74 -6" fill="none" stroke="${C.brow}" stroke-width="14" stroke-linecap="round"/></g>
    <g transform="translate(96 -76)"><path id="${p}-browR" transform="rotate(0)" d="M0 0 Q-34 -16 -74 -6" fill="none" stroke="${C.brow}" stroke-width="14" stroke-linecap="round"/></g>
    <ellipse cx="0" cy="56" rx="31" ry="26" fill="url(#${p}-noseG)"/>
    <ellipse cx="-9" cy="47" rx="10" ry="6" fill="#fff" opacity="0.5"/>
    <clipPath id="${p}-mclip"><path id="${p}-mclipPath" d="${MOUTH.flat}"/></clipPath>
    <path id="${p}-mouth" d="${MOUTH.flat}" fill="${C.mouth}" stroke="#3a1215" stroke-width="3" stroke-linejoin="round"/>
    <g clip-path="url(#${p}-mclip)"><rect x="-60" y="96" width="120" height="20" fill="${C.teeth}"/></g>
    <g id="${p}-fringe">
      <g fill="${C.hair}">${fringe}</g>
      <g fill="none" stroke="${C.hairHi}" stroke-width="6" stroke-linecap="round" opacity="0.85">${fringeCurls}</g>
    </g>
    <path id="${p}-sweat" d="M118 -40 q10 18 0 26 q-10 -8 0 -26z" fill="#bfe6ff" opacity="0"/>
  </g>`;
}

export function charDefs(p) {
  return `
  <radialGradient id="${p}-skinG" cx="45%" cy="40%" r="70%"><stop offset="0" stop-color="#f8d6b8"/><stop offset="0.75" stop-color="${C.skin}"/><stop offset="1" stop-color="${C.skinSh}"/></radialGradient>
  <radialGradient id="${p}-noseG" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ffc4b0"/><stop offset="1" stop-color="#e48c78"/></radialGradient>
  <linearGradient id="${p}-teeG" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.tee}"/><stop offset="1" stop-color="${C.teeSh}"/></linearGradient>`;
}

// ---------- character: arms (rig: upper arm rotates at shoulder, forearm at elbow) ----------
export const ARM = { l1: 150, l2: 140, shoulderL: [-140, 232], shoulderR: [140, 232] };
function arm(p, s, extra = '') {
  const [sx, sy] = s === 'L' ? ARM.shoulderL : ARM.shoulderR;
  return `
  <g transform="translate(${sx} ${sy})"><g id="${p}-u${s}" transform="rotate(0)">
    <line x1="0" y1="40" x2="0" y2="${ARM.l1}" stroke="${C.skin}" stroke-width="44" stroke-linecap="round"/>
    <g transform="translate(0 ${ARM.l1})"><g id="${p}-f${s}" transform="rotate(0)">
      <line x1="0" y1="0" x2="0" y2="${ARM.l2 - 12}" stroke="${C.skin}" stroke-width="40" stroke-linecap="round"/>
      <g transform="translate(0 ${ARM.l2})">
        ${extra}
        <ellipse cx="0" cy="4" rx="30" ry="33" fill="${C.skin}" stroke="${C.skinSh}" stroke-width="3"/>
        <g id="${p}-th${s}" transform="translate(0 0)"><ellipse cx="${s === 'L' ? 24 : -24}" cy="-8" rx="11" ry="20" fill="${C.skin}" stroke="${C.skinSh}" stroke-width="3"/></g>
      </g>
    </g></g>
    <path d="M-38 -16 Q-44 60 -30 96 L30 96 Q44 60 38 -16 Q0 -34 -38 -16Z" fill="url(#${p}-teeG)"/>
    <path d="M-31 86 L31 86 L30 100 L-30 100Z" fill="${C.trim}"/>
  </g></g>`;
}

// Upper body (head + torso + arms), pivoting at the hips (0,560) for leaning and lying down.
export function upperBody(p, { handL = '', handR = '', front = '' } = {}) {
  return `
  <g transform="translate(0 560)"><g id="${p}-upper" transform="translate(0 0) rotate(0)"><g transform="translate(0 -560)">
    <g id="${p}-chest" transform="translate(0 0)">
      <rect x="-30" y="140" width="60" height="80" fill="${C.skinSh}"/>
      <path d="M-150 236 Q-146 206 -60 196 L60 196 Q146 206 150 236 L176 600 L-176 600Z" fill="url(#${p}-teeG)"/>
      <path d="M-60 198 Q0 262 60 198" fill="none" stroke="${C.trim}" stroke-width="15" stroke-linecap="round"/>
      <path d="M-40 330 Q0 350 40 330" fill="none" stroke="${C.teeSh}" stroke-width="4" opacity="0.5"/>
    </g>
    <g transform="translate(0 150)"><g id="${p}-neck" transform="rotate(0)"><g transform="translate(0 -150)">
      ${head(p)}
    </g></g></g>
    ${arm(p, 'L', handL)}${arm(p, 'R', handR)}
    ${front}
  </g></g></g>`;
}

// ---------- IK / FK in the upper body's local frame ----------
const D = Math.PI / 180;
const rot = ([x, y], deg) => [x * Math.cos(deg * D) - y * Math.sin(deg * D), x * Math.sin(deg * D) + y * Math.cos(deg * D)];
const dirOf = (deg, L) => [-Math.sin(deg * D) * L, Math.cos(deg * D) * L];
// char-space point -> upper-body local point, for a given slide and lean
export function toUpperLocal([x, y], slide = 0, lean = 0) {
  const v = rot([x, y - 560 - slide], -lean);
  return [v[0], v[1] + 560];
}
export function fromUpperLocal([x, y], slide = 0, lean = 0) {
  const v = rot([x, y - 560], lean);
  return [v[0], v[1] + 560 + slide];
}
// Two-link IK. Returns {u, f} (upper rotation, forearm rotation relative to upper) in degrees.
export function ik(side, target, { slide = 0, lean = 0, bend = null } = {}) {
  const S = side === 'L' ? ARM.shoulderL : ARM.shoulderR;
  const T = toUpperLocal(target, slide, lean);
  const { l1, l2 } = ARM;
  let dx = T[0] - S[0], dy = T[1] - S[1];
  let d = Math.hypot(dx, dy);
  const maxd = l1 + l2 - 2;
  if (d > maxd) { dx *= maxd / d; dy *= maxd / d; d = maxd; }
  const phi = Math.atan2(-dx, dy) / D;
  const a = Math.acos(Math.min(1, Math.max(-1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)))) / D;
  const sign = bend ?? (side === 'L' ? 1 : -1); // elbows point outward
  const u = phi + sign * a;
  const E = [S[0] + dirOf(u, l1)[0], S[1] + dirOf(u, l1)[1]];
  const fAbs = Math.atan2(-(S[0] + dx - E[0]), S[1] + dy - E[1]) / D;
  return { u: r1(u), f: r1(fAbs - u) };
}
// FK: hand position (upper-local) and absolute forearm angle
export function fk(side, { u, f }) {
  const S = side === 'L' ? ARM.shoulderL : ARM.shoulderR;
  const E = [S[0] + dirOf(u, ARM.l1)[0], S[1] + dirOf(u, ARM.l1)[1]];
  const H = [E[0] + dirOf(u + f, ARM.l2)[0], E[1] + dirOf(u + f, ARM.l2)[1]];
  return { H, ang: u + f };
}
// Place a prop that sits at upper-local point P (rotation pr) into the hand's local frame.
export function propInHand(side, pose, P, pr = 0) {
  const { H, ang } = fk(side, pose);
  const v = rot([P[0] - H[0], P[1] - H[1]], -ang);
  return { x: r1(v[0]), y: r1(v[1]), r: r1(pr - ang) };
}

// ---------- the bedroom (front view, camera at the foot of the bed) ----------
// World 1080x1920. Character origin (head centre) at (540, 760).
export function bedroomDefs(p) {
  return `
  <linearGradient id="${p}-wallG" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#173a57"/><stop offset="1" stop-color="${C.wallB}"/></linearGradient>
  <linearGradient id="${p}-skyG" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#0a1a3a"/><stop offset="1" stop-color="#23497a"/></linearGradient>
  <radialGradient id="${p}-moonGlow"><stop offset="0" stop-color="#fff6d8" stop-opacity="0.9"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>
  <linearGradient id="${p}-beamG" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#cfe3ff" stop-opacity="0.55"/><stop offset="1" stop-color="#cfe3ff" stop-opacity="0"/></linearGradient>
  <linearGradient id="${p}-woodG" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#5a3d2d"/><stop offset="1" stop-color="${C.woodD}"/></linearGradient>
  <linearGradient id="${p}-pilG" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#9fdcd8"/><stop offset="1" stop-color="${C.pillowSh}"/></linearGradient>
  <linearGradient id="${p}-blG" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.blanketHi}"/><stop offset="0.18" stop-color="${C.blanket}"/><stop offset="1" stop-color="#0b3a41"/></linearGradient>
  <radialGradient id="${p}-lampG"><stop offset="0" stop-color="#ffd08a" stop-opacity="0.85"/><stop offset="0.4" stop-color="#ffb661" stop-opacity="0.32"/><stop offset="1" stop-color="#ffb661" stop-opacity="0"/></radialGradient>
  <radialGradient id="${p}-phoneG"><stop offset="0" stop-color="#7cc4ff" stop-opacity="0.75"/><stop offset="1" stop-color="#3a8cff" stop-opacity="0"/></radialGradient>
  <radialGradient id="${p}-vig" cx="50%" cy="45%" r="75%"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#01040a" stop-opacity="0.85"/></radialGradient>`;
}

export function dust(p, n, box, seed) {
  const R = rng(seed);
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = box[0] + R() * box[2], y = box[1] + R() * box[3], r = 1.5 + R() * 3;
    s += `<circle id="${p}-d${i}" class="${p}-dust" cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="#dfeeff" opacity="${r1(0.15 + R() * 0.5)}"/>`;
  }
  return s;
}

export function bedroom(p, { charInner, clock = '02:47', stand = '', standL = '', blanketFront = '' }) {
  return `
  <rect x="-400" y="-400" width="1880" height="2800" fill="url(#${p}-wallG)"/>
  <g opacity="0.06" stroke="#9fc6e8" stroke-width="2">${Array.from({ length: 22 }, (_, i) => `<line x1="${-300 + i * 80}" y1="-300" x2="${-300 + i * 80}" y2="1300"/>`).join('')}</g>
  <!-- window -->
  <g id="${p}-window">
    <rect x="590" y="150" width="360" height="450" rx="10" fill="#26303f"/>
    <rect x="610" y="170" width="320" height="410" fill="url(#${p}-skyG)"/>
    <circle cx="825" cy="290" r="110" fill="url(#${p}-moonGlow)"/>
    <circle cx="825" cy="290" r="44" fill="${C.moon}"/>
    <circle cx="812" cy="280" r="8" fill="#e2d9b8"/><circle cx="836" cy="302" r="6" fill="#e2d9b8"/>
    ${[[650, 210], [700, 330], [890, 420], [660, 470], [760, 210], [900, 200], [720, 540]].map(([x, y], i) => `<circle id="${p}-ws${i}" cx="${x}" cy="${y}" r="3" fill="#fff"/>`).join('')}
    <rect x="764" y="170" width="12" height="410" fill="#26303f"/><rect x="610" y="370" width="320" height="12" fill="#26303f"/>
    <rect x="580" y="596" width="380" height="18" rx="4" fill="#323c4c"/>
  </g>
  <g id="${p}-curtL" transform="translate(600 140) skewX(0)"><path d="M-70 0 L40 0 Q20 220 46 470 L-70 470Z" fill="#2c5568"/><path d="M-30 0 Q-40 230 -20 470" stroke="#21455a" stroke-width="10" fill="none"/></g>
  <g id="${p}-curtR" transform="translate(940 140) skewX(0)"><path d="M70 0 L-40 0 Q-20 220 -46 470 L70 470Z" fill="#2c5568"/><path d="M30 0 Q40 230 20 470" stroke="#21455a" stroke-width="10" fill="none"/></g>
  <!-- sconce lamp with pull cord, over the right nightstand -->
  <g id="${p}-lamp">
    <rect x="958" y="760" width="16" height="70" fill="#3a2c22"/>
    <path d="M900 780 L1032 780 L1006 700 L926 700Z" fill="#f2d7a6"/>
    <path d="M900 780 L1032 780 L1006 700 L926 700Z" fill="#000" id="${p}-shadeDark" opacity="0"/>
    <g transform="translate(930 780)"><g id="${p}-cord" transform="translate(0 0)"><line x1="0" y1="0" x2="0" y2="250" stroke="#d8c7a0" stroke-width="3"/><circle cx="0" cy="256" r="10" fill="#c99a52"/></g></g>
  </g>
  <!-- moonbeam -->
  <path id="${p}-beam" d="M610 600 L930 600 L1020 1900 L300 1900Z" fill="url(#${p}-beamG)" opacity="0.32" style="mix-blend-mode:screen"/>
  <!-- headboard -->
  <path d="M110 1150 L110 820 Q110 760 170 760 L910 760 Q970 760 970 820 L970 1150Z" fill="url(#${p}-woodG)"/>
  <g stroke="#2a1b14" stroke-width="5" opacity="0.6">${[250, 390, 540, 690, 830].map((x) => `<line x1="${x}" y1="790" x2="${x}" y2="1140"/>`).join('')}</g>
  <rect x="96" y="745" width="888" height="34" rx="14" fill="#5d4130"/>
  <!-- pillows -->
  <rect x="140" y="930" width="420" height="220" rx="80" fill="url(#${p}-pilG)"/>
  <rect x="520" y="936" width="420" height="214" rx="80" fill="url(#${p}-pilG)"/>
  <path d="M200 1080 Q350 1110 520 1078" stroke="#5aa4a5" stroke-width="6" fill="none" opacity="0.6"/>
  <!-- character -->
  <g transform="translate(540 760)">${charInner}</g>
  <!-- blanket -->
  <g transform="translate(0 1230)"><g id="${p}-blanket" transform="translate(0 0)">
    <path d="M120 10 Q300 -14 540 0 Q780 -14 960 10 L1010 760 L70 760Z" fill="url(#${p}-blG)"/>
    <path d="M120 10 Q300 -14 540 0 Q780 -14 960 10 L962 46 Q760 26 540 40 Q300 26 118 46Z" fill="${C.blanketHi}" opacity="0.8"/>
    <g fill="none" stroke="#0d434b" stroke-width="7" stroke-linecap="round" opacity="0.7">
      <path d="M260 120 Q330 300 300 520"/><path d="M620 140 Q560 330 640 560"/><path d="M820 110 Q880 260 860 480"/>
    </g>
    ${blanketFront}
  </g></g>
  <!-- left nightstand -->
  <g>
    <rect x="-60" y="1180" width="210" height="420" rx="8" fill="#3d2a20"/>
    <rect x="-60" y="1168" width="222" height="24" rx="6" fill="#5a3d2d"/>
    <rect x="-40" y="1240" width="170" height="110" rx="6" fill="#33231b"/><circle cx="45" cy="1295" r="8" fill="#a07a4a"/>
    <rect x="-20" y="1128" width="110" height="20" rx="3" fill="#7a3f3a"/><rect x="-10" y="1148" width="96" height="20" rx="3" fill="#3f5f7a"/>
    ${standL}
  </g>
  <!-- right nightstand with the clock -->
  <g>
    <rect x="930" y="1180" width="220" height="420" rx="8" fill="#3d2a20"/>
    <rect x="918" y="1168" width="230" height="24" rx="6" fill="#5a3d2d"/>
    <rect x="950" y="1240" width="170" height="110" rx="6" fill="#33231b"/><circle cx="1035" cy="1295" r="8" fill="#a07a4a"/>
    <g id="${p}-clock">
      <rect x="922" y="1072" width="150" height="96" rx="16" fill="#1b1f27" stroke="#3b4250" stroke-width="4"/>
      <rect x="934" y="1084" width="126" height="72" rx="8" fill="#0b0f14"/>
      <text id="${p}-clockT" x="997" y="1136" text-anchor="middle" font-family="KzMono, monospace" font-size="44" font-weight="700" fill="#ff4d4d" letter-spacing="2">${clock}</text>
      <rect id="${p}-clockGlow" x="922" y="1072" width="150" height="96" rx="16" fill="#ff4d4d" opacity="0.08"/>
    </g>
    ${stand}
  </g>`;
}

export const FONT_CSS = `
  @font-face { font-family: "KzSans"; font-weight: 500; src: url("assets/fonts/montserrat-cyrillic-ext-500-normal.woff2") format("woff2"); unicode-range: U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F; }
  @font-face { font-family: "KzSans"; font-weight: 500; src: url("assets/fonts/montserrat-cyrillic-500-normal.woff2") format("woff2"); unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116; }
  @font-face { font-family: "KzSans"; font-weight: 500; src: url("assets/fonts/montserrat-latin-500-normal.woff2") format("woff2"); unicode-range: U+0000-00FF, U+2000-206F; }
  @font-face { font-family: "KzSans"; font-weight: 600; src: url("assets/fonts/montserrat-cyrillic-ext-600-normal.woff2") format("woff2"); unicode-range: U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F; }
  @font-face { font-family: "KzSans"; font-weight: 600; src: url("assets/fonts/montserrat-cyrillic-600-normal.woff2") format("woff2"); unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116; }
  @font-face { font-family: "KzSans"; font-weight: 600; src: url("assets/fonts/montserrat-latin-600-normal.woff2") format("woff2"); unicode-range: U+0000-00FF, U+2000-206F; }
  @font-face { font-family: "KzSans"; font-weight: 800; src: url("assets/fonts/montserrat-cyrillic-ext-800-normal.woff2") format("woff2"); unicode-range: U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F; }
  @font-face { font-family: "KzSans"; font-weight: 800; src: url("assets/fonts/montserrat-cyrillic-800-normal.woff2") format("woff2"); unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116; }
  @font-face { font-family: "KzSans"; font-weight: 800; src: url("assets/fonts/montserrat-latin-800-normal.woff2") format("woff2"); unicode-range: U+0000-00FF, U+2000-206F; }
  @font-face { font-family: "KzMono"; font-weight: 700; src: url("assets/fonts/montserrat-latin-800-normal.woff2") format("woff2"); }`;

// Runtime helpers shared by every scene script (plain JS, injected verbatim).
export const RIG_JS = `
  function A(tl,id,attrs,t,d,ease){ tl.to('#'+id,{attr:attrs,duration:d,ease:ease||'power2.inOut'},t); }
  function R(tl,id,deg,t,d,ease){ A(tl,id,{transform:'rotate('+deg+')'},t,d,ease); }
  function TR(tl,id,x,y,t,d,ease){ A(tl,id,{transform:'translate('+x+' '+y+')'},t,d,ease); }
  function UP(tl,p,slide,lean,t,d,ease){ A(tl,p+'-upper',{transform:'translate(0 '+slide+') rotate('+lean+')'},t,d,ease); }
  function ARMP(tl,p,s,pose,t,d,ease){ R(tl,p+'-u'+s,pose.u,t,d,ease); R(tl,p+'-f'+s,pose.f,t+d*0.12,d*0.88,ease); }
  function ARMK(tl,p,s,mv,t,d){ var n=mv.u.length-1; tl.to('#'+p+'-u'+s,{keyframes:mv.u.slice(1).map(function(v){return {attr:{transform:'rotate('+v+')'},duration:d/n,ease:'none'};})},t); tl.to('#'+p+'-f'+s,{keyframes:mv.f.slice(1).map(function(v){return {attr:{transform:'rotate('+v+')'},duration:d/n,ease:'none'};})},t); }
  function PROPK(tl,id,arr,t,d){ var n=arr.length-1; tl.to('#'+id,{keyframes:arr.slice(1).map(function(v){return {attr:{transform:v},duration:d/n,ease:'none'};})},t); }
  function lids(tl,p,s,t,d,ease){ A(tl,p+'-lidL',{transform:'scale(1 '+s+')'},t,d,ease); A(tl,p+'-lidR',{transform:'scale(1 '+s+')'},t+0.02,d,ease); }
  function blink(tl,p,t,rest){ ['L','R'].forEach(function(s,i){ var o=i*0.012; tl.to('#'+p+'-lid'+s,{attr:{transform:'scale(1 1)'},duration:0.07,ease:'power2.in'},t+o); tl.to('#'+p+'-lid'+s,{attr:{transform:'scale(1 '+rest+')'},duration:0.12,ease:'power2.out'},t+o+0.07); }); }
  function look(tl,p,x,y,t,d){ TR(tl,p+'-pupL',x,y,t,d||0.22,'power3.out'); TR(tl,p+'-pupR',x,y,t+0.02,d||0.22,'power3.out'); }
  function mouth(tl,p,shape,t,d){ A(tl,p+'-mouth',{d:M[shape]},t,d||0.25); A(tl,p+'-mclipPath',{d:M[shape]},t,d||0.25); }
  function brows(tl,p,l,r,t,d){ R(tl,p+'-browL',l,t,d||0.3); R(tl,p+'-browR',r,t+0.04,d||0.3); }
  function neck(tl,p,deg,t,d,ease){ R(tl,p+'-neck',deg,t,d,ease); }
  function yoyo(tl,sel,fromV,toV,start,end,period){ var n=Math.max(1,Math.floor((end-start)/(period/2))); toV.duration=period/2; toV.yoyo=true; toV.repeat=n-1; if(!toV.ease) toV.ease='sine.inOut'; tl.fromTo(sel,fromV,toV,start); }
  function INIT(sel,vars){ gsap.set(sel,vars); tl.set(sel,vars,0); }
  function camSet(tl,el,fx,fy,s){ INIT(el,{x:540-fx*s,y:960-fy*s,scale:s,transformOrigin:'0 0'}); }
  function camTo(tl,el,fx,fy,s,t,d,ease){ tl.to(el,{x:540-fx*s,y:960-fy*s,scale:s,duration:d,ease:ease||'power2.inOut'},t); }
  function breathe(tl,p,start,end,period,amt){ yoyo(tl,'#'+p+'-chest',{attr:{transform:'translate(0 0)'}},{attr:{transform:'translate(0 '+(-amt)+')'}},start,end,period); }
  function dustDrift(tl,cls,start,end){ var els=document.querySelectorAll('.'+cls); for(var i=0;i<els.length;i++){ var ph=(i*0.37)%1; yoyo(tl,els[i],{y:0,x:0},{y:-24-(i%5)*6,x:(i%2?10:-10)},start+ph*0.6,end,3.2+(i%4)*0.7); } }
`;

export function scene({ id, css = '', body, script, consts = {} }) {
  const constJs = Object.entries(consts).map(([k, v]) => `const ${k} = ${JSON.stringify(v)};`).join('\n    ');
  return `<template>
  <style>
    ${FONT_CSS}
    #root { position: absolute; inset: 0; overflow: hidden; background: #050c16; }
    .cam { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; transform-origin: 0 0; }
    .cam svg { position: absolute; left: 0; top: 0; overflow: visible; }
    ${css}
  </style>
  <div id="root" data-composition-id="${id}" data-width="1080" data-height="1920" data-layout-allow-overflow data-layout-allow-overlap>
${body}
  </div>
  <script>
    (function () {
    ${RIG_JS}
    const M = ${JSON.stringify(MOUTH)};
    ${constJs}
    const tl = gsap.timeline({ paused: true });
${script}
    window.__timelines["${id}"] = tl;
    })();
  </script>
</template>
`;
}
