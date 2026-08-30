/**
 * ROMANTIC AUDIO ENGINE (Web Audio API Synthesizer & Music Manager)
 * Generates rich acoustic piano, warm cello/strings harmony, and handles custom music tracks.
 */

class RomanticAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.currentPreset = 'piano-romance'; // 'piano-romance', 'lofi-nostalgia', 'celeste-chimes'
    this.masterGain = null;
    this.timerId = null;
    this.customAudio = null;
    this.isCustomTrack = false;
    
    // Notes for chord progression (D Major / B Minor Romantic cycle)
    // Frequencies in Hz
    this.noteMap = {
      'D3': 146.83, 'F#3': 185.00, 'A3': 220.00, 'B3': 246.94, 'C#4': 277.18,
      'D4': 293.66, 'E4': 329.63, 'F#4': 369.99, 'G4': 392.00, 'A4': 440.00,
      'B4': 493.88, 'C#5': 554.37, 'D5': 587.33, 'E5': 659.25, 'F#5': 739.99,
      'A5': 880.00, 'G3': 196.00
    };

    // Emotional progressions (D -> F#m -> G -> A -> Bm -> G -> Em -> A)
    this.progressions = [
      { bass: 'D3', pad: ['D4', 'F#4', 'A4'], melody: ['A4', 'F#4', 'D5', 'C#5', 'B4', 'A4'] },
      { bass: 'B3', pad: ['D4', 'F#4', 'B4'], melody: ['F#4', 'A4', 'D5', 'F#5', 'E5', 'D5'] },
      { bass: 'G3', pad: ['D4', 'G4', 'B4'], melody: ['B4', 'D5', 'G5', 'F#5', 'E5', 'D5'] },
      { bass: 'A3', pad: ['C#4', 'E4', 'A4'], melody: ['A4', 'C#5', 'E5', 'D5', 'C#5', 'A4'] }
    ];

    this.currentStep = 0;
    this.melodyIndex = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  start() {
    this.init();
    if (this.isCustomTrack && this.customAudio) {
      this.customAudio.play().catch(e => console.log('Audio autoplay prevented:', e));
      this.isPlaying = true;
      this.updateUI(true);
      return;
    }

    if (this.isPlaying) return;
    this.isPlaying = true;
    this.updateUI(true);
    this.playLoop();
  }

  stop() {
    if (this.customAudio) {
      this.customAudio.pause();
    }
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.updateUI(false);
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  playLoop() {
    if (!this.isPlaying || this.isCustomTrack) return;

    const chord = this.progressions[this.currentStep % this.progressions.length];
    
    // Play warm bass note
    this.playTone(this.noteMap[chord.bass], 'triangle', 2.8, 0.45);
    
    // Play soft warm string/synth pad
    chord.pad.forEach((noteName, idx) => {
      setTimeout(() => {
        if (!this.isPlaying) return;
        this.playTone(this.noteMap[noteName], 'sine', 3.2, 0.18 + (idx * 0.02));
      }, idx * 120);
    });

    // Play gentle piano arpeggio melody notes
    const noteDelay = 580;
    chord.melody.forEach((noteName, idx) => {
      setTimeout(() => {
        if (!this.isPlaying) return;
        this.playPianoNote(this.noteMap[noteName], 1.6, 0.35);
      }, (idx + 1) * noteDelay);
    });

    this.currentStep++;
    this.timerId = setTimeout(() => {
      this.playLoop();
    }, 4200);
  }

  playPianoNote(freq, duration = 1.8, velocity = 0.3) {
    if (!this.ctx || !freq) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'triangle';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 2, now); // soft harmonic

    // Warm low-pass filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(350, now + duration);

    // Piano attack and decay envelope
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(velocity, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  playTone(freq, type = 'sine', duration = 2.0, volume = 0.2) {
    if (!this.ctx || !freq) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  // SFX: Romantic Wax Seal crack chime
  playSealBreakSFX() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const chimeFreqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    chimeFreqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + (idx * 0.08));

      gain.gain.setValueAtTime(0.0001, now + (idx * 0.08));
      gain.gain.linearRampToValueAtTime(0.25, now + (idx * 0.08) + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (idx * 0.08) + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + (idx * 0.08));
      osc.stop(now + (idx * 0.08) + 1.2);
    });
  }

  // SFX: Heart Sparkle
  playSparkleSFX() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.3);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  setCustomAudio(fileUrl, title = 'Our Romantic Song') {
    if (this.customAudio) {
      this.customAudio.pause();
    }
    this.customAudio = new Audio(fileUrl);
    this.customAudio.loop = true;
    this.isCustomTrack = true;
    
    const titleEl = document.querySelector('.dock-song-title');
    if (titleEl) titleEl.textContent = title;
    
    if (this.isPlaying) {
      this.customAudio.play();
    }
  }

  updateUI(playing) {
    const navBtn = document.getElementById('music-toggle');
    const dockBtn = document.getElementById('dock-play-toggle');
    const equalizer = document.querySelectorAll('.music-equalizer span');

    if (navBtn) {
      navBtn.classList.toggle('playing', playing);
      navBtn.setAttribute('title', playing ? 'Mute Romantic Music' : 'Play Romantic Music');
    }
    if (dockBtn) {
      dockBtn.textContent = playing ? '⏸' : '▶';
    }
  }
}

window.romanticAudio = new RomanticAudioEngine();
