// Образец одной сцены «У стоматолога» (7 с): человечек входит, садится в кресло, подходит врач с бормашиной — дрожь.
// Мир рисуется в координатах 1080×1920, камера — масштаб и сдвиг всего мира; два шота с растворением 4 кадра.
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { FloorShadow, INK, Person, mix, sit, stand, walk } from "./people";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.45, 0, 0.25, 1);
const lerp = (f: number, a: number[], b: number[], e = ease) => interpolate(f, a, b, { ...cl, easing: e });

export const CUT = 118;           // начало растворения во второй шот
export const XF = 4;              // длина растворения, кадров

// ---------------------------------------------------------------- комната
const Floor: React.FC = () => {
  const rows = 9, vx = 540, vy = 520, top = 1150, bot = 1960;
  const ys = Array.from({ length: rows + 1 }, (_, r) => top + (bot - top) * Math.pow(r / rows, 1.55));
  const xb = Array.from({ length: 14 }, (_, i) => -900 + i * 220);
  const at = (x: number, y: number) => vx + (x - vx) * (y - vy) / (bot - vy);
  const tiles: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) for (let i = 0; i < xb.length - 1; i++) {
    const y0 = ys[r], y1 = ys[r + 1];
    const pts = [[at(xb[i], y0), y0], [at(xb[i + 1], y0), y0], [at(xb[i + 1], y1), y1], [at(xb[i], y1), y1]];
    tiles.push(<polygon key={`${r}-${i}`} points={pts.map((p) => p.join(",")).join(" ")}
      fill={(r + i) % 2 ? "#E9D6B2" : "#F6EAD0"} stroke="#C7AE86" strokeWidth={2} />);
  }
  return <g>{tiles}</g>;
};

const Clouds: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <g fill="#E9D3E6">{[[-60, 14, 38], [0, 18, 46], [62, 16, 36]].map(([cx, cy, r]) => <circle key={cx} cx={cx} cy={cy} r={r} />)}</g>
    <g fill="#FFF4DE">{[[-62, 0, 36], [-14, -22, 48], [40, -10, 42], [80, 6, 28], [10, 8, 40]].map(([cx, cy, r]) => <circle key={cx} cx={cx} cy={cy} r={r} />)}</g>
  </g>
);

