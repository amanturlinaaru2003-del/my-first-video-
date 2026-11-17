"""Cartoon pipeline around the montazh-multik skill.

python multik.py <video_dir> prep      # voice -> _work_multik/voice.wav + words_out.json, plan.json, engine, times.ts
python multik.py <video_dir> stills a,b,c   # frames (seconds) -> _work/sheet.jpg
python multik.py <video_dir> render    # film.mp4 -> final "<title>.mp4"
Needs <video_dir>/scenes.json: {"scenes": [[at_word, "what is said / shown"], ...], "sfx": [[file, at_sec, vol], ...],
"music_volume": 0.16}
"""
import json, os, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.join(os.path.dirname(os.path.dirname(HERE)), ".claude", "skills", "montazh-multik")
PY = "/tmp/claude-0/venv/bin/python"
vd = os.path.abspath(sys.argv[1]); cmd = sys.argv[2]
script = json.load(open(os.path.join(vd, "script.json"), encoding="utf-8"))
OUT_DIR = os.path.join(os.path.dirname(HERE), "renders")


def run(args):
    print("+", " ".join(args[:4]), flush=True)
    subprocess.run(args, cwd=vd, check=True)


if cmd == "prep":
    sc = json.load(open(os.path.join(vd, "scenes.json"), encoding="utf-8"))
    dur = json.load(open(os.path.join(vd, "words.json"), encoding="utf-8"))["duration"]
    json.dump({"source": "voice.wav", "words": "words.json", "work_dir": "_work_multik", "voice_gain_db": 0,
               "cuts": {"takes": [[0.0, dur]], "max_gap": 0.4, "keep_repeats": [], "verbatim": False},
               "subs": {"lower": False, "fix": {}, "replace": {}}},
              open(os.path.join(vd, "plan_voice.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    run([PY, "-E", os.path.join(SKILL, "scripts", "prep.py"), "plan_voice.json"])
    wo = json.load(open(os.path.join(vd, "_work_multik", "words_out.json"), encoding="utf-8"))["words"]
    # sfx: [name, word_index (int) or seconds (float), volume, offset_sec?]
    sfx = [{"file": os.path.join(SKILL, "assets", "sfx", e[0] + ".wav"),
            "at": round((wo[e[1]]["s"] if isinstance(e[1], int) else e[1]) + (e[3] if len(e) > 3 else 0), 3), "vol": e[2]}
           for e in sc.get("sfx", [])]
    plan = {"work_dir": "_work_multik", "voice": "_work_multik/voice.wav", "words": "_work_multik/words_out.json",
            "out": os.path.join(OUT_DIR, f"{os.path.basename(vd)}.mp4"), "tail": 0.5, "xfade": 0.13,
            "subs": {"size": 92, "y": 0.70, "outline": 5, "shadow": 3, "max_words": 2, "max_chars": 14, "short": 3,
                     "strip_end_punct": True},
            "music": {"file": os.path.join(SKILL, "assets", "music", "playful.mp3"), "from": sc.get("music_from", 0),
                      "volume": sc.get("music_volume", 0.26)},
            "sfx_volume": sc.get("sfx_volume", 0.6),
            "scenes": [{"id": f"s{i + 1:02d}", "at_word": a, "say": say} for i, (a, say) in enumerate(sc["scenes"])],
            "shots": [{"id": "film", "media": "../film.mp4", "sfx": sfx}]}
    json.dump(plan, open(os.path.join(vd, "plan.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    run([PY, "-E", os.path.join(SKILL, "scripts", "new_project.py"), "."])
    shutil.copy(os.path.join(HERE, "mykit.tsx"), os.path.join(vd, "engine", "src", "mykit.tsx"))
    run([PY, "-E", os.path.join(SKILL, "scripts", "make_times.py"), "plan.json"])
elif cmd == "stills":
    if sys.argv[3] == "mids":  # middle of every scene
        import re
        ts = open(os.path.join(vd, "engine", "src", "times.ts"), encoding="utf-8").read()
        st = json.loads(re.search(r"STARTS = (\[.*?\]);", ts).group(1)); tot = float(re.search(r"TOTAL = ([\d.]+)", ts).group(1))
        sel = sys.argv[4].split(",") if len(sys.argv) > 4 else None
        secs = [(a + b) / 2 for a, b in zip(st, st[1:] + [tot])]
        secs = [secs[int(i) - 1] for i in sel] if sel else secs
    else:
        secs = [float(x) for x in sys.argv[3].split(",")]
    fr = ",".join(str(round(x * 30)) for x in secs)
    shutil.copy(os.path.join(HERE, "mykit.tsx"), os.path.join(vd, "engine", "src", "mykit.tsx"))
    run([PY, "-E", os.path.join(SKILL, "scripts", "render_scene.py"), "Film", ".", "--stills", fr])
elif cmd == "render":
    os.makedirs(OUT_DIR, exist_ok=True)
    shutil.copy(os.path.join(HERE, "mykit.tsx"), os.path.join(vd, "engine", "src", "mykit.tsx"))
    run([PY, "-E", os.path.join(SKILL, "scripts", "render_scene.py"), "Film", ".", "--out", "film.mp4"])
    run([PY, "-E", os.path.join(SKILL, "scripts", "assemble.py"), "plan.json"])
elif cmd == "assemble":  # re-mix only (music/subtitle changes), film.mp4 kept
    run([PY, "-E", os.path.join(SKILL, "scripts", "assemble.py"), "plan.json"])
