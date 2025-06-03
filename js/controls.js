// 統合操作システム - PC・モバイル対応
class Controls {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.keys = {};
        this.isPointerLocked = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.init();
    }

    init() {
        // キーボードイベント
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));

        // マウスイベント
        document.addEventListener('click', () => this.requestPointerLock());
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());

        // タッチイベント
        document.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });

        // モバイルボタンイベント
        this.initMobileButtons();
    }

    onKeyDown(event) {
        this.keys[event.code] = true;

        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.gameEngine.movePlayer('forward');
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.gameEngine.movePlayer('backward');
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.gameEngine.rotatePlayer('left');
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.gameEngine.rotatePlayer('right');
                break;
            case 'KeyR':
                this.gameEngine.generateMaze();
                window.showNotification('新しい迷路を生成しました！');
                break;
            case 'Escape':
                window.showModal();
                break;
        }

        event.preventDefault();
    }

    onKeyUp(event) {
        this.keys[event.code] = false;
    }

    requestPointerLock() {
        if (!this.isPointerLocked) {
            document.body.requestPointerLock();
        }
    }

    onPointerLockChange() {
        this.isPointerLocked = document.pointerLockElement === document.body;
    }

    onMouseMove(event) {
        if (!this.isPointerLocked) return;

        const sensitivity = 0.002;
        const rotationThreshold = 50; // ピクセル

        if (Math.abs(event.movementX) > rotationThreshold) {
            if (event.movementX > 0) {
                this.gameEngine.rotatePlayer('right');
            } else {
                this.gameEngine.rotatePlayer('left');
            }
        }
    }

    onTouchStart(event) {
        event.preventDefault();
        if (event.touches.length === 1) {
            this.touchStartX = event.touches[0].clientX;
            this.touchStartY = event.touches[0].clientY;
        }
    }

    onTouchMove(event) {
        event.preventDefault();
    }

    onTouchEnd(event) {
        event.preventDefault();
        if (event.changedTouches.length === 1) {
            const touchEndX = event.changedTouches[0].clientX;
            const touchEndY = event.changedTouches[0].clientY;
            
            const deltaX = touchEndX - this.touchStartX;
            const deltaY = touchEndY - this.touchStartY;
            const threshold = 50;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 横スワイプ - 回転
                if (Math.abs(deltaX) > threshold) {
                    if (deltaX > 0) {
                        this.gameEngine.rotatePlayer('right');
                    } else {
                        this.gameEngine.rotatePlayer('left');
                    }
                }
            } else {
                // 縦スワイプ - 移動
                if (Math.abs(deltaY) > threshold) {
                    if (deltaY < 0) {
                        this.gameEngine.movePlayer('forward');
                    } else {
                        this.gameEngine.movePlayer('backward');
                    }
                }
            }
        }
    }

    initMobileButtons() {
        const forwardBtn = document.getElementById('forwardBtn');
        const backBtn = document.getElementById('backBtn');
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');

        if (forwardBtn) {
            forwardBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.gameEngine.movePlayer('forward');
            });
        }

        if (backBtn) {
            backBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.gameEngine.movePlayer('backward');
            });
        }

        if (leftBtn) {
            leftBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.gameEngine.rotatePlayer('left');
            });
        }

        if (rightBtn) {
            rightBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.gameEngine.rotatePlayer('right');
            });
        }
    }

    // デバッグ用: 現在押されているキーを取得
    getActiveKeys() {
        return Object.keys(this.keys).filter(key => this.keys[key]);
    }

    // タッチデバイスかどうかを判定
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    // ポインターロック状態を取得
    getPointerLockState() {
        return this.isPointerLocked;
    }
}