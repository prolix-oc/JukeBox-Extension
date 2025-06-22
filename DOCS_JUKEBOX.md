# SillyTavern Roon & Lyrics Plugin

A SillyTavern server plugin that integrates with Roon API to provide real-time track information and lyrics search functionality for frontend extensions.

## Features

- **Roon Integration**: Connects to your Roon Core and monitors now playing information
- **Real-time Updates**: Automatically updates when tracks change or playback state changes
- **Lyrics Search**: Integrates with LRCLib API to fetch lyrics for tracks
- **RESTful API**: Provides clean endpoints for frontend extensions to consume
- **Zone Monitoring**: Subscribes to Roon zone updates for immediate track changes
- **Configurable**: Web-based settings interface for easy configuration

## Installation

1. **Clone or download** this plugin to your SillyTavern `plugins` directory
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Install Roon API dependencies**:
   ```bash
   npm install roon-kit
   npm install github:roonlabs/node-roon-api
   ```
4. **Build the plugin**:
   ```bash
   npm run build
   ```
5. **Enable the plugin** in SillyTavern's plugin settings
6. **Configure the plugin** via the settings interface

## Configuration

Access the plugin settings through SillyTavern's plugin management interface. Available settings:

- **Roon Extension Display Name**: Name shown in Roon's Extensions list
- **Roon Extension ID**: Unique identifier (use reverse domain notation)
- **Enable Lyrics Search**: Toggle automatic lyrics fetching
- **Lyrics API URL**: LRCLib API endpoint (default: `https://lrclib.net/api`)

## Roon Setup

1. Ensure Roon Core is running on your network
2. Enable the plugin and configure settings
3. Check Roon Settings > Extensions
4. Enable the "SillyTavern Roon Plugin" extension when it appears

## API Endpoints

### Health Check
```
GET /api/plugins/roon-lyrics/probe
```
Returns connection status and current track availability.

**Response:**
```json
{
  "status": "connected",
  "hasTrack": true
}
```

### Current Track Information
```
GET /api/plugins/roon-lyrics/current-track
```
Returns detailed information about the currently playing track.

**Response:**
```json
{
  "success": true,
  "track": {
    "song": "Track Name",
    "artist": "Artist Name", 
    "album": "Album Name",
    "playbackStatus": "playing",
    "zoneName": "Living Room",
    "length": 240000,
    "seek": 45000,
    "lastUpdated": 1703123456789
  },
  "connected": true
}
```

### Current Track Lyrics
```
GET /api/plugins/roon-lyrics/current-lyrics
```
Returns lyrics for the currently playing track.

**Response:**
```json
{
  "success": true,
  "track": {
    "song": "Track Name",
    "artist": "Artist Name",
    "album": "Album Name"
  },
  "lyrics": {
    "id": 12345,
    "trackName": "Track Name",
    "artistName": "Artist Name",
    "albumName": "Album Name", 
    "duration": 240,
    "instrumental": false,
    "plainLyrics": "Verse 1...",
    "syncedLyrics": "[00:00.00] Verse 1..."
  }
}
```

### Search Lyrics for Specific Track
```
POST /api/plugins/roon-lyrics/search-lyrics
Content-Type: application/json

{
  "song": "Track Name",
  "artist": "Artist Name"
}
```

**Response:**
```json
{
  "success": true,
  "query": {
    "song": "Track Name", 
    "artist": "Artist Name"
  },
  "lyrics": {
    "id": 12345,
    "trackName": "Track Name",
    "artistName": "Artist Name",
    "plainLyrics": "Verse 1...",
    "syncedLyrics": "[00:00.00] Verse 1..."
  }
}
```

## Frontend Integration Example

Here's how a frontend extension can consume this API:

```javascript
// Check if Roon plugin is available and connected
async function checkRoonStatus() {
  try {
    const response = await fetch('/api/plugins/roon-lyrics/probe');
    const status = await response.json();
    return status.status === 'connected';
  } catch (error) {
    console.error('Roon plugin not available:', error);
    return false;
  }
}

// Get current track information  
async function getCurrentTrack() {
  try {
    const response = await fetch('/api/plugins/roon-lyrics/current-track');
    const data = await response.json();
    return data.success ? data.track : null;
  } catch (error) {
    console.error('Error fetching current track:', error);
    return null;
  }
}

// Get lyrics for current track
async function getCurrentLyrics() {
  try {
    const response = await fetch('/api/plugins/roon-lyrics/current-lyrics');
    const data = await response.json();
    return data.success ? data.lyrics : null;
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return null;
  }
}

// Example: Create a prompt with current music context
async function createMusicContextPrompt() {
  const track = await getCurrentTrack();
  const lyrics = await getCurrentLyrics();
  
  if (!track) return "No music currently playing.";
  
  let prompt = `Currently listening to "${track.song}" by ${track.artist}`;
  if (track.album) prompt += ` from the album "${track.album}"`;
  
  if (lyrics && lyrics.plainLyrics) {
    prompt += `\n\nLyrics:\n${lyrics.plainLyrics}`;
  }
  
  return prompt;
}
```

## Polling for Updates

Since this plugin provides real-time updates, frontend extensions should poll for changes:

```javascript
// Poll for track changes every 5 seconds
setInterval(async () => {
  const track = await getCurrentTrack();
  if (track && track.lastUpdated > lastKnownUpdate) {
    // Track has changed, update UI
    updateNowPlaying(track);
    lastKnownUpdate = track.lastUpdated;
  }
}, 5000);
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `400`: Bad request (missing parameters)
- `404`: No current track available
- `500`: Internal server error
- `503`: Roon not connected

## Development

### Build Commands

- `npm run build:dev`: Development build with source maps
- `npm run build`: Production build (minified)
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Fix ESLint issues automatically

### File Structure

```
src/
  index.ts          # Main plugin file
static/
  settings.html     # Configuration interface
dist/
  plugin.js         # Built plugin (generated)
package.json        # Dependencies and scripts
webpack.config.js   # Build configuration
tsconfig.json       # TypeScript configuration
```

## Troubleshooting

### Roon Not Connecting

1. Ensure Roon Core is running and accessible
2. Check that the extension appears in Roon Settings > Extensions
3. Enable the extension in Roon if it's disabled
4. Verify network connectivity between SillyTavern and Roon Core

### No Track Information

1. Ensure music is playing in Roon
2. Check that the zone is active and not grouped
3. Verify the plugin status via the `/probe` endpoint

### Lyrics Not Found

1. Check that lyrics search is enabled in settings
2. Verify the LRCLib API is accessible
3. Try searching manually via the `/search-lyrics` endpoint
4. Some tracks may not have lyrics available in the database

## License

AGPL-3.0-or-later

## Contributing

Feel free to submit issues and enhancement requests! This plugin follows modern TypeScript and async/await patterns throughout.