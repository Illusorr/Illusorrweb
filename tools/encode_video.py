"""Re encode every referenced video to VP9 WebM at its measured display size.

Reads tools/_plan.json. For each clip:
  - scales to the planned target (measured slot x 1.5 DPR, never upscaled)
  - encodes VP9 via CRF, which targets quality rather than a fixed bitrate,
    so simple footage gets small and complex footage keeps its detail
  - writes a WebP poster from a frame 15% into the clip
  - leaves the original in place; nothing is deleted here

Originals are only removed after the markup rewrite is verified.
"""
import json, subprocess, sys, os, shutil, time
from pathlib import Path

FFMPEG = shutil.which("ffmpeg") or r"C:\Users\ASUS\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-full_build\bin\ffmpeg.exe"
CRF    = {"big": 33, "small": 36}   # wider clips can afford a lower quality index
CPU    = 3                          # 0 slowest/best .. 5 fastest; 3 is the usual web tradeoff

plan = json.loads(Path("tools/_plan.json").read_text(encoding="utf-8"))
alpha_by_path = {r["path"]: r for r in json.loads(Path("tools/_video-alpha.json").read_text(encoding="utf-8"))}
vids = sorted(plan["video"], key=lambda r: -r["bytes"])
log  = []
t0 = time.time()
before_total = after_total = 0

for i, v in enumerate(vids, 1):
    src = Path(v["path"])
    if not src.is_file(): continue
    out = src.with_suffix(".webm")
    if out.resolve() == src.resolve():
        out = src.with_name(src.stem + "-opt.webm")     # source already .webm
    poster = src.with_name(src.stem + "-poster.webp")

    tw, th = v["target_w"], v["target_h"]
    crf = CRF["big"] if tw >= 900 else CRF["small"]
    ss  = max(0.1, (v.get("dur") or 2) * 0.15)

    # Alpha: VP9 carries transparency as yuva420p. Detect it on the source and
    # preserve it. auto-alt-ref must be off or libvpx drops the alpha plane.
    # VP9 alpha in WebM is signalled by the container tag ALPHA_MODE=1, NOT by
    # pix_fmt, which reports plain yuv420p for alpha files. Reading pix_fmt here
    # silently flattened C1.webm and wings.webm to opaque black boxes.
    meta_pix = (alpha_by_path.get(v["path"], {}) or {}).get("pix", "yuv420p")
    probe = subprocess.run([FFMPEG.replace("ffmpeg","ffprobe"), "-v", "error",
                            "-show_streams", str(src)], capture_output=True, text=True).stdout
    has_alpha = ("ALPHA_MODE=1" in probe or meta_pix.startswith("yuva")
                 or "rgba" in meta_pix or "argb" in meta_pix)
    # Audio: 55 clips carry an audio track. Keep it as Opus rather than dropping it.
    has_audio = (alpha_by_path.get(v["path"], {}) or {}).get("audio", False)

    cmd = [FFMPEG, "-y", "-loglevel", "error", "-i", str(src),
           "-vf", f"scale={tw}:{th}:flags=lanczos",
           "-c:v", "libvpx-vp9", "-crf", str(crf), "-b:v", "0",
           "-row-mt", "1", "-cpu-used", str(CPU), "-deadline", "good"]
    if has_alpha:
        cmd += ["-pix_fmt", "yuva420p", "-auto-alt-ref", "0"]
    else:
        cmd += ["-pix_fmt", "yuv420p"]
    cmd += (["-c:a", "libopus", "-b:a", "96k"] if has_audio else ["-an"])
    cmd += [str(out)]
    r = subprocess.run(cmd, capture_output=True, text=True)
    ok = r.returncode == 0 and out.is_file() and out.stat().st_size > 0

    if ok:
        subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-ss", str(ss), "-i", str(src),
                        "-frames:v", "1", "-vf", f"scale={min(tw,1200)}:-2:flags=lanczos",
                        "-q:v", "80", str(poster)], capture_output=True, text=True)
        b, a = v["bytes"], out.stat().st_size
        before_total += b; after_total += a
        log.append({"src": v["path"], "out": out.as_posix(), "poster": poster.as_posix(),
                    "alpha": has_alpha, "audio": has_audio,
                    "from": f'{v["nat_w"]}x{v["nat_h"]}', "to": f"{tw}x{th}",
                    "before": b, "after": a, "saved_pct": round(100*(1-a/b), 1), "ok": True})
        print(f"[{i}/{len(vids)}] {b/1048576:7.1f} -> {a/1048576:6.1f} MB "
              f"({100*(1-a/b):5.1f}% off)  {v['nat_w']}x{v['nat_h']}->{tw}x{th}  {src.name}", flush=True)
    else:
        log.append({"src": v["path"], "ok": False, "err": (r.stderr or "")[:400]})
        print(f"[{i}/{len(vids)}] FAILED {src.name}: {(r.stderr or '')[:160]}", flush=True)

Path("tools/_video-encode-log.json").write_text(json.dumps(log, indent=1), encoding="utf-8")
print(f"\ndone in {(time.time()-t0)/60:.1f} min")
print(f"before {before_total/1048576:.1f} MB  ->  after {after_total/1048576:.1f} MB"
      f"   saved {(before_total-after_total)/1048576:.1f} MB")
