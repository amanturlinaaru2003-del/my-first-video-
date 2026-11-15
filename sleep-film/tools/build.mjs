// Generates index.html and compositions/*.html for "НЕГЕ ҰЙЫҚТАЙ АЛМАЙСЫҢ?".
// node tools/build.mjs   (from the project folder)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { C, MOUTH, rng, r1, head, charDefs, upperBody, ik, fk, propInHand, bedroomDefs, bedroom, dust, scene, FONT_CSS } from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = (f, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true }); fs.writeFileSync(path.join(ROOT, f), s); console.log('wrote', f); };
const narration = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/narration.json'), 'utf8'));

// ---------------------------------------------------------------- poses (char space, head centre = 0,0; world = char + (540,760))
const W = ([x, y]) => [x - 540, y - 760]; // world -> char
const POSE = {
  holdL: ik('L', [-44, 398]), holdR: ik('R', [44, 398]),
  restL: ik('L', [-120, 470]), restR: ik('R', [120, 470]),
  lapR: ik('R', [70, 462]),
  mugGrab: ik('L', W([86, 1128]), { lean: -14 }),
  mugDrink: ik('L', [-62, 150]),
  phonePlace: ik('R', W([968, 1150]), { lean: 12 }),
  cordGrab: ik('R', W([930, 1036]), { lean: 5 }),
  cordPull: ik('R', W([930, 1064]), { lean: 5 }),
  down: { u: 0, f: 0 },
};
const ang = (side, pose) => fk(side, pose).ang;
// ---------------------------------------------------------------- hand paths
// Each move slides the hand along an eased straight path and solves the elbow at every sample,
// choosing the solution closest to the previous one, so arms never swing through odd poses.
const TGT = { holdL: [-44, 398], holdR: [44, 398], restL: [-120, 470], lapR: [70, 462], mugStand: W([128, 1128]), mouth: [30, 178], front: [-210, 430],
  place: W([968, 1150]), cord: W([930, 1036]), pull: W([930, 1064]), downL: [-140, 522], downR: [140, 522] };
const ease2 = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const easeIn2 = (x) => x * x;
const norm = (a, ref) => { while (a - ref > 180) a -= 360; while (a - ref < -180) a += 360; return a; };
function move(side, A, B, la, lb, prev, { n = 12, easeFn = ease2, prop = null } = {}) {
  const u = [prev.u], f = [prev.f], props = [];
  let pu = prev.u, pf = prev.f;
  if (prop) props.push(prop(prev, la, 0));
  // A may be a list of waypoints [start, via..., end] when B is null
  const pts = B ? [A, B] : A;
  const segs = []; let total = 0;
  for (let j = 1; j < pts.length; j++) { const L = Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]); segs.push(L); total += L; }
  const at = (k) => { let d = k * total; for (let j = 0; j < segs.length; j++) { if (d <= segs[j] || j === segs.length - 1) { const q = segs[j] ? Math.min(1, d / segs[j]) : 1; return [pts[j][0] + (pts[j + 1][0] - pts[j][0]) * q, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * q]; } d -= segs[j]; } };
  for (let i = 1; i <= n; i++) {
    const k = easeFn(i / n);
    const T = at(k), lean = la + (lb - la) * k;
    let best = null;
    for (const b of [1, -1]) {
      const sol = ik(side, T, { lean, bend: b });
      const su = norm(sol.u, pu), sf = norm(sol.f, pf), c = Math.abs(su - pu) + Math.abs(sf - pf);
      if (!best || c < best.c) best = { u: r1(su), f: r1(sf), c };
    }
    u.push(best.u); f.push(best.f); pu = best.u; pf = best.f;
    if (prop) props.push(prop({ u: best.u, f: best.f }, lean, k));
  }
  return { u, f, props, end: { u: pu, f: pf } };
}
const L0 = POSE.holdL, R0 = POSE.holdR;
const phRot = (pose, lean, tilt, sq = 1) => `rotate(${r1(-(ang('R', pose) - ang('R', R0)) - lean + tilt)}) scale(1 ${r1(sq * 100) / 100})`;
const PH_IN_R = propInHand('R', R0, [0, 392], 0);
const MV = {};
MV.m1 = move('R', TGT.holdR, TGT.lapR, 0, 0, R0, { n: 8, prop: (q, l, k) => phRot(q, l, -10 * k) });
MV.m2 = move('L', TGT.holdL, TGT.mugStand, 0, -14, L0);
const GRAB = MV.m2.end;
const mugStandWorld = [86, 1128];
const mugLocalAtGrab = (() => { const c = W(mugStandWorld); const th = 14 * Math.PI / 180; const v = [c[0], c[1] - 560];
  return [v[0] * Math.cos(th) - v[1] * Math.sin(th), v[0] * Math.sin(th) + v[1] * Math.cos(th) + 560]; })();
const MUG_IN_L = propInHand('L', GRAB, mugLocalAtGrab, -14);
const mugRot = (pose, lean, tilt = 0) => `rotate(${r1(-(ang('L', pose) - ang('L', GRAB)) - (lean + 14) + tilt)})`;
MV.m3 = move('L', [TGT.mugStand, TGT.front, TGT.mouth], null, -14, 0, GRAB, { n: 16, prop: (q, l) => mugRot(q, l) });
const DRINK = MV.m3.end;
MV.m4 = move('L', [TGT.mouth, TGT.front, TGT.mugStand], null, 0, -14, DRINK, { n: 16, prop: (q, l) => mugRot(q, l) });
MV.m5 = move('L', TGT.mugStand, TGT.restL, -14, 0, MV.m4.end);
MV.m6 = move('R', TGT.lapR, TGT.place, 0, 12, MV.m1.end, { prop: (q, l, k) => phRot(q, l, -10 + 100 * k, 1 - 0.75 * Math.max(0, (k - 0.5) * 2)) });
MV.m7 = move('R', TGT.place, TGT.cord, 12, 5, MV.m6.end, { n: 8 });
MV.m8 = move('R', TGT.cord, TGT.pull, 5, 5, MV.m7.end, { n: 4, easeFn: easeIn2 });
MV.m9R = move('R', TGT.pull, TGT.downR, 5, 0, MV.m8.end, { n: 8 });
MV.m9L = move('L', TGT.restL, TGT.downL, 0, 0, MV.m5.end, { n: 8 });
const SIP = (tilt) => mugRot(DRINK, 0, tilt);

// ---------------------------------------------------------------- shared props
const mugSVG = (steamId) => `
  <g>
    <g opacity="0.55" fill="none" stroke="#e8f2ff" stroke-width="5" stroke-linecap="round">
      <path class="${steamId}" d="M-12 -44 q-12 -18 0 -36 q12 -18 0 -36"/>
      <path class="${steamId}" d="M10 -40 q-12 -18 0 -36 q12 -18 0 -36"/>
    </g>
    <rect x="-30" y="-36" width="60" height="70" rx="10" fill="#e9e4da"/>
    <rect x="-30" y="-36" width="60" height="12" rx="6" fill="#4a2a1a"/>
    <path d="M30 -18 q24 0 24 18 q0 18 -24 18" fill="none" stroke="#e9e4da" stroke-width="10"/>
    <rect x="-22" y="-6" width="20" height="26" rx="4" fill="#c9a074" opacity="0.6"/>
  </g>`;
const feed = (p) => {
  const R = rng(31); let s = '';
  const cols = ['#ff6b8b', '#ffd166', '#06d6a0', '#7aa2ff', '#c77dff', '#ff9f43'];
  for (let i = 0; i < 18; i++) {
    const y = -70 + i * 62, c = cols[i % cols.length];
    s += `<rect x="-38" y="${y}" width="76" height="52" rx="8" fill="${c}" opacity="0.9"/>`;
    s += `<circle cx="-26" cy="${y + 12}" r="7" fill="#fff" opacity="0.8"/><rect x="-14" y="${y + 8}" width="${r1(30 + R() * 20)}" height="7" rx="3" fill="#fff" opacity="0.7"/>`;
    if (i % 3 === 1) s += `<path d="M18 ${y + 34} l6 -6 a4 4 0 0 1 6 6 l-6 6 l-6 -6 a4 4 0 0 1 6 -6z" fill="#fff"/>`;
  }
  return `<g id="${p}-feed" transform="translate(0 0)">${s}</g>`;
};
const phoneSVG = (p, withFeed) => `
  <rect x="-54" y="-94" width="108" height="188" rx="18" fill="#14171d" stroke="#2c323d" stroke-width="3"/>
  <clipPath id="${p}-scrClip"><rect x="-46" y="-84" width="92" height="168" rx="12"/></clipPath>
  <rect x="-46" y="-84" width="92" height="168" rx="12" fill="#0f2c55"/>
  ${withFeed ? `<g clip-path="url(#${p}-scrClip)">${feed(p)}</g>` : ''}
  <rect x="-46" y="-84" width="92" height="168" rx="12" fill="#7cc4ff" opacity="0.18"/>`;

// mini melatonin character (same design as scene 3, used as a thought in scene 4)
const melaSVG = (p, { awake = false } = {}) => `
  <g id="${p}-melaSq" transform="scale(1 1)">
    <ellipse cx="0" cy="0" rx="150" ry="140" fill="url(#${p}-melaGlow)"/>
    <path d="M0 -105 C80 -105 118 -40 118 20 C118 80 66 108 0 108 C-66 108 -118 80 -118 20 C-118 -40 -80 -105 0 -105Z" fill="url(#${p}-melaG)"/>
    <ellipse cx="-30" cy="-50" rx="40" ry="24" fill="#fff" opacity="0.28"/>
    <path d="M12 52 a26 26 0 1 0 0 -2 a20 20 0 1 1 0 2z" fill="#f6e7a8" opacity="0.85" transform="rotate(-20 0 60)"/>
    <g id="${p}-melaSleepy" opacity="${awake ? 0 : 1}" fill="none" stroke="#2a2a5a" stroke-width="6" stroke-linecap="round">
      <path d="M-56 -4 Q-38 12 -20 -4"/><path d="M20 -4 Q38 12 56 -4"/>
    </g>
    <g id="${p}-melaAwake" opacity="${awake ? 1 : 0}">
      <circle cx="-38" cy="-6" r="20" fill="#fff"/><circle cx="38" cy="-6" r="20" fill="#fff"/>
      <circle cx="-38" cy="-4" r="8" fill="#1d1d3a"/><circle cx="38" cy="-4" r="8" fill="#1d1d3a"/>
    </g>
    <ellipse cx="-66" cy="24" rx="16" ry="9" fill="#ff9ab8" opacity="0.6"/><ellipse cx="66" cy="24" rx="16" ry="9" fill="#ff9ab8" opacity="0.6"/>
    <g transform="translate(0 32)"><ellipse id="${p}-melaMouth" cx="0" cy="0" rx="12" ry="4" fill="#3b2050" transform="scale(1 1)"/></g>
    <g transform="translate(-20 -96)"><g id="${p}-melaCap" transform="rotate(0)">
      <path d="M-70 14 Q-30 -40 30 -36 Q80 -30 120 30 Q90 10 60 4 Q0 -4 -70 14Z" fill="#2c3a8a"/>
      <path d="M-74 10 Q0 -10 66 4 L66 18 Q0 4 -74 26Z" fill="#e8ecff"/>
      <circle cx="124" cy="34" r="16" fill="#ffe27a"/>
    </g></g>
  </g>`;
