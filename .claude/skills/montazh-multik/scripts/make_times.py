"""Тайминг фильма из голоса: plan.json + words_out.json -> <папка ролика>/engine/src/times.ts

python make_times.py plan.json

В плане нужен список "scenes": [{"id": "s01", "at_word": 0, "say": "…"}, …] — номера первых слов сцен
(номера печатает assemble.py plan.json --words). Запускать после каждого изменения раскадровки или голоса.
"""
import argparse, json, os, subprocess, sys

sys.stdout.reconfigure(encoding="utf-8")
ap = argparse.ArgumentParser()
ap.add_argument("plan")
a = ap.parse_args()
base = os.path.dirname(os.path.abspath(a.plan))
plan = json.load(open(a.plan, encoding="utf-8"))
rp = lambda p: p if os.path.isabs(p) else os.path.join(base, p)
work = plan.get("work_dir", "_work_multik")
words = json.load(open(rp(plan.get("words", os.path.join(work, "words_out.json"))), encoding="utf-8"))["words"]
voice = rp(plan.get("voice", os.path.join(work, "voice.wav")))
r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", voice],
                   capture_output=True, text=True)
dur = float(r.stdout.strip() or words[-1]["e"])
total = round(dur + plan.get("tail", 0.4), 3)

scenes = plan["scenes"]
at = [s.get("at_word", 0) for s in scenes]
at[0] = 0
starts = [0.0] + [round(words[i]["s"], 3) for i in at[1:]]
for k in range(len(scenes)):
    end = starts[k + 1] if k + 1 < len(starts) else total
    if end - starts[k] < 0.4:
        sys.exit(f"Сцена {scenes[k].get('id', k)} короче 0,4 с ({starts[k]:.2f}–{end:.2f}) — поправь at_word")
ws = [round(w["s"], 3) for w in words]

out = os.path.join(base, "engine", "src", "times.ts")
with open(out, "w", encoding="utf-8", newline="\n") as f:
    f.write("// Сгенерировано scripts/make_times.py: начала сцен и слов в секундах. Руками не править.\n")
    f.write(f"export const AT_WORD = {json.dumps(at)};\n")
    f.write(f"export const STARTS = {json.dumps(starts)};\n")
    f.write(f"export const WS = {json.dumps(ws)};\n")
    f.write(f"export const TOTAL = {total};\n")
print(f"Сцен {len(scenes)}, слов {len(ws)}, длина {total:.2f} с ({int(total * 30 + 0.999)} кадров): {out}")
for k, s in enumerate(scenes):
    end = starts[k + 1] if k + 1 < len(starts) else total
    print(f"  {s.get('id', k):>5}  {starts[k]:6.2f}–{end:6.2f}  ({end - starts[k]:.2f} с)  {s.get('say', '')}")
