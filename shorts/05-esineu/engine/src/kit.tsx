// Набор для мультика: камера, готовые герои (Hero, Suit), реквизит, фоны и 2D-эффекты.
// Всё в координатах мира 1080×1920; время шота t — секунды от его начала (во время растворения t < 0).
import React from "react";
import { Easing, interpolate } from "remotion";
import { HEAD, INK, Person, PersonProps, Pose, Pt, SHADOW, stand } from "./people";

export { INK, SHADOW };
export const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.bezier(0.45, 0, 0.25, 1);
export const L = (t: number, a: number[], b: number[], e: (x: number) => number = ease) =>
  interpolate(t, a, b, { ...cl, easing: e });
export const popS = (t: number, t0: number, d = 0.28) => L(t, [t0, t0 + d], [0, 1], Easing.out(Easing.back(2.4)));
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export type ShotProps = { t: number; d: number; w: (i: number) => number };
export type ShotC = React.FC<ShotProps>;

// ---------------------------------------------------------------- камера
export type K = [number, number, number, number?];      // зум, центр x, центр y, наклон
export const Cam: React.FC<{ t: number; d: number; a: K; b: K; shake?: number; e?: (x: number) => number; children?: React.ReactNode }> =
  ({ t, d, a, b, shake = 0, e, children }) => {
    const k = L(t, [0, d], [0, 1], e ?? Easing.bezier(0.3, 0.1, 0.4, 1));
    const m = (i: number) => (a[i] ?? 0) + ((b[i] ?? 0) - (a[i] ?? 0)) * k;
    const sx = shake * (Math.sin(t * 53) * 0.6 + Math.sin(t * 31) * 0.4), sy = shake * Math.sin(t * 41 + 1);
    return <g transform={`translate(${540 + sx} ${960 + sy}) rotate(${m(3)}) scale(${m(0)}) translate(${-m(1)} ${-m(2)})`}>{children}</g>;
  };
export const Blur: React.FC<{ on?: boolean; children?: React.ReactNode }> = ({ on = true, children }) =>
  <g filter={on ? "url(#dof)" : undefined}>{children}</g>;

// ---------------------------------------------------------------- позы
const SH: [Pt, Pt] = [[-52, -116], [52, -116]];
const elbowOf = (s: Pt, h: Pt, side: number): Pt => {
  const mx = (s[0] + h[0]) / 2, my = (s[1] + h[1]) / 2, dx = h[0] - s[0], dy = h[1] - s[1];
  const len = Math.hypot(dx, dy) || 1, bend = Math.max(0, 120 - len) * 0.35 + 12;
  return [mx + (-dy / len) * bend * -side, my + (dx / len) * bend * -side];
};
export const arms = (lh: Pt, rh: Pt, base: Pose = stand()): Pose => ({
  ...base,
  armL: { elbow: elbowOf(SH[0], lh, -1), hand: lh },
  armR: { elbow: elbowOf(SH[1], rh, 1), hand: rh },
});
export const P = {
  stand: () => stand(),
  up: () => arms([-96, -300], [96, -300]),
  shrug: () => arms([-128, -168], [128, -168]),
  type: () => arms([-46, -36], [46, -36]),
  hug: () => arms([-22, -96], [24, -100]),
  pointR: () => arms([-70, -10], [150, -150]),
  hold: (rh: Pt) => arms([-70, -10], rh),
  hold2: (lh: Pt, rh: Pt) => arms(lh, rh),
};

// ---------------------------------------------------------------- герои
type Base = Omit<PersonProps, "body" | "bodyDark" | "id" | "pose"> & { id?: string; pose?: Pose };

export const Hair: React.FC = () => (
  <path d="M-82,-286 Q-96,-342 -44,-356 L-40,-394 L-10,-360 L16,-402 L34,-358 Q90,-352 84,-288 Q60,-318 28,-318 L12,-300 L-2,-322 Q-50,-322 -82,-286 Z"
    fill="#2A2233" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
);
const Headphones: React.FC = () => (
  <g stroke={INK} strokeWidth={6} strokeLinejoin="round">
    <path d="M-72,-150 Q0,-104 72,-150" fill="none" stroke="#3A3A48" strokeWidth={14} />
    <ellipse cx={-74} cy={-150} rx={20} ry={26} fill="#3A3A48" /><ellipse cx={74} cy={-150} rx={20} ry={26} fill="#3A3A48" />
    <ellipse cx={-74} cy={-150} rx={8} ry={12} fill="#F28A2E" stroke="none" /><ellipse cx={74} cy={-150} rx={8} ry={12} fill="#F28A2E" stroke="none" />
  </g>
);
// Герой: цвет одежды — color/colorDark, pj — пижама, hp — наушники, shades — тёмные очки.
export const Hero: React.FC<Base & { color?: string; colorDark?: string; pj?: boolean; hp?: boolean; shades?: boolean }> =
  ({ id = "hero", pose, color = "#2FA39A", colorDark = "#1F7A73", pj, hp = false, shades, children, ...p }) => (
  <Person id={id} pose={pose ?? stand()} body={pj ? "#8DB6F2" : color} bodyDark={pj ? "#5F86CF" : colorDark} {...p}>
    {pj && <g fill="#FFF3B0" stroke={INK} strokeWidth={3}>{[[-30, -90], [24, -60], [-10, -30], [36, -120]].map(([x, y], i) =>
      <path key={i} d={`M${x},${y - 10} l3,7 7,1 -5,5 1,7 -6,-3 -6,3 1,-7 -5,-5 7,-1 Z`} />)}</g>}
    {!pj && <g stroke={INK} strokeWidth={4} strokeLinecap="round"><line x1={-16} y1={-138} x2={-20} y2={-96} /><line x1={16} y1={-138} x2={20} y2={-96} /></g>}
    {hp && !pj && <Headphones />}
    <Hair />
    {shades && <Shades gaze={p.gaze ?? 0} />}
    {children}
  </Person>
);

