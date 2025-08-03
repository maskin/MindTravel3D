# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MindTravel3D is a web-based 3D maze game built with Three.js. It's a Progressive Web App (PWA) that provides an immersive 3D maze exploration experience across multiple platforms (PC, mobile, tablet). The project aims to reach 10 million users who enjoy 3D maze experiences.

## Development Commands

### Local Development
```bash
# Start local server (Python)
python3 -m http.server 8000

# Alternative using Node.js
npx serve

# Access the game
open http://localhost:8000
```

### Testing
- No automated test framework is currently implemented
- Manual testing via browser at different viewport sizes
- Debug panel available via Ctrl+D for runtime verification

### Deployment
- Static site hosting (currently GitHub Pages)
- No build process required - direct file deployment
- PWA assets (manifest.json, sw.js) are manually maintained

## Architecture Overview

### Core Components

**GameManager (js/main.js)**
- Central orchestrator that initializes and coordinates all systems
- Handles error management and PWA setup
- Manages game lifecycle (start, new maze generation)

**GameEngine (js/game-engine.js)**
- 3D rendering engine using Three.js
- Scene management (lights, camera, materials)
- Player movement and collision detection
- Maze generation visualization and goal mechanics

**MazeGenerator (js/maze-generator.js)**
- Implements Recursive Backtracking algorithm
- Generates 50x50 maze grids
- Provides start/end position calculations

**Controls (js/controls.js)**
- Input handling for keyboard, mouse, and touch
- Cross-platform control abstraction
- Movement and rotation commands

**UIManager (js/ui-manager.js)**
- UI state management (menus, modals, game info)
- Mobile control interface
- Error display and loading states

**ThreeCompatibility (js/three-compatibility.js)**
- Compatibility layer for Three.js API differences
- Handles geometry and material creation gracefully
- Provides fallbacks for missing Three.js features

### Key Technical Patterns

**Dynamic Script Loading**
- Three.js is loaded first, then dependent scripts load sequentially
- Version parameters (`?v=2025-08-01-upgraded`) for cache busting
- Graceful fallback to CDN if local Three.js fails

**Error Handling**
- Comprehensive error catching in initialization
- Global error handlers for unhandled exceptions
- User-friendly error messages via UIManager

**3D Scene Architecture**
- Procedural texture generation using canvas
- Enhanced lighting system with player spotlight
- Optimized geometry reuse for maze walls/floors

**PWA Implementation**
- Service Worker for offline capability
- App manifest for installability
- Cross-platform touch controls

## File Structure
```
MindTravel3D/
├── index.html              # Main HTML with embedded CSS/JS
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── three.min.js            # Three.js library (local copy)
├── js/
│   ├── main.js             # GameManager - central coordinator
│   ├── game-engine.js      # 3D engine and rendering
│   ├── maze-generator.js   # Maze generation algorithms
│   ├── controls.js         # Input handling system
│   ├── ui-manager.js       # UI state management
│   └── three-compatibility.js # Three.js compatibility layer
└── docs/                   # Project documentation
    ├── README.md
    └── requirements-phase1.md # Detailed project requirements
```

## Development Guidelines

### Three.js Integration
- Always use the compatibility layer (window.ThreeCompat) when available
- Test geometry/material creation with try-catch blocks
- Fallback to basic Three.js constructors if compatibility layer fails

### Mobile Considerations
- Touch controls are automatically enabled on mobile devices
- Responsive design adapts UI for smaller screens
- Performance optimizations for lower-powered devices

### Debugging
- Debug panel available via Ctrl+D keyboard shortcut
- Verification system tests rendering, memory usage, and performance
- Error simulation tools for testing error handling paths

### Code Style
- Japanese comments in source code (project is Japan-focused)
- ES6+ features used throughout
- Async/await pattern for initialization sequences

### Performance Targets
- 60fps rendering target
- 3-second initial load time goal
- 500MB memory usage limit
- Supports devices with basic WebGL capabilities

## Common Development Tasks

### Adding New Maze Features
1. Modify MazeGenerator class for new algorithms
2. Update GameEngine.createMaze() for visual representation
3. Test across different devices and browsers

### Enhancing 3D Graphics
1. Use ThreeCompatibility layer for new geometry/materials
2. Test fallback behavior when Three.js features unavailable
3. Verify performance on mobile devices

### UI/Control Improvements
1. Update UIManager for new interface elements
2. Extend Controls class for new input methods
3. Test responsive behavior across screen sizes

### PWA Enhancements
1. Update manifest.json for new capabilities
2. Modify sw.js for additional offline features
3. Test installation and offline functionality

The project is currently in MVP phase, with plans for a 1st phase targeting 1 million users through enhanced visuals, social features, and backend infrastructure.