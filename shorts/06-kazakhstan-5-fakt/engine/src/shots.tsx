// «Қазақстан туралы 5 факт» — мультфильм, 26 сцен
import React from "react";
import { Easing } from "remotion";
import { INK, Person, walk } from "./people";
import {
  arms, Beam, Bloom, Burst, Cam, Confetti, FitText, Hero, L, P, popS, Puffs, Ring, rnd, Room, Shadow, ShotC, Sign, Sky,
  SkyClouds, Sparkle, SpeedLines, Suit, Sweat,
} from "./kit";
import { Shot } from "./film";
import { Bubble, Phone, Sun, wi } from "./mykit";

const KZ_BLUE = "#00AFCA", GOLD = "#FEC50C";

// ---------------------------------------------------------------- props
const SteppeGround: React.FC<{ y?: number; c?: [string, string] }> = ({ y = 1300, c = ["#D8B45A", "#B98E3C"] }) => (
  <g>
    <rect x={-700} y={y} width={2480} height={1500} fill={c[0]} />
    {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${-600 + i * 80 + rnd(i) * 40},${y + 30 + rnd(i + 5) * 260} l10,-26 l10,26`} fill="none" stroke={c[1]} strokeWidth={6} strokeLinecap="round" />)}
  </g>
);
const Hills: React.FC<{ y: number; c?: string; far?: boolean }> = ({ y, c = "#8E7BB8", far }) => (
  <path d={`M-700,${y} Q-300,${y - 220} 100,${y - 60} Q400,${y - 260} 760,${y - 80} Q1100,${y - 240} 1780,${y - 40} L1780,${y + 400} L-700,${y + 400} Z`} fill={c} opacity={far ? 0.6 : 1} stroke={far ? "none" : INK} strokeWidth={6} />
);
const Flag: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => {
  const wv = (k: number) => Math.sin(t * 6 - k * 3) * 18 * k;
  const pts = Array.from({ length: 9 }, (_, i) => i / 8);
  const top = pts.map((k) => `${k * 420},${wv(k)}`).join(" L");
  const bot = pts.slice().reverse().map((k) => `${k * 420},${240 + wv(k)}`).join(" L");
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <line x1={0} y1={-20} x2={0} y2={900} stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <line x1={0} y1={-20} x2={0} y2={900} stroke="#C9CDD8" strokeWidth={6} />
      <path d={`M${top} L${bot} Z`} fill={KZ_BLUE} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <g transform={`translate(220,${110 + wv(0.5)})`}>
        <circle r={46} fill={GOLD} />
        {Array.from({ length: 16 }, (_, i) => <path key={i} transform={`rotate(${i * 22.5})`} d="M-6,-54 L0,-72 L6,-54 Z" fill={GOLD} />)}
        <path d="M-90,70 Q-40,40 0,62 Q40,40 90,70 Q40,58 0,80 Q-40,58 -90,70 Z" fill={GOLD} />
      </g>
      <path d={`M24,${10 + wv(0.06)} L24,${230 + wv(0.06)}`} stroke={GOLD} strokeWidth={10} strokeDasharray="14 10" />
    </g>
  );
};
const NumCard: React.FC<{ n: number; t: number; label: string }> = ({ n, t, label }) => {
  const s = L(t, [0, 0.18], [2.4, 1], Easing.out(Easing.cubic));
  return (
    <g>
      <rect x={-700} y={-700} width={2480} height={3400} fill="#1C1638" />
      <g transform={`translate(540 860) rotate(${t * 30})`}>{Array.from({ length: 18 }, (_, i) => <path key={i} transform={`rotate(${i * 20})`} d="M0,0 L80,-1400 L-80,-1400 Z" fill={KZ_BLUE} opacity={0.18} />)}</g>
      <Bloom x={540} y={860} r={500} o={0.7} />
      <g transform={`translate(540 860) scale(${s})`}>
        <circle r={300} fill={GOLD} stroke={INK} strokeWidth={14} />
        <text x={0} y={140} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={420} fill={INK}>{n}</text>
      </g>
      <g transform={`translate(540 1300) scale(${popS(t, 0.08, 0.2)})`}><Sign x={0} y={0} w={560} h={130} text={label} fs={80} bg="#FFF3C4" /></g>
    </g>
  );
};
const Rocket: React.FC<{ x: number; y: number; s?: number; t: number; fire?: number }> = ({ x, y, s = 1, t, fire = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={8} strokeLinejoin="round">
    {fire > 0 && <g transform={`scale(1,${fire * (1 + Math.sin(t * 40) * 0.12)})`}>
      <path d="M-70,0 Q0,420 70,0 Z" fill="#F28A2E" /><path d="M-40,0 Q0,260 40,0 Z" fill="#FFD23F" strokeWidth={5} /></g>}
    <path d="M-110,0 L-160,60 L-160,-120 L-90,-200 Z" fill="#C2463F" />
    <path d="M110,0 L160,60 L160,-120 L90,-200 Z" fill="#C2463F" />
    <path d="M-90,0 L-90,-520 Q0,-760 90,-520 L90,0 Z" fill="#F4F1EA" />
    <path d="M-90,-520 Q0,-760 90,-520 Z" fill="#C2463F" />
    <circle cx={0} cy={-380} r={44} fill="#9FD8FF" />
    <rect x={-90} y={-120} width={180} height={30} fill="#C2463F" />
  </g>
);
const Sputnik: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(${t * 20})`} stroke={INK} strokeWidth={6} strokeLinecap="round">
    {[150, 165, 195, 210].map((a) => <line key={a} x1={0} y1={0} x2={Math.cos((a * Math.PI) / 180) * 300} y2={Math.sin((a * Math.PI) / 180) * 300} strokeWidth={5} />)}
    <circle r={80} fill="#C9CDD8" /><circle cx={-25} cy={-25} r={22} fill="#fff" opacity={0.7} stroke="none" />
  </g>
);
const Space: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={-700} y={-700} width={2480} height={3400} fill="#0D0B26" />
    {Array.from({ length: 90 }, (_, i) => <circle key={i} cx={-300 + rnd(i) * 1700} cy={-300 + rnd(i + 9) * 2600} r={1.5 + rnd(i + 3) * 3.5} fill="#FFF6D8" opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i))} />)}
  </g>
);
const Planet: React.FC<{ y: number }> = ({ y }) => (
  <g>
    <circle cx={540} cy={y + 1400} r={1500} fill="#2B78F2" stroke={INK} strokeWidth={10} />
    <path d={`M100,${y + 60} Q300,${y - 20} 520,${y + 40} Q700,${y + 120} 900,${y + 30} L960,${y + 200} L60,${y + 220} Z`} fill="#7CC46A" stroke={INK} strokeWidth={6} />
    <circle cx={540} cy={y + 1400} r={1520} fill="none" stroke="#9FD8FF" strokeWidth={30} opacity={0.5} />
  </g>
);
const Calendar: React.FC<{ x: number; y: number; s?: number; year: string }> = ({ x, y, s = 1, year }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={9} strokeLinejoin="round">
    <rect x={-260} y={-280} width={520} height={560} rx={30} fill="#FFFDF6" />
    <rect x={-260} y={-280} width={520} height={150} rx={30} fill="#E8484F" />
    {[-150, 150].map((cx) => <rect key={cx} x={cx - 18} y={-320} width={36} height={90} rx={12} fill="#8E93A3" />)}
    <FitText x={0} y={120} text={year} maxW={440} fs={190} />
  </g>
);
const KzMap: React.FC<{ x: number; y: number; s?: number; c?: string; glow?: number }> = ({ x, y, s = 1, c = GOLD, glow = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {glow > 0 && <ellipse rx={420} ry={260} fill={GOLD} opacity={0.3 * glow} />}
    <path d="M-380,-40 L-300,-120 L-200,-110 L-120,-190 L0,-170 L80,-220 L200,-190 L280,-130 L380,-120 L400,-30 L330,40 L360,120 L260,170 L120,150 L20,210 L-80,160 L-200,190 L-280,120 L-360,110 L-400,30 Z"
      fill={c} stroke={INK} strokeWidth={10} strokeLinejoin="round" />
  </g>
);
const Apple: React.FC<{ x: number; y: number; s?: number; c?: string; face?: boolean; beard?: boolean; rot?: number }> = ({ x, y, s = 1, c = "#E8484F", face, beard, rot = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} stroke={INK} strokeWidth={8} strokeLinejoin="round">
    <path d="M0,-90 C-60,-130 -160,-100 -160,10 C-160,120 -80,170 0,140 C80,170 160,120 160,10 C160,-100 60,-130 0,-90 Z" fill={c} />
    <path d="M0,-90 Q10,-140 30,-160" fill="none" strokeWidth={9} />
    <path d="M20,-120 Q80,-170 120,-120 Q70,-100 20,-120 Z" fill="#56BA6C" strokeWidth={6} />
    <ellipse cx={-80} cy={-30} rx={22} ry={36} fill="#fff" opacity={0.35} stroke="none" />
    {face && <g strokeWidth={7} strokeLinecap="round" fill="none">
      <circle cx={-45} cy={0} r={9} fill={INK} /><circle cx={45} cy={0} r={9} fill={INK} />
      {beard ? <><path d="M-70,-30 Q-45,-48 -20,-30 M20,-30 Q45,-48 70,-30" /><path d="M-80,50 Q-60,190 0,210 Q60,190 80,50 Q40,80 0,70 Q-40,80 -80,50 Z" fill="#F4F1EA" />
        <path d="M-30,60 Q0,46 30,60" /></> : <path d="M-30,45 Q0,70 30,45" />}
    </g>}
  </g>
);
const Mountains: React.FC<{ y: number; snow?: boolean }> = ({ y, snow = true }) => (
  <g stroke={INK} strokeWidth={8} strokeLinejoin="round">
    {[[-200, 1.0, "#6E7FB8"], [380, 1.3, "#7A8CC8"], [900, 1.1, "#6E7FB8"]].map(([x, s, c], i) => (
      <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
        <path d="M-400,0 L0,-560 L400,0 Z" fill={c as string} />
        {snow && <path d="M-110,-406 L0,-560 L110,-406 L60,-380 L20,-420 L-30,-380 Z" fill="#fff" strokeWidth={6} />}
      </g>
    ))}
  </g>
);
const AppleTree: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(${Math.sin(t * 1.5 + x) * 2})`} stroke={INK} strokeWidth={8} strokeLinejoin="round">
    <path d="M-30,0 L-20,-220 L20,-220 L30,0 Z" fill="#8A5A3B" />
    <circle cx={0} cy={-330} r={170} fill="#4E9A47" /><circle cx={-110} cy={-260} r={110} fill="#56BA6C" /><circle cx={110} cy={-270} r={110} fill="#56BA6C" />
    {[[-90, -330], [60, -400], [120, -250], [-20, -240], [-140, -220], [30, -320]].map(([ax, ay], i) => <circle key={i} cx={ax} cy={ay} r={26} fill="#E8484F" strokeWidth={6} />)}
  </g>
);
const Water: React.FC<{ y: number; t: number; c?: string }> = ({ y, t, c = "#2F86D8" }) => (
  <g>
    <rect x={-700} y={y} width={2480} height={1600} fill={c} />
    {Array.from({ length: 24 }, (_, i) => <path key={i} d={`M${-600 + (i % 8) * 300 + Math.sin(t + i) * 30},${y + 60 + Math.floor(i / 8) * 160} q30,-24 60,0 q30,24 60,0`} fill="none" stroke="#9FD8FF" strokeWidth={8} strokeLinecap="round" />)}
  </g>
);
const Seal: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x},${y + Math.sin(t * 3) * 10}) scale(${s})`} stroke={INK} strokeWidth={7} strokeLinejoin="round">
    <path d="M-160,40 Q-180,-60 -60,-90 Q60,-110 120,-40 Q160,10 140,60 Z" fill="#9AA4B8" />
    <circle cx={110} cy={-70} r={60} fill="#9AA4B8" />
    <circle cx={128} cy={-80} r={9} fill={INK} /><circle cx={92} cy={-80} r={9} fill={INK} />
    <ellipse cx={110} cy={-52} rx={14} ry={9} fill={INK} />
    <path d="M-150,30 L-220,0 L-210,60 Z" fill="#7A849A" />
  </g>
);
const Horse: React.FC<{ x: number; y: number; s?: number; t: number; c?: string; rider?: string }> = ({ x, y, s = 1, t, c = "#8A5A3B", rider }) => {
  const g = Math.sin(t * 14);
  return (
    <g transform={`translate(${x},${y + Math.abs(g) * -16}) scale(${s})`} stroke={INK} strokeWidth={7} strokeLinejoin="round">
      {[[-110, 1], [-60, -1], [90, 1], [130, -1]].map(([lx, k], i) => <line key={i} x1={lx} y1={-40} x2={lx + g * 40 * k} y2={110} strokeWidth={14} strokeLinecap="round" />)}
      <ellipse cx={0} cy={-80} rx={170} ry={80} fill={c} />
      <path d="M120,-110 L200,-260 L270,-230 L200,-90 Z" fill={c} />
      <path d="M200,-260 Q160,-200 130,-120" fill="none" stroke="#2A2233" strokeWidth={16} />
      <path d={`M-160,-100 Q-260,${-60 + g * 20} -240,40`} fill="none" stroke="#2A2233" strokeWidth={18} strokeLinecap="round" />
      <circle cx={232} cy={-226} r={7} fill={INK} />
      {rider && <g transform="translate(0,-150)"><Person id={`rd${x}`} x={0} y={0} s={0.55} body={rider} bodyDark={INK} face="happy" gaze={0.6} pose={arms([60, -40], [90, -60])}>
        <path d="M-80,-300 Q0,-400 80,-300 Q0,-320 -80,-300 Z" fill="#2A2233" stroke={INK} strokeWidth={6} /></Person></g>}
    </g>
  );
};
const Eagle: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => {
  const f = Math.sin(t * 5) * 30;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={6} strokeLinejoin="round">
      <path d={`M0,0 Q-120,${-60 - f} -260,${-20 - f} Q-150,20 0,30 Z`} fill="#5A3A28" />
      <path d={`M0,0 Q120,${-60 - f} 260,${-20 - f} Q150,20 0,30 Z`} fill="#5A3A28" />
      <circle cx={0} cy={-10} r={30} fill="#F4F1EA" /><path d="M20,-10 L50,0 L20,8 Z" fill={GOLD} />
    </g>
  );
};
const Globe: React.FC<{ x: number; y: number; r: number; spin: number; hl?: number }> = ({ x, y, r, spin, hl = 0 }) => (
  <g transform={`translate(${x},${y})`}>
    <clipPath id="globeClip"><circle r={r} /></clipPath>
    <circle r={r} fill="#2B78F2" stroke={INK} strokeWidth={10} />
    <g clipPath="url(#globeClip)">
      {[-1, 0, 1].map((k) => (
        <g key={k} transform={`translate(${((spin * 300) % (r * 2)) - r + k * r * 2} 0)`}>
          <path d={`M${-r * 0.7},${-r * 0.5} Q${-r * 0.3},${-r * 0.8} ${r * 0.1},${-r * 0.5} Q${r * 0.3},${-r * 0.1} ${-r * 0.1},${r * 0.1} Q${-r * 0.6},${0} ${-r * 0.7},${-r * 0.5} Z`} fill="#7CC46A" stroke={INK} strokeWidth={6} />
          <path d={`M${r * 0.2},${r * 0.2} Q${r * 0.6},${r * 0.1} ${r * 0.7},${r * 0.5} Q${r * 0.4},${r * 0.8} ${r * 0.2},${r * 0.2} Z`} fill="#7CC46A" stroke={INK} strokeWidth={6} />
        </g>
      ))}
    </g>
    <g transform={`scale(${hl})`}><KzMap x={0} y={-r * 0.25} s={r / 900} glow={1} /></g>
    <circle r={r} fill="none" stroke="#fff" strokeWidth={6} opacity={0.4} />
  </g>
);
const Podium: React.FC<{ t: number; w0: number }> = ({ t, w0 }) => (
  <g stroke={INK} strokeWidth={9} strokeLinejoin="round">
    <rect x={120} y={1180} width={260} height={220} fill="#C9CDD8" /><rect x={700} y={1240} width={260} height={160} fill="#D9934A" />
    <rect x={380} y={1040} width={320} height={360} fill={GOLD} />
    <FitText x={540} y={1260} text="1" maxW={200} fs={200} />
    <g transform={`translate(540 ${880}) scale(${popS(t, w0 - 0.1)})`}><KzMap x={0} y={0} s={0.45} glow={1} /></g>
  </g>
);