export const Shades: React.FC<{ gaze?: number; lift?: number; color?: string }> = ({ gaze = 0, lift = 0, color = "#15131C" }) => {
  const dx = gaze * 22, y = HEAD.y - 8 + lift;
  return (
    <g>
      <path d={`M${-62 + dx},${y - 16} L${62 + dx},${y - 16}`} stroke={INK} strokeWidth={7} strokeLinecap="round" />
      {[-30, 30].map((ex) => (
        <g key={ex}>
          <path d={`M${ex - 28 + dx},${y - 16} L${ex + 28 + dx},${y - 16} Q${ex + 26 + dx},${y + 22} ${ex + dx},${y + 22} Q${ex - 26 + dx},${y + 22} ${ex - 28 + dx},${y - 16} Z`}
            fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d={`M${ex - 16 + dx},${y - 8} L${ex - 4 + dx},${y - 8}`} stroke="#fff" strokeOpacity={0.7} strokeWidth={4} strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
};

const BEAN = "M-58,-128 C-62,-160 62,-160 58,-128 L66,-14 C70,22 -70,22 -66,-14 Z";
// Человечек в костюме: ref_ — полосатая форма судьи, hat — головной убор, badgeText — надпись на бейдже.
export type SuitHat = "mail" | "phone" | "detective" | "wig" | "helmet" | "headset";
export const Suit: React.FC<Omit<Base, "hat"> & { hat?: SuitHat; ref_?: boolean; shades?: boolean; lift?: number; badgeText?: string }> =
  ({ id = "suit", pose, hat, ref_, shades = false, lift = 0, badgeText, children, ...p }) => {
    const g = p.gaze ?? 0;
    return (
      <Person id={id} pose={pose ?? stand()} body={ref_ ? "#F5F5F2" : "#2E3142"} bodyDark={ref_ ? "#D6D6DE" : "#171925"} {...p}>
        {ref_ ? (
          <g>
            <clipPath id={`${id}-tc`}><path d={BEAN} /></clipPath>
            <g clipPath={`url(#${id}-tc)`}>{[-60, -36, -12, 12, 36, 60].map((x) => <rect key={x} x={x - 6} y={-170} width={12} height={200} fill="#1E1A24" />)}</g>
            <path d={BEAN} fill="none" stroke={INK} strokeWidth={7} />
            <path d="M0,-140 Q-6,-110 4,-96" stroke="#9AA0AE" strokeWidth={4} fill="none" />
            <circle cx={6} cy={-92} r={9} fill="#E8C14E" stroke={INK} strokeWidth={4} />
          </g>
        ) : (
          <g strokeLinejoin="round">
            <path d="M-30,-148 L0,-90 L30,-148 Z" fill="#fff" stroke={INK} strokeWidth={5} />
            <path d="M0,-138 L-10,-118 L0,-64 L10,-118 Z" fill="#D2343F" stroke={INK} strokeWidth={4} />
            {badgeText && <g transform="translate(34,-104) rotate(-4)">
              <rect x={-24} y={-12} width={48} height={24} rx={4} fill="#F4F1E8" stroke={INK} strokeWidth={4} />
              <FitText x={0} y={5} text={badgeText} maxW={40} fs={11} fill="#1E1A24" />
            </g>}
          </g>
        )}
        {/* витой провод от уха */}
        {!ref_ && <path d={`M86,${HEAD.y + 14} q14,10 2,18 q-12,8 2,16 q14,8 0,16 q-12,8 -6,30 L50,-140`} fill="none" stroke="#C9CDD8" strokeWidth={4} />}
        {shades && <Shades gaze={g} lift={lift} />}
        {hat === "mail" && <g transform={`translate(0 ${HEAD.y - 108}) rotate(-6)`}><Envelope x={0} y={0} s={1.1} /></g>}
        {hat === "phone" && <g transform={`translate(0 ${HEAD.y - 96})`}><Handset x={0} y={0} s={1.1} rot={0} /></g>}
        {hat === "detective" && (
          <g stroke={INK} strokeWidth={6} strokeLinejoin="round">
            <path d={`M-96,${HEAD.y - 44} C-92,${HEAD.y - 130} 92,${HEAD.y - 130} 96,${HEAD.y - 44} C50,${HEAD.y - 60} -50,${HEAD.y - 60} -96,${HEAD.y - 44} Z`} fill="#A87A4C" />
            <path d={`M-96,${HEAD.y - 44} L-130,${HEAD.y - 30} L-90,${HEAD.y - 64} Z M96,${HEAD.y - 44} L130,${HEAD.y - 30} L90,${HEAD.y - 64} Z`} fill="#8C6239" />
            {[-40, 0, 40].map((x) => <line key={x} x1={x} y1={HEAD.y - 108} x2={x * 1.3} y2={HEAD.y - 54} stroke="#6E4B2A" strokeWidth={3} />)}
          </g>
        )}
        {hat === "wig" && (
          <g fill="#F7F4EC" stroke={INK} strokeWidth={5}>
            {[-80, -40, 0, 40, 80].map((x, i) => <circle key={x} cx={x} cy={HEAD.y - 66 - (i % 2) * 18 + Math.abs(x) * 0.3} r={34} />)}
            {[-1, 1].map((sd) => [0, 1, 2].map((k) => <circle key={`${sd}${k}`} cx={sd * 100} cy={HEAD.y - 20 + k * 44} r={24} />))}
          </g>
        )}
        {hat === "helmet" && (
          <g stroke={INK} strokeWidth={6} strokeLinejoin="round">
            <path d={`M-100,${HEAD.y - 20} C-104,${HEAD.y - 136} 104,${HEAD.y - 136} 100,${HEAD.y - 20} L80,${HEAD.y - 28} C40,${HEAD.y - 50} -40,${HEAD.y - 50} -80,${HEAD.y - 28} Z`} fill="#3D4A3A" />
            <rect x={-26} y={HEAD.y - 108} width={52} height={22} rx={5} fill="#E8C14E" />
          </g>
        )}
        {hat === "headset" && (
          <g stroke={INK} strokeWidth={6}>
            <path d={`M-96,${HEAD.y} C-100,${HEAD.y - 140} 100,${HEAD.y - 140} 96,${HEAD.y}`} fill="none" stroke="#3A3A48" strokeWidth={16} />
            <rect x={-118} y={HEAD.y - 34} width={34} height={64} rx={14} fill="#3A3A48" />
            <rect x={84} y={HEAD.y - 34} width={34} height={64} rx={14} fill="#3A3A48" />
          </g>
        )}
        {children}
      </Person>
    );
  };

// ---------------------------------------------------------------- реквизит
export const GlowStar: React.FC<{ x: number; y: number; r: number; rot?: number; eyes?: boolean; blink?: boolean; glow?: number }> =
  ({ x, y, r, rot = 0, eyes, blink, glow = 0 }) => (
    <g transform={`translate(${x},${y}) rotate(${rot})`}>
      {glow > 0 && <circle r={r * 2.4} fill="url(#bloomO)" opacity={glow} />}
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2, rr = r * (i % 2 ? 0.82 : 1);
        return <line key={i} x1={0} y1={0} x2={Math.cos(a) * rr} y2={Math.sin(a) * rr} stroke="#F2A93B" strokeWidth={r * 0.3} strokeLinecap="round" />;
      })}
      <circle r={r * 0.32} fill="#F2A93B" />
      {eyes && (blink
        ? <g stroke={INK} strokeWidth={r * 0.08} strokeLinecap="round"><line x1={-r * 0.3} y1={0} x2={-r * 0.1} y2={0} /><line x1={r * 0.1} y1={0} x2={r * 0.3} y2={0} /></g>
        : <g fill={INK}><ellipse cx={-r * 0.2} cy={0} rx={r * 0.07} ry={r * 0.1} /><ellipse cx={r * 0.2} cy={0} rx={r * 0.07} ry={r * 0.1} /></g>)}
    </g>
  );

export const Laptop: React.FC<{ x: number; y: number; s?: number; screen?: React.ReactNode; dark?: boolean }> = ({ x, y, s = 1, screen, dark }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} strokeLinejoin="round">
    <rect x={-160} y={-215} width={320} height={215} rx={16} fill="#3B3F52" stroke={INK} strokeWidth={7} />
    <rect x={-142} y={-198} width={284} height={180} rx={6} fill={dark ? "#1D2036" : "#FFF7EF"} />
    <svg x={-142} y={-198} width={284} height={180} viewBox="-142 -198 284 180">{screen ?? <GlowStar x={0} y={-108} r={46} />}</svg>
    <path d="M-182,0 L182,0 L206,30 Q206,38 196,38 L-196,38 Q-206,38 -206,30 Z" fill="#C9CDD8" stroke={INK} strokeWidth={7} />
    <rect x={-40} y={6} width={80} height={10} rx={5} fill="#9EA3B4" />
  </g>
);

