"""Upbeat music + SFX + voice-over mix for the 1-minute ASTRA walkthrough.

Usage: CLICKS=events.json python3 audio.py <timeline.json> <out.wav>
events.json comes from render.mjs (EVENTS_OUT): {"clicks": [...], "pops": [...]} in seconds.
"""
import json
import os
import sys
import wave

import numpy as np
import soundfile as sf

SR = 44100
tl = json.load(open(sys.argv[1]))
DUR = tl['total']
N = int(SR * DUR)
rng = np.random.default_rng(9)
mix = np.zeros((N, 2))
sfx = np.zeros((N, 2))


def add(sig, t, gain=1.0, pan=0.0, bus=None):
    bus = mix if bus is None else bus
    i = int(t * SR)
    if i >= N or i < 0:
        return
    sig = sig[: N - i] * gain
    bus[i:i + len(sig), 0] += sig * ((1 - pan) / 2) ** .5
    bus[i:i + len(sig), 1] += sig * ((1 + pan) / 2) ** .5


def env(n, a=.005, d=.3):
    tt = np.arange(n) / SR
    return np.minimum(1, tt / a) * np.exp(-tt / d)


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def pluck(m, dur=.35, bright=1.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = hz(m)
    s = np.sign(np.sin(2 * np.pi * f * tt)) * .35 + np.sin(2 * np.pi * f * tt) * .65
    s += bright * .3 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt / .05)
    return s * env(n, .002, dur * .35)


def pad(m, dur):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * hz(m) * d * tt) for d in (1, 1.004, .996)) / 3
    return s * np.minimum(1, tt / .3) * np.minimum(1, (dur - tt) / .3)


def bass(m, dur):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * hz(m) * tt) + .3 * np.sin(4 * np.pi * hz(m) * tt)) * env(n, .005, dur * .6)


def kick():
    n = int(.3 * SR)
    tt = np.arange(n) / SR
    f = 50 + 110 * np.exp(-tt / .03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .11)


def noise(dur, decay):
    n = int(dur * SR)
    return np.diff(rng.standard_normal(n), prepend=0) * env(n, .001, decay)


def clap():
    return sum(np.pad(noise(.2, .05), (int(k * SR), 0))[: int(.2 * SR)] for k in (0, .008, .016)) * .5


def bell(m, dur=.8):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = hz(m)
    return (np.sin(2 * np.pi * f * tt) + .4 * np.sin(2 * np.pi * 2.76 * f * tt) * np.exp(-tt / .1)) * env(n, .002, dur * .3)


def whoosh(dur=.5):
    n = int(dur * SR)
    s = rng.standard_normal(n)
    out = np.zeros(n)
    y = 0.0
    a = np.linspace(.02, .4, n)
    for i in range(n):
        y += a[i] * (s[i] - y)
        out[i] = y
    return out * np.sin(np.pi * np.arange(n) / n) ** 2 * 2


def click():
    n = int(.03 * SR)
    tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * 2200 * tt) * .6 + noise(.03, .004)) * env(n, .0005, .007)


# ---------------------------------------------------------------- music: bright 120 BPM pop groove
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
PROG = [(48, [60, 64, 67, 72]), (43, [59, 62, 67, 71]), (45, [60, 64, 69, 72]), (41, [60, 65, 69, 72])]  # C G Am F
intro_end = tl['scenes'][1]['start']
outro = [s for s in tl['scenes'] if s['id'] == 'outro'][0]['start']
t, bar = 0.0, 0
while t < DUR:
    root, ch = PROG[bar % 4]
    full = t >= intro_end - .05
    for k, m in enumerate(ch[:3]):
        add(pad(m, BAR), t, .035, (k - 1) * .4)
    for e in range(8):  # eighth-note arpeggio
        add(pluck(ch[[0, 2, 1, 3, 2, 1, 3, 2][e]] + 12, .3), t + e * BEAT / 2, .07 if full else .045, .25 if e % 2 else -.25)
    if full:
        for b in range(4):
            add(kick(), t + b * BEAT, .5)
            add(noise(.05, .012), t + b * BEAT + BEAT / 2, .12, .3)
            add(bass(root - 12, BEAT * .9), t + b * BEAT, .22)
        add(clap(), t + BEAT, .22)
        add(clap(), t + 3 * BEAT, .22)
    bar += 1
    t += BAR

