/**
 * @fileoverview Text utility functions for canvas text wrapping and HTML formatting.
 * Contains text manipulation and formatting logic for spell descriptions.
 * @module utils/textUtils
 */

/**
 * Wrap text to fit within a maximum width on a canvas
 *
 * Breaks text into multiple lines based on word boundaries to ensure
 * the text fits within the specified maximum width. Draws each line
 * to the canvas immediately.
 *
 * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context
 * @param {string} text - The text to wrap and draw
 * @param {number} x - X coordinate for text positioning
 * @param {number} y - Y coordinate for the first line
 * @param {number} maxWidth - Maximum width in pixels before wrapping
 * @param {number} lineHeight - Height between lines in pixels
 * @returns {void} Draws text directly to the canvas
 *
 * @example
 * const ctx = canvas.getContext('2d');
 * ctx.font = '12px Arial';
 * wrapText(ctx, 'This is a long spell name', 100, 50, 60, 14);
 */
export function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      // Line is too long, draw current line and start new one
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }

  // Draw the last line
  context.fillText(line, x, y);
}

/**
 * Format spell description text with HTML markup
 *
 * Converts markdown-style formatting and D&D-specific text patterns
 * into HTML tags for display in tooltips. Handles bold, italic,
 * ability scores, saving throws, bullet points, and line breaks.
 *
 * @param {string} text - The raw spell description text
 * @returns {string} HTML-formatted text ready for innerHTML
 *
 * @example
 * const raw = "**Fireball**\n\nA bright streak flashes...";
 * const formatted = formatSpellDescription(raw);
 * // Returns: "<strong>Fireball</strong><br><br>A bright streak..."
 */
export function formatSpellDescription(text) {
  if (!text) return 'No description available';

  let formatted = text;

  // Convert **bold** to <strong>
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convert *italic* to <em>
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Handle special D&D formatting
  // Convert "At Higher Levels." to bold
  formatted = formatted.replace(/At Higher Levels\./g, '<strong>At Higher Levels.</strong>');

  // Convert ability scores to bold
  formatted = formatted.replace(
    /\b(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\b/g,
    '<strong>$1</strong>'
  );

  // Convert saving throws to bold
  formatted = formatted.replace(
    /\b(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) saving throw/g,
    '<strong>$1 saving throw</strong>'
  );

  // Convert bullet points
  formatted = formatted.replace(/^• /gm, '• ');
  formatted = formatted.replace(/^\* /gm, '• ');
  formatted = formatted.replace(/^- /gm, '• ');

  // Convert line breaks to proper HTML breaks
  formatted = formatted.replace(/\n\n/g, '<br><br>');
  formatted = formatted.replace(/\n/g, '<br>');

  // Clean up extra spaces
  formatted = formatted.replace(/\s+/g, ' ').trim();

  return formatted;
}

/**
 * Truncate text to fit within a maximum width, adding ellipsis if needed
 *
 * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context
 * @param {string} text - The text to truncate
 * @param {number} maxWidth - Maximum width in pixels
 * @returns {string} The truncated text with '...' if it was too long
 *
 * @example
 * const ctx = canvas.getContext('2d');
 * const short = truncateText(ctx, 'Very Long Spell Name', 50);
 * // Might return: "Very Lon..."
 */
export function truncateText(context, text, maxWidth) {
  const metrics = context.measureText(text);

  if (metrics.width <= maxWidth) {
    return text;
  }

  // Binary search for the right length
  let left = 0;
  let right = text.length;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const testText = text.substring(0, mid) + '...';
    const testMetrics = context.measureText(testText);

    if (testMetrics.width <= maxWidth) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return text.substring(0, left - 1) + '...';
}

/**
 * Calculate the number of lines a text would occupy when wrapped
 *
 * Useful for calculating tooltip heights before rendering.
 *
 * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context
 * @param {string} text - The text to measure
 * @param {number} maxWidth - Maximum width in pixels before wrapping
 * @returns {number} Number of lines the text would occupy
 *
 * @example
 * const ctx = canvas.getContext('2d');
 * const lines = getLineCount(ctx, 'This is a long spell name', 60);
 * const height = lines * 14; // 14px line height
 */
export function getLineCount(context, text, maxWidth) {
  const words = text.split(' ');
  let line = '';
  let lineCount = 1;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      lineCount++;
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }

  return lineCount;
}
