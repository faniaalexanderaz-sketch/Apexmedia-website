#!/bin/bash
# final4.sh <project>: final render through the gate, then a lighter delivery encode (same frames, constant 30 fps).
E=$(cd "$(dirname "$0")" && pwd); P=$1; cd "$E/.." || exit 1
NODE_PATH=$(npm root -g) node _engine4/render4.cjs $P final 2>&1 | grep -E "frames done|phases|gate|FATAL|ERROR|GATE" || exit 1
[ -f $P/renders/$P-9x16.mp4 ] || { echo "NO OUTPUT"; exit 1; }
cd $P/renders && mv $P-9x16.mp4 master.mp4 && ffmpeg -nostdin -v error -y -i master.mp4 -c:v libx264 -preset medium -crf 20 -maxrate 14M -bufsize 28M -pix_fmt yuv420p -r 30 -fps_mode cfr -c:a copy -movflags +faststart $P-9x16.mp4 || exit 1
A=$(ffprobe -v error -select_streams v -show_entries stream=r_frame_rate,avg_frame_rate,nb_frames -of csv=p=0 master.mp4); B=$(ffprobe -v error -select_streams v -show_entries stream=r_frame_rate,avg_frame_rate,nb_frames -of csv=p=0 $P-9x16.mp4)
[ "$A" = "$B" ] || { echo "DELIVERY MISMATCH $A vs $B"; exit 1; }
rm master.mp4; echo "delivery $B $(du -m $P-9x16.mp4 | cut -f1) MB"; echo FINAL-OK-$P
