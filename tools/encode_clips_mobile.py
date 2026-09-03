"""Half-size mobile encodes of the Metagenus avatar clips.

The avatar video autoplays on phones (it carries data-m-autoplay, so the touch
layer deliberately keeps it running). At 1400x1720 it is 3.5 MB for a frame
that measures 350x438 on a phone: about nine times the pixels needed, and it
downloads before the visitor has done anything.

Alpha in VP9/WebM is signalled by the container tag ALPHA_MODE, never by
pix_fmt. Encoding needs -pix_fmt yuva420p AND -auto-alt-ref 0 or libvpx
silently drops the alpha plane. Every output is decoded back and its alpha
measured; anything that loses transparency or grows is rejected.
"""
import shutil, subprocess, time
from pathlib import Path
from PIL import Image

_W = (Path.home() / "AppData/Local/Microsoft/WinGet/Packages"
      / "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.1-full_build/bin")
FF = shutil.which("ffmpeg") or str(_W / "ffmpeg.exe")
FP = shutil.which("ffprobe") or str(_W / "ffprobe.exe")

SRC = Path("site/assets/projects/metagenus/clips")
DST = SRC / "m"; DST.mkdir(exist_ok=True)
CHK = Path("screenshots/verify/_clipchk"); CHK.mkdir(parents=True, exist_ok=True)
SCALE = 0.5
CRF = 34

def alpha_share(path, tag):
    png = CHK / f"{tag}.png"
    subprocess.run([FF, "-y", "-v", "error", "-vcodec", "libvpx-vp9", "-i", str(path),
                    "-frames:v", "1", "-pix_fmt", "rgba", str(png)], capture_output=True)
    if not png.is_file(): return None
    a = Image.open(png).convert("RGBA").split()[3].tobytes()
    return sum(1 for v in a if v < 16) / max(len(a), 1)

t0 = time.time(); b0 = b1 = 0; kept = 0
clips = sorted(p for p in SRC.glob("*.webm"))
for i, f in enumerate(clips, 1):
    probe = subprocess.run([FP, "-v", "error", "-select_streams", "v:0", "-show_entries",
                            "stream=width,height", "-of", "csv=p=0", str(f)],
                           capture_output=True, text=True).stdout.strip().split(",")
    w, h = int(probe[0]), int(probe[1])
    tw = int(w * SCALE) & ~1; th = int(h * SCALE) & ~1
    out = DST / f.name
    r = subprocess.run([FF, "-y", "-v", "error", "-vcodec", "libvpx-vp9", "-i", str(f),
                        "-vf", f"scale={tw}:{th}:flags=lanczos",
                        "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-auto-alt-ref", "0",
                        "-crf", str(CRF), "-b:v", "0", "-row-mt", "1",
                        "-cpu-used", "4", "-deadline", "good", "-an", str(out)],
                       capture_output=True, text=True)
    if r.returncode != 0 or not out.is_file():
        print(f"  [{i}/{len(clips)}] FAILED {f.name}: {(r.stderr or '')[:80]}", flush=True); continue
    base = alpha_share(f, "b"); got = alpha_share(out, "a")
    before, after = f.stat().st_size, out.stat().st_size
    ok = base is not None and got is not None and got > base * 0.85 and after < before
    if ok:
        kept += 1; b0 += before; b1 += after
        print(f"  [{i}/{len(clips)}] {f.name:<10} {before/1048576:5.2f} -> {after/1048576:4.2f} MB  "
              f"{w}x{h} -> {tw}x{th}  alpha {100*base:.0f}% -> {100*got:.0f}%", flush=True)
    else:
        out.unlink(missing_ok=True)
        print(f"  [{i}/{len(clips)}] REJECTED {f.name} (alpha {base} -> {got})", flush=True)

shutil.rmtree(CHK, ignore_errors=True)
print(f"\n  kept {kept}/{len(clips)} in {(time.time()-t0)/60:.1f} min")
print(f"  {b0/1048576:.1f} MB -> {b1/1048576:.1f} MB on phones (saves {(b0-b1)/1048576:.1f} MB)")
