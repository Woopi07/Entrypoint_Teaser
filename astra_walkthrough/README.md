# ASTRA — 1-minute system walkthrough

`out/astra_walkthrough.mp4` (1920×1080, 60 s) walks through https://astrawebsite-nu.vercel.app/ using real
captures of the live site (`assets/`): what ASTRA is, XP and flip cards, the warm-up games, Debit or Credit
Rush, the Bayanihan Bakeshop case study, side quests, the student resource hub, the educators' teaching plan,
the PLV policy roadmap, badges and settings. Voice-over (Kokoro TTS), burned-in word-by-word captions
(`out/astra_walkthrough.srt` for platforms with their own CC), an upbeat synthesized soundtrack and sound effects.

| File | What |
|---|---|
| `script.py` | Narration, one line per caption |
| `build_timeline.py` | Voices each line and lays out scene timings (video pinned to 60 s) |
| `video.html` | The animation; scenes, camera moves, clicks and pop-ups are defined in `SCENES` |
| `audio.py` | Music, sound effects synced to the on-screen events, voice-over with ducking |
| `build.sh` | Builds the MP4 and SRT end to end |
