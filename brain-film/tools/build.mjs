// Generates lib/narration.js, index.html, compositions/c1..c9.html and compositions/captions.html
// node tools/build.mjs  (from the project folder). Audio clip list comes from assets/audio/sfx.json (tools/build_audio.py).
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const W = (f, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true }); fs.writeFileSync(path.join(ROOT, f), s); console.log('wrote', f); };
const N = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/narration.json'), 'utf8'));
const SFX = fs.existsSync(path.join(ROOT, 'assets/audio/sfx.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/audio/sfx.json'), 'utf8')) : [];
const TOTAL = N.total, r3 = (x) => Math.round(x * 1000) / 1000;
const ids = Object.keys(N.chapters);
const bounds = [0]; for (let i = 0; i < ids.length - 1; i++) bounds.push(r3((N.chapters[ids[i]][1] + N.chapters[ids[i + 1]][0]) / 2)); bounds.push(TOTAL);
const G = {}; N.groups.forEach((g) => { G[g.id.slice(1)] = [g.start, g.end]; });
W('lib/narration.js', `window.NAR = ${JSON.stringify({ g: G, bounds })};\n`);
const g = (i) => G[i][0], ge = (i) => G[i][1];
const FONT = ['600', '800'].map((w) => ['cyrillic-ext', 'cyrillic', 'latin'].map((s) => `@font-face { font-family: "KzSans"; font-weight: ${w}; src: url("assets/fonts/montserrat-${s}-${w}-normal.woff2") format("woff2"); unicode-range: ${{ 'cyrillic-ext': 'U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F', cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116', latin: 'U+0000-00FF, U+2000-206F, U+2080-209F' }[s]}; }`).join('\n')).join('\n');
// big numbers over the picture: [chapter, text, start, end, sub]
const NUMS = [
  ['c2', '2%', g(4) - 0.3, ge(4) + 0.3, 'ДЕНЕ САЛМАҒЫ'], ['c2', '20%', g(6) - 0.4, ge(6) + 0.3, 'ОТТЕГІ'], ['c2', '86 000 000 000', g(7), ge(8) + 0.3, 'НЕЙРОН'],
  ['c3', '10–20 С', g(17), ge(18) + 0.3, 'САНА СӨНЕДІ'],
  ['c4', '2013', g(37) - 0.2, ge(38) + 0.3, 'ЕГЕУҚҰЙРЫҚТАР'], ['c4', '≈30 С', g(40) - 0.2, ge(40) + 0.2, 'ЖАРҚЫЛ'], ['c4', '2022', g(44) - 0.1, ge(46) + 0.3, '87 ЖАСТАҒЫ АДАМ'], ['c4', '2023', g(47) - 0.1, ge(49) + 0.3, '4 НАУҚАСТЫҢ 2-УІ'],
  ['c6', 'ДЕПОЛЯРИЗАЦИЯ', g(70) - 0.1, ge(71) + 0.4, 'ӨЛІМ ТОЛҚЫНЫ', 84],
  ['c7', '<span class="tm">00:00</span>', g(74), ge(76) + 0.3, 'МИНУТ', 150, 'timer'],
  ['c7', 'ЙЕЛЬ · 2019', g(77) - 0.1, ge(80) + 0.2, 'ЗЕРТХАНА', 110],
  ['c7', '4 САҒАТ', g(81) - 0.1, ge(82) + 0.3, 'ШОШҚА МИЫ'],
  ['c8', '≈10%', g(97) - 0.1, ge(98) + 0.3, 'ҚАЙТА ТІРІЛГЕНДЕР'],
];
function chapter(id, i) {
  const a = bounds[i], b = bounds[i + 1], dur = r3(b - a);
  const nums = NUMS.filter((n) => n[0] === id);
  const numHTML = nums.map((n, k) => `    <div class="num" id="${id}-n${k}"><div class="nv"${n[5] ? ` style="font-size:${n[5]}px"` : ''}>${n[1]}</div><div class="ns">${n[4]}</div></div>`).join('\n');
  const numTL = nums.map((n, k) => { const s = r3(n[2] - a), e = r3(n[3] - a); return `      tl.fromTo('#${id}-n${k}', { opacity: 0, scale: 0.86, y: 24 }, { opacity: 1, scale: 1, y: 0, duration: 0.32, ease: 'back.out(2)' }, ${s});
      tl.to('#${id}-n${k}', { opacity: 0, scale: 1.08, duration: 0.22, ease: 'power2.in' }, ${r3(e - 0.22)});` + (n[6] === 'timer' ? `
      (function () { const el = document.querySelector('#${id}-n${k} .tm'), nv = document.querySelector('#${id}-n${k} .nv'), c = { m: 0 };
        tl.to(c, { m: 6, duration: ${r3(ge(76) - g(74))}, ease: 'power1.in', onUpdate: function () { const m = Math.floor(c.m), sec = Math.floor((c.m - m) * 60); el.textContent = '0' + m + ':' + (sec < 10 ? '0' : '') + sec; nv.style.color = c.m >= 4 ? '#ff5a4a' : '#ffffff'; } }, ${s}); })();` : ''); }).join('\n');
  const endCard = id === 'c9' ? `    <div id="endcard"><div class="e1">ӨЛІМ —</div><div class="e2"><span>ПРОЦЕСС</span></div></div>` : '';
  const endTL = id === 'c9' ? `      tl.fromTo('#endcard', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, ${r3(ge(112) - a + 0.1)});
      tl.to('#endcard', { opacity: 0, duration: 0.5, ease: 'power2.in' }, ${r3(dur - 0.55)});` : '';
  W(`compositions/${id}.html`, `<template>
  <style>
${FONT}
    #root { position: absolute; inset: 0; overflow: hidden; background: #03060d; }
    #${id}-cv { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
    .vig { position: absolute; inset: 0; background: radial-gradient(ellipse 75% 62% at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.72) 100%); pointer-events: none; }
    .num { position: absolute; left: 90px; top: 330px; width: 860px; text-align: center; opacity: 0; font-family: "KzSans", sans-serif; }
    .nv { font-weight: 800; font-size: 150px; line-height: 1; color: #ffffff; letter-spacing: -2px; text-shadow: 0 0 40px rgba(120,180,255,0.55), 0 6px 26px rgba(0,0,0,0.8); }
    .ns { margin-top: 14px; font-weight: 800; font-size: 40px; letter-spacing: 6px; color: #ffd21f; text-shadow: 0 3px 14px rgba(0,0,0,0.8); }
    #endcard { position: absolute; left: 90px; top: 560px; width: 860px; text-align: center; opacity: 0; font-family: "KzSans", sans-serif; font-weight: 800; color: #fff; }
    #endcard .e1 { font-size: 120px; text-shadow: 0 0 40px rgba(255,200,120,0.5); }
    #endcard .e2 span { display: inline-block; margin-top: 18px; padding: 6px 34px 14px; background: #ffd21f; color: #0b0b0b; font-size: 130px; border-radius: 10px; }
  </style>
  <div id="root" data-composition-id="${id}" data-width="1080" data-height="1920" data-layout-allow-overflow data-layout-allow-overlap>
    <canvas id="${id}-cv" width="1080" height="1920"></canvas>
    <div class="vig"></div>
${numHTML}
${endCard}
  </div>
  <script>
    (function () {
      const world = WORLDS.${id}(document.getElementById('${id}-cv'), ${a}, ${b});
      const tl = gsap.timeline({ paused: true });
      const clock = { t: 0 };
      tl.to(clock, { t: ${dur}, duration: ${dur}, ease: 'none', onUpdate: function () { world.renderAt(${a} + clock.t); } }, 0);
${numTL}
${endTL}
      world.renderAt(${a});
      window.__timelines["${id}"] = tl;
    })();
  </script>
</template>
`);
  return `      <div id="${id}" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${a}" data-duration="${dur}" data-track-index="${i + 1}" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index:${i + 1}"></div>`;
}
const hosts = ids.map(chapter).join('\n');
// captions: bold caps, keyword on a yellow plate, centred on x, centre at y = 1440
const capHTML = N.groups.map((gr) => { const html = gr.text.toUpperCase().replace(/\*([^*]+)\*/g, '<span class="kw">$1</span>'); return `    <div class="cg" id="cap-${gr.id}" data-layout-allow-safe-zone><span class="ln">${html}</span></div>`; }).join('\n');
const capData = JSON.stringify(N.groups.map((gr) => ({ id: gr.id, s: r3(gr.start), e: r3(gr.end - 0.02) })));
W('compositions/captions.html', `<template>
  <style>
${FONT}
    #root { position: absolute; inset: 0; overflow: hidden; background: transparent; }
    .cg { position: absolute; left: 110px; top: 1440px; width: 820px; height: 0; opacity: 0; visibility: hidden; }
    .ln { position: absolute; left: 0; width: 820px; bottom: auto; transform: translateY(-50%); text-align: center; font-family: "KzSans", sans-serif; font-weight: 800; font-size: 62px; line-height: 1.18; color: #ffffff; letter-spacing: 1px; text-shadow: 0 4px 18px rgba(0,0,0,0.85), 0 0 3px rgba(0,0,0,0.9); }
    .kw { display: inline-block; background: #ffd21f; color: #0b0b0b; padding: 2px 16px 8px; border-radius: 8px; text-shadow: none; box-shadow: 0 6px 22px rgba(0,0,0,0.5); }
  </style>
  <div id="root" data-composition-id="captions" data-width="1080" data-height="1920" data-layout-allow-overflow data-layout-allow-overlap>
${capHTML}
  </div>
  <script>
    (function () {
      const G = ${capData};
      const tl = gsap.timeline({ paused: true });
      G.forEach(function (g) { var el = '#cap-' + g.id;
        tl.set(el, { visibility: 'visible' }, g.s);
        tl.fromTo(el, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.14, ease: 'back.out(2.5)' }, g.s);
        tl.to(el, { opacity: 0, duration: 0.08, ease: 'power2.in' }, g.e - 0.08);
        tl.set(el, { opacity: 0, visibility: 'hidden' }, g.e); });
      window.__timelines["captions"] = tl;
    })();
  </script>
</template>
`);
const audio = [`      <audio id="voice" class="clip" src="assets/audio/voice.wav" data-start="0" data-duration="${TOTAL}" data-track-index="11" data-volume="1"></audio>`,
  `      <audio id="music" class="clip" src="assets/audio/music.wav" data-start="0" data-duration="${TOTAL}" data-track-index="12" data-volume="0.55" data-timeline-role="music"></audio>`]
  .concat(SFX.map((s, i) => `      <audio id="${s.id}" class="clip" src="assets/audio/${s.file}" data-start="${s.t}" data-duration="${s.d}" data-track-index="${13 + (i % 4)}" data-volume="${s.v}"></audio>`)).join('\n');
W('index.html', `<!doctype html>
<html lang="kk" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>ӨЛІМ СӘТІНДЕ МИ</title>
    <script src="lib/gsap.min.js"></script>
    <script src="lib/three.min.js"></script>
    <script src="lib/narration.js"></script>
    <script src="lib/cine.js"></script>
    <script src="lib/people.js"></script>
    <script src="lib/worlds.js"></script>
    <style>
${FONT}
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1080px; height: 1920px; overflow: hidden; background: #03060d; }
      #root { position: relative; width: 100%; height: 100%; background: #03060d; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1080" data-height="1920" data-fps="30">
${hosts}
      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="${TOTAL}" data-track-index="10" data-track-kind="captions" data-width="1080" data-height="1920" style="z-index:20"></div>
${audio}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`);
console.log('bounds', bounds.join(' '));
