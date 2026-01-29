/**
 * @fileoverview Geometric utility functions for spell positioning and grid snapping.
 * Contains hexagonal grid snapping logic and distance calculations.
 * @module utils/geometry
 */

import { GRID_DELTA_X, GRID_DELTA_Y, MENU_Y_THRESHOLD } from '../core/constants.js';

/**
 * Snap a spell's position to the hexagonal grid
 *
 * Hexagonal grid uses alternating row offsets:
 * - Even rows: spells snap to (0.5, 1.5, 2.5, ...) * GRID_DELTA_X
 * - Odd rows: spells snap to (1, 2, 3, ...) * GRID_DELTA_X
 *
 * This creates the characteristic hexagonal pattern where each spell
 * has six nearest neighbors.
 *
 * @param {Object} spell - The spell object with x, y, and held properties
 * @returns {void} Modifies the spell's x and y coordinates in place
 *
 * @example
 * const spell = { x: 65, y: 100, held: false };
 * snapToGrid(spell);
 * // spell.x and spell.y are now snapped to nearest grid point
 */
export function snapToGrid(spell) {
  // Don't snap if spell is in menu area (y >= 600) or being dragged
  if (spell.y >= MENU_Y_THRESHOLD || spell.held) {
    return;
  }

  // Calculate which row the spell is in
  const yInt = Math.round((spell.y - GRID_DELTA_Y / 4) / GRID_DELTA_Y);
  spell.y = (yInt + 0.5) * GRID_DELTA_Y;

  // Hexagonal grid requires Y-dependent X calculation
  // Even rows center on half-increments, odd rows on full increments
  if (yInt % 2 === 0) {
    // Even row: snap to (0.5, 1.5, 2.5, ...) * GRID_DELTA_X
    const xInt = Math.round((spell.x - GRID_DELTA_X / 2) / GRID_DELTA_X);
    spell.x = (xInt + 0.5) * GRID_DELTA_X;
  } else {
    // Odd row: snap to (1, 2, 3, ...) * GRID_DELTA_X
    const xInt = Math.round((spell.x - GRID_DELTA_X / 4) / GRID_DELTA_X);
    spell.x = xInt * GRID_DELTA_X;
  }
}

/**
 * Calculate Euclidean distance between two points
 *
 * @param {number} x1 - X coordinate of first point
 * @param {number} y1 - Y coordinate of first point
 * @param {number} x2 - X coordinate of second point
 * @param {number} y2 - Y coordinate of second point
 * @returns {number} The distance between the two points
 *
 * @example
 * const dist = distance(0, 0, 3, 4);
 * console.log(dist); // 5
 */
export function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if a point is inside a rectangle
 *
 * @param {number} x - X coordinate of the point
 * @param {number} y - Y coordinate of the point
 * @param {Object} rect - Rectangle with x, y, width, and height properties
 * @returns {boolean} True if the point is inside the rectangle
 *
 * @example
 * const rect = { x: 10, y: 10, width: 100, height: 50 };
 * const inside = pointInRect(50, 30, rect);
 * console.log(inside); // true
 */
export function pointInRect(x, y, rect) {
  return (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height
  );
}

/**
 * Get the bounding rectangle for a selection area
 *
 * Handles cases where the user drags the selection box in any direction
 * (including backwards/upwards).
 *
 * @param {number} originX - X coordinate where selection started
 * @param {number} originY - Y coordinate where selection started
 * @param {number} currentX - Current X coordinate of mouse
 * @param {number} currentY - Current Y coordinate of mouse
 * @returns {Object} Rectangle with x, y, width, and height properties
 *
 * @example
 * const bounds = getSelectionBounds(100, 100, 50, 150);
 * // Returns: { x: 50, y: 100, width: 50, height: 50 }
 */
export function getSelectionBounds(originX, originY, currentX, currentY) {
  const x = Math.min(originX, currentX);
  const y = Math.min(originY, currentY);
  const width = Math.abs(currentX - originX);
  const height = Math.abs(currentY - originY);

  return { x, y, width, height };
}

/**
 * Check if a spell's center point is within a selection rectangle
 *
 * @param {Object} spell - The spell object with x and y properties
 * @param {Object} selectionBounds - Rectangle bounds from getSelectionBounds
 * @returns {boolean} True if the spell is within the selection
 *
 * @example
 * const spell = { x: 75, y: 125 };
 * const bounds = { x: 50, y: 100, width: 50, height: 50 };
 * const selected = isSpellInSelection(spell, bounds);
 */
export function isSpellInSelection(spell, selectionBounds) {
  return pointInRect(spell.x, spell.y, selectionBounds);
}
