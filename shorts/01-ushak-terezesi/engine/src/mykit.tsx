// Shared props for the shorts cartoons (copied into each video's engine/src by tools/multik.py).
// Same look as kit.tsx: thick INK outline, warm flat colours, simple rounded shapes.
import React from "react";
import { INK } from "./people";
import { AT_WORD, WS } from "./times";
import { L, rnd } from "./kit";

// global index of word j inside scene k (scene k starts at AT_WORD[k])
export const wi = (k: number, j = 0) => Math.min(WS.length - 1, (AT_WORD[k] ?? 0) + j);
const SW = 7;

export const Plane: React.FC<{ x: number; y: number; s?: number; rot?: number; square?: boolean; body?: string; stripe?: string;
  label?: string; windows?: number; broken?: number }> = ({ x, y, s = 1, rot = 0, square, body = "#F4F1EA", stripe = "#2F6FE0", label, windows = 7, broken = 0 }) => {
  const win = (i: number) => {
    const wx = -250 + i * 72;
    return square
      ? <rect key={i} x={wx - 18} y={-58} width={36} height={36} rx={2} fill="#9FD8FF" stroke={INK} strokeWidth={5} />
      : <ellipse key={i} cx={wx} cy={-40} rx={17} ry={22} fill="#9FD8FF" stroke={INK} strokeWidth={5} />;
  };
  const front = (
    <g>
      <path d="M-40,-10 L80,150 L170,150 L120,-10 Z" fill={stripe} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M-10,-100 L-80,0 L320,0 Q420,-10 430,-50 Q420,-100 320,-100 Z" fill={body} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M330,-92 Q395,-88 410,-62 L360,-62 Z" fill="#9FD8FF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <rect x={-80} y={-22} width={400} height={12} fill={stripe} />
      {Array.from({ length: Math.ceil(windows / 2) + 1 }, (_, i) => i + Math.floor(windows / 2)).filter((i) => i < windows).map(win)}
    </g>
  );
  const back = (
    <g>
      <path d="M-330,-100 L-400,-240 L-330,-240 L-250,-100 Z" fill={stripe} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M-10,-100 L-320,-100 Q-380,-100 -400,-70 L-380,-20 Q-340,0 -300,0 L-10,0 Z" fill={body} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <rect x={-380} y={-22} width={370} height={12} fill={stripe} />
      {Array.from({ length: Math.floor(windows / 2) }, (_, i) => i).map(win)}
      {label && <text x={-200} y={-70} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight={900} fontSize={30} fill={stripe}>{label}</text>}
    </g>
  );
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
      <g transform={`translate(${-broken * 120},${broken * 160}) rotate(${-broken * 25},-10,-50)`}>{back}</g>
      <g transform={`translate(${broken * 100},${broken * 120}) rotate(${broken * 30},-10,-50)`}>{front}</g>
    </g>
  );
};

export const House: React.FC<{ x: number; y: number; s?: number; c?: string; roof?: string; lit?: boolean }> = ({ x, y, s = 1, c = "#F2C55C", roof = "#C2463F", lit }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={SW} strokeLinejoin="round">
    <rect x={-170} y={-260} width={340} height={260} fill={c} />
    <path d="M-200,-250 L0,-420 L200,-250 Z" fill={roof} />
    {[-90, 90].map((wx) => <g key={wx}><rect x={wx - 50} y={-210} width={100} height={100} fill={lit ? "#FFE08A" : "#9FD8FF"} /><line x1={wx} y1={-210} x2={wx} y2={-110} strokeWidth={5} /><line x1={wx - 50} y1={-160} x2={wx + 50} y2={-160} strokeWidth={5} /></g>)}
    <rect x={-40} y={-90} width={80} height={90} fill="#8A5A3B" />
  </g>
);

