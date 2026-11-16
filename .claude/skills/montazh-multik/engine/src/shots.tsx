// Сцены ролика: по одной на фразу, в том же порядке, что "scenes" в plan.json.
// Образцы: demo_lift.tsx (целый короткий фильм) и scene_dentist.tsx (подробная комната). Набор — kit.tsx и people.tsx.
import React from "react";
import { Cam, Hero, Shadow, ShotC, Sign, Sky, SkyClouds, P } from "./kit";
import { Shot } from "./film";

const S01: ShotC = ({ t, d }) => (
  <Cam t={t} d={d} a={[1.0, 540, 960]} b={[1.12, 540, 930]}>
    <Sky mode="day" />
    <SkyClouds x={260} y={300} s={1.5} /><SkyClouds x={860} y={180} s={1.1} />
    <rect x={-600} y={1300} width={2280} height={1200} fill="#7CC46A" />
    <Shadow x={540} y={1480} s={1.4} />
    <Hero x={540} y={1300} s={1.4} face="smile" pose={P.shrug()} />
    <Sign x={540} y={560} w={620} h={120} text="НОВЫЙ МУЛЬТИК" fs={56} />
  </Cam>
);

export const SHOTS: Shot[] = [{ C: S01 }];
