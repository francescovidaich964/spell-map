/**
 * @fileoverview Main application entry point.
 * Wires all modules together with dependency injection and starts the application.
 * @module main
 */

import { AppState } from './core/AppState.js';
import { initializeSpells } from './core/SpellData.js';

// Canvas renderers
import { GridRenderer } from './canvas/GridRenderer.js';
import { SpellRenderer } from './canvas/SpellRenderer.js';
import { UIRenderer } from './canvas/UIRenderer.js';
import { CursorRenderer } from './canvas/CursorRenderer.js';
import { CanvasRenderer } from './canvas/CanvasRenderer.js';

// Interaction handlers
import { ModeManager } from './interaction/ModeManager.js';
import { MouseHandler } from './interaction/MouseHandler.js';
import { KeyboardHandler } from './interaction/KeyboardHandler.js';

// Feature managers
import { ConnectionManager } from './features/ConnectionManager.js';
import { SpellFilter } from './features/SpellFilter.js';
import { SpellSlotManager } from './features/SpellSlotManager.js';
import { TooltipManager } from './features/TooltipManager.js';
import { FileManager } from './features/FileManager.js';

// API clients
import { SpellAPIClient } from './api/SpellAPIClient.js';

/**
 * Initialize and start the Spell Map application
 *
 * Sets up all modules with dependency injection and starts the render loop.
 */
function initializeApp() {
  // Get canvas element
  const canvas = document.getElementById('SpellMap');
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Could not get 2D context from canvas!');
    return;
  }

  // Initialize application state
  const appState = new AppState();

  // Initialize spells from database
  const initialSpells = initializeSpells();
  appState.spells = initialSpells;

  // Initialize API client
  const apiClient = new SpellAPIClient();

  // Initialize feature managers
  const connectionManager = new ConnectionManager(appState);
  const spellFilter = new SpellFilter(appState);
  const spellSlotManager = new SpellSlotManager(appState);
  const tooltipManager = new TooltipManager(appState, apiClient);
  const fileManager = new FileManager(appState);

  // Initialize spell filter with all spells
  spellFilter.initializeAllSpells(initialSpells);

  // Initialize renderers
  const gridRenderer = new GridRenderer(ctx, appState);
  const spellRenderer = new SpellRenderer(ctx, appState);
  const uiRenderer = new UIRenderer(ctx, appState);
  const cursorRenderer = new CursorRenderer(ctx, appState);
  const canvasRenderer = new CanvasRenderer(
    ctx,
    appState,
    gridRenderer,
    spellRenderer,
    uiRenderer,
    cursorRenderer
  );

  // Initialize interaction handlers
  const modeManager = new ModeManager(appState);
  const mouseHandler = new MouseHandler(
    appState,
    connectionManager,
    spellSlotManager,
    tooltipManager,
    modeManager,
    uiRenderer
  );
  const keyboardHandler = new KeyboardHandler(
    appState,
    modeManager,
    spellSlotManager,
    fileManager
  );

  // Set canvas reference in mouse handler
  mouseHandler.setCanvas(canvas);

  // Bind event listeners
  canvas.addEventListener('mousemove', (e) => mouseHandler.onMouseMove(e));
  canvas.addEventListener('mousedown', (e) => mouseHandler.onMouseDown(e));
  canvas.addEventListener('mouseup', (e) => mouseHandler.onMouseUp(e));
  document.addEventListener('keydown', (e) => keyboardHandler.onKeyDown(e));

  // Initialize UI components (must be called after DOM is loaded)
  spellFilter.initializeUI();
  spellSlotManager.initializeUI();

  // Start render loop
  canvasRenderer.startRenderLoop();

  // Expose for debugging
  window.spellMapApp = {
    appState,
    canvasRenderer,
    modeManager,
    connectionManager,
    spellFilter,
    spellSlotManager,
    tooltipManager,
    fileManager,
    apiClient,
    mouseHandler,
    keyboardHandler
  };

  console.log('Spell Map application initialized successfully');
  console.log('Available debug commands:');
  console.log('  window.spellMapApp.appState - View application state');
  console.log('  window.spellMapApp.apiClient.getCacheStats() - View API cache');
  console.log('  window.spellMapApp.canvasRenderer.stopRenderLoop() - Stop rendering');
  console.log('  window.spellMapApp.canvasRenderer.startRenderLoop() - Start rendering');
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM is already ready
  initializeApp();
}
