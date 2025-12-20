// 3D迷路ゲーム - メイン制御システム
if (typeof window.GameManager === 'undefined') {
class GameManager {
    constructor() {
        this.gameEngine = null;
        this.mazeGenerator = null;
        this.controls = null;
        this.uiManager = null;
        this.isInitialized = false;
    }
    
    async init() {
        console.log('🎮 ゲーム管理システム初期化開始...');
        console.log('Environment check:', {
            window: typeof window,
            document: typeof document,
            THREE: typeof THREE,
            GameEngine: typeof GameEngine,
            MazeGenerator: typeof MazeGenerator,
            Controls: typeof Controls,
            UIManager: typeof UIManager
        });
        
        try {
            // Step 1: エラーハンドリング設定
            console.log('📋 初期化 Step 1: エラーハンドリング設定...');
            this.setupErrorHandling();
            console.log('✅ Step 1 完了: エラーハンドリング設定済み');
            
            // Step 2: UIマネージャー初期化
            console.log('📋 初期化 Step 2: UIManager初期化...');
            this.uiManager = new UIManager();
            window.uiManager = this.uiManager;
            console.log('✅ Step 2 完了: UIManager初期化済み');
            
            // Step 3: 3Dエンジン初期化
            console.log('📋 初期化 Step 3: GameEngine初期化...');
            this.gameEngine = new GameEngine();
            console.log('GameEngine object created, calling init...');
            
            const engineInit = await this.gameEngine.init();
            console.log('GameEngine init result:', engineInit);
            
            if (!engineInit) {
                console.warn('⚠️ GameEngine初期化失敗、再試行します...');
                // Wait a bit and try again
                await new Promise(resolve => setTimeout(resolve, 1000));
                const retryInit = await this.gameEngine.init();
                console.log('GameEngine retry init result:', retryInit);
                
                if (!retryInit) {
                    throw new Error('3Dエンジンの初期化に失敗しました (再試行後も失敗)');
                }
            }
            console.log('✅ Step 3 完了: GameEngine初期化済み');
            
            // Step 4: 迷路生成器初期化
            console.log('📋 初期化 Step 4: MazeGenerator初期化...');
            this.mazeGenerator = new MazeGenerator(50, 50);
            console.log('✅ Step 4 完了: MazeGenerator初期化済み');
            
            // Step 5: 操作システム初期化
            console.log('📋 初期化 Step 5: Controls初期化...');
            this.controls = new Controls(this.gameEngine);
            console.log('✅ Step 5 完了: Controls初期化済み');
            
            // Step 6: PWA設定
            console.log('📋 初期化 Step 6: PWA設定...');
            this.initPWA();
            console.log('✅ Step 6 完了: PWA設定済み');
            
            // Step 7: アニメーション開始
            console.log('📋 初期化 Step 7: アニメーション開始...');
            console.log('🚀 GameEngine.animate()関数存在確認:', typeof this.gameEngine.animate);
            console.log('🚀 GameEngine.animate()関数呼び出し直前');
            this.gameEngine.animate();
            console.log('🚀 GameEngine.animate()関数呼び出し完了');
            console.log('✅ Step 7 完了: アニメーション開始済み');
            
            // 初期化完了フラグ設定
            this.isInitialized = true;
            console.log('🎉 ゲーム管理システム初期化完了！');
            
            // Step 8: スタートメニュー表示
            console.log('📋 初期化 Step 8: スタートメニュー表示...');
            this.uiManager.showStartMenu();
            console.log('✅ Step 8 完了: スタートメニュー表示済み');
            
            console.log('🎮 すべての初期化プロセス完了 - ゲーム準備完了！');
            
        } catch (error) {
            console.error('❌ 初期化エラー - 詳細情報:', {
                error: error,
                message: error.message,
                stack: error.stack,
                engineState: this.gameEngine ? 'created' : 'null',
                uiManagerState: this.uiManager ? 'created' : 'null'
            });
            
            // 緊急時用の部分初期化を試行
            console.log('🚨 緊急時用の部分初期化を試行...');
            try {
                await this.emergencyInit();
            } catch (emergencyError) {
                console.error('❌ 緊急初期化も失敗:', emergencyError);
                
                // Make sure we have UIManager before showing error
                if (this.uiManager) {
                    this.uiManager.showError('ゲームの初期化に失敗しました:\n' + error.message + '\n\n緊急モードも利用できません。');
                } else {
                    // Fallback error display
                    alert('ゲームの初期化に失敗しました:\n' + error.message);
                }
            }
        }
    }
    
    async emergencyInit() {
        console.log('🚨 緊急初期化モード開始...');
        
        // 最低限のUIManager確保
        if (!this.uiManager) {
            console.log('🔧 UIManager緊急作成...');
            this.uiManager = new UIManager();
            window.uiManager = this.uiManager;
        }
        
        // 最低限のゲームエンジン確保
        if (!this.gameEngine || !this.gameEngine.renderer) {
            console.log('🔧 簡易ゲームエンジン作成試行...');
            try {
                this.gameEngine = new GameEngine();
                // 簡易初期化を試行
                const simpleInit = await this.gameEngine.simpleInit();
                if (!simpleInit) {
                    throw new Error('簡易初期化失敗');
                }
            } catch (e) {
                console.warn('⚠️ 3Dエンジン初期化失敗、2Dフォールバックモード');
                this.gameEngine = null;
            }
        }
        
        // 基本的なコンポーネント
        if (!this.mazeGenerator) {
            this.mazeGenerator = new MazeGenerator(25, 25); // より小さなサイズ
        }
        
        // 部分的に初期化完了
        this.isInitialized = true;
        console.log('🆘 緊急初期化完了 - 制限付きモード');
        
        // エラーメッセージと再試行オプション表示
        this.uiManager.showError('初期化で問題が発生しましたが、制限付きモードで動作します。\n\nページを再読み込みして完全初期化を再試行することをお勧めします。', {
            showReload: true,
            showContinue: true
        });
    }
    
    setupErrorHandling() {
        // グローバルエラーハンドリング
        window.addEventListener('error', (event) => {
            console.error('JavaScript エラー:', event.error);
            if (this.uiManager) {
                this.uiManager.showError('エラーが発生しました:\n' + event.error.message);
            }
        });
        
        // Promise のエラーハンドリング
        window.addEventListener('unhandledrejection', (event) => {
            console.error('未処理のPromiseエラー:', event.reason);
            if (this.uiManager) {
                this.uiManager.showError('処理エラーが発生しました:\n' + event.reason);
            }
        });
    }
    
    async startGame() {
        if (!this.isInitialized) {
            console.log('ゲームが初期化されていません - 再初期化を試行...');
            // Try to re-initialize
            try {
                await this.init();
                if (!this.isInitialized) {
                    this.uiManager.showError('ゲームが初期化されていません。ページを再読み込みしてください。');
                    return;
                }
            } catch (error) {
                console.error('再初期化失敗:', error);
                this.uiManager.showError('ゲームの初期化に失敗しました:\n' + error.message);
                return;
            }
        }
        
        try {
            console.log('ゲーム開始...');
            
            // ローディング表示
            this.uiManager.showLoading('迷路生成中...');
            
            // 少し待ってから迷路生成（UIの更新のため）
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // 迷路生成
            const mazeData = this.mazeGenerator.generateMaze();
            this.gameEngine.maze = this.mazeGenerator;
            
            // 3D迷路作成
            await this.gameEngine.createMaze(mazeData);
            
            // プレイヤー位置設定 (center player in maze cell)
            const startPos = this.mazeGenerator.getStartPosition();
            this.gameEngine.setPlayerPosition(startPos.x + 0.5, startPos.y + 0.5);
            
            // 初期方向を南向きに設定（180度 = 南向き、通路がある方向）
            this.gameEngine.setPlayerRotation(Math.PI); // 180度 = 南向き
            console.log('🎯 プレイヤー初期方向を南向き(180度)に設定');
            
            // ゲーム状態設定
            this.gameEngine.isGameStarted = true;
            this.gameEngine.gameWon = false;
            
            // UI更新
            this.uiManager.hideStartMenu();
            this.uiManager.closeModal();
            
            console.log('ゲーム開始完了');
            
        } catch (error) {
            console.error('ゲーム開始エラー:', error);
            console.error('エラー詳細:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            
            // エラーが発生してもゲームを続行可能にする
            // 3D迷路が作成されていれば、ゲームは開始可能
            if (this.gameEngine && this.gameEngine.scene && this.gameEngine.scene.children.length > 5) {
                console.log('⚠️ エラーはあったが3D迷路は作成済み - ゲームを続行');
                this.gameEngine.isGameStarted = true;
                this.gameEngine.gameWon = false;
                this.uiManager.hideStartMenu();
                this.uiManager.closeModal();
            } else {
                this.uiManager.showError('ゲームの開始に失敗しました:\n' + error.message);
            }
        }
    }
    
    async generateNewMaze() {
        if (!this.isInitialized || !this.gameEngine.isGameStarted) return;
        
        try {
            console.log('新しい迷路生成...');
            
            // ローディング表示
            this.uiManager.showLoading('新しい迷路生成中...');
            
            // 少し待つ
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // 新しい迷路生成
            const mazeData = this.mazeGenerator.generateMaze();
            
            // 3D迷路再作成
            await this.gameEngine.createMaze(mazeData);
            
            // プレイヤーをスタート位置にリセット (center player in maze cell)
            const startPos = this.mazeGenerator.getStartPosition();
            this.gameEngine.setPlayerPosition(startPos.x + 0.5, startPos.y + 0.5);
            this.gameEngine.setPlayerRotation(0);
            this.gameEngine.gameWon = false;
            
            // ローディング終了
            this.uiManager.closeModal();
            
            console.log('新しい迷路生成完了');
            
        } catch (error) {
            console.error('迷路生成エラー:', error);
            this.uiManager.showError('迷路の生成に失敗しました:\n' + error.message);
        }
    }
    
    initPWA() {
        // Service Worker登録
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('Service Worker 登録成功:', registration);
                })
                .catch(error => {
                    console.log('Service Worker 登録失敗:', error);
                });
        }
        
        // インストールプロンプト
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // インストールボタンを表示する場合はここで実装
            console.log('PWA インストール可能');
        });
        
        // インストール完了
        window.addEventListener('appinstalled', (evt) => {
            console.log('PWA インストール完了');
        });
    }
}

// グローバルに公開
window.GameManager = GameManager;
}

// ゲーム初期化は index.html の動的スクリプトローダーで行われます

// ウィンドウリサイズ処理
window.addEventListener('resize', () => {
    if (window.gameManager && window.gameManager.gameEngine) {
        window.gameManager.gameEngine.handleResize();
    }
});

// デバッグ用
window.debugInfo = () => {
    if (window.gameManager && window.gameManager.gameEngine) {
        const engine = window.gameManager.gameEngine;
        console.log('プレイヤー位置:', engine.playerPosition);
        console.log('プレイヤー回転:', engine.playerRotation);
        console.log('ゲーム状態:', {
            isGameStarted: engine.isGameStarted,
            gameWon: engine.gameWon
        });
    }
};