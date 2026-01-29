/**
 * @fileoverview Manages spell filtering by name.
 * Allows users to filter the spell menu to show only specific spells.
 * @module features/SpellFilter
 */

import { Spell, SPELL_POSITIONS_X, SPELL_POSITIONS_Y } from '../core/SpellData.js';

/**
 * Spell filter manager
 *
 * Handles filtering spells by name from textarea input.
 * Features:
 * - Parse textarea input (one spell per line)
 * - Find matching spells (case-insensitive)
 * - Reposition filtered spells in menu grid
 * - Reset to original spell arrangement
 * - Manage text input focus state
 *
 * @class
 * @example
 * const spellFilter = new SpellFilter(appState);
 * spellFilter.initializeUI();
 * spellFilter.filterSpells('Fireball\nMagic Missile\nShield');
 */
export class SpellFilter {
  /**
   * Create a spell filter
   *
   * @param {AppState} appState - Application state
   */
  constructor(appState) {
    this.appState = appState;
    this.textInput = null;
    this.filterButton = null;
    this.resetButton = null;
  }

  /**
   * Initialize UI event listeners
   *
   * Sets up textarea focus/blur events and button click handlers.
   * Must be called after DOM is loaded.
   */
  initializeUI() {
    this.textInput = document.getElementById('spellFilterInput');
    this.filterButton = document.getElementById('filterButton');
    this.resetButton = document.getElementById('resetButton');

    if (!this.textInput || !this.filterButton || !this.resetButton) {
      console.error('Spell filter UI elements not found');
      return;
    }

    // Focus event - disable spell map controls
    this.textInput.addEventListener('focus', () => {
      this.appState.isTextInputFocused = true;
      console.log('Text input focused - spell map controls disabled');
    });

    // Blur event - re-enable spell map controls
    this.textInput.addEventListener('blur', () => {
      this.appState.isTextInputFocused = false;
      console.log('Text input unfocused - spell map controls enabled');
    });

    // Filter button click
    this.filterButton.addEventListener('click', () => {
      const input = this.textInput.value;
      this.filterSpells(input);
    });

    // Reset button click
    this.resetButton.addEventListener('click', () => {
      this.resetSpells();
      this.textInput.value = '';
    });

    // Allow Enter key to apply filter (Ctrl+Enter for new line)
    this.textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.ctrlKey) {
        e.preventDefault();
        this.filterButton.click();
      }
    });
  }

  /**
   * Filter spells based on provided list
   *
   * Takes textarea input (one spell per line), finds matching spells,
   * and repositions them in the menu grid.
   *
   * @param {string} spellNames - Newline-separated spell names
   */
  filterSpells(spellNames) {
    // Convert input to array and clean it
    const spellList = spellNames
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (spellList.length === 0) {
      this.resetSpells();
      return;
    }

    // Create filtered array
    this.appState.filteredSpells = [];
    const foundSpells = [];

    // Find spells that match the input list
    spellList.forEach(inputName => {
      const foundSpell = this.appState.allSpells.find(
        spell => spell.name.toLowerCase() === inputName.toLowerCase()
      );
      if (foundSpell) {
        foundSpells.push(foundSpell);
      }
    });

    if (foundSpells.length === 0) {
      alert('No matching spells found!');
      return;
    }

    // Group by school and recalculate positions
    const spellsBySchool = {};
    foundSpells.forEach(spell => {
      if (!spellsBySchool[spell.school]) {
        spellsBySchool[spell.school] = [];
      }
      spellsBySchool[spell.school].push(spell);
    });

    // Reassign positions using SPELL_POSITIONS arrays
    let currentIndex = 0;
    Object.keys(spellsBySchool).forEach(school => {
      spellsBySchool[school].forEach(spell => {
        const newSpell = new Spell(
          spell.name,
          spell.school,
          spell.level,
          SPELL_POSITIONS_X[currentIndex],
          SPELL_POSITIONS_Y[currentIndex]
        );
        this.appState.filteredSpells.push(newSpell);
        currentIndex++;
      });
    });

    // Replace the global spells array
    this.appState.spells = this.appState.filteredSpells;
    this.appState.isFiltered = true;

    console.log(`Filtered to ${this.appState.spells.length} spells`);
  }

  /**
   * Reset to all spells
   *
   * Restores the original unfiltered spell list.
   */
  resetSpells() {
    // Create fresh copies of all spells from allSpells
    this.appState.spells = this.appState.allSpells.map(spell => {
      const newSpell = new Spell(
        spell.name,
        spell.school,
        spell.level,
        spell.homeX,
        spell.homeY
      );
      // Preserve whitelist if it exists
      if (spell.whitelist && spell.whitelist.length > 0) {
        newSpell.whitelist = [...spell.whitelist];
      }
      // Preserve token state if it exists
      if (spell.token) {
        newSpell.token = spell.token;
      }
      return newSpell;
    });

    this.appState.isFiltered = false;
    console.log('Reset to all spells');
  }

  /**
   * Initialize allSpells with a copy of the original spells array
   *
   * Should be called once at application startup with the spell database.
   *
   * @param {Spell[]} spellsArray - The full spell database
   */
  initializeAllSpells(spellsArray) {
    this.appState.allSpells = spellsArray.map(spell => {
      const copy = new Spell(spell.name, spell.school, spell.level, spell.homeX, spell.homeY);
      copy.whitelist = [...spell.whitelist];
      copy.token = spell.token;
      copy.highlight = spell.highlight;
      return copy;
    });
  }
}
