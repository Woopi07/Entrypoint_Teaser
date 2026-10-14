"""Synthesizes the 30 s teaser soundtrack: study-fi music bed + UI SFX.

Every cue time below matches an animation beat in teaser.html.
Usage: python3 audio.py out.wav [vo_cues.json]
The voice-over (from voiceover.py) is mixed on top and the music ducks under it.
"""
import sys
import wave

import numpy as np

SR = 44100
DUR = 30.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
mix = np.zeros((N, 2))


def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    mix[i:i + len(sig), 0] += sig * ((1 - pan) / 2) ** .5
    mix[i:i + len(sig), 1] += sig * ((1 + pan) / 2) ** .5


def env(n, a=.005, d=.3):
    tt = np.arange(n) / SR
    return np.minimum(1, tt / a) * np.exp(-tt / d)


def layer(*sigs):
    out = np.zeros(max(len(x) for x in sigs))
    for x in sigs:
        out[:len(x)] += x
    return out


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def epiano(m, dur, vel=1.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = hz(m)
    s = np.sin(2 * np.pi * f * tt + .6 * np.sin(2 * np.pi * f * tt) * np.exp(-tt / .4))
    s += .25 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt / .25)
    s *= np.sin(2 * np.pi * 4.5 * tt) * .08 + 1  # tremolo
    return s * env(n, .01, dur * .55) * vel


def bell(m, dur=1.2, vel=1.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = hz(m)
    s = np.sin(2 * np.pi * f * tt) + .5 * np.sin(2 * np.pi * 2.76 * f * tt) * np.exp(-tt / .15) + .3 * np.sin(2 * np.pi * 5.4 * f * tt) * np.exp(-tt / .06)
    return s * env(n, .002, dur * .35) * vel


def kick(vel=1.0):
    n = int(.35 * SR)
    tt = np.arange(n) / SR
    f = 50 + 90 * np.exp(-tt / .04)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .002, .12) * vel


def noise(dur, decay, hp=True):
    n = int(dur * SR)
    s = rng.standard_normal(n)
    if hp:
        s = np.diff(s, prepend=0)
    return s * env(n, .001, decay)


def snare(vel=1.0):
    n = int(.25 * SR)
    tt = np.arange(n) / SR
    return (noise(.25, .06) * .6 + np.sin(2 * np.pi * 190 * tt) * env(n, .001, .05)) * vel


def hat(vel=1.0):
    return noise(.06, .015) * .35 * vel


def click(vel=1.0):
    n = int(.03 * SR)
    tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * 2400 * tt) * .6 + noise(.03, .004)) * env(n, .0005, .006) * vel


def whoosh(dur=.45, up=True):
    n = int(dur * SR)
    s = noise(dur, 10, hp=False)
    # crude moving low-pass via cumulative smoothing with sweeping coefficient
    out = np.zeros(n)
    a = np.linspace(.02, .35, n) if up else np.linspace(.35, .02, n)
    y = 0.0
    for i in range(n):
        y += a[i] * (s[i] - y)
        out[i] = y
    shape = np.sin(np.pi * np.arange(n) / n) ** 2
    return out * shape * 2.2


def riser(dur):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = 200 + 1400 * (tt / dur) ** 2
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * .25 + noise(dur, 100) * .25
    return s * (tt / dur) ** 2


# ------------------------------------------------------------- music bed
BPM = 96
BEAT = 60 / BPM
BAR = 4 * BEAT
# Fmaj7 · Em7 · Dm7 · Cmaj7 (lo-fi ii-V-ish cycle in C)
CHORDS = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]
BASS = [41, 40, 38, 36]
MELODY = [(0, 72), (1.5, 74), (2, 76), (3, 79), (4, 76), (5.5, 74), (6, 72), (7, 71),
          (8, 69), (9.5, 72), (10, 74), (11, 76), (12, 79), (13, 81), (14, 79), (15, 76)]

STORY, CLIMAX, OUTRO = 19.1, 24.1, 26.5

t = 0.0
bar = 0
while t < CLIMAX:
    ch = CHORDS[bar % 4]
    pad_gain = .10 if t < 2.2 else .16
    for k, m in enumerate(ch):
        add(epiano(m, BAR * .95, .9), t + k * .012, pad_gain, (k - 1.5) * .25)
    if t >= 2.2:
        add(epiano(BASS[bar % 4], BAR * .9), t, .2)
    bar += 1
    t += BAR

# melody once the title lands; doubles up in the story build
for rep in range(3):
    base = 2.5 + rep * 4 * BAR
    for beat, m in MELODY:
        tt = base + beat * BEAT
        if 2.5 <= tt < CLIMAX - .4:
            add(bell(m, .9), tt, .10 if tt < STORY else .14, .2)
            if tt >= STORY:
                add(bell(m + 12, .6), tt + BEAT / 2, .05, -.3)

