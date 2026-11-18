// «50/30/20 ережесі» — мультфильм, 21 сцена
import React from "react";
import { Easing } from "remotion";
import { INK, Person } from "./people";
import {
  arms, Beam, Bloom, Cam, Confetti, Desk, FitText, Hero, L, P, popS, Puffs, rnd, Room, Shadow, ShotC, Sign, Sky,
  SkyClouds, Sparkle, Suit, Sweat,
} from "./kit";
import { Shot } from "./film";
import { Bread, Bubble, Bus, Coin, House, Plane, wi } from "./mykit";

const JC = ["#4F6BD8", "#F28A2E", "#56BA6C"];
const Bill: React.FC<{ x: number; y: number; s?: number; rot?: number; wing?: number }> = ({ x, y, s = 1, rot = 0, wing }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} stroke={INK} strokeWidth={6} strokeLinejoin="round">
    {wing !== undefined && <><path d={`M-40,-30 Q-120,${-110 + wing * 40} -160,-40 Q-100,-40 -40,-10 Z`} fill="#fff" /><path d={`M40,-30 Q120,${-110 + wing * 40} 160,-40 Q100,-40 40,-10 Z`} fill="#fff" /></>}
    <rect x={-100} y={-50} width={200} height={100} rx={10} fill="#8DD48A" />
    <circle r={30} fill="#5FB35C" />
    <text x={0} y={14} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={40} fill={INK} stroke="none">₸</text>
  </g>
);
const Jar: React.FC<{ x: number; y: number; s?: number; c: string; fill: number; pct: string; label?: string }> = ({ x, y, s = 1, c, fill, pct, label }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeLinejoin="round">
    <clipPath id={`jar${x}`}><path d="M-120,-280 L120,-280 L140,-230 L140,0 Q140,40 100,40 L-100,40 Q-140,40 -140,0 L-140,-230 Z" /></clipPath>
    <path d="M-120,-280 L120,-280 L140,-230 L140,0 Q140,40 100,40 L-100,40 Q-140,40 -140,0 L-140,-230 Z" fill="#E9F6FF" strokeWidth={9} />
    <g clipPath={`url(#jar${x})`}>
      <rect x={-150} y={40 - 320 * fill} width={300} height={320} fill={c} />
      {fill > 0.05 && Array.from({ length: 6 }, (_, i) => <circle key={i} cx={-100 + i * 40} cy={40 - 320 * fill + 10} r={18} fill="#F2C55C" stroke={INK} strokeWidth={4} />)}
    </g>
    <rect x={-130} y={-310} width={260} height={40} rx={10} fill="#C98A55" strokeWidth={8} />
    <rect x={-100} y={-200} width={200} height={110} rx={14} fill="#fff" strokeWidth={6} />
    <FitText x={0} y={-125} text={pct} maxW={170} fs={70} />
    {label && <g transform="translate(0 110)"><Sign x={0} y={0} w={300} h={80} text={label} fs={44} bg="#FFF3C4" /></g>}
  </g>
);
const Piggy: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={8} strokeLinejoin="round">
    {[-80, -30, 50, 100].map((lx) => <rect key={lx} x={lx - 16} y={60} width={32} height={60} rx={8} fill="#F4A6B8" />)}
    <ellipse cx={0} cy={0} rx={170} ry={120} fill="#F4A6B8" />
    <path d="M-120,-90 L-100,-150 L-60,-105 Z" fill="#F4A6B8" />
    <ellipse cx={-170} cy={10} rx={40} ry={34} fill="#F28FA8" /><circle cx={-180} cy={5} r={7} fill={INK} /><circle cx={-160} cy={5} r={7} fill={INK} />
    <circle cx={-100} cy={-30} r={11} fill={INK} />
    <rect x={-20} y={-125} width={70} height={14} rx={6} fill={INK} />
    <path d={`M170,0 q30,${-20 + Math.sin(t * 6) * 10} 20,-50`} fill="none" strokeWidth={8} />
  </g>
);
const CoinTree: React.FC<{ x: number; y: number; g: number }> = ({ x, y, g }) => (
  <g transform={`translate(${x},${y}) scale(${0.3 + 0.7 * g})`} stroke={INK} strokeWidth={8} strokeLinejoin="round">
    <path d="M-20,0 L-14,-240 L14,-240 L20,0 Z" fill="#8A5A3B" />
    <circle cx={0} cy={-330} r={150} fill="#56BA6C" />
    {[[-70, -360], [60, -400], [80, -280], [-60, -260], [0, -330]].map(([cx, cy], i) => <g key={i} transform={`translate(${cx},${cy}) scale(${g})`}><circle r={30} fill="#F2C55C" /><text y={12} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={32} fill="#8A5A1B" stroke="none">₸</text></g>)}
  </g>
);
const Pie: React.FC<{ x: number; y: number; r: number; cut: number }> = ({ x, y, r, cut }) => {
  const seg = (a0: number, a1: number, c: string, off: number) => {
    const m = (a0 + a1) / 2, dx = Math.cos(m) * off, dy = Math.sin(m) * off;
    const p0 = [Math.cos(a0) * r, Math.sin(a0) * r], p1 = [Math.cos(a1) * r, Math.sin(a1) * r];
    return <path key={c} transform={`translate(${dx},${dy})`} d={`M0,0 L${p0} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p1} Z`} fill={c} stroke={INK} strokeWidth={9} strokeLinejoin="round" />;
  };
  const T = Math.PI * 2, s = -Math.PI / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      {seg(s, s + T * 0.5, JC[0], cut * 40)}{seg(s + T * 0.5, s + T * 0.8, JC[1], cut * 40)}{seg(s + T * 0.8, s + T, JC[2], cut * 40)}
      {cut > 0.5 && <><FitText x={r * 0.45} y={20} text="50%" maxW={180} fs={70} fill="#fff" /><FitText x={-r * 0.5} y={r * 0.35} text="30%" maxW={160} fs={60} fill="#fff" /><FitText x={-r * 0.35} y={-r * 0.4} text="20%" maxW={140} fs={54} fill="#fff" /></>}
    </g>
  );
};
const Icon: React.FC<{ x: number; y: number; s: number; children: React.ReactNode }> = ({ x, y, s, children }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle r={110} fill="#FFFDF6" stroke={INK} strokeWidth={8} />
    {children}
  </g>
);
const Calendar: React.FC<{ x: number; y: number; s?: number; mark?: number }> = ({ x, y, s = 1, mark = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={8} strokeLinejoin="round">
    <rect x={-300} y={-300} width={600} height={600} rx={30} fill="#FFFDF6" />
    <rect x={-300} y={-300} width={600} height={130} rx={30} fill="#E8484F" />
    {Array.from({ length: 20 }, (_, i) => <rect key={i} x={-260 + (i % 5) * 106} y={-140 + Math.floor(i / 5) * 106} width={84} height={84} rx={10} fill={i === 9 ? "#B9F0B0" : "#F4F1EA"} strokeWidth={5} />)}
    {mark > 0 && <circle cx={-260 + 4 * 106 + 42} cy={-140 + 106 + 42} r={60} fill="none" stroke="#E8484F" strokeWidth={12} pathLength={1} strokeDasharray={`${mark} 1`} />}
  </g>
);
const ThreeJars: React.FC<{ f: [number, number, number]; labels?: boolean }> = ({ f, labels }) => (
  <g>
    <Jar x={200} y={1250} s={0.95} c={JC[0]} fill={f[0]} pct="50%" label={labels ? "ҚАЖЕТ" : undefined} />
    <Jar x={540} y={1250} s={0.95} c={JC[1]} fill={f[1]} pct="30%" label={labels ? "ҚАЛАУ" : undefined} />
    <Jar x={880} y={1250} s={0.95} c={JC[2]} fill={f[2]} pct="20%" label={labels ? "БОЛАШАҚ" : undefined} />
  </g>
);

const S01: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.15, 540, 900]} b={[1.0, 540, 860]}>
    <Room wall={["#B9C6F0", "#8E9BD0"]} />
    <Window2 />
    {Array.from({ length: 7 }, (_, i) => {
      const ph = ((t * 0.7 + rnd(i)) % 1);
      return <Bill key={i} x={500 + ph * 500 * (rnd(i + 2) > 0.5 ? 1 : -0.6)} y={1000 - ph * 900} s={0.7} rot={Math.sin(t * 5 + i) * 20} wing={Math.sin(t * 20 + i)} />;
    })}
    <Shadow x={540} y={1470} s={1.5} />
    <Hero id="me" x={540} y={1230} s={1.15} face="shock" gaze={0} sweat={1} pose={arms([-150, -260], [150, -260])} />
  </Cam>
);
const Window2: React.FC = () => <rect x={680} y={260} width={300} height={360} fill="#9FD8FF" stroke={INK} strokeWidth={8} />;
const S02: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 1000]} b={[1.1, 540, 980]}>
    <Room wall={["#F7E3C8", "#E9C9A0"]} />
    <Beam pts="340,0 740,0 960,1300 120,1300" o={0.5} />
    {[0, 1, 2].map((i) => <g key={i} transform={`translate(${200 + i * 340} 1250) scale(${popS(t, w(wi(1, 1)) + i * 0.25 - 0.3)}) translate(${-(200 + i * 340)} -1250)`}>
      <Jar x={200 + i * 340} y={1250} s={0.95} c={JC[i]} fill={0} pct={["50%", "30%", "20%"][i]} /></g>)}
  </Cam>
);
const S03: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.15, 540, 880]}>
    <Room wall={["#2F3E78", "#22305E"]} />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={-700} y={300 + i * 60} width={2480} height={30} fill={i % 2 ? "#fff" : "#C2463F"} opacity={0.15} />)}
    <Beam pts="380,0 700,0 820,1300 260,1300" o={0.6} />
    <Person id="sen" x={540} y={1000} s={1.15} body="#2F6FE0" bodyDark="#1F4FB0" face="smile" gaze={0} pose={arms([-140, -200], [70, -10])}>
      <path d="M-100,-250 Q-110,-370 0,-370 Q110,-370 100,-250 Q120,-170 80,-130 Q90,-220 60,-290 Q0,-260 -60,-290 Q-90,-220 -80,-130 Q-120,-170 -100,-250 Z" fill="#F2E6C8" stroke={INK} strokeWidth={6} />
    </Person>
    <g stroke={INK} strokeWidth={8}><path d="M340,1120 L740,1120 L700,1460 L380,1460 Z" fill="#8A5A3B" /></g>
    <g transform="translate(540 1270)"><Sign x={0} y={0} w={260} h={80} text="СЕНАТОР" fs={44} bg="#FFF3C4" /></g>
  </Cam>
);
const S04: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.12, 540, 880]}>
    <Room wall={["#F2D3C2", "#D9A98F"]} />
    <Desk x={540} y={1250} w={860} />
    <ellipse cx={540} cy={1000} rx={360} ry={90} fill="#FFFDF6" stroke={INK} strokeWidth={8} />
    <g transform="translate(540 820) scale(1,0.6)"><Pie x={0} y={0} r={300} cut={L(t, [w(wi(3, 3)) - 0.2, w(wi(3, 3)) + 0.3], [0, 1])} /></g>
    <g transform={`translate(${880} ${620 + L(t, [0.2, 0.6, 0.9], [0, 140, 0])}) rotate(30)`} stroke={INK} strokeWidth={7}>
      <rect x={-20} y={-200} width={40} height={180} rx={8} fill="#C9CDD8" /><rect x={-26} y={-20} width={52} height={90} rx={10} fill="#2A2233" />
    </g>
  </Cam>
);
const JarScene = (k: 0 | 1 | 2, wordAt: number): ShotC => ({ t, d, w }) => {
  const f: [number, number, number] = [0, 0, 0];
  const pct = [0.5, 0.3, 0.2][k] * 1.6;
  f[k] = L(t, [w(wordAt) - 0.2, w(wordAt) + 0.7], [0, pct]);
  for (let i = 0; i < k; i++) f[i] = [0.5, 0.3, 0.2][i] * 1.6;
  const cx = 200 + k * 340;
  return (
    <Cam t={t} d={d} a={[1.0, 540, 1000]} b={[1.5, cx, 1060]}>
      <Room wall={["#F7E3C8", "#E9C9A0"]} />
      <ThreeJars f={f} labels />
      <Bloom x={cx} y={1100} r={300} o={0.4} />
      <Coin x={cx} y={L(t, [0, 0.6], [300, 900])} s={0.9} spin={t * 8} />
    </Cam>
  );
};
const S05 = JarScene(0, wi(4, 0));
const ItemsScene = (k: number, items: React.ReactNode[], ws: number[]): ShotC => ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.08, 540, 900]}>
    <Room wall={[["#CFE3EE", "#A7C4D6"], ["#F2D3C2", "#D9A98F"], ["#CDEFC7", "#A7D6A0"]][k] as [string, string]} />
    <Jar x={540} y={1450} s={0.9} c={JC[k]} fill={[0.8, 0.48, 0.32][k]} pct={["50%", "30%", "20%"][k]} />
    {items.map((it, i) => (
      <g key={i} transform={`translate(${[290, 790, 290, 790][i]} ${[430, 430, 820, 820][i]}) scale(${popS(t, w(ws[i]) - 0.1) * 1.3})`}>{it}</g>
    ))}
  </Cam>
);
const S06 = ItemsScene(0, [
  <Icon x={0} y={0} s={1}><House x={0} y={60} s={0.3} /></Icon>,
  <Icon x={0} y={0} s={1}><Bread x={0} y={30} s={0.6} /></Icon>,
  <Icon x={0} y={0} s={1}><Bus x={0} y={50} s={0.28} /></Icon>,
  <Icon x={0} y={0} s={1}><text y={40} textAnchor="middle" fontSize={110}>💡</text></Icon>,
], [wi(5, 0), wi(5, 1), wi(5, 2), wi(5, 3)]);
const S07 = JarScene(1, wi(6, 0));
const S08 = ItemsScene(1, [
  <Icon x={0} y={0} s={1}><text y={40} textAnchor="middle" fontSize={110}>☕</text></Icon>,
  <Icon x={0} y={0} s={1}><text y={40} textAnchor="middle" fontSize={110}>👕</text></Icon>,
  <Icon x={0} y={0} s={1}><text y={40} textAnchor="middle" fontSize={110}>🍿</text></Icon>,
  <Icon x={0} y={0} s={1}><Plane x={0} y={30} s={0.18} /></Icon>,
], [wi(7, 0), wi(7, 1), wi(7, 2), wi(7, 3)]);
const S09 = JarScene(2, wi(8, 1));
const S10: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 980]} b={[1.12, 540, 940]}>
    <Sky mode="day" /><SkyClouds x={250} y={350} s={1.2} />
    <rect x={-700} y={1300} width={2480} height={1400} fill="#7CC46A" />
    <Piggy x={300} y={1230} s={1.0} t={t} />
    <CoinTree x={780} y={1330} g={L(t, [w(wi(9, 2)) - 0.3, d], [0.2, 1])} />
    <Coin x={300} y={L(t, [0, 0.6], [400, 1080])} s={0.6} spin={t * 9} />
  </Cam>
);
const Check: React.FC<{ x: number; y: number; s?: number; amount: string }> = ({ x, y, s = 1, amount }) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(-4)`}>
    <rect x={-360} y={-180} width={720} height={360} rx={20} fill="#FFFDF6" stroke={INK} strokeWidth={9} />
    <rect x={-360} y={-180} width={720} height={80} rx={20} fill="#56BA6C" stroke={INK} strokeWidth={9} />
    <FitText x={0} y={-122} text="ЖАЛАҚЫ" maxW={400} fs={50} fill="#fff" />
    <FitText x={0} y={60} text={amount} maxW={600} fs={120} />
  </g>
);
const S11: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.12, 540, 860]}>
    <Room wall={["#CDEFC7", "#A7D6A0"]} />
    <Bloom x={540} y={760} r={400} o={0.4} />
    <g transform={`translate(540 500) scale(${popS(t, w(wi(10, 2)) - 0.1)})`}><Check x={0} y={0} amount="300 000 ₸" /></g>
    <Shadow x={540} y={1470} s={1.4} />
    <Hero id="me" x={540} y={1230} s={1.1} face="happy" gaze={0} pose={P.up()} />
  </Cam>
);
const SplitScene = (k: 0 | 1 | 2, amount: string, wordAt: number): ShotC => ({ t, d, w }) => {
  const f: [number, number, number] = [0, 0, 0];
  for (let i = 0; i < k; i++) f[i] = [0.8, 0.48, 0.32][i];
  f[k] = L(t, [w(wordAt) - 0.1, w(wordAt) + 0.6], [0, [0.8, 0.48, 0.32][k]]);
  const cx = 200 + k * 340;
  const fly = L(t, [w(wordAt) - 0.3, w(wordAt) + 0.4], [0, 1], Easing.inOut(Easing.quad));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 980]} b={[1.08, 540, 980]}>
      <Room wall={["#F7E3C8", "#E9C9A0"]} />
      <ThreeJars f={f} labels />
      <g transform={`translate(${540 + (cx - 540) * fly} ${450 + fly * 300}) scale(${1.2 - fly * 0.35})`}><Sign x={0} y={0} w={420} h={130} text={amount} fs={90} bg="#8DD48A" /></g>
    </Cam>
  );
};
const S12 = SplitScene(0, "150 000", wi(11, 0));
const S13 = SplitScene(1, "90 000", wi(12, 0));
const S14 = SplitScene(2, "60 000", wi(13, 1));
const Stack: React.FC<{ x: number; y: number; n: number }> = ({ x, y, n }) => (
  <g>{Array.from({ length: n }, (_, i) => <ellipse key={i} cx={x + Math.sin(i * 1.7) * 6} cy={y - i * 26} rx={90} ry={22} fill="#F2C55C" stroke={INK} strokeWidth={5} />)}</g>
);
const S15: ShotC = ({ t, d, w }) => {
  const n = Math.floor(L(t, [0.1, w(wi(14, 2)) + 0.4], [0, 12]));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.1, 540, 880]}>
      <Room wall={["#B9C6F0", "#8E9BD0"]} />
      {Array.from({ length: 12 }, (_, i) => <g key={i} opacity={i < n ? 1 : 0.15}><Stack x={140 + (i % 6) * 160} y={i < 6 ? 900 : 1300} n={3 + (i % 3)} /></g>)}
      <g transform="translate(540 1550)"><rect x={-320} y={-90} width={640} height={180} rx={24} fill="#2A2233" stroke={INK} strokeWidth={8} />
        <FitText x={0} y={36} text={`${(n * 60).toLocaleString("ru-RU")} 000 ₸`} maxW={560} fs={100} fill="#7CFF8A" /></g>
      <FitText x={540} y={420} text="12 АЙ" maxW={400} fs={100} fill="#fff" stroke={INK} sw={4} />
    </Cam>
  );
};
const S16: ShotC = ({ t, d }) => {
  const h = Math.floor(L(t, [0, d * 0.8], [5, 40]));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 1300]} b={[1.0, 540, 700]}>
      <Sky mode="day" /><SkyClouds x={200} y={300} s={1.2} /><SkyClouds x={900} y={700} s={1} />
      <rect x={-700} y={1500} width={2480} height={1400} fill="#7CC46A" />
      <g transform="translate(0 0)">{Array.from({ length: h }, (_, i) => <ellipse key={i} cx={540 + Math.sin(i * 1.3) * 8} cy={1500 - i * 30} rx={200} ry={40} fill="#F2C55C" stroke={INK} strokeWidth={6} />)}</g>
      <Hero id="me" x={540} y={1500 - h * 30 - 160} s={0.8} face="happy" gaze={0} pose={P.up()} />
      <g transform={`translate(540 ${1500 - h * 30 - 400})`}><Sign x={0} y={0} w={520} h={120} text="3 600 000 ₸" fs={80} bg="#FFE04A" /></g>
    </Cam>
  );
};
const S17: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.1, 540, 900]}>
    <Room wall={["#F2D3C2", "#D9A98F"]} />
    <Shadow x={540} y={1470} s={1.4} />
    <Hero id="me" x={540} y={1230} s={1.1} face="blink" gaze={0} pose={P.hug()} />
    {[[230, 500, wi(16, 2), "🏝️"], [540, 360, wi(16, 3), "🚗"], [850, 500, wi(16, 8), "😴"]].map(([x, y, j, e], i) => (
      <g key={i} transform={`translate(${x} ${y}) scale(${popS(t, w(j as number) - 0.1)})`}><Bubble x={0} y={0} s={0.55} tail={[(540 - (x as number)) * 0.5, 300]}><text y={50} textAnchor="middle" fontSize={170}>{e as string}</text></Bubble></g>
    ))}
  </Cam>
);
const S18: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.08, 540, 900]}>
    <Room wall={["#CFE3EE", "#A7C4D6"]} />
    <g transform={`translate(300 760) scale(${popS(t, w(wi(17, 3)) - 0.1)})`} stroke={INK} strokeWidth={10}>
      <circle r={180} fill="#fff" /><circle r={180} fill="none" stroke="#E8484F" strokeWidth={60} strokeDasharray="94 47" /><circle r={90} fill="#CFE3EE" />
      <g transform="translate(0 260)"><Sign x={0} y={0} w={280} h={90} text="3–6 АЙ" fs={56} bg="#FFF3C4" /></g>
    </g>
    <g transform="translate(780 900)" stroke={INK} strokeWidth={8}>
      <rect x={-200} y={-300} width={400} height={420} rx={20} fill="#FFFDF6" />
      <path d={`M-160,80 L-80,20 L0,40 L${L(t, [w(wi(17, 7)), d], [0, 160])},${L(t, [w(wi(17, 7)), d], [40, -220])}`} fill="none" stroke="#56BA6C" strokeWidth={16} strokeLinecap="round" />
    </g>
  </Cam>
);
const S19: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.2, 540, 900]} b={[1.4, 540, 860]}>
    <Room wall={["#3B3A5A", "#2A2948"]} />
    <Beam pts="380,0 700,0 860,1300 220,1300" o={0.6} />
    <Hero id="me" x={540} y={1200} s={1.3} face="smug" gaze={0} pose={P.pointR()} />
    {[0, 1].map((i) => <Sparkle key={i} x={320 + i * 440} y={500} s={1 + 0.3 * Math.sin(t * 8 + i)} />)}
  </Cam>
);
const S20: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 820]} b={[1.12, 540, 800]}>
    <Room wall={["#F7E3C8", "#E9C9A0"]} />
    <Calendar x={540} y={700} s={1.1} mark={L(t, [w(wi(19, 4)) - 0.2, w(wi(19, 6)) + 0.2], [0, 1])} />
    <g transform="translate(540 1200)"><Sign x={0} y={0} w={560} h={110} text="ЖАЛАҚЫ КҮНІ" fs={70} bg="#B9F0B0" /></g>
    <Piggy x={300} y={1500} s={0.8} t={t} />
    <Coin x={300} y={L(t, [w(wi(19, 7)), w(wi(19, 7)) + 0.4], [1200, 1400])} s={0.6} spin={t * 9} />
  </Cam>
);
const S21: ShotC = ({ t, d, w }) => {
  const bills = t > w(wi(20, 3));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.12, 540, 900]}>
      <Room wall={["#CDEFC7", "#A7D6A0"]} />
      <Piggy x={300} y={1300} s={0.9} t={t} />
      <Hero id="me" x={560} y={1230} s={1.1} face="happy" gaze={-0.6} pose={P.hold([-140, -100])} />
      <Coin x={L(t, [0.2, 0.8], [440, 300])} y={L(t, [0.2, 0.8], [1100, 1180])} s={0.5} spin={t * 9} />
      {bills && <g transform={`translate(860 900) scale(${popS(t, w(wi(20, 3)))})`}>
        {["ПӘТЕР", "ТОК", "СУ"].map((b, i) => <g key={b} transform={`translate(0 ${i * 120 - 120})`}><Sign x={0} y={0} w={240} h={90} text={b} fs={50} bg="#FFB4AE" /></g>)}
      </g>}
      {t > w(wi(20, 1)) && <Sparkle x={300} y={1050} s={1.2} />}
    </Cam>
  );
};

export const SHOTS: Shot[] = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21].map((C) => ({ C }));
