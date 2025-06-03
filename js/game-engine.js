class GameEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.maze = null;
        this.mazeGroup = null;
        this.player = {
            x: 0,
            y: 0,
            mesh: null
        };
        this.goal = {
            x: 49,
            y: 49,
            mesh: null
        };
        this.wallHeight = 2;
        this.cellSize = 2;
        this.mazeSize = 50;
        
        this.clock = new THREE.Clock();
        this.frameCount = 0;
        this.fps = 60;
        this.lastFpsUpdate = 0;
        
        this.init();
    }
    
    init() {
        this.initThreeJS();
        this.generateMaze();
        this.createMazeGeometry();
        this.createPlayer();
        this.createGoal();
        this.setupLighting();
        this.setupCamera();
        this.animate();
    }
    
    initThreeJS() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        this.scene.fog = new THREE.Fog(0x000000, 1, 20);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        // Renderer
        const canvas = document.getElementById('gameCanvas');
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    generateMaze() {
        const generator = new MazeGenerator(this.mazeSize, this.mazeSize);
        this.maze = generator.generateMaze();
        this.mazeGenerator = generator;
    }
    
    createMazeGeometry() {
        this.mazeGroup = new THREE.Group();
        
        // Wall material
        const wallMaterial = new THREE.MeshPhongMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.9
        });
        
        // Ground material
        const groundMaterial = new THREE.MeshPhongMaterial({
            color: 0x222222
        });
        
        // Create ground
        const groundGeometry = new THREE.PlaneGeometry(
            this.mazeSize * this.cellSize,
            this.mazeSize * this.cellSize
        );
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(
            (this.mazeSize - 1) * this.cellSize / 2,
            0,
            (this.mazeSize - 1) * this.cellSize / 2
        );
        ground.receiveShadow = true;
        this.mazeGroup.add(ground);
        
        // Create walls
        for (let x = 0; x < this.mazeSize; x++) {
            for (let y = 0; y < this.mazeSize; y++) {
                const cell = this.maze[x][y];
                const worldX = x * this.cellSize;
                const worldZ = y * this.cellSize;
                
                // Top wall
                if (cell.walls.top) {
                    this.createWall(worldX, worldZ - this.cellSize / 2, 0, wallMaterial);
                }
                
                // Right wall
                if (cell.walls.right) {
                    this.createWall(worldX + this.cellSize / 2, worldZ, Math.PI / 2, wallMaterial);
                }
                
                // Bottom wall
                if (cell.walls.bottom) {
                    this.createWall(worldX, worldZ + this.cellSize / 2, 0, wallMaterial);
                }
                
                // Left wall
                if (cell.walls.left) {
                    this.createWall(worldX - this.cellSize / 2, worldZ, Math.PI / 2, wallMaterial);
                }
            }
        }
        
        this.scene.add(this.mazeGroup);
    }
    
    createWall(x, z, rotation, material) {
        const wallGeometry = new THREE.BoxGeometry(this.cellSize, this.wallHeight, 0.1);
        const wall = new THREE.Mesh(wallGeometry, material);
        wall.position.set(x, this.wallHeight / 2, z);
        wall.rotation.y = rotation;
        wall.castShadow = true;
        wall.receiveShadow = true;
        this.mazeGroup.add(wall);
    }
    
    createPlayer() {
        const playerGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const playerMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            emissive: 0x003300
        });
        this.player.mesh = new THREE.Mesh(playerGeometry, playerMaterial);
        this.player.mesh.position.set(0, 0.2, 0);
        this.player.mesh.castShadow = true;
        this.scene.add(this.player.mesh);
    }
    
    createGoal() {
        const goalGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
        const goalMaterial = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            emissive: 0x330000
        });
        this.goal.mesh = new THREE.Mesh(goalGeometry, goalMaterial);
        this.goal.mesh.position.set(
            this.goal.x * this.cellSize,
            0.05,
            this.goal.y * this.cellSize
        );
        this.scene.add(this.goal.mesh);
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Player light (follows player)
        this.playerLight = new THREE.PointLight(0xffffff, 1, 10);
        this.playerLight.position.set(0, 2, 0);
        this.playerLight.castShadow = true;
        this.playerLight.shadow.mapSize.width = 512;
        this.playerLight.shadow.mapSize.height = 512;
        this.scene.add(this.playerLight);
        
        // Goal light
        const goalLight = new THREE.PointLight(0xff4444, 0.5, 5);
        goalLight.position.set(
            this.goal.x * this.cellSize,
            2,
            this.goal.y * this.cellSize
        );
        this.scene.add(goalLight);
    }
    
    setupCamera() {
        this.updateCameraPosition();
    }
    
    updateCameraPosition() {
        const playerWorldX = this.player.x * this.cellSize;
        const playerWorldZ = this.player.y * this.cellSize;
        
        // Third-person camera
        this.camera.position.set(
            playerWorldX + 3,
            4,
            playerWorldZ + 3
        );
        this.camera.lookAt(playerWorldX, 1, playerWorldZ);
        
        // Update player light position
        this.playerLight.position.set(playerWorldX, 2, playerWorldZ);
        
        // Update UI
        this.updateUI();
    }
    
    movePlayer(direction) {
        let newX = this.player.x;
        let newY = this.player.y;
        
        switch (direction) {
            case 'up':
                newY -= 1;
                break;
            case 'down':
                newY += 1;
                break;
            case 'left':
                newX -= 1;
                break;
            case 'right':
                newX += 1;
                break;
        }
        
        // Check if move is valid
        if (this.mazeGenerator.isValidPosition(newX, newY) && 
            this.mazeGenerator.canMoveTo(this.player.x, this.player.y, direction)) {
            
            this.player.x = newX;
            this.player.y = newY;
            
            // Update player mesh position
            this.player.mesh.position.set(
                newX * this.cellSize,
                0.2,
                newY * this.cellSize
            );
            
            this.updateCameraPosition();
            
            // Check for goal
            if (newX === this.goal.x && newY === this.goal.y) {
                this.onGoalReached();
            }
        }
    }
    
    onGoalReached() {
        showModal('ゴール到達！', 'おめでとうございます！ゴールに到達しました。', '新しいゲーム', () => {
            this.resetGame();
        });
    }
    
    resetGame() {
        // Reset player position
        this.player.x = 0;
        this.player.y = 0;
        this.player.mesh.position.set(0, 0.2, 0);
        
        // Generate new maze
        this.scene.remove(this.mazeGroup);
        this.generateMaze();
        this.createMazeGeometry();
        
        this.updateCameraPosition();
    }
    
    updateUI() {
        const positionElement = document.getElementById('position');
        if (positionElement) {
            positionElement.textContent = `(${this.player.x + 1}, ${this.player.y + 1})`;
        }
    }
    
    updateFPS() {
        this.frameCount++;
        const now = performance.now();
        
        if (now - this.lastFpsUpdate >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            const fpsElement = document.getElementById('fps');
            if (fpsElement) {
                fpsElement.textContent = this.fps;
            }
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.updateFPS();
        this.renderer.render(this.scene, this.camera);
    }
}