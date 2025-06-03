let currentModalAction = null;

function showModal(title, message, actionText = null, actionCallback = null) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalText = document.getElementById('modalText');
    const modalActionButton = document.getElementById('modalAction');
    
    modalTitle.textContent = title;
    modalText.textContent = message;
    
    if (actionText && actionCallback) {
        modalActionButton.textContent = actionText;
        modalActionButton.style.display = 'inline-block';
        currentModalAction = actionCallback;
    } else {
        modalActionButton.style.display = 'none';
        currentModalAction = null;
    }
    
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
    currentModalAction = null;
}

function modalAction() {
    if (currentModalAction) {
        currentModalAction();
    }
    closeModal();
}

// Menu button handler
document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.getElementById('menuButton');
    if (menuButton) {
        menuButton.addEventListener('click', () => {
            showModal(
                'ゲームメニュー',
                'このゲームについて:\n\n' +
                '・矢印キーまたはWASDで移動\n' +
                '・タッチ/マウスドラッグでも移動可能\n' +
                '・緑の玉（プレイヤー）を赤の円（ゴール）まで導いてください\n' +
                '・Rキーで新しい迷路を生成\n' +
                '・Escキーでこのメニューを表示',
                '新しいゲーム',
                () => {
                    if (window.gameEngine) {
                        window.gameEngine.resetGame();
                    }
                }
            );
        });
    }
});