export const Bus: React.FC<{ x: number; y: number; s?: number; c?: string; t?: number }> = ({ x, y, s = 1, c = "#F2A33A", t = 0 }) => (
  <g transform={`translate(${x},${y + Math.sin(t * 18) * 3}) scale(${s})`} stroke={INK} strokeWidth={SW} strokeLinejoin="round">
    <rect x={-330} y={-250} width={660} height={220} rx={36} fill={c} />
    {[-250, -130, -10, 110].map((wx) => <rect key={wx} x={wx} y={-220} width={96} height={86} rx={6} fill="#9FD8FF" />)}
    <rect x={230} y={-220} width={70} height={150} rx={6} fill="#9FD8FF" />
    <rect x={-330} y={-100} width={660} height={20} fill="#fff" opacity={0.5} stroke="none" />
    {[-200, 200].map((wx) => <g key={wx} transform={`translate(${wx},-30) rotate(${t * 400})`}><circle r={52} fill="#2A2233" /><circle r={20} fill="#C9CDD8" /><line x1={-20} y1={0} x2={20} y2={0} strokeWidth={5} /></g>)}
  </g>
);

export const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; c?: string; w?: number; p?: number }> = ({ x1, y1, x2, y2, c = "#E8484F", w = 26, p = 1 }) => {
  const ex = x1 + (x2 - x1) * p, ey = y1 + (y2 - y1) * p;
  const a = Math.atan2(ey - y1, ex - x1), h = w * 1.6;
  if (p <= 0.02) return null;
  return (
    <g stroke={INK} strokeWidth={6} strokeLinejoin="round">
      <line x1={x1} y1={y1} x2={ex - Math.cos(a) * h * 0.6} y2={ey - Math.sin(a) * h * 0.6} stroke={INK} strokeWidth={w + 12} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={ex - Math.cos(a) * h * 0.6} y2={ey - Math.sin(a) * h * 0.6} stroke={c} strokeWidth={w} strokeLinecap="round" />
      <path d={`M${ex},${ey} L${ex - Math.cos(a - 0.5) * h},${ey - Math.sin(a - 0.5) * h} L${ex - Math.cos(a + 0.5) * h},${ey - Math.sin(a + 0.5) * h} Z`} fill={c} />
    </g>
  );
};

export const Crack: React.FC<{ x: number; y: number; s?: number; p: number; rot?: number }> = ({ x, y, s = 1, p, rot = 0 }) => {
  const pts = [[0, 0], [40, 18], [62, 6], [96, 34], [130, 22], [170, 58], [210, 50]];
  const n = Math.max(2, Math.round(pts.length * Math.min(1, p)));
  if (p <= 0) return null;
  const d = pts.slice(0, n).map(([a, b], i) => `${i ? "L" : "M"}${a},${b}`).join(" ");
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth={14} />
      <path d={d} stroke="#FF5A4E" strokeWidth={6} />
      {n > 4 && <path d="M96,34 L110,80 L100,110" stroke={INK} strokeWidth={10} />}
    </g>
  );
};

export const Bubble: React.FC<{ x: number; y: number; s?: number; tail?: [number, number]; children?: React.ReactNode }> = ({ x, y, s = 1, tail = [-120, 240], children }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse rx={230} ry={190} fill="#fff" stroke={INK} strokeWidth={8} />
    <circle cx={tail[0] * 0.6} cy={tail[1] * 0.75} r={26} fill="#fff" stroke={INK} strokeWidth={7} />
    <circle cx={tail[0]} cy={tail[1]} r={14} fill="#fff" stroke={INK} strokeWidth={6} />
    {children}
  </g>
);

export const Bomb: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={7} strokeLinejoin="round">
    <circle r={80} fill="#2A2233" /><rect x={-26} y={-110} width={52} height={36} rx={6} fill="#5A5470" />
    <path d="M0,-110 Q20,-160 60,-150" fill="none" strokeWidth={6} />
    <circle cx={62} cy={-152} r={12 + Math.sin(t * 30) * 4} fill="#FFB238" stroke="none" />
    <circle cx={-28} cy={-28} r={18} fill="#fff" opacity={0.3} stroke="none" />
  </g>
);

export const Bolt: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = "#FFD84A" }) => (
  <path transform={`translate(${x},${y}) scale(${s})`} d="M20,-120 L-50,10 L0,10 L-30,120 L60,-20 L10,-20 L40,-120 Z" fill={c} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
);

