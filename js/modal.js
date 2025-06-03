class Modal {
    constructor() {
        this.modal = document.getElementById('modal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalBody = document.getElementById('modalBody');
        this.isVisible = false;
        
        this.init();
    }

    init() {
        // Close modal when clicking outside
        this.modal.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.hide();
            }
        });
        
        // Handle escape key
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    show(title = '3D迷路ゲーム', content = '', callback = null) {
        this.modalTitle.textContent = title;
        
        if (content) {
            this.modalBody.innerHTML = `<p style="margin: 20px 0; text-align: center;">${content}</p>`;
        } else {
            // Show help content by default
            this.showHelpContent();
        }
        
        // Add action buttons
        this.addActionButtons(callback);
        
        this.modal.style.display = 'flex';
        this.isVisible = true;
    }

    showHelpContent() {
        this.modalBody.innerHTML = `
            <div id="helpText">
                <h3>操作方法</h3>
                <p><strong>PC:</strong></p>
                <ul style="text-align: left; margin-left: 20px;">
                    <li>↑/W: 前進</li>
                    <li>↓/S: 後退</li>
                    <li>←/A: 左に90度回転</li>
                    <li>→/D: 右に90度回転</li>
                    <li>マウス: 視点操作（クリックでポインターロック）</li>
                    <li>R: 新しい迷路生成</li>
                    <li>Esc: メニュー</li>
                </ul>
                <p><strong>モバイル:</strong></p>
                <ul style="text-align: left; margin-left: 20px;">
                    <li>画面下部のボタンで移動・回転</li>
                    <li>画面をスワイプして移動・回転</li>
                    <li>縦スワイプ: 前進・後退</li>
                    <li>横スワイプ: 左右回転</li>
                </ul>
                <p><strong>目標:</strong></p>
                <p style="text-align: center; margin: 15px 0;">
                    スタート地点から回転する<span style="color: #ff0000;">赤いゴール</span>を目指そう！
                </p>
                <p style="text-align: center; margin: 15px 0; font-size: 14px; color: #cccccc;">
                    迷路は50×50の大きさで自動生成されます。
                </p>
            </div>
        `;
    }

    addActionButtons(callback = null) {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.textAlign = 'center';
        buttonContainer.style.marginTop = '20px';
        
        // Game start/resume button
        const resumeBtn = document.createElement('button');
        resumeBtn.className = 'btn';
        resumeBtn.textContent = this.isVisible ? 'ゲーム再開' : 'ゲームスタート';
        resumeBtn.onclick = () => this.hide();
        buttonContainer.appendChild(resumeBtn);
        
        // New maze button
        const newMazeBtn = document.createElement('button');
        newMazeBtn.className = 'btn';
        newMazeBtn.textContent = '新しい迷路';
        newMazeBtn.onclick = () => {
            if (callback) {
                callback();
            } else {
                gameEngine.regenerateMaze();
            }
            this.hide();
        };
        buttonContainer.appendChild(newMazeBtn);
        
        // Settings button (placeholder for future)
        const settingsBtn = document.createElement('button');
        settingsBtn.className = 'btn';
        settingsBtn.textContent = '設定';
        settingsBtn.style.backgroundColor = '#95a5a6';
        settingsBtn.onclick = () => this.showSettings();
        buttonContainer.appendChild(settingsBtn);
        
        this.modalBody.appendChild(buttonContainer);
    }

    showSettings() {
        this.modalTitle.textContent = '設定';
        this.modalBody.innerHTML = `
            <div style="text-align: left;">
                <h3>ゲーム設定</h3>
                <p><strong>現在のバージョン:</strong> 1.0.0</p>
                <p><strong>迷路サイズ:</strong> 50×50</p>
                <p><strong>レンダラー:</strong> Three.js WebGL</p>
                <p><strong>プラットフォーム:</strong> ${this.detectPlatform()}</p>
                
                <h3 style="margin-top: 20px;">ゲーム情報</h3>
                <p>このゲームはPWA（Progressive Web App）として設計されており、オフラインでも動作します。</p>
                <p>モバイルデバイスでは「ホーム画面に追加」でアプリのようにインストールできます。</p>
                
                <h3 style="margin-top: 20px;">今後の拡張予定</h3>
                <ul style="margin-left: 20px;">
                    <li>RPG要素の追加</li>
                    <li>アイテムシステム</li>
                    <li>マルチプレイヤー機能</li>
                    <li>より多様な迷路タイプ</li>
                </ul>
            </div>
        `;
        
        const backBtn = document.createElement('button');
        backBtn.className = 'btn';
        backBtn.textContent = '戻る';
        backBtn.style.marginTop = '20px';
        backBtn.onclick = () => this.show();
        this.modalBody.appendChild(backBtn);
    }

    detectPlatform() {
        const userAgent = navigator.userAgent;
        if (/Android/i.test(userAgent)) return 'Android';
        if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
        if (/Windows/i.test(userAgent)) return 'Windows';
        if (/Mac/i.test(userAgent)) return 'macOS';
        if (/Linux/i.test(userAgent)) return 'Linux';
        return 'Unknown';
    }

    hide() {
        this.modal.style.display = 'none';
        this.isVisible = false;
    }

    showNotification(message, type = 'info') {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#3498db'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    showGoalDialog(callback) {
        this.show(
            'ゴール到達！',
            '素晴らしい！迷路をクリアしました。新しい迷路に挑戦しますか？',
            callback
        );
    }
}