// Человечки «Мультика»: круглая белая голова, лицо из штрихов, туловище-фасолина цвета одежды,
// руки и ноги одной линией, толстый тёмный контур. Начало координат — таз (середина низа туловища).
import React from "react";

export const INK = "#1E1A24";
export const SHADOW = "#5B4F9E";

export type Pt = [number, number];
export type Face = "smile" | "calm" | "look" | "worried" | "terror" | "smug" | "blink"
  | "shout" | "sad" | "happy" | "shock";
export const HEAD = { y: -238, r: 94 };

export type Pose = {
  armL: { elbow: Pt; hand: Pt };
  armR: { elbow: Pt; hand: Pt };
  legL: { knee: Pt; foot: Pt };
  legR: { knee: Pt; foot: Pt };
};

export type PersonProps = {
  x: number; y: number; s?: number; tilt?: number;
  body: string; bodyDark: string;
  face: Face; gaze?: number;           // сдвиг лица: −1 влево … 1 вправо
  pose: Pose;
  hat?: "cap" | "doctor";
  scarf?: string;
  mask?: boolean;
  mouthOpen?: number;                   // для дрожи зубов 0..1
  sweat?: number;                       // 0..1 — капля на лбу
  id: string;
  children?: React.ReactNode;           // предмет в руке (рисуется поверх руки), координаты в системе человечка
};

const HEAD_Y = -238, HEAD_R = 94;

const limb = (a: Pt, b: Pt, c: Pt, w = 9) => (
  <path d={`M${a[0]},${a[1]} Q${b[0]},${b[1]} ${c[0]},${c[1]}`} fill="none" stroke={INK}
    strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
);

export const stand = (): Pose => ({
  armL: { elbow: [-74, -70], hand: [-70, -10] },
  armR: { elbow: [74, -70], hand: [70, -10] },
  legL: { knee: [-28, 85], foot: [-32, 172] },
  legR: { knee: [28, 85], foot: [32, 172] },
});

// шаг: фаза в радианах, dir — куда идёт (1 вправо)
export const walk = (ph: number, dir = 1): Pose => {
  const a = Math.sin(ph), b = Math.sin(ph + Math.PI);
  const lift = (v: number) => Math.max(0, Math.cos(v)) * 26;
  return {
    armL: { elbow: [-72 - 6 * b * dir, -70], hand: [-62 + 34 * b * dir, -14 - 6 * Math.abs(b)] },
    armR: { elbow: [72 - 6 * a * dir, -70], hand: [62 + 34 * a * dir, -14 - 6 * Math.abs(a)] },
    legL: { knee: [-24 + 26 * a * dir, 82 - lift(ph) * 0.6], foot: [-26 + 46 * a * dir, 172 - lift(ph)] },
    legR: { knee: [24 + 26 * b * dir, 82 - lift(ph + Math.PI) * 0.6], foot: [26 + 46 * b * dir, 172 - lift(ph + Math.PI)] },
  };
};

export const sit = (knock = 0): Pose => ({
  armL: { elbow: [-88, -72], hand: [-106, -20] },
  armR: { elbow: [88, -72], hand: [106, -20] },
  legL: { knee: [-66 + knock, 40], foot: [-42, 156] },
  legR: { knee: [66 - knock, 40], foot: [42, 156] },
});

export const mix = (p: Pose, q: Pose, t: number): Pose => {
  const m = (a: Pt, b: Pt): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  return {
    armL: { elbow: m(p.armL.elbow, q.armL.elbow), hand: m(p.armL.hand, q.armL.hand) },
    armR: { elbow: m(p.armR.elbow, q.armR.elbow), hand: m(p.armR.hand, q.armR.hand) },
    legL: { knee: m(p.legL.knee, q.legL.knee), foot: m(p.legL.foot, q.legL.foot) },
    legR: { knee: m(p.legR.knee, q.legR.knee), foot: m(p.legR.foot, q.legR.foot) },
  };
};

