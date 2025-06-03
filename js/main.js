/**
 * メインアプリケーション
 * ゲームの初期化と全体的な制御
 */

// グローバル変数
let game = null;
let controls = null;

/**
 * アプリケーションの初期化
 */
function initApp() {
    try {
        // ゲームエンジンの初期化
        game = new GameEngine();
        
        // コントロールシステムの初期化
        controls = new GameControls(game);
        
        // 保存された設定の読み込み
        loadGameSettings();
        
        // UI イベントの設定
        setupUIEvents();
        
        // パフォーマンス監視の開始
        startPerformanceMonitoring();
        
        console.log('3D迷路ゲームが正常に初期化されました');
        
    } catch (error) {
        console.error('ゲーム初期化エラー:', error);
        showModal('エラー', 'ゲームの初期化に失敗しました。ページを再読み込みしてください。');
    }
}

/**
 * 保存されたゲーム設定の読み込み
 */
function loadGameSettings() {
    const settings = loadSettings();
    if (settings && game) {
        // 移動速度の適用
        if (settings.speed) {
            game.player.speed = parseFloat(settings.speed);
        }
        
        // 明度設定の適用
        if (settings.brightness && game.renderer) {
            game.renderer.toneMappingExposure = parseFloat(settings.brightness);
        }
    }
}

/**
 * UIイベントの設定
 */
function setupUIEvents() {
    // ゲーム情報エリアのクリックイベント
    const gameInfo = document.getElementById('gameInfo');
    gameInfo.addEventListener('click', () => {
        showHelpModal();
    });
    
    // ダブルタップでの設定表示（モバイル対応）
    let tapCount = 0;
    gameInfo.addEventListener('touchend', () => {
        tapCount++;
        setTimeout(() => {
            if (tapCount === 2) {
                showSettingsModal();
            }
            tapCount = 0;
        }, 300);
    });
    
    // キーボードショートカット
    document.addEventListener('keydown', (event) => {
        switch (event.code) {
            case 'KeyH':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    showHelpModal();
                }
                break;
            case 'KeyS':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    showSettingsModal();
                }
                break;
            case 'F1':
                event.preventDefault();
                showHelpModal();
                break;
        }
    });
}

/**
 * パフォーマンス監視の開始
 */
function startPerformanceMonitoring() {
    let frameCount = 0;
    let lastTime = performance.now();
    
    function monitor() {
        frameCount++;
        const currentTime = performance.now();
        
        // 1秒ごとにパフォーマンスチェック
        if (currentTime - lastTime >= 1000) {
            const fps = frameCount;
            frameCount = 0;
            lastTime = currentTime;
            
            // FPSが低い場合の警告
            if (fps < 30) {
                console.warn(`低FPS検出: ${fps}fps`);
                
                // パフォーマンス改善の提案
                if (fps < 20) {
                    showGameMessage('パフォーマンスが低下しています。他のアプリを閉じてください。', 'warning', 5000);
                }
            }
            
            // メモリ使用量のチェック（対応ブラウザのみ）
            if (performance.memory) {
                const memUsed = performance.memory.usedJSHeapSize / 1048576; // MB
                if (memUsed > 100) {
                    console.warn(`高メモリ使用: ${memUsed.toFixed(1)}MB`);
                }
            }
        }
        
        requestAnimationFrame(monitor);
    }
    
    monitor();
}

/**
 * ゲーム統計の取得
 */
function getGameStats() {
    if (!game) return null;
    
    return {
        playerPosition: { x: game.player.x, y: game.player.y },
        gameState: game.gameState,
        mazeSize: game.mazeGenerator ? { 
            width: game.mazeGenerator.width, 
            height: game.mazeGenerator.height 
        } : null,
        startPosition: game.mazeGenerator ? game.mazeGenerator.getStartPosition() : null,
        goalPosition: game.mazeGenerator ? game.mazeGenerator.getGoalPosition() : null,
        frameRate: game.fps || 0
    };
}

/**
 * ゲームの状態をリセット
 */
function resetGame() {
    if (game) {
        game.restart();
        showGameMessage('ゲームをリセットしました', 'info', 2000);
    }
}

/**
 * フルスクリーンの切り替え
 */
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error('フルスクリーン表示に失敗:', err);
            showGameMessage('フルスクリーン表示に失敗しました', 'error', 3000);
        });
    } else {
        document.exitFullscreen();
    }
}

/**
 * デバイス方向の変更検知
 */
function handleOrientationChange() {
    // 画面の向きが変わった場合のレイアウト調整
    setTimeout(() => {
        if (game && game.renderer) {
            game.camera.aspect = window.innerWidth / window.innerHeight;
            game.camera.updateProjectionMatrix();
            game.renderer.setSize(window.innerWidth, window.innerHeight);
        }
        
        // モバイルコントロールの表示調整
        if (controls) {
            controls.toggleMobileControls();
        }
    }, 100);
}

/**
 * エラーハンドリング
 */
function handleError(error, context = '') {
    console.error('ゲームエラー:', error);
    
    const errorMessage = context ? 
        `${context}でエラーが発生しました: ${error.message}` : 
        `エラーが発生しました: ${error.message}`;
    
    showModal('エラー', errorMessage + '<br><br>ページを再読み込みしてください。');
}

/**
 * パフォーマンス最適化
 */
function optimizePerformance() {
    if (!game) return;
    
    // レンダラーの品質を調整
    const canvas = game.renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    
    // 解像度の動的調整
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    game.renderer.setPixelRatio(pixelRatio);
    
    // シャドウの品質調整
    if (game.fps < 30) {
        game.renderer.shadowMap.enabled = false;
        console.log('パフォーマンス向上のためシャドウを無効化');
    }
}

// イベントリスナーの設定
window.addEventListener('load', initApp);
window.addEventListener('orientationchange', handleOrientationChange);
window.addEventListener('resize', handleOrientationChange);

// エラーハンドリング
window.addEventListener('error', (event) => {
    handleError(event.error, 'グローバル');
});

window.addEventListener('unhandledrejection', (event) => {
    handleError(event.reason, 'Promise');
});

// ページの可視性変更時の処理
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // ページが非表示になった時の処理
        console.log('ゲーム一時停止');
    } else {
        // ページが再表示された時の処理
        console.log('ゲーム再開');
        if (game && game.renderer) {
            // キャンバスサイズの再調整
            game.camera.aspect = window.innerWidth / window.innerHeight;
            game.camera.updateProjectionMatrix();
            game.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
});

// デバッグ用のグローバル関数
if (typeof window !== 'undefined') {
    window.game = game;
    window.getGameStats = getGameStats;
    window.resetGame = resetGame;
    window.toggleFullscreen = toggleFullscreen;
    window.optimizePerformance = optimizePerformance;
}