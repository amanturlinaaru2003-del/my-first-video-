"""Подготовка к работе: проверка программ и движок рисовки в папке ролика.

python new_project.py --check            # только проверить, всё ли установлено
python new_project.py "<папка ролика>"   # создать <папка ролика>/engine и подключить зависимости

Сцены пользователя пишутся в <папка ролика>/engine/src, папка плагина не меняется.
Зависимости Remotion ставятся один раз в ~/.montazh-multik/deps и подключаются ссылкой, поэтому следующий
ролик готов за секунды. Если ссылку создать нельзя, зависимости ставятся прямо в папку ролика.
"""
import argparse, importlib.util, os, platform, re, shutil, subprocess, sys

sys.stdout.reconfigure(encoding="utf-8")
SKILL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE = os.path.join(SKILL, "engine")
DEPS = os.path.join(os.path.expanduser("~"), ".montazh-multik", "deps")
NPM = "npm.cmd" if os.name == "nt" else "npm"


def hint(name):
    os_name = platform.system()
    table = {
        "node": {"Windows": "winget install OpenJS.NodeJS.LTS", "Darwin": "brew install node",
                 "Linux": "sudo apt install nodejs npm"},
        "ffmpeg": {"Windows": "winget install Gyan.FFmpeg", "Darwin": "brew install ffmpeg",
                   "Linux": "sudo apt install ffmpeg"},
    }
    return table[name].get(os_name, f"установите {name}")


def check():
    """-> True, если для рисовки и сборки всего хватает. Расшифровка голоса проверяется отдельно."""
    ok = True
    node = shutil.which("node")
    if not node or not shutil.which(NPM):
        print(f"НЕТ  Node.js 18+  →  {hint('node')}"); ok = False
    else:
        ver = subprocess.run([node, "--version"], capture_output=True, text=True).stdout.strip()
        major = int(re.sub(r"\D", "", ver.split(".")[0]) or 0)
        print(("OK  " if major >= 18 else "СТАРЫЙ") + f"  Node.js {ver}")
        if major < 18:
            print(f"      нужен 18+  →  {hint('node')}"); ok = False
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        print(f"НЕТ  ffmpeg  →  {hint('ffmpeg')}"); ok = False
    else:
        out = subprocess.run(["ffmpeg", "-hide_banner", "-filters"], capture_output=True, text=True,
                             encoding="utf-8", errors="replace").stdout
        missing = [f for f in ("subtitles", "drawtext", "xfade", "ebur128", "alimiter") if not re.search(rf"\b{f}\b", out)]
        if missing:
            print("НЕПОЛНЫЙ  ffmpeg: нет фильтров " + ", ".join(missing) + " — нужна полная сборка с libass и freetype"); ok = False
        else:
            print("OK    ffmpeg")
    for mod, why in (("numpy", "расшифровка и замеры"), ("faster_whisper", "расшифровка голоса")):
        if importlib.util.find_spec(mod):
            print(f"OK    {mod}")
        else:
            print(f"НЕТ  {mod} ({why})  →  {sys.executable} -m pip install faster-whisper numpy")
            ok = False
    print("Всё на месте." if ok else "Чего-то не хватает: команды установки указаны выше.")
    return ok


def npm_install(folder):
    print(f"Ставлю зависимости Remotion в {folder} (первый раз пара минут)…", flush=True)
    r = subprocess.run([NPM, "install", "--no-audit", "--no-fund", "--loglevel", "error"], cwd=folder,
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode:
        print(r.stdout[-2000:]); print(r.stderr[-2000:]); sys.exit("npm install не сработал")


def link(target, link_path):
    try:
        if os.name == "nt":
            r = subprocess.run(["cmd", "/c", "mklink", "/J", link_path, target], capture_output=True)
            return r.returncode == 0
        os.symlink(target, link_path, target_is_directory=True)
        return True
    except OSError:
        return False


def ensure(folder):
    """Создаёт <folder>/engine, существующие сцены не трогает. -> путь движка."""
    if not shutil.which(NPM):
        sys.exit(f"Нужен Node.js 18+: {hint('node')}")
    engine = os.path.join(os.path.abspath(folder), "engine")
    if not os.path.exists(os.path.join(engine, "package.json")):
        shutil.copytree(TEMPLATE, engine, dirs_exist_ok=True, ignore=shutil.ignore_patterns("node_modules"))
        print("Движок:", engine)
    nm = os.path.join(engine, "node_modules")
    if os.path.exists(os.path.join(nm, "remotion")):
        return engine
    os.makedirs(DEPS, exist_ok=True)
    for f in ("package.json", "package-lock.json"):
        if os.path.exists(os.path.join(TEMPLATE, f)):
            shutil.copy(os.path.join(TEMPLATE, f), DEPS)
    if not os.path.exists(os.path.join(DEPS, "node_modules", "remotion")):
        npm_install(DEPS)
    if not link(os.path.join(DEPS, "node_modules"), nm):
        npm_install(engine)
    return engine


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("folder", nargs="?")
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()
    if a.check or not a.folder:
        sys.exit(0 if check() else 1)
    print("Готово:", ensure(a.folder))
