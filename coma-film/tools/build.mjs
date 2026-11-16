// Generates index.html and compositions/*.html for «10 БАНКА».
// Each scene is a canvas drawn by lib/life.js from a state(t) function below.
import fs from 'fs';
const root = new URL('..', import.meta.url).pathname;

const FONT = [500, 600, 800].map((w) => `
  @font-face { font-family: "KzSans"; font-weight: ${w}; src: url("assets/fonts/montserrat-cyrillic-ext-${w}-normal.woff2") format("woff2"); unicode-range: U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F; }
  @font-face { font-family: "KzSans"; font-weight: ${w}; src: url("assets/fonts/montserrat-cyrillic-${w}-normal.woff2") format("woff2"); unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116; }
  @font-face { font-family: "KzSans"; font-weight: ${w}; src: url("assets/fonts/montserrat-latin-${w}-normal.woff2") format("woff2"); unicode-range: U+0000-00FF, U+2000-206F, U+2190-22FF; }`).join('');

const PRE = `const L = window.Life, E = L.ease, lerp = L.lerp, clamp = L.clamp;
function shake(t, t0, amp) { if (t < t0) return { x: 0, y: 0 }; const r = L.rng(Math.floor(t * 30) * 17 + 9), k = Math.exp(-(t - t0) * 5) * amp; return { x: (r() * 2 - 1) * k, y: (r() * 2 - 1) * k }; }
// drinking window helper: returns {near, hold, tilt}
function sip(t, a, b, rest) { const on = t > a && t < b; return { near: on ? 'drink' : rest, hold: on || (t > a - 0.35 && t < b + 0.3) ? 'can' : null, tilt: on ? -0.32 : 0 }; }
function hud(time, place, n, t, tn, extra) { return Object.assign({ time, place, n, pop: tn == null ? 99 : t - tn }, extra || {}); }`;

const SC = [];
const scene = (o) => SC.push(o);

// 1. 07:00 morning, bedroom: first can
scene({ id: 'morning', dur: 3.6, sfx: [['click', 0.95, 0.9]], js: `
  const s = sip(t, 1.1, 2.3, t < 0.6 ? 'reach' : 'chest');
  const n = t > 1.6 ? 1 : 0;
  return { set: 'bedroom', bgBlur: 5, env: { clock: '07:00' },
    cam: { x: 470, y: -390, zoom: lerp(1.55, 1.7, E(t, 0, 3.6)), ay: 0.56 },
    chars: [{ kind: 'hero', pose: 'sit', x: 380, seatY: 150, near: s.near, hold: s.hold || (t > 0.6 ? 'can' : null), far: 'hang', tilt: s.tilt + (t < 0.6 ? 0.15 : 0), lean: t < 0.6 ? 0.12 : 0.02 }],
    hud: hud('07:00', 'ТАҢЕРТЕҢ', n, t, 1.6) };` });

// 2. 08:10 on the road: walking and drinking; a car rushes past
scene({ id: 'road', dur: 3.2, sfx: [['click-soft', 0.35, 0.8], ['whoosh', 1.75, 0.55]], js: `
  const w = 165 * t;
  const s = sip(t, 0.5, 1.5, 'swing');
  const n = t > 1.0 ? 2 : 1;
  const bx = w + 35;
  return { set: 'street', bgBlur: 7, farP: 0.45,
    env: { car: t > 1.5 && t < 2.8 ? lerp(1500, -1700, (t - 1.5) / 1.2) + bx : null },
    cam: { x: bx + 60, y: -360, zoom: 1.32, ay: 0.56 },
    chars: [{ kind: 'hero', pose: 'walk', x: 0, w, near: s.near, hold: 'can', far: 'swing', tilt: s.tilt, lean: 0.05 }],
    hud: hud('08:10', 'ЖОЛДА', n, t, 1.0) };` });

