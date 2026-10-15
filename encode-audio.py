#!/usr/bin/env python3
"""
Encode audio/ -> audio-encoded/ non-destructively.

Two outputs per source:
  opus  96k VBR  - best size/quality ratio, the default for the web player
  mp3   VBR q2   - universal fallback for older Safari

Originals in audio/ are never touched.

One caveat drives the extra logic here: the sources are not all clean. `wind_3.wav`
carries a -0.28 DC offset and 80% of its RMS is sub-20 Hz drift rather than audio,
which makes it read as the loudest channel on paper while sounding like nothing, and
makes libopus spend its bit budget encoding an inaudible ramp. The encoder therefore
strips DC and subsonic content before encoding, then measures the resulting level and
pre-amplifies only if the codec still shifted it.

Usage: python encode-audio.py [opus|mp3|all]
"""
import glob
import os
import re
import subprocess
import sys

FF = os.path.join(
    os.environ.get("LOCALAPPDATA", ""),
    "hermes", "tools", "ffmpeg-9.0.1-win32-x64", "bin", "ffmpeg.exe",
)

# Strip DC and anything below the audible band. Nothing musical lives under 20 Hz,
# and removing it stops a DC-offset source from wrecking the codec's gain decision.
# 80 Hz is used for the high-pass on the second pass for sources that still drift.
CLEAN_AF = "highpass=f=20:poles=2,highpass=f=20:poles=2"

CONFIGS = {
    "opus": {
        "dir": "audio-encoded/opus",
        "ext": "opus",
        "args": ["-c:a", "libopus", "-b:a", "96k", "-vbr", "on",
                 "-application", "audio", "-compression_level", "10"],
    },
    "mp3": {
        "dir": "audio-encoded/mp3",
        "ext": "mp3",
        "args": ["-c:a", "libmp3lame", "-q:a", "2", "-joint_stereo", "1"],
    },
}


def mean_volume(path):
    """Integrated mean level in dBFS, as ffmpeg's volumedetect reports it."""
    p = subprocess.run(
        [FF, "-hide_banner", "-i", path, "-af", "volumedetect", "-f", "null", "-"],
        capture_output=True,
    )
    m = re.search(r"mean_volume:\s*(-?[\d.]+)", p.stderr.decode(errors="replace"))
    return float(m.group(1)) if m else None


def encode(src, dest, args, extra_af=None):
    """Encode src -> dest. `extra_af` is prepended to the cleaning filter chain."""
    cmd = [FF, "-hide_banner", "-loglevel", "error", "-y", "-i", src]
    af = CLEAN_AF if not extra_af else f"{extra_af},{CLEAN_AF}"
    cmd += ["-af", af]
    cmd += list(args) + ["-map_metadata", "-1", dest]
    r = subprocess.run(cmd, capture_output=True)
    return r.returncode == 0 and os.path.exists(dest) and os.path.getsize(dest) > 0


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"
    modes = list(CONFIGS) if mode == "all" else [mode]
    for m in modes:
        if m not in CONFIGS:
            sys.exit(f"unknown mode: {m}")

    srcs = sorted(glob.glob("audio/*.wav")) + sorted(glob.glob("audio/*.mp3"))
    stems = sorted({os.path.splitext(os.path.basename(s))[0] for s in srcs})

    for m in modes:
        cfg = CONFIGS[m]
        outdir = cfg["dir"]
        os.makedirs(outdir, exist_ok=True)
        print(f"\n=== {m} -> {outdir}/ ===")
        fixed = []
        cleaned = []
        for stem in stems:
            src = next((p for p in (f"audio/{stem}.wav", f"audio/{stem}.mp3")
                        if os.path.exists(p)), None)
            if not src:
                continue
            dest = f"{outdir}/{stem}.{cfg['ext']}"

            if not encode(src, dest, cfg["args"]):
                print(f"  FAIL {stem}")
                continue

            # Compare the encode against the CLEANED source, not the raw one: the
            # cleaning step legitimately removes subsonic energy and would otherwise
            # look like codec drift.
            ref = os.path.join("q", f"{stem}.clean.wav")
            os.makedirs("q", exist_ok=True)
            subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-i", src,
                            "-af", CLEAN_AF, ref], capture_output=True)

            raw_db = mean_volume(src)
            ref_db = mean_volume(ref)
            out_db = mean_volume(dest)
            if None in (raw_db, ref_db, out_db):
                continue

            removed = raw_db - ref_db
            if removed > 1.0:
                cleaned.append((stem, removed))

            drift = out_db - ref_db
            if drift <= -1.0:
                boost = -drift
                if encode(src, dest, cfg["args"], extra_af=f"volume={boost:.2f}dB"):
                    new_db = mean_volume(dest)
                    fixed.append((stem, drift, new_db - ref_db))
                    print(f"  {stem:18} codec drift {drift:+.1f} dB -> corrected "
                          f"with {boost:+.1f} dB pre-gain (residual {new_db - ref_db:+.2f} dB)")
                else:
                    print(f"  {stem:18} codec drift {drift:+.1f} dB, correction FAILED")
            else:
                note = f" (cleaned {removed:.1f} dB of subsonic junk)" if removed > 1.0 else ""
                print(f"  {stem:18} ok  (drift {drift:+.2f} dB){note}")

        n = len(glob.glob(f"{outdir}/*"))
        size = sum(os.path.getsize(f) for f in glob.glob(f"{outdir}/*"))
        print(f"  -> {n} files, {size/1e6:.2f} MB")
        if cleaned:
            print(f"  -> subsonic/DC removed from: {', '.join(s for s, _ in cleaned)}")
        if fixed:
            print(f"  -> codec level-corrected: {', '.join(s for s, _, _ in fixed)}")


if __name__ == "__main__":
    main()