export const Envelope: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} stroke={INK} strokeWidth={5} strokeLinejoin="round">
    <rect x={-50} y={-32} width={100} height={64} rx={6} fill="#FFFDF6" />
    <path d="M-50,-30 L0,8 L50,-30" fill="none" />
    <circle cx={0} cy={8} r={8} fill="#D2343F" />
  </g>
);
export const Handset: React.FC<{ x: number; y: number; s?: number; rot?: number; ring?: number }> = ({ x, y, s = 1, rot = 0, ring = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot + ring * Math.sin(ring * 99) * 12}) scale(${s})`} stroke={INK} strokeWidth={5} strokeLinejoin="round">
    <path d="M-62,-6 Q-62,-30 -40,-30 L40,-30 Q62,-30 62,-6 L62,4 L34,10 L30,-8 L-30,-8 L-34,10 L-62,4 Z" fill="#E8484F" />
    {ring > 0 && <g stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round"><path d="M-80,-40 q-10,14 0,28" /><path d="M80,-40 q10,14 0,28" /></g>}
  </g>
);
export const Cloud: React.FC<{ x: number; y: number; s?: number; c?: string; face?: boolean }> = ({ x, y, s = 1, c = "#FFFFFF", face }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <g fill={c} stroke={INK} strokeWidth={6}>{[[-60, 10, 40], [-20, -20, 50], [30, -14, 46], [66, 12, 34], [0, 18, 44]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} />)}</g>
    <g fill={c}>{[[-60, 10, 34], [-20, -20, 44], [30, -14, 40], [66, 12, 28], [0, 18, 38]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} />)}</g>
    {face && <g fill={INK}><ellipse cx={-14} cy={0} rx={6} ry={8} /><ellipse cx={16} cy={0} rx={6} ry={8} /><path d="M-8,18 Q2,26 12,18" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" /></g>}
  </g>
);
export const SkyClouds: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <g fill="#E9D3E6">{[[-60, 14, 38], [0, 18, 46], [62, 16, 36]].map(([cx, cy, r]) => <circle key={cx} cx={cx} cy={cy} r={r} />)}</g>
    <g fill="#FFF4DE">{[[-62, 0, 36], [-14, -22, 48], [40, -10, 42], [80, 6, 28], [10, 8, 40]].map(([cx, cy, r]) => <circle key={cx} cx={cx} cy={cy} r={r} />)}</g>
  </g>
);
// Текст в мире не должен вылезать за предмет: ширина строки оценивается по шрифту, кегль уменьшается под maxW,
// а если и так не влезает — строка поджимается textLength. Любая надпись на табличке/листке/экране — через FitText.
const CHAR_W: [RegExp, number][] = [[/Arial Black|Impact/i, 0.72], [/Montserrat/i, 0.74], [/Georgia|serif/i, 0.56], [/Courier/i, 0.6]];
export const textW = (text: string, fs: number, font = "Arial") => {
  const k = CHAR_W.find(([re]) => re.test(font))?.[1] ?? 0.58;
  return [...text].reduce((a, ch) => a + (ch === " " ? 0.3 : /[ШЩЖМЮЫФ]/i.test(ch) ? 1.2 : /[ilj.,:;!|1]/.test(ch) ? 0.4 : 1), 0) * fs * k;
};
export const FitText: React.FC<{ x: number; y: number; text: string; maxW: number; fs: number; font?: string; fill?: string;
  anchor?: "start" | "middle" | "end"; weight?: number; italic?: boolean; stroke?: string; sw?: number; minFs?: number }> =
  ({ x, y, text, maxW, fs, font = "Arial Black, Arial, Montserrat, sans-serif", fill = INK, anchor = "middle", weight = 900, italic, stroke = "none", sw, minFs = fs * 0.55 }) => {
    const size = Math.max(minFs, Math.min(fs, fs * maxW / textW(text, fs, font)));
    // оценка ширины неточна (курсив, кириллица), поэтому строка всегда приводится к оценённой ширине ≤ maxW
    const len = Math.min(maxW, textW(text, size, font));
    return (
      <text x={x} y={y} textAnchor={anchor} fontFamily={font} fontWeight={weight} fontStyle={italic ? "italic" : undefined} fontSize={size}
        fill={fill} stroke={stroke} strokeWidth={sw} textLength={len} lengthAdjust="spacingAndGlyphs">{text}</text>
    );
  };
export const Sign: React.FC<{ x: number; y: number; w: number; h: number; text: string; fs?: number; bg?: string; fg?: string; rot?: number; font?: string }> =
  ({ x, y, w, h, text, fs = 40, bg = "#FFF3C4", fg = INK, rot = 0, font = "Arial Black, Arial, Montserrat, sans-serif" }) => {
    const size = Math.min(fs, h * 0.62);
    return (
      <g transform={`translate(${x},${y}) rotate(${rot})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill={bg} stroke={INK} strokeWidth={6} />
        <FitText x={0} y={size * 0.36} text={text} maxW={w - 28} fs={size} font={font} fill={fg} />
      </g>
    );
  };
