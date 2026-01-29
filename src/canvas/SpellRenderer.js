/**
 * @fileoverview Renders spell nodes and connection lines on the canvas.
 * Handles spell circles, crystallization hexagons, connections, and text labels.
 * @module canvas/SpellRenderer
 */

import {
  SCHOOL_COLORS,
  SPELL_RADIUS,
  SPELL_HIGHLIGHT_OFFSET,
  SPELL_HIGHLIGHT_RADIUS,
  SPELL_HIGHLIGHT_SMALL_RADIUS,
  MENU_Y_THRESHOLD,
  COLORS
} from '../core/constants.js';
import { wrapText } from '../utils/textUtils.js';

/**
 * Spell renderer for drawing spell nodes and connections
 *
 * Renders spell circles with school colors, white highlight effects,
 * crystallization hexagons, connection lines, and text labels.
 *
 * @class
 * @example
 * const spellRenderer = new SpellRenderer(ctx, appState);
 * spellRenderer.renderConnections();
 * spellRenderer.renderSpells();
 */
export class SpellRenderer {
  /**
   * Create a spell renderer
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
   * @param {AppState} appState - Application state
   */
  constructor(ctx, appState) {
    this.ctx = ctx;
    this.appState = appState;
  }

  /**
   * Render all connection lines between linked spells
   *
   * Draws black lines between spells that are in each other's whitelist.
   * Also draws green preview line from selected spell in add mode.
   */
  renderConnections() {
    // Draw existing connections
    this.ctx.strokeStyle = COLORS.CONNECTION_LINE;
    this.ctx.lineWidth = 1;

    for (const spell of this.appState.spells) {
      if (spell.y < MENU_Y_THRESHOLD) {
        for (const targetName of spell.whitelist) {
          const targetSpell = this.appState.findSpellByName(targetName);
          if (targetSpell && targetSpell.y < MENU_Y_THRESHOLD) {
            this.ctx.beginPath();
            this.ctx.moveTo(spell.x, spell.y);
            this.ctx.lineTo(targetSpell.x, targetSpell.y);
            this.ctx.stroke();
          }
        }
      }
    }

    // Draw add mode preview line
    if (this.appState.addSelect) {
      const selectedSpell = this.appState.findSpellByName(this.appState.addSelect);
      if (selectedSpell) {
        this.ctx.strokeStyle = COLORS.ADD_MODE_LINE;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(selectedSpell.x, selectedSpell.y);
        this.ctx.lineTo(this.appState.mouseX, this.appState.mouseY);
        this.ctx.stroke();
        this.ctx.strokeStyle = COLORS.CONNECTION_LINE;
      }
    }
  }

  /**
   * Render all visible spell nodes
   *
   * Draws spell circles for spells that are:
   * - In the active area (y < 600)
   * - From the currently selected school
   * - Currently being held/dragged
   * - Currently highlighted
   */
  renderSpells() {
    for (const spell of this.appState.spells) {
      if (this.shouldRenderSpell(spell)) {
        this.drawSpellNode(spell);
      }
    }

    // Draw labels after all spell circles (so text is on top)
    for (const spell of this.appState.spells) {
      if (this.shouldRenderSpell(spell)) {
        this.drawSpellLabel(spell);
      }
    }
  }

  /**
   * Check if a spell should be rendered
   *
   * @param {Object} spell - The spell to check
   * @returns {boolean} True if spell should be rendered
   * @private
   */
  shouldRenderSpell(spell) {
    return (
      spell.y < MENU_Y_THRESHOLD ||
      spell.school === this.appState.menuSchool ||
      spell.held ||
      spell.highlight
    );
  }

  /**
   * Draw a single spell node (circle with highlight and optional hexagon)
   *
   * @param {Object} spell - The spell to draw
   * @private
   */
  drawSpellNode(spell) {
    // Main spell circle
    this.ctx.beginPath();
    this.ctx.arc(spell.x, spell.y, SPELL_RADIUS, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = SCHOOL_COLORS.get(spell.school);
    this.ctx.fill();

    // White highlight effect (simulated 3D sphere)
    this.ctx.beginPath();
    this.ctx.arc(
      spell.x + SPELL_HIGHLIGHT_OFFSET,
      spell.y - SPELL_HIGHLIGHT_OFFSET,
      SPELL_HIGHLIGHT_RADIUS,
      0,
      2 * Math.PI,
      false
    );
    this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
    this.ctx.fill();

    // Small white highlight
    this.ctx.beginPath();
    this.ctx.arc(
      spell.x + SPELL_RADIUS / 2,
      spell.y - SPELL_RADIUS / 2,
      SPELL_HIGHLIGHT_SMALL_RADIUS,
      0,
      2 * Math.PI,
      false
    );
    this.ctx.fillStyle = 'white';
    this.ctx.fill();

    // Draw hexagon for crystallized spells (from Weave Crystallization feature)
    // Crystallized spells can link to any node, bypassing normal Arcane Graph rules
    if (spell.token) {
      this.drawCrystallizationHexagon(spell);
    }
  }

  /**
   * Draw crystallization hexagon marker on spell
   *
   * @param {Object} spell - The spell with crystallization token
   * @private
   */
  drawCrystallizationHexagon(spell) {
    this.ctx.fillStyle = 'orange';
    this.ctx.beginPath();
    this.ctx.moveTo(spell.x, spell.y - 6);
    this.ctx.lineTo(spell.x + 5, spell.y - 3);
    this.ctx.lineTo(spell.x + 5, spell.y + 3);
    this.ctx.lineTo(spell.x, spell.y + 6);
    this.ctx.lineTo(spell.x - 5, spell.y + 3);
    this.ctx.lineTo(spell.x - 5, spell.y - 3);
    this.ctx.fill();
  }

  /**
   * Draw spell text label (name and level)
   *
   * @param {Object} spell - The spell to label
   * @private
   */
  drawSpellLabel(spell) {
    // Set text color based on highlight state
    if (spell.highlight) {
      this.ctx.fillStyle = COLORS.TEXT_HIGHLIGHTED;
    } else {
      this.ctx.fillStyle = COLORS.TEXT_DEFAULT;
    }

    // Draw spell name (wrapped)
    this.ctx.font = '10px Verdana';
    this.ctx.textAlign = 'center';
    wrapText(this.ctx, spell.name, spell.x, spell.y - 20, 50, 9);

    // Draw level
    this.ctx.fillText('Lvl: ' + spell.level, spell.x, spell.y + 20);
  }
}
