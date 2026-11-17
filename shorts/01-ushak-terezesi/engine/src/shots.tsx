// «Ұшақтың терезесі неге дөңгелек?» — 22 сцены, по одной на фразу (порядок как scenes в plan.json)
import React from "react";
import { Easing } from "remotion";
import { INK, Person } from "./people";
import {
  arms, Beam, Bloom, Burst, Cam, Confetti, Desk, FitText, Hero, L, P, popS, Puffs, Rain, rnd, Room, Shadow, ShotC, Sign,
  Sky, SkyClouds, Sparkle, SpeedLines, Suit, Sweat, Window,
} from "./kit";
import { Shot } from "./film";
import { Arrow, Bolt, Bomb, Bubble, Bus, Crack, Grass, House, Plane, Runway, wi } from "./mykit";

// big porthole: round (or square) window in a fuselage wall, sky behind
const Porthole: React.FC<{ x: number; y: number; s?: number; square?: number; t: number; children?: React.ReactNode }> = ({ x, y, s = 1, square = 0, t, children }) => {
  const rx = 170 - square * 20, ry = 230 - square * 50, r = 160 * (1 - square) + 14;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <clipPath id={`ph${x}${y}`}><rect x={-rx} y={-ry} width={rx * 2} height={ry * 2} rx={Math.min(r, rx)} /></clipPath>
      <g clipPath={`url(#ph${x}${y})`}>
        <rect x={-300} y={-300} width={600} height={600} fill="url(#sky-day)" />
        <SkyClouds x={-60 + ((t * 60) % 300)} y={40} s={0.8} />
        {children}
      </g>
      <rect x={-rx - 26} y={-ry - 26} width={(rx + 26) * 2} height={(ry + 26) * 2} rx={Math.min(r + 26, rx + 26)} fill="none" stroke="#E9E6DE" strokeWidth={40} />
      <rect x={-rx - 46} y={-ry - 46} width={(rx + 46) * 2} height={(ry + 46) * 2} rx={Math.min(r + 46, rx + 46)} fill="none" stroke={INK} strokeWidth={7} />
      <rect x={-rx} y={-ry} width={rx * 2} height={ry * 2} rx={Math.min(r, rx)} fill="none" stroke={INK} strokeWidth={7} />
      <path d={`M${-rx * 0.7},${-ry * 0.3} L${-rx * 0.1},${-ry * 0.85} L${rx * 0.15},${-ry * 0.85} L${-rx * 0.7},${ry * 0.05} Z`} fill="#fff" opacity={0.35} />
    </g>
  );
};
const CabinWall: React.FC = () => (
  <g>
    <rect x={-700} y={-700} width={2480} height={3400} fill="#E4E1D8" />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-700 + i * 220} y={-700} width={14} height={3400} fill="#CFCAC0" />)}
    <rect x={-700} y={1350} width={2480} height={1200} fill="#5B6FA8" />
  </g>
);
const Seat: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = "#3D5BA8" }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={7} strokeLinejoin="round">
    <rect x={-90} y={-330} width={180} height={300} rx={40} fill={c} />
    <rect x={-80} y={-345} width={160} height={60} rx={20} fill="#fff" />
    <rect x={-110} y={-60} width={220} height={70} rx={20} fill={c} />
  </g>
);
const Beret: React.FC = () => (
  <g stroke={INK} strokeWidth={6} strokeLinejoin="round">
    <ellipse cx={-10} cy={-318} rx={100} ry={36} fill="#D2343F" />
    <circle cx={-14} cy={-356} r={10} fill="#D2343F" />
  </g>
);
// water tank with fuselage section
const Tank: React.FC<{ t: number; fill: number; pump?: number }> = ({ t, fill, pump = 0 }) => (
  <g stroke={INK} strokeLinejoin="round">
    <rect x={60} y={420} width={960} height={900} rx={20} fill="#CFE9F7" strokeWidth={9} />
    <rect x={66} y={1320 - 890 * fill} width={948} height={890 * fill} fill="#5FB6E8" opacity={0.8} stroke="none" />
    {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={150 + rnd(i) * 780} cy={1300 - ((t * 120 + rnd(i + 3) * 800) % (880 * fill + 1))} r={8 + rnd(i) * 8} fill="#fff" opacity={0.6} strokeWidth={3} />)}
    <g transform={`translate(540 ${870}) scale(${1 + pump * 0.04},${1 + pump * 0.06})`}>
      <rect x={-380} y={-180} width={760} height={360} rx={180} fill="#F4F1EA" strokeWidth={9} />
      {[-240, -80, 80, 240].map((wx) => <rect key={wx} x={wx - 34} y={-60} width={68} height={68} rx={3} fill="#9FD8FF" strokeWidth={6} />)}
      <rect x={-380} y={30} width={760} height={18} fill="#2F6FE0" stroke="none" />
    </g>
    <rect x={40} y={400} width={1000} height={36} rx={10} fill="#8E93A3" strokeWidth={8} />
  </g>
);
// pressure arrows pointing outward from the fuselage (inflation)
const OutArrows: React.FC<{ cx: number; cy: number; r: number; p: number; n?: number }> = ({ cx, cy, r, p, n = 8 }) => (
  <g>{Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return <Arrow key={i} x1={cx + Math.cos(a) * r} y1={cy + Math.sin(a) * r * 0.55} x2={cx + Math.cos(a) * (r + 150)} y2={cy + Math.sin(a) * (r * 0.55 + 150)} p={p} c="#F28A2E" w={20} />;
  })}</g>
);

