import { install, uninstall } from './vendor/hotkey/hotkey.js';

'use strict';
{
    let shortcutsEnabled = localStorage.getItem('django.admin.shortcutsEnabled') || 'true';

    function installShortcuts() {
        for (const el of document.querySelectorAll('[data-hotkey]')) {
            install(el);
        }
    }

    function uninstallShortcuts() {
        for (const el of document.querySelectorAll('[data-hotkey]')) {
            uninstall(el);
        }
    }

    /**
     * Install a global keydown listener that intercepts modifier-based
     * shortcuts (Ctrl/Cmd+key, Alt+key) even when a form field is focused.
     *
     * The GitHub Hotkey library ignores keystrokes in form fields unless
     * data-hotkey-scope is set (Issue #2). This handler works around that
     * limitation by detecting modifier shortcuts and manually clicking the
     * matching [data-hotkey] element.
     */
    function installFormFieldShortcuts() {
        document.addEventListener('keydown', function(event) {
            if (shortcutsEnabled !== 'true') return;
            if (event.defaultPrevented) return;

            // Only handle events where a modifier key is held
            // (single-key shortcuts like j/k should NOT fire in form fields).
            const hasModifier = event.ctrlKey || event.metaKey || event.altKey;
            if (!hasModifier) return;

            const target = event.target;
            const isFormField = (
                target instanceof HTMLElement && (
                    target.nodeName === 'INPUT' ||
                    target.nodeName === 'TEXTAREA' ||
                    target.nodeName === 'SELECT' ||
                    target.isContentEditable
                )
            );
            if (!isFormField) return;

            // Build the hotkey string that GitHub Hotkey would produce
            const parts = [];
            if (event.ctrlKey && !event.metaKey) parts.push('Control');
            if (event.altKey) parts.push('Alt');
            if (event.metaKey) parts.push('Meta');
            if (event.shiftKey) parts.push('Shift');
            if (event.key && !['Control', 'Alt', 'Meta', 'Shift'].includes(event.key)) {
                parts.push(event.key);
            }
            const hotkeyString = parts.join('+');
            if (!hotkeyString) return;

            // Normalize Mod -> Meta (macOS) or Mod -> Control (others)
            const isMac = /Mac|iPod|iPhone|iPad/i.test(navigator.platform);

            // Find a matching [data-hotkey] element
            for (const el of document.querySelectorAll('[data-hotkey]')) {
                const registeredHotkey = el.getAttribute('data-hotkey');
                if (!registeredHotkey) continue;

                // Normalize each registered hotkey combo for comparison
                const combos = registeredHotkey.split(',').map(h => h.trim());
                for (const combo of combos) {
                    const normalizedParts = [];
                    for (const k of combo.split('+')) {
                        if (k === 'Mod') {
                            normalizedParts.push(isMac ? 'Meta' : 'Control');
                        } else {
                            normalizedParts.push(k);
                        }
                    }
                    const normalizedCombo = normalizedParts.join('+');
                    if (normalizedCombo === hotkeyString) {
                        event.preventDefault();
                        el.click();
                        return;
                    }
                }
            }
        });
    }

    function initShortcuts() {
        const toggleShortcuts = document.getElementById('toggle-shortcuts');
        if (!toggleShortcuts) return;

        if (shortcutsEnabled === 'true') {
            toggleShortcuts.checked = true;
            installShortcuts();
        }
        toggleShortcuts.addEventListener('change', function() {
            if (shortcutsEnabled === 'true') {
                shortcutsEnabled = 'false';
                uninstallShortcuts();
            } else {
                shortcutsEnabled = 'true';
                installShortcuts();
            }
            localStorage.setItem('django.admin.shortcutsEnabled', shortcutsEnabled);
        });
    }

    function showShortcutsDialog() {
        const dialog = document.getElementById("shortcuts-dialog");
        if (!dialog) return;
        dialog.showModal();
    }

    function showDialogOnClick() {
        const dialogButton = document.getElementById("open-shortcuts");
        if (!dialogButton) {
            return;
        }
        dialogButton.addEventListener("click", showShortcutsDialog);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initShortcuts);
        document.addEventListener("DOMContentLoaded", showDialogOnClick);
        document.addEventListener("DOMContentLoaded", installFormFieldShortcuts);
    } else {
        initShortcuts();
        showDialogOnClick();
        installFormFieldShortcuts();
    }
}