export const Desk: React.FC<{ x: number; y: number; w?: number; c?: string }> = ({ x, y, w = 620, c = "#C98A55" }) => (
  <g stroke={INK} strokeWidth={6} strokeLinejoin="round">
    <rect x={x - w / 2 + 30} y={y + 30} width={22} height={300} fill="#8C5A2E" />
    <rect x={x + w / 2 - 52} y={y + 30} width={22} height={300} fill="#8C5A2E" />
    <rect x={x - w / 2} y={y} width={w} height={40} rx={8} fill={c} />
    <line x1={x - w / 2 + 20} y1={y + 12} x2={x + w / 2 - 20} y2={y + 12} stroke="#fff" strokeOpacity={0.35} strokeWidth={5} />
  </g>
);
export const Stopwatch: React.FC<{ x: number; y: number; s?: number; text?: string; hand?: number }> = ({ x, y, s = 1, text, hand = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={6} strokeLinejoin="round">
    <rect x={-18} y={-128} width={36} height={26} rx={6} fill="#C9CDD8" />
    <rect x={-36} y={-146} width={72} height={22} rx={8} fill="#E8484F" />
    <circle r={108} fill="#F2F3F6" /><circle r={90} fill="#FFFFFF" />
    {Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; return <line key={i} x1={Math.sin(a) * 76} y1={-Math.cos(a) * 76} x2={Math.sin(a) * 86} y2={-Math.cos(a) * 86} strokeWidth={4} />; })}
    {text ? <text x={0} y={22} textAnchor="middle" fontFamily="Arial Black, Arial, Montserrat, sans-serif" fontWeight={900} fontSize={64} fill={INK} stroke="none">{text}</text>
      : <line x1={0} y1={0} x2={Math.sin(hand) * 70} y2={-Math.cos(hand) * 70} stroke="#E8484F" strokeWidth={6} strokeLinecap="round" />}
  </g>
);
export const Chair: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = "#4F6BD8" }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} stroke={INK} strokeWidth={6} strokeLinejoin="round">
    <rect x={-10} y={40} width={20} height={110} fill="#8E93A3" />
    <path d="M-80,150 L80,150 M0,150 L0,120" stroke={INK} strokeWidth={10} strokeLinecap="round" />
    <circle cx={-80} cy={156} r={10} fill={INK} /><circle cx={80} cy={156} r={10} fill={INK} />
    <rect x={-100} y={-200} width={200} height={190} rx={40} fill={c} />
    <rect x={-110} y={-6} width={220} height={52} rx={22} fill={c} />
  </g>
);
export const Plant: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {[[-60, -160, -30], [10, -200, 10], [70, -150, 40], [-20, -120, -60], [50, -110, 70]].map(([lx, ly, r], i) => (
      <ellipse key={i} cx={lx} cy={ly} rx={34} ry={80} transform={`rotate(${r} ${lx} ${ly})`} fill={i % 2 ? "#3FA35B" : "#56BA6C"} stroke={INK} strokeWidth={5} />
    ))}
    <path d="M-58,-60 L58,-60 L44,40 L-44,40 Z" fill="#D9774A" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-66} y={-74} width={132} height={22} rx={6} fill="#E58A5C" stroke={INK} strokeWidth={5} />
  </g>
);

