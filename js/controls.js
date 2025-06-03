/**
 * ゲームコントロール管理
 */
class GameControls {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.keys = new Set();
        this.isMouseDown = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.touchStartX = 0;
        this.touchStartY = 0;
        
        this.init();
    }

    init() {
        this.setupKeyboardControls();
        this.setupMouseControls();
        this.setupTouchControls();
        this.setupMobileButtons();
        this.setupGameLoop();
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            this.keys.add(event.code);
            
            switch (event.code) {
                case 'KeyR':
                    this.gameEngine.generateNewMaze();
                    break;
                case 'Escape':
                    if (window.gameModal) {
                        window.gameModal.show('メニュー', 'ゲームメニュー');
                    }
                    break;
            }
        });

        document.addEventListener('keyup', (event) => {
            this.keys.delete(event.code);
        });
    }

    setupMouseControls() {
        const canvas = this.gameEngine.canvas;
        
        canvas.addEventListener('mousedown', (event) => {
            this.isMouseDown = true;
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
            canvas.requestPointerLock();
        });

        document.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });

        document.addEventListener('mousemove', (event) => {
            if (document.pointerLockElement === canvas) {
                // ポインターロック時
                this.gameEngine.rotateCamera(event.movementX, event.movementY);
            } else if (this.isMouseDown) {
                // 通常のマウスドラッグ
                const deltaX = event.clientX - this.lastMouseX;
                const deltaY = event.clientY - this.lastMouseY;
                
                this.gameEngine.rotateCamera(deltaX, deltaY);
                
                this.lastMouseX = event.clientX;
                this.lastMouseY = event.clientY;
            }
        });

        // ポインターロック終了時
        document.addEventListener('pointerlockchange', () => {
            if (!document.pointerLockElement) {
                this.isMouseDown = false;
            }
        });
    }

    setupTouchControls() {
        const canvas = this.gameEngine.canvas;
        
        canvas.addEventListener('touchstart', (event) => {
            event.preventDefault();
            if (event.touches.length === 1) {
                this.touchStartX = event.touches[0].clientX;
                this.touchStartY = event.touches[0].clientY;
            }
        });

        canvas.addEventListener('touchmove', (event) => {
            event.preventDefault();
            if (event.touches.length === 1) {
                const touch = event.touches[0];
                const deltaX = touch.clientX - this.touchStartX;
                const deltaY = touch.clientY - this.touchStartY;
                
                // スワイプ感度
                const sensitivity = 2;
                this.gameEngine.rotateCamera(deltaX * sensitivity, deltaY * sensitivity);
                
                this.touchStartX = touch.clientX;
                this.touchStartY = touch.clientY;
            }
        });

        canvas.addEventListener('touchend', (event) => {
            event.preventDefault();
        });

        // タッチスワイプで移動
        let swipeStartX = 0;
        let swipeStartY = 0;
        let swipeStartTime = 0;
        
        canvas.addEventListener('touchstart', (event) => {
            if (event.touches.length === 2) {
                // 2本指タッチで移動開始
                swipeStartX = event.touches[0].clientX;
                swipeStartY = event.touches[0].clientY;
                swipeStartTime = Date.now();
            }
        });

        canvas.addEventListener('touchend', (event) => {
            if (event.changedTouches.length === 2) {
                // 2本指タッチ終了で移動判定
                const endX = event.changedTouches[0].clientX;
                const endY = event.changedTouches[0].clientY;
                const deltaX = endX - swipeStartX;
                const deltaY = endY - swipeStartY;
                const deltaTime = Date.now() - swipeStartTime;
                
                if (deltaTime < 500) { // 0.5秒以内のスワイプ
                    const minSwipeDistance = 50;
                    
                    if (Math.abs(deltaX) > Math.abs(deltaY)) {
                        // 左右スワイプ
                        if (Math.abs(deltaX) > minSwipeDistance) {
                            this.gameEngine.movePlayer(deltaX > 0 ? 'right' : 'left');
                        }
                    } else {
                        // 上下スワイプ
                        if (Math.abs(deltaY) > minSwipeDistance) {
                            this.gameEngine.movePlayer(deltaY > 0 ? 'backward' : 'forward');
                        }
                    }
                }
            }
        });
    }

    setupMobileButtons() {
        // モバイル用の移動ボタン
        document.getElementById('btn-up').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.gameEngine.movePlayer('forward');
        });
        
        document.getElementById('btn-down').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.gameEngine.movePlayer('backward');
        });
        
        document.getElementById('btn-left').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.gameEngine.movePlayer('left');
        });
        
        document.getElementById('btn-right').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.gameEngine.movePlayer('right');
        });

        // クリックイベントも追加（デスクトップでのテスト用）
        document.getElementById('btn-up').addEventListener('click', () => {
            this.gameEngine.movePlayer('forward');
        });
        
        document.getElementById('btn-down').addEventListener('click', () => {
            this.gameEngine.movePlayer('backward');
        });
        
        document.getElementById('btn-left').addEventListener('click', () => {
            this.gameEngine.movePlayer('left');
        });
        
        document.getElementById('btn-right').addEventListener('click', () => {
            this.gameEngine.movePlayer('right');
        });
    }

    setupGameLoop() {
        // キーボード入力の継続的な処理
        const processKeys = () => {
            if (this.keys.has('ArrowUp') || this.keys.has('KeyW')) {
                this.gameEngine.movePlayer('forward');
            }
            if (this.keys.has('ArrowDown') || this.keys.has('KeyS')) {
                this.gameEngine.movePlayer('backward');
            }
            if (this.keys.has('ArrowLeft') || this.keys.has('KeyA')) {
                this.gameEngine.movePlayer('left');
            }
            if (this.keys.has('ArrowRight') || this.keys.has('KeyD')) {
                this.gameEngine.movePlayer('right');
            }
            
            requestAnimationFrame(processKeys);
        };
        
        processKeys();
    }

    // タッチデバイス判定
    isMobile() {
        return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    }

    // コントロールヘルプの取得
    getControlsHelp() {
        if (this.isMobile()) {
            return [
                '1本指ドラッグ: 視点回転',
                '2本指スワイプ: 移動',
                '画面下部ボタン: 移動'
            ];
        } else {
            return [
                '矢印キー/WASD: 移動',
                'マウスドラッグ: 視点回転',
                'R: 新しい迷路',
                'ESC: メニュー'
            ];
        }
    }
}

// グローバルエクスポート
window.GameControls = GameControls;