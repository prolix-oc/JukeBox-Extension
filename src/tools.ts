import { getSettings } from './settings';
import { JUKEBOX_ENDPOINTS } from './constants';
import { 
    RoonCurrentTrackResponse, 
    RoonCurrentLyricsResponse, 
    RoonSearchLyricsRequest,
    RoonSearchLyricsResponse,
    RoonProbeResponse 
} from './types';

export type JukeBoxTool =
    'getCurrentTrack'
    | 'getCurrentLyrics'
    | 'searchLyrics'
    | 'checkConnection';

type ToolParametersSchema = Readonly<Record<string, unknown>>;
type ToolCallback = (...args: never[]) => Promise<unknown>;

interface ToolDefinition {
    name: string;
    displayName: string;
    description: string;
    parameters: object;
    action: ToolCallback;
    shouldRegister: () => Promise<boolean>;
}

interface SearchLyricsParameters {
    song: string;
    artist: string;
}

const TOOL_PARAMETERS: Record<JukeBoxTool, ToolParametersSchema> = {
    getCurrentTrack: Object.freeze({
        $schema: 'http://json-schema.org/draft-04/schema#',
        type: 'object',
        properties: {},
        required: [],
    }),
    getCurrentLyrics: Object.freeze({
        $schema: 'http://json-schema.org/draft-04/schema#',
        type: 'object',
        properties: {},
        required: [],
    }),
    searchLyrics: Object.freeze({
        $schema: 'http://json-schema.org/draft-04/schema#',
        type: 'object',
        properties: {
            song: {
                type: 'string',
                description: 'The name of the song to search for lyrics.',
            },
            artist: {
                type: 'string',
                description: 'The name of the artist.',
            },
        },
        required: ['song', 'artist'],
    }),
    checkConnection: Object.freeze({
        $schema: 'http://json-schema.org/draft-04/schema#',
        type: 'object',
        properties: {},
        required: [],
    }),
};

const TOOL_CALLBACKS: Record<JukeBoxTool, ToolCallback> = {
    getCurrentTrack: getCurrentTrackCallback,
    getCurrentLyrics: getCurrentLyricsCallback,
    searchLyrics: searchLyricsCallback,
    checkConnection: checkConnectionCallback,
};

const TOOL_DEFINITIONS: Record<JukeBoxTool, ToolDefinition> = {
    getCurrentTrack: {
        name: 'RoonGetCurrentTrack',
        displayName: 'Roon: Get Current Track',
        description: 'Gets the current track playing on Roon. Call when you need to display the current track information.',
        parameters: TOOL_PARAMETERS.getCurrentTrack,
        action: TOOL_CALLBACKS.getCurrentTrack,
        shouldRegister: isToolValid,
    },
    getCurrentLyrics: {
        name: 'RoonGetCurrentLyrics',
        displayName: 'Roon: Get Current Lyrics',
        description: 'Gets lyrics for the currently playing track on Roon. Call when you need to display lyrics for the current track.',
        parameters: TOOL_PARAMETERS.getCurrentLyrics,
        action: TOOL_CALLBACKS.getCurrentLyrics,
        shouldRegister: isToolValid,
    },
    searchLyrics: {
        name: 'RoonSearchLyrics',
        displayName: 'Roon: Search Lyrics',
        description: 'Searches for lyrics of a specific song and artist. Call when you need to find lyrics for a particular track.',
        parameters: TOOL_PARAMETERS.searchLyrics,
        action: TOOL_CALLBACKS.searchLyrics,
        shouldRegister: isToolValid,
    },
    checkConnection: {
        name: 'RoonCheckConnection',
        displayName: 'Roon: Check Connection',
        description: 'Checks if the Roon plugin is connected and operational. Call when you need to verify Roon connectivity.',
        parameters: TOOL_PARAMETERS.checkConnection,
        action: TOOL_CALLBACKS.checkConnection,
        shouldRegister: isToolValid,
    },
};

async function isToolValid(): Promise<boolean> {
    // JukeBox tools are always valid if the plugin is loaded
    return true;
}

async function getCurrentTrackCallback(): Promise<string | RoonCurrentTrackResponse['track']> {
    try {
        const response = await fetch(JUKEBOX_ENDPOINTS.CURRENT_TRACK);
        if (!response.ok) {
            return 'JukeBox plugin is not available or not responding.';
        }
        
        const data: RoonCurrentTrackResponse = await response.json();
        if (!data.success || !data.track) {
            return 'No track currently playing on Roon.';
        }
        
        return data.track;
    } catch (error) {
        console.error('Error fetching current track:', error);
        return 'Error fetching current track. See console for details.';
    }
}

async function getCurrentLyricsCallback(): Promise<string | RoonCurrentLyricsResponse> {
    try {
        const response = await fetch(JUKEBOX_ENDPOINTS.CURRENT_LYRICS);
        if (!response.ok) {
            return 'JukeBox plugin is not available or not responding.';
        }
        
        const data: RoonCurrentLyricsResponse = await response.json();
        if (!data.success) {
            return 'No lyrics available for the current track.';
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching current lyrics:', error);
        return 'Error fetching current lyrics. See console for details.';
    }
}

async function searchLyricsCallback({ song, artist }: SearchLyricsParameters): Promise<string | RoonSearchLyricsResponse> {
    try {
        const requestBody: RoonSearchLyricsRequest = { song, artist };
        
        const response = await fetch(JUKEBOX_ENDPOINTS.SEARCH_LYRICS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
        
        if (!response.ok) {
            return 'JukeBox plugin is not available or not responding.';
        }
        
        const data: RoonSearchLyricsResponse = await response.json();
        if (!data.success) {
            return `No lyrics found for "${song}" by ${artist}.`;
        }
        
        return data;
    } catch (error) {
        console.error('Error searching lyrics:', error);
        return 'Error searching lyrics. See console for details.';
    }
}

async function checkConnectionCallback(): Promise<string | RoonProbeResponse> {
    try {
        const response = await fetch(JUKEBOX_ENDPOINTS.PROBE);
        if (!response.ok) {
            return 'JukeBox plugin is not available.';
        }
        
        const data: RoonProbeResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error checking connection:', error);
        return 'Error checking JukeBox connection. See console for details.';
    }
}

export function syncFunctionTools(): void {
    const context = SillyTavern.getContext();
    const settings = getSettings();
    
    for (const [key, definition] of Object.entries(TOOL_DEFINITIONS)) {
        if (settings[key as keyof typeof settings]) {
            context.registerFunctionTool(definition);
        } else {
            context.unregisterFunctionTool(definition.name);
        }
    }
}