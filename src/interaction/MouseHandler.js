/**
 * @fileoverview Handles all mouse interactions with the canvas.
 * Manages dragging, clicking, hovering, and mode-specific actions.
 * @module interaction/MouseHandler
 */

import { MODES, MENU_Y_THRESHOLD } from '../core/constants.js';

/**
 * Mouse handler for canvas interactions
 *
 * Handles all mouse events:
 * - Move: Drag spells, update tooltips
 * - Down: Select spells, mode-specific actions, button clicks
 * - Up: Release spells, grid snapping, connection cleanup
 *
 * @class
 * @example
 * const mouseHandler = new MouseHandler(appState, connectionManager, slotManager, tooltipManager, modeManager, uiRenderer);
 * canvas.addEventListener('mousemove', (e) => mouseHandler.onMouseMove(e));
 */
export class MouseHandler {
  /**
   * Create a mouse handler
   *
   * @param {AppState} appState - Application state
   * @param {ConnectionManager} connectionManager - Connection manager instance
   * @param {SpellSlotManager} slotManager - Spell slot manager instance
   * @param {TooltipManager} tooltipManager - Tooltip manager instance
   * @param {ModeManager} modeManager - Mode manager instance
   * @param {UIRenderer} uiRenderer - UI renderer instance
   */
  constructor(appState, connectionManager, slotManager, tooltipManager, modeManager, uiRenderer) {
    this.appState = appState;
    this.connectionManager = connectionManager;
    this.slotManager = slotManager;
    this.tooltipManager = tooltipManager;
    this.modeManager = modeManager;
    this.uiRenderer = uiRenderer;
    this.canvas = null;
  }

  /**
   * Set the canvas element
   *
   * @param {HTMLCanvasElement} canvas - The canvas element
   */
  setCanvas(canvas) {
    this.canvas = canvas;
  }

  /**
   * Handle mouse move event
   *
   * @param {MouseEvent} e - Mouse event
   */
  onMouseMove(e) {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = Math.round(e.clientX - rect.left);
    const mouseY = Math.round(e.clientY - rect.top);

    this.appState.setMousePosition(mouseX, mouseY);

    // Handle dragging spells
    for (const spell of this.appState.spells) {
      if (spell.held) {
        if (spell.highlight) {
          // Move all highlighted spells together
          let highlightMoved = 0;
          for (let j = this.appState.spells.length - 1; j >= 0; j--) {
            if (this.appState.spells[j].highlight) {
              this.appState.spells[j].x = mouseX + this.appState.xShift[highlightMoved];
              this.appState.spells[j].y = mouseY + this.appState.yShift[highlightMoved];
              highlightMoved++;
              if (highlightMoved === this.appState.xShift.length) break;
            }
          }
        } else {
          // Move single spell
          spell.x = mouseX;
          spell.y = mouseY;
        }
        break;
      }

      // Update highlight selection box in highlight mode
      if (this.appState.mode === MODES.HIGHLIGHT && this.appState.originX !== null) {
        const x1 = Math.min(this.appState.originX, mouseX);
        const y1 = Math.min(this.appState.originY, mouseY);
        const x2 = Math.max(this.appState.originX, mouseX);
        const y2 = Math.max(this.appState.originY, mouseY);

        if (
          spell.x > x1 &&
          spell.x < x2 &&
          spell.y > y1 &&
          spell.y < y2 &&
          (spell.y < MENU_Y_THRESHOLD || spell.school === this.appState.menuSchool)
        ) {
          spell.highlight = true;
        } else {
          spell.highlight = false;
        }
      }
    }

    // Handle tooltip
    const hoveredSpell = this.tooltipManager.getHoveredSpell(mouseX, mouseY);
    if (hoveredSpell && !hoveredSpell.held) {
      this.tooltipManager.showTooltip(hoveredSpell, e.clientX, e.clientY);
    } else {
      this.tooltipManager.hideTooltip();
    }
  }

  /**
   * Handle mouse down event
   *
   * @param {MouseEvent} e - Mouse event
   */
  onMouseDown(e) {
    if (!this.canvas) return;

    const mouseX = this.appState.mouseX;
    const mouseY = this.appState.mouseY;

    // Check spell slots first (before spell node checking)
    if (this.slotManager.checkSlotClick(mouseX, mouseY)) {
      return; // Stop event propagation
    }

    // Check if clicking on a spell
    let onSpell = false;
    for (let i = this.appState.spells.length - 1; i >= 0; i--) {
      const spell = this.appState.spells[i];

      if (
        spell.containsPoint(mouseX, mouseY) &&
        (spell.y < MENU_Y_THRESHOLD || spell.school === this.appState.menuSchool)
      ) {
        onSpell = true;
        this.handleSpellClick(spell);
        break;
      }
    }

    // Handle non-spell clicks
    if (!onSpell) {
      this.handleEmptyAreaClick(mouseX, mouseY);
    }

    // Check school button clicks
    const clickedSchool = this.uiRenderer.getButtonAtPosition(mouseX, mouseY);
    if (clickedSchool) {
      this.appState.menuSchool = clickedSchool;
    }
  }

