"""Synthesizes the 30 s teaser soundtrack: study-fi music bed + UI SFX.

Every cue time below matches an animation beat in teaser.html.
Usage: python3 audio.py out.wav
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

t = 0.0
bar = 0
while t < 22.0:
    ch = CHORDS[bar % 4]
    pad_gain = .10 if t < 2.4 else .16
    for k, m in enumerate(ch):
        add(epiano(m, BAR * .95, .9), t + k * .012, pad_gain, (k - 1.5) * .25)
    if t >= 2.4:
        add(epiano(BASS[bar % 4], BAR * .9), t, .2)
    bar += 1
    t += BAR

# melody once the title lands; doubles up in the story build
for rep in range(3):
    base = 2.5 + rep * 4 * BAR
    for beat, m in MELODY:
        tt = base + beat * BEAT
        if 2.5 <= tt < 21.6:
            add(bell(m, .9), tt, .10 if tt < 15 else .14, .2)
            if tt >= 15:
                add(bell(m + 12, .6), tt + BEAT / 2, .05, -.3)

# drums: enter at the title, intensify 15-22
beat_t = 2.5
i = 0
while beat_t < 22.0:
    intense = beat_t >= 15
    if i % 4 in (0, 2) or (intense and i % 4 == 3 and beat_t > 19):
        add(kick(), beat_t, .55)
    if i % 4 in (1, 3):
        add(snare(), beat_t, .22 if not intense else .3)
    subs = 4 if intense else 2
    for s in range(subs):
        add(hat(), beat_t + s * BEAT / subs, .5 if s % 2 == 0 else .3, .35)
    beat_t += BEAT
    i += 1

add(riser(2.4), 19.6, .5)

# 22 s: triumphant resolve in C major + fanfare
for k, m in enumerate([48, 55, 60, 64, 67]):
    add(epiano(m, 4.0, 1), 22.0 + k * .01, .2, (k - 2) * .2)
for k, m in enumerate([72, 76, 79, 84, 88]):
    add(bell(m, 1.4), 22.0 + k * .09, .22, (k - 2) * .15)
add(noise(2.5, .8), 22.0, .12)               # crash
add(kick(1.2), 22.0, .7)

# outro groove (poster) — gentle, then fade
t = 25.8
for ch in ([48, 52, 55, 59, 62], [53, 57, 60, 64]):
    for k, m in enumerate(ch):
        add(epiano(m, 2.4), t + k * .015, .15, (k - 2) * .2)
    t += 2.2
for k, m in enumerate([79, 84, 88, 91]):  # final logo sparkle
    add(bell(m, 1.6), 27.1 + k * .07, .14, (k - 1.5) * .3)

# ------------------------------------------------------------- SFX
for tw in (5.0, 6.2, 11.6, 12.8):
    add(whoosh(.4), tw - .25, .35)
add(whoosh(.6), 14.75, .45)                 # into the story
add(whoosh(.5, up=False), 2.2, .3)          # campus -> title
for tw in (18.3, 20.6, 21.15, 21.6):        # hard cuts in the montage
    add(whoosh(.25), tw - .15, .25)

for tc in (7.95, 8.75, 9.05, 9.6, 9.78, 9.96, 10.14, 10.32, 10.95):
    add(click(), tc, .6, .1)
for tc in (5.45, 12.05):                    # case-file stamps
    add(layer(kick(.8), noise(.15, .03) * .5), tc, .45)

# achievement chime on the correct answer
for k, m in enumerate([76, 83, 88]):
    add(bell(m, 1.2), 11.05 + k * .07, .3)
# ledger pops
for k, tp in enumerate((13.1, 13.65, 14.2)):
    add(bell(84 + k * 2, .25), tp, .18)
add(bell(91, .6), 14.6, .2)

# S-rank stamp + coin count-up
add(layer(kick(1.3), noise(.3, .06) * .6), 22.6, .6)
for k in range(10):
    add(bell(96 + (k % 2) * 3, .12), 23.9 + k * .09, .1)
for k in range(3):
    add(bell(84 + k * 4, .5), 23.0 + k * .2, .16)

# ------------------------------------------------------------- master
tt = np.arange(N) / SR
fade = np.clip((30 - tt) / 1.6, 0, 1) * np.clip(tt / .3, 0, 1)
mix *= fade[:, None]
peak = np.max(np.abs(mix))
mix = np.tanh(mix / peak * 1.4) * .89  # gentle saturation / limiting

out = sys.argv[1] if len(sys.argv) > 1 else 'teaser.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wrote', out)
