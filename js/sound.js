// Sound Manager - handles sound effects and music

const SoundManager = {
    sounds: {},
    music: null,
    musicVolume: 0.3,
    sfxVolume: 0.5,
    muted: false,
    initialized: false,

    init() {
        // Create sounds using Web Audio API oscillators (no external files needed)
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.initialized = true;
    },

    // Resume audio context (needed after user interaction)
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    },

    // Play synthesized sound effects
    play(soundName) {
        if (this.muted || !this.initialized) return;
        this.resume();

        switch (soundName) {
            case 'shoot':
                this.playTone(880, 0.1, 'square', 0.3);
                break;
            case 'hit':
                this.playTone(220, 0.15, 'sawtooth', 0.4);
                break;
            case 'hurt':
                this.playTone(150, 0.2, 'square', 0.5);
                this.playTone(100, 0.3, 'square', 0.3);
                break;
            case 'death':
                this.playTone(200, 0.1, 'square', 0.4);
                setTimeout(() => this.playTone(150, 0.1, 'square', 0.3), 100);
                setTimeout(() => this.playTone(100, 0.2, 'square', 0.3), 200);
                break;
            case 'jump':
                this.playSweep(300, 600, 0.15, 'square', 0.2);
                break;
            case 'pickup':
                this.playTone(523, 0.1, 'sine', 0.3);
                setTimeout(() => this.playTone(659, 0.1, 'sine', 0.3), 80);
                setTimeout(() => this.playTone(784, 0.15, 'sine', 0.3), 160);
                break;
            case 'powerup':
                this.playTone(440, 0.1, 'sine', 0.4);
                setTimeout(() => this.playTone(554, 0.1, 'sine', 0.4), 100);
                setTimeout(() => this.playTone(659, 0.1, 'sine', 0.4), 200);
                setTimeout(() => this.playTone(880, 0.2, 'sine', 0.4), 300);
                break;
            case 'enemyDeath':
                this.playNoise(0.15, 0.4);
                this.playTone(200, 0.1, 'square', 0.3);
                break;
            case 'bossDeath':
                // Play dramatic boss death sound immediately (no setTimeout)
                this.playNoise(0.3, 0.5);
                this.playTone(150, 0.3, 'square', 0.5);
                this.playTone(100, 0.4, 'sawtooth', 0.4);
                break;
            case 'levelComplete':
                const notes = [523, 659, 784, 1047];
                notes.forEach((freq, i) => {
                    setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.4), i * 150);
                });
                break;
            case 'gameOver':
                this.playTone(294, 0.3, 'square', 0.4);
                setTimeout(() => this.playTone(262, 0.3, 'square', 0.4), 300);
                setTimeout(() => this.playTone(220, 0.5, 'square', 0.4), 600);
                break;
            case 'melee':
                this.playSweep(400, 200, 0.1, 'sawtooth', 0.3);
                break;
            case 'select':
                this.playTone(660, 0.08, 'square', 0.2);
                break;
            case 'pause':
                this.playTone(440, 0.1, 'square', 0.3);
                break;
        }
    },

    // Play a simple tone
    playTone(frequency, duration, type = 'square', volume = 0.5) {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(volume * this.sfxVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    },

    // Play a frequency sweep
    playSweep(startFreq, endFreq, duration, type = 'square', volume = 0.5) {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);

        gainNode.gain.setValueAtTime(volume * this.sfxVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    },

    // Play noise (for explosions, impacts)
    playNoise(duration, volume = 0.5) {
        if (!this.audioContext) return;

        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        noise.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(volume * this.sfxVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        noise.start(this.audioContext.currentTime);
        noise.stop(this.audioContext.currentTime + duration);
    },

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    },

    setVolume(sfx, music) {
        if (sfx !== undefined) this.sfxVolume = Math.max(0, Math.min(1, sfx));
        if (music !== undefined) this.musicVolume = Math.max(0, Math.min(1, music));
    }
};