const melaDefs = (p) => `
  <radialGradient id="${p}-melaG" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#d6deff"/><stop offset="0.6" stop-color="#9aa9f5"/><stop offset="1" stop-color="#6271d6"/></radialGradient>
  <radialGradient id="${p}-melaGlow"><stop offset="0.5" stop-color="#9fb0ff" stop-opacity="0.45"/><stop offset="1" stop-color="#9fb0ff" stop-opacity="0"/></radialGradient>`;

const VIG = (p) => `<svg width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0;pointer-events:none"><defs><radialGradient id="${p}-v" cx="50%" cy="46%" r="72%"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#01040a" stop-opacity="0.8"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#${p}-v)"/></svg>`;

// blanket hands (lying pose): hands holding the blanket edge
const blanketHands = (p) => `<g id="${p}-bh" opacity="0">
  ${[[402, 6], [678, 6]].map(([x, y]) => `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="0" rx="40" ry="28" fill="${C.skin}" stroke="${C.skinSh}" stroke-width="3"/>${[-22, -8, 6, 20].map((fx) => `<line x1="${fx}" y1="-4" x2="${fx}" y2="18" stroke="${C.skinSh}" stroke-width="3" stroke-linecap="round"/>`).join('')}</g>`).join('')}
</g>`;

// =============================================================================================== S1
function s1() {
  const p = 's1';
  const body = `
    <div id="s1-cam" class="cam"><svg width="1080" height="1920" viewBox="0 0 1080 1920">
      <defs>${charDefs(p)}${bedroomDefs(p)}</defs>
      ${bedroom(p, {
        charInner: upperBody(p),
        clock: '02:47',
        standL: `<g transform="translate(86 1128)">${mugSVG('s1-steam')}</g>`,
        stand: `<rect x="940" y="1160" width="100" height="12" rx="4" fill="#14171d"/>`,
        blanketFront: blanketHands(p),
      })}
      <g>${dust(p, 26, [420, 640, 520, 1100], 11)}</g>
    </svg></div>
    ${VIG(p)}
    <div id="s1-title">
      <div class="tl"><span class="tw" id="s1-t1">НЕГЕ</span> <span class="tw" id="s1-t2">ҰЙЫҚТАЙ</span></div>
      <div class="tl hot"><span class="tw" id="s1-t3">АЛМАЙСЫҢ?</span></div>
    </div>`;
  const css = `
    #s1-title { position: absolute; left: 0; top: 300px; width: 1080px; text-align: center; font-family: "KzSans", sans-serif; font-weight: 800; color: #f6f1e7; font-size: 86px; line-height: 1.08; letter-spacing: -0.01em; text-shadow: 0 6px 30px rgba(0,0,0,0.65), 0 0 2px rgba(0,0,0,0.6); }
    #s1-title .hot { color: #ffbf6b; }
    .tw { display: inline-block; }`;
  const script = `
    const p='s1', cam='#s1-cam';
    // lying awake: slid down onto the pillow, hands on the blanket
    INIT('#s1-upper',{attr:{transform:'translate(0 260) rotate(0)'}});
    INIT('#s1-bh',{opacity:1});
    INIT('#s1-shadeDark',{opacity:0.5});
    camSet(tl,cam,540,960,1);
    // camera: slow dolly toward the eyes, then dive into the left pupil
    camTo(tl,cam,535,1000,2.35,0.05,4.35,'power1.inOut');
    camTo(tl,cam,496,1020,34,4.4,1.0,'power3.in');
    // face acting
    INIT(['#'+p+'-lidL','#'+p+'-lidR'],{attr:{transform:'scale(1 0.34)'}});
    mouth(tl,p,'frown',0.55,0.4);
    look(tl,p,12,5,1.0,0.35);            // glance at the clock
    brows(tl,p,-18,18,1.6,0.45);         // worry
    blink(tl,p,2.15,0.34);
    look(tl,p,0,0,2.55,0.3);             // back to us
    lids(tl,p,0.12,2.85,0.35,'power2.out'); // wide, frustrated
    mouth(tl,p,'grin',2.9,0.35);
    blink(tl,p,3.6,0.12);
    neck(tl,p,-3,0.4,1.6,'sine.inOut'); neck(tl,p,2,2.0,1.8,'sine.inOut');
    // breathing under the blanket, curls, curtains, dust, stars
    yoyo(tl,'#s1-blanket',{attr:{transform:'translate(0 0)'}},{attr:{transform:'translate(0 -7)'}},0,5.6,3.2);
    yoyo(tl,'#s1-fringe',{attr:{transform:'rotate(0)'}},{attr:{transform:'rotate(1.4)'}},0.2,5.6,2.6);
    yoyo(tl,'#s1-curtL',{attr:{transform:'translate(600 140) skewX(0)'}},{attr:{transform:'translate(600 140) skewX(2.2)'}},0,5.6,2.8);
    yoyo(tl,'#s1-curtR',{attr:{transform:'translate(940 140) skewX(0)'}},{attr:{transform:'translate(940 140) skewX(-1.8)'}},0.3,5.6,3.1);
    dustDrift(tl,'s1-dust',0,5.6);
    for (var i=0;i<7;i++) yoyo(tl,'#s1-ws'+i,{opacity:1},{opacity:0.25},i*0.21,5.6,1.1+i*0.13);
    yoyo(tl,'.s1-steam',{y:0,opacity:0.6},{y:-14,opacity:0.15},0,5.6,1.6);
    // the clock ticks every second
    for (var k=0;k<5;k++){ tl.fromTo('#s1-clockGlow',{opacity:0.3},{opacity:0.06,duration:0.45,ease:'power2.out'},0.95+k); }
    // title: on screen at frame 0 (the hook), leaves word by word as the camera pushes in
    ['#s1-t1','#s1-t2','#s1-t3'].forEach(function(s,i){ tl.fromTo(s,{opacity:1,filter:'blur(0px)',y:0},{opacity:0,filter:'blur(10px)',y:-18,duration:0.3,ease:'power2.in'},3.95+i*0.08); });`;
  return scene({ id: 's1', css, body, script });
}

