// «Миың туралы 5 факт» — мультфильм, 21 сцена. Басты кейіпкер — Ми.
import React from "react";
import { Easing } from "remotion";
import { INK, Person } from "./people";
import {
  arms, Beam, Bloom, Burst, Cam, Confetti, Desk, FitText, Hero, L, P, popS, Puffs, rnd, Room, Shadow, ShotC, Sign, Sky,
  SkyClouds, Sparkle, SpeedLines, Window, Zzz,
} from "./kit";
import { Shot } from "./film";
import { Arrow, Bolt, Bubble, wi } from "./mykit";

type BF = "smile" | "happy" | "smug" | "sleepy" | "shock" | "tired" | "work";
// the Brain character: pink brain with face, stick arms and legs
const Brain: React.FC<{ x: number; y: number; s?: number; face?: BF; t?: number; arm?: [number, number, number, number]; c?: string; children?: React.ReactNode }> =
  ({ x, y, s = 1, face = "smile", t = 0, arm, c = "#F4A6B8", children }) => {
    const [lx, ly, rx, ry] = arm ?? [-170, 20 + Math.sin(t * 4) * 10, 170, 20 - Math.sin(t * 4) * 10];
    const eye = face === "sleepy" || face === "tired" || face === "happy"
      ? <><path d="M-70,-10 Q-50,8 -30,-10" fill="none" strokeWidth={8} /><path d="M30,-10 Q50,8 70,-10" fill="none" strokeWidth={8} /></>
      : face === "shock" ? <><circle cx={-50} cy={-14} r={20} fill="#fff" /><circle cx={-50} cy={-14} r={8} fill={INK} /><circle cx={50} cy={-14} r={20} fill="#fff" /><circle cx={50} cy={-14} r={8} fill={INK} /></>
      : face === "smug" ? <><path d="M-72,-14 L-28,-14" strokeWidth={9} /><path d="M28,-14 L72,-14" strokeWidth={9} /><circle cx={-48} cy={-4} r={9} fill={INK} /><circle cx={52} cy={-4} r={9} fill={INK} /></>
      : <><circle cx={-50} cy={-10} r={11} fill={INK} /><circle cx={50} cy={-10} r={11} fill={INK} /></>;
    const mouth = face === "shock" ? <ellipse cx={0} cy={50} rx={18} ry={24} fill="#6B2236" />
      : face === "tired" ? <path d="M-30,56 Q0,40 30,56" fill="none" strokeWidth={8} />
      : face === "sleepy" ? <ellipse cx={0} cy={50} rx={10} ry={8} fill="#6B2236" />
      : face === "work" ? <path d="M-24,48 L24,48" strokeWidth={8} />
      : <path d={face === "happy" ? "M-40,36 Q0,90 40,36 Z" : "M-34,40 Q0,70 34,40"} fill={face === "happy" ? "#6B2236" : "none"} strokeWidth={8} />;
    return (
      <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeLinecap="round" strokeLinejoin="round">
        <line x1={-60} y1={110} x2={-70} y2={260} strokeWidth={12} /><line x1={60} y1={110} x2={70} y2={260} strokeWidth={12} />
        <ellipse cx={-80} cy={262} rx={30} ry={12} fill={INK} /><ellipse cx={80} cy={262} rx={30} ry={12} fill={INK} />
        <line x1={-150} y1={10} x2={lx} y2={ly} strokeWidth={12} /><line x1={150} y1={10} x2={rx} y2={ry} strokeWidth={12} />
        <circle cx={lx} cy={ly} r={14} fill={INK} /><circle cx={rx} cy={ry} r={14} fill={INK} />
        <path d="M-160,60 Q-210,-30 -150,-100 Q-130,-180 -40,-170 Q0,-215 60,-180 Q150,-190 165,-100 Q215,-30 160,60 Q120,120 30,110 Q-60,130 -160,60 Z" fill={c} strokeWidth={9} />
        {["M-110,-80 Q-70,-120 -30,-80", "M30,-140 Q70,-100 110,-130", "M-140,10 Q-120,50 -100,30", "M110,0 Q140,40 120,70"].map((d) => <path key={d} d={d} fill="none" strokeWidth={6} opacity={0.6} />)}
        <ellipse cx={-90} cy={30} rx={24} ry={14} fill="#FF8FA8" opacity={0.6} stroke="none" /><ellipse cx={90} cy={30} rx={24} ry={14} fill="#FF8FA8" opacity={0.6} stroke="none" />
        <g strokeWidth={7}>{eye}</g>
        <g strokeWidth={7}>{mouth}</g>
        {children}
      </g>
    );
  };
