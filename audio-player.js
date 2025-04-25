// Sound definitions - can be moved to a separate config file if desired
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
        hasIntensityControl: true, // No knob needed
        randomize: false,
        defaultVolume: 0
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
        intensityToIntervalRatio: 0.7, // Higher intensity = more frequent
        hasIntensityControl: true,
        defaultVolume: 0
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
        randomize: true,
        hasIntensityControl: true,
        defaultVolume: 0
    },
    forest: {
        name: "Forest",
        icon: "🌲",
        variants: [
            { url: 'audio/forest_2.wav', label: "Forest Ambience" }
        ],
        behavior: 'continuous',
        randomize: false,
        hasIntensityControl: false, // No knob needed
        defaultVolume: 0
    },
    river: {
        name: "River",
        icon: "🌊",
        variants: [
            { url: 'audio/river.wav', label: "Flowing River" }
        ],
        behavior: 'continuous',
        randomize: false,
        hasIntensityControl: false, // No knob needed
        defaultVolume: 0
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
        intensityToIntervalRatio: 0.5,
        hasIntensityControl: true,
        defaultVolume: 0
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
        intensityToIntervalRatio: 0.6,
        hasIntensityControl: true, // No knob needed
        defaultVolume: 0
    }
};
class AudioPlayer {
    constructor() {
        this.sounds = {};
        this.masterVolume = 0.7;
        this.currentPresetId = null;
        this.init();
    }

    init() {
        // Initialize all sounds
        for (const [key, config] of Object.entries(SOUND_CONFIG)) {
            this.sounds[key] = {
                config,
                activeVariants: [],
                intervals: [],
                currentVolume: config.defaultVolume / 100 || 0.5,
                currentIntensity: 0,
                isPlaying: false,
                initialized: false // Track if sound has been set up
            };
            
            // Preload audio
            this.preloadAudio(key);
        }
        // Create UI controls
        this.createSoundControls();
        this.initializeNonIntensitySounds();
        // Set up master volume control
        document.querySelector('.master-volume').addEventListener('input', (e) => {
            this.masterVolume = e.target.value / 100;
            this.updateAllVolumes();
        });

        // Initialize knobs
        document.querySelectorAll('.knob.intensity').forEach(knob => {
            this.setupKnobRotation(knob);
        });
        this.setupPresetControls(); // New preset setup
        this.loadPresetList();     // Load saved presets
    }

    preloadAudio(soundKey) {
        const sound = this.sounds[soundKey];
        sound.variants = sound.config.variants.map(variant => {
            const audio = new Audio(variant.url);
            audio.loop = variant.loop || false;
            return { ...variant, audio };
        });
    }

    initializeNonIntensitySounds() {
        for (const [key, sound] of Object.entries(this.sounds)) {
            if (sound.config.hasIntensityControl === false && sound.config.defaultVolume > 0) {
                this.playNonIntensitySound(key);
            }
        }
    }
    
    playNonIntensitySound(soundKey) {
        const sound = this.sounds[soundKey];
        if (sound.initialized) return;
        
        const variant = sound.variants[0];
        variant.audio.volume = sound.currentVolume * this.masterVolume;
        variant.audio.loop = true;
        variant.audio.play();
        sound.activeVariants = [variant];
        sound.isPlaying = true;
        sound.initialized = true;
    }

    createSoundControls() {
        const grid = document.getElementById('sound-grid');
        
        for (const [key, sound] of Object.entries(this.sounds)) {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.sound = key;
            // Add no-knob class if sound doesn't use intensity control
            if (sound.config.hasIntensityControl === false) {
                card.classList.add('no-knob');
            }
            
            // Only include knob if the sound uses intensity control
            const knobHtml = sound.config.hasIntensityControl !== false 
                ? `<div class="knob intensity" data-value="0"></div>`
                : '';
            
            card.innerHTML = `
                <div class="icon">${sound.config.icon}</div>
                <input type="range" class="slider volume" min="0" max="100" 
                    value="${sound.config.defaultVolume || 0}">
                ${knobHtml}
            `;
            
            // Set up volume control
            const volumeSlider = card.querySelector('.volume');
            volumeSlider.addEventListener('input', (e) => {
                const volume = e.target.value / 100;
                this.setVolume(key, volume);
                // Auto-play non-intensity sounds on first volume change
                if (sound.config.hasIntensityControl === false && !sound.initialized && volume > 0) {
                    this.playNonIntensitySound(key);
                }
            });
            
            grid.appendChild(card);
        }
    }

