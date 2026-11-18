// Плеер фильма: сцены идут по таймингу голоса, между ними растворение 4 кадра, поверх общий грейд.
// Сцена получает t — секунды от своего начала (во время растворения t < 0), d — длину, w(i) — время слова i от начала сцены.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Defs, ShotC } from "./kit";

export type Shot = { C: ShotC; tint?: (t: number, w: (i: number) => number) => string; bg?: string };
export const XF = 0.13;
export const framesOf = (total: number) => Math.ceil(total * 30);

export const makeFilm = (shots: Shot[], starts: number[], ws: number[], total: number): React.FC => {
  const Layer: React.FC<{ k: number; time: number; op: number }> = ({ k, time, op }) => {
    const s = shots[Math.min(k, shots.length - 1)], t0 = starts[k], d = (starts[k + 1] ?? total) - t0, t = time - t0;
    const w = (i: number) => ws[i] - t0;
    const C = s.C;
    return (
      <AbsoluteFill style={{ opacity: op, filter: s.tint ? s.tint(t, w) : undefined, background: s.bg ?? "#1C1638" }}>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <Defs />
          <C t={t} d={d} w={w} />
        </svg>
      </AbsoluteFill>
    );
  };
  return () => {
    const time = useCurrentFrame() / 30;
    let k = 0;
    while (k + 1 < starts.length && starts[k + 1] <= time) k++;
    const nxt = k + 1 < starts.length && time >= starts[k + 1] - XF ? k + 1 : -1;
    return (
      <AbsoluteFill style={{ background: "#1C1638" }}>
        <Layer k={k} time={time} op={1} />
        {nxt > 0 && <Layer k={nxt} time={time} op={interpolate(time, [starts[nxt] - XF, starts[nxt]], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />}
        <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <Defs />
          <rect width={1080} height={1920} fill="url(#warm)" style={{ mixBlendMode: "screen" }} />
          <rect width={1080} height={1920} fill="url(#vig)" />
          <rect width={1080} height={1920} filter="url(#grain)" opacity={0.05} style={{ mixBlendMode: "multiply" }} />
        </svg>
      </AbsoluteFill>
    );
  };
};