const Neuron: React.FC<{ x: number; y: number; s?: number; glow?: number }> = ({ x, y, s = 1, glow = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={5} strokeLinecap="round">
    {[0, 60, 130, 200, 260, 320].map((a) => <path key={a} transform={`rotate(${a})`} d="M30,0 Q70,-20 110,0 M80,-8 L110,-40" fill="none" strokeWidth={6} />)}
    <circle r={36} fill={glow > 0.5 ? "#FFE04A" : "#B98AE8"} />
    {glow > 0 && <circle r={70} fill="#FFE04A" opacity={0.3 * glow} stroke="none" />}
  </g>
);
const Train: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={8} strokeLinejoin="round">
    <path d="M-500,0 L-500,-200 L150,-200 Q330,-190 380,0 Z" fill="#F4F1EA" />
    <path d="M150,-200 Q300,-180 350,-80 L180,-80 Z" fill="#9FD8FF" />
    <rect x={-500} y={-70} width={850} height={24} fill="#E8484F" stroke="none" />
    {[-420, -300, -180, -60].map((wx) => <rect key={wx} x={wx} y={-160} width={90} height={60} rx={10} fill="#9FD8FF" strokeWidth={5} />)}
  </g>
);
const Bulb: React.FC<{ x: number; y: number; s?: number; on: number }> = ({ x, y, s = 1, on }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={8} strokeLinejoin="round">
    {on > 0 && <circle r={260} fill="#FFE27A" opacity={0.35 * on} stroke="none" />}
    <path d="M-110,40 Q-170,-60 -110,-150 Q-50,-220 0,-220 Q50,-220 110,-150 Q170,-60 110,40 L70,110 L-70,110 Z" fill={on > 0.5 ? "#FFE04A" : "#F4F1EA"} />
    <rect x={-70} y={110} width={140} height={90} rx={10} fill="#8E93A3" />
    <path d="M-40,40 L-20,-60 L20,-60 L40,40" fill="none" strokeWidth={6} />
  </g>
);
const Head: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <g>
    <circle cx={540} cy={820} r={430} fill="#FDFBF9" stroke={INK} strokeWidth={12} />
    <path d="M300,1190 Q540,1320 780,1190 L840,1500 L240,1500 Z" fill="#2FA39A" stroke={INK} strokeWidth={10} />
    {children}
  </g>
);
const Bed: React.FC<{ x: number; y: number; children?: React.ReactNode }> = ({ x, y, children }) => (
  <g transform={`translate(${x},${y})`} stroke={INK} strokeWidth={8} strokeLinejoin="round">
    <rect x={-380} y={-200} width={40} height={300} fill="#8A5A3B" />
    <rect x={-360} y={-60} width={720} height={120} rx={20} fill="#C98A55" />
    {children}
    <path d="M-280,-60 Q0,-150 340,-60 L340,0 L-280,0 Z" fill="#7B61FF" />
    <ellipse cx={-280} cy={-90} rx={80} ry={40} fill="#fff" />
  </g>
);

