# Music + sound effects, synthesised from code (no third-party tracks).
# Writes assets/audio/music.wav, assets/audio/sfx_*.wav and assets/audio/sfx.json (clip list for tools/build.mjs).
import json, os, wave, numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, 'assets', 'audio'); SR = 48000
N = json.load(open(os.path.join(ROOT, 'assets', 'narration.json'), encoding='utf-8'))
TOTAL = N['total']; G = {int(g['id'][1:]): (g['start'], g['end']) for g in N['groups']}
g = lambda i: G[i][0]; ge = lambda i: G[i][1]
rng = np.random.default_rng(7)
def save(name, x, stereo=False):
    x = np.asarray(x, dtype=np.float64); peak = np.max(np.abs(x)) or 1; x = x / peak * 0.89
    d = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(os.path.join(A, name), 'wb') as w:
        w.setnchannels(2 if stereo else 1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(d.T.flatten().tobytes() if stereo else d.tobytes())
def t_(d): return np.arange(int(d * SR)) / SR
def lp(x, fc):  # one-pole low-pass, fc may be an array
    a = np.exp(-2 * np.pi * np.asarray(fc) / SR) * np.ones(len(x)); y = np.zeros_like(x); s = 0.0
    for i in range(len(x)): s = (1 - a[i]) * x[i] + a[i] * s; y[i] = s
    return y
def hp(x, fc): return x - lp(x, fc)
def env(t, a, d): return np.minimum(t / max(a, 1e-4), 1) * np.exp(-np.maximum(t - a, 0) / d)
def noise(n): return rng.standard_normal(n)
# ---------------------------------------------------------------- SFX library
T = t_(0.5); heart = (np.sin(2 * np.pi * (48 + 30 * np.exp(-T * 30)) * T) * env(T, 0.004, 0.09)); T2 = t_(0.5)
heart = heart + 0.7 * np.concatenate([np.zeros(int(0.17 * SR)), (np.sin(2 * np.pi * (44 + 24 * np.exp(-T2 * 30)) * T2) * env(T2, 0.004, 0.08))])[:len(heart)]
save('sfx_heart.wav', heart)
T = t_(2.2); flat = np.sin(2 * np.pi * 988 * T) * np.minimum(T / 0.01, 1) * np.minimum((2.2 - T) / 0.3, 1); save('sfx_flat.wav', flat * 0.6)
T = t_(1.0); wn = noise(len(T)); sweep = 300 + 5000 * np.sin(np.pi * T / 1.0) ** 2
wh = lp(hp(wn, 200), sweep) * np.sin(np.pi * np.minimum(T / 1.0, 1)) ** 2; save('sfx_whoosh.wav', wh)
T = t_(3.5); boom = np.sin(2 * np.pi * (32 + 90 * np.exp(-T * 9)) * T) * env(T, 0.003, 0.9) + 0.35 * lp(noise(len(T)), 1800) * env(T, 0.002, 0.35) + 0.15 * hp(noise(len(T)), 4000) * env(T, 0.01, 1.2)
save('sfx_boom.wav', boom)
T = t_(3.0); sh = sum(np.sin(2 * np.pi * f * T + k) * env(T, 0.02 + k * 0.05, 1.4) for k, f in enumerate([1318.5, 1760, 2217.5, 2637, 3520])) * 0.3; save('sfx_shimmer.wav', sh)
T = t_(0.35); zp = hp(noise(len(T)), 2500) * (np.abs(np.sin(2 * np.pi * 37 * T)) ** 8) * env(T, 0.002, 0.12) + 0.3 * np.sign(np.sin(2 * np.pi * 220 * T)) * env(T, 0.002, 0.05); save('sfx_zap.wav', zp)
T = t_(0.12); tk = hp(noise(len(T)), 3000) * env(T, 0.0005, 0.012) + 0.5 * np.sin(2 * np.pi * 2400 * T) * env(T, 0.0005, 0.01); save('sfx_tick.wav', tk)
T = t_(9.5); hum = (np.sin(2 * np.pi * 60 * T) + 0.5 * np.sin(2 * np.pi * 120 * T) + 0.25 * np.sin(2 * np.pi * 180 * T)) * 0.4 + 0.2 * lp(noise(len(T)), 400)
for k in range(28):
    s = int(rng.uniform(0, 9.2) * SR); b = t_(0.06); f = rng.uniform(600, 1400); hum[s:s + len(b)] += 0.25 * np.sin(2 * np.pi * f * (1 + 3 * b) * b) * env(b, 0.002, 0.02)
hum *= np.minimum(T / 0.8, 1) * np.minimum((9.5 - T) / 0.8, 1); save('sfx_hum.wav', hum)
T = t_(2.0); sp = sum(np.sin(2 * np.pi * rng.uniform(2000, 5000) * T) * env(np.maximum(T - k * 0.07, 0), 0.002, 0.25) * (T > k * 0.07) for k in range(14)) * 0.2; save('sfx_sparkle.wav', sp)
T = t_(3.0); wind = lp(noise(len(T)), 400 + 2600 * (T / 3.0) ** 2) * np.sin(np.pi * T / 3.0) ** 1.5 + 0.2 * np.sin(2 * np.pi * (200 + 400 * T / 3) * T) * np.sin(np.pi * T / 3) ** 2; save('sfx_wind.wav', wind)
T = t_(0.25); cl = np.sin(2 * np.pi * (900 + 400 * np.exp(-T * 40)) * T) * env(T, 0.001, 0.04) + 0.4 * hp(noise(len(T)), 1500) * env(T, 0.001, 0.01); save('sfx_click.wav', cl)
T = t_(2.2); ding = (np.sin(2 * np.pi * 880 * T) + 0.5 * np.sin(2 * np.pi * 1760 * T) * np.exp(-T * 3) + 0.25 * np.sin(2 * np.pi * 2637 * T) * np.exp(-T * 5)) * env(T, 0.003, 0.8); save('sfx_ding.wav', ding)
T = t_(0.3); pop = np.sin(2 * np.pi * (220 + 600 * np.exp(-T * 30)) * T) * env(T, 0.002, 0.07) + 0.2 * hp(noise(len(T)), 3000) * env(T, 0.001, 0.02); save('sfx_pop.wav', pop)
T = t_(1.8); rise = lp(noise(len(T)), 200 + 6000 * (T / 1.8) ** 3) * (T / 1.8) ** 2; save('sfx_rise.wav', rise)
DUR = {'heart': 0.5, 'flat': 2.2, 'whoosh': 1.0, 'boom': 3.5, 'shimmer': 3.0, 'zap': 0.35, 'tick': 0.12, 'hum': 9.5, 'sparkle': 2.0, 'wind': 3.0, 'click': 0.25, 'ding': 2.2, 'pop': 0.3, 'rise': 1.8}
clips = []
def add(kind, t, v):
    if t < 0 or t >= TOTAL: return
    clips.append({'id': f'sfx-{kind}-{len(clips)}', 'file': f'sfx_{kind}.wav', 't': round(t, 3), 'd': round(min(DUR[kind], TOTAL - t), 3), 'v': v})
b = [0, 3.797, 25.669, 42.466, 75.372, 90.803, 105.251, 129.776, 152.317, 166]
# heartbeats: c1 until the stop, c2 calm, CPR in c7
for n in range(3):
    t = (n + 0.05) * 60 / 78 - 0.02
    if t < 1.05: add('heart', t, 0.9)
add('flat', 1.25, 0.28); add('boom', 1.05, 0.35)
for k in range(int((b[2] - b[1]) * 72 / 60)):
    t = b[1] + (k + 0.05) * 60 / 72
    if g(13) - 0.2 < t < b[2]: add('heart', t, 0.5)
t = g(85)
while t < b[7] - 0.3: add('heart', t, 0.75); t += 60 / 110
# whooshes on every big camera flight (chapter changes + burst shots)
for t in [b[1], g(7), g(11), g(17), g(19), g(23), g(25), g(33), g(36), g(39), g(44), g(47), g(53), g(63), g(67), g(77), g(85), g(91), g(93), g(95), g(99)] + b[2:9]:
    add('whoosh', t - 0.55, 0.45)
add('flat', g(25) + 1.0, 0.32)
# gamma climax
add('rise', g(31) - 1.75, 0.6); add('boom', g(31) + 0.05, 1.0); add('shimmer', g(31) + 0.2, 0.5); add('shimmer', g(33), 0.4)
for k in range(8): add('zap', g(9) + 0.15 + k * 0.38, 0.22)
for k in range(5): add('zap', g(33) + 0.1 + k * 0.5, 0.18)
# hologram / number reveals
for t in [g(4) - 0.3, g(6) - 0.4, g(7), g(17), g(37) - 0.2, g(40) - 0.2, g(44) - 0.1, g(47) - 0.1, g(70) - 0.1, g(77) - 0.1, g(81) - 0.1, g(97) - 0.1]: add('pop', t, 0.4)
for t in [g(36), g(44), g(48) + 0.25, g(48) + 0.5, g(98)]: add('ding', t, 0.3)
# death wave: neurons switching off one by one
for k in range(18): add('click', g(63) + k * 0.2, round(0.32 * (1 - k / 22), 3))
# 4-6 minutes timer ticks
t = g(74)
while t < ge(76): add('tick', t, 0.35); t += 0.25
add('hum', g(77) - 0.3, 0.3); add('sparkle', g(81), 0.4); add('wind', g(91) - 0.4, 0.55); add('sparkle', g(92), 0.35)
add('rise', g(109) - 1.75, 0.5); add('boom', g(109) + 0.05, 0.9); add('shimmer', g(109) + 0.15, 0.35)
json.dump(clips, open(os.path.join(A, 'sfx.json'), 'w'), indent=0)
print('sfx clips', len(clips))

# ---------------------------------------------------------------- music: dark cinematic score with a build to the gamma surge and a hush on it
n = int(TOTAL * SR); t = np.arange(n) / SR; mus = np.zeros((2, n))
def K(keys):  # piecewise-linear automation
    xs, ys = zip(*keys); return np.interp(t, xs, ys)
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
# chords (midi roots + intervals) per chapter
CH = [(0, [38, 45, 50, 53]), (b[1], [38, 45, 50, 53, 57]), (g(11), [34, 41, 46, 50]), (b[2], [38, 45, 48, 53]), (b[3], [36, 43, 48, 52]),
      (g(32), [41, 48, 53, 57, 60]), (b[4], [34, 41, 46, 50, 53]), (g(55), [39, 46, 51, 55]), (b[5], [38, 45, 50, 53]), (b[6], [36, 43, 48, 51]),
      (g(85), [41, 48, 53, 57]), (b[7], [43, 50, 55, 58, 62]), (g(95), [39, 46, 51, 55, 58]), (b[8], [38, 45, 50, 53, 57]), (g(109), [41, 48, 53, 57, 60, 65]), (TOTAL, [])]
pad = np.zeros(n)
for (s0, notes), (s1, _) in zip(CH[:-1], CH[1:]):
    i0, i1 = int(s0 * SR), int(min(s1 + 0.6, TOTAL) * SR); tt = np.arange(i1 - i0) / SR
    seg = np.zeros(len(tt))
    for m in notes:
        f = mtof(m)
        for det in (-0.12, 0.0, 0.11):
            ff = f * 2 ** (det / 12)
            seg += sum(np.sin(2 * np.pi * ff * h * tt + h) / h ** 1.6 for h in range(1, 6)) / 3
    fade = np.minimum(tt / 0.6, 1) * np.minimum((len(tt) / SR - tt) / 0.6, 1)
    pad[i0:i1] += seg * fade / len(notes)
pad_amt = K([(0, 0.0), (1.2, 0.55), (b[1], 0.7), (b[2], 0.75), (40, 0.45), (b[3], 0.5), (g(31) - 0.1, 0.9), (g(31) + 0.02, 0.0), (g(31) + 1.4, 0.0), (g(32) + 0.5, 0.85), (b[4], 0.8), (b[5], 0.75), (b[6], 0.6), (g(85), 0.6), (b[7] - 0.5, 0.95), (b[8], 0.8), (g(109) - 0.1, 1.0), (g(109) + 0.02, 0.0), (g(109) + 1.2, 0.0), (g(109) + 2.0, 0.7), (TOTAL - 2.5, 0.45), (TOTAL, 0)])
cut = K([(0, 500), (b[2], 1400), (40, 600), (g(31) - 0.2, 4200), (g(32), 2600), (b[4], 1800), (b[5], 900), (b[6], 900), (g(85), 1800), (b[7], 3200), (b[8], 2200), (g(109), 4200), (TOTAL, 700)])
pad = lp(pad, cut) * pad_amt
# pulse: kick + sub bass on 8ths at 100 bpm, intensity automated
BPM = 100; beat = 60 / BPM
pulse_amt = K([(0, 0), (b[1], 0), (b[1] + 0.3, 0.75), (b[2], 0.85), (b[2] + 2, 0.5), (40.5, 0.0), (b[3], 0.0), (g(29), 0.6), (g(31) - 0.1, 1.0), (g(31) + 0.02, 0.0), (g(32) + 0.8, 0.0), (g(33), 0.8), (b[4], 0.5), (b[5] - 1, 0.35), (b[5], 0.7), (b[6] - 0.5, 0.4), (b[6], 0.2), (g(85), 0.8), (b[7], 0.6), (g(91), 0.0), (g(93), 0.0), (g(95), 0.7), (b[8], 0.7), (g(109) - 0.1, 1.0), (g(109) + 0.02, 0.0), (TOTAL, 0)])
kick = (lambda T: np.sin(2 * np.pi * (45 + 80 * np.exp(-T * 28)) * T) * env(T, 0.002, 0.18))(t_(0.6))
hat = (lambda T: hp(noise(len(T)), 6000) * env(T, 0.001, 0.03))(t_(0.1))
drum = np.zeros(n); k = 0; tt0 = 0.0
while tt0 < TOTAL:
    i = int(tt0 * SR); a = pulse_amt[min(i, n - 1)]
    if a > 0.01:
        if k % 2 == 0: e = min(n, i + len(kick)); drum[i:e] += kick[:e - i] * a
        e = min(n, i + len(hat)); drum[i:e] += hat[:e - i] * a * (0.25 if k % 2 else 0.12)
    k += 1; tt0 += beat / 2
# gamma: bell arpeggio sparkles while the brain is surging
bells = np.zeros(n); arp = [72, 76, 79, 84, 79, 76]
for j, s0 in enumerate(np.arange(g(32), b[4] - 0.3, beat / 2)):
    T = t_(1.2); f = mtof(arp[j % len(arp)] + (5 if s0 > g(44) else 0)); i = int(s0 * SR); e = min(n, i + len(T))
    bells[i:e] += (np.sin(2 * np.pi * f * T) + 0.3 * np.sin(2 * np.pi * 2 * f * T)) * env(T, 0.003, 0.35)[:e - i] * 0.25
# memories (c5): soft piano-like plucks
for j, s0 in enumerate(np.arange(b[4] + 0.3, b[5] - 0.5, beat)):
    T = t_(1.6); f = mtof([62, 65, 69, 72, 69, 65][j % 6]); i = int(s0 * SR); e = min(n, i + len(T))
    bells[i:e] += (np.sin(2 * np.pi * f * T) + 0.4 * np.sin(2 * np.pi * 2 * f * T) * np.exp(-T * 4)) * env(T, 0.004, 0.6)[:e - i] * 0.3
# c8 ethereal: high airy choir-ish pad toward the light
air = lp(noise(n), 2500) * K([(0, 0), (g(90), 0), (g(91), 0.25), (g(92), 0.45), (ge(94), 0.1), (b[8], 0), (TOTAL, 0)]) * 0.5
mono = pad * 1.0 + drum * 0.9 + bells + air
mus[0] = mono + 0.15 * np.roll(mono, int(0.013 * SR)); mus[1] = mono + 0.15 * np.roll(mono, int(0.019 * SR))
# duck under the voice
with wave.open(os.path.join(A, 'voice.wav')) as w: v = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768; vsr = w.getframerate()
v = np.interp(t, np.arange(len(v)) / vsr, np.abs(v)); ve = lp(v, 3.0); ve = ve / (np.percentile(ve, 99) or 1)
duck = 1 - 0.5 * np.clip(ve * 2.2, 0, 1)
mus *= duck
mus[:, -int(0.05 * SR):] *= np.linspace(1, 0, int(0.05 * SR))
save('music.wav', mus, stereo=True)
print('music done')
