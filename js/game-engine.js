/**
 * 3D迷路ゲームエンジン
 */
class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.maze = null;
        this.mazeGenerator = null;
        this.walls = [];
        this.goal = null;
        this.lights = [];
        
        // ゲーム状態
        this.playerPosition = { x: 1, z: 1 };
        this.isGoalReached = false;
        
        // パフォーマンス監視
        this.lastTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        
        this.init();
    }

    init() {
        this.initThreeJS();
        this.generateMaze();
        this.setupLighting();
        this.createPlayer();
        this.animate();
    }

    initThreeJS() {
        // シーン作成
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        this.scene.fog = new THREE.Fog(0x000011, 10, 30);

        // カメラ作成（第一人称視点）
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(1, 1.5, 1); // プレイヤーの目の高さ

        // レンダラー作成
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // リサイズ対応
        window.addEventListener('resize', () => this.onWindowResize());
    }

    generateMaze() {
        // 既存の迷路を削除
        this.clearMaze();
        
        // 新しい迷路を生成
        this.mazeGenerator = new MazeGenerator(50, 50);
        this.maze = this.mazeGenerator.generate();
        
        // 3D迷路を構築
        this.buildMaze3D();
        
        // プレイヤー位置をスタート地点に設定
        const start = this.mazeGenerator.getStartPosition();
        this.playerPosition = { x: start.x, z: start.y };
        this.updatePlayerPosition();
        
        // ゴールをリセット
        this.isGoalReached = false;
    }

    clearMaze() {
        // 既存の壁を削除
        this.walls.forEach(wall => {
            this.scene.remove(wall);
            if (wall.geometry) wall.geometry.dispose();
            if (wall.material) wall.material.dispose();
        });
        this.walls = [];
        
        // ゴールを削除
        if (this.goal) {
            this.scene.remove(this.goal);
            if (this.goal.geometry) this.goal.geometry.dispose();
            if (this.goal.material) this.goal.material.dispose();
            this.goal = null;
        }
    }

    buildMaze3D() {
        const wallHeight = 3;
        const wallSize = 1;
        
        // 壁のマテリアル
        const wallMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x666666,
            transparent: true,
            opacity: 0.9
        });
        
        // 床のマテリアル
        const floorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x222222
        });
        
        // 床を作成
        const floorGeometry = new THREE.PlaneGeometry(this.mazeGenerator.getWidth(), this.mazeGenerator.getHeight());
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(
            this.mazeGenerator.getWidth() / 2 - 0.5, 
            -0.5, 
            this.mazeGenerator.getHeight() / 2 - 0.5
        );
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // 壁を生成
        const wallGeometry = new THREE.BoxGeometry(wallSize, wallHeight, wallSize);
        
        for (let y = 0; y < this.mazeGenerator.getHeight(); y++) {
            for (let x = 0; x < this.mazeGenerator.getWidth(); x++) {
                if (this.maze[y][x] === 1) { // 壁
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                    wall.position.set(x, wallHeight / 2, y);
                    wall.castShadow = true;
                    wall.receiveShadow = true;
                    this.scene.add(wall);
                    this.walls.push(wall);
                }
            }
        }
        
        // ゴールを作成
        this.createGoal();
    }

    createGoal() {
        const goalPos = this.mazeGenerator.getGoalPosition();
        
        // ゴールの円柱
        const goalGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 8);
        const goalMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xff0000,
            emissive: 0x440000
        });
        
        this.goal = new THREE.Mesh(goalGeometry, goalMaterial);
        this.goal.position.set(goalPos.x, 1, goalPos.y);
        this.goal.castShadow = true;
        this.scene.add(this.goal);
        
        // ゴールのライト
        const goalLight = new THREE.PointLight(0xff0000, 0.5, 10);
        goalLight.position.set(goalPos.x, 2, goalPos.y);
        goalLight.castShadow = true;
        this.scene.add(goalLight);
        this.lights.push(goalLight);
    }

    setupLighting() {
        // 環境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // プレイヤーライト（懐中電灯効果）
        this.playerLight = new THREE.SpotLight(0xffffff, 1, 15, Math.PI / 6, 0.5);
        this.playerLight.castShadow = true;
        this.playerLight.shadow.mapSize.width = 1024;
        this.playerLight.shadow.mapSize.height = 1024;
        this.scene.add(this.playerLight);
        this.lights.push(this.playerLight);
    }

    createPlayer() {
        // プレイヤーは見えないが、位置とカメラの基準点として使用
        const playerGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const playerMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00,
            visible: false // プレイヤーは見えない（第一人称）
        });
        
        this.player = new THREE.Mesh(playerGeometry, playerMaterial);
        this.scene.add(this.player);
        
        this.updatePlayerPosition();
    }

    updatePlayerPosition() {
        if (!this.player) return;
        
        // プレイヤー位置を更新
        this.player.position.set(this.playerPosition.x, 0.5, this.playerPosition.z);
        
        // カメラ位置を更新（第一人称視点）
        this.camera.position.set(
            this.playerPosition.x, 
            1.5, // 目の高さ
            this.playerPosition.z
        );
        
        // プレイヤーライトを更新
        if (this.playerLight) {
            this.playerLight.position.copy(this.camera.position);
            this.playerLight.target.position.set(
                this.camera.position.x + Math.sin(this.camera.rotation.y),
                this.camera.position.y - 0.5,
                this.camera.position.z + Math.cos(this.camera.rotation.y)
            );
            this.playerLight.target.updateMatrixWorld();
        }
        
        // UI更新
        this.updateUI();
        
        // ゴール判定
        this.checkGoal();
    }

    checkGoal() {
        const goalPos = this.mazeGenerator.getGoalPosition();
        const distance = Math.sqrt(
            Math.pow(this.playerPosition.x - goalPos.x, 2) + 
            Math.pow(this.playerPosition.z - goalPos.y, 2)
        );
        
        if (distance < 0.8 && !this.isGoalReached) {
            this.isGoalReached = true;
            this.showModal('ゴール到達！', 'おめでとうございます！迷路をクリアしました！');
        }
    }

    movePlayer(direction) {
        let newX = this.playerPosition.x;
        let newZ = this.playerPosition.z;
        
        const speed = 0.2;
        
        switch (direction) {
            case 'forward':
                newZ -= speed;
                break;
            case 'backward':
                newZ += speed;
                break;
            case 'left':
                newX -= speed;
                break;
            case 'right':
                newX += speed;
                break;
        }
        
        // 衝突判定
        if (this.canMoveTo(newX, newZ)) {
            this.playerPosition.x = newX;
            this.playerPosition.z = newZ;
            this.updatePlayerPosition();
        }
    }

    canMoveTo(x, z) {
        // 境界チェック
        if (x < 0 || x >= this.mazeGenerator.getWidth() || 
            z < 0 || z >= this.mazeGenerator.getHeight()) {
            return false;
        }
        
        // 壁チェック（プレイヤーのサイズを考慮）
        const margin = 0.3;
        const positions = [
            [Math.floor(x - margin), Math.floor(z - margin)],
            [Math.floor(x + margin), Math.floor(z - margin)],
            [Math.floor(x - margin), Math.floor(z + margin)],
            [Math.floor(x + margin), Math.floor(z + margin)]
        ];
        
        for (const [checkX, checkZ] of positions) {
            if (this.mazeGenerator.isWall(checkX, checkZ)) {
                return false;
            }
        }
        
        return true;
    }

    rotateCamera(deltaX, deltaY) {
        // マウス感度
        const sensitivity = 0.005;
        
        // Y軸回転（左右を見る）
        this.camera.rotation.y -= deltaX * sensitivity;
        
        // X軸回転（上下を見る）- 制限付き
        this.camera.rotation.x -= deltaY * sensitivity;
        this.camera.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.camera.rotation.x));
        
        // プレイヤーライトの方向を更新
        if (this.playerLight) {
            this.playerLight.target.position.set(
                this.camera.position.x + Math.sin(this.camera.rotation.y),
                this.camera.position.y - 0.5,
                this.camera.position.z + Math.cos(this.camera.rotation.y)
            );
            this.playerLight.target.updateMatrixWorld();
        }
    }

    updateUI() {
        document.getElementById('playerX').textContent = Math.round(this.playerPosition.x);
        document.getElementById('playerZ').textContent = Math.round(this.playerPosition.z);
    }

    showModal(title, message) {
        if (window.gameModal) {
            window.gameModal.show(title, message);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // FPS計算
        const currentTime = performance.now();
        this.frameCount++;
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round(this.frameCount * 1000 / (currentTime - this.lastTime));
            document.getElementById('fps').textContent = this.fps;
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
        
        // ゴールの回転アニメーション
        if (this.goal) {
            this.goal.rotation.y += 0.02;
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    generateNewMaze() {
        this.generateMaze();
        if (window.gameModal) {
            window.gameModal.close();
        }
    }

    // パブリックメソッド
    getPlayerPosition() {
        return { ...this.playerPosition };
    }

    getMazeGenerator() {
        return this.mazeGenerator;
    }
}

// グローバルエクスポート
window.GameEngine = GameEngine;