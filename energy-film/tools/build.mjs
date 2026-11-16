// Generates index.html and compositions/s1..s6.html.
// Each scene is a canvas drawn by lib/mall.js from a state(t) function written below.
import fs from 'fs';
const root = new URL('..', import.meta.url).pathname;

const FONT = [500, 600, 800].map((w) => `
  @font-face { font-family: "KzSans"; font-weight: ${w}; src: url("assets/fonts/montserrat-cyrillic-ext-${w}-normal.woff2") format("woff2"); unicode-range: U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F; }
  @font-face { font-family: "KzSans"; font-weight: ${w}; src: url("assets/fonts/montserrat-cyrillic-${w}-normal.woff2") format("woff2"); unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116; }
  @font-face { font-family: "KzSans"; font-weight: ${w}; src: url("assets/fonts/montserrat-latin-${w}-normal.woff2") format("woff2"); unicode-range: U+0000-00FF, U+2000-206F; }`).join('');

const PRE = `const M = window.Mall, P = M.P, E = M.ease, lerp = M.lerp, D = M.D;
const FG = [{ x: -260, y: -120, r: 190, a: 0.32 }, { x: 640, y: 700, r: 260, a: 0.22 }, { x: 900, y: -900, r: 150, a: 0.25 }];
function follow(s, dx, dy) { const p = P(s); return { x: p.x + dx, y: p.y + dy }; }
function shake(t, t0, amp) { if (t < t0) return { x: 0, y: 0 }; const r = M.rng(Math.floor(t * 30) * 17 + 9), k = Math.exp(-(t - t0) * 5) * amp; return { x: (r() * 2 - 1) * k, y: (r() * 2 - 1) * k }; }
const RUN = (t) => 0;`;

