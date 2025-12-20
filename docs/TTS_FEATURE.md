# Text-to-Speech (TTS) Feature

The Listen feature allows users to hear the pronunciation of English words using high-quality text-to-speech technology.

## Overview

The TTS system uses **ttsforfree.com** API for professional-quality audio generation, with automatic fallback to the browser's built-in speech synthesis if the API is unavailable.

## Key Features

- 🎯 **High-Quality Audio**: Uses ttsforfree.com for natural-sounding pronunciation
- 🔄 **Automatic Fallback**: Falls back to browser TTS if API unavailable
- 💾 **Intelligent Caching**: Caches audio files to reduce API calls
- ⚡ **Fast Playback**: Instant playback for cached words
- 🎚️ **Customizable**: Adjustable voice, speed, and pitch settings

## Components

### TTSService (`fe/src/services/ttsService.ts`)

Core service handling all TTS functionality:

```typescript
// Basic usage
await ttsService.speakWithFallback('pronunciation');

// Advanced usage with options
await ttsService.speakWithFallback('pronunciation', {
  voice: 'en-US-Wavenet-C',
  speed: 1.0,
  pitch: 1.0,
});

// Control playback
ttsService.stop();
const isPlaying = ttsService.isPlaying();
ttsService.clearCache();
```

### WordPopup Component

Integrated Listen button in word translation popup:
- Click "Listen" to hear pronunciation
- Shows "Playing..." during playback
- Automatically uses TTS service with fallback

## Configuration

Environment variables in `fe/.env`:

```bash
VITE_TTS_API_URL=https://ttsforfree.com/api/tts
VITE_TTS_DEFAULT_VOICE=en-US-Standard-C
VITE_TTS_DEFAULT_SPEED=0.85
VITE_TTS_DEFAULT_PITCH=1.0
```

### Available Voices

- `en-US-Standard-C` - Female (default)
- `en-US-Standard-D` - Male
- `en-US-Wavenet-C` - Female, high quality
- `en-US-Wavenet-D` - Male, high quality
- `en-GB-Standard-A` - British Female
- `en-GB-Standard-B` - British Male

### Settings

- **Speed**: 0.25 to 4.0 (default: 0.85)
- **Pitch**: -20.0 to 20.0 (default: 1.0)

## Implementation Details

### API Integration

**Request Format:**
```json
POST https://ttsforfree.com/api/tts
Content-Type: application/json

{
  "text": "word",
  "voice": "en-US-Standard-C",
  "speed": 0.85,
  "pitch": 1.0
}
```

**Response:**
- Audio blob (MP3/WAV format)

### Caching Strategy

1. **Cache Key**: Generated from `text + voice + speed + pitch`
2. **Storage**: In-memory Map with Blob URLs
3. **Cleanup**: Automatic URL revocation on cache clear
4. **Persistence**: Cache cleared on page refresh

### Fallback Mechanism

```typescript
async speakWithFallback(text: string, options?: TTSOptions) {
  try {
    // Try ttsforfree.com API
    await this.speak(text, options);
  } catch (error) {
    // Fall back to browser speechSynthesis
    await this.speakFallback(text, options);
  }
}
```

## User Experience

### Normal Flow
1. User selects word in translation exercise
2. WordPopup appears with translation
3. Click "Listen" button
4. TTS service fetches/retrieves audio
5. Audio plays through speakers
6. Button shows "Playing..." during playback

### Fallback Flow
1. API request fails (network/server issue)
2. System automatically switches to browser TTS
3. User hears pronunciation via browser engine
4. Console shows fallback warning (dev mode only)

## Error Handling

- **Network Errors**: Automatic fallback to browser TTS
- **API Errors**: Logged to console, fallback activated
- **Playback Errors**: Gracefully handled, button resets
- **Unsupported Browser**: Shows error if no TTS available

## Future Enhancements

- [ ] Add voice selection UI in settings
- [ ] Support multiple languages
- [ ] Download audio for offline use
- [ ] Adjust speed/pitch via UI controls
- [ ] Sentence-level pronunciation
- [ ] Phonetic transcription display

## Testing

To test the TTS feature:

1. **Start the frontend**: `cd fe && bun run dev`
2. **Open translation exercise**
3. **Select any word** to open WordPopup
4. **Click "Listen"** button
5. **Verify audio playback**

### Test Cases

- ✅ First-time word pronunciation (API call)
- ✅ Repeated word pronunciation (cached)
- ✅ Multiple words in sequence
- ✅ Stop during playback
- ✅ API failure fallback (disable network)

## Troubleshooting

### No Audio Playback

1. Check browser console for errors
2. Verify API URL in `.env` file
3. Test browser TTS: `window.speechSynthesis.speak(new SpeechSynthesisUtterance('test'))`
4. Check browser audio permissions

### Poor Audio Quality

1. Try higher quality voice (Wavenet)
2. Adjust speed/pitch settings
3. Check audio output device

### Slow Performance

1. Audio should be cached after first play
2. Check network connection
3. Consider preloading common words

## Related Files

- `fe/src/services/ttsService.ts` - Core TTS service
- `fe/src/components/WordPopup.tsx` - Listen button UI
- `fe/.env.example` - Configuration template
- `fe/TTS_CONFIG.md` - Configuration guide

## Documentation

See [TTS_CONFIG.md](../fe/TTS_CONFIG.md) for detailed configuration options.