const Room: React.FC<{ f: number; door: number }> = ({ f, door }) => {
  const bell = door > 0 ? Math.sin((f - 10) * 0.7) * 22 * Math.exp(-(f - 10) / 14) : 0;
  const dw = 266 * (1 - 0.78 * door);
  return (
    <g>
      {/* стена */}
      <rect x={-300} y={-200} width={1680} height={1360} fill="url(#wall)" />
      {Array.from({ length: 24 }, (_, i) => <rect key={i} x={-300 + i * 72} y={-200} width={24} height={1050} fill="#fff" opacity={0.07} />)}
      <rect x={-300} y={-200} width={1680} height={250} fill="#8CC9BC" />
      <rect x={-300} y={40} width={1680} height={18} fill="#6FB2A5" stroke={INK} strokeWidth={4} />
      <rect x={-300} y={840} width={1680} height={310} fill="url(#wains)" />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-260 + i * 150} y={880} width={110} height={230} rx={8} fill="none" stroke="#3F8E85" strokeWidth={5} />)}
      <rect x={-300} y={826} width={1680} height={22} fill="#4A968E" stroke={INK} strokeWidth={5} />
      <Floor />
      <rect x={-300} y={1138} width={1680} height={22} fill="#3E7F78" stroke={INK} strokeWidth={4} />

      {/* окно с небом и облаками */}
      <g>
        <rect x={640} y={300} width={300} height={420} fill="url(#sky)" />
        <Clouds x={720} y={520} s={0.9} /><Clouds x={890} y={410} s={0.6} />
        <path d="M640,640 Q720,600 790,630 Q860,590 940,620 L940,720 L640,720 Z" fill="#7CC46A" stroke={INK} strokeWidth={3} />
        {Array.from({ length: 5 }, (_, i) => <rect key={i} x={640} y={300 + i * 24} width={300} height={16} fill="#F3E9D4" stroke="#B9A57F" strokeWidth={2} />)}
        <rect x={640} y={300} width={300} height={420} fill="none" stroke="#F7F1E4" strokeWidth={22} />
        <rect x={629} y={289} width={322} height={442} fill="none" stroke={INK} strokeWidth={6} />
        <line x1={790} y1={300} x2={790} y2={720} stroke="#F7F1E4" strokeWidth={12} />
        <rect x={620} y={720} width={340} height={26} rx={6} fill="#F7F1E4" stroke={INK} strokeWidth={5} />
      </g>

      {/* дверь */}
      <g>
        <rect x={92} y={452} width={266} height={698} fill="url(#hall)" />
        <rect x={92 + 40} y={1060} width={180} height={90} fill="#7B8BC9" opacity={0.25} filter="url(#soft)" />
        <g>
          <rect x={92} y={452} width={dw} height={698} fill="url(#doorWood)" stroke={INK} strokeWidth={5} />
          <rect x={92 + dw * 0.14} y={500} width={dw * 0.72} height={260} rx={8} fill="none" stroke="#8C5A2E" strokeWidth={5} />
          <rect x={92 + dw * 0.14} y={800} width={dw * 0.72} height={300} rx={8} fill="none" stroke="#8C5A2E" strokeWidth={5} />
          <circle cx={92 + dw * 0.86} cy={800} r={14} fill="#F2C55C" stroke={INK} strokeWidth={4} />
        </g>
        <rect x={74} y={436} width={302} height={714} fill="none" stroke="#7A4E2A" strokeWidth={22} />
        <rect x={60} y={422} width={330} height={742} fill="none" stroke={INK} strokeWidth={6} />
        <g transform={`translate(225,404) rotate(${bell})`}>
          <line x1={0} y1={-30} x2={0} y2={0} stroke={INK} strokeWidth={5} />
          <path d="M-20,26 Q-20,-4 0,-4 Q20,-4 20,26 Z" fill="#F2C55C" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <circle cx={0} cy={30} r={6} fill={INK} />
        </g>
      </g>

      {/* вывеска */}
      <g>
        <rect x={150} y={130} width={780} height={110} rx={18} fill="#24635E" stroke="#E3B65C" strokeWidth={10} />
        <rect x={140} y={120} width={800} height={130} rx={24} fill="none" stroke={INK} strokeWidth={6} />
        <text x={540} y={210} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={66}
          letterSpacing={6} fill="#FFF1D0">СТОМАТОЛОГ</text>
      </g>

      {/* плакат с зубом */}
      <g transform="translate(505,610) rotate(-3)">
        <rect x={-95} y={-130} width={190} height={250} rx={6} fill="#FFF3C4" stroke={INK} strokeWidth={6} />
        <path d="M-52,-80 C-52,-118 -10,-112 0,-96 C10,-112 52,-118 52,-80 C52,-40 40,-20 34,20 C30,50 14,52 8,22 C4,6 -4,6 -8,22 C-14,52 -30,50 -34,20 C-40,-20 -52,-40 -52,-80 Z"
          fill="#fff" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <ellipse cx={-16} cy={-66} rx={5} ry={7} fill={INK} /><ellipse cx={16} cy={-66} rx={5} ry={7} fill={INK} />
        <path d="M-16,-44 Q0,-32 16,-44" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M58,-104 l6,14 l14,6 l-14,6 l-6,14 l-6,-14 l-14,-6 l14,-6 Z" fill="#F2C55C" stroke={INK} strokeWidth={3} />
        <text x={0} y={96} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={28} fill="#24635E">ЧИСТИ ЗУБЫ</text>
      </g>

      {/* растение в углу */}
      <g transform="translate(1020,1190)">
        {[[-60, -160, -30], [10, -200, 10], [70, -150, 40], [-20, -120, -60], [50, -110, 70]].map(([lx, ly, r], i) => (
          <ellipse key={i} cx={lx} cy={ly} rx={34} ry={80} transform={`rotate(${r} ${lx} ${ly})`} fill={i % 2 ? "#3FA35B" : "#56BA6C"} stroke={INK} strokeWidth={5} />
        ))}
        <path d="M-58,-60 L58,-60 L44,40 L-44,40 Z" fill="#D9774A" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <rect x={-66} y={-74} width={132} height={22} rx={6} fill="#E58A5C" stroke={INK} strokeWidth={5} />
      </g>

      {/* лучи из окна и пятно света на полу */}
      <g style={{ mixBlendMode: "screen" }}>
        <polygon points="650,320 930,320 560,1330 470,1590 40,1590 190,1300" fill="url(#beam)" filter="url(#beamBlur)" opacity={0.75} />
        <polygon points="190,1300 560,1300 470,1590 40,1590" fill="#FFF1C9" opacity={0.28} filter="url(#soft)" />
        {Array.from({ length: 4 }, (_, i) => (
          <polygon key={i} points={`${205 - i * 30},${1320 + i * 66} ${545 - i * 22},${1320 + i * 66} ${540 - i * 24},${1340 + i * 66} ${200 - i * 32},${1340 + i * 66}`} fill="#5B4F9E" opacity={0.12} />
        ))}
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- кресло и лампа
const ChairBack: React.FC = () => (
  <g stroke={INK} strokeWidth={6} strokeLinejoin="round">
    <ellipse cx={700} cy={1512} rx={190} ry={34} fill="#5B4F9E" opacity={0.3} stroke="none" filter="url(#soft)" />
    <ellipse cx={700} cy={1500} rx={140} ry={28} fill="#C3C9D4" />
    <rect x={676} y={1280} width={48} height={220} fill="#E2E6EC" />
    <path d="M612,1010 Q700,986 788,1010 L800,1240 L600,1240 Z" fill="url(#seat)" />
    <path d="M638,1036 Q700,1022 762,1036 L770,1215 L630,1215 Z" fill="none" stroke="#4FA796" strokeWidth={5} />
    <rect x={644} y={960} width={112} height={60} rx={26} fill="url(#seat)" />
    <path d="M582,1228 L818,1228 Q832,1270 812,1282 L588,1282 Q568,1270 582,1228 Z" fill="url(#seat)" />
    <path d="M612,1290 L788,1290 L772,1412 L628,1412 Z" fill="url(#seat)" />
    <path d="M760,1302 L748,1400" stroke="#fff" strokeOpacity={0.5} strokeWidth={6} fill="none" />
    {/* плевательница справа */}
    <rect x={850} y={1130} width={16} height={150} fill="#E2E6EC" />
    <ellipse cx={870} cy={1130} rx={46} ry={16} fill="#F7F7F4" />
    <rect x={884} y={1092} width={22} height={34} rx={4} fill="#6EC0F0" />
  </g>
);

