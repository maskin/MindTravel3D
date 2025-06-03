// 3Dゲームエンジン - Three.jsベースの迷路レンダリング
class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = {
            x: 1,
            y: 1,
            direction: 0, // 0=北, 1=東, 2=南, 3=西
            height: 1.7
        };
        this.maze = null;
        this.mazeGroup = null;
        this.goalObject = null;
        this.lights = [];
        this.isRunning = false;
        this.lastTime = 0;
        this.fps = 60;
        
        this.init();
    }

    init() {
        // シーンの作成
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000, 1, 15);

        // カメラの作成 (第一人称視点)
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            100
        );
        this.updateCameraPosition();

        // レンダラーの作成
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // 環境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
        this.scene.add(ambientLight);

        // プレイヤーライト (懐中電灯効果)
        this.playerLight = new THREE.SpotLight(0xffffff, 1.5, 30, Math.PI / 6, 0.1);
        this.playerLight.position.set(0, 0, 0);
        this.playerLight.castShadow = true;
        this.playerLight.shadow.mapSize.width = 1024;
        this.playerLight.shadow.mapSize.height = 1024;
        this.scene.add(this.playerLight);
        this.scene.add(this.playerLight.target);

        // ウィンドウリサイズイベント
        window.addEventListener('resize', () => this.onWindowResize());
    }

    generateMaze() {
        // 既存の迷路を削除
        if (this.mazeGroup) {
            this.scene.remove(this.mazeGroup);
        }

        // 新しい迷路を生成
        const generator = new MazeGenerator(50, 50);
        this.maze = generator.generate();
        this.mazeGroup = new THREE.Group();

        // 迷路の3Dモデルを作成
        this.createMazeGeometry();

        // ゴールオブジェクトを作成
        this.createGoal();

        this.scene.add(this.mazeGroup);

        // プレイヤーをスタート位置にリセット
        this.player.x = 1;
        this.player.y = 1;
        this.player.direction = 0;
        this.updateCameraPosition();
    }

    createMazeGeometry() {
        const wallGeometry = new THREE.BoxGeometry(1, 3, 1);
        const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
        
        const floorGeometry = new THREE.PlaneGeometry(1, 1);
        const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x202020 });

        for (let y = 0; y < this.maze.length; y++) {
            for (let x = 0; x < this.maze[y].length; x++) {
                // 床を作成
                const floor = new THREE.Mesh(floorGeometry, floorMaterial);
                floor.rotation.x = -Math.PI / 2;
                floor.position.set(x, 0, y);
                floor.receiveShadow = true;
                this.mazeGroup.add(floor);

                // 壁を作成
                if (this.maze[y][x] === 1) {
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                    wall.position.set(x, 1.5, y);
                    wall.castShadow = true;
                    wall.receiveShadow = true;
                    this.mazeGroup.add(wall);
                }
            }
        }
    }

    createGoal() {
        const goalX = 48;
        const goalY = 48;

        // 回転するゴールオブジェクト
        const goalGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 8);
        const goalMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xff4444,
            emissive: 0x220000
        });
        this.goalObject = new THREE.Mesh(goalGeometry, goalMaterial);
        this.goalObject.position.set(goalX, 1, goalY);
        this.mazeGroup.add(this.goalObject);

        // ゴール用ライト
        const goalLight = new THREE.PointLight(0xff4444, 1, 5);
        goalLight.position.set(goalX, 2, goalY);
        this.mazeGroup.add(goalLight);
    }

    updateCameraPosition() {
        // プレイヤーの位置にカメラを配置
        this.camera.position.set(this.player.x, this.player.height, this.player.y);
        
        // 方向に基づいてカメラの向きを設定
        const angle = this.player.direction * Math.PI / 2;
        const lookAtX = this.player.x + Math.sin(angle);
        const lookAtZ = this.player.y - Math.cos(angle);
        this.camera.lookAt(lookAtX, this.player.height, lookAtZ);

        // プレイヤーライトの位置と方向を更新
        this.playerLight.position.copy(this.camera.position);
        this.playerLight.target.position.set(lookAtX, this.player.height, lookAtZ);
    }

    movePlayer(direction) {
        let newX = this.player.x;
        let newY = this.player.y;

        switch (direction) {
            case 'forward':
                switch (this.player.direction) {
                    case 0: newY--; break; // 北
                    case 1: newX++; break; // 東
                    case 2: newY++; break; // 南
                    case 3: newX--; break; // 西
                }
                break;
            case 'backward':
                switch (this.player.direction) {
                    case 0: newY++; break; // 北
                    case 1: newX--; break; // 東
                    case 2: newY--; break; // 南
                    case 3: newX++; break; // 西
                }
                break;
        }

        // 衝突判定
        if (this.canMoveTo(newX, newY)) {
            this.player.x = newX;
            this.player.y = newY;
            this.updateCameraPosition();
            this.checkGoal();
            return true;
        }
        return false;
    }

    rotatePlayer(direction) {
        if (direction === 'left') {
            this.player.direction = (this.player.direction + 3) % 4;
        } else if (direction === 'right') {
            this.player.direction = (this.player.direction + 1) % 4;
        }
        this.updateCameraPosition();
    }

    canMoveTo(x, y) {
        // 境界チェック
        if (x < 0 || x >= 50 || y < 0 || y >= 50) {
            return false;
        }
        // 壁チェック
        return this.maze && this.maze[y] && this.maze[y][x] === 0;
    }

    checkGoal() {
        const goalX = 48;
        const goalY = 48;
        const distance = Math.sqrt(
            Math.pow(this.player.x - goalX, 2) + 
            Math.pow(this.player.y - goalY, 2)
        );
        
        if (distance < 1.5) {
            window.showNotification('ゴール達成！ おめでとうございます！', 'success');
            setTimeout(() => {
                this.generateMaze();
            }, 2000);
        }
    }

    getPlayerPosition() {
        return {
            x: this.player.x,
            y: this.player.y,
            direction: ['北', '東', '南', '西'][this.player.direction]
        };
    }

    start() {
        this.isRunning = true;
        this.generateMaze();
        this.animate();
    }

    stop() {
        this.isRunning = false;
    }

    animate(currentTime = 0) {
        if (!this.isRunning) return;

        requestAnimationFrame((time) => this.animate(time));

        // FPS計算
        if (currentTime) {
            const deltaTime = currentTime - this.lastTime;
            this.fps = Math.round(1000 / deltaTime);
            this.lastTime = currentTime;
        }

        // ゴールオブジェクトの回転
        if (this.goalObject) {
            this.goalObject.rotation.y += 0.02;
        }

        // レンダリング
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    getFPS() {
        return this.fps;
    }
}