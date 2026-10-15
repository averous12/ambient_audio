// ═══════════════════════════════════════════════════════════════════════════
//  Ambient Mixer — sound definitions + player
//  Add a sound by adding an entry to SOUND_CONFIG; the UI builds itself.
// ═══════════════════════════════════════════════════════════════════════════
const SOUND_CONFIG = {
    rain: {
        name: "Rain",
        icon: "🌧",
        variants: [
            { url: 'audio/rain_low.wav', intensityRange: [1, 20], label: "Light Rain" },
            { url: 'audio/rain_mediumlow.wav', intensityRange: [21, 40], label: "Medium-Light Rain" },
            { url: 'audio/rain_medium.wav', intensityRange: [41, 60], label: "Medium Rain" },
            { url: 'audio/rain_mediumhigh.wav', intensityRange: [61, 80], label: "Medium-Heavy Rain" },
            { url: 'audio/rain_high.wav', intensityRange: [81, 100], label: "Heavy Rain" }
        ],
        behavior: 'layered',
        hasIntensityControl: true
    },
    thunder: {
        name: "Thunder",
        icon: "⚡",
        variants: [
            { url: 'audio/thunder_0.wav', label: "Distant Rumble" },
            { url: 'audio/thunder_1.wav', label: "Sharp Crack" },
            { url: 'audio/thunder_2.wav', label: "Long Roll" },
            { url: 'audio/thunder_3.wav', label: "Powerful Strike" },
            { url: 'audio/thunder_4.wav', label: "Short Crack" },
            { url: 'audio/thunder_5.wav', label: "Medium Roll" },
            { url: 'audio/thunder_6.wav', label: "Dramatic Strike" }
        ],
        behavior: 'random',
        minInterval: 5000,
        maxInterval: 30000,
        hasIntensityControl: true,
        defaultVolume: 70
    },
    wind: {
        name: "Wind",
        icon: "🍃",
        variants: [
            { url: 'audio/wind_1.wav', intensityRange: [1, 25], label: "Light Breeze" },
            { url: 'audio/wind_2.wav', intensityRange: [26, 50], label: "Gentle Wind" },
            { url: 'audio/wind_3.wav', intensityRange: [51, 75], label: "Strong Wind" },
            { url: 'audio/wind_4.wav', intensityRange: [76, 100], label: "Howling Wind" }
        ],
        behavior: 'layered',
        hasIntensityControl: true
    },
    forest: {
        name: "Forest",
        icon: "🌲",
        variants: [
            { url: 'audio/forest_2.wav', label: "Forest Ambience" }
        ],
        behavior: 'continuous',
        hasIntensityControl: false
    },
    river: {
        name: "River",
        icon: "🌊",
        variants: [
            { url: 'audio/river.wav', label: "Flowing River" }
        ],
        behavior: 'continuous',
        hasIntensityControl: false
    },
    birds: {
        name: "Birds",
        icon: "🐦",
        variants: [
            { url: 'audio/bird_1.wav', label: "Bird Song 1" },
            { url: 'audio/bird_2.wav', label: "Bird Song 2" },
            { url: 'audio/bird_3.wav', label: "Bird Song 3" }
        ],
        behavior: 'random',
        minInterval: 2500,
        maxInterval: 10000,
        hasIntensityControl: true,
        defaultVolume: 60
    },
    frogs: {
        name: "Frogs",
        icon: "🐸",
        variants: [
            { url: 'audio/frog_1.mp3', label: "Frog 1" },
            { url: 'audio/frog_2.mp3', label: "Frog 2" },
            { url: 'audio/frog_3.mp3', label: "Frog 3" },
            { url: 'audio/frog_4.mp3', label: "Frog 4" },
            { url: 'audio/frog_5.mp3', label: "Frog 5" },
            { url: 'audio/frog_6.mp3', label: "Frog 6" },
            { url: 'audio/frog_7.mp3', label: "Frog 7" }
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
const FADE_MS = 240;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

class AudioPlayer {
    constructor() {
        this.sounds = {};
        this.masterVolume = 0.7;
        this.currentPresetId = null;
        this.init();
    }

    init() {
        for (const [key, config] of Object.entries(SOUND_CONFIG)) {
            const defaultVolume = config.defaultVolume ?? 0;
            this.sounds[key] = {
                config,
                variants: [],
                currentVariant: null,
                intervals: [],
                stashedVolume: defaultVolume,   // remembered across mute/unmute
                currentVolume: defaultVolume / 100,
                currentIntensity: 0,
                isPlaying: false
            };
            this.preloadAudio(key);
        }

        this.createSoundControls();

        document.querySelector('.master-volume').addEventListener('input', (e) => {
            this.masterVolume = e.target.value / 100;
            this.updateAllVolumes();
            this.updateMasterReadout();
        });
        this.updateMasterReadout();

        this.setupPresetControls();
        this.loadPresetList();
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
            return;
        }

        // Intensity sounds only re-gain what is already playing; dragging a
        // volume slider never silently starts them.
        if (sound.currentVariant) this.applyGain(soundKey, sound.currentVariant);
    }

    updateMasterReadout() {
        const out = document.querySelector('.master-value');
        if (out) out.textContent = Math.round(this.masterVolume * 100) + '%';
    }

    updateAllVolumes() {
        for (const [key, sound] of Object.entries(this.sounds)) {
            if (sound.currentVariant) this.applyGain(key, sound.currentVariant);
        }
    }

    // ── intensity ──────────────────────────────────────────────────────────
    setIntensity(soundKey, intensity) {
        const sound = this.sounds[soundKey];
        intensity = clamp(Math.round(intensity), 0, 100);
        sound.currentIntensity = intensity;
        sound.isPlaying = intensity > 0;

        this.stopSound(soundKey);
        if (intensity === 0) return;

        switch (sound.config.behavior) {
            case 'layered':    this.playLayered(soundKey, intensity); break;
            case 'random':     this.startRandom(soundKey, intensity); break;
            case 'continuous': this.startContinuous(soundKey);        break;
        }
    }

    // One looping variant; gain follows the volume slider.
    startContinuous(soundKey) {
        const sound = this.sounds[soundKey];
        if (sound.isPlaying && sound.currentVariant) return;
        const variant = sound.variants[0];
        if (!variant) return;

        variant.audio.loop = true;
        try { variant.audio.currentTime = 0; } catch (_) { /* not seekable yet */ }
        variant.audio.volume = 0;
        sound.currentVariant = variant;
        sound.isPlaying = true;
        this.playElement(variant.audio);
        this.applyGain(soundKey, variant, { fade: true });
    }

    // Layered: pick the variant whose intensity band matches.
    playLayered(soundKey, intensity) {
        const sound = this.sounds[soundKey];
        const variant = sound.variants.find(v =>
            v.intensityRange && intensity >= v.intensityRange[0] && intensity <= v.intensityRange[1]
        );
        if (!variant) return;

        variant.audio.loop = true;
        try { variant.audio.currentTime = 0; } catch (_) { /* not seekable yet */ }
        variant.audio.volume = 0;
        sound.currentVariant = variant;
        this.playElement(variant.audio);
        this.applyGain(soundKey, variant, { fade: true });
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
        if (!variant) { sound.isPlaying = false; return; }
        this.rampGain(soundKey, variant, 0, FADE_MS);
        setTimeout(() => {
            if (sound.currentVariant === variant && sound.currentVolume === 0) {
                this.stopSound(soundKey);
                sound.isPlaying = false;
            }
        }, FADE_MS + 30);
    }

    stopSound(soundKey) {
        const sound = this.sounds[soundKey];
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
                <div class="icon" aria-hidden="true">${config.icon}</div>
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
        const card = knob.closest('.card');
        if (card) {
            const readout = card.querySelector('.readout');
            if (readout) {
                readout.textContent = value === 0 ? 'Off' : value + '%';
                readout.classList.toggle('on', value > 0);
            }
        }
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
            }
        }
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
