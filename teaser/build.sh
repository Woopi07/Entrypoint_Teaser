#!/usr/bin/env bash
# Builds both teaser cuts: out/bsaid_teaser_16x9.mp4 and out/bsaid_teaser_9x16.mp4
# Requires: node + playwright (Chromium), python3 + numpy, ffmpeg.
set -euo pipefail
cd "$(dirname "$0")"
WORK="${WORK:-$(mktemp -d)}"
mkdir -p ../out "$WORK"

python3 audio.py "$WORK/teaser.wav"

node render.mjs 1920 1080 "$WORK/f169" &
node render.mjs 1080 1920 "$WORK/f916" &
wait

for v in "169:16x9" "916:9x16"; do
  src=${v%%:*}; name=${v##*:}
  ffmpeg -loglevel error -y -framerate 30 -i "$WORK/f$src/f%05d.jpg" -i "$WORK/teaser.wav" \
    -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k \
    -movflags +faststart -shortest "../out/bsaid_teaser_${name}.mp4"
done
ls -lh ../out