// =============================================================================================== S2
function s2() {
  const p = 's2';
  const R = rng(5);
  // neural tunnel layers
  const layer = (seed, n, rr) => {
    const r = rng(seed); const pts = [];
    for (let i = 0; i < n; i++) pts.push([r() * 1500 - 210, r() * 2300 - 190]);
    let lines = '', nodes = '';
    pts.forEach((a, i) => {
      const near = pts.map((b, j) => [Math.hypot(a[0] - b[0], a[1] - b[1]), j]).sort((x, y) => x[0] - y[0]).slice(1, 3);
      near.forEach(([, j]) => { if (j > i) lines += `<line x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(pts[j][0])}" y2="${r1(pts[j][1])}"/>`; });
      nodes += `<circle cx="${r1(a[0])}" cy="${r1(a[1])}" r="${r1(rr * (0.6 + r() * 0.8))}"/>`;
    });
    return { lines, nodes, pts };
  };
  const L = [layer(41, 46, 5), layer(42, 34, 8), layer(43, 22, 12)];
  // brain silhouette + gyri
  const outline = (() => { let d = ''; for (let i = 0; i <= 120; i++) { const t = (i / 120) * Math.PI * 2; const rr = 1 + 0.045 * Math.sin(t * 11) + 0.03 * Math.sin(t * 5 + 1); const x = Math.cos(t) * 300 * rr, y = Math.sin(t) * 212 * rr * (Math.sin(t) > 0 ? 0.92 : 1); d += (i ? 'L' : 'M') + r1(x) + ' ' + r1(y); } return d + 'Z'; })();
  const gyri = []; for (let i = 0; i < 11; i++) { const y0 = -170 + i * 34 + R() * 10; let d = ''; for (let k = 0; k <= 24; k++) { const x = -310 + k * 26; const y = y0 + Math.sin(k * 0.9 + i) * 14 + Math.sin(k * 0.37 + i * 2) * 10; d += (k ? 'L' : 'M') + x + ' ' + r1(y); } gyri.push(d); }
  // orbiting thoughts: angle(t) with acceleration after 6.2s
  const orbit = (t0, a0, until, cx = 540, cy = 780) => {
    const kf = []; let a = a0; let prev = t0;
    const pos = (aa) => { const x = cx + Math.cos(aa) * 385, y = cy + Math.sin(aa) * 120; const s = 0.82 + 0.28 * Math.sin(aa); return `translate(${r1(x)} ${r1(y)}) scale(${r1(s * 100) / 100})`; };
    const out = [{ t: t0, tr: pos(a) }];
    for (let t = t0 + 0.1; t <= until + 1e-6; t += 0.1) { const w = t < 6.2 ? 0.95 : t < 7.2 ? 0.95 + (t - 6.2) * 1.4 : 2.35; a += w * (t - prev); prev = t; out.push({ t: r1(t * 10) / 10, tr: pos(a) }); }
    return out;
  };
  const thoughts = [
    { id: 'todo', t0: 2.25, a0: Math.PI * 0.85 },
    { id: 'talk', t0: 3.65, a0: Math.PI * 0.15 },
    { id: 'storm', t0: 5.35, a0: Math.PI * 1.55 },
  ].map((o) => ({ ...o, kf: orbit(o.t0 + 0.55, o.a0, 9.9) }));
  const todo = `<g>
      <rect x="-82" y="-100" width="164" height="200" rx="18" fill="#f7f4ee"/><rect x="-82" y="-100" width="164" height="40" rx="18" fill="#5b7cfa"/><rect x="-82" y="-74" width="164" height="14" fill="#5b7cfa"/>
      <text x="0" y="-72" text-anchor="middle" font-family="KzSans" font-weight="800" font-size="22" fill="#fff">ЕРТЕҢ</text>
      ${[0, 1, 2].map((i) => `<rect x="-62" y="${-38 + i * 44}" width="22" height="22" rx="5" fill="none" stroke="#5b7cfa" stroke-width="4"/><rect class="s2-todoLine" x="-28" y="${-32 + i * 44}" width="${[86, 70, 80][i]}" height="10" rx="5" fill="#9aa3b8"/>`).join('')}
      <circle cx="72" cy="-96" r="22" fill="#ff5a5a"/><text x="72" y="-87" text-anchor="middle" font-family="KzSans" font-weight="800" font-size="28" fill="#fff">!</text>
    </g>`;
  const talk = `<g>
      <path d="M-110 -70 h150 a26 26 0 0 1 26 26 v52 a26 26 0 0 1 -26 26 h-96 l-30 26 l4 -26 h-28 a26 26 0 0 1 -26 -26 v-52 a26 26 0 0 1 26 -26z" fill="#ffffff"/>
      ${[-58, -22, 14].map((x, i) => `<circle class="s2-dot" id="s2-dot${i}" cx="${x}" cy="-16" r="11" fill="#7a5af8"/>`).join('')}
      <path d="M20 40 h96 a22 22 0 0 1 22 22 v34 a22 22 0 0 1 -22 22 h-20 l4 22 l-28 -22 h-52 a22 22 0 0 1 -22 -22 v-34 a22 22 0 0 1 22 -22z" fill="#d9ccff"/>
      <rect x="40" y="70" width="70" height="10" rx="5" fill="#8f7bd8"/><rect x="40" y="88" width="46" height="10" rx="5" fill="#8f7bd8"/>
    </g>`;
  const storm = `<g>
      <path id="s2-bolt" d="M6 10 L-22 70 L4 66 L-14 120 L36 46 L10 50 L28 10Z" fill="#ffe14d" opacity="0"/>
      <g fill="#4d5672"><circle cx="-60" cy="0" r="46"/><circle cx="-10" cy="-30" r="60"/><circle cx="52" cy="-6" r="48"/><rect x="-104" y="0" width="200" height="46" rx="23"/></g>
      <g fill="#6b7594" opacity="0.7"><circle cx="-20" cy="-44" r="34"/></g>
      <g stroke="#8fb3ff" stroke-width="5" stroke-linecap="round" opacity="0.8">${[-70, -36, 0, 34, 66].map((x, i) => `<line class="s2-rain" x1="${x}" y1="${56 + (i % 2) * 10}" x2="${x - 8}" y2="${82 + (i % 2) * 10}"/>`).join('')}</g>
    </g>`;
  const thoughtSVG = { todo, talk, storm };
  const body = `
    <div id="s2-wrap" style="position:absolute;inset:0;clip-path:circle(0% at 50% 50%)">
    <div id="s2-cam" class="cam"><svg width="1080" height="1920" viewBox="0 0 1080 1920">
      <defs>
        <radialGradient id="s2-bg" cx="50%" cy="44%" r="70%"><stop offset="0" stop-color="#1f2a6b"/><stop offset="0.55" stop-color="#0c1240"/><stop offset="1" stop-color="#03051a"/></radialGradient>
        <radialGradient id="s2-halo"><stop offset="0" stop-color="#b98cff" stop-opacity="0.75"/><stop offset="1" stop-color="#b98cff" stop-opacity="0"/></radialGradient>
        <radialGradient id="s2-heat"><stop offset="0" stop-color="#ff8a3d" stop-opacity="0.8"/><stop offset="1" stop-color="#ff3d3d" stop-opacity="0"/></radialGradient>
        <radialGradient id="s2-brainG" cx="42%" cy="35%" r="75%"><stop offset="0" stop-color="#ffd0e6"/><stop offset="0.55" stop-color="#f29ac7"/><stop offset="1" stop-color="#b65aa6"/></radialGradient>
        <radialGradient id="s2-pin"><stop offset="0" stop-color="#ffffff"/><stop offset="0.35" stop-color="#d9c8ff"/><stop offset="1" stop-color="#9f7bff" stop-opacity="0"/></radialGradient>
        <clipPath id="s2-bclip"><path d="${outline}"/></clipPath>
      </defs>
      <rect x="-300" y="-300" width="1680" height="2520" fill="url(#s2-bg)"/>
      ${L.map((l, i) => `<g id="s2-L${i}" transform="translate(540 900) scale(${[0.55, 0.42, 0.3][i]}) translate(-540 -900)" opacity="0.9"><g stroke="#4f78d8" stroke-width="${2 + i}" opacity="${0.35 + i * 0.1}">${l.lines}</g><g fill="#8fd3ff" opacity="${0.55 + i * 0.12}">${l.nodes}</g></g>`).join('')}
      ${Array.from({ length: 14 }, (_, i) => { const a = L[1].pts[i], b = L[1].pts[(i * 7 + 3) % L[1].pts.length]; return `<circle id="s2-sig${i}" cx="${r1(a[0])}" cy="${r1(a[1])}" r="7" fill="#bff6ff" opacity="0" data-x2="${r1(b[0] - a[0])}" data-y2="${r1(b[1] - a[1])}"/>`; }).join('')}
      <g id="s2-brain" transform="translate(540 830) scale(0.15)">
        <g id="s2-pulse" transform="scale(1)">
          <circle cx="0" cy="0" r="470" fill="url(#s2-halo)" id="s2-haloC"/>
          <circle cx="0" cy="0" r="470" fill="url(#s2-heat)" id="s2-heatC" opacity="0"/>
          <path d="M60 170 Q80 250 50 320 L10 320 Q30 250 10 180Z" fill="#c26aa9"/>
          <path d="${outline}" fill="url(#s2-brainG)" stroke="#8d3c83" stroke-width="8"/>
          <g clip-path="url(#s2-bclip)" fill="none" stroke-linecap="round">
            <g stroke="#a34a95" stroke-width="9" opacity="0.75">${gyri.map((d) => `<path d="${d}"/>`).join('')}</g>
            <g stroke="#9ff6ff" stroke-width="7">${gyri.map((d, i) => `<path id="s2-g${i}" d="${d}" stroke-dasharray="70 900" stroke-dashoffset="${970 - i * 83}" opacity="0.9"/>`).join('')}</g>
          </g>
          <path d="M0 -205 Q-16 -120 6 -40 Q-14 40 0 196" fill="none" stroke="#8d3c83" stroke-width="10" stroke-linecap="round"/>
          <circle id="s2-pinC" cx="0" cy="70" r="26" fill="url(#s2-pin)"/>
        </g>
      </g>
      ${thoughts.map((o) => `<g id="s2-${o.id}" transform="translate(540 830) scale(0)">${thoughtSVG[o.id]}</g>`).join('')}
      <circle id="s2-flash" cx="540" cy="900" r="60" fill="url(#s2-pin)" opacity="0"/>
    </svg></div>
    ${VIG(p)}
    <div id="s2-white" style="position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,#ffffff 0%,#e7dcff 45%,#b9a3ff 100%);opacity:0"></div>
    </div>`;
  const consts = { THOUGHTS: thoughts.map((o) => ({ id: o.id, t0: o.t0, kf: o.kf })) };
  const script = `
    const cam='#s2-cam';
    // iris opens from the pupil we just dove into
    tl.fromTo('#s2-wrap',{clipPath:'circle(0% at 50% 50%)'},{clipPath:'circle(75% at 50% 50%)',duration:0.75,ease:'power2.out'},0.22);
    camSet(tl,cam,540,900,1);
    // flying through the neural tunnel
    [[0.55,2.6],[0.42,2.2],[0.3,1.7]].forEach(function(s,i){
      tl.fromTo('#s2-L'+i,{attr:{transform:'translate(540 900) scale('+s[0]+') translate(-540 -900)'}},{attr:{transform:'translate(540 900) scale('+s[1]+') translate(-540 -900)'},duration:2.6,ease:'power2.out'},0.1);
      tl.to('#s2-L'+i,{attr:{transform:'translate(540 900) scale('+(s[1]+0.35)+') translate(-540 -900)'},duration:8,ease:'none'},2.7);
    });
    tl.to('#s2-L0',{opacity:0.35,duration:1.4},1.6);
    // the brain arrives out of the depth and keeps working
    tl.fromTo('#s2-brain',{attr:{transform:'translate(540 830) scale(0.15)'}},{attr:{transform:'translate(540 830) scale(1)'},duration:1.6,ease:'expo.out'},0.45);
    yoyo(tl,'#s2-pulse',{attr:{transform:'scale(1)'}},{attr:{transform:'scale(1.03)'}},1.6,10.6,1.3);
    yoyo(tl,'#s2-haloC',{opacity:0.75},{opacity:1},1.6,10.6,0.9);
    for (var g=0; g<11; g++){ var per = 1.2+(g%4)*0.25; var n=Math.floor(9.4/per); tl.fromTo('#s2-g'+g,{attr:{'stroke-dashoffset':970-g*83}},{attr:{'stroke-dashoffset':970-g*83-970},duration:per,ease:'none',repeat:n-1},1.2+(g%5)*0.13); }
    // neuron signals racing along the network
    for (var i=0;i<14;i++){ var el=document.getElementById('s2-sig'+i); var dx=+el.getAttribute('data-x2'), dy=+el.getAttribute('data-y2'); var st=0.6+(i%7)*0.35; var cyc=0.9+(i%3)*0.3; var reps=Math.floor((10.4-st)/cyc);
      tl.fromTo(el,{x:0,y:0,opacity:0},{keyframes:[{opacity:1,duration:cyc*0.15},{x:dx,y:dy,duration:cyc*0.7},{opacity:0,duration:cyc*0.15}],repeat:reps-1,ease:'none'},st); }
    // thoughts burst out of the brain, then orbit faster and faster
    THOUGHTS.forEach(function(o){
      tl.fromTo('#s2-'+o.id,{attr:{transform:'translate(540 830) scale(0)'}},{attr:{transform:o.kf[0].tr},duration:0.55,ease:'back.out(1.6)'},o.t0);
      tl.to('#s2-'+o.id,{keyframes:o.kf.slice(1).map(function(k){return {attr:{transform:k.tr},duration:0.1,ease:'none'};})},o.t0+0.55);
    });
    tl.fromTo('.s2-todoLine',{scaleX:0,transformOrigin:'0% 50%'},{scaleX:1,duration:0.35,stagger:0.12,ease:'power2.out'},2.6);
    for (var d=0;d<3;d++) yoyo(tl,'#s2-dot'+d,{y:0},{y:-12},3.9+d*0.12,10.4,0.5);
    tl.fromTo('#s2-bolt',{opacity:0},{keyframes:[{opacity:1,duration:0.05},{opacity:0.1,duration:0.08},{opacity:1,duration:0.05},{opacity:0,duration:0.25}],repeat:5,repeatDelay:0.45},5.8);
    yoyo(tl,'.s2-rain',{y:0,opacity:0.9},{y:16,opacity:0.2},5.5,10.4,0.4);
    // overheating: worry loops back again and again
    tl.to('#s2-heatC',{opacity:0.9,duration:1.6,ease:'power2.inOut'},6.3);
    // dive into the pineal gland -> the next world
    camTo(tl,cam,540,900,1,0,0.01);
    camTo(tl,cam,540,900,1.12,1.0,8.4,'sine.inOut');
    camTo(tl,cam,540,900,9,9.55,1.05,'power3.in');
    tl.fromTo('#s2-flash',{opacity:0,attr:{r:60}},{opacity:1,attr:{r:220},duration:0.9,ease:'power2.in'},9.4);
    tl.fromTo('#s2-white',{opacity:0},{opacity:1,duration:0.4,ease:'power2.in'},10.15);`;
  return scene({ id: 's2', body, script, consts });
}

