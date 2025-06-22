import { getSettings, addSettingsControls } from './settings';
import { syncFunctionTools } from './tools';
import { setCurrentTrack, checkJukeBoxStatus } from './prompt';

import './style.css';

let pollTimer: number | null = null;
let lastTrackUpdate = 0;

async function startPolling(): Promise<void> {
    const settings = getSettings();
    
    if (pollTimer) {
        clearInterval(pollTimer);
    }
    
    // Don't start polling if injection is disabled
    if (settings.position === -1) {
        return;
    }
    
    // Check if JukeBox is available before starting polling
    const isAvailable = await checkJukeBoxStatus();
    if (!isAvailable) {
        console.log('JukeBox plugin not available, skipping polling setup');
        return;
    }
    
    console.log(`Starting JukeBox polling every ${settings.pollInterval}ms`);
    
    pollTimer = window.setInterval(async () => {
        try {
            await setCurrentTrack();
        } catch (error) {
            console.error('Error during polling update:', error);
        }
    }, settings.pollInterval);
    
    // Immediate update
    await setCurrentTrack();
}

function stopPolling(): void {
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
        console.log('Stopped JukeBox polling');
    }
}

// Global function to manually trigger track update
async function updateCurrentTrack(): Promise<void> {
    await setCurrentTrack();
}

(async function main(): Promise<void> {
    const context = SillyTavern.getContext();
    const settings = getSettings();
    
    // Add settings controls
    addSettingsControls(settings);
    
    // Set up global function for manual updates
    globalThis.roon_setCurrentTrack = updateCurrentTrack;
    
    // Register function tools
    syncFunctionTools();
    
    // Start polling for track changes
    await startPolling();
    
    // Save settings
    context.saveSettingsDebounced();
    
    // Set up cleanup on page unload
    window.addEventListener('beforeunload', () => {
        stopPolling();
    });
    
    console.log('JukeBox extension initialized');
})();