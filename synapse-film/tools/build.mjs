// Generates index.html and compositions/*.html for «СИНАПС» (50 s, 1080×1920).
// node tools/build.mjs   (from the project folder)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = (f, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true }); fs.writeFileSync(path.join(ROOT, f), s); console.log('wrote', f); };
const narration = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/narration.json'), 'utf8'));

const FONT_CSS = [500, 600, 800].map((w) => `
  @font-face { font-family: "KzSans"; font-weight: ${w}; src: url("assets/fonts/montserrat-cyrillic-ext-${w}-normal.woff2") format("woff2"); unicode-range: U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F; }
  @font-face { font-family: "KzSans"; font-weight: ${w}; src: url("assets/fonts/montserrat-cyrillic-${w}-normal.woff2") format("woff2"); unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116; }
  @font-face { font-family: "KzSans"; font-weight: ${w}; src: url("assets/fonts/montserrat-latin-${w}-normal.woff2") format("woff2"); unicode-range: U+0000-00FF, U+2000-206F; }`).join('');

// ---------------------------------------------------------------- world (the one continuous 3D shot + its overlays)
const LABELS = [
  // id, anchor, text, start, end, side (label sits left/right of the anchor)
  ['lb-pre', 'pre', 'ПРЕСИНАПС', 17.4, 24.2, 1],
  ['lb-post', 'post', 'ПОСТСИНАПС', 18.2, 24.2, 1],
  ['lb-cleft', 'cleft', 'САҢЫЛАУ ≈ 20 нм', 21.3, 24.4, -1],
  ['lb-nt', 'nt', 'НЕЙРОМЕДИАТОРЛАР', 25.9, 29.6, -1],
  ['lb-rec', 'rec', 'РЕЦЕПТОРЛАР', 31.0, 34.2, -1],
  ['lb-hero', 'hero', 'НЕЙРОН', 9.9, 11.6, 1],
  ['lb-axon', 'axon', 'АКСОН · 100 м/с', 12.0, 15.2, 1],
];
const HUD = [
  ['hud-a', '×1 000', 'НЕЙРОНДАР ОРМАНЫ', 0, 16.3],
  ['hud-b', '×1 000 000', 'СИНАПС', 16.3, 37.0],
  ['hud-c', '×1', 'БҮКІЛ МИ', 37.0, 45.6],
];
const world = `<template>
  <style>${FONT_CSS}
    #root { position: absolute; inset: 0; overflow: hidden; background: #01030a; }
    .cv { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
    #w-bloom { mix-blend-mode: screen; opacity: 0.9; }
    #w-vig { position:absolute; inset:0; background: radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,2,10,0.78) 100%); }
    #w-flash { position:absolute; inset:0; background: radial-gradient(circle at 50% 50%, #ffffff 0%, #bff3ff 35%, #6a7dff 100%); opacity:0; }
    .lab { position:absolute; left:0; top:0; width:0; height:0; }
    .lab-in { position:absolute; top:-26px; white-space:nowrap; opacity:0; font-family:"KzSans",sans-serif; font-weight:800; font-size:30px; letter-spacing:4px; color:#eaffff; }
    .lab-in.r { left:0; } .lab-in.l { right:0; text-align:right; }
    .lab-in .ln { display:inline-block; vertical-align:middle; width:70px; height:2px; background:linear-gradient(90deg,rgba(160,240,255,0.0),rgba(160,240,255,0.9)); }
    .lab-in.r .ln { background:linear-gradient(90deg,rgba(160,240,255,0.9),rgba(160,240,255,0.0)); }
    .lab-in .dot { display:inline-block; vertical-align:middle; width:14px; height:14px; border-radius:50%; background:#bff6ff; box-shadow:0 0 18px 6px rgba(120,220,255,0.75); }
    .lab-in .tx { display:inline-block; vertical-align:middle; margin:0 14px; padding:8px 18px 9px; border:1.5px solid rgba(150,230,255,0.55); border-radius:14px; background:rgba(4,12,40,0.55); text-shadow:0 0 14px rgba(110,210,255,0.9); }
    .hud { position:absolute; left:130px; top:250px; opacity:0; font-family:"KzSans",sans-serif; color:#cdefff; }
    .hud .v { font-weight:800; font-size:44px; letter-spacing:3px; text-shadow:0 0 18px rgba(90,200,255,0.85); }
    .hud .k { font-weight:600; font-size:28px; letter-spacing:6px; opacity:0.75; margin-top:6px; }
    .hud .bar { margin-top:14px; width:220px; height:3px; background:linear-gradient(90deg,#7fe3ff,rgba(127,227,255,0)); }
    #w-title { position:absolute; left:0; top:360px; width:1080px; text-align:center; font-family:"KzSans",sans-serif; color:#ffffff; }
    #w-t1 { font-weight:800; font-size:128px; letter-spacing:20px; padding-left:20px; opacity:0; text-shadow:0 0 30px rgba(120,220,255,0.95), 0 0 90px rgba(160,110,255,0.8); }
    #w-t2 { margin-top:18px; font-weight:600; font-size:44px; letter-spacing:12px; color:#ffe2a3; opacity:0; text-shadow:0 0 24px rgba(255,190,90,0.8); }
    #w-t1 span, #w-t2 span { display:inline-block; }
  </style>
  <div id="root" data-composition-id="world" data-width="1080" data-height="1920" data-layout-allow-overflow data-layout-allow-overlap>
    <canvas id="w-cv" class="cv" width="1080" height="1920"></canvas>
    <canvas id="w-bloom" class="cv" width="270" height="480"></canvas>
    <div id="w-vig"></div>
${LABELS.map(([id, , text, , , side]) => `    <div class="lab" id="${id}"><div class="lab-in ${side > 0 ? 'r' : 'l'}" id="${id}-in">${side > 0 ? '<span class="dot"></span><span class="ln"></span>' : ''}<span class="tx">${text}</span>${side < 0 ? '<span class="ln"></span><span class="dot"></span>' : ''}</div></div>`).join('\n')}
${HUD.map(([id, v, k]) => `    <div class="hud" id="${id}"><div class="v">${v}</div><div class="k">${k}</div><div class="bar"></div></div>`).join('\n')}
    <div id="w-title"><div id="w-t1">СИНАПС</div><div id="w-t2">ОЙДЫҢ ҰШҚЫНЫ</div></div>
    <div id="w-flash"></div>
  </div>
  <script>
    (function () {
      const W = SYN.makeWorld(document.getElementById('w-cv'), document.getElementById('w-bloom'));
      const LABELS = ${JSON.stringify(LABELS.map(([id, a, , s, e, side]) => ({ id, a, s, e, side })))};
      const labEls = LABELS.map(function (l) { return document.getElementById(l.id); });
      function frame(t) {
        W.renderAt(t);
        for (let i = 0; i < LABELS.length; i++) {
          const l = LABELS[i]; if (t < l.s - 0.1 || t > l.e + 0.1) continue;
          const p = W.project(l.a, t);
          const x = Math.max(l.side > 0 ? 120 : 560, Math.min(l.side > 0 ? 520 : 960, p.x)), y = Math.max(420, Math.min(1240, p.y));
          labEls[i].style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
        }
      }
      const tl = gsap.timeline({ paused: true });
      const clock = { t: 0 };
      tl.to(clock, { t: 50, duration: 50, ease: 'none', onUpdate: function () { frame(clock.t); } }, 0);
      LABELS.forEach(function (l) {
        tl.fromTo('#' + l.id + '-in', { opacity: 0, x: l.side * -24 }, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out' }, l.s);
        tl.to('#' + l.id + '-in', { opacity: 0, duration: 0.3, ease: 'power2.in' }, l.e - 0.3);
      });
      ${JSON.stringify(HUD.map(([id, , , s, e]) => ({ id, s, e })))}.forEach(function (h) {
        tl.fromTo('#' + h.id, { opacity: 0, y: 12 }, { opacity: 0.92, y: 0, duration: 0.5, ease: 'power2.out' }, h.s + 0.35);
        tl.to('#' + h.id, { opacity: 0, duration: 0.25, ease: 'power2.in' }, h.e - 0.45);
      });
      // light-flash transitions where the camera dives into the next scale
      tl.to('#w-flash', { opacity: 0.95, duration: 0.3, ease: 'power2.in' }, 16.0);
      tl.to('#w-flash', { opacity: 0, duration: 0.65, ease: 'power2.out' }, 16.3);
      tl.to('#w-flash', { opacity: 0.95, duration: 0.3, ease: 'power2.in' }, 36.7);
      tl.to('#w-flash', { opacity: 0, duration: 0.8, ease: 'power2.out' }, 37.0);
      tl.to('#w-flash', { opacity: 0.18, duration: 0.12, ease: 'power2.out' }, 10.82);
      tl.to('#w-flash', { opacity: 0, duration: 0.5, ease: 'power2.out' }, 10.94);
      tl.fromTo('#w-flash', { opacity: 0.6 }, { opacity: 0, duration: 0.6, ease: 'power2.out' }, 0);
      // title
      tl.fromTo('#w-t1', { opacity: 0, scale: 1.25, filter: 'blur(18px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.4, ease: 'expo.out' }, 45.6);
      tl.fromTo('#w-t2', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 46.5);
      frame(0);
      window.__timelines["world"] = tl;
    })();
  </script>
</template>
`;
OUT('compositions/world.html', world);

