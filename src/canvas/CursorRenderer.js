/**
 * @fileoverview Renders mode-specific cursor indicators on the canvas.
 * Eliminates code duplication by centralizing all cursor drawing logic.
 * @module canvas/CursorRenderer
 */

import { MODES, COLORS } from '../core/constants.js';

/**
 * Cursor renderer for mode-specific mouse cursors
 *
 * Draws custom cursors for each interaction mode:
 * - Move: Four black arrows pointing outward
 * - Add: Green plus sign
 * - Delete: Red X
 * - Token (Crystallized): Orange double hexagon
 * - Highlight: Blue arrows with selection box
 *
 * @class
 * @example
 * const cursorRenderer = new CursorRenderer(ctx, appState);
 * cursorRenderer.render();
 */
export class CursorRenderer {
  /**
   * Create a cursor renderer
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
   * @param {AppState} appState - Application state
   */
  constructor(ctx, appState) {
    this.ctx = ctx;
    this.appState = appState;
  }

  /**
   * Render the cursor for the current mode
   *
   * Dispatches to the appropriate cursor drawing method based on mode.
   */
  render() {
    const mouseX = this.appState.mouseX;
    const mouseY = this.appState.mouseY;

    switch (this.appState.mode) {
      case MODES.MOVE:
        this.drawMoveCursor(mouseX, mouseY);
        break;
      case MODES.ADD:
        this.drawAddCursor(mouseX, mouseY);
        break;
      case MODES.DELETE:
        this.drawDeleteCursor(mouseX, mouseY);
        break;
      case MODES.TOKEN:
        this.drawTokenCursor(mouseX, mouseY);
        break;
      case MODES.HIGHLIGHT:
        this.drawHighlightCursor(mouseX, mouseY);
        this.drawSelectionBox();
        break;
    }
  }

  /**
   * Draw move mode cursor (four arrows)
   *
   * @param {number} x - Mouse X coordinate
   * @param {number} y - Mouse Y coordinate
   * @private
   */
  drawMoveCursor(x, y) {
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 2;

    // X cross
    this.ctx.beginPath();
    this.ctx.moveTo(x - 6, y - 6);
    this.ctx.lineTo(x + 6, y + 6);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(x + 6, y - 6);
    this.ctx.lineTo(x - 6, y + 6);
    this.ctx.stroke();

    // Arrow tips (top-left)
    this.ctx.beginPath();
    this.ctx.moveTo(x - 1, y - 6);
    this.ctx.lineTo(x - 6, y - 6);
    this.ctx.lineTo(x - 6, y - 1);
    this.ctx.stroke();

    // Arrow tips (top-right)
    this.ctx.beginPath();
    this.ctx.moveTo(x + 1, y - 6);
    this.ctx.lineTo(x + 6, y - 6);
    this.ctx.lineTo(x + 6, y - 1);
    this.ctx.stroke();

    // Arrow tips (bottom-left)
    this.ctx.beginPath();
    this.ctx.moveTo(x - 1, y + 6);
    this.ctx.lineTo(x - 6, y + 6);
    this.ctx.lineTo(x - 6, y + 1);
    this.ctx.stroke();

    // Arrow tips (bottom-right)
    this.ctx.beginPath();
    this.ctx.moveTo(x + 1, y + 6);
    this.ctx.lineTo(x + 6, y + 6);
    this.ctx.lineTo(x + 6, y + 1);
    this.ctx.stroke();

    this.ctx.lineWidth = 1;
  }

  /**
   * Draw add mode cursor (green plus)
   *
   * @param {number} x - Mouse X coordinate
   * @param {number} y - Mouse Y coordinate
   * @private
   */
  drawAddCursor(x, y) {
    this.ctx.strokeStyle = COLORS.ADD_MODE_CURSOR;
    this.ctx.lineWidth = 3;

    // Vertical line
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - 7);
    this.ctx.lineTo(x, y + 7);
    this.ctx.stroke();

