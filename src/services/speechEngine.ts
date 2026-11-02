import { AccentVoiceProfile } from '../types';

export interface SpeechEngineCallbacks {
  onSentenceChange?: (sentenceIndex: number, text: string) => void;
  onPageComplete?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  onStateChange?: (isPlaying: boolean, isPaused: boolean) => void;
}

class SpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private availableVoices: SpeechSynthesisVoice[] = [];
  private isInitialized = false;

  private currentProfile: AccentVoiceProfile | null = null;
  private playbackRate = 1.0;
  private pitch = 1.0;
  private volume = 1.0;

  private sentences: string[] = [];
  private currentSentenceIdx = 0;
  private isPlaying = false;
  private isPaused = false;
  private callbacks: SpeechEngineCallbacks = {};

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
    }
  }

  private initVoices() {
    if (!this.synth) return;
    const loadVoices = () => {
      this.availableVoices = this.synth!.getVoices();
      this.isInitialized = true;
    };
    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  public getAvailableSystemVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    if (!this.availableVoices.length) {
      this.availableVoices = this.synth.getVoices();
    }
    return this.availableVoices;
  }

  /**
   * Finds the best browser voice for a given accent profile
   */
  public findBestVoice(profile: AccentVoiceProfile): SpeechSynthesisVoice | null {
    const voices = this.getAvailableSystemVoices();
    if (!voices.length) return null;

    const targetLang = profile.langCode.toLowerCase();
    const targetCountry = profile.country.toLowerCase();

    // 1. Exact match on lang code (e.g. 'es-mx' === 'es-mx')
    const exactMatch = voices.find((v) => v.lang.toLowerCase() === targetLang);
    if (exactMatch) return exactMatch;

    // 2. Match on lang code with hyphen/underscore variants (es_MX or es-MX)
    const normalizedTarget = targetLang.replace('-', '_');
    const variantMatch = voices.find(
      (v) => v.lang.toLowerCase().replace('-', '_') === normalizedTarget
    );
    if (variantMatch) return variantMatch;

    // 3. Name mentions country (e.g., "Google español de Estados Unidos" or "Mexico")
    const nameMatch = voices.find(
      (v) =>
        v.name.toLowerCase().includes(targetCountry) ||
        (profile.id === 'es-MX' && v.name.toLowerCase().includes('mexic')) ||
        (profile.id === 'es-AR' && v.name.toLowerCase().includes('argentin')) ||
        (profile.id === 'es-CO' && v.name.toLowerCase().includes('colombia')) ||
        (profile.id === 'es-ES' && (v.name.toLowerCase().includes('spain') || v.name.toLowerCase().includes('españa')))
    );
    if (nameMatch) return nameMatch;

    // 4. Same language root (e.g. any 'es-*' voice for Spanish profiles)
    const langPrefix = targetLang.split('-')[0];
    const generalMatch = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
    if (generalMatch) return generalMatch;

    // 5. Default voice
    return voices.find((v) => v.default) || voices[0] || null;
  }

  public setCallbacks(callbacks: SpeechEngineCallbacks) {
    this.callbacks = callbacks;
  }

  public setRate(rate: number) {
    this.playbackRate = Math.min(Math.max(rate, 0.5), 2.5);
    if (this.isPlaying && !this.isPaused) {
      // Re-read current sentence with new rate
      this.playSentenceAt(this.currentSentenceIdx);
    }
  }

  public setPitch(pitch: number) {
    this.pitch = Math.min(Math.max(pitch, 0.5), 1.8);
    if (this.isPlaying && !this.isPaused) {
      this.playSentenceAt(this.currentSentenceIdx);
    }
  }

  public setVolume(volume: number) {
    this.volume = Math.min(Math.max(volume, 0), 1);
  }

  public setProfile(profile: AccentVoiceProfile) {
    this.currentProfile = profile;
    if (this.isPlaying && !this.isPaused) {
      this.playSentenceAt(this.currentSentenceIdx);
    }
  }

  public loadSentences(sentences: string[], startIndex = 0) {
    this.sentences = sentences;
    this.currentSentenceIdx = Math.max(0, Math.min(startIndex, sentences.length - 1));
  }

  public play() {
    if (!this.synth) {
      this.callbacks.onError?.('La síntesis de voz no está soportada en este navegador.');
      return;
    }

    if (this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.isPlaying = true;
      this.callbacks.onStateChange?.(true, false);
      return;
    }

    if (!this.sentences.length) {
      this.callbacks.onError?.('No hay texto para reproducir.');
      return;
    }

    this.isPlaying = true;
    this.isPaused = false;
    this.callbacks.onStateChange?.(true, false);
    this.playSentenceAt(this.currentSentenceIdx);
  }

  public pause() {
    if (!this.synth) return;
    this.synth.pause();
    this.isPaused = true;
    this.isPlaying = false;
    this.callbacks.onStateChange?.(false, true);
  }

  public stop() {
    if (!this.synth) return;
    this.synth.cancel();
    this.isPlaying = false;
    this.isPaused = false;
    this.callbacks.onStateChange?.(false, false);
  }

  public playSentenceAt(index: number) {
    if (!this.synth) return;

    this.synth.cancel();

    if (index >= this.sentences.length) {
      this.isPlaying = false;
      this.isPaused = false;
      this.callbacks.onStateChange?.(false, false);
      this.callbacks.onPageComplete?.();
      return;
    }

    this.currentSentenceIdx = Math.max(0, index);
    const textToSpeak = this.sentences[this.currentSentenceIdx];

    if (!textToSpeak || !textToSpeak.trim()) {
      // Empty line, advance immediately
      this.playSentenceAt(this.currentSentenceIdx + 1);
      return;
    }

    this.callbacks.onSentenceChange?.(this.currentSentenceIdx, textToSpeak);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    this.currentUtterance = utterance;

    // Apply voice and accent configuration
    if (this.currentProfile) {
      const voice = this.findBestVoice(this.currentProfile);
      if (voice) {
        utterance.voice = voice;
      }
      utterance.lang = this.currentProfile.langCode;
      utterance.pitch = this.pitch * (this.currentProfile.recommendedPitch || 1.0);
      utterance.rate = this.playbackRate * (this.currentProfile.recommendedRate || 1.0);
    } else {
      utterance.rate = this.playbackRate;
      utterance.pitch = this.pitch;
    }

    utterance.volume = this.volume;

    utterance.onend = () => {
      if (this.isPlaying && !this.isPaused) {
        this.playSentenceAt(this.currentSentenceIdx + 1);
      }
    };

    utterance.onerror = (e) => {
      // Interrupted errors happen naturally on user pause or seek
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('SpeechSynthesis error:', e.error);
      }
    };

    this.isPlaying = true;
    this.isPaused = false;
    this.callbacks.onStateChange?.(true, false);
    this.synth.speak(utterance);
  }

  public nextSentence() {
    if (this.currentSentenceIdx < this.sentences.length - 1) {
      this.playSentenceAt(this.currentSentenceIdx + 1);
    } else {
      this.callbacks.onPageComplete?.();
    }
  }

  public prevSentence() {
    if (this.currentSentenceIdx > 0) {
      this.playSentenceAt(this.currentSentenceIdx - 1);
    } else {
      this.playSentenceAt(0);
    }
  }

  /**
   * Speaks a short accent test phrase to preview voice immediately
   */
  public previewAccent(profile: AccentVoiceProfile, onFinish?: () => void) {
    if (!this.synth) return;
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(profile.samplePhrase);
    const voice = this.findBestVoice(profile);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = profile.langCode;
    utterance.pitch = this.pitch * (profile.recommendedPitch || 1.0);
    utterance.rate = this.playbackRate * (profile.recommendedRate || 1.0);
    utterance.volume = this.volume;

    utterance.onend = () => {
      onFinish?.();
    };
    utterance.onerror = () => {
      onFinish?.();
    };

    this.synth.speak(utterance);
  }

  public getCurrentState() {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentSentenceIndex: this.currentSentenceIdx,
      rate: this.playbackRate,
      pitch: this.pitch,
      volume: this.volume,
    };
  }
}

export const speechEngine = new SpeechEngine();
