/**
 * @fileoverview Manages save/load functionality for spell arrangements.
 * Handles JSON serialization with backward compatibility for old save formats.
 * @module features/FileManager
 */

import { MENU_Y_THRESHOLD } from '../core/constants.js';

/**
 * File manager for save/load operations
 *
 * Manages saving and loading spell arrangements to/from JSON files.
 * Features:
 * - Save spell positions, connections, crystallization, and spell slots
 * - Load with backward compatibility (supports old array-only format)
 * - JSON validation before applying loaded data
 * - File download/upload via browser APIs
 *
 * @class
 * @example
 * const fileManager = new FileManager(appState);
 * fileManager.saveArrangement('my-wizard');
 * fileManager.loadArrangement((data) => { ... });
 */
export class FileManager {
  /**
   * Create a file manager
   *
   * @param {AppState} appState - Application state
   */
  constructor(appState, apiClient) {
    this.appState = appState;
    this.apiClient = apiClient;
  }

  /**
   * Save current spell arrangement to JSON file
   *
   * Prompts user for filename and downloads a JSON file containing:
   * - Spells in active area (y < 600) with positions and connections
   * - Spell slot configuration
   *
   * @param {string} [defaultFilename] - Optional default filename (without .json)
   */
  saveArrangement(defaultFilename) {
    // Get all spells currently in the active area
    const usedSpells = [];
    for (const spell of this.appState.spells) {
      if (spell.y < MENU_Y_THRESHOLD) {
        usedSpells.push({
          name: spell.name,
          school: spell.school,
          level: spell.level,
          x: spell.x,
          y: spell.y,
          homeX: spell.homeX,
          homeY: spell.homeY,
          whitelist: [...spell.whitelist],
          token: spell.token,
          highlight: spell.highlight,
          cachedDescription: this.apiClient?.cache[spell.name] || null
        });
      }
    }

    // Create save data with spells and spell slots
    const saveData = {
      spells: usedSpells,
      spellSlots: {
        maxSlots: [...this.appState.spellSlots.maxSlots],
        usedSlots: this.appState.spellSlots.usedSlots.map(arr => [...arr])
      }
    };

    // Prompt for filename
    const filename = window.prompt(
      'Enter filename for spell arrangement:',
      defaultFilename || 'spell-arrangement'
    );

    if (filename) {
      this.downloadJSON(filename, saveData);
      console.log(`Saved ${usedSpells.length} spells and spell slot configuration to ${filename}.json`);
    }
  }

  /**
   * Load spell arrangement from JSON file
   *
   * Opens file picker and loads spell arrangement.
   * Supports both new format (object with spells and spellSlots) and
   * old format (array only) for backward compatibility.
   *
   * @param {Function} callback - Callback function to handle loaded data
   */
  loadArrangement(callback) {
    this.uploadJSON((data) => {
      try {
        this.applyLoadedData(data);
        if (callback) {
          callback(data);
        }
      } catch (error) {
        console.error('Error applying loaded data:', error);
        alert('Error loading spell arrangement: ' + error.message);
      }
    });
  }

  /**
   * Apply loaded data to application state
   *
   * Handles both old format (array) and new format (object with spells and spellSlots).
   *
   * @param {Object|Array} data - Loaded save data
   * @private
   */
  applyLoadedData(data) {
    // Handle both old format (array) and new format (object with spells and spellSlots)
    const usedSpells = Array.isArray(data) ? data : data.spells;

    if (!usedSpells || !Array.isArray(usedSpells)) {
      throw new Error('Invalid save file format: spells array not found');
    }

    // Restore API cache from saved descriptions
    if (this.apiClient) {
      for (const savedSpell of usedSpells) {
        if (savedSpell.cachedDescription && !this.apiClient.cache[savedSpell.name]) {
          this.apiClient.cache[savedSpell.name] = savedSpell.cachedDescription;
        }
      }
    }

    // Reset all spells first
    for (const spell of this.appState.spells) {
      spell.x = spell.homeX;
      spell.y = spell.homeY;
      spell.token = false;
      spell.highlight = false;
      spell.whitelist = [];
    }

    // Restore spell slots if present
    if (data.spellSlots) {
      this.appState.spellSlots.maxSlots = [...data.spellSlots.maxSlots] || Array(9).fill(0);
      this.appState.spellSlots.usedSlots = data.spellSlots.usedSlots.map(arr => [...arr]) || Array(9).fill([]);

      // Ensure usedSlots arrays exist for each level
      for (let level = 0; level < 9; level++) {
        if (!this.appState.spellSlots.usedSlots[level]) {
          this.appState.spellSlots.usedSlots[level] = [];
          for (let slot = 0; slot < this.appState.spellSlots.maxSlots[level]; slot++) {
            this.appState.spellSlots.usedSlots[level][slot] = false;
          }
        }
      }
      console.log('Restored spell slot configuration');
    }

    // Apply loaded spell arrangement
    for (const spell of this.appState.spells) {
      const loadedSpell = usedSpells.find(s => s.name === spell.name);
      if (loadedSpell) {
        // Preserve the spell object but update its properties
        spell.x = loadedSpell.x;
        spell.y = loadedSpell.y;
        spell.token = loadedSpell.token || false;
        spell.whitelist = loadedSpell.whitelist || [];
        spell.gridRow = loadedSpell.gridRow || -1;
        spell.gridCol = loadedSpell.gridCol || -1;
      }
    }

    console.log(`Loaded ${usedSpells.length} spells from file`);
  }

  /**
   * Download data as JSON file
   *
   * @param {string} filename - Filename (without .json extension)
   * @param {Object} data - Data to serialize
   * @private
   */
  downloadJSON(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Upload and parse JSON file
   *
   * @param {Function} callback - Callback function to receive parsed data
   * @private
   */
  uploadJSON(callback) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            callback(data);
          } catch (error) {
            alert('Error reading file: Invalid JSON format');
            console.error('JSON parse error:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  /**
   * Export current arrangement as JSON string
   *
   * Useful for debugging or copying arrangements.
   *
   * @returns {string} JSON string of current arrangement
   */
  exportToString() {
    const usedSpells = this.appState.spells.filter(spell => spell.y < MENU_Y_THRESHOLD);
    const saveData = {
      spells: usedSpells,
      spellSlots: this.appState.spellSlots
    };
    return JSON.stringify(saveData, null, 2);
  }

  /**
   * Import arrangement from JSON string
   *
   * @param {string} jsonString - JSON string to import
   * @returns {boolean} True if import succeeded
   */
  importFromString(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      this.applyLoadedData(data);
      return true;
    } catch (error) {
      console.error('Error importing from string:', error);
      return false;
    }
  }
}
