// Образец целого короткого фильма «Зеркало в лифте» (25 с, 10 сцен): как сцена слушает слова голоса, движется камера,
// работают общий реквизит, гэги и надписи внутри предметов. Для своего ролика писать новые сцены в shots.tsx.
import React from "react";
import { Easing } from "remotion";
import { INK, Person, sit } from "./people";
import {
  arms, Beam, Bloom, Cam, Desk, Envelope, FitText, Hero, L, P, Plant, popS, Puffs, rnd, Room, Shadow,
  ShotC, Sky, SkyClouds, Sparkle, Stopwatch, Suit, Sweat, Window, Zzz,
} from "./kit";
import { framesOf, makeFilm, Shot } from "./film";

const OWNER = { color: "#7A2E44", dark: "#541C2E" };

// ---------------------------------------------------------------- реквизит этого фильма
const Snail: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={5} strokeLinejoin="round">
    <path d={`M-64,0 Q${-20 + Math.sin(t * 4) * 6},-18 58,0 L80,-34 L68,0 Z`} fill="#E9C46A" />
    <circle cx={-6} cy={-32} r={34} fill="#C2703D" />
    <path d="M-6,-32 m-18,0 a18,18 0 1 1 18,18 a11,11 0 1 1 -8,-14" fill="none" stroke="#7E4322" strokeWidth={5} />
    <circle cx={82} cy={-46} r={5} fill={INK} />
  </g>
);

const Shaft: React.FC<{ cabY: number; t: number }> = ({ cabY, t }) => (
  <g>
    <rect x={190} y={250} width={700} height={1400} fill="#E7B98A" stroke={INK} strokeWidth={8} />
    <rect x={170} y={220} width={740} height={44} rx={8} fill="#B8704A" stroke={INK} strokeWidth={7} />
    {[0, 1, 2, 3, 4, 5].map((r) => [230, 730].map((x) => (
      <g key={`${r}-${x}`}>
        <rect x={x} y={300 + r * 220} width={120} height={140} fill={r % 2 ? "#FFE3A0" : "#BFE3FF"} stroke={INK} strokeWidth={6} />
        <line x1={x + 60} y1={300 + r * 220} x2={x + 60} y2={440 + r * 220} stroke={INK} strokeWidth={4} />
      </g>
    )))}
    <rect x={400} y={264} width={280} height={1386} fill="#4B4E76" stroke={INK} strokeWidth={7} />
    {[445, 635].map((x) => <line key={x} x1={x} y1={264} x2={x} y2={1650} stroke="#2C2E4D" strokeWidth={6} />)}
    <line x1={540} y1={264} x2={540} y2={cabY - 120} stroke="#C9CDD8" strokeWidth={7} />
    <rect x={425} y={cabY - 120} width={230} height={230} rx={12} fill="#F2C55C" stroke={INK} strokeWidth={8} />
    <rect x={445} y={cabY - 95} width={190} height={165} fill="#FFF5D6" stroke={INK} strokeWidth={5} />
    <Hero id="rider" x={540} y={cabY + 18} s={0.42} face="worried" gaze={Math.sin(t * 1.2) * 0.4} color="#4F6BD8" colorDark="#3650A8" />
  </g>
);

const Pile: React.FC<{ x: number; y: number; h: number }> = ({ x, y, h }) => (
  <g>{(() => {
    // горка от столешницы вверх: чем больше h, тем больше рядов
    const rows = Math.max(1, Math.ceil(7 * h));
    return Array.from({ length: rows * rows }, (_, i) => {
      const row = Math.floor(Math.sqrt(i)), col = i - row * row;
      const px = x + (col - row) * 58 + (rnd(i) - 0.5) * 18, py = y - (rows - 1 - row) * 46;
      return <Envelope key={i} x={px} y={py} s={0.8} rot={(rnd(i + 8) - 0.5) * 40} />;
    });
  })()}</g>
);

