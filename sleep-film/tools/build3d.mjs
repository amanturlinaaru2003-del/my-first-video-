// Generates index.html and compositions/*.html for the photo + 3D version of the film.
// node tools/build3d.mjs   (from the project folder)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FONT_CSS } from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = (f, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true }); fs.writeFileSync(path.join(ROOT, f), s); console.log('wrote', f); };
const narration = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/narration.json'), 'utf8'));
const SCENES = [['s1', 0, 5.6], ['s2', 5.0, 10.6], ['s3', 15.0, 10.6], ['s4', 25.0, 13.6], ['s5', 38.0, 8.6], ['s6', 46.0, 4.0]];

function scene({ id, css = '', body, script }) {
  return `<template>
  <style>
    ${FONT_CSS}
    #root { position: absolute; inset: 0; overflow: hidden; background: transparent; }
    .cv { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
    ${css}
  </style>
  <div id="root" data-composition-id="${id}" data-width="1080" data-height="1920" data-layout-allow-overflow data-layout-allow-overlap>
${body}
  </div>
  <script>
${script}
  </script>
</template>
`;
}

// photo scenes: the canvas draws the film at (scene start + local time)
function photoScene(id, start, dur, { css = '', overlay = '', extra = '' } = {}) {
  return scene({
    id, css,
    body: `    <div id="${id}-wrap" style="position:absolute;inset:0">
      <canvas id="${id}-cv" class="cv" width="1080" height="1920"></canvas>
    </div>
${overlay}`,
    script: `    (function () {
      const ctx = document.getElementById('${id}-cv').getContext('2d');
      const draw = (t) => PHOTO.render(ctx, ${start} + t);
      PHOTO.load().then(function () {
        const tl = gsap.timeline({ paused: true });
        const clock = { t: 0 };
        tl.to(clock, { t: ${dur}, duration: ${dur}, ease: 'none', onUpdate: function () { draw(clock.t); } }, 0);
${extra}
        draw(0);
        window.__timelines["${id}"] = tl;
      });
    })();`,
  });
}

function s1() {
  const css = `
    #s1-title { position: absolute; left: 0; top: 300px; width: 1080px; text-align: center; font-family: "KzSans", sans-serif; font-weight: 800; color: #f6f1e7; font-size: 86px; line-height: 1.08; text-shadow: 0 6px 30px rgba(0,0,0,0.75), 0 0 3px rgba(0,0,0,0.7); }
    #s1-title .hot { color: #ffbf6b; }
    .tw { display: inline-block; }`;
  const overlay = `    <div id="s1-title">
      <div><span class="tw" id="s1-t1">НЕГЕ</span> <span class="tw" id="s1-t2">ҰЙЫҚТАЙ</span></div>
      <div class="hot"><span class="tw" id="s1-t3">АЛМАЙСЫҢ?</span></div>
    </div>`;
  const extra = `        ['#s1-t1', '#s1-t2', '#s1-t3'].forEach(function (s, i) { tl.fromTo(s, { opacity: 1, filter: 'blur(0px)', y: 0 }, { opacity: 0, filter: 'blur(10px)', y: -18, duration: 0.3, ease: 'power2.in' }, 3.95 + i * 0.08); });`;
  return photoScene('s1', 0, 5.6, { css, overlay, extra });
}

function s2() {
  return scene({
    id: 's2',
    body: `    <div id="s2-wrap" style="position:absolute;inset:0;clip-path:circle(0% at 50% 50%)">
      <canvas id="s2-cv" class="cv" width="1080" height="1920"></canvas>
      <div id="s2-white" style="position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,#ffffff 0%,#efe6ff 45%,#c2adff 100%);opacity:0"></div>
    </div>`,
    script: `    (function () {
      const W = F3D.makeBrainWorld(document.getElementById('s2-cv'));
      const tl = gsap.timeline({ paused: true });
      const clock = { t: 0 };
      tl.to(clock, { t: 10.6, duration: 10.6, ease: 'none', onUpdate: function () { W.renderAt(clock.t); } }, 0);
      tl.fromTo('#s2-wrap', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 0.75, ease: 'power2.out' }, 0.22);
      tl.fromTo('#s2-white', { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.in' }, 10.15);
      W.renderAt(0);
      window.__timelines["s2"] = tl;
    })();`,
  });
}