const S01: ShotC = ({ t, d, w }) => {
  const sq = 1 - L(t, [w(wi(0, 5)) - 0.3, w(wi(0, 5))], [0, 1]);
  return (
    <Cam t={t} d={d} a={[1.25, 540, 860]} b={[1.05, 540, 900]}>
      <CabinWall />
      <Porthole x={540} y={820} s={1.6} square={sq} t={t}>
        <Plane x={80} y={60} s={0.18} rot={-6} />
      </Porthole>
      {sq > 0.5 && <text x={880} y={480} fontFamily="Montserrat" fontWeight={900} fontSize={170} fill="#F2C55C" stroke={INK} strokeWidth={6}>?</text>}
      {sq < 0.5 && <Sparkle x={860} y={460} s={1.4} />}
    </Cam>
  );
};
const S02: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.12, 540, 860]}>
    <Sky mode="day" /><SkyClouds x={200} y={300} s={1.3} /><SkyClouds x={900} y={160} s={1} />
    <Grass y={1240} />
    <Shadow x={540} y={1250} s={3.4} />
    <House x={540} y={1240} s={1.5} />
    <g transform={`scale(${popS(t, 0.25)})`} style={{ transformOrigin: "405px 820px" }}><rect x={330} y={850} width={150} height={150} fill="none" stroke="#E8484F" strokeWidth={10} strokeDasharray="20 12" /></g>
  </Cam>
);
const S03: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 560, 960]} b={[1.08, 520, 940]}>
    <Sky mode="day" /><SkyClouds x={300} y={300} s={1.2} />
    <rect x={-700} y={1150} width={2480} height={1400} fill="#8C8698" />
    <rect x={-700} y={1250} width={2480} height={16} fill="#F4F1EA" />
    <House x={160} y={1150} s={0.7} c="#9FD8C8" roof="#7A2E44" /><House x={930} y={1150} s={0.6} />
    <Bus x={1200 - t * 260} y={1240} s={1.15} t={t} />
    <Puffs x={1600 - t * 260} y={1200} t={t} n={6} c="#D8D2C8" size={0.5} life={1} />
  </Cam>
);
const S04: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[0.9, 540, 900]} b={[1.25, 560, 860]}>
    <Sky mode="day" /><SkyClouds x={150} y={400} s={1.6} /><SkyClouds x={950} y={1300} s={1.4} /><SkyClouds x={600} y={150} s={0.9} />
    <SpeedLines x={540} y={900} t={t} n={14} r0={500} r1={900} o={0.25} />
    <Plane x={560 - t * 20} y={900 + Math.sin(t * 2) * 10} s={1.25} rot={-4} />
    {t > w(wi(3, 4)) && <g>{[0, 1, 2].map((i) => <Sparkle key={i} x={560 + (i - 1) * 90} y={830} s={popS(t, w(wi(3, 4)) + i * 0.12)} />)}</g>}
  </Cam>
);
const S05: ShotC = ({ t, d, w }) => {
  const paint = L(t, [0.2, d - 0.3], [0, 1]);
  return (
    <Cam t={t} d={d} a={[1.0, 540, 960]} b={[1.15, 600, 900]}>
      <Room wall={["#F2D3C2", "#D9A98F"]} />
      <Window x={60} y={260} w={260} h={360} mode="day" />
      <g stroke={INK} strokeWidth={8} strokeLinecap="round"><line x1={640} y1={1260} x2={720} y2={700} /><line x1={940} y1={1260} x2={860} y2={700} /></g>
      <rect x={560} y={560} width={460} height={520} rx={8} fill="#FFFDF6" stroke={INK} strokeWidth={8} />
      <ellipse cx={790} cy={820} rx={130 * paint} ry={170 * paint} fill="#9FD8FF" stroke={INK} strokeWidth={8} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${700 + i * 50},1000 q15,-20 30,0`} fill="none" stroke="#E8484F" strokeWidth={8} opacity={paint > 0.6 ? 1 : 0} />)}
      <Shadow x={330} y={1470} s={1.5} />
      <Person id="artist" x={330} y={1200} s={1.3} body="#7B61FF" bodyDark="#5A43D0" face={t > w(wi(4, 5)) ? "smug" : "smile"} gaze={0.6} pose={arms([-60, -20], [150, -190])}>
        <Beret />
        <g transform="translate(150,-190) rotate(30)"><rect x={-6} y={-90} width={12} height={90} fill="#C98A55" stroke={INK} strokeWidth={4} /><circle cx={0} cy={-94} r={10} fill="#9FD8FF" stroke={INK} strokeWidth={4} /></g>
      </Person>
    </Cam>
  );
};
const S06: ShotC = ({ t, d }) => {
  const flash = (t % 1.3) < 0.08 ? 1 : 0;
  return (
    <Cam t={t} d={d} a={[1.1, 540, 900]} b={[1.0, 540, 960]} shake={flash * 8}>
      <Sky mode="noir" />
      <Rain t={t} x={-200} y={-200} w={1500} h={2400} n={80} o={0.5} />
      <Bolt x={300} y={500} s={2.2 * (0.6 + flash)} />
      <Plane x={600} y={1000} s={1.1} rot={-8} body="#C9C4D6" stripe="#5A5470" />
      {flash > 0 && <rect x={-700} y={-700} width={2480} height={3400} fill="#fff" opacity={0.35} />}
    </Cam>
  );
};
const S07: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 980]} b={[1.2, 600, 980]}>
    <Sky mode="dusk" /><SkyClouds x={250} y={420} s={1.4} />
    <Runway y={1180} />
    <Plane x={600} y={1110} s={1.15} square label="КОМЕТА" stripe="#C2463F" />
    <g transform={`translate(540 520) scale(${popS(t, w(wi(6, 6)) - 0.1)})`}>
      <rect x={-260} y={-90} width={520} height={180} rx={20} fill="#FFF3C4" stroke={INK} strokeWidth={8} />
      <FitText x={0} y={34} text="«КОМЕТА»" maxW={460} fs={100} fill="#C2463F" />
    </g>
  </Cam>
);
const S08: ShotC = ({ t, d }) => {
  const k = L(t, [0, d], [0, 1], Easing.in(Easing.quad));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 1000]} b={[1.0, 640, 760]} shake={3}>
      <Sky mode="dusk" /><SkyClouds x={250} y={420} s={1.4} />
      <Runway y={1180} />
      <Puffs x={300 - k * 200} y={1150 - k * 200} t={t} n={10} c="#EADFC9" size={0.8} life={0.9} />
      <Plane x={560 + k * 300} y={1110 - k * 500} s={1.15} rot={-14 * k - 2} square stripe="#C2463F" label="КОМЕТА" />
      <SpeedLines x={560} y={900} t={t} n={10} r0={600} r1={1000} o={0.3} />
    </Cam>
  );
};
const S09: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[2.2, 520, 1000]} b={[2.5, 600, 1000]}>
    <Sky mode="dusk" />
    <Plane x={560} y={1060} s={1.2} square stripe="#C2463F" label="КОМЕТА" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={430 + i * 86} y={980} width={56} height={56} fill="none" stroke="#FFE04A" strokeWidth={6} strokeDasharray="10 6" opacity={(t * 3 + i) % 2 > 1 ? 1 : 0.4} />)}
  </Cam>
);
const S10: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.12, 520, 900]}>
    <CabinWall />
    {[230, 560, 890].map((x, i) => <Porthole key={x} x={x} y={560} s={0.42} square={1} t={t + i} />)}
    {[[230, "#E8484F", "happy"], [560, "#F2C55C", "smile"], [890, "#56BA6C", "happy"]].map(([x, c, f], i) => (
      <g key={i}>
        <Seat x={x as number} y={1370} s={1.1} />
        <Person id={`p${i}`} x={x as number} y={1170 + Math.abs(Math.sin(t * 6 + i)) * -10} s={0.95} body={c as string} bodyDark={INK} face={f as "happy"} gaze={0} pose={i === 1 ? P.hold([90, -170]) : P.up()}>
          {i === 1 && <g transform="translate(90,-170)"><rect x={-24} y={-60} width={48} height={64} rx={6} fill="#fff" stroke={INK} strokeWidth={5} /><rect x={-20} y={-40} width={40} height={40} fill="#F28A2E" /></g>}
        </Person>
      </g>
    ))}
    {[["ЖЫЛДАМ", 49], ["БИІК", 50], ["ЖАЙЛЫ", 51]].map(([s, j], i) => (
      <g key={i} transform={`translate(${230 + i * 330} 930) scale(${popS(t, w(j as number) - 0.05)})`}>
        <Sign x={0} y={0} w={280} h={90} text={s as string} fs={50} bg={["#FFE04A", "#9FD8FF", "#B9F0B0"][i]} />
      </g>
    ))}
  </Cam>
);
const S11: ShotC = ({ t, d, w }) => {
  const b = L(t, [w(wi(10, 7)) - 0.1, w(wi(10, 7)) + 0.7], [0, 1], Easing.out(Easing.cubic));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.15, 540, 960]} shake={b > 0 && b < 0.6 ? 10 : 0}>
      <Sky mode="noir" />
      <SkyClouds x={150} y={500} s={1.2} />
      <g transform={`translate(${380 - L(t, [0, 1.2], [0, 1]) * 200} 330) scale(0.9)`}>
        <rect x={-110} y={-110} width={220} height={220} rx={14} fill="#FFFDF6" stroke={INK} strokeWidth={7} />
        <rect x={-110} y={-110} width={220} height={60} rx={14} fill="#E8484F" stroke={INK} strokeWidth={7} />
        <FitText x={0} y={60} text="1954" maxW={180} fs={80} />
      </g>
      <Plane x={560} y={950 + b * 300} s={1.15} square stripe="#C2463F" broken={b} />
      {b > 0 && <Burst x={560} y={900 + b * 200} r={180 * Math.min(1, b * 2)} rot={t * 40} />}
      <Puffs x={560} y={950} t={t - w(wi(10, 7))} n={14} c="#8E93A3" size={1} life={1.2} spread={500} />
    </Cam>
  );
};
const Engs: React.FC<{ t: number; face: "worried" | "shock" }> = ({ t, face }) => (
  <g>
    <Shadow x={300} y={1470} s={1.4} /><Shadow x={780} y={1470} s={1.4} />
    <Suit id="e1" x={300} y={1240} s={1.15} hat="helmet" face={face} gaze={0.4} sweat={0.8} pose={arms([-70, -10], [70, -330 + Math.sin(t * 12) * 10])} />
    <Suit id="e2" x={780} y={1240} s={1.15} hat="helmet" face={face} gaze={-0.4} pose={arms([-70, -330 + Math.cos(t * 12) * 10], [70, -10])} />
  </g>
);
const S12: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.15, 540, 1000]} b={[1.0, 540, 960]}>
    <Room wall={["#7C8FD0", "#5968A8"]} />
    <rect x={180} y={300} width={720} height={420} rx={10} fill="#2B4A7A" stroke={INK} strokeWidth={8} />
    <g transform="translate(540 510) scale(0.5)"><Plane x={0} y={0} square broken={0.6} body="#E9F2FF" stripe="#9FD8FF" /></g>
    <Engs t={t} face="worried" />
  </Cam>
);
const S13: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 960]} b={[1.1, 540, 900]}>
    <Room wall={["#7C8FD0", "#5968A8"]} />
    <Engs t={t} face="shock" />
    <g transform={`translate(260 560) scale(${popS(t, w(wi(12, 0)) - 0.1)})`}><Bubble x={0} y={0} s={0.85} tail={[60, 260]}><Bomb x={0} y={20} s={1.1} t={t} /></Bubble></g>
    <g transform={`translate(820 520) scale(${popS(t, w(wi(12, 2)) - 0.1)})`}><Bubble x={0} y={0} s={0.85} tail={[-60, 270]}><Bolt x={0} y={0} s={1.2} /></Bubble></g>
  </Cam>
);
const S14: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[0.92, 540, 900]} b={[1.08, 540, 880]}>
    <Room wall={["#A9CDB8", "#7FA893"]} floorY={1330} />
    <Tank t={t} fill={L(t, [0, d * 0.8], [0.1, 0.95])} />
    <Suit id="e3" x={150} y={1420} s={0.9} hat="helmet" face="look" gaze={0.6} pose={P.pointR()} />
  </Cam>
);
const S15: ShotC = ({ t, d }) => {
  const n = Math.min(1000, Math.round(L(t, [0, d], [1, 1000], Easing.in(Easing.quad))));
  const pump = Math.abs(Math.sin(t * 12));
  return (
    <Cam t={t} d={d} a={[1.1, 540, 880]} b={[1.2, 540, 860]}>
      <Room wall={["#A9CDB8", "#7FA893"]} floorY={1330} />
      <Tank t={t} fill={0.95} pump={pump} />
      <g transform="translate(540 300)">
        <rect x={-260} y={-100} width={520} height={200} rx={20} fill="#2A2233" stroke={INK} strokeWidth={8} />
        <FitText x={0} y={40} text={`${n}${n >= 1000 ? "+" : ""}`} maxW={440} fs={130} fill="#7CFF8A" />
      </g>
    </Cam>
  );
};
const BigWindow: React.FC<{ round?: boolean }> = ({ round }) => (
  <g stroke={INK} strokeLinejoin="round">
    <rect x={-700} y={-700} width={2480} height={3400} fill="#E9E6DE" />
    {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={-600 + (i % 10) * 240} cy={200 + Math.floor(i / 10) * 700} r={10} fill="#C8C3B8" strokeWidth={3} />)}
    {round
      ? <ellipse cx={540} cy={900} rx={300} ry={380} fill="#9FD8FF" strokeWidth={10} />
      : <rect x={240} y={560} width={600} height={600} rx={8} fill="#9FD8FF" strokeWidth={10} />}
  </g>
);
const S16: ShotC = ({ t, d, w }) => {
  const at = w(wi(15, 3));
  const m = L(t, [0, at], [0, 1]);
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.6, 780, 640]}>
      <BigWindow />
      <Crack x={830} y={570} s={1.4} rot={150} p={L(t, [at, at + 0.6], [0, 1])} />
      <g transform={`translate(${300 + m * 470} ${1100 - m * 500})`}>
        <circle r={130} fill="#fff" fillOpacity={0.25} stroke={INK} strokeWidth={12} />
        <circle r={118} fill="none" stroke="#C99B3F" strokeWidth={8} />
        <line x1={92} y1={92} x2={230} y2={230} stroke={INK} strokeWidth={34} strokeLinecap="round" />
        <line x1={92} y1={92} x2={230} y2={230} stroke="#8A5A3B" strokeWidth={20} strokeLinecap="round" />
      </g>
      {t > at && <Bloom x={840} y={560} r={200} o={0.6} c="R" />}
    </Cam>
  );
};
const S17: ShotC = ({ t, d }) => {
  const k = 0.5 + 0.5 * Math.sin(t * 2.4 - 1.6);
  return (
    <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.08, 540, 920]}>
      <Sky mode="day" /><SkyClouds x={200} y={300} s={1.2} /><SkyClouds x={900} y={1500} s={1.3} />
      <g transform={`translate(540 940) scale(${1 + k * 0.12},${1 + k * 0.22})`}><Plane x={0} y={50} s={1.15} square /></g>
      <OutArrows cx={560} cy={900} r={360} p={0.4 + k * 0.6} />
    </Cam>
  );
};
const CornerZoom: React.FC<{ t: number; p: number; crack: number }> = ({ t, p, crack }) => (
  <g>
    <BigWindow />
    {[[-260, 1280], [540, 1450], [1320, 1100], [1300, 200]].map(([x, y], i) =>
      <Arrow key={i} x1={x} y1={y} x2={820 - (i % 2) * 10} y2={580 + (i % 2) * 10} p={p * (0.8 + 0.2 * Math.sin(t * 5 + i))} c="#F28A2E" w={24} />)}
    <circle cx={840} cy={575} r={60 + Math.sin(t * 20) * 10} fill="#E8484F" opacity={0.35 * p} />
    <Crack x={830} y={570} s={1.6} rot={150} p={crack} />
  </g>
);
const S18: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[0.9, 540, 900]} b={[1.2, 700, 700]}>
    <CornerZoom t={t} p={L(t, [0, 1.2], [0, 1])} crack={0} />
  </Cam>
);
const S19: ShotC = ({ t, d, w }) => {
  const at = w(wi(18, 2));
  return (
    <Cam t={t} d={d} a={[1.4, 760, 640]} b={[1.7, 800, 600]} shake={t > at && t < at + 0.4 ? 14 : 0}>
      <CornerZoom t={t} p={1} crack={L(t, [0, at], [0.2, 1])} />
      {t > at && <><Burst x={840} y={580} r={L(t, [at, at + 0.2], [40, 200])} rot={t * 50} /><Puffs x={840} y={580} t={t - at} n={10} c="#C8C3B8" size={0.7} life={0.8} /></>}
    </Cam>
  );
};
const S20: ShotC = ({ t, d, w }) => {
  const p = L(t, [w(wi(19, 5)) - 0.2, w(wi(19, 7))], [0, 1]);
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.1, 540, 900]}>
      <BigWindow round />
      <Bloom x={540} y={900} r={460} o={0.5 * p} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2, R0 = 330, R1 = 470;
        return <Arrow key={i} x1={540 + Math.cos(a) * R0 * 0.9} y1={900 + Math.sin(a) * R0 * 1.15} x2={540 + Math.cos(a) * R1 * 0.9} y2={900 + Math.sin(a) * R1 * 1.15} p={p} c="#56BA6C" w={18} />;
      })}
      <SkyClouds x={500 + ((t * 40) % 100)} y={900} s={0.9} />
      {p > 0.9 && <><Sparkle x={300} y={560} s={1.2} /><Sparkle x={800} y={1250} s={1} /></>}
    </Cam>
  );
};
const S21: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 960]} b={[1.25, 420, 860]}>
    <CabinWall />
    <Porthole x={300} y={760} s={1.0} t={t}><Plane x={30} y={80} s={0.12} /></Porthole>
    <Seat x={680} y={1380} s={1.25} c="#D2343F" />
    <Hero id="pass" x={680} y={1150} s={1.15} face="look" gaze={-0.9} pose={arms([-70, -200], [60, -20])} />
  </Cam>
);
const S22: ShotC = ({ t, d, w }) => {
  const k = L(t, [0, w(wi(21, 5))], [0, 1], Easing.out(Easing.quad));
  const happy = t > w(wi(21, 4));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.12, 540, 1000]}>
      <Sky mode="day" /><SkyClouds x={250} y={350} s={1.5} /><SkyClouds x={950} y={220} s={1.1} />
      <Runway y={1180} />
      <Plane x={-300 + k * 620} y={760 + k * 360} s={0.95} rot={8 - 8 * k} />
      {happy && <Confetti x={540} y={500} t={t - w(wi(21, 4))} n={50} />}
      <Shadow x={900} y={1420} s={1.2} />
      <Hero id="win" x={900} y={1230} s={0.95} face={happy ? "happy" : "smile"} gaze={-0.5} pose={happy ? P.up() : P.stand()} />
    </Cam>
  );
};

export const SHOTS: Shot[] = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22].map((C) => ({ C }));
