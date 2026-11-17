#!/bin/bash
# chkfinal.sh <project>: final file exists, FINAL-OK frame rate, and the voice is audible in its last second
p=$1; V=$p/renders/$p-9x16.mp4; T=$(python3 -c "import json;print(json.load(open('$p/assets/audio/transcript.json'))[-1]['end']-1.2)")
echo "$p $(ffprobe -v error -select_streams v -show_entries stream=r_frame_rate,nb_frames -of csv=p=0 $V) dur $(ffprobe -v error -show_entries format=duration -of csv=p=0 $V) voice-tail $(ffmpeg -nostdin -ss $T -t 1 -i $V -af volumedetect -vn -f null - 2>&1 | grep -oE 'mean_volume: [-0-9.]+' | cut -d' ' -f2) dB"
