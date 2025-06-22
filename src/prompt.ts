import { INJECT_ID, InjectionPosition, JUKEBOX_ENDPOINTS } from './constants';
import { getSettings } from './settings';
import { 
    RoonCurrentTrackResponse, 
    RoonCurrentLyricsResponse, 
    RoonProbeResponse 
} from './types';

const { setExtensionPrompt, substituteParamsExtended } = SillyTavern.getContext();

export function resetInject(): void {
    // Reset the prompt to avoid showing old data
    setExtensionPrompt(INJECT_ID, '', InjectionPosition.None, 0);
}

export async function checkJukeBoxStatus(): Promise<boolean> {
    try {
        const response = await fetch(JUKEBOX_ENDPOINTS.PROBE);
        if (!response.ok) {
            return false;
        }
        const status: RoonProbeResponse = await response.json();
        return status.status === 'connected';
    } catch (error) {
        console.error('JukeBox plugin not available:', error);
        return false;
    }
}

export async function getCurrentTrack(): Promise<RoonCurrentTrackResponse | null> {
    try {
        const response = await fetch(JUKEBOX_ENDPOINTS.CURRENT_TRACK);
        if (!response.ok) {
            return null;
        }
        const data: RoonCurrentTrackResponse = await response.json();
        return data.success ? data : null;
    } catch (error) {
        console.error('Error fetching current track:', error);
        return null;
    }
}

export async function getCurrentLyrics(): Promise<RoonCurrentLyricsResponse | null> {
    try {
        const response = await fetch(JUKEBOX_ENDPOINTS.CURRENT_LYRICS);
        if (!response.ok) {
            return null;
        }
        const data: RoonCurrentLyricsResponse = await response.json();
        return data.success ? data : null;
    } catch (error) {
        console.error('Error fetching lyrics:', error);
        return null;
    }
}

export async function setCurrentTrack(): Promise<void> {
    resetInject();

    const settings = getSettings();
    if (!settings.template || settings.position === InjectionPosition.None) {
        return;
    }

    // Check if JukeBox is available first
    const isConnected = await checkJukeBoxStatus();
    if (!isConnected) {
        console.log('JukeBox plugin not connected or available');
        return;
    }

    try {
        const trackData = await getCurrentTrack();
        if (!trackData || !trackData.track) {
            console.log('No track currently playing on Roon');
            return;
        }

        console.log('Currently playing Roon track:', trackData.track);
        
        // Get lyrics if enabled
        let lyricsData = null;
        if (settings.includeLyrics) {
            lyricsData = await getCurrentLyrics();
            console.log('Fetched lyrics:', lyricsData);
        }

        const params = getPromptParams(trackData.track, lyricsData?.lyrics);
        const message = substituteParamsExtended(settings.template, params);
        setExtensionPrompt(INJECT_ID, message, settings.position, settings.depth, settings.scan, settings.role);
    } catch (error) {
        console.error('Error setting current track:', error);
    }
}

function getPromptParams(track: RoonCurrentTrackResponse['track'], lyrics?: RoonCurrentLyricsResponse['lyrics']): Record<string, string> {
    const params: Record<string, string> = {
        song: track.song || '',
        artist: track.artist || '',
        album: track.album || '',
        zone: track.zoneName || '',
        status: track.playbackStatus || '',
    };

    // Add lyrics if available
    if (lyrics) {
        params.lyrics = lyrics.plainLyrics || '';
        params.syncedLyrics = lyrics.syncedLyrics || '';
        params.instrumental = lyrics.instrumental ? 'true' : 'false';
    }

    return params;
}