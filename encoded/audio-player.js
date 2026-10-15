// ═══════════════════════════════════════════════════════════════════════════
//  Ambient Mixer — sound definitions + player
//  Add a sound by adding an entry to SOUND_CONFIG; the UI builds itself.
//  Icons are inline SVG (24×24, stroke-based) so every channel renders with one
//  consistent visual language and no icon-font or network dependency.
// ═══════════════════════════════════════════════════════════════════════════

const ICON = (paths) =>
    `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
          aria-hidden="true">${paths}</svg>`;

const ICONS = {
    rain: ICON(`
        <path d="M7 15.5a4.5 4.5 0 0 1 .6-8.96 5.5 5.5 0 0 1 10.5 1.2A3.9 3.9 0 0 1 18 15.5"/>
        <path d="M8.5 18.5 7.5 21"/><path d="M12 18.5l-1 2.5"/><path d="M15.5 18.5l-1 2.5"/>`),
    thunder: ICON(`<path d="M13.5 2 5 13.5h5.5L9.5 22 18 10.5h-5.5z"/>`),
    wind: ICON(`
        <path d="M3 8h10.5a2.75 2.75 0 1 0-2.75-2.75"/>
        <path d="M3 12.5h14.5a2.75 2.75 0 1 1-2.75 2.75"/>
        <path d="M3 17h8"/>`),
    forest: ICON(`
        <path d="M12 2.5 7 10h3l-4 6.5h5V22h2v-5.5h5L14 10h3z"/>`),
    river: ICON(`
        <path d="M3 7.5c2.5-2 5-2 7.5 0s5 2 7.5 0"/>
        <path d="M3 12.5c2.5-2 5-2 7.5 0s5 2 7.5 0"/>
        <path d="M3 17.5c2.5-2 5-2 7.5 0s5 2 7.5 0"/>`),
    birds: ICON(`
        <path d="M3.5 13.5c0-3.3 2.6-5.9 5.8-5.9.7 0 1.4.13 2 .38"/>
        <path d="M11.3 8a3.2 3.2 0 1 1 4.3 4.6"/>
        <path d="M15.6 12.6H6.2a1.9 1.9 0 0 1-1.4-.5"/>
        <path d="M13.8 5.6 16 3.2"/><path d="M15.9 7.4 19.4 6"/>
        <path d="M9.6 17.5 8.4 20"/>`),
    frogs: ICON(`
        <circle cx="7.8" cy="7.4" r="2.4"/><circle cx="16.2" cy="7.4" r="2.4"/>
        <path d="M3.8 13.6c0 3.4 3.6 6 8.2 6s8.2-2.6 8.2-6"/>
        <path d="M8.6 15.8c1 .55 2.15.85 3.4.85s2.4-.3 3.4-.85"/>`),
    save: ICON(`
        <path d="M5 3.5h11L19.5 7v13.5h-15z"/>
        <path d="M8 3.5v6h7v-6"/><path d="M8 20.5v-5h8v5"/>`),
    master: ICON(`
        <path d="M5 21V14"/><path d="M5 10V3"/><path d="M12 21v-9"/>
        <path d="M12 8V3"/><path d="M19 21v-5"/><path d="M19 12V3"/>
        <path d="M2.5 14h5"/><path d="M9.5 8h5"/><path d="M16.5 16h5"/>`),
    timer: ICON(`
        <circle cx="12" cy="13.5" r="7.5"/>
        <path d="M12 9.5v4l2.5 1.5"/>
        <path d="M9.5 2.5h5"/>`),
    play: ICON(`
        <path d="M7 4.5v15l12-7.5z"/>`),
    pause: ICON(`
        <path d="M9 4.5v15"/><path d="M15 4.5v15"/>`)
};