const Owner: React.FC<{ x: number; y: number; s: number; face: React.ComponentProps<typeof Suit>["face"]; gaze?: number; sweat?: number; pose?: ReturnType<typeof arms> }> =
  ({ x, y, s, face, gaze, sweat, pose }) => (
    <Person id="owner" x={x} y={y} s={s} body={OWNER.color} bodyDark={OWNER.dark} face={face} gaze={gaze} sweat={sweat} pose={pose ?? P.stand()}>
      <path d="M-54,-290 Q-42,-338 0,-340 Q42,-338 54,-290 Q0,-314 -54,-290 Z" fill="#2A2233" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M0,-132 L-34,-152 L-34,-112 Z M0,-132 L34,-152 L34,-112 Z" fill="#F2C55C" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={0} cy={-132} r={9} fill="#F2C55C" stroke={INK} strokeWidth={5} />
    </Person>
  );

const Mirror: React.FC<{ x: number; y: number; s?: number; glow?: number; children?: React.ReactNode }> = ({ x, y, s = 1, glow = 0, children }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {glow > 0 && <Bloom x={0} y={0} r={360} o={glow} />}
    <clipPath id="mirrorClip"><ellipse rx={140} ry={200} /></clipPath>
    <ellipse rx={140} ry={200} fill="#CDEBFA" />
    <g clipPath="url(#mirrorClip)">
      {children}
      <path d="M-120,-80 L40,-240 L90,-240 L-120,-20 Z" fill="#fff" opacity={0.5} />
    </g>
    <ellipse rx={140} ry={200} fill="none" stroke="#C99B3F" strokeWidth={24} />
    <ellipse rx={154} ry={214} fill="none" stroke={INK} strokeWidth={6} />
    <ellipse rx={126} ry={186} fill="none" stroke={INK} strokeWidth={5} />
  </g>
);

const CabWalls: React.FC = () => (
  <g>
    <rect x={-300} y={-300} width={1680} height={1600} fill="#D9A95E" />
    {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-300 + i * 190} y={-300} width={12} height={1600} fill="#A9783A" opacity={0.6} />)}
    <rect x={-300} y={1300} width={1680} height={800} fill="#6B5A78" />
    <rect x={-300} y={1290} width={1680} height={22} fill="#3F3550" stroke={INK} strokeWidth={5} />
  </g>
);

// ---------------------------------------------------------------- сцены
// 1. «В этом доме лифт едет так медленно» — разрез дома, кабину обгоняет улитка
const S1: ShotC = ({ t, d }) => {
  const cab = 1270 - t * 14;
  return (
    <Cam t={t} d={d} a={[0.82, 540, 900]} b={[1.28, 560, cab - 60]}>
      <Sky mode="day" />
      <SkyClouds x={80} y={250} s={1.6} /><SkyClouds x={1000} y={140} s={1.2} />
      <rect x={-600} y={1650} width={2280} height={900} fill="#7CC46A" />
      <Shaft cabY={cab} t={t} />
      <Snail x={700} y={1110 - t * 48} s={0.75} t={t} />
    </Cam>
  );
};

// 2. «что жильцы завалили хозяина жалобами» — письма летят в окно и засыпают стол
const S2: ShotC = ({ t, d }) => {
  const h = L(t, [0, Math.max(d - 0.3, 0.5)], [0.15, 1], Easing.out(Easing.quad));
  return (
    <Cam t={t} d={d} a={[1.15, 540, 900]} b={[1.0, 540, 960]} shake={h > 0.8 ? 3 : 0}>
      <Room wall={["#A9CDB8", "#7FA893"]} />
      <Window x={90} y={280} w={320} h={420} mode="day" />
      <Beam pts="410,280 690,280 1000,1250 620,1250" o={0.55} />
      <Shadow x={560} y={1500} s={2.2} />
      <Owner x={560} y={1130} s={1.25} face="shock" gaze={-0.4} sweat={h} pose={P.shrug()} />
      <Desk x={560} y={1200} w={760} />
      <Pile x={560} y={1180} h={h} />
      {Array.from({ length: 12 }, (_, i) => {
        const ph = ((t * 0.9 + rnd(i)) % 1);
        return <Envelope key={i} x={250 + ph * (rnd(i + 3) * 500 + 80)} y={500 + ph * 700 - Math.sin(ph * 3.14) * 180} s={0.9} rot={ph * 360 * (rnd(i + 1) - 0.4)} />;
      })}
    </Cam>
  );
};

