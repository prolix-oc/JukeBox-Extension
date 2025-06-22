export interface RoonTrack {
    song: string;
    artist: string;
    album: string;
    playbackStatus: string;
    zoneName: string;
    length: number;
    seek: number;
    lastUpdated: number;
}

export interface RoonLyrics {
    id: number;
    trackName: string;
    artistName: string;
    albumName?: string;
    duration?: number;
    instrumental: boolean;
    plainLyrics?: string;
    syncedLyrics?: string;
}

export interface RoonCurrentTrackResponse {
    success: boolean;
    track: RoonTrack;
    connected: boolean;
}

export interface RoonCurrentLyricsResponse {
    success: boolean;
    track: {
        song: string;
        artist: string;
        album: string;
    };
    lyrics: RoonLyrics;
}

export interface RoonSearchLyricsRequest {
    song: string;
    artist: string;
}

export interface RoonSearchLyricsResponse {
    success: boolean;
    query: RoonSearchLyricsRequest;
    lyrics: RoonLyrics;
}

export interface RoonProbeResponse {
    status: string;
    hasTrack: boolean;
}