const SOUND_CONFIG = {
    rain: {
        name: "Rain",
        icon: ICONS.rain,
        variants: [
            { url: 'rain_low.opus', intensityRange: [1, 20], label: "Light Rain" },
            { url: 'rain_mediumlow.opus', intensityRange: [21, 40], label: "Medium-Light Rain" },
            { url: 'rain_medium.opus', intensityRange: [41, 60], label: "Medium Rain" },
            { url: 'rain_mediumhigh.opus', intensityRange: [61, 80], label: "Medium-Heavy Rain" },
            { url: 'rain_high.opus', intensityRange: [81, 100], label: "Heavy Rain" }
        ],
        behavior: 'layered',
        hasIntensityControl: true
    },
    thunder: {
        name: "Thunder",
        icon: ICONS.thunder,
        variants: [
            { url: 'thunder_0.opus', label: "Distant Rumble" },
            { url: 'thunder_1.opus', label: "Sharp Crack" },
            { url: 'thunder_2.opus', label: "Long Roll" },
            { url: 'thunder_3.opus', label: "Powerful Strike" },
            { url: 'thunder_4.opus', label: "Short Crack" },
            { url: 'thunder_5.opus', label: "Medium Roll" },
            { url: 'thunder_6.opus', label: "Dramatic Strike" }
        ],
        behavior: 'random',
        minInterval: 5000,
        maxInterval: 30000,
        hasIntensityControl: true,
        defaultVolume: 70
    },
    wind: {
        name: "Wind",
        icon: ICONS.wind,
        variants: [
            { url: 'wind_1.opus', intensityRange: [1, 25], label: "Light Breeze" },
            { url: 'wind_2.opus', intensityRange: [26, 50], label: "Gentle Wind" },
            { url: 'wind_3.opus', intensityRange: [51, 75], label: "Strong Wind" },
            { url: 'wind_4.opus', intensityRange: [76, 100], label: "Howling Wind" }
        ],
        behavior: 'layered',
        hasIntensityControl: true
    },
    forest: {
        name: "Forest",
        icon: ICONS.forest,
        variants: [
            { url: 'forest_2.opus', label: "Forest Ambience" }
        ],
        behavior: 'continuous',
        hasIntensityControl: false
    },
    river: {
        name: "River",
        icon: ICONS.river,
        variants: [
            { url: 'river.opus', label: "Flowing River" }
        ],
        behavior: 'continuous',
        hasIntensityControl: false
    },
    birds: {
        name: "Birds",
        icon: ICONS.birds,
        variants: [
            { url: 'bird_1.opus', label: "Bird Song 1" },
            { url: 'bird_2.opus', label: "Bird Song 2" },
            { url: 'bird_3.opus', label: "Bird Song 3" }
        ],
        behavior: 'random',
        minInterval: 2500,
        maxInterval: 10000,
        hasIntensityControl: true,
        defaultVolume: 60
    },
    frogs: {
        name: "Frogs",
        icon: ICONS.frogs,
        variants: [
            { url: 'frog_1.opus', label: "Frog 1" },
            { url: 'frog_2.opus', label: "Frog 2" },
            { url: 'frog_3.opus', label: "Frog 3" },
            { url: 'frog_4.opus', label: "Frog 4" },
            { url: 'frog_5.opus', label: "Frog 5" },
            { url: 'frog_6.opus', label: "Frog 6" },
            { url: 'frog_7.opus', label: "Frog 7" }
        ],
        behavior: 'random',
        minInterval: 2000,
        maxInterval: 8000,
        hasIntensityControl: true,
        defaultVolume: 60
    }
};

