// Generates index.html and compositions/s1..s6.html.
// Each scene is a canvas drawn by lib/mall.js from a state(t) function written below.
import fs from 'fs';
const root = new URL('..', import.meta.url).pathname;

const FONT = [500, 600, 800].map((w) => `
  @font-face { font-family: "KzSans"; font-weight: ${w}; src: url("assets/fonts/montserrat-cyrillic-ext-${w}-normal.woff2") format("woff2"); unicode-range: U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F; }
  @font-face { font-family: "KzSans"; font-weight: ${w}; src: url("assets/fonts/montserrat-cyrillic-${w}-normal.woff2") format("woff2"); unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116; }
  @font-face { font-family: "KzSans"; font-weight: ${w}; src: url("assets/fonts/montserrat-latin-${w}-normal.woff2") format("woff2"); unicode-range: U+0000-00FF, U+2000-206F; }`).join('');

const V = 60; // escalator speed, world units per second

// Shared JS prelude for state builders.
const PRE = `const M = window.Mall, P = M.P, E = M.ease, lerp = M.lerp, D = M.D;
const FG = [{ x: -260, y: -120, r: 190, a: 0.32 }, { x: 640, y: 700, r: 260, a: 0.22 }, { x: 900, y: -900, r: 150, a: 0.25 }];
function follow(s, dx, dy) { const p = P(s); return { x: p.x + dx, y: p.y + dy }; }`;