// ---------------------------------------------------------------- фоны
export type Mode = "day" | "night" | "dusk" | "noir";
export const SKY: Record<Mode, [string, string]> = {
  day: ["#2B78F2", "#8CC4FF"], night: ["#141A4A", "#3A3F8F"], dusk: ["#6B3FA0", "#F59A7A"], noir: ["#1A1530", "#3B2C4E"],
};
export const Sky: React.FC<{ mode: Mode; x?: number; y?: number; w?: number; h?: number; stars?: boolean }> = ({ mode, x = -600, y = -600, w = 2280, h = 3100, stars }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={`url(#sky-${mode})`} />
    {(stars ?? mode === "night") && Array.from({ length: 70 }, (_, i) => (
      <circle key={i} cx={x + rnd(i) * w} cy={y + rnd(i + 99) * h * 0.6} r={1.5 + rnd(i + 7) * 3} fill="#FFF6D8" opacity={0.5 + rnd(i + 3) * 0.5} />
    ))}
  </g>
);
export const Window: React.FC<{ x: number; y: number; w: number; h: number; mode: Mode; clouds?: boolean; moon?: boolean; children?: React.ReactNode }> =
  ({ x, y, w, h, mode, clouds = mode === "day", moon = mode === "night", children }) => (
    <g>
      <svg x={x} y={y} width={w} height={h} viewBox={`0 0 ${w} ${h}`} overflow="hidden">
        <rect width={w} height={h} fill={`url(#sky-${mode})`} />
        {mode === "night" && Array.from({ length: 18 }, (_, i) => <circle key={i} cx={rnd(i) * w} cy={rnd(i + 5) * h * 0.7} r={2 + rnd(i) * 2} fill="#FFF6D8" />)}
        {moon && <circle cx={w * 0.7} cy={h * 0.28} r={Math.min(w, h) * 0.12} fill="#FFF1C2" />}
        {clouds && <><SkyClouds x={w * 0.3} y={h * 0.4} s={w / 380} /><SkyClouds x={w * 0.85} y={h * 0.22} s={w / 600} /></>}
        {children}
      </svg>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#F7F1E4" strokeWidth={20} />
      <rect x={x - 10} y={y - 10} width={w + 20} height={h + 20} fill="none" stroke={INK} strokeWidth={6} />
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#F7F1E4" strokeWidth={12} />
      <rect x={x - 22} y={y + h} width={w + 44} height={24} rx={6} fill="#F7F1E4" stroke={INK} strokeWidth={5} />
    </g>
  );
