/**
 * @fileoverview Configuration constants for the Spell Map application.
 * Contains all magic numbers, canvas dimensions, color mappings, and keyboard codes.
 * @module core/constants
 */

// Canvas dimensions
export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 980;

// Grid configuration
export const GRID_MULTIPLIER = 1.2;
export const GRID_DELTA_X = 80 / GRID_MULTIPLIER;  // 66.67
export const GRID_DELTA_Y = 70 / GRID_MULTIPLIER;  // 58.33
export const GRID_POINTS_X = 15 * GRID_MULTIPLIER;  // 18
export const GRID_POINTS_Y = 8 * GRID_MULTIPLIER;   // 9.6

// Spell node configuration
export const SPELL_RADIUS = 10;
export const SPELL_HIGHLIGHT_OFFSET = SPELL_RADIUS / 3;
export const SPELL_HIGHLIGHT_RADIUS = SPELL_RADIUS / 3;
export const SPELL_HIGHLIGHT_SMALL_RADIUS = SPELL_RADIUS / 7;

// UI positioning constants
export const SCHOOL_BUTTON_Y = 575;
export const SCHOOL_BUTTON_HEIGHT = 25;
export const SCHOOL_BUTTON_WIDTH = 150;
export const MENU_Y_THRESHOLD = 600;  // Spells below this Y are in menu area

// Spell slot UI positioning
export const SPELL_SLOT_START_X = 25;
export const SPELL_SLOT_START_Y = 95;
export const SPELL_SLOT_RADIUS = 8;
export const SPELL_SLOT_SPACING_Y = 25;  // Vertical spacing between levels
export const SPELL_SLOT_SPACING_X = 18;  // Horizontal spacing between slot circles
export const SPELL_SLOT_LABEL_OFFSET_X = -10;

// Clear button (for crystallization tokens)
export const CLEAR_BUTTON_X = 1145;
export const CLEAR_BUTTON_Y = 5;
export const CLEAR_BUTTON_SIZE = 50;

// Counter positioning
export const COUNTER_START_Y = 10;
export const COUNTER_LINE_HEIGHT = 20;

// Arrow key movement increment
export const ARROW_KEY_MOVEMENT = 5;

// Interaction modes
export const MODES = {
  MOVE: 'move',
  ADD: 'add',
  DELETE: 'delete',
  TOKEN: 'token',
  HIGHLIGHT: 'highlight'
};

// Keyboard codes
export const KEY_CODES = {
  Z: 90,
  X: 88,
  C: 67,
  V: 86,
  L: 76,
  S: 83,
  O: 79,
  ARROW_LEFT: 37,
  ARROW_UP: 38,
  ARROW_RIGHT: 39,
  ARROW_DOWN: 40,
  ENTER: 13
};

// School of Magic color mappings
export const SCHOOL_COLORS = new Map([
  ['Abjuration', 'deepskyblue'],
  ['Conjuration', 'gold'],
  ['Divination', 'darkgrey'],
  ['Enchantment', 'hotpink'],
  ['Evocation', 'crimson'],
  ['Illusion', 'purple'],
  ['Necromancy', 'green'],
  ['Transmutation', 'tan']
]);

// List of all school names
export const SCHOOLS = [
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation'
];

// API endpoints
export const API_ENDPOINTS = {
  OPEN5E: 'https://api.open5e.com/spells/',
  DND5E: 'https://www.dnd5eapi.co/api/spells/',
  WIKIDOT_BASE: 'http://dnd5e.wikidot.com/spell:',
  CORS_PROXY: 'https://api.allorigins.win/get?url='
};

// Spell slot configuration
export const MAX_SPELL_LEVELS = 9;  // Spell levels 1-9
export const MIN_SLOTS_PER_LEVEL = 0;
export const MAX_SLOTS_PER_LEVEL = 12;

// Tooltip configuration
export const TOOLTIP_MARGIN = 5;
export const TOOLTIP_MAX_WIDTH = 400;

// Canvas rendering colors
export const COLORS = {
  BACKGROUND: '#555',
  GRID_AREA: '#333',
  GRID_POINT: '#333',
  ADD_MODE_LINE: 'forestgreen',
  ADD_MODE_CURSOR: 'forestgreen',
  DELETE_MODE_CURSOR: 'red',
  TOKEN_MODE_CURSOR: 'orange',
  HIGHLIGHT_MODE_CURSOR: 'royalblue',
  HIGHLIGHT_SELECTION: 'royalblue',
  CLEAR_BUTTON_BG: 'orange',
  CLEAR_BUTTON_X: 'red',
  TEXT_DEFAULT: 'white',
  TEXT_HIGHLIGHTED: 'royalblue',
  CONNECTION_LINE: 'black',
  SPELL_SLOT_FILLED: 'gold',
  SPELL_SLOT_EMPTY: 'white'
};

// Cursor rendering constants
export const CURSOR_SIZE = 10;
export const CURSOR_OFFSET = 5;
export const CURSOR_LINE_WIDTH = 3;
export const CURSOR_TOKEN_HEXAGON_SIZE = 8;

// Text rendering constants
export const DEFAULT_FONT = '12px Arial';
export const DEFAULT_TEXT_ALIGN = 'center';
export const DEFAULT_TEXT_BASELINE = 'top';
export const MAX_LABEL_WIDTH = 60;
export const LINE_HEIGHT = 14;
