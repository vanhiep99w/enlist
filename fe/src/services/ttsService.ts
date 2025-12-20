/**
 * Text-to-Speech Service using ttsforfree.com
 * Provides high-quality audio generation for word pronunciation
 */

export interface TTSOptions {
  voice?: string;
  speed?: number;
  pitch?: number;
}

export interface TTSConfig {
  apiUrl: string;
  defaultVoice: string;
  defaultSpeed: number;
  defaultPitch: number;
}

const DEFAULT_CONFIG: TTSConfig = {
  apiUrl: import.meta.env.VITE_TTS_API_URL || 'https://ttsforfree.com/api/tts',
  defaultVoice: import.meta.env.VITE_TTS_DEFAULT_VOICE || 'en-US-Standard-C',
  defaultSpeed: Number(import.meta.env.VITE_TTS_DEFAULT_SPEED) || 0.85,
  defaultPitch: Number(import.meta.env.VITE_TTS_DEFAULT_PITCH) || 1.0,
};

class TTSService {
  private config: TTSConfig;
  private audioCache: Map<string, string> = new Map();
  private currentAudio: HTMLAudioElement | null = null;

  constructor(config: Partial<TTSConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate cache key for audio
   */
  private getCacheKey(text: string, options: TTSOptions): string {
    const voice = options.voice || this.config.defaultVoice;
    const speed = options.speed || this.config.defaultSpeed;
    const pitch = options.pitch || this.config.defaultPitch;
    return `${text}_${voice}_${speed}_${pitch}`;
  }

  /**
   * Fetch audio from ttsforfree.com
   */
  private async fetchAudio(text: string, options: TTSOptions): Promise<string> {
    const cacheKey = this.getCacheKey(text, options);

    // Check cache first
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: options.voice || this.config.defaultVoice,
          speed: options.speed || this.config.defaultSpeed,
          pitch: options.pitch || this.config.defaultPitch,
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.statusText}`);
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);

      // Cache the audio URL
      this.audioCache.set(cacheKey, audioUrl);

      return audioUrl;
    } catch (error) {
      console.error('TTS fetch error:', error);
      throw error;
    }
  }

  /**
   * Speak text using ttsforfree.com
   * Returns a promise that resolves when playback completes
   */
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    // Stop any currently playing audio
    this.stop();

    try {
      const audioUrl = await this.fetchAudio(text, options);

      return new Promise((resolve, reject) => {
        const audio = new Audio(audioUrl);
        this.currentAudio = audio;

        audio.onended = () => {
          this.currentAudio = null;
          resolve();
        };

        audio.onerror = (error) => {
          this.currentAudio = null;
          reject(error);
        };

        audio.play().catch(reject);
      });
    } catch (error) {
      console.error('TTS speak error:', error);
      throw error;
    }
  }

  /**
   * Stop current playback
   */
  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  /**
   * Check if currently playing
   */
  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  /**
   * Clear audio cache
   */
  clearCache(): void {
    // Revoke all cached URLs to free memory
    this.audioCache.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    this.audioCache.clear();
  }

  /**
   * Fallback to browser's built-in speech synthesis
   */
  async speakFallback(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = options.speed || this.config.defaultSpeed;
      utterance.pitch = options.pitch || this.config.defaultPitch;

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Speak with automatic fallback to browser TTS
   */
  async speakWithFallback(text: string, options: TTSOptions = {}): Promise<void> {
    try {
      await this.speak(text, options);
    } catch (error) {
      console.warn('TTS API failed, falling back to browser speech synthesis:', error);
      await this.speakFallback(text, options);
    }
  }
}

// Export singleton instance
export const ttsService = new TTSService();
export default ttsService;
