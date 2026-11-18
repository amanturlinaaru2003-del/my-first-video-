// «Күніне 1% ережесі» — мультфильм, 19 сцен. Екі егіз: Жасыл (жақсарады) және Қызыл (нашарлайды).
import React from "react";
import { Easing } from "remotion";
import { INK, Person } from "./people";
import {
  arms, Beam, Bloom, Burst, Cam, Confetti, Desk, FitText, Hero, L, P, popS, Puffs, rnd, Room, Shadow, ShotC, Sign, Sky,
  SkyClouds, Sparkle, SpeedLines, Stopwatch, Sweat,
} from "./kit";
import { Shot } from "./film";
import { Bubble, Grass, Sun, wi } from "./mykit";

const G = { color: "#56BA6C", colorDark: "#3E8A4E" }, R = { color: "#E8484F", colorDark: "#B23A3F" };
const Stairs: React.FC<{ x0: number; y0: number; n: number; dx?: number; dy?: number; c?: string }> = ({ x0, y0, n, dx = 120, dy = 70, c = "#C98A55" }) => (
  <g stroke={INK} strokeWidth={7} strokeLinejoin="round">
    {Array.from({ length: n }, (_, i) => <rect key={i} x={x0 + i * dx} y={y0 - (i + 1) * dy} width={dx} height={(i + 1) * dy} fill={i % 2 ? c : "#B97A52"} />)}
  </g>
);
const Calc: React.FC<{ x: number; y: number; s?: number; line1: string; line2: string; show2: number; c?: string }> = ({ x, y, s = 1, line1, line2, show2, c = "#7CFF8A" }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={9} strokeLinejoin="round">
    <rect x={-300} y={-420} width={600} height={840} rx={50} fill="#5A5470" />
    <rect x={-250} y={-370} width={500} height={260} rx={20} fill="#1E2A24" />
    <FitText x={220} y={-270} text={line1} maxW={440} fs={80} fill="#B9F0B0" anchor="end" />
    {show2 > 0 && <FitText x={220} y={-150} text={line2} maxW={440} fs={110} fill={c} anchor="end" />}
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-240 + (i % 3) * 170} y={-60 + Math.floor(i / 3) * 115} width={140} height={90} rx={18} fill={i === 11 ? "#F28A2E" : "#C9CDD8"} strokeWidth={6} />)}
  </g>
);
const Couch: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={8} strokeLinejoin="round">
    <rect x={-300} y={-260} width={600} height={200} rx={40} fill="#7B61FF" />
    <rect x={-340} y={-100} width={680} height={130} rx={30} fill="#9A85FF" />
    <rect x={-380} y={-180} width={90} height={220} rx={30} fill="#7B61FF" /><rect x={290} y={-180} width={90} height={220} rx={30} fill="#7B61FF" />
  </g>
);
const Cape: React.FC<{ t: number }> = ({ t }) => (
  <path d={`M-60,-150 Q${-140 + Math.sin(t * 6) * 20},40 ${-120 + Math.sin(t * 6) * 30},120 L120,120 Q${140 + Math.sin(t * 6 + 1) * 20},40 60,-150 Z`} fill="#E8484F" stroke={INK} strokeWidth={6} />
);
const Twins: React.FC<{ t: number; k: number }> = ({ t, k }) => (
  <g>
    <Shadow x={300} y={1470} s={1.2 + k * 0.6} /><Shadow x={780} y={1470} s={1.2} />
    <g transform={`translate(300 1470) scale(${1 + k * 0.5}) translate(-300 -1470)`}>
      <Hero id="g" x={300} y={1240} s={1.05} {...G} face={k > 0.5 ? "smug" : "smile"} gaze={0.3} pose={k > 0.5 ? arms([-130, -230], [130, -230]) : P.stand()}>
        {k > 0.5 && <path d="M-36,-130 L0,-100 L36,-130 L20,-60 L-20,-60 Z" fill="#FFE04A" stroke={INK} strokeWidth={5} />}
      </Hero>
    </g>
    <g transform={`translate(780 1470) scale(${1 - k * 0.45}) translate(-780 -1470)`}>
      <Hero id="r" x={780} y={1240} s={1.05} {...R} face={k > 0.5 ? "sad" : "smile"} gaze={-0.3} sweat={k} pose={k > 0.5 ? arms([-40, 20], [40, 20]) : P.stand()} />
    </g>
  </g>
);

