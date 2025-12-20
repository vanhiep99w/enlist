# TTS Service Configuration Guide

This document explains how to configure the Text-to-Speech (TTS) service using ttsforfree.com.

## Environment Variables

Add these variables to your `.env` file in the `fe/` directory:

```bash
# Text-to-Speech Configuration
VITE_TTS_API_URL=https://api.ttsforfree.com
VITE_TTS_API_KEY=your_api_key_here
VITE_TTS_DEFAULT_VOICE=en-US-Standard-C
VITE_TTS_DEFAULT_PITCH=0
VITE_TTS_MAX_WAIT_MS=60000
VITE_TTS_INTERVAL_MS=1500
```

## Getting an API Key

1. Visit [ttsforfree.com](https://ttsforfree.com)
2. Sign up for a free account
3. Navigate to API settings
4. Copy your API key
5. Add it to your `.env` file as `VITE_TTS_API_KEY`

## Available Voices

Common English voices for ttsforfree.com (format: `v1:voice-id`):
- Contact ttsforfree.com for the complete list of available voices
- Check their API documentation for voice IDs

## Configuration Options

### Pitch
- Range: -20 to 20
- Default: 0
- Lower values = deeper voice
- Higher values = higher voice

### Max Wait Time (maxWaitMs)
- Default: 60000 (60 seconds)
- Maximum time to wait for TTS job completion
- Increase for longer text

### Poll Interval (intervalMs)
- Default: 1500 (1.5 seconds)
- How often to check job status
- Lower = faster response, more API calls

## API Flow

The ttsforfree.com API uses an asynchronous job-based system:

1. **Create Job**: Submit text for TTS generation
2. **Poll Status**: Check job status periodically
3. **Get Result**: Retrieve audio URL when ready

```typescript
// Step 1: Create TTS job
POST https://api.ttsforfree.com/api/tts/createby
Headers: X-API-Key: your_api_key
Body: {
  "Texts": "word to pronounce",
  "Voice": "en-US-Standard-C",
  "Pitch": 0,
  "ConnectionId": "",
  "CallbackUrl": ""
}
Response: { "Id": "job-id-123" }

// Step 2: Poll for completion
GET https://api.ttsforfree.com/api/tts/status/job-id-123
Headers: X-API-Key: your_api_key
Response: {
  "Status": "SUCCESS",
  "Data": "https://cdn.ttsforfree.com/audio/file.mp3"
}
```

## Fallback Behavior

If ttsforfree.com API is unavailable or fails:
- The service automatically falls back to browser's built-in `speechSynthesis`
- Users always have audio playback
- Error is logged to console (dev mode only)

## Caching

Audio URLs are cached in memory to:
- Reduce API calls
- Improve playback speed
- Minimize bandwidth usage

Cache is cleared when the page is refreshed.

## Usage in Components

```typescript
import { ttsService } from '../services/ttsService';

// Basic usage with fallback
await ttsService.speakWithFallback('Hello world');

// With options
await ttsService.speakWithFallback('Hello world', {
  voice: 'en-US-Standard-C',
  pitch: 0,
  maxWaitMs: 30000,
  intervalMs: 1000,
});

// Stop playback
ttsService.stop();

// Check if playing
const isPlaying = ttsService.isPlaying();
```

## Troubleshooting

### "TTS API key not configured"
- Ensure `VITE_TTS_API_KEY` is set in your `.env` file
- Restart the dev server after adding environment variables

### Timeout Errors
- Increase `VITE_TTS_MAX_WAIT_MS` in `.env`
- Check ttsforfree.com API status
- Verify your API key is valid

### No Audio Playback
1. Check browser console for errors
2. Verify API key is correct
3. Test browser TTS fallback manually
4. Check audio permissions in browser

## Performance Tips

- Audio is cached after first play
- Common words load instantly on repeat
- Consider preloading frequently used words
- Monitor API quota usage

## API Limits

Check ttsforfree.com documentation for:
- Rate limits
- Monthly quotas
- Character limits per request
- Pricing tiers

## Example .env File

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_TTS_API_URL=https://api.ttsforfree.com
VITE_TTS_API_KEY=sk_live_1234567890abcdef
VITE_TTS_DEFAULT_VOICE=en-US-Standard-C
VITE_TTS_DEFAULT_PITCH=0
VITE_TTS_MAX_WAIT_MS=60000
VITE_TTS_INTERVAL_MS=1500
```

## Security Notes

- Never commit `.env` file to git
- Use `.env.example` as template
- API keys are client-side visible in browser
- Consider backend proxy for production