// =============================================================================================== S3
function s3() {
  const p = 's3';
  const R = rng(9);
  const cells = Array.from({ length: 9 }, (_, i) => ({ x: R() * 1300 - 110, y: R() * 1900 + 40, r: 40 + R() * 90, c: ['#5ad1e8', '#9b7bff', '#ff8fc8'][i % 3] }));
  const sparks = Array.from({ length: 16 }, (_, i) => ({ dx: r1((R() - 0.5) * 260), dy: r1(120 + R() * 260), s: r1(0.5 + R() * 0.8), d: r1(i * 0.17) }));
  const star4 = 'M0 -14 L4 -4 L14 0 L4 4 L0 14 L-4 4 L-14 0 L-4 -4Z';
  const spikes = (() => { let d = ''; for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2 - Math.PI / 2; const rr = i % 2 ? 92 : 132 + (i % 4 === 0 ? 14 : 0); d += (i ? 'L' : 'M') + r1(Math.cos(a) * rr) + ' ' + r1(Math.sin(a) * rr); } return d + 'Z'; })();
  const body = `
    <div id="s3-wrap" style="position:absolute;inset:0;opacity:0">
    <div id="s3-cam" class="cam"><svg width="1080" height="1920" viewBox="0 0 1080 1920">
      <defs>
        ${melaDefs(p)}
        <linearGradient id="s3-bg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#241a66"/><stop offset="0.6" stop-color="#140f45"/><stop offset="1" stop-color="#090722"/></linearGradient>
        <radialGradient id="s3-neb1"><stop offset="0" stop-color="#7a4dff" stop-opacity="0.55"/><stop offset="1" stop-color="#7a4dff" stop-opacity="0"/></radialGradient>
        <radialGradient id="s3-neb2"><stop offset="0" stop-color="#29c3d6" stop-opacity="0.4"/><stop offset="1" stop-color="#29c3d6" stop-opacity="0"/></radialGradient>
        <radialGradient id="s3-cellG" cx="40%" cy="35%"><stop offset="0" stop-color="#fff" stop-opacity="0.35"/><stop offset="1" stop-color="#fff" stop-opacity="0.04"/></radialGradient>
        <radialGradient id="s3-glandG" cx="40%" cy="35%"><stop offset="0" stop-color="#ffe9b8"/><stop offset="1" stop-color="#d98a4a"/></radialGradient>
        <radialGradient id="s3-glandGlow"><stop offset="0" stop-color="#c7b2ff" stop-opacity="0.8"/><stop offset="1" stop-color="#c7b2ff" stop-opacity="0"/></radialGradient>
        <radialGradient id="s3-cortiG" cx="40%" cy="35%"><stop offset="0" stop-color="#ffe08a"/><stop offset="0.55" stop-color="#ff8a2b"/><stop offset="1" stop-color="#e2322b"/></radialGradient>
        <radialGradient id="s3-cortiGlow"><stop offset="0.4" stop-color="#ff7a2b" stop-opacity="0.55"/><stop offset="1" stop-color="#ff3b2b" stop-opacity="0"/></radialGradient>
        <filter id="s3-whip" x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur id="s3-whipB" stdDeviation="0 0"/></filter>
      </defs>
      <g filter="url(#s3-whip)">
      <rect x="-1200" y="-300" width="3480" height="2520" fill="url(#s3-bg)"/>
      <circle cx="260" cy="520" r="520" fill="url(#s3-neb1)"/><circle cx="880" cy="1300" r="560" fill="url(#s3-neb2)"/><circle cx="-500" cy="900" r="600" fill="url(#s3-neb1)"/>
      <g id="s3-cells">${cells.map((c, i) => `<g id="s3-cell${i}" transform="translate(0 0)"><circle cx="${r1(c.x)}" cy="${r1(c.y)}" r="${r1(c.r)}" fill="url(#s3-cellG)" stroke="${c.c}" stroke-opacity="0.45" stroke-width="3"/><circle cx="${r1(c.x + c.r * 0.2)}" cy="${r1(c.y - c.r * 0.1)}" r="${r1(c.r * 0.3)}" fill="${c.c}" opacity="0.35"/></g>`).join('')}</g>
      ${[[180, 300, 1], [900, 620, -1], [130, 1500, -1], [-420, 600, 1]].map(([x, y, dir], i) => `<g transform="translate(${x} ${y})"><g id="s3-hex${i}" data-dir="${dir}" transform="rotate(0)" fill="none" stroke="#8fe9ff" stroke-width="4" opacity="0.4"><path d="M0 -50 L43 -25 L43 25 L0 50 L-43 25 L-43 -25Z"/><path d="M43 -25 L86 -50 L129 -25 L129 25 L86 50 L43 25"/><circle cx="0" cy="-50" r="7" fill="#8fe9ff"/><circle cx="129" cy="25" r="7" fill="#8fe9ff"/></g></g>`).join('')}
      <!-- pineal gland -->
      <g transform="translate(540 1330)">
        <circle id="s3-glandGlowC" r="230" fill="url(#s3-glandGlow)"/>
        <path d="M0 -92 C56 -80 84 -20 70 34 C60 80 26 104 0 108 C-26 104 -60 80 -70 34 C-84 -20 -56 -80 0 -92Z" fill="url(#s3-glandG)"/>
        <g fill="none" stroke="#b5703a" stroke-width="5" opacity="0.7"><path d="M-50 -30 Q0 -10 50 -30"/><path d="M-62 10 Q0 30 62 10"/><path d="M-54 50 Q0 70 54 50"/><path d="M-20 -80 Q-30 0 -16 100"/><path d="M20 -80 Q30 0 16 100"/></g>
        <text id="s3-epi" y="170" text-anchor="middle" font-family="KzSans" font-weight="600" font-size="34" fill="#d9ccff" opacity="0">эпифиз</text>
      </g>
      <!-- melatonin -->
      <g id="s3-mela" transform="translate(540 1330) scale(0.1) rotate(0)">
        ${melaSVG(p)}
        <g transform="translate(118 30)"><g id="s3-wand" transform="rotate(0)"><line x1="0" y1="0" x2="62" y2="-56" stroke="#e8d7a8" stroke-width="7" stroke-linecap="round"/><path transform="translate(70 -64) scale(1.6)" d="${star4}" fill="#ffe27a"/></g></g>
        <ellipse cx="-118" cy="34" rx="18" ry="24" fill="#8a98ec"/>
      </g>
      <g id="s3-sparks">${sparks.map((s, i) => `<path id="s3-sp${i}" class="s3-sp" d="${star4}" fill="#fff2a8" opacity="0" transform="translate(0 0) scale(${s.s})"/>`).join('')}</g>
      <!-- cortisol -->
      <g id="s3-corti" transform="translate(1500 860) scale(1) rotate(0)">
        <g id="s3-cortiJ" transform="translate(0 0)">
          <circle r="230" fill="url(#s3-cortiGlow)"/>
          <path d="${spikes}" fill="url(#s3-cortiG)" stroke="#c4271f" stroke-width="5"/>
          <path d="M-8 -132 L-30 -190 L-6 -184 L-22 -232 L22 -170 L0 -174 L14 -132Z" fill="#ffe14d" stroke="#d09a12" stroke-width="3"/>
          <circle cx="-38" cy="-16" r="30" fill="#fff"/><circle cx="38" cy="-16" r="30" fill="#fff"/>
          <circle id="s3-cpL" cx="-34" cy="-14" r="10" fill="#2a0d0d"/><circle id="s3-cpR" cx="42" cy="-14" r="10" fill="#2a0d0d"/>
          <path d="M-74 -58 L-12 -40" stroke="#5a1410" stroke-width="12" stroke-linecap="round"/><path d="M74 -58 L12 -40" stroke="#5a1410" stroke-width="12" stroke-linecap="round"/>
          <path d="M-52 34 Q0 84 52 34 Z" fill="#5a1410"/><path d="M-46 38 L46 38 L40 48 L-40 48Z" fill="#fff"/>
          <g fill="none" stroke="#ffe14d" stroke-width="6" stroke-linecap="round" id="s3-arcs" opacity="0"><path d="M-150 -90 l-24 -10 l10 -16 l-26 -12"/><path d="M150 -70 l24 -14 l-6 -18 l28 -10"/><path d="M140 110 l30 6 l-4 20 l28 6"/></g>
        </g>
      </g>
      <path id="s3-zap" d="M380 860 L320 900 L350 910 L270 960 L300 968 L200 1020" fill="none" stroke="#fff27a" stroke-width="12" stroke-linejoin="round" opacity="0"/>
      </g>
    </svg></div>
    ${VIG(p)}
    <div class="s3-label" id="s3-labM"><div class="big" style="color:#c9d2ff">МЕЛАТОНИН</div><div class="small">ұйқы гормоны · қараңғыда бөлінеді</div></div>
    <div class="s3-label" id="s3-labC"><div class="big" style="color:#ffb15c">КОРТИЗОЛ</div><div class="small">сергектік гормоны · стресс көтереді</div></div>
    <div id="s3-white" style="position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,#ffffff 0%,#e7dcff 45%,#b9a3ff 100%)"></div>
    </div>`;
  const css = `
    .s3-label { position:absolute; left:0; top:300px; width:1080px; text-align:center; font-family:"KzSans",sans-serif; opacity:0; }
    .s3-label .big { font-weight:800; font-size:88px; letter-spacing:0.02em; text-shadow:0 0 40px rgba(140,120,255,0.55), 0 6px 20px rgba(0,0,0,0.6); }
    .s3-label .small { margin-top:14px; font-weight:600; font-size:40px; color:#e9e4ff; text-shadow:0 4px 16px rgba(0,0,0,0.7); }`;
  const consts = { SPARKS: sparks };
  const script = `
    const cam='#s3-cam';
    tl.fromTo('#s3-wrap',{opacity:0},{opacity:1,duration:0.2,ease:'none'},0);
    tl.fromTo('#s3-white',{opacity:1},{opacity:0,duration:0.8,ease:'power2.out'},0.15);
    camSet(tl,cam,540,1240,1.2);
    camTo(tl,cam,520,980,1.12,0.2,3.0,'power2.inOut');
    camTo(tl,cam,560,930,1.06,3.2,5.2,'sine.inOut');
    // living world: drifting cells, turning molecules, glowing gland
    for (var i=0;i<9;i++) yoyo(tl,'#s3-cell'+i,{attr:{transform:'translate(0 0)'}},{attr:{transform:'translate('+((i%2?1:-1)*(30+i*4))+' '+(-40-i*5)+')'}},0,10.6,4.2+(i%3));
    for (var h=0;h<4;h++){ var dir=+document.getElementById('s3-hex'+h).getAttribute('data-dir'); tl.fromTo('#s3-hex'+h,{attr:{transform:'rotate(0)'}},{attr:{transform:'rotate('+(dir*70)+')'},duration:10.6,ease:'none'},0); }
    yoyo(tl,'#s3-glandGlowC',{opacity:0.6},{opacity:1},0,10.6,1.1);
    tl.fromTo('#s3-epi',{opacity:0},{opacity:0.85,duration:0.5},3.4);
    // melatonin is released in the dark: it hatches from the gland, yawns and floats up
    tl.fromTo('#s3-mela',{attr:{transform:'translate(540 1330) scale(0.1) rotate(0)'}},{attr:{transform:'translate(500 1060) scale(1.05) rotate(-6)'},duration:1.1,ease:'back.out(1.5)'},0.55);
    tl.to('#s3-mela',{attr:{transform:'translate(450 860) scale(1) rotate(4)'},duration:2.2,ease:'sine.inOut'},1.65);
    tl.to('#s3-mela',{attr:{transform:'translate(420 840) scale(1) rotate(-3)'},duration:1.9,ease:'sine.inOut'},3.85);
    yoyo(tl,'#s3-melaSq',{attr:{transform:'scale(1 1)'}},{attr:{transform:'scale(1.04 0.96)'}},1.6,7.4,0.9);
    yoyo(tl,'#s3-melaCap',{attr:{transform:'rotate(0)'}},{attr:{transform:'rotate(7)'}},1.0,7.4,1.1);
    tl.to('#s3-melaMouth',{attr:{transform:'scale(1.6 5)'},duration:0.35,ease:'power2.out'},1.9);
    tl.to('#s3-melaMouth',{attr:{transform:'scale(1 1)'},duration:0.4,ease:'power2.inOut'},2.6);
    yoyo(tl,'#s3-wand',{attr:{transform:'rotate(0)'}},{attr:{transform:'rotate(-24)'}},2.4,7.2,0.6);
    // stardust from the wand (sleepiness spreading)
    SPARKS.forEach(function(s,i){ var t0=2.5+s.d; var wx=450+118+70, wy=860+30-64;
      tl.fromTo('#s3-sp'+i,{opacity:0,attr:{transform:'translate('+wx+' '+wy+') scale('+s.s+')'}},{keyframes:[{opacity:1,duration:0.15},{attr:{transform:'translate('+(wx+s.dx)+' '+(wy+s.dy)+') scale('+(s.s*0.5)+')'},opacity:0,duration:1.6,ease:'power1.in'}]},t0);
    });
    tl.fromTo('#s3-labM',{opacity:0,filter:'blur(8px)'},{opacity:1,filter:'blur(0px)',duration:0.3,ease:'power2.out'},1.2);
    tl.to('#s3-labM',{opacity:0,filter:'blur(8px)',duration:0.2,ease:'power2.in'},5.05);
    // stress: cortisol bursts in
    tl.to('#s3-corti',{attr:{transform:'translate(760 900) scale(1) rotate(-8)'},duration:0.55,ease:'expo.out'},5.3);
    camTo(tl,cam,600,930,1.0,5.25,0.4,'power2.out');
    tl.fromTo(cam,{rotation:0},{keyframes:[{rotation:-1.2,duration:0.05},{rotation:1,duration:0.06},{rotation:-0.6,duration:0.06},{rotation:0,duration:0.08}]},5.4);
    yoyo(tl,'#s3-cortiJ',{attr:{transform:'translate(0 0)'}},{attr:{transform:'translate(5 -3)'}},5.4,10.6,0.08);
    tl.fromTo('#s3-arcs',{opacity:0},{keyframes:[{opacity:1,duration:0.05},{opacity:0.2,duration:0.1},{opacity:1,duration:0.05},{opacity:0.4,duration:0.15}],repeat:9},5.6);
    tl.fromTo('#s3-labC',{opacity:0,filter:'blur(8px)'},{opacity:1,filter:'blur(0px)',duration:0.3,ease:'power2.out'},5.85);
    // ...raises: it swells
    tl.to('#s3-corti',{attr:{transform:'translate(760 900) scale(1.3) rotate(4)'},duration:0.6,ease:'back.out(2)'},6.55);
    tl.to('#s3-mela',{attr:{transform:'translate(380 850) scale(0.92) rotate(-8)'},duration:0.8,ease:'power2.inOut'},6.6);
    // ...keeps you alert and chases sleep away
    tl.fromTo('#s3-zap',{opacity:0},{keyframes:[{opacity:1,duration:0.04},{opacity:0.2,duration:0.06},{opacity:1,duration:0.04},{opacity:0,duration:0.2}]},7.45);
    tl.set('#s3-melaSleepy',{opacity:0},7.55); tl.set('#s3-melaAwake',{opacity:1},7.55);
    tl.to('#s3-melaSq',{attr:{transform:'scale(0.85 1.2)'},duration:0.12,ease:'power2.out'},7.55);
    tl.to('#s3-melaCap',{attr:{transform:'rotate(-40)'},duration:0.3,ease:'back.out(2)'},7.55);
    tl.to('#s3-mela',{attr:{transform:'translate(-420 900) scale(0.85) rotate(-18)'},duration:1.2,ease:'power3.in'},8.4);
    tl.to('#s3-corti',{attr:{transform:'translate(-260 900) scale(1.15) rotate(-20)'},duration:1.3,ease:'power2.in'},8.75);
    tl.to(['#s3-cpL','#s3-cpR'],{attr:{cx:'-=10'},duration:0.2},8.6);
    tl.to('#s3-labC',{opacity:0,filter:'blur(8px)',duration:0.2,ease:'power2.in'},9.6);
    // whip pan out
    camTo(tl,cam,200,930,1.0,9.2,0.85,'power2.in');
    tl.to(cam,{x:'+=900',duration:0.5,ease:'power3.in'},10.05);
    tl.fromTo('#s3-whipB',{attr:{stdDeviation:'0 0'}},{attr:{stdDeviation:'60 0'},duration:0.45,ease:'power2.in'},10.05);`;
  return scene({ id: 's3', css, body, script, consts });
}

