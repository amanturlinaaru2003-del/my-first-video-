"""Сборка ролика «Мультик»: нарисованный фильм или готовые шоты + голос + пословные субтитры + музыка и эффекты.

python assemble.py plan.json --words          # слова голоса с номерами (для "at_word" в плане)
python assemble.py plan.json --animatic       # аниматик: вместо шотов — карточки с промптом (тайминг до генерации)
python assemble.py plan.json                  # итог; недостающие шоты тоже станут карточками
python assemble.py plan.json --fast --stills 1.5,10,30   # быстрый черновик 540×960 + лист кадров

Шот i идёт от начала слова at_word (или от "at" в секундах) до начала следующего шота. Переход — растворение
xfade длиной "xfade" (4 кадра ≈ 0,13 с), заканчивается ровно на первом слове нового шота.
Картинка (.png/.jpg) оживляется движением камеры "move"; видео подгоняется по длине (кончилось — стоп-кадр).
"""
import argparse, json, os, re, shutil, subprocess, sys

sys.stdout.reconfigure(encoding="utf-8")
SKILL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT = os.path.join(SKILL, "fonts", "Montserrat-ExtraBold.ttf")
W, H, FPS = 1080, 1920, 30
IMG = (".png", ".jpg", ".jpeg", ".webp")
MOVES = {  # (зум от, зум до, сдвиг x от→до, сдвиг y от→до) — сдвиг в долях свободного поля
    "push": (1.00, 1.10, 0, 0, 0, 0), "pull": (1.10, 1.00, 0, 0, 0, 0),
    "left": (1.10, 1.10, 0.8, -0.8, 0, 0), "right": (1.10, 1.10, -0.8, 0.8, 0, 0),
    "up": (1.10, 1.10, 0, 0, 0.8, -0.8), "down": (1.10, 1.10, 0, 0, -0.8, 0.8),
    "push_up": (1.00, 1.12, 0, 0, 0.5, -0.5), "slam": (1.00, 1.22, 0, 0, 0, 0),
}


def run(cmd, cwd=None):
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode:
        print(" ".join(cmd)); print(r.stderr[-3000:]); sys.exit(1)
    return r.stderr


def probe_dur(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                       capture_output=True, text=True)
    return float(r.stdout.strip() or 0)


def lufs(p, extra=()):
    out = run(["ffmpeg", "-hide_banner", *extra, "-i", p, "-af", "ebur128", "-f", "null", "-"])
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", out)
    return float(m[-1]) if m else None


# ---------------------------------------------------------------- субтитры
def chunks(words, cfg):
    """1 слово на экран; короткое служебное слово (≤ short букв) цепляется к следующему («в доме», «на лифте»).
    Знак в конце слова — граница куска."""
    mx, mc, short = cfg.get("max_words", 2), cfg.get("max_chars", 16), cfg.get("short", 3)
    out, cur = [], []
    for w in words:
        t = w["w"].strip()
        if not t: continue
        if cur:
            prev = re.sub(r"\W", "", cur[-1]["w"])
            text = " ".join(x["w"].strip() for x in cur + [w])
            glue = (len(prev) <= short and not re.search(r"[.,!?;:…—]$", cur[-1]["w"].strip())
                    and len(cur) < mx and len(text) <= mc)
            if not glue:
                out.append(cur); cur = []
        cur.append(w)
    if cur: out.append(cur)
    return out


