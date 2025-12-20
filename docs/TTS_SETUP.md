# 🎵 TTS Setup Guide - ttsforfree.com Integration

## Quick Start

### 1. Get API Key
```bash
# Visit https://ttsforfree.com
# Sign up for free account
# Copy your API key from dashboard
```

### 2. Configure Environment
```bash
cd fe
cp .env.example .env
# Edit .env and add your API key:
VITE_TTS_API_KEY=your_actual_api_key_here
```

### 3. Restart Dev Server
```bash
cd fe
bun run dev
```

## How It Works

### User Flow
1. User selects a word in translation exercise
2. WordPopup appears with translation
3. User clicks "Listen" button
4. TTS service handles playback:
   - ✅ Try ttsforfree.com API
   - ❌ If fails → Use browser fallback
5. Audio plays through speakers

### API Flow (ttsforfree.com)
```
Step 1: Create Job
POST /api/tts/createby
→ Returns job ID

Step 2: Poll Status  
GET /api/tts/status/{jobId}
→ Repeat every 1.5s until SUCCESS

Step 3: Play Audio
→ Use audio URL from API response
→ Cache for future plays
```

## Configuration Reference

### Required
- `VITE_TTS_API_KEY` - Your API key from ttsforfree.com

### Optional
```bash
VITE_TTS_API_URL=https://api.ttsforfree.com  # Default
VITE_TTS_DEFAULT_VOICE=en-US-Standard-C      # Default voice
VITE_TTS_DEFAULT_PITCH=0                     # Voice pitch (-20 to 20)
VITE_TTS_MAX_WAIT_MS=60000                   # Max wait (60 seconds)
VITE_TTS_INTERVAL_MS=1500                    # Poll interval (1.5 seconds)
```

## Testing

### Test Playback
1. Start app: `cd fe && bun run dev`
2. Open translation exercise
3. Select any word
4. Click "Listen" button
5. Should hear audio

### Test Fallback
```typescript
// In browser console:
// Temporarily disable API to test fallback
localStorage.setItem('DISABLE_TTS_API', 'true');
// Try clicking Listen - should use browser TTS
```

### Check Cache
```typescript
// In browser console:
ttsService.isPlaying();  // Check if audio is playing
// Click same word twice - second time should be instant (cached)
```

## Troubleshooting

### ❌ "TTS API key not configured"
**Solution:**
```bash
# 1. Check .env file exists
ls fe/.env

# 2. Verify API key is set
cat fe/.env | grep VITE_TTS_API_KEY

# 3. Restart dev server
cd fe && bun run dev
```

### ❌ "Timeout waiting for TTS job"
**Solutions:**
- Check internet connection
- Verify API key is valid
- Increase timeout: `VITE_TTS_MAX_WAIT_MS=120000`
- Check ttsforfree.com status

### ❌ No audio playback
**Solutions:**
1. Check browser console for errors
2. Verify browser audio permissions
3. Test browser TTS manually:
   ```javascript
   new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3').play()
   ```

### ❌ "Create failed" or "Status failed"
**Solutions:**
- Verify API key is correct
- Check API quota/limits
- Try different voice ID
- Contact ttsforfree.com support

## API Limits

Check your ttsforfree.com dashboard for:
- **Rate limits** - Requests per minute/hour
- **Monthly quota** - Total requests per month
- **Character limits** - Max characters per request
- **Concurrent jobs** - Max simultaneous TTS jobs

## Performance

### First Play
- API call: ~2-5 seconds
- Includes job creation + polling

### Cached Play
- Instant playback
- No API call needed

### Optimization Tips
- Audio is cached automatically
- Common words load faster on repeat
- Consider preloading frequent words
- Monitor API usage in dashboard

## Voice Options

Contact ttsforfree.com for available voices, or check their documentation.

Example voices might include:
- `en-US-Standard-C` - Female
- `en-US-Standard-D` - Male
- `en-GB-Standard-A` - British Female
- `en-GB-Standard-B` - British Male

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to git
- API key is visible in browser (client-side)
- For production, consider proxying through backend
- Rotate API keys periodically

## Next Steps

### Production Deployment
1. Add API key to environment variables
2. Set production API URL if different
3. Configure CORS if needed
4. Monitor API usage and costs
5. Set up error tracking (Sentry, etc.)

### Optional Enhancements
- [ ] Add voice selection UI
- [ ] Add speed/pitch controls
- [ ] Support multiple languages
- [ ] Preload common words
- [ ] Add download audio option

## Support

- **Documentation**: See [TTS_CONFIG.md](../fe/TTS_CONFIG.md)
- **Feature Guide**: See [TTS_FEATURE.md](./TTS_FEATURE.md)
- **ttsforfree.com**: Visit their support page
- **Issues**: Check browser console for errors

## Example .env

```bash
# Copy this to fe/.env and fill in your values

# Required
VITE_TTS_API_KEY=sk_live_your_actual_key_here

# Optional (defaults shown)
VITE_TTS_API_URL=https://api.ttsforfree.com
VITE_TTS_DEFAULT_VOICE=en-US-Standard-C
VITE_TTS_DEFAULT_PITCH=0
VITE_TTS_MAX_WAIT_MS=60000
VITE_TTS_INTERVAL_MS=1500

# Backend API
VITE_API_BASE_URL=http://localhost:8080
```

---

✅ **Ready to use!** Start the app and test the Listen feature.
