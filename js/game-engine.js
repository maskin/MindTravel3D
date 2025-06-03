/**
 * 3D迷路ゲームエンジン
 * Three.jsを使用した3Dレンダリングとゲームロジック
 */
class GameEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.maze = null;
        this.mazeGenerator = null;
        this.player = {
            x: 1,
            y: 1,
            speed: 0.1,
            height: 1.8
        };
        
        // ゲーム状態
        this.gameState = 'loading'; // loading, playing, completed
        this.frameCount = 0;
        this.lastTime = 0;
        this.fps = 0;
        
        // 3Dオブジェクト
        this.walls = [];
        this.floor = null;
        this.ceiling = null;
        this.startMarker = null;
        this.goalMarker = null;
        
        // ライティング
        this.ambientLight = null;
        this.directionalLight = null;
        this.playerLight = null;
        
        this.init();
    }
    
    /**
     * ゲームエンジンの初期化
     */
    async init() {
        try {
            this.setupScene();
            this.setupLighting();
            this.generateMaze();
            this.setupPlayer();
            this.buildMaze3D();
            this.setupRenderer();
            this.startGameLoop();
            
            // ローディング画面を非表示
            document.getElementById('loadingScreen').style.display = 'none';
            this.gameState = 'playing';
            
            // ゲーム開始モーダル表示
            this.showModal('ゲーム開始！', 
                'arrow キーまたはタッチコントロールで移動してください。<br>赤いエリアがゴールです。');
                
        } catch (error) {
            console.error('ゲーム初期化エラー:', error);
            this.showModal('エラー', 'ゲームの初期化に失敗しました。ページを再読み込みしてください。');
        }
    }
    
    /**
     * Three.jsシーンの設定
     */
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // スカイブルー
        
        // カメラの設定
        this.camera = new THREE.PerspectiveCamera(
            75, // 視野角
            window.innerWidth / window.innerHeight, // アスペクト比
            0.1, // 近クリッピング面
            1000 // 遠クリッピング面
        );
    }
    
    /**
     * ライティングの設定
     */
    setupLighting() {
        // 環境光
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(this.ambientLight);
        
        // 太陽光（方向性ライト）
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        this.directionalLight.position.set(50, 50, 50);
        this.directionalLight.castShadow = true;
        this.scene.add(this.directionalLight);
        
        // プレイヤーライト（懐中電灯効果）
        this.playerLight = new THREE.SpotLight(0xffffff, 1, 10, Math.PI / 6, 0.3);
        this.playerLight.castShadow = true;
        this.scene.add(this.playerLight);
    }
    
    /**
     * 迷路の生成
     */
    generateMaze() {
        this.mazeGenerator = new MazeGenerator(50, 50);
        this.maze = this.mazeGenerator.generate();
        
        // プレイヤーをスタート地点に配置
        const start = this.mazeGenerator.getStartPosition();
        this.player.x = start.x;
        this.player.y = start.y;
    }
    
    /**
     * プレイヤーの設定
     */
    setupPlayer() {
        this.camera.position.set(
            this.player.x,
            this.player.height,
            this.player.y
        );
        
        // プレイヤーライトをカメラに追従させる
        this.playerLight.position.copy(this.camera.position);
        this.playerLight.target.position.set(
            this.camera.position.x,
            this.camera.position.y - 1,
            this.camera.position.z + 1
        );
    }
    
    /**
     * 3D迷路の構築
     */
    buildMaze3D() {
        // 壁の材質
        const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // 茶色
        const wallGeometry = new THREE.BoxGeometry(1, 3, 1);
        
        // 床の材質
        const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 }); // ライトグリーン
        const floorGeometry = new THREE.PlaneGeometry(50, 50);
        
        // 天井の材質
        const ceilingMaterial = new THREE.MeshLambertMaterial({ color: 0x87CEEB }); // スカイブルー
        const ceilingGeometry = new THREE.PlaneGeometry(50, 50);
        
        // スタートマーカーの材質
        const startMaterial = new THREE.MeshLambertMaterial({ color: 0x00FF00 }); // 緑
        const startGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.8);
        
        // ゴールマーカーの材質
        const goalMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 }); // 赤
        const goalGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.8);
        
        // 床を追加
        this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
        this.floor.rotation.x = -Math.PI / 2;
        this.floor.position.set(25, 0, 25);
        this.scene.add(this.floor);
        
        // 天井を追加
        this.ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        this.ceiling.rotation.x = Math.PI / 2;
        this.ceiling.position.set(25, 4, 25);
        this.scene.add(this.ceiling);
        
        // 迷路の壁を構築
        for (let y = 0; y < this.mazeGenerator.height; y++) {
            for (let x = 0; x < this.mazeGenerator.width; x++) {
                if (this.mazeGenerator.isWall(x, y)) {
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                    wall.position.set(x, 1.5, y);
                    wall.castShadow = true;
                    wall.receiveShadow = true;
                    this.walls.push(wall);
                    this.scene.add(wall);
                }
                
                // スタートマーカー
                if (this.maze[y][x] === 2) {
                    this.startMarker = new THREE.Mesh(startGeometry, startMaterial);
                    this.startMarker.position.set(x, 0.05, y);
                    this.scene.add(this.startMarker);
                }
                
                // ゴールマーカー
                if (this.maze[y][x] === 3) {
                    this.goalMarker = new THREE.Mesh(goalGeometry, goalMaterial);
                    this.goalMarker.position.set(x, 0.05, y);
                    this.scene.add(this.goalMarker);
                }
            }
        }
    }
    
    /**
     * レンダラーの設定
     */
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('gameCanvas'),
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // ウィンドウリサイズ対応
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    /**
     * プレイヤーの移動
     */
    movePlayer(dx, dy) {
        if (this.gameState !== 'playing') return;
        
        const newX = this.player.x + dx * this.player.speed;
        const newY = this.player.y + dy * this.player.speed;
        
        // 壁との衝突判定
        if (!this.mazeGenerator.isWall(Math.floor(newX), Math.floor(newY))) {
            this.player.x = newX;
            this.player.y = newY;
            
            // カメラ位置を更新
            this.camera.position.set(this.player.x, this.player.height, this.player.y);
            
            // プレイヤーライトを更新
            this.playerLight.position.copy(this.camera.position);
            this.playerLight.target.position.set(
                this.camera.position.x,
                this.camera.position.y - 1,
                this.camera.position.z + 1
            );
            
            // ゴール判定
            if (this.mazeGenerator.isGoal(Math.floor(this.player.x), Math.floor(this.player.y))) {
                this.gameState = 'completed';
                this.showModal('おめでとうございます！', 
                    'ゴールに到達しました！<br><button onclick="game.restart()">もう一度プレイ</button>');
            }
        }
    }
    
    /**
     * ゲームループの開始
     */
    startGameLoop() {
        const animate = (currentTime) => {
            requestAnimationFrame(animate);
            
            // FPS計算
            this.frameCount++;
            if (currentTime - this.lastTime >= 1000) {
                this.fps = this.frameCount;
                this.frameCount = 0;
                this.lastTime = currentTime;
                
                // UI更新
                this.updateUI();
            }
            
            // アニメーション（ゴールマーカーの回転など）
            if (this.goalMarker) {
                this.goalMarker.rotation.y += 0.02;
            }
            if (this.startMarker) {
                this.startMarker.rotation.y += 0.01;
            }
            
            // レンダリング
            this.renderer.render(this.scene, this.camera);
        };
        
        animate(0);
    }
    
    /**
     * UI情報の更新
     */
    updateUI() {
        document.getElementById('playerPosition').textContent = 
            `(${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`;
        document.getElementById('fps').textContent = this.fps;
    }
    
    /**
     * モーダル表示
     */
    showModal(title, content) {
        if (window.showModal) {
            window.showModal(title, content);
        }
    }
    
    /**
     * ゲーム再起動
     */
    restart() {
        // 既存のオブジェクトをクリア
        this.walls.forEach(wall => this.scene.remove(wall));
        this.walls = [];
        
        if (this.startMarker) this.scene.remove(this.startMarker);
        if (this.goalMarker) this.scene.remove(this.goalMarker);
        
        // 新しい迷路を生成
        this.generateMaze();
        this.setupPlayer();
        this.buildMaze3D();
        
        this.gameState = 'playing';
        
        if (window.closeModal) {
            window.closeModal();
        }
    }
}