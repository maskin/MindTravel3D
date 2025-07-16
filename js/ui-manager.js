// 3D迷路ゲーム - UI管理システム
class UIManager {
    constructor() {
        this.startMenu = null;
        this.gameModal = null;
        this.gameInfo = null;
        
        this.init();
    }
    
    init() {
        // DOM要素の取得
        this.startMenu = document.getElementById('startMenu');
        this.gameModal = document.getElementById('gameModal');
        this.gameInfo = document.getElementById('gameInfo');
        
        // UI要素の存在確認
        if (!this.startMenu || !this.gameModal || !this.gameInfo) {
            console.error('必要なUI要素が見つかりません');
            return;
        }
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
        this.showModal(
            '操作方法',
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
            'タッチスワイプで操作'
        );
    }
    
    showError(message) {
        this.showModal('エラー', message);
    }
    
    showLoading(message) {
        this.showModal('読み込み中', message || '処理中です...');
    }
}

// グローバルに公開
window.UIManager = UIManager;