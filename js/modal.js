/**
 * モーダルウィンドウ管理
 */
class GameModal {
    constructor() {
        this.modal = document.getElementById('modal');
        this.title = document.getElementById('modal-title');
        this.text = document.getElementById('modal-text');
        this.isVisible = false;
        
        this.init();
    }

    init() {
        // モーダル外をクリックして閉じる
        this.modal.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.close();
            }
        });

        // ESCキーで閉じる
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Escape' && this.isVisible) {
                this.close();
            }
        });
    }

    show(title, message) {
        this.title.textContent = title;
        this.text.textContent = message;
        this.modal.style.display = 'flex';
        this.isVisible = true;
        
        // アニメーション
        this.modal.style.opacity = '0';
        requestAnimationFrame(() => {
            this.modal.style.transition = 'opacity 0.3s ease';
            this.modal.style.opacity = '1';
        });
    }

    close() {
        this.modal.style.transition = 'opacity 0.3s ease';
        this.modal.style.opacity = '0';
        
        setTimeout(() => {
            this.modal.style.display = 'none';
            this.isVisible = false;
        }, 300);
    }

    showWelcome() {
        const welcomeMessage = `
3D迷路ゲームへようこそ！

目標: 緑の光から赤い円柱（ゴール）まで進んでください。

操作方法:
${window.gameControls ? window.gameControls.getControlsHelp().join('\n') : '矢印キーで移動'}

頑張って！
        `.trim();
        
        this.show('3D迷路ゲーム', welcomeMessage);
    }

    showGoal() {
        this.show('ゴール到達！', 'おめでとうございます！迷路をクリアしました！\n\n新しい迷路に挑戦しますか？');
    }

    showHelp() {
        const helpMessage = `
操作方法:
${window.gameControls ? window.gameControls.getControlsHelp().join('\n') : ''}

ヒント:
• 壁は灰色、通路は暗い色です
• 赤い光がゴールの方向を示しています
• 迷子になったらRキーで新しい迷路を生成できます
        `.trim();
        
        this.show('ヘルプ', helpMessage);
    }

    showSettings() {
        this.show('設定', '設定機能は今後追加予定です。');
    }

    showAbout() {
        this.show('ゲームについて', `
3D迷路ゲーム v1.0

Recursive Backtrackingアルゴリズムで生成された50x50の迷路を探索するゲームです。

技術:
• Three.js (3Dレンダリング)
• Progressive Web App (PWA)
• レスポンシブデザイン

開発: Claude Code
        `.trim());
    }
}

// グローバルエクスポート
window.GameModal = GameModal;