export const Sun: React.FC<{ x: number; y: number; r?: number; t?: number; face?: boolean }> = ({ x, y, r = 120, t = 0, face = true }) => (
  <g transform={`translate(${x},${y})`}>
    <circle r={r * 2.2} fill="#FFE27A" opacity={0.25} />
    <g transform={`rotate(${t * 20})`}>{Array.from({ length: 12 }, (_, i) => (
      <path key={i} transform={`rotate(${i * 30})`} d={`M${-r * 0.16},${-r * 1.15} L0,${-r * 1.55} L${r * 0.16},${-r * 1.15} Z`} fill="#FFB238" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    ))}</g>
    <circle r={r} fill="#FFD23F" stroke={INK} strokeWidth={8} />
    {face && <g stroke={INK} strokeWidth={8} strokeLinecap="round" fill="none">
      <circle cx={-r * 0.32} cy={-r * 0.12} r={7} fill={INK} /><circle cx={r * 0.32} cy={-r * 0.12} r={7} fill={INK} />
      <path d={`M${-r * 0.35},${r * 0.25} Q0,${r * 0.55} ${r * 0.35},${r * 0.25}`} />
    </g>}
  </g>
);

// Eiffel-like lattice tower (generic iron tower), base centre at x,y, height h
export const Tower: React.FC<{ x: number; y: number; h?: number; c?: string; grow?: number; lean?: number }> = ({ x, y, h = 1300, c = "#8A5A3B", grow = 0, lean = 0 }) => {
  const H = h * (1 + grow);
  const wAt = (k: number) => 330 * Math.pow(1 - k, 2.2) + 26; // half-width at height fraction k
  const P = (k: number, side: number) => [side * wAt(k) + lean * k * k * 120, -H * k];
  const lv = [0, 0.18, 0.36, 0.62, 0.92];
  return (
    <g transform={`translate(${x},${y})`} stroke={INK} strokeLinejoin="round">
      <path d={`M${P(0, -1)} Q${-150},${-H * 0.06} ${P(0.18, -1)} L${P(0.18, 1)} Q150,${-H * 0.06} ${P(0, 1)} L${wAt(0) - 90},0 Q0,${-H * 0.13} ${-wAt(0) + 90},0 Z`} fill={c} strokeWidth={8} />
      <path d={`M${P(0.18, -1)} L${P(0.92, -1)} L${P(0.92, 1)} L${P(0.18, 1)} Z`} fill={c} strokeWidth={8} />
      {Array.from({ length: 14 }, (_, i) => {
        const k0 = 0.18 + i * 0.053, k1 = k0 + 0.053;
        return <g key={i} strokeWidth={3} opacity={0.65}>
          <line x1={P(k0, -1)[0]} y1={P(k0, -1)[1]} x2={P(k1, 1)[0]} y2={P(k1, 1)[1]} />
          <line x1={P(k0, 1)[0]} y1={P(k0, 1)[1]} x2={P(k1, -1)[0]} y2={P(k1, -1)[1]} />
        </g>;
      })}
      {lv.slice(1, 4).map((k) => <rect key={k} x={P(k, -1)[0] - 30} y={-H * k - 18} width={(wAt(k) + 30) * 2} height={30} rx={6} fill="#B97A52" strokeWidth={7} />)}
      <path d={`M${P(0.92, -1)} L${lean * 120 - 8},${-H - 90} L${lean * 120 + 8},${-H - 90} L${P(0.92, 1)} Z`} fill={c} strokeWidth={7} />
      <circle cx={lean * 120} cy={-H - 96} r={10} fill="#E8484F" strokeWidth={5} />
    </g>
  );
};

export const Thermo: React.FC<{ x: number; y: number; s?: number; v: number }> = ({ x, y, s = 1, v }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={7}>
    <rect x={-28} y={-300} width={56} height={300} rx={28} fill="#fff" />
    <rect x={-14} y={-286 + (1 - v) * 260} width={28} height={286 - (1 - v) * 260} rx={14} fill="#E8484F" stroke="none" />
    <circle cy={20} r={48} fill="#E8484F" />
  </g>
);

