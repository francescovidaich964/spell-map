/**
 * @fileoverview Renders the hexagonal offset grid pattern for spell placement.
 * Handles the 15x8 grid point layout with even/odd row hexagonal spacing.
 * @module canvas/GridRenderer
 */

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GRID_DELTA_X,
  GRID_DELTA_Y,
  GRID_POINTS_X,
  GRID_POINTS_Y,
  COLORS
} from '../core/constants.js';

/**
 * Grid renderer for hexagonal spell placement grid
 *
 * Renders a hexagonal offset grid pattern where spells can be snapped.
 * The grid uses an even/odd row pattern for hexagonal spacing.
 *
 * @class
 * @example
 * const gridRenderer = new GridRenderer(ctx, appState);
 * gridRenderer.render();
 */
export class GridRenderer {
  /**
   * Create a grid renderer
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
   * @param {AppState} appState - Application state
   */
  constructor(ctx, appState) {
    this.ctx = ctx;
    this.appState = appState;
  }

  /**
   * Render the hexagonal grid
   *
   * Draws background fill and hexagonal grid points.
   * Even rows are centered on half-increments, odd rows on full increments.
   */
  render() {
    // Fill background
    this.ctx.fillStyle = COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid points
    this.ctx.fillStyle = COLORS.GRID_POINT;

    for (let i = 0; i < GRID_POINTS_Y; i++) {
      this.ctx.beginPath();
      const point_y = (i + 0.5) * GRID_DELTA_Y;

      if (i % 2 === 0) {
        // Even rows: centered on half-increments
        for (let j = 0; j < GRID_POINTS_X; j++) {
          const point_x = (j + 0.5) * GRID_DELTA_X;
          this.ctx.arc(point_x, point_y, 2, 0, 2 * Math.PI, false);
        }
      } else {
        // Odd rows: centered on full increments
        for (let j = 0; j < GRID_POINTS_X - 1; j++) {
          const point_x = (j + 1) * GRID_DELTA_X;
          this.ctx.arc(point_x, point_y, 2, 0, 2 * Math.PI, false);
        }
      }

      this.ctx.fill();
    }
  }
}
