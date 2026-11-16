#!/bin/bash
# render4.sh <project> : Engine 4 render with the automatic smoothness gate. Nothing is delivered if a check fails.
E=$(cd "$(dirname "$0")" && pwd); P=$1; cd "$E/../$P" || exit 1
FPS=$(grep -o 'data-fps="[0-9]*"' index.html | head -1 | grep -o '[0-9]*'); D=$(grep -o 'data-duration="[0-9.]*"' index.html | head -1 | grep -o '[0-9.]*')
node "$E/camcheck.cjs" . || { echo "GATE-FAIL camera"; exit 1; }
rm -f renders/raw.mp4; npx hyperframes render --fps $FPS --crf 12 --output renders/raw.mp4 2>&1 | grep -E "rror|rendered|ms/frame"
[ -f renders/raw.mp4 ] || { echo "GATE-FAIL no render"; exit 1; }
A=$(ffprobe -v error -select_streams a -show_entries stream=codec_name -of csv=p=0 renders/raw.mp4); AO="-an"; [ -n "$A" ] && AO="-c:a aac -b:a 192k -af loudnorm=I=-14:TP=-1.5:LRA=11"
ffmpeg -v error -y -i renders/raw.mp4 -c:v libx264 -preset slow -b:v 22M -maxrate 30M -bufsize 60M -pix_fmt yuv420p -r $FPS -fps_mode cfr $AO -movflags +faststart renders/$P-9x16.mp4 || exit 1
R=$(ffprobe -v error -select_streams v -show_entries stream=r_frame_rate,avg_frame_rate,nb_frames -of csv=p=0 renders/$P-9x16.mp4); echo "stream $R"
EXP=$(python3 -c "print(round($D*$FPS))"); NB=$(echo $R | cut -d, -f3); RF=$(echo $R | cut -d, -f1); AF=$(echo $R | cut -d, -f2)
DUP=$(ffmpeg -i renders/$P-9x16.mp4 -vf mpdecimate=hi=64:lo=32:frac=0.05 -loglevel debug -f null - 2>&1 | grep -c "drop pts")
echo "frames $NB expected $EXP duplicates $DUP"
[ "$RF" = "$FPS/1" ] && [ "$AF" = "$FPS/1" ] || { echo "GATE-FAIL frame rate not constant"; exit 1; }
[ "$NB" = "$EXP" ] || { echo "GATE-FAIL frame count"; exit 1; }
[ "$DUP" -le "${MAXDUP:-0}" ] || { echo "GATE-FAIL $DUP duplicated frames"; exit 1; }
rm -f renders/raw.mp4; echo "GATE-OK"; echo DONE-$P
