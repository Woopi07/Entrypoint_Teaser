# BSAid — Teaser

30-second teaser for **BSAid**, a capstone educational game for first-year BSA students taking FAR1. Play it on **Entry Point**.

> *Every transaction tells a story. Will you make the right entry?*
> ▶ https://entry-point-sigma.vercel.app/

The teaser shows the real Entry Point screens (Case Files, Transaction Analysis with Nayeom, Overview Status, Concepts, Case Notes). It has a voiced narrator and character lines, burned-in captions, and an original study-fi score.

| File | What |
|---|---|
| `out/bsaid_teaser_16x9.mp4` | Landscape cut, 1920×1080, 30 s |
| `out/bsaid_teaser_9x16.mp4` | Vertical cut for Reels/TikTok/Shorts, 1080×1920, 30 s |
| `teaser/PROMPT.md` | Director's shot list with the VO script, for an editor or AI video generator |
| `teaser/teaser.html` | The animation. Open it in a browser for a real-time preview (no audio; resize to portrait for 9:16) |
| `teaser/assets/` | Entry Point screenshots used in the edit |
| `teaser/voiceover.py` | Voice-over script plus Kokoro TTS generation (one line per cue) |
| `teaser/audio.py` | Music, SFX and the final mix (ducks the music under the VO) |
| `teaser/render.mjs` | Renders frames deterministically with headless Chromium (Playwright) |
| `teaser/build.sh` | Builds both MP4s end to end |

## Rebuild

```bash
pip install kokoro-onnx soundfile numpy
mkdir -p /opt/tts && cd /opt/tts
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.int8.onnx
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
cd - && ./teaser/build.sh     # also needs node + playwright and ffmpeg (~4 min)
```

**To change a line or its timing:**
1. Edit `LINES` in `voiceover.py`. The script warns if a line runs into the next one.
2. Update the matching caption in `CAPS` in `teaser.html`.
3. Shift the scene windows in `render(t)` if needed.

**To use a human voice-over:** record each line as its own WAV, point `vo_cues.json` at the files, and run `audio.py`.
