// モーダル・UI管理システム
class ModalManager {
    constructor() {
        this.modal = document.getElementById('modal');
        this.notification = document.getElementById('notification');
        this.init();
    }

    init() {
        // ボタンイベントの設定
        const startGameBtn = document.getElementById('startGame');
        const newMazeBtn = document.getElementById('newMaze');
        const settingsBtn = document.getElementById('settings');

        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => this.startGame());
        }

        if (newMazeBtn) {
            newMazeBtn.addEventListener('click', () => this.newMaze());
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }

        // モーダル外クリックで閉じる
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });

        // ESCキーでモーダルを閉じる
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && !this.modal.classList.contains('hidden')) {
                this.hideModal();
            }
        });
    }

    startGame() {
        this.hideModal();
        if (window.gameEngine) {
            window.gameEngine.start();
            this.showNotification('ゲーム開始！', 'info');
        }
    }

    newMaze() {
        this.hideModal();
        if (window.gameEngine) {
            window.gameEngine.generateMaze();
            this.showNotification('新しい迷路を生成しました！', 'info');
        }
    }

    showSettings() {
        // 設定画面の表示（将来の拡張用）
        this.showNotification('設定機能は将来の実装予定です', 'info');
    }

    showModal() {
        this.modal.classList.remove('hidden');
        // ゲームを一時停止
        if (window.gameEngine) {
            window.gameEngine.stop();
        }
    }

    hideModal() {
        this.modal.classList.add('hidden');
        // ゲームを再開
        if (window.gameEngine && window.gameEngine.maze) {
            window.gameEngine.start();
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        if (!this.notification) return;

        this.notification.textContent = message;
        this.notification.className = 'show';

        // 通知タイプに応じてスタイルを変更
        switch (type) {
            case 'success':
                this.notification.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
                break;
            case 'error':
                this.notification.style.background = 'linear-gradient(45deg, #f44336, #d32f2f)';
                break;
            case 'warning':
                this.notification.style.background = 'linear-gradient(45deg, #FF9800, #F57C00)';
                break;
            default:
                this.notification.style.background = 'linear-gradient(45deg, #2196F3, #1976D2)';
        }

        // 指定時間後に非表示
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, duration);
    }

    // UIの更新
    updateUI(position, direction, fps) {
        const positionElement = document.getElementById('position');
        const directionElement = document.getElementById('direction');
        const fpsElement = document.getElementById('fps');

        if (positionElement) {
            positionElement.textContent = `(${position.x}, ${position.y})`;
        }

        if (directionElement) {
            directionElement.textContent = direction;
        }

        if (fpsElement) {
            fpsElement.textContent = fps;
        }
    }

    // モーダルの表示状態を取得
    isModalVisible() {
        return !this.modal.classList.contains('hidden');
    }

    // 通知の表示状態を取得
    isNotificationVisible() {
        return this.notification.classList.contains('show');
    }
}

// グローバル関数として通知とモーダル表示を公開
window.showNotification = function(message, type, duration) {
    if (window.modalManager) {
        window.modalManager.showNotification(message, type, duration);
    }
};

window.showModal = function() {
    if (window.modalManager) {
        window.modalManager.showModal();
    }
};

window.hideModal = function() {
    if (window.modalManager) {
        window.modalManager.hideModal();
    }
};