const scenes = [
  {
    id: 's1', dur: 4.6, // close: МОТИВАЦИЯ, bobbing to the music
    js: `
      const belt = ${V} * t;
      const s = 1000 + belt + D / 2;
      const f = follow(s, 40, -235);
      const nod = Math.sin(t * Math.PI * 2 * 1.333);
      return {
        cam: { x: f.x - t * 6, y: f.y, zoom: lerp(2.3, 2.12, E(t, 0, 4.6)), ay: 0.5 },
        belt, bgBlur: 11, fg: FG,
        chars: [{ kind: 'motiv', s0: 1000, w: 0, near: 'rail', far: 'rail', tilt: 0.05 + 0.06 * nod, lean: 0.03 + 0.015 * nod, label: E(t, 0.0, 0.01) }],
      };`,
    html: '',
  },
  {
    id: 's2', dur: 4.6, // close: ЭГО, selfie with a flash
    js: `
      const belt = ${V} * (t + 4.6);
      const s = 1450 + belt + D / 2;
      const f = follow(s, 10, -250);
      const flash = t > 2.5 ? Math.exp(-(t - 2.5) * 7) : 0;
      return {
        cam: { x: f.x + lerp(-40, 30, E(t, 0, 4.6)), y: f.y, zoom: 2.05, ay: 0.5 },
        belt, bgBlur: 11, fg: FG,
        chars: [{ kind: 'ego', s0: 1450, w: 0, near: 'phoneUp', far: 'rail', tilt: -0.16 + (t > 2.5 ? -0.05 * E(t, 2.5, 2.8) : 0), lean: -0.04, flash, glow: true, label: E(t, 0.1, 0.5) }],
      };`,
  },
  {
    id: 's3', dur: 3.8, // close: ҚОРҚЫНЫШ gripping the rail; ТӘРТІП appears behind
    js: `
      const belt = ${V} * (t + 9.2);
      const s = 700 + belt + D / 2;
      const f = follow(s, -40, -205);
      return {
        cam: { x: f.x - E(t, 1.8, 3.6) * 150, y: f.y + E(t, 1.8, 3.6) * 40, zoom: lerp(2.45, 2.05, E(t, 1.6, 3.8)), ay: 0.5 },
        belt, bgBlur: 11, fg: FG,
        chars: [
          { kind: 'disc', s0: 420, w: 0, near: 'pocket', far: 'hang', label: E(t, 2.6, 3.1) },
          { kind: 'fear', s0: 700, w: 0, near: 'rail', far: 'rail', lean: 0.22, tilt: 0.38 - 0.1 * E(t, 1.0, 1.6) + 0.1 * E(t, 2.2, 2.8), tremble: 1.8, label: E(t, 0.1, 0.5) },
        ],
      };`,
  },
  {
    id: 's4', dur: 4.8, // wide: everyone rides up; the power cuts out and the escalator stops
    js: `
      const tc = 2.6;
      const t0 = 13.0;
      const bt = t < tc ? t : tc + 0.12 * (1 - Math.exp(-(t - tc) * 8));
      const belt = ${V} * (t0 + bt);
      let power = 1;
      if (t >= tc) { const k = Math.floor((t - tc) / 0.07); power = [0.15, 1, 0.1, 0.8, 0.05, 0.4, 0][Math.min(k, 6)]; }
      const dt = t - tc;
      const lurch = dt > 0 ? 0.3 * Math.exp(-dt * 5) * Math.sin(dt * 13) : 0;
      const z = lerp(0.95, 0.5, E(t, 0, 2.3));
      return {
        cam: { x: lerp(${(700 + V * 13) * Math.cos(Math.PI / 6)}, 1180, E(t, 0, 2.3)), y: lerp(${-(700 + V * 13) * 0.5 - 150}, -700, E(t, 0, 2.3)), zoom: z, ay: 0.52 },
        belt, power, bgBlur: lerp(9, 4, E(t, 0, 2.3)),
        chars: [
          { kind: 'disc', s0: 420, w: 0, near: 'pocket', far: 'hang', lurch: lurch * 0.4 },
          { kind: 'fear', s0: 700, w: 0, near: 'rail', far: 'rail', lean: 0.22, tilt: 0.3, tremble: 1.5 + (dt > 0 ? 2 : 0), lurch },
          { kind: 'motiv', s0: 1000, w: 0, near: 'rail', far: 'rail', lurch, tilt: dt > 0.6 ? 0.25 * E(t, tc + 0.6, tc + 1.2) : 0 },
          { kind: 'ego', s0: 1450, w: 0, near: dt > 0.9 ? 'phoneEar' : 'phoneUp', far: 'rail', tilt: -0.16, lurch, glow: true },
        ],
      };`,
  },
  {
    id: 's5', dur: 5.0, // tracking: ТӘРТІП keeps walking up the stopped stairs, past the others
    js: `
      const B = ${V * (13 + 2.72)};
      const w = 1040 * (0.15 * E(t, 0.2, 4.9) + 0.85 * Math.max(0, Math.min(1, (t - 0.35) / 4.4)));
      const sd = 420 + B + w + D / 2;
      const f = follow(sd, 70, -220);
      return {
        cam: { x: f.x, y: f.y, zoom: 1.12, ay: 0.5 },
        belt: B, power: 0, bgBlur: 7,
        chars: [
          { kind: 'fear', s0: 700, w: lerp(0, 230, E(t, 0.6, 4.8)), walking: true, facing: -1, near: 'rail', far: 'rail', lean: 0.2, tilt: 0.3, tremble: 1.2 , label: 1 - E(t, 0.5, 0.8) + E(t, 2.2, 2.5) },
          { kind: 'motiv', s0: 1052, w: 0, pose: 'sit', facing: -1, near: 'head', far: 'head', lean: 0.55, tilt: 0.35 },
          { kind: 'ego', s0: 1450, w: 0, near: 'phoneEar', far: 'gesture', tilt: -0.12 },
          { kind: 'disc', s0: 420, w, walking: true, near: 'swing', far: 'swing', lean: 0.1, labelColor: '#f0c46a' },
        ],
      };`,
  },
  {
    id: 's6', dur: 6.4, // wide top: ТӘРТІП reaches the top; the light comes on; the line
    js: `
      const B = ${V * (13 + 2.72)};
      const w = lerp(1040, 1352, E(t, 0, 2.8) * 0.5 + Math.min(1, t / 2.8) * 0.5);
      return {
        cam: { x: ${Math.round(2600 * Math.cos(Math.PI / 6)) - 120} + 30 * E(t, 0, 5.6), y: -1300 + 140, zoom: lerp(0.68, 0.62, E(t, 0, 5.6)), ay: 0.62 },
        belt: B, power: 0, bgBlur: 5, topGlow: E(t, 2.4, 3.8),
        chars: [
          { kind: 'ego', s0: 1450, w: 0, near: 'phoneEar', far: 'gesture', tilt: -0.12, label: 0.7 },
          { kind: 'disc', s0: 420, w, walking: true, near: 'swing', far: 'swing', lean: 0.1 * (1 - E(t, 2.8, 3.3)), labelColor: '#f0c46a' },
        ],
      };`,
    html: `
    <div id="s6-l1" class="line">Мотивация тоқтап қалады.</div>
    <div id="s6-l2" class="line accent">Тәртіп — жүре береді.</div>`,
    css: `
    .line { position:absolute; left:130px; width:820px; text-align:center; font-family:"KzSans"; font-weight:600; font-size:52px; line-height:1.25; color:#ece8f2; opacity:0; text-shadow:0 4px 24px rgba(0,0,0,0.7); }
    #s6-l1 { top:330px; }
    #s6-l2 { top:420px; font-weight:800; font-size:60px; color:#f0c46a; }`,
    tl: `
      tl.fromTo('#s6-l1', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 3.0);
      tl.fromTo('#s6-l2', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 4.0);`,
  },
];