function s3() {
  const css = `
    .s3-label { position:absolute; left:0; top:300px; width:1080px; text-align:center; font-family:"KzSans",sans-serif; opacity:0; }
    .s3-label .big { font-weight:800; font-size:88px; letter-spacing:0.02em; text-shadow:0 0 40px rgba(140,120,255,0.55), 0 6px 20px rgba(0,0,0,0.6); }
    .s3-label .small { margin-top:14px; font-weight:600; font-size:40px; color:#e9e4ff; text-shadow:0 4px 16px rgba(0,0,0,0.7); }`;
  return scene({
    id: 's3', css,
    body: `    <div id="s3-wrap" style="position:absolute;inset:0;opacity:0">
      <canvas id="s3-cv" class="cv" width="1080" height="1920"></canvas>
      <div class="s3-label" id="s3-labM"><div class="big" style="color:#c9d2ff">МЕЛАТОНИН</div><div class="small">ұйқы гормоны · қараңғыда бөлінеді</div></div>
      <div class="s3-label" id="s3-labC"><div class="big" style="color:#ffb15c">КОРТИЗОЛ</div><div class="small">сергектік гормоны · стресс көтереді</div></div>
      <div id="s3-white" style="position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,#ffffff 0%,#efe6ff 45%,#c2adff 100%)"></div>
    </div>`,
    script: `    (function () {
      const W = F3D.makeHormWorld(document.getElementById('s3-cv'));
      const tl = gsap.timeline({ paused: true });
      const clock = { t: 0 };
      tl.to(clock, { t: 10.6, duration: 10.6, ease: 'none', onUpdate: function () { W.renderAt(clock.t); } }, 0);
      tl.fromTo('#s3-wrap', { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'none' }, 0);
      tl.fromTo('#s3-white', { opacity: 1 }, { opacity: 0, duration: 0.8, ease: 'power2.out' }, 0.15);
      tl.fromTo('#s3-labM', { opacity: 0, filter: 'blur(8px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.3, ease: 'power2.out' }, 1.2);
      tl.to('#s3-labM', { opacity: 0, filter: 'blur(8px)', duration: 0.2, ease: 'power2.in' }, 5.05);
      tl.fromTo('#s3-labC', { opacity: 0, filter: 'blur(8px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.3, ease: 'power2.out' }, 5.85);
      tl.to('#s3-labC', { opacity: 0, filter: 'blur(8px)', duration: 0.2, ease: 'power2.in' }, 9.6);
      tl.fromTo('#s3-cv', { filter: 'blur(0px)' }, { filter: 'blur(14px)', duration: 0.5, ease: 'power2.in' }, 10.05);
      W.renderAt(0);
      window.__timelines["s3"] = tl;
    })();`,
  });
}

function s6() {
  const css = `
    #s6-scrim { position:absolute; left:90px; top:280px; width:900px; height:300px; border-radius:150px; background:radial-gradient(ellipse at 50% 50%, rgba(2,6,20,0.62) 0%, rgba(2,6,20,0.35) 55%, rgba(2,6,20,0) 75%); opacity:0; }
    #s6-text { position:absolute; left:0; top:330px; width:1080px; text-align:center; font-family:"KzSans",sans-serif; font-weight:800; font-size:70px; line-height:1.2; color:#fff6e2; text-shadow:0 0 34px rgba(255,236,180,0.45), 0 6px 22px rgba(0,0,0,0.6); }
    #s6-text .ln:nth-child(2) { color:#ffdca6; }
    .fw { display:inline-block; }`;
  const overlay = `    <div id="s6-scrim"></div>
    <div id="s6-text">
      <div class="ln"><span class="fw" id="s6-w1">Ұйқыңды</span> <span class="fw" id="s6-w2">бағала.</span></div>
      <div class="ln"><span class="fw" id="s6-w3">Денеңе</span> <span class="fw" id="s6-w4">демалыс</span> <span class="fw" id="s6-w5">бер.</span></div>
    </div>`;
  const extra = `        tl.fromTo('#s6-scrim', { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.25);
        [['#s6-w1', 0.32], ['#s6-w2', 0.72], ['#s6-w3', 1.7], ['#s6-w4', 2.05], ['#s6-w5', 2.6]].forEach(function (w) { tl.fromTo(w[0], { opacity: 0, filter: 'blur(8px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.35, ease: 'power2.out' }, w[1]); });`;
  return photoScene('s6', 46, 4.0, { css, overlay, extra });
}

