#!/bin/bash
# queue4b.sh: like queue4.sh, but skips a project whose delivered video is newer than its film.js (safe to restart).
E=$(cd "$(dirname "$0")" && pwd); i=1
while true; do L=$(sed -n "${i}p" "$E/queue.txt"); if [ -z "$L" ]; then sleep 20; continue; fi; [ "$L" = "END" ] && break
  V="$E/../$L/renders/$L-9x16.mp4"; if [ -f "$V" ] && [ "$V" -nt "$E/../$L/assets/vendor/film.js" ] && [ ! -f "$E/../$L/renders/master.mp4" ]; then echo "$(date +%T) SKIP $L (already rendered)"; else echo "$(date +%T) START $L"; "$E/final4.sh" $L; echo "$(date +%T) DONE $L"; fi; i=$((i+1)); done
