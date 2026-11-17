// «Есінеу неге жұғады?» — 22 сцены
import React from "react";
import { Easing } from "remotion";
import { INK, Person } from "./people";
import {
  arms, Bloom, Cam, Confetti, Desk, FightCloud, FitText, Hero, L, P, Plant, popS, Puffs, rnd, Room, Shadow, ShotC, Sign,
  Sky, SkyClouds, Sparkle, SpeedLines, Stopwatch, Suit, Window, Zzz,
} from "./kit";
import { Shot } from "./film";
import { Arrow, Bubble, Dog, Phone, wi } from "./mykit";

type FaceT = React.ComponentProps<typeof Person>["face"];
// yawn mouth over a "blink" face: y = 0..1 how wide
const YawnMouth: React.FC<{ y: number; hand?: boolean }> = ({ y, hand }) => (
  <g>
    {y > 0.02 && <ellipse cx={0} cy={-196 + y * 6} rx={22 + y * 10} ry={8 + y * 34} fill="#6B2236" stroke={INK} strokeWidth={6} />}
    {hand && y > 0.2 && <ellipse cx={0} cy={-192} rx={46} ry={36} fill="#FDFBF9" stroke={INK} strokeWidth={6} />}
  </g>
);
// person who yawns between t0 and t0+1.6 s
const yawnAmt = (t: number, t0: number) => L(t, [t0, t0 + 0.4, t0 + 1.3, t0 + 1.7], [0, 1, 1, 0]);
const Yawner: React.FC<{ id: string; x: number; y: number; s?: number; c: string; t: number; t0: number; base?: FaceT; hand?: boolean; gaze?: number; children?: React.ReactNode }> =
  ({ id, x, y, s = 1, c, t, t0, base = "calm", hand, gaze = 0, children }) => {
    const a = yawnAmt(t, t0);
    return (
      <Person id={id} x={x} y={y} s={s} body={c} bodyDark={INK} face={a > 0.05 ? "blink" : base} gaze={a > 0.05 ? 0 : gaze}
        pose={a > 0.05 ? (hand ? arms([-60, -10], [8, -196]) : arms([-110 + a * 10, -290 * a - 40 * (1 - a)], [110, -290 * a - 40 * (1 - a)])) : P.stand()}>
        <YawnMouth y={a} hand={hand} />
        {children}
      </Person>
    );
  };
const Chalk: React.FC = () => (
  <g>
    <rect x={120} y={260} width={840} height={460} rx={14} fill="#2F5D4A" stroke="#8A5A3B" strokeWidth={22} />
    <rect x={120} y={260} width={840} height={460} rx={14} fill="none" stroke={INK} strokeWidth={6} />
  </g>
);
const Brain: React.FC<{ x: number; y: number; s?: number; cool?: number }> = ({ x, y, s = 1, cool = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={7} strokeLinejoin="round">
    <path d="M-150,40 Q-200,-40 -140,-110 Q-120,-180 -40,-170 Q0,-220 60,-180 Q150,-190 160,-100 Q220,-40 160,40 Q120,100 30,90 Q-60,120 -150,40 Z"
      fill={cool > 0.5 ? "#B8D8FF" : "#F4A6B8"} />
    {["M-100,-60 Q-60,-100 -20,-60", "M20,-120 Q60,-80 100,-110", "M-60,20 Q0,-20 60,30", "M60,-30 Q110,0 130,-40", "M-130,-20 Q-110,30 -80,10"].map((d) =>
      <path key={d} d={d} fill="none" strokeWidth={6} />)}
  </g>
);
const Snow: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round">
    {[0, 60, 120].map((a) => <line key={a} x1={-30} y1={0} x2={30} y2={0} transform={`rotate(${a})`} />)}
  </g>
);
const Heart: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <path transform={`translate(${x},${y}) scale(${s})`} d="M0,40 C-80,-10 -60,-80 0,-40 C60,-80 80,-10 0,40 Z" fill="#E8484F" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
);
const Hazard: React.FC<{ y: number; t: number }> = ({ y, t }) => (
  <g transform={`translate(0 ${y})`}>
    <rect x={-700} y={-40} width={2480} height={80} fill="#FFD23F" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 40 }, (_, i) => <path key={i} d={`M${-700 + i * 80 + ((t * 120) % 80)},-40 l40,0 l-40,80 l-40,0 Z`} fill={INK} />)}
  </g>
);

