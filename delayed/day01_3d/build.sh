#!/usr/bin/env bash
# Builds out/dg_day01_3d.mp4 (1080x1920) and out/dg_day01_3d.srt
# Requires: node + playwright (Chromium), npm install (three), python3 + numpy + kokoro-onnx + soundfile, ffmpeg, Kokoro models in $TTS_MODEL_DIR.
set -euo pipefail
cd "$(dirname "$0")"
WORK="${WORK:-$(mktemp -d)}"
mkdir -p ../../out "$WORK"
python3 build_timeline.py "$WORK/vo" "${TTS_MODEL_DIR:-/opt/tts}"
EVENTS_OUT="$WORK/events.json" node render.mjs "$WORK/frames"
CLICKS="$WORK/events.json" python3 audio.py "$WORK/vo/timeline.json" "$WORK/mix.wav"
ffmpeg -loglevel error -y -framerate 30 -i "$WORK/frames/f%05d.jpg" -i "$WORK/mix.wav" \
  -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -shortest ../../out/dg_day01_3d.mp4
ls -lh ../../out/dg_day01_3d.*
