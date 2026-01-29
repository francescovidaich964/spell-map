/**
 * @fileoverview Parses D&D 5e spell data from Wikidot HTML pages.
 * Handles inconsistent HTML structure to extract spell information.
 * @module api/HTMLParser
 */

/**
 * HTML parser for Wikidot spell pages
 *
 * Extracts spell information from dnd5e.wikidot.com HTML structure.
 * Handles various formatting inconsistencies in the wiki pages.
 *
 * @class
 * @example
 * const parser = new HTMLParser();
 * const spellData = parser.extractSpellFromWikidot(htmlElement, 'Fireball');
 */
export class HTMLParser {
  /**
   * Extract spell details from Wikidot HTML structure
   *
   * @param {HTMLElement} htmlElement - The DOM element containing spell HTML
   * @param {string} spellName - The spell name (for title formatting)
   * @returns {Object|null} Parsed spell data or null if parsing failed
   */
  extractSpellFromWikidot(htmlElement, spellName) {
    try {
      // Convert URL-style name back to proper title case
      const title = spellName
        .split(/[-\s]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      // Extract spell level and school from the subtitle
      let level = 'Unknown';
      let school = 'Unknown';

      const subtitleElements = htmlElement.querySelectorAll('p, div');
      for (let element of subtitleElements) {
        const text = element.textContent.trim();

        // Look for pattern like "1st-level abjuration" or "Cantrip evocation"
        const levelSchoolMatch = text.match(/(?:(\d+)(?:st|nd|rd|th)-level|cantrip)\s+(\w+)/i);
        if (levelSchoolMatch) {
          level = levelSchoolMatch[1] ? parseInt(levelSchoolMatch[1]) : 0;
          school = levelSchoolMatch[2];
          break;
        }
      }

      // Extract spell statistics (Casting Time, Range, Components, Duration)
      let casting_time = 'Unknown';
      let range = 'Unknown';
      let components = 'Unknown';
      let duration = 'Unknown';

      // Look for the characteristic bold labels
      const strongElements = htmlElement.querySelectorAll('strong');

      for (let strongEl of strongElements) {
        const label = strongEl.textContent.trim().toLowerCase();
        const nextSibling = strongEl.nextSibling;

        if (nextSibling && nextSibling.textContent) {
          const value = nextSibling.textContent.replace(/^:\s*/, '').trim();

          if (label.includes('casting time')) {
            casting_time = value;
          } else if (label.includes('range')) {
            range = value;
          } else if (label.includes('components')) {
            components = value;
          } else if (label.includes('duration')) {
            duration = value;
          }
        }
      }

      // Extract the main spell description
      let description = '';
      let foundDescription = false;

      // Find the main content area (usually after the stats)
      const allParagraphs = htmlElement.querySelectorAll('p');

      for (let i = 0; i < allParagraphs.length; i++) {
        const paragraph = allParagraphs[i];
        const text = paragraph.textContent.trim();

        // Skip empty paragraphs and stat lines
        if (
          !text ||
          text.includes('Casting Time:') ||
          text.includes('Range:') ||
          text.includes('Components:') ||
          text.includes('Duration:') ||
          text.includes('Source:') ||
          text.includes('Spell Lists:')
        ) {
          continue;
        }

        // Skip the level/school line
        if (text.match(/(?:\d+(?:st|nd|rd|th)-level|cantrip)\s+\w+/i)) {
          foundDescription = true; // Start collecting after this
          continue;
        }

        // Collect description paragraphs
        if (foundDescription && text.length > 20) {
          if (description) {
            description += '\n\n' + text;
          } else {
            description = text;
          }
        }
      }

      // If no description found, try a different approach
      if (!description) {
        const contentDiv = htmlElement.querySelector('#page-content, .content, .main-content');
        if (contentDiv) {
          // Get all text but filter out navigation and metadata
          const textNodes = [];
          const walker = document.createTreeWalker(
            contentDiv,
            NodeFilter.SHOW_TEXT,
            null,
            false
          );

          let node;
          while ((node = walker.nextNode())) {
            const text = node.textContent.trim();
            if (
              text.length > 20 &&
              !text.includes('Source:') &&
              !text.includes('Spell Lists:')
            ) {
              textNodes.push(text);
            }
          }

          description = textNodes.slice(1, -1).join('\n\n'); // Skip first/last (usually metadata)
        }
      }

      return {
        name: title,
        level: level,
        school: school,
        casting_time: casting_time,
        range: range,
        components: components,
        duration: duration,
        description: description || 'Description could not be parsed from the page.'
      };
    } catch (error) {
      console.error('Error extracting spell from Wikidot:', error);
      return null;
    }
  }

  /**
   * Format spell description text with HTML markup
   *
   * Converts markdown-like syntax to HTML and applies D&D-specific formatting.
   *
   * @param {string} text - Raw description text
   * @returns {string} HTML-formatted description
   */
  formatSpellDescription(text) {
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
}
