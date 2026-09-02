import { SoundEffectType, AmbientSoundType } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientGainNode: GainNode | null = null;
  private ambientSource: AudioNode | null = null;
  private rainInterval: number | null = null;
  private tickingOsc: OscillatorNode | null = null;
  private currentAmbientType: AmbientSoundType | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- UI Micro-Interactions (Click, Pop, Success) ---
  public playClick() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Audio context error ignore
    }
  }

  public playTaskComplete() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.06);

        gain.gain.setValueAtTime(0, this.ctx!.currentTime + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.12, this.ctx!.currentTime + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + idx * 0.06 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.06);
        osc.stop(this.ctx!.currentTime + idx * 0.06 + 0.4);
      });
    } catch {
      // Audio context error ignore
    }
  }

  public playSuccess() {
    this.playTaskComplete();
  }

  public playTick(volume = 0.1) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.015);

      gain.gain.setValueAtTime(volume * 0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.015);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.015);
    } catch {
      // Ignore
    }
  }

  // --- Session Completed Alerts ---
  public playAlert(type: SoundEffectType = 'crystal', volume = 0.8) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(Math.min(Math.max(volume, 0.1), 1.0), this.ctx.currentTime);
      masterGain.connect(this.ctx.destination);

      switch (type) {
        case 'crystal':
          // Harmonious shimmering crystal bell
          [880, 1318.51, 1760, 2637].forEach((freq, i) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.08);

            gain.gain.setValueAtTime(0.18 / (i + 1), this.ctx!.currentTime + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + i * 0.08 + 1.8);

            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(this.ctx!.currentTime + i * 0.08);
            osc.stop(this.ctx!.currentTime + i * 0.08 + 1.8);
          });
          break;

        case 'bowl':
          // Deep Tibetan singing bowl harmonic
          const fundamental = 261.63; // C4
          [1, 2.76, 5.4, 8.9].forEach((harmonic, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(fundamental * harmonic, this.ctx!.currentTime);

            const initialGain = 0.25 / (idx * 1.5 + 1);
            gain.gain.setValueAtTime(initialGain, this.ctx!.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + 3.2);

            osc.connect(gain);
            gain.connect(masterGain);
            osc.start();
            osc.stop(this.ctx!.currentTime + 3.2);
          });
          break;

        case 'marimba':
          // Warm wooden marimba chord
          [440, 554.37, 659.25, 880].forEach((freq, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.07);

            gain.gain.setValueAtTime(0.2, this.ctx!.currentTime + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + idx * 0.07 + 0.9);

            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(this.ctx!.currentTime + idx * 0.07);
            osc.stop(this.ctx!.currentTime + idx * 0.07 + 0.9);
          });
          break;

        case 'digital':
          // Modern pleasant electronic beep sequence
          [587.33, 880, 1174.66].forEach((freq, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.1);

            gain.gain.setValueAtTime(0.15, this.ctx!.currentTime + idx * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.1 + 0.25);

            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(this.ctx!.currentTime + idx * 0.1);
            osc.stop(this.ctx!.currentTime + idx * 0.1 + 0.25);
          });
          break;

        case 'softChime':
        default:
          [659.25, 987.77].forEach((freq, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.15);

            gain.gain.setValueAtTime(0.2, this.ctx!.currentTime + idx * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + idx * 0.15 + 1.2);

            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(this.ctx!.currentTime + idx * 0.15);
            osc.stop(this.ctx!.currentTime + idx * 0.15 + 1.2);
          });
          break;
      }
    } catch {
      // Ignore
    }
  }

  // --- Continuous Ambient Sound Synthesis ---
  public startAmbient(type: AmbientSoundType, volume = 0.5) {
    try {
      this.stopAmbient();
      this.initContext();
      if (!this.ctx) return;

      this.currentAmbientType = type;
      this.ambientGainNode = this.ctx.createGain();
      this.ambientGainNode.gain.setValueAtTime(0, this.ctx.currentTime);
      this.ambientGainNode.gain.linearRampToValueAtTime(volume * 0.35, this.ctx.currentTime + 1.2);
      this.ambientGainNode.connect(this.ctx.destination);

      if (type === 'white') {
        // High quality White noise buffer with subtle lowpass filter
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1800;

        whiteNoise.connect(filter);
        filter.connect(this.ambientGainNode);
        whiteNoise.start();
        this.ambientSource = whiteNoise;
      } else if (type === 'brown') {
        // Deep Brown noise (integrated white noise)
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // boost gain for brown rumble
        }

        const brownNoise = this.ctx.createBufferSource();
        brownNoise.buffer = noiseBuffer;
        brownNoise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 450;

        brownNoise.connect(filter);
        filter.connect(this.ambientGainNode);
        brownNoise.start();
        this.ambientSource = brownNoise;
      } else if (type === 'binaural') {
        // 40Hz Gamma Focus Beat (200Hz Left / 240Hz Right)
        const oscLeft = this.ctx.createOscillator();
        const oscRight = this.ctx.createOscillator();
        const merger = this.ctx.createChannelMerger(2);

        oscLeft.type = 'sine';
        oscLeft.frequency.value = 200;

        oscRight.type = 'sine';
        oscRight.frequency.value = 240; // 40Hz differential

        oscLeft.connect(merger, 0, 0);
        oscRight.connect(merger, 0, 1);

        merger.connect(this.ambientGainNode);
        oscLeft.start();
        oscRight.start();
        this.ambientSource = oscLeft;
      } else if (type === 'rain') {
        // Rain stream: pink/brown continuous noise + randomized gentle droplets
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.15;
        }

        const rainNoise = this.ctx.createBufferSource();
        rainNoise.buffer = noiseBuffer;
        rainNoise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 0.7;

        rainNoise.connect(filter);
        filter.connect(this.ambientGainNode);
        rainNoise.start();
        this.ambientSource = rainNoise;

        // Add soft droplet simulator
        this.rainInterval = window.setInterval(() => {
          if (!this.ctx || !this.ambientGainNode) return;
          if (Math.random() > 0.4) {
            const dropOsc = this.ctx.createOscillator();
            const dropGain = this.ctx.createGain();
            dropOsc.type = 'sine';
            dropOsc.frequency.setValueAtTime(1400 + Math.random() * 800, this.ctx.currentTime);
            dropOsc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.03);

            dropGain.gain.setValueAtTime(0.02 * volume, this.ctx.currentTime);
            dropGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.03);

            dropOsc.connect(dropGain);
            dropGain.connect(this.ambientGainNode);
            dropOsc.start();
            dropOsc.stop(this.ctx.currentTime + 0.03);
          }
        }, 120);
      }
    } catch {
      // Ignore
    }
  }

  public setAmbientVolume(volume: number) {
    if (this.ambientGainNode && this.ctx) {
      this.ambientGainNode.gain.setValueAtTime(volume * 0.35, this.ctx.currentTime);
    }
  }

  public stopAmbient() {
    if (this.rainInterval) {
      clearInterval(this.rainInterval);
      this.rainInterval = null;
    }
    if (this.ambientGainNode && this.ctx) {
      this.ambientGainNode.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      setTimeout(() => {
        try {
          if (this.ambientSource) {
            (this.ambientSource as AudioScheduledSourceNode).stop?.();
            this.ambientSource.disconnect();
            this.ambientSource = null;
          }
        } catch {
          // Ignore
        }
      }, 500);
    }
    this.currentAmbientType = null;
  }

  public getActiveAmbient(): AmbientSoundType | null {
    return this.currentAmbientType;
  }
}

export const sound = new SoundEngine();