// 3. 10:30 at university: knee bouncing, third can
scene({ id: 'study', dur: 3.2, sfx: [['click-soft', 0.55, 0.8]], js: `
  const s = sip(t, 0.75, 1.8, 'type');
  const n = t > 1.25 ? 3 : 2;
  return { set: 'class', bgBlur: 6,
    cam: { x: 220, y: -380, zoom: lerp(1.35, 1.48, E(t, 0, 3.2)), ay: 0.56 },
    chars: [
      { kind: 'student', pose: 'sit', x: 520, near: 'type', far: 'type', lean: 0.12, text: '' },
      { kind: 'hero', pose: 'sit', x: -40, near: s.near, hold: s.hold, far: 'type', tilt: s.tilt, lean: 0.1, bounce: true, tremble: 0.8 },
    ],
    hud: hud('10:30', 'ОҚУДА', n, t, 1.25) };` });

// 4. 12:00 at work: typing fast, two cans
scene({ id: 'work', dur: 3.4, sfx: [['typing', 0.0, 0.35], ['click-soft', 0.35, 0.8], ['click-soft', 1.85, 0.8], ['typing', 2.75, 0.35]], js: `
  const a = sip(t, 0.5, 1.25, 'type'), b = sip(t, 2.0, 2.75, 'type');
  const s = t < 1.6 ? a : b;
  const n = t > 2.4 ? 5 : t > 0.9 ? 4 : 3;
  return { set: 'office', bgBlur: 6, env: { cans: t > 1.4 ? 1 : 0 },
    cam: { x: 200, y: -390, zoom: 1.42, ay: 0.56 },
    chars: [{ kind: 'hero', pose: 'sit', x: -60, seatY: 110, near: s.near, hold: s.hold, far: 'type', tilt: s.tilt, lean: 0.14, tremble: 1, light: '95,168,216' }],
    hud: hud('12:00', 'ЖҰМЫСТА', n, t, t > 2.4 ? 2.4 : 0.9, { bpm: 96 }) };` });

// 5. 13:30 lunch: food and water untouched, sixth can
scene({ id: 'lunch', dur: 3.0, sfx: [['click-soft', 0.4, 0.8]], js: `
  const s = sip(t, 0.6, 1.8, 'chest');
  const n = t > 1.2 ? 6 : 5;
  return { set: 'cafe', bgBlur: 6,
    cam: { x: 200, y: -380, zoom: lerp(1.5, 1.4, E(t, 0, 3)), ay: 0.56 },
    chars: [{ kind: 'hero', pose: 'sit', x: -40, near: s.near, hold: 'can', far: 'hang', tilt: s.tilt, lean: 0.06, tremble: 1 }],
    hud: hud('13:30', 'ТҮСКІ АС', n, t, 1.2, { bpm: 104 }) };` });

// 6. 21:00 gaming: RGB room, two more cans
scene({ id: 'game', dur: 3.6, sfx: [['click-soft', 0.65, 0.8], ['click-soft', 2.05, 0.8]], js: `
  const a = sip(t, 0.8, 1.5, 'controller'), b = sip(t, 2.2, 2.9, 'controller');
  const s = t < 1.85 ? a : b;
  const n = t > 2.6 ? 8 : t > 1.2 ? 7 : 6;
  return { set: 'gaming', bgBlur: 6, env: { cans: n - 5 },
    cam: { x: 230, y: -390, zoom: 1.38, ay: 0.56 },
    chars: [{ kind: 'hero', pose: 'sit', x: -50, seatY: 115, near: s.near, hold: s.hold, far: 'controller', tilt: s.tilt, lean: 0.12, tremble: 1.3, light: '150,120,255' }],
    hud: hud('21:00', 'ОЙЫН', n, t, t > 2.6 ? 2.6 : 1.2, { bpm: 118 }) };` });