export const Shelf: React.FC<{ x: number; y: number; w?: number; c?: string; children?: React.ReactNode }> = ({ x, y, w = 800, c = "#E7D2B0", children }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-w / 2} y={0} width={w} height={28} rx={6} fill={c} stroke={INK} strokeWidth={6} />
    {children}
  </g>
);

export const Box: React.FC<{ x: number; y: number; w?: number; h?: number; c?: string; label?: string; fs?: number }> = ({ x, y, w = 90, h = 120, c = "#E8484F", label, fs = 22 }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-w / 2} y={-h} width={w} height={h} rx={8} fill={c} stroke={INK} strokeWidth={6} />
    <rect x={-w / 2 + 10} y={-h * 0.62} width={w - 20} height={h * 0.3} rx={4} fill="#fff" opacity={0.85} />
    {label && <text x={0} y={-h * 0.42} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight={900} fontSize={fs} fill={INK}>{label}</text>}
  </g>
);

export const Bread: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} stroke={INK} strokeWidth={7} strokeLinejoin="round">
    <path d="M-120,0 Q-130,-80 -60,-90 Q0,-110 60,-90 Q130,-80 120,0 Z" fill="#D9934A" />
    {[-60, 0, 60].map((cx) => <path key={cx} d={`M${cx - 18},-78 Q${cx},-52 ${cx + 18},-70`} fill="none" strokeWidth={5} />)}
  </g>
);

export const Milk: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={7} strokeLinejoin="round">
    <path d="M-60,0 L-60,-170 L-30,-220 L30,-220 L60,-170 L60,0 Z" fill="#fff" />
    <rect x={-30} y={-240} width={60} height={22} fill="#2F6FE0" />
    <path d="M-60,-120 Q0,-140 60,-120 L60,-60 Q0,-40 -60,-60 Z" fill="#7FC4FF" />
  </g>
);

export const Bag: React.FC<{ x: number; y: number; s?: number; full?: number }> = ({ x, y, s = 1, full = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={7} strokeLinejoin="round">
    {full > 0.3 && <><rect x={-70} y={-250} width={50} height={90} rx={8} fill="#E8484F" /><rect x={-10} y={-270} width={44} height={110} rx={8} fill="#F2C55C" /><circle cx={60} cy={-200} r={40} fill="#56BA6C" /></>}
    <path d="M-110,0 L-90,-190 L90,-190 L110,0 Z" fill="#F4E3C3" />
    <path d="M-50,-190 Q-50,-250 0,-250 Q50,-250 50,-190" fill="none" strokeWidth={8} />
  </g>
);

export const Cart: React.FC<{ x: number; y: number; s?: number; t?: number; children?: React.ReactNode }> = ({ x, y, s = 1, t = 0, children }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={7} strokeLinejoin="round">
    {children}
    <path d="M-200,-260 L200,-260 L170,-60 L-170,-60 Z" fill="#C9D6E8" fillOpacity={0.55} />
    {[-120, -40, 40, 120].map((gx) => <line key={gx} x1={gx} y1={-260} x2={gx * 0.88} y2={-60} strokeWidth={4} />)}
    <line x1={200} y1={-260} x2={260} y2={-330} strokeWidth={10} />
    {[-130, 130].map((wx) => <g key={wx} transform={`translate(${wx},-20) rotate(${t * 300})`}><circle r={26} fill="#2A2233" /><line x1={-14} y1={0} x2={14} y2={0} stroke="#888" strokeWidth={4} /></g>)}
  </g>
);

export const Tag: React.FC<{ x: number; y: number; s?: number; text: string; c?: string; rot?: number }> = ({ x, y, s = 1, text, c = "#FFE04A", rot = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-150,-60 L120,-60 L170,0 L120,60 L-150,60 Z" fill={c} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <circle cx={115} cy={0} r={12} fill="#fff" stroke={INK} strokeWidth={5} />
    <text x={-20} y={22} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight={900} fontSize={66} fill={INK}
      textLength={Math.min(230, text.length * 44)} lengthAdjust="spacingAndGlyphs">{text}</text>
  </g>
);

export const Dog: React.FC<{ x: number; y: number; s?: number; yawn?: number; t?: number }> = ({ x, y, s = 1, yawn = 0, t = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={7} strokeLinejoin="round">
    <ellipse cx={0} cy={-90} rx={130} ry={70} fill="#E0A458" />
    {[-90, -40, 50, 100].map((lx) => <line key={lx} x1={lx} y1={-40} x2={lx} y2={0} strokeWidth={14} strokeLinecap="round" />)}
    <path d={`M120,-120 Q170,${-150 + Math.sin(t * 10) * 20} 190,-170`} fill="none" strokeWidth={12} strokeLinecap="round" />
    <g transform="translate(-130,-160)">
      <circle r={78} fill="#E0A458" />
      <path d="M-60,-40 Q-110,10 -70,60 Q-40,20 -40,-30 Z" fill="#9A6230" />
      <path d="M50,-50 Q100,0 70,50 Q40,10 30,-40 Z" fill="#9A6230" />
      {yawn > 0.4 ? <><path d="M-34,-14 Q-22,-22 -10,-14" fill="none" /><path d="M14,-14 Q26,-22 38,-14" fill="none" /></>
        : <><circle cx={-22} cy={-14} r={9} fill={INK} /><circle cx={26} cy={-14} r={9} fill={INK} /></>}
      <ellipse cx={0} cy={22 + yawn * 10} rx={20 + yawn * 6} ry={8 + yawn * 34} fill={yawn > 0.1 ? "#7A2E44" : INK} />
      <ellipse cx={0} cy={8} rx={14} ry={10} fill={INK} />
    </g>
  </g>
);

export const Phone: React.FC<{ x: number; y: number; s?: number; rot?: number; glow?: number; children?: React.ReactNode }> = ({ x, y, s = 1, rot = 0, glow = 0, children }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    {glow > 0 && <circle r={220} fill="#9FD8FF" opacity={glow * 0.35} />}
    <rect x={-90} y={-170} width={180} height={340} rx={30} fill="#2A2233" stroke={INK} strokeWidth={7} />
    <rect x={-74} y={-148} width={148} height={292} rx={16} fill="#9FD8FF" />
    {children}
  </g>
);

export const Coin: React.FC<{ x: number; y: number; s?: number; spin?: number; label?: string }> = ({ x, y, s = 1, spin = 0, label = "₸" }) => (
  <g transform={`translate(${x},${y}) scale(${s * Math.max(0.15, Math.abs(Math.cos(spin)))},${s})`} stroke={INK} strokeWidth={7}>
    <circle r={60} fill="#F2C55C" /><circle r={42} fill="none" stroke="#C99B3F" strokeWidth={6} />
    <text x={0} y={22} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight={900} fontSize={60} fill="#8A5A1B" stroke="none">{label}</text>
  </g>
);

// ground strip with grass blades
export const Grass: React.FC<{ y: number; c?: string }> = ({ y, c = "#7CC46A" }) => (
  <g>
    <rect x={-700} y={y} width={2480} height={1400} fill={c} />
    {Array.from({ length: 40 }, (_, i) => <path key={i} d={`M${-600 + i * 60 + rnd(i) * 30},${y + 20 + rnd(i + 4) * 200} l8,-22 l8,22`} fill="none" stroke="#4E9A47" strokeWidth={5} strokeLinecap="round" />)}
  </g>
);

export const Runway: React.FC<{ y: number }> = ({ y }) => (
  <g>
    <rect x={-700} y={y} width={2480} height={1400} fill="#7CC46A" />
    <rect x={-700} y={y + 40} width={2480} height={180} fill="#5A5470" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 16 }, (_, i) => <rect key={i} x={-660 + i * 160} y={y + 120} width={90} height={18} fill="#F4F1EA" />)}
  </g>
);

export const grow = L;