  /**
   * Handle clicking on a spell
   *
   * @param {Object} spell - The clicked spell
   * @private
   */
  handleSpellClick(spell) {
    const mode = this.appState.mode;

    if (mode === MODES.MOVE) {
      // Move mode: drag spell or highlighted group
      if (spell.highlight) {
        this.appState.originX = spell.x;
        this.appState.originY = spell.y;
        for (const s of this.appState.spells) {
          if (s.highlight) {
            this.appState.xShift.push(s.x - this.appState.originX);
            this.appState.yShift.push(s.y - this.appState.originY);
          }
        }
      } else {
        // Clear other highlights
        for (const s of this.appState.spells) {
          s.highlight = false;
        }
      }
      spell.held = true;
    } else if (mode === MODES.ADD && spell.y < MENU_Y_THRESHOLD) {
      // Add mode: create/remove connections
      this.handleAddModeClick(spell);
    } else if (mode === MODES.DELETE && spell.y < MENU_Y_THRESHOLD) {
      // Delete mode: clear all connections
      this.connectionManager.clearAllConnections(spell);
    } else if (mode === MODES.TOKEN && spell.y < MENU_Y_THRESHOLD) {
      // Token mode: toggle crystallization
      spell.token = !spell.token;
    }
  }

  /**
   * Handle add mode spell clicking
   *
   * @param {Object} spell - The clicked spell
   * @private
   */
  handleAddModeClick(spell) {
    if (this.appState.addSelect === '') {
      // First spell selected
      this.appState.addSelect = spell.name;
    } else if (spell.name === this.appState.addSelect) {
      // Clicked same spell - deselect
      this.appState.addSelect = '';
    } else {
      // Second spell - try to create connection
      const firstSpell = this.appState.findSpellByName(this.appState.addSelect);
      if (firstSpell) {
        if (this.connectionManager.areConnected(spell, firstSpell)) {
          // Already connected - remove connection
          this.connectionManager.removeConnection(spell, firstSpell);
          this.appState.addSelect = '';
        } else {
          // Try to add connection
          if (this.connectionManager.addConnection(firstSpell, spell)) {
            // Connection added successfully - keep second spell selected
            this.appState.addSelect = spell.name;
          } else {
            // Cannot link - clear selection
            this.appState.addSelect = '';
          }
        }
      }
    }
  }

  /**
   * Handle clicking on empty area
   *
   * @param {number} mouseX - Mouse X coordinate
   * @param {number} mouseY - Mouse Y coordinate
   * @private
   */
  handleEmptyAreaClick(mouseX, mouseY) {
    if (this.appState.mode === MODES.HIGHLIGHT) {
      // Start highlight selection box
      this.appState.originX = mouseX;
      this.appState.originY = mouseY;
      for (const spell of this.appState.spells) {
        spell.highlight = false;
      }
    } else {
      // Clear highlights in other modes
      for (const spell of this.appState.spells) {
        spell.highlight = false;
      }
      this.appState.addSelect = '';
    }
  }

  /**
   * Handle mouse up event
   *
   * @param {MouseEvent} e - Mouse event
   */
  onMouseUp(e) {
    const mouseX = this.appState.mouseX;
    const mouseY = this.appState.mouseY;

    // Release held spells
    for (const spell of this.appState.spells) {
      if (spell.held) {
        spell.held = false;

        // Handle spells dragged back to menu (y > 600)
        if (spell.highlight) {
          // Reset all highlighted spells if any are in menu area
          for (const s of this.appState.spells) {
            if (s.y > MENU_Y_THRESHOLD) {
              s.reset();
              // Remove from other spells' whitelists
              for (const other of this.appState.spells) {
                const index = other.whitelist.indexOf(s.name);
                if (index >= 0) {
                  other.whitelist.splice(index, 1);
                }
              }
            }
          }
        } else if (spell.y > MENU_Y_THRESHOLD) {
          // Reset single spell
          spell.reset();
          // Remove from other spells' whitelists
          for (const other of this.appState.spells) {
            const index = other.whitelist.indexOf(spell.name);
            if (index >= 0) {
              other.whitelist.splice(index, 1);
            }
          }
        }
        break;
      }
    }

    // Handle clear button click in move mode
    if (this.appState.mode === MODES.MOVE) {
      if (this.uiRenderer.isClearButtonClick(mouseX, mouseY)) {
        this.appState.clearAllTokens();
      }
    }

    // Clear highlight selection box
    this.appState.originX = null;
    this.appState.originY = null;
    this.appState.xShift = [];
    this.appState.yShift = [];
  }
}
