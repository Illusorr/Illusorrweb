"""Second pass on the alpha clips: constrained quality instead of pure CRF.

Pure CRF rejected four of eight because they came out LARGER after an 8x pixel
reduction. CRF targets a quality level, and downscaled footage carries more
detail per pixel, so libvpx spent more bits to hold that target. A bitrate
ceiling caps what it may spend, which is what these need.

Same alpha discipline: yuva420p + auto-alt-ref 0, and every output verified by
decoding a frame and measuring the alpha channel.
"""
import shutil, subprocess, time
from pathlib import Path
from PIL import Image

_W = (Path.home() / "AppData/Local/Microsoft/WinGet/Packages"
      / "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe" / "ffmpeg-9.0.1-full_build/bin")
FF = shutil.which("ffmpeg") or str(_W / "ffmpeg.exe")
FP = shutil.which("ffprobe") or str(_W / "ffprobe.exe")
TARGET_W = 1400
CHECK = Path("screenshots/verify/_a2"); CHECK.mkdir(parents=True, exist_ok=True)

def alpha_share(path, tag):
    png = CHECK / f"{tag}.png"
    subprocess.run([FF, "-y", "-v", "error", "-vcodec", "libvpx-vp9", "-i", str(path),
                    "-frames:v", "1", "-pix_fmt", "rgba", str(png)], capture_output=True)
    if not png.is_file(): return None
    a = Image.open(png).convert("RGBA").split()[3].tobytes()
    return sum(1 for v in a if v < 16) / max(len(a), 1)

def probe(path):
    o = subprocess.run([FP, "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "stream=width,height", "-show_entries", "format=duration",
                        "-of", "csv=p=0", str(path)], capture_output=True, text=True).stdout
    nums = [x for x in o.replace("\n", ",").split(",") if x.strip()]
    try: return int(nums[0]), int(nums[1]), float(nums[2])
    except Exception: return 0, 0, 0

def has_alpha(path):
    o = subprocess.run([FP, "-v", "error", "-show_streams", str(path)],
                       capture_output=True, text=True).stdout
    return "ALPHA_MODE=1" in o

targets = []
for d in ("clips", "holo", "shuffle"):
    p = Path("site/assets/projects/metagenus") / d
    if p.is_dir(): targets += sorted(p.glob("*.webm"))

t0 = time.time(); b0 = b1 = 0; kept = skipped = 0
for f in targets:
    if not has_alpha(f): continue
    w, h, dur = probe(f)
    if not w: continue
    before = f.stat().st_size
    kbps_now = (before * 8 / 1000) / max(dur, 0.1)
    # already small enough for its slot AND not overspending: leave alone
    if w <= TARGET_W and kbps_now < 1700:
        skipped += 1; continue
    tw = min(w, TARGET_W); th = round(h * tw / w); tw -= tw % 2; th -= th % 2
    cap = 1500 if tw >= 1000 else 900          # kbps ceiling for the target size
    tmp = f.with_name(f.stem + "-a2.webm")
    r = subprocess.run([FF, "-y", "-v", "error", "-vcodec", "libvpx-vp9", "-i", str(f),
                        "-vf", f"scale={tw}:{th}:flags=lanczos",
                        "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-auto-alt-ref", "0",
                        "-crf", "36", "-b:v", f"{cap}k", "-maxrate", f"{int(cap*1.5)}k",
                        "-bufsize", f"{cap*3}k", "-row-mt", "1", "-cpu-used", "3",
                        "-deadline", "good", "-an", str(tmp)], capture_output=True, text=True)
    if r.returncode != 0 or not tmp.is_file():
        print(f"  FAILED {f.name}: {(r.stderr or '')[:80]}", flush=True); tmp.unlink(missing_ok=True); continue
    base, got = alpha_share(f, "b"), alpha_share(tmp, "a")
    after = tmp.stat().st_size
    if base is not None and got is not None and got > base * 0.85 and after < before * 0.92:
        shutil.move(str(tmp), str(f)); kept += 1; b0 += before; b1 += after
        print(f"  {before/1048576:6.2f} -> {after/1048576:5.2f} MB  {w}x{h} -> {tw}x{th}  "
              f"alpha {100*base:.0f}% -> {100*got:.0f}%  {f.name}", flush=True)
    else:
        tmp.unlink(missing_ok=True); skipped += 1
        print(f"  kept original: {f.name} (alpha {base} -> {got}, {before/1048576:.2f} -> {after/1048576:.2f} MB)", flush=True)

shutil.rmtree(CHECK, ignore_errors=True)
print(f"\n  improved {kept}, left alone {skipped}, {(time.time()-t0)/60:.1f} min")
if b0: print(f"  {b0/1048576:.1f} MB -> {b1/1048576:.1f} MB  (saved {(b0-b1)/1048576:.1f} MB)")