// =============================================================================================== S4 + S5 (sitting set)
function sittingSet(p, { withMiniMela = false } = {}) {
  const phHand = `<g transform="translate(${PH_IN_R.x} ${PH_IN_R.y}) rotate(${PH_IN_R.r})"><g id="${p}-phR" opacity="0"><g id="${p}-phRot" transform="rotate(0) scale(1 1)">${phoneSVG(p + 'h', false)}</g></g></g>`;
  const mugHand = `<g transform="translate(${MUG_IN_L.x} ${MUG_IN_L.y}) rotate(${MUG_IN_L.r})"><g id="${p}-mugH" opacity="0"><g id="${p}-mugRot" transform="rotate(0)">${mugSVG(p + '-steamH')}</g></g></g>`;
  const front = `
    <g id="${p}-ph2" transform="translate(0 392)">${phoneSVG(p, true)}
      <g id="${p}-thumb" transform="translate(0 0)"><ellipse cx="34" cy="40" rx="14" ry="24" fill="${C.skin}" stroke="${C.skinSh}" stroke-width="3"/></g>
    </g>
    <ellipse id="${p}-faceGlow" cx="0" cy="60" rx="250" ry="290" fill="url(#${p}-phoneG)" opacity="0" style="mix-blend-mode:screen"/>
    <g id="${p}-rays" opacity="0" fill="#8fd0ff">${[-30, -14, 0, 14, 30].map((dx, i) => `<path class="${p}-ray" d="M${dx * 0.4} 320 L${-50 + dx} 0 L${-38 + dx} 0Z" opacity="${0.35 + (i % 2) * 0.2}"/><path class="${p}-ray" d="M${dx * 0.4} 320 L${50 + dx} 0 L${62 + dx} 0Z" opacity="${0.35 + (i % 2) * 0.2}"/>`).join('')}</g>
    <path id="${p}-sweat2" d="M128 -36 q12 22 0 32 q-12 -10 0 -32z" fill="#bfe6ff" opacity="0"/>
    <g id="${p}-jit" opacity="0" stroke="#ffe36b" stroke-width="7" stroke-linecap="round" fill="none"><path d="M-210 -150 l-20 -20 l16 -8 l-20 -22"/><path d="M210 -150 l20 -20 l-16 -8 l20 -22"/><path d="M-230 -40 l-34 -4"/><path d="M230 -40 l34 -4"/></g>
    <g id="${p}-swirl" opacity="0" fill="none" stroke="#c8d2ff" stroke-width="7" stroke-linecap="round"><path id="${p}-sw1" d="M-60 -300 c-50 -40 40 -90 70 -40 c30 50 -80 70 -60 10 c20 -50 120 -30 90 40" stroke-dasharray="520" stroke-dashoffset="520"/><path id="${p}-sw2" d="M80 -330 c-30 -30 30 -60 50 -25 c20 35 -55 45 -40 5" stroke-dasharray="300" stroke-dashoffset="300"/></g>
    ${withMiniMela ? `<g id="${p}-bub" opacity="0" transform="translate(-270 -250) scale(0.42)"><circle r="190" fill="#1b2350" opacity="0.65" stroke="#9fb0ff" stroke-width="6"/><g id="${p}-mini" transform="scale(1)">${melaSVG(p)}</g></g><circle id="${p}-bub1" cx="-150" cy="-150" r="14" fill="#1b2350" stroke="#9fb0ff" stroke-width="4" opacity="0"/><circle id="${p}-bub2" cx="-190" cy="-190" r="22" fill="#1b2350" stroke="#9fb0ff" stroke-width="4" opacity="0"/>` : ''}`;
  return `
      <defs>${charDefs(p)}${bedroomDefs(p)}${melaDefs(p)}
        <filter id="${p}-whip" x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur id="${p}-whipB" stdDeviation="0 0"/></filter>
      </defs>
      <g filter="url(#${p}-whip)">
      ${bedroom(p, {
        charInner: upperBody(p, { handR: phHand, handL: mugHand, front }),
        clock: '03:12',
        standL: `<g id="${p}-mugS" transform="translate(86 1128)">${mugSVG(p + '-steamS')}</g>`,
        stand: `<rect id="${p}-phS" x="924" y="1158" width="96" height="12" rx="4" fill="#14171d" opacity="0"/>`,
        blanketFront: blanketHands(p),
      })}
      <circle id="${p}-lampLight" cx="966" cy="760" r="760" fill="url(#${p}-lampG)" style="mix-blend-mode:screen" opacity="0"/>
      <g>${dust(p, 22, [380, 640, 600, 1000], 13)}</g>
      </g>`;
}
// initial state for the sitting set: lamp on, sitting, holding the phone in both hands
const sittingInit = (p) => `
    INIT('#${p}-lampLight',{opacity:0.9});
    INIT('#${p}-uL',{attr:{transform:'rotate(${POSE.holdL.u})'}}); INIT('#${p}-fL',{attr:{transform:'rotate(${POSE.holdL.f})'}});
    INIT('#${p}-uR',{attr:{transform:'rotate(${POSE.holdR.u})'}}); INIT('#${p}-fR',{attr:{transform:'rotate(${POSE.holdR.f})'}});`;

