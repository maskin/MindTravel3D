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
        this.moveSpeed = 1.0;
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
        console.log('3Dエンジン初期化開始...');
        
        try {
            // System information logging
            console.log('Browser:', navigator.userAgent);
            console.log('Platform:', navigator.platform);
            console.log('Screen resolution:', screen.width + 'x' + screen.height);
            console.log('Device pixel ratio:', window.devicePixelRatio);
            
            // Three.jsの確認
            if (typeof THREE === 'undefined') {
                throw new Error('Three.js が読み込まれていません。three.min.jsファイルが正しく読み込まれているか確認してください。');
            }
            console.log('Three.js loaded successfully. Version:', THREE.REVISION);
            
            // Step-by-step initialization with detailed logging
            console.log('Step 1: Initializing renderer...');
            this.initRenderer();
            console.log('✓ Renderer initialized');
            
            console.log('Step 2: Initializing scene...');
            this.initScene();
            console.log('✓ Scene initialized');
            
            console.log('Step 3: Initializing camera...');
            this.initCamera();
            console.log('✓ Camera initialized');
            
            console.log('Step 4: Initializing lights...');
            this.initLights();
            console.log('✓ Lights initialized');
            
            // Test render to verify everything works
            console.log('Step 5: Testing initial render...');
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
                console.log('✓ Initial render test successful');
            } else {
                throw new Error('コンポーネントの初期化が不完全です');
            }
            
            console.log('🎉 3Dエンジン初期化完了');
            return true;
        } catch (error) {
            console.error('❌ 3Dエンジン初期化エラー:', error);
            console.error('Error stack:', error.stack);
            
            // Show user-friendly error message
            if (window.uiManager) {
                let errorMessage = '3Dエンジンの初期化に失敗しました:\n\n';
                
                if (error.message.includes('Three.js')) {
                    errorMessage += '• Three.jsライブラリが読み込まれていません\n';
                    errorMessage += '• インターネット接続を確認してください\n';
                    errorMessage += '• ページを再読み込みしてください';
                } else if (error.message.includes('WebGL')) {
                    errorMessage += '• ブラウザがWebGLをサポートしていません\n';
                    errorMessage += '• Chrome、Firefox、Edgeの最新版をお試しください\n';
                    errorMessage += '• ブラウザの設定でWebGLが有効になっているか確認してください';
                } else if (error.message.includes('Canvas')) {
                    errorMessage += '• Canvasエレメントが見つかりません\n';
                    errorMessage += '• ページを再読み込みしてください';
                } else {
                    errorMessage += `• ${error.message}\n`;
                    errorMessage += '• ブラウザコンソールで詳細を確認してください';
                }
                
                window.uiManager.showError(errorMessage);
            }
            
            return false;
        }
    }
    
    initRenderer() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            throw new Error('Canvas要素が見つかりません');
        }
        
        console.log('Canvas found:', canvas);
        console.log('Canvas computed style:', window.getComputedStyle(canvas));
        
        // Check WebGL support before creating renderer
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            throw new Error('WebGLがサポートされていません。WebGL対応ブラウザを使用してください。');
        }
        console.log('WebGL support confirmed:', gl.getParameter(gl.VERSION));
        console.log('WebGL vendor:', gl.getParameter(gl.VENDOR));
        console.log('WebGL renderer:', gl.getParameter(gl.RENDERER));
        
        try {
            this.renderer = new THREE.WebGLRenderer({ 
                canvas: canvas,
                antialias: true,
                alpha: false,
                preserveDrawingBuffer: false,
                powerPreference: "default"
            });
            
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.setClearColor(0x000000);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            
            console.log('WebGL renderer created successfully');
            console.log('Renderer info:', this.renderer.info);
            
        } catch (rendererError) {
            console.error('WebGLRenderer creation failed:', rendererError);
            throw new Error(`WebGLレンダラーの作成に失敗しました: ${rendererError.message}`);
        }
    }
    
    initScene() {
        this.scene = new THREE.Scene();
        // Improved atmospheric fog for better depth perception
        this.scene.fog = new THREE.Fog(0x000011, 3, 15);
    }
    
    initCamera() {
        this.camera = new THREE.PerspectiveCamera(
            90, // Wider field of view for more immersive experience
            window.innerWidth / window.innerHeight, 
            0.1, 
            50 // Reduced far plane for better fog effect
        );
        this.updateCameraPosition();
    }
    
    initLights() {
        // Reduced ambient light for more dramatic atmosphere
        const ambientLight = new THREE.AmbientLight(0x404080, 0.4);
        this.scene.add(ambientLight);
        
        // Enhanced player light (flashlight effect) for immersive experience
        this.playerLight = new THREE.SpotLight(0xffffcc, 2.5, 12, Math.PI / 3, 0.4);
        this.playerLight.castShadow = true;
        this.playerLight.shadow.mapSize.width = 1024;
        this.playerLight.shadow.mapSize.height = 1024;
        this.playerLight.shadow.camera.near = 0.1;
        this.playerLight.shadow.camera.far = 12;
        this.scene.add(this.playerLight);
        
        // Add subtle overhead lighting for depth
        const topLight = new THREE.DirectionalLight(0x6666aa, 0.3);
        topLight.position.set(0, 10, 0);
        topLight.castShadow = false; // Keep performance good
        this.scene.add(topLight);
        
        // Add some atmospheric side lighting
        const sideLight1 = new THREE.DirectionalLight(0x4444aa, 0.2);
        sideLight1.position.set(10, 5, 10);
        this.scene.add(sideLight1);
        
        const sideLight2 = new THREE.DirectionalLight(0x4444aa, 0.2);
        sideLight2.position.set(-10, 5, -10);
        this.scene.add(sideLight2);
        
        // Enhanced goal light with more dramatic effect
        this.goalLight = new THREE.PointLight(0xff3333, 2.0, 15);
        this.goalLight.position.set(0, 3, 0);
        this.lights.push(this.goalLight);
    }
    
    async createMaze(mazeData) {
        console.log('3D迷路作成開始...');
        
        // 既存の迷路オブジェクトを削除
        this.clearMaze();
        
        // Create procedural textures for more realistic appearance
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // Create stone-like wall texture
        ctx.fillStyle = '#666666';
        ctx.fillRect(0, 0, 128, 128);
        
        // Add stone block pattern
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 2;
        for (let i = 0; i < 128; i += 32) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(128, i);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 128);
            ctx.stroke();
        }
        
        // Add random noise for texture
        for (let i = 0; i < 200; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#777777' : '#555555';
            ctx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
        }
        
        const wallTexture = new THREE.CanvasTexture(canvas);
        wallTexture.wrapS = THREE.RepeatWrapping;
        wallTexture.wrapT = THREE.RepeatWrapping;
        wallTexture.repeat.set(1, 1);
        
        // Enhanced wall material with texture and better lighting response
        const wallGeometry = new THREE.BoxGeometry(1, 3, 1);
        const wallMaterial = new THREE.MeshPhongMaterial({ 
            map: wallTexture,
            color: 0x888888,
            shininess: 30,
            transparent: false
        });
        
        // Create floor texture
        const floorCanvas = document.createElement('canvas');
        floorCanvas.width = 64;
        floorCanvas.height = 64;
        const floorCtx = floorCanvas.getContext('2d');
        
        floorCtx.fillStyle = '#222233';
        floorCtx.fillRect(0, 0, 64, 64);
        
        // Add floor tile pattern
        floorCtx.strokeStyle = '#111122';
        floorCtx.lineWidth = 1;
        for (let i = 0; i < 64; i += 16) {
            floorCtx.beginPath();
            floorCtx.moveTo(0, i);
            floorCtx.lineTo(64, i);
            floorCtx.stroke();
            
            floorCtx.beginPath();
            floorCtx.moveTo(i, 0);
            floorCtx.lineTo(i, 64);
            floorCtx.stroke();
        }
        
        const floorTexture = new THREE.CanvasTexture(floorCanvas);
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(1, 1);
        
        // Enhanced floor material
        const floorGeometry = new THREE.PlaneGeometry(1, 1);
        const floorMaterial = new THREE.MeshPhongMaterial({ 
            map: floorTexture,
            color: 0x333344,
            shininess: 10,
            transparent: false
        });
        
        // Create ceiling texture
        const ceilingCanvas = document.createElement('canvas');
        ceilingCanvas.width = 64;
        ceilingCanvas.height = 64;
        const ceilingCtx = ceilingCanvas.getContext('2d');
        
        ceilingCtx.fillStyle = '#111122';
        ceilingCtx.fillRect(0, 0, 64, 64);
        
        // Add rough ceiling texture
        for (let i = 0; i < 100; i++) {
            ceilingCtx.fillStyle = Math.random() > 0.5 ? '#151527' : '#0d0d18';
            ceilingCtx.fillRect(Math.random() * 64, Math.random() * 64, 3, 3);
        }
        
        const ceilingTexture = new THREE.CanvasTexture(ceilingCanvas);
        ceilingTexture.wrapS = THREE.RepeatWrapping;
        ceilingTexture.wrapT = THREE.RepeatWrapping;
        
        // Add ceiling material for enclosed feeling
        const ceilingGeometry = new THREE.PlaneGeometry(1, 1);
        const ceilingMaterial = new THREE.MeshPhongMaterial({ 
            map: ceilingTexture,
            color: 0x222233,
            shininess: 5,
            transparent: false
        });
        
        // 迷路の作成
        for (let y = 0; y < mazeData.length; y++) {
            for (let x = 0; x < mazeData[y].length; x++) {
                // 床の作成
                const floor = new THREE.Mesh(floorGeometry, floorMaterial);
                floor.rotation.x = -Math.PI / 2;
                floor.position.set(x, 0, y);
                floor.receiveShadow = true;
                this.scene.add(floor);
                
                // 天井の作成 (add ceiling for enclosed feeling)
                const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
                ceiling.rotation.x = Math.PI / 2;
                ceiling.position.set(x, 3, y);
                ceiling.receiveShadow = true;
                this.scene.add(ceiling);
                
                // 壁の作成
                if (mazeData[y][x] === 1) {
                    // Add some variation in wall heights for visual interest
                    const heightVariation = (Math.sin(x * 0.7) + Math.cos(y * 0.5)) * 0.3;
                    const wallHeight = 3 + heightVariation;
                    
                    const variableWallGeometry = new THREE.BoxGeometry(1, wallHeight, 1);
                    const wall = new THREE.Mesh(variableWallGeometry, wallMaterial);
                    wall.position.set(x, wallHeight / 2, y);
                    wall.castShadow = true;
                    wall.receiveShadow = true;
                    this.scene.add(wall);
                    this.walls.push(wall);
                }
            }
        }
        
        // ゴールの作成
        this.createGoal(mazeData[0].length - 2, mazeData.length - 2);
        
        console.log('3D迷路作成完了');
    }
    
    createGoal(x, z) {
        // Enhanced goal object with glowing effect
        const goalGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 16);
        const goalMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff6666,
            emissive: 0x441111,
            shininess: 100,
            transparent: false
        });
        
        this.goal = new THREE.Mesh(goalGeometry, goalMaterial);
        this.goal.position.set(x, 1, z);
        this.scene.add(this.goal);
        
        // Add a glowing ring around the goal for better visibility
        const ringGeometry = new THREE.RingGeometry(0.4, 0.6, 16);
        const ringMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff3333,
            emissive: 0x331111,
            transparent: true,
            opacity: 0.8,
            shininess: 50
        });
        
        const goalRing = new THREE.Mesh(ringGeometry, ringMaterial);
        goalRing.rotation.x = -Math.PI / 2;
        goalRing.position.set(x, 0.1, z);
        this.scene.add(goalRing);
        this.walls.push(goalRing); // Add to walls array for cleanup
        
        // Add floating particles around goal
        const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const particleMaterial = new THREE.MeshPhongMaterial({
            color: 0xff4444,
            emissive: 0x220000,
            transparent: true,
            opacity: 0.7
        });
        
        for (let i = 0; i < 6; i++) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            const angle = (i / 6) * Math.PI * 2;
            particle.position.set(
                x + Math.cos(angle) * 0.8,
                1.5 + Math.sin(i * 0.5) * 0.3,
                z + Math.sin(angle) * 0.8
            );
            this.scene.add(particle);
            this.walls.push(particle); // Add to walls array for cleanup
        }
        
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
        
        // 床と天井を削除
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
        // Don't reset position here - it should be set by caller with proper centering
        this.updateCameraPosition();
    }
}

// グローバルに公開
window.GameEngine = GameEngine;