// 言語管理システム - Language Manager System
class LanguageManager {
    constructor() {
        this.currentLanguage = this.getStoredLanguage() || 'ja';
        this.translations = {
            ja: {
                // UI Elements
                gameTitle: '3D迷路ゲーム',
                gameStart: 'ゲームスタート',
                newMaze: '新しい迷路',
                controls: '操作方法',
                
                // Game Info
                position: '位置',
                direction: '方向',
                fps: 'FPS',
                maze: '迷路',
                
                // Directions
                north: '北',
                east: '東',
                south: '南',
                west: '西',
                
                // Modal Messages
                notification: '通知',
                message: 'メッセージ',
                ok: 'OK',
                error: 'エラー',
                loading: '読み込み中',
                processing: '処理中です...',
                
                // Goal Messages
                goalReached: 'ゴール到達！',
                congratulations: 'おめでとうございます！\n迷路をクリアしました！\n\nRキーで新しい迷路に挑戦できます。',
                
                // Controls Instructions
                controlsTitle: '操作方法',
                controlsText: 'PC操作:\n' +
                    '↑/W: 前進\n' +
                    '↓/S: 後退\n' +
                    '←/A: 左に90度回転\n' +
                    '→/D: 右に90度回転\n' +
                    'マウス: 視点操作\n' +
                    'R: 新しい迷路生成\n' +
                    'Esc: メニュー\n\n' +
                    'モバイル操作:\n' +
                    '画面下部のボタンまたは\n' +
                    'タッチスワイプで操作',
                
                // Menu Instructions
                controlsInstructions: '操作方法:',
                pcControls: 'PC:',
                forwardBack: '↑/W: 前進 | ↓/S: 後退',
                leftRight: '←/A: 左に90度回転 | →/D: 右に90度回転',
                mouse: 'マウス: 視点操作（クリックでポインターロック）',
                keys: 'R: 新しい迷路生成 | Esc: メニュー',
                mobileControls: 'モバイル:',
                mobileButtons: '画面下部のボタンで移動・回転',
                mobileSwipe: '画面をスワイプして移動・回転',
                goal: '目標:',
                goalDescription: 'スタート地点から回転する',
                redGoal: '赤いゴール',
                goalText: 'を目指そう！',
                mazeInfo: '迷路は50×50の大きさで自動生成されます。',
                
                // Language
                language: '言語',
                japanese: '日本語',
                english: 'English'
            },
            en: {
                // UI Elements
                gameTitle: '3D Maze Game',
                gameStart: 'Start Game',
                newMaze: 'New Maze',
                controls: 'Controls',
                
                // Game Info
                position: 'Position',
                direction: 'Direction',
                fps: 'FPS',
                maze: 'Maze',
                
                // Directions
                north: 'North',
                east: 'East',
                south: 'South',
                west: 'West',
                
                // Modal Messages
                notification: 'Notification',
                message: 'Message',
                ok: 'OK',
                error: 'Error',
                loading: 'Loading',
                processing: 'Processing...',
                
                // Goal Messages
                goalReached: 'Goal Reached!',
                congratulations: 'Congratulations!\nYou cleared the maze!\n\nPress R key to challenge a new maze.',
                
                // Controls Instructions
                controlsTitle: 'Controls',
                controlsText: 'PC Controls:\n' +
                    '↑/W: Move Forward\n' +
                    '↓/S: Move Backward\n' +
                    '←/A: Turn Left 90°\n' +
                    '→/D: Turn Right 90°\n' +
                    'Mouse: Look Around\n' +
                    'R: Generate New Maze\n' +
                    'Esc: Menu\n\n' +
                    'Mobile Controls:\n' +
                    'Use buttons at bottom or\n' +
                    'touch swipe to control',
                
                // Menu Instructions
                controlsInstructions: 'Controls:',
                pcControls: 'PC:',
                forwardBack: '↑/W: Forward | ↓/S: Backward',
                leftRight: '←/A: Turn Left 90° | →/D: Turn Right 90°',
                mouse: 'Mouse: Look Around (Click for Pointer Lock)',
                keys: 'R: Generate New Maze | Esc: Menu',
                mobileControls: 'Mobile:',
                mobileButtons: 'Use buttons at bottom for movement & rotation',
                mobileSwipe: 'Swipe on screen for movement & rotation',
                goal: 'Goal:',
                goalDescription: 'Find the rotating',
                redGoal: 'red goal',
                goalText: 'from the start!',
                mazeInfo: 'Maze is 50×50 and auto-generated.',
                
                // Language
                language: 'Language',
                japanese: '日本語',
                english: 'English'
            }
        };
    }
    