function captions() {
  const groups = narration.groups.filter((g) => g.line !== 'l6');
  const G = groups.map((g, i) => {
    const next = groups[i + 1]; let end = g.end + 0.15; if (next && next.start - g.end < 0.45) end = next.start;
    return { id: g.id, s: Math.round(Math.max(0.15, g.start - 0.05) * 100) / 100, e: Math.round(end * 100) / 100, text: g.text };
  });
  return scene({
    id: 'captions',
    css: `.cg { position:absolute; left:0; top:1120px; width:1080px; text-align:center; opacity:0; visibility:hidden; }
    .pill { display:inline-block; max-width:860px; padding:14px 30px 16px; border-radius:24px; background:rgba(5,10,26,0.58); color:#fffaf0; font-family:"KzSans",sans-serif; font-weight:600; font-size:54px; line-height:1.22; text-shadow:0 2px 10px rgba(0,0,0,0.5); }`,
    body: G.map((g) => `    <div class="cg" id="cap-${g.id}"><span class="pill">${g.text}</span></div>`).join('\n'),
    script: `    (function () {
      const G = ${JSON.stringify(G.map(({ id, s, e }) => ({ id, s, e })))};
      const tl = gsap.timeline({ paused: true });
      G.forEach(function (g) { var el = '#cap-' + g.id;
        tl.set(el, { visibility: 'visible' }, g.s);
        tl.fromTo(el, { opacity: 0, y: 10, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.16, ease: 'power2.out' }, g.s);
        tl.to(el, { opacity: 0, duration: 0.12, ease: 'power2.in' }, g.e - 0.12);
        tl.set(el, { opacity: 0, visibility: 'hidden' }, g.e); });
      window.__timelines["captions"] = tl;
    })();`,
  });
}

const SFXDUR = { 'key-press': 0.43, 'click-soft': 0.36, 'notification': 2.45, 'whoosh-cinematic': 5.5, 'whoosh-short': 0.57, 'whoosh': 0.57, 'impact-bass-1': 2.11, 'sparkle': 1.8 };
function index() {
  const sfx = [
    ['tick1', 'key-press', 0.95, 0.35], ['tick2', 'click-soft', 1.95, 0.35], ['tick3', 'key-press', 2.95, 0.35], ['tick4', 'click-soft', 3.95, 0.35],
    ['dive', 'whoosh-cinematic', 4.55, 0.55], ['todo', 'whoosh-short', 7.4, 0.3], ['talk', 'whoosh', 8.8, 0.25], ['glow', 'whoosh', 14.65, 0.4],
    ['sparkle', 'sparkle', 17.4, 0.4], ['corti', 'impact-bass-1', 20.3, 0.55], ['whip', 'whoosh-short', 25.0, 0.5], ['ping', 'notification', 25.7, 0.18],
    ['ct1', 'key-press', 34.3, 0.4], ['ct2', 'click-soft', 34.62, 0.4], ['ct3', 'key-press', 34.94, 0.4], ['ct4', 'click-soft', 35.26, 0.4], ['ct5', 'key-press', 35.58, 0.4], ['ct6', 'click-soft', 35.9, 0.4],
    ['lamp', 'click-soft', 39.99, 0.9], ['window', 'whoosh-cinematic', 46.6, 0.3],
  ];
  return `<!doctype html>
<html lang="kk" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>НЕГЕ ҰЙЫҚТАЙ АЛМАЙСЫҢ?</title>
    <script src="lib/gsap.min.js"></script>
    <script src="lib/three.min.js"></script>
    <script src="lib/film3d.js"></script>
    <script src="lib/worlds3d.js"></script>
    <script src="lib/photo2d.js"></script>
    <style>
      ${FONT_CSS}
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1080px; height: 1920px; overflow: hidden; background: #050c16; }
      #root { position: relative; width: 100%; height: 100%; background: #050c16; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="50" data-width="1080" data-height="1920">
${SCENES.map(([id, s, d], i) => `      <div id="${id}" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${s}" data-duration="${d}" data-track-index="${i + 1}" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index:${i + 1}"></div>`).join('\n')}
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
OUT('compositions/s4.html', photoScene('s4', 25, 13.6));
OUT('compositions/s5.html', photoScene('s5', 38, 8.6));
OUT('compositions/s6.html', s6());
OUT('compositions/captions.html', captions());
OUT('index.html', index());