// ---------------------------------------------------------------- captions (one host holds every group)
const G = narration.groups;
const captions = `<template>
  <style>${FONT_CSS}
    #root { position: absolute; inset: 0; overflow: hidden; background: transparent; }
    .cg { position:absolute; left:0; top:1330px; width:1080px; text-align:center; opacity:0; visibility:hidden; }
    .pill { display:inline-block; max-width:880px; padding:14px 30px 16px; border-radius:24px; background:rgba(3,8,30,0.55); border:1px solid rgba(140,220,255,0.25); color:#ffffff; font-family:"KzSans",sans-serif; font-weight:600; font-size:52px; line-height:1.22; text-shadow:0 0 16px rgba(90,190,255,0.6), 0 2px 8px rgba(0,0,0,0.6); }
  </style>
  <div id="root" data-composition-id="captions" data-width="1080" data-height="1920" data-layout-allow-overflow data-layout-allow-overlap>
${G.map((g) => `    <div class="cg" id="cap-${g.id}"><span class="pill">${g.text}</span></div>`).join('\n')}
  </div>
  <script>
    (function () {
      const G = ${JSON.stringify(G.map((g) => ({ id: g.id, s: +(g.start - 0.05).toFixed(2), e: +(g.end + 0.05).toFixed(2) })))};
      const tl = gsap.timeline({ paused: true });
      G.forEach(function (g) { var el = '#cap-' + g.id;
        tl.set(el, { visibility: 'visible' }, g.s);
        tl.fromTo(el, { opacity: 0, y: 10, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.16, ease: 'power2.out' }, g.s);
        tl.to(el, { opacity: 0, duration: 0.12, ease: 'power2.in' }, g.e - 0.12);
        tl.set(el, { opacity: 0, visibility: 'hidden' }, g.e); });
      window.__timelines["captions"] = tl;
    })();
  </script>
</template>
`;
OUT('compositions/captions.html', captions);