def ass_time(t):
    t = max(0, t); h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def write_ass(words, total, cfg, path, scale=1.0):
    size, y = cfg.get("size", 90), cfg.get("y", 0.70)
    ol, sh = cfg.get("outline", 5), cfg.get("shadow", 3)
    strip = cfg.get("strip_end_punct", True)
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {int(W*scale)}
PlayResY: {int(H*scale)}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: S,Montserrat ExtraBold,{size*scale:.1f},&H00FFFFFF,&H00FFFFFF,&H00000000,&H90000000,0,0,0,0,100,100,0,0,1,{ol*scale:.1f},{sh*scale:.1f},5,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    cs = chunks(words, cfg)
    lines = []
    for i, c in enumerate(cs):
        s = c[0]["s"]; e = cs[i + 1][0]["s"] if i + 1 < len(cs) else total
        text = " ".join(x["w"].strip() for x in c)
        if strip: text = re.sub(r"[.,;:…]+$", "", text)
        text = text.replace("{", "(").replace("}", ")")
        lines.append(f"Dialogue: 0,{ass_time(s)},{ass_time(e)},S,,0,0,0,,{{\\pos({W*scale/2:.0f},{H*scale*y:.0f})}}{text}")
    open(path, "w", encoding="utf-8").write(head + "\n".join(lines) + "\n")
    return len(cs)


# ---------------------------------------------------------------- шоты
def cover(w, h):
    return f"scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},setsar=1"


def zoompan(move, n, w, h):
    z0, z1, x0, x1, y0, y1 = MOVES[move]
    p = f"(on/{max(1, n - 1)})"
    e = f"(1-cos(PI*{p}))/2"  # плавный разгон и торможение
    z = f"{z0}+({z1}-{z0})*{e}"
    x = f"(iw-iw/zoom)/2*(1+({x0}+({x1}-{x0})*{e}))"
    y = f"(ih-ih/zoom)/2*(1+({y0}+({y1}-{y0})*{e}))"
    return f"zoompan=z='{z}':x='{x}':y='{y}':d=1:s={w}x{h}:fps={FPS}"


def render_shot(shot, L, path, work, w, h, crf, preset, placeholder):
    n = max(1, round(L * FPS))
    media = shot.get("media")
    mpath = os.path.join(work, media) if media and not os.path.isabs(media) else media
    move = shot.get("move", "push" if (mpath or "").lower().endswith(IMG) else "none")
    enc = ["-an", "-c:v", "libx264", "-preset", preset, "-crf", str(crf), "-pix_fmt", "yuv420p", "-r", str(FPS)]
    if placeholder or not mpath or not os.path.exists(mpath):
        txt = f"{shot['id']}  ·  {L:.1f} c\n\n" + wrap(shot.get("prompt", "") or shot.get("say", ""), 34)
        open(os.path.join(work, "_card.txt"), "w", encoding="utf-8").write(txt)
        col = shot.get("card_color", "0x8FC3F0")
        vf = (f"drawtext=fontfile=_fonts/font.ttf:textfile=_card.txt:fontsize={int(40*w/W)}:fontcolor=0x1d1b2a:"
              f"x=(w-text_w)/2:y=h*0.18:line_spacing={int(10*w/W)}")
        run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", f"color=c={col}:s={w}x{h}:r={FPS}:d={L:.3f}",
             "-vf", vf, "-frames:v", str(n), *enc, path], cwd=work)
        return "карточка"
    if mpath.lower().endswith(IMG):
        big = cover(w * 2, h * 2)
        vf = f"{big}," + (zoompan(move, n, w, h) if move != "none" else f"scale={w}:{h},fps={FPS}")
        run(["ffmpeg", "-y", "-v", "error", "-loop", "1", "-framerate", str(FPS), "-t", f"{L + 0.2:.3f}", "-i", mpath,
             "-vf", vf, "-frames:v", str(n), *enc, path])
        return f"картинка/{move}"
    speed = shot.get("speed", 1.0)
    src = shot.get("from", 0.0)
    have = (probe_dur(mpath) - src) / speed
    vf = [f"setpts=(PTS-STARTPTS)/{speed}", f"fps={FPS}", cover(w, h)]
    if move != "none":
        vf += [cover(w * 2, h * 2), zoompan(move, n, w, h)]
    if have < L:
        vf.append(f"tpad=stop_mode=clone:stop_duration={L - have + 0.2:.3f}")
    run(["ffmpeg", "-y", "-v", "error", "-ss", f"{src:.3f}", "-i", mpath, "-vf", ",".join(vf),
         "-frames:v", str(n), *enc, path])
    return f"видео{' +стоп-кадр %.1f с' % (L - have) if have < L else ''}"


