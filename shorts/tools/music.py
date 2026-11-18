"""Soft background music for the shorts, synthesized from scratch (no samples, no outside recordings).

python music.py <out_dir>   ->  lofi.mp3, bright.mp3, steppe.mp3, dreamy.mp3  (each ~75 s, loudness-normalized)
"""
import os, subprocess, sys
import numpy as np
from scipy.signal import lfilter, fftconvolve, butter, sosfilt

SR = 44100
LEN = 76.0
rng = np.random.default_rng(11)


def f(m): return 440.0 * 2 ** ((m - 69) / 12)


def T(d): return np.arange(int(d * SR)) / SR


def lp(x, hz, order=2): return sosfilt(butter(order, hz, "low", fs=SR, output="sos"), x)


def hp(x, hz, order=2): return sosfilt(butter(order, hz, "high", fs=SR, output="sos"), x)


def place(buf, x, t0, gain=1.0):
    i = int(t0 * SR)
    if i >= len(buf): return
    n = min(len(x), len(buf) - i)
    buf[i:i + n] += x[:n] * gain


# ---------------------------------------------------------------- instruments
def rhodes(m, d=1.6, vel=1.0):
    t = T(d); fr = f(m)
    e = np.minimum(t / 0.004, 1) * np.exp(-t * 2.2)
    x = np.sin(2 * np.pi * fr * t) + 0.25 * np.sin(2 * np.pi * 2 * fr * t) * np.exp(-t * 4) + 0.08 * np.sin(2 * np.pi * 3 * fr * t) * np.exp(-t * 6)
    x *= 1 + 0.12 * np.sin(2 * np.pi * 4.5 * t)  # tremolo
    return lp(x * e * vel, 3500)


def pad(m, d, vel=1.0):
    t = T(d); fr = f(m)
    x = sum(np.sin(2 * np.pi * fr * k * (1 + det) * t) / k for k in (1, 2, 3) for det in (-0.004, 0, 0.004))
    e = np.minimum(t / 0.8, 1) * np.minimum((d - t) / 0.8, 1)
    return lp(x * e * vel, 1800) * 0.25


def pluck(m, d=1.2, bright=0.5, decay=0.996):
    """Karplus-Strong string (ukulele / dombra)."""
    fr = f(m); N = max(2, int(SR / fr))
    n = int(d * SR)
    exc = np.zeros(n); burst = rng.uniform(-1, 1, N)
    burst = lp(burst, 1500 + 6000 * bright, 1)
    exc[:N] = burst
    a = np.zeros(N + 2); a[0] = 1; a[N] = -decay * 0.5; a[N + 1] = -decay * 0.5
    y = lfilter([1.0], a, exc)
    return lp(y, 5000) * np.minimum(np.linspace(d, 0, n) / 0.05, 1)


def marimba(m, d=0.8, vel=1.0):
    t = T(d); fr = f(m)
    x = np.sin(2 * np.pi * fr * t) * np.exp(-t * 6) + 0.3 * np.sin(2 * np.pi * 3.93 * fr * t) * np.exp(-t * 18)
    return x * np.minimum(t / 0.002, 1) * vel


def bell(m, d=2.5, vel=1.0):
    t = T(d); fr = f(m)
    x = np.sin(2 * np.pi * fr * t + 1.5 * np.sin(2 * np.pi * fr * 3.5 * t) * np.exp(-t * 3))
    return x * np.exp(-t * 1.6) * np.minimum(t / 0.003, 1) * vel


def kick(vel=1.0):
    t = T(0.45); ph = 2 * np.pi * np.cumsum(48 + 80 * np.exp(-t * 30)) / SR
    return np.sin(ph) * np.exp(-t * 9) * vel


def snare(vel=1.0, brush=True):
    t = T(0.3); n = rng.normal(size=len(t))
    n = hp(lp(n, 6000 if brush else 9000), 1200)
    return n * np.exp(-t * (18 if brush else 25)) * vel * 0.6


def hat(vel=1.0):
    t = T(0.08); n = hp(rng.normal(size=len(t)), 7000)
    return n * np.exp(-t * 60) * vel * 0.35


def shaker(vel=1.0):
    t = T(0.12); n = hp(rng.normal(size=len(t)), 5000)
    n = lp(hp(rng.normal(size=len(t)), 3500), 8000)
    return n * np.sin(np.pi * np.minimum(t / 0.12, 1)) * vel * 0.1


def reverb(x, sec=1.8, mix=0.25):
    t = T(sec); ir = rng.normal(size=len(t)) * np.exp(-t * 4.5 / sec)
    ir = lp(ir, 5000); ir /= np.sqrt(np.sum(ir ** 2))
    wet = fftconvolve(x, ir)[:len(x)]
    return x * (1 - mix) + wet * mix * 1.6


