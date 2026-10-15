# Ambient Mixer

A dependency-free ambient sound mixer. Layer rain, thunder, wind, forest, river,
birds and frogs into your own soundscape, then save it as a preset.

Open `index.html` in a browser. No build step, no server, no dependencies.

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