const Eyes: React.FC<{ face: Face; dx: number; mask?: boolean }> = ({ face, dx, mask }) => {
  const y = HEAD_Y - 6;
  if (face === "blink") return (
    <g stroke={INK} strokeWidth={7} strokeLinecap="round">
      <line x1={-40 + dx} y1={y} x2={-18 + dx} y2={y} /><line x1={18 + dx} y1={y} x2={40 + dx} y2={y} />
    </g>
  );
  if (face === "happy") return (
    <g stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round">
      <path d={`M${-44 + dx},${y + 4} Q${-29 + dx},${y - 18} ${-14 + dx},${y + 4}`} />
      <path d={`M${14 + dx},${y + 4} Q${29 + dx},${y - 18} ${44 + dx},${y + 4}`} />
    </g>
  );
  if (face === "terror" || face === "worried" || face === "shock" || face === "sad") {
    const big = face === "terror" || face === "shock";
    const r = big ? 25 : 19, pr = big ? 5 : 7;
    return (
      <g>
        {[-29, 29].map((ex) => (
          <g key={ex}>
            <circle cx={ex + dx} cy={y} r={r} fill="#fff" stroke={INK} strokeWidth={6} />
            <circle cx={ex + dx + dx * 0.12} cy={y + 1} r={pr} fill={INK} />
          </g>
        ))}
        {/* брови домиком */}
        <path d={`M${-52 + dx},${y - r - 18} Q${-34 + dx},${y - r - 30} ${-12 + dx},${y - r - 14}`} stroke={INK}
          strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d={`M${12 + dx},${y - r - 14} Q${34 + dx},${y - r - 30} ${52 + dx},${y - r - 18}`} stroke={INK}
          strokeWidth={8} fill="none" strokeLinecap="round" />
      </g>
    );
  }
  if (face === "smug") return (
    <g>
      {[-30, 30].map((ex) => (
        <g key={ex}>
          <ellipse cx={ex + dx} cy={y + 4} rx={8} ry={8} fill={INK} />
          <line x1={ex - 16 + dx} y1={y - 3} x2={ex + 16 + dx} y2={y - 3} stroke={INK} strokeWidth={6} strokeLinecap="round" />
        </g>
      ))}
      <path d={`M${-50 + dx},${y - 34} L${-12 + dx},${y - 22}`} stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <path d={`M${12 + dx},${y - 22} L${50 + dx},${y - 34}`} stroke={INK} strokeWidth={9} strokeLinecap="round" />
    </g>
  );
  // smile / calm / look — точки и короткие брови
  return (
    <g>
      <ellipse cx={-28 + dx} cy={y} rx={8} ry={10} fill={INK} />
      <ellipse cx={28 + dx} cy={y} rx={8} ry={10} fill={INK} />
      <path d={`M${-46 + dx},${y - 30} Q${-30 + dx},${y - 38} ${-14 + dx},${y - 30}`} stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d={`M${14 + dx},${y - 30} Q${30 + dx},${y - 38} ${46 + dx},${y - 30}`} stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
      {mask ? null : null}
    </g>
  );
};

