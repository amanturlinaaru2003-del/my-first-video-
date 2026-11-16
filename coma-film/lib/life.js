/* One day of a young man and ten energy drinks.
   Canvas renderer shared by every scene: sets (rooms, street, ambulance, coma, hospital),
   one faceless character rig, props, HUD and camera effects. Everything drawn is a pure
   function of the scene state for time t, so frames can be rendered in any order. */
(function () {
  const W = 1080, H = 1920;
  const LABELS = { hero: 'МЕН', gown: 'МЕН', medic: 'ДӘРІГЕР', doctor: 'ДӘРІГЕР', student: '', worker: '' };
  const KIND = {
    hero: { scale: 1, top: '#5fbf34', top2: '#4a9a27', pants: '#24262e', shoe: '#ecebe6', hood: true },
    gown: { scale: 1, top: '#9fc3d6', top2: '#86a9bc', pants: '#9fc3d6', shoe: '#d9d4c9' },
    medic: { scale: 1.03, top: '#2f5d8a', top2: '#264d73', pants: '#24405e', shoe: '#111216', stripe: '#e8f06a' },
    doctor: { scale: 1.02, top: '#e9eef2', top2: '#c9d1d8', pants: '#3a4a5e', shoe: '#111216', shirt: '#7fb0d0' },
    student: { scale: 0.98, top: '#5d5480', top2: '#4c456b', pants: '#2a2c36', shoe: '#ddd' },
    worker: { scale: 1, top: '#4a4f5a', top2: '#3d414a', pants: '#23252c', shoe: '#111', shirt: '#e6e1d8' },
  };
  const SKIN = '#ebe5da', HEAD0 = '#f3eee5', HEAD1 = '#cfc7ba';

  // ---------- helpers ----------
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const smooth = (u) => { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); };
  const ease = (t, t0, t1) => smooth((t - t0) / (t1 - t0));
  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    return `rgb(${clamp(Math.round(((n >> 16) & 255) * k), 0, 255)},${clamp(Math.round(((n >> 8) & 255) * k), 0, 255)},${clamp(Math.round((n & 255) * k), 0, 255)})`;
  }
  function glow(g, x, y, r, col, a) {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(${col},${a})`);
    gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }
  function rect(g, x, y, w, h, col) { g.fillStyle = col; g.fillRect(x, y, w, h); }
  function rrect(g, x, y, w, h, r, col) {
    g.fillStyle = col; g.beginPath();
    g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); g.fill();
  }
  function ik(hx, hy, fx, fy, l1, l2, bend) {
    let dx = fx - hx, dy = fy - hy;
    let d = Math.hypot(dx, dy);
    const maxd = l1 + l2 - 0.5;
    if (d > maxd) { fx = hx + (dx / d) * maxd; fy = hy + (dy / d) * maxd; d = maxd; }
    d = Math.max(d, 1);
    const a = Math.atan2(fy - hy, fx - hx);
    const c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
    const ka = a - bend * Math.acos(c);
    return { kx: hx + Math.cos(ka) * l1, ky: hy + Math.sin(ka) * l1, fx, fy };
  }
  // ECG trace: scrolling heartbeat line.
  function ecgVal(ph) {
    if (ph < 0.02) return -0.12;
    if (ph < 0.045) return 1;
    if (ph < 0.07) return -0.35;
    if (ph > 0.22 && ph < 0.36) return 0.22 * Math.sin(((ph - 0.22) / 0.14) * Math.PI);
    return 0;
  }
  function ecg(g, x, y, w, h, t, bpm, col, lw, flat) {
    g.save();
    g.strokeStyle = col; g.lineWidth = lw; g.lineJoin = 'round';
    g.shadowColor = col; g.shadowBlur = 12;
    g.beginPath();
    const speed = 300;
    for (let px = 0; px <= w; px += 3) {
      const tt = t - (w - px) / speed;
      let v = 0;
      if (bpm > 0 && !flat) { const ph = ((tt * bpm) / 60) % 1; v = ecgVal(ph < 0 ? ph + 1 : ph); }
      const yy = y - v * h;
      if (px === 0) g.moveTo(x + px, yy); else g.lineTo(x + px, yy);
    }
    g.stroke();
    g.restore();
  }

  // ---------- sets ----------
  // far(g, env, t): wall layer, drawn blurred with parallax. near(g, env, t): furniture behind people.
  // front(g, env, t): things in front of people. Floor is y = 0.
  function room(g, wall, floor) {
    rect(g, -4000, -3000, 8000, 3000, wall);
    rect(g, -4000, 0, 8000, 2000, floor);
    rect(g, -4000, -14, 8000, 14, shade(wall, 0.7));
  }
  function desk(g, x0, x1, top, col) {
    rect(g, x0, top, x1 - x0, 16, col);
    rect(g, x0 + 14, top + 16, 14, -top - 16, shade(col, 0.7));
    rect(g, x1 - 28, top + 16, 14, -top - 16, shade(col, 0.7));
  }
  function chair(g, x, dir, seatY, col) {
    rect(g, x - 60, -seatY, 120, 14, col);
    rect(g, x - 6, -seatY + 14, 12, seatY - 14, shade(col, 0.6));
    rect(g, x - 50, -8, 100, 8, shade(col, 0.6));
    rect(g, x - dir * 66 - 8, -seatY - 190, 16, 190, col);
  }
  function cansOnDesk(g, x, top, n, dir) {
    for (let i = 0; i < n; i++) {
      const row = i < 6 ? 0 : 1;
      const cx = x + dir * ((i % 6) * 24) + (row ? dir * 12 : 0), cy = top - row * 40;
      const tip = (i * 37) % 5 === 0;
      g.save(); g.translate(cx, cy); if (tip) g.rotate(Math.PI / 2 * dir);
      rect(g, -9, -36, 18, 36, '#121316'); rect(g, -9, -25, 18, 8, '#7cff4f'); rect(g, -9, -38, 18, 3, '#b8bcc6');
      g.restore();
    }
  }
  function monitor(g, x, top, w, h, env, t, mode) {
    rect(g, x + w / 2 - 8, top - 60, 16, 60, '#15161b');
    rect(g, x + w / 2 - 40, top - 8, 80, 8, '#15161b');
    rect(g, x - 8, top - 60 - h - 8, w + 16, h + 16, '#0c0d10');
    const sx = x, sy = top - 60 - h;
    if (mode === 'code') {
      rect(g, sx, sy, w, h, '#0f2236');
      const r = rng(Math.floor(t * 8) + 3);
      for (let i = 0; i < 9; i++) rect(g, sx + 14 + (i % 3) * 12, sy + 16 + i * (h - 30) / 9, 40 + r() * (w - 90), 6, i % 4 ? '#5fa8d8' : '#d8c25f');
    } else if (mode === 'game') {
      const hue = (t * 60) % 360;
      const gr = g.createLinearGradient(sx, sy, sx + w, sy + h);
      gr.addColorStop(0, `hsl(${hue},80%,45%)`); gr.addColorStop(1, `hsl(${(hue + 120) % 360},80%,35%)`);
      g.fillStyle = gr; g.fillRect(sx, sy, w, h);
      const r = rng(Math.floor(t * 12) + 9);
      for (let i = 0; i < 6; i++) rect(g, sx + r() * (w - 30), sy + r() * (h - 30), 12 + r() * 30, 12 + r() * 30, `hsla(${(hue + r() * 180) % 360},90%,70%,0.9)`);
      if (env.clock) { g.font = '800 34px KzSans'; g.fillStyle = '#ffffff'; g.textAlign = 'right'; g.fillText(env.clock, sx + w - 12, sy + 40); g.textAlign = 'left'; }
    }
    return { cx: sx + w / 2, cy: sy + h / 2 };
  }

  const SETS = {
    bedroom: {
      far(g, env) {
        room(g, '#1b2033', '#14161f');
        const wg = g.createLinearGradient(0, -640, 0, -260);
        wg.addColorStop(0, '#4d5f9c'); wg.addColorStop(1, '#f2a76b');
        g.fillStyle = wg; g.fillRect(540, -640, 300, 380);
        rect(g, 540, -456, 300, 10, '#0f1220'); rect(g, 684, -640, 10, 380, '#0f1220');
        g.strokeStyle = '#0f1220'; g.lineWidth = 18; g.strokeRect(540, -640, 300, 380);
        rect(g, -260, -720, 240, 300, '#3b2e4a'); glow(g, -140, -570, 110, '242,120,90', 0.5);
        glow(g, 690, -450, 520, '242,167,107', 0.22);
      },
      near(g, env, t) {
        rect(g, -320, -360, 30, 360, '#2a2230');
        rect(g, -300, -170, 720, 90, '#d8d3c8');
        rect(g, -300, -130, 720, 60, '#3f5f8a');
        rect(g, -300, -80, 720, 80, '#2a2230');
        rrect(g, -270, -205, 150, 44, 18, '#e9e4da');
        // nightstand + lamp + alarm clock
        rect(g, 460, -190, 140, 190, '#3a2f28');
        glow(g, 510, -300, 220, '255,200,140', 0.4);
        rect(g, 492, -300, 36, 110, '#eadbc0');
        rect(g, 540, -236, 64, 40, '#0c0c0f');
        g.font = '800 26px KzSans'; g.fillStyle = (Math.floor(t * 3) % 2) ? '#ff4d4d' : '#7a2020'; g.textAlign = 'center';
        g.fillText(env.clock || '07:00', 572, -207); g.textAlign = 'left';
      },
    },
    street: {
      far(g, env, t) {
        const sg = g.createLinearGradient(0, -2400, 0, 0);
        sg.addColorStop(0, '#1d2650'); sg.addColorStop(0.65, '#6a5a8c'); sg.addColorStop(1, '#d68a62');
        g.fillStyle = sg; g.fillRect(-4000, -3000, 9000, 3000);
        const r = rng(21);
        for (let x = -3000; x < 5000; x += 120 + r() * 160) {
          const bh = 500 + r() * 1100, bw = 140 + r() * 180;
          rect(g, x, -bh, bw, bh, '#151a2b');
          for (let wy = -bh + 40; wy < -60; wy += 60) for (let wx = x + 18; wx < x + bw - 24; wx += 44)
            if (r() > 0.62) rect(g, wx, wy, 20, 28, r() > 0.5 ? 'rgba(255,214,150,0.85)' : 'rgba(150,190,255,0.6)');
        }
        rect(g, -4000, 0, 9000, 2000, '#101219');
      },
      near(g) {
        rect(g, -4000, -20, 9000, 20, '#3a3c47');
        rect(g, -4000, 0, 9000, 60, '#2b2d36');
        for (let x = -3000; x < 5000; x += 700) {
          rect(g, x, -760, 14, 760, '#1c1e26'); rect(g, x - 40, -770, 70, 14, '#1c1e26');
          glow(g, x - 30, -750, 260, '255,214,150', 0.45);
          g.fillStyle = 'rgba(255,214,150,0.12)';
          g.beginPath(); g.moveTo(x - 60, -750); g.lineTo(x - 260, 0); g.lineTo(x + 200, 0); g.lineTo(x, -750); g.fill();
        }
        // bus stop shelter
        rect(g, 900, -520, 600, 18, '#22252e'); rect(g, 900, -520, 14, 520, '#22252e'); rect(g, 1486, -520, 14, 520, '#22252e');
        rect(g, 914, -502, 572, 430, 'rgba(150,170,200,0.12)');
        rect(g, 1000, -300, 380, 70, '#d68a62'); g.font = '800 40px KzSans'; g.fillStyle = '#1b1d24'; g.fillText('АЯЛДАМА', 1040, -250);
      },
      front(g, env, t) {
        if (env.car != null) {
          const x = env.car;
          rrect(g, x, -230, 560, 170, 40, '#8a2a2a'); rrect(g, x + 110, -320, 300, 110, 40, '#7a2424');
          rect(g, x + 140, -300, 110, 80, 'rgba(160,200,230,0.45)'); rect(g, x + 270, -300, 110, 80, 'rgba(160,200,230,0.45)');
          g.fillStyle = '#0d0d10'; g.beginPath(); g.arc(x + 120, -60, 52, 0, 7); g.arc(x + 440, -60, 52, 0, 7); g.fill();
          glow(g, x + 10, -170, 200, '255,240,200', 0.7);
        }
      },
    },
    class: {
      far(g, env, t) {
        room(g, '#2c3a36', '#1a1f1f');
        rect(g, -500, -800, 980, 380, '#1d2a24'); g.strokeStyle = '#4a3a2a'; g.lineWidth = 16; g.strokeRect(-500, -800, 980, 380);
        g.strokeStyle = 'rgba(240,240,230,0.75)'; g.lineWidth = 6;
        g.font = '600 54px KzSans'; g.fillStyle = 'rgba(240,240,230,0.8)'; g.fillText('E = mc²', -430, -700); g.fillText('∫ f(x) dx', -60, -560);
        g.beginPath(); g.moveTo(-430, -520); g.quadraticCurveTo(-300, -640, -150, -500); g.stroke();
        g.fillStyle = '#e6e1d8'; g.beginPath(); g.arc(700, -760, 60, 0, 7); g.fill();
        g.strokeStyle = '#222'; g.lineWidth = 6; g.beginPath(); g.moveTo(700, -760); g.lineTo(700, -800); g.moveTo(700, -760); g.lineTo(726, -760); g.stroke();
        glow(g, 1100, -500, 700, '255,236,200', 0.25);
      },
      near(g, env) {
        chair(g, -40, 1, 105, '#5a4433');
        desk(g, 40, 330, -165, '#7a5a3d');
        chair(g, 520, 1, 105, '#5a4433');
        desk(g, 600, 890, -165, '#7a5a3d');
      },
    },
    office: {
      far(g, env, t) {
        room(g, '#1e2430', '#15171d');
        for (let i = 0; i < 14; i++) rect(g, 520, -900 + i * 30, 420, 16, 'rgba(201,214,232,0.55)');
        glow(g, 730, -700, 600, '201,214,232', 0.2);
        rect(g, -420, -560, 70, 160, '#2f4a33'); glow(g, -385, -560, 90, '80,140,90', 0.3);
      },
      near(g, env, t) {
        chair(g, -60, 1, 110, '#202228');
        desk(g, 20, 520, -170, '#3b3f48');
        const m = monitor(g, 230, -170, 260, 160, env, t, 'code');
        glow(g, m.cx, m.cy, 380, '95,168,216', 0.35);
        rect(g, 130, -178, 150, 8, '#1a1b20');
        cansOnDesk(g, 470, -170, env.cans || 0, -1);
      },
    },
    cafe: {
      far(g, env) {
        room(g, '#3a2a22', '#1c1612');
        rect(g, -200, -820, 520, 300, '#1c1a18'); g.font = '800 44px KzSans'; g.fillStyle = '#e8d8b8'; g.fillText('АСХАНА', -120, -740);
        g.font = '500 30px KzSans'; g.fillStyle = 'rgba(232,216,184,0.8)'; g.fillText('Палау · Сорпа · Шай', -150, -660);
        for (const x of [-500, 700]) { rect(g, x - 2, -1200, 4, 340, '#111'); glow(g, x, -840, 260, '255,200,140', 0.5); g.fillStyle = '#f6e7c8'; g.beginPath(); g.arc(x, -850, 36, 0, 7); g.fill(); }
      },
      near(g) {
        chair(g, -40, 1, 105, '#4a3326');
        desk(g, 50, 480, -165, '#6e4b33');
        g.fillStyle = '#e9e4da'; g.beginPath(); g.ellipse(260, -170, 90, 14, 0, 0, 7); g.fill();
        g.fillStyle = '#c9862f'; g.beginPath(); g.ellipse(260, -182, 60, 16, 0, Math.PI, 2 * Math.PI); g.fill();
        rect(g, 380, -230, 34, 62, 'rgba(150,200,240,0.55)'); rect(g, 380, -200, 34, 32, 'rgba(120,180,230,0.7)');
      },
    },
    gaming: {
      far(g, env, t) {
        room(g, '#120f1f', '#0c0b12');
        const hue = (t * 40) % 360;
        for (let x = -1600; x < 2400; x += 40) rect(g, x, -980, 40, 12, `hsl(${(hue + x * 0.1) % 360},90%,60%)`);
        g.globalAlpha = 0.35; for (let x = -1600; x < 2400; x += 160) glow(g, x, -960, 200, '170,90,255', 0.25); g.globalAlpha = 1;
        rect(g, -420, -800, 200, 280, '#241a3a'); rect(g, 640, -820, 240, 300, '#1a2a3a');
        if (env.moon) { rect(g, 860, -760, 260, 300, '#0b1020'); g.fillStyle = '#dfe6f5'; g.beginPath(); g.arc(990, -650, 34, 0, 7); g.fill(); glow(g, 990, -650, 140, '200,215,255', 0.3); }
      },
      near(g, env, t) {
        chair(g, -50, 1, 115, '#2a1d3a');
        desk(g, 40, 640, -170, '#1a1a22');
        const m1 = monitor(g, 150, -170, 250, 150, env, t, 'game');
        const m2 = monitor(g, 420, -170, 200, 150, env, t + 0.37, 'game');
        glow(g, m1.cx, m1.cy, 520, '150,120,255', 0.4 * (env.screen == null ? 1 : env.screen));
        cansOnDesk(g, 600, -170, env.cans || 0, -1);
      },
    },
    ambulance: {
      far(g, env, t) {
        room(g, '#4b5662', '#262b31');
        rect(g, -700, -900, 1700, 60, '#5d6874');
        for (let i = 0; i < 4; i++) rect(g, -560 + i * 330, -820, 290, 210, '#59636e');
        rect(g, 880, -720, 260, 200, '#11151a');
        const siren = Math.sin(t * 9) > 0;
        glow(g, 1010, -620, 420, siren ? '255,60,60' : '60,110,255', 0.6);
        // wall ECG monitor
        rect(g, -660, -560, 330, 220, '#0b0e10'); rect(g, -650, -550, 310, 200, '#0d1a14');
        ecg(g, -645, -420, 300, 70, t, env.bpm || 40, '#62f08a', 4);
        g.font = '800 34px KzSans'; g.fillStyle = '#62f08a'; g.fillText(String(env.bpm || 40), -640, -510);
      },
      near(g) {
        rect(g, -120, -128, 760, 24, '#cfd6dc');
        rect(g, -100, -104, 20, 104, '#8a939c'); rect(g, 600, -104, 20, 104, '#8a939c');
        rect(g, -100, -30, 720, 12, '#8a939c');
      },
    },
    coma: {
      far(g, env, t) {
        rect(g, -4000, -3000, 8000, 5000, '#030407');
        const bg = g.createLinearGradient(-300, 0, 300, 0);
        bg.addColorStop(0, 'rgba(150,180,255,0)'); bg.addColorStop(0.5, `rgba(190,210,255,${0.22 * (env.beam == null ? 1 : env.beam)})`); bg.addColorStop(1, 'rgba(150,180,255,0)');
        g.fillStyle = bg; g.beginPath(); g.moveTo(-160, -2400); g.lineTo(160, -2400); g.lineTo(420, 200); g.lineTo(-420, 200); g.fill();
        const r = rng(5);
        for (let i = 0; i < 70; i++) {
          const x = (r() - 0.5) * 1600, y0 = -r() * 1800, sp = 20 + r() * 50;
          const y = ((y0 - t * sp) % 1800 + 1800) % 1800 - 1800;
          g.fillStyle = `rgba(210,225,255,${0.15 + 0.35 * r()})`; g.beginPath(); g.arc(x, y, 2 + r() * 4, 0, 7); g.fill();
        }
        glow(g, 0, 40, 520, '170,200,255', 0.18 * (env.beam == null ? 1 : env.beam));
      },
    },
    hospital: {
      far(g, env, t) {
        room(g, '#2b3440', '#1b2128');
        const sun = env.sun == null ? 1 : env.sun;
        const wg = g.createLinearGradient(0, -900, 0, -360);
        wg.addColorStop(0, '#9cc3e8'); wg.addColorStop(1, '#fff1cf');
        g.fillStyle = wg; g.fillRect(620, -900, 380, 540);
        g.strokeStyle = '#1b222b'; g.lineWidth = 18; g.strokeRect(620, -900, 380, 540);
        rect(g, 802, -900, 12, 540, '#1b222b');
        g.fillStyle = `rgba(255,236,190,${0.16 * sun})`;
        g.beginPath(); g.moveTo(620, -900); g.lineTo(1000, -360); g.lineTo(400, 300); g.lineTo(-300, 300); g.closePath(); g.fill();
        glow(g, 810, -630, 700, '255,236,190', 0.3 * sun);
        // wall monitor
        rect(g, -560, -720, 300, 210, '#0b0e10'); rect(g, -550, -710, 280, 190, '#0d1a14');
        ecg(g, -545, -590, 270, 60, t, env.bpm || 72, '#62f08a', 4);
        g.font = '800 34px KzSans'; g.fillStyle = '#62f08a'; g.fillText(String(env.bpm || 72), -540, -670);
      },
      near(g) {
        rect(g, -300, -200, 760, 50, '#e9eef2');
        rect(g, -300, -150, 760, 30, '#b9c4cc');
        rect(g, -320, -330, 22, 330, '#9aa6b0'); rect(g, 460, -260, 22, 260, '#9aa6b0');
        rect(g, -280, -120, 16, 120, '#7c8791'); rect(g, 420, -120, 16, 120, '#7c8791');
        rrect(g, -290, -238, 150, 40, 16, '#f4f6f8');
        // IV stand
        rect(g, -420, -900, 10, 900, '#9aa6b0'); rect(g, -470, -900, 110, 8, '#9aa6b0');
        rrect(g, -470, -890, 50, 90, 12, 'rgba(200,230,255,0.6)');
      },
    },
  };

  // ---------- character ----------
  function feetWalk(c) {
    const dir = c.facing || 1, S = 70 * (c.scale || 1);
    const feet = []; let ph = 0;
    for (let i = 0; i < 2; i++) {
      const o = i ? S : 0, q = (c.w || 0) + o;
      const n = Math.floor(q / (2 * S)), fr = q / (2 * S) - n;
      const plant = n * 2 * S - o + S / 2;
      let rel, lift = 0;
      if (fr < 0.5) rel = plant;
      else { const u = smooth((fr - 0.5) / 0.5); rel = lerp(plant, plant + 2 * S, u); lift = Math.sin(Math.PI * u) * 22; }
      feet.push({ x: c.x + dir * (rel - S / 2), y: (c.fy || 0) - lift });
      if (!i) ph = fr;
    }
    return { feet, ph };
  }

  function drawChar(g, c, t) {
    const k = KIND[c.kind];
    const sc = (c.scale || 1) * k.scale;
    const dir = c.facing || 1;
    const fy = c.fy || 0;
    const thigh = 82 * sc, shin = 82 * sc, torso = 120 * sc, hr = 40 * sc;
    const upper = 62 * sc, fore = 60 * sc;
    const fr = Math.floor(t * 15);
    let hip, legs;
    const bodyX = c.pose === 'walk' ? c.x + dir * ((c.w || 0) + 35 * sc) : c.x;
    if (c.pose === 'walk') {
      const fw = feetWalk(c);
      const bob = Math.abs(Math.sin(fw.ph * Math.PI * 2)) * 7 * sc;
      hip = { x: bodyX, y: fy - (thigh + shin) * 0.94 - bob };
      legs = fw.feet.map((f) => ik(hip.x, hip.y, f.x, f.y, thigh, shin, dir));
    } else if (c.pose === 'sit') {
      hip = { x: bodyX, y: fy - (c.seatY == null ? 105 : c.seatY) * sc };
      const reach = c.legsOut ? 160 : 72;
      const bounce = c.bounce ? Math.abs(Math.sin(t * 22)) * 10 * sc : 0;
      const fyy = c.legsOut ? hip.y + 6 * sc : fy;
      legs = [
        ik(hip.x, hip.y, hip.x + dir * reach * sc, fyy - bounce, thigh, shin, dir),
        ik(hip.x, hip.y, hip.x + dir * (reach - 12) * sc, fyy, thigh, shin, dir),
      ];
    } else if (c.pose === 'kneel') {
      hip = { x: bodyX, y: fy - 112 * sc };
      legs = [0, 1].map((i) => ({ kx: hip.x + dir * (40 - i * 10) * sc, ky: fy - 10 * sc, fx: hip.x - dir * (55 + i * 10) * sc, fy: fy - 6 * sc }));
    } else {
      hip = { x: bodyX, y: fy - (thigh + shin) * 0.97 };
      legs = [ik(hip.x, hip.y, bodyX + dir * 10 * sc, fy, thigh, shin, dir), ik(hip.x, hip.y, bodyX - dir * 14 * sc, fy, thigh, shin, dir)];
    }
    if (c.tremble) { const r = rng(fr * 31 + 5); hip.x += (r() * 2 - 1) * c.tremble; hip.y += (r() * 2 - 1) * c.tremble * 0.5; }
    const lean = c.lean || 0;
    const sh = { x: hip.x + Math.sin(lean) * torso * dir, y: hip.y - Math.cos(lean) * torso };
    const ha = lean + (c.tilt || 0);
    const neck = { x: sh.x + Math.sin(lean) * 10 * sc * dir, y: sh.y - Math.cos(lean) * 10 * sc };
    const head = { x: neck.x + Math.sin(ha) * hr * 0.95 * dir, y: neck.y - Math.cos(ha) * hr * 0.95 };
    const cx = { head, hr, sh, hip, sc, dir, t, lean };

    g.lineCap = 'round'; g.lineJoin = 'round';
    function leg(L2, col, shoe) {
      g.strokeStyle = col; g.lineWidth = 27 * sc;
      g.beginPath(); g.moveTo(hip.x, hip.y); g.lineTo(L2.kx, L2.ky); g.lineTo(L2.fx, L2.fy - 6 * sc); g.stroke();
      g.fillStyle = shoe; g.beginPath(); g.ellipse(L2.fx + 9 * sc * dir, L2.fy - 6 * sc, 21 * sc, 8 * sc, 0, 0, 7); g.fill();
    }
    function arm(tg, col, w) {
      const a = ik(sh.x, sh.y + 6 * sc, tg.x, tg.y, upper, fore, -dir);
      g.strokeStyle = col; g.lineWidth = w * sc;
      g.beginPath(); g.moveTo(sh.x, sh.y + 6 * sc); g.lineTo(a.kx, a.ky); g.lineTo(a.fx, a.fy); g.stroke();
      g.fillStyle = SKIN; g.beginPath(); g.arc(a.fx, a.fy, 9 * sc, 0, 7); g.fill();
      return a;
    }
    const farT = target(c.far || 'hang', cx, 1, c), nearT = target(c.near || 'hang', cx, 0, c);
    const fa = arm(farT, k.top2, 21);
    if (c.holdFar) prop(g, fa, cx, c, c.holdFar, c.far);
    leg(legs[1], shade(k.pants, 0.75), shade(k.shoe, 0.75));
    // torso
    const px = Math.cos(lean) * dir, py = Math.sin(lean);
    const hw = 27 * sc, sw = 33 * sc;
    g.fillStyle = k.top; g.strokeStyle = k.top; g.lineWidth = 12 * sc;
    g.beginPath();
    g.moveTo(hip.x - px * hw, hip.y - py * hw * dir); g.lineTo(hip.x + px * hw, hip.y + py * hw * dir);
    g.lineTo(sh.x + px * sw, sh.y + py * sw * dir); g.lineTo(sh.x - px * sw, sh.y - py * sw * dir);
    g.closePath(); g.fill(); g.stroke();
    const down = { x: -Math.sin(lean) * dir, y: Math.cos(lean) };
    if (k.shirt) {
      const f0 = { x: sh.x + px * (sw - 2), y: sh.y + py * (sw - 2) * dir };
      g.fillStyle = k.shirt; g.beginPath();
      g.moveTo(f0.x, f0.y - 4 * sc); g.lineTo(f0.x + down.x * torso * 0.5, f0.y + down.y * torso * 0.5);
      g.lineTo(f0.x - px * 16 * sc, f0.y - py * 16 * sc * dir); g.closePath(); g.fill();
    }
    if (k.stripe) {
      g.strokeStyle = k.stripe; g.lineWidth = 9 * sc;
      const m = { x: (hip.x + sh.x) / 2, y: (hip.y + sh.y) / 2 + 8 * sc };
      g.beginPath(); g.moveTo(m.x - px * hw, m.y - py * hw * dir); g.lineTo(m.x + px * hw, m.y + py * hw * dir); g.stroke();
    }
    if (c.kind === 'doctor') { // stethoscope
      g.strokeStyle = '#2a3036'; g.lineWidth = 4 * sc;
      g.beginPath(); g.moveTo(sh.x - px * 10, sh.y); g.quadraticCurveTo(sh.x + px * 30 + down.x * 60, sh.y + down.y * 60, sh.x + px * 18, sh.y + 4); g.stroke();
    }
    if (k.hood) { g.fillStyle = k.top2; g.beginPath(); g.ellipse(sh.x - px * 22 * sc, sh.y - 4 * sc, 22 * sc, 16 * sc, 0, 0, 7); g.fill(); }
    leg(legs[0], k.pants, k.shoe);
    g.strokeStyle = HEAD1; g.lineWidth = 14 * sc;
    g.beginPath(); g.moveTo(sh.x, sh.y); g.lineTo(neck.x, neck.y - 6 * sc); g.stroke();
    const hg = g.createRadialGradient(head.x - hr * 0.35 * dir, head.y - hr * 0.4, hr * 0.1, head.x, head.y, hr * 1.05);
    hg.addColorStop(0, c.pale ? '#e4e6ea' : HEAD0); hg.addColorStop(1, c.pale ? '#b8bdc6' : HEAD1);
    g.fillStyle = hg; g.beginPath(); g.arc(head.x, head.y, hr, 0, 7); g.fill();
    if (c.light) glow(g, head.x + dir * hr * 0.6, head.y, hr * 1.6, c.light, 0.35);
    accessories(g, c, cx);
    const na = arm(nearT, k.top, 22);
    if (c.hold) prop(g, na, cx, c, c.hold, c.near);
    if (c.near === 'controller') rrect(g, na.fx - 22 * sc, na.fy - 10 * sc, 44 * sc, 20 * sc, 8 * sc, '#1a1b20');
    return { head, hr };
  }

  function target(mode, cx, far, c) {
    const { sh, head, hr, sc, dir, t } = cx;
    if (typeof mode === 'object' && mode) return mode;
    const r = rng(Math.floor(t * 18) * 7 + (far ? 1 : 2));
    switch (mode) {
      case 'drink': return { x: head.x + hr * 0.75 * dir, y: head.y + hr * 0.45 };
      case 'chest': return { x: sh.x + 42 * sc * dir, y: sh.y + 62 * sc };
      case 'clutch': return { x: sh.x + (far ? 14 : 24) * sc * dir, y: sh.y + 34 * sc };
      case 'head': return { x: head.x + (far ? -8 : 22) * sc * dir, y: head.y + 16 * sc };
      case 'dua': return { x: head.x + (far ? 52 : 66) * sc * dir, y: head.y + (far ? 34 : 26) * sc };
      case 'type': return { x: sh.x + (far ? 96 : 112) * sc * dir + (r() - 0.5) * 10 * sc, y: sh.y + 92 * sc - r() * 10 * sc };
      case 'controller': return { x: sh.x + 58 * sc * dir + (r() - 0.5) * 6 * sc, y: sh.y + 78 * sc + (r() - 0.5) * 6 * sc };
      case 'swing': {
        const ph = ((c.w || 0) / 140) * Math.PI * 2 + (far ? Math.PI : 0), a = Math.sin(ph) * 0.5;
        return { x: sh.x + Math.sin(a) * 110 * sc * dir + 8 * sc * dir, y: sh.y + Math.cos(a) * 112 * sc };
      }
      case 'reach': return { x: sh.x + 120 * sc * dir, y: sh.y + 20 * sc };
      case 'side': return { x: sh.x - 30 * sc * dir, y: sh.y + 90 * sc };
      default: {
        const along = { x: -Math.sin(cx.lean) * dir, y: Math.cos(cx.lean) };
        return { x: sh.x + along.x * 115 * sc + 10 * sc * dir, y: sh.y + along.y * 115 * sc };
      }
    }
  }
  function prop(g, a, cx, c, what, mode) {
    const { sc, dir } = cx;
    g.save(); g.translate(a.fx, a.fy);
    g.rotate(mode === 'drink' ? -2.0 * dir : (c.crush ? 0.5 * dir : 0));
    if (what === 'can') {
      const h = c.crush ? 26 : 40;
      rect(g, -10 * sc, -24 * sc, 20 * sc, h * sc, '#121316'); rect(g, -10 * sc, -12 * sc, 20 * sc, 9 * sc, '#7cff4f'); rect(g, -10 * sc, -27 * sc, 20 * sc, 4 * sc, '#b8bcc6');
    } else if (what === 'bag') {
      rrect(g, -18 * sc, -20 * sc, 36 * sc, 40 * sc, 10 * sc, 'rgba(200,230,255,0.8)');
    }
    g.restore();
  }
  function accessories(g, c, cx) {
    const { hr, sc, dir, head } = cx;
    g.save(); g.translate(head.x, head.y); g.rotate(((c.lean || 0) + (c.tilt || 0)) * dir);
    if (c.kind === 'medic') { rrect(g, -hr * 0.9, -hr * 1.02, hr * 1.8, hr * 0.5, 10 * sc, '#264d73'); }
    if (c.mask) { // oxygen mask on the face
      g.fillStyle = 'rgba(200,235,255,0.85)'; g.beginPath(); g.ellipse(hr * 0.78 * dir, hr * 0.15, 13 * sc, 20 * sc, 0, 0, 7); g.fill();
      g.strokeStyle = 'rgba(200,235,255,0.6)'; g.lineWidth = 4 * sc; g.beginPath(); g.moveTo(hr * 0.8 * dir, hr * 0.3); g.quadraticCurveTo(hr * 1.6 * dir, hr * 1.2, hr * 2.4 * dir, hr * 0.8); g.stroke();
    }
    if (c.kind === 'hero' || c.kind === 'gown') { g.strokeStyle = '#2a2a30'; g.lineWidth = 10 * sc; g.beginPath(); g.arc(0, 0, hr - 3 * sc, Math.PI * (dir > 0 ? 1.05 : 1.4), Math.PI * (dir > 0 ? 1.6 : 1.95)); g.stroke(); }
    g.restore();
  }

  // ---------- HUD ----------
  function heart(g, x, y, s) {
    g.beginPath(); g.moveTo(x, y + s * 0.35);
    g.bezierCurveTo(x - s * 1.1, y - s * 0.35, x - s * 0.45, y - s * 1.05, x, y - s * 0.45);
    g.bezierCurveTo(x + s * 0.45, y - s * 1.05, x + s * 1.1, y - s * 0.35, x, y + s * 0.35);
    g.fill();
  }
  function drawHud(g, hud, t) {
    if (!hud) return;
    const a = hud.alpha == null ? 1 : hud.alpha;
    if (a <= 0) return;
    g.save(); g.globalAlpha = a;
    // soft plate
    const pg = g.createLinearGradient(0, 160, 0, 420);
    pg.addColorStop(0, 'rgba(3,4,10,0.55)'); pg.addColorStop(1, 'rgba(3,4,10,0)');
    g.fillStyle = pg; g.fillRect(0, 150, W, 280);
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.font = '800 64px KzSans'; g.fillStyle = '#f2eee6';
    g.shadowColor = 'rgba(0,0,0,0.7)'; g.shadowBlur = 14;
    const line = hud.time + (hud.place ? '  ·  ' : '');
    g.font = '800 62px KzSans';
    const w1 = g.measureText(line).width;
    g.font = '600 46px KzSans';
    const w2 = hud.place ? g.measureText(hud.place).width : 0;
    const x0 = W / 2 - (w1 + w2) / 2;
    g.textAlign = 'left';
    g.font = '800 62px KzSans'; g.fillStyle = '#f2eee6'; g.fillText(line, x0, 262);
    if (hud.place) { g.font = '600 46px KzSans'; try { g.letterSpacing = '6px'; } catch (e) {} g.fillStyle = hud.placeColor || '#9fe6b0'; g.fillText(hud.place, x0 + w1, 260); try { g.letterSpacing = '0px'; } catch (e) {} }
    g.shadowBlur = 0;
    if (hud.n != null) {
      const cw = 34, ch = 56, gap = 14, total = 10 * cw + 9 * gap;
      const bx = W / 2 - total / 2 - 70, by = 300;
      for (let i = 0; i < 10; i++) {
        const x = bx + i * (cw + gap);
        const filled = i < Math.floor(hud.n);
        const pp = hud.pop == null || hud.pop < 0 ? 99 : hud.pop;
        const pop = filled && i === Math.floor(hud.n) - 1 ? 1 + 0.35 * Math.exp(-pp * 6) : 1;
        g.save(); g.translate(x + cw / 2, by + ch / 2); g.scale(pop, pop);
        if (filled) {
          rrect(g, -cw / 2, -ch / 2, cw, ch, 6, '#4a4e58'); rrect(g, -cw / 2 + 3, -ch / 2 + 3, cw - 6, ch - 6, 5, '#23252b');
          rect(g, -cw / 2, -ch / 2 + 16, cw, 12, hud.danger ? '#ff4d4d' : '#7cff4f');
          rect(g, -cw / 2 + 4, -ch / 2 - 4, cw - 8, 5, '#b8bcc6');
        } else {
          g.strokeStyle = 'rgba(255,255,255,0.3)'; g.lineWidth = 3; g.strokeRect(-cw / 2, -ch / 2, cw, ch);
        }
        g.restore();
      }
      g.font = '800 50px KzSans'; g.fillStyle = hud.danger ? '#ff4d4d' : '#7cff4f';
      g.fillText(`${Math.floor(hud.n)}/10`, bx + total + 26, by + 44);
    }
    if (hud.bpm) {
      const beat = (t * hud.bpm / 60) % 1, s = 1 + 0.35 * Math.exp(-beat * 8);
      g.fillStyle = '#ff4d5e'; heart(g, W / 2 - 120, 420, 26 * s);
      g.font = '800 46px KzSans'; g.fillText(`${Math.round(hud.bpm)} BPM`, W / 2 - 80, 436);
    }
    g.restore(); g.textAlign = 'left';
  }

  // ---------- frame ----------
  let farC = null, worldC = null;
  function render(canvas, st, t) {
    const g = canvas.getContext('2d');
    const set = SETS[st.set];
    const env = Object.assign({}, st.env || {});
    const cam = st.cam;
    if (!farC) { farC = document.createElement('canvas'); farC.width = W; farC.height = H; worldC = document.createElement('canvas'); worldC.width = W; worldC.height = H; }
    const wg = worldC.getContext('2d');
    wg.setTransform(1, 0, 0, 1, 0, 0); wg.filter = 'none'; wg.globalAlpha = 1;
    wg.fillStyle = '#05060b'; wg.fillRect(0, 0, W, H);
    const camT = (gg, p, zk) => {
      gg.translate(W / 2, H * (cam.ay || 0.5));
      if (cam.rot) gg.rotate(cam.rot);
      gg.scale(cam.zoom * zk, cam.zoom * zk);
      gg.translate(-cam.x * p, -cam.y * p);
    };
    if (set && set.far) {
      const fg = farC.getContext('2d');
      fg.setTransform(1, 0, 0, 1, 0, 0); fg.fillStyle = '#05060b'; fg.fillRect(0, 0, W, H);
      fg.save(); camT(fg, st.farP || 0.92, st.farZ || 0.96); set.far(fg, env, t); fg.restore();
      wg.save(); wg.filter = `blur(${st.bgBlur == null ? 6 : st.bgBlur}px)`; wg.drawImage(farC, 0, 0); wg.restore();
    }
    wg.save(); camT(wg, 1, 1);
    if (set && set.near) set.near(wg, env, t);
    const heads = [];
    for (const c of st.chars || []) {
      wg.save();
      wg.globalAlpha = c.alpha == null ? 1 : c.alpha;
      let pv = null;
      if (c.rot) { pv = c.pivot || { x: c.x, y: c.fy || 0 }; wg.translate(pv.x, pv.y); wg.rotate(c.rot); wg.translate(-pv.x, -pv.y); }
      if (c.oy) wg.translate(0, c.oy);
      const h = drawChar(wg, c, t);
      wg.restore();
      let hx = h.head.x, hy = h.head.y + (c.oy || 0);
      if (pv) { const dx = h.head.x - pv.x, dy = h.head.y + (c.oy || 0) - pv.y; hx = pv.x + dx * Math.cos(c.rot) - dy * Math.sin(c.rot); hy = pv.y + dx * Math.sin(c.rot) + dy * Math.cos(c.rot); }
      heads.push({ c, x: hx, y: hy, hr: h.hr });
    }
    if (set && set.front) set.front(wg, env, t);
    wg.restore();
    if (st.screenFx) st.screenFx(wg, t, env);

    // composite world → main canvas
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none';
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    g.save();
    if (st.blur) g.filter = `blur(${st.blur}px)`;
    g.drawImage(worldC, 0, 0);
    g.restore();
    if (st.double) { g.save(); g.globalAlpha = 0.4 * st.double; g.drawImage(worldC, 26 * st.double, -8 * st.double); g.restore(); }
    if (st.dark) { g.fillStyle = `rgba(3,4,10,${st.dark})`; g.fillRect(0, 0, W, H); }
    // labels
    for (const { c, x, y, hr } of heads) {
      const text = c.text != null ? c.text : LABELS[c.kind];
      const la = (c.label == null ? 1 : c.label) * (c.alpha == null ? 1 : c.alpha);
      if (!text || la <= 0.01) continue;
      const sx0 = W / 2 + (x - cam.x) * cam.zoom, sy0 = H * (cam.ay || 0.5) + (y - hr - 46 - cam.y) * cam.zoom;
      let sx = sx0, sy = sy0;
      if (cam.rot) { const dx = sx0 - W / 2, dy = sy0 - H * (cam.ay || 0.5); sx = W / 2 + dx * Math.cos(cam.rot) - dy * Math.sin(cam.rot); sy = H * (cam.ay || 0.5) + dx * Math.sin(cam.rot) + dy * Math.cos(cam.rot); }
      const size = clamp(15 * cam.zoom + 12, 28, 44);
      g.font = `600 ${size}px KzSans`;
      try { g.letterSpacing = `${Math.round(size * 0.22)}px`; } catch (e) {}
      const half = g.measureText(text).width / 2;
      sx = clamp(sx, 70 + half, W - 70 - half);
      sy = clamp(sy, 470, 1300);
      g.save(); g.globalAlpha = la * 0.5;
      g.translate(sx, sy - size * 0.35); g.scale(half + size * 1.1, size * 1.3);
      const pg = g.createRadialGradient(0, 0, 0, 0, 0, 1);
      pg.addColorStop(0, 'rgba(4,5,12,0.9)'); pg.addColorStop(1, 'rgba(4,5,12,0)');
      g.fillStyle = pg; g.beginPath(); g.arc(0, 0, 1, 0, 7); g.fill(); g.restore();
      g.textAlign = 'center'; g.globalAlpha = la; g.fillStyle = c.labelColor || '#d9d4e6';
      g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 12;
      g.fillText(text, sx, sy); g.shadowBlur = 0; g.globalAlpha = 1;
      try { g.letterSpacing = '0px'; } catch (e) {}
      g.textAlign = 'left';
    }
    // red pulse (heart attack)
    if (st.red) {
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.7);
      vg.addColorStop(0, 'rgba(160,0,10,0)'); vg.addColorStop(1, `rgba(160,0,10,${0.75 * st.red})`);
      g.fillStyle = vg; g.fillRect(0, 0, W, H);
    }
    // vignette + grain
    const vg = g.createRadialGradient(W / 2, H * 0.45, H * 0.28, W / 2, H * 0.5, H * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
    const r = rng(Math.floor(t * 30) * 13 + 1);
    g.fillStyle = 'rgba(255,255,255,0.035)';
    for (let i = 0; i < 900; i++) g.fillRect(r() * W, r() * H, 2, 2);
    // eyelids
    if (st.eyelid) {
      const e = clamp(st.eyelid, 0, 1), hh = (H / 2 + 120) * e;
      g.fillStyle = '#000';
      g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); g.lineTo(W, hh); g.quadraticCurveTo(W / 2, hh + 260 * (1 - e) + 40, 0, hh); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(0, H); g.lineTo(W, H); g.lineTo(W, H - hh); g.quadraticCurveTo(W / 2, H - hh - 260 * (1 - e) - 40, 0, H - hh); g.closePath(); g.fill();
    }
    drawHud(g, st.hud, t);
    if (st.ecg) ecg(g, st.ecg.x || 90, st.ecg.y || 1240, st.ecg.w || 900, st.ecg.h || 90, t, st.ecg.bpm, st.ecg.col || '#62f08a', st.ecg.lw || 5, st.ecg.flat);
    if (st.flash) { g.fillStyle = `rgba(255,255,255,${st.flash})`; g.fillRect(0, 0, W, H); }
    if (st.fade) { g.fillStyle = `rgba(0,0,0,${st.fade})`; g.fillRect(0, 0, W, H); }
  }

  function mount(canvasId, compId, dur, build) {
    const canvas = document.getElementById(canvasId);
    const clock = { t: 0 };
    const draw = () => render(canvas, build(clock.t), clock.t);
    window.__hf = window.__hf || {};
    window.__hf.buildReady = window.__hf.buildReady || {};
    window.__hf.buildReady['fonts-' + compId] = Promise.all([
      document.fonts.load('600 30px KzSans', 'ҚӘМЕН'), document.fonts.load('800 30px KzSans', 'ҚӘ0123'), document.fonts.load('500 30px KzSans', 'ҚӘ'),
    ]).then(draw);
    const tl = gsap.timeline({ paused: true });
    tl.to(clock, { t: dur, duration: dur, ease: 'none', onUpdate: draw }, 0);
    draw();
    return tl;
  }

  window.Life = { mount, ease, smooth, lerp, clamp, rng, ecg, glow, rect };
})();
