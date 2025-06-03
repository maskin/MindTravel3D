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
            direction: 0, // 0=North, 1=East, 2=South, 3=West
            mesh: null
        };
        
        this.goal = {
            x: 48,
            y: 48,
            mesh: null
        };
        
        this.walls = [];
        this.floors = [];
        this.lights = [];
        
        this.moveSpeed = 0.1;
        this.isMoving = false;
        this.clock = new THREE.Clock();
        
        this.init();
    }

    init() {
        this.initRenderer();
        this.initScene();
        this.initCamera();
        this.initLights();
        this.generateMaze();
        this.createMazeGeometry();
        this.createPlayer();
        this.createGoal();
        this.updateCameraPosition();
        this.startRenderLoop();
    }

    initRenderer() {
        const canvas = document.getElementById('gameCanvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x000000);
        this.renderer.fog = new THREE.Fog(0x000000, 1, 20);
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
        
        // Set initial camera position at player eye level
        this.camera.position.set(1, 1.7, 1);
        this.camera.lookAt(1, 1.7, 0); // Look north initially
    }

    initLights() {
        // Ambient light for basic visibility
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // Player flashlight (follows player)
        this.playerLight = new THREE.SpotLight(0xffffff, 1.0, 15, Math.PI / 4, 0.5);
        this.playerLight.position.set(1, 1.7, 1);
        this.playerLight.target.position.set(1, 1.7, 0);
        this.playerLight.castShadow = true;
        this.playerLight.shadow.mapSize.width = 1024;
        this.playerLight.shadow.mapSize.height = 1024;
        this.scene.add(this.playerLight);
        this.scene.add(this.playerLight.target);

        // Goal light (red glow at goal)
        this.goalLight = new THREE.PointLight(0xff0000, 0.8, 10);
        this.goalLight.position.set(48, 2, 48);
        this.scene.add(this.goalLight);
    }

    generateMaze() {
        this.mazeGenerator = new MazeGenerator(50, 50);
        this.maze = this.mazeGenerator.generate();
        
        const spawn = this.mazeGenerator.getSpawnPosition();
        const goal = this.mazeGenerator.getGoalPosition();
        
        this.player.x = spawn.x;
        this.player.y = spawn.y;
        this.player.direction = 0; // Face north
        
        this.goal.x = goal.x;
        this.goal.y = goal.y;
    }

    createMazeGeometry() {
        // Clear existing maze geometry
        this.walls.forEach(wall => this.scene.remove(wall));
        this.floors.forEach(floor => this.scene.remove(floor));
        this.walls = [];
        this.floors = [];

        const wallGeometry = new THREE.BoxGeometry(1, 3, 1);
        const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
        
        const floorGeometry = new THREE.PlaneGeometry(1, 1);
        const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x202020 });

        for (let y = 0; y < this.mazeGenerator.getHeight(); y++) {
            for (let x = 0; x < this.mazeGenerator.getWidth(); x++) {
                if (this.mazeGenerator.isWall(x, y)) {
                    // Create wall
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                    wall.position.set(x, 1.5, y);
                    wall.castShadow = true;
                    wall.receiveShadow = true;
                    this.scene.add(wall);
                    this.walls.push(wall);
                } else {
                    // Create floor
                    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
                    floor.position.set(x, 0, y);
                    floor.rotation.x = -Math.PI / 2;
                    floor.receiveShadow = true;
                    this.scene.add(floor);
                    this.floors.push(floor);
                }
            }
        }
    }

    createPlayer() {
        if (this.player.mesh) {
            this.scene.remove(this.player.mesh);
        }
        
        // Player is invisible in first-person view
        // Just keep a reference for collision detection
        const playerGeometry = new THREE.SphereGeometry(0.3);
        const playerMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x00ff00,
            transparent: true,
            opacity: 0 // Invisible
        });
        
        this.player.mesh = new THREE.Mesh(playerGeometry, playerMaterial);
        this.player.mesh.position.set(this.player.x, 0.3, this.player.y);
        this.scene.add(this.player.mesh);
    }

    createGoal() {
        if (this.goal.mesh) {
            this.scene.remove(this.goal.mesh);
        }
        
        const goalGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5);
        const goalMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        
        this.goal.mesh = new THREE.Mesh(goalGeometry, goalMaterial);
        this.goal.mesh.position.set(this.goal.x, 0.75, this.goal.y);
        this.scene.add(this.goal.mesh);
    }

    updateCameraPosition() {
        // Set camera to player position at eye level
        this.camera.position.set(this.player.x, 1.7, this.player.y);
        
        // Update player light position
        this.playerLight.position.copy(this.camera.position);
        
        // Set camera direction based on player direction
        const directions = [
            { x: 0, z: -1 }, // North
            { x: 1, z: 0 },  // East
            { x: 0, z: 1 },  // South
            { x: -1, z: 0 }  // West
        ];
        
        const dir = directions[this.player.direction];
        const lookAtPoint = new THREE.Vector3(
            this.player.x + dir.x,
            1.7,
            this.player.y + dir.z
        );
        
        this.camera.lookAt(lookAtPoint);
        this.playerLight.target.position.copy(lookAtPoint);
    }

    movePlayer(direction) {
        if (this.isMoving) return false;
        
        let newX = this.player.x;
        let newY = this.player.y;
        
        switch (direction) {
            case 'forward':
                switch (this.player.direction) {
                    case 0: newY--; break; // North
                    case 1: newX++; break; // East
                    case 2: newY++; break; // South
                    case 3: newX--; break; // West
                }
                break;
            case 'backward':
                switch (this.player.direction) {
                    case 0: newY++; break; // North
                    case 1: newX--; break; // East
                    case 2: newY--; break; // South
                    case 3: newX++; break; // West
                }
                break;
        }
        
        // Check collision
        if (this.mazeGenerator.isPath(newX, newY)) {
            this.player.x = newX;
            this.player.y = newY;
            this.updateCameraPosition();
            this.checkGoal();
            return true;
        }
        
        return false;
    }

    turnPlayer(direction) {
        switch (direction) {
            case 'left':
                this.player.direction = (this.player.direction + 3) % 4;
                break;
            case 'right':
                this.player.direction = (this.player.direction + 1) % 4;
                break;
        }
        this.updateCameraPosition();
    }

    checkGoal() {
        const distance = Math.sqrt(
            Math.pow(this.player.x - this.goal.x, 2) + 
            Math.pow(this.player.y - this.goal.y, 2)
        );
        
        if (distance < 1) {
            game.showModal('ゴール到達！', '新しい迷路に挑戦しますか？', () => {
                this.regenerateMaze();
            });
        }
    }

    regenerateMaze() {
        this.generateMaze();
        this.createMazeGeometry();
        this.createPlayer();
        this.createGoal();
        this.updateCameraPosition();
    }

    getDirectionName() {
        const directions = ['北', '東', '南', '西'];
        return directions[this.player.direction];
    }

    startRenderLoop() {
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Rotate goal
            if (this.goal.mesh) {
                this.goal.mesh.rotation.y += 0.02;
            }
            
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}