// Global game objects
let gameEngine;
let controls;
let modal;

// Game state management
const game = {
    isInitialized: false,
    fps: 0,
    frameCount: 0,
    lastTime: 0,
    
    init() {
        try {
            // Initialize game systems
            gameEngine = new GameEngine();
            controls = new Controls(gameEngine);
            modal = new Modal();
            
            // Setup UI updates
            this.setupUI();
            this.setupPerformanceMonitoring();
            this.setupErrorHandling();
            this.setupResizeHandler();
            
            this.isInitialized = true;
            
            // Show welcome modal
            this.showModal();
            
            console.log('3D迷路ゲーム初期化完了');
            
        } catch (error) {
            console.error('ゲーム初期化エラー:', error);
            this.showError('ゲームの初期化に失敗しました。ページを再読み込みしてください。');
        }
    },
    
    setupUI() {
        // Update position and direction display
        setInterval(() => {
            if (gameEngine && gameEngine.player) {
                document.getElementById('position').textContent = 
                    `(${gameEngine.player.x}, ${gameEngine.player.y})`;
                document.getElementById('direction').textContent = 
                    gameEngine.getDirectionName();
                document.getElementById('fps').textContent = this.fps;
            }
        }, 100);
    },
    
    setupPerformanceMonitoring() {
        // FPS monitoring
        const monitorFPS = (currentTime) => {
            this.frameCount++;
            
            if (currentTime - this.lastTime >= 1000) {
                this.fps = Math.round(this.frameCount * 1000 / (currentTime - this.lastTime));
                this.frameCount = 0;
                this.lastTime = currentTime;
                
                // Performance optimization
                if (this.fps < 30 && gameEngine && gameEngine.renderer) {
                    // Reduce quality if performance is poor
                    gameEngine.renderer.setPixelRatio(1);
                    if (gameEngine.scene.fog) {
                        gameEngine.scene.fog.far = Math.min(gameEngine.scene.fog.far, 15);
                    }
                }
            }
            
            requestAnimationFrame(monitorFPS);
        };
        
        requestAnimationFrame(monitorFPS);
    },
    
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('ゲームエラー:', event.error);
            this.showError('ゲーム実行中にエラーが発生しました。');
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('未処理のPromiseエラー:', event.reason);
            this.showError('システムエラーが発生しました。');
        });
    },
    
    setupResizeHandler() {
        window.addEventListener('resize', () => {
            if (gameEngine && gameEngine.onWindowResize) {
                gameEngine.onWindowResize();
            }
        });
    },
    
    showModal(title, content, callback) {
        if (modal) {
            modal.show(title, content, callback);
        }
    },
    
    hideModal() {
        if (modal) {
            modal.hide();
        }
    },
    
    showError(message) {
        if (modal) {
            modal.showNotification(message, 'error');
        } else {
            alert(message);
        }
    },
    
    showSuccess(message) {
        if (modal) {
            modal.showNotification(message, 'success');
        }
    },
    
    generateNewMaze() {
        if (gameEngine) {
            gameEngine.regenerateMaze();
            this.showSuccess('新しい迷路を生成しました！');
        }
    },
    
    // Utility methods
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    isFullscreen() {
        return !!(document.fullscreenElement || 
                 document.mozFullScreenElement || 
                 document.webkitFullscreenElement || 
                 document.msFullscreenElement);
    },
    
    toggleFullscreen() {
        if (!this.isFullscreen()) {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    },
    
    // Save/Load game state (for future RPG elements)
    saveGameState() {
        const gameState = {
            playerPosition: { x: gameEngine.player.x, y: gameEngine.player.y },
            playerDirection: gameEngine.player.direction,
            mazeCompleted: false,
            timestamp: Date.now()
        };
        
        localStorage.setItem('3dmaze_gamestate', JSON.stringify(gameState));
    },
    
    loadGameState() {
        const saved = localStorage.getItem('3dmaze_gamestate');
        if (saved) {
            try {
                const gameState = JSON.parse(saved);
                return gameState;
            } catch (error) {
                console.warn('保存データの読み込みに失敗:', error);
            }
        }
        return null;
    }
};

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('3D迷路ゲーム開始');
    game.init();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Game paused
        console.log('ゲーム一時停止');
    } else {
        // Game resumed
        console.log('ゲーム再開');
    }
});

// PWA install prompt handling
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    
    // Show install notification
    game.showSuccess('このゲームをホーム画面に追加できます！');
});

window.addEventListener('appinstalled', () => {
    console.log('PWAインストール完了');
    game.showSuccess('ゲームがインストールされました！');
    deferredPrompt = null;
});

// Export for debugging
if (typeof window !== 'undefined') {
    window.game = game;
}