    // Horizontal line
    this.ctx.beginPath();
    this.ctx.moveTo(x + 7, y);
    this.ctx.lineTo(x - 7, y);
    this.ctx.stroke();

    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'black';
  }

  /**
   * Draw delete mode cursor (red X)
   *
   * @param {number} x - Mouse X coordinate
   * @param {number} y - Mouse Y coordinate
   * @private
   */
  drawDeleteCursor(x, y) {
    this.ctx.strokeStyle = COLORS.DELETE_MODE_CURSOR;
    this.ctx.lineWidth = 3;

    // Diagonal line 1
    this.ctx.beginPath();
    this.ctx.moveTo(x - 7, y - 7);
    this.ctx.lineTo(x + 7, y + 7);
    this.ctx.stroke();

    // Diagonal line 2
    this.ctx.beginPath();
    this.ctx.moveTo(x + 7, y - 7);
    this.ctx.lineTo(x - 7, y + 7);
    this.ctx.stroke();

    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'black';
  }

  /**
   * Draw token/crystallization mode cursor (orange double hexagon)
   *
   * @param {number} x - Mouse X coordinate
   * @param {number} y - Mouse Y coordinate
   * @private
   */
  drawTokenCursor(x, y) {
    this.ctx.fillStyle = COLORS.TOKEN_MODE_CURSOR;

    // Right hexagon
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - 5);
    this.ctx.lineTo(x, y - 7);
    this.ctx.lineTo(x + 6, y - 4);
    this.ctx.lineTo(x + 6, y + 4);
    this.ctx.lineTo(x, y + 7);
    this.ctx.lineTo(x, y + 5);
    this.ctx.lineTo(x + 4, y + 3);
    this.ctx.lineTo(x + 4, y - 3);
    this.ctx.fill();

    // Left hexagon
    this.ctx.moveTo(x, y - 5);
    this.ctx.lineTo(x, y - 7);
    this.ctx.lineTo(x - 6, y - 4);
    this.ctx.lineTo(x - 6, y + 4);
    this.ctx.lineTo(x, y + 7);
    this.ctx.lineTo(x, y + 5);
    this.ctx.lineTo(x - 4, y + 3);
    this.ctx.lineTo(x - 4, y - 3);
    this.ctx.fill();
  }

  /**
   * Draw highlight mode cursor (blue arrows, same as move)
   *
   * @param {number} x - Mouse X coordinate
   * @param {number} y - Mouse Y coordinate
   * @private
   */
  drawHighlightCursor(x, y) {
    this.ctx.strokeStyle = COLORS.HIGHLIGHT_MODE_CURSOR;
    this.ctx.lineWidth = 2;

    // X cross
    this.ctx.beginPath();
    this.ctx.moveTo(x - 6, y - 6);
    this.ctx.lineTo(x + 6, y + 6);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(x + 6, y - 6);
    this.ctx.lineTo(x - 6, y + 6);
    this.ctx.stroke();

    // Arrow tips (top-left)
    this.ctx.beginPath();
    this.ctx.moveTo(x - 1, y - 6);
    this.ctx.lineTo(x - 6, y - 6);
    this.ctx.lineTo(x - 6, y - 1);
    this.ctx.stroke();

    // Arrow tips (top-right)
    this.ctx.beginPath();
    this.ctx.moveTo(x + 1, y - 6);
    this.ctx.lineTo(x + 6, y - 6);
    this.ctx.lineTo(x + 6, y - 1);
    this.ctx.stroke();

    // Arrow tips (bottom-left)
    this.ctx.beginPath();
    this.ctx.moveTo(x - 1, y + 6);
    this.ctx.lineTo(x - 6, y + 6);
    this.ctx.lineTo(x - 6, y + 1);
    this.ctx.stroke();

    // Arrow tips (bottom-right)
    this.ctx.beginPath();
    this.ctx.moveTo(x + 1, y + 6);
    this.ctx.lineTo(x + 6, y + 6);
    this.ctx.lineTo(x + 6, y + 1);
    this.ctx.stroke();

    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'black';
  }

  /**
   * Draw selection box in highlight mode
   *
   * Shows blue rectangle from originX/Y to current mouse position.
   * @private
   */
  drawSelectionBox() {
    if (this.appState.originX === null || this.appState.originY === null) {
      return;
    }

    const originX = this.appState.originX;
    const originY = this.appState.originY;
    const mouseX = this.appState.mouseX;
    const mouseY = this.appState.mouseY;

    this.ctx.strokeStyle = COLORS.HIGHLIGHT_SELECTION;
    this.ctx.lineWidth = 1;

    // Fill rectangle
    this.ctx.fillStyle = 'rgba(0,0,255,0.25)';
    this.ctx.fillRect(originX, originY, mouseX - originX, mouseY - originY);

    // Draw border lines
    this.ctx.beginPath();
    this.ctx.moveTo(originX, originY);
    this.ctx.lineTo(originX, mouseY);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(originX, originY);
    this.ctx.lineTo(mouseX, originY);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(mouseX, originY);
    this.ctx.lineTo(mouseX, mouseY);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(originX, mouseY);
    this.ctx.lineTo(mouseX, mouseY);
    this.ctx.stroke();

    this.ctx.strokeStyle = 'black';
  }
}