// комната: стена, плинтус, пол досками в перспективе
export const Room: React.FC<{ wall: [string, string]; floor?: [string, string]; floorY?: number; stripes?: boolean }> =
  ({ wall, floor = ["#D9A46C", "#C08850"], floorY = 1250, stripes = true }) => {
    const vx = 540, vy = 300, gid = `wall${wall[0].slice(1)}${wall[1].slice(1)}`;
    return (
      <g>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={wall[0]} /><stop offset="1" stopColor={wall[1]} /></linearGradient>
        <rect x={-700} y={-700} width={2480} height={floorY + 700} fill={`url(#${gid})`} />
        {stripes && Array.from({ length: 30 }, (_, i) => <rect key={i} x={-700 + i * 84} y={-700} width={28} height={floorY + 700} fill="#fff" opacity={0.06} />)}
        <rect x={-700} y={floorY} width={2480} height={1400} fill={floor[0]} />
        {Array.from({ length: 22 }, (_, i) => {
          const xb = -1400 + i * 180;
          return <line key={i} x1={vx + (xb - vx) * 0.05} y1={floorY} x2={xb} y2={floorY + 1400} stroke={floor[1]} strokeWidth={5} />;
        })}
        {[0.06, 0.16, 0.32, 0.58].map((k, i) => <line key={i} x1={-700} y1={floorY + 1400 * k} x2={1780} y2={floorY + 1400 * k} stroke={floor[1]} strokeWidth={3} opacity={0.6} />)}
        <rect x={-700} y={floorY - 26} width={2480} height={30} fill="#F3E9D4" stroke={INK} strokeWidth={5} />
        <rect x={-700} y={floorY} width={2480} height={140} fill="url(#floorShade)" />
      </g>
    );
  };
export const Shadow: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 0.36 }) => (
  <ellipse cx={x} cy={y} rx={110 * s} ry={22 * s} fill={SHADOW} opacity={o} filter="url(#soft)" />
);
export const Beam: React.FC<{ pts: string; o?: number }> = ({ pts, o = 0.6 }) => (
  <polygon points={pts} fill="url(#beam)" filter="url(#beamBlur)" opacity={o} style={{ mixBlendMode: "screen" }} />
);
export const Bloom: React.FC<{ x: number; y: number; r: number; o?: number; c?: "Y" | "O" | "R" | "B" }> = ({ x, y, r, o = 0.6, c = "Y" }) => (
  <circle cx={x} cy={y} r={r} fill={`url(#bloom${c})`} opacity={o} style={{ mixBlendMode: "screen" }} />
);

// ---------------------------------------------------------------- 2D-эффекты
export const SpeedLines: React.FC<{ x: number; y: number; t: number; n?: number; r0?: number; r1?: number; c?: string; o?: number }> =
  ({ x, y, t, n = 28, r0 = 380, r1 = 1300, c = "#FFFFFF", o = 0.8 }) => (
    <g opacity={o}>{Array.from({ length: n }, (_, i) => {
      const a = rnd(i) * Math.PI * 2, ph = (t * 3 + rnd(i + 40)) % 1, ra = r0 + (r1 - r0) * ph * 0.4, rb = ra + 200 + rnd(i + 9) * 300;
      return <line key={i} x1={x + Math.cos(a) * ra} y1={y + Math.sin(a) * ra} x2={x + Math.cos(a) * rb} y2={y + Math.sin(a) * rb}
        stroke={c} strokeWidth={6 + rnd(i + 2) * 10} strokeLinecap="round" />;
    })}</g>
  );