// 3. «Инженеры приносят смету: новый мотор, миллион» — надпись на смете подгоняется под лист
const S3: ShotC = ({ t, d, w }) => {
  const sum = popS(t, w(18) - 0.05, 0.3);
  const mot = popS(t, w(16) - 0.05, 0.3);
  return (
    <Cam t={t} d={d} a={[1.14, 540, 900]} b={[1.0, 540, 880]}>
      <Room wall={["#7C8FD0", "#5968A8"]} />
      <Shadow x={185} y={1420} s={1.4} /><Shadow x={895} y={1420} s={1.4} />
      <Suit id="eng1" x={185} y={1230} s={1.15} hat="helmet" face="smug" gaze={0.5} pose={arms([-70, -10], [110, -150])} />
      <Suit id="eng2" x={895} y={1230} s={1.15} hat="helmet" face="smile" gaze={-0.5} pose={arms([-110, -150], [70, -10])} />
      <g transform={`translate(540 720) rotate(-3) scale(${0.3 + 0.52 * L(t, [0, 0.3], [0, 1])})`}>
        <rect x={-270} y={-330} width={540} height={660} rx={10} fill="#FFFDF6" stroke={INK} strokeWidth={8} />
        <FitText x={0} y={-250} text="СМЕТА" maxW={420} fs={84} />
        <line x1={-210} y1={-210} x2={210} y2={-210} stroke={INK} strokeWidth={6} />
        <g transform={`translate(0 -60) scale(${mot})`} stroke={INK} strokeWidth={7} strokeLinejoin="round">
          <rect x={-120} y={-70} width={240} height={140} rx={18} fill="#8E93A3" />
          {[-80, -40, 0, 40, 80].map((x) => <line key={x} x1={x} y1={-50} x2={x} y2={50} strokeWidth={5} />)}
          <circle cx={150} cy={0} r={34} fill="#E8484F" />
        </g>
        <g transform={`scale(${sum})`}>
          <FitText x={0} y={150} text="1 000 000" maxW={470} fs={100} fill="#D2343F" />
          <FitText x={0} y={230} text="рублей" maxW={300} fs={52} />
        </g>
      </g>
    </Cam>
  );
};

// 4. «Хозяин смотрит на цифру и бледнеет» — наезд на лицо; бледность задаёт tint сцены в списке ниже
const S4: ShotC = ({ t, d, w }) => {
  const pale = L(t, [w(23) - 0.1, w(24) + 0.2], [0, 1]);
  return (
    <Cam t={t} d={d} a={[1.25, 540, 900]} b={[2.2 + pale * 0.3, 540, 760]} shake={pale * 4}>
      <Room wall={["#7C8FD0", "#5968A8"]} />
      <Owner x={540} y={1120} s={1.3} face={pale > 0.4 ? "terror" : "look"} sweat={pale} />
      {pale > 0.4 && <><Sweat x={395} y={720} s={1.3} /><Sweat x={700} y={690} s={1} /></>}
    </Cam>
  );
};