// ---------------------------------------------------------------- scenes
const S01: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.3, 600, 700]} b={[0.95, 540, 900]}>
    <Sky mode="dusk" />
    <Sun x={820} y={820} r={150} t={t} face={false} />
    <Hills y={1150} far c="#8E6BB8" />
    <Hills y={1300} c="#C9A24A" />
    <SteppeGround y={1380} />
    <Flag x={200} y={300} s={1.35} t={t} />
    <Eagle x={720 + t * 60} y={420} s={0.6} t={t} />
  </Cam>
);
const S02: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.4, 540, 820]} b={[1.8, 540, 760]}>
    <Room wall={["#3B3A5A", "#2A2948"]} />
    <Beam pts="340,0 740,0 880,1300 200,1300" o={0.55} />
    <Hero id="me" x={540} y={1200} s={1.35} face="smug" gaze={0.5} pose={arms([-60, -10], [22, -205])} />
    <g transform={`translate(760 520) scale(${popS(t, 0.4)})`}><circle r={110} fill="#E8484F" stroke={INK} strokeWidth={8} /><FitText x={0} y={50} text="3" maxW={120} fs={150} fill="#fff" /></g>
    <text x={760} y={340} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={120} fill={GOLD} stroke={INK} strokeWidth={5}>?</text>
  </Cam>
);
const S03: ShotC = ({ t }) => <g><NumCard n={1} t={t} label="БІРІНШІ" /></g>;
const S04: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[0.9, 540, 860]} b={[1.15, 540, 820]}>
    <Space t={t} />
    <Globe x={540} y={860} r={420} spin={t * 0.15} hl={popS(t, w(wi(3, 2)) - 0.1, 0.4)} />
    <g transform={`translate(540 1460) scale(${popS(t, w(wi(3, 5)) - 0.1)})`}>
      <circle r={110} fill={GOLD} stroke={INK} strokeWidth={9} /><FitText x={0} y={56} text="9" maxW={120} fs={160} />
      <path d="M-60,-100 L-110,-240 L-20,-200 Z M60,-100 L110,-240 L20,-200 Z" fill="#E8484F" stroke={INK} strokeWidth={7} />
    </g>
  </Cam>
);
const S05: ShotC = ({ t, d, w }) => {
  const n = L(t, [w(wi(4, 1)) - 0.1, w(wi(4, 2)) + 0.3], [0, 2.7]);
  return (
    <Cam t={t} d={d} a={[1.6, 380, 820]} b={[1.0, 540, 880]}>
      <rect x={-700} y={-700} width={2480} height={3400} fill="#E7DCC8" />
      {Array.from({ length: 14 }, (_, i) => <line key={i} x1={-700 + i * 180} y1={-700} x2={-700 + i * 180} y2={2700} stroke="#D5C7AE" strokeWidth={4} />)}
      <KzMap x={540} y={820} s={1.15} />
      <Shadow x={200 + t * 80} y={830} s={0.5} />
      <Hero id="w" x={200 + t * 80} y={760} s={0.3} face="worried" gaze={0.6} pose={walk(t * 4)} sweat={1} />
      <g transform="translate(540 1300)"><rect x={-300} y={-90} width={600} height={180} rx={24} fill="#2A2233" stroke={INK} strokeWidth={8} />
        <FitText x={0} y={34} text={`${n.toFixed(1).replace(".", ",")} млн км²`} maxW={540} fs={100} fill="#7CFF8A" /></g>
    </Cam>
  );
};
const S06: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 980]} b={[1.12, 700, 960]}>
    <Sky mode="day" /><SkyClouds x={300} y={400} s={1.2} />
    <SteppeGround y={1150} />
    <g stroke={INK} strokeWidth={6}>{Array.from({ length: 8 }, (_, i) => <line key={i} x1={760} y1={1150 + i * 60} x2={760} y2={1180 + i * 60} />)}</g>
    <Shadow x={420} y={1440} s={1.3} />
    <Hero id="me" x={420} y={1220} s={1.1} face={t > w(wi(5, 4)) ? "sad" : "look"} gaze={0.7} pose={arms([-60, -10], [120, -240])} />
    <g transform={`translate(860 760) scale(${popS(t, w(wi(5, 1)) - 0.1)})`}>
      <Bubble x={0} y={0} s={0.7} tail={[-170, 230]}><path d="M-120,0 q30,-30 60,0 q30,30 60,0 q30,-30 60,0" fill="none" stroke="#2F86D8" strokeWidth={14} strokeLinecap="round" />
        <g stroke="#E8484F" strokeWidth={16} strokeLinecap="round"><line x1={-110} y1={-90} x2={110} y2={90} /><line x1={110} y1={-90} x2={-110} y2={90} /></g></Bubble>
    </g>
  </Cam>
);
const S07: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.15, 540, 1000]} b={[1.0, 540, 980]}>
    <Room wall={["#3B3A5A", "#2A2948"]} />
    <Beam pts="380,0 700,0 760,1300 320,1300" o={0.7} />
    <Podium t={t} w0={0} />
    <Confetti x={540} y={500} t={t} n={40} />
  </Cam>
);
const S08: ShotC = ({ t }) => <g><NumCard n={2} t={t} label="ЕКІНШІ" /></g>;
const S09: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[0.95, 540, 900]} b={[1.2, 540, 760]}>
    <Sky mode="night" />
    <Hills y={1250} far c="#3A3F8F" />
    <SteppeGround y={1330} c={["#5A4E7A", "#463C66"]} />
    <Beam pts="200,1330 280,1330 600,0 400,0" o={0.35} /><Beam pts="860,1330 940,1330 760,0 600,0" o={0.35} />
    <g stroke={INK} strokeWidth={7}><rect x={330} y={420} width={60} height={920} fill="#C2463F" />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={330} y1={440 + i * 75} x2={390} y2={500 + i * 75} strokeWidth={4} />)}</g>
    <Rocket x={540} y={1330} s={1.15} t={t} />
  </Cam>
);
const S10: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 1000]} b={[1.12, 540, 940]}>
    <Sky mode="dusk" />
    <SteppeGround y={1250} />
    {[[140, 0.7], [900, 0.8]].map(([x, s], i) => <Rocket key={i} x={x} y={1250} s={s} t={t} />)}
    <g stroke={INK} strokeWidth={8} strokeLinejoin="round">
      <rect x={300} y={980} width={480} height={270} fill="#E7DCC8" />
      <path d="M280,980 L540,860 L800,980 Z" fill="#8E93A3" />
      {[360, 480, 600, 720].map((x) => <rect key={x} x={x - 30} y={1040} width={60} height={70} fill="#FFE08A" />)}
    </g>
    <g transform={`translate(540 560) scale(${popS(t, 0.2)})`}><Sign x={0} y={0} w={680} h={170} text="БАЙҚОҢЫР" fs={120} bg={GOLD} /></g>
    <g transform={`translate(540 740) scale(${popS(t, 1.2)})`}><Sign x={0} y={0} w={520} h={90} text="ҒАРЫШ АЙЛАҒЫ №1" fs={56} bg="#FFF3C4" /></g>
  </Cam>
);
const S11: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.2, 540, 900]} b={[1.0, 540, 900]}>
    <Room wall={["#E9C9A0", "#C99F73"]} />
    <g transform={`rotate(${L(t, [0, 0.4], [-20, 0], Easing.out(Easing.back(2)))} 540 860)`}><Calendar x={540} y={860} s={1.3} year="1957" /></g>
  </Cam>
);
const S12: ShotC = ({ t, d }) => {
  const up = L(t, [0, d], [0, 1], Easing.in(Easing.quad));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 1000]} b={[1.0, 540, 1000]} shake={up < 0.5 ? 8 : 0}>
      {up < 0.45 ? (
        <g>
          <Sky mode="dusk" />
          <SteppeGround y={1400} />
          <Puffs x={540} y={1400} t={t} n={14} c="#EADFC9" size={1.2} life={1.2} spread={700} />
          <Rocket x={540} y={1400 - up * 2400} s={1.0} t={t} fire={1} />
          <SpeedLines x={540} y={900} t={t} n={14} r0={500} r1={1000} o={0.3} />
        </g>
      ) : (
        <g>
          <Space t={t} />
          <Planet y={1500} />
          <Sputnik x={540} y={800} s={1.2 * L(up, [0.45, 0.6], [0.3, 1])} t={t} />
          <Ring x={540} y={800} t={(t * 0.8) % 1} r={260} c="#9FD8FF" />
        </g>
      )}
    </Cam>
  );
};
const S13: ShotC = ({ t, d, w }) => {
  const g = w(wi(12, 3));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.25, 540, 760]}>
      <Space t={t} />
      <Planet y={1550} />
      <g transform={`translate(260 380) scale(${t < g ? 0.7 : 0.45})`}><Calendar x={0} y={0} year="1961" /></g>
      <g transform={`translate(${560 + Math.sin(t) * 20} ${900 + Math.cos(t * 0.8) * 20}) rotate(${Math.sin(t * 0.7) * 10})`}>
        <Person id="cosmo" x={0} y={0} s={1.3} body="#F4F1EA" bodyDark="#C8C3B8" face="happy" gaze={0} pose={t > g ? arms([-60, -10], [130, -320 + Math.sin(t * 8) * 20]) : P.stand()}>
          <circle cx={0} cy={-238} r={128} fill="#9FD8FF" fillOpacity={0.35} stroke={INK} strokeWidth={9} />
          <rect x={-40} y={-120} width={80} height={40} rx={8} fill="#C2463F" stroke={INK} strokeWidth={5} />
          <FitText x={0} y={-92} text="СССР" maxW={70} fs={22} fill="#fff" />
        </Person>
      </g>
      {t > g && <g transform={`translate(540 1500) scale(${popS(t, g)})`}><Sign x={0} y={0} w={560} h={120} text="ЮРИЙ ГАГАРИН" fs={70} bg={GOLD} /></g>}
    </Cam>
  );
};
const S14: ShotC = ({ t }) => <g><NumCard n={3} t={t} label="ҮШІНШІ" /></g>;
const S15: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 880]} b={[1.12, 540, 860]}>
    <Sky mode="day" /><SkyClouds x={250} y={300} s={1.2} />
    <KzMap x={540} y={1100} s={1.1} c="#7CC46A" glow={0.6} />
    <g transform={`translate(540 ${720 + Math.sin(t * 3) * 15}) scale(${popS(t, 0.1) * 1.4})`}><Apple x={0} y={0} face /></g>
    <Sparkle x={300} y={560} s={1} /><Sparkle x={800} y={620} s={1.2} />
  </Cam>
);
const S16: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.12, 540, 900]}>
    <Room wall={["#E9E3C9", "#CFC6A0"]} />
    <rect x={120} y={1100} width={840} height={60} rx={10} fill="#8A5A3B" stroke={INK} strokeWidth={8} />
    <g stroke={INK} strokeWidth={8}><rect x={440} y={760} width={70} height={340} fill="#5A5470" /><rect x={400} y={1060} width={160} height={50} fill="#5A5470" /><circle cx={475} cy={740} r={40} fill="#9FD8FF" /></g>
    <Apple x={680} y={1020} s={0.5} />
    <Shadow x={240} y={1480} s={1.2} /><Shadow x={860} y={1480} s={1.2} />
    <Person id="sc1" x={240} y={1260} s={1.0} body="#FFFFFF" bodyDark="#C8C3B8" hat="doctor" face="look" gaze={0.6} pose={P.pointR()} />
    <Person id="sc2" x={860} y={1260} s={1.0} body="#FFFFFF" bodyDark="#C8C3B8" hat="doctor" face="happy" gaze={-0.6} pose={P.up()} />
    <text x={680} y={820} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={130} fill={GOLD} stroke={INK} strokeWidth={6}>!</text>
  </Cam>
);
const S17: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[0.95, 540, 900]} b={[1.4, 540, 820]}>
    <Sky mode="day" /><SkyClouds x={250} y={300} s={1.2} />
    <Mountains y={1200} />
    <rect x={-700} y={1200} width={2480} height={1500} fill="#7CC46A" />
    <g transform={`translate(540 ${860 + Math.sin(t * 2) * 10}) scale(1.6)`}><Apple x={0} y={0} face beard c="#8DC43F" /></g>
    <Bloom x={540} y={860} r={350} o={0.35} />
  </Cam>
);
const S18: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.2, 400, 1000]} b={[1.0, 640, 960]}>
    <Sky mode="day" /><SkyClouds x={250} y={300} s={1.2} />
    <Mountains y={1050} />
    <path d="M-700,1050 Q300,900 1780,1100 L1780,2600 L-700,2600 Z" fill="#7CC46A" stroke={INK} strokeWidth={8} />
    {Array.from({ length: 10 }, (_, i) => <AppleTree key={i} x={-300 + i * 200} y={1180 + (i % 2) * 140} s={0.6 + (i % 3) * 0.1} t={t} />)}
    <Horse x={620 - t * 40} y={1500} s={0.7} t={t * 0.4} c="#B97A52" />
  </Cam>
);
const S19: ShotC = ({ t }) => <g><NumCard n={4} t={t} label="ТӨРТІНШІ" /></g>;
const S20: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[0.9, 540, 900]} b={[1.1, 540, 960]}>
    <Sky mode="day" /><SkyClouds x={250} y={300} s={1.3} /><SkyClouds x={900} y={420} s={1} />
    <Water y={820} t={t} />
    <Seal x={540} y={1150} s={1.3} t={t} />
    <g transform={`translate(540 520) scale(${popS(t, 0.2)})`}><Sign x={0} y={0} w={560} h={150} text="КАСПИЙ" fs={110} bg="#FFF3C4" /></g>
  </Cam>
);
const S21: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 300, 960]} b={[1.0, 780, 960]}>
    <Sky mode="dusk" /><Sun x={900} y={700} r={120} t={t} face={false} />
    <Water y={1000} t={t} c="#5E7FD0" />
    <path d="M-700,1250 Q200,1120 700,1240 Q1200,1340 1780,1220 L1780,2600 L-700,2600 Z" fill="#E9C46A" stroke={INK} strokeWidth={8} />
    <Flag x={220} y={560} s={0.75} t={t} />
    <Shadow x={640} y={1480} s={1.1} />
    <Hero id="me" x={640} y={1290} s={0.95} face="happy" gaze={0.6} pose={P.up()} />
  </Cam>
);
const Japan: React.FC = () => (
  <g fill="#7CC46A" stroke={INK} strokeWidth={6} strokeLinejoin="round">
    <path d="M-20,-120 Q40,-150 60,-100 Q40,-60 0,-70 Z" /><path d="M-60,-40 Q20,-80 40,-20 Q10,60 -60,90 Q-90,40 -60,-40 Z" /><path d="M-110,100 Q-70,90 -60,130 Q-100,150 -120,130 Z" />
  </g>
);
const S22: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 1000]} b={[1.08, 540, 980]}>
    <Room wall={["#B9C6F0", "#8E9BD0"]} />
    <g stroke={INK} strokeWidth={9} strokeLinejoin="round">
      <path d="M440,1450 L640,1450 L560,1100 L520,1100 Z" fill="#8A5A3B" />
      <rect x={120} y={1085} width={840} height={30} rx={10} fill="#B97A52" />
      {[220, 860].map((x) => <g key={x}><line x1={x} y1={1100} x2={x} y2={1170} strokeWidth={6} /><ellipse cx={x} cy={1180} rx={160} ry={28} fill="#C9CDD8" /></g>)}
    </g>
    <g transform="translate(220 1060) scale(1.25)"><path d="M-110,0 Q-120,-180 -40,-250 Q20,-300 60,-220 Q140,-120 110,0 Z" fill="#2F86D8" stroke={INK} strokeWidth={7} /></g>
    <g transform={`translate(860 1000) scale(${popS(t, w(wi(21, 3)) - 0.1) * 2.6})`}><Japan /></g>
    <FitText x={220} y={1300} text="КАСПИЙ" maxW={280} fs={56} />
    <g transform={`scale(${popS(t, w(wi(21, 3)) - 0.1)})`} style={{ transformOrigin: "860px 1300px" }}><FitText x={860} y={1300} text="ЖАПОНИЯ" maxW={280} fs={56} /></g>
    <text x={540} y={760} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={200} fill={GOLD} stroke={INK} strokeWidth={8}>≈</text>
  </Cam>
);
const S23: ShotC = ({ t }) => <g><NumCard n={5} t={t} label="БЕСІНШІ" /></g>;
const S24: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.35, 540, 1100]} b={[0.85, 540, 900]}>
    <Sky mode="dusk" />
    <Sun x={540} y={1050} r={180} t={t} face={false} />
    <Hills y={1120} far c="#8E6BB8" />
    <SteppeGround y={1200} />
    <Eagle x={300 + t * 80} y={500} s={0.8} t={t} />
    {[[-100, "#E8484F"], [260, "#2FA39A"], [620, "#F2C55C"]].map(([x, c], i) => (
      <g key={i}><Puffs x={(x as number) + t * 260 - 150} y={1380} t={t + i} n={5} c="#E3CB8A" size={0.5} life={0.8} />
        <Horse x={(x as number) + t * 260} y={1380 + i * 30} s={0.7} t={t + i * 0.3} c={["#8A5A3B", "#2A2233", "#B97A52"][i]} rider={c as string} /></g>
    ))}
  </Cam>
);
const S25: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.25, 540, 820]}>
    <Room wall={["#3B3A5A", "#2A2948"]} />
    {[1, 2, 3, 4, 5].map((n, i) => (
      <g key={n} transform={`translate(${170 + i * 185} ${420 + Math.sin(t * 3 + i) * 20}) scale(${popS(t, i * 0.12)})`}>
        <circle r={74} fill={GOLD} stroke={INK} strokeWidth={7} /><FitText x={0} y={34} text={`${n}`} maxW={80} fs={100} />
      </g>
    ))}
    <Hero id="me" x={540} y={1200} s={1.3} face="shock" gaze={0} pose={P.up()} />
  </Cam>
);
const S26: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.2, 540, 820]} b={[1.4, 540, 780]}>
    <Room wall={["#B9C6F0", "#8E9BD0"]} />
    <Hero id="me" x={420} y={1200} s={1.2} face="happy" gaze={0.5} pose={P.hold([130, -170])}>
      <g transform="translate(130,-170) scale(0.5)"><Phone x={0} y={0} /></g>
    </Hero>
    <g transform={`translate(760 560) scale(${popS(t, 0.2)})`}>
      <path d="M-200,-120 L200,-120 Q240,-120 240,-80 L240,80 Q240,120 200,120 L-60,120 L-140,190 L-120,120 L-200,120 Q-240,120 -240,80 L-240,-80 Q-240,-120 -200,-120 Z" fill="#fff" stroke={INK} strokeWidth={9} />
      {[-90, 0, 90].map((x, i) => <circle key={x} cx={x} cy={0} r={24 * (0.6 + 0.4 * Math.abs(Math.sin(t * 6 + i)))} fill={INK} />)}
    </g>
  </Cam>
);

export const SHOTS: Shot[] = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24, S25, S26].map((C) => ({ C }));
