"""Background music + voice-over mix for the research explainer.

Calm, academic piano bed (no drums until a light pulse in Methods), with
soft transition swells at scene changes. The music ducks under the narration.

Usage: python3 audio.py <timeline.json> <out.wav>
"""
import json
import sys
import wave

import numpy as np
import soundfile as sf

SR = 44100
tl = json.load(open(sys.argv[1]))
DUR = tl['total']
N = int(SR * DUR)
rng = np.random.default_rng(3)
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


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def piano(m, dur, vel=1.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = hz(m)
    s = (np.sin(2 * np.pi * f * tt) + .35 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt / .5)
         + .12 * np.sin(2 * np.pi * 3 * f * tt) * np.exp(-tt / .25))
    return s * env(n, .006, dur * .5) * vel


def pad(m, dur):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = hz(m)
    s = sum(np.sin(2 * np.pi * f * d * tt) for d in (1, 1.003, .997)) / 3
    a = np.minimum(1, tt / 1.2) * np.minimum(1, (dur - tt) / 1.2)
    return s * a


def noise(dur, decay):
    n = int(dur * SR)
    return np.diff(rng.standard_normal(n), prepend=0) * env(n, .001, decay)


def swell(dur=1.0):
    n = int(dur * SR)
    s = rng.standard_normal(n)
    out = np.zeros(n)
    y = 0.0
    a = np.linspace(.01, .12, n)
    for i in range(n):
        y += a[i] * (s[i] - y)
        out[i] = y
    return out * np.sin(np.pi * np.arange(n) / n) ** 2 * 3


def kick():
    n = int(.3 * SR)
    tt = np.arange(n) / SR
    f = 48 + 70 * np.exp(-tt / .04)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .002, .1)


# ---------------------------------------------------------------- music
BPM = 84
BEAT = 60 / BPM
BAR = 4 * BEAT
# Cmaj9 · Am7 · Fmaj7 · G6 — hopeful, unhurried
CHORDS = [[48, 55, 59, 62, 64], [45, 52, 55, 60, 64], [41, 48, 52, 57, 60], [43, 50, 55, 59, 64]]
scenes = {s['id']: s for s in tl['scenes']}
meth_a, meth_b = scenes['design']['start'], scenes['ethics']['end']

t, bar = 0.0, 0
while t < DUR:
    ch = CHORDS[bar % 4]
    for k, m in enumerate(ch[1:]):
        add(pad(m, BAR + .6), t, .035, (k - 1.5) * .3)
    add(pad(ch[0] - 12, BAR + .6), t, .05)
    # broken-chord piano: eighth notes, a little sparser in the intro
    pattern = [0, 2, 3, 4, 3, 2, 3, 4] if t > 8 else [0, None, 3, None, 4, None, 3, None]
    for e, idx in enumerate(pattern):
        if idx is None:
            continue
        add(piano(ch[idx] + 12, 1.4, .9 if e % 2 == 0 else .7), t + e * BEAT / 2, .05, .15)
    if meth_a <= t < meth_b:  # light pulse through the methods section
        for b in range(4):
            add(kick(), t + b * BEAT, .1)
            add(noise(.05, .012), t + b * BEAT + BEAT / 2, .05, .3)
    bar += 1
    t += BAR

# soft swells into each scene; a resolving chord on the outro
for s in tl['scenes'][1:]:
    add(swell(.9), s['start'] - .6, .045)
o = scenes['outro']['start']
for k, m in enumerate([48, 55, 60, 64, 67, 72]):
    add(piano(m, 4.5, 1), o + k * .06, .06, (k - 2.5) * .2)

fade = np.clip((DUR - np.arange(N) / SR) / 2.5, 0, 1) * np.clip(np.arange(N) / SR / .8, 0, 1)
mix *= fade[:, None]
mix /= np.max(np.abs(mix))

# ---------------------------------------------------------------- voice-over + ducking
vo = np.zeros(N)
duck = np.ones(N)
for ln in tl['lines']:
    x, sr = sf.read(ln['file'])
    if x.ndim > 1:
        x = x.mean(axis=1)
    if sr != SR:
        x = np.interp(np.arange(int(len(x) * SR / sr)) * sr / SR, np.arange(len(x)), x)
    i = int(ln['start'] * SR)
    x = x[: N - i]
    vo[i:i + len(x)] += x / (np.max(np.abs(x)) + 1e-9) * .9
    duck[max(0, i - int(.2 * SR)): min(N, i + len(x) + int(.3 * SR))] = .3
k = int(.15 * SR)
duck = np.convolve(duck, np.ones(k) / k, mode='same')
mix = mix * duck[:, None] * .6 + vo[:, None]
mix = np.tanh(mix / np.max(np.abs(mix)) * 1.15) * .9

with wave.open(sys.argv[2], 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wrote', sys.argv[2], f'{DUR:.1f}s')