// 5. «Но тут уборщица спрашивает: а зеркало вы пробовали?» — вход героини из-за края, зеркало в облачке на нужном слове
const S5: ShotC = ({ t, d, w }) => {
  const x = L(t, [-0.1, 0.5], [1250, 660], Easing.out(Easing.cubic));
  const bub = popS(t, w(30) - 0.1, 0.3);
  return (
    <Cam t={t} d={d} a={[1.0, 540, 960]} b={[1.12, 600, 900]}>
      <Room wall={["#E9C9A0", "#C99F73"]} />
      <Plant x={130} y={1270} s={1.1} />
      <Shadow x={x} y={1450} s={1.5} />
      <g stroke={INK} strokeWidth={8} strokeLinecap="round">
        <line x1={x + 190} y1={700} x2={x + 150} y2={1420} stroke="#A87A4C" />
        <path d={`M${x + 90},1420 L${x + 210},1420 L${x + 240},1470 L${x + 60},1470 Z`} fill="#F4EEDF" strokeLinejoin="round" />
      </g>
      <Person id="cleaner" x={x} y={1190} s={1.35} body="#4FB3A9" bodyDark="#37877F" face="smug" gaze={-0.5} pose={arms([-70, -10], [132, -160])}>
        <path d="M-92,-262 Q-94,-346 0,-346 Q94,-346 92,-262 Q40,-296 0,-296 Q-40,-296 -92,-262 Z" fill="#E8484F" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {[-50, -10, 30, 64].map((px, i) => <circle key={i} cx={px} cy={-312 + (i % 2) * 8} r={7} fill="#fff" />)}
      </Person>
      <g transform={`translate(330 620) scale(${bub})`}>
        <ellipse rx={270} ry={240} fill="#fff" stroke={INK} strokeWidth={8} />
        <path d="M150,180 L260,300 L60,226 Z" fill="#fff" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <path d="M80,202 L150,180 L150,212 L92,226 Z" fill="#fff" />
        <Mirror x={-30} y={0} s={0.72} />
        <text x={160} y={70} textAnchor="middle" fontFamily="Arial Black, Arial, Montserrat, sans-serif" fontWeight={900} fontSize={140} fill="#D2343F" stroke={INK} strokeWidth={5}>?</text>
      </g>
    </Cam>
  );
};

// 6. «Все смеются» — толпа хохочет и трясётся, хозяин сгибается пополам
const S6: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.2, 540, 980]} b={[1.0, 540, 960]} shake={5}>
    <Room wall={["#7C8FD0", "#5968A8"]} />
    {[[130, 1130, "#E8484F"], [360, 1090, "#F2C55C"], [610, 1100, "#56BA6C"], [860, 1120, "#7B61FF"]].map(([x, y, c], i) => (
      <Person key={i} id={`lol${i}`} x={(x as number) + Math.sin(t * 22 + i) * 6} y={(y as number) + Math.abs(Math.sin(t * 16 + i)) * -22} s={0.95}
        tilt={Math.sin(t * 14 + i * 2) * 5} body={c as string} bodyDark={INK} face="happy" pose={P.hug()} />
    ))}
    <Shadow x={540} y={1500} s={2} />
    <Owner x={540 + Math.sin(t * 24) * 6} y={1290 + Math.abs(Math.sin(t * 18)) * -28} s={1.18} face="happy" pose={P.up()} />
  </Cam>
);

// 7. «Зеркало вешают в лифт» — макро: зеркало опускается на стену, удар, искры, блеск
const S7: ShotC = ({ t, d, w }) => {
  const y = L(t, [0, Math.max(w(38) - 0.05, 0.2)], [-260, 640], Easing.in(Easing.quad));
  const hit = t - w(38);
  return (
    <Cam t={t} d={d} a={[1.05, 540, 800]} b={[1.2, 540, 730]} shake={hit > 0 && hit < 0.2 ? 14 : 0}>
      <CabWalls />
      <Mirror x={540} y={y} glow={hit > 0 ? 0.7 : 0} />
      {hit > 0 && <><Sparkle x={320} y={430} s={L(hit, [0, 0.2], [0, 1.6])} /><Sparkle x={770} y={550} s={L(hit, [0.05, 0.25], [0, 1.2])} /><Sparkle x={700} y={880} s={L(hit, [0.1, 0.3], [0, 1])} /></>}
      <Puffs x={540} y={860} t={hit} n={8} c="#EADFC9" size={0.6} life={0.8} />
    </Cam>
  );
};

// 8. «И жалобы пропадают» — куча тает на слове, хозяин спит за пустым столом
const S8: ShotC = ({ t, d, w }) => {
  const h = 1 - L(t, [w(40), w(41) + 0.2], [0, 1]);
  const calm = h < 0.1;
  return (
    <Cam t={t} d={d} a={[1.0, 540, 960]} b={[1.14, 560, 980]}>
      <Room wall={["#A9CDB8", "#7FA893"]} />
      <Window x={90} y={280} w={320} h={420} mode="day" />
      <Beam pts="410,280 690,280 1000,1250 620,1250" o={0.7} />
      <Shadow x={560} y={1500} s={2.2} />
      <Owner x={560} y={1130} s={1.25} face={calm ? "blink" : "worried"} gaze={0.2} pose={calm ? arms([-40, -60], [40, -60], sit()) : P.stand()} />
      <Desk x={560} y={1200} w={760} />
      {h > 0.02 && <Pile x={560} y={1180} h={h} />}
      {calm && <Zzz x={720} y={720} t={t} s={1.4} />}
    </Cam>
  );
};

