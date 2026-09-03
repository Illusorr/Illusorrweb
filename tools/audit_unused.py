"""Report media in site/ that nothing appears to reference. REPORT ONLY.

An earlier prune deleted two genuinely-used images because it treated any
"-<number>" tail as a generated width rung. This is deliberately paranoid and
never deletes:

  * a file counts as referenced by full name, by stem, or by the stem of its
    width rung (name-480.webp -> name), because several pages build paths at
    runtime ('.../thumb/' + id + '.webp')
  * anything reachable from a JS string that concatenates a directory is
    reported separately as "uncertain" rather than unused

Writes tools/_unused-audit.json.
"""
import json
import re
from collections import defaultdict
from pathlib import Path

SITE = Path("site")
MEDIA = {".webp", ".png", ".jpg", ".jpeg", ".gif", ".avif", ".webm", ".mp4",
         ".mp3", ".wav", ".glb", ".gltf", ".woff2", ".woff", ".ttf"}
LADDER = re.compile(r"^(.*)-(360|480|576|640|768|960|1080|1200|1440|1600|1920)$")

text = [f for ext in ("*.html", "*.css", "*.js", "*.json", "*.xml")
        for f in SITE.rglob(ext)]
blob = "\n".join(f.read_text(encoding="utf-8", errors="ignore") for f in text)

# every quoted/bare token that could be a filename or a stem
tokens = set(re.findall(r"[A-Za-z0-9_.\-/]{2,}", blob))
names = set()
for t in tokens:
    names.add(t)
    names.add(t.rsplit("/", 1)[-1])
    names.add(t.rsplit("/", 1)[-1].rsplit(".", 1)[0])

# directories that appear in string concatenation, e.g. '.../thumb/' + id
concat_dirs = set()
for m in re.finditer(r"['\"]([A-Za-z0-9_./-]*/)['\"]\s*\+", blob):
    concat_dirs.add(m.group(1).rstrip("/").rsplit("/", 1)[-1])

unused, uncertain = [], []
by_dir = defaultdict(int)
for f in sorted(SITE.rglob("*")):
    if not f.is_file() or f.suffix.lower() not in MEDIA or f.name.startswith("."):
        continue
    rel = f.relative_to(SITE).as_posix()
    stem = f.stem
    base = LADDER.match(stem).group(1) if LADDER.match(stem) else stem
    hit = (f.name in names or stem in names or base in names
           or rel in blob or f.name in blob or base in blob)
    if hit:
        continue
    size = f.stat().st_size
    # a file sitting in a directory that JS concatenates into is not safe to judge
    if f.parent.name in concat_dirs:
        uncertain.append({"file": rel, "bytes": size, "reason": f"dir '{f.parent.name}' used in JS concatenation"})
    else:
        unused.append({"file": rel, "bytes": size})
        by_dir[f.parent.as_posix()] += size

Path("tools/_unused-audit.json").write_text(
    json.dumps({"unused": unused, "uncertain": uncertain}, indent=1), encoding="utf-8")

tot = sum(u["bytes"] for u in unused)
unc = sum(u["bytes"] for u in uncertain)
print(f"  apparently unreferenced : {len(unused):>4} files  {tot/1048576:>8.1f} MB")
print(f"  uncertain (JS concat)   : {len(uncertain):>4} files  {unc/1048576:>8.1f} MB")
print(f"\n  largest directories of unreferenced media:")
for d, b in sorted(by_dir.items(), key=lambda kv: -kv[1])[:14]:
    print(f"    {b/1048576:>7.1f} MB  {d}")
print(f"\n  10 largest single unreferenced files:")
for u in sorted(unused, key=lambda x: -x["bytes"])[:10]:
    print(f"    {u['bytes']/1048576:>7.2f} MB  {u['file']}")
