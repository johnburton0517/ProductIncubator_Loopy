/** *************************************************************************************************
User Summary
This file controls key mapping so that keyboard shortcuts can be used.

Technical Summary
The entire code consists of an Immediately Invoked Function Expression (IIFE). A singleton object
named Key is defined to handle the state of a keystroke. Another object, KEY_CODES maps keystrokes
to their desired action. For example, ‘s' is the keystroke for 'save’. When a key is pressed, a
function checks if the key is in the KEY_CODES object and publishes the key if so. When a key is
released, another function sets the key to false to indicate that the key is no longer being
pressed. The code also contains listeners for a key press and key release.

************************************************************************************************** */

(function (exports) {
    // Singleton
    const Key = {}; // Create an empty object to hold the key state
    exports.Key = Key;

    // Keycodes to words mapping
    const KEY_CODES = {

        17: 'control',
        91: 'control', // macs
        13: 'enter', // enter
        46: 'delete',

        // TODO: Standardize the NAMING across files?!?!
        78: 'ink', // Pe(n)cil
        86: 'drag', // Mo(v)e
        69: 'erase', // (E)rase
        84: 'label', // (T)ext
        83: 'save', // (S)ave

    };

    // Event Handling
    // TODO: cursors stay when click button? orrrrr switch over to fake-cursor.
    // Event handler for keydown event
    Key.onKeyDown = function (event) {
        // Check if keyboard shortcut can be used and that keystroke maps to a shortcut
        if (window.loopy && loopy.modal && loopy.modal.isShowing) return;
        const code = KEY_CODES[event.keyCode];
        if (!code) return;

        // Set the needed data if a mapped key is pressed
	    Key[code] = true;
	    publish(`key/${code}`);
	    event.stopPropagation();
	    event.preventDefault();
    };
    // Event handler for keyup event
    Key.onKeyUp = function (event) {
        // Check if keyboard shortcut can be used and that keystroke maps to a shortcut
        if (window.loopy && loopy.modal && loopy.modal.isShowing) return;
        const code = KEY_CODES[event.keyCode];
        if (!code) return;

        // Set the needed data if a mapped key is pressed
	    Key[code] = false;
	    event.stopPropagation();
	    event.preventDefault();
    };
    // Listen for keystrokes
    window.addEventListener('keydown', Key.onKeyDown, false);
    window.addEventListener('keyup', Key.onKeyUp, false);
}(window));
