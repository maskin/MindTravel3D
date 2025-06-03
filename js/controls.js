class Controls {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.isPointerLocked = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        this.init();
    }

    init() {
        this.setupKeyboardControls();
        this.setupMouseControls();
        this.setupTouchControls();
        this.setupMobileButtons();
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            this.handleKeyPress(event);
        });

        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
    }

    handleKeyPress(event) {
        switch (event.code) {
            // Movement keys - WASD and Arrow Keys
            case 'ArrowUp':
            case 'KeyW':
                this.gameEngine.movePlayer('forward');
                break;
                
            case 'ArrowDown':
            case 'KeyS':
                this.gameEngine.movePlayer('backward');
                break;
                
            // Turning keys - left/right arrows and A/D
            case 'ArrowLeft':
            case 'KeyA':
                this.gameEngine.turnPlayer('left');
                break;
                
            case 'ArrowRight':
            case 'KeyD':
                this.gameEngine.turnPlayer('right');
                break;
                
            // Special keys
            case 'KeyR':
                this.gameEngine.regenerateMaze();
                break;
                
            case 'Escape':
                game.showModal();
                break;
        }
        
        event.preventDefault();
    }

    setupMouseControls() {
        const canvas = document.getElementById('gameCanvas');
        
        // Mouse movement for looking around
        canvas.addEventListener('mousemove', (event) => {
            if (!this.isPointerLocked && !this.isMobile) {
                const deltaX = event.movementX || event.webkitMovementX || 0;
                
                if (Math.abs(deltaX) > 10) {
                    if (deltaX > 0) {
                        this.gameEngine.turnPlayer('right');
                    } else {
                        this.gameEngine.turnPlayer('left');
                    }
                }
            }
        });

        // Click to enable pointer lock for desktop
        canvas.addEventListener('click', () => {
            if (!this.isMobile) {
                canvas.requestPointerLock = canvas.requestPointerLock ||
                    canvas.mozRequestPointerLock ||
                    canvas.webkitRequestPointerLock;
                if (canvas.requestPointerLock) {
                    canvas.requestPointerLock();
                }
            }
        });

        // Pointer lock change events
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === canvas;
        });
    }

    setupTouchControls() {
        const canvas = document.getElementById('gameCanvas');
        
        canvas.addEventListener('touchstart', (event) => {
            if (event.touches.length === 1) {
                this.touchStartX = event.touches[0].clientX;
                this.touchStartY = event.touches[0].clientY;
            }
            event.preventDefault();
        });

        canvas.addEventListener('touchmove', (event) => {
            if (event.touches.length === 1) {
                const deltaX = event.touches[0].clientX - this.touchStartX;
                const deltaY = event.touches[0].clientY - this.touchStartY;
                
                // Horizontal swipe for turning
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                    if (deltaX > 0) {
                        this.gameEngine.turnPlayer('right');
                    } else {
                        this.gameEngine.turnPlayer('left');
                    }
                    this.touchStartX = event.touches[0].clientX;
                    this.touchStartY = event.touches[0].clientY;
                }
                
                // Vertical swipe for movement
                if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
                    if (deltaY < 0) {
                        this.gameEngine.movePlayer('forward');
                    } else {
                        this.gameEngine.movePlayer('backward');
                    }
                    this.touchStartX = event.touches[0].clientX;
                    this.touchStartY = event.touches[0].clientY;
                }
            }
            event.preventDefault();
        });

        canvas.addEventListener('touchend', (event) => {
            event.preventDefault();
        });
    }

    setupMobileButtons() {
        // Mobile control buttons
        const upBtn = document.getElementById('upBtn');
        const downBtn = document.getElementById('downBtn');
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');

        if (upBtn) {
            upBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.gameEngine.movePlayer('forward');
            });
        }

        if (downBtn) {
            downBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.gameEngine.movePlayer('backward');
            });
        }

        if (leftBtn) {
            leftBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.gameEngine.turnPlayer('left');
            });
        }

        if (rightBtn) {
            rightBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.gameEngine.turnPlayer('right');
            });
        }

        // Also add click events for desktop testing
        if (upBtn) upBtn.addEventListener('click', () => this.gameEngine.movePlayer('forward'));
        if (downBtn) downBtn.addEventListener('click', () => this.gameEngine.movePlayer('backward'));
        if (leftBtn) leftBtn.addEventListener('click', () => this.gameEngine.turnPlayer('left'));
        if (rightBtn) rightBtn.addEventListener('click', () => this.gameEngine.turnPlayer('right'));
    }

    // Utility method to check if a key is currently pressed
    isKeyPressed(keyCode) {
        return !!this.keys[keyCode];
    }

    // Method to handle continuous movement (if needed in future)
    update() {
        // This could be used for continuous movement based on held keys
        // Currently using discrete movement for better maze navigation
    }
}