    setupKnobRotation(knob) {
        let isDragging = false;
        let startAngle = 0;
        let currentRotation = 45 + parseInt(knob.dataset.value) * 2.7;

        knob.style.transform = `rotate(${currentRotation}deg)`;

        knob.addEventListener('mousedown', (e) => {
            knob.style.transition = 'none';
            isDragging = true;
            const rect = knob.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
            e.preventDefault();
        });

        const handleMove = (clientX, clientY) => {
            if (!isDragging) return;
            
            const rect = knob.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            let angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
            
            let diff = angle - startAngle;
        
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;
        
            const maxStep = 5;
            diff = Math.max(-maxStep, Math.min(maxStep, diff));
        
            currentRotation += diff;
            currentRotation = Math.max(45, Math.min(315, currentRotation));
        
            knob.style.transition = 'transform 0.05s ease-out';
            knob.style.transform = `rotate(${currentRotation}deg)`;
        
            const value = Math.round((currentRotation - 45) / 2.7);
            knob.dataset.value = value;
        
            startAngle = angle;
        };

        const handleEnd = () => {
            if (isDragging) {
                isDragging = false;
                const value = parseInt(knob.dataset.value);
                const soundKey = knob.closest('.card').dataset.sound;
                this.setIntensity(soundKey, value);
            }
        };

        document.addEventListener('mousemove', (e) => {
            handleMove(e.clientX, e.clientY);
        });

        document.addEventListener('mouseup', handleEnd);

        // Touch support
        knob.addEventListener('touchstart', (e) => {
            isDragging = true;
            const touch = e.touches[0];
            const rect = knob.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            startAngle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX) * (180 / Math.PI);
            e.preventDefault();
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
            e.preventDefault();
        });