// 9. «Дело в том, что лифт быстрее не стал» — тот же разрез дома, секундомер, улитка снова впереди
const S9: ShotC = ({ t, d, w }) => {
  const cab = 900 - t * 14;
  return (
    <Cam t={t} d={d} a={[1.26, 540, cab - 40]} b={[0.96, 540, 850]}>
      <Sky mode="dusk" />
      <SkyClouds x={80} y={260} s={1.5} />
      <rect x={-600} y={1650} width={2280} height={900} fill="#5E9C57" />
      <Shaft cabY={cab} t={t} />
      <Snail x={700} y={680 - t * 60} s={0.75} t={t} />
      <g transform={`translate(190 ${cab - 40}) scale(${popS(t, w(47) - 0.05)})`}><Stopwatch x={0} y={0} s={1.1} hand={t * 0.4} /></g>
    </Cam>
  );
};

// 10. «Просто теперь людям есть на кого посмотреть» — панчлайн: жилец любуется собой, камера наезжает на отражение
const S10: ShotC = ({ t, d, w }) => {
  const smug = t > w(52);
  const fix = Math.sin(t * 6) * 8;
  return (
    <Cam t={t} d={d} a={[0.96, 540, 900]} b={[1.16, 510, 860]}>
      <CabWalls />
      <Mirror x={310} y={690} s={1.25} glow={0.3}>
        <rect x={-300} y={-400} width={600} height={800} fill="#E8CF9F" />
        <Hero id="reflect" x={20} y={120} s={0.68} face="smug" gaze={0.6} color="#4F6BD8" colorDark="#3650A8" pose={arms([-110 + fix, -300], [70, -10])} />
      </Mirror>
      <Shadow x={720} y={1500} s={1.5} />
      <Hero id="rider2" x={720} y={1190} s={1.38} face={smug ? "smug" : "smile"} gaze={-0.7} color="#4F6BD8" colorDark="#3650A8" pose={arms([-60, -10], [110 + fix, -300])} />
    </Cam>
  );
};

const SHOTS: Shot[] = [
  { C: S1 }, { C: S2 }, { C: S3 },
  { C: S4, tint: (t, w) => `saturate(${1 - 0.8 * L(t, [w(23) - 0.1, w(24) + 0.2], [0, 1])}) brightness(${1 + 0.12 * L(t, [w(23) - 0.1, w(24) + 0.2], [0, 1])})` },
  { C: S5 }, { C: S6 }, { C: S7 }, { C: S8 }, { C: S9 }, { C: S10 },
];

const STARTS = [0, 2.3, 4.88, 8.44, 11.03, 14.69, 15.85, 17.61, 19.21, 21.89];
const WS = [0, 0.2, 0.38, 0.7, 1, 1.3, 1.48, 2.3, 2.52, 2.88, 3.42, 3.86, 4, 4.88, 5.42, 5.92, 6.66, 6.94, 7.62, 8.44, 8.98, 9.46, 9.6, 9.92, 10.08,
  11.03, 11.25, 11.39, 12.03, 13.05, 13.17, 13.55, 13.75, 14.69, 14.95, 15.85, 16.39, 16.81, 16.95, 17.61, 17.81, 18.17, 19.21, 19.55, 19.71, 20.17,
  20.35, 20.63, 21.09, 21.27, 21.89, 22.27, 22.57, 22.91, 23.23, 23.43, 23.63];
const TOTAL = 24.75;

export const DEMO_FRAMES = framesOf(TOTAL);
export const DemoLift = makeFilm(SHOTS, STARTS, WS, TOTAL);
