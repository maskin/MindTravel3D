// 3D迷路ゲーム - 操作システム
class Controls {
    constructor(gameEngine, gameManager, uiManager) {
        this.gameEngine = gameEngine;
        this.gameManager = gameManager;
        this.uiManager = uiManager;
        this.keys = {};
        this.isPointerLocked = false;
        this.mouse = { x: 0, y: 0 };
        this.mouseSpeed = 0.002;
        
        this.init();
    }
    
    init() {        
        // キーボードイベント
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // マウスイベント
        document.addEventListener('click', () => this.requestPointerLock());
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        // タッチイベント
        this.initTouchControls();
        
        // モバイルコントロールボタン
        this.initMobileButtons();
        
        // ウィンドウリサイズ
        window.addEventListener('resize', () => {
            if (this.gameEngine) {
                this.gameEngine.handleResize();
            }
        });
    }
    
    onKeyDown(event) {
        if (!this.gameEngine.isGameStarted) return;
        
        this.keys[event.code] = true;
        
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.gameEngine.movePlayer('forward');
                event.preventDefault();
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.gameEngine.movePlayer('backward');
                event.preventDefault();
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.gameEngine.rotatePlayer('left');
                event.preventDefault();
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.gameEngine.rotatePlayer('right');
                event.preventDefault();
                break;
            case 'KeyR':
                this.gameManager.generateNewMaze();
                event.preventDefault();
                break;
            case 'Escape':
                this.uiManager.toggleMenu();
                event.preventDefault();
                break;
        }
    }
    
    onKeyUp(event) {
        this.keys[event.code] = false;
    }
    
    requestPointerLock() {
        if (!this.gameEngine.isGameStarted) return;
        
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.requestPointerLock = canvas.requestPointerLock || 
                                      canvas.mozRequestPointerLock || 
                                      canvas.webkitRequestPointerLock;
            if (canvas.requestPointerLock) {
                canvas.requestPointerLock();
            }
        }
    }
    
    onPointerLockChange() {
        const canvas = document.getElementById('gameCanvas');
        this.isPointerLocked = document.pointerLockElement === canvas ||
                             document.mozPointerLockElement === canvas ||
                             document.webkitPointerLockElement === canvas;
    }
    
    onMouseMove(event) {
        if (!this.isPointerLocked || !this.gameEngine.isGameStarted) return;
        
        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        
        // マウス移動で視点回転
        if (Math.abs(movementX) > 0) {
            this.gameEngine.playerRotation += movementX * this.mouseSpeed;
            
            // 角度を正規化
            this.gameEngine.playerRotation = (this.gameEngine.playerRotation % (Math.PI * 2) + (Math.PI * 2)) % (Math.PI * 2);
            
            this.gameEngine.updateCameraPosition();
        }
    }
    
    initTouchControls() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        let touchStartX = 0;
        let touchStartY = 0;
        let touchCount = 0;
        
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchCount = e.touches.length;
            
            if (touchCount === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            
            if (!this.gameEngine.isGameStarted || touchCount !== 1) return;
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            
            // 小さな移動は無視
            if (Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30) return;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 横スワイプ - 回転
                if (deltaX > 0) {
                    this.gameEngine.rotatePlayer('right');
                } else {
                    this.gameEngine.rotatePlayer('left');
                }
            } else {
                // 縦スワイプ - 移動
                if (deltaY < 0) {
                    this.gameEngine.movePlayer('forward');
                } else {
                    this.gameEngine.movePlayer('backward');
                }
            }
            
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            touchCount = 0;
        });
    }
    
    initMobileButtons() {
        const buttons = document.querySelectorAll('.control-btn');
        
        buttons.forEach(button => {
            const action = button.dataset.action;
            
            // タッチ開始
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (!this.gameEngine.isGameStarted) return;
                
                button.style.background = 'rgba(255, 255, 255, 0.4)';
                
                switch (action) {
                    case 'forward':
                        this.gameEngine.movePlayer('forward');
                        break;
                    case 'backward':
                        this.gameEngine.movePlayer('backward');
                        break;
                    case 'turnLeft':
                        this.gameEngine.rotatePlayer('left');
                        break;
                    case 'turnRight':
                        this.gameEngine.rotatePlayer('right');
                        break;
                }
            });
            
            // タッチ終了
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                button.style.background = 'rgba(255, 255, 255, 0.2)';
            });
            
            // マウスクリック（PC用）
            button.addEventListener('click', (e) => {
                e.preventDefault();
                if (!this.gameEngine.isGameStarted) return;
                
                switch (action) {
                    case 'forward':
                        this.gameEngine.movePlayer('forward');
                        break;
                    case 'backward':
                        this.gameEngine.movePlayer('backward');
                        break;
                    case 'turnLeft':
                        this.gameEngine.rotatePlayer('left');
                        break;
                    case 'turnRight':
                        this.gameEngine.rotatePlayer('right');
                        break;
                }
            });
        });
    }
}

// グローバルに公開
window.Controls = Controls;