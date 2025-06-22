// SillyTavern Global Type Declarations
interface SillyTavernContext {
    chat: any[];
    characters: any[];
    characterId: number;
    groups: any[];
    extensionSettings: Record<string, any>;
    setExtensionPrompt: (id: string, message: string, position: number, depth?: number, scan?: boolean, role?: number) => void;
    substituteParamsExtended: (template: string, params: Record<string, string>) => string;
    registerFunctionTool: (tool: any) => void;
    unregisterFunctionTool: (name: string) => void;
    saveSettingsDebounced: () => void;
    t: (key: string) => string;
}
export {}
declare global {
    // SillyTavern global namespace
    const SillyTavern: {
        getContext(): SillyTavernContext;
    };
    
    // Global toastr for notifications
    const toastr: {
        success: (message: string) => void;
        error: (message: string) => void;
        info: (message: string) => void;
        warning: (message: string) => void;
    };

    // Extension-specific global function
    function roon_setCurrentTrack(): Promise<void>;
}