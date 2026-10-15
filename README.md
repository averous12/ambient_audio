# Ambient Mixer

A dependency-free ambient sound mixer. Layer rain, thunder, wind, forest, river,
birds and frogs into your own soundscape, then save it as a preset.

Open `index.html` in a browser. No build step, no server, no dependencies.

## Two builds

| Directory | Assets | Size | Notes |
|---|---|---|---|
| `.` (root) | `audio/` — 23 WAV + 7 MP3 | 66.8 MB | original quality, double-click `index.html` |
| `encoded/` | 29 Opus files | **4.2 MB** | fully self-contained, same app |

Both are complete and independent. `encoded/` is the one to host: it is 16×
smaller and contains its own copy of the HTML, CSS and JS, so it can be dropped
onto any static host (or GitHub Pages) on its own.

Opus is supported by every current browser (Chrome, Firefox, Edge, Safari 15+).
If you need the older-WebKit fallback, `audio-encoded/mp3/` holds the same 29
files as MP3; copy those in and rewrite the 28 `url:` entries in
`encoded/audio-player.js` to `.mp3`.

### Regenerating the encoded build

```bash
python encode-audio.py all          # audio/ -> audio-encoded/{opus,mp3}
python verify-encodes.py opus mp3   # level + spectral check on every file
```

Both scripts require `ffmpeg` and `numpy` and never modify `audio/`.

### Asset caveat

`wind_3.wav` carries a −0.28 DC offset and 80% of its RMS is sub-20 Hz drift
rather than audio, which is why it measured as the loudest channel while sounding
like nothing. The encoder strips everything below 20 Hz before encoding, which
fixes the level and also stops the codec wasting bitrate on an inaudible ramp.
`frog_7` had 3.3 dB of the same. If you re-record `wind_3`, high-pass it at
source.

## Channels

| Channel | Control | Behaviour |
|---|---|---|
| Rain | volume + intensity dial | 5 variants, crossfaded by intensity (Light → Heavy) |
| Thunder | volume + intensity dial | one-shot strikes; dial sets how often |
| Wind | volume + intensity dial | 4 variants, crossfaded by intensity |
| Forest | volume only | continuous loop |
| River | volume only | continuous loop |
| Birds | volume + intensity dial | scattered one-shots |
| Frogs | volume + intensity dial | scattered one-shots |

## Looping and seams

The raw clips are bare loops with no clean boundary — `rain_mediumhigh.wav` is
7.5s, so a plain `<audio loop>` clicks every 7.5 seconds as it hard-restarts.

Instead each looping channel runs **two instances of its file** and hands over
across an **equal-power crossfade** that straddles the seam: as one copy
approaches its end it fades down while the other plays from the top and fades up
on a sin/cos curve. Because the pair sums to constant power, the seam is masked
rather than merely softened — there is no level dip in the middle of the fade.

The schedule is driven by each element's own `currentTime`, not a shared wall
clock: media elements load and buffer at different times, so a global clock
desyncs from the audio as soon as one of them stalls.

Looping channels (rain, wind, forest, river) use two elements each; one-shot
channels (thunder, birds, frogs) do not loop at all. Stopping a channel pauses
both copies, rewinds them, and clears their `src` so the decoder is released.

## Sleep timer

Set hours and minutes, or tap a quick chip (15m–2h). The countdown shows as
`mm:ss`, switching to `h:mm:ss` past the hour.

When the timer expires it does not cut the audio dead — the mix fades out over the
final 12 seconds, then every channel stops and resets. The master level you had
before the fade is remembered and restored, so starting a new timer brings the mix
back rather than leaving you with a silent page. Cancelling during the fade hands
the level straight back.

The deadline is stored as a wall-clock timestamp, not a decremented counter, so a
backgrounded or throttled tab cannot make the countdown drift.

## Interaction

- **Volume** — drag the vertical slider. On Forest and River (which have no
  intensity dial) the volume slider is also the play/stop control.
- **Intensity dial** — drag vertically; the full range is one ~180px gesture.
  Arrow keys nudge, `PageUp`/`PageDown` jump, `Home`/`End` go to the ends,
  double-click centres, and the scroll wheel nudges.
- **Master** — scales every channel at once, live.
- **Presets** — saved to `localStorage`. Saving under an existing name
  overwrites it rather than creating a duplicate.

Audio only starts after the browser sees a user gesture, so the first click or
keypress is what allows sound.

## Adding a sound

Add an entry to `SOUND_CONFIG` in `audio-player.js`; the card, wiring and preset
handling are all generated from it. Set `behavior` to `layered`, `random` or
`continuous`. Layered variants need an `intensityRange`; random ones need
`minInterval`/`maxInterval`.
