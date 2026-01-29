/**
 * @fileoverview Centralized application state management.
 * Replaces 25+ global variables with a single state object for better organization.
 * @module core/AppState
 */

import { MODES, MAX_SPELL_LEVELS } from './constants.js';

/**
 * Application state class
 *
 * Centralizes all mutable application state that was previously scattered
 * across global variables. Provides a single source of truth for the
 * application's current state.
 *
 * @class
 * @example
 * const appState = new AppState();
 * appState.mode = MODES.ADD;
 * appState.spells = initializeSpells();
 */
export class AppState {
  constructor() {
    // Interaction mode state
    this.mode = MODES.MOVE;
    this.addSelect = '';  // Currently selected spell in add mode

    // Mouse state
    this.mouseX = 0;
    this.mouseY = 0;

    // Selection/highlight state
    this.originX = null;  // Selection box origin
    this.originY = null;
    this.xShift = [];  // Offset arrays for moving highlighted group
    this.yShift = [];

    // Spell arrays
    this.spells = [];  // Current active spells
    this.allSpells = [];  // Backup of all spells (for filtering)
    this.filteredSpells = [];  // Currently filtered spells

    // Filtering state
    this.isFiltered = false;
    this.isTextInputFocused = false;  // Disable keyboard shortcuts when typing

    // Spell slot tracking
    this.spellSlots = {
      maxSlots: Array(MAX_SPELL_LEVELS).fill(0),  // Max slots for levels 1-9
      usedSlots: Array(MAX_SPELL_LEVELS).fill(null).map(() => [])  // Boolean arrays
    };

    // Spell description cache (API responses)
    this.spellDescriptions = {};

    // UI state
    this.menuSchool = 'Abjuration';  // Currently selected school in menu

    // Counters (recalculated each frame)
    this.preparedCount = 0;
    this.cantripCount = 0;
    this.tokenCount = 0;
  }

  /**
   * Update mouse position
   *
   * @param {number} x - Mouse X coordinate
   * @param {number} y - Mouse Y coordinate
   */
  setMousePosition(x, y) {
    this.mouseX = x;
    this.mouseY = y;
  }

  /**
   * Clear highlight selection
   *
   * Unhighlights all spells and clears selection origin/offsets.
   */
  clearHighlight() {
    for (const spell of this.spells) {
      spell.highlight = false;
    }
    this.originX = null;
    this.originY = null;
    this.xShift = [];
    this.yShift = [];
  }

  /**
   * Get all highlighted spells
   *
   * @returns {Object[]} Array of highlighted spell objects
   */
  getHighlightedSpells() {
    return this.spells.filter(spell => spell.highlight);
  }

  /**
   * Find spell by name
   *
   * @param {string} name - Spell name to find
   * @returns {Object|null} The spell object or null if not found
   */
  findSpellByName(name) {
    return this.spells.find(spell => spell.name === name) || null;
  }

  /**
   * Get spells currently on the graph (y < 600)
   *
   * @returns {Object[]} Array of spells in the active graph area
   */
  getActiveSpells() {
    return this.spells.filter(spell => spell.y < 600);
  }

  /**
   * Update spell counts (prepared, cantrips, tokens)
   *
   * Should be called during each render cycle.
   */
  updateCounts() {
    this.preparedCount = 0;
    this.cantripCount = 0;
    this.tokenCount = 0;

    for (const spell of this.spells) {
      if (spell.y < 600) {
        if (spell.level > 0) {
          this.preparedCount++;
        } else {
          this.cantripCount++;
        }
        if (spell.token) {
          this.tokenCount++;
        }
      }
    }
  }

  /**
   * Reset all spells to their home positions
   *
   * Used when clearing the filter or resetting the graph.
   */
  resetAllSpells() {
    for (const spell of this.spells) {
      spell.reset();
    }
    this.clearHighlight();
    this.addSelect = '';
  }

  /**
   * Clear all crystallization tokens
   *
   * Removes the crystallized state from all spells.
   */
  clearAllTokens() {
    for (const spell of this.spells) {
      spell.token = false;
    }
  }

  /**
   * Initialize spell slots with a given configuration
   *
   * @param {number[]} maxSlots - Array of max slots per level (length 9)
   */
  initializeSpellSlots(maxSlots) {
    this.spellSlots.maxSlots = [...maxSlots];
    this.spellSlots.usedSlots = maxSlots.map(max => Array(max).fill(true));
  }

  /**
   * Toggle a spell slot between filled and empty
   *
   * @param {number} level - Spell level (1-9, index 0-8)
   * @param {number} slotIndex - Slot index within that level
   * @returns {boolean} True if toggle succeeded, false if invalid indices
   */
  toggleSpellSlot(level, slotIndex) {
    if (level < 0 || level >= MAX_SPELL_LEVELS) return false;
    if (slotIndex < 0 || slotIndex >= this.spellSlots.maxSlots[level]) return false;

    // Ensure usedSlots array exists
    if (!this.spellSlots.usedSlots[level]) {
      this.spellSlots.usedSlots[level] = [];
    }

    // Toggle the slot
    this.spellSlots.usedSlots[level][slotIndex] =
      !this.spellSlots.usedSlots[level][slotIndex];

    return true;
  }

  /**
   * Get serializable state for saving to JSON
   *
   * @returns {Object} State object for JSON serialization
   */
  toJSON() {
    return {
      spells: this.getActiveSpells().map(spell => ({
        name: spell.name,
        school: spell.school,
        level: spell.level,
        x: spell.x,
        y: spell.y,
        homeX: spell.homeX,
        homeY: spell.homeY,
        whitelist: [...spell.whitelist],
        token: spell.token,
        highlight: spell.highlight
      })),
      spellSlots: {
        maxSlots: [...this.spellSlots.maxSlots],
        usedSlots: this.spellSlots.usedSlots.map(arr => [...arr])
      }
    };
  }

  /**
   * Restore state from JSON data
   *
   * @param {Object} data - Saved state data
   */
  fromJSON(data) {
    // Restore spell slots if present
    if (data.spellSlots) {
      this.spellSlots = {
        maxSlots: [...data.spellSlots.maxSlots],
        usedSlots: data.spellSlots.usedSlots.map(arr => [...arr])
      };
    }
  }
}
