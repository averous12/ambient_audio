#!/usr/bin/env python3
"""
Verify the encodes against their sources.

The meaningful metric for ambience is LEVEL and SPECTRAL SHAPE, not sample-by-sample
SNR: these clips are stochastic, and two noise realisations differ sample-for-sample
even through a perfectly transparent codec (a correct encode of rain reports ~11 dB
"SNR" for exactly that reason). So this checks:

  1. level drift (dB)   -> how the encoded channel balances against the others
  2. spectral deviation -> energy-weighted mean |dB| difference across bands,
                           so near-silent top octaves cannot dominate the score

Usage: python verify-encodes.py [opus|mp3|all]
"""
import glob
import os
import re
import subprocess
import sys

import numpy as np

FF = os.path.join(
    os.environ.get("LOCALAPPDATA", ""),
    "hermes", "tools", "ffmpeg-9.0.1-win32-x64", "bin", "ffmpeg.exe",
)
SR = 48000
N = 1 << 14

# Must match encode-audio.py: the DC/subsonic strip applied before encoding.
CLEAN_AF = "highpass=f=20:poles=2,highpass=f=20:poles=2"


def decode(path):
    p = subprocess.run(
        [FF, "-hide_banner", "-loglevel", "error", "-y", "-i", path,
         "-ar", str(SR), "-f", "f32le", "-"],
        capture_output=True,
    )
    a = np.frombuffer(p.stdout, dtype="<f4")
    if a.size < 2 * (N // 2):
        return None            # too short for the analysis window
    return a[: (a.size // 2) * 2].reshape(-1, 2).astype(np.float64)


def mean_volume(path):
    p = subprocess.run(
        [FF, "-hide_banner", "-i", path, "-af", "volumedetect", "-f", "null", "-"],
        capture_output=True,
    )
    m = re.search(r"mean_volume:\s*(-?[\d.]+)", p.stderr.decode(errors="replace"))
    return float(m.group(1)) if m else None


def spectrum(x):
    m = x.mean(axis=1)
    win = np.hanning(N)
    acc = np.zeros(N // 2 + 1)
    c = 0
    for s in range(0, len(m) - N, N * 2):
        acc += np.abs(np.fft.rfft(m[s:s + N] * win)) ** 2
        c += 1
    return acc / max(c, 1), np.fft.rfftfreq(N, 1 / SR)


def spectral_error(a, b):
    A, f = spectrum(a)
    B, _ = spectrum(b)
    keep = f <= 16000
    A, B = A[keep], B[keep]
    A = A / A.sum()
    B = B / B.sum()
    Ad = 10 * np.log10(np.maximum(A, 1e-13))
    Bd = 10 * np.log10(np.maximum(B, 1e-13))
    floor = Ad.max() - 90
    Ad = np.maximum(Ad, floor)
    Bd = np.maximum(Bd, floor)
    err = np.abs(Ad - Bd)
    w = A / A.sum()
    return float((err * w).sum())


def main():
    modes = list(sys.argv[1:]) or ["opus", "mp3"]
    srcs = sorted(glob.glob("audio/*.wav")) + sorted(glob.glob("audio/*.mp3"))
    stems = sorted({os.path.splitext(os.path.basename(s))[0] for s in srcs})

    # The encoder strips DC/subsonic content before encoding (see encode-audio.py).
    # Comparing against the raw source would report that intentional removal as codec
    # error, so build a cleaned reference for each file and compare against that.
    os.makedirs("q", exist_ok=True)
    cleaned_refs = {}
    for stem in stems:
        src = next((p for p in (f"audio/{stem}.wav", f"audio/{stem}.mp3")
                    if os.path.exists(p)), None)
        if not src:
            continue
        ref = os.path.join("q", f"{stem}.ref.wav")
        subprocess.run(
            [FF, "-hide_banner", "-loglevel", "error", "-y", "-i", src,
             "-af", CLEAN_AF, ref],
            capture_output=True,
        )
        cleaned_refs[stem] = (src, ref)

    for mode in modes:
        outdir = f"audio-encoded/{mode}"
        if not os.path.isdir(outdir):
            print(f"skip {mode}: no {outdir}")
            continue
        print(f"\n=== {mode} ===")
        print(f"{'file':18} {'lvl drift':>10} {'spec err':>10} {'src MB':>8} {'enc MB':>8} {'ratio':>7}")
        print("-" * 68)
        drifts, errs = [], []
        worst = None
        for stem in stems:
            if stem not in cleaned_refs:
                continue
            src, ref = cleaned_refs[stem]
            enc = f"{outdir}/{stem}.{mode}"
            if not os.path.exists(enc):
                print(f"{stem:18} {'MISSING':>10}")
                continue
            sm, em = mean_volume(ref), mean_volume(enc)
            drift = (em - sm) if (sm is not None and em is not None) else float("nan")
            a, b = decode(ref), decode(enc)
            if a is None or b is None:
                se = float("nan")
            else:
                n = min(len(a), len(b))
                se = spectral_error(a[:n], b[:n])
            ratio = os.path.getsize(src) / os.path.getsize(enc)
            drifts.append(abs(drift))
            if not np.isnan(se):
                errs.append(se)
                if worst is None or se > worst[1]:
                    worst = (stem, se)
            print(f"{stem:18} {drift:+9.2f} {se:10.3f} "
                  f"{os.path.getsize(src)/1e6:8.2f} {os.path.getsize(enc)/1e6:8.2f} {ratio:6.1f}x")

        d = np.array([x for x in drifts if not np.isnan(x)])
        e = np.array([x for x in errs if not np.isnan(x)])
        print("-" * 68)
        if len(d):
            print(f"{'MEAN':18} {d.mean():+9.3f} {e.mean():10.3f}")
            print(f"{'MAX':18} {d.max():+9.3f} {e.max():10.3f}")
        if worst:
            print(f"worst spectral: {worst[0]} ({worst[1]:.3f} dB)")
        print("PASS thresholds: |level drift| < 1.0 dB, spectral error < 1.5 dB")


if __name__ == "__main__":
    main()
