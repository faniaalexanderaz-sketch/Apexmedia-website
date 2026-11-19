#!/bin/bash
# render.sh <project-folder>: builds, renders at 30 fps, normalises loudness to -14 LUFS and trims audio to the exact video length (clean loop)
set -e
cd "$(dirname "$0")/../$1"
(cd gen && python3 build.py)
END=$(python3 -c "import sys; sys.path.insert(0,'gen'); from times import T; print(T['END'])")
npx --yes hyperframes@0.9.54 render --skill=hyperframes --quiet --fps 30 -o renders/_raw.mp4 > renders/_render.log 2>&1
ffmpeg -loglevel error -y -i renders/_raw.mp4 -filter_complex "[0:a]loudnorm=I=-14:TP=-1.5:LRA=11[a]" -map 0:v -map "[a]" -t $END -c:v libx264 -crf 17 -preset medium -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -ar 48000 -movflags +faststart renders/$1-9x16.mp4
echo "done $1 $END"