// 7. 03:00 night: can 9 and 10, heart racing, the can is crushed
scene({ id: 'night', dur: 4.0, sfx: [['click-soft', 0.35, 0.8], ['click-soft', 1.85, 0.8], ['key-press', 3.2, 0.9]], js: `
  const a = sip(t, 0.5, 1.3, 'controller'), b = sip(t, 2.0, 2.8, 'controller');
  const s = t < 1.65 ? a : b;
  const n = t > 2.4 ? 10 : t > 0.9 ? 9 : 8;
  const bpm = lerp(125, 172, E(t, 0.5, 3.6));
  return { set: 'gaming', bgBlur: 6, dark: 0.35, env: { cans: n - 5, moon: true, clock: '03:00', screen: 1.3 },
    cam: { x: 110, y: -380, zoom: lerp(1.38, 1.75, E(t, 0, 4)), ay: 0.56 },
    chars: [{ kind: 'hero', pose: 'sit', x: -50, seatY: 115, near: t > 3.0 ? 'chest' : s.near, hold: (t > 3.0) ? 'can' : s.hold, crush: t > 3.2, far: 'controller', tilt: s.tilt, lean: 0.14, tremble: lerp(1.5, 4, E(t, 1, 4)), light: '150,120,255' }],
    hud: hud('03:00', 'ТҮН', n, t, t > 2.4 ? 2.4 : 0.9, { bpm, danger: n >= 10 }) };` });

// 8. Collapse: stands up, heart pounds, dizziness, falls
scene({ id: 'collapse', dur: 4.4, sfx: [['glitch-1', 0.9, 0.35], ['impact-bass-2', 2.4, 0.9]], js: `
  const fallT = clamp((t - 2.45) / 0.55, 0, 1);
  const rot = fallT * fallT * (Math.PI / 2);
  const sway = (1 - fallT) * 0.07 * Math.sin(t * 3.4) * E(t, 0.3, 1.2);
  const bpm = 175;
  const beat = (t * bpm / 60) % 1;
  const sh = shake(t, 3.0, 40);
  return { set: 'gaming', bgBlur: 6, dark: 0.35, env: { cans: 5, moon: true, clock: '03:12', screen: 1.3 },
    cam: { x: 120 + sh.x, y: -330 + sh.y, zoom: 1.25, ay: 0.56, rot: 0.04 * Math.sin(t * 2.1) * E(t, 0.5, 1.5) },
    double: E(t, 0.6, 2.0) * (1 - E(t, 3.0, 3.2)), red: (0.25 + 0.45 * Math.exp(-beat * 6)) * E(t, 0.2, 1.0),
    chars: [{ kind: 'hero', pose: 'stand', x: 60, near: 'clutch', far: t > 1.4 ? 'head' : 'clutch', tilt: 0.3 + 0.1 * Math.sin(t * 4), lean: 0.12, tremble: 3 * (1 - fallT), rot: rot + sway, pivot: { x: 60, y: 0 } }],
    flash: t > 3.0 ? 0.7 * Math.exp(-(t - 3.0) * 8) : 0, fade: E(t, 3.4, 4.3),
    hud: hud('03:12', '', null, t, null, { bpm: t < 3.0 ? bpm : 0, alpha: 1 - E(t, 2.8, 3.1) }) };` });

// 9. POV in the ambulance: eyes open and close, medics lean over
scene({ id: 'pov', dur: 3.4, sfx: [['ping', 0.5, 0.25], ['ping', 2.1, 0.25]], js: `
  const lid = t < 0.6 ? lerp(1, 0.3, E(t, 0, 0.6)) : t < 1.3 ? lerp(0.3, 0.72, E(t, 0.6, 1.3)) : t < 2.0 ? lerp(0.72, 0.35, E(t, 1.3, 2.0)) : lerp(0.4, 1, E(t, 2.3, 3.3));
  return { set: null, blur: 12, eyelid: lid,
    cam: { x: 0, y: 0, zoom: 1 },
    screenFx: (g, tt) => {
      const W = 1080, H = 1920;
      const cg = g.createLinearGradient(0, 0, 0, H); cg.addColorStop(0, '#4b5662'); cg.addColorStop(1, '#2a3038');
      g.fillStyle = cg; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 5; i++) { g.fillStyle = '#56616d'; g.fillRect(120, 200 + i * 330, 840, 280); }
      L.glow(g, 540, 820, 420, '235,245,255', 0.9);
      const siren = Math.sin(tt * 9) > 0;
      L.glow(g, siren ? 150 : 930, 500, 700, siren ? '255,60,60' : '60,110,255', 0.45);
      const bob = Math.sin(tt * 1.7) * 14;
      for (const [x, y, col, col2] of [[230, 980 + bob, '#2f5d8a', '#264d73'], [860, 1060 - bob, '#e9eef2', '#c9d1d8']]) {
        g.fillStyle = col2; g.beginPath(); g.ellipse(x, y + 330, 260, 200, 0, 0, 7); g.fill();
        const hg = g.createRadialGradient(x - 40, y - 40, 20, x, y, 190); hg.addColorStop(0, '#f3eee5'); hg.addColorStop(1, '#bfb7aa');
        g.fillStyle = hg; g.beginPath(); g.arc(x, y, 170, 0, 7); g.fill();
        g.fillStyle = col; g.fillRect(x - 160, y - 175, 320, 70);
      }
    },
    ecg: { bpm: 38, y: 1290, x: 140, w: 800, h: 80 },
    hud: hud('03:24', 'ЖЕДЕЛ ЖӘРДЕМ', null, t, null, { placeColor: '#ff7a7a' }) };` });