# ---------------------------------------------------------------- SFX
add(noise(1.2, .5), intro_end, .1)                       # crash as the beat drops
for s in tl['scenes'][1:]:
    add(whoosh(.45), s['start'] - .3, .22, bus=sfx)
ev = json.load(open(os.environ['CLICKS'])) if os.environ.get('CLICKS') and os.path.exists(os.environ['CLICKS']) else {}
for tc in ev.get('clicks', []):
    add(click(), tc, .8, .1, bus=sfx)
for tp in ev.get('pops', []):  # reward chime
    for k, m in enumerate([79, 84, 88]):
        add(bell(m, .6), tp + k * .06, .12, bus=sfx)
def thud():  # impact for the intro words
    n = int(.4 * SR)
    tt = np.arange(n) / SR
    f = 45 + 160 * np.exp(-tt / .025)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .16) + noise(.4, .03) * .5


def popper():  # party popper: pop + sparkly crackle
    out = noise(.08, .015) * 1.5
    out = np.pad(out, (0, int(.9 * SR)))
    for _ in range(26):
        j = int(rng.uniform(.05, .85) * SR)
        c = noise(.02, .003) * rng.uniform(.3, .8)
        out[j:j + len(c)] += c
    return out


def tick():  # shutter tick on a screen change
    n = int(.06 * SR)
    tt = np.arange(n) / SR
    return (noise(.06, .006) * .7 + np.sin(2 * np.pi * 1300 * tt) * env(n, .0005, .01) * .5)


def coin():  # two-note coin for +XP
    a, b = bell(83, .12), bell(88, .5)
    out = np.zeros(int(.6 * SR)); out[:len(a)] += a; j = int(.08 * SR); out[j:j + len(b)] += b[:len(out) - j]
    return out


def swoosh_up(dur=.7):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = 300 + 1500 * (tt / dur) ** 2
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * .3 + whoosh(dur) * .7) * np.sin(np.pi * tt / dur)


for tw in ev.get('words', []):
    add(thud(), tw, .9, bus=sfx)
add(swoosh_up(.7), 0.05, .5, bus=sfx)          # logo spins in
for tc in ev.get('confs', []):
    add(popper(), tc, .8, bus=sfx)
for ts in ev.get('swaps', []):
    add(tick(), ts, .6, -.1, bus=sfx)
for tx in ev.get('xp', []):
    add(coin(), tx, .5, .2, bus=sfx)
for k, m in enumerate([72, 76, 79, 84, 88]):  # outro fanfare
    add(bell(m, 1.2), outro + .1 + k * .08, .16, (k - 2) * .2, bus=sfx)

tt = np.arange(N) / SR
mix *= (np.clip((DUR - tt) / 1.5, 0, 1) * np.clip(tt / .2, 0, 1))[:, None]
mix /= np.max(np.abs(mix))
sfx /= max(np.max(np.abs(sfx)), 1e-9)

# ---------------------------------------------------------------- voice-over, music ducks under it
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
    duck[max(0, i - int(.15 * SR)): min(N, i + len(x) + int(.2 * SR))] = .4
k = int(.12 * SR)
duck = np.convolve(duck, np.ones(k) / k, mode='same')
out = mix * duck[:, None] * .5 + sfx * .5 + vo[:, None]
out = np.tanh(out / np.max(np.abs(out)) * 1.15) * .9

with wave.open(sys.argv[2], 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((out * 32767).astype('<i2').tobytes())
print('wrote', sys.argv[2], f'{DUR:.1f}s')
