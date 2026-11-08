#!/usr/bin/env bash
# Builds out/astra_walkthrough.mp4 (1920x1080, 60 s) and out/astra_walkthrough.srt
# Requires: node + playwright (Chromium), python3 + numpy + kokoro-onnx + soundfile, ffmpeg,
# and the Kokoro model files in $TTS_MODEL_DIR (default /opt/tts).
set -euo pipefail
cd "$(dirname "$0")"
WORK="${WORK:-$(mktemp -d)}"
mkdir -p ../out "$WORK"

python3 build_timeline.py "$WORK/vo" "${TTS_MODEL_DIR:-/opt/tts}"   # voice + timeline.js + .srt
EVENTS_OUT="$WORK/events.json" node render.mjs 1920 1080 "$WORK/frames"
CLICKS="$WORK/events.json" python3 audio.py "$WORK/vo/timeline.json" "$WORK/mix.wav"

ffmpeg -loglevel error -y -framerate 30 -i "$WORK/frames/f%05d.jpg" -i "$WORK/mix.wav" \
  -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k \
  -movflags +faststart -shortest ../out/astra_walkthrough.mp4
ls -lh ../out/astra_walkthrough.*