const S01: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.2, 540, 820]} b={[1.0, 540, 900]}>
    <Room wall={["#3B3A5A", "#2A2948"]} />
    <Beam pts="340,0 740,0 900,1300 180,1300" o={0.6} />
    <Shadow x={540} y={1440} s={1.8} />
    <Brain x={540} y={1050} s={1.2} face="happy" t={t} arm={[-170, 20, 230, -180 + Math.sin(t * 10) * 30]} />
    <g transform={`translate(540 420) scale(${popS(t, 0.4)})`}><Sign x={0} y={0} w={460} h={140} text="5 ФАКТ" fs={96} bg="#FFE04A" /></g>
  </Cam>
);
const S02: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.4, 540, 820]} b={[1.7, 540, 760]}>
    <Room wall={["#7C8FD0", "#5968A8"]} />
    <Hero id="me" x={540} y={1200} s={1.3} face="look" gaze={0.4} pose={arms([-60, -10], [40, -210])} />
    {[[380, 520, 1], [640, 460, -1], [520, 360, 1]].map(([x, y, k], i) => (
      <g key={i} transform={`translate(${x} ${y}) rotate(${t * 90 * (k as number)})`} stroke={INK} strokeWidth={6}>
        {Array.from({ length: 8 }, (_, j) => <rect key={j} transform={`rotate(${j * 45})`} x={-14} y={-70} width={28} height={30} fill="#8E93A3" />)}
        <circle r={50} fill="#C9CDD8" /><circle r={16} fill="#8E93A3" />
      </g>
    ))}
  </Cam>
);
const S03: ShotC = ({ t, d, w }) => {
  const tilt = L(t, [0.3, 1.0], [0, -14], Easing.out(Easing.back(2)));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 980]} b={[1.08, 540, 960]}>
      <Room wall={["#E9E3C9", "#CFC6A0"]} />
      <g stroke={INK} strokeWidth={9} strokeLinejoin="round">
        <path d="M440,1450 L640,1450 L560,1100 L520,1100 Z" fill="#8A5A3B" />
        <g transform={`rotate(${tilt},540,1100)`}>
          <rect x={100} y={1085} width={880} height={30} rx={10} fill="#B97A52" />
          <g transform={`translate(200 1100) rotate(${-tilt})`}><ellipse cx={0} cy={90} rx={150} ry={26} fill="#C9CDD8" />
            <Person id="body" x={0} y={-120} s={0.85} body="#2FA39A" bodyDark="#1F7A73" face="worried" gaze={0.5} pose={P.shrug()} /></g>
          <g transform={`translate(880 1100) rotate(${-tilt})`}><ellipse cx={0} cy={90} rx={150} ry={26} fill="#C9CDD8" />
            <Brain x={0} y={-30} s={0.35} face="smug" t={t} /></g>
        </g>
      </g>
      <g transform={`translate(880 560) scale(${popS(t, w(wi(2, 5)) - 0.1)})`}><circle r={130} fill="#FFE04A" stroke={INK} strokeWidth={9} /><FitText x={0} y={45} text="2%" maxW={200} fs={120} /></g>
    </Cam>
  );
};
const S04: ShotC = ({ t, d, w }) => {
  const eat = w(wi(3, 4));
  const n = Math.round(L(t, [eat - 0.3, eat + 0.5], [0, 20]));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.15, 540, 860]}>
      <Room wall={["#F7E3C8", "#E9C9A0"]} />
      <rect x={140} y={1180} width={800} height={50} rx={10} fill="#8A5A3B" stroke={INK} strokeWidth={8} />
      {[0, 1, 2, 3, 4].map((i) => t < eat + i * 0.25 && <Bolt key={i} x={240 + i * 150} y={1100} s={0.5} />)}
      <Brain x={540} y={720} s={1.2} face={t > eat ? "happy" : "smile"} t={t} arm={[-200, 120 + Math.sin(t * 12) * 30, 200, 120 - Math.sin(t * 12) * 30]} />
      <g transform="translate(540 1400)"><rect x={-260} y={-90} width={520} height={180} rx={24} fill="#2A2233" stroke={INK} strokeWidth={8} />
        <FitText x={0} y={40} text={`⚡ ${n}%`} maxW={440} fs={120} fill="#7CFF8A" /></g>
    </Cam>
  );
};
const S05: ShotC = ({ t, d, w }) => {
  const n = Math.round(L(t, [w(wi(4, 2)) - 0.2, w(wi(4, 3)) + 0.4], [0, 86]));
  return (
    <Cam t={t} d={d} a={[1.4, 540, 900]} b={[0.9, 540, 900]}>
      <rect x={-700} y={-700} width={2480} height={3400} fill="#1C1638" />
      {Array.from({ length: 30 }, (_, i) => <Neuron key={i} x={-200 + (i % 6) * 300 + rnd(i) * 80} y={100 + Math.floor(i / 6) * 380 + rnd(i + 3) * 80} s={0.9} glow={(Math.sin(t * 6 + i) + 1) / 2} />)}
      <g transform="translate(540 1500)"><rect x={-320} y={-100} width={640} height={200} rx={26} fill="#2A2233" stroke={INK} strokeWidth={8} />
        <FitText x={0} y={40} text={`${n} МЛРД`} maxW={560} fs={120} fill="#7CFF8A" /></g>
    </Cam>
  );
};
const S06: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.1, 540, 880]}>
    <rect x={-700} y={-700} width={2480} height={3400} fill="#0D0B26" />
    {Array.from({ length: 60 }, (_, i) => <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 9) * 1920} r={2 + rnd(i) * 3} fill="#FFF6D8" />)}
    <g transform="translate(290 900)"><circle r={200} fill="#2B78F2" stroke={INK} strokeWidth={8} />
      <path d="M-120,-60 Q-40,-140 40,-80 Q60,0 -40,20 Q-120,20 -120,-60 Z" fill="#7CC46A" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={Math.cos(i) * 140} cy={Math.sin(i * 1.3) * 140} r={8} fill="#FDFBF9" stroke={INK} strokeWidth={3} />)}</g>
    <Brain x={790} y={880} s={0.8} face="smug" t={t} />
    <g transform={`translate(540 520) scale(${popS(t, w(wi(5, 5)) - 0.1)})`}><Sign x={0} y={0} w={320} h={140} text="×10" fs={110} bg="#FFE04A" /></g>
  </Cam>
);
const Wire: React.FC<{ p: number; t: number }> = ({ p, t }) => {
  const path = "M-100,1100 C200,900 300,1300 540,1000 S900,800 1200,1000";
  return (
    <g>
      <path d={path} fill="none" stroke={INK} strokeWidth={34} strokeLinecap="round" />
      <path d={path} fill="none" stroke="#B98AE8" strokeWidth={20} strokeLinecap="round" />
      <path d={path} fill="none" stroke="#FFE04A" strokeWidth={20} strokeLinecap="round" pathLength={1} strokeDasharray={`0.08 1`} strokeDashoffset={-p} />
    </g>
  );
};
const S07: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[0.72, 540, 1000]} b={[0.85, 560, 1000]}>
    <rect x={-700} y={-700} width={2480} height={3400} fill="#1C1638" />
    <Neuron x={-60} y={1100} s={2.2} glow={1} /><Neuron x={1140} y={1000} s={2.2} glow={(t % 1) > 0.8 ? 1 : 0} />
    <Wire p={(t * 0.9) % 1} t={t} />
    <SpeedLines x={540} y={1000} t={t} n={10} r0={400} r1={800} o={0.25} />
  </Cam>
);
const S08: ShotC = ({ t, d }) => {
  const v = L(t, [0.1, d * 0.7], [0, 400], Easing.out(Easing.cubic));
  const a = -120 + (v / 400) * 240;
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.12, 540, 880]} shake={v > 380 ? 4 : 0}>
      <Room wall={["#3B3A5A", "#2A2948"]} />
      <g transform="translate(540 900)" stroke={INK} strokeWidth={10}>
        <circle r={360} fill="#FDFBF9" />
        {Array.from({ length: 9 }, (_, i) => <line key={i} transform={`rotate(${-120 + i * 30})`} x1={0} y1={-330} x2={0} y2={-280} strokeWidth={8} />)}
        <path d="M-254,147 A294,294 0 0 1 254,147" fill="none" stroke="#E8484F" strokeWidth={0} />
        <g transform={`rotate(${a})`}><path d="M-14,0 L0,-300 L14,0 Z" fill="#E8484F" /></g>
        <circle r={36} fill="#2A2233" />
        <FitText x={0} y={200} text={`${Math.round(v)} км/сағ`} maxW={420} fs={84} />
      </g>
    </Cam>
  );
};
const S09: ShotC = ({ t, d }) => {
  const k = L(t, [0, d], [0, 1]);
  return (
    <Cam t={t} d={d} a={[1.0, 540, 1000]} b={[1.0, 540, 1000]}>
      <Sky mode="day" /><SkyClouds x={300} y={400} s={1.2} />
      <rect x={-700} y={1250} width={2480} height={1400} fill="#7CC46A" />
      <rect x={-700} y={1150} width={2480} height={30} fill="#8E93A3" stroke={INK} strokeWidth={5} />
      <Train x={700 - k * 400} y={1150} s={0.8} />
      <SpeedLines x={540} y={900} t={t} n={12} r0={500} r1={900} o={0.3} />
      <g transform={`translate(${200 + k * 900} 900)`}>
        <circle r={60} fill="#FFE04A" stroke={INK} strokeWidth={7} opacity={0.9} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-80 - i * 40} y1={-20 + i * 8} x2={-160 - i * 40} y2={-20 + i * 8} stroke="#FFE04A" strokeWidth={10} strokeLinecap="round" opacity={0.6} />)}
        <Brain x={0} y={-10} s={0.2} face="happy" t={t} />
      </g>
    </Cam>
  );
};
const S10: ShotC = ({ t, d, w }) => {
  const on = L(t, [w(wi(9, 4)) - 0.2, w(wi(9, 4)) + 0.1], [0, 1]);
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.12, 540, 860]}>
      <Room wall={["#3B3A5A", "#2A2948"]} />
      <path d="M300,1100 C300,1300 700,1300 700,700" fill="none" stroke={INK} strokeWidth={16} />
      <Brain x={280} y={950} s={0.65} face="smug" t={t} />
      <Bulb x={720} y={560} s={1.1} on={on} />
      <g transform={`translate(720 920) scale(${popS(t, w(wi(9, 6)) - 0.1)})`}><Sign x={0} y={0} w={300} h={110} text="20 ВАТТ" fs={70} bg="#FFE04A" /></g>
    </Cam>
  );
};
const S11: ShotC = ({ t, d }) => {
  const f = L(t, [0.2, d - 0.3], [0, 0.75]);
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.12, 540, 880]}>
      <Room wall={["#CFE3EE", "#A7C4D6"]} />
      <clipPath id="brainclip"><path transform="translate(540 800) scale(2)" d="M-160,60 Q-210,-30 -150,-100 Q-130,-180 -40,-170 Q0,-215 60,-180 Q150,-190 165,-100 Q215,-30 160,60 Q120,120 30,110 Q-60,130 -160,60 Z" /></clipPath>
      <Brain x={540} y={800} s={2} face="smile" t={t} />
      <g clipPath="url(#brainclip)" opacity={0.75}>
        <rect x={0} y={1060 - f * 600} width={1080} height={800} fill="#2F86D8" />
        <path d={`M0,${1060 - f * 600} q60,-20 120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0`} fill="none" stroke="#9FD8FF" strokeWidth={10} />
      </g>
      <g transform="translate(540 1430)"><rect x={-220} y={-80} width={440} height={160} rx={24} fill="#2A2233" stroke={INK} strokeWidth={8} />
        <FitText x={0} y={36} text={`💧 ${Math.round(f * 100)}%`} maxW={380} fs={100} fill="#7CFF8A" /></g>
    </Cam>
  );
};
const S12: ShotC = ({ t, d, w }) => {
  const sl = t > w(wi(11, 6));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.12, 540, 900]}>
      <Sky mode="day" />
      <rect x={-700} y={1250} width={2480} height={1400} fill="#D8B45A" />
      <g transform="translate(860 300)"><circle r={110} fill="#FFD23F" stroke={INK} strokeWidth={8} /></g>
      <Brain x={540} y={950} s={1.05} face={sl ? "tired" : "smile"} t={sl ? 0 : t} c={sl ? "#D9A3B0" : "#F4A6B8"} arm={sl ? [-170, 120, 170, 120] : undefined} />
      {sl && <><Zzz x={760} y={600} t={t} s={1.2} /><Puffs x={540} y={700} t={t} n={4} c="#E9D6C0" size={0.4} life={1.2} /></>}
      <g transform={`translate(200 1150) scale(${popS(t, w(wi(11, 1)) - 0.1)})`} stroke={INK} strokeWidth={7}>
        <path d="M-60,-160 L60,-160 L44,40 L-44,40 Z" fill="#C9E8FF" /><rect x={-40} y={-40} width={80} height={70} fill="#2F86D8" opacity={0.3} stroke="none" />
      </g>
    </Cam>
  );
};
const S13: ShotC = ({ t, d, w }) => {
  const hit = w(wi(12, 1));
  const sw = L(t, [hit - 0.4, hit], [-60, 20], Easing.in(Easing.quad));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.12, 540, 880]} shake={t > hit && t < hit + 0.25 ? 12 : 0}>
      <Room wall={["#F2D3C2", "#D9A98F"]} />
      <Brain x={540} y={1000} s={1.15} face={t > hit + 0.2 ? "happy" : "smile"} t={t} />
      <g transform={`translate(760 520) rotate(${t < hit ? sw : 20 - (t - hit) * 30})`} stroke={INK} strokeWidth={8} strokeLinejoin="round">
        <rect x={-14} y={0} width={28} height={300} rx={10} fill="#B97A52" />
        <rect x={-110} y={-60} width={220} height={90} rx={14} fill="#C2463F" />
      </g>
      {t > hit && <><Burst x={600} y={780} r={L(t, [hit, hit + 0.2], [40, 160])} rot={t * 40} /><text x={820} y={720} fontFamily="Montserrat" fontWeight={900} fontSize={110} fill="#FFE04A" stroke={INK} strokeWidth={5}>ТҮК!</text></>}
    </Cam>
  );
};
const S14: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.12, 540, 900]}>
    <Room wall={["#CDEFC7", "#A7D6A0"]} />
    <Beam pts="380,0 700,0 820,1200 260,1200" o={0.5} />
    <rect x={160} y={1060} width={760} height={60} rx={14} fill="#F4F1EA" stroke={INK} strokeWidth={8} />
    <Person id="pat" x={330} y={1000} s={0.85} body="#9FD8FF" bodyDark="#6FA8D8" face="happy" gaze={0.6} tilt={-80} pose={P.stand()} />
    <Shadow x={780} y={1470} s={1.3} />
    <Person id="doc" x={780} y={1230} s={1.15} body="#56BA6C" bodyDark="#3E8A4E" hat="doctor" mask face="look" gaze={-0.6} pose={P.hold([-120, -140])} />
    <g transform={`translate(380 560) scale(${popS(t, 0.5)})`}><Bubble x={0} y={0} s={0.6} tail={[-60, 250]}><FitText x={0} y={30} text="Сәлем!" maxW={300} fs={90} /></Bubble></g>
  </Cam>
);
const S15: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.2, 540, 900]} b={[1.4, 540, 860]}>
    <Room wall={["#3B3A5A", "#2A2948"]} />
    <Beam pts="380,0 700,0 860,1300 220,1300" o={0.6} />
    <Brain x={540} y={1000} s={1.15} face="shock" t={t} />
    {[0, 1, 2].map((i) => <Sparkle key={i} x={300 + i * 240} y={500 + (i % 2) * 80} s={0.8 + 0.4 * Math.sin(t * 8 + i)} />)}
  </Cam>
);
const S16: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.12, 540, 900]}>
    <Room wall={["#2A2F6A", "#1E2350"]} />
    <Window x={640} y={240} w={320} h={380} mode="night" />
    <Bed x={420} y={1250}>
      <Person id="sl" x={-140} y={-110} s={0.6} body="#8DB6F2" bodyDark="#5F86CF" face="blink" gaze={0} tilt={-80} pose={P.stand()} />
    </Bed>
    <Zzz x={260} y={900} t={t} s={1.2} />
    <g transform="translate(820 1000)">
      <circle r={180} fill="#FFE27A" opacity={0.25} />
      <Brain x={0} y={0} s={0.6} face="work" t={t} arm={[-170, 40 + Math.sin(t * 14) * 15, 170, 40 - Math.sin(t * 14) * 15]} />
    </g>
  </Cam>
);
const S17: ShotC = ({ t, d, w }) => {
  const sweep = t > w(wi(16, 5));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.12, 540, 920]}>
      <rect x={-700} y={-700} width={2480} height={3400} fill="#F4A6B8" />
      {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${-200 + (i % 4) * 400},${Math.floor(i / 4) * 500} q100,-80 200,0`} fill="none" stroke="#E07890" strokeWidth={14} />)}
      {[0, 1, 2].map((i) => <g key={i} transform={`translate(${180 + i * 180} ${1200 - i * 20})`} stroke={INK} strokeWidth={7}>
        <rect x={-70} y={-120} width={140} height={120} fill="#FFE04A" /><rect x={-70} y={-140} width={60} height={30} fill="#FFE04A" /></g>)}
      <Brain x={720} y={980} s={0.85} face="work" t={t} arm={sweep ? [-170, 60, 200, 260 + Math.sin(t * 10) * 30] : [-120, -100 + Math.sin(t * 8) * 30, 170, 20]} />
      {sweep && <g transform={`translate(${900 + Math.sin(t * 10) * 30} 1320) rotate(${Math.sin(t * 10) * 15})`} stroke={INK} strokeWidth={7}><line x1={0} y1={-260} x2={0} y2={0} strokeWidth={10} /><path d="M-60,0 L60,0 L80,90 L-80,90 Z" fill="#D9934A" /></g>}
      {sweep && Array.from({ length: 5 }, (_, i) => <circle key={i} cx={1000 + ((t * 300 + i * 80) % 400)} cy={1380 - i * 10} r={14} fill="#8E93A3" stroke={INK} strokeWidth={4} />)}
    </Cam>
  );
};
const S18: ShotC = ({ t, d }) => {
  const p = L(t, [0.1, d - 0.2], [0, 1]);
  return (
    <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.1, 560, 900]}>
      <rect x={-700} y={-700} width={2480} height={3400} fill="#F4A6B8" />
      <path d={`M-200,1300 Q300,1100 ${-200 + p * 1400},${1300 - p * 500}`} fill="none" stroke={INK} strokeWidth={90} strokeLinecap="round" />
      <path d={`M-200,1300 Q300,1100 ${-200 + p * 1400},${1300 - p * 500}`} fill="none" stroke="#8E93A3" strokeWidth={70} strokeLinecap="round" />
      <path d={`M-200,1300 Q300,1100 ${-200 + p * 1400},${1300 - p * 500}`} fill="none" stroke="#FFF" strokeWidth={8} strokeDasharray="30 30" />
      <Brain x={-200 + p * 1400 - 40} y={1300 - p * 500 - 260} s={0.6} face="happy" t={t}>
        <path d="M-150,-150 Q0,-290 150,-150 L180,-120 L-180,-120 Z" fill="#FFD23F" stroke={INK} strokeWidth={8} />
      </Brain>
    </Cam>
  );
};
const S19: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.12, 540, 900]}>
    <Room wall={["#F7E3C8", "#E9C9A0"]} />
    <Desk x={540} y={1220} w={700} />
    <g transform="translate(540 1050)" stroke={INK} strokeWidth={8} strokeLinejoin="round">
      <rect x={-200} y={-180} width={400} height={240} rx={14} fill="#2A2233" /><rect x={-180} y={-160} width={360} height={200} rx={8} fill="#9FD8FF" />
      <FitText x={0} y={-40} text="АҒЫЛШЫН" maxW={300} fs={50} />
    </g>
    <Shadow x={540} y={1470} s={1.4} />
    <Person id="ata" x={540} y={820} s={0.9} body="#7A5A9B" bodyDark="#5A3F78" face="happy" gaze={0} pose={P.type()}>
      <path d="M-60,-150 Q0,-60 60,-150 Q40,-100 0,-90 Q-40,-100 -60,-150 Z" fill="#F4F1EA" stroke={INK} strokeWidth={5} />
      <path d="M-90,-300 Q0,-360 90,-300" fill="none" stroke="#C8C3B8" strokeWidth={14} />
    </Person>
    <g transform={`translate(830 480) scale(${popS(t, w(wi(18, 2)) - 0.1)})`}><Sign x={0} y={0} w={300} h={120} text="ЕШҚАШАН" fs={60} bg="#B9F0B0" /></g>
    <g transform={`translate(830 620) scale(${popS(t, w(wi(18, 3)) - 0.1)})`}><Sign x={0} y={0} w={300} h={100} text="КЕШ ЕМЕС" fs={56} bg="#FFF3C4" /></g>
  </Cam>
);
const S20: ShotC = ({ t, d, w }) => {
  const off = t > w(wi(19, 3));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.12, 520, 920]}>
      <Room wall={off ? ["#1E2350", "#141A40"] : ["#E9C9A0", "#C99F73"]} />
      <Window x={640} y={240} w={320} h={380} mode="night" />
      <Bed x={460} y={1260}>
        <Hero id="me" x={-150} y={-110} s={0.6} face="blink" gaze={0} tilt={-80} pose={P.stand()} />
      </Bed>
      {off && <Zzz x={300} y={900} t={t} s={1.2} />}
      <g transform="translate(160 700)" stroke={INK} strokeWidth={7}><rect x={-30} y={0} width={60} height={100} fill="#F4F1EA" /><circle cx={0} cy={50} r={14} fill={off ? "#8E93A3" : "#FFE04A"} /></g>
    </Cam>
  );
};
const S21: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.1, 540, 900]} b={[1.3, 540, 840]}>
    <Room wall={["#F2D3C2", "#D9A98F"]} />
    <Brain x={540} y={1000} s={1.2} face="happy" t={t} arm={[-60, -60, 60, -60]} />
    {[0, 1, 2, 3].map((i) => <path key={i} transform={`translate(${300 + i * 160} ${560 - ((t * 120 + i * 60) % 240)}) scale(${0.6 + 0.2 * Math.sin(t * 3 + i)})`} d="M0,40 C-80,-10 -60,-80 0,-40 C60,-80 80,-10 0,40 Z" fill="#E8484F" stroke={INK} strokeWidth={6} />)}
    {t > w(wi(20, 2)) && <g transform={`translate(540 400) scale(${popS(t, w(wi(20, 2)))})`}><Sign x={0} y={0} w={420} h={130} text="РАХМЕТ!" fs={90} bg="#FFE04A" /></g>}
    {t > w(wi(20, 3)) && <Confetti x={540} y={300} t={t - w(wi(20, 3))} n={30} />}
  </Cam>
);

export const SHOTS: Shot[] = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21].map((C) => ({ C }));
