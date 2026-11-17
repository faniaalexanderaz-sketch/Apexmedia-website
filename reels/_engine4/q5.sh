#!/bin/bash
# q5.sh p1 p2 ...: final renders one after the other
E=$(cd "$(dirname "$0")" && pwd); for p in "$@"; do echo "$(date +%T) START $p"; "$E/final4.sh" $p || echo "FAIL $p"; echo "$(date +%T) DONE $p"; done