def wrap(s, n):
    out, line = [], ""
    for wd in s.split():
        if len(line) + len(wd) + 1 > n and line:
            out.append(line); line = wd
        else:
            line = f"{line} {wd}".strip()
    if line: out.append(line)
    return "\n".join(out[:14])


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("plan")
    ap.add_argument("--words", action="store_true")
    ap.add_argument("--animatic", action="store_true")
    ap.add_argument("--fast", action="store_true")
    ap.add_argument("--stills", default="")
    a = ap.parse_args()
    base = os.path.dirname(os.path.abspath(a.plan))
    plan = json.load(open(a.plan, encoding="utf-8"))
    rp = lambda p: p if os.path.isabs(p) else os.path.join(base, p)
    work = rp(plan.get("work_dir", "_work_multik"))
    os.makedirs(os.path.join(work, "_seg"), exist_ok=True)
    os.makedirs(os.path.join(work, "_fonts"), exist_ok=True)
    shutil.copy(FONT, os.path.join(work, "_fonts", "font.ttf"))
    wj = json.load(open(rp(plan.get("words", os.path.join(work, "words_out.json"))), encoding="utf-8"))
    words = wj["words"]
    voice = rp(plan.get("voice", os.path.join(work, "voice.wav")))
    vdur = probe_dur(voice)

    if a.words:
        for i, w in enumerate(words):
            print(f"{i:4d}  {w['s']:6.2f}  {w['w']}")
        return

    tail = plan.get("tail", 0.4)
    total = round(vdur + tail, 3)
    X = plan.get("xfade", 0.13)
    shots = plan["shots"]
    starts = []
    for k, s in enumerate(shots):
        t = 0.0 if k == 0 else (s["at"] if "at" in s else words[s["at_word"]]["s"])
        starts.append(round(t, 3))
    starts.append(total)
    for k in range(len(shots)):
        if starts[k + 1] - starts[k] < max(0.4, X * 2):
            sys.exit(f"Шот {shots[k]['id']} короче 0,4 с ({starts[k]:.2f}–{starts[k+1]:.2f}) — поправь at_word")

    scale = 0.5 if a.fast else 1.0
    w, h = int(W * scale), int(H * scale)
    crf, preset = (26, "veryfast") if a.fast else (17, "medium")
    print(f"Голос {vdur:.2f} с, ролик {total:.2f} с, шотов {len(shots)}, растворение {X} с")
    segs = []
    for k, s in enumerate(shots):
        L = starts[k + 1] - starts[k] + (X if k else 0)
        p = os.path.join(work, "_seg", f"{k:03d}_{s['id']}.mp4")
        kind = render_shot(s, L, p, work, w, h, crf, preset, a.animatic)
        print(f"  {s['id']:>5}  {starts[k]:6.2f}–{starts[k+1]:6.2f}  ({starts[k+1]-starts[k]:.2f} с)  {kind}")
        segs.append(p)

    # склейка растворениями
    inp, fc, last = [], [], "[0:v]"
    for p in segs: inp += ["-i", p]
    for k in range(1, len(segs)):
        o = f"[x{k}]"
        fc.append(f"{last}[{k}:v]xfade=transition=fade:duration={X}:offset={starts[k] - X:.3f}{o}")
        last = o
    g = plan.get("grade", {})
    post = []
    if g.get("sat", 1) != 1 or g.get("contrast", 1) != 1:
        post.append(f"eq=saturation={g.get('sat', 1)}:contrast={g.get('contrast', 1)}")
    if g.get("vignette"):
        post.append(f"vignette=angle={g['vignette']}")
    n_sub = write_ass(words, total, plan.get("subs", {}), os.path.join(work, "_subs.ass"), scale)
    post.append("subtitles=_subs.ass:fontsdir=_fonts")
    chain = (";".join(fc) + ";" if fc else "") + f"{last}{','.join(post)}[v]"
    # длинный граф — файлом (ffmpeg 7+), короткий — строкой: так работает и на старых сборках ffmpeg
    if len(chain) > 20000:
        open(os.path.join(work, "_video.fc"), "w", encoding="utf-8").write(chain)
        fc_args = ["-/filter_complex", "_video.fc"]
    else:
        fc_args = ["-filter_complex", chain]
    vid = os.path.join(work, "_video.mp4")
    run(["ffmpeg", "-y", "-v", "error", *inp, *fc_args, "-map", "[v]",
         "-t", f"{total:.3f}", "-c:v", "libx264", "-preset", preset, "-crf", str(crf), "-pix_fmt", "yuv420p",
         "-r", str(FPS), vid], cwd=work)
    print(f"Субтитров на экране: {n_sub}")

    # звук: голос + музыка + эффекты (уровни подбираются под ролик)
    # вход 0 — видео, 1 — голос, дальше музыка и эффекты
    ai, af, mix = ["-i", voice], [], ["[1:a]"]
    m = plan.get("music")
    if m and m.get("file"):
        ai += ["-stream_loop", "-1", "-ss", str(m.get("from", 0)), "-i", rp(m["file"])]
        af.append(f"[2:a]volume={m.get('volume', 0.12)},atrim=0:{total:.3f},"
                  f"afade=t=out:st={max(0, total - 0.6):.3f}:d=0.6[mus]")
        mix.append("[mus]")
    sv = plan.get("sfx_volume", 0.5)
    for k, s in enumerate(shots):
        for fx in s.get("sfx", []):
            ai += ["-i", rp(fx["file"])]
            j = ai.count("-i")
            t = starts[k] + fx.get("at", 0.0)
            af.append(f"[{j}:a]volume={fx.get('vol', 1.0) * sv},adelay={int(t * 1000)}:all=1[f{j}]")
            mix.append(f"[f{j}]")
    # лимитер: громкий голос + удары эффектов иначе упираются в 0 дБ
    af.append(f"{''.join(mix)}amix=inputs={len(mix)}:normalize=0:duration=first,"
              f"alimiter=limit=0.89:attack=2:release=60:level=0,apad,atrim=0:{total:.3f}[a]")
    out = rp(plan.get("out", "мультик.mp4"))
    if a.fast: out = os.path.splitext(out)[0] + " (черновик).mp4"
    run(["ffmpeg", "-y", "-v", "error", "-i", vid, *ai, "-filter_complex", ";".join(af), "-map", "0:v", "-map", "[a]",
         "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-t", f"{total:.3f}",
         "-movflags", "+faststart", out])
    print(f"Голос: {lufs(voice)} LUFS  |  итог: {lufs(out)} LUFS")
    if m and m.get("file"):
        mus = lufs(rp(m["file"]), ["-ss", str(m.get("from", 0)), "-t", f"{total:.2f}"])
        import math
        if mus is not None:
            print(f"Музыка на этом отрезке {mus} LUFS, с volume {m.get('volume', 0.12)} ≈ "
                  f"{mus + 20 * math.log10(m.get('volume', 0.12)):.1f} LUFS")
    print("Готово:", out)

    if a.stills:
        ts = [float(t) for t in a.stills.split(",")]
        sd = os.path.join(work, "_stills"); os.makedirs(sd, exist_ok=True)
        for i, t in enumerate(ts):
            run(["ffmpeg", "-y", "-v", "error", "-ss", str(t), "-i", out, "-frames:v", "1", "-vf", "scale=360:-1",
                 os.path.join(sd, f"{i:02d}.jpg")])
        cols = min(6, len(ts))
        rows = (len(ts) + cols - 1) // cols
        run(["ffmpeg", "-y", "-v", "error", "-i", os.path.join(sd, "%02d.jpg"),
             "-vf", f"tile={cols}x{rows}", "-frames:v", "1", os.path.join(work, "stills.jpg")])
        print("Кадры:", os.path.join(work, "stills.jpg"))


if __name__ == "__main__":
    main()
