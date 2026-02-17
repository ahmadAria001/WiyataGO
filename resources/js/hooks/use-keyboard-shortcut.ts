import { useEffect, useCallback, useRef } from 'react';

/**
 * Options for keyboard shortcut hook
 */
export interface KeyboardShortcutOptions {
    /**
     * Whether the shortcut is enabled
     * @default true
     */
    enabled?: boolean;

    /**
     * Whether to prevent default browser behavior
     * @default true
     */
    preventDefault?: boolean;

    /**
     * Whether to ignore shortcuts when typing in input fields
     * @default true
     */
    ignoreInputs?: boolean;
}

/**
 * Parse a key combination string into modifier flags and key
 * @example parseKeys('ctrl+shift+c') => { ctrl: true, shift: true, key: 'c' }
 */
function parseKeys(combination: string): {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    meta: boolean;
    key: string;
} {
    const parts = combination.toLowerCase().split('+');
    let key = parts[parts.length - 1];

    if (key === '' && parts.length > 2 && parts[parts.length - 2] === '') {
        key = '+';
    }

    return {
        ctrl: parts.includes('ctrl'),
        shift: parts.includes('shift'),
        alt: parts.includes('alt'),
        meta: parts.includes('meta') || parts.includes('cmd'),
        key,
    };
}

/**
 * Check if the event matches the parsed key combination
 */
function matchesKeys(
    event: KeyboardEvent,
    parsed: ReturnType<typeof parseKeys>,
): boolean {
    return (
        event.key.toLowerCase() === parsed.key &&
        event.ctrlKey === parsed.ctrl &&
        event.shiftKey === parsed.shift &&
        event.altKey === parsed.alt &&
        event.metaKey === parsed.meta
    );
}

/**
 * Component-scoped keyboard shortcut hook
 *
 * Attaches event listeners when component mounts, removes when unmounts.
 * Automatically filters input elements unless disabled.
 *
 * @param keys - Key combination(s) to listen for (e.g., 'ctrl+c', ['ctrl+c', 'meta+c'])
 * @param callback - Function to call when shortcut is pressed
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * // Single shortcut
 * useKeyboardShortcut('ctrl+s', handleSave);
 *
 * // Multiple shortcuts (cross-platform)
 * useKeyboardShortcut(['ctrl+c', 'meta+c'], toggleConnect);
 *
 * // With options
 * useKeyboardShortcut('escape', handleClose, { preventDefault: false });
 * ```
 */
export function useKeyboardShortcut(
    keys: string | string[],
    callback: () => void,
    options: KeyboardShortcutOptions = {},
): void {
    const {
        enabled = true,
        preventDefault = true,
        ignoreInputs = true,
    } = options;

    // Memoize callback to prevent unnecessary re-renders
    const callbackRef = useRef(callback);
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Parse all key combinations
    const parsedKeys = useCallback(() => {
        const keyArray = Array.isArray(keys) ? keys : [keys];
        return keyArray.map(parseKeys);
    }, [keys]);

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            // Ignore if typing in input fields
            if (ignoreInputs) {
                const target = event.target as HTMLElement;
                const tagName = target.tagName.toLowerCase();
                if (
                    tagName === 'input' ||
                    tagName === 'textarea' ||
                    tagName === 'select' ||
                    target.isContentEditable
                ) {
                    return;
                }
            }

            // Check if any key combination matches
            const combinations = parsedKeys();
            const matches = combinations.some((parsed) =>
                matchesKeys(event, parsed),
            );

            if (matches) {
                if (preventDefault) {
                    event.preventDefault();
                }
                callbackRef.current();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enabled, preventDefault, ignoreInputs, parsedKeys]);
}