// 10. Ambulance wide: CPR, oxygen, slow pulse
scene({ id: 'ambulance', dur: 3.8, sfx: [['ping', 0.4, 0.3], ['ping', 2.0, 0.3]], js: `
  const pump = Math.abs(Math.sin(t * Math.PI * 1.9));
  const sh = shake(0, 0, 0); const r = L.rng(Math.floor(t * 12) + 4);
  return { set: 'ambulance', bgBlur: 5, env: { bpm: 38 },
    cam: { x: 330 + (r() - 0.5) * 6, y: -380 + (r() - 0.5) * 6, zoom: lerp(1.05, 1.15, E(t, 0, 3.8)), ay: 0.62 },
    chars: [
      { kind: 'medic', pose: 'stand', x: 660, facing: -1, near: { x: 545, y: -215 + 6 * pump }, far: { x: 560, y: -225 }, hold: 'bag', lean: 0.3, tilt: 0.25 },
      { kind: 'hero', pose: 'sit', x: 300, facing: -1, seatY: 128, legsOut: true, lean: -1.48, tilt: 0.05, mask: true, pale: true, near: 'hang', far: 'hang', text: 'МЕН', label: 0.9 },
      { kind: 'doctor', pose: 'stand', x: 250, facing: 1, near: { x: 385, y: -170 + pump * 16 }, far: { x: 377, y: -173 + pump * 16 }, lean: 0.5 + pump * 0.05, tilt: 0.25 },
    ],
    hud: hud('03:31', 'ЖЕДЕЛ ЖӘРДЕМ', null, t, null, { placeColor: '#ff7a7a' }) };`,
  html: `<div id="ambulance-cap" class="cap">Дәрігерлер оның өмірі үшін күресуде</div>`,
  css: `.cap { position:absolute; left:140px; width:800px; top:400px; text-align:center; font-family:"KzSans"; font-weight:600; font-size:40px; line-height:1.25; color:#f2eee6; opacity:0; text-shadow:0 3px 18px rgba(0,0,0,0.8); }`,
  tl: `tl.fromTo('#ambulance-cap', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.5);` });

