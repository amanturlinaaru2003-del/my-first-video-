import React from "react";
import { Composition } from "remotion";
import { framesOf, makeFilm } from "./film";
import { SHOTS } from "./shots";
import { STARTS, TOTAL, WS } from "./times";
import { DemoLift, DEMO_FRAMES } from "./demo_lift";
import { Dentist } from "./scene_dentist";

const Film = makeFilm(SHOTS, STARTS, WS, TOTAL);

export const Root: React.FC = () => (
  <>
    <Composition id="Film" component={Film} fps={30} width={1080} height={1920} durationInFrames={framesOf(TOTAL)} />
    <Composition id="DemoLift" component={DemoLift} fps={30} width={1080} height={1920} durationInFrames={DEMO_FRAMES} />
    <Composition id="Dentist" component={Dentist} fps={30} width={1080} height={1920} durationInFrames={210} />
  </>
);
