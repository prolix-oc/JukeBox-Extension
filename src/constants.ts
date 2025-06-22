export enum InjectionPosition {
    None = -1,
    AfterPrompt = 0,
    InChat = 1,
    BeforePrompt = 2,
}

export enum InjectionRole {
    System = 0,
    User = 1,
    Assistant = 2,
}

export const MODULE_NAME = 'roon-jukebox';
export const INJECT_ID = 'roon_inject';

// JukeBox API endpoints
export const JUKEBOX_API_BASE = '/api/plugins/roon-lyrics';
export const JUKEBOX_ENDPOINTS = {
    PROBE: `${JUKEBOX_API_BASE}/probe`,
    CURRENT_TRACK: `${JUKEBOX_API_BASE}/current-track`,
    CURRENT_LYRICS: `${JUKEBOX_API_BASE}/current-lyrics`,
    SEARCH_LYRICS: `${JUKEBOX_API_BASE}/search-lyrics`,
} as const;