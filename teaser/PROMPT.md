# BSAid — 30-Second Teaser · Director's Shot List (v2: real Entry Point screens + voice-over)

Paste this into any video editor brief or AI video generator. Timings match the rendered cuts in `out/`.

**Format:** 30 s · 30 fps · 16:9 (1920×1080) and 9:16 (1080×1920). Captions are burned in for sound-off viewing. In the vertical cut the camera pans across each screenshot instead of shrinking it.
**Look:** clean, academic and fun. Navy `#1B2A5C` + gold `#F5B82E`, Inter / Inter Display. App footage is the real **Entry Point** web app (screenshots in `teaser/assets/`), shown with slow camera moves, a gold highlight ring on whatever is being clicked, and a tag in the top-right naming the feature.
**Voice cast (Kokoro neural TTS):** Narrator: warm, upbeat female (`af_heart`). Nayeom: friendly shop owner (`af_nicole`). Faraday: bright, quirky male (`am_puck`). Farahnaz: crisp, stern (`bf_emma`). Music ducks about 9 dB under every line.

---

| Time | Visual | Voice-over / dialogue | Music & SFX |
|---|---|---|---|
| 0:00–2.3 | PLV campus, flag waving, students walking, slow push-in. Super: *PAMANTASAN NG LUNGSOD NG VALENZUELA, First day · BS Accountancy*. | **Narrator:** "Every transaction tells a story." | Soft lo-fi chords (Fmaj7–Em7–Dm7–Cmaj7, 96 BPM). |
| 2.3–4.6 | Navy title card: the **BSAid** logo pops in, the logline types out, then *NOW PLAYABLE ON · ENTRY POINT* and the genre chips. | **Narrator:** "Will you make the right entry?" | Whoosh, then drums and bass enter. |
| 4.6–7.6 | **Case Files** screen. Camera glides across the storefront cards (Nayeom's Groceria, Alahas ni Lukas, Surume's Coffee Shop, SwiftGo…). The cursor clicks **Nayeom's Groceria** and it gets a gold ring. Tag: CASE FILES. | **Narrator:** "Open a case file. Step inside a real business." | Click plus a small bell. |
| 7.6–10.9 | **Transaction Analysis, Level 1.** Push in on Nayeom's dialogue. The cursor hovers, then selects **B: Don't record it yet**, then clicks **Submit**. | **Nayeom:** "We hired a new cashier. Do we record that?" | Two UI clicks. |
| 10.9–13.9 | Option B turns green with a **✓ Correct** badge. The **Insight** card reveals *"Hiring a cashier isn't a transaction yet: no money or resources changed hands, so there's nothing to record."* A **+10 pts · Streak ×1** toast pops up. Tag: INSTANT FEEDBACK. | **Narrator:** "Answer, and get instant feedback." | **Achievement chime.** |
| 13.9–16.5 | **Overview Status:** stat cards, then a tilt down to *Performance by Topic*. The topic bars fill up in sequence (illustrative values). | **Narrator:** "Track your progress, topic by topic," | Rising bell ticks as the bars fill. |
| 16.5–19.1 | **Concepts:** the cursor clicks *Accounting Fundamentals*, then cut to the **Case Notes** PDF (*Part 1: Basic Accounting Concepts*) with a slow drift down the page. | **Narrator:** "and review the concept notes anytime." | Whooshes on the cuts. |
| 19.1–21.6 | Visual-novel classroom. **Faraday** bounces in, caption *The quirky natural genius*, and his line types out in sync with the voice. Farahnaz is a silhouette behind him. | **Faraday:** "Accounting is basically one big puzzle game!" | Hats double, the melody goes up an octave. |
| 21.6–24.1 | Hard cut to **Farahnaz**, caption *The strict CPA topnotcher*, cooler color grade. | **Farahnaz:** "Prove it. Every peso must balance." | Riser. |
| 24.1–26.6 | White flash into **LEVEL COMPLETE!** The gold **S** badge stamps down, three stars fill, chips read *Mistakes 0 · Rank S · +100 Points*, confetti. | **Narrator:** "Zero mistakes? That's an S rank." | **Level-up fanfare**, stamp, coin ticks. |
| 26.6–30 | **Poster:** the BSAid logo, real storefront art tiles from the four case files, the logline, **▶ PLAY NOW ON ENTRY POINT**, then **https://entry-point-sigma.vercel.app/**. Fade to black. | **Narrator:** "BSAid. Play now, on Entry Point." | Gentle chords, a sparkle, fade out. |

### Notes for the editor
- **Rank table (from the GDD):** S = 0 mistakes = 100 pts · A = 1–2 = 80 · B = 3–5 = 60 · C = 5–7 = 40 · D = 7+ = 20.
- **Overlays on real screens:** the option highlight, "✓ Correct", the Insight text, the "+10 pts" toast and the filled progress bars are animated overlays on static screenshots. They show the intended behavior, not a screen recording. Swap in real captures when you have them.
- **Placeholders:** Faraday and Farahnaz are original placeholder art. The voices are synthetic TTS; a human VO can be dropped in using the same line timings (`teaser/voiceover.py`).
