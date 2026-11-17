// «Дүкен сені қалай алдайды» — 22 сцены
import React from "react";
import { Easing } from "remotion";
import { INK, Person, walk } from "./people";
import {
  arms, Beam, Bloom, Cam, Confetti, FitText, Hero, L, Notes, P, Plant, popS, Puffs, rnd, Room, Shadow, ShotC, Sign,
  Sparkle, Suit, Sweat,
} from "./kit";
import { Shot } from "./film";
import { Bag, Box, Bread, Bubble, Cart, Coin, Milk, Shelf, Tag, wi } from "./mykit";

const GOODS = ["#E8484F", "#F2C55C", "#56BA6C", "#4F6BD8", "#F28A2E", "#7B61FF", "#2FA39A"];
// a store wall with shelves full of boxes
const ShopWall: React.FC<{ wall?: [string, string]; rows?: number[]; seed?: number }> = ({ wall = ["#F4E6CF", "#E3CDA8"], rows = [520, 800, 1080], seed = 0 }) => (
  <g>
    <Room wall={wall} floor={["#D9D3C7", "#BFB8AA"]} floorY={1250} />
    {rows.map((y, r) => (
      <Shelf key={y} x={540} y={y} w={1300}>
        {Array.from({ length: 11 }, (_, i) => <Box key={i} x={-600 + i * 120} y={0} w={92} h={130 + rnd(i + r * 11 + seed) * 50} c={GOODS[(i + r + seed) % GOODS.length]} />)}
      </Shelf>
    ))}
  </g>
);
const Door: React.FC<{ x: number; y: number; open?: number }> = ({ x, y, open = 0 }) => (
  <g transform={`translate(${x},${y})`} stroke={INK} strokeWidth={7} strokeLinejoin="round">
    <rect x={-170} y={-520} width={340} height={520} fill="#2A2233" />
    <rect x={-160} y={-510} width={160 * (1 - open * 0.7)} height={510} fill="#9FD8FF" opacity={0.9} />
    <rect x={160 - 160 * (1 - open * 0.7)} y={-510} width={160 * (1 - open * 0.7)} height={510} fill="#9FD8FF" opacity={0.9} />
  </g>
);
const Storefront: React.FC<{ t: number; open?: number }> = ({ t, open = 0 }) => (
  <g>
    <rect x={-700} y={-700} width={2480} height={3400} fill="url(#sky-day)" />
    <rect x={-700} y={1300} width={2480} height={1400} fill="#B9B3A8" />
    <rect x={40} y={420} width={1000} height={880} fill="#F2C55C" stroke={INK} strokeWidth={8} />
    <rect x={20} y={380} width={1040} height={80} rx={12} fill="#C2463F" stroke={INK} strokeWidth={8} />
    <FitText x={540} y={442} text="ДҮКЕН" maxW={500} fs={64} fill="#fff" />
    {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${20 + i * 130},460 l65,60 l65,-60 Z`} fill={i % 2 ? "#fff" : "#C2463F"} stroke={INK} strokeWidth={5} />)}
    <Door x={540} y={1300} open={open} />
    <rect x={90} y={620} width={240} height={300} fill="#9FD8FF" stroke={INK} strokeWidth={7} />
    <rect x={750} y={620} width={240} height={300} fill="#9FD8FF" stroke={INK} strokeWidth={7} />
  </g>
);
const Wallet: React.FC<{ x: number; y: number; s?: number; open: number }> = ({ x, y, s = 1, open }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={8} strokeLinejoin="round">
    <rect x={-200} y={-130} width={400} height={260} rx={30} fill="#8A5A3B" />
    <path d={`M-200,-60 L200,-60 L200,${-60 - 120 * open} L-200,${-60 - 120 * open} Z`} fill="#A86E45" />
    <rect x={-170} y={-150} width={300} height={40} fill="#7CC46A" opacity={open} />
    <circle cx={150} cy={0} r={22} fill="#F2C55C" />
  </g>
);
const Fruit: React.FC<{ x: number; y: number; c: string; r?: number }> = ({ x, y, c, r = 40 }) => (
  <g stroke={INK} strokeWidth={5}><circle cx={x} cy={y} r={r} fill={c} /><path d={`M${x},${y - r} q8,-20 22,-22`} fill="none" stroke="#3E7A32" strokeWidth={6} /></g>
);
const Speaker: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g transform={`translate(${x},${y}) scale(${1 + Math.abs(Math.sin(t * 4)) * 0.05})`} stroke={INK} strokeWidth={7}>
    <rect x={-110} y={-160} width={220} height={320} rx={20} fill="#2A2233" />
    <circle cy={-70} r={40} fill="#5A5470" /><circle cy={60} r={70} fill="#5A5470" /><circle cy={60} r={26} fill="#2A2233" />
  </g>
);
const Snail: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={5} strokeLinejoin="round">
    <path d={`M-64,0 Q${-20 + Math.sin(t * 4) * 6},-18 58,0 L80,-34 L68,0 Z`} fill="#E9C46A" />
    <circle cx={-6} cy={-32} r={34} fill="#C2703D" />
    <circle cx={82} cy={-46} r={5} fill={INK} />
  </g>
);
const Paper: React.FC<{ x: number; y: number; s?: number; rot?: number; title: string; lines?: string[] }> = ({ x, y, s = 1, rot = 0, title, lines = [] }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-170} y={-230} width={340} height={460} rx={10} fill="#FFFDF6" stroke={INK} strokeWidth={8} />
    <FitText x={0} y={-160} text={title} maxW={280} fs={56} />
    <line x1={-130} y1={-130} x2={130} y2={-130} stroke={INK} strokeWidth={5} />
    {lines.map((l, i) => <g key={i}><rect x={-130} y={-90 + i * 80} width={34} height={34} fill="#fff" stroke={INK} strokeWidth={5} /><path d={`M-124,${-74 + i * 80} l10,12 l18,-24`} fill="none" stroke="#56BA6C" strokeWidth={7} />
      <FitText x={-80} y={-60 + i * 80} text={l} maxW={200} fs={40} anchor="start" /></g>)}
  </g>
);

const S01: ShotC = ({ t, d }) => {
  const ph = t * 3;
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.15, 540, 980]}>
      <Storefront t={t} open={L(t, [d * 0.4, d * 0.7], [0, 1])} />
      <Shadow x={200 + t * 150} y={1470} s={1.2} />
      <Hero id="me" x={200 + t * 150} y={1260} s={1.0} face="smile" gaze={0.6} pose={walk(ph)} />
      <g transform={`translate(${330 + t * 150} 760) scale(${popS(t, 0.4)})`}><Bubble x={0} y={0} s={0.55} tail={[-120, 220]}><Bread x={0} y={40} s={1.2} /></Bubble></g>
    </Cam>
  );
};
const S02: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.15, 540, 980]} b={[1.0, 540, 960]}>
    <Storefront t={t} open={1} />
    <Shadow x={540} y={1470} s={1.8} />
    <Hero id="me" x={540} y={1250} s={1.1} face="shock" gaze={0} pose={arms([-150, 40], [150, 40])} />
    <Bag x={370} y={1350} s={1.0} /><Bag x={710} y={1350} s={1.0} />
    <Sweat x={640} y={890} s={1.2} />
  </Cam>
);
const S03: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.6, 540, 820]} b={[2.1, 540, 760]}>
    <ShopWall />
    <Hero id="me" x={540} y={1200} s={1.3} face="worried" gaze={0.3} sweat={1} pose={P.shrug()} />
  </Cam>
);
const Manager: React.FC<{ x: number; y: number; s?: number; face?: "smug" | "smile" | "happy"; pose?: ReturnType<typeof arms> }> = ({ x, y, s = 1.2, face = "smug", pose }) => (
  <Suit id="mgr" x={x} y={y} s={s} face={face} gaze={-0.4} shades pose={pose ?? P.pointR()} badgeText="БАСТЫҚ" />
);
const S04: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 960]} b={[1.1, 560, 900]}>
    <Room wall={["#3B3A5A", "#2A2948"]} />
    <Beam pts="300,0 780,0 900,1300 180,1300" o={0.5} />
    <rect x={520} y={420} width={480} height={360} fill="#2F6FE0" stroke={INK} strokeWidth={8} />
    {Array.from({ length: 5 }, (_, i) => <line key={i} x1={540} y1={460 + i * 70} x2={980} y2={460 + i * 70} stroke="#9FD8FF" strokeWidth={4} />)}
    <path d="M560,740 L640,520 L760,700 L860,480 L960,600" fill="none" stroke="#FFE04A" strokeWidth={10} />
    <FitText x={760} y={760} text="ЖОСПАР" maxW={300} fs={48} fill="#fff" />
    <Shadow x={300} y={1470} s={1.4} />
    <Manager x={300} y={1220} />
  </Cam>
);
const S05: ShotC = ({ t, d, w }) => {
  const p = L(t, [w(wi(4, 9)) - 0.4, d - 0.2], [0, 1]);
  const path = "M540,1350 L540,1150 L200,1150 L200,700 L860,700 L860,430";
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.08, 540, 860]}>
      <rect x={-700} y={-700} width={2480} height={3400} fill="#E7DCC8" />
      <rect x={100} y={300} width={880} height={1100} rx={20} fill="#FFFDF6" stroke={INK} strokeWidth={10} />
      {[0, 1, 2].map((i) => <rect key={i} x={300} y={520 + i * 220} width={480} height={60} rx={10} fill={GOODS[i]} stroke={INK} strokeWidth={6} />)}
      <g transform={`translate(220 380) scale(${popS(t, w(wi(4, 2)))})`}><Bread x={0} y={30} s={0.7} /></g>
      <g transform={`translate(860 400) scale(${popS(t, w(wi(4, 4)))})`}><Milk x={0} y={50} s={0.5} /></g>
      <rect x={480} y={1360} width={120} height={40} fill="#56BA6C" stroke={INK} strokeWidth={6} />
      <FitText x={540} y={1450} text="КІРУ" maxW={200} fs={50} />
      <path d={path} fill="none" stroke="#E8484F" strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} />
    </Cam>
  );
};
const S06: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540 + 0, 980]} b={[1.0, 900, 980]}>
    <ShopWall seed={2} />
    <rect x={-700} y={1250} width={2480} height={30} fill="#BFB8AA" />
    <Sign x={1500} y={300} w={300} h={100} text="НАН →" fs={56} bg="#FFE04A" />
    <Shadow x={350 + t * 200} y={1480} s={1.4} />
    <Hero id="me" x={350 + t * 200} y={1270} s={1.0} face="worried" gaze={0.6} pose={walk(t * 3)} />
    <Cart x={560 + t * 200} y={1480} s={0.8} t={t} />
  </Cam>
);
const S07: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.12, 540, 880]}>
    <Room wall={["#F7E3C8", "#E9C9A0"]} />
    {[[150, "#E8484F"], [300, "#F2A0C0"], [880, "#FFD23F"]].map(([x, c], i) => (
      <g key={i} stroke={INK} strokeWidth={6}><rect x={(x as number) - 60} y={1100} width={120} height={150} fill="#8A5A3B" />
        {[0, 1, 2].map((k) => <circle key={k} cx={(x as number) - 40 + k * 40} cy={1070 - (k % 2) * 30} r={30} fill={c as string} />)}</g>
    ))}
    <Shelf x={720} y={1000} w={360}><Bread x={-80} y={0} s={0.7} /><Bread x={80} y={0} s={0.7} /></Shelf>
    {[0, 1, 2].map((i) => <path key={i} d={`M${640 + i * 60},${940 - ((t * 120 + i * 50) % 220)} q20,-30 0,-60 q-20,-30 0,-60`} fill="none" stroke="#E9A55C" strokeWidth={8} strokeLinecap="round" opacity={0.8} />)}
    <Shadow x={460} y={1470} s={1.4} />
    <Hero id="me" x={460} y={1240} s={1.15} face="blink" gaze={0.4} pose={P.hug()} />
  </Cam>
);
const S08: ShotC = ({ t, d }) => {
  const o = L(t, [0.2, 0.9], [0, 1]);
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.2, 540, 860]}>
      <Room wall={["#B9C6F0", "#8E9BD0"]} />
      <Bloom x={540} y={800} r={400} o={0.5 * o} />
      <Wallet x={540} y={900} s={1.4} open={o} />
      {o > 0.5 && Array.from({ length: 6 }, (_, i) => <Coin key={i} x={400 + i * 60 + Math.sin(t * 3 + i) * 30} y={760 - ((t - 0.5) * 400 + i * 40) % 500} s={0.7} spin={t * 6 + i} />)}
    </Cam>
  );
};
const S09: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 300, 960]} b={[1.0, 780, 960]}>
    <ShopWall seed={4} />
    {[["ПЕЧЕНЬЕ", 3, 200], ["ШОКОЛАД", 4, 620], ["АКЦИЯ", 5, 1000]].map(([s, j, x], i) => (
      <g key={i} transform={`translate(${x} 330) scale(${popS(t, w(wi(8, j as number)) - 0.1)})`}><Sign x={0} y={0} w={330} h={110} text={s as string} fs={56} bg={i === 2 ? "#E8484F" : "#FFE04A"} fg={i === 2 ? "#fff" : INK} /></g>
    ))}
  </Cam>
);
const S10: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.1, 540, 900]} b={[1.0, 540, 940]}>
    <ShopWall seed={5} />
    <Burst2 t={t} />
    <g transform={`translate(540 760) scale(${popS(t, 0.1)}) rotate(${Math.sin(t * 6) * 3})`}>
      <circle r={300} fill="#E8484F" stroke={INK} strokeWidth={10} />
      <FitText x={0} y={60} text="2+1" maxW={420} fs={200} fill="#fff" />
      <FitText x={0} y={170} text="ТЕГІН!" maxW={300} fs={70} fill="#FFE04A" />
    </g>
    {t > w(wi(9, 3)) && <Confetti x={540} y={600} t={t - w(wi(9, 3))} n={40} />}
  </Cam>
);
const Burst2: React.FC<{ t: number }> = ({ t }) => (
  <g transform={`translate(540 760) rotate(${t * 20})`}>{Array.from({ length: 16 }, (_, i) => <path key={i} transform={`rotate(${i * 22.5})`} d="M0,0 L60,-700 L-60,-700 Z" fill="#FFE04A" opacity={0.3} />)}</g>
);
const S11: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.15, 540, 900]} b={[1.0, 540, 960]}>
    <Room wall={["#CDEFC7", "#A7D6A0"]} floor={["#D9D3C7", "#BFB8AA"]} />
    {[200, 540, 880].map((x, k) => (
      <g key={x}><rect x={x - 150} y={1000} width={300} height={260} fill="#C98A55" stroke={INK} strokeWidth={8} />
        {Array.from({ length: 9 }, (_, i) => <Fruit key={i} x={x - 100 + (i % 3) * 100} y={980 - Math.floor(i / 3) * 60} c={["#E8484F", "#F28A2E", "#7CC46A"][k]} />)}</g>
    ))}
    <Sparkle x={300} y={700} s={1.2} /><Sparkle x={760} y={640} s={1} />
    <Sign x={540} y={520} w={420} h={110} text="ЖАҢА!" fs={70} bg="#56BA6C" fg="#fff" />
  </Cam>
);
const S12: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 960]} b={[1.2, 600, 1050]}>
    <Room wall={["#F4E6CF", "#E3CDA8"]} floor={["#D9D3C7", "#BFB8AA"]} />
    <rect x={500} y={900} width={560} height={360} fill="#5A5470" stroke={INK} strokeWidth={8} />
    <rect x={560} y={760} width={200} height={140} rx={10} fill="#2A2233" stroke={INK} strokeWidth={7} />
    <FitText x={660} y={850} text="КАССА" maxW={160} fs={40} fill="#7CFF8A" />
    <Shelf x={250} y={1150} w={360}>{[0, 1, 2, 3].map((i) => <Box key={i} x={-130 + i * 85} y={0} w={70} h={90} c={GOODS[i]} label="🍬" fs={30} />)}</Shelf>
    <Shadow x={230} y={1480} s={1} />
    <Person id="kid" x={230} y={1330} s={0.7} body="#F2C55C" bodyDark="#C99B3F" face="happy" gaze={0} pose={arms([-80, -100], [90 + Math.sin(t * 8) * 20, -160])} />
  </Cam>
);
const S13: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.3, 540, 800]}>
    <ShopWall seed={6} />
    <rect x={-700} y={700} width={2480} height={200} fill="#FFE04A" opacity={0.25 * popS(t, w(wi(12, 4)))} />
    <g transform={`translate(540 640) scale(${popS(t, w(wi(12, 0)))})`}><Tag x={0} y={0} s={1.1} text="9990" c="#E8484F" /></g>
    <Hero id="me" x={180} y={1260} s={0.9} face="look" gaze={0.5} pose={P.stand()} />
  </Cam>
);
const S14: ShotC = ({ t, d, w }) => {
  const bend = L(t, [w(wi(13, 5)) - 0.3, w(wi(13, 5)) + 0.2, w(wi(13, 6)) - 0.1, w(wi(13, 6)) + 0.3], [0, 1, 1, 0]);
  const took = t > w(wi(13, 7));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 1050]} b={[1.12, 540, 1080]}>
      <ShopWall seed={7} rows={[520, 800, 1180]} />
      <g transform="translate(830 1110) scale(0.6)"><Tag x={0} y={0} text="490" c="#7CC46A" /></g>
      <Hero id="me" x={540} y={1270 + bend * 40} s={1.05} face={took ? "smug" : bend > 0.5 ? "worried" : "look"} gaze={0.5} tilt={bend * 20} sweat={bend}
        pose={took ? P.hold([90, -200]) : arms([-60, -10], [120, -40 + bend * 100])}>
        {took && <g transform="translate(90,-200)"><Box x={0} y={40} w={80} h={100} c="#E8484F" /></g>}
      </Hero>
    </Cam>
  );
};
const S15: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.2, 540, 820]}>
    <Room wall={["#7C8FD0", "#5968A8"]} />
    <Speaker x={540} y={760} t={t} />
    <Notes x={540} y={560} t={t} />
    <Notes x={300} y={700} t={t + 0.5} />
    <Notes x={800} y={680} t={t + 1} />
  </Cam>
);
const S16: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 980]} b={[1.08, 600, 980]}>
    <ShopWall seed={8} />
    <Notes x={300} y={500} t={t} />
    {[0, 1, 2].map((i) => (
      <g key={i}><Shadow x={200 + i * 300 + t * 30} y={1480} s={1} />
        <Person id={`c${i}`} x={200 + i * 300 + t * 30} y={1280} s={0.85} body={GOODS[i + 2]} bodyDark={INK} face="blink" gaze={0.4} pose={walk(t * 0.8 + i)} /></g>
    ))}
    <Snail x={820 + t * 20} y={1490} s={0.7} t={t} />
  </Cam>
);
const S17: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.2, 540, 1100]} b={[0.9, 540, 1000]}>
    <ShopWall seed={9} />
    <Cart x={640} y={1460} s={2.3} t={0} />
    <Shadow x={180} y={1470} s={1} />
    <Hero id="me" x={180} y={1300} s={0.75} face="shock" gaze={0.7} pose={P.shrug()} />
  </Cam>
);
const S18: ShotC = ({ t, d }) => {
  const n = Math.floor(L(t, [0.1, d - 0.2], [0, 9]));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 1000]} b={[1.12, 560, 1060]}>
      <ShopWall seed={10} />
      <Cart x={640} y={1460} s={1.5} t={0}>
        {Array.from({ length: n }, (_, i) => <Box key={i} x={-150 + (i % 4) * 90} y={-80 - Math.floor(i / 4) * 90} w={80} h={90} c={GOODS[i % 7]} />)}
      </Cart>
      <Hero id="me" x={240} y={1250} s={0.95} face="happy" gaze={0.6} pose={arms([-60, -10], [150, -150 + Math.sin(t * 10) * 40])} />
    </Cam>
  );
};
const S19: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.1, 560, 900]} b={[1.0, 540, 960]}>
    <Room wall={["#3B3A5A", "#2A2948"]} />
    <Beam pts="300,0 780,0 900,1300 180,1300" o={0.5} />
    <rect x={460} y={420} width={540} height={360} fill="#2F6FE0" stroke={INK} strokeWidth={8} />
    <FitText x={730} y={630} text="ОЙЛАСТЫРЫЛҒАН" maxW={480} fs={52} fill="#fff" />
    <Shadow x={300} y={1470} s={1.4} />
    <Manager x={300} y={1220} face="happy" pose={P.up()} />
  </Cam>
);
const S20: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.2, 620, 820]}>
    <Room wall={["#F2D3C2", "#D9A98F"]} />
    <Shadow x={340} y={1470} s={1.4} />
    <Hero id="me" x={340} y={1220} s={1.15} face="smug" gaze={0.5} pose={P.hold([150, -170])} />
    <g transform={`scale(${1})`}><Paper x={720} y={760} s={1.1} rot={6} title="ТІЗІМ" lines={["НАН", "СҮТ"]} /></g>
  </Cam>
);
const S21: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.3, 540, 840]} b={[1.5, 540, 800]}>
    <Room wall={["#F7E3C8", "#E9C9A0"]} />
    <Person id="me" x={540} y={1200} s={1.35} body="#2FA39A" bodyDark="#1F7A73" face="happy" gaze={0} pose={arms([-60, -10], [130, -120])}>
      <g transform={`translate(130,-120) rotate(${Math.sin(t * 6) * 8})`}><Bread x={0} y={30} s={0.6} /></g>
    </Person>
    <path d="M380,1000 q160,80 320,0" fill="none" stroke={INK} strokeWidth={0} />
  </Cam>
);
const S22: ShotC = ({ t, d, w }) => {
  const hit = w(wi(21, 4));
  const sad = t > hit;
  return (
    <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.15, 540, 980]} shake={t > hit && t < hit + 0.3 ? 8 : 0}>
      <Storefront t={t} open={1} />
      <Shadow x={540} y={1470} s={1.8} />
      <Hero id="me" x={540} y={1250} s={1.1} face={sad ? "sad" : "smile"} gaze={0} pose={arms([-150, 40], [150, 40])} sweat={sad ? 1 : 0} />
      <Bag x={370} y={1350} s={1.0} /><Bag x={710} y={1350} s={1.0} />
      <g transform={`translate(540 600) scale(${popS(t, hit - 0.1)}) rotate(-4)`}>
        <rect x={-260} y={-150} width={520} height={300} rx={30} fill="#2F6FE0" stroke={INK} strokeWidth={9} />
        <rect x={-260} y={-90} width={520} height={50} fill="#2A2233" />
        <FitText x={0} y={90} text="НЕСИЕ" maxW={400} fs={100} fill="#fff" />
      </g>
    </Cam>
  );
};

export const SHOTS: Shot[] = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22].map((C) => ({ C }));
