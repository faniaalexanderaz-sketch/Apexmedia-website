#!/bin/bash
# optglb.sh in.glb out.glb : make a generated model light enough for software rendering (max 2048 px textures, ~40k triangles, jpeg/webp-free so three r149 reads it)
GT=/tmp/claude-0/-home-user-Apexmedia-website/05bdb8bd-85b0-5d1d-a647-b72e1a890220/scratchpad/npm/node_modules/.bin/gltf-transform
T=$(mktemp -d); $GT weld "$1" $T/a.glb >/dev/null && $GT simplify $T/a.glb $T/b.glb --ratio ${RATIO:-0.04} --error ${ERR:-0.01} >/dev/null && $GT resize $T/b.glb $T/c.glb --width ${TEX:-2048} --height ${TEX:-2048} >/dev/null && $GT prune $T/c.glb "$2" >/dev/null; rm -rf $T; ls -la "$2" | awk '{print $5}'
