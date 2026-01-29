/**
 * @fileoverview Manages spell tooltips with API integration and smart positioning.
 * Displays spell descriptions on hover with responsive positioning to avoid screen edges.
 * @module features/TooltipManager
 */

import { HTMLParser } from '../api/HTMLParser.js';

/**
 * Tooltip manager for spell hover descriptions
 *
 * Displays spell information in a tooltip when hovering over spell nodes.
 * Features:
 * - Smart positioning to avoid screen edges
 * - Integration with SpellAPIClient for 3-tier API fallback
 * - Loading state while fetching data
 * - Formatted spell descriptions
 *
 * @class
 * @example
 * const tooltipManager = new TooltipManager(appState, spellAPIClient);
 * tooltipManager.showTooltip(spell, mouseX, mouseY);
 * tooltipManager.hideTooltip();
 */
export class TooltipManager {
  /**
   * Create a tooltip manager
   *
   * @param {AppState} appState - Application state
   * @param {SpellAPIClient} apiClient - API client for fetching spell data
   */
  constructor(appState, apiClient) {
    this.appState = appState;
    this.apiClient = apiClient;
    this.htmlParser = new HTMLParser();
    this.currentTooltipSpell = null;
  }

  /**
   * Show tooltip for a spell
   *
   * Displays a tooltip with spell description at the given screen coordinates.
   * Positions intelligently to avoid going off screen edges.
   *
   * @param {Object} spell - The spell to show tooltip for
   * @param {number} clientX - Mouse X in client coordinates
   * @param {number} clientY - Mouse Y in client coordinates
   */
  async showTooltip(spell, clientX, clientY) {
    if (!spell) return;

    // Remove existing tooltip
    this.hideTooltip();

    // Track current spell
    this.currentTooltipSpell = spell.name;

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.id = 'spellTooltip';

    // Initial positioning (will be adjusted)
    tooltip.style.cssText = `
      position: fixed;
      left: ${clientX + 10}px;
      top: ${clientY - 10}px;
      background: #222;
      color: white;
      border: 2px solid #666;
      border-radius: 5px;
      padding: 10px;
      max-width: 300px;
      z-index: 1000;
      font-size: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.5);
      visibility: hidden;
    `;

    // Add to DOM temporarily to measure size
    tooltip.innerHTML = 'Loading spell description...';
    document.body.appendChild(tooltip);

    // Get tooltip dimensions and viewport size
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate optimal position
    let finalX = clientX + 10;
    let finalY = clientY - 10;

    // Adjust horizontal position if tooltip goes off right edge
    if (finalX + tooltipRect.width > viewportWidth) {
      finalX = clientX - tooltipRect.width - 10; // Show on left side of cursor
    }

    // Adjust horizontal position if tooltip goes off left edge
    if (finalX < 0) {
      finalX = 5; // Small margin from left edge
    }

    // Adjust vertical position if tooltip goes off bottom edge
    if (finalY + tooltipRect.height > viewportHeight) {
      finalY = clientY - tooltipRect.height - 10; // Show above cursor
    }

    // Adjust vertical position if tooltip goes off top edge
    if (finalY < 0) {
      finalY = 5; // Small margin from top
    }

    // Apply final position and make visible
    tooltip.style.left = `${finalX}px`;
    tooltip.style.top = `${finalY}px`;
    tooltip.style.visibility = 'visible';

    // Fetch and display spell description
    try {
      const desc = await this.apiClient.fetchSpellDescription(spell.name);

      // Check if tooltip is still for the same spell (user might have moved mouse)
      const currentTooltip = document.getElementById('spellTooltip');
      if (!currentTooltip || this.currentTooltipSpell !== spell.name) {
        return; // Tooltip was removed or changed, don't update
      }

      let content;
      if (desc.found) {
        content = `
          <strong>${desc.name}</strong><br>
          <em>Level ${desc.level} ${desc.school}</em><br>
          <strong>Range:</strong> ${desc.range}<br>
          <strong>Duration:</strong> ${desc.duration}<br>
          <strong>Components:</strong> ${desc.components}<br>
          <strong>Casting Time:</strong> ${desc.casting_time}<br>
          <hr style="border: 1px solid #444; margin: 5px 0;">
          ${this.htmlParser.formatSpellDescription(desc.description)}<br>
          <small style="color: #888;">Source: ${desc.source}</small>
        `;
      } else {
        content = `
          <strong>${desc.name}</strong><br>
          <hr style="border: 1px solid #444; margin: 5px 0;">
          ${this.htmlParser.formatSpellDescription(desc.description)}<br>
          <small style="color: #888;">Source: ${desc.source}</small>
        `;
      }

      currentTooltip.innerHTML = content;

      // Recalculate position after content change (content might be longer)
      const newRect = currentTooltip.getBoundingClientRect();
      let adjustedX = finalX;
      let adjustedY = finalY;

      // Re-check boundaries with new content size
      if (adjustedX + newRect.width > viewportWidth) {
        adjustedX = clientX - newRect.width - 10;
      }
      if (adjustedX < 0) {
        adjustedX = 5;
      }
      if (adjustedY + newRect.height > viewportHeight) {
        adjustedY = clientY - newRect.height - 10;
      }
      if (adjustedY < 0) {
        adjustedY = 5;
      }

      currentTooltip.style.left = `${adjustedX}px`;
      currentTooltip.style.top = `${adjustedY}px`;
    } catch (error) {
      console.error('Error displaying tooltip:', error);
      const currentTooltip = document.getElementById('spellTooltip');
      if (currentTooltip) {
        currentTooltip.innerHTML = `
          <strong>${spell.name}</strong><br>
          <hr style="border: 1px solid #444; margin: 5px 0;">
          Error loading spell description.
        `;
      }
    }
  }

  /**
   * Hide the current tooltip
   *
   * Removes the tooltip element from the DOM.
   */
  hideTooltip() {
    const existingTooltip = document.getElementById('spellTooltip');
    if (existingTooltip) {
      existingTooltip.remove();
    }
    this.currentTooltipSpell = null;
  }

  /**
   * Check if a spell is currently hovered
   *
   * Determines if the mouse is over a spell node.
   *
   * @param {number} mouseX - Mouse X coordinate (canvas coordinates)
   * @param {number} mouseY - Mouse Y coordinate (canvas coordinates)
   * @returns {Object|null} Hovered spell or null
   */
  getHoveredSpell(mouseX, mouseY) {
    for (const spell of this.appState.spells) {
      // Calculate distance from mouse to spell center
      const distance = Math.sqrt(
        Math.pow(mouseX - spell.x, 2) + Math.pow(mouseY - spell.y, 2)
      );

      // Check if within spell radius
      if (distance < spell.r) {
        // Check if spell is visible
        if (
          spell.y < 600 ||
          spell.school === this.appState.menuSchool ||
          spell.held ||
          spell.highlight
        ) {
          return spell;
        }
      }
    }
    return null;
  }
}
