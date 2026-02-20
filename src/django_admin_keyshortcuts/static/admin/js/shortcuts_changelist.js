'use strict';
{
    let checkboxes = null;
    let currentCheckbox = null;

    function setUpShortcuts() {
        checkboxes = Array.from(
            document.querySelectorAll("#action-toggle, .action-select")
        );
    }

    function focusPreviousCheckbox() {
        if (!checkboxes.length) {
            return;
        }
        if (!currentCheckbox || currentCheckbox === checkboxes[0]) {
            currentCheckbox = checkboxes[checkboxes.length - 1];
        } else {
            currentCheckbox = checkboxes[checkboxes.indexOf(currentCheckbox) - 1];
        }
        currentCheckbox.focus();
    }

    function focusNextCheckbox() {
        if (!checkboxes.length) {
            return;
        }
        if (!currentCheckbox || currentCheckbox === checkboxes[checkboxes.length - 1]) {
            currentCheckbox = checkboxes[0];
        } else {
            currentCheckbox = checkboxes[checkboxes.indexOf(currentCheckbox) + 1];
        }
        currentCheckbox.focus();
    }

    function selectCheckbox() {
        if (currentCheckbox) {
            currentCheckbox.click();
        }
    }

    function selectActionsSelect() {
        const actionsSelect = document.querySelector("select[name=action]");
        actionsSelect.focus();
    }

    /**
     * Open the change form for the currently focused row (Issue #5).
     *
     * When a checkbox (j/k navigation) is focused, pressing Enter opens
     * the change form link in the same row. This mimics the vi-like
     * "open selected item" pattern.
     */
    function openFocusedRow() {
        if (!currentCheckbox || currentCheckbox.id === 'action-toggle') {
            return;
        }
        // The checkbox lives in a <td> inside a <tr>.
        // The link to the change form is in the first <th> of the same <tr>.
        const row = currentCheckbox.closest('tr');
        if (!row) return;

        const link = row.querySelector('th a');
        if (link) {
            link.click();
        }
    }

    function bindShortcutActionsToButtons() {
        document.getElementById("keyshortcut-prev-btn").addEventListener("click", focusPreviousCheckbox);
        document.getElementById("keyshortcut-next-btn").addEventListener("click", focusNextCheckbox);
        document.getElementById("keyshortcut-select-btn").addEventListener("click", selectCheckbox);
        document.getElementById("keyshortcut-select-actions-btn").addEventListener("click", selectActionsSelect);

        const openRowBtn = document.getElementById("keyshortcut-open-row-btn");
        if (openRowBtn) {
            openRowBtn.addEventListener("click", openFocusedRow);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setUpShortcuts);
        document.addEventListener("DOMContentLoaded", bindShortcutActionsToButtons);
    } else {
        setUpShortcuts();
        bindShortcutActionsToButtons();
    }
}
