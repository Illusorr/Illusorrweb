"""Encode the videos the sweep could not reach because they sit behind interactions.

Two classes, treated differently:
  panorama (360 equirectangular) - keep full resolution, only cut bitrate, since
                                   the viewer only ever sees a slice of the frame
  modal / grid clips             - cap at 1080 wide, which is what the 1100px
                                   panel can show, then cut bitrate
"""
import json, subprocess, shutil, time
from pathlib import Path

FFMPEG = shutil.which("ffmpeg")
PANO   = {"galaxy-360.mp4"}          # data-pano, mapped onto a sphere
CAP    = 1080
CRF    = 33

SITE=Path("site")
blob="\n".join(f.read_text(encoding="utf-8",errors="ignore")
               for ext in ("*.html","*.css","*.js")
               for f in SITE.rglob(ext) if not f.name.startswith(("_",".")) and f.suffix!=".bak")
audit={r["path"]:r for r in json.loads(Path("tools/_video-audit.json").read_text(encoding="utf-8"))}
alpha={r["path"]:r for r in json.loads(Path("tools/_video-alpha.json").read_text(encoding="utf-8"))}

todo=[p for p in sorted(SITE.rglob("*.mp4"))
      if p.name in blob and not p.with_suffix(".webm").is_file()]
print(f"{len(todo)} referenced mp4 without a webm\n")

log=[]; b0=b1=0; t0=time.time()
for i,p in enumerate(todo,1):
    m=audit.get(p.as_posix(),{}); a=alpha.get(p.as_posix(),{})
    nw,nh=m.get("w",0),m.get("h",0)
    if not nw: print(f"[{i}] skip {p.name}: no probe data"); continue
    if p.name in PANO:
        tw,th=nw,nh; note="panorama: resolution kept"
    else:
        tw=min(nw,CAP); th=max(2,round(nh*tw/nw)); tw-=tw%2; th-=th%2
        note=f"capped to {CAP}"
    out=p.with_suffix(".webm")
    cmd=[FFMPEG,"-y","-loglevel","error","-i",str(p),
         "-vf",f"scale={tw}:{th}:flags=lanczos",
         "-c:v","libvpx-vp9","-crf",str(CRF),"-b:v","0",
         "-row-mt","1","-cpu-used","3","-deadline","good","-pix_fmt","yuv420p"]
    cmd += (["-c:a","libopus","-b:a","96k"] if a.get("audio") else ["-an"])
    cmd += [str(out)]
    r=subprocess.run(cmd,capture_output=True,text=True)
    if r.returncode==0 and out.is_file():
        poster=p.with_name(p.stem+"-poster.webp")
        if not poster.is_file():
            subprocess.run([FFMPEG,"-y","-loglevel","error","-ss",str(max(0.1,(m.get('dur') or 2)*0.15)),
                            "-i",str(p),"-frames:v","1","-vf",f"scale={min(tw,1200)}:-2:flags=lanczos",
                            "-q:v","80",str(poster)],capture_output=True)
        b,aft=p.stat().st_size,out.stat().st_size
        b0+=b; b1+=aft
        log.append({"src":p.as_posix(),"out":out.as_posix(),"before":b,"after":aft,"ok":True})
        print(f"[{i}/{len(todo)}] {b/1048576:6.1f} -> {aft/1048576:5.1f} MB ({100*(1-aft/b):5.1f}% off) "
              f"{nw}x{nh}->{tw}x{th}  {note}  {p.name}",flush=True)
    else:
        print(f"[{i}/{len(todo)}] FAILED {p.name}: {(r.stderr or '')[:120]}",flush=True)
Path("tools/_video-encode-rest.json").write_text(json.dumps(log,indent=1),encoding="utf-8")
print(f"\n{len(log)} encoded in {(time.time()-t0)/60:.1f} min")
print(f"before {b0/1048576:.1f} MB -> after {b1/1048576:.1f} MB   saved {(b0-b1)/1048576:.1f} MB")
