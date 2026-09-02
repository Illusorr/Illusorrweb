"""Re-encode the alpha avatar clips, preserving transparency.

These are 3220x3956 - about 12.7 megapixels - for a slot that measures
1128x1386 on desktop and 350x438 on a phone. Roughly eight times the pixels
needed.

Alpha in VP9/WebM is signalled by the container tag ALPHA_MODE, never by
pix_fmt (which reports plain yuv420p). Encoding needs -pix_fmt yuva420p AND
-auto-alt-ref 0, or libvpx silently drops the alpha plane while ffmpeg still
copies the tag - which is exactly how these got flattened to black boxes once
already.

Every output is verified by decoding a frame with the alpha-aware decoder and
measuring the alpha channel. Anything that loses transparency, or comes out
larger, is rejected and the original kept.
"""
import shutil, subprocess, sys, time
from pathlib import Path
from PIL import Image

FF = shutil.which("ffmpeg")
TARGET_W = 1400
CRF = 32
CHECK = Path("screenshots/verify/_alphachk"); CHECK.mkdir(parents=True, exist_ok=True)

def transparency(path, tag):
    png = CHECK / f"{tag}.png"
    subprocess.run([FF, "-y", "-v", "error", "-vcodec", "libvpx-vp9", "-i", str(path),
                    "-frames:v", "1", "-pix_fmt", "rgba", str(png)], capture_output=True)
    if not png.is_file(): return None
    im = Image.open(png).convert("RGBA")
    a = im.split()[3].tobytes()
    return sum(1 for v in a if v < 16) / max(len(a), 1)

def has_alpha(path):
    o = subprocess.run([FF.replace("ffmpeg", "ffprobe"), "-v", "error", "-show_streams", str(path)],
                       capture_output=True, text=True).stdout
    return "ALPHA_MODE=1" in o

targets = []
for d in ("clips", "holo", "shuffle"):
    p = Path("site/assets/projects/metagenus") / d
    if p.is_dir(): targets += sorted(p.glob("*.webm"))

t0 = time.time(); b0 = b1 = 0; kept = rejected = 0
for i, f in enumerate(targets, 1):
    if not has_alpha(f):
        continue
    probe = subprocess.run([FF.replace("ffmpeg","ffprobe"), "-v", "error", "-select_streams", "v:0",
                            "-show_entries", "stream=width,height", "-of", "csv=p=0", str(f)],
                           capture_output=True, text=True).stdout.strip().split(",")
    try: w, h = int(probe[0]), int(probe[1])
    except Exception: continue
    if w <= TARGET_W:
        continue
    before = f.stat().st_size
    tw = TARGET_W; th = round(h * tw / w); tw -= tw % 2; th -= th % 2
    tmp = f.with_name(f.stem + "-alpha.webm")
    r = subprocess.run([FF, "-y", "-v", "error", "-vcodec", "libvpx-vp9", "-i", str(f),
                        "-vf", f"scale={tw}:{th}:flags=lanczos",
                        "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-auto-alt-ref", "0",
                        "-crf", str(CRF), "-b:v", "0", "-row-mt", "1",
                        "-cpu-used", "3", "-deadline", "good", "-an", str(tmp)],
                       capture_output=True, text=True)
    if r.returncode != 0 or not tmp.is_file():
        print(f"  [{i}] FAILED {f.name}: {(r.stderr or '')[:90]}", flush=True)
        tmp.unlink(missing_ok=True); continue
    base = transparency(f, "before"); got = transparency(tmp, "after")
    after = tmp.stat().st_size
    ok = (base is not None and got is not None and got > base * 0.85 and after < before)
    if ok:
        shutil.move(str(tmp), str(f)); kept += 1; b0 += before; b1 += after
        print(f"  [{i}] {before/1048576:6.2f} -> {after/1048576:5.2f} MB  {w}x{h} -> {tw}x{th}  "
              f"alpha {100*base:.0f}% -> {100*got:.0f}%  {f.name}", flush=True)
    else:
        tmp.unlink(missing_ok=True); rejected += 1
        print(f"  [{i}] REJECTED {f.name} (alpha {base} -> {got}, {before} -> {after})", flush=True)

shutil.rmtree(CHECK, ignore_errors=True)
print(f"\n  kept {kept}, rejected {rejected}, {(time.time()-t0)/60:.1f} min")
print(f"  {b0/1048576:.1f} MB -> {b1/1048576:.1f} MB  (saved {(b0-b1)/1048576:.1f} MB)")
