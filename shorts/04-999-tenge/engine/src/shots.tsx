// «Неге баға 999 теңге?» — 17 сцен
import React from "react";
import { Easing } from "remotion";
import { INK, Person } from "./people";
import {
  arms, Bloom, Burst, Cam, Confetti, FitText, Hero, L, P, popS, rnd, Room, Shadow, ShotC, Sign, Sparkle, Suit, Sweat,
} from "./kit";
import { Shot } from "./film";
import { Bubble, Coin, House, Phone, Tag, wi } from "./mykit";

const BigTag: React.FC<{ x: number; y: number; s?: number; text: string; c?: string; rot?: number; hl?: number }> = ({ x, y, s = 1, text, c = "#FFE04A", rot = 0, hl = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <line x1={170} y1={0} x2={260} y2={-120} stroke={INK} strokeWidth={6} />
    <path d="M-260,-120 L170,-120 L250,0 L170,120 L-260,120 Z" fill={c} stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    <circle cx={165} cy={0} r={18} fill="#fff" stroke={INK} strokeWidth={6} />
    {hl > 0 && <rect x={-245} y={-95} width={110} height={190} rx={14} fill="#FF5A4E" opacity={0.35 * hl} />}
    <FitText x={-40} y={52} text={text} maxW={360} fs={150} />
  </g>
);
const Dress: React.FC<{ x: number; y: number; s?: number; c: string }> = ({ x, y, s = 1, c }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={7} strokeLinejoin="round">
    <path d="M0,-260 q-20,-30 10,-40 q30,-6 26,22" fill="none" strokeWidth={6} />
    <line x1={-90} y1={-230} x2={90} y2={-230} strokeWidth={8} />
    <path d="M-50,-230 L-70,-120 L-150,120 L150,120 L70,-120 L50,-230 Q0,-190 -50,-230 Z" fill={c} />
    <path d="M-70,-120 L70,-120" strokeWidth={6} />
  </g>
);
const BrainHead: React.FC<{ shake?: number; children?: React.ReactNode }> = ({ shake = 0, children }) => (
  <g transform={`rotate(${shake},540,900)`}>
    <circle cx={540} cy={820} r={400} fill="#FDFBF9" stroke={INK} strokeWidth={12} />
    <path d="M300,1170 Q540,1300 780,1170 L840,1500 L240,1500 Z" fill="#E8484F" stroke={INK} strokeWidth={10} />
    <path d="M390,860 Q540,700 690,860 Q760,760 700,640 Q620,520 540,560 Q460,520 380,640 Q320,760 390,860 Z" fill="#F4A6B8" stroke={INK} strokeWidth={8} />
    {["M440,700 Q480,660 520,700", "M560,640 Q600,690 640,650", "M450,800 Q540,760 630,800"].map((d) => <path key={d} d={d} fill="none" stroke={INK} strokeWidth={6} />)}
    {children}
  </g>
);
const Balance: React.FC<{ tilt: number; left: React.ReactNode; right: React.ReactNode }> = ({ tilt, left, right }) => (
  <g stroke={INK} strokeWidth={9} strokeLinejoin="round">
    <path d="M440,1450 L640,1450 L560,1100 L520,1100 Z" fill="#8A5A3B" />
    <g transform={`rotate(${tilt},540,1100)`}>
      <rect x={120} y={1085} width={840} height={30} rx={10} fill="#B97A52" />
      <g transform={`translate(160 1100) rotate(${-tilt})`}><line x1={0} y1={0} x2={0} y2={80} strokeWidth={6} /><ellipse cx={0} cy={90} rx={150} ry={26} fill="#C9CDD8" />{left}</g>
      <g transform={`translate(920 1100) rotate(${-tilt})`}><line x1={0} y1={0} x2={0} y2={80} strokeWidth={6} /><ellipse cx={0} cy={90} rx={150} ry={26} fill="#C9CDD8" />{right}</g>
    </g>
  </g>
);

const S01: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.15, 540, 860]}>
    <Room wall={["#F4E6CF", "#E3CDA8"]} />
    <BigTag x={520} y={720} s={1.1} text="999 ₸" rot={Math.sin(t * 3) * 6} />
    <Shadow x={780} y={1470} s={1.2} />
    <Hero id="me" x={780} y={1250} s={1.0} face="look" gaze={-0.6} pose={P.shrug()} />
  </Cam>
);
const S02: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.15, 540, 820]} b={[1.0, 540, 900]}>
    <Room wall={["#B9C6F0", "#8E9BD0"]} />
    <BigTag x={520} y={700} s={1.0} text="1000 ₸" c="#C9CDD8" rot={-4} />
    <g stroke="#E8484F" strokeWidth={40} strokeLinecap="round" opacity={popS(t, 0.3)}><line x1={240} y1={560} x2={800} y2={860} /></g>
    <text x={540} y={1180} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={220} fill="#F2C55C" stroke={INK} strokeWidth={8}>?</text>
  </Cam>
);
const S03: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.6, 540, 900]} b={[2.2, 540, 900]}>
    <Room wall={["#CDEFC7", "#A7D6A0"]} />
    <Bloom x={540} y={900} r={200} o={0.5} />
    <Coin x={540} y={900} s={0.9} spin={Math.sin(t * 2) * 0.6} label="1" />
    <Sparkle x={640} y={820} s={0.6} />
  </Cam>
);
const S04: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.1, 540, 860]}>
    <Room wall={["#7C8FD0", "#5968A8"]} />
    <BrainHead shake={Math.sin(t * 14) * 6 * L(t, [0.3, 0.6, d - 0.3, d], [0, 1, 1, 0])}>
      <path d="M450,1040 Q540,1000 630,1040" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" />
      <circle cx={460} cy={960} r={14} fill={INK} /><circle cx={620} cy={960} r={14} fill={INK} />
    </BrainHead>
  </Cam>
);
const S05: ShotC = ({ t, d, w }) => {
  const sweep = L(t, [w(wi(4, 2)), w(wi(4, 4))], [0, 1]);
  const stick = t > w(wi(4, 7));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 800]} b={[stick ? 1.5 : 1.1, stick ? 330 : 540, 760]}>
      <Room wall={["#F4E6CF", "#E3CDA8"]} />
      <BigTag x={520} y={760} s={1.1} text="999 ₸" hl={stick ? 1 : 0} />
      <g transform={`translate(${240 + sweep * 520} 520)`} stroke={INK} strokeWidth={7}>
        <ellipse rx={90} ry={56} fill="#fff" /><circle r={36} fill="#4F6BD8" /><circle r={16} fill={INK} />
      </g>
      {stick && <Burst x={300} y={760} r={170} rot={t * 30} />}
    </Cam>
  );
};
const S06: ShotC = ({ t, d, w }) => {
  const tilt = L(t, [w(wi(5, 5)) - 0.2, w(wi(5, 7)) + 0.3], [0, -12], Easing.out(Easing.back(2)));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 1000]} b={[1.08, 540, 980]}>
      <Room wall={["#E9E3C9", "#CFC6A0"]} />
      <Balance tilt={tilt}
        left={<g transform={`scale(${popS(t, 0.05)})`}><g transform="translate(0,20) scale(0.45)"><BigTag x={0} y={0} text="999" /></g></g>}
        right={<g transform={`scale(${popS(t, w(wi(5, 5)) - 0.1)})`}><g transform="translate(0,20) scale(0.45)"><BigTag x={0} y={0} text="1000" c="#C9CDD8" /></g></g>} />
      <g transform={`translate(160 600) scale(${popS(t, w(wi(5, 2)))})`}><Sign x={60} y={0} w={420} h={130} text="ТОҒЫЗ ЖҮЗ" fs={64} bg="#B9F0B0" /></g>
      <g transform={`translate(920 520) scale(${popS(t, w(wi(5, 7)))})`}><Sign x={-60} y={0} w={300} h={130} text="МЫҢ!" fs={80} bg="#E8484F" fg="#fff" /></g>
    </Cam>
  );
};
const S07: ShotC = ({ t, d, w }) => {
  const k = t > w(wi(6, 3));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.12, 540, 900]}>
      <Room wall={["#F2D3C2", "#D9A98F"]} />
      <Coin x={540} y={560} s={1.2} spin={t * 5} label="1" />
      <Shadow x={290} y={1470} s={1.3} /><Shadow x={790} y={1470} s={1.3} />
      <Hero id="a" x={290} y={1230} s={1.1} face="happy" gaze={0.3} pose={P.up()} />
      <Person id="b" x={790} y={1230} s={1.1} body="#E8484F" bodyDark="#B23A3F" face={k ? "terror" : "look"} gaze={-0.3} sweat={k ? 1 : 0} pose={P.shrug()} />
      <Sign x={290} y={1600} w={200} h={80} text="999" fs={50} bg="#B9F0B0" />
      <Sign x={790} y={1600} w={200} h={80} text="1000" fs={50} bg="#FFB4AE" />
    </Cam>
  );
};
const S08: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.15, 540, 820]}>
    <Room wall={["#7C8FD0", "#5968A8"]} />
    <BrainHead>
      <path d="M450,1040 Q540,1080 630,1040" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" />
      <circle cx={460} cy={960} r={14} fill={INK} /><circle cx={620} cy={960} r={14} fill={INK} />
    </BrainHead>
    <g transform={`translate(800 330) scale(${popS(t, w(wi(7, 4)) - 0.1)})`}><Bubble x={0} y={0} s={0.8} tail={[-150, 230]}><FitText x={0} y={40} text="900" maxW={300} fs={140} fill="#56BA6C" /></Bubble></g>
  </Cam>
);
const S09: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 960]} b={[1.12, 540, 920]}>
    <Room wall={["#E9E3C9", "#CFC6A0"]} />
    <rect x={120} y={300} width={840} height={440} rx={14} fill="#2F5D4A" stroke="#8A5A3B" strokeWidth={20} />
    <g transform={`translate(540 520) scale(${popS(t, w(wi(8, 2)) - 0.1)})`}>
      <FitText x={0} y={-30} text="СОЛ ЖАҚ" maxW={700} fs={110} fill="#fff" />
      <FitText x={0} y={100} text="ЦИФР ӘСЕРІ" maxW={700} fs={90} fill="#FFE04A" />
    </g>
    <Shadow x={300} y={1470} s={1.3} /><Shadow x={780} y={1470} s={1.3} />
    <Person id="s1" x={300} y={1230} s={1.1} body="#FFFFFF" bodyDark="#C8C3B8" hat="doctor" face="smug" gaze={0.4} pose={P.pointR()} />
    <Person id="s2" x={780} y={1230} s={1.1} body="#FFFFFF" bodyDark="#C8C3B8" hat="doctor" face="smile" gaze={-0.4} pose={P.hug()} />
  </Cam>
);
const DRESS_C = ["#7B61FF", "#E8484F", "#2FA39A"];
const S10: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.08, 540, 880]}>
    <Room wall={["#F7E3C8", "#E9C9A0"]} />
    <line x1={60} y1={560} x2={1020} y2={560} stroke={INK} strokeWidth={14} strokeLinecap="round" />
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${200 + i * 340} 860) scale(${popS(t, w(wi(9, 4 + Math.min(i, 1) + (i === 2 ? 2 : 0))) - 0.1)})`}>
        <Dress x={0} y={0} s={1.0} c={DRESS_C[1]} />
        <g transform="translate(0 270) scale(0.62)"><Tag x={0} y={0} text={["$34", "$39", "$44"][i]} /></g>
      </g>
    ))}
  </Cam>
);
const S11: ShotC = ({ t, d, w }) => {
  const win = w(wi(10, 6));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.2, 540, 860]}>
      <Room wall={["#F7E3C8", "#E9C9A0"]} />
      <line x1={60} y1={560} x2={1020} y2={560} stroke={INK} strokeWidth={14} strokeLinecap="round" />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${200 + i * 340} 860) scale(${i === 1 && t > win ? 1.2 : 0.9})`} opacity={i === 1 || t < win ? 1 : 0.4}>
          <Dress x={0} y={0} s={1.0} c={DRESS_C[1]} />
          <g transform="translate(0 270) scale(0.62)"><Tag x={0} y={0} text={["$34", "$39", "$44"][i]} c={i === 1 && t > win ? "#7CFF8A" : "#FFE04A"} /></g>
        </g>
      ))}
      {t > win && <><Bloom x={540} y={860} r={300} o={0.5} /><Confetti x={540} y={500} t={t - win} n={40} /></>}
      {[150, 400, 680, 930].map((x, i) => <Person key={i} id={`c${i}`} x={x} y={1500} s={0.6} body={["#E8484F", "#4F6BD8", "#F2C55C", "#56BA6C"][i]} bodyDark={INK} face="happy" gaze={x < 540 ? 0.5 : -0.5} pose={P.up()} />)}
    </Cam>
  );
};
const S12: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.15, 540, 860]} b={[1.0, 540, 900]}>
    <Room wall={["#3B3A5A", "#2A2948"]} />
    <Bloom x={540} y={800} r={400} o={0.6 + Math.sin(t * 8) * 0.15} c="R" />
    <g transform={`translate(540 800) rotate(-8) scale(${popS(t, 0.1)})`}>
      <rect x={-380} y={-130} width={760} height={260} rx={30} fill="#E8484F" stroke={INK} strokeWidth={10} />
      <FitText x={0} y={45} text="ЖЕҢІЛДІК!" maxW={660} fs={130} fill="#fff" />
    </g>
    <Sparkle x={200} y={560} s={1} /><Sparkle x={880} y={1060} s={1.2} />
  </Cam>
);
const S13: ShotC = ({ t, d, w }) => (
  <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.08, 540, 900]}>
    <Room wall={["#CFE3EE", "#A7C4D6"]} />
    <g transform={`translate(240 560) scale(${popS(t, w(wi(12, 2)) - 0.1)})`}><Dress x={0} y={0} s={0.8} c="#7B61FF" /><g transform="translate(0 200) scale(0.62)"><Tag x={0} y={0} text="9 990" /></g></g>
    <g transform={`translate(800 560) scale(${popS(t, w(wi(12, 4)) - 0.1)})`}><Phone x={0} y={0} s={1.0} /><g transform="translate(0 230) scale(0.62)"><Tag x={0} y={0} text="199 990" /></g></g>
    <g transform={`translate(540 1250) scale(${popS(t, w(wi(12, 7)) - 0.1)})`}><House x={0} y={0} s={0.9} /><g transform="translate(250 -120) scale(0.45)"><Tag x={0} y={0} text="29.9 млн" /></g></g>
  </Cam>
);
const S14: ShotC = ({ t, d, w }) => {
  const fooled = t > w(wi(13, 6));
  return (
    <Cam t={t} d={d} a={[1.3, 540, 820]} b={[1.6, 540, 760]}>
      <Room wall={["#F4E6CF", "#E3CDA8"]} />
      <Hero id="me" x={540} y={1200} s={1.3} face={fooled ? "happy" : "smug"} gaze={0.2} pose={fooled ? P.hold([130, -150]) : arms([-60, -10], [60, -330])}>
        {fooled && <g transform="translate(130,-150) scale(0.3)"><BigTag x={0} y={0} text="999" /></g>}
      </Hero>
    </Cam>
  );
};
const S15: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 940]} b={[1.12, 540, 880]}>
    <Room wall={["#F4E6CF", "#E3CDA8"]} />
    <Coin x={720 - ((t * 400) % 400)} y={500 + Math.pow(((t * 400) % 400) / 400, 2) * 500} s={0.8} spin={t * 9} label="1" />
    <Shadow x={540} y={1470} s={1.5} />
    <Suit id="owner" x={540} y={1220} s={1.2} face="happy" gaze={0.4} pose={arms([-120, -260], [140, -200 + Math.sin(t * 10) * 30])} badgeText="ДҮКЕН" />
  </Cam>
);
const S16: ShotC = ({ t, d, w }) => {
  const flip = t > w(wi(15, 7));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.12, 540, 860]}>
      <Room wall={["#B9F0B0", "#8FCF86"]} />
      <BigTag x={520} y={720} s={1.05} text={flip ? "≈ 5000" : "4990 ₸"} c={flip ? "#7CFF8A" : "#FFE04A"} rot={Math.sin(t * 3) * 4} />
      <Shadow x={780} y={1470} s={1.2} />
      <Hero id="me" x={780} y={1250} s={1.0} face={flip ? "smug" : "look"} gaze={-0.6} shades={flip} pose={flip ? P.pointR() : P.stand()} />
    </Cam>
  );
};
const S17: ShotC = ({ t, d, w }) => {
  const lose = t > w(wi(16, 6));
  return (
    <Cam t={t} d={d} a={[1.0, 540, 900]} b={[1.15, 540, 940]}>
      <Room wall={["#7C8FD0", "#5968A8"]} />
      <g transform={`translate(700 700) rotate(${Math.sin(t * 6) * 8})`}>
        <Coin x={0} y={0} s={2.2} label="1" />
        <path d="M-90,-110 L-60,-190 L-30,-120 Z M30,-120 L60,-190 L90,-110 Z" fill="#E8484F" stroke={INK} strokeWidth={6} />
        <path d="M-40,40 Q0,70 40,40" fill="none" stroke={INK} strokeWidth={8} />
      </g>
      <Shadow x={300} y={1470} s={1.3} />
      <Hero id="me" x={300} y={1230} s={1.15} face={lose ? "sad" : "worried"} gaze={0.5} sweat={1} pose={lose ? arms([-40, 20], [40, 20]) : P.shrug()} />
    </Cam>
  );
};

export const SHOTS: Shot[] = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17].map((C) => ({ C }));
