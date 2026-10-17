"""Voice-led timing. Reads script.json, makes one voice clip per step with edge-tts, and writes timeline.json.

Each step lasts: LEAD (camera moves in while the voice waits) + clip + TAIL + the step's "extra" seconds.
Unchanged lines come from the cache, so re-running after an edit only re-voices what changed.
  npm run vo        (or: python vo.py on Windows, python3 vo.py on Mac)
"""
import importlib.util, json, shutil, subprocess, sys, time
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # Windows consoles and pipes are not UTF-8 by default
# edge-tts: the Python module first (pip install edge-tts), then the edge-tts command, then uvx.
if importlib.util.find_spec("edge_tts"): TTS = [sys.executable, "-m", "edge_tts"]
elif shutil.which("edge-tts"): TTS = ["edge-tts"]
elif shutil.which("uvx"): TTS = ["uvx", "edge-tts"]
else: sys.exit("edge-tts not found. Install it with: python -m pip install edge-tts")

LEAD, TAIL = 0.7, 0.8
script = json.loads(Path("script.json").read_text(encoding="utf-8"))
voice = script.get("voice", "en-US-AvaMultilingualNeural")
out = Path("out/vo"); out.mkdir(parents=True, exist_ok=True)
dur = lambda f: float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)]))

steps, t = [], 0.0
for s in script["steps"]:
    sid, text = s["id"], s.get("line", "")
    d = 0.0
    if text:
        f, key = out / f"{sid}.mp3", out / f"{sid}.txt"
        stamp = f"{voice}|{text}"
        if not (f.exists() and key.exists() and key.read_text(encoding="utf-8") == stamp):
            for _ in range(8):  # the free TTS service drops requests now and then
                r = subprocess.run([*TTS, "--voice", voice, "--text", text, "--write-media", str(f)], capture_output=True, text=True, errors="replace")
                if r.returncode == 0:
                    key.write_text(stamp, encoding="utf-8"); break
                time.sleep(2)
            else:
                sys.exit(f"edge-tts failed on {sid}: {r.stderr.strip()[-500:]}")
        d = dur(f)
    length = round(max(s.get("min", 0), LEAD + d + TAIL + s.get("extra", 0)), 2)
    steps.append({**s, "start": round(t, 2), "dur": length, "voStart": round(t + LEAD, 2), "voDur": round(d, 2), "line": text})
    print(f"{sid:12} {t:6.1f}s +{length:5.1f}s  {text}")
    t += length

Path("timeline.json").write_text(json.dumps({**{k: v for k, v in script.items() if k != "steps"}, "total": round(t, 2), "steps": steps}, indent=1), encoding="utf-8")
print(f"total {t:.1f}s")
