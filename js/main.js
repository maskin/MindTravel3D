// メイン制御・初期化システム
class Game {
    constructor() {
        this.gameEngine = null;
        this.controls = null;
        this.modalManager = null;
        this.isInitialized = false;
        this.updateInterval = null;
    }

    async init() {
        try {
            // DOM要素の確認
            const canvas = document.getElementById('gameCanvas');
            if (!canvas) {
                throw new Error('Canvas element not found');
            }

            // ゲームエンジンの初期化
            this.gameEngine = new GameEngine(canvas);
            window.gameEngine = this.gameEngine; // グローバルアクセス用

            // コントロールの初期化
            this.controls = new Controls(this.gameEngine);

            // モーダルマネージャーの初期化
            this.modalManager = new ModalManager();
            window.modalManager = this.modalManager; // グローバルアクセス用

            // UIの更新を開始
            this.startUIUpdate();

            // PWAの初期化
            this.initPWA();

            this.isInitialized = true;
            console.log('Game initialized successfully');

        } catch (error) {
            console.error('Game initialization failed:', error);
            this.showError('ゲームの初期化に失敗しました: ' + error.message);
        }
    }

    startUIUpdate() {
        // UIの定期更新
        this.updateInterval = setInterval(() => {
            if (this.gameEngine && this.modalManager) {
                const position = this.gameEngine.getPlayerPosition();
                const fps = this.gameEngine.getFPS();
                this.modalManager.updateUI(position, position.direction, fps);
            }
        }, 100); // 100ms間隔
    }

    showError(message) {
        // エラー表示
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #f44336, #d32f2f);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            font-size: 16px;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 80%;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        // 5秒後に削除
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    initPWA() {
        // Service Workerの登録
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then((registration) => {
                        console.log('SW registered: ', registration);
                    })
                    .catch((registrationError) => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }

        // PWAインストールプロンプト
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // インストールボタンを表示（将来の拡張用）
            console.log('PWA installation available');
        });

        // アプリインストール後
        window.addEventListener('appinstalled', (evt) => {
            console.log('PWA installed successfully');
            if (window.modalManager) {
                window.modalManager.showNotification('アプリがインストールされました！', 'success');
            }
        });
    }

    // パフォーマンス監視
    monitorPerformance() {
        if (this.gameEngine) {
            const fps = this.gameEngine.getFPS();
            
            // FPS低下時の自動最適化
            if (fps < 30) {
                console.warn('Low FPS detected:', fps);
                // 将来的にグラフィック設定を下げる等の最適化
            }
        }
    }

    // リソースのクリーンアップ
    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        if (this.gameEngine) {
            this.gameEngine.stop();
        }
    }

    // ゲームの状態を取得
    getGameState() {
        return {
            isInitialized: this.isInitialized,
            isRunning: this.gameEngine ? this.gameEngine.isRunning : false,
            playerPosition: this.gameEngine ? this.gameEngine.getPlayerPosition() : null,
            fps: this.gameEngine ? this.gameEngine.getFPS() : 0
        };
    }
}

// ページ読み込み完了時にゲームを初期化
document.addEventListener('DOMContentLoaded', async () => {
    // Loading表示（簡易版）
    console.log('Initializing 3D Maze Game...');
    
    // ゲームインスタンスの作成と初期化
    const game = new Game();
    window.game = game; // グローバルアクセス用
    
    await game.init();
    
    console.log('3D Maze Game ready!');
});

// ページ離脱時のクリーンアップ
window.addEventListener('beforeunload', () => {
    if (window.game) {
        window.game.cleanup();
    }
});

// エラーハンドリング
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.modalManager) {
        window.modalManager.showNotification('エラーが発生しました', 'error');
    }
});

// 未処理のPromise拒否をキャッチ
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.modalManager) {
        window.modalManager.showNotification('システムエラーが発生しました', 'error');
    }
});