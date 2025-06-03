let gameEngine = null;
let controls = null;

// Error handling
window.addEventListener('error', (event) => {
    console.error('Game Error:', event.error);
    showErrorMessage('ゲームエラーが発生しました。ページを再読み込みしてください。');
});

// Unhandled promise rejection
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    showErrorMessage('読み込みエラーが発生しました。ページを再読み込みしてください。');
});

function showErrorMessage(message) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.innerHTML = `
            <div style="color: #ff4444; text-align: center;">
                <h2>エラー</h2>
                <p>${message}</p>
                <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    再読み込み
                </button>
            </div>
        `;
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

function initGame() {
    try {
        // Check for Three.js
        if (typeof THREE === 'undefined') {
            throw new Error('Three.js が読み込まれていません。');
        }
        
        // Check for required classes
        if (typeof MazeGenerator === 'undefined') {
            throw new Error('MazeGenerator クラスが読み込まれていません。');
        }
        
        if (typeof GameEngine === 'undefined') {
            throw new Error('GameEngine クラスが読み込まれていません。');
        }
        
        if (typeof Controls === 'undefined') {
            throw new Error('Controls クラスが読み込まれていません。');
        }
        
        // Initialize game
        gameEngine = new GameEngine();
        controls = new Controls(gameEngine);
        
        // Make gameEngine globally accessible for modal actions
        window.gameEngine = gameEngine;
        
        // Hide loading screen after a short delay
        setTimeout(hideLoading, 1000);
        
        console.log('Game initialized successfully');
        
    } catch (error) {
        console.error('Game initialization failed:', error);
        showErrorMessage(`初期化エラー: ${error.message}`);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for all scripts to load
    setTimeout(initGame, 100);
});

// Performance monitoring
let performanceWarningShown = false;

function checkPerformance() {
    if (gameEngine && !performanceWarningShown) {
        if (gameEngine.fps < 30) {
            performanceWarningShown = true;
            console.warn('Low FPS detected. Performance may be affected.');
            
            // Optionally show user notification
            // showModal('Performance Warning', 'Low frame rate detected. Consider closing other applications for better performance.');
        }
    }
}

// Check performance every 10 seconds
setInterval(checkPerformance, 10000);

// Handle visibility change (tab switching)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Game is hidden, pause or reduce performance
        console.log('Game paused (tab hidden)');
    } else {
        // Game is visible again
        console.log('Game resumed (tab visible)');
    }
});