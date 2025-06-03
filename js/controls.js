class Controls {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.keys = {};
        this.touchStartX = null;
        this.touchStartY = null;
        this.touchThreshold = 50;
        
        this.init();
    }
    
    init() {
        this.setupKeyboardControls();
        this.setupTouchControls();
        this.setupMouseControls();
        this.setupControlButtons();
    }
    
    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            this.handleKeyPress(event.code);
            event.preventDefault();
        });
        
        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
    }
    
    setupTouchControls() {
        const canvas = document.getElementById('gameCanvas');
        
        canvas.addEventListener('touchstart', (event) => {
            event.preventDefault();
            const touch = event.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
        }, { passive: false });
        
        canvas.addEventListener('touchend', (event) => {
            event.preventDefault();
            if (this.touchStartX !== null && this.touchStartY !== null) {
                const touch = event.changedTouches[0];
                const deltaX = touch.clientX - this.touchStartX;
                const deltaY = touch.clientY - this.touchStartY;
                
                if (Math.abs(deltaX) > this.touchThreshold || Math.abs(deltaY) > this.touchThreshold) {
                    if (Math.abs(deltaX) > Math.abs(deltaY)) {
                        // Horizontal swipe
                        if (deltaX > 0) {
                            this.movePlayer('right');
                        } else {
                            this.movePlayer('left');
                        }
                    } else {
                        // Vertical swipe
                        if (deltaY > 0) {
                            this.movePlayer('down');
                        } else {
                            this.movePlayer('up');
                        }
                    }
                }
            }
            
            this.touchStartX = null;
            this.touchStartY = null;
        }, { passive: false });
        
        // Prevent scrolling on touch
        canvas.addEventListener('touchmove', (event) => {
            event.preventDefault();
        }, { passive: false });
    }
    
    setupMouseControls() {
        const canvas = document.getElementById('gameCanvas');
        let isMouseDown = false;
        let mouseStartX = null;
        let mouseStartY = null;
        
        canvas.addEventListener('mousedown', (event) => {
            isMouseDown = true;
            mouseStartX = event.clientX;
            mouseStartY = event.clientY;
        });
        
        canvas.addEventListener('mouseup', (event) => {
            if (isMouseDown && mouseStartX !== null && mouseStartY !== null) {
                const deltaX = event.clientX - mouseStartX;
                const deltaY = event.clientY - mouseStartY;
                
                if (Math.abs(deltaX) > this.touchThreshold || Math.abs(deltaY) > this.touchThreshold) {
                    if (Math.abs(deltaX) > Math.abs(deltaY)) {
                        // Horizontal drag
                        if (deltaX > 0) {
                            this.movePlayer('right');
                        } else {
                            this.movePlayer('left');
                        }
                    } else {
                        // Vertical drag
                        if (deltaY > 0) {
                            this.movePlayer('down');
                        } else {
                            this.movePlayer('up');
                        }
                    }
                }
            }
            
            isMouseDown = false;
            mouseStartX = null;
            mouseStartY = null;
        });
        
        // Prevent context menu
        canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }
    
    setupControlButtons() {
        const controlButtons = document.querySelectorAll('.control-btn');
        
        controlButtons.forEach(button => {
            button.addEventListener('click', () => {
                const direction = button.getAttribute('data-key');
                this.movePlayer(direction);
            });
            
            // Prevent text selection
            button.addEventListener('selectstart', (event) => {
                event.preventDefault();
            });
        });
    }
    
    handleKeyPress(keyCode) {
        switch (keyCode) {
            case 'ArrowUp':
            case 'KeyW':
                this.movePlayer('up');
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.movePlayer('down');
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.movePlayer('left');
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.movePlayer('right');
                break;
            case 'KeyR':
                this.gameEngine.resetGame();
                break;
            case 'Escape':
                this.showMenu();
                break;
        }
    }
    
    movePlayer(direction) {
        if (this.gameEngine) {
            this.gameEngine.movePlayer(direction);
        }
    }
    
    showMenu() {
        showModal(
            'ゲームメニュー',
            'ゲームを続行するか、新しいゲームを開始してください。',
            '新しいゲーム',
            () => {
                this.gameEngine.resetGame();
            }
        );
    }
}