// ---------------------------------------------------------------- root
const SFX = [
  // id, file, start, duration, volume
  ['sfx-open', 'whoosh-cinematic.mp3', 0, 5.5, 0.55],
  ['sfx-fire', 'sparkle.mp3', 10.75, 1.8, 0.5],
  ['sfx-fire2', 'impact-bass-1.mp3', 10.85, 2.1, 0.35],
  ['sfx-run', 'riser.mp3', 11.2, 4.9, 0.35],
  ['sfx-dive', 'whoosh-short.mp3', 15.85, 0.57, 0.6],
  ['sfx-arrive', 'impact-bass-2.mp3', 16.25, 2.59, 0.4],
  ['sfx-gap', 'chime.mp3', 21.55, 2.54, 0.3],
  ['sfx-pop1', 'pop.mp3', 24.95, 0.72, 0.4],
  ['sfx-pop2', 'pop.mp3', 25.4, 0.72, 0.35],
  ['sfx-pop3', 'pop.mp3', 25.85, 0.72, 0.4],
  ['sfx-pop4', 'pop.mp3', 26.3, 0.72, 0.35],
  ['sfx-pop5', 'pop.mp3', 26.8, 0.72, 0.4],
  ['sfx-pop6', 'pop.mp3', 27.25, 0.72, 0.35],
  ['sfx-land', 'sparkle.mp3', 30.5, 1.8, 0.4],
  ['sfx-land2', 'sparkle.mp3', 32.0, 1.8, 0.35],
  ['sfx-wave', 'whoosh.mp3', 33.8, 0.57, 0.45],
  ['sfx-dive2', 'whoosh-cinematic.mp3', 36.3, 5.5, 0.5],
  ['sfx-cascade', 'riser.mp3', 39.5, 6.2, 0.3],
  ['sfx-title', 'impact-bass-2.mp3', 45.6, 2.59, 0.55],
  ['sfx-title2', 'chime.mp3', 45.65, 2.54, 0.3],
];
const index = `<!doctype html>
<html lang="kk" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>СИНАПС</title>
    <script src="lib/gsap.min.js"></script>
    <script src="lib/three.min.js"></script>
    <script src="lib/synapse3d.js"></script>
    <style>${FONT_CSS}
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1080px; height: 1920px; overflow: hidden; background: #01030a; }
      #root { position: relative; width: 100%; height: 100%; background: #01030a; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="50" data-width="1080" data-height="1920">
      <div id="world" data-composition-id="world" data-composition-src="compositions/world.html" data-start="0" data-duration="50" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index:1"></div>
      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="50" data-track-index="2" data-track-kind="captions" data-width="1080" data-height="1920" style="z-index:20"></div>
      <audio id="voice" class="clip" src="assets/audio/voice.wav" data-start="0" data-duration="50" data-track-index="3" data-volume="1"></audio>
      <audio id="music" class="clip" src="assets/audio/music.wav" data-start="0" data-duration="50" data-track-index="4" data-volume="1" data-timeline-role="music"></audio>
${SFX.map(([id, f, s, d, v], i) => `      <audio id="${id}" class="clip" src="assets/audio/${f}" data-start="${s}" data-duration="${d}" data-track-index="${5 + (i % 3)}" data-volume="${v}"></audio>`).join('\n')}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
OUT('index.html', index);
