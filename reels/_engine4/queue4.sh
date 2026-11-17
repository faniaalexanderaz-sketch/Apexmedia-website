#!/bin/bash
# queue4.sh: renders every project listed in _engine4/queue.txt (one per line), in order; new lines can be appended while it runs.
E=$(cd "$(dirname "$0")" && pwd); i=1
while true; do L=$(sed -n "${i}p" "$E/queue.txt"); if [ -z "$L" ]; then sleep 20; continue; fi; [ "$L" = "END" ] && break; echo "$(date +%T) START $L"; "$E/final4.sh" $L; echo "$(date +%T) DONE $L"; i=$((i+1)); done
