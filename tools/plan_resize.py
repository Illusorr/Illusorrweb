"""Turn measured slot sizes into a concrete per asset resize plan.

Inputs : tools/_slots.json      (from the browser sweep: real rendered sizes)
         tools/_video-audit.json (from ffprobe: real intrinsic sizes and bitrates)
Output : tools/_plan.json

Sizing rule
-----------
An asset only needs enough pixels to stay sharp in the largest slot it ever
occupies, at the pixel density we choose to support.

  images  DPR 2.0  - retina phones and laptops resolve this; beyond it the
                     difference is not visible at normal viewing distance
  video   DPR 1.5  - moving pictures hide resampling far better than stills,
                     and video bytes cost an order of magnitude more

Never upscale: the target is always clamped to the asset's real intrinsic size.
Variant rungs come from the measured need at each breakpoint, snapped up to a
standard ladder so files stay cacheable and srcset stays readable.
"""
import json, math
from pathlib import Path

IMG_DPR   = 2.0
VID_DPR   = 1.5
VID_MAX_W = 1920   # no web video needs more, whatever the slot measures
LADDER    = [360, 480, 640, 768, 960, 1200, 1440, 1600, 1920]
MIN_GAIN  = 0.85   # skip a downscale that saves less than 15% of the width

def snap_up(x):
    for r in LADDER:
        if r >= x: return r
    return LADDER[-1]

def even(x):
    x = int(round(x))
    return x if x % 2 == 0 else x + 1

slots = json.loads(Path("tools/_slots.json").read_text(encoding="utf-8"))
vaud  = {r["path"]: r for r in json.loads(Path("tools/_video-audit.json").read_text(encoding="utf-8"))}

def to_disk(src):
    """map a URL path seen in the browser back to a file under site/"""
    return "site/" + src.lstrip("/")

plan = {"images": [], "video": [], "unmatched": []}

for a in slots:
    disk = to_disk(a["src"])
    p = Path(disk)
    if not p.is_file():
        plan["unmatched"].append(a["src"]); continue
    if p.suffix.lower() in (".svg", ".gif"): continue   # vector / animated

    # largest rendered CSS width this asset ever reaches, and per breakpoint need
    per_bp = {vw: dims[0] for vw, dims in a["byWidth"].items() if dims[0] > 0}
    if not per_bp: continue
    max_css = max(per_bp.values())

    if a["kind"] == "img":
        nat = a["natW"] or 0
        if not nat: continue
        target = min(nat, snap_up(math.ceil(max_css * IMG_DPR)))
        rungs = sorted({min(nat, snap_up(math.ceil(w * IMG_DPR))) for w in per_bp.values()})
        rungs = [r for r in rungs if r <= target]
        plan["images"].append({
            "path": disk, "src": a["src"], "nat_w": nat, "nat_h": a["natH"],
            "max_css": max_css, "per_bp": per_bp,
            "target_w": target,
            "rungs": rungs,
            "shrink": round(1 - target / nat, 3) if nat else 0,
            "bytes": p.stat().st_size,
            "pages": a["pages"],
        })
    else:
        meta = vaud.get(disk, {})
        nat  = meta.get("w") or a["natW"] or 0
        nath = meta.get("h") or a["natH"] or 0
        if not nat: 
            plan["unmatched"].append(a["src"]); continue
        tw = min(nat, VID_MAX_W, even(max_css * VID_DPR))
        if tw / nat > MIN_GAIN: tw = nat          # not worth re-scaling
        th = even(nath * tw / nat) if nat else nath
        plan["video"].append({
            "path": disk, "src": a["src"],
            "nat_w": nat, "nat_h": nath, "codec": meta.get("codec"),
            "kbps": meta.get("kbps"), "dur": meta.get("dur"),
            "max_css": max_css, "per_bp": per_bp,
            "target_w": tw, "target_h": th,
            "shrink": round(1 - tw / nat, 3) if nat else 0,
            "bytes": p.stat().st_size, "pages": a["pages"],
        })

Path("tools/_plan.json").write_text(json.dumps(plan, indent=1), encoding="utf-8")

im, vi = plan["images"], plan["video"]
print(f"images planned : {len(im)}")
print(f"video planned  : {len(vi)}")
print(f"unmatched      : {len(plan['unmatched'])}")
if im:
    over = [r for r in im if r["shrink"] > 0.1]
    print(f"\nimages worth shrinking : {len(over)}  "
          f"({sum(r['bytes'] for r in over)/1048576:.1f} MB currently)")
    print("worst 12 by wasted pixels:")
    for r in sorted(im, key=lambda r: -(r['nat_w']-r['target_w']))[:12]:
        print(f"  {r['nat_w']:>5} -> {r['target_w']:<5} (slot {r['max_css']:>4}) "
              f"{r['bytes']/1024:>7.0f} KB  {r['path'].split('/')[-1][:40]}")
if vi:
    print(f"\nvideo worth shrinking : {len([r for r in vi if r['shrink']>0.1])}")
    for r in sorted(vi, key=lambda r: -r['bytes'])[:12]:
        print(f"  {r['nat_w']}x{r['nat_h']} -> {r['target_w']}x{r['target_h']} "
              f"(slot {r['max_css']:>4}) {r['bytes']/1048576:>6.1f} MB  {r['path'].split('/')[-1][:34]}")