# drums: enter at the title, intensify through the story
beat_t = 2.5
i = 0
while beat_t < CLIMAX:
    intense = beat_t >= STORY
    if i % 4 in (0, 2) or (intense and i % 4 == 3 and beat_t > CLIMAX - 2.5):
        add(kick(), beat_t, .55)
    if i % 4 in (1, 3):
        add(snare(), beat_t, .22 if not intense else .3)
    subs = 4 if intense else 2
    for s in range(subs):
        add(hat(), beat_t + s * BEAT / subs, .5 if s % 2 == 0 else .3, .35)
    beat_t += BEAT
    i += 1

add(riser(2.4), CLIMAX - 2.4, .45)

# level complete: triumphant resolve in C major + fanfare
for k, m in enumerate([48, 55, 60, 64, 67]):
    add(epiano(m, 3.0, 1), CLIMAX + k * .01, .2, (k - 2) * .2)
for k, m in enumerate([72, 76, 79, 84, 88]):
    add(bell(m, 1.4), CLIMAX + k * .09, .22, (k - 2) * .15)
add(noise(2.5, .8), CLIMAX, .12)               # crash
add(kick(1.2), CLIMAX, .7)

# outro (poster): gentle chords, then fade
t = OUTRO
for ch in ([48, 52, 55, 59, 62], [53, 57, 60, 64]):
    for k, m in enumerate(ch):
        add(epiano(m, 2.4), t + k * .015, .15, (k - 2) * .2)
    t += 1.8
for k, m in enumerate([79, 84, 88, 91]):  # logo sparkle
    add(bell(m, 1.6), 27.6 + k * .07, .14, (k - 1.5) * .3)

# ------------------------------------------------------------- SFX
add(whoosh(.5, up=False), 2.0, .3)          # campus -> title
for tw in (4.6, 7.6, 13.9, 16.5, 17.6):     # cuts between app screens
    add(whoosh(.4), tw - .25, .32)
add(whoosh(.6), STORY - .35, .45)           # into the story
add(whoosh(.3), 21.6 - .18, .3)             # Faraday -> Farahnaz

for tc in (6.85, 10.15, 10.8, 17.15):       # case card, option B, Submit, concept card
    add(click(), tc, .65, .1)
add(bell(88, .35), 6.9, .12)                # case opens

# achievement chime on the correct answer
for k, m in enumerate([76, 83, 88]):
    add(bell(m, 1.2), 10.9 + k * .07, .3)
# progress bars filling
for k in range(8):
    add(bell(79 + k * 2, .2), 15.0 + k * .09, .08)

# S-rank stamp + coin count-up
add(layer(kick(1.3), noise(.3, .06) * .6), 24.6, .6)
for k in range(3):
    add(bell(84 + k * 4, .5), 25.0 + k * .2, .16)
for k in range(8):
    add(bell(96 + (k % 2) * 3, .12), 25.6 + k * .09, .1)

# ------------------------------------------------------------- master
tt = np.arange(N) / SR
fade = np.clip((30 - tt) / 1.6, 0, 1) * np.clip(tt / .3, 0, 1)
mix *= fade[:, None]
mix /= np.max(np.abs(mix))

# voice-over on top; the music ducks about 9 dB under each line
if len(sys.argv) > 2:
    import json
    import soundfile as sf
    with open(sys.argv[2]) as f:
        cues = json.load(f)
    vo = np.zeros(N)
    duck = np.ones(N)
    for c in cues:
        x, sr = sf.read(c['file'])
        if x.ndim > 1:
            x = x.mean(axis=1)
        if sr != SR:  # Kokoro renders at 24 kHz
            x = np.interp(np.arange(int(len(x) * SR / sr)) * sr / SR, np.arange(len(x)), x)
        i = int(c['start'] * SR)
        x = x[: N - i]
        vo[i:i + len(x)] += x / (np.max(np.abs(x)) + 1e-9) * .9
        a, b = max(0, i - int(.15 * SR)), min(N, i + len(x) + int(.25 * SR))
        duck[a:b] = .35
    # smooth the ducking envelope (~120 ms)
    k = int(.12 * SR)
    duck = np.convolve(duck, np.ones(k) / k, mode='same')
    mix = mix * duck[:, None] * .75 + vo[:, None] * .95

peak = np.max(np.abs(mix))
mix = np.tanh(mix / peak * 1.2) * .9  # gentle saturation / limiting

out = sys.argv[1] if len(sys.argv) > 1 else 'teaser.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wrote', out)
