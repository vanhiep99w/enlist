/**
 * Text-to-Speech Service using Speechmatics API
 * Provides high-quality audio generation for word pronunciation
 * Based on: https://docs.speechmatics.com/text-to-speech/quickstart
 */

export interface TTSConfig {
  apiKey: string;
  apiUrl: string;
  defaultLanguageCode: string;
}

export interface TTSOptions {
  rate?: number;
  lang?: string;
}

const DEFAULT_CONFIG: TTSConfig = {
  apiKey: import.meta.env.VITE_SPEECHMATICS_API_KEY || '',
  apiUrl: 'https://preview.tts.speechmatics.com/generate/sarah',
  defaultLanguageCode: 'en',
};

class TTSService {
  private config: TTSConfig;
  private audioCache: Map<string, string> = new Map();
  private currentAudio: HTMLAudioElement | null = null;

  constructor(config: Partial<TTSConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private getCacheKey(text: string): string {
    return text;
  }

  private createWavBuffer(float32Samples: Float32Array): ArrayBuffer {
    const int16Samples = new Int16Array(float32Samples.length);

    for (let i = 0; i < float32Samples.length; i++) {
      const clampedValue = Math.max(-1, Math.min(1, float32Samples[i]));
      int16Samples[i] = Math.round(clampedValue * 32767);
    }

    const sampleRate = 16000;
    const channels = 1;
    const buffer = new ArrayBuffer(44 + int16Samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + int16Samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * 2, true);
    view.setUint16(32, channels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, int16Samples.length * 2, true);

    const dataView = new Int16Array(buffer, 44);
    dataView.set(int16Samples);

    return buffer;
  }

  private async fetchAudio(text: string): Promise<string> {
    const cacheKey = this.getCacheKey(text);

    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    const apiKey = this.config.apiKey;

    if (!apiKey) {
      throw new Error(
        'Speechmatics API key not configured. Please set VITE_SPEECHMATICS_API_KEY in .env file'
      );
    }

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Speechmatics API error: ${response.status} - ${errorText}`);
      }

      const rawAudio = await response.arrayBuffer();
      const float32Samples = new Float32Array(rawAudio);

      const wavBuffer = this.createWavBuffer(float32Samples);
      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);

      this.audioCache.set(cacheKey, audioUrl);
      return audioUrl;
    } catch (error) {
      console.error('Speechmatics TTS fetch error:', error);
      throw error;
    }
  }

  async speak(text: string): Promise<void> {
    this.stop();

    try {
      const audioUrl = await this.fetchAudio(text);

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

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  clearCache(): void {
    this.audioCache.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    this.audioCache.clear();
  }

  async speakFallback(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || 'en-US';
      utterance.rate = options.rate || 0.85;

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      window.speechSynthesis.speak(utterance);
    });
  }

  async speakWithFallback(text: string, options: TTSOptions = {}): Promise<void> {
    try {
      await this.speak(text);
    } catch (error) {
      console.warn('Speechmatics TTS failed, falling back to browser speech synthesis:', error);
      await this.speakFallback(text, options);
    }
  }
}

export const ttsService = new TTSService();
export default ttsService;
