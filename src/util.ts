/**
 * Utility functions for the JukeBox extension
 */

/**
 * Safely parse JSON with error handling
 * @param text JSON string to parse
 * @returns Parsed object or null if parsing fails
 */
export function safeJsonParse<T = unknown>(text: string): T | null {
    try {
        return JSON.parse(text) as T;
    } catch {
        return null;
    }
}

/**
 * Format time duration from milliseconds to human readable format
 * @param ms Duration in milliseconds
 * @returns Formatted time string (e.g., "3:42")
 */
export function formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Calculate playback progress as percentage
 * @param seek Current playback position in ms
 * @param length Total track length in ms
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(seek: number, length: number): number {
    if (length <= 0) return 0;
    return Math.min(100, Math.max(0, (seek / length) * 100));
}

/**
 * Debounce function calls
 * @param func Function to debounce
 * @param wait Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: never[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: number | null = null;
    
    return (...args: Parameters<T>) => {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        
        timeout = window.setTimeout(() => {
            func(...args);
        }, wait);
    };
}

/**
 * Sanitize text for safe HTML injection
 * @param text Text to sanitize
 * @returns Sanitized text
 */
export function sanitizeText(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}