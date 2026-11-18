// «Қарақшы капитандар туралы 5 факт» — мультфильм, 23 сцена
import React from "react";
import { Easing } from "remotion";
import { INK, Person } from "./people";
import {
  arms, Beam, Bloom, Burst, Cam, Confetti, FitText, Hero, L, P, popS, Puffs, Rain, rnd, Room, Shadow, ShotC, Sign, Sky,
  SkyClouds, Sparkle, SpeedLines, Sweat,
} from "./kit";
import { Shot } from "./film";
import { Bolt, Bubble, Coin, Sun, wi } from "./mykit";

const GOLD = "#FEC50C";
type FaceT = React.ComponentProps<typeof Person>["face"];

// ---------------------------------------------------------------- props
const Sea: React.FC<{ y: number; t: number; c?: [string, string]; storm?: boolean }> = ({ y, t, c = ["#1F5FA8", "#2F86D8"], storm }) => (
  <g>
    <rect x={-700} y={y} width={2480} height={1800} fill={c[0]} />
    {Array.from({ length: 5 }, (_, r) => (
      <path key={r} d={Array.from({ length: 28 }, (_, i) => {
        const x = -700 + i * 100, yy = y + r * 120 + Math.sin(i * 0.9 + t * (storm ? 4 : 2) + r) * (storm ? 30 : 14);
        return `${i ? "L" : "M"}${x},${yy}`;
      }).join(" ") + ` L2100,${y + 1800} L-700,${y + 1800} Z`} fill={r % 2 ? c[1] : c[0]} stroke={INK} strokeWidth={5} opacity={0.95} />
    ))}
  </g>
);
const SkullFlag: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => {
  const wv = (k: number) => Math.sin(t * 7 - k * 3) * 14 * k;
  const pts = Array.from({ length: 7 }, (_, i) => i / 6);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d={`M${pts.map((k) => `${k * 260},${wv(k)}`).join(" L")} L${pts.slice().reverse().map((k) => `${k * 260},${170 + wv(k)}`).join(" L")} Z`} fill="#15131C" stroke={INK} strokeWidth={5} />
      <g transform={`translate(130,${80 + wv(0.5)})`} fill="#F4F1EA" stroke="none">
        <circle cy={-14} r={34} /><rect x={-20} y={10} width={40} height={18} rx={4} />
        <circle cx={-12} cy={-16} r={9} fill="#15131C" /><circle cx={12} cy={-16} r={9} fill="#15131C" />
        <g stroke="#F4F1EA" strokeWidth={12} strokeLinecap="round"><line x1={-60} y1={-40} x2={60} y2={50} /><line x1={60} y1={-40} x2={-60} y2={50} /></g>
      </g>
    </g>
  );
};
const Ship: React.FC<{ x: number; y: number; s?: number; t: number; rock?: number; sail?: string }> = ({ x, y, s = 1, t, rock = 4, sail = "#F4EAD2" }) => (
  <g transform={`translate(${x},${y + Math.sin(t * 2) * 10}) rotate(${Math.sin(t * 1.6) * rock}) scale(${s})`} stroke={INK} strokeWidth={8} strokeLinejoin="round">
    <line x1={-120} y1={-40} x2={-120} y2={-620} strokeWidth={14} /><line x1={120} y1={-40} x2={120} y2={-520} strokeWidth={14} />
    <path d={`M-260,-560 Q${-120 + Math.sin(t * 3) * 20},-480 20,-560 L10,-260 Q-120,-200 -250,-260 Z`} fill={sail} />
    <path d={`M-240,-250 Q${-120 + Math.sin(t * 3) * 20},-180 0,-250 L-10,-80 Q-120,-40 -230,-80 Z`} fill={sail} />
    <path d={`M20,-470 Q${130 + Math.sin(t * 3 + 1) * 20},-400 240,-470 L230,-200 Q130,-150 30,-200 Z`} fill={sail} />
    <SkullFlag x={-120} y={-760} s={0.6} t={t} />
    <path d="M-420,-60 L420,-60 Q400,60 320,110 L-300,110 Q-400,40 -420,-60 Z" fill="#7A4A2E" />
    <path d="M300,-60 L420,-140 L440,-60 Z" fill="#7A4A2E" />
    <rect x={-420} y={-160} width={150} height={100} fill="#8A5A3B" />
    {[-200, -60, 80, 220].map((cx) => <circle key={cx} cx={cx} cy={10} r={20} fill="#2A2233" strokeWidth={6} />)}
    <line x1={-420} y1={-30} x2={420} y2={-30} stroke={GOLD} strokeWidth={10} />
  </g>
);
const Junk: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x},${y + Math.sin(t * 2 + x) * 8}) scale(${s})`} stroke={INK} strokeWidth={8} strokeLinejoin="round">
    <path d="M-280,-40 L280,-40 Q300,40 220,80 L-220,80 Q-300,40 -280,-40 Z" fill="#8A5A3B" />
    <path d="M-280,-40 L-320,-110 L-220,-40 Z M280,-40 L320,-110 L220,-40 Z" fill="#8A5A3B" />
    {[-90, 100].map((sx, i) => <g key={sx}>
      <line x1={sx} y1={-40} x2={sx} y2={-480 + i * 60} strokeWidth={10} />
      <path d={`M${sx - 10},${-460 + i * 60} Q${sx + 160},${-420 + i * 60} ${sx + 150},-80 L${sx - 10},-80 Z`} fill="#D2343F" />
      {[0, 1, 2, 3].map((k) => <line key={k} x1={sx - 10} y1={-380 + i * 60 + k * 80} x2={sx + 150} y2={-370 + i * 60 + k * 80} strokeWidth={5} />)}
    </g>)}
  </g>
);
const Tricorn: React.FC<{ c?: string; y?: number }> = ({ c = "#15131C", y = -300 }) => (
  <g stroke={INK} strokeWidth={6} strokeLinejoin="round">
    <path d={`M-140,${y + 20} Q-90,${y - 120} 0,${y - 70} Q90,${y - 120} 140,${y + 20} Q0,${y - 20} -140,${y + 20} Z`} fill={c} />
    <path d={`M-140,${y + 20} Q0,${y - 20} 140,${y + 20}`} fill="none" stroke={GOLD} strokeWidth={8} />
    <g transform={`translate(0,${y - 50}) scale(0.35)`} fill="#F4F1EA" stroke="none"><circle cy={-14} r={34} /><rect x={-20} y={10} width={40} height={18} /></g>
  </g>
);
const Patch: React.FC<{ side?: number }> = ({ side = 1 }) => (
  <g stroke={INK} strokeLinejoin="round">
    <line x1={-92} y1={-290} x2={92} y2={-190} strokeWidth={6} transform={side < 0 ? "scale(-1,1)" : undefined} />
    <ellipse cx={34 * side} cy={-238} rx={30} ry={26} fill="#15131C" strokeWidth={5} />
  </g>
);
const Beard: React.FC<{ t: number; fuse?: boolean }> = ({ t, fuse = true }) => (
  <g stroke={INK} strokeWidth={6} strokeLinejoin="round">
    <path d="M-92,-230 Q-110,-60 -40,-20 Q0,10 40,-20 Q110,-60 92,-230 Q60,-170 0,-175 Q-60,-170 -92,-230 Z" fill="#15131C" />
    {[-60, -20, 20, 60].map((bx, i) => <path key={bx} d={`M${bx},-60 q${(i % 2 ? 8 : -8)},30 0,60`} fill="none" stroke="#3A3550" strokeWidth={8} />)}
    <path d="M-50,-190 Q0,-170 50,-190" fill="none" stroke="#F4F1EA" strokeWidth={6} />
    {fuse && [-70, -30, 30, 70].map((fx, i) => (
      <g key={fx}><line x1={fx} y1={-120} x2={fx + (i - 1.5) * 20} y2={-40 + (i % 2) * 30} stroke="#C2703D" strokeWidth={7} />
        <circle cx={fx + (i - 1.5) * 20} cy={-40 + (i % 2) * 30} r={10 + Math.sin(t * 20 + i) * 3} fill="#FF8A3A" stroke="none" /></g>
    ))}
  </g>
);
const Pirate: React.FC<{ id: string; x: number; y: number; s?: number; face?: FaceT; gaze?: number; c?: string; pose?: ReturnType<typeof arms>; patch?: number; beard?: boolean; t?: number; fuse?: boolean; hat?: string; children?: React.ReactNode }> =
  ({ id, x, y, s = 1, face = "smug", gaze = 0, c = "#7A2E44", pose, patch, beard, t = 0, fuse, hat = "#15131C", children }) => (
    <Person id={id} x={x} y={y} s={s} body={c} bodyDark={INK} face={face} gaze={gaze} pose={pose ?? P.stand()}>
      {beard && <Beard t={t} fuse={fuse} />}
      {patch !== undefined && <Patch side={patch} />}
      <Tricorn c={hat} />
      <path d="M-40,-130 L0,-80 L40,-130" fill="none" stroke={GOLD} strokeWidth={6} />
      {children}
    </Person>
  );
const NumCard: React.FC<{ n: number; t: number; label: string }> = ({ n, t, label }) => {
  const s = L(t, [0, 0.18], [2.4, 1], Easing.out(Easing.cubic));
  return (
    <g>
      <rect x={-700} y={-700} width={2480} height={3400} fill="#0E1A33" />
      <g transform={`translate(540 860) rotate(${t * 30})`}>{Array.from({ length: 18 }, (_, i) => <path key={i} transform={`rotate(${i * 20})`} d="M0,0 L80,-1400 L-80,-1400 Z" fill={GOLD} opacity={0.14} />)}</g>
      <Bloom x={540} y={860} r={500} o={0.6} />
      <g transform={`translate(540 860) scale(${s})`} stroke={INK} strokeWidth={14}>
        <circle r={300} fill="#F4F1EA" />
        <circle r={300} fill="none" stroke={GOLD} strokeWidth={30} />
        <text x={0} y={140} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={420} fill={INK} stroke="none">{n}</text>
      </g>
      <g transform={`translate(540 1300) scale(${popS(t, 0.08, 0.2)})`}><Sign x={0} y={0} w={560} h={130} text={label} fs={80} bg="#E9D3A8" /></g>
    </g>
  );
};
const Stamp: React.FC<{ x: number; y: number; t: number; t0: number; text: string; c?: string }> = ({ x, y, t, t0, text, c = "#E8484F" }) => {
  if (t < t0) return null;
  const s = L(t, [t0, t0 + 0.15], [2.5, 1], Easing.out(Easing.cubic));
  return (
    <g transform={`translate(${x},${y}) rotate(-14) scale(${s})`}>
      <rect x={-260} y={-90} width={520} height={180} rx={20} fill="none" stroke={c} strokeWidth={20} />
      <FitText x={0} y={45} text={text} maxW={440} fs={130} fill={c} />
    </g>
  );
};
const Chest: React.FC<{ x: number; y: number; s?: number; open?: number }> = ({ x, y, s = 1, open = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={8} strokeLinejoin="round">
    {open > 0 && <circle cy={-140} r={200} fill={GOLD} opacity={0.3 * open} stroke="none" />}
    <rect x={-180} y={-120} width={360} height={200} rx={14} fill="#8A5A3B" />
    {open > 0 && Array.from({ length: 7 }, (_, i) => <circle key={i} cx={-130 + i * 44} cy={-130 - (i % 2) * 20} r={28} fill={GOLD} strokeWidth={5} />)}
    <g transform={`rotate(${-open * 40},-180,-120)`}><path d="M-180,-120 Q0,-260 180,-120 Z" fill="#9A6A45" /></g>
    <rect x={-20} y={-130} width={40} height={60} fill={GOLD} />
    {[-110, 110].map((bx) => <rect key={bx} x={bx - 14} y={-120} width={28} height={200} fill="#5A3A28" />)}
  </g>
);
const Island: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g transform={`translate(${x},${y})`} stroke={INK} strokeWidth={8} strokeLinejoin="round">
    <ellipse cx={0} cy={0} rx={520} ry={130} fill="#E9C46A" />
    <g transform={`rotate(${Math.sin(t * 1.5) * 3},250,-10)`}>
      <path d="M240,-10 Q260,-200 300,-380" fill="none" stroke="#8A5A3B" strokeWidth={30} />
      {[-60, -20, 20, 60, 100].map((a) => <path key={a} transform={`translate(300,-380) rotate(${a * 1.6 - 40})`} d="M0,0 Q90,-40 180,20 Q90,0 0,0 Z" fill="#56BA6C" />)}
    </g>
  </g>
);
const Shark: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <path transform={`translate(${x + Math.sin(t * 2) * 80},${y})`} d="M-60,0 Q-10,-120 40,-140 Q20,-60 60,0 Z" fill="#8E93A3" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
);
const Lantern: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g transform={`translate(${x},${y}) rotate(${Math.sin(t * 2) * 8})`} stroke={INK} strokeWidth={6}>
    <line x1={0} y1={-200} x2={0} y2={-70} />
    <circle r={160} fill="#FFD23F" opacity={0.25} stroke="none" />
    <rect x={-45} y={-70} width={90} height={120} rx={12} fill="#FFE08A" /><rect x={-55} y={-85} width={110} height={24} fill="#5A3A28" />
  </g>
);

// ---------------------------------------------------------------- scenes
const S01: ShotC = ({ t, d }) => {
  const flash = (t % 1.7) < 0.07 ? 1 : 0;
  return (
    <Cam t={t} d={d} a={[1.25, 540, 760]} b={[0.95, 540, 900]} shake={flash * 6}>
      <Sky mode="noir" />
      <Rain t={t} x={-200} y={-200} w={1500} h={2400} n={70} o={0.45} />
      <Bolt x={850} y={330} s={1.6 * (0.5 + flash)} />
      <Ship x={540} y={1250} s={1.0} t={t} rock={7} sail="#D9CCB0" />
      <Sea y={1260} t={t} storm c={["#14365E", "#1F4F80"]} />
      {flash > 0 && <rect x={-700} y={-700} width={2480} height={3400} fill="#fff" opacity={0.3} />}
    </Cam>
  );
};
const S02: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.3, 540, 800]} b={[1.6, 540, 740]}>
    <Sky mode="dusk" /><Sun x={180} y={760} r={120} t={t} face={false} />
    <Sea y={1150} t={t} c={["#3B4FA0", "#5468C0"]} />
    <Pirate id="cap" x={540} y={1180} s={1.3} face="smug" gaze={0.3} pose={arms([-60, -10], [60, -260])} t={t}>
      <g transform="translate(60,-260) rotate(-30)" stroke={INK} strokeWidth={6}><rect x={-20} y={-40} width={40} height={140} rx={8} fill={GOLD} /><rect x={-28} y={-90} width={56} height={60} rx={8} fill="#8A5A3B" /></g>
    </Pirate>
  </Cam>
);
const S03: ShotC = ({ t }) => <g><NumCard n={1} t={t} label="БІРІНШІ" /></g>;
const S04: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.7, 540, 760]}>
    <Room wall={["#3B2C4E", "#2A2240"]} />
    <Beam pts="380,0 700,0 860,1300 220,1300" o={0.5} />
    <Pirate id="bb" x={540} y={1200} s={1.35} face="shout" gaze={0} c="#2A2233" beard t={t} fuse={t > w(wi(3, 5)) - 0.2} pose={arms([-150, -120], [150, -120])} />
    {t > w(wi(3, 5)) && <Puffs x={540} y={820} t={t - w(wi(3, 5))} n={12} c="#8E93A3" size={0.9} life={1.4} spread={500} />}
    <g transform={`translate(540 360) scale(${popS(t, w(wi(3, 1)) - 0.1)})`}><Sign x={0} y={0} w={520} h={130} text="ҚАРАСАҚАЛ" fs={86} bg="#E9D3A8" /></g>
  </Cam>
);
const S05: ShotC = ({ t, d, w }) => {
  const run = L(t, [w(wi(4, 6)) - 0.3, d], [0, 1]);
  return (
    <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.08, 540, 920]}>
      <rect x={-700} y={-700} width={2480} height={3400} fill="#4A4560" />
      <Puffs x={240} y={1000} t={t + 2} n={16} c="#8E93A3" size={1.6} life={2} spread={700} />
      <Pirate id="bb" x={240} y={1200} s={1.0} face="shout" c="#2A2233" beard t={t} fuse pose={P.up()} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Person id={`en${i}`} x={680 + i * 140 + run * 500} y={1230 + (i % 2) * 40} s={0.8} body="#2F6FE0" bodyDark="#1F4FB0" face="terror" gaze={-0.5} sweat={1}
            pose={arms([-120, -260], [120, -260])} tilt={run * 10} />
        </g>
      ))}
      <g transform={`translate(820 520) scale(${popS(t, w(wi(4, 6)) - 0.1)})`}><Bubble x={0} y={0} s={0.6} tail={[-80, 250]}><FitText x={0} y={30} text="ШАЙТАН!" maxW={320} fs={80} fill="#E8484F" /></Bubble></g>
    </Cam>
  );
};
const S06: ShotC = ({ t }) => <g><NumCard n={2} t={t} label="ЕКІНШІ" /></g>;
const S07: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.4, 540, 760]} b={[2.0, 560, 700]}>
    <Sky mode="day" /><SkyClouds x={250} y={350} s={1.2} />
    <Sea y={1200} t={t} />
    <Pirate id="cap" x={540} y={1200} s={1.35} face="smug" gaze={-0.2} patch={1} pose={P.stand()} c="#2F6FE0" hat="#7A2E44" />
    {t > w(wi(6, 5)) && <Stamp x={540} y={420} t={t} t0={w(wi(6, 5))} text="СОҚЫР ЕМЕС" />}
  </Cam>
);
const S08: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.12, 540, 900]}>
    <Sky mode="day" /><Sun x={850} y={300} r={130} t={t} />
    <rect x={-700} y={1150} width={2480} height={1400} fill="#B97A52" />
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-700} y1={1180 + i * 60} x2={1780} y2={1180 + i * 60} stroke="#8A5A3B" strokeWidth={6} />)}
    <rect x={600} y={1120} width={300} height={60} fill="#5A3A28" stroke={INK} strokeWidth={6} />
    <FitText x={750} y={1100} text="ТРЮМ ↓" maxW={260} fs={50} fill="#fff" stroke={INK} sw={3} />
    <Pirate id="cap" x={380} y={1200} s={1.15} face="look" gaze={0.4} patch={1} pose={arms([-60, -10], [50, -250])} c="#2F6FE0" hat="#7A2E44" />
  </Cam>
);
const S09: ShotC = ({ t, d, w }) => {
  const sw = t > w(wi(8, 3));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.4, 520, 820]}>
      <rect x={-700} y={-700} width={2480} height={3400} fill={sw ? "#2A2030" : "#0A0810"} />
      {sw && <><Lantern x={820} y={520} t={t} /><Chest x={800} y={1250} s={0.9} open={1} /></>}
      {[0, 1, 2].map((i) => <rect key={i} x={-200 + i * 500} y={1300} width={420} height={260} fill={sw ? "#4A3A2E" : "#15101A"} stroke={INK} strokeWidth={6} />)}
      <Pirate id="cap" x={380} y={1200} s={1.2} face={sw ? "happy" : "worried"} gaze={0.5} patch={sw ? -1 : 1} pose={arms([-60, -10], [40, -250])} c="#2F6FE0" hat="#7A2E44" />
      {sw && <Sparkle x={330} y={680} s={1} />}
    </Cam>
  );
};
const S10: ShotC = ({ t }) => <g><NumCard n={3} t={t} label="ҮШІНШІ" /></g>;
const S11: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 1000]} b={[1.1, 540, 960]}>
    <Sky mode="dusk" />
    <Sea y={1200} t={t} c={["#3B4FA0", "#5468C0"]} />
    <Shark x={600} y={1290} t={t} /><Shark x={900} y={1360} t={t + 2} />
    <g stroke={INK} strokeWidth={8}><rect x={-200} y={960} width={560} height={50} fill="#9A6A45" /><rect x={300} y={980} width={420} height={30} fill="#B97A52" /></g>
    <Person id="pr" x={620} y={845} s={0.8} body="#F4F1EA" bodyDark="#C8C3B8" face="terror" gaze={-0.3} sweat={1} pose={arms([-40, -60], [40, -60])} />
    <Stamp x={540} y={420} t={t} t0={w(wi(10, 5)) - 0.1} text="МИФ" />
  </Cam>
);
const S12: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 1000]} b={[1.12, 540, 1000]}>
    <Sky mode="day" /><SkyClouds x={250} y={350} s={1.2} />
    <Sea y={1150} t={t} />
    <Island x={540} y={1250} t={t} />
    <g stroke="#E8484F" strokeWidth={22} strokeLinecap="round"><line x1={360} y1={1180} x2={460} y2={1260} /><line x1={460} y1={1180} x2={360} y2={1260} /></g>
    <Chest x={680} y={1230} s={0.5} open={0} />
    <Stamp x={540} y={560} t={t} t0={w(wi(11, 5)) - 0.1} text="СИРЕК" c="#E8484F" />
  </Cam>
);
const S13: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.12, 540, 900]} shake={2}>
    <Room wall={["#7A4A2E", "#5A3A28"]} floor={["#8A5A3B", "#6A4630"]} />
    <Lantern x={300} y={420} t={t} /><Lantern x={800} y={400} t={t + 1} />
    <rect x={100} y={1120} width={880} height={60} rx={10} fill="#9A6A45" stroke={INK} strokeWidth={8} />
    {[[230, "#E8484F"], [540, "#56BA6C"], [850, "#F2C55C"]].map(([x, c], i) => (
      <Pirate key={i} id={`p${i}`} x={x as number} y={1040 + Math.abs(Math.sin(t * 8 + i)) * -18} s={0.8} c={c as string} face="happy" gaze={0} pose={P.up()} hat={["#15131C", "#7A2E44", "#2F6FE0"][i]} />
    ))}
    {Array.from({ length: 10 }, (_, i) => <Coin key={i} x={150 + rnd(i) * 800} y={1080 - ((t * 500 + rnd(i + 3) * 600) % 700)} s={0.45} spin={t * 9 + i} />)}
  </Cam>
);
const S14: ShotC = ({ t }) => <g><NumCard n={4} t={t} label="ТӨРТІНШІ" /></g>;
const Deck: React.FC = () => (
  <g>
    <Sky mode="day" /><SkyClouds x={250} y={300} s={1.2} />
    <rect x={-700} y={1100} width={2480} height={1400} fill="#B97A52" />
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-700} y1={1130 + i * 60} x2={1780} y2={1130 + i * 60} stroke="#8A5A3B" strokeWidth={6} />)}
    <line x1={540} y1={1100} x2={540} y2={-200} stroke={INK} strokeWidth={30} />
  </g>
);
const CREW = ["#E8484F", "#56BA6C", "#F2C55C", "#4F6BD8", "#F28A2E"];
const S15: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 980]} b={[1.08, 540, 960]}>
    <Deck />
    <g transform="translate(540 600)"><Sign x={0} y={0} w={560} h={130} text="ДЕМОКРАТИЯ" fs={84} bg="#E9D3A8" /></g>
    {CREW.map((c, i) => <Pirate key={i} id={`c${i}`} x={140 + i * 200} y={1250 + (i % 2) * 60} s={0.7} c={c} face="happy" gaze={0} pose={P.stand()} hat={i % 2 ? "#7A2E44" : "#15131C"} />)}
  </Cam>
);
const S16: ShotC = ({ t, d, w }) => {
  const vote = t > w(wi(15, 3));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 980]} b={[1.12, 540, 920]}>
      <Deck />
      {CREW.map((c, i) => <Pirate key={i} id={`c${i}`} x={140 + i * 200} y={1250 + (i % 2) * 60} s={0.7} c={c} face="happy" gaze={i < 2 ? 0.5 : -0.5}
        pose={vote ? arms([-60, -10], [60, -340]) : P.stand()} hat={i % 2 ? "#7A2E44" : "#15131C"} />)}
      <g transform={`translate(540 520) scale(${popS(t, w(wi(15, 5)))})`}><Sign x={0} y={0} w={520} h={130} text="КАПИТАН — ОЛ!" fs={80} bg={GOLD} /></g>
      {t > w(wi(15, 5)) && <Confetti x={540} y={400} t={t - w(wi(15, 5))} n={40} />}
    </Cam>
  );
};
const S17: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.12, 540, 900]}>
    <Deck />
    <Pirate id="cap" x={300} y={1230} s={1.05} c="#7A2E44" face="smile" gaze={0.5} pose={P.hold([140, -140])} />
    <Person id="hurt" x={760} y={1230} s={1.05} body="#56BA6C" bodyDark="#3E8A4E" face={t > w(wi(16, 8)) ? "happy" : "sad"} gaze={-0.5}
      pose={arms([-100, -120], [60, -10])}>
      <rect x={-120} y={-200} width={240} height={40} rx={10} fill="#F4F1EA" stroke={INK} strokeWidth={5} transform="rotate(-20)" />
    </Person>
    <rect x={770} y={1300} width={20} height={190} fill="#8A5A3B" stroke={INK} strokeWidth={5} />
    <g transform={`translate(${L(t, [w(wi(16, 8)) - 0.4, w(wi(16, 8))], [440, 640])} ${1090})`} stroke={INK} strokeWidth={7}>
      <path d="M-60,40 Q-80,-60 0,-70 Q80,-60 60,40 Z" fill="#C9A24A" /><FitText x={0} y={20} text="₸" maxW={60} fs={60} />
    </g>
  </Cam>
);
const S18: ShotC = ({ t }) => <g><NumCard n={5} t={t} label="БЕСІНШІ" /></g>;
const Queen: React.FC<{ x: number; y: number; s?: number; face?: FaceT; old?: boolean; pose?: ReturnType<typeof arms> }> = ({ x, y, s = 1, face = "smug", old, pose }) => (
  <Person id="qu" x={x} y={y} s={s} body="#D2343F" bodyDark="#9A2430" face={face} gaze={0} pose={pose ?? arms([-130, -40], [130, -40])}>
    <path d="M-96,-250 Q-110,-360 0,-360 Q110,-360 96,-250 Q60,-310 0,-306 Q-60,-310 -96,-250 Z" fill={old ? "#D8D4DE" : "#15131C"} stroke={INK} strokeWidth={6} />
    <circle cx={0} cy={-370} r={34} fill={old ? "#D8D4DE" : "#15131C"} stroke={INK} strokeWidth={6} />
    <line x1={-30} y1={-380} x2={40} y2={-350} stroke={GOLD} strokeWidth={8} />
    <path d="M-100,-60 L-140,120 L140,120 L100,-60 Z" fill="#D2343F" stroke={INK} strokeWidth={6} />
    <path d="M-60,-120 L60,-120 L50,-60 L-50,-60 Z" fill={GOLD} stroke={INK} strokeWidth={5} />
  </Person>
);
const S19: ShotC = ({ t, d, w }) => {
  const rev = t > w(wi(18, 5)) - 0.1;
  return (
    <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.4, 540, 820]}>
      <Room wall={["#1C1638", "#120E26"]} />
      {rev && <Beam pts="380,0 700,0 860,1300 220,1300" o={0.7} />}
      <g opacity={rev ? 1 : 0.25}><Queen x={540} y={1150} s={1.3} face={rev ? "smug" : "calm"} /></g>
      {rev && <><Sparkle x={300} y={600} s={1.2} /><Sparkle x={800} y={560} s={1} /></>}
    </Cam>
  );
};
const S20: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.3, 540, 1000]} b={[0.75, 540, 1000]}>
    <Sky mode="dusk" /><Sun x={540} y={820} r={160} t={t} face={false} />
    <Sea y={1050} t={t} c={["#3B4FA0", "#5468C0"]} />
    {Array.from({ length: 16 }, (_, i) => <Junk key={i} x={-500 + (i % 6) * 420 + (Math.floor(i / 6) % 2) * 200} y={1080 + Math.floor(i / 6) * 220} s={0.38 + Math.floor(i / 6) * 0.12} t={t} />)}
    <g transform={`translate(540 380) scale(${popS(t, w(wi(19, 4)) - 0.1)})`}><Sign x={0} y={0} w={560} h={140} text="1000+ КЕМЕ" fs={90} bg={GOLD} /></g>
  </Cam>
);
const S21: ShotC = ({ t, d, w }) => {
  const n = Math.round(L(t, [w(wi(20, 3)) - 0.2, w(wi(20, 4)) + 0.5], [0, 70000]));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 1000]} b={[1.1, 540, 1000]}>
      <Sky mode="dusk" />
      <rect x={-700} y={1000} width={2480} height={1400} fill="#B97A52" />
      {Array.from({ length: 30 }, (_, i) => (
        <Person key={i} id={`a${i}`} x={60 + (i % 10) * 105 + (Math.floor(i / 10) % 2) * 50} y={1150 + Math.floor(i / 10) * 140 + Math.abs(Math.sin(t * 6 + i)) * -10} s={0.42}
          body={CREW[i % 5]} bodyDark={INK} face="shout" gaze={0} pose={i % 3 ? P.up() : P.stand()} />
      ))}
      <g transform="translate(540 520)"><rect x={-320} y={-100} width={640} height={200} rx={26} fill="#2A2233" stroke={INK} strokeWidth={8} />
        <FitText x={0} y={45} text={n.toLocaleString("ru-RU")} maxW={560} fs={140} fill="#7CFF8A" /></g>
    </Cam>
  );
};
const S22: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.15, 540, 900]}>
    <Sky mode="dusk" /><Sun x={820} y={820} r={150} t={t} face={false} />
    <Sea y={1050} t={t * 0.5} c={["#7A5AA8", "#9A7AC8"]} />
    <rect x={-700} y={1250} width={2480} height={1400} fill="#B97A52" stroke={INK} strokeWidth={6} />
    <g transform={`rotate(${Math.sin(t * 1.5) * 4},500,1420)`} stroke={INK} strokeWidth={8}>
      <path d="M300,1420 Q500,1480 700,1420" fill="none" strokeWidth={12} />
      <rect x={360} y={1060} width={60} height={340} fill="#8A5A3B" /><rect x={360} y={1260} width={300} height={40} fill="#8A5A3B" />
      <Queen x={500} y={1180} s={0.9} face="blink" old pose={arms([-40, -120], [80, -140])} />
    </g>
    <g transform="translate(700 1040)" stroke={INK} strokeWidth={6}><rect x={-30} y={-50} width={60} height={60} rx={8} fill="#F4F1EA" />
      {[0, 1].map((i) => <path key={i} d={`M${-10 + i * 20},-60 q10,-20 0,-40`} fill="none" stroke="#fff" strokeWidth={5} opacity={0.7} />)}</g>
  </Cam>
);
const S23: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.12, 540, 900]}>
    <Sky mode="day" /><SkyClouds x={300} y={300} s={1.1} />
    <Sea y={1150} t={t} />
    {[[200, "#2A2233", true, undefined], [540, "#2F6FE0", false, 1], [880, "#D2343F", false, undefined]].map(([x, c, bd, pt], i) => (
      i === 2 ? <Queen key={i} x={880} y={1240} s={0.85} face="smug" /> :
        <Pirate key={i} id={`ch${i}`} x={x as number} y={1240} s={0.85} c={c as string} face="smug" gaze={0} beard={bd as boolean} t={t} fuse={bd as boolean} patch={pt as number | undefined} />
    ))}
    <text x={540} y={560} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={240} fill={GOLD} stroke={INK} strokeWidth={9}>?</text>
    {t > w(wi(22, 7)) && <g transform={`translate(540 760) scale(${popS(t, w(wi(22, 7)))})`}><Sign x={0} y={0} w={460} h={110} text="ПІКІРГЕ ЖАЗ" fs={70} bg="#FFF3C4" /></g>}
  </Cam>
);

export const SHOTS: Shot[] = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23].map((C) => ({ C }));
