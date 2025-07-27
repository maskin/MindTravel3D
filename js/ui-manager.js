// 3D迷路ゲーム - UI管理システム
class UIManager {
    constructor() {
        this.startMenu = null;
        this.gameModal = null;
        this.gameInfo = null;
        
        this.init();
    }
    
    init() {
        console.log('UI管理システム初期化...');
        
        // DOM要素の取得
        this.startMenu = document.getElementById('startMenu');
        this.gameModal = document.getElementById('gameModal');
        this.gameInfo = document.getElementById('gameInfo');
        
        // UI要素の存在確認
        if (!this.startMenu || !this.gameModal || !this.gameInfo) {
            console.error('必要なUI要素が見つかりません');
            return;
        }
        
        console.log('UI管理システム初期化完了');
    }
    
    showStartMenu() {
        if (this.startMenu) {
            this.startMenu.style.display = 'flex';
        }
    }
    
    hideStartMenu() {
        if (this.startMenu) {
            this.startMenu.style.display = 'none';
        }
    }
    
    toggleMenu() {
        if (!this.startMenu) return;
        
        if (this.startMenu.style.display === 'none') {
            this.showStartMenu();
        } else {
            this.hideStartMenu();
        }
    }
    
    showModal(title, message) {
        if (!this.gameModal) return;
        
        const modalTitle = document.getElementById('modalTitle');
        const modalText = document.getElementById('modalText');
        
        if (modalTitle) modalTitle.textContent = title;
        if (modalText) modalText.textContent = message;
        
        this.gameModal.style.display = 'flex';
    }
    
    closeModal() {
        if (this.gameModal) {
            this.gameModal.style.display = 'none';
        }
    }
    
    updateGameInfo(info) {
        if (!this.gameInfo) return;
        
        const positionElement = document.getElementById('position');
        const directionElement = document.getElementById('direction');
        const fpsElement = document.getElementById('fps');
        
        if (positionElement && info.position) {
            positionElement.textContent = info.position;
        }
        
        if (directionElement && info.direction) {
            directionElement.textContent = info.direction;
        }
        
        if (fpsElement && info.fps !== undefined) {
            fpsElement.textContent = info.fps;
        }
    }
    
    showControls() {
        const title = window.languageManager ? window.languageManager.getText('controlsTitle') : '操作方法';
        const message = window.languageManager ? window.languageManager.getText('controlsText') : 
            'PC操作:\n' +
            '↑/W: 前進\n' +
            '↓/S: 後退\n' +
            '←/A: 左に90度回転\n' +
            '→/D: 右に90度回転\n' +
            'マウス: 視点操作\n' +
            'R: 新しい迷路生成\n' +
            'Esc: メニュー\n\n' +
            'モバイル操作:\n' +
            '画面下部のボタンまたは\n' +
            'タッチスワイプで操作';
        
        this.showModal(title, message);
    }
    
    showError(message) {
        const title = window.languageManager ? window.languageManager.getText('error') : 'エラー';
        this.showModal(title, message);
    }
    
    showLoading(message) {
        const title = window.languageManager ? window.languageManager.getText('loading') : '読み込み中';
        const defaultMessage = window.languageManager ? window.languageManager.getText('processing') : '処理中です...';
        this.showModal(title, message || defaultMessage);
    }
}

// グローバル関数
function startGame() {
    if (window.gameManager) {
        window.gameManager.startGame();
    } else {
        console.error('gameManager が見つかりません');
    }
}

function showControls() {
    if (window.uiManager) {
        window.uiManager.showControls();
    }
}

function closeModal() {
    if (window.uiManager) {
        window.uiManager.closeModal();
    }
}

// グローバルに公開
window.UIManager = UIManager;