// 11. Coma: kneeling in a beam of light, praying
scene({ id: 'coma', dur: 6.8, sfx: [['whoosh-cinematic', 5.2, 0.35]], js: `
  return { set: 'coma', bgBlur: 3, env: { beam: lerp(0.6, 1.4, E(t, 0, 6.8)) },
    cam: { x: 40, y: -230, zoom: lerp(1.15, 1.35, E(t, 0, 6.8)), ay: 0.66 },
    chars: [{ kind: 'gown', pose: 'kneel', x: 0, oy: -14 + 10 * Math.sin(t * 1.4), near: t > 1.4 ? 'dua' : 'hang', far: t > 1.4 ? 'dua' : 'hang', tilt: t > 1.4 ? -0.12 : 0.35, lean: 0.05, pale: true, label: 0 }],
    ecg: { bpm: 30, y: 1640, x: 80, w: 920, h: 60, col: 'rgba(98,240,138,0.55)', lw: 3 },
    flash: E(t, 6.0, 6.8) };`,
  html: `
    <div id="coma-k" class="kicker">КОМА</div>
    <div id="coma-l1" class="pray">Құдайым...</div>
    <div id="coma-l2" class="pray">Осыдан тірі шықсам,</div>
    <div id="coma-l3" class="pray accent">енді ешқашан энергетик ішпеймін.</div>`,
  css: `
    .kicker { position:absolute; left:0; width:1080px; top:500px; text-align:center; font-family:"KzSans"; font-weight:800; font-size:44px; letter-spacing:18px; color:#9fb6e8; opacity:0; }
    .pray { position:absolute; left:180px; width:720px; text-align:center; font-family:"KzSans"; font-weight:600; font-size:48px; line-height:1.22; color:#eef2ff; opacity:0; text-shadow:0 4px 24px rgba(0,0,0,0.8); }
    #coma-l1 { top:590px; } #coma-l2 { top:670px; } #coma-l3 { top:745px; font-weight:800; color:#f0c46a; }`,
  tl: `
    tl.fromTo('#coma-k', { opacity: 0 }, { opacity: 0.9, duration: 0.6 }, 0.2);
    tl.fromTo('#coma-l1', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.3);
    tl.fromTo('#coma-l2', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 2.3);
    tl.fromTo('#coma-l3', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 3.3);
    tl.to(['#coma-k', '#coma-l1', '#coma-l2', '#coma-l3'], { opacity: 0, duration: 0.4 }, 6.2);` });

// 12. Hospital: wakes up, sits up, raises hands — repentance
scene({ id: 'wake', dur: 7.6, sfx: [['ping', 0.3, 0.25], ['chime', 3.3, 0.45]], js: `
  const up = E(t, 1.4, 2.9);
  return { set: 'hospital', bgBlur: 5, env: { bpm: 72, sun: lerp(0.6, 1.2, E(t, 0, 4)) },
    cam: { x: 230, y: -380, zoom: lerp(1.25, 1.4, E(t, 0, 7.6)), ay: 0.64 },
    chars: [
      { kind: 'doctor', pose: 'stand', x: 560, facing: -1, near: 'chest', far: 'hang', tilt: 0.1, label: E(t, 0.6, 1.0) * (1 - E(t, 4.4, 4.8)) },
      { kind: 'gown', pose: 'sit', x: 0, seatY: 200, legsOut: true, lean: lerp(-1.45, 0.05, up), tilt: lerp(0, 0.2, up) - (t > 3.1 ? 0.3 * E(t, 3.1, 3.6) : 0), near: t > 3.1 ? 'dua' : 'hang', far: t > 3.1 ? 'dua' : 'hang', label: 1 - E(t, 4.4, 4.8) },
    ],
    flash: 0.9 * (1 - E(t, 0, 0.7)),
    hud: hud('08:00', 'АУРУХАНА', null, t, null, { placeColor: '#9fd8ff', alpha: E(t, 0.3, 0.8) * (1 - E(t, 4.4, 4.8)) }) };`,
  html: `
    <div id="wake-l1" class="end1">Тәубе.</div>
    <div id="wake-l2" class="end2">Денсаулық — бір-ақ рет беріледі.</div>`,
  css: `
    .end1 { position:absolute; left:0; width:1080px; top:330px; text-align:center; font-family:"KzSans"; font-weight:800; font-size:76px; color:#f0c46a; opacity:0; text-shadow:0 4px 24px rgba(0,0,0,0.7); }
    .end2 { position:absolute; left:150px; width:780px; top:440px; text-align:center; font-family:"KzSans"; font-weight:600; font-size:52px; line-height:1.22; color:#f2eee6; opacity:0; text-shadow:0 4px 24px rgba(0,0,0,0.75); }`,
  tl: `
    tl.fromTo('#wake-l1', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 4.2);
    tl.fromTo('#wake-l2', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 4.8);` });

