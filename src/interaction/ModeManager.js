/**
 * @fileoverview Manages interaction mode switching and state transitions.
 * Handles mode toggling and cleanup when switching between modes.
 * @module interaction/ModeManager
 */

import { MODES } from '../core/constants.js';

/**
 * Mode manager for interaction state machine
 *
 * Manages switching between interaction modes (move, add, delete, token, highlight).
 * Each mode toggle returns to move mode if already in that mode, or switches to the new mode.
 *
 * @class
 * @example
 * const modeManager = new ModeManager(appState);
 * modeManager.toggleMode(MODES.ADD); // Switch to add mode
 * modeManager.toggleMode(MODES.ADD); // Toggle back to move mode
 */
export class ModeManager {
  /**
   * Create a mode manager
   *
   * @param {AppState} appState - Application state
   */
  constructor(appState) {
    this.appState = appState;
  }

  /**
   * Toggle between a target mode and move mode
   *
   * If currently in the target mode, switches to move mode.
   * Otherwise, switches to the target mode.
   *
   * @param {string} targetMode - The mode to toggle (from MODES constants)
   */
  toggleMode(targetMode) {
    if (this.appState.mode === targetMode) {
      this.setMode(MODES.MOVE);
    } else {
      this.setMode(targetMode);
    }
  }

  /**
   * Set the current interaction mode
   *
   * Performs cleanup from previous mode and sets the new mode.
   *
   * @param {string} mode - The mode to set (from MODES constants)
   */
  setMode(mode) {
    // Cleanup based on current mode
    this.cleanupMode(this.appState.mode);

    // Set new mode
    this.appState.mode = mode;

    // Initialize new mode if needed
    this.initializeMode(mode);
  }

  /**
   * Clean up state when leaving a mode
   *
   * @param {string} mode - The mode being exited
   * @private
   */
  cleanupMode(mode) {
    switch (mode) {
      case MODES.ADD:
        // Clear add mode selection
        this.appState.addSelect = '';
        break;

      case MODES.DELETE:
        // Clear add mode selection (just in case)
        this.appState.addSelect = '';
        break;

      case MODES.TOKEN:
        // Clear add mode selection
        this.appState.addSelect = '';
        break;

      case MODES.HIGHLIGHT:
        // Clear highlight selection box origin
        this.appState.originX = null;
        this.appState.originY = null;
        break;

      case MODES.MOVE:
        // No special cleanup needed
        break;
    }
  }

  /**
   * Initialize state when entering a mode
   *
   * @param {string} mode - The mode being entered
   * @private
   */
  initializeMode(mode) {
    switch (mode) {
      case MODES.MOVE:
        // Ensure addSelect is cleared when entering move mode
        this.appState.addSelect = '';
        break;

      case MODES.ADD:
      case MODES.DELETE:
      case MODES.TOKEN:
      case MODES.HIGHLIGHT:
        // No special initialization needed
        break;
    }
  }

  /**
   * Get the current mode
   *
   * @returns {string} Current mode from MODES constants
   */
  getCurrentMode() {
    return this.appState.mode;
  }

  /**
   * Check if currently in a specific mode
   *
   * @param {string} mode - Mode to check (from MODES constants)
   * @returns {boolean} True if in the specified mode
   */
  isMode(mode) {
    return this.appState.mode === mode;
  }
}