let start = 0;
const hosts = [];
for (const [i, s] of scenes.entries()) {
  const html = `<template>
  <style>${FONT}
    #root { position: absolute; inset: 0; overflow: hidden; background: #0b0d18; }
    canvas { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
    .fontwarm { position:absolute; left:100px; top:400px; opacity:0; font-family:"KzSans"; font-weight:600; }${s.css || ''}
  </style>
  <div id="root" data-composition-id="${s.id}" data-width="1080" data-height="1920" data-duration="${s.dur}">
    <canvas id="${s.id}-cv" width="1080" height="1920"></canvas>
    <span class="fontwarm">ҚӘМОТИВАЦИЯ</span>${s.html || ''}
  </div>
  <script>
    (function () {
      ${PRE}
      function state(t) {${s.js}
      }
      const tl = M.mount('${s.id}-cv', '${s.id}', ${s.dur}, state);${s.tl || ''}
      window.__timelines = window.__timelines || {};
      window.__timelines["${s.id}"] = tl;
    })();
  </script>
</template>
`;
  fs.writeFileSync(`${root}compositions/${s.id}.html`, html);
  hosts.push(`      <div id="${s.id}" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html" data-start="${start.toFixed(2)}" data-duration="${s.dur}" data-track-index="${i + 1}" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index:${i + 1}"></div>`);
  s.start = start;
  start += s.dur;
}
const total = +start.toFixed(2);
const at = (id, dt) => +(scenes.find((x) => x.id === id).start + dt).toFixed(2);

const sfx = [
  ['sfx-cut2', 'whoosh-short.mp3', at('s2', -0.08), 0.57, 0.35],
  ['sfx-flash', 'click-soft.mp3', at('s2', 2.5), 0.36, 0.7],
  ['sfx-cut3', 'whoosh.mp3', at('s3', -0.08), 0.57, 0.3],
  ['sfx-cut4', 'whoosh-cinematic.mp3', at('s4', -0.1), 2.4, 0.35],
  ['sfx-stop', 'impact-bass-1.mp3', at('s4', 2.6), 2.11, 0.8],
  ['sfx-cut6', 'whoosh-short.mp3', at('s6', -0.08), 0.57, 0.3],
];
const audio = sfx.map(([id, f, st, d, v], i) => `      <audio id="${id}" class="clip" src="assets/audio/${f}" data-start="${st}" data-duration="${d}" data-track-index="${12 + (i % 3)}" data-volume="${v}"></audio>`).join('\n');

const index = `<!doctype html>
<html lang="kk" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>ЖОҒАРЫ</title>
    <script src="lib/gsap.min.js"></script>
    <script src="lib/mall.js"></script>
    <style>${FONT}
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1080px; height: 1920px; overflow: hidden; background: #0b0d18; }
      #root { position: relative; width: 100%; height: 100%; background: #0b0d18; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1080" data-height="1920">
${hosts.join('\n')}
      <audio id="music" class="clip" src="assets/audio/music.wav" data-start="0" data-duration="${total}" data-track-index="11" data-volume="0.9" data-timeline-role="music"></audio>
${audio}
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
console.log('total', total, scenes.map((s) => `${s.id}@${s.start.toFixed(2)}`).join(' '));
