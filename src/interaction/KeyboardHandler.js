/**
 * @fileoverview Handles all keyboard interactions and shortcuts.
 * Manages mode toggling, file operations, spell slot configuration, and arrow key movement.
 * @module interaction/KeyboardHandler
 */

import { KEY_CODES, MODES, ARROW_KEY_MOVEMENT } from '../core/constants.js';

/**
 * Keyboard handler for shortcuts and controls
 *
 * Handles keyboard shortcuts:
 * - Z: Toggle add mode
 * - X: Toggle delete mode
 * - C: Toggle token/crystallize mode
 * - V: Toggle highlight mode
 * - L: Open spell slot configuration modal
 * - S: Save arrangement to file
 * - O: Open/load arrangement from file
 * - Arrow keys: Move highlighted spells (5px increments)
 *
 * Respects isTextInputFocused to disable shortcuts during text input.
 *
 * @class
 * @example
 * const keyboardHandler = new KeyboardHandler(appState, modeManager, slotManager, fileManager);
 * document.addEventListener('keydown', (e) => keyboardHandler.onKeyDown(e));
 */
export class KeyboardHandler {
  /**
   * Create a keyboard handler
   *
   * @param {AppState} appState - Application state
   * @param {ModeManager} modeManager - Mode manager instance
   * @param {SpellSlotManager} slotManager - Spell slot manager instance
   * @param {FileManager} fileManager - File manager instance
   */
  constructor(appState, modeManager, slotManager, fileManager) {
    this.appState = appState;
    this.modeManager = modeManager;
    this.slotManager = slotManager;
    this.fileManager = fileManager;
  }

  /**
   * Handle keydown event
   *
   * @param {KeyboardEvent} e - Keyboard event
   */
  onKeyDown(e) {
    const key = e.keyCode;

    // Check if modal is open
    const modal = document.getElementById('slotConfigModal');
    const modalOpen = modal && modal.style.display === 'flex';

    // Don't process spell map controls if text input is focused or modal is open
    if (this.appState.isTextInputFocused || modalOpen) {
      return; // Allow normal text input behavior - DON'T call preventDefault
    }

    // Only prevent default if we're handling spell map controls
    e.preventDefault();

    // Mode toggle shortcuts
    if (key === KEY_CODES.Z) {
      // Z - Toggle add mode
      this.modeManager.toggleMode(MODES.ADD);
    } else if (key === KEY_CODES.X) {
      // X - Toggle delete mode
      this.modeManager.toggleMode(MODES.DELETE);
    } else if (key === KEY_CODES.C) {
      // C - Toggle token/crystallize mode
      this.modeManager.toggleMode(MODES.TOKEN);
    } else if (key === KEY_CODES.V) {
      // V - Toggle highlight mode
      this.modeManager.toggleMode(MODES.HIGHLIGHT);
    } else if (key === KEY_CODES.L) {
      // L - Configure spell slots
      this.slotManager.showModal();
    } else if (key === KEY_CODES.S) {
      // S - Save arrangement
      this.handleSave();
    } else if (key === KEY_CODES.O) {
      // O - Open/load arrangement
      this.handleLoad();
    } else if (key === KEY_CODES.ARROW_UP) {
      // Arrow up - Move highlighted spells up
      this.moveHighlightedSpells(0, -ARROW_KEY_MOVEMENT);
    } else if (key === KEY_CODES.ARROW_DOWN) {
      // Arrow down - Move highlighted spells down
      this.moveHighlightedSpells(0, ARROW_KEY_MOVEMENT);
    } else if (key === KEY_CODES.ARROW_LEFT) {
      // Arrow left - Move highlighted spells left
      this.moveHighlightedSpells(-ARROW_KEY_MOVEMENT, 0);
    } else if (key === KEY_CODES.ARROW_RIGHT) {
      // Arrow right - Move highlighted spells right
      this.moveHighlightedSpells(ARROW_KEY_MOVEMENT, 0);
    }
  }

  /**
   * Handle save shortcut (S key)
   *
   * @private
   */
  handleSave() {
    this.fileManager.saveArrangement();
  }

  /**
   * Handle load shortcut (O key)
   *
   * @private
   */
  handleLoad() {
    this.fileManager.loadArrangement();
  }

  /**
   * Move all highlighted spells by a delta
   *
   * @param {number} dx - Delta X (pixels to move horizontally)
   * @param {number} dy - Delta Y (pixels to move vertically)
   * @private
   */
  moveHighlightedSpells(dx, dy) {
    for (const spell of this.appState.spells) {
      if (spell.highlight) {
        spell.x += dx;
        spell.y += dy;
      }
    }
  }

  /**
   * Check if a specific key is pressed
   *
   * Utility method for checking keyboard state.
   *
   * @param {KeyboardEvent} e - Keyboard event
   * @param {number} keyCode - Key code to check
   * @returns {boolean} True if the specified key is pressed
   */
  isKeyPressed(e, keyCode) {
    return e.keyCode === keyCode;
  }
}