const KNOB_MIN_ANGLE = -135;                          // 0   → 7:30 position
const KNOB_MAX_ANGLE = 135;                           // 100 → 4:30 position
const KNOB_SWEEP = KNOB_MAX_ANGLE - KNOB_MIN_ANGLE;   // 270°
const FADE_MS = 240;                                  // start/stop ramp
const TIMER_FADE_MS = 12000;                           // sleep fade-out length
const MAX_TIMER_MIN = 23 * 60 + 59;
const MASTER_DEFAULT = 70;
// Level a channel adopts when its dial is engaged while its slider is still at 0.
const DEFAULT_CHANNEL_VOLUME = 65;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// mm:ss for short waits, h:mm:ss once there is an hour on the clock.
function formatDuration(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

// Coerce a number input back into range, tolerating empty/garbage input.
function setFieldValue(input, lo, hi) {
    const n = parseInt(input.value, 10);
    input.value = Number.isFinite(n) ? clamp(n, lo, hi) : lo;
}

class AudioPlayer {
    constructor() {
        this.sounds = {};
        this.masterVolume = 0.7;
        this.currentPresetId = null;
        // Sleep timer state: wall-clock deadline rather than a decremented
        // counter, so a throttled background tab cannot make it drift.
        this.timer = {
            endsAt: null,
            remainingMs: 0,
            tickId: null,
            fadingOut: false,
            warned: false
        };
        this.init();
    }

    init() {
        for (const [key, config] of Object.entries(SOUND_CONFIG)) {
            const defaultVolume = config.defaultVolume ?? 0;
            this.sounds[key] = {
                config,
                variants: [],
                currentVariant: null,
                loop: null,                     // active crossfade-loop state
                intervals: [],
                stashedVolume: defaultVolume,   // remembered across mute/unmute
                currentVolume: defaultVolume / 100,
                currentIntensity: 0,
                isPlaying: false
            };
            this.preloadAudio(key);
        }

        this.createSoundControls();
        this.injectPanelIcons();
        this.updateMasterReadout();

        document.querySelector('.master-volume').addEventListener('input', (e) => {
            this.masterVolume = e.target.value / 100;
            this.updateAllVolumes();
            this.updateMasterReadout();
        });

        this.setupPresetControls();
        this.setupTimerControls();
        this.loadPresetList();
        this.updateStatus();
    }

    // Panel chrome icons are declared in markup as <span data-icon="…"> so the
    // HTML stays readable and the SVG lives in one place.
    injectPanelIcons() {
        document.querySelectorAll('[data-icon]').forEach(el => {
            const path = ICONS[el.dataset.icon];
            if (path) el.innerHTML = path;
        });
    }

    preloadAudio(soundKey) {
        const sound = this.sounds[soundKey];
        sound.variants = sound.config.variants.map(variant => {
            const audio = new Audio(variant.url);
            audio.preload = 'auto';
            audio.loop = false;                  // looping is decided at play time
            audio.addEventListener('error', () => {
                console.warn(`[ambient] failed to load ${variant.url}`);
            });
            return { ...variant, audio, baseGain: 1 };
        });
    }

    // ── gain ───────────────────────────────────────────────────────────────
    // Each variant carries a base gain (used to scatter one-shot hits); it is
    // scaled by the channel volume and the master volume.
    targetGain(soundKey, variant) {
        const sound = this.sounds[soundKey];
        const base = variant.baseGain ?? 1;
        return clamp(sound.currentVolume * this.masterVolume * base, 0, 1);
    }

    // Ramp gain instead of jumping, so starting/stopping a loop does not click.
    rampGain(soundKey, variant, target, ms = FADE_MS) {
        const el = variant.audio;
        clearInterval(variant._ramp);
        variant._ramp = null;

        if (!ms || el.paused) { el.volume = target; return; }

        const from = el.volume;
        const steps = 12;
        let i = 0;
        variant._ramp = setInterval(() => {
            i++;
            el.volume = clamp(from + (target - from) * (i / steps), 0, 1);
            if (i >= steps) {
                clearInterval(variant._ramp);
                variant._ramp = null;
                el.volume = target;
            }
        }, ms / steps);
    }

    applyGain(soundKey, variant, { fade = false } = {}) {
        const target = this.targetGain(soundKey, variant);
        if (fade) this.rampGain(soundKey, variant, target);
        else {
            clearInterval(variant._ramp);
            variant._ramp = null;
            variant.audio.volume = target;
        }
    }

    // ── volume ─────────────────────────────────────────────────────────────
    setVolume(soundKey, volume) {
        const sound = this.sounds[soundKey];
        volume = clamp(volume, 0, 1);
        if (volume > 0) sound.stashedVolume = Math.round(volume * 100);
        sound.currentVolume = volume;

        // A continuous sound has no intensity control, so the volume slider is
        // also its play/stop control.
        if (sound.config.hasIntensityControl === false) {
            if (volume > 0 && !sound.isPlaying) this.startContinuous(soundKey);
            else if (volume === 0 && sound.isPlaying) this.fadeOutAndStop(soundKey);
            else if (sound.currentVariant) this.applyGain(soundKey, sound.currentVariant);
            this.refreshUI(soundKey);
            return;
        }

        // Intensity sounds only re-gain what is already playing; dragging a
        // volume slider never silently starts them.
        if (sound.currentVariant) this.applyGain(soundKey, sound.currentVariant);
        this.refreshUI(soundKey);
    }

    // Push a channel's state into its card chrome and the status panel. Kept in
    // one place so no path can update the audio without the UI following.
    refreshUI(soundKey) {
        const card = document.querySelector(`.card[data-sound="${soundKey}"]`);
        if (card) this.updateCardReadout(card);
        this.updateStatus();
    }

    updateMasterReadout() {
        const out = document.querySelector('.master-value');
        if (out) out.textContent = Math.round(this.masterVolume * 100) + '%';
    }

    updateAllVolumes() {
        for (const [key, sound] of Object.entries(this.sounds)) {
            if (sound.currentVariant) this.applyGain(key, sound.currentVariant);
        }
        this.updateStatus();
    }

    // ── crossfaded looping ─────────────────────────────────────────────────
    // `<audio loop>` restarts the clip at its own hard boundary, which clicks on
    // every cycle (a 7.5s rain file ticks every 7.5 seconds). Instead each
    // looping channel keeps TWO instances of the file and hands over across an
    // equal-power fade that straddles the seam, so the boundary is always masked.
    //
    // Schedule is driven by each element's own position (not a shared wall clock),
    // because media elements load and seek at different times and a global clock
    // desyncs from the audio as soon as one of them buffers.

    // Equal-power (sin/cos) shape: the pair sums to constant perceived power,
    // whereas a linear crossfade dips audibly in the middle.
    crossfadeGains(t) {
        const x = clamp(t, 0, 1) * Math.PI / 2;
        return [Math.cos(x), Math.sin(x)];
    }

    startCrossfadeLoop(soundKey, variant) {
        const sound = this.sounds[soundKey];
        this.stopCrossfadeLoop(soundKey);

        const src = variant.url;
        const A = new Audio(src);
        const B = new Audio(src);
        [A, B].forEach(el => { el.loop = false; el.preload = 'auto'; el.volume = 0; });

        const st = {
            a: A, b: B,
            lead: A,           // which element is currently carrying the sound
            fadeMs: 1400,      // provisional; refined once duration is known
            running: true,
            raf: null
        };
        sound.loop = st;

        // Only start once the leading element knows its duration, otherwise the
        // seam position would be computed against NaN.
        const arm = () => {
            if (!st.running || sound.loop !== st) return;
            if (!(A.duration > 0)) { setTimeout(arm, 120); return; }

            st.loopMs = A.duration * 1000;
            st.fadeMs = clamp(st.loopMs * 0.2, 800, 2400);
            this.seekTo(A, 0);
            this.playElement(A);

            // One rule: while the lead is inside its final fade window, the other
            // copy plays from the top and the two crossfade. When the lead ends,
            // the roles swap — so the seam is always covered by a rising copy.
            const tick = () => {
                if (!st.running || sound.loop !== st) return;

                const level = this.targetGain(soundKey, variant);
                const lead = st.lead;
                const other = lead === A ? B : A;
                const leadPos = lead.currentTime * 1000;
                const fadeStart = st.loopMs - st.fadeMs;

                if (leadPos >= fadeStart) {
                    // Entering the seam: start the incoming copy once, then fade.
                    if (other.paused) { this.seekTo(other, 0); this.playElement(other); }
                    const t = (leadPos - fadeStart) / st.fadeMs;
                    const [gLead, gTrail] = this.crossfadeGains(t);
                    lead.volume = level * gLead;
                    other.volume = level * gTrail;

                    // Handover complete: the incoming copy is now the lead, and
                    // the old one is rewound to serve as the next incoming copy.
                    if (lead.ended || leadPos >= st.loopMs - 20) {
                        this.seekTo(lead, 0);
                        lead.volume = 0;
                        st.lead = other;
                    }
                } else {
                    lead.volume = level;
                    if (!other.paused) { other.volume = 0; this.seekTo(other, 0); }
                }

                st.raf = requestAnimationFrame(tick);
            };
            st.raf = requestAnimationFrame(tick);
        };
        arm();
    }

    stopCrossfadeLoop(soundKey) {
        const sound = this.sounds[soundKey];
        const st = sound.loop;
        if (!st) return;
        st.running = false;
        if (st.raf) cancelAnimationFrame(st.raf);
        [st.a, st.b].forEach(el => {
            el.pause();
            this.seekTo(el, 0);
            el.volume = 0;
            el.src = '';          // release the decoder immediately
        });
        sound.loop = null;
    }

    seekTo(el, time) {
        try { el.currentTime = time; } catch (_) { /* not seekable yet */ }
    }

    // ── intensity ──────────────────────────────────────────────────────────
    setIntensity(soundKey, intensity) {
        const sound = this.sounds[soundKey];
        intensity = clamp(Math.round(intensity), 0, 100);
        sound.currentIntensity = intensity;
        sound.isPlaying = intensity > 0;

        this.stopSound(soundKey);
        if (intensity === 0) {
            this.refreshUI(soundKey);
            return;
        }

        switch (sound.config.behavior) {
            case 'layered':    this.playLayered(soundKey, intensity); break;
            case 'random':     this.startRandom(soundKey, intensity); break;
            case 'continuous': this.startContinuous(soundKey);        break;
        }
        this.refreshUI(soundKey);
    }

    // One looping variant; gain follows the volume slider.
    startContinuous(soundKey) {
        const sound = this.sounds[soundKey];
        if (sound.isPlaying && sound.currentVariant) return;
        const variant = sound.variants[0];
        if (!variant) return;

        // A continuous channel is started BY its volume slider, so the level is
        // already set; no default needed here.
        sound.currentVariant = variant;
        sound.isPlaying = true;
        this.startCrossfadeLoop(soundKey, variant);
    }

    // Layered: pick the variant whose intensity band matches.
    playLayered(soundKey, intensity) {
        const sound = this.sounds[soundKey];
        const variant = sound.variants.find(v =>
            v.intensityRange && intensity >= v.intensityRange[0] && intensity <= v.intensityRange[1]
        );
        if (!variant) return;

        // Engaging a dial on a channel whose volume is still at zero would
        // otherwise produce visible movement and no sound, which reads as broken.
        // Adopt the channel's remembered level so the dial always sounds.
        if (sound.currentVolume <= 0) this.adoptStashedVolume(soundKey);

        sound.currentVariant = variant;
        this.startCrossfadeLoop(soundKey, variant);
    }

    // Bring a silent channel up to the level it last had (or a sane default) and
    // reflect that in the slider, so UI and audio never disagree.
    adoptStashedVolume(soundKey) {
        const sound = this.sounds[soundKey];
        const percent = sound.stashedVolume > 0 ? sound.stashedVolume : DEFAULT_CHANNEL_VOLUME;
        sound.stashedVolume = percent;
        sound.currentVolume = percent / 100;
        const card = document.querySelector(`.card[data-sound="${soundKey}"]`);
        if (card) card.querySelector('.volume').value = percent;
    }

    // Random: scattered one-shots, interval driven by intensity.
    startRandom(soundKey, intensity) {
        const sound = this.sounds[soundKey];
        const config = sound.config;
        const minInterval = config.minInterval ?? 5000;
        const maxInterval = config.maxInterval ?? 15000;

        // Fire once immediately so the channel is audible the moment it engages.
        this.playRandomHit(soundKey);

        const schedule = () => {
            // Intensity ramps the gap between min and max; jitter keeps it from
            // sounding metronomic.
            const t = clamp(sound.currentIntensity, 0, 100) / 100;
            const base = maxInterval - (maxInterval - minInterval) * t;
            const jittered = base * (0.7 + Math.random() * 0.6);
            const id = setTimeout(() => {
                if (!sound.isPlaying) return;
                this.playRandomHit(soundKey);
                schedule();          // always reads the CURRENT intensity
            }, jittered);
            sound.intervals.push({ type: 'timeout', id });
        };
        schedule();
    }

    playRandomHit(soundKey) {
        const sound = this.sounds[soundKey];
        if (!sound.isPlaying) return;
        const variant = sound.variants[Math.floor(Math.random() * sound.variants.length)];
        if (!variant) return;

        // Restart from the top; the clip does not loop.
        try { variant.audio.currentTime = 0; } catch (_) { /* not seekable yet */ }
        // Slight gain scatter so repeated hits do not sound copy-pasted.
        variant.baseGain = 0.7 + Math.random() * 0.3;
        variant.audio.volume = this.targetGain(soundKey, variant);
        this.playElement(variant.audio);
    }

    playElement(el) {
        const p = el.play();
        if (p && typeof p.catch === 'function') {
            p.catch(err => console.warn('[ambient] play blocked:', err.name));
        }
    }

    fadeOutAndStop(soundKey) {
        const sound = this.sounds[soundKey];
        const variant = sound.currentVariant;
        if (!variant) { sound.isPlaying = false; this.refreshUI(soundKey); return; }
        this.rampGain(soundKey, variant, 0, FADE_MS);
        setTimeout(() => {
            if (sound.currentVariant === variant && sound.currentVolume === 0) {
                this.stopSound(soundKey);
                sound.isPlaying = false;
                this.refreshUI(soundKey);
            }
        }, FADE_MS + 30);
    }

    stopSound(soundKey) {
        const sound = this.sounds[soundKey];
        this.stopCrossfadeLoop(soundKey);
        sound.variants.forEach(variant => {
            clearInterval(variant._ramp);
            variant._ramp = null;
        });
        if (sound.currentVariant) {
            sound.currentVariant.audio.pause();
            try { sound.currentVariant.audio.currentTime = 0; } catch (_) { /* ignore */ }
        }
        sound.currentVariant = null;
        sound.intervals.forEach(entry => clearTimeout(entry.id));
        sound.intervals = [];
    }

    // ── UI ─────────────────────────────────────────────────────────────────
    createSoundControls() {
        const grid = document.getElementById('sound-grid');

        for (const [key, sound] of Object.entries(this.sounds)) {
            const config = sound.config;
            const hasKnob = config.hasIntensityControl !== false;

            const card = document.createElement('div');
            card.className = 'card' + (hasKnob ? '' : ' no-knob');
            card.dataset.sound = key;

            const control = hasKnob
                ? `<div class="knob intensity" data-value="0" role="slider" tabindex="0"
                        aria-label="${config.name} intensity" aria-valuemin="0"
                        aria-valuemax="100" aria-valuenow="0"></div>`
                : `<div class="knob-slot" aria-hidden="true"></div>`;

            card.innerHTML = `
                <div class="icon">${config.icon}</div>
                <div class="name">${config.name}</div>
                <input type="range" class="slider volume" min="0" max="100"
                       value="${config.defaultVolume ?? 0}"
                       aria-label="${config.name} volume">
                ${control}
                <div class="readout">${hasKnob ? 'Off' : ''}</div>
            `;

            card.querySelector('.volume')
                .addEventListener('input', (e) => this.setVolume(key, e.target.value / 100));

            grid.appendChild(card);
            if (hasKnob) this.setupKnob(card.querySelector('.knob'));
        }
    }

    angleForValue(value) {
        return KNOB_MIN_ANGLE + (clamp(value, 0, 100) / 100) * KNOB_SWEEP;
    }

    valueForAngle(angle) {
        return Math.round(clamp((angle - KNOB_MIN_ANGLE) / KNOB_SWEEP, 0, 1) * 100);
    }

    paintKnob(knob, value) {
        value = clamp(Math.round(value), 0, 100);
        // --angle drives the dot; --pct fills the arc over the same 270° travel.
        // Both come from one value, so the painted dial cannot disagree with it.
        const angle = this.angleForValue(value);
        knob.style.setProperty('--angle', angle + 'deg');
        knob.style.setProperty('--pct', (value / 100 * (KNOB_SWEEP / 360) * 100).toFixed(4) + '%');
        knob.dataset.value = value;
        knob.setAttribute('aria-valuenow', value);
        this.updateCardReadout(knob.closest('.card'));
    }

    // The dial's readout names the variant the value selects (e.g. "Heavy Rain")
    // rather than repeating the number the dial already shows — that label is
    // far more useful when three channels are layered.
    updateCardReadout(card) {
        if (!card) return;
        const key = card.dataset.sound;
        const sound = this.sounds[key];
        const knob = card.querySelector('.knob');
        const readout = card.querySelector('.readout');
        if (!sound || !readout) return;

        if (!knob) {                        // continuous channel: no dial
            const on = sound.isPlaying && sound.currentVolume > 0;
            readout.textContent = on ? 'Playing' : '';
            readout.classList.toggle('on', on);
            if (on) card.classList.add('is-active'); else card.classList.remove('is-active');
            return;
        }

        const value = parseInt(knob.dataset.value, 10) || 0;
        if (value === 0) {
            readout.textContent = 'Off';
            readout.classList.remove('on');
            card.classList.remove('is-active');
            return;
        }
        // Name the band; fall back to the percentage for random channels, whose
        // variants are individual hits rather than intensity bands.
        const variant = sound.variants.find(v =>
            v.intensityRange && value >= v.intensityRange[0] && value <= v.intensityRange[1]);
        readout.textContent = variant ? variant.label : value + '%';
        readout.classList.add('on');
        card.classList.add('is-active');
    }

    // A compact "what am I hearing" summary. Cheap to update, and it makes a
    // layered scene legible at a glance.
    updateStatus() {
        const panel = document.getElementById('status-panel');
        const body = document.getElementById('status-body');
        if (!panel || !body) return;

        const active = Object.entries(this.sounds).filter(([, s]) => s.isPlaying);
        if (!active.length) {
            panel.hidden = true;
            body.innerHTML = '';
            return;
        }
        panel.hidden = false;
        body.innerHTML = active.map(([key, sound]) => {
            const v = sound.currentVariant;
            // Continuous channels have no intensity, so they report "Playing";
            // everything else names the band the dial selected.
            const label = v && v.intensityRange ? v.label
                : (sound.currentIntensity > 0 ? sound.currentIntensity + '%' : 'Playing');
            return `<span class="tag" data-sound="${key}">
                        <span class="tag-icon">${sound.config.icon}</span>
                        <span class="tag-name">${sound.config.name}</span>
                        <span class="tag-detail">${label}</span>
                    </span>`;
        }).join('');
    }

    setupKnob(knob) {
        let dragging = false, startY = 0, startValue = 0;

        const commit = () => {
            const value = parseInt(knob.dataset.value, 10) || 0;
            this.setIntensity(knob.closest('.card').dataset.sound, value);
        };

        knob.addEventListener('pointerdown', (e) => {
            dragging = true;
            knob.classList.add('active');
            try { knob.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
            startY = e.clientY;
            startValue = parseInt(knob.dataset.value, 10) || 0;
            e.preventDefault();
            e.stopPropagation();
        });

        knob.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            // Vertical drag maps straight to value — the full 0→100 range in one
            // ~180px gesture, with no per-event step clamp.
            const delta = ((startY - e.clientY) / 180) * 100;
            this.paintKnob(knob, startValue + delta);
            e.preventDefault();
        });

        const end = (e) => {
            if (!dragging) return;
            dragging = false;
            knob.classList.remove('active');
            try { knob.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
            commit();
        };
        knob.addEventListener('pointerup', end);
        knob.addEventListener('pointercancel', end);

        // Keyboard access: it is a real slider, so it should behave like one.
        knob.addEventListener('keydown', (e) => {
            const current = parseInt(knob.dataset.value, 10) || 0;
            let next = current;
            switch (e.key) {
                case 'ArrowUp': case 'ArrowRight': next = current + 5; break;
                case 'ArrowDown': case 'ArrowLeft': next = current - 5; break;
                case 'PageUp': next = current + 20; break;
                case 'PageDown': next = current - 20; break;
                case 'Home': next = 0; break;
                case 'End': next = 100; break;
                default: return;
            }
            e.preventDefault();
            this.paintKnob(knob, next);
            commit();
        });

        // Double-click resets to the midpoint.
        knob.addEventListener('dblclick', () => {
            this.paintKnob(knob, 50);
            commit();
        });

        // Wheel over the knob nudges it, matching the slider idiom.
        knob.addEventListener('wheel', (e) => {
            e.preventDefault();
            const current = parseInt(knob.dataset.value, 10) || 0;
            this.paintKnob(knob, current + (e.deltaY < 0 ? 5 : -5));
            commit();
        }, { passive: false });

        this.paintKnob(knob, 0);
    }

    // ── sleep timer ────────────────────────────────────────────────────────
    setupTimerControls() {
        this.timerEls = {
            hours: document.getElementById('timer-hours'),
            minutes: document.getElementById('timer-minutes'),
            toggle: document.getElementById('timer-toggle'),
            readout: document.getElementById('timer-readout')
        };

        this.timerEls.toggle.addEventListener('click', () => {
            if (this.timerRunning()) this.cancelTimer();
            else this.startTimerFromFields();
        });

        // Quick-duration chips write into the fields and start immediately.
        document.querySelectorAll('[data-timer-min]').forEach(chip => {
            chip.addEventListener('click', () => {
                const total = parseInt(chip.dataset.timerMin, 10);
                this.setTimerFields(total);
                this.startTimer(total);
            });
        });

        // Typing a duration while running re-arms with the new value.
        [this.timerEls.hours, this.timerEls.minutes].forEach(input => {
            input.addEventListener('change', () => this.normaliseTimerFields());
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.normaliseTimerFields();
                    const total = this.timerFieldMinutes();
                    if (total > 0) this.startTimer(total);
                }
            });
        });

        // Keep the readout honest if the tab was backgrounded mid-countdown.
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.timerRunning()) this.renderTimer();
        });
    }

    timerRunning() {
        return this.timer.endsAt !== null || this.timer.fadingOut;
    }

    timerFieldMinutes() {
        const h = clamp(parseInt(this.timerEls.hours.value, 10) || 0, 0, 23);
        const m = clamp(parseInt(this.timerEls.minutes.value, 10) || 0, 0, 59);
        return h * 60 + m;
    }

    setTimerFields(totalMinutes) {
        this.timerEls.hours.value = Math.floor(totalMinutes / 60);
        this.timerEls.minutes.value = totalMinutes % 60;
    }

    normaliseTimerFields() {
        setFieldValue(this.timerEls.hours, 0, 23);
        setFieldValue(this.timerEls.minutes, 0, 59);
    }

    startTimerFromFields() {
        this.normaliseTimerFields();
        const total = this.timerFieldMinutes();
        if (total <= 0) {
            // Rather than silently doing nothing, say so in the readout.
            this.timerEls.readout.textContent = 'Set a duration';
            this.timerEls.readout.classList.add('warn');
            setTimeout(() => this.renderTimer(), 1800);
            return;
        }
        this.startTimer(total);
    }

    startTimer(totalMinutes) {
        if (!(totalMinutes > 0) || totalMinutes > MAX_TIMER_MIN) return;
        this.cancelTimer({ silent: true });

        this.timer.endsAt = Date.now() + totalMinutes * 60000;
        this.timer.remainingMs = totalMinutes * 60000;
        this.timer.fadingOut = false;
        this.timer.warned = false;
        this.timer.tickId = setInterval(() => this.tickTimer(), 250);

        this.timerEls.readout.classList.remove('warn');
        this.timerEls.toggle.textContent = 'Cancel';
        this.timerEls.toggle.classList.add('active');
        this.renderTimer();
        this.restoreMixAfterTimer();
    }

    // If a previous run faded the mix to silence, bring the level back so
    // starting a new timer does not leave the user with a silent page.
    restoreMixAfterTimer() {
        const el = document.querySelector('.master-volume');
        const remembered = this.timer.masterBeforeFade ?? MASTER_DEFAULT;
        if (parseFloat(el.value) >= 1) return;   // user already has level
        el.value = remembered;
        this.masterVolume = remembered / 100;
        this.updateAllVolumes();
        this.updateMasterReadout();
    }

    tickTimer() {
        if (this.timer.endsAt === null) return;
        this.timer.remainingMs = this.timer.endsAt - Date.now();

        if (this.timer.remainingMs <= TIMER_FADE_MS && !this.timer.fadingOut) {
            this.beginTimerFadeout();
            return;
        }
        this.renderTimer();
    }

    // Fade the whole mix over the final stretch instead of cutting it dead —
    // an abrupt stop is jarring when the point of the timer is falling asleep.
    beginTimerFadeout() {
        this.timer.fadingOut = true;
        clearInterval(this.timer.tickId);
        this.timer.tickId = null;

        // The fade rides on master (the mix's single gain stage), so remember
        // where the user had it and put it back afterwards.
        const el = document.querySelector('.master-volume');
        this.timer.masterBeforeFade = parseFloat(el.value);

        this.fadeMasterTo(0, TIMER_FADE_MS, () => {
            this.stopAll();
            this.timer.endsAt = null;
            this.timer.remainingMs = 0;
            this.timer.fadingOut = false;
            this.timerEls.readout.textContent = 'Off';
            this.timerEls.readout.classList.remove('warn');
            this.timerEls.toggle.textContent = 'Start';
            this.timerEls.toggle.classList.remove('active');
            this.renderTimer();
            this.updateStatus();
        });
    }

    cancelTimer({ silent = false } = {}) {
        clearInterval(this.timer.tickId);
        this.timer.tickId = null;
        const wasFading = this.timer.fadingOut;
        this.timer.endsAt = null;
        this.timer.remainingMs = 0;
        this.timer.fadingOut = false;

        if (!silent) {
            // Cancelling mid-fade must hand the master level back.
            if (wasFading) this.fadeMasterTo(this.timer.masterBeforeFade ?? MASTER_DEFAULT, FADE_MS);
            this.timerEls.toggle.textContent = 'Start';
            this.timerEls.toggle.classList.remove('active');
            this.timerEls.readout.classList.remove('warn');
            this.renderTimer();
        }
    }

    fadeMasterTo(percent, ms, done) {
        const el = document.querySelector('.master-volume');
        clearInterval(this._masterRamp);
        const from = parseFloat(el.value);
        const to = clamp(percent, 0, 100);
        if (!ms || Math.abs(from - to) < 0.01) {
            el.value = to;
            this.masterVolume = to / 100;
            this.updateAllVolumes();
            this.updateMasterReadout();
            done && done();
            return;
        }
        const steps = 40;
        let i = 0;
        this._masterRamp = setInterval(() => {
            i++;
            const v = from + (to - from) * (i / steps);
            el.value = v;
            this.masterVolume = v / 100;
            this.updateAllVolumes();
            this.updateMasterReadout();
            if (i >= steps) {
                clearInterval(this._masterRamp);
                this._masterRamp = null;
                done && done();
            }
        }, ms / steps);
    }

    stopAll() {
        for (const key of Object.keys(this.sounds)) {
            this.stopSound(key);
            this.sounds[key].isPlaying = false;
            this.sounds[key].currentIntensity = 0;
            const card = document.querySelector(`.card[data-sound="${key}"]`);
            const knob = card && card.querySelector('.knob');
            if (knob) this.paintKnob(knob, 0);
            else if (card) this.updateCardReadout(card);
        }
        this.updateStatus();
    }

    renderTimer() {
        const readout = this.timerEls.readout;
        if (!readout) return;

        if (this.timer.fadingOut) {
            readout.textContent = 'Fading out…';
            readout.classList.add('on');
            return;
        }
        if (this.timer.endsAt === null) {
            readout.textContent = 'Off';
            readout.classList.remove('on');
            return;
        }
        readout.classList.add('on');
        readout.textContent = formatDuration(Math.max(0, this.timer.remainingMs));
    }

    // ── presets ────────────────────────────────────────────────────────────
    setupPresetControls() {
        document.getElementById('save-preset')
            .addEventListener('click', () => this.saveCurrentPreset());
        document.getElementById('delete-preset')
            .addEventListener('click', () => this.deleteCurrentPreset());
        document.getElementById('preset-select')
            .addEventListener('change', (e) => this.loadPreset(e.target.value));
    }

    getCurrentState() {
        const state = { masterVolume: this.masterVolume, sounds: {} };
        for (const [key, sound] of Object.entries(this.sounds)) {
            state.sounds[key] = {
                volume: sound.currentVolume,
                intensity: sound.currentIntensity,
                isPlaying: sound.isPlaying
            };
        }
        return state;
    }

    applyState(state) {
        if (!state || typeof state !== 'object') return;
        this.masterVolume = typeof state.masterVolume === 'number' ? state.masterVolume : 0.7;
        document.querySelector('.master-volume').value = Math.round(this.masterVolume * 100);
        this.updateMasterReadout();

        for (const [key, soundState] of Object.entries(state.sounds || {})) {
            const sound = this.sounds[key];
            if (!sound) continue;              // preset from an older build

            const card = document.querySelector(`.card[data-sound="${key}"]`);
            if (!card) continue;

            const volume = clamp(
                typeof soundState.volume === 'number' ? soundState.volume : 0, 0, 1);
            sound.currentVolume = volume;
            if (volume > 0) sound.stashedVolume = Math.round(volume * 100);
            card.querySelector('.volume').value = Math.round(volume * 100);

            const knob = card.querySelector('.knob');   // null on continuous cards
            if (knob) {
                const intensity = clamp(Math.round(soundState.intensity || 0), 0, 100);
                this.paintKnob(knob, intensity);
                this.setIntensity(key, soundState.isPlaying && intensity > 0 ? intensity : 0);
            } else {
                // Continuous: no intensity to restore, isPlaying decides.
                if (soundState.isPlaying && volume > 0) this.startContinuous(key);
                else { this.stopSound(key); sound.isPlaying = false; }
                this.refreshUI(key);
            }
        }
        this.updateStatus();
    }

    saveCurrentPreset() {
        const nameInput = document.getElementById('preset-name');
        const presetName = nameInput.value.trim();
        if (!presetName) { alert('Please enter a preset name'); return; }

        const presets = this.getSavedPresets();
        // Overwrite a preset of the same name instead of silently duplicating.
        const existing = Object.values(presets).find(p => p.name === presetName);
        const presetId = existing ? existing.id : Date.now().toString();

        presets[presetId] = {
            id: presetId,
            name: presetName,
            state: this.getCurrentState(),
            createdAt: existing ? existing.createdAt : new Date().toISOString()
        };

        this.writePresets(presets);
        this.currentPresetId = presetId;
        this.loadPresetList();
        document.getElementById('preset-select').value = presetId;
        nameInput.value = '';
    }

    loadPreset(presetId) {
        if (!presetId) return;
        const preset = this.getSavedPresets()[presetId];
        if (!preset) { this.loadPresetList(); return; }
        this.currentPresetId = presetId;
        this.applyState(preset.state);
        document.getElementById('preset-select').value = presetId;
    }

    deleteCurrentPreset() {
        const presetId = document.getElementById('preset-select').value;
        if (!presetId) return;
        if (!confirm('Delete this preset?')) return;
        const presets = this.getSavedPresets();
        delete presets[presetId];
        this.writePresets(presets);
        this.currentPresetId = null;
        this.loadPresetList();
    }

    getSavedPresets() {
        try {
            const raw = JSON.parse(localStorage.getItem('audioPresets') || '{}');
            return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
        } catch (_) {
            return {};                          // corrupt storage must not brick the page
        }
    }

    writePresets(presets) {
        try {
            localStorage.setItem('audioPresets', JSON.stringify(presets));
        } catch (err) {
            alert('Could not save preset: browser storage is unavailable.');
        }
    }

    loadPresetList() {
        const presets = this.getSavedPresets();
        const select = document.getElementById('preset-select');
        const currentValue = select.value;

        select.innerHTML = '<option value="">Load a preset…</option>';
        Object.values(presets)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .forEach(preset => {
                const option = document.createElement('option');
                option.value = preset.id;
                option.textContent = preset.name;
                select.appendChild(option);
            });

        if (currentValue && presets[currentValue]) select.value = currentValue;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.audioPlayer = new AudioPlayer();
});
