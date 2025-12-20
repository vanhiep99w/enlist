# TTS Service Configuration Guide

This document explains how to configure the Text-to-Speech (TTS) service using ttsforfree.com.

## Environment Variables

Add these variables to your `.env` file in the `fe/` directory:

```bash
# Text-to-Speech Configuration
VITE_TTS_API_URL=https://ttsforfree.com/api/tts
VITE_TTS_DEFAULT_VOICE=en-US-Standard-C
VITE_TTS_DEFAULT_SPEED=0.85
VITE_TTS_DEFAULT_PITCH=1.0
```

## Available Voices

Common English voices for ttsforfree.com:
- `en-US-Standard-C` - Female, standard quality
- `en-US-Standard-D` - Male, standard quality
- `en-US-Wavenet-C` - Female, high quality
- `en-US-Wavenet-D` - Male, high quality
- `en-GB-Standard-A` - British Female
- `en-GB-Standard-B` - British Male

## Configuration Options

### Speed
- Range: 0.25 to 4.0
- Default: 0.85
- Lower values = slower speech
- Higher values = faster speech

### Pitch
- Range: -20.0 to 20.0
- Default: 1.0
- Lower values = deeper voice
- Higher values = higher voice

## Fallback Behavior

If ttsforfree.com API is unavailable, the service automatically falls back to the browser's built-in `speechSynthesis` API, ensuring users always have audio playback.

## Caching

Audio files are automatically cached in memory to:
- Reduce API calls
- Improve playback speed
- Minimize bandwidth usage

Cache is cleared when the page is refreshed.

## Usage in Components

```typescript
import { ttsService } from '../services/ttsService';

// Basic usage
await ttsService.speakWithFallback('Hello world');

// With options
await ttsService.speakWithFallback('Hello world', {
  voice: 'en-US-Wavenet-C',
  speed: 1.0,
  pitch: 1.0,
});

// Stop playback
ttsService.stop();

// Check if playing
const isPlaying = ttsService.isPlaying();
```

## API Integration Notes

The TTS service expects the ttsforfree.com API to accept:

**Request:**
```json
POST https://ttsforfree.com/api/tts
Content-Type: application/json

{
  "text": "word to pronounce",
  "voice": "en-US-Standard-C",
  "speed": 0.85,
  "pitch": 1.0
}
```

**Response:**
- Audio file (blob) - typically MP3 or WAV format

If the actual API endpoint differs, update `VITE_TTS_API_URL` accordingly.
