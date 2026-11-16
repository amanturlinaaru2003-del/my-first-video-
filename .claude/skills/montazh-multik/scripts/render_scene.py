"""Рендер нарисованного кодом фильма (Remotion, <папка ролика>/engine).

python render_scene.py Film "<папка ролика>" --stills 15,60,120,300    # кадры -> <папка>/_work/sheet.jpg
python render_scene.py Film "<папка ролика>" --out film.mp4 [--audio звук.wav]

Номера кадров — при 30 к/с. Движка в папке ещё нет — он создаётся сам. --frames 0-89 рендерит только кусок.
"""
import argparse, os, subprocess, sys

sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from new_project import ensure

NPX = "npx.cmd" if os.name == "nt" else "npx"

ap = argparse.ArgumentParser()
ap.add_argument("comp"); ap.add_argument("folder")
ap.add_argument("--stills", default=""); ap.add_argument("--out", default="")
ap.add_argument("--audio", default=""); ap.add_argument("--frames", default="")
a = ap.parse_args()
ENGINE = ensure(a.folder)
work = os.path.join(os.path.abspath(a.folder), "_work")
os.makedirs(work, exist_ok=True)


def sh(cmd):
    r = subprocess.run(cmd, cwd=ENGINE, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode:
        print(r.stdout[-3000:]); print(r.stderr[-3000:]); sys.exit(1)
    return r.stdout


sh([NPX, "tsc", "--noEmit", "-p", "."])
bundle = os.path.join(work, "bundle")
sh([NPX, "remotion", "bundle", "src/index.ts", "--out-dir", bundle, "--log", "error"])

if a.stills:
    sd = os.path.join(work, "stills"); os.makedirs(sd, exist_ok=True)
    files = []
    for fr in [int(x) for x in a.stills.split(",")]:
        p = os.path.join(sd, f"{fr:04d}.png")
        sh([NPX, "remotion", "still", bundle, a.comp, p, "--frame", str(fr), "--log", "error"])
        files.append(p)
    # лист кадров: по 6 в ряд, неполный ряд дополняется чёрным
    cols = min(6, len(files)); rows = (len(files) + cols - 1) // cols
    inp = sum([["-i", p] for p in files], [])
    fc = "".join(f"[{i}]scale=270:480[s{i}];" for i in range(len(files)))
    if len(files) == 1:
        fc += "[s0]null"
    else:
        layout = "|".join(f"{270 * (i % cols)}_{480 * (i // cols)}" for i in range(len(files)))
        fc += "".join(f"[s{i}]" for i in range(len(files))) + f"xstack=inputs={len(files)}:layout={layout}:fill=black"
    sheet = os.path.join(work, "sheet.jpg")
    subprocess.run(["ffmpeg", "-y", "-v", "error", *inp, "-filter_complex", fc, "-frames:v", "1", sheet], check=True)
    print("Кадры:", sheet, f"({cols}×{rows})")

if a.out:
    out = os.path.join(os.path.abspath(a.folder), a.out)
    silent = os.path.join(work, "_silent.mp4")
    extra = ["--frames", a.frames] if a.frames else []
    sh([NPX, "remotion", "render", bundle, a.comp, silent, "--codec", "h264", "--crf", "16", "--muted", "--log", "error", *extra])
    if a.audio:
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", silent, "-i", a.audio, "-map", "0:v", "-map", "1:a",
                        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out], check=True)
    else:
        os.replace(silent, out)
    print("Готово:", out)