def chord_notes(root, kind):
    iv = {"maj7": [0, 4, 7, 11], "m7": [0, 3, 7, 10], "7": [0, 4, 7, 10], "maj": [0, 4, 7], "m": [0, 3, 7], "sus": [0, 5, 7], "add9": [0, 4, 7, 14]}[kind]
    return [root + i for i in iv]


# ---------------------------------------------------------------- tracks
def lofi():
    bpm = 78; b = 60 / bpm; L = np.zeros(int(LEN * SR)); D = np.zeros_like(L)
    prog = [(60, "maj7"), (57, "m7"), (62, "m7"), (55, "7")]  # Cmaj7 Am7 Dm7 G7
    bar = 4 * b; t = 0.0; k = 0
    while t < LEN:
        root, kind = prog[k % 4]; notes = chord_notes(root, kind)
        for j, n in enumerate(notes):  # soft strum
            place(L, rhodes(n, 2.8, 0.45), t + j * 0.02)
        place(L, rhodes(notes[1] + 12, 1.2, 0.25), t + 2.5 * b)
        place(L, rhodes(root - 12, 3.5, 0.55), t)  # bass
        mel = [notes[-1] + 12, notes[2] + 12, notes[1] + 12, notes[2] + 12]
        if k % 2 == 1:
            for j, n in enumerate(mel):
                place(L, bell(n, 1.6, 0.12), t + j * b + 0.5 * b)
        for beat in range(4):
            bt = t + beat * b
            if beat in (0, 2): place(D, kick(0.7), bt + (0.02 if beat == 2 else 0))
            if beat in (1, 3): place(D, snare(0.45), bt + 0.015)
            for h in (0, 0.5):
                place(D, lp(hat(0.35 if h == 0 else 0.2), 9000), bt + h * b + (0.03 if h else 0))
        t += bar; k += 1
    vinyl = lp(hp(rng.normal(size=len(L)), 1500), 5000) * 0.0015
    return reverb(lp(L, 4200), 2.0, 0.3) + lp(D, 6000) * 0.8 + vinyl


def bright():
    bpm = 104; b = 60 / bpm; L = np.zeros(int(LEN * SR)); D = np.zeros_like(L)
    prog = [(65, "maj"), (60, "maj"), (62, "m"), (58, "maj")]  # F C Dm Bb
    bar = 4 * b; t = 0.0; k = 0
    melody = [0, 2, 4, 7, 4, 2, 0, -1]
    while t < LEN:
        root, kind = prog[k % 4]; notes = chord_notes(root, kind)
        for beat in range(4):  # ukulele strums, down-up
            for s, off in ((0, 0.0), (1, 0.5)):
                if beat == 0 and s == 1: continue
                for j, n in enumerate(notes + [notes[0] + 12]):
                    place(L, pluck(n, 0.9, 0.6), t + (beat + off) * b + j * 0.012 * (1 if s == 0 else -1) + 0.05, 0.28 if s == 0 else 0.18)
        place(L, pluck(root - 12, 1.6, 0.3, 0.998), t, 0.5)
        place(L, pluck(root - 5, 1.2, 0.3, 0.998), t + 2 * b, 0.4)
        if k % 4 >= 2:
            scale = [notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[0] + 24]
            for j in range(8):
                place(L, marimba(scale[(melody[j] % 4)], 0.7, 0.35), t + j * b * 0.5)
        for beat in range(4):
            place(D, shaker(0.7), t + beat * b); place(D, shaker(0.45), t + (beat + 0.5) * b)
            if beat in (0, 2): place(D, kick(0.45), t + beat * b)
        t += bar; k += 1
    return lp(reverb(L, 1.4, 0.22), 6500) + lp(D, 7000) * 0.6


def steppe():
    bpm = 92; b = 60 / bpm; L = np.zeros(int(LEN * SR)); P = np.zeros_like(L); D = np.zeros_like(L)
    # D minor pentatonic dombra figure: (beat offset, note) per bar, two strings strummed
    pat = [(0, 62), (0.5, 69), (0.75, 69), (1, 62), (1.5, 69), (2, 65), (2.5, 69), (2.75, 67), (3, 62), (3.5, 69)]
    roots = [50, 50, 46, 48]  # D D Bb C
    bar = 4 * b; t = 0.0; k = 0
    tune = [74, 72, 69, 67, 69, 72, 74, 77]
    while t < LEN:
        r = roots[k % 4]
        for off, n in pat:
            place(L, pluck(n, 0.8, 0.45, 0.995), t + off * b, 0.32)
            place(L, pluck(n - 5 if n == 69 else n + 7, 0.8, 0.45, 0.995), t + off * b + 0.008, 0.22)
        place(P, pad(r, bar + 0.8, 0.9), t)
        place(P, pad(r + 7, bar + 0.8, 0.6), t)
        if 2 <= k % 8 < 6:
            for j, n in enumerate(tune[(k % 2) * 4:(k % 2) * 4 + 4]):
                place(L, pluck(n, 1.4, 0.3, 0.998), t + j * b, 0.3)
        place(D, kick(0.5), t); place(D, kick(0.35), t + 2.5 * b)
        t += bar; k += 1
    return reverb(L + P * 0.8, 2.4, 0.3) + D * 0.6


