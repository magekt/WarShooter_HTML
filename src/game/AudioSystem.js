import * as Tone from 'tone';

class AudioSystem {
  constructor() {
    this.initialized = false;
    this.synth = null;
    this.noiseSynth = null;
    this.metalSynth = null;
    this.magicSynth = null;
  }

  async init() {
    if (this.initialized) return;
    try {
      await Tone.start();
      
      // Gunshot noise synthesizer
      this.noiseSynth = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.15, sustain: 0 }
      }).toDestination();
      this.noiseSynth.volume.value = -6;

      // PolySynth for hits / attacks
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.2 }
      }).toDestination();
      this.synth.volume.value = -10;

      // MetalSynth for metallic hits / swords / reloads
      this.metalSynth = new Tone.MetalSynth({
        frequency: 250,
        envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5
      }).toDestination();
      this.metalSynth.volume.value = -16;

      // Magic / Qi Synth for Wuxia / Chakra spells
      this.magicSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.05, decay: 0.3, sustain: 0.1, release: 0.4 }
      }).toDestination();
      this.magicSynth.volume.value = -8;

      this.initialized = true;
    } catch (e) {
      console.warn("Audio initialization delayed or blocked by browser user gesture policy", e);
    }
  }

  playShoot(weaponType = 'rifle') {
    if (!this.initialized) return;
    try {
      if (weaponType === 'shotgun') {
        this.noiseSynth.triggerAttackRelease('0.2');
        this.synth.triggerAttackRelease(['C2', 'E2'], '0.15');
      } else if (weaponType === 'pistol') {
        this.noiseSynth.triggerAttackRelease('0.08');
      } else { // Rifle
        this.noiseSynth.triggerAttackRelease('0.05');
        this.synth.triggerAttackRelease('G2', '0.05');
      }
    } catch (e) {}
  }

  playSwordSlash() {
    if (!this.initialized) return;
    try {
      this.metalSynth.triggerAttackRelease('0.08');
      this.synth.triggerAttackRelease('E4', '0.08');
    } catch (e) {}
  }

  playChakraSpell() {
    if (!this.initialized) return;
    try {
      this.magicSynth.triggerAttackRelease(['G4', 'B4', 'D5'], '0.2');
    } catch (e) {}
  }

  playHit() {
    if (!this.initialized) return;
    try {
      this.synth.triggerAttackRelease('C5', '0.05');
    } catch (e) {}
  }

  playDamage() {
    if (!this.initialized) return;
    try {
      this.synth.triggerAttackRelease(['F2', 'A2'], '0.2');
    } catch (e) {}
  }

  playReload() {
    if (!this.initialized) return;
    try {
      this.metalSynth.triggerAttackRelease('0.1');
    } catch (e) {}
  }

  playPowerup() {
    if (!this.initialized) return;
    try {
      this.synth.triggerAttackRelease(['C4', 'E4', 'G4', 'C5'], '0.1');
    } catch (e) {}
  }

  playWaveStart() {
    if (!this.initialized) return;
    try {
      this.synth.triggerAttackRelease(['A3', 'D4', 'A4'], '0.4');
    } catch (e) {}
  }
}

export const soundManager = new AudioSystem();
