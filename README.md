# BSAid — Teaser

30-second teaser for **BSAid**, a capstone educational game for first-year BSA students taking FAR1.

> *Every transaction tells a story. Will you make the right entry?*
> ▶ https://entry-point-sigma.vercel.app/

| File | What |
|---|---|
| `out/bsaid_teaser_16x9.mp4` | Landscape cut, 1920×1080, 30 s |
| `out/bsaid_teaser_9x16.mp4` | Vertical cut for Reels/TikTok/Shorts, 1080×1920, 30 s |
| `teaser/PROMPT.md` | Director's shot list / copy-paste prompt for an editor or AI video generator |
| `teaser/teaser.html` | The animation. Open it in a browser for a real-time preview (resize to portrait to see the 9:16 layout) |
| `teaser/audio.py` | Synthesizes the original study-fi score and UI SFX, cued to the animation |
| `teaser/render.mjs` | Renders frames deterministically with headless Chromium (Playwright) |
| `teaser/build.sh` | Builds both MP4s end to end |

## Rebuild

```bash
./teaser/build.sh        # needs node + playwright, python3 + numpy, ffmpeg (~2.5 min)
```

To tweak timing, edit `render(t)` in `teaser.html` (each scene is a time window) and the matching cue times in `audio.py`.