const ChairArms: React.FC = () => (
  <g stroke={INK} strokeWidth={6} strokeLinejoin="round">
    <rect x={584} y={1222} width={232} height={44} rx={20} fill="url(#seat)" />
    <path d="M604,1232 L796,1232" stroke="#fff" strokeOpacity={0.5} strokeWidth={5} />
    <rect x={548} y={1206} width={70} height={34} rx={16} fill="url(#seat)" />
    <rect x={782} y={1206} width={70} height={34} rx={16} fill="url(#seat)" />
    <path d="M560,1214 L604,1214" stroke="#fff" strokeOpacity={0.55} strokeWidth={5} />
    <path d="M794,1214 L838,1214" stroke="#fff" strokeOpacity={0.55} strokeWidth={5} />
  </g>
);

const Lamp: React.FC<{ glow: number }> = ({ glow }) => (
  <g>
    <path d="M905,-40 L905,640 Q905,700 840,730" fill="none" stroke={INK} strokeWidth={22} strokeLinecap="round" />
    <path d="M905,-40 L905,640 Q905,700 840,730" fill="none" stroke="#E9EDF2" strokeWidth={12} strokeLinecap="round" />
    <g transform="rotate(-14 770 760)">
      <ellipse cx={770} cy={760} rx={84} ry={46} fill="#EEF1F4" stroke={INK} strokeWidth={6} />
      <ellipse cx={770} cy={776} rx={62} ry={24} fill="#FFF6C8" stroke={INK} strokeWidth={5} />
    </g>
    <polygon points="712,800 830,790 900,1180 560,1180" fill="url(#cone)" opacity={0.22 * glow} filter="url(#beamBlur)" />
    <circle cx={765} cy={790} r={300} fill="url(#bloom)" opacity={0.55 * glow} style={{ mixBlendMode: "screen" }} />
  </g>
);