export const Confetti: React.FC<{ x: number; y: number; t: number; n?: number; spread?: number }> = ({ x, y, t, n = 40, spread = 700 }) => {
  if (t < 0) return null;
  const cols = ["#F2C55C", "#E8484F", "#4FB3A9", "#7B61FF", "#F28A2E", "#56BA6C"];
  return <g>{Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (rnd(i) - 0.5) * 2.4, v = 900 + rnd(i + 1) * 900;
    const px = x + Math.cos(a) * v * t * (spread / 700), py = y + Math.sin(a) * v * t + 1500 * t * t;
    return <rect key={i} x={px} y={py} width={18} height={28} rx={3} fill={cols[i % 6]} stroke={INK} strokeWidth={3}
      transform={`rotate(${(rnd(i + 5) * 360 + t * 720 * (rnd(i + 8) - 0.5)) | 0} ${px} ${py})`} opacity={L(t, [1.4, 2], [1, 0])} />;
  })}</g>;
};
export const Sparkle: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = "#FFE27A" }) => (
  <path transform={`translate(${x},${y}) scale(${s})`} d="M0,-40 L10,-10 L40,0 L10,10 L0,40 L-10,10 L-40,0 L-10,-10 Z" fill={c} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
);
export const Ring: React.FC<{ x: number; y: number; t: number; r?: number; c?: string }> = ({ x, y, t, r = 300, c = "#FFFFFF" }) =>
  t < 0 || t > 0.4 ? null : <circle cx={x} cy={y} r={r * (0.3 + t * 2.4)} fill="none" stroke={c} strokeWidth={30 * (1 - t / 0.4)} opacity={1 - t / 0.4} />;
export const Burst: React.FC<{ x: number; y: number; r: number; n?: number; c1?: string; c2?: string; rot?: number }> = ({ x, y, r, n = 18, c1 = "#F2C55C", c2 = "#F28A2E", rot = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>{Array.from({ length: n }, (_, i) => {
    const a0 = i / n * Math.PI * 2, a1 = (i + 0.5) / n * Math.PI * 2;
    return <path key={i} d={`M0,0 L${Math.cos(a0) * r},${Math.sin(a0) * r} L${Math.cos(a1) * r},${Math.sin(a1) * r} Z`} fill={i % 2 ? c1 : c2} />;
  })}</g>
);
export const Rain: React.FC<{ t: number; x: number; y: number; w: number; h: number; n?: number; o?: number }> = ({ t, x, y, w, h, n = 60, o = 0.6 }) => (
  <g stroke="#BFE3FF" strokeWidth={4} strokeLinecap="round" opacity={o}>{Array.from({ length: n }, (_, i) => {
    const px = x + rnd(i) * w, py = y + ((rnd(i + 3) * h + t * 1400) % h);
    return <line key={i} x1={px} y1={py} x2={px - 8} y2={py + 34} />;
  })}</g>
);
export const FightCloud: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => {
  const j = (k: number) => Math.sin(t * 40 + k) * 10;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {[[0, 140, -40], [1, -150, 30], [2, 40, 150], [3, -60, -150]].map(([k, px, py]) => (
        <g key={k} transform={`translate(${px + j(k) * 2},${py + j(k + 2)}) rotate(${k * 90 + j(k) * 3})`}>
          <line x1={0} y1={0} x2={70} y2={0} stroke={INK} strokeWidth={9} strokeLinecap="round" />
          <circle cx={80} cy={0} r={22} fill={INK} />
        </g>
      ))}
      <g fill="#F4EEDF" stroke={INK} strokeWidth={6}>{Array.from({ length: 9 }, (_, i) => {
        const a = i / 9 * Math.PI * 2;
        return <circle key={i} cx={Math.cos(a) * 95 + j(i)} cy={Math.sin(a) * 75 + j(i + 1)} r={70 + 10 * Math.sin(t * 20 + i)} />;
      })}</g>
      <g fill="#F4EEDF">{Array.from({ length: 9 }, (_, i) => {
        const a = i / 9 * Math.PI * 2;
        return <circle key={i} cx={Math.cos(a) * 95 + j(i)} cy={Math.sin(a) * 75 + j(i + 1)} r={64 + 10 * Math.sin(t * 20 + i)} />;
      })}<ellipse cx={0} cy={0} rx={140} ry={110} /></g>
      <Sparkle x={-40 + j(4)} y={-30} s={0.9} /><Sparkle x={60} y={30 + j(5)} s={0.7} c="#FFFFFF" />
      <text x={-70} y={20} fontFamily="Arial Black, Arial, Montserrat, sans-serif" fontWeight={900} fontSize={54} fill="#E8484F" stroke={INK} strokeWidth={3} transform={`rotate(${j(6)})`}>БАЦ!</text>
    </g>
  );
};
export const Notes: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g>{[0, 1, 2].map((k) => {
    const ph = (t * 0.9 + k / 3) % 1;
    return <text key={k} x={x + k * 30 + Math.sin(ph * 6) * 20} y={y - ph * 220} fontSize={64} fontFamily="Arial" fill={INK} opacity={1 - ph}>♪</text>;
  })}</g>
);
export const Zzz: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => (
  <g>{[0, 1, 2].map((k) => {
    const ph = (t * 0.7 + k / 3) % 1;
    return <text key={k} x={x + ph * 90 * s} y={y - ph * 200 * s} fontSize={(40 + ph * 40) * s} fontFamily="Arial Black, Arial, Montserrat, sans-serif" fontWeight={900}
      fill="#FFFFFF" stroke={INK} strokeWidth={4} opacity={1 - ph}>Z</text>;
  })}</g>
);
export const Tear: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  const ph = (t * 0.8) % 1;
  return <path transform={`translate(${x},${y + ph * 90})`} d="M0,-18 q-12,21 0,27 q12,-6 0,-27 Z" fill="#7FD3FF" stroke={INK} strokeWidth={4} opacity={1 - ph * 0.6} />;
};
export const Sweat: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <path transform={`translate(${x},${y}) scale(${s})`} d="M0,-18 q-14,24 0,30 q14,-6 0,-30 Z" fill="#7FD3FF" stroke={INK} strokeWidth={4} />
);
export const Puffs: React.FC<{ x: number; y: number; t: number; n?: number; c?: string; spread?: number; life?: number; size?: number }> =
  ({ x, y, t, n = 10, c = "#E8E4EE", spread = 1, life = 1.6, size = 1 }) =>
  t < 0 ? null : (
    <g>{Array.from({ length: n }, (_, i) => {
      const a = rnd(i) * Math.PI * 2, v = (200 + rnd(i + 2) * 300) * spread, k = 1 - Math.exp(-t * 3);
      return <circle key={i} cx={x + Math.cos(a) * v * k} cy={y + Math.sin(a) * v * k * 0.6} r={(40 + rnd(i + 4) * 50) * (0.6 + k) * size}
        fill={c} stroke={INK} strokeWidth={5} opacity={L(t, [life / 2, life], [1, 0])} />;
    })}</g>
  );