function s4() {
  const p = 's4';
  const body = `
    <div id="s4-wrap" style="position:absolute;inset:0;opacity:0">
    <div id="s4-cam" class="cam"><svg width="1080" height="1920" viewBox="0 0 1080 1920">${sittingSet(p, { withMiniMela: true })}</svg></div>
    ${VIG(p)}
    </div>`;
  const P = POSE;
  const script = `
    const p='s4', cam='#s4-cam';
    ${sittingInit(p)}
    INIT('#s4-faceGlow',{opacity:0.6});
    INIT(['#'+p+'-lidL','#'+p+'-lidR'],{attr:{transform:'scale(1 0.36)'}});
    INIT(['#'+p+'-pupL','#'+p+'-pupR'],{attr:{transform:'translate(0 16)'}});
    INIT(['#'+p+'-mouth','#'+p+'-mclipPath'],{attr:{d:M['flat']}});
    // whip in from the right
    tl.fromTo('#s4-wrap',{opacity:0},{opacity:1,duration:0.2,ease:'none'},0.05);
    camSet(tl,cam,90,900,1.25);
    camTo(tl,cam,540,900,1.25,0,0.5,'power3.out');
    tl.fromTo('#s4-whipB',{attr:{stdDeviation:'60 0'}},{attr:{stdDeviation:'0 0'},duration:0.45,ease:'power3.out'},0);
    camTo(tl,cam,540,880,1.55,0.6,2.4,'power1.inOut');
    // doom-scrolling: thumb flicks, the feed jumps, the glow flickers on his face
    for (var k=0;k<8;k++){ var t=0.5+k*0.6;
      tl.to('#s4-thumb',{attr:{transform:'translate(0 -34)'},duration:0.12,ease:'power2.out'},t);
      tl.to('#s4-thumb',{attr:{transform:'translate(0 0)'},duration:0.2,ease:'power2.inOut'},t+0.14);
      tl.to('#s4-feed',{attr:{transform:'translate(0 '+(-(k+1)*124)+')'},duration:0.45,ease:'power3.out'},t+0.05);
      tl.fromTo('#s4-faceGlow',{opacity:0.75},{opacity:0.55,duration:0.4},t+0.08);
      tl.fromTo('#s4-pupL',{attr:{transform:'translate(0 18)'}},{attr:{transform:'translate(0 14)'},duration:0.3},t+0.1);
      tl.fromTo('#s4-pupR',{attr:{transform:'translate(0 18)'}},{attr:{transform:'translate(0 14)'},duration:0.3},t+0.12);
    }
    blink(tl,p,1.45,0.36); blink(tl,p,3.85,0.36);
    breathe(tl,p,0,5.3,3.0,4);
    // blue light suppresses melatonin
    tl.to('#s4-rays',{opacity:1,duration:0.4},3.0);
    yoyo(tl,'.s4-ray',{opacity:0.25},{opacity:0.8},3.0,5.2,0.35);
    camTo(tl,cam,470,820,1.32,3.0,0.9,'power2.inOut');
    tl.fromTo('#s4-bub1',{opacity:0},{opacity:1,duration:0.2},3.25); tl.fromTo('#s4-bub2',{opacity:0},{opacity:1,duration:0.2},3.35);
    tl.fromTo('#s4-bub',{opacity:0,attr:{transform:'translate(-270 -250) scale(0.2)'}},{opacity:1,attr:{transform:'translate(-270 -250) scale(0.42)'},duration:0.45,ease:'back.out(1.7)'},3.4);
    yoyo(tl,'#s4-melaSq',{attr:{transform:'scale(1 1)'}},{attr:{transform:'scale(1.05 0.95)'}},3.6,4.2,0.6);
    tl.to('#s4-mini',{attr:{transform:'scale(0.45)'},duration:0.9,ease:'power2.in'},4.15);
    tl.to('#s4-mini',{opacity:0.25,duration:0.9},4.15);
    tl.to(['#s4-bub','#s4-bub1','#s4-bub2'],{opacity:0,duration:0.25,ease:'power2.in'},5.05);
    tl.to('#s4-rays',{opacity:0,duration:0.3},5.1);
    // evening coffee: the phone goes to one hand, the other reaches for the mug
    tl.set('#s4-ph2',{opacity:0},5.3); tl.set('#s4-phR',{opacity:1},5.3);
    ARMK(tl,p,'R',MV.m1,5.3,0.55); PROPK(tl,'s4-phRot',MV.m1.props,5.3,0.55);
    tl.to('#s4-faceGlow',{opacity:0.3,duration:0.5},5.3);
    UP(tl,p,0,-14,5.4,0.75,'power2.inOut');
    ARMK(tl,p,'L',MV.m2,5.4,0.75);
    look(tl,p,-16,4,5.35,0.25); neck(tl,p,-6,5.4,0.6,'power2.inOut');
    camTo(tl,cam,330,960,1.32,5.3,0.9,'power2.inOut');
    tl.set('#s4-mugS',{opacity:0},6.15); tl.set('#s4-mugH',{opacity:1},6.15);
    UP(tl,p,0,0,6.2,0.65,'power2.inOut');
    ARMK(tl,p,'L',MV.m3,6.2,0.65); PROPK(tl,'s4-mugRot',MV.m3.props,6.2,0.65);
    look(tl,p,-6,6,6.3,0.3); neck(tl,p,-4,6.3,0.5);
    camTo(tl,cam,480,900,1.45,6.2,0.8,'power2.inOut');
    mouth(tl,p,'o',6.7,0.2);
    lids(tl,p,0.85,6.75,0.2);
    A(tl,'s4-mugRot',{transform:'${SIP(26)}'},6.88,0.5);
    // caffeine kicks in: eyes pop
    lids(tl,p,0.02,7.45,0.12,'power3.out');
    mouth(tl,p,'flat',7.45,0.2); look(tl,p,0,0,7.45,0.12);
    brows(tl,p,10,-10,7.45,0.15);
    tl.fromTo('#s4-jit',{opacity:0},{keyframes:[{opacity:1,duration:0.06},{opacity:0.4,duration:0.08},{opacity:1,duration:0.06},{opacity:1,duration:0.4},{opacity:0,duration:0.2}]},7.5);
    A(tl,'s4-mugRot',{transform:'${SIP(0)}'},7.42,0.3);
    UP(tl,p,0,-14,7.75,0.6,'power2.inOut');
    ARMK(tl,p,'L',MV.m4,7.75,0.6); PROPK(tl,'s4-mugRot',MV.m4.props,7.75,0.6);
    tl.set('#s4-mugH',{opacity:0},8.38); tl.set('#s4-mugS',{opacity:1},8.38);
    UP(tl,p,0,0,8.4,0.5,'power2.inOut');
    ARMK(tl,p,'L',MV.m5,8.4,0.5);
    breathe(tl,p,5.3,13.6,2.2,5);
    // watching the clock: time runs away
    neck(tl,p,7,8.5,0.45,'power2.inOut'); look(tl,p,18,6,8.5,0.25);
    camTo(tl,cam,960,1110,2.3,8.55,1.0,'power2.inOut');
    var times=['03:13','03:14','03:21','03:33','03:47','03:58'];
    times.forEach(function(s,i){ var t=9.3+i*0.32; tl.set('#s4-clockT',{textContent:s},t); tl.fromTo('#s4-clockGlow',{opacity:0.45},{opacity:0.08,duration:0.28,ease:'power2.out'},t); });
    camTo(tl,cam,760,920,1.4,10.95,1.0,'power2.inOut');
    brows(tl,p,-15,15,10.0,0.35); mouth(tl,p,'grin',10.05,0.3);
    lids(tl,p,0.14,10.0,0.3);
    tl.fromTo('#s4-sweat2',{opacity:0,y:0},{opacity:1,y:24,duration:0.9,ease:'power1.in'},10.15);
    tl.to('#s4-sweat2',{opacity:0,duration:0.3},11.6);
    tl.set('#s4-swirl',{opacity:1},10.2);
    tl.to('#s4-sw1',{attr:{'stroke-dashoffset':0},duration:0.9,ease:'power2.out'},10.2);
    tl.to('#s4-sw2',{attr:{'stroke-dashoffset':0},duration:0.7,ease:'power2.out'},10.45);
    tl.to('#s4-swirl',{opacity:0,duration:0.5},12.2);
    // a heavy sigh; head drops; camera settles where the next beat begins
    neck(tl,p,0,11.1,0.5); look(tl,p,0,10,11.2,0.4); lids(tl,p,0.34,11.3,0.4);
    neck(tl,p,3,11.8,0.9,'sine.inOut'); look(tl,p,0,0,12.3,0.4);
    camTo(tl,cam,540,960,1.15,12.0,1.0,'power2.inOut');
    // ambient life
    yoyo(tl,'#s4-fringe',{attr:{transform:'rotate(0)'}},{attr:{transform:'rotate(1.3)'}},0,13.6,2.4);
    yoyo(tl,'#s4-curtL',{attr:{transform:'translate(600 140) skewX(0)'}},{attr:{transform:'translate(600 140) skewX(2)'}},0,13.6,2.9);
    yoyo(tl,'#s4-curtR',{attr:{transform:'translate(940 140) skewX(0)'}},{attr:{transform:'translate(940 140) skewX(-1.8)'}},0.3,13.6,3.2);
    yoyo(tl,'.s4-steamS',{y:0,opacity:0.6},{y:-14,opacity:0.15},0,13.6,1.6);
    yoyo(tl,'.s4-steamH',{y:0,opacity:0.6},{y:-14,opacity:0.15},0,13.6,1.4);
    dustDrift(tl,'s4-dust',0,13.6);
    for (var i=0;i<7;i++) yoyo(tl,'#s4-ws'+i,{opacity:1},{opacity:0.25},i*0.21,13.6,1.1+i*0.13);`;
  return scene({ id: 's4', body, script, consts: { MV } });
}

