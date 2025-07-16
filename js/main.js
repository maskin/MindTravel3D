// 3D迷路ゲーム - メイン制御システム
class GameManager {
    constructor() {
        this.gameEngine = null;
        this.mazeGenerator = null;
        this.controls = null;
        this.uiManager = null;
        this.isInitialized = false;
    }
    
    async init() {        
        try {
            // エラーハンドリング設定
            this.setupErrorHandling();
            
            // UIマネージャー初期化
            this.uiManager = new UIManager();
            
            // 3Dエンジン初期化
            this.gameEngine = new GameEngine();
            const engineInit = await this.gameEngine.init();
            
            if (!engineInit) {
                throw new Error('3Dエンジンの初期化に失敗しました');
            }
            
            // 迷路生成器初期化
            this.mazeGenerator = new MazeGenerator(50, 50);
            
            // 操作システム初期化
            this.controls = new Controls(this.gameEngine, this, this.uiManager);
            
            // PWA設定
            this.initPWA();
            
            // アニメーション開始
            this.gameEngine.animate();
            
            this.isInitialized = true;
            
            // スタートメニュー表示
            this.uiManager.showStartMenu();
            
        } catch (error) {
            console.error('初期化エラー:', error);
            this.uiManager.showError('ゲームの初期化に失敗しました:\n' + error.message);
        }
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
            this.uiManager.showError('ゲームが初期化されていません');
            return;
        }
        
        try {
            // ローディング表示
            this.uiManager.showLoading('迷路生成中...');
            
            // 少し待ってから迷路生成（UIの更新のため）
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // 迷路生成
            const mazeData = this.mazeGenerator.generateMaze();
            this.gameEngine.maze = this.mazeGenerator;
            
            // 3D迷路作成
            await this.gameEngine.createMaze(mazeData);
            
            // プレイヤー位置設定
            const startPos = this.mazeGenerator.getStartPosition();
            this.gameEngine.setPlayerPosition(startPos.x, startPos.y);
            this.gameEngine.setPlayerRotation(0);
            
            // ゲーム状態設定
            this.gameEngine.isGameStarted = true;
            this.gameEngine.newGame();
            
            // UI更新
            this.uiManager.hideStartMenu();
            this.uiManager.closeModal();
            
        } catch (error) {
            console.error('ゲーム開始エラー:', error);
            this.uiManager.showError('ゲームの開始に失敗しました:\n' + error.message);
        }
    }
    
    async generateNewMaze() {
        if (!this.isInitialized || !this.gameEngine.isGameStarted) return;
        
        try {
            // ローディング表示
            this.uiManager.showLoading('新しい迷路生成中...');
            
            // 少し待つ
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // 新しい迷路生成
            const mazeData = this.mazeGenerator.generateMaze();
            
            // 3D迷路再作成
            await this.gameEngine.createMaze(mazeData);
            
            // プレイヤーをスタート位置にリセット
            const startPos = this.mazeGenerator.getStartPosition();
            this.gameEngine.setPlayerPosition(startPos.x, startPos.y);
            this.gameEngine.setPlayerRotation(0);
            this.gameEngine.newGame();
            
            // ローディング終了
            this.uiManager.closeModal();
            
        } catch (error) {
            console.error('迷路生成エラー:', error);
            this.uiManager.showError('迷路の生成に失敗しました:\n' + error.message);
        }
    }
    
    initPWA() {
        // Service Worker登録
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    // Service Worker registration successful
                })
                .catch(error => {
                    console.error('Service Worker 登録失敗:', error);
                });
        }
        
        // インストールプロンプト
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // インストールボタンを表示する場合はここで実装
        });
        
        // インストール完了
        window.addEventListener('appinstalled', (evt) => {
            // PWA installed
        });
    }
}

// ゲーム初期化
document.addEventListener('DOMContentLoaded', async () => {
    // グローバルゲームマネージャー作成
    const gameManager = new GameManager();
    
    // 初期化実行
    await gameManager.init();
    
    // グローバル関数定義
    window.startGame = function() {
        gameManager.startGame();
    };
    
    window.generateNewMaze = function() {
        gameManager.generateNewMaze();
    };
    
    window.showControls = function() {
        if (gameManager.uiManager) {
            gameManager.uiManager.showControls();
        }
    };
    
    window.closeModal = function() {
        if (gameManager.uiManager) {
            gameManager.uiManager.closeModal();
        }
    };
});

// デバッグ用
window.debugInfo = () => {
    // Debug function can be accessed through developer console if needed
};