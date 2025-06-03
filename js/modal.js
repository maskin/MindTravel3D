/**
 * モーダルウィンドウシステム
 * ゲーム内でテキストや画像を表示するためのモーダル管理
 */

/**
 * モーダルを表示
 * @param {string} title - モーダルのタイトル
 * @param {string} content - モーダルのコンテンツ（HTML可）
 * @param {Object} options - オプション設定
 */
function showModal(title, content, options = {}) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    
    modalTitle.textContent = title;
    modalContent.innerHTML = content;
    
    // オプション設定の適用
    if (options.width) {
        modal.style.width = options.width;
    }
    if (options.height) {
        modal.style.height = options.height;
    }
    if (options.backgroundColor) {
        modal.style.backgroundColor = options.backgroundColor;
    }
    if (options.textColor) {
        modal.style.color = options.textColor;
    }
    
    modal.style.display = 'block';
    
    // オートクローズ設定
    if (options.autoClose) {
        setTimeout(() => {
            closeModal();
        }, options.autoClose);
    }
    
    // モーダル外クリックで閉じる設定
    if (options.closeOnClickOutside !== false) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });
    }
    
    // ESCキーで閉じる設定
    if (options.closeOnEscape !== false) {
        const escapeHandler = (event) => {
            if (event.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }
}

/**
 * モーダルを閉じる
 */
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
    
    // スタイルをリセット
    modal.style.width = '';
    modal.style.height = '';
    modal.style.backgroundColor = '';
    modal.style.color = '';
}

/**
 * ユーザー情報モーダルを表示
 * @param {string} username - ユーザー名
 * @param {string} avatarUrl - アバター画像のURL（オプション）
 * @param {Object} userInfo - その他のユーザー情報
 */
function showUserModal(username, avatarUrl = null, userInfo = {}) {
    let content = `<h3>ユーザー情報</h3>`;
    
    if (avatarUrl) {
        content += `<img src="${avatarUrl}" alt="アバター" style="width: 80px; height: 80px; border-radius: 50%; margin: 10px;">`;
    }
    
    content += `<p><strong>ユーザー名:</strong> ${username}</p>`;
    
    if (userInfo.level) {
        content += `<p><strong>レベル:</strong> ${userInfo.level}</p>`;
    }
    
    if (userInfo.score) {
        content += `<p><strong>スコア:</strong> ${userInfo.score}</p>`;
    }
    
    if (userInfo.completedMazes) {
        content += `<p><strong>クリア回数:</strong> ${userInfo.completedMazes}</p>`;
    }
    
    if (userInfo.bestTime) {
        content += `<p><strong>最短時間:</strong> ${userInfo.bestTime}秒</p>`;
    }
    
    showModal('プロフィール', content, {
        width: '300px',
        backgroundColor: 'rgba(0, 50, 100, 0.95)',
        textColor: 'white'
    });
}

/**
 * アイテム情報モーダルを表示
 * @param {string} itemName - アイテム名
 * @param {string} itemImage - アイテム画像のURL
 * @param {string} description - アイテムの説明
 * @param {Object} options - 追加オプション
 */
function showItemModal(itemName, itemImage, description, options = {}) {
    let content = `<h3>${itemName}</h3>`;
    
    if (itemImage) {
        content += `<img src="${itemImage}" alt="${itemName}" style="max-width: 150px; max-height: 150px; margin: 10px;">`;
    }
    
    content += `<p>${description}</p>`;
    
    if (options.actions) {
        content += '<div style="margin-top: 20px;">';
        options.actions.forEach(action => {
            content += `<button onclick="${action.callback}" style="margin: 5px; padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">${action.label}</button>`;
        });
        content += '</div>';
    }
    
    showModal('アイテム', content, {
        width: '350px',
        backgroundColor: 'rgba(50, 0, 50, 0.95)',
        textColor: 'white'
    });
}

/**
 * ゲームメッセージモーダルを表示
 * @param {string} message - メッセージ内容
 * @param {string} type - メッセージタイプ ('success', 'error', 'warning', 'info')
 * @param {number} duration - 自動閉じる時間（ミリ秒）
 */
