"""Синтез библиотеки звуков плагина: эффекты и лёгкая музыка из чистой математики, без чужих записей.

python make_audio.py <папка>     # <папка>/sfx/*.wav и <папка>/music/*.mp3

Готовый набор уже лежит в assets/. Скрипт нужен, чтобы изменить или дополнить звуки: новый эффект — новая функция.
"""
import os, subprocess, sys, wave
import numpy as np

sys.stdout.reconfigure(encoding="utf-8")
SR = 44100
rng = np.random.default_rng(7)


def T(d): return np.arange(int(d * SR)) / SR


def env(d, a=0.005, r=None):
    t = T(d); r = r or d * 0.8
    return np.minimum(t / a, 1) * np.exp(-t / (r / 5))


def lowpass(x, k):
    n = max(1, int(k))
    return np.convolve(x, np.ones(n) / n, mode="same")


def save(path, x, peak=0.9):
    x = x / (np.abs(x).max() + 1e-9) * peak
    pcm = (x * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


def whoosh():
    d = 0.5; t = T(d); n = rng.normal(size=len(t))
    k = np.sin(np.pi * t / d) ** 2
    return lowpass(n, 6) * k + 0.5 * (n - lowpass(n, 20)) * k ** 3


def pop():
    d = 0.12; t = T(d)
    return np.sin(2 * np.pi * (900 * t - 2600 * t ** 2)) * env(d, 0.001, 0.09)


def click():
    d = 0.04
    return rng.normal(size=len(T(d))) * env(d, 0.0005, 0.02) + np.sin(2 * np.pi * 2400 * T(d)) * env(d, 0.0005, 0.02)


def hit():
    d = 0.5; t = T(d)
    return np.sin(2 * np.pi * (140 * t - 90 * t ** 2)) * env(d, 0.002, 0.4) + 0.5 * lowpass(rng.normal(size=len(t)), 5) * env(d, 0.001, 0.08)


def ding():
    d = 1.4; t = T(d)
    return sum(g * np.sin(2 * np.pi * f * t) * np.exp(-t * dc)
               for f, g, dc in [(1320, 1, 4), (2640, 0.4, 6), (3960, 0.2, 9), (5280, 0.08, 12)])


def boing():
    d = 0.6; t = T(d)
    f = 220 + 160 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 3) + 240 * t
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, 0.002, 0.55)


def paper():
    d = 0.3; t = T(d); n = rng.normal(size=len(t))
    return (n - lowpass(n, 8)) * (0.5 + 0.5 * np.sin(2 * np.pi * 34 * t)) * np.sin(np.pi * t / d)


def steps():
    out = np.zeros(int(1.0 * SR))
    for i in range(3):
        d = 0.09; s = np.sin(2 * np.pi * 110 * T(d)) * env(d, 0.001, 0.07) + 0.3 * lowpass(rng.normal(size=len(T(d))), 4) * env(d, 0.001, 0.03)
        p = int(i * 0.32 * SR); out[p:p + len(s)] += s
    return out


def sad():
    out = []
    for f in (392, 370, 349, 311):
        d = 0.32 if f != 311 else 0.9; t = T(d)
        fr = f + (3 * np.sin(2 * np.pi * 5.5 * t) if f == 311 else 0)
        ph = 2 * np.pi * np.cumsum(fr * np.ones_like(t)) / SR
        out.append(sum(np.sin(ph * h) / h for h in range(1, 6)) * np.minimum(t / 0.02, 1) * np.minimum((d - t) / 0.06, 1))
    return np.concatenate(out)


def fanfare():
    out = []
    for f, d in ((523, .12), (659, .12), (784, .12), (1047, .45)):
        t = T(d); ph = 2 * np.pi * f * t
        out.append(sum(np.sin(ph * h) / h ** 1.2 for h in range(1, 7)) * np.minimum(t / 0.008, 1) * np.minimum((d - t) / 0.04, 1))
    return np.concatenate(out)


# ---------------------------------------------------------------- музыка
def pluck(f, d, bright=0.5):
    """Щипок Карплуса — Стронга: похоже на укулеле или пиццикато."""
    n = len(T(d)); p = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, p); buf = lowpass(buf, 1 + int(4 * (1 - bright)))
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.996 * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return out


def mixin(track, s, t, g=1.0):
    p = int(t * SR); e = min(len(track), p + len(s))
    track[p:e] += s[:e - p] * g


def music(bars=16, bpm=126):
    beat = 60 / bpm; track = np.zeros(int(bars * 4 * beat * SR) + SR)
    nt = lambda m: 440 * 2 ** ((m - 69) / 12)
    prog = [(60, 64, 67), (57, 60, 64), (65, 69, 72), (67, 71, 74)]
    melody = [76, 79, 81, 79, 76, 74, 72, 74, 72, 76, 77, 76, 74, 71, 74, 79]
    for bar in range(bars):
        ch = prog[bar % 4]; t0 = bar * 4 * beat
        mixin(track, pluck(nt(ch[0] - 24), 0.5, 0.25), t0, 0.9)
        mixin(track, pluck(nt(ch[2] - 24), 0.5, 0.25), t0 + 2 * beat, 0.8)
        for b, off in enumerate((1, 1.5, 3, 3.5)):
            for j, m in enumerate(ch):
                mixin(track, pluck(nt(m), 0.32, 0.6), t0 + off * beat + j * 0.008, 0.28)
        if bar % 8 >= 4:  # мелодия вступает во второй половине фразы
            for i in range(4):
                m = melody[(bar * 4 + i) % len(melody)]
                mixin(track, pluck(nt(m), 0.42, 0.8), t0 + i * beat, 0.32)
        for i in range(8):  # лёгкий шейкер
            d = 0.04; s = rng.normal(size=len(T(d))) * env(d, 0.001, 0.025)
            mixin(track, s - lowpass(s, 4), t0 + i * beat / 2, 0.05 if i % 2 else 0.09)
    return track[:int(bars * 4 * beat * SR)]


if __name__ == "__main__":
    out = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
    os.makedirs(os.path.join(out, "sfx"), exist_ok=True)
    os.makedirs(os.path.join(out, "music"), exist_ok=True)
    for fn in (whoosh, pop, click, hit, ding, boing, paper, steps, sad, fanfare):
        save(os.path.join(out, "sfx", fn.__name__ + ".wav"), fn())
    tmp = os.path.join(out, "music", "_m.wav")
    save(tmp, music(), peak=0.8)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", tmp, "-ac", "1", "-c:a", "libmp3lame", "-b:a", "96k",
                    os.path.join(out, "music", "playful.mp3")], check=True)
    os.remove(tmp)
    print("Готово:", out)