const S01: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.4, 260, 1250]} b={[0.85, 540, 900]}>
    <Sky mode="day" /><SkyClouds x={250} y={300} s={1.2} /><Sun x={900} y={220} r={90} t={t} />
    <Grass y={1450} />
    <Stairs x0={180} y0={1450} n={8} dx={110} dy={110} />
    <Hero id="g" x={235} y={1180 + L(t, [0.8, 1.4], [0, -110])} s={0.65} {...G} face="happy" gaze={0.6} pose={P.up()} />
    <g transform={`translate(${290} ${1100}) scale(${popS(t, 1.2)})`}><Sign x={0} y={0} w={170} h={80} text="+1%" fs={52} bg="#FFE04A" /></g>
  </Cam>
);
const S02: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.15, 540, 860]}>
    <Room wall={["#B9C6F0", "#8E9BD0"]} />
    <circle cx={540} cy={740} r={10} fill="#56BA6C" stroke={INK} strokeWidth={3} />
    <g transform={`translate(${520 + Math.sin(t * 2) * 40} 760)`}>
      <circle r={200} fill="#fff" fillOpacity={0.25} stroke={INK} strokeWidth={14} />
      <line x1={140} y1={140} x2={300} y2={300} stroke={INK} strokeWidth={40} strokeLinecap="round" />
      <FitText x={0} y={30} text="1%" maxW={180} fs={90} fill="#56BA6C" />
    </g>
    <Shadow x={780} y={1470} s={1.2} />
    <Hero id="r" x={780} y={1240} s={1.05} {...R} face="happy" gaze={-0.5} pose={P.hug()} />
  </Cam>
);
const S03: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.3, 540, 820]} b={[1.5, 540, 780]}>
    <Room wall={["#F7E3C8", "#E9C9A0"]} />
    <Hero id="g" x={540} y={1200} s={1.3} {...G} face="look" gaze={0} pose={arms([-90, -150], [90, -150])}>
      <g transform="translate(0,-150)" stroke={INK} strokeWidth={6} strokeLinejoin="round">
        <path d="M-130,-80 L0,-60 L0,60 L-130,40 Z" fill="#FFFDF6" /><path d="M130,-80 L0,-60 L0,60 L130,40 Z" fill="#FFFDF6" />
        <path d={`M0,-60 Q${60 - (t * 120) % 120},${-90} ${130 - (t * 260) % 260},-80`} fill="none" strokeWidth={5} />
      </g>
    </Hero>
    <g transform="translate(760 420)"><Sign x={0} y={0} w={220} h={90} text="1 БЕТ" fs={56} bg="#FFF3C4" /></g>
  </Cam>
);
const S04: ShotC = ({ t, d }) => {
  const j = Math.abs(Math.sin(t * 7));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.12, 540, 900]}>
      <Room wall={["#CDEFC7", "#A7D6A0"]} />
      <Shadow x={420} y={1470} s={1.3 - j * 0.3} />
      <Hero id="g" x={420} y={1230 - j * 80} s={1.1} {...G} face="happy" gaze={0} pose={j > 0.5 ? P.up() : arms([-120, 20], [120, 20])} />
      <g transform="translate(820 600)"><Stopwatch x={0} y={0} s={1.5} hand={t * 1.5} /></g>
      <g transform="translate(820 860)"><Sign x={0} y={0} w={240} h={90} text="5 МИН" fs={56} bg="#FFF3C4" /></g>
    </Cam>
  );
};
const S05: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.1, 540, 880]}>
    <Room wall={["#F2D3C2", "#D9A98F"]} />
    {["apple", "book", "sun", "water", "dream"].map((w0, i) => (
      <g key={w0} transform={`translate(${200 + (i % 3) * 340} ${380 + Math.floor(i / 3) * 280}) rotate(${(rnd(i) - 0.5) * 16}) scale(${popS(t, i * 0.2)})`}>
        <rect x={-140} y={-90} width={280} height={180} rx={16} fill="#FFFDF6" stroke={INK} strokeWidth={7} />
        <FitText x={0} y={20} text={w0} maxW={220} fs={64} fill="#2F6FE0" />
      </g>
    ))}
    <Hero id="g" x={540} y={1260} s={1.0} {...G} face="smile" gaze={0} pose={P.hold([120, -180])} />
    <g transform="translate(540 1600)"><Sign x={0} y={0} w={300} h={90} text="+10 СӨЗ" fs={56} bg="#B9F0B0" /></g>
  </Cam>
);
const S06: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.12, 540, 900]}>
    <Room wall={["#E9E3C9", "#CFC6A0"]} />
    <rect x={120} y={300} width={840} height={460} rx={14} fill="#2F5D4A" stroke="#8A5A3B" strokeWidth={20} />
    <text x={540} y={500} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={120} fill="#fff" opacity={0.9}>xⁿ = ?</text>
    <text x={540} y={660} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={80} fill="#FFE04A" opacity={0.9}>∑ π √</text>
    <Shadow x={760} y={1470} s={1.3} />
    <Person id="prof" x={760} y={1230} s={1.15} body="#5A5470" bodyDark="#3E3A55" face="smug" gaze={-0.6} pose={P.pointR()}>
      <path d="M-60,-140 Q0,-60 60,-140 Q40,-90 0,-80 Q-40,-90 -60,-140 Z" fill="#F4F1EA" stroke={INK} strokeWidth={5} />
      <circle cx={-34} cy={-236} r={26} fill="none" stroke={INK} strokeWidth={6} /><circle cx={34} cy={-236} r={26} fill="none" stroke={INK} strokeWidth={6} />
    </Person>
  </Cam>
);
const S07: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.2, 540, 760]}>
    <Room wall={["#B9C6F0", "#8E9BD0"]} />
    <Calc x={540} y={940} s={1.1} line1="1,01³⁶⁵ =" line2="37,78" show2={t > w(wi(6, 5)) - 0.1 ? 1 : 0} />
    {t > w(wi(6, 5)) && <><Bloom x={540} y={760} r={300} o={0.5} /><Sparkle x={300} y={500} s={1.2} /><Sparkle x={800} y={460} s={1} /></>}
  </Cam>
);
const S08: ShotC = ({ t, d, w }) => {
  const k = L(t, [0, w(wi(7, 4)) + 0.3], [0, 1]);
  return (
    <Cam t={t} d={d} a={[1.0, 540, 1000]} b={[1.2, 540, 860]}>
      <Sky mode="dusk" /><Bloom x={540} y={760} r={600} o={0.6} />
      {k > 0.6 && <SpeedLines x={540} y={800} t={t} n={16} r0={400} r1={900} o={0.3} />}
      <g transform={`translate(540 1400) scale(${1 + k * 0.6}) translate(-540 -1400)`}>
        {k > 0.5 && <g transform="translate(540 1150) scale(1.1)"><Cape t={t} /></g>}
        <Hero id="g" x={540} y={1150} s={1.1} {...G} face="smug" gaze={0} pose={arms([-140, -320], [140, -320])}>
          {k > 0.5 && <path d="M-36,-130 L0,-100 L36,-130 L20,-60 L-20,-60 Z" fill="#FFE04A" stroke={INK} strokeWidth={5} />}
        </Hero>
      </g>
      <g transform={`translate(840 330) scale(${popS(t, w(wi(7, 3)) - 0.1) * 0.8})`}><circle r={150} fill="#FFE04A" stroke={INK} strokeWidth={10} /><FitText x={0} y={45} text="×37" maxW={240} fs={120} /></g>
    </Cam>
  );
};
const S09: ShotC = ({ t, d }) => {
  const slide = L(t, [0.2, d], [0, 1], Easing.in(Easing.quad));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.1, 560, 1000]}>
      <Sky mode="noir" />
      <path d="M-200,300 L1300,1500 L1300,2400 L-200,2400 Z" fill="#5A5470" stroke={INK} strokeWidth={8} />
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-200 + i * 125},${300 + i * 100} l0,100 l125,0`} fill="none" stroke={INK} strokeWidth={6} />)}
      <g transform={`translate(${200 + slide * 600} ${560 + slide * 480}) rotate(38)`}>
        <Couch x={0} y={0} s={0.7} />
        <Hero id="r" x={0} y={-140} s={0.65} {...R} face="blink" gaze={0} pose={arms([-90, -80], [90, -80], undefined)} />
      </g>
      <g transform="translate(860 400)"><Sign x={0} y={0} w={180} h={90} text="−1%" fs={60} bg="#FFB4AE" /></g>
    </Cam>
  );
};
const S10: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.2, 540, 760]}>
    <Room wall={["#3B3A5A", "#2A2948"]} />
    <Calc x={540} y={940} s={1.1} line1="0,99³⁶⁵ =" line2="0,03" show2={t > w(wi(9, 6)) - 0.2 ? 1 : 0} c="#FF6A5E" />
  </Cam>
);
const S11: ShotC = ({ t, d }) => {
  const k = L(t, [0, d], [1, 0.12], Easing.in(Easing.quad));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 1000]} b={[1.6, 540, 1380]}>
      <Room wall={["#3B3A5A", "#2A2948"]} />
      <g transform={`translate(540 1450) scale(${k}) translate(-540 -1450)`}>
        <Shadow x={540} y={1470} s={1.4} />
        <Hero id="r" x={540} y={1240} s={1.1} {...R} face="shock" gaze={0} sweat={1} pose={P.shrug()} />
      </g>
      <FitText x={540} y={760} text="≈ 0" maxW={300} fs={200} fill="#FF6A5E" />
    </Cam>
  );
};
const S12: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.08, 540, 920]}>
    <Room wall={["#F7E3C8", "#E9C9A0"]} />
    <Twins t={t} k={0.03} />
    <g transform="translate(540 420)"><Sign x={0} y={0} w={360} h={110} text="1 КҮН" fs={70} bg="#FFF3C4" /></g>
  </Cam>
);
const S13: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.08, 540, 920]} b={[1.0, 540, 940]}>
    <Room wall={["#F2D3C2", "#D9A98F"]} />
    <Twins t={t} k={0.08} />
    <g transform="translate(540 420)"><Sign x={0} y={0} w={360} h={110} text="1 АПТА" fs={70} bg="#FFF3C4" /></g>
  </Cam>
);
const S14: ShotC = ({ t, d, w }) => {
  const k = L(t, [w(wi(13, 6)) - 0.3, w(wi(13, 7)) + 0.3], [0.08, 1], Easing.out(Easing.back(1.5)));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.05, 540, 920]} shake={t > w(wi(13, 6)) && t < w(wi(13, 6)) + 0.3 ? 8 : 0}>
      <Room wall={["#CDEFC7", "#A7D6A0"]} />
      <line x1={540} y1={300} x2={540} y2={1500} stroke="#fff" strokeWidth={8} strokeDasharray="24 20" />
      <Twins t={t} k={k} />
      <g transform="translate(540 420)"><Sign x={0} y={0} w={360} h={110} text="1 ЖЫЛ" fs={70} bg="#FFE04A" /></g>
    </Cam>
  );
};
const S15: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.12, 540, 900]}>
    <Sky mode="dusk" />
    <Sun x={540} y={620} r={170} t={t} face={false} />
    <rect x={-700} y={1250} width={2480} height={1400} fill="#9FBE7A" />
    <g stroke={INK} strokeWidth={10} strokeLinejoin="round">
      <rect x={240} y={560} width={60} height={700} fill="#D2343F" /><rect x={780} y={560} width={60} height={700} fill="#D2343F" />
      <path d="M140,520 Q540,440 940,520 L940,580 Q540,510 140,580 Z" fill="#D2343F" />
      <rect x={200} y={660} width={680} height={50} fill="#D2343F" />
    </g>
    <g transform="translate(540 980)"><Sign x={0} y={0} w={460} h={130} text="改善 · КАЙДЗЕН" fs={66} bg="#FFF3C4" /></g>
    {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={(rnd(i) * 1080 + t * 60) % 1080} cy={300 + rnd(i + 4) * 600 + t * 40} r={14} fill="#F2A0C0" stroke={INK} strokeWidth={3} />)}
  </Cam>
);
const S16: ShotC = ({ t, d }) => {
  const k = L(t, [0, d], [0, 1]);
  return (
    <Cam t={t} d={d} a={[1.0, 540, 1100]} b={[1.0, 540, 800]}>
      <Sky mode="day" /><SkyClouds x={250} y={300} s={1.2} />
      <path d="M-700,1700 L540,300 L1780,1700 Z" fill="#7A8CC8" stroke={INK} strokeWidth={8} />
      <path d="M430,425 L540,300 L650,425 L600,450 L540,410 L480,450 Z" fill="#fff" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 16 }, (_, i) => {
        const f = i / 16, x = 100 + Math.sin(f * 12) * 120 + f * 400, y = 1600 - f * 1150;
        return <g key={i} opacity={f < k ? 1 : 0.15}><ellipse cx={x - 14} cy={y} rx={12} ry={18} fill={INK} /><ellipse cx={x + 14} cy={y - 24} rx={12} ry={18} fill={INK} /></g>;
      })}
      <Hero id="g" x={100 + Math.sin(k * 12) * 120 + k * 400} y={1600 - k * 1150 - 160} s={0.5} {...G} face="happy" gaze={0.5} pose={P.up()} />
    </Cam>
  );
};
const S17: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.15, 540, 860]}>
    <Room wall={["#3B3A5A", "#2A2948"]} />
    <Beam pts="380,0 700,0 860,1300 220,1300" o={0.6} />
    <g transform={`translate(540 820) rotate(${Math.sin(t * 2) * 4})`} stroke={INK} strokeWidth={10} strokeLinejoin="round">
      <rect x={-280} y={-380} width={560} height={760} rx={20} fill="#2F6FE0" />
      <rect x={-280} y={-380} width={60} height={760} fill="#1F4FB0" />
      <circle cx={30} cy={-60} r={110} fill="#FFE04A" />
      <circle cx={30} cy={-60} r={30} fill="#E8484F" />
      {[0, 60, 120].map((a) => <ellipse key={a} cx={30} cy={-60} rx={170} ry={50} transform={`rotate(${a} 30 -60)`} fill="none" stroke="#fff" strokeWidth={6} />)}
      <FitText x={30} y={160} text="АТОМДЫҚ" maxW={420} fs={74} fill="#fff" />
      <FitText x={30} y={250} text="ӘДЕТТЕР" maxW={420} fs={74} fill="#fff" />
    </g>
  </Cam>
);
const S18: ShotC = ({ t, d, w }) => {
  const drop = L(t, [w(wi(17, 6)) - 0.4, w(wi(17, 7))], [0, 1], Easing.in(Easing.quad));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.12, 560, 900]}>
      <Room wall={["#CFE3EE", "#A7C4D6"]} />
      <g stroke={INK} strokeWidth={9} strokeLinejoin="round">
        <rect x={560} y={980} width={380} height={420} rx={20} fill="#2F6FE0" />
        <rect x={650} y={970} width={200} height={24} fill={INK} />
        <FitText x={750} y={1240} text="БОЛАШАҚ МЕН" maxW={320} fs={44} fill="#fff" />
      </g>
      <g transform={`translate(${520 + drop * 230} ${700 + drop * 260}) rotate(${drop * 80})`}><rect x={-80} y={-110} width={160} height={220} rx={10} fill="#FFFDF6" stroke={INK} strokeWidth={7} />
        <path d="M-40,0 L-10,40 L50,-40" fill="none" stroke="#56BA6C" strokeWidth={14} strokeLinecap="round" /></g>
      <Shadow x={330} y={1470} s={1.3} />
      <Hero id="g" x={330} y={1230} s={1.1} {...G} face="smile" gaze={0.6} pose={P.hold([140, -200])} />
    </Cam>
  );
};
const S19: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.25, 540, 820]}>
    <Room wall={["#F7E3C8", "#E9C9A0"]} />
    <Bloom x={540} y={620} r={360} o={0.6} />
    <g transform={`translate(540 ${620 + Math.sin(t * 3) * 14}) scale(${popS(t, w(wi(18, 2)) - 0.1)})`}><circle r={170} fill="#FFE04A" stroke={INK} strokeWidth={10} /><FitText x={0} y={50} text="1%" maxW={260} fs={150} /></g>
    <Hero id="g" x={540} y={1230} s={1.1} {...G} face="smug" gaze={0} pose={P.pointR()} />
    <text x={860} y={1000} fontFamily="Montserrat" fontWeight={900} fontSize={180} fill="#F2C55C" stroke={INK} strokeWidth={7}>?</text>
  </Cam>
);

export const SHOTS: Shot[] = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19].map((C) => ({ C }));
