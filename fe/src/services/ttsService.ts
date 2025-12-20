/**
 * Text-to-Speech Service using ttsforfree.com
 * Provides high-quality audio generation for word pronunciation
 */

export interface TTSOptions {
  voice?: string;
  pitch?: number;
  maxWaitMs?: number;
  intervalMs?: number;
}

export interface TTSConfig {
  apiUrl: string;
  apiKey: string;
  defaultVoice: string;
  defaultPitch: number;
  maxWaitMs: number;
  intervalMs: number;
}

const DEFAULT_CONFIG: TTSConfig = {
  apiUrl: import.meta.env.VITE_TTS_API_URL || 'https://api.ttsforfree.com',
  apiKey: import.meta.env.VITE_TTS_API_KEY || '',
  defaultVoice: import.meta.env.VITE_TTS_DEFAULT_VOICE || 'en-US-Standard-C',
  defaultPitch: Number(import.meta.env.VITE_TTS_DEFAULT_PITCH) || 0,
  maxWaitMs: Number(import.meta.env.VITE_TTS_MAX_WAIT_MS) || 60000,
  intervalMs: Number(import.meta.env.VITE_TTS_INTERVAL_MS) || 1500,
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
    const pitch = options.pitch ?? this.config.defaultPitch;
    return `${text}_${voice}_${pitch}`;
  }

  /**
   * Fetch audio from ttsforfree.com using their async job-based API
   */
  private async fetchAudio(text: string, options: TTSOptions): Promise<string> {
    const cacheKey = this.getCacheKey(text, options);

    // Check cache first
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    const apiKey = this.config.apiKey;
    if (!apiKey) {
      throw new Error('TTS API key not configured. Please set VITE_TTS_API_KEY in .env file');
    }

    try {
      const voice = options.voice || this.config.defaultVoice;
      const pitch = options.pitch ?? this.config.defaultPitch;

      // Step 1: Create TTS job
      const createResponse = await fetch(`${this.config.apiUrl}/api/tts/createby`, {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Texts: text,
          Voice: voice,
          Pitch: pitch,
          ConnectionId: '',
          CallbackUrl: '',
        }),
      });

      console.log('Create response status:', createResponse.status);
      console.log('Create response headers:', Object.fromEntries(createResponse.headers.entries()));

      // Check if response has content
      const responseText = await createResponse.text();
      console.log('Create response text:', responseText);

      if (!responseText) {
        console.warn('API returned empty response, using browser TTS fallback');
        throw new Error(`Empty response from API. Status: ${createResponse.status}`);
      }

      let created;
      try {
        created = JSON.parse(responseText);
      } catch {
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
      }

      if (!createResponse.ok || !created?.Id) {
        throw new Error(
          created?.Message || `Create failed: ${createResponse.status} - ${responseText}`
        );
      }

      // Step 2: Poll for job completion
      const jobId = created.Id;
      const maxWaitMs = options.maxWaitMs || this.config.maxWaitMs;
      const intervalMs = options.intervalMs || this.config.intervalMs;
      const startTime = Date.now();

      while (Date.now() - startTime < maxWaitMs) {
        const statusResponse = await fetch(`${this.config.apiUrl}/api/tts/status/${jobId}`, {
          headers: {
            'X-API-Key': apiKey,
          },
        });

        const status = await statusResponse.json();
        if (!statusResponse.ok) {
          throw new Error(status?.Message || `Status failed: ${statusResponse.status}`);
        }

        if (status.Status === 'SUCCESS' && status.Data) {
          const audioUrl = status.Data;
          // Cache the audio URL
          this.audioCache.set(cacheKey, audioUrl);
          return audioUrl;
        }

        if (status.Status === 'ERROR') {
          throw new Error(status.Message || 'TTS job failed');
        }

        // Wait before next poll
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }

      throw new Error('Timeout waiting for TTS job to complete');
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
    console.log('🔊 Using browser TTS fallback for:', text);
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      utterance.pitch = options.pitch ?? this.config.defaultPitch;

      utterance.onend = () => {
        console.log('✅ Browser TTS completed');
        resolve();
      };
      utterance.onerror = (error) => {
        console.error('❌ Browser TTS error:', error);
        reject(error);
      };

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
