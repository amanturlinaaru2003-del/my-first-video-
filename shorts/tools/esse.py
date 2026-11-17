"""Vertical kinetic-text video around the montazh-esse skill.

python esse.py <video_dir> prep            # voice -> _work_esse/voice.wav + words_out.json; prints words with indices
python esse.py <video_dir> plan            # scenes.json -> plan.json (word indices -> seconds)
python esse.py <video_dir> stills [a,b|mids]  # -> _work_esse/stills.jpg
python esse.py <video_dir> render          # -> shorts/renders/<video>.mp4
scenes.json: {"scenes": [{"w": word_index, "kind": ..., ...}], "accent": [...], "music_volume": 0.1}
Inside a scene, any "at"-like field given as {"w": i} is converted too (count_at, type_at, click, items[].at, ...).
"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.join(os.path.dirname(os.path.dirname(HERE)), ".claude", "skills", "montazh-esse")
MUSIC = os.path.join(os.path.dirname(SKILL), "montazh-multik", "assets", "music", "playful.mp3")
PY = ["/tmp/claude-0/venv/bin/python", "-E", "-P"]
vd = os.path.abspath(sys.argv[1]); cmd = sys.argv[2]
OUT_DIR = os.path.join(os.path.dirname(HERE), "renders")
FONTS = {"400": "InterDisplay-Regular.woff2", "500": "InterDisplay-Medium.woff2", "600": "InterDisplay-SemiBold.woff2",
         "700": "InterDisplay-Bold.woff2"}


def run(args):
    subprocess.run(args, cwd=vd, check=True)


def words_out():
    return json.load(open(os.path.join(vd, "_work_esse", "words_out.json"), encoding="utf-8"))


if cmd == "prep":
    dur = json.load(open(os.path.join(vd, "words.json"), encoding="utf-8"))["duration"]
    json.dump({"source": "voice.wav", "words": "words.json", "cuts": {"takes": [[0.0, dur]], "max_gap": 0.4, "verbatim": False},
               "subs": {"lower": False}, "scenes": []},
              open(os.path.join(vd, "plan.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    run(PY + [os.path.join(SKILL, "scripts", "prep.py"), "plan.json"])
    wo = words_out()["words"]
    line = []
    for i, w in enumerate(wo):
        line.append(f"{i}:{w['w']}@{w['s']:.2f}")
        if w["w"].endswith((".", "?", "!", ":")) or i == len(wo) - 1:
            print(" ".join(line)); line = []
elif cmd == "plan":
    sc = json.load(open(os.path.join(vd, "scenes.json"), encoding="utf-8"))
    wo = words_out()["words"]

    def conv(node):
        if isinstance(node, dict):
            if set(node) == {"w"} or set(node) == {"w", "d"}:
                return round(wo[node["w"]]["s"] + node.get("d", 0), 3)
            return {k: conv(v) for k, v in node.items()}
        if isinstance(node, list):
            return [conv(x) for x in node]
        return node

    scenes = []
    for s in sc["scenes"]:
        s = dict(s)
        wi = s.pop("w")
        at = 0.0 if wi == 0 else round(wo[wi]["s"] - s.pop("lead", 0.05), 3)
        scenes.append(dict(conv(s), at=at))
    plan = json.load(open(os.path.join(vd, "plan.json"), encoding="utf-8"))
    plan.update({"out": os.path.join(OUT_DIR, f"{os.path.basename(vd)}.mp4"), "width": 1080, "height": 1920, "fonts": FONTS,
                 "emoji": "system", "fps": 30, "tail": 0.9, "sfx": True, "sfx_volume": sc.get("sfx_volume", 0.8),
                 "music": {"src": MUSIC, "volume": sc.get("music_volume", 0.1), "start": 0, "fade_out": 1.5},
                 "accent": sc.get("accent", []), "phrase": sc.get("phrase", {"max_words": 2, "max_chars": 16, "gap": 0.35}),
                 "overlays": conv(sc.get("overlays", [])), "scenes": scenes})
    json.dump(plan, open(os.path.join(vd, "plan.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(len(scenes), "scenes")
elif cmd == "stills":
    plan = json.load(open(os.path.join(vd, "plan.json"), encoding="utf-8"))
    if sys.argv[3] == "mids":
        ats = [s["at"] for s in plan["scenes"]] + [words_out()["duration"]]
        secs = [round((a + b) / 2 + 0.3, 2) for a, b in zip(ats, ats[1:])]
    else:
        secs = sys.argv[3].split(",")
    run(PY + [os.path.join(SKILL, "scripts", "render.py"), "plan.json", "--preview", "--still", ",".join(map(str, secs))])
elif cmd == "render":
    os.makedirs(OUT_DIR, exist_ok=True)
    run(PY + [os.path.join(SKILL, "scripts", "render.py"), "plan.json"])