const S01: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.6, 540, 820]} b={[1.9, 540, 760]}>
    <Room wall={["#F2D3C2", "#D9A98F"]} />
    <Window x={700} y={240} w={300} h={380} mode="day" />
    <Shadow x={540} y={1480} s={1.6} />
    <Person id="me" x={540} y={1200} s={1.4} body="#2FA39A" bodyDark="#1F7A73" face={yawnAmt(t, 0.3) > 0.05 ? "blink" : "calm"} gaze={0}
      pose={arms([-110, -290 * yawnAmt(t, 0.3) - 40], [110, -290 * yawnAmt(t, 0.3) - 40])}>
      <YawnMouth y={yawnAmt(t, 0.3)} />
      <path d="M-82,-286 Q-96,-342 -44,-356 L-40,-394 L-10,-360 L16,-402 L34,-358 Q90,-352 84,-288 Q60,-318 28,-318 L12,-300 L-2,-322 Q-50,-322 -82,-286 Z" fill="#2A2233" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    </Person>
  </Cam>
);
const S02: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.2, 540, 900]} b={[1.5, 620, 760]}>
    <Room wall={["#F2D3C2", "#D9A98F"]} />
    <Shadow x={460} y={1470} s={1.5} />
    <Hero id="me" x={460} y={1200} s={1.35} face="smug" gaze={0.4} pose={arms([-60, -10], [90, -200])} />
    <g transform="translate(740 560)">
      <circle r={120} fill="#FFF3C4" stroke={INK} strokeWidth={8} />
      <text x={0} y={46} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={130} fill={INK}>👉</text>
    </g>
    <Sign x={740} y={760} w={260} h={90} text="СЕН" fs={60} bg="#9FD8FF" />
  </Cam>
);
const S03: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.12, 540, 880]}>
    <Room wall={["#B9C6F0", "#8E9BD0"]} />
    <Shadow x={380} y={1470} s={1.5} />
    <Hero id="me" x={380} y={1200} s={1.3} face="smug" gaze={0.6} pose={P.hold([140, -160])} />
    <g transform={`translate(720 640) scale(${popS(t, 0.1)})`}><Stopwatch x={0} y={0} s={2} hand={t * 0.6} /></g>
  </Cam>
);
const S04: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.15, 540, 900]} b={[1.0, 540, 960]} shake={t > w(wi(3, 2)) && t < w(wi(3, 2)) + 0.3 ? 8 : 0}>
    <Room wall={["#E9C9A0", "#C99F73"]} />
    <Hazard y={380} t={t} /><Hazard y={1180} t={-t} />
    <g transform={`translate(540 780) scale(${popS(t, w(wi(3, 2)) - 0.1)})`}>
      <path d="M0,-300 L300,220 L-300,220 Z" fill="#FFD23F" stroke={INK} strokeWidth={12} strokeLinejoin="round" />
      <ellipse cx={0} cy={60} rx={70} ry={110} fill="#6B2236" stroke={INK} strokeWidth={8} />
      <path d="M-120,-30 Q-80,-60 -40,-30 M40,-30 Q80,-60 120,-30" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" />
    </g>
    <Sign x={540} y={1060} w={560} h={110} text="ЖҰҚПАЛЫ!" fs={80} bg="#E8484F" fg="#fff" />
  </Cam>
);
const S05: ShotC = ({ t, d, w }) => {
  const t0 = w(wi(4, 1));
  const people: [number, number, string][] = [[160, 1150, "#E8484F"], [400, 1100, "#F2C55C"], [650, 1120, "#56BA6C"], [900, 1150, "#7B61FF"], [280, 1350, "#2FA39A"], [780, 1350, "#F28A2E"]];
  return (
    <Cam t={t} d={d} a={[1.0, 540, 1000]} b={[1.08, 540, 1000]}>
      <Room wall={["#A9CDB8", "#7FA893"]} floorY={1180} />
      {people.map(([x, y, c], i) => (
        <Yawner key={i} id={`r${i}`} x={x} y={y} s={0.75} c={c} t={t} t0={i === 0 ? t0 - 0.4 : t0 + 0.2 + (i % 3) * 0.45} />
      ))}
    </Cam>
  );
};
const S06: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.3, 540, 820]} b={[1.6, 540, 760]}>
    <Room wall={["#F2E3C2", "#D9C08F"]} />
    <Plant x={900} y={1250} s={1.2} />
    <Shadow x={540} y={1480} s={1.5} />
    <Yawner id="rd" x={540} y={1200} s={1.3} c="#4F6BD8" t={t} t0={d * 0.45} base="look" />
    <g transform={`translate(540 1110) rotate(${-4 + Math.sin(t) * 2})`}>
      <rect x={-200} y={-140} width={400} height={240} rx={12} fill="#E8484F" stroke={INK} strokeWidth={8} />
      <line x1={0} y1={-140} x2={0} y2={100} stroke={INK} strokeWidth={6} />
      <FitText x={-100} y={-10} text="ЕСІНЕУ" maxW={160} fs={44} fill="#fff" />
      <FitText x={100} y={-10} text="ТУРАЛЫ" maxW={160} fs={44} fill="#fff" />
    </g>
  </Cam>
);
const S07: ShotC = ({ t, d, w }) => {
  const t0 = w(wi(6, 2));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.1, 540, 950]}>
      <Room wall={["#E9E3C9", "#CFC6A0"]} floorY={1150} />
      <Chalk />
      <text x={540} y={520} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={110} fill="#fff" opacity={0.85}>2 + 2 = ?</text>
      <Yawner id="teach" x={820} y={1000} s={0.95} c="#7A2E44" t={t} t0={t0 - 0.3} />
      {[150, 400, 650].map((x, i) => (
        <g key={i}><Yawner id={`st${i}`} x={x} y={1330} s={0.7} c={["#56BA6C", "#F2C55C", "#4F6BD8"][i]} t={t} t0={w(wi(6, 5)) + i * 0.2} base="look" gaze={0.5} />
          <Desk x={x} y={1390} w={220} /></g>
      ))}
    </Cam>
  );
};
const S08: ShotC = ({ t, d, w }) => {
  const t0 = w(wi(7, 1));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 980]} b={[1.12, 540, 940]}>
      <Room wall={["#7C8FD0", "#5968A8"]} floorY={1220} />
      <Sign x={540} y={380} w={560} h={110} text="ЖИНАЛЫС" fs={70} bg="#FFF3C4" />
      <Person id="boss" x={540} y={950} s={1.0} body="#2A2233" bodyDark={INK} face={yawnAmt(t, t0) > 0.05 ? "blink" : "calm"} gaze={0}
        pose={yawnAmt(t, t0) > 0.05 ? arms([-110, -320], [110, -320]) : P.stand()}>
        <YawnMouth y={yawnAmt(t, t0)} />
        <path d="M-60,-292 Q0,-330 60,-292" fill="none" stroke={INK} strokeWidth={8} />
      </Person>
      <rect x={60} y={1120} width={960} height={70} rx={20} fill="#8A5A3B" stroke={INK} strokeWidth={8} />
      {[170, 380, 700, 910].map((x, i) => <Yawner key={i} id={`m${i}`} x={x} y={1170} s={0.7} c={["#E8484F", "#56BA6C", "#F2C55C", "#2FA39A"][i]} t={t} t0={w(wi(7, 3)) + i * 0.15} hand base="look" gaze={0} />)}
    </Cam>
  );
};
const S09: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.15, 540, 860]}>
    <Sky mode="dusk" /><SkyClouds x={250} y={400} s={1.4} /><SkyClouds x={900} y={250} s={1} />
    <Bloom x={540} y={860} r={500} o={0.5} />
    {[0, 1, 2, 3, 4].map((i) => <Sparkle key={i} x={200 + i * 170} y={500 + rnd(i) * 300} s={0.6 + 0.4 * Math.sin(t * 4 + i)} />)}
    <g transform={`translate(540 ${880 + Math.sin(t * 2) * 15})`}>
      <ellipse rx={240} ry={200} fill="#FFF4DE" stroke={INK} strokeWidth={8} />
      <circle cy={-30} r={110} fill="#FDFBF9" stroke={INK} strokeWidth={7} />
      <path d="M-50,-40 Q-35,-30 -20,-40 M20,-40 Q35,-30 50,-40" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <ellipse cx={0} cy={10} rx={20} ry={8 + 20 * Math.abs(Math.sin(t * 1.5))} fill="#6B2236" stroke={INK} strokeWidth={5} />
    </g>
  </Cam>
);
const S10: ShotC = ({ t, d }) => {
  const y = Math.max(0, Math.sin(t * 1.6));
  return (
    <Cam t={t} d={d} a={[1.05, 540, 860]} b={[1.25, 540, 800]}>
      <Room wall={["#CFE3EE", "#A7C4D6"]} />
      <rect x={140} y={360} width={800} height={640} rx={30} fill="#2A2233" stroke={INK} strokeWidth={10} />
      <path d="M540,420 L860,940 L220,940 Z" fill="#1E2A3A" />
      <g transform="translate(540 720)" fill="none" stroke="#DDEBFF" strokeWidth={8} strokeLinecap="round">
        <circle cx={-40} cy={-60} r={90} />
        <path d="M30,0 Q140,40 120,150 Q60,180 -40,150" />
        <path d="M-90,-70 Q-75,-60 -60,-70" />
        <ellipse cx={-30} cy={-10} rx={14} ry={6 + y * 20} fill="#DDEBFF" />
      </g>
      <Sign x={540} y={1100} w={300} h={80} text="УДЗ" fs={52} bg="#9FD8FF" />
    </Cam>
  );
};
const S11: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.1, 540, 1000]} b={[1.0, 540, 960]} shake={3}>
    <Room wall={["#F2E3C2", "#D9C08F"]} />
    <Shadow x={290} y={1470} s={1.4} /><Shadow x={790} y={1470} s={1.4} />
    <Person id="sc1" x={290} y={1220} s={1.15} body="#FFFFFF" bodyDark="#C8C3B8" hat="doctor" face="shout" gaze={0.6} pose={arms([-70, -10], [140, -260 + Math.sin(t * 14) * 30])} />
    <Person id="sc2" x={790} y={1220} s={1.15} body="#FFFFFF" bodyDark="#C8C3B8" hat="doctor" face="shout" gaze={-0.6} pose={arms([-140, -260 + Math.cos(t * 14) * 30], [70, -10])} />
    <FightCloud x={540} y={560} s={0.8} t={t} />
  </Cam>
);
const S12: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.2, 540, 820]}>
    <Sky mode="day" /><SkyClouds x={250} y={1300} s={1.6} /><SkyClouds x={900} y={300} s={1.2} />
    <g transform={`translate(540 760) scale(${popS(t, w(wi(11, 1)) - 0.1) * (1 + Math.sin(t * 5) * 0.03)})`}>
      <text x={0} y={180} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={560} fill="#FFE04A" stroke={INK} strokeWidth={14}>?</text>
    </g>
  </Cam>
);
const Head: React.FC<{ children?: React.ReactNode; t: number }> = ({ children }) => (
  <g>
    <circle cx={540} cy={820} r={420} fill="#FDFBF9" stroke={INK} strokeWidth={12} />
    <path d="M300,1180 Q540,1320 780,1180 L840,1500 L240,1500 Z" fill="#2FA39A" stroke={INK} strokeWidth={10} />
    {children}
  </g>
);
const S13: ShotC = ({ t, d, w }) => {
  const c = L(t, [w(wi(12, 5)) - 0.2, w(wi(12, 5)) + 0.4], [0, 1]);
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.12, 540, 850]}>
      <Room wall={["#B9C6F0", "#8E9BD0"]} />
      <Head t={t}><Brain x={540} y={740} s={1.4} cool={c} />
        {c > 0 && Array.from({ length: 8 }, (_, i) => <Snow key={i} x={300 + rnd(i) * 480} y={520 + ((t * 120 + rnd(i + 2) * 500) % 520)} s={0.8} />)}
        <g transform={`translate(540 ${1050})`}><path d="M-60,0 Q0,40 60,0" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" /></g>
      </Head>
    </Cam>
  );
};
const S14: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.15, 540, 860]} b={[1.0, 540, 900]}>
    <Room wall={["#B9C6F0", "#8E9BD0"]} />
    <Head t={t}>
      <Brain x={540} y={700} s={1.1} cool={1} />
      <g transform="translate(540 960)">
        <rect x={-14} y={0} width={28} height={110} fill="#8E93A3" stroke={INK} strokeWidth={5} />
        <g transform={`rotate(${t * 900})`}>{[0, 120, 240].map((a) => <ellipse key={a} transform={`rotate(${a}) translate(0,-60)`} rx={26} ry={60} fill="#9FD8FF" stroke={INK} strokeWidth={6} />)}</g>
        <circle r={20} fill="#2A2233" />
      </g>
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${320 + i * 120},${(860 - ((t * 300 + i * 90) % 300))} q30,-20 60,0 t60,0`} fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={0.85} />)}
    </Head>
  </Cam>
);
const S15: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.2, 540, 900]} b={[1.0, 540, 940]}>
    <Room wall={["#F2D3C2", "#D9A98F"]} />
    <Shadow x={300} y={1470} s={1.3} /><Shadow x={780} y={1470} s={1.3} />
    <Yawner id="a" x={300} y={1220} s={1.1} c="#E8484F" t={t} t0={0} />
    <Hero id="b" x={780} y={1220} s={1.1} face="worried" gaze={-0.7} pose={P.shrug()} />
    <text x={780} y={620} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={200} fill="#F2C55C" stroke={INK} strokeWidth={8}>?</text>
  </Cam>
);
const S16: ShotC = ({ t, d }) => {
  const sw = Math.sin(t * 3) * 60;
  return (
    <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.12, 540, 900]}>
      <Room wall={["#A9CDB8", "#7FA893"]} />
      <line x1={540} y1={300} x2={540} y2={1500} stroke="#fff" strokeWidth={6} strokeDasharray="20 20" opacity={0.7} />
      <Shadow x={300} y={1470} s={1.3} /><Shadow x={780} y={1470} s={1.3} />
      <Hero id="f1" x={300} y={1220} s={1.1} face="happy" gaze={0.6} pose={arms([-100 + sw, -260], [70, -10])} />
      <Hero id="f2" x={780} y={1220} s={1.1} face="happy" gaze={-0.6} color="#E8484F" colorDark="#B23A3F" pose={arms([-70, -10], [100 - sw, -260])} />
    </Cam>
  );
};
const S17: ShotC = ({ t, d, w }) => {
  const g = L(t, [0.3, 1.4], [0, 1], Easing.out(Easing.cubic));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.1, 540, 880]}>
      <Room wall={["#E9E3C9", "#CFC6A0"]} />
      <rect x={140} y={300} width={800} height={860} rx={20} fill="#FFFDF6" stroke={INK} strokeWidth={10} />
      <line x1={220} y1={1000} x2={880} y2={1000} stroke={INK} strokeWidth={8} />
      <rect x={260} y={1000 - 180 * g} width={200} height={180 * g} fill="#8E93A3" stroke={INK} strokeWidth={7} />
      <rect x={620} y={1000 - 560 * g * (t > w(wi(16, 5)) ? 1 : 0.35)} width={200} height={560 * g * (t > w(wi(16, 5)) ? 1 : 0.35)} fill="#56BA6C" stroke={INK} strokeWidth={7} />
      <FitText x={360} y={1080} text="БӨТЕН" maxW={200} fs={52} />
      <FitText x={720} y={1080} text="ДОС" maxW={200} fs={52} />
    </Cam>
  );
};
const S18: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.15, 540, 880]}>
    <Room wall={["#F2D3C2", "#D9A98F"]} />
    <Shadow x={300} y={1470} s={1.3} /><Shadow x={780} y={1470} s={1.3} />
    <Yawner id="fr" x={300} y={1220} s={1.1} c="#E8484F" t={t} t0={0.1} />
    <Yawner id="me" x={780} y={1220} s={1.1} c="#2FA39A" t={t} t0={0.9} base="look" gaze={-0.6} />
    {[0, 1].map((i) => <Heart key={i} x={540} y={700 - i * 90} s={0.6 * popS(t, 0.9 + i * 0.2)} />)}
  </Cam>
);
const S19: ShotC = ({ t, d, w }) => {
  const t0 = w(wi(18, 2));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 980]} b={[1.15, 600, 1000]}>
      <Sky mode="day" /><SkyClouds x={250} y={350} s={1.4} />
      <rect x={-700} y={1200} width={2480} height={1400} fill="#7CC46A" />
      <Shadow x={330} y={1470} s={1.4} />
      <Yawner id="own" x={330} y={1220} s={1.15} c="#F28A2E" t={t} t0={t0 - 0.8} />
      <Shadow x={760} y={1420} s={1.6} />
      <Dog x={820} y={1420} s={1.1} yawn={yawnAmt(t, t0)} t={t} />
    </Cam>
  );
};
const S20: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 960]} b={[1.15, 540, 900]}>
    <Sky mode="dusk" /><SkyClouds x={250} y={350} s={1.3} />
    <rect x={-700} y={1200} width={2480} height={1400} fill="#5E9C57" />
    {[[200, "#E8484F"], [540, "#2FA39A"], [880, "#F2C55C"]].map(([x, c], i) => (
      <g key={i}><Shadow x={x as number} y={1440} s={1.1} />
        <Person id={`h${i}`} x={x as number} y={1230} s={0.95} body={c as string} bodyDark={INK} face="happy" gaze={0} pose={P.hug()} /></g>
    ))}
    {[0, 1, 2, 3, 4].map((i) => <Heart key={i} x={200 + i * 170} y={620 - ((t * 120 + i * 60) % 260)} s={0.7 + 0.2 * Math.sin(t * 3 + i)} />)}
  </Cam>
);
const S21: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.4, 540, 820]} b={[2.0, 540, 720]}>
    <Room wall={["#B9C6F0", "#8E9BD0"]} />
    <Hero id="me" x={540} y={1200} s={1.4} face="smug" gaze={0} pose={arms([-90, -60], [120, -230])} />
  </Cam>
);
const S22: ShotC = ({ t, d, w }) => {
  const n = Math.min(3, Math.floor(L(t, [0.2, d - 0.6], [1, 3.99])));
  const yw = w(wi(21, 6));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.1, 540, 900]}>
      <Room wall={["#F2D3C2", "#D9A98F"]} />
      <Shadow x={540} y={1470} s={1.6} />
      <Yawner id="me" x={540} y={1220} s={1.3} c="#2FA39A" t={t} t0={yw - 0.2} base="smile" />
      <g transform="translate(540 450)">
        <rect x={-230} y={-110} width={460} height={220} rx={24} fill="#2A2233" stroke={INK} strokeWidth={8} />
        <FitText x={0} y={50} text={`${n}`} maxW={300} fs={150} fill="#7CFF8A" />
      </g>
      {t > yw && <Confetti x={540} y={400} t={t - yw} n={40} />}
    </Cam>
  );
};

export const SHOTS: Shot[] = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22].map((C) => ({ C }));
