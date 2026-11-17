import { loadFont } from "@remotion/fonts";
import { Easing, interpolate, spring, staticFile } from "remotion";

// Цвета и типографика сняты с образцов (reference/style-guide.md, раздел 2)
export const C = {
  white: "#FFFFFF",
  black: "#000000",
  ink: "#0A0A0A",
  gray: "#8A8A8A",
  accent: "#2BD84A",
  accentGlow: "rgba(43,216,74,0.55)",
  purple: "#6B2BD8",
};

export const FONT = "SFPro, Helvetica Neue, Arial, sans-serif";

// Размер кадра: 1920×1080 по умолчанию, plan.width/plan.height для вертикали (Main вызывает setFrame)
export let FW = 1920;
export let FH = 1080;
export const setFrame = (w: number, h: number) => { FW = w; FH = h; };
export const TRACK = "-0.045em"; // плотный трекинг, как в образце

// Шрифт: по умолчанию SF Pro Display из assets/fonts; plan.fonts = {"700": "Inter.ttf", ...} — другой файл
// (например, свободный Inter, если SF Pro нет: у Inter есть все буквы казахского алфавита).
const SF = { "400": "SFProDisplay-Regular.otf", "500": "SFProDisplay-Medium.otf", "600": "SFProDisplay-Semibold.otf", "700": "SFProDisplay-Bold.otf" };
let fontsLoaded = false;
export const loadFonts = (files?: Record<string, string>) => {
  if (fontsLoaded) return;
  fontsLoaded = true;
  for (const [w, f] of Object.entries(files ?? SF)) loadFont({ family: "SFPro", url: staticFile(`fonts/${f}`), weight: w });
};

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeInOut = (t: number) => Easing.inOut(Easing.cubic)(clamp(t));

// Кривые в духе интерфейсов Apple: быстрый старт и долгое мягкое торможение, без рывков на концах
const APPLE_OUT = Easing.bezier(0.32, 0.72, 0, 1);
const APPLE_IN = Easing.bezier(0.4, 0, 0.6, 0.2);
export const appleOut = (t: number) => APPLE_OUT(clamp(t));
export const appleIn = (t: number) => APPLE_IN(clamp(t));

// Пружина почти без перелёта (как в iOS) — для объектов, эмодзи, виджетов
export const pop = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 150, mass: 0.8 } });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ramp = (f: number, a: number, b: number, from: number, to: number) =>
  interpolate(f, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// Детерминированный «рандом» для разлёта слов и т. п.
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е").replace(/[^a-zа-яәғқңөұүһі0-9]/g, "");