// s5 starts exactly where s4 left off (same set, same pose, same camera) so the seam is invisible
function s5() {
  const p = 's5';
  const R = rng(77);
  const floaters = Array.from({ length: 7 }, (_, i) => ({ x: r1((R() - 0.5) * 300), d: r1(i * 0.32), k: i % 3 }));
  const fShape = ['<rect x="-22" y="-26" width="44" height="52" rx="8" fill="#f7f4ee"/><rect x="-22" y="-26" width="44" height="12" rx="6" fill="#5b7cfa"/>',
    '<path d="M-30 -20 h50 a12 12 0 0 1 12 12 v18 a12 12 0 0 1 -12 12 h-30 l-14 12 l2 -12 h-8 a12 12 0 0 1 -12 -12 v-18 a12 12 0 0 1 12 -12z" fill="#fff"/>',
    '<g fill="#7d86a6"><circle cx="-16" cy="0" r="16"/><circle cx="4" cy="-10" r="20"/><circle cx="22" cy="2" r="15"/></g>'];
  const extra = `<g id="s5-aura" opacity="0" transform="translate(540 1040) scale(0.8)"><circle r="300" fill="none" stroke="#9fd6ff" stroke-width="5" opacity="0.6"/><circle r="230" fill="none" stroke="#9fd6ff" stroke-width="3" opacity="0.4"/><circle r="360" fill="none" stroke="#9fd6ff" stroke-width="2" opacity="0.25"/></g>
    ${floaters.map((f, i) => `<g id="s5-fl${i}" opacity="0" transform="translate(${540 + f.x} 900) scale(1)">${fShape[f.k]}</g>`).join('')}`;
  const body = `
    <div id="s5-cam" class="cam"><svg width="1080" height="1920" viewBox="0 0 1080 1920">${sittingSet(p)}${extra}</svg></div>
    ${VIG(p)}`;
  const P = POSE;
  const consts = { FLOAT: floaters, MV };
  const script = `
    const p='s5', cam='#s5-cam';
    ${sittingInit(p)}
    // the state s4 ended in
    INIT('#s5-ph2',{opacity:0}); INIT('#s5-phR',{opacity:1});
    INIT('#s5-uR',{attr:{transform:'rotate(${MV.m1.end.u})'}}); INIT('#s5-fR',{attr:{transform:'rotate(${MV.m1.end.f})'}});
    INIT('#s5-uL',{attr:{transform:'rotate(${MV.m5.end.u})'}}); INIT('#s5-fL',{attr:{transform:'rotate(${MV.m5.end.f})'}});
    INIT('#s5-phRot',{attr:{transform:'${MV.m1.props[MV.m1.props.length - 1]}'}});
    INIT('#s5-faceGlow',{opacity:0.3});
    INIT('#s5-clockT',{textContent:'03:58'});
    INIT('#s5-neck',{attr:{transform:'rotate(3)'}});
    INIT(['#'+p+'-lidL','#'+p+'-lidR'],{attr:{transform:'scale(1 0.34)'}}); INIT('#'+p+'-browL',{attr:{transform:'rotate(-15)'}}); INIT('#'+p+'-browR',{attr:{transform:'rotate(15)'}}); INIT(['#'+p+'-mouth','#'+p+'-mclipPath'],{attr:{d:M['grin']}});
    camSet(tl,cam,540,960,1.15);
    // put the phone away
    UP(tl,p,0,12,0.35,0.75,'power2.inOut');
    ARMK(tl,p,'R',MV.m6,0.35,0.75); PROPK(tl,'s5-phRot',MV.m6.props,0.35,0.75);
    neck(tl,p,6,0.4,0.5); look(tl,p,16,8,0.4,0.25);
    mouth(tl,p,'flat',0.5,0.3); brows(tl,p,-6,6,0.5,0.4);
    camTo(tl,cam,700,980,1.22,0.3,0.9,'power2.inOut');
    tl.set('#s5-phR',{opacity:0},1.12); tl.set('#s5-phS',{opacity:1},1.12);
    tl.to('#s5-faceGlow',{opacity:0,duration:0.3},1.0);
    // pull the lamp cord: click, lights out
    UP(tl,p,0,5,1.22,0.45,'power2.inOut');
    ARMK(tl,p,'R',MV.m7,1.22,0.45);
    look(tl,p,14,-14,1.25,0.25); neck(tl,p,4,1.25,0.4);
    ARMK(tl,p,'R',MV.m8,1.82,0.16);
    tl.to('#s5-cord',{attr:{transform:'translate(0 28)'},duration:0.16,ease:'power2.in'},1.82);
    tl.to('#s5-cord',{attr:{transform:'translate(0 0)'},duration:0.5,ease:'elastic.out(1,0.4)'},2.02);
    tl.to('#s5-lampLight',{opacity:0,duration:0.22,ease:'power2.out'},2.0);
    tl.to('#s5-shadeDark',{opacity:0.5,duration:0.22},2.0);
    tl.to('#s5-beam',{opacity:0.55,duration:0.6},2.05);
    // lie down, pull the blanket up
    ARMK(tl,p,'R',MV.m9R,2.1,0.6); ARMK(tl,p,'L',MV.m9L,2.2,0.6);
    UP(tl,p,0,0,2.1,0.35,'power2.inOut');
    UP(tl,p,260,0,2.45,0.95,'power2.inOut');
    neck(tl,p,0,2.45,0.8); look(tl,p,0,0,2.5,0.4);
    tl.to('#s5-bh',{opacity:1,duration:0.3},3.15);
    camTo(tl,cam,540,1060,1.32,2.3,1.1,'power2.inOut');
    // slow breathing: the aura and the blanket breathe together; the face lets go
    breathe(tl,p,0,2.4,2.2,5);
    yoyo(tl,'#s5-blanket',{attr:{transform:'translate(0 0)'}},{attr:{transform:'translate(0 -12)'}},3.0,8.6,4.0);
    INIT('#s5-aura',{opacity:0});
    yoyo(tl,'#s5-aura',{opacity:0.05,attr:{transform:'translate(540 1040) scale(0.8)'}},{opacity:0.55,attr:{transform:'translate(540 1040) scale(1.12)'}},3.0,8.6,4.0);
    lids(tl,p,0.55,3.1,1.0,'sine.inOut'); brows(tl,p,0,0,3.2,0.8);
    lids(tl,p,0.78,4.6,1.2,'sine.inOut'); mouth(tl,p,'smile',4.6,0.8);
    lids(tl,p,1,6.2,1.0,'sine.inOut'); mouth(tl,p,'sleep',6.4,0.8);
    // thoughts float away and fade
    FLOAT.forEach(function(f,i){ var t0=4.2+f.d;
      tl.fromTo('#s5-fl'+i,{opacity:0,attr:{transform:'translate('+(540+f.x)+' 900) scale(1)'}},{keyframes:[{opacity:0.9,duration:0.3},{opacity:0,attr:{transform:'translate('+(540+f.x*1.6)+' 560) scale(0.5)'},duration:2.2,ease:'power1.in'}]},t0);
    });
    camTo(tl,cam,540,1030,1.45,3.6,4.4,'sine.inOut');
    // ambient
    yoyo(tl,'#s5-fringe',{attr:{transform:'rotate(0)'}},{attr:{transform:'rotate(1.2)'}},0,8.6,2.8);
    yoyo(tl,'#s5-curtL',{attr:{transform:'translate(600 140) skewX(0)'}},{attr:{transform:'translate(600 140) skewX(2)'}},0,8.6,3.0);
    yoyo(tl,'#s5-curtR',{attr:{transform:'translate(940 140) skewX(0)'}},{attr:{transform:'translate(940 140) skewX(-1.8)'}},0.3,8.6,3.3);
    yoyo(tl,'.s5-steamS',{y:0,opacity:0.6},{y:-14,opacity:0.15},0,8.6,1.6);
    dustDrift(tl,'s5-dust',0,8.6);
    for (var i=0;i<7;i++) yoyo(tl,'#s5-ws'+i,{opacity:1},{opacity:0.25},i*0.21,8.6,1.1+i*0.13);`;
  return scene({ id: 's5', body, script, consts });
}

