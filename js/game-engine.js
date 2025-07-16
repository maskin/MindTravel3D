// 3D迷路ゲーム - 3Dエンジン
class GameEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.maze = null;
        this.goal = null;
        this.walls = [];
        this.lights = [];
        
        // プレイヤー設定
        this.playerPosition = { x: 1, z: 1 };
        this.playerRotation = 0; // 0=北, π/2=東, π=南, 3π/2=西
        this.playerHeight = 1.7;
        this.moveSpeed = 0.1;
        this.rotationSpeed = Math.PI / 2; // 90度
        
        // ゲーム状態
        this.isGameStarted = false;
        this.isMoving = false;
        this.gameWon = false;
        
        // パフォーマンス監視
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
    }
    
    async init() {
        try {
            // Three.jsの確認
            if (typeof THREE === 'undefined') {
                throw new Error('Three.js が読み込まれていません');
            }
            
            this.initRenderer();
            this.initScene();
            this.initCamera();
            this.initLights();
            
            return true;
        } catch (error) {
            console.error('3Dエンジン初期化エラー:', error);
            return false;
        }
    }
    
    initRenderer() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            throw new Error('Canvas要素が見つかりません');
        }
        
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            alpha: false
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.fog = true;
    }
    
    initScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000, 5, 25);
    }
    
    initCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.updateCameraPosition();
    }
    
    initLights() {
        // 環境光（弱め）
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // プレイヤーのライト（懐中電灯効果）
        this.playerLight = new THREE.SpotLight(0xffffff, 1.0, 20, Math.PI / 6, 0.5);
        this.playerLight.castShadow = true;
        this.playerLight.shadow.mapSize.width = 1024;
        this.playerLight.shadow.mapSize.height = 1024;
        this.playerLight.shadow.camera.near = 0.1;
        this.playerLight.shadow.camera.far = 20;
        this.scene.add(this.playerLight);
        
        // ゴールライト
        this.goalLight = new THREE.PointLight(0xff0000, 0.8, 15);
        this.goalLight.position.set(0, 3, 0);
        this.lights.push(this.goalLight);
    }
    
    async createMaze(mazeData) {
        // 既存の迷路オブジェクトを削除
        this.clearMaze();
        
        const wallGeometry = new THREE.BoxGeometry(1, 3, 1);
        const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
        
        const floorGeometry = new THREE.PlaneGeometry(1, 1);
        const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x202020 });
        
        // 迷路の作成
        for (let y = 0; y < mazeData.length; y++) {
            for (let x = 0; x < mazeData[y].length; x++) {
                // 床の作成
                const floor = new THREE.Mesh(floorGeometry, floorMaterial);
                floor.rotation.x = -Math.PI / 2;
                floor.position.set(x, 0, y);
                floor.receiveShadow = true;
                this.scene.add(floor);
                
                // 壁の作成
                if (mazeData[y][x] === 1) {
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                    wall.position.set(x, 1.5, y);
                    wall.castShadow = true;
                    wall.receiveShadow = true;
                    this.scene.add(wall);
                    this.walls.push(wall);
                }
            }
        }
        
        // ゴールの作成
        this.createGoal(mazeData[0].length - 2, mazeData.length - 2);
    }
    
    createGoal(x, z) {
        // ゴールオブジェクト（回転する赤い円柱）
        const goalGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 16);
        const goalMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xff0000,
            emissive: 0x330000
        });
        
        this.goal = new THREE.Mesh(goalGeometry, goalMaterial);
        this.goal.position.set(x, 1, z);
        this.scene.add(this.goal);
        
        // ゴールライトを配置
        this.goalLight.position.set(x, 3, z);
        this.scene.add(this.goalLight);
    }
    
    clearMaze() {
        // 壁オブジェクトを削除
        this.walls.forEach(wall => {
            this.scene.remove(wall);
        });
        this.walls = [];
        
        // ゴールを削除
        if (this.goal) {
            this.scene.remove(this.goal);
            this.goal = null;
        }
        
        // ゴールライトを削除
        if (this.goalLight && this.goalLight.parent) {
            this.scene.remove(this.goalLight);
        }
        
        // 床を削除
        const objectsToRemove = [];
        this.scene.traverse((child) => {
            if (child.geometry && child.geometry.type === 'PlaneGeometry') {
                objectsToRemove.push(child);
            }
        });
        objectsToRemove.forEach(obj => this.scene.remove(obj));
    }
    
    setPlayerPosition(x, z) {
        this.playerPosition.x = x;
        this.playerPosition.z = z;
        this.updateCameraPosition();
    }
    
    setPlayerRotation(rotation) {
        this.playerRotation = rotation;
        this.updateCameraPosition();
    }
    
    updateCameraPosition() {
        if (!this.camera) return;
        
        const x = this.playerPosition.x;
        const z = this.playerPosition.z;
        const y = this.playerHeight;
        
        this.camera.position.set(x, y, z);
        
        // カメラの向きを設定
        const lookX = x + Math.sin(this.playerRotation);
        const lookZ = z + Math.cos(this.playerRotation);
        this.camera.lookAt(lookX, y, lookZ);
        
        // プレイヤーライトの位置と向きを更新
        if (this.playerLight) {
            this.playerLight.position.set(x, y, z);
            this.playerLight.target.position.set(lookX, y - 0.5, lookZ);
            this.playerLight.target.updateMatrixWorld();
        }
    }
    
    movePlayer(direction) {
        if (this.isMoving) return false;
        
        let newX = this.playerPosition.x;
        let newZ = this.playerPosition.z;
        
        switch (direction) {
            case 'forward':
                newX += Math.sin(this.playerRotation) * this.moveSpeed;
                newZ += Math.cos(this.playerRotation) * this.moveSpeed;
                break;
            case 'backward':
                newX -= Math.sin(this.playerRotation) * this.moveSpeed;
                newZ -= Math.cos(this.playerRotation) * this.moveSpeed;
                break;
        }
        
        // 衝突判定
        if (this.canMoveTo(newX, newZ)) {
            this.playerPosition.x = newX;
            this.playerPosition.z = newZ;
            this.updateCameraPosition();
            
            // ゴール判定
            this.checkGoal();
            return true;
        }
        
        return false;
    }
    
    rotatePlayer(direction) {
        if (this.isMoving) return;
        
        switch (direction) {
            case 'left':
                this.playerRotation -= this.rotationSpeed;
                break;
            case 'right':
                this.playerRotation += this.rotationSpeed;
                break;
        }
        
        // 角度を正規化
        while (this.playerRotation < 0) {
            this.playerRotation += Math.PI * 2;
        }
        while (this.playerRotation >= Math.PI * 2) {
            this.playerRotation -= Math.PI * 2;
        }
        
        this.updateCameraPosition();
    }
    
    canMoveTo(x, z) {
        if (!this.maze) return false;
        
        // 四角い当たり判定
        const margin = 0.3;
        const positions = [
            { x: x - margin, z: z - margin },
            { x: x + margin, z: z - margin },
            { x: x - margin, z: z + margin },
            { x: x + margin, z: z + margin }
        ];
        
        for (const pos of positions) {
            const gridX = Math.floor(pos.x);
            const gridZ = Math.floor(pos.z);
            
            if (this.maze.isWall(gridX, gridZ)) {
                return false;
            }
        }
        
        return true;
    }
    
    checkGoal() {
        if (!this.goal || this.gameWon) return;
        
        const goalX = this.goal.position.x;
        const goalZ = this.goal.position.z;
        const distance = Math.sqrt(
            Math.pow(this.playerPosition.x - goalX, 2) + 
            Math.pow(this.playerPosition.z - goalZ, 2)
        );
        
        if (distance < 0.8) {
            this.gameWon = true;
            window.uiManager.showModal('ゴール到達！', 'おめでとうございます！\n迷路をクリアしました！\n\nRキーで新しい迷路に挑戦できます。');
        }
    }
    
    getDirectionName() {
        const angle = this.playerRotation;
        if (angle < Math.PI / 4 || angle > 7 * Math.PI / 4) return '北';
        if (angle < 3 * Math.PI / 4) return '東';
        if (angle < 5 * Math.PI / 4) return '南';
        return '西';
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // FPS計算
        this.frameCount++;
        const currentTime = performance.now();
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
        
        // ゴールの回転アニメーション
        if (this.goal) {
            this.goal.rotation.y += 0.02;
        }
        
        // レンダリング
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
        
        // UI更新
        if (window.uiManager) {
            window.uiManager.updateGameInfo({
                position: `${this.playerPosition.x.toFixed(1)}, ${this.playerPosition.z.toFixed(1)}`,
                direction: this.getDirectionName(),
                fps: this.fps
            });
        }
    }
    
    handleResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    newGame() {
        this.gameWon = false;
        this.playerPosition = { x: 1, z: 1 };
        this.playerRotation = 0;
        this.updateCameraPosition();
    }
}

// グローバルに公開
window.GameEngine = GameEngine;