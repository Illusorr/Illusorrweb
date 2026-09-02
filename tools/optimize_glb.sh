#!/usr/bin/env bash
# Per-file 3D optimisation, chosen from the geometry/texture/animation split.
#   resample : drops redundant animation keyframes, lossless
#   webp     : re-encodes embedded textures via EXT_texture_webp (three r127+)
#   draco    : compresses mesh geometry (every loader here has DRACOLoader)
set -u
export PATH="$PATH:/c/Users/ASUS/AppData/Roaming/npm"
BK="uploads/_pre-resize/3d"; mkdir -p "$BK"
tmp=$(mktemp -d)

opt () {  # opt <file> <do_resample> <do_webp> <do_draco>
  f="$1"; rs="$2"; wp="$3"; dr="$4"
  [ -f "$f" ] || { echo "  missing $f"; return; }
  before=$(stat -c%s "$f")
  cp -n "$f" "$BK/$(basename "$f")" 2>/dev/null
  cur="$f"; step=0
  for stage in resample webp draco; do
    case "$stage" in
      resample) [ "$rs" = 1 ] || continue ;;
      webp)     [ "$wp" = 1 ] || continue ;;
      draco)    [ "$dr" = 1 ] || continue ;;
    esac
    step=$((step+1)); out="$tmp/s$step-$(basename "$f")"
    if [ "$stage" = "webp" ]; then
      gltf-transform webp "$cur" "$out" --quality 85 >/dev/null 2>&1
    else
      gltf-transform "$stage" "$cur" "$out" >/dev/null 2>&1
    fi
    if [ -f "$out" ] && [ "$(stat -c%s "$out")" -gt 1000 ]; then cur="$out"; else echo "    ($stage skipped)"; fi
  done
  if [ "$cur" != "$f" ]; then
    after=$(stat -c%s "$cur")
    if [ "$after" -lt "$before" ]; then
      cp "$cur" "$f"
      printf "  %7.2f -> %6.2f MB (%3.0f%% off)  %s\n" \
        "$(echo "$before" | awk '{print $1/1048576}')" \
        "$(echo "$after"  | awk '{print $1/1048576}')" \
        "$(echo "$before $after" | awk '{print 100*(1-$2/$1)}')" "$(basename "$f")"
    else
      printf "  %7.2f MB  kept original (optimised was larger)  %s\n" \
        "$(echo "$before" | awk '{print $1/1048576}')" "$(basename "$f")"
    fi
  fi
}

M=site/assets/projects/metaculture/3d
G=site/assets/projects/metagenus/models
#                                        resample webp draco
opt "$M/space.glb"                0 1 1
opt "$M/space-details.glb"        0 1 1
opt "$M/garment-a.glb"            0 1 1
opt "$M/garment-b.glb"            0 1 1
opt "$M/garment-female.glb"       0 1 0
opt "$M/logo.glb"                 1 0 1
opt "$G/MG_animation_scaled.glb"  1 0 1
opt site/assets/models/morphellum.glb    0 1 0
opt site/assets/projects/echoes/projections.glb 0 0 0
rm -rf "$tmp"
