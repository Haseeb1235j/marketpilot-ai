/**
 * MarketPilot AI — Voice Narration Engine
 * Uses Web Speech API (browser-native, free, no API key)
 */

class VoiceNarrationEngine {
  constructor() {
    this.synth = window.speechSynthesis;
    this.currentUtterance = null;
    this.isSupported = 'speechSynthesis' in window;
    this.isMuted = false;
    this.currentSpeed = 1;
    this.onEndCallback = null;
  }

  speak(text, speed = 1, onEnd = null) {
    if (!this.isSupported || this.isMuted || !text) return;
    
    // Cancel any current speech
    this.stop();

    this.currentSpeed = speed;
    this.onEndCallback = onEnd;

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map playback speed to speech rate
    // Web Speech rate range: 0.1 to 10
    // Our speed range: 0.2x to 3x
    utterance.rate = Math.min(Math.max(speed * 0.9, 0.2), 3.5);
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Use a professional-sounding voice if available
    const voices = this.synth.getVoices();
    const preferredVoices = [
      'Google US English',
      'Microsoft David Desktop',
      'Alex',
      'Karen',
      'Daniel',
      'en-US',
    ];
    
    for (const preferred of preferredVoices) {
      const voice = voices.find(v => 
        v.name.includes(preferred) || v.lang.includes('en-US') || v.lang.includes('en-GB')
      );
      if (voice) { utterance.voice = voice; break; }
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      if (this.onEndCallback) this.onEndCallback();
    };

    utterance.onerror = (e) => {
      // Silent fail — text still shows even without voice
      console.warn('Voice narration error:', e.error);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  pause() {
    if (this.isSupported && this.synth.speaking) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.isSupported && this.synth.paused) {
      this.synth.resume();
    }
  }

  stop() {
    if (this.isSupported) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted) this.stop();
  }

  updateSpeed(newSpeed) {
    // Speed changed — restart current narration at new speed if speaking
    // This is handled by the VideoBreakdown component
    this.currentSpeed = newSpeed;
  }

  get isSpeaking() {
    return this.isSupported && this.synth.speaking;
  }

  get isPaused() {
    return this.isSupported && this.synth.paused;
  }
}

// Singleton instance
export const voiceEngine = new VoiceNarrationEngine();

// Wait for voices to load (Chrome requires this)
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    // Voices now available
  };
}