// бормашина в руке врача (координаты руки)
const Drill: React.FC<{ f: number; on: number }> = ({ f, on }) => (
  <g transform="rotate(-10)">
    <path d="M30,8 Q120,60 140,240" fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" />
    <path d="M30,8 Q120,60 140,240" fill="none" stroke="#6B7280" strokeWidth={7} strokeLinecap="round" />
    <rect x={-84} y={-11} width={124} height={22} rx={10} fill="#DDE3EA" stroke={INK} strokeWidth={5} />
    <rect x={-60} y={-11} width={20} height={22} fill="#4FB3A9" stroke={INK} strokeWidth={4} />
    <circle cx={-92} cy={-4} r={14} fill="#DDE3EA" stroke={INK} strokeWidth={5} />
    <line x1={-104} y1={-4} x2={-130} y2={-4} stroke={INK} strokeWidth={6} strokeLinecap="round" />
    {on > 0 && (
      <g opacity={on} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round">
        {[0, 1, 2].map((k) => {
          const a = (f * 1.9 + k * 2.1);
          return <path key={k} d={`M${-130 + 20 * Math.cos(a)},${-4 + 20 * Math.sin(a)} A20,20 0 0 1 ${-130 + 20 * Math.cos(a + 1.2)},${-4 + 20 * Math.sin(a + 1.2)}`} />;
        })}
        {f % 4 < 2 && <path d="M-150,-30 l5,12 l12,5 l-12,5 l-5,12 l-5,-12 l-12,-5 l12,-5 Z" fill="#FFE27A" strokeWidth={3} />}
      </g>
    )}
  </g>
);

// ---------------------------------------------------------------- действие (по кадру)
type Cam = { z: number; cx: number; cy: number; blur: number };

