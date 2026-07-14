"""Ambient spa BGM — synthesized locally (no network providers reachable).

Layers: slow-attack sine-partial pads over a 4-chord progression, a sparse
pentatonic pluck melody, warm sub roots, and low-passed breathing noise,
finished with feedback-delay ambience. Seeded → deterministic output.
"""
import numpy as np

SR = 48000
DUR = 34.0
rng = np.random.default_rng(7)

t_full = np.arange(int(DUR * SR)) / SR
out = np.zeros((len(t_full), 2))

# --- chord pads -------------------------------------------------------------
# Fmaj7 - Am9 - Cmaj9 - Gsus2 (rooted low, airy voicings)
chords = [
    [87.31, 130.81, 174.61, 220.00, 261.63],   # F2 C3 F3 A3 C4
    [110.00, 164.81, 220.00, 246.94, 329.63],  # A2 E3 A3 B3 E4
    [130.81, 196.00, 246.94, 293.66, 392.00],  # C3 G3 B3 D4 G4
    [98.00, 146.83, 196.00, 220.00, 293.66],   # G2 D3 G3 A3 D4
]
seg = DUR / len(chords)
xfade = 5.0

for i, chord in enumerate(chords):
    start, end = i * seg, (i + 1) * seg
    a0 = max(0.0, start - xfade / 2)
    a1 = min(DUR, end + xfade / 2)
    idx = (t_full >= a0) & (t_full < a1)
    t = t_full[idx]
    # smooth raised-cosine envelope across the segment
    env = np.ones_like(t)
    rise = (t - a0) / xfade
    fall = (a1 - t) / xfade
    env = np.minimum(1.0, np.minimum(np.clip(rise, 0, 1), np.clip(fall, 0, 1)))
    env = 0.5 - 0.5 * np.cos(np.pi * np.clip(env, 0, 1))
    pad = np.zeros_like(t)
    for f in chord:
        ph = rng.uniform(0, 2 * np.pi)
        vib = 1.0 + 0.0012 * np.sin(2 * np.pi * 0.11 * t + ph)
        pad += 1.00 * np.sin(2 * np.pi * f * vib * t + ph)
        pad += 0.22 * np.sin(2 * np.pi * 2 * f * t + ph * 1.7)
        pad += 0.07 * np.sin(2 * np.pi * 3 * f * t + ph * 0.6)
    pad /= len(chord) * 1.3
    breathe = 0.85 + 0.15 * np.sin(2 * np.pi * 0.06 * t + i)
    l = pad * env * breathe * (0.95 + 0.05 * np.sin(2 * np.pi * 0.05 * t))
    r = pad * env * breathe * (0.95 + 0.05 * np.cos(2 * np.pi * 0.045 * t))
    out[idx, 0] += 0.30 * l
    out[idx, 1] += 0.30 * r
    # sub root, one octave down
    sub = np.sin(2 * np.pi * chord[0] / 2 * t) * env * 0.10
    out[idx, 0] += sub
    out[idx, 1] += sub

# --- sparse pluck melody (A-minor pentatonic, kalimba-like) ------------------
penta = [440.0, 523.25, 587.33, 659.26, 783.99, 880.0]
times = np.arange(3.5, DUR - 6, 1.0)
times = times[rng.random(len(times)) < 0.2]  # sparse, irregular
for tt in times:
    f = penta[rng.integers(len(penta))]
    n = int(3.2 * SR)
    i0 = int(tt * SR)
    if i0 + n > len(t_full):
        n = len(t_full) - i0
    tl = np.arange(n) / SR
    tone = (np.sin(2 * np.pi * f * tl) + 0.35 * np.sin(2 * np.pi * 2 * f * tl)
            + 0.12 * np.sin(2 * np.pi * 3.01 * f * tl))
    envp = np.exp(-tl / 0.9) * (1 - np.exp(-tl / 0.008))
    pan = rng.uniform(0.35, 0.65)
    out[i0:i0 + n, 0] += 0.06 * tone * envp * (1 - pan)
    out[i0:i0 + n, 1] += 0.06 * tone * envp * pan

# --- breathing air (low-passed noise swells) ---------------------------------
noise = rng.standard_normal(len(t_full))
# one-pole low-pass ~500 Hz
alpha = 1 - np.exp(-2 * np.pi * 500 / SR)
lp = np.zeros_like(noise)
acc = 0.0
for i in range(len(noise)):
    acc += alpha * (noise[i] - acc)
    lp[i] = acc
swell = 0.5 - 0.5 * np.cos(2 * np.pi * 0.045 * t_full)
air = lp * swell * 0.02
out[:, 0] += air
out[:, 1] += np.roll(air, int(0.013 * SR))

# --- simple feedback-delay ambience ------------------------------------------
for d, g in [(0.211, 0.30), (0.337, 0.22), (0.523, 0.16)]:
    n = int(d * SR)
    out[n:, 0] += g * out[:-n, 0]
    out[n:, 1] += g * out[:-n, 1] * 0.9

# --- master envelope: fade-in 2.5s, fade-out last 5s -------------------------
master = np.ones(len(t_full))
fi = int(2.5 * SR)
master[:fi] = np.linspace(0, 1, fi) ** 2
fo = int(2.5 * SR)
master[-fo:] = np.linspace(1, 0, fo) ** 1.5
out *= master[:, None]

out /= np.max(np.abs(out)) * 1.15  # headroom
pcm = (out * 32767).astype(np.int16)

import wave
with wave.open("bgm_raw.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("ok", DUR, "s")
