// «Эйфель мұнарасы жазда өседі» — 20 сцен
import React from "react";
import { Easing } from "remotion";
import { INK, Person } from "./people";
import {
  arms, Bloom, Cam, Confetti, FitText, Hero, L, P, popS, Puffs, rnd, Room, Shadow, ShotC, Sign, Sky, SkyClouds,
  Sparkle, Sweat,
} from "./kit";
import { Shot } from "./film";
import { Arrow, Bubble, Grass, Sun, Thermo, Tower, wi } from "./mykit";

const Park: React.FC<{ mode?: "day" | "dusk" | "night"; ground?: string }> = ({ mode = "day", ground = "#7CC46A" }) => (
  <g>
    <Sky mode={mode} />
    {mode === "day" && <><SkyClouds x={150} y={500} s={1.2} /><SkyClouds x={950} y={300} s={0.9} /></>}
    <Grass y={1500} c={ground} />
  </g>
);
const Flower: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={6}>
    <line x1={0} y1={0} x2={0} y2={180} stroke="#3E7A32" strokeWidth={10} />
    {Array.from({ length: 6 }, (_, i) => <ellipse key={i} transform={`rotate(${i * 60})`} cx={0} cy={-48} rx={28} ry={44} fill="#F2A0C0" />)}
    <circle r={32} fill="#FFD23F" />
  </g>
);
const Beam1: React.FC<{ x: number; y: number; len: number; hot?: number }> = ({ x, y, len, hot = 0 }) => (
  <g transform={`translate(${x},${y})`} stroke={INK} strokeWidth={8} strokeLinejoin="round">
    <rect x={-len / 2} y={-50} width={len} height={100} rx={8} fill={hot > 0.5 ? "#E8743F" : "#8A5A3B"} />
    {Array.from({ length: Math.floor(len / 90) }, (_, i) => <circle key={i} cx={-len / 2 + 45 + i * 90} cy={0} r={12} fill="#5A3A28" strokeWidth={4} />)}
  </g>
);
const Flame: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s},${s * (1 + Math.sin(t * 20) * 0.08)})`} stroke={INK} strokeWidth={6} strokeLinejoin="round">
    <path d="M0,0 C-90,-40 -60,-140 0,-220 C20,-150 90,-120 70,-40 C60,-10 30,0 0,0 Z" fill="#F28A2E" />
    <path d="M0,0 C-40,-20 -30,-80 0,-120 C10,-80 40,-60 30,-20 Z" fill="#FFD23F" strokeWidth={4} />
  </g>
);
const Scale: React.FC<{ t: number }> = ({ t }) => (
  <g stroke={INK} strokeWidth={9} strokeLinejoin="round">
    <rect x={160} y={1280} width={760} height={200} rx={20} fill="#8E93A3" />
    <rect x={120} y={1240} width={840} height={50} rx={10} fill="#C9CDD8" />
    <rect x={360} y={1320} width={360} height={110} rx={12} fill="#2A2233" />
    <FitText x={540} y={1400} text={`${Math.round(L(t, [0.2, 1.4], [0, 7300]))} т`} maxW={320} fs={80} fill="#7CFF8A" />
  </g>
);
const Bridge: React.FC<{ gap: number }> = ({ gap }) => (
  <g stroke={INK} strokeWidth={8} strokeLinejoin="round">
    <rect x={-700} y={1050} width={1230 - gap / 2} height={90} fill="#8A5A3B" />
    <rect x={550 + gap / 2} y={1050} width={1230} height={90} fill="#8A5A3B" />
    {[100, 980].map((x) => <rect key={x} x={x - 50} y={1140} width={100} height={500} fill="#B97A52" />)}
    <path d="M-700,1700 Q540,1560 1780,1700 L1780,2400 L-700,2400 Z" fill="#5FB6E8" />
  </g>
);
const Rails: React.FC<{ bend: number; t: number }> = ({ bend, t }) => {
  const y = (x: number, o: number) => 1200 + o + Math.sin((x - 540) / 120) * 90 * bend * Math.exp(-Math.pow((x - 540) / 300, 2));
  const pts = (o: number) => Array.from({ length: 50 }, (_, i) => { const x = -300 + i * 36; return `${i ? "L" : "M"}${x},${y(x, o)}`; }).join(" ");
  return (
    <g>
      {Array.from({ length: 24 }, (_, i) => { const x = -300 + i * 72; return <rect key={i} x={x - 18} y={y(x, -40) - 10} width={36} height={180} fill="#8A5A3B" stroke={INK} strokeWidth={5} />; })}
      <path d={pts(0)} fill="none" stroke={INK} strokeWidth={22} /><path d={pts(0)} fill="none" stroke="#C9CDD8" strokeWidth={10} />
      <path d={pts(110)} fill="none" stroke={INK} strokeWidth={22} /><path d={pts(110)} fill="none" stroke="#C9CDD8" strokeWidth={10} />
      {bend > 0.5 && <Puffs x={540} y={1200} t={t} n={6} c="#D8D2C8" size={0.6} life={1} />}
    </g>
  );
};

const S01: ShotC = ({ t, d, w }) => {
  const g = L(t, [w(wi(0, 3)) - 0.2, w(wi(0, 3)) + 0.3], [0, 0.06], Easing.out(Easing.back(3)));
  return (
    <Cam t={t} d={d} a={[0.95, 540, 900]} b={[1.05, 540, 860]}>
      <Park />
      <Sun x={880} y={300} r={90} t={t} />
      <Tower x={540} y={1520} h={1150} grow={g} />
    </Cam>
  );
};
const S02: ShotC = ({ t, d }) => {
  const g = L(t, [0.3, d - 0.3], [0, 0.12]);
  return (
    <Cam t={t} d={d} a={[1.8, 640, 520]} b={[2.1, 640, 460]}>
      <Park />
      <Tower x={540} y={1520} h={1150} grow={g} />
      <g stroke={INK} strokeWidth={6}>
        <rect x={680} y={180} width={70} height={500} fill="#FFE04A" />
        {Array.from({ length: 13 }, (_, i) => <line key={i} x1={680} y1={200 + i * 36} x2={i % 5 ? 710 : 730} y2={200 + i * 36} strokeWidth={4} />)}
      </g>
      <g transform={`translate(800 ${300}) scale(${popS(t, 0.8)})`}><Sign x={0} y={0} w={160} h={70} text="+15 см" fs={40} bg="#E8484F" fg="#fff" /></g>
    </Cam>
  );
};
const S03: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.2, 540, 1300]} b={[0.9, 540, 950]}>
    <Park />
    <Tower x={540} y={1520} h={1150} />
    {[300, 380, 720, 800].map((x, i) => <Person key={i} id={`tt${i}`} x={x} y={1500} s={0.15} body={["#E8484F", "#4F6BD8", "#F2C55C", "#56BA6C"][i]} bodyDark={INK} face="smile" pose={P.stand()} />)}
    <g stroke={INK} strokeWidth={6}><line x1={950} y1={280} x2={950} y2={1500} /><line x1={920} y1={280} x2={980} y2={280} /><line x1={920} y1={1500} x2={980} y2={1500} /></g>
    <g transform={`translate(950 880) scale(${popS(t, 0.5)})`}><Sign x={0} y={0} w={200} h={90} text="330 м" fs={56} /></g>
  </Cam>
);
const S04: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 1000]} b={[1.12, 540, 1000]} shake={2}>
    <Park />
    <g transform="translate(540 0) scale(0.55) translate(-540 0)"><Tower x={540} y={1100} h={1100} /></g>
    {[[230, "#E8484F", 0.5], [540, "#F2C55C", 0], [850, "#7B61FF", -0.5]].map(([x, c, g], i) => (
      <g key={i}><Shadow x={x as number} y={1650} s={1} />
        <Person id={`tr${i}`} x={x as number} y={1440 + Math.abs(Math.sin(t * 14 + i)) * -16} s={0.95} body={c as string} bodyDark={INK} face="happy" gaze={g as number} pose={i === 1 ? P.pointR() : P.hug()}>
          {i === 0 && <g><rect x={30} y={-200} width={70} height={50} rx={8} fill="#2A2233" stroke={INK} strokeWidth={5} /><circle cx={65} cy={-175} r={14} fill="#9FD8FF" /></g>}
        </Person></g>
    ))}
    <g transform={`translate(780 480) scale(${popS(t, w(wi(3, 5)) - 0.1)})`}><Bubble x={0} y={0} s={0.7} tail={[-140, 230]}><Flower x={0} y={-10} s={0.9} /></Bubble></g>
  </Cam>
);
const S05: ShotC = ({ t, d, w }) => {
  const x = popS(t, w(wi(4, 3)) - 0.1);
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.12, 540, 860]}>
      <Room wall={["#3B2C4E", "#2A2240"]} />
      <Sparkle x={300} y={500} s={1} /><Sparkle x={780} y={420} s={0.8} />
      <g transform="translate(540 820)" stroke={INK} strokeWidth={9} strokeLinejoin="round">
        <ellipse cx={0} cy={140} rx={260} ry={60} fill="#2A2233" />
        <path d="M-150,130 L-110,-260 L110,-260 L150,130 Z" fill="#2A2233" />
        <rect x={-150} y={60} width={300} height={50} fill="#E8484F" />
      </g>
      <g transform={`translate(540 760) scale(${x})`} stroke="#E8484F" strokeWidth={50} strokeLinecap="round">
        <line x1={-300} y1={-300} x2={300} y2={300} /><line x1={300} y1={-300} x2={-300} y2={300} />
      </g>
    </Cam>
  );
};
const S06: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.08, 540, 920]} shake={t > 0.15 && t < 0.4 ? 10 : 0}>
    <Room wall={["#B9C6F0", "#8E9BD0"]} />
    <g transform="translate(540 0) scale(0.75) translate(-540 0)"><Tower x={540} y={1650} h={1100} /></g>
    <Scale t={t} />
  </Cam>
);
const S07: ShotC = ({ t, d }) => {
  const hot = L(t, [0.3, d - 0.3], [0, 1]);
  return (
    <Cam t={t} d={d} a={[1.2, 540, 900]} b={[1.4, 540, 860]}>
      <Room wall={["#F2D3C2", "#D9A98F"]} />
      <Bloom x={540} y={900} r={350} o={0.5 * hot} c="O" />
      <Beam1 x={540} y={760} len={500 + hot * 120} hot={hot} />
      <Arrow x1={540 + 250} y1={760} x2={540 + 370 + hot * 60} y2={760} p={hot} c="#FFE04A" w={22} />
      <Arrow x1={540 - 250} y1={760} x2={540 - 370 - hot * 60} y2={760} p={hot} c="#FFE04A" w={22} />
      <Flame x={540} y={1100} t={t} s={1.2} />
    </Cam>
  );
};
const S08: ShotC = ({ t, d }) => {
  const k = L(t, [0.2, d], [0, 1]);
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.1, 540, 920]}>
      <Park ground="#C9B65A" />
      <Sun x={540} y={420} r={150} t={t} />
      <Thermo x={180} y={1200} s={1.2} v={0.4 + k * 0.6} />
      <Beam1 x={600} y={1050} len={480 + k * 100} hot={k} />
      <Sweat x={790} y={900} s={1.4} />
    </Cam>
  );
};
const S09: ShotC = ({ t, d }) => {
  const n = Math.round(L(t, [0, d * 0.8], [0, 18038], Easing.out(Easing.quad)));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.1, 540, 900]}>
      <Room wall={["#7C8FD0", "#5968A8"]} />
      {Array.from({ length: Math.min(60, Math.floor(n / 300)) }, (_, i) => (
        <rect key={i} x={120 + (i % 10) * 85} y={1300 - Math.floor(i / 10) * 40} width={70} height={30} rx={4} fill="#8A5A3B" stroke={INK} strokeWidth={4} />
      ))}
      <g transform="translate(540 520)">
        <rect x={-320} y={-110} width={640} height={220} rx={24} fill="#2A2233" stroke={INK} strokeWidth={9} />
        <FitText x={0} y={50} text={n.toLocaleString("ru-RU")} maxW={560} fs={140} fill="#7CFF8A" />
      </g>
    </Cam>
  );
};
const S10: ShotC = ({ t, d }) => {
  const g = L(t, [0.2, d - 0.2], [0, 0.1]);
  return (
    <Cam t={t} d={d} a={[1.0, 540, 1000]} b={[1.3, 540, 500]}>
      <Park />
      <Sun x={880} y={260} r={90} t={t} />
      <Tower x={540} y={1520} h={1150} grow={g} />
      <Arrow x1={680} y1={420} x2={680} y2={160} p={L(t, [0.3, 1], [0, 1])} c="#56BA6C" />
    </Cam>
  );
};
const S11: ShotC = ({ t, d, w }) => {
  const noon = L(t, [w(wi(10, 2)) - 0.3, w(wi(10, 2)) + 0.4], [0, 1]);
  return (
    <Cam t={t} d={d} a={[0.95, 540, 950]} b={[1.0, 540, 900]}>
      <Park mode={noon > 0.5 ? "day" : "dusk"} />
      <Sun x={140 + noon * 400} y={1200 - noon * 950} r={90} t={t} />
      <Tower x={540} y={1520} h={1100 + noon * 70} />
      <g transform={`translate(880 1650)`}><Sign x={0} y={0} w={280} h={90} text={noon > 0.5 ? "ТҮС" : "ТАҢ"} fs={56} bg={noon > 0.5 ? "#FFE04A" : "#F2A0C0"} /></g>
    </Cam>
  );
};
const S12: ShotC = ({ t, d }) => {
  const b = Math.sin(t * 3.2) * 0.5 + 0.5;
  return (
    <Cam t={t} d={d} a={[1.4, 540, 600]} b={[1.6, 540, 520]}>
      <Park />
      <Tower x={540} y={1520} h={1100 + b * 50} />
      <g transform={`translate(540 ${880 - b * 50})`} stroke={INK} strokeWidth={7} strokeLinecap="round" fill="none">
        <path d="M-60,-20 Q-40,-36 -20,-20" /><path d="M20,-20 Q40,-36 60,-20" />
        <ellipse cx={0} cy={30} rx={18} ry={6 + b * 14} fill="#6B2236" />
      </g>
      {[0, 1].map((i) => <path key={i} d={`M${640 + i * 30},${820 - b * 50} q30,-10 50,-40`} fill="none" stroke="#fff" strokeWidth={8} opacity={b} strokeLinecap="round" />)}
    </Cam>
  );
};
const HalfLit: React.FC<{ lean?: number; grow?: number }> = ({ lean = 0, grow = 0 }) => (
  <g>
    <Tower x={540} y={1520} h={1150} lean={lean} grow={grow} />
    <clipPath id="lit"><rect x={-700} y={-700} width={1240} height={3000} /></clipPath>
    <g clipPath="url(#lit)" opacity={0.35} style={{ mixBlendMode: "screen" }}><Tower x={540} y={1520} h={1150} lean={lean} grow={grow} c="#FFD23F" /></g>
  </g>
);
const S13: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.08, 520, 880]}>
    <Park />
    <Sun x={120} y={500} r={100} t={t} />
    {[0, 1, 2, 3].map((i) => <line key={i} x1={220} y1={520 + i * 60} x2={420} y2={600 + i * 120} stroke="#FFD23F" strokeWidth={12} strokeLinecap="round" opacity={0.7} />)}
    <HalfLit />
  </Cam>
);
const S14: ShotC = ({ t, d }) => {
  const k = L(t, [0.2, d - 0.3], [0, 1]);
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.2, 600, 700]}>
      <Park />
      <Sun x={120} y={500} r={100} t={t} />
      <HalfLit lean={k * 0.9} />
      <Arrow x1={700} y1={300} x2={860} y2={300} p={k} c="#E8484F" w={20} />
    </Cam>
  );
};
const S15: ShotC = ({ t, d }) => {
  const a = L(t, [0, d], [0, Math.PI * 1.6]);
  const sx = 540 - Math.cos(a) * 420, sy = 520 - Math.sin(a) * 260;
  const tip = (b: number) => [540 + Math.cos(b) * 40, 330 + Math.sin(b) * 16];
  const trail = Array.from({ length: 40 }, (_, i) => tip((a * i) / 39)).map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  return (
    <Cam t={t} d={d} a={[1.15, 540, 700]} b={[1.4, 540, 560]}>
      <Park />
      <Sun x={sx} y={sy} r={60} t={t} />
      <Tower x={540} y={1520} h={1150} lean={Math.cos(a) * 0.3} />
      <path d={trail} fill="none" stroke="#E8484F" strokeWidth={6} strokeDasharray="10 8" />
    </Cam>
  );
};
const S16: ShotC = ({ t, d }) => {
  const k = L(t, [0.2, d - 0.2], [0, 1]);
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.08, 540, 920]}>
      <Park mode="night" ground="#F4F6FA" />
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={rnd(i) * 1080} cy={(rnd(i + 3) * 1900 + t * 120) % 1900} r={6 + rnd(i) * 6} fill="#fff" />)}
      <Tower x={540} y={1520} h={1150 - k * 60} c="#7A5A4B" />
      <Thermo x={160} y={1350} s={1.1} v={0.5 - k * 0.4} />
    </Cam>
  );
};
const S17: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 1000]} b={[1.6, 540, 1080]}>
    <Sky mode="day" /><SkyClouds x={200} y={400} s={1.2} />
    <Bridge gap={40} />
    <circle cx={540} cy={1095} r={70} fill="none" stroke="#E8484F" strokeWidth={8} strokeDasharray="14 10" opacity={popS(t, 0.4)} />
  </Cam>
);
const S18: ShotC = ({ t, d }) => {
  const b = L(t, [0.3, 1.0], [0, 1], Easing.out(Easing.back(2)));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 1100]} b={[1.1, 540, 1150]} shake={b > 0.2 && t < 1.3 ? 6 : 0}>
      <Sky mode="day" />
      <Grass y={1100} c="#C9B65A" />
      <Sun x={850} y={350} r={100} t={t} />
      <Rails bend={b} t={t} />
    </Cam>
  );
};
const S19: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.15, 540, 900]}>
    <Room wall={["#F2D3C2", "#D9A98F"]} />
    <g stroke={INK} strokeWidth={6}><rect x={240} y={420} width={60} height={1060} fill="#FFE04A" />
      {Array.from({ length: 20 }, (_, i) => <line key={i} x1={240} y1={440 + i * 52} x2={i % 5 ? 270 : 290} y2={440 + i * 52} strokeWidth={4} />)}</g>
    <Shadow x={420} y={1470} s={1.3} />
    <Hero id="me" x={420} y={1230} s={1.15} face="smug" gaze={-0.3} pose={arms([-110, -320], [90, -10])} />
    <Shadow x={800} y={1470} s={1.3} />
    <Person id="fr" x={800} y={1230} s={1.15} body="#E8484F" bodyDark="#B23A3F" face={t > w(wi(18, 6)) ? "smug" : "look"} gaze={-0.6} pose={arms([-30, -100], [30, -100])} />
  </Cam>
);
const S20: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 950]} b={[1.6, 540, 520]}>
    <Park mode="dusk" />
    <Tower x={540} y={1520} h={1150} grow={0.05} />
    <g transform="translate(540 600)">
      <rect x={-90} y={-30} width={80} height={44} rx={16} fill="#15131C" stroke={INK} strokeWidth={5} />
      <rect x={10} y={-30} width={80} height={44} rx={16} fill="#15131C" stroke={INK} strokeWidth={5} />
      <line x1={-10} y1={-14} x2={10} y2={-14} stroke={INK} strokeWidth={6} />
      <path d="M-40,60 Q0,90 40,55" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
    </g>
    {t > w(wi(19, 5)) && <Confetti x={540} y={300} t={t - w(wi(19, 5))} n={40} />}
  </Cam>
);

export const SHOTS: Shot[] = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20].map((C) => ({ C }));