// =============================================================================================== S6
function s6() {
  const p = 's6';
  const R = rng(99);
  const stars = Array.from({ length: 90 }, () => ({ x: r1(R() * 1180 - 50), y: r1(R() * 1500), r: r1(1 + R() * 3.2) }));
  const body = `
    <div id="s6-cam" class="cam"><svg width="1080" height="1920" viewBox="0 0 1080 1920">
      <defs>${charDefs(p)}${bedroomDefs(p)}</defs>
      ${bedroom(p, { charInner: upperBody(p), clock: '04:02', standL: `<g transform="translate(86 1128)">${mugSVG('s6-steam')}</g>`, stand: `<rect x="924" y="1158" width="96" height="12" rx="4" fill="#14171d"/>`, blanketFront: blanketHands(p) })}
      <g id="s6-zz" font-family="KzSans" font-weight="800" fill="#cfe3ff">${[0, 1, 2].map((i) => `<text id="s6-z${i}" x="640" y="880" font-size="${40 + i * 12}" opacity="0">z</text>`).join('')}</g>
    </svg></div>
    <div id="s6-sky" style="position:absolute;inset:0;opacity:0">
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0">
        <defs>
          <linearGradient id="s6-skyG" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#070f2b"/><stop offset="0.6" stop-color="#16305e"/><stop offset="1" stop-color="#2a4f86"/></linearGradient>
          <radialGradient id="s6-mg"><stop offset="0" stop-color="#fff7da" stop-opacity="0.9"/><stop offset="0.35" stop-color="#fff2c4" stop-opacity="0.35"/><stop offset="1" stop-color="#fff2c4" stop-opacity="0"/></radialGradient>
          <radialGradient id="s6-moonG" cx="40%" cy="35%"><stop offset="0" stop-color="#fffdf0"/><stop offset="1" stop-color="#e8dcb0"/></radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#s6-skyG)"/>
        <g id="s6-skyCam" transform="translate(0 0) scale(1)">
          ${stars.map((s, i) => `<circle id="s6-st${i}" cx="${s.x}" cy="${s.y}" r="${s.r}" fill="#fff"/>`).join('')}
          <circle id="s6-mglow" cx="560" cy="860" r="420" fill="url(#s6-mg)"/>
          <circle cx="560" cy="860" r="150" fill="url(#s6-moonG)"/>
          <g fill="#ddd0a2" opacity="0.7"><circle cx="520" cy="820" r="24"/><circle cx="610" cy="900" r="18"/><circle cx="580" cy="800" r="10"/><circle cx="500" cy="920" r="13"/></g>
        </g>
        <g id="s6-cl1" transform="translate(0 0)" fill="#3b5d8f" opacity="0.55"><ellipse cx="200" cy="1250" rx="320" ry="60"/><ellipse cx="330" cy="1215" rx="160" ry="55"/></g>
        <g id="s6-cl2" transform="translate(0 0)" fill="#4a6fa3" opacity="0.45"><ellipse cx="900" cy="1420" rx="360" ry="70"/><ellipse cx="760" cy="1380" rx="170" ry="60"/></g>
      </svg>
    </div>
    ${VIG(p)}
    <div id="s6-scrim"></div>
    <div id="s6-text">
      <div class="ln"><span class="fw" id="s6-w1">Ұйқыңды</span> <span class="fw" id="s6-w2">бағала.</span></div>
      <div class="ln"><span class="fw" id="s6-w3">Денеңе</span> <span class="fw" id="s6-w4">демалыс</span> <span class="fw" id="s6-w5">бер.</span></div>
    </div>`;
  const css = `
    #s6-text { position:absolute; left:0; top:330px; width:1080px; text-align:center; font-family:"KzSans",sans-serif; font-weight:800; font-size:70px; line-height:1.2; color:#fff6e2; text-shadow:0 0 34px rgba(255,236,180,0.45), 0 6px 22px rgba(0,0,0,0.6); }
    #s6-text .ln:nth-child(2) { color:#ffdca6; }
    #s6-scrim { position:absolute; left:90px; top:280px; width:900px; height:300px; border-radius:150px; background:radial-gradient(ellipse at 50% 50%, rgba(2,6,20,0.62) 0%, rgba(2,6,20,0.35) 55%, rgba(2,6,20,0) 75%); }
    .fw { display:inline-block; }`;
  const consts = { NSTAR: stars.length };
  const script = `
    const p='s6', cam='#s6-cam';
    INIT('#s6-upper',{attr:{transform:'translate(0 260) rotate(0)'}});
    INIT('#s6-bh',{opacity:1}); INIT('#s6-shadeDark',{opacity:0.5}); INIT('#s6-beam',{opacity:0.55});
    INIT(['#'+p+'-lidL','#'+p+'-lidR'],{attr:{transform:'scale(1 1)'}}); INIT(['#'+p+'-mouth','#'+p+'-mclipPath'],{attr:{d:M['sleep']}});
    camSet(tl,cam,540,1030,1.45);
    yoyo(tl,'#s6-blanket',{attr:{transform:'translate(0 0)'}},{attr:{transform:'translate(0 -12)'}},0,4,4.0);
    [0,1,2].forEach(function(i){ tl.fromTo('#s6-z'+i,{opacity:0,x:0,y:0},{keyframes:[{opacity:0.9,duration:0.3},{opacity:0,x:40+i*18,y:-120-i*40,duration:1.3}]},0.1+i*0.35); });
    // camera tilts up to the window and pushes through it into the night sky
    camTo(tl,cam,770,420,1.6,0.15,1.3,'power2.inOut');
    camTo(tl,cam,690,272,9,1.35,1.0,'power3.in');
    tl.fromTo('#s6-sky',{opacity:0},{opacity:1,duration:0.35,ease:'power1.in'},1.95);
    tl.fromTo('#s6-skyCam',{attr:{transform:'translate(0 0) scale(1)'}},{attr:{transform:'translate(-90 -90) scale(1.16)'},duration:2.1,ease:'sine.out'},1.95);
    yoyo(tl,'#s6-mglow',{opacity:0.75},{opacity:1},1.9,4,1.0);
    for (var i=0;i<NSTAR;i++){ yoyo(tl,'#s6-st'+i,{opacity:1},{opacity:0.2},1.9+(i%9)*0.07,4,0.5+(i%5)*0.17); }
    tl.fromTo('#s6-cl1',{attr:{transform:'translate(0 0)'}},{attr:{transform:'translate(70 0)'},duration:2.1,ease:'none'},1.95);
    tl.fromTo('#s6-cl2',{attr:{transform:'translate(0 0)'}},{attr:{transform:'translate(-90 0)'},duration:2.1,ease:'none'},1.95);
    // the last line, spoken by the narrator
    [['#s6-w1',0.32],['#s6-w2',0.72],['#s6-w3',1.7],['#s6-w4',2.05],['#s6-w5',2.6]].forEach(function(w){
      tl.fromTo(w[0],{opacity:0,filter:'blur(8px)'},{opacity:1,filter:'blur(0px)',duration:0.35,ease:'power2.out'},w[1]); });`;
  return scene({ id: 's6', css, body, script, consts });
}

// =============================================================================================== captions
function captions() {
  const groups = narration.groups.filter((g) => g.line !== 'l6');
  // extend each group to the next one when the gap is short, so captions don't flicker
  const G = groups.map((g, i) => {
    const next = groups[i + 1];
    let end = g.end + 0.15;
    if (next && next.start - g.end < 0.45) end = next.start;
    return { ...g, start: r1(Math.max(0.15, g.start - 0.05) * 100) / 100, end: Math.round(end * 100) / 100 };
  });
  const body = `
    ${G.map((g) => `<div class="cg" id="cap-${g.id}"><span class="pill">${g.text}</span></div>`).join('\n    ')}`;
  const css = `
    .cg { position:absolute; left:0; top:1120px; width:1080px; text-align:center; opacity:0; visibility:hidden; }
    .pill { display:inline-block; max-width:860px; padding:14px 30px 16px; border-radius:24px; background:rgba(5,10,26,0.58); color:#fffaf0; font-family:"KzSans",sans-serif; font-weight:600; font-size:54px; line-height:1.22; text-shadow:0 2px 10px rgba(0,0,0,0.5); }`;
  const consts = { G: G.map((g) => ({ id: g.id, s: g.start, e: g.end })) };
  const script = `
    G.forEach(function(g){
      var el='#cap-'+g.id;
      tl.set(el,{visibility:'visible'},g.s);
      tl.fromTo(el,{opacity:0,y:10,filter:'blur(6px)'},{opacity:1,y:0,filter:'blur(0px)',duration:0.16,ease:'power2.out'},g.s);
      tl.to(el,{opacity:0,duration:0.12,ease:'power2.in'},g.e-0.12);
      tl.set(el,{opacity:0,visibility:'hidden'},g.e);
    });`;
  return scene({ id: 'captions', css, body, script, consts }).replace('#root { position: absolute; inset: 0; overflow: hidden; background: #050c16; }', '#root { position: absolute; inset: 0; overflow: hidden; background: transparent; }');
}

// =============================================================================================== index
const SFXDUR_MAP = { 'key-press': 0.43, 'click-soft': 0.36, 'notification': 2.45, 'whoosh-cinematic': 5.5, 'whoosh-short': 0.57, 'whoosh': 0.57, 'impact-bass-1': 2.11, 'sparkle': 1.8 };
function index() {
  const SFXDUR = SFXDUR_MAP;
  const scenes = [['s1', 0, 5.6], ['s2', 5.0, 10.6], ['s3', 15.0, 10.6], ['s4', 25.0, 13.6], ['s5', 38.0, 8.6], ['s6', 46.0, 4.0]];
  const sfx = [
    ['tick1', 'key-press', 0.95, 0.35], ['tick2', 'click-soft', 1.95, 0.35], ['tick3', 'key-press', 2.95, 0.35], ['tick4', 'click-soft', 3.95, 0.35],
    ['dive', 'whoosh-cinematic', 4.55, 0.55],
    ['todo', 'whoosh-short', 7.25, 0.3], ['talk', 'whoosh', 8.65, 0.25],
    ['glow', 'whoosh', 14.65, 0.4],
    ['sparkle', 'sparkle', 15.75, 0.4],
    ['corti', 'impact-bass-1', 20.3, 0.55],
    ['whip', 'whoosh-short', 25.0, 0.5],
    ['ping', 'notification', 25.7, 0.18],
    ['ct1', 'key-press', 34.3, 0.4], ['ct2', 'click-soft', 34.62, 0.4], ['ct3', 'key-press', 34.94, 0.4], ['ct4', 'click-soft', 35.26, 0.4], ['ct5', 'key-press', 35.58, 0.4], ['ct6', 'click-soft', 35.9, 0.4],
    ['lamp', 'click-soft', 39.99, 0.9],
    ['window', 'whoosh-cinematic', 46.6, 0.3],
  ];
  return `<!doctype html>
<html lang="kk" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>НЕГЕ ҰЙЫҚТАЙ АЛМАЙСЫҢ?</title>
    <script src="lib/gsap.min.js"></script>
    <style>
      ${FONT_CSS}
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1080px; height: 1920px; overflow: hidden; background: #050c16; }
      #root { position: relative; width: 100%; height: 100%; background: #050c16; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="50" data-width="1080" data-height="1920">
${scenes.map(([id, s, d], i) => `      <div id="${id}" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${s}" data-duration="${d}" data-track-index="${i + 1}" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index:${i + 1}"></div>`).join('\n')}
      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="50" data-track-index="10" data-track-kind="captions" data-width="1080" data-height="1920" style="z-index:20"></div>
      <audio id="voice" class="clip" src="assets/audio/voice.wav" data-start="0" data-duration="50" data-track-index="11" data-volume="1"></audio>
      <audio id="music" class="clip" src="assets/audio/music.wav" data-start="0" data-duration="50" data-track-index="12" data-volume="1" data-timeline-role="music"></audio>
${sfx.map(([id, f, t, v], i) => `      <audio id="sfx-${id}" class="clip" src="assets/audio/${f}.mp3" data-start="${t}" data-duration="${Math.min(SFXDUR[f], Math.round((50 - t) * 100) / 100)}" data-track-index="${13 + (i % 3)}" data-volume="${v}"></audio>`).join('\n')}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
}

OUT('compositions/s1.html', s1());
OUT('compositions/s2.html', s2());
OUT('compositions/s3.html', s3());
OUT('compositions/s4.html', s4());
OUT('compositions/s5.html', s5());
OUT('compositions/s6.html', s6());
OUT('compositions/captions.html', captions());
OUT('index.html', index());
console.log('poses', JSON.stringify(POSE));