// ---------- write files ----------
let start = 0;
const hosts = [], audio = [];
let track = 20;
for (const [i, s] of SC.entries()) {
  s.start = +start.toFixed(2);
  const html = `<template>
  <style>${FONT}
    #root { position: absolute; inset: 0; overflow: hidden; background: #05060b; }
    canvas { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
    .fontwarm { position:absolute; left:100px; top:600px; opacity:0; font-family:"KzSans"; font-weight:600; }
    ${s.css || ''}
  </style>
  <div id="root" data-composition-id="${s.id}" data-width="1080" data-height="1920" data-duration="${s.dur}">
    <canvas id="${s.id}-cv" width="1080" height="1920"></canvas>
    <span class="fontwarm">ҚӘМЕН</span>
    ${s.html || ''}
  </div>
  <script>
    (function () {
      ${PRE}
      function state(t) {${s.js}
      }
      const tl = L.mount('${s.id}-cv', '${s.id}', ${s.dur}, state);
      ${s.tl || ''}
      window.__timelines = window.__timelines || {};
      window.__timelines["${s.id}"] = tl;
    })();
  </script>
</template>
`;
  fs.writeFileSync(`${root}compositions/${s.id}.html`, html);
  hosts.push(`      <div id="${s.id}" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html" data-start="${s.start}" data-duration="${s.dur}" data-track-index="${i + 1}" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index:${i + 1}"></div>`);
  const DUR = { click: 0.37, 'click-soft': 0.37, typing: 1.5, whoosh: 0.57, 'whoosh-short': 0.57, 'whoosh-cinematic': 5.54, 'glitch-1': 2.64, 'impact-bass-1': 2.12, 'impact-bass-2': 2.59, ping: 1.32, chime: 2.5, 'key-press': 0.4 };
  for (const [j, [f, at, vol]] of (s.sfx || []).entries()) {
    const st = +(s.start + at).toFixed(2);
    audio.push(`      <audio id="sfx-${s.id}-${j}" class="clip" src="assets/audio/${f}.mp3" data-start="${st}" data-duration="${DUR[f]}" data-track-index="${track}" data-volume="${vol}"></audio>`);
    track = track === 24 ? 20 : track + 1;
  }
  start += s.dur;
}
const total = +start.toFixed(2);
const at = (id, dt) => +(SC.find((x) => x.id === id).start + dt).toFixed(2);
// transitions
for (const [k, id] of ['road', 'study', 'work', 'lunch', 'game', 'night'].entries()) {
  audio.push(`      <audio id="cut-${id}" class="clip" src="assets/audio/${k % 2 ? 'whoosh' : 'whoosh-short'}.mp3" data-start="${at(id, -0.08)}" data-duration="0.57" data-track-index="25" data-volume="0.22"></audio>`);
}
const musicA = at('collapse', 2.45);
const index = `<!doctype html>
<html lang="kk" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>10 БАНКА</title>
    <script src="lib/gsap.min.js"></script>
    <script src="lib/life.js"></script>
    <style>${FONT}
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1080px; height: 1920px; overflow: hidden; background: #05060b; }
      #root { position: relative; width: 100%; height: 100%; background: #05060b; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1080" data-height="1920">
${hosts.join('\n')}
      <audio id="music-day" class="clip" src="assets/audio/music-day.wav" data-start="0" data-duration="${musicA}" data-track-index="16" data-volume="0.75" data-timeline-role="music"></audio>
      <audio id="music-after" class="clip" src="assets/audio/music-after.wav" data-start="${at('pov', 0)}" data-duration="${+(total - at('pov', 0)).toFixed(2)}" data-track-index="17" data-volume="0.8" data-timeline-role="music"></audio>
      <audio id="heart-fast" class="clip" src="assets/audio/hb_fast.wav" data-start="${at('night', 0.6)}" data-duration="${+(musicA + 0.6 - at('night', 0.6)).toFixed(2)}" data-track-index="18" data-volume="0.9"></audio>
      <audio id="heart-slow" class="clip" src="assets/audio/hb_slow.wav" data-start="${at('coma', 0)}" data-duration="6.8" data-track-index="18" data-volume="0.7"></audio>
${audio.join('\n')}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
fs.writeFileSync(`${root}index.html`, index);
console.log('total', total, SC.map((s) => `${s.id}@${s.start}`).join(' '));