function showGameMessage(message, type = 'info', duration = 3000) {
    const colors = {
        success: { bg: 'rgba(0, 100, 0, 0.9)', color: 'white' },
        error: { bg: 'rgba(100, 0, 0, 0.9)', color: 'white' },
        warning: { bg: 'rgba(100, 100, 0, 0.9)', color: 'black' },
        info: { bg: 'rgba(0, 0, 100, 0.9)', color: 'white' }
    };
    
    const colorScheme = colors[type] || colors.info;
    
    showModal('', message, {
        width: '250px',
        backgroundColor: colorScheme.bg,
        textColor: colorScheme.color,
        autoClose: duration,
        closeOnClickOutside: true,
        closeOnEscape: true
    });
}

/**
 * 設定モーダルを表示
 */
function showSettingsModal() {
    const content = `
        <h3>ゲーム設定</h3>
        <div style="text-align: left; margin: 20px 0;">
            <label style="display: block; margin: 10px 0;">
                <input type="checkbox" id="soundEnabled" checked> 音響効果
            </label>
            <label style="display: block; margin: 10px 0;">
                <input type="checkbox" id="vibrationEnabled" checked> 振動フィードバック
            </label>
            <label style="display: block; margin: 10px 0;">
                <input type="range" id="brightnessSlider" min="0.3" max="1.0" step="0.1" value="1.0">
                明度: <span id="brightnessValue">100%</span>
            </label>
            <label style="display: block; margin: 10px 0;">
                移動速度:
                <select id="speedSelect">
                    <option value="0.05">遅い</option>
                    <option value="0.1" selected>普通</option>
                    <option value="0.15">速い</option>
                </select>
            </label>
        </div>
        <div style="margin-top: 20px;">
            <button onclick="applySettings()" style="margin: 5px; padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">適用</button>
            <button onclick="closeModal()" style="margin: 5px; padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">キャンセル</button>
        </div>
    `;
    
    showModal('設定', content, {
        width: '300px',
        closeOnClickOutside: false,
        closeOnEscape: false
    });
    
    // 明度スライダーのイベント設定
    const brightnessSlider = document.getElementById('brightnessSlider');
    const brightnessValue = document.getElementById('brightnessValue');
    
    brightnessSlider.addEventListener('input', (e) => {
        const value = Math.round(e.target.value * 100);
        brightnessValue.textContent = value + '%';
    });
}

/**
 * 設定を適用
 */
function applySettings() {
    const soundEnabled = document.getElementById('soundEnabled').checked;
    const vibrationEnabled = document.getElementById('vibrationEnabled').checked;
    const brightness = document.getElementById('brightnessSlider').value;
    const speed = document.getElementById('speedSelect').value;
    
    // ゲーム設定を適用
    if (window.game) {
        window.game.player.speed = parseFloat(speed);
        
        // 明度設定
        if (window.game.renderer) {
            window.game.renderer.toneMappingExposure = parseFloat(brightness);
        }
    }
    
    // 設定をローカルストレージに保存
    localStorage.setItem('gameSettings', JSON.stringify({
        soundEnabled,
        vibrationEnabled,
        brightness,
        speed
    }));
    
    showGameMessage('設定が保存されました', 'success', 2000);
    closeModal();
}

/**
 * 保存された設定を読み込み
 */
function loadSettings() {
    const saved = localStorage.getItem('gameSettings');
    if (saved) {
        try {
            const settings = JSON.parse(saved);
            
            // ゲームに設定を適用
            if (window.game && settings.speed) {
                window.game.player.speed = parseFloat(settings.speed);
            }
            
            return settings;
        } catch (error) {
            console.error('設定の読み込みに失敗:', error);
        }
    }
    
    return null;
}

/**
 * ヘルプモーダルを表示
 */
function showHelpModal() {
    const content = `
        <h3>ゲームの遊び方</h3>
        <div style="text-align: left; margin: 20px 0; line-height: 1.6;">
            <p><strong>目的:</strong> 迷路のスタート地点（緑）からゴール地点（赤）まで移動してください。</p>
            
            <p><strong>操作方法:</strong></p>
            <ul>
                <li>矢印キー または WASD キーで移動</li>
                <li>モバイル: 画面をスワイプまたはコントロールボタンをタップ</li>
                <li>R キー: ゲームリスタート</li>
                <li>Escape キー: モーダルを閉じる</li>
            </ul>
            
            <p><strong>ヒント:</strong></p>
            <ul>
                <li>壁にぶつかると進めません</li>
                <li>迷路は毎回ランダムに生成されます</li>
                <li>ライトが進行方向を照らします</li>
            </ul>
        </div>
    `;
    
    showModal('ヘルプ', content, {
        width: '400px',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        textColor: 'white'
    });
}

// ページ読み込み時に設定を復元
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
});