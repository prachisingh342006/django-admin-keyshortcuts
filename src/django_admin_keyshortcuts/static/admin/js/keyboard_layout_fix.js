/**
 * Keyboard Layout Normalization Fix (Issue #3)
 *
 * The GitHub Hotkey library uses event.key to match shortcuts, but
 * event.key varies across keyboard layouts. For example, "/" is on
 * the lowercase layer of US English but requires Shift on German.
 *
 * This module patches the global keydown handler to normalize certain
 * keys using event.code (physical key position) as a fallback when
 * event.key doesn't produce the expected character.
 *
 * Approach: Before the hotkey library processes a keydown event, we
 * check if the physical key code maps to an expected shortcut
 * character but the produced key doesn't match. If so, we create a
 * new synthetic event with the corrected key.
 */

'use strict';
{
    // Map physical key codes to the US-layout characters they produce.
    // This covers all single-key shortcuts used by django-admin-keyshortcuts.
    const codeToUSKey = {
        'Slash': '/',
        'BracketLeft': '[',
        'BracketRight': ']',
        'Semicolon': ';',
        'Quote': "'",
        'Comma': ',',
        'Period': '.',
        'Minus': '-',
        'Equal': '=',
        'Backquote': '`',
        'Backslash': '\\',
        'KeyA': 'a',
        'KeyB': 'b',
        'KeyC': 'c',
        'KeyD': 'd',
        'KeyE': 'e',
        'KeyF': 'f',
        'KeyG': 'g',
        'KeyH': 'h',
        'KeyI': 'i',
        'KeyJ': 'j',
        'KeyK': 'k',
        'KeyL': 'l',
        'KeyM': 'm',
        'KeyN': 'n',
        'KeyO': 'o',
        'KeyP': 'p',
        'KeyQ': 'q',
        'KeyR': 'r',
        'KeyS': 's',
        'KeyT': 't',
        'KeyU': 'u',
        'KeyV': 'v',
        'KeyW': 'w',
        'KeyX': 'x',
        'KeyY': 'y',
        'KeyZ': 'z',
        'Digit0': '0',
        'Digit1': '1',
        'Digit2': '2',
        'Digit3': '3',
        'Digit4': '4',
        'Digit5': '5',
        'Digit6': '6',
        'Digit7': '7',
        'Digit8': '8',
        'Digit9': '9',
    };

    // Shifted key mappings for US layout (e.g., Shift + / = ?)
    const shiftedCodeToUSKey = {
        'Slash': '?',
        'Digit1': '!',
        'Digit2': '@',
        'Digit3': '#',
        'Digit4': '$',
        'Digit5': '%',
        'Digit6': '^',
        'Digit7': '&',
        'Digit8': '*',
        'Digit9': '(',
        'Digit0': ')',
        'Minus': '_',
        'Equal': '+',
        'BracketLeft': '{',
        'BracketRight': '}',
        'Backslash': '|',
        'Semicolon': ':',
        'Quote': '"',
        'Comma': '<',
        'Period': '>',
        'Backquote': '~',
    };

    function initLayoutFix() {
        document.addEventListener('keydown', function(event) {
            if (event.defaultPrevented) return;
            if (!event.code) return;

            // Determine expected US-layout key for this physical key
            let expectedKey;
            if (event.shiftKey && shiftedCodeToUSKey[event.code]) {
                expectedKey = shiftedCodeToUSKey[event.code];
            } else if (codeToUSKey[event.code]) {
                expectedKey = codeToUSKey[event.code];
            }

            if (!expectedKey) return;

            // If the actual key already matches the expected US key, nothing to fix
            if (event.key === expectedKey) return;

            // For letter keys with shift, also check uppercase
            if (event.shiftKey && event.code.startsWith('Key') && event.key === expectedKey.toUpperCase()) return;

            // Re-dispatch with the corrected key
            const syntheticEvent = new KeyboardEvent('keydown', {
                key: expectedKey,
                code: event.code,
                ctrlKey: event.ctrlKey,
                altKey: event.altKey,
                metaKey: event.metaKey,
                shiftKey: event.shiftKey,
                bubbles: true,
                cancelable: true,
                composed: true,
            });

            event.preventDefault();
            event.stopImmediatePropagation();
            event.target.dispatchEvent(syntheticEvent);
        }, true); // Use capture phase to run before the hotkey handler
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initLayoutFix);
    } else {
        initLayoutFix();
    }
}
