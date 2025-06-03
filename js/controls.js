/**
 * ゲームコントロール管理
 * キーボード、タッチコントロール、マウスの管理
 */
class GameControls {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.keys = {};
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isTouch = false;
        
        this.init();
    }
    
    /**
     * コントロールシステムの初期化
     */
    init() {
        this.setupKeyboardControls();
        this.setupTouchControls();
        this.setupMouseControls();
        this.setupMobileButtons();
    }
    
    /**
     * キーボードコントロールの設定
     */
    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            this.handleKeyboardInput(event);
        });
        
        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
        
        // キーの連続入力処理
        setInterval(() => {
            this.processKeyboardInput();
        }, 16); // 約60FPS
    }
    
    /**
     * キーボード入力の処理
     */
    handleKeyboardInput(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                event.preventDefault();
                this.game.movePlayer(0, -1);
                break;
            case 'ArrowDown':
            case 'KeyS':
                event.preventDefault();
                this.game.movePlayer(0, 1);
                break;
            case 'ArrowLeft':
            case 'KeyA':
                event.preventDefault();
                this.game.movePlayer(-1, 0);
                break;
            case 'ArrowRight':
            case 'KeyD':
                event.preventDefault();
                this.game.movePlayer(1, 0);
                break;
            case 'KeyR':
                event.preventDefault();
                this.game.restart();
                break;
            case 'Escape':
                event.preventDefault();
                if (window.closeModal) {
                    window.closeModal();
                }
                break;
        }
    }
    
    /**
     * 連続キー入力の処理
     */
    processKeyboardInput() {
        if (this.keys['ArrowUp'] || this.keys['KeyW']) {
            this.game.movePlayer(0, -1);
        }
        if (this.keys['ArrowDown'] || this.keys['KeyS']) {
            this.game.movePlayer(0, 1);
        }
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.game.movePlayer(-1, 0);
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.game.movePlayer(1, 0);
        }
    }
    
    /**
     * タッチコントロールの設定
     */
    setupTouchControls() {
        const canvas = document.getElementById('gameCanvas');
        
        canvas.addEventListener('touchstart', (event) => {
            event.preventDefault();
            this.isTouch = true;
            const touch = event.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
        }, { passive: false });
        
        canvas.addEventListener('touchmove', (event) => {
            event.preventDefault();
        }, { passive: false });
        
        canvas.addEventListener('touchend', (event) => {
            event.preventDefault();
            if (!this.isTouch) return;
            
            const touch = event.changedTouches[0];
            const deltaX = touch.clientX - this.touchStartX;
            const deltaY = touch.clientY - this.touchStartY;
            
            // 最小スワイプ距離
            const minSwipeDistance = 30;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平スワイプ
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        this.game.movePlayer(1, 0); // 右
                    } else {
                        this.game.movePlayer(-1, 0); // 左
                    }
                }
            } else {
                // 垂直スワイプ
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0) {
                        this.game.movePlayer(0, 1); // 下
                    } else {
                        this.game.movePlayer(0, -1); // 上
                    }
                }
            }
            
            this.isTouch = false;
        }, { passive: false });
    }
    
    /**
     * マウスコントロールの設定
     */
    setupMouseControls() {
        const canvas = document.getElementById('gameCanvas');
        let isMouseDown = false;
        let mouseStartX = 0;
        let mouseStartY = 0;
        
        canvas.addEventListener('mousedown', (event) => {
            isMouseDown = true;
            mouseStartX = event.clientX;
            mouseStartY = event.clientY;
        });
        
        canvas.addEventListener('mouseup', (event) => {
            if (!isMouseDown) return;
            
            const deltaX = event.clientX - mouseStartX;
            const deltaY = event.clientY - mouseStartY;
            
            // 最小ドラッグ距離
            const minDragDistance = 20;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平ドラッグ
                if (Math.abs(deltaX) > minDragDistance) {
                    if (deltaX > 0) {
                        this.game.movePlayer(1, 0); // 右
                    } else {
                        this.game.movePlayer(-1, 0); // 左
                    }
                }
            } else {
                // 垂直ドラッグ
                if (Math.abs(deltaY) > minDragDistance) {
                    if (deltaY > 0) {
                        this.game.movePlayer(0, 1); // 下
                    } else {
                        this.game.movePlayer(0, -1); // 上
                    }
                }
            }
            
            isMouseDown = false;
        });
        
        canvas.addEventListener('mouseleave', () => {
            isMouseDown = false;
        });
    }
    
    /**
     * モバイル用ボタンコントロールの設定
     */
    setupMobileButtons() {
        const buttons = document.querySelectorAll('.control-btn');
        
        buttons.forEach(button => {
            // タッチイベント
            button.addEventListener('touchstart', (event) => {
                event.preventDefault();
                this.handleButtonPress(button.dataset.direction);
            }, { passive: false });
            
            // マウスイベント（デスクトップでのテスト用）
            button.addEventListener('mousedown', (event) => {
                event.preventDefault();
                this.handleButtonPress(button.dataset.direction);
            });
        });
    }
    
    /**
     * ボタン押下の処理
     */
    handleButtonPress(direction) {
        switch (direction) {
            case 'forward':
                this.game.movePlayer(0, -1);
                break;
            case 'backward':
                this.game.movePlayer(0, 1);
                break;
            case 'left':
                this.game.movePlayer(-1, 0);
                break;
            case 'right':
                this.game.movePlayer(1, 0);
                break;
        }
    }
    
    /**
     * タッチデバイスかどうかの判定
     */
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    /**
     * モバイルコントロールの表示/非表示
     */
    toggleMobileControls() {
        const mobileControls = document.getElementById('mobileControls');
        if (this.isTouchDevice()) {
            mobileControls.style.display = 'block';
        } else {
            mobileControls.style.display = 'none';
        }
    }
}