// ---------------------------------------------------------------- общие defs
export const Defs: React.FC = () => (
  <defs>
    {(Object.keys(SKY) as Mode[]).map((m) => (
      <linearGradient key={m} id={`sky-${m}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={SKY[m][0]} /><stop offset="1" stopColor={SKY[m][1]} /></linearGradient>
    ))}
    <linearGradient id="floorShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5B4F9E" stopOpacity={0.25} /><stop offset="1" stopColor="#5B4F9E" stopOpacity={0} /></linearGradient>
    <linearGradient id="beam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF4D6" stopOpacity={0.9} /><stop offset="1" stopColor="#FFF4D6" stopOpacity={0} /></linearGradient>
    <radialGradient id="bloomY"><stop offset="0" stopColor="#FFF0B0" /><stop offset="0.35" stopColor="#FFE08A" stopOpacity={0.45} /><stop offset="1" stopColor="#FFE08A" stopOpacity={0} /></radialGradient>
    <radialGradient id="bloomO"><stop offset="0" stopColor="#FFC08A" /><stop offset="0.4" stopColor="#F28A4E" stopOpacity={0.4} /><stop offset="1" stopColor="#F28A4E" stopOpacity={0} /></radialGradient>
    <radialGradient id="bloomR"><stop offset="0" stopColor="#FF6A6A" /><stop offset="0.4" stopColor="#E8282F" stopOpacity={0.45} /><stop offset="1" stopColor="#E8282F" stopOpacity={0} /></radialGradient>
    <radialGradient id="bloomB"><stop offset="0" stopColor="#BFE3FF" /><stop offset="0.4" stopColor="#7DB8FF" stopOpacity={0.4} /><stop offset="1" stopColor="#7DB8FF" stopOpacity={0} /></radialGradient>
    <radialGradient id="vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.55" stopColor="#1C1638" stopOpacity={0} /><stop offset="1" stopColor="#1C1638" stopOpacity={0.42} /></radialGradient>
    <radialGradient id="warm" cx="0.85" cy="0.15" r="0.8"><stop offset="0" stopColor="#FFD9A0" stopOpacity={0.22} /><stop offset="1" stopColor="#FFD9A0" stopOpacity={0} /></radialGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" /></filter>
    <filter id="beamBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14" /></filter>
    <filter id="dof" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3.2" /></filter>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={1} /><feColorMatrix type="saturate" values="0" /></filter>
  </defs>
);