const Mouth: React.FC<{ face: Face; dx: number; open: number }> = ({ face, dx, open }) => {
  const y = HEAD_Y + 42;
  if (face === "terror") {
    const h = 26 + 10 * open;
    return (
      <g>
        <rect x={-34 + dx} y={y - h / 2} width={68} height={h} rx={10} fill="#fff" stroke={INK} strokeWidth={6} />
        <line x1={-34 + dx} y1={y} x2={34 + dx} y2={y} stroke={INK} strokeWidth={4} />
        {[-17, 0, 17].map((tx) => <line key={tx} x1={tx + dx} y1={y - h / 2} x2={tx + dx} y2={y + h / 2} stroke={INK} strokeWidth={4} />)}
      </g>
    );
  }
  if (face === "shout" || face === "shock") {
    const rx = face === "shout" ? 30 : 16, ry = (face === "shout" ? 26 : 20) + 8 * open;
    return (
      <g>
        <ellipse cx={dx} cy={y + 4} rx={rx} ry={ry} fill="#5A1E2E" stroke={INK} strokeWidth={6} />
        {face === "shout" && <ellipse cx={dx + 4} cy={y + 4 + ry * 0.5} rx={rx * 0.6} ry={ry * 0.35} fill="#F07A86" />}
      </g>
    );
  }
  if (face === "happy") return <path d={`M${-30 + dx},${y - 8} Q${dx},${y + 30} ${30 + dx},${y - 8} Z`} fill="#5A1E2E" stroke={INK} strokeWidth={6} strokeLinejoin="round" />;
  if (face === "sad") return <path d={`M${-18 + dx},${y + 8} Q${dx},${y - 10} ${18 + dx},${y + 8}`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />;
  if (face === "worried") return <path d={`M${-16 + dx},${y + 4} Q${dx},${y - 6} ${16 + dx},${y + 4}`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />;
  if (face === "smile" || face === "blink") return <path d={`M${-22 + dx},${y - 6} Q${2 + dx},${y + 16} ${24 + dx},${y - 8}`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />;
  return <path d={`M${-12 + dx},${y} L${12 + dx},${y - 2}`} stroke={INK} strokeWidth={7} strokeLinecap="round" />;
};

export const Person: React.FC<PersonProps> = (p) => {
  const s = p.s ?? 1, dx = (p.gaze ?? 0) * 22, P = p.pose;
  const g = `${p.id}`;
  return (
    <g transform={`translate(${p.x},${p.y}) scale(${s}) rotate(${p.tilt ?? 0})`}>
      <defs>
        <radialGradient id={`${g}-head`} cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#FFFFFF" /><stop offset="0.62" stopColor="#F7F4F1" /><stop offset="1" stopColor="#D9D2E3" />
        </radialGradient>
        <linearGradient id={`${g}-body`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.body} /><stop offset="1" stopColor={p.bodyDark} />
        </linearGradient>
      </defs>
      {/* ноги и руки за туловищем */}
      {limb([-26, 0], P.legL.knee, P.legL.foot)}
      {limb([26, 0], P.legR.knee, P.legR.foot)}
      {/* туловище-фасолина */}
      <path d="M-58,-128 C-62,-160 62,-160 58,-128 L66,-14 C70,22 -70,22 -66,-14 Z" fill={`url(#${g}-body)`}
        stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M34,-120 C44,-90 46,-50 44,-20" stroke="#fff" strokeOpacity={0.35} strokeWidth={8} fill="none" strokeLinecap="round" />
      {p.hat === "doctor" && (
        <g stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round">
          <path d="M-20,-140 L0,-70 L20,-140" />
          <rect x={18} y={-80} width={30} height={34} rx={4} fill="#E8ECEF" />
          <line x1={28} y1={-92} x2={28} y2={-70} stroke="#2E7BE0" strokeWidth={6} />
        </g>
      )}
      {limb([-52, -116], P.armL.elbow, P.armL.hand)}
      {limb([52, -116], P.armR.elbow, P.armR.hand)}
      <circle cx={P.armL.hand[0]} cy={P.armL.hand[1]} r={11} fill={INK} />
      <circle cx={P.armR.hand[0]} cy={P.armR.hand[1]} r={11} fill={INK} />
      {p.scarf && (
        <path d="M-50,-150 C-20,-128 20,-128 50,-150 L48,-128 C20,-108 -20,-108 -48,-128 Z" fill={p.scarf} stroke={INK}
          strokeWidth={6} strokeLinejoin="round" />
      )}
      {/* голова */}
      <circle cx={0} cy={HEAD_Y} r={HEAD_R} fill={`url(#${g}-head)`} stroke={INK} strokeWidth={7.5} />
      <path d={`M${58},${HEAD_Y - 62} A${HEAD_R - 10},${HEAD_R - 10} 0 0 1 ${78},${HEAD_Y + 30}`} stroke="#F6D98A"
        strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.9} />
      {p.face !== "terror" && !p.mask && (
        <g fill="#FFB3B3" opacity={0.35}><ellipse cx={-48 + dx} cy={HEAD_Y + 26} rx={16} ry={9} /><ellipse cx={48 + dx} cy={HEAD_Y + 26} rx={16} ry={9} /></g>
      )}
      <Eyes face={p.face} dx={dx} mask={p.mask} />
      {p.mask ? (
        <g>
          <path d={`M${-70 + dx},${HEAD_Y + 6} Q${dx},${HEAD_Y - 6} ${70 + dx},${HEAD_Y + 6} L${62 + dx},${HEAD_Y + 52} Q${dx},${HEAD_Y + 84} ${-62 + dx},${HEAD_Y + 52} Z`}
            fill="#A8DDF2" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d={`M${-50 + dx},${HEAD_Y + 26} Q${dx},${HEAD_Y + 18} ${50 + dx},${HEAD_Y + 26} M${-48 + dx},${HEAD_Y + 44} Q${dx},${HEAD_Y + 38} ${48 + dx},${HEAD_Y + 44}`}
            stroke="#6FB4D2" strokeWidth={4} fill="none" />
        </g>
      ) : <Mouth face={p.face} dx={dx} open={p.mouthOpen ?? 0} />}
      {(p.sweat ?? 0) > 0 && (
        <path d={`M${66},${HEAD_Y - 58} q-14,24 0,30 q14,-6 0,-30 Z`} fill="#7FD3FF" stroke={INK} strokeWidth={4}
          opacity={p.sweat} transform={`translate(0 ${-(1 - (p.sweat ?? 0)) * 10})`} />
      )}
      {p.hat === "cap" && (
        <g stroke={INK} strokeWidth={6.5} strokeLinejoin="round">
          <path d={`M-88,${HEAD_Y - 30} C-92,${HEAD_Y - 112} 70,${HEAD_Y - 122} 92,${HEAD_Y - 52} C60,${HEAD_Y - 64} -40,${HEAD_Y - 62} -88,${HEAD_Y - 30} Z`}
            fill="#D9BE8E" />
          <path d={`M40,${HEAD_Y - 58} C80,${HEAD_Y - 66} 118,${HEAD_Y - 56} 128,${HEAD_Y - 40} C100,${HEAD_Y - 34} 70,${HEAD_Y - 40} 40,${HEAD_Y - 44} Z`}
            fill="#B8996A" />
          <path d={`M-60,${HEAD_Y - 78} C-20,${HEAD_Y - 100} 30,${HEAD_Y - 100} 60,${HEAD_Y - 80}`} fill="none" stroke="#B8996A" strokeWidth={4} />
        </g>
      )}
      {p.hat === "doctor" && (
        <g stroke={INK} strokeWidth={6.5} strokeLinejoin="round">
          <path d={`M-84,${HEAD_Y - 36} C-84,${HEAD_Y - 120} 84,${HEAD_Y - 120} 84,${HEAD_Y - 36} C40,${HEAD_Y - 50} -40,${HEAD_Y - 50} -84,${HEAD_Y - 36} Z`}
            fill="#4FB3A9" />
          <line x1={-60} y1={HEAD_Y - 52} x2={60} y2={HEAD_Y - 52} stroke="#3A8E86" strokeWidth={4} />
          {/* лобный рефлектор */}
          <circle cx={-6 + dx * 0.5} cy={HEAD_Y - 58} r={27} fill="#C9CFD8" />
          <circle cx={-6 + dx * 0.5} cy={HEAD_Y - 58} r={9} fill="#2C2840" />
          <path d={`M${-22 + dx * 0.5},${HEAD_Y - 70} q8,-8 18,-8`} stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      )}
      {p.children}
    </g>
  );
};

// мягкая сине-фиолетовая тень на полу
export const FloorShadow: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 0.38 }) => (
  <ellipse cx={x} cy={y} rx={95 * s} ry={20 * s} fill={SHADOW} opacity={o} filter="url(#soft)" />
);