def dreamy():
    bpm = 70; b = 60 / bpm; L = np.zeros(int(LEN * SR)); P = np.zeros_like(L)
    prog = [(64, "add9"), (59, "m"), (61, "m"), (57, "maj7")]  # E B C#m A — airy
    bar = 4 * b; t = 0.0; k = 0
    while t < LEN:
        root, kind = prog[k % 4]; notes = chord_notes(root, kind)
        for n in notes: place(P, pad(n - 12, bar + 1.2, 0.7), t)
        arp = notes + [notes[1] + 12, notes[2] + 12]
        for j in range(8):
            place(L, bell(arp[j % len(arp)] + 12, 2.0, 0.16), t + j * b * 0.5)
        place(L, rhodes(root - 12, 4.0, 0.4), t)
        t += bar; k += 1
    return reverb(L + P, 3.0, 0.4)


def accordion(m, d, vel=1.0):
    t = T(d); fr = f(m) * (1 + 0.003 * np.sin(2 * np.pi * 5.5 * t))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    x = sum(np.sign(np.sin(ph * k + 0.3 * k)) / k ** 1.6 for k in (1, 2, 3)) + 0.4 * np.sin(ph * 1.003)
    e = np.minimum(t / 0.05, 1) * np.minimum((d - t) / 0.08, 1)
    return lp(x * e * vel, 2200) * 0.22


def pirate():
    """Sea-shanty feel: 6/8, D minor, guitar strums, accordion tune, low drum."""
    bpm = 120; e8 = 60 / bpm / 2; L = np.zeros(int(LEN * SR)); D = np.zeros_like(L)
    prog = [(62, "m"), (62, "m"), (60, "maj"), (62, "m"), (65, "maj"), (60, "maj"), (57, "maj"), (62, "m")]
    tune = [[74, 74, 72, 74, 77, 74], [72, 69, 69, 72, 74, 72], [72, 72, 70, 72, 76, 72], [74, 72, 69, 69, 0, 0],
            [77, 77, 76, 77, 81, 77], [76, 72, 72, 76, 77, 76], [73, 73, 76, 73, 69, 73], [74, 74, 74, 74, 0, 0]]
    bar = 6 * e8; t = 0.0; k = 0
    while t < LEN:
        root, kind = prog[k % 8]; notes = chord_notes(root, kind)
        for s8, gain in ((0, 0.3), (2, 0.18), (3, 0.26), (5, 0.18)):
            for j, n in enumerate(notes + [notes[0] + 12]):
                place(L, pluck(n - 12, 0.7, 0.5), t + s8 * e8 + j * 0.01, gain)
        place(L, pluck(root - 24, 1.4, 0.3, 0.998), t, 0.55); place(L, pluck(root - 17, 1.0, 0.3, 0.998), t + 3 * e8, 0.4)
        if k >= 4:
            for j, n in enumerate(tune[k % 8]):
                if n: place(L, accordion(n, e8 * 1.05, 0.9), t + j * e8)
        place(D, kick(0.6), t); place(D, kick(0.4), t + 3 * e8)
        for j in range(6): place(D, shaker(0.5 if j % 3 == 0 else 0.3), t + j * e8)
        t += bar; k += 1
    return lp(reverb(L, 1.6, 0.25), 6000) + lp(D, 7000) * 0.6


def master(x, name, out):
    x = hp(x, 35)
    fade = np.ones_like(x); n = int(2.5 * SR); fade[-n:] = np.linspace(1, 0, n); fade[:int(0.3 * SR)] = np.linspace(0, 1, int(0.3 * SR))
    x = x * fade
    x = np.tanh(x / (np.abs(x).max() + 1e-9) * 1.2) * 0.8
    st = np.stack([x, np.roll(x, int(0.012 * SR)) * 0.96], 1)  # light stereo width
    raw = os.path.join(out, name + ".raw.wav")
    import wave
    with wave.open(raw, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes())
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-18:TP=-2:LRA=7",
                    "-ar", "44100", "-b:a", "192k", os.path.join(out, name + ".mp3")], check=True)
    os.remove(raw)
    print(name, "ok")


if __name__ == "__main__":
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    which = sys.argv[2:] or ["lofi", "bright", "steppe", "dreamy", "pirate"]
    for nm in which:
        master(globals()[nm](), nm, out)
