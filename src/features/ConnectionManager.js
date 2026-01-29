/**
 * @fileoverview Manages spell graph connections and validates D&D linking rules.
 * Enforces School of Geometry constraints for the Arcane Graph system.
 * @module features/ConnectionManager
 */

/**
 * Connection manager for spell linking
 *
 * Enforces the School of Geometry Arcane Graph rules:
 * - Spells of the same level can be linked regardless of school
 * - Spells of consecutive levels can only be linked if they share the same school
 * - Crystallized spells (from Weave Crystallization feature) can link to any spell
 *
 * All connections are bidirectional - if A links to B, B also links to A.
 *
 * @class
 * @example
 * const manager = new ConnectionManager(appState);
 * if (manager.canLink(spell1, spell2)) {
 *   manager.addConnection(spell1, spell2);
 * }
 */
export class ConnectionManager {
  /**
   * Create a connection manager
   *
   * @param {AppState} appState - Application state
   */
  constructor(appState) {
    this.appState = appState;
  }

  /**
   * Check if two spells can be connected based on Arcane Graph rules
   *
   * Rules:
   * 1. If either spell is crystallized (token=true): allow
   * 2. If same level: allow (any school)
   * 3. If consecutive levels AND same school: allow
   * 4. Otherwise: deny
   *
   * @param {Object} spell1 - First spell to check
   * @param {Object} spell2 - Second spell to check
   * @returns {boolean} True if spells can be linked
   */
  canLink(spell1, spell2) {
    if (!spell1 || !spell2) {
      return false;
    }

    // Rule 1: If either spell is crystallized (from Weave Crystallization), bypass all constraints
    if (spell1.token || spell2.token) {
      return true;
    }

    // Rule 2: Same level spells can always be linked (any school)
    if (spell1.level === spell2.level) {
      return true;
    }

    // Rule 3: Consecutive level spells can be linked only if same school
    if (spell1.school === spell2.school && Math.abs(spell1.level - spell2.level) === 1) {
      return true;
    }

    // Rule 4: Otherwise, cannot link
    return false;
  }

  /**
   * Add a bidirectional connection between two spells
   *
   * Updates both spells' whitelists to include each other.
   *
   * @param {Object} spell1 - First spell
   * @param {Object} spell2 - Second spell
   * @returns {boolean} True if connection was added, false if already exists or invalid
   */
  addConnection(spell1, spell2) {
    if (!spell1 || !spell2) {
      return false;
    }

    // Check if connection already exists
    if (spell1.whitelist.indexOf(spell2.name) >= 0) {
      return false;
    }

    // Check if linking is allowed
    if (!this.canLink(spell1, spell2)) {
      return false;
    }

    // Add bidirectional connection
    spell1.whitelist.push(spell2.name);
    spell2.whitelist.push(spell1.name);

    return true;
  }

  /**
   * Remove a bidirectional connection between two spells
   *
   * Removes each spell from the other's whitelist.
   *
   * @param {Object} spell1 - First spell
   * @param {Object} spell2 - Second spell
   * @returns {boolean} True if connection was removed, false if didn't exist
   */
  removeConnection(spell1, spell2) {
    if (!spell1 || !spell2) {
      return false;
    }

    let removed = false;

    // Remove spell2 from spell1's whitelist
    const index1 = spell1.whitelist.indexOf(spell2.name);
    if (index1 >= 0) {
      spell1.whitelist.splice(index1, 1);
      removed = true;
    }

    // Remove spell1 from spell2's whitelist
    const index2 = spell2.whitelist.indexOf(spell1.name);
    if (index2 >= 0) {
      spell2.whitelist.splice(index2, 1);
      removed = true;
    }

    return removed;
  }

  /**
   * Clear all connections for a spell
   *
   * Removes the spell from all other spells' whitelists and clears its own whitelist.
   *
   * @param {Object} spell - The spell to disconnect from everything
   */
  clearAllConnections(spell) {
    if (!spell) {
      return;
    }

    // Remove this spell from all other spells' whitelists
    for (const otherSpell of this.appState.spells) {
      const index = otherSpell.whitelist.indexOf(spell.name);
      if (index >= 0) {
        otherSpell.whitelist.splice(index, 1);
      }
    }

    // Clear this spell's whitelist
    spell.whitelist = [];
  }

  /**
   * Get all spells connected to a given spell
   *
   * @param {Object} spell - The spell to get connections for
   * @returns {Object[]} Array of connected spell objects
   */
  getConnectedSpells(spell) {
    if (!spell) {
      return [];
    }

    return spell.whitelist
      .map(name => this.appState.findSpellByName(name))
      .filter(s => s !== null);
  }

  /**
   * Check if two spells are currently connected
   *
   * @param {Object} spell1 - First spell
   * @param {Object} spell2 - Second spell
   * @returns {boolean} True if spells are connected
   */
  areConnected(spell1, spell2) {
    if (!spell1 || !spell2) {
      return false;
    }

    return spell1.whitelist.indexOf(spell2.name) >= 0;
  }
}
