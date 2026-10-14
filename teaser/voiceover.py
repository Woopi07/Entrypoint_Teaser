"""Generates the teaser voice-over with Kokoro (open-weight neural TTS).

Each line has a start time that matches a beat in teaser.html. The script
writes one WAV per line plus vo_cues.json (start/end of every line) that
audio.py uses to mix and to duck the music under the voice.

Usage: python3 voiceover.py <outDir> [modelDir=/opt/tts]
Model files (from github.com/thewh1teagle/kokoro-onnx releases):
  kokoro-v1.0.int8.onnx, voices-v1.0.bin
"""
import json
import os
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

NARRATOR = 'af_heart'
VOICES = {'narrator': NARRATOR, 'nayeom': 'af_nicole', 'faraday': 'am_puck', 'farahnaz': 'bf_emma'}

# (start seconds, speaker, text, speed)
LINES = [
    (0.45, 'narrator', 'Every transaction tells a story.', 1.0),
    (2.55, 'narrator', 'Will you make the right entry?', 1.0),
    (4.7, 'narrator', 'Open a case file. Step inside a real business.', 1.08),
    (7.75, 'nayeom', 'We hired a new cashier. Do we record that?', 1.12),
    (11.4, 'narrator', 'Answer, and get instant feedback.', 1.08),
    (14.15, 'narrator', 'Track your progress, topic by topic,', 1.08),
    (16.55, 'narrator', 'and review the concept notes anytime.', 1.08),
    (19.35, 'faraday', 'Accounting is basically one big puzzle game!', 1.12),
    (21.75, 'farahnaz', 'Prove it. Every peso must balance.', 1.08),
    (24.3, 'narrator', "Zero mistakes? That's an S rank.", 1.08),
    (26.75, 'narrator', 'B S Aid. Play now, on Entry Point.', 1.0),
]


def trim(x, sr, thresh=.01):
    idx = np.where(np.abs(x) > thresh)[0]
    if not len(idx):
        return x
    a = max(0, idx[0] - int(.02 * sr))
    b = min(len(x), idx[-1] + int(.08 * sr))
    return x[a:b]


def main():
    out = sys.argv[1]
    model_dir = sys.argv[2] if len(sys.argv) > 2 else '/opt/tts'
    os.makedirs(out, exist_ok=True)
    k = Kokoro(os.path.join(model_dir, 'kokoro-v1.0.int8.onnx'), os.path.join(model_dir, 'voices-v1.0.bin'))
    cues = []
    for i, (start, who, text, speed) in enumerate(LINES):
        lang = 'en-gb' if VOICES[who].startswith('b') else 'en-us'
        samples, sr = k.create(text, voice=VOICES[who], speed=speed, lang=lang)
        samples = trim(samples, sr)
        path = os.path.join(out, f'vo_{i:02d}.wav')
        sf.write(path, samples, sr)
        end = start + len(samples) / sr
        cues.append({'file': path, 'start': start, 'end': round(end, 3), 'speaker': who, 'text': text, 'sr': sr})
        nxt = LINES[i + 1][0] if i + 1 < len(LINES) else 29.6
        flag = '  <-- OVERLAPS next cue' if end > nxt - .1 else ''
        print(f'{start:5.2f}-{end:5.2f}  {who:9s} {text}{flag}')
    with open(os.path.join(out, 'vo_cues.json'), 'w') as f:
        json.dump(cues, f, indent=1)


if __name__ == '__main__':
    main()
