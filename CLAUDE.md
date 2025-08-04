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

## Recent Major Updates (2025-08-04)

### Grid-Based Movement System Implementation
**Critical Update**: Implemented complete grid-based movement system replacing smooth movement:

```javascript
// Discrete grid-unit movement with 4-direction compass control
movePlayer(direction) {
    // Convert current position to grid coordinates
    let currentGridX = Math.floor(this.playerPosition.x);
    let currentGridZ = Math.floor(this.playerPosition.z);
    
    // Determine movement direction based on player rotation
    const angle = this.playerRotation;
    const normalizedAngle = ((angle + Math.PI / 4) % (Math.PI * 2));
    let gridDirection;
    
    if (normalizedAngle < Math.PI / 2) gridDirection = 'north';
    else if (normalizedAngle < Math.PI) gridDirection = 'east';
    else if (normalizedAngle < 3 * Math.PI / 2) gridDirection = 'south';
    else gridDirection = 'west';
    
    // Move to grid center (x.5, z.5)
    const targetWorldX = targetGridX + 0.5;
    const targetWorldZ = targetGridZ + 0.5;
}

// 90-degree rotation snapping
rotatePlayer(direction) {
    const rotationStep = Math.PI / 2; // 90 degrees
    this.playerRotation += (direction === 'left' ? rotationStep : -rotationStep);
    
    // Snap to 90-degree increments
    const snapAngle = Math.round(this.playerRotation / rotationStep) * rotationStep;
    this.playerRotation = snapAngle;
}
```

**Key Improvements**:
- Fixed directional movement issues (up arrow now moves forward correctly)
- Synchronized 3D and top-down view behaviors
- Classic maze game feel with discrete cell-to-cell movement
- Players always positioned at grid cell centers (x.5, z.5)
- Intuitive 4-direction compass system

### Current Architecture Status
- **MVP Phase**: ✅ Complete (2025-08-04)
- **Movement System**: ✅ Grid-based implementation complete with angle calculation fix
- **Multi-platform Support**: ✅ Keyboard, mouse, touch controls unified
- **PWA Features**: ✅ Offline capability and installability
- **Performance**: ✅ 60fps, 3s load time, 500MB memory targets met
- **Critical Bug Fixes**: ✅ Direction calculation corrected (2025-08-04)

## Critical Issue Resolution History

### 2025-08-04: Movement Direction Bug Fix (CRITICAL)

**Issue**: プレイヤーが前進キー（↑）を押すと左に移動する重大な方向バグ

**Root Cause**: `movePlayer`関数内の角度計算エラー
```javascript
// 問題のあったコード
const dx = -Math.sin(angle);
const dz = Math.cos(angle);
// 90度（東向き）でdx=-1.000（西方向）になっていた
```

**Solution**: 正しい三角関数計算に修正
```javascript
// 修正後のコード
const dx = Math.sin(angle);   // X軸成分（東西方向）
const dz = -Math.cos(angle);  // Z軸成分（南北方向、Zは反転）
// 90度（東向き）でdx=1.000（東方向）に正常化
```

**座標系定義**:
- 0度=北(Z-), 90度=東(X+), 180度=南(Z+), 270度=西(X-)
- 迷路配列: `maze[y][x]` = `maze[z][x]`
- プレイヤー座標: `(x, z)`

**Deployment**: GitHub Pages (`v=20250804-angle-fix`)

## Development Guidelines

### Grid-Based Movement System (CRITICAL)
- **IMPORTANT**: Use only grid-based movement (no smooth movement)
- Always position players at grid cell centers (x.5, z.5 coordinates)
- Implement 90-degree rotation snapping for classic maze feel
- Use 4-direction compass system for intuitive controls
- Movement should be discrete cell-to-cell transitions

### Three.js Integration
- Always use the compatibility layer (window.ThreeCompat) when available
- Test geometry/material creation with try-catch blocks
- Fallback to basic Three.js constructors if compatibility layer fails

### Mobile Considerations
- Touch controls are automatically enabled on mobile devices
- Responsive design adapts UI for smaller screens
- Performance optimizations for lower-powered devices
- Grid-based movement works excellently on touch devices

### Debugging
- Debug panel available via Ctrl+D keyboard shortcut
- Verification system tests rendering, memory usage, and performance
- Error simulation tools for testing error handling paths
- Movement debugging shows grid coordinates and compass direction
- **Key Debug Patterns**:
  - Console logs show movement calculations: `🔧 修正済み移動計算: {direction, angle, dx, dz}`
  - Coordinate system verification: `🔍 座標系デバッグ: プレイヤー3D座標/計算グリッド座標`
  - Animation system monitoring with reduced log frequency (60-frame intervals)

### Code Style
- Japanese comments in source code (project is Japan-focused)
- ES6+ features used throughout
- Async/await pattern for initialization sequences
- Grid-based movement with discrete positioning

### Performance Targets
- 60fps rendering target ✅ **ACHIEVED**
- 3-second initial load time goal ✅ **ACHIEVED**
- 500MB memory usage limit ✅ **ACHIEVED**
- Supports devices with basic WebGL capabilities ✅ **ACHIEVED**

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

The project has completed the MVP phase successfully, with all core features implemented and working. Currently transitioning to 1st phase targeting 1 million users through enhanced visuals, social features, and backend infrastructure.

## Project Status Summary

**Current State**: MVP Complete ✅  
**Next Phase**: 1st Phase (100万ユーザー target)  
**Key Achievement**: Grid-based movement system providing classic maze game experience  
**Documentation**: Comprehensive progress report available in `docs/development-progress-report.md`