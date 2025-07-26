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
        console.log('ゲーム管理システム初期化開始...');
        
        try {
            // エラーハンドリング設定
            this.setupErrorHandling();
            
            // UIマネージャー初期化
            this.uiManager = new UIManager();
            window.uiManager = this.uiManager;
            
            // 3Dエンジン初期化
            this.gameEngine = new GameEngine();
            const engineInit = await this.gameEngine.init();
            
            if (!engineInit) {
                throw new Error('3Dエンジンの初期化に失敗しました');
            }
            
            // 迷路生成器初期化
            this.mazeGenerator = new MazeGenerator(50, 50);
            
            // 操作システム初期化
            this.controls = new Controls(this.gameEngine);
            
            // PWA設定
            this.initPWA();
            
            // アニメーション開始
            this.gameEngine.animate();
            
            this.isInitialized = true;
            console.log('ゲーム管理システム初期化完了');
            
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
            console.log(`Start position from maze generator: (${startPos.x}, ${startPos.y})`);
            console.log(`Is start position a wall? ${this.mazeGenerator.isWall(startPos.x, startPos.y)}`);
            console.log(`Maze cell [1][1]: ${this.mazeGenerator.maze[1][1]}, [1][0]: ${this.mazeGenerator.maze[1][0]}, [0][1]: ${this.mazeGenerator.maze[0][1]}`);
            
            this.gameEngine.setPlayerPosition(startPos.x + 0.5, startPos.y + 0.5);
            this.gameEngine.setPlayerRotation(0);
            
            // ゲーム状態設定
            this.gameEngine.isGameStarted = true;
            this.gameEngine.gameWon = false;
            
            // UI更新
            this.uiManager.hideStartMenu();
            this.uiManager.closeModal();
            
            console.log('ゲーム開始完了');
            
        } catch (error) {
            console.error('ゲーム開始エラー:', error);
            this.uiManager.showError('ゲームの開始に失敗しました:\n' + error.message);
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
            navigator.serviceWorker.register('/sw.js')
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

// ゲーム初期化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM読み込み完了 - ゲーム初期化開始...');
    
    // グローバルゲームマネージャー作成
    window.gameManager = new GameManager();
    
    // 初期化実行
    await window.gameManager.init();
});

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