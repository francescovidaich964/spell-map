/**
 * @fileoverview Manages spell slot configuration and tracking.
 * Handles the modal for configuring slots and click detection for toggling slot state.
 * @module features/SpellSlotManager
 */

import {
  MAX_SPELL_LEVELS,
  MIN_SLOTS_PER_LEVEL,
  MAX_SLOTS_PER_LEVEL,
  SPELL_SLOT_START_Y,
  SPELL_SLOT_SPACING_Y,
  SPELL_SLOT_SPACING_X,
  SPELL_SLOT_RADIUS
} from '../core/constants.js';

/**
 * Spell slot manager for tracking and configuring spell slots
 *
 * Manages:
 * - Configuration modal (L key) with 9 level inputs (0-12 slots each)
 * - Click detection for toggling slot filled/empty state
 * - Slot initialization when adding new slots
 *
 * @class
 * @example
 * const slotManager = new SpellSlotManager(appState);
 * slotManager.initializeUI();
 * if (slotManager.checkSlotClick(mouseX, mouseY)) {
 *   // Slot was clicked and toggled
 * }
 */
export class SpellSlotManager {
  /**
   * Create a spell slot manager
   *
   * @param {AppState} appState - Application state
   */
  constructor(appState) {
    this.appState = appState;
    this.modal = null;
  }

  /**
   * Initialize UI event listeners
   *
   * Sets up the modal buttons for save/cancel actions.
   * Must be called after DOM is loaded.
   */
  initializeUI() {
    this.modal = document.getElementById('slotConfigModal');

    // Save button
    const saveButton = document.getElementById('slotConfigSave');
    if (saveButton) {
      saveButton.addEventListener('click', () => this.saveConfiguration());
    }

    // Cancel button
    const cancelButton = document.getElementById('slotConfigCancel');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => this.hideModal());
    }
  }

  /**
   * Show the spell slot configuration modal
   *
   * Populates inputs with current slot values.
   */
  showModal() {
    if (!this.modal) {
      console.error('Modal not found. Did you call initializeUI()?');
      return;
    }

    // Populate inputs with current values
    for (let i = 0; i < MAX_SPELL_LEVELS; i++) {
      const input = document.getElementById('slotLevel' + (i + 1));
      if (input) {
        input.value = this.appState.spellSlots.maxSlots[i];
      }
    }

    this.modal.style.display = 'flex';
  }

  /**
   * Hide the spell slot configuration modal
   */
  hideModal() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }

  /**
   * Save spell slot configuration from modal inputs
   *
   * Reads all 9 level inputs, validates ranges, and updates app state.
   * New slots are initialized as filled (true).
   */
  saveConfiguration() {
    for (let i = 0; i < MAX_SPELL_LEVELS; i++) {
      const input = document.getElementById('slotLevel' + (i + 1));
      if (!input) continue;

      let value = parseInt(input.value) || 0;

      // Validate range
      if (value < MIN_SLOTS_PER_LEVEL) value = MIN_SLOTS_PER_LEVEL;
      if (value > MAX_SLOTS_PER_LEVEL) value = MAX_SLOTS_PER_LEVEL;

      const oldMaxSlots = this.appState.spellSlots.maxSlots[i];
      this.appState.spellSlots.maxSlots[i] = value;

      // Initialize usedSlots array for this level
      // If adding new slots, start them all as filled (true)
      // If keeping existing slots, preserve their state
      if (value > oldMaxSlots) {
        // Adding new slots - keep old ones, fill new ones
        if (!this.appState.spellSlots.usedSlots[i]) {
          this.appState.spellSlots.usedSlots[i] = [];
        }
        for (let j = oldMaxSlots; j < value; j++) {
          this.appState.spellSlots.usedSlots[i][j] = true; // New slots start filled
        }
      } else {
        // Same or fewer slots - just truncate if needed
        this.appState.spellSlots.usedSlots[i] = this.appState.spellSlots.usedSlots[i] || [];
        this.appState.spellSlots.usedSlots[i].length = value;
      }

      // If this is the first time configuring this level, fill all slots
      if (oldMaxSlots === 0 && value > 0) {
        this.appState.spellSlots.usedSlots[i] = [];
        for (let j = 0; j < value; j++) {
          this.appState.spellSlots.usedSlots[i][j] = true; // All slots start filled
        }
      }
    }

    this.hideModal();
  }

  /**
   * Check if a mouse click hit a spell slot circle
   *
   * If a slot is clicked, toggles its state between filled and empty.
   *
   * @param {number} mouseX - Mouse X coordinate
   * @param {number} mouseY - Mouse Y coordinate
   * @returns {boolean} True if a slot was clicked, false otherwise
   */
  checkSlotClick(mouseX, mouseY) {
    for (let level = 0; level < MAX_SPELL_LEVELS; level++) {
      const maxSlots = this.appState.spellSlots.maxSlots[level];
      if (maxSlots === 0) continue;

      const y = SPELL_SLOT_START_Y + level * SPELL_SLOT_SPACING_Y;

      for (let slot = 0; slot < maxSlots; slot++) {
        const x = 55 + slot * SPELL_SLOT_SPACING_X;
        const distance = Math.sqrt(
          Math.pow(mouseX - x, 2) + Math.pow(mouseY - (y - 4), 2)
        );

        if (distance < SPELL_SLOT_RADIUS) {
          // Toggle this specific slot
          this.appState.toggleSpellSlot(level, slot);
          return true; // Click handled
        }
      }
    }

    return false; // No slot clicked
  }

  /**
   * Reset all spell slots to filled state
   *
   * Useful for long rest simulation.
   */
  resetAllSlots() {
    for (let level = 0; level < MAX_SPELL_LEVELS; level++) {
      const maxSlots = this.appState.spellSlots.maxSlots[level];
      if (maxSlots > 0) {
        this.appState.spellSlots.usedSlots[level] = Array(maxSlots).fill(true);
      }
    }
  }

  /**
   * Get count of available (filled) slots for a level
   *
   * @param {number} level - Spell level (0-8 for levels 1-9)
   * @returns {number} Number of available slots
   */
  getAvailableSlots(level) {
    if (level < 0 || level >= MAX_SPELL_LEVELS) return 0;

    const slots = this.appState.spellSlots.usedSlots[level] || [];
    return slots.filter(filled => filled).length;
  }

  /**
   * Get count of used (empty) slots for a level
   *
   * @param {number} level - Spell level (0-8 for levels 1-9)
   * @returns {number} Number of used slots
   */
  getUsedSlots(level) {
    if (level < 0 || level >= MAX_SPELL_LEVELS) return 0;

    const maxSlots = this.appState.spellSlots.maxSlots[level];
    const availableSlots = this.getAvailableSlots(level);
    return maxSlots - availableSlots;
  }
}