const scenes = [
  {
    id: 's1', dur: 4.4, // close: A opens a can, drinks, the battery jumps, he bolts up the stairs
    js: `
      const w = Math.max(0, t - 2.6) ** 2 * 190;
      const f = follow(300 + Math.min(w, 120) + D / 2, 40, -235);
      const drinking = t > 0.7 && t < 2.0;
      const bat = lerp(0.18, 1, E(t, 2.0, 2.35));
      return {
        cam: { x: f.x, y: f.y, zoom: lerp(2.3, 2.1, E(t, 0, 4.4)), ay: 0.5 },
        belt: 0, bgBlur: 11, fg: FG,
        chars: [{ kind: 'energy', s0: 300, w, walking: t > 2.6, hold: 'can', near: drinking ? 'drink' : (t > 2.6 ? 'swing' : 'chest'), far: t > 2.6 ? 'swing' : 'hang', armAmp: 1.7,
          tilt: drinking ? -0.35 : (t > 2.0 && t < 2.6 ? -0.1 : 0.02), lean: t > 2.6 ? 0.3 : 0.02, tremble: t > 2.1 ? 1.6 : 0,
          speed: E(t, 2.8, 3.1), battery: bat, bpm: t > 2.2 ? 140 : 0, label: 1 }],
      };`,
  },
  {
    id: 's2', dur: 4.0, // close: B drinks water and starts walking at an even pace
    js: `
      const w = Math.max(0, t - 2.0) * 95;
      const f = follow(150 + w * 0.6 + D / 2, 20, -240);
      const drinking = t > 0.6 && t < 1.6;
      return {
        cam: { x: f.x, y: f.y, zoom: 2.1, ay: 0.5 },
        belt: 0, bgBlur: 11, fg: FG,
        chars: [{ kind: 'calm', s0: 150, w, walking: t > 2.0, hold: 'bottle', near: drinking ? 'drink' : (t > 2.0 ? 'swing' : 'chest'), far: t > 2.0 ? 'swing' : 'hang',
          tilt: drinking ? -0.3 : 0, lean: t > 2.0 ? 0.08 : 0, battery: 0.7, bpm: 72, label: E(t, 0.05, 0.35) }],
      };`,
  },
  {
    id: 's3', dur: 5.0, // wide race: A sprints past, then crashes halfway; B keeps the same pace
    js: `
      const run = 700 + 267 * Math.min(t, 2.6) + (t > 2.6 ? 230 * (1 - Math.exp(-(t - 2.6) * 2.2)) : 0);
      const wa = Math.min(run, 1600);
      const crashed = t > 3.75;
      const bat = t < 2.3 ? 1 : lerp(1, 0.06, E(t, 2.3, 3.6));
      const sh = shake(t, 3.75, 22);
      return {
        cam: { x: 1180 + sh.x, y: -700 + sh.y, zoom: 0.5, ay: 0.52 },
        belt: 0, bgBlur: 4,
        chars: [
          { kind: 'calm', s0: 150, w: 300 + 100 * t, walking: true, hold: 'bottle', near: 'swing', far: 'swing', lean: 0.08, battery: 0.7, bpm: 74 },
          crashed
            ? { kind: 'energy', s0: 1900, w: 0, pose: 'sit', facing: -1, hold: 'can', near: 'head', far: 'head', lean: 0.6, tilt: 0.45, tremble: 2.5, battery: 0.06, bpm: 150 }
            : { kind: 'energy', s0: 300, w: wa, walking: true, hold: 'can', near: 'swing', far: 'swing', armAmp: 1.7, lean: lerp(0.3, 0.5, E(t, 2.6, 3.6)), tremble: 1.6, speed: 1 - E(t, 2.4, 3.2), battery: bat, bpm: 140 + Math.round(10 * E(t, 2.5, 3.5)) },
        ],
      };`,
  },
  {
    id: 's4', dur: 5.0, // close: A is drained; a second can gives a short spike that crashes again
    js: `
      const drinking = t > 1.7 && t < 2.7;
      const bat = t < 2.4 ? 0.06 : (t < 2.9 ? lerp(0.06, 0.4, E(t, 2.4, 2.8)) : lerp(0.4, 0.03, E(t, 2.9, 4.3)));
      const f = follow(1900, -30, -150);
      const sh = shake(t, 2.5, 10);
      return {
        cam: { x: f.x + sh.x, y: f.y + sh.y, zoom: lerp(2.2, 2.45, E(t, 0, 5)), ay: 0.5 },
        belt: 0, bgBlur: 11, fg: FG,
        chars: [{ kind: 'energy', s0: 1900, w: 0, pose: 'sit', facing: -1, hold: (t > 1.4 && t < 3.6) ? 'can2' : null,
          near: drinking ? 'drink' : 'head', far: 'head', lean: drinking ? 0.25 : lerp(0.55, 0.7, E(t, 3.4, 4.4)), tilt: drinking ? -0.3 : 0.45,
          tremble: drinking ? 3.2 : 2.2, battery: bat, bpm: t > 2.6 ? 165 : 150, label: 1 }],
      };`,
  },
  {
    id: 's5', dur: 4.8, // tracking: B walks past A at the same calm pace
    js: `
      const w = lerp(900, 2000, t / 4.8);
      const f = follow(150 + w + D / 2, 60, -220);
      return {
        cam: { x: f.x, y: f.y, zoom: 1.1, ay: 0.5 },
        belt: 0, bgBlur: 7,
        chars: [
          { kind: 'energy', s0: 1900, w: 0, pose: 'sit', facing: -1, near: 'head', far: 'head', lean: 0.7, tilt: 0.45, tremble: 2, battery: 0.03, bpm: 160, label: 1 - 0.6 * E(t, 3.2, 3.6) },
          { kind: 'calm', s0: 150, w, walking: true, hold: 'bottle', near: 'swing', far: 'swing', lean: 0.08, battery: 0.7, bpm: 76 },
        ],
      };`,
  },
  {
    id: 's6', dur: 5.8, // wide top: B arrives, the light opens; the closing lines
    js: `
      const w = lerp(2000, 2444, E(t, 0, 2.6) * 0.5 + Math.min(1, t / 2.6) * 0.5);
      return {
        cam: { x: ${Math.round(2600 * Math.cos(Math.PI / 6)) - 160} + 30 * E(t, 0, 5.8), y: -1300 + 170, zoom: lerp(0.66, 0.6, E(t, 0, 5.8)), ay: 0.64 },
        belt: 0, bgBlur: 5, topGlow: E(t, 2.0, 3.4),
        chars: [
          { kind: 'energy', s0: 1900, w: 0, pose: 'sit', facing: -1, near: 'head', far: 'head', lean: 0.7, tilt: 0.45, tremble: 1.5, battery: 0.03, label: 0.75 },
          { kind: 'calm', s0: 150, w, walking: t < 2.6, hold: 'bottle', near: t < 2.6 ? 'swing' : 'chest', far: t < 2.6 ? 'swing' : 'hang', lean: 0.08 * (1 - E(t, 2.3, 2.8)), battery: 0.7, bpm: 72, labelColor: '#9fe6b0' },
        ],
      };`,
    html: `
    <div id="s6-txt">
      <div id="s6-l1" class="line">Энергетик — қарызға алынған қуат.</div>
      <div id="s6-l2" class="line accent">Нағыз қуат — ұйқы, су, қозғалыс.</div>
    </div>`,
    css: `
    #s6-txt { position:absolute; left:150px; top:300px; width:780px; display:flex; flex-direction:column; gap:26px; }
    .line { width:780px; text-align:center; font-family:"KzSans"; font-weight:600; font-size:52px; line-height:1.22; color:#ece8f2; opacity:0; text-shadow:0 4px 24px rgba(0,0,0,0.75); }
    #s6-l2 { font-weight:800; font-size:58px; color:#9fe6b0; }`,
    tl: `
      tl.fromTo('#s6-l1', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 2.4);
      tl.fromTo('#s6-l2', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 3.2);`,
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
  ['sfx-can', 'click-soft.mp3', at('s1', 0.5), 0.36, 0.9],
  ['sfx-charge', 'sparkle.mp3', at('s1', 2.0), 1.8, 0.45],
  ['sfx-dash', 'whoosh.mp3', at('s1', 2.75), 0.57, 0.5],
  ['sfx-cut2', 'whoosh-short.mp3', at('s2', -0.08), 0.57, 0.3],
  ['sfx-cut3', 'whoosh-cinematic.mp3', at('s3', -0.1), 2.4, 0.3],
  ['sfx-crash', 'impact-bass-1.mp3', at('s3', 3.75), 2.11, 0.85],
  ['sfx-can2', 'click-soft.mp3', at('s4', 1.5), 0.36, 0.8],
  ['sfx-spike', 'whoosh-short.mp3', at('s4', 2.45), 0.57, 0.4],
  ['sfx-cut5', 'whoosh.mp3', at('s5', -0.08), 0.57, 0.25],
  ['sfx-cut6', 'whoosh-short.mp3', at('s6', -0.08), 0.57, 0.25],
];
const audio = sfx.map(([id, f, st, d, v], i) => `      <audio id="${id}" class="clip" src="assets/audio/${f}" data-start="${st}" data-duration="${d}" data-track-index="${12 + (i % 3)}" data-volume="${v}"></audio>`).join('\n');

const index = `<!doctype html>
<html lang="kk" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>ЭНЕРГЕТИК</title>
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
