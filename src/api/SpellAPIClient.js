/**
 * @fileoverview API client for fetching spell descriptions with 3-tier fallback.
 * Tries Open5e, D&D 5e API, then Wikidot scraping with caching.
 * @module api/SpellAPIClient
 */

import { API_ENDPOINTS } from '../core/constants.js';
import { HTMLParser } from './HTMLParser.js';

/**
 * Spell API client with multi-tier fallback
 *
 * Implements a 3-tier API fallback strategy:
 * 1. Try Open5e API first (most complete data)
 * 2. Fallback to D&D 5e API (SRD only, but reliable)
 * 3. Last resort: Wikidot scraping (comprehensive but slow)
 *
 * All successful responses are cached to avoid redundant requests.
 *
 * @class
 * @example
 * const client = new SpellAPIClient();
 * const spellData = await client.fetchSpellDescription('Fireball');
 */
export class SpellAPIClient {
  /**
   * Create a spell API client
   */
  constructor() {
    this.cache = {};
    this.htmlParser = new HTMLParser();
  }

  /**
   * Fetch spell description with 3-tier fallback
   *
   * @param {string} spellName - Name of the spell to fetch
   * @returns {Promise<Object>} Spell data object with description and metadata
   */
  async fetchSpellDescription(spellName) {
    // Check cache first
    if (this.cache[spellName]) {
      return this.cache[spellName];
    }

    try {
      // Tier 1: Try Open5e API
      let result = await this.tryOpen5e(spellName);
      if (result) {
        this.cache[spellName] = result;
        return result;
      }

      // Tier 2: Try D&D 5e API
      result = await this.tryDnd5eAPI(spellName);
      if (result) {
        this.cache[spellName] = result;
        return result;
      }

      // Tier 3: Try Wikidot scraping
      result = await this.tryWikidot(spellName);
      if (result) {
        this.cache[spellName] = result;
        return result;
      }

      // All attempts failed
      const notFoundData = {
        name: spellName,
        description: 'FAILED - Spell description not found.',
        source: 'Not found',
        found: false
      };
      // Don't cache unsuccessful results
      return notFoundData;
    } catch (error) {
      console.error('Error fetching spell description:', error);
      const errorData = {
        name: spellName,
        description: 'Error loading spell description.',
        source: 'Error',
        found: false
      };
      // Don't cache error results
      return errorData;
    }
  }

  /**
   * Try fetching from Open5e API
   *
   * @param {string} spellName - Spell name
   * @returns {Promise<Object|null>} Spell data or null if failed
   * @private
   */
  async tryOpen5e(spellName) {
    try {
      const cleanName = this.cleanSpellName(spellName);
      const response = await fetch(`${API_ENDPOINTS.OPEN5E}${cleanName}/`);

      if (response.ok) {
        const data = await response.json();
        return {
          name: data.name,
          description: data.desc,
          level: data.level,
          school: data.school,
          range: data.range,
          duration: data.duration,
          components: data.components,
          casting_time: data.casting_time,
          source: 'Open5e',
          found: true
        };
      }
    } catch (error) {
      console.log(`Open5e failed for ${spellName}:`, error.message);
    }
    return null;
  }

  /**
   * Try fetching from D&D 5e API
   *
   * @param {string} spellName - Spell name
   * @returns {Promise<Object|null>} Spell data or null if failed
   * @private
   */
  async tryDnd5eAPI(spellName) {
    try {
      const cleanName = this.cleanSpellName(spellName);
      const response = await fetch(`${API_ENDPOINTS.DND5E}${cleanName}`);

      if (response.ok) {
        const data = await response.json();
        return {
          name: data.name,
          description: data.desc ? data.desc.join(' ') : 'No description available',
          level: data.level,
          school: data.school?.name || 'Unknown',
          range: data.range,
          duration: data.duration,
          components: data.components?.join(', ') || 'Unknown',
          casting_time: data.casting_time,
          source: 'D&D 5e API',
          found: true
        };
      }
    } catch (error) {
      console.log(`D&D 5e API failed for ${spellName}:`, error.message);
    }
    return null;
  }

  /**
   * Try fetching from Wikidot with CORS proxy
   *
   * @param {string} spellName - Spell name
   * @returns {Promise<Object|null>} Spell data or null if failed
   * @private
   */
  async tryWikidot(spellName) {
    try {
      const cleanName = this.cleanSpellName(spellName);
      const url = `${API_ENDPOINTS.WIKIDOT_BASE}${cleanName}`;
      const proxyUrl = `${API_ENDPOINTS.CORS_PROXY}${encodeURIComponent(url)}`;

      console.log(`Trying Wikidot for spell: ${spellName}`);
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const htmlContent = data.contents;

      // Create a temporary DOM element to parse HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;

      // Extract spell information
      const spellInfo = this.htmlParser.extractSpellFromWikidot(tempDiv, spellName);

      if (spellInfo) {
        return {
          name: spellInfo.name,
          description: spellInfo.description,
          level: spellInfo.level,
          school: spellInfo.school,
          range: spellInfo.range,
          duration: spellInfo.duration,
          components: spellInfo.components,
          casting_time: spellInfo.casting_time,
          source: 'Wikidot',
          found: true
        };
      }
    } catch (error) {
      console.log(`Wikidot failed for ${spellName}:`, error.message);
    }
    return null;
  }

  /**
   * Clean spell name for API queries
   *
   * Removes UA suffix, apostrophes, and converts to lowercase with hyphens.
   *
   * @param {string} spellName - Raw spell name
   * @returns {string} Cleaned spell name for API
   * @private
   */
  cleanSpellName(spellName) {
    return spellName
      .toLowerCase()
      .replace(/\s*\(ua\)/, '')
      .replace(/'/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  /**
   * Clear the spell description cache
   *
   * Useful for forcing fresh API requests.
   */
  clearCache() {
    this.cache = {};
  }

  /**
   * Get cache statistics
   *
   * @returns {Object} Object with cached spell count
   */
  getCacheStats() {
    return {
      cachedSpells: Object.keys(this.cache).length,
      spellNames: Object.keys(this.cache)
    };
  }
}
