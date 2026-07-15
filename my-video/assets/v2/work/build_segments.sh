#!/bin/bash
set -e
cd /home/user/Apexmedia-website/my-video/assets/v2

GRADE_BLUE="colorbalance=rs=0.06:bs=-0.10:rm=0.05:bm=-0.08:rh=0.02:bh=-0.04,eq=contrast=1.08:saturation=1.05:gamma=0.97,curves=master='0/0.02 0.5/0.50 1/0.98',vignette=PI/5"
GRADE_TEAL="colorbalance=rs=0.02:bs=-0.03:rm=0.02:bm=-0.02:rh=0.0:bh=-0.01,eq=contrast=1.08:saturation=1.05:gamma=0.97,curves=master='0/0.02 0.5/0.50 1/0.98',vignette=PI/5"

zoom_filter() {
  local D=$1 ZMAX=$2
  echo "scale=w='1080*(1+${ZMAX}*t/${D})':h='1920*(1+${ZMAX}*t/${D})':eval=frame,crop=1080:1920:x='(in_w-1080)/2':y='(in_h-1920)/2'"
}

build() {
  local name=$1 src=$2 room=$3 ss=$4 t=$5 zmax=$6
  local grade
  if [ "$room" == "blue" ]; then grade="$GRADE_BLUE"; else grade="$GRADE_TEAL"; fi
  local zf
  zf=$(zoom_filter "$t" "$zmax")
  ffmpeg -y -ss "$ss" -t "$t" -i "raw/${src}.mp4" \
    -vf "scale=1080:1920:flags=lanczos,${grade},${zf}" \
    -an -c:v libx264 -crf 15 -pix_fmt yuv420p "graded/${name}.mp4" -loglevel error
  echo "done: $name"
}

build V01_hook   wide_teal        teal 1.0 3.879  0.07
build V02        foot_teal        teal 0.5 1.865  0.04
build V03        foot_blue        blue 1.0 3.041  0.04
build V04        ankle_teal       teal 0.2 2.387  0.04
build V05        wide_blue        blue 1.0 2.992  0.04
build V06a       foot_teal        teal 2.9 2.135  0.04
build V06b       backpalm_blue    blue 0.3 2.749  0.04
build V07        neckseated_teal  teal 0.0 4.147  0.04
build V08        backpalm_blue    blue 3.5 1.709  0.05
build V09        neckclose_blue   blue 2.0 2.710  0.04
build V10        trapknuckle_blue blue 1.0 3.391  0.04
build V11        wide_blue        blue 4.0 3.270  0.04
build V12        trapknuckle_blue blue 4.5 2.719  0.04
build V13a       neckclose_blue   blue 4.8 1.631  0.05
build V13b       ankle_teal       teal 1.4 1.647  0.05
build V14        foot_blue        blue 5.0 1.6485 0.05
build V15        neckclose_blue   blue 0.2 1.852  0.04
build V16        wide_teal        teal 2.0 3.23   0.04
