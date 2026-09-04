"""Convert the Aquatic Architects website recording for the web.

Master: 2548x1332, 30fps, H.264 at 14.1 Mbps, 98s, 167 MB, with an AAC track.

It plays in a frame about 1200px wide and it is a silent scroll-through of a
website, so the audio is dropped and the frame capped at 1440. Screen content
is mostly flat colour and hard edges, which VP9 handles far better than a
camera image, so the bitrate falls a long way without visible loss.

Ships WebM (VP9) with an MP4 (H.264) fallback and a poster, the same shape as
every other clip on the site.
"""
import shutil, subprocess, time
from pathlib import Path

_W = (Path.home() / "AppData/Local/Microsoft/WinGet/Packages"
      / "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.1-full_build/bin")
FF = shutil.which("ffmpeg") or str(_W / "ffmpeg.exe")
FP = shutil.which("ffprobe") or str(_W / "ffprobe.exe")

SRC = Path("uploads/_masters/assets/video/AquaticArchitects/Website Recording.mp4")
DST = Path("site/assets/video/aquatic-architects"); DST.mkdir(parents=True, exist_ok=True)
STEM = "illusorr-aquatic-architects-website-walkthrough"
W = 1440

def size(p): return p.stat().st_size / 1048576

t0 = time.time()
before = size(SRC)
print(f"  master  {before:.1f} MB")

# ---- poster: a frame with the hero on screen, not the first black frame ----
poster = DST / f"{STEM}-poster.webp"
subprocess.run([FF, "-y", "-v", "error", "-ss", "3", "-i", str(SRC),
                "-frames:v", "1", "-vf", f"scale={W}:-2", "-quality", "82", str(poster)],
               capture_output=True)
print(f"  poster  {poster.stat().st_size/1024:.0f} KB  {poster.name}")

# ---- VP9 ----
webm = DST / f"{STEM}.webm"
r = subprocess.run([FF, "-y", "-v", "error", "-i", str(SRC),
                    "-vf", f"scale={W}:-2:flags=lanczos",
                    "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0",
                    "-row-mt", "1", "-cpu-used", "3", "-deadline", "good",
                    "-pix_fmt", "yuv420p", "-an", str(webm)], capture_output=True, text=True)
if r.returncode: print("  VP9 FAILED:", (r.stderr or "")[:200])
else: print(f"  webm    {size(webm):.2f} MB")

# ---- H.264 fallback ----
mp4 = DST / f"{STEM}.mp4"
r = subprocess.run([FF, "-y", "-v", "error", "-i", str(SRC),
                    "-vf", f"scale={W}:-2:flags=lanczos",
                    "-c:v", "libx264", "-crf", "26", "-preset", "slow",
                    "-profile:v", "high", "-pix_fmt", "yuv420p",
                    "-movflags", "+faststart", "-an", str(mp4)], capture_output=True, text=True)
if r.returncode: print("  H.264 FAILED:", (r.stderr or "")[:200])
else: print(f"  mp4     {size(mp4):.2f} MB")

after = sum(size(p) for p in (webm, mp4) if p.exists())
print(f"\n  {before:.1f} MB -> {after:.2f} MB shipped ({100*(1-after/before):.1f}% smaller), "
      f"{(time.time()-t0)/60:.1f} min")
for p in (webm, mp4):
    if p.exists():
        d = subprocess.run([FP, "-v", "error", "-select_streams", "v:0", "-show_entries",
                            "stream=width,height", "-of", "csv=p=0", str(p)],
                           capture_output=True, text=True).stdout.strip()
        print(f"    {p.name}  {d}")