    getStoredLanguage() {
        try {
            return localStorage.getItem('maze-game-language');
        } catch (e) {
            return null;
        }
    }
    
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            try {
                localStorage.setItem('maze-game-language', lang);
            } catch (e) {
                console.warn('言語設定の保存に失敗しました');
            }
            this.updateAllText();
        }
    }
    
    getText(key) {
        return this.translations[this.currentLanguage][key] || key;
    }
    
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    updateAllText() {
        console.log(`言語を${this.currentLanguage}に変更中...`);
        
        // Update HTML elements
        this.updateElement('menuTitle', this.getText('gameTitle'));
        this.updateElement('startButton', this.getText('gameStart'));
        this.updateElement('newMazeButton', this.getText('newMaze'));
        this.updateElement('controlsButton', this.getText('controls'));
        
        // Update game info labels
        this.updateGameInfoLabels();
        
        // Update controls instructions
        this.updateControlsInstructions();
        
        // Update modal
        this.updateElement('modalTitle', this.getText('notification'));
        this.updateElement('modalOkButton', this.getText('ok'));
        
        console.log(`言語変更完了: ${this.currentLanguage}`);
    }
    
    updateElement(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }
    
    updateGameInfoLabels() {
        // Update position label
        const positionLabel = document.querySelector('#gameInfo div:nth-child(1)');
        if (positionLabel) {
            const positionValue = document.getElementById('position');
            const currentValue = positionValue ? positionValue.textContent : '-';
            positionLabel.innerHTML = `${this.getText('position')}: <span id="position">${currentValue}</span>`;
        }
        
        // Update direction label
        const directionLabel = document.querySelector('#gameInfo div:nth-child(2)');
        if (directionLabel) {
            const directionValue = document.getElementById('direction');
            const currentValue = directionValue ? directionValue.textContent : '-';
            const translatedDirection = this.translateDirection(currentValue);
            directionLabel.innerHTML = `${this.getText('direction')}: <span id="direction">${translatedDirection}</span>`;
        }
        
        // Update FPS label
        const fpsLabel = document.querySelector('#gameInfo div:nth-child(3)');
        if (fpsLabel) {
            const fpsValue = document.getElementById('fps');
            const currentValue = fpsValue ? fpsValue.textContent : '-';
            fpsLabel.innerHTML = `${this.getText('fps')}: <span id="fps">${currentValue}</span>`;
        }
        
        // Update maze label
        const mazeLabel = document.querySelector('#gameInfo div:nth-child(4)');
        if (mazeLabel) {
            const mazeValue = document.getElementById('mazeSize');
            const currentValue = mazeValue ? mazeValue.textContent : '50×50';
            mazeLabel.innerHTML = `${this.getText('maze')}: <span id="mazeSize">${currentValue}</span>`;
        }
    }
    
    updateControlsInstructions() {
        const controlsInfo = document.querySelector('.controls-info');
        if (controlsInfo) {
            controlsInfo.innerHTML = `
                <strong>${this.getText('controlsInstructions')}</strong><br>
                ${this.getText('pcControls')}<br>
                ${this.getText('forwardBack')}<br>
                ${this.getText('leftRight')}<br>
                ${this.getText('mouse')}<br>
                ${this.getText('keys')}<br><br>
                ${this.getText('mobileControls')}<br>
                ${this.getText('mobileButtons')}<br>
                ${this.getText('mobileSwipe')}<br><br>
                ${this.getText('goal')}<br>
                ${this.getText('goalDescription')}<span style="color: #ff4444;">${this.getText('redGoal')}</span>${this.getText('goalText')}<br>
                ${this.getText('mazeInfo')}
            `;
        }
    }
    
    translateDirection(direction) {
        const directionMap = {
            '北': this.getText('north'),
            '東': this.getText('east'),
            '南': this.getText('south'),
            '西': this.getText('west'),
            'North': this.getText('north'),
            'East': this.getText('east'),
            'South': this.getText('south'),
            'West': this.getText('west')
        };
        return directionMap[direction] || direction;
    }
    
    getDirectionByLanguage(directionKey) {
        return this.getText(directionKey);
    }
}

// グローバルに公開
window.LanguageManager = LanguageManager;