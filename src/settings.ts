import { InjectionPosition, InjectionRole, MODULE_NAME } from './constants';
import { syncFunctionTools, JukeBoxTool } from './tools';
import { resetInject } from './prompt';
import html from './settings.html';

const { t, saveSettingsDebounced } = SillyTavern.getContext();

interface ExtensionSettingsBase {
    template: string;
    position: InjectionPosition;
    role: InjectionRole;
    depth: number;
    scan: boolean;
    includeLyrics: boolean;
    pollInterval: number;
    // Allow additional properties
    [key: string]: unknown;
}

type JukeBoxToolSettings = {
    [key in JukeBoxTool]: boolean;
};

export type ExtensionSettings = ExtensionSettingsBase & JukeBoxToolSettings;

interface GlobalSettings {
    [MODULE_NAME]: ExtensionSettings;
}

const defaultSettings: Readonly<ExtensionSettings> = Object.freeze({
    template: '[{{user}} is listening to {{song}} by {{artist}} from {{album}} on Roon in {{zone}}]',
    position: InjectionPosition.InChat,
    role: InjectionRole.System,
    depth: 1,
    scan: true,
    includeLyrics: false,
    pollInterval: 5000, // 5 seconds
    getCurrentTrack: true,
    getCurrentLyrics: true,
    searchLyrics: true,
    checkConnection: false,
});

export function getSettings(): ExtensionSettings {
    const context = SillyTavern.getContext();
    const globalSettings = context.extensionSettings as object as GlobalSettings;

    // Initialize settings if they don't exist
    if (!globalSettings[MODULE_NAME]) {
        globalSettings[MODULE_NAME] = structuredClone(defaultSettings);
    }

    // Ensure all default keys exist (helpful after updates)
    for (const key in defaultSettings) {
        if (globalSettings[MODULE_NAME][key] === undefined) {
            globalSettings[MODULE_NAME][key] = defaultSettings[key];
        }
    }

    return globalSettings[MODULE_NAME];
}

export function addSettingsControls(settings: ExtensionSettings): void {
    const settingsContainer = document.getElementById('roon_jukebox_container') ?? document.getElementById('extensions_settings2');
    if (!settingsContainer) {
        return;
    }

    const renderer = document.createElement('template');
    renderer.innerHTML = html;

    settingsContainer.appendChild(renderer.content);

    // Setup UI elements
    const elements = {
        template: document.getElementById('roon_template') as HTMLTextAreaElement,
        role: document.getElementById('roon_role') as HTMLSelectElement,
        position: Array.from(document.getElementsByName('roon_position')) as HTMLInputElement[],
        depth: document.getElementById('roon_depth') as HTMLInputElement,
        scan: document.getElementById('roon_scan') as HTMLInputElement,
        includeLyrics: document.getElementById('roon_include_lyrics') as HTMLInputElement,
        pollInterval: document.getElementById('roon_poll_interval') as HTMLInputElement,
        tools: {
            getCurrentTrack: document.getElementById('roon_tool_get_current_track') as HTMLInputElement,
            getCurrentLyrics: document.getElementById('roon_tool_get_current_lyrics') as HTMLInputElement,
            searchLyrics: document.getElementById('roon_tool_search_lyrics') as HTMLInputElement,
            checkConnection: document.getElementById('roon_tool_check_connection') as HTMLInputElement,
        },
    };

    // Initialize UI with current settings
    elements.template.value = settings.template;
    elements.role.value = settings.role.toString();
    elements.position.forEach((radio) => {
        radio.checked = settings.position === parseInt(radio.value);
    });
    elements.depth.value = settings.depth.toString();
    elements.scan.checked = settings.scan;
    elements.includeLyrics.checked = settings.includeLyrics;
    elements.pollInterval.value = settings.pollInterval.toString();
    elements.tools.getCurrentTrack.checked = settings.getCurrentTrack;
    elements.tools.getCurrentLyrics.checked = settings.getCurrentLyrics;
    elements.tools.searchLyrics.checked = settings.searchLyrics;
    elements.tools.checkConnection.checked = settings.checkConnection;

    // Define a generic handler for simple input changes
    const handleInputChange = <T extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        element: T,
        settingKey: keyof ExtensionSettings,
        transform?: (value: string | boolean) => number | string | boolean,
        callback?: () => void,
    ) => {
        element.addEventListener('input', () => {
            const value = element instanceof HTMLInputElement && element.type === 'checkbox'
                ? element.checked
                : element.value;
            settings[settingKey] = transform ? transform(value) : value;
            if (callback) {
                callback();
            }
            saveSettingsDebounced();
        });
    };

    // Set up event listeners
    handleInputChange(elements.template, 'template', value => value, resetInject);
    handleInputChange(elements.role, 'role', value => parseInt(value as string), resetInject);
    handleInputChange(elements.depth, 'depth', value => parseInt(value as string), resetInject);
    handleInputChange(elements.scan, 'scan', value => value, resetInject);
    handleInputChange(elements.includeLyrics, 'includeLyrics', value => value);
    handleInputChange(elements.pollInterval, 'pollInterval', value => parseInt(value as string));
    handleInputChange(elements.tools.getCurrentTrack, 'getCurrentTrack', value => value, syncFunctionTools);
    handleInputChange(elements.tools.getCurrentLyrics, 'getCurrentLyrics', value => value, syncFunctionTools);
    handleInputChange(elements.tools.searchLyrics, 'searchLyrics', value => value, syncFunctionTools);
    handleInputChange(elements.tools.checkConnection, 'checkConnection', value => value, syncFunctionTools);

    // Handle radio buttons separately
    elements.position.forEach((radio) => {
        radio.addEventListener('input', (e) => {
            settings.position = parseInt((e.target as HTMLInputElement).value);
            resetInject();
            saveSettingsDebounced();
        });
    });
}