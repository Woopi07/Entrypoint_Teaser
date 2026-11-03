# Beyond Technical Skills — research explainer video

A 1:57 animated explainer for the research proposal *Perceived Effects of Technology-Integrated
Accounting Education on the Development of Multidimensional Competencies among Newly Passed CPAs
from Pamantasan ng Lungsod ng Valenzuela*. It has a narrated voice-over and burned-in subtitles.

- `out/beyond_technical_skills.mp4`: the video, 1920×1080
- `out/beyond_technical_skills.srt`: a separate subtitles file (for YouTube, Facebook, etc.)

| File | What |
|---|---|
| `script.py` | Narration, one line per subtitle; `CAPTIONS` overrides subtitle text where it should differ from the spoken words |
| `build_timeline.py` | Voices each line (Kokoro TTS, voice `af_heart`) and lays out the scene timings |
| `video.html` | The animation; open it in a browser to preview (no audio) |
| `audio.py` | Background music, plus the voice-over with the music ducked under it |
| `build.sh` | Builds the MP4 and SRT end to end (~5 min) |

To change the wording, edit `script.py` and run `./build.sh`. Scene timings follow the new narration automatically.
