/**
 * @fileoverview Renders UI elements including buttons, counters, and spell slots.
 * Handles the school selector buttons, spell counters, and spell slot visualization.
 * @module canvas/UIRenderer
 */

import {
  SCHOOL_COLORS,
  SCHOOLS,
  SCHOOL_BUTTON_Y,
  SCHOOL_BUTTON_WIDTH,
  SCHOOL_BUTTON_HEIGHT,
  SPELL_SLOT_START_Y,
  SPELL_SLOT_RADIUS,
  SPELL_SLOT_SPACING_Y,
  SPELL_SLOT_SPACING_X,
  CLEAR_BUTTON_X,
  CLEAR_BUTTON_Y,
  CLEAR_BUTTON_SIZE,
  COLORS,
  MAX_SPELL_LEVELS
} from '../core/constants.js';

/**
 * UI renderer for buttons, counters, and spell slots
 *
 * Renders all UI elements including:
 * - School selector buttons at bottom
 * - Spell counters at top-left
 * - Spell slot tracker on left side
 * - Clear crystallization button at top-right
 *
 * @class
 * @example
 * const uiRenderer = new UIRenderer(ctx, appState);
 * uiRenderer.renderButtons();
 * uiRenderer.renderCounters();
 * uiRenderer.renderSpellSlots();
 */
export class UIRenderer {
  /**
   * Create a UI renderer
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
   * @param {AppState} appState - Application state
   */
  constructor(ctx, appState) {
    this.ctx = ctx;
    this.appState = appState;
  }

  /**
   * Render school selector buttons
   *
   * Draws 8 buttons for each D&D school of magic at the bottom of canvas.
   * Currently selected school is shown in bold italic.
   */
  renderButtons() {
    this.ctx.textAlign = 'center';

    for (let i = 0; i < SCHOOLS.length; i++) {
      const school = SCHOOLS[i];
      const x = i * SCHOOL_BUTTON_WIDTH;

      // Button background
      this.ctx.fillStyle = SCHOOL_COLORS.get(school);
      this.ctx.fillRect(x, SCHOOL_BUTTON_Y, SCHOOL_BUTTON_WIDTH, SCHOOL_BUTTON_HEIGHT);

      // Button text
      this.ctx.fillStyle = 'white';
      if (school === this.appState.menuSchool) {
        this.ctx.font = 'bold italic 15px Verdana';
      } else {
        this.ctx.font = 'bold 15px Verdana';
      }
      this.ctx.fillText(
        school,
        x + SCHOOL_BUTTON_WIDTH / 2,
        SCHOOL_BUTTON_Y + SCHOOL_BUTTON_HEIGHT * 3 / 4
      );
    }
  }

  /**
   * Render spell counters at top-left
   *
   * Displays counts for:
   * - Spells prepared (level 1-9)
   * - Cantrips known (level 0)
   * - Crystallized spells
   */
  renderCounters() {
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 12px Verdana';
    this.ctx.textAlign = 'left';

    this.ctx.fillText('Spells prepared: ' + this.appState.preparedCount, 5, 20);
    this.ctx.fillText('Cantrips known: ' + this.appState.cantripCount, 5, 45);
    this.ctx.fillText('Crystallized Spells: ' + this.appState.tokenCount, 5, 70);
  }

  /**
   * Render spell slot tracker on left side
   *
   * Displays circles for each configured spell slot level (1-9).
   * Filled circles (gold) = available slots
   * Empty circles (white outline) = used slots
   */
  renderSpellSlots() {
    this.ctx.font = 'bold 12px Verdana';
    this.ctx.textAlign = 'left';

    for (let level = 0; level < MAX_SPELL_LEVELS; level++) {
      const maxSlots = this.appState.spellSlots.maxSlots[level];
      if (maxSlots === 0) continue; // Skip levels with no slots configured

      const y = SPELL_SLOT_START_Y + level * SPELL_SLOT_SPACING_Y;

      // Draw level label
      this.ctx.fillStyle = 'white';
      this.ctx.fillText('Lvl ' + (level + 1) + ':', 5, y);

      // Draw each slot circle
      for (let slot = 0; slot < maxSlots; slot++) {
        const x = 55 + slot * SPELL_SLOT_SPACING_X;
        const isAvailable = this.appState.spellSlots.usedSlots[level]?.[slot];

        this.ctx.beginPath();
        this.ctx.arc(x, y - 4, SPELL_SLOT_RADIUS, 0, 2 * Math.PI, false);

        if (isAvailable) {
          // Available/unused slot: gold filled
          this.ctx.fillStyle = COLORS.SPELL_SLOT_FILLED;
          this.ctx.fill();
        } else {
          // Used/spent slot: white outline
          this.ctx.strokeStyle = COLORS.SPELL_SLOT_EMPTY;
          this.ctx.lineWidth = 2;
          this.ctx.stroke();
        }
      }
    }

    // Reset stroke style to black to avoid affecting other rendering
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 1;
  }

  /**
   * Render clear crystallization button at top-right
   *
   * Orange square with red X for clearing all crystallization tokens.
   */
  renderClearButton() {
    // Orange background
    this.ctx.fillStyle = COLORS.CLEAR_BUTTON_BG;
    this.ctx.fillRect(CLEAR_BUTTON_X, CLEAR_BUTTON_Y, CLEAR_BUTTON_SIZE, CLEAR_BUTTON_SIZE);

    // Red X
    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = COLORS.CLEAR_BUTTON_X;

    this.ctx.beginPath();
    this.ctx.moveTo(CLEAR_BUTTON_X + 5, CLEAR_BUTTON_Y + 5);
    this.ctx.lineTo(CLEAR_BUTTON_X + CLEAR_BUTTON_SIZE - 5, CLEAR_BUTTON_Y + CLEAR_BUTTON_SIZE - 5);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(CLEAR_BUTTON_X + 5, CLEAR_BUTTON_Y + CLEAR_BUTTON_SIZE - 5);
    this.ctx.lineTo(CLEAR_BUTTON_X + CLEAR_BUTTON_SIZE - 5, CLEAR_BUTTON_Y + 5);
    this.ctx.stroke();

    // Reset line width
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'black';
  }

  /**
   * Check if mouse is over a school button
   *
   * @param {number} x - Mouse X coordinate
   * @param {number} y - Mouse Y coordinate
   * @returns {string|null} School name if over button, null otherwise
   */
  getButtonAtPosition(x, y) {
    if (y < SCHOOL_BUTTON_Y || y > SCHOOL_BUTTON_Y + SCHOOL_BUTTON_HEIGHT) {
      return null;
    }

    const buttonIndex = Math.floor(x / SCHOOL_BUTTON_WIDTH);
    if (buttonIndex >= 0 && buttonIndex < SCHOOLS.length) {
      return SCHOOLS[buttonIndex];
    }

    return null;
  }

  /**
   * Check if mouse is over clear button
   *
   * @param {number} x - Mouse X coordinate
   * @param {number} y - Mouse Y coordinate
   * @returns {boolean} True if over clear button
   */
  isClearButtonClick(x, y) {
    return (
      x > CLEAR_BUTTON_X &&
      x < CLEAR_BUTTON_X + CLEAR_BUTTON_SIZE &&
      y > CLEAR_BUTTON_Y &&
      y < CLEAR_BUTTON_Y + CLEAR_BUTTON_SIZE
    );
  }
}