        document.addEventListener('touchend', handleEnd);
    }

    setVolume(soundKey, volume) {
        const sound = this.sounds[soundKey];
        sound.currentVolume = volume;
        
        // Update all active variants
        sound.activeVariants.forEach(variant => {
            variant.audio.volume = volume * this.masterVolume;
        });
    }

    setIntensity(soundKey, intensity) {
        const sound = this.sounds[soundKey];
        const config = sound.config;
        sound.currentIntensity = intensity;
        sound.isPlaying = intensity > 0;
        
        // Clear any existing playback
        this.stopSound(soundKey);
        
        // Handle different sound behaviors
        switch(config.behavior) {
            case 'layered':
                this.handleLayeredBehavior(soundKey, intensity);
                break;
            case 'random':
                this.handleRandomBehavior(soundKey, intensity);
                break;
            case 'continuous':
                this.handleContinuousBehavior(soundKey, intensity);
                break;
        }
    }

    handleLayeredBehavior(soundKey, intensity) {
        const sound = this.sounds[soundKey];
        
        // Find appropriate variant based on intensity
        const variant = sound.variants.find(v => 
            intensity >= v.intensityRange[0] && intensity <= v.intensityRange[1]
        );
        
        if (variant) {
            variant.audio.volume = sound.currentVolume * this.masterVolume;
            variant.audio.loop = true;
            variant.audio.play();
            sound.activeVariants = [variant];
        }
    }

    handleRandomBehavior(soundKey, intensity) {
        const sound = this.sounds[soundKey];
        const config = sound.config;
        
        // Calculate interval based on intensity (higher intensity = more frequent)
        const minInterval = config.minInterval || 5000;
        const maxInterval = config.maxInterval || 15000;
        const intervalRange = maxInterval - minInterval;
        const interval = minInterval + intervalRange * (1 - (intensity / 100));
        
        sound.intervals.push(setInterval(() => {
            // Pick a random variant
            const randomIndex = Math.floor(Math.random() * sound.variants.length);
            const variant = sound.variants[randomIndex];
            
            variant.audio.volume = sound.currentVolume * this.masterVolume;
            variant.audio.currentTime = 0;
            variant.audio.play();
            
            // For random behaviors, we don't keep track of active variants
            // since they're one-off plays
        }, interval));
    }

    handleContinuousBehavior(soundKey, intensity) {
        const sound = this.sounds[soundKey];
        
        // For continuous sounds, just play the first variant
        // (could enhance this to handle intensity-based variants)
        const variant = sound.variants[0];
        variant.audio.volume = sound.currentVolume * this.masterVolume;
        variant.audio.loop = true;
        variant.audio.play();
        sound.activeVariants = [variant];
    }

    stopSound(soundKey) {
        const sound = this.sounds[soundKey];
        
        // Stop all active variants
        sound.activeVariants.forEach(variant => {
            variant.audio.pause();
            variant.audio.currentTime = 0;
        });
        sound.activeVariants = [];
        
        // Clear any intervals
        sound.intervals.forEach(interval => clearInterval(interval));
        sound.intervals = [];
    }

    updateAllVolumes() {
        for (const [key, sound] of Object.entries(this.sounds)) {
            sound.activeVariants.forEach(variant => {
                variant.audio.volume = sound.currentVolume * this.masterVolume;
            });
        }
    }

    setupPresetControls() {
        document.getElementById('save-preset').addEventListener('click', () => this.saveCurrentPreset());
        document.getElementById('delete-preset').addEventListener('click', () => this.deleteCurrentPreset());
        document.getElementById('preset-select').addEventListener('change', (e) => this.loadPreset(e.target.value));
    }

    getCurrentState() {
        const state = {
            masterVolume: this.masterVolume,
            sounds: {}
        };

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
        this.masterVolume = state.masterVolume;
        document.querySelector('.master-volume').value = this.masterVolume * 100;

        for (const [key, soundState] of Object.entries(state.sounds)) {
            const sound = this.sounds[key];
            if (sound) {
                sound.currentVolume = soundState.volume;
                sound.currentIntensity = soundState.intensity;
                
                // Update UI
                const card = document.querySelector(`.card[data-sound="${key}"]`);
                if (card) {
                    card.querySelector('.volume').value = soundState.volume * 100;
                    const knob = card.querySelector('.knob');
                    knob.dataset.value = soundState.intensity;
                    knob.style.transform = `rotate(${45 + soundState.intensity * 2.7}deg)`;
                }

                // Restart playback if it was playing
                if (soundState.isPlaying) {
                    this.setIntensity(key, soundState.intensity);
                } else {
                    this.stopSound(key);
                }
            }
        }
    }

    saveCurrentPreset() {
        const nameInput = document.getElementById('preset-name');
        const presetName = nameInput.value.trim();
        
        if (!presetName) {
            alert("Please enter a preset name");
            return;
        }

        const presets = this.getSavedPresets();
        const presetId = Date.now().toString();
        
        presets[presetId] = {
            id: presetId,
            name: presetName,
            state: this.getCurrentState(),
            createdAt: new Date().toISOString()
        };

        localStorage.setItem('audioPresets', JSON.stringify(presets));
        this.loadPresetList();
        nameInput.value = '';
        
        // Briefly highlight the new preset in the list
        const select = document.getElementById('preset-select');
        select.value = presetId;
        setTimeout(() => {
            select.classList.add('highlight');
            setTimeout(() => select.classList.remove('highlight'), 1000);
        }, 100);
    }

    loadPreset(presetId) {
        if (!presetId) return;
        
        const presets = this.getSavedPresets();
        const preset = presets[presetId];
        
        if (preset) {
            this.currentPresetId = presetId;
            this.applyState(preset.state);
            
            // Update the select to show the loaded preset
            document.getElementById('preset-select').value = presetId;
        }
    }

    deleteCurrentPreset() {
        const presetId = document.getElementById('preset-select').value;
        if (!presetId) return;
        
        if (confirm("Delete this preset?")) {
            const presets = this.getSavedPresets();
            delete presets[presetId];
            localStorage.setItem('audioPresets', JSON.stringify(presets));
            this.loadPresetList();
            this.currentPresetId = null;
        }
    }

    getSavedPresets() {
        return JSON.parse(localStorage.getItem('audioPresets') || '{}');
    }

    loadPresetList() {
        const presets = this.getSavedPresets();
        const select = document.getElementById('preset-select');
        
        // Save current selection
        const currentValue = select.value;
        
        // Clear and rebuild options
        select.innerHTML = '<option value="">Load a preset...</option>';
        
        // Add presets sorted by creation date (newest first)
        Object.values(presets)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .forEach(preset => {
                const option = document.createElement('option');
                option.value = preset.id;
                option.textContent = preset.name;
                select.appendChild(option);
            });
        
        // Restore selection if it still exists
        if (currentValue && presets[currentValue]) {
            select.value = currentValue;
        }
    }
}

// Initialize the player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AudioPlayer();
});