const World: React.FC<{ f: number; cam: Cam }> = ({ f, cam }) => {
  const door = lerp(f, [10, 20], [0, 1], Easing.out(Easing.cubic));

  // пациент
  const WALK0 = 16, WALK1 = 72, SIT1 = 86;
  const u = lerp(f, [WALK0, WALK1], [0, 1], Easing.linear);
  const ph = (f - WALK0) / 18 * Math.PI * 2;
  const feetY = 1178 + 262 * u, ws = 0.78 + 0.22 * u;
  let px = 228 + 242 * u, py = feetY - 172 * ws - 7 * Math.abs(Math.sin(ph)), ps = ws;
  let pose = f < WALK0 ? stand() : walk(ph, 1);
  let gaze = 0.8, face: Parameters<typeof Person>[0]["face"] = "smile";
  if (f >= WALK1) {
    const k = lerp(f, [WALK1, SIT1], [0, 1]);
    px = 470 + (700 - 470) * k; py = 1268 + (1232 - 1268) * k - Math.sin(Math.PI * k) * 90; ps = 1;
    pose = mix(walk(ph, 1), sit(), k); gaze = 0.8 * (1 - k);
  }
  const settle = f >= SIT1 ? Math.sin((f - SIT1) * 0.8) * 8 * Math.exp(-(f - SIT1) / 6) : 0;
  py += settle;
  if (f >= 91 && f < 95) face = "blink";
  if (f >= 104) gaze = 0.9;
  if (f >= 107) face = "worried";
  const A = lerp(f, [122, 150], [0, 1], Easing.linear);          // сила дрожи
  if (f >= 124) face = "terror";
  if (A > 0) { px += A * 7 * Math.sin(f * 2.9); py += A * 3 * Math.sin(f * 4.1); pose = sit(A * 14 * Math.sin(f * 2.2)); }
  const sweat = lerp(f, [110, 118], [0, 1]);
  const pTilt = A * 2.2 * Math.sin(f * 3.3);

  // врач
  const D0 = 96, D1 = 122;
  const du = lerp(f, [D0, D1], [0, 1], Easing.out(Easing.quad));
  const dph = (f - D0) / 17 * Math.PI * 2;
  let dx = 1270 - 300 * du, dy = 1490 - 172 * 1.08;
  let dpose = f < D1 ? walk(dph, -1) : stand();
  if (f >= D1 - 4) dpose = mix(dpose, stand(), lerp(f, [D1 - 4, D1 + 2], [0, 1]));
  dy -= f < D1 ? 6 * Math.abs(Math.sin(dph)) : 0;
  const lean = lerp(f, [130, 156], [0, -7]);
  dx -= lerp(f, [130, 170], [0, 26]);
  const hand: [number, number] = [lerp(f, [100, 116, 130, 152, 200], [-80, -112, -118, -112, -122]), lerp(f, [100, 116, 130, 152, 200], [-40, -150, -196, -248, -256])];
  dpose = { ...dpose, armL: { elbow: [(hand[0] - 52) / 2 - 30, (hand[1] - 116) / 2 - 10], hand } };
  const drillOn = lerp(f, [114, 120], [0, 1]);

  // капли пота разлетаются
  const drops = [];
  for (let b = 128; b < 210; b += 7) {
    const t = f - b; if (t < 0 || t > 20) continue;
    const side = ((b / 7) | 0) % 2 ? 1 : -1;
    drops.push(<path key={b} d="M0,-16 q-11,19 0,24 q11,-5 0,-24 Z" fill="#7FD3FF" stroke={INK} strokeWidth={3.5}
      transform={`translate(${px + side * (80 + 8 * t)},${py - 300 - 9 * t + 0.6 * t * t}) rotate(${side * 30})`} opacity={1 - t / 20} />);
  }
  // линии дрожи
  const shake = A > 0.2 && f % 4 < 2 ? (
    <g stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" opacity={A}>
      <path d={`M${px - 150},${py - 300} q-14,22 0,44`} /><path d={`M${px - 172},${py - 320} q-18,40 0,84`} />
      <path d={`M${px - 128},${py - 120} q-12,18 0,36`} />
    </g>
  ) : null;

  const seated = f >= SIT1 - 3;
  const z = cam.z;
  return (
    <g transform={`translate(540 960) scale(${z}) translate(${-cam.cx} ${-cam.cy})`}>
      <g filter={cam.blur ? "url(#dof)" : undefined}>
        <Room f={f} door={door} />
        <Lamp glow={lerp(f, [0, 120, 200], [0.75, 0.9, 1.1])} />
      </g>
      <ChairBack />
      {!seated && <FloorShadow x={px} y={feetY + 4} s={ps} />}
      <Person id="pat" x={px} y={py} s={ps} tilt={pTilt} body="#F2B53A" bodyDark="#D98E22" face={face} gaze={gaze}
        pose={pose} hat="cap" scarf="#E5483B" sweat={sweat} mouthOpen={(Math.sin(f * 2.5) + 1) / 2} />
      {seated && <ChairArms />}
      {shake}{drops}
      {f >= D0 && <FloorShadow x={dx} y={1494} s={1.08} />}
      {f >= D0 && (
        <Person id="doc" x={dx} y={dy} s={1.08} tilt={lean} body="#F7F8F6" bodyDark="#D5D9E2" face={f % 50 > 46 ? "blink" : "smug"}
          gaze={-0.8} pose={dpose} hat="doctor" mask>
          <g transform={`translate(${hand[0]},${hand[1]})`}><Drill f={f} on={drillOn} /></g>
        </Person>
      )}
    </g>
  );
};

const Defs: React.FC = () => (
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D3EEE5" /><stop offset="1" stopColor="#A6D8CB" /></linearGradient>
    <linearGradient id="wains" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#62B3A8" /><stop offset="1" stopColor="#4E9C92" /></linearGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2974F3" /><stop offset="1" stopColor="#7DB8FF" /></linearGradient>
    <linearGradient id="hall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2B3566" /><stop offset="1" stopColor="#4A5592" /></linearGradient>
    <linearGradient id="doorWood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#D99A5E" /><stop offset="1" stopColor="#B4733F" /></linearGradient>
    <linearGradient id="seat" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9BE3D2" /><stop offset="1" stopColor="#56B9A6" /></linearGradient>
    <linearGradient id="beam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF4D6" stopOpacity={0.9} /><stop offset="1" stopColor="#FFF4D6" stopOpacity={0} /></linearGradient>
    <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF3B8" /><stop offset="1" stopColor="#FFF3B8" stopOpacity={0} /></linearGradient>
    <radialGradient id="bloom"><stop offset="0" stopColor="#FFF0B0" /><stop offset="0.35" stopColor="#FFE08A" stopOpacity={0.45} /><stop offset="1" stopColor="#FFE08A" stopOpacity={0} /></radialGradient>
    <radialGradient id="vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.55" stopColor="#1C1638" stopOpacity={0} /><stop offset="1" stopColor="#1C1638" stopOpacity={0.42} /></radialGradient>
    <radialGradient id="warm" cx="0.85" cy="0.15" r="0.8"><stop offset="0" stopColor="#FFD9A0" stopOpacity={0.22} /><stop offset="1" stopColor="#FFD9A0" stopOpacity={0} /></radialGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" /></filter>
    <filter id="beamBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14" /></filter>
    <filter id="dof" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.6" /></filter>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={1} /><feColorMatrix type="saturate" values="0" /></filter>
  </defs>
);

const camA = (f: number): Cam => ({ z: lerp(f, [0, CUT + XF], [1.14, 1.24], Easing.linear), cx: lerp(f, [0, CUT + XF], [560, 640], Easing.linear), cy: lerp(f, [0, CUT + XF], [960, 1040], Easing.linear), blur: 0 });
const camB = (f: number): Cam => ({ z: lerp(f, [CUT, 210], [2.0, 2.22], Easing.linear), cx: lerp(f, [CUT, 210], [812, 800], Easing.linear), cy: lerp(f, [CUT, 210], [1104, 1088], Easing.linear), blur: 1 });

const Frame: React.FC<{ f: number; cam: Cam }> = ({ f, cam }) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <Defs />
    <World f={f} cam={cam} />
  </svg>
);

export const Dentist: React.FC = () => {
  const f = useCurrentFrame();
  const bOp = interpolate(f, [CUT, CUT + XF], [0, 1], cl);
  return (
    <AbsoluteFill style={{ background: "#A6D8CB" }}>
      {bOp < 1 && <Frame f={f} cam={camA(f)} />}
      {bOp > 0 && <div style={{ position: "absolute", inset: 0, opacity: bOp }}><Frame f={f} cam={camB(f)} /></div>}
      {/* общий грейд: тёплый свет сверху справа, виньетка, лёгкое зерно */}
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Defs />
        <rect width={1080} height={1920} fill="url(#warm)" style={{ mixBlendMode: "screen" }} />
        <rect width={1080} height={1920} fill="url(#vig)" />
        <rect width={1080} height={1920} filter="url(#grain)" opacity={0.05} style={{ mixBlendMode: "multiply" }} />
      </svg>
    </AbsoluteFill>
  );
};
