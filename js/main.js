/**
 * メインゲーム初期化・制御
 */
class GameMain {
    constructor() {
        this.gameEngine = null;
        this.gameControls = null;
        this.gameModal = null;
        this.isLoading = true;
        
        this.init();
    }

    async init() {
        try {
            // ローディング表示
            this.showLoading(true);
            
            // Three.jsの読み込み確認
            if (typeof THREE === 'undefined') {
                throw new Error('Three.js が読み込まれていません');
            }
            
            // DOM要素の確認
            const canvas = document.getElementById('gameCanvas');
            if (!canvas) {
                throw new Error('Canvas要素が見つかりません');
            }
            
            // モーダル初期化
            this.gameModal = new GameModal();
            window.gameModal = this.gameModal;
            
            // ゲームエンジン初期化
            this.gameEngine = new GameEngine(canvas);
            window.gameEngine = this.gameEngine;
            
            // コントロール初期化
            this.gameControls = new GameControls(this.gameEngine);
            window.gameControls = this.gameControls;
            
            // 少し待ってからローディングを非表示
            await this.delay(1000);
            this.showLoading(false);
            
            // ウェルカムメッセージ
            await this.delay(500);
            this.gameModal.showWelcome();
            
            // PWA初期化
            this.initPWA();
            
            console.log('3D迷路ゲーム初期化完了');
            
        } catch (error) {
            console.error('ゲーム初期化エラー:', error);
            this.showError(error.message);
        }
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = show ? 'block' : 'none';
        }
        this.isLoading = show;
    }

    showError(message) {
        this.showLoading(false);
        
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff4444;
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 1000;
            text-align: center;
            max-width: 300px;
        `;
        errorDiv.innerHTML = `
            <h3>エラーが発生しました</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="
                background: white;
                color: #ff4444;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            ">リロード</button>
        `;
        
        document.body.appendChild(errorDiv);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    initPWA() {
        // Service Worker登録
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }

        // PWAインストールプロンプト
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // インストールボタンを表示（オプション）
            this.showInstallPrompt(deferredPrompt);
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA がインストールされました');
        });
    }

    showInstallPrompt(deferredPrompt) {
        // インストールプロンプトの表示（必要に応じて）
        if (this.gameModal && !localStorage.getItem('pwa-install-prompted')) {
            setTimeout(() => {
                const installMessage = `
このゲームをホーム画面に追加できます！

アプリのようにいつでも簡単にアクセスできるようになります。
                `.trim();
                
                // カスタムインストールボタンを追加
                const modalContent = document.querySelector('.modal-content');
                if (modalContent) {
                    const installBtn = document.createElement('button');
                    installBtn.className = 'modal-btn';
                    installBtn.textContent = 'ホーム画面に追加';
                    installBtn.onclick = () => {
                        if (deferredPrompt) {
                            deferredPrompt.prompt();
                            deferredPrompt.userChoice.then((choiceResult) => {
                                if (choiceResult.outcome === 'accepted') {
                                    console.log('ユーザーがPWAインストールを承認');
                                }
                                deferredPrompt = null;
                            });
                        }
                        this.gameModal.close();
                    };
                    
                    // 一度だけ表示
                    localStorage.setItem('pwa-install-prompted', 'true');
                }
            }, 3000);
        }
    }

    // ゲーム統計
    getGameStats() {
        return {
            mazeSize: this.gameEngine ? `${this.gameEngine.getMazeGenerator().getWidth()}x${this.gameEngine.getMazeGenerator().getHeight()}` : 'N/A',
            playerPosition: this.gameEngine ? this.gameEngine.getPlayerPosition() : { x: 0, z: 0 },
            fps: document.getElementById('fps').textContent,
            isGoalReached: this.gameEngine ? this.gameEngine.isGoalReached : false
        };
    }

    // パフォーマンス最適化
    optimizePerformance() {
        // モバイルデバイスでの最適化
        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            // モバイル最適化設定
            if (this.gameEngine && this.gameEngine.renderer) {
                this.gameEngine.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                
                // シャドウ品質を下げる
                this.gameEngine.renderer.shadowMap.type = THREE.BasicShadowMap;
            }
        }
    }

    // デバッグ情報
    getDebugInfo() {
        return {
            userAgent: navigator.userAgent,
            webGLSupport: !!window.WebGLRenderingContext,
            three: typeof THREE !== 'undefined' ? THREE.REVISION : 'Not loaded',
            gameEngine: !!this.gameEngine,
            gameControls: !!this.gameControls,
            gameModal: !!this.gameModal
        };
    }
}

// ページ読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', () => {
    window.gameMain = new GameMain();
});

// グローバルエラーハンドリング
window.addEventListener('error', (event) => {
    console.error('グローバルエラー:', event.error);
    if (window.gameMain) {
        window.gameMain.showError('予期しないエラーが発生しました');
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('未処理のPromise拒否:', event.reason);
    if (window.gameMain) {
        window.gameMain.showError('非同期処理でエラーが発生しました');
    }
});