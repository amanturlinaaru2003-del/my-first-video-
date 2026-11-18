// «Телефонға тәуелділік» — мультфильм, 16 сцена
import React from "react";
import { Easing } from "remotion";
import { INK, Person } from "./people";
import {
  arms, Beam, Bloom, Burst, Cam, Confetti, FitText, Hero, L, P, popS, Puffs, rnd, Room, Shadow, ShotC, Sign, Sky,
  SkyClouds, Sparkle, Sweat, Window, Zzz,
} from "./kit";
import { Shot } from "./film";
import { Bubble, Grass, Phone, Sun, wi } from "./mykit";

const Glow: React.FC<{ x: number; y: number; r?: number; o?: number }> = ({ x, y, r = 300, o = 0.5 }) => <circle cx={x} cy={y} r={r} fill="#9FD8FF" opacity={o * 0.4} />;
const Bell: React.FC<{ x: number; y: number; s?: number; t?: number; off?: boolean }> = ({ x, y, s = 1, t = 0, off }) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(${off ? 0 : Math.sin(t * 25) * 12})`} stroke={INK} strokeWidth={8} strokeLinejoin="round">
    <path d="M-110,60 Q-110,-130 0,-140 Q110,-130 110,60 L140,90 L-140,90 Z" fill="#FFD23F" />
    <circle cx={0} cy={110} r={28} fill="#FFD23F" />
    {off && <line x1={-160} y1={-160} x2={160} y2={160} stroke="#E8484F" strokeWidth={30} strokeLinecap="round" />}
  </g>
);
const Slot: React.FC<{ t: number; spin: number }> = ({ t, spin }) => {
  const sym = ["❤️", "👍", "💬", "🔔", "⭐"];
  return (
    <g stroke={INK} strokeWidth={10} strokeLinejoin="round">
      <rect x={160} y={360} width={760} height={980} rx={60} fill="#C2463F" />
      <rect x={210} y={420} width={660} height={140} rx={30} fill="#FFD23F" />
      <FitText x={540} y={520} text="JACKPOT" maxW={560} fs={100} fill="#C2463F" />
      <rect x={220} y={620} width={640} height={340} rx={24} fill="#FFFDF6" />
      {[0, 1, 2].map((i) => {
        const k = Math.floor((spin > 0 ? t * 14 + i * 3 : i * 2)) % sym.length;
        return <text key={i} x={330 + i * 210} y={850} textAnchor="middle" fontSize={150} stroke="none">{sym[k]}</text>;
      })}
      <line x1={920} y1={760} x2={1010} y2={760 - 260 * (1 - spin * 0.6)} strokeWidth={22} />
      <circle cx={1010} cy={760 - 260 * (1 - spin * 0.6)} r={50} fill="#E8484F" />
      <rect x={280} y={1040} width={520} height={200} rx={20} fill="#2A2233" />
    </g>
  );
};
const Clock: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={10}>
    <circle r={300} fill="#FFFDF6" />
    {Array.from({ length: 12 }, (_, i) => <line key={i} transform={`rotate(${i * 30})`} x1={0} y1={-270} x2={0} y2={-230} strokeWidth={8} />)}
    <line x1={0} y1={0} x2={0} y2={-220} transform={`rotate(${t * 360})`} strokeWidth={12} strokeLinecap="round" />
    <line x1={0} y1={0} x2={0} y2={-150} transform={`rotate(${t * 30})`} strokeWidth={16} strokeLinecap="round" />
    <circle r={20} fill={INK} />
  </g>
);
const Brain: React.FC<{ x: number; y: number; s?: number; face?: "happy" | "want" }> = ({ x, y, s = 1, face = "happy" }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeLinecap="round" strokeLinejoin="round">
    <path d="M-160,60 Q-210,-30 -150,-100 Q-130,-180 -40,-170 Q0,-215 60,-180 Q150,-190 165,-100 Q215,-30 160,60 Q120,120 30,110 Q-60,130 -160,60 Z" fill="#F4A6B8" strokeWidth={9} />
    {face === "happy"
      ? <g strokeWidth={8} fill="none"><path d="M-70,-10 Q-50,8 -30,-10" /><path d="M30,-10 Q50,8 70,-10" /><path d="M-40,36 Q0,90 40,36 Z" fill="#6B2236" /></g>
      : <g strokeWidth={6}><circle cx={-50} cy={-10} r={28} fill="#fff" /><circle cx={-46} cy={-6} r={16} fill={INK} /><circle cx={50} cy={-10} r={28} fill="#fff" /><circle cx={54} cy={-6} r={16} fill={INK} />
        <path d="M-20,50 Q0,40 20,50" fill="none" strokeWidth={8} /></g>}
  </g>
);
const PhoneHero: React.FC<{ x: number; y: number; s?: number; face?: React.ComponentProps<typeof Hero>["face"]; glow?: number; color?: string }> = ({ x, y, s = 1.1, face = "look", glow = 1, color }) => (
  <g>
    <Glow x={x} y={y - 260 * s} r={260 * s} o={glow} />
    <Hero id="me" x={x} y={y} s={s} face={face} gaze={0} pose={arms([-40, -150], [40, -150])} color={color}>
      <g transform="translate(0,-160) scale(0.42)"><Phone x={0} y={0} /></g>
    </Hero>
  </g>
);

const S01: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.6, 540, 800]} b={[1.2, 540, 880]}>
    <Room wall={["#2A2F6A", "#1E2350"]} />
    <PhoneHero x={540} y={1200} s={1.2} face="look" />
    {[0, 1, 2].map((i) => <g key={i} transform={`translate(${360 + i * 180} ${560 - ((t * 200 + i * 80) % 250)}) scale(${0.5})`}><Bell x={0} y={0} t={t} /></g>)}
  </Cam>
);
const S02: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.12, 540, 860]}>
    <Room wall={["#B9C6F0", "#8E9BD0"]} />
    <Hero id="me" x={540} y={1230} s={1.1} face="look" gaze={0} pose={arms([-60, -10], [30, -205])} />
    <g transform={`translate(270 520) scale(${popS(t, 0)})`}><Bubble x={0} y={0} s={0.6} tail={[140, 260]}><FitText x={0} y={40} text="10?" maxW={260} fs={140} /></Bubble></g>
    <g transform={`translate(810 520) scale(${popS(t, w(wi(1, 2)) - 0.05)})`}><Bubble x={0} y={0} s={0.6} tail={[-140, 260]}><FitText x={0} y={40} text="20?" maxW={260} fs={140} /></Bubble></g>
  </Cam>
);
const S03: ShotC = ({ t, d }) => {
  const n = Math.floor(L(t, [0.2, d], [0, 20]));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.12, 540, 900]}>
      <Room wall={["#E9E3C9", "#CFC6A0"]} />
      <PhoneHero x={330} y={1230} s={1.0} />
      <Shadow x={790} y={1470} s={1.2} />
      <Person id="sci" x={790} y={1230} s={1.05} body="#FFFFFF" bodyDark="#C8C3B8" hat="doctor" face="look" gaze={-0.6} pose={P.hold([-100, -150])} />
      <g transform="translate(690 1080) rotate(-6)" stroke={INK} strokeWidth={6}>
        <rect x={-110} y={-150} width={220} height={300} rx={12} fill="#FFFDF6" />
        {Array.from({ length: n }, (_, i) => <line key={i} x1={-80 + (i % 5) * 34 + (i % 5 === 4 ? 0 : 0)} y1={-110 + Math.floor(i / 5) * 60} x2={i % 5 === 4 ? -80 + (i % 5) * 34 - 140 : -80 + (i % 5) * 34} y2={-60 + Math.floor(i / 5) * 60} strokeWidth={6} />)}
      </g>
    </Cam>
  );
};
const S04: ShotC = ({ t, d, w }) => {
  const n = Math.round(L(t, [0, w(wi(3, 0)) + 0.6], [20, 100]));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.15, 540, 860]} shake={n >= 100 && t < w(wi(3, 0)) + 0.9 ? 6 : 0}>
      <Room wall={["#3B3A5A", "#2A2948"]} />
      <Bloom x={540} y={760} r={420} o={0.5} c="R" />
      <g transform="translate(540 760)"><rect x={-340} y={-170} width={680} height={340} rx={40} fill="#2A2233" stroke={INK} strokeWidth={10} />
        <FitText x={0} y={70} text={`${n}`} maxW={520} fs={260} fill="#FF6A5E" /></g>
      <g transform="translate(540 1100)"><Sign x={0} y={0} w={460} h={110} text="РЕТ КҮНІНЕ" fs={70} bg="#FFF3C4" /></g>
    </Cam>
  );
};
const S05: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 880]} b={[1.12, 540, 860]}>
    <Room wall={["#F7E3C8", "#E9C9A0"]} />
    <Clock x={540} y={760} s={1.1} t={t * 0.5} />
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2, p = popS(t, i * 0.4);
      return <g key={i} transform={`translate(${540 + Math.cos(a) * 420} ${760 + Math.sin(a) * 420}) scale(${p * 0.38})`}><Phone x={0} y={0} glow={1} /></g>;
    })}
    <g transform="translate(540 1400)"><Sign x={0} y={0} w={460} h={110} text="ӘР 10 МИНУТ" fs={70} bg="#B9F0B0" /></g>
  </Cam>
);
const S06: ShotC = ({ t, d, w }) => {
  const h = Math.round(L(t, [w(wi(5, 3)) - 0.2, w(wi(5, 4)) + 0.4], [0, 4]));
  return (
    <Cam t={t} d={d} a={[1.4, 540, 820]} b={[1.7, 540, 760]}>
      <Room wall={["#141A40", "#0E1230"]} />
      <PhoneHero x={540} y={1200} s={1.25} face="terror" glow={1.6} color="#7A8C9B" />
      <g transform="translate(540 380)"><rect x={-130} y={-70} width={260} height={140} rx={20} fill="#2A2233" stroke={INK} strokeWidth={7} />
        <FitText x={0} y={30} text={`${h}+ сағ`} maxW={220} fs={70} fill="#7CFF8A" /></g>
    </Cam>
  );
};
const S07: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.1, 540, 880]}>
    <Room wall={["#B9C6F0", "#8E9BD0"]} />
    {Array.from({ length: 8 }, (_, i) => {
      const ph = L(t, [i * 0.2, i * 0.2 + 0.8], [0, 1]);
      return <g key={i} transform={`translate(${540 + ph * (rnd(i) - 0.5) * 900} ${700 - ph * 500}) rotate(${ph * (rnd(i + 2) - 0.5) * 120})`} opacity={1 - ph * 0.6}>
        <rect x={-150} y={-180} width={300} height={360} rx={20} fill="#FFFDF6" stroke={INK} strokeWidth={8} /><rect x={-150} y={-180} width={300} height={90} rx={20} fill="#E8484F" stroke={INK} strokeWidth={8} />
      </g>;
    })}
    <g transform={`translate(540 1150) scale(${popS(t, 0.8)})`}><circle r={170} fill="#FFE04A" stroke={INK} strokeWidth={10} /><FitText x={0} y={50} text="2 АЙ" maxW={260} fs={110} /></g>
    <FitText x={540} y={1450} text="ЖЫЛЫНА" maxW={400} fs={80} fill="#fff" stroke={INK} sw={4} />
  </Cam>
);
const S08: ShotC = ({ t, d, w }) => {
  const hit = w(wi(7, 5));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.12, 540, 880]}>
      <Room wall={["#F2D3C2", "#D9A98F"]} />
      <Bell x={250} y={520} s={0.9} t={t} />
      <Brain x={600} y={1000} s={1.3} face={t > hit ? "happy" : "want"} />
      <g transform={`translate(${L(t, [hit - 0.6, hit], [300, 560])} ${L(t, [hit - 0.6, hit], [640, 880])}) scale(${t < hit + 0.1 ? 1 : 0})`}>
        <path d="M-60,0 L-100,-30 L-100,30 Z M60,0 L100,-30 L100,30 Z" fill="#F2A0C0" stroke={INK} strokeWidth={6} />
        <ellipse rx={64} ry={42} fill="#F28A2E" stroke={INK} strokeWidth={7} />
      </g>
      {t > hit && <><Sparkle x={460} y={760} s={1.2} /><Sparkle x={780} y={720} s={1} /></>}
      <g transform={`translate(600 1500) scale(${popS(t, hit)})`}><Sign x={0} y={0} w={380} h={110} text="ДОФАМИН" fs={70} bg="#F2A0C0" /></g>
    </Cam>
  );
};
const S09: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.1, 540, 900]} b={[1.3, 540, 860]}>
    <Room wall={["#CDEFC7", "#A7D6A0"]} />
    <g transform="translate(540 600) scale(0.8)" stroke={INK} strokeWidth={9} strokeLinejoin="round">
      <rect x={-160} y={-120} width={320} height={240} fill="#E8484F" /><rect x={-180} y={-170} width={360} height={70} fill="#E8484F" />
      <rect x={-20} y={-170} width={40} height={290} fill="#FFE04A" />
    </g>
    <Brain x={540} y={1100} s={1.2} face="want" />
    {[0, 1].map((i) => <path key={i} d={`M${420 + i * 240},${1220} q0,${30 + Math.sin(t * 6 + i) * 10} -6,60`} fill="none" stroke="#7FD3FF" strokeWidth={10} strokeLinecap="round" />)}
  </Cam>
);
const S10: ShotC = ({ t, d, w }) => {
  const pull = L(t, [w(wi(9, 2)) - 0.3, w(wi(9, 2)) + 0.2, w(wi(9, 2)) + 0.6], [0, 1, 0]);
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.1, 560, 880]}>
      <Room wall={["#3B2C4E", "#2A2240"]} />
      {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={100 + i * 100} cy={260} r={18} fill={(Math.floor(t * 6) + i) % 2 ? "#FFE04A" : "#F28A2E"} stroke={INK} strokeWidth={4} />)}
      <Slot t={t} spin={pull > 0 || t > w(wi(9, 2)) ? 1 : 0} />
      <Hero id="me" x={980} y={1450} s={0.7} face="happy" gaze={-0.5} pose={P.up()} />
    </Cam>
  );
};
const S11: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.3, 540, 820]} b={[1.6, 540, 760]}>
    <Room wall={["#B9C6F0", "#8E9BD0"]} />
    <Hero id="me" x={540} y={1200} s={1.3} face="worried" gaze={0} sweat={1} pose={P.shrug()} />
    <text x={540} y={500} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={220} fill="#F2C55C" stroke={INK} strokeWidth={8}>?</text>
  </Cam>
);
const NumBadge: React.FC<{ n: number; t: number }> = ({ n, t }) => (
  <g transform={`translate(170 260) scale(${popS(t, 0)})`}><circle r={100} fill="#FFE04A" stroke={INK} strokeWidth={9} /><FitText x={0} y={50} text={`${n}`} maxW={120} fs={150} /></g>
);
const S12: ShotC = ({ t, d, w }) => {
  const off = t > w(wi(11, 3));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.1, 540, 880]}>
      <Room wall={["#CFE3EE", "#A7C4D6"]} />
      <NumBadge n={1} t={t} />
      <Bell x={540} y={700} s={1.5} t={t} off={off} />
      <Hero id="me" x={540} y={1300} s={0.95} face={off ? "happy" : "look"} gaze={0} pose={off ? P.up() : P.stand()} />
    </Cam>
  );
};
const S13: ShotC = ({ t, d, w }) => {
  const g = L(t, [w(wi(12, 2)) - 0.3, w(wi(12, 2)) + 0.4], [0, 1]);
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.12, 540, 860]}>
      <Room wall={["#F2D3C2", "#D9A98F"]} />
      <NumBadge n={2} t={t} />
      <g transform="translate(540 820) scale(2.2)" style={{ filter: `grayscale(${g})` }}>
        <Phone x={0} y={0} glow={1 - g}>
          {["#E8484F", "#F2C55C", "#56BA6C", "#4F6BD8", "#7B61FF", "#F28A2E"].map((c, i) => <rect key={c} x={-60 + (i % 3) * 44} y={-120 + Math.floor(i / 3) * 50} width={32} height={32} rx={8} fill={c} stroke={INK} strokeWidth={2} />)}
        </Phone>
      </g>
      <g transform="translate(540 1420)"><Sign x={0} y={0} w={420} h={110} text="АҚ-ҚАРА" fs={70} bg="#E9E6DE" /></g>
    </Cam>
  );
};
const S14: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.12, 520, 920]}>
    <Room wall={["#1E2350", "#141A40"]} />
    <NumBadge n={3} t={t} />
    <Window x={640} y={260} w={320} h={380} mode="night" />
    <g transform="translate(110 0)"><g stroke={INK} strokeWidth={8} strokeLinejoin="round">
      <rect x={60} y={1190} width={720} height={120} rx={20} fill="#C98A55" />
      <path d="M140,1190 Q420,1100 780,1190 L780,1250 L140,1250 Z" fill="#7B61FF" />
      <ellipse cx={140} cy={1160} rx={80} ry={40} fill="#fff" />
    </g>
    <Hero id="me" x={180} y={1080} s={0.55} face="blink" gaze={0} tilt={-80} pose={P.stand()} />
    <Zzz x={300} y={900} t={t} s={1.1} /></g>
    <g transform="translate(960 1300)"><rect x={-50} y={-300} width={100} height={300} fill="#8A5A3B" stroke={INK} strokeWidth={6} />
      <g transform="translate(0 -360) scale(0.3)"><Phone x={0} y={0} /></g>
      <path d="M-60,-470 L60,-350 M60,-470 L-60,-350" stroke="#E8484F" strokeWidth={16} strokeLinecap="round" /></g>
  </Cam>
);
const S15: ShotC = ({ t, d, w }) => {
  const drink = t > w(wi(14, 6));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.12, 540, 900]}>
      <Room wall={["#FFE8C2", "#F7D49A"]} />
      <NumBadge n={4} t={t} />
      <Window x={640} y={260} w={320} h={380} mode="day" />
      <Beam pts="640,260 960,260 1000,1300 500,1300" o={0.5} />
      <Shadow x={460} y={1470} s={1.4} />
      <Hero id="me" x={460} y={1230} s={1.1} face={drink ? "happy" : "blink"} gaze={0.4} pose={drink ? P.hold([90, -200]) : arms([-110, -300], [110, -300])}>
        {drink && <g transform="translate(90,-200)" stroke={INK} strokeWidth={6}><path d="M-34,-70 L34,-70 L26,40 L-26,40 Z" fill="#C9E8FF" /><rect x={-28} y={-20} width={56} height={58} fill="#7FC4FF" stroke="none" /></g>}
      </Hero>
    </Cam>
  );
};
const S16: ShotC = ({ t, d, w }) => {
  const look = t > w(wi(15, 9));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 940]} b={look ? [1.6, 760, 520] : [1.1, 540, 900]}>
      <Room wall={["#F7E3C8", "#E9C9A0"]} />
      <Window x={560} y={220} w={420} h={520} mode="dusk">
        <Sun x={300} y={380} r={60} face={false} />
        <path d="M0,420 Q120,360 240,410 Q330,380 420,420 L420,520 L0,520 Z" fill="#8E6BB8" />
      </Window>
      <rect x={60} y={1150} width={360} height={30} rx={8} fill="#8A5A3B" stroke={INK} strokeWidth={6} />
      <g transform="translate(240 1120) rotate(90) scale(0.3)"><Phone x={0} y={0} /></g>
      <Shadow x={620} y={1470} s={1.4} />
      <Hero id="me" x={620} y={1230} s={1.1} face="happy" gaze={0.7} pose={P.hug()} />
      {look && <><Sparkle x={700} y={340} s={1} /><Sparkle x={900} y={600} s={0.8} /></>}
    </Cam>
  );
};

export const SHOTS: Shot[] = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16].map((C) => ({ C }));
