"""Kazakh voiceover from a script with word timings.

python voice.py <video_dir>
Reads <video_dir>/script.json:
  {"speaker": 1, "speed": 1.0, "gap": 0.28, "sentences": ["...", "..."], "pron": {"word": "spoken form"}}
Writes <video_dir>/voice.wav (48 kHz mono) and <video_dir>/words.json in the skills' transcribe format
({"duration", "words": [{"w","s","e"}], "segments"}). Word times come from faster-whisper word timestamps,
aligned character by character to the script text, so subtitles show the script's exact spelling.
"""
import json, os, re, subprocess, sys, wave, difflib
import numpy as np
from piper import PiperVoice
from piper.config import SynthesisConfig

MODEL = os.environ.get("PIPER_MODEL", "/tmp/claude-0/dl/issai/kk_KZ-issai-high.onnx")
vd = os.path.abspath(sys.argv[1])
cfg = json.load(open(os.path.join(vd, "script.json"), encoding="utf-8"))
work = os.path.join(vd, "_voice"); os.makedirs(work, exist_ok=True)
voice = PiperVoice.load(MODEL)
SR = voice.config.sample_rate
pron = cfg.get("pron", {})


def spoken(text):
    for k, v in pron.items():
        text = re.sub(rf"(?<!\w){re.escape(k)}", v, text, flags=re.I)
    return text


def synth(text, path):
    sc = SynthesisConfig(speaker_id=cfg.get("speaker", 1), length_scale=cfg.get("speed", 1.0),
                         noise_scale=0.6, noise_w_scale=0.75)
    chunks = [c.audio_int16_array for c in voice.synthesize(spoken(text), syn_config=sc)]
    a = np.concatenate(chunks)
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(a.tobytes())


def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                          "-of", "csv=p=0", p]).decode())


# 1. sentences -> trimmed wavs -> one track
gap = cfg.get("gap", 0.28)
parts, t = [], cfg.get("lead", 0.25)
for i, s in enumerate(cfg["sentences"]):
    raw, trim = f"{work}/s{i:02d}.wav", f"{work}/s{i:02d}.trim.wav"
    synth(s, raw)
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", raw, "-af",
                    "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
                    "silenceremove=start_periods=1:start_threshold=-45dB,areverse,aresample=48000", trim], check=True)
    d = dur(trim)
    parts.append((s, trim, t, d))
    t += d + gap
total = t - gap + 0.3
args = ["ffmpeg", "-nostdin", "-v", "error", "-y"]
filt = []
for i, (_, f, st, _) in enumerate(parts):
    args += ["-i", f]
    filt.append(f"[{i}:a]adelay={int(st * 1000)}:all=1[a{i}]")
mix = "".join(f"[a{i}]" for i in range(len(parts)))
chain = (f"{mix}amix=inputs={len(parts)}:normalize=0,highpass=f=70,equalizer=f=170:t=q:w=1:g=1.5,"
         "equalizer=f=6500:t=q:w=1.5:g=-1.5,acompressor=threshold=-22dB:ratio=2:attack=15:release=250:makeup=1,"
         f"apad=whole_dur={total:.3f},atrim=0:{total:.3f},loudnorm=I=-16:TP=-1.5:LRA=9[out]")
args += ["-filter_complex", ";".join(filt) + ";" + chain, "-map", "[out]", "-ar", "48000", "-ac", "1",
         os.path.join(vd, "voice.wav")]
subprocess.run(args, check=True)

# 2. word timings: whisper per sentence, aligned to the script by characters
from faster_whisper import WhisperModel
wm = WhisperModel(os.environ.get("WHISPER_MODEL", "small"), device="cpu", compute_type="int8")


def nchars(w):
    return re.sub(r"[^\w%]", "", w.lower())


words, segments = [], []
for s, f, st, d in parts:
    toks = s.split()
    pcm = subprocess.check_output(["ffmpeg", "-nostdin", "-v", "error", "-i", f, "-f", "f32le", "-ac", "1",
                                   "-ar", "16000", "-"])
    segs, _ = wm.transcribe(np.frombuffer(pcm, np.float32), language="kk", word_timestamps=True, initial_prompt=s, beam_size=5)
    hw = [w for sg in segs for w in sg.words]
    # hypothesis chars with times (linear inside each word)
    hc, ht = [], []
    for w in hw:
        c = nchars(w.word)
        for k, ch in enumerate(c):
            hc.append(ch); ht.append(w.start + (w.end - w.start) * k / max(1, len(c)))
    # script chars
    sc_chars, owner = [], []
    for wi, tk in enumerate(toks):
        for ch in nchars(tk):
            sc_chars.append(ch); owner.append(wi)
    times = [None] * len(sc_chars)
    sm = difflib.SequenceMatcher(None, "".join(sc_chars), "".join(hc), autojunk=False)
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            times[a + k] = ht[b + k]
    # interpolate gaps; anchor ends to 0 and d
    known = [(i, x) for i, x in enumerate(times) if x is not None]
    if len(known) < 2:
        known = [(0, 0.0), (len(times) - 1, d * 0.97)]
    xs = np.array([k for k, _ in known], float); ys = np.array([v for _, v in known], float)
    ys = np.maximum.accumulate(ys)
    allt = np.interp(np.arange(len(times)), xs, ys)
    if known[0][0] > 0:  # before first anchor: proportional from 0
        allt[:known[0][0]] = np.linspace(0, ys[0], known[0][0], endpoint=False)
    starts = {}
    for ci, wi in enumerate(owner):
        starts.setdefault(wi, allt[ci])
    ws = [min(starts.get(i, 0.0), d) for i in range(len(toks))]
    for i in range(1, len(ws)):
        ws[i] = max(ws[i], ws[i - 1] + 0.06)
    for i, tk in enumerate(toks):
        e = ws[i + 1] - 0.02 if i + 1 < len(toks) else d
        words.append({"w": tk, "s": round(st + ws[i], 3), "e": round(st + max(e, ws[i] + 0.05), 3)})
    segments.append({"s": round(st, 3), "e": round(st + d, 3), "text": s})
    print(f"[{st:6.2f}+{d:5.2f}] {s}\n   whisper: {' '.join(w.word.strip() for w in hw)}", flush=True)

json.dump({"duration": round(total, 3), "words": words, "segments": segments},
          open(os.path.join(vd, "words.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"voice {total:.2f} s, {len(words)} words")
