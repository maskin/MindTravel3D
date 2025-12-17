// 3D迷路ゲーム - 3Dエンジン
if (typeof window.GameEngine === 'undefined') {
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
        this.playerPosition = { x: 1.5, z: 1.5 };
        this.playerRotation = 0; // 0=北, π/2=東, π=南, 3π/2=西
        this.playerHeight = 1.6;  // 人間の目線の高さ（一人称視点）
        this.moveSpeed = 0.5; // より大きな移動ステップで視覚的に確認しやすく
        this.rotationSpeed = Math.PI / 2; // 90度
        
        // ゲーム状態
        this.isGameStarted = false;
        this.isMoving = false;
        this.gameWon = false;
        
        // ワイヤーフレームモード
        this.wireframeMode = false;
        this.originalMaterials = new Map();
        
        // パフォーマンス監視
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.animationStarted = false;
    }
    
    async init() {
        console.log('🚀🚀🚀 GAME ENGINE VERSION 20250804-fix2 LOADED 🚀🚀🚀');
        console.log('🚀 3Dエンジン初期化開始...');
        console.log('Browser info:', {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        });
        
        try {
            // Step 1: Three.jsの確認
            console.log('📋 Step 1: THREE availability check:', typeof THREE);
            if (typeof THREE === 'undefined') {
                console.error('❌ THREE is undefined - script loading failed');
                throw new Error('Three.js が読み込まれていません');
            }
            console.log('✅ Step 1 完了: Three.js 読み込み確認済み');
            
            console.log('THREE object keys:', Object.keys(THREE));
            console.log('Required THREE components available:', {
                Scene: typeof THREE.Scene,
                PerspectiveCamera: typeof THREE.PerspectiveCamera,
                WebGLRenderer: typeof THREE.WebGLRenderer,
                Vector3: typeof THREE.Vector3,
                Vector2: typeof THREE.Vector2,
                Texture: typeof THREE.Texture,
                CanvasTexture: typeof THREE.CanvasTexture,
                RingGeometry: typeof THREE.RingGeometry,
                BoxGeometry: typeof THREE.BoxGeometry,
                PlaneGeometry: typeof THREE.PlaneGeometry,
                CylinderGeometry: typeof THREE.CylinderGeometry,
                SphereGeometry: typeof THREE.SphereGeometry,
                MeshBasicMaterial: typeof THREE.MeshBasicMaterial,
                MeshPhongMaterial: typeof THREE.MeshPhongMaterial
            });
            
            // Test CanvasTexture constructor
            try {
                console.log('Testing CanvasTexture constructor...');
                const testCanvas = document.createElement('canvas');
                testCanvas.width = 32;
                testCanvas.height = 32;
                const testTexture = new THREE.CanvasTexture(testCanvas);
                console.log('CanvasTexture test successful:', testTexture);
                
                // Test Vector2 for texture repeat
                if (testTexture.repeat && testTexture.repeat.set) {
                    testTexture.repeat.set(1, 1);
                    console.log('Vector2 repeat test successful');
                }
            } catch (textureError) {
                console.error('CanvasTexture test failed:', textureError);
            }
            
            // Test RingGeometry constructor
            try {
                console.log('Testing RingGeometry constructor...');
                const testRing = new THREE.RingGeometry(0.5, 1.0, 8);
                console.log('RingGeometry test successful:', testRing);
            } catch (ringError) {
                console.error('RingGeometry test failed:', ringError);
            }
            
            // Step 2: レンダラー初期化
            console.log('📋 Step 2: レンダラー初期化開始...');
            this.initRenderer();
            console.log('✅ Step 2 完了: レンダラー初期化済み');
            
            // Step 3: シーン初期化
            console.log('📋 Step 3: シーン初期化開始...');
            this.initScene();
            console.log('✅ Step 3 完了: シーン初期化済み');
            
            // Step 4: カメラ初期化
            console.log('📋 Step 4: カメラ初期化開始...');
            this.initCamera();
            console.log('✅ Step 4 完了: カメラ初期化済み');
            
            // Step 5: ライト初期化
            console.log('📋 Step 5: ライト初期化開始...');
            this.initLights();
            console.log('✅ Step 5 完了: ライト初期化済み');
            
            console.log('🎉 3Dエンジン初期化完了！');
            return true;
        } catch (error) {
            console.error('3Dエンジン初期化エラー - 詳細情報:', {
                error: error,
                message: error.message,
                stack: error.stack,
                THREEDefined: typeof THREE,
                canvasExists: !!document.getElementById('gameCanvas3D')
            });
            return false;
        }
    }
    
    async simpleInit() {
        console.log('🚨 GameEngine 簡易初期化モード...');
        try {
            // 必要最低限の初期化
            if (typeof THREE === 'undefined') {
                console.warn('⚠️ THREE未定義、簡易初期化スキップ');
                return false;
            }
            
            // 基本的なレンダラーのみ作成
            const canvas = document.getElementById('gameCanvas3D');
            if (canvas && THREE.WebGLRenderer) {
                try {
                    this.renderer = new THREE.WebGLRenderer({ 
                        canvas: canvas,
                        antialias: false,
                        alpha: true
                    });
                    this.renderer.setSize(window.innerWidth, window.innerHeight);
                    console.log('✅ 簡易レンダラー作成成功');
                    return true;
                } catch (rendererError) {
                    console.warn('⚠️ 簡易レンダラー作成失敗:', rendererError.message);
                    return false;
                }
            }
            return false;
        } catch (error) {
            console.error('❌ 簡易初期化エラー:', error);
            return false;
        }
    }
    
    initRenderer() {
        const canvas = document.getElementById('gameCanvas3D');
        if (!canvas) {
            throw new Error('3Dビュー用Canvas要素が見つかりません');
        }
        
        console.log('Canvas found:', canvas);
        console.log('Canvas details:', {
            id: canvas.id,
            width: canvas.width,
            height: canvas.height,
            clientWidth: canvas.clientWidth,
            clientHeight: canvas.clientHeight,
            offsetWidth: canvas.offsetWidth,
            offsetHeight: canvas.offsetHeight
        });
        console.log('Canvas computed style:', window.getComputedStyle(canvas));
        
        try {
            console.log('Creating THREE.WebGLRenderer...');
            console.log('THREE.WebGLRenderer function check:', typeof THREE.WebGLRenderer);
            
            // WebGLRendererの事前チェック
            if (typeof THREE.WebGLRenderer !== 'function') {
                throw new Error('THREE.WebGLRenderer は関数ではありません');
            }
            
            // レンダラー作成パラメータ
            const rendererParams = { 
                canvas: canvas,
                antialias: true,
                alpha: false,
                powerPreference: 'default',
                failIfMajorPerformanceCaveat: false
            };
            
            console.log('Renderer parameters:', rendererParams);
            
            this.renderer = new THREE.WebGLRenderer(rendererParams);
            console.log('✅ THREE.WebGLRenderer created successfully:', this.renderer);
            
            // Set renderer size to full screen for single 3D view
            const canvasWidth = window.innerWidth;
            const canvasHeight = window.innerHeight;
            this.renderer.setSize(canvasWidth, canvasHeight);
            console.log('Renderer size set to:', canvasWidth, 'x', canvasHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.setClearColor(0x0a0a15); // 暗い青色の背景（完全な黒ではない）
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.fog = true;
            
            // WebGLRenderer動作テスト
            console.log('🧪 WebGLRenderer動作テスト...');
            try {
                // 簡単なクリアテスト
                this.renderer.clear();
                console.log('✅ WebGLRenderer clear test successful');
                
                // レンダラー情報確認
                const gl = this.renderer.getContext();
                if (gl) {
                    console.log('✅ WebGL context available:', {
                        version: gl.getParameter(gl.VERSION),
                        vendor: gl.getParameter(gl.VENDOR),
                        renderer: gl.getParameter(gl.RENDERER)
                    });
                }
            } catch (testError) {
                console.warn('⚠️ WebGLRenderer test warning:', testError.message);
                // WebGLテストエラーは致命的ではないので継続
            }
        } catch (error) {
            console.error('Error in initRenderer:', {
                error: error,
                message: error.message,
                stack: error.stack,
                canvasState: canvas ? 'exists' : 'null',
                THREEWebGLRenderer: typeof THREE.WebGLRenderer
            });
            throw error;
        }
    }
    
    initScene() {
        this.scene = new THREE.Scene();
        
        // Fog設定（利用可能な場合のみ）- より明るく調整
        if (THREE.Fog) {
            console.log('✅ THREE.Fog available - adding atmospheric fog');
            this.scene.fog = new THREE.Fog(0x0a0a15, 5, 20); // より明るい色、より遠いフォグ
        } else {
            console.log('⚠️ THREE.Fog not available - skipping fog effect');
        }
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
        // Ambient light - より明るく（一人称視点で迷路が見えるように）
        const ambientLight = window.ThreeCompat ?
            window.ThreeCompat.createAmbientLight(0x505070, 0.6) :
            new THREE.AmbientLight(0x505070, 0.6);
        this.scene.add(ambientLight);
        
        // Enhanced player light (flashlight effect) - Use enhanced spot light if available
        if (THREE.SpotLight) {
            this.playerLight = new THREE.SpotLight(0xffffcc, 2.8, 14, Math.PI / 3, 0.4);
            this.playerLight.castShadow = true;
            this.playerLight.shadow.mapSize.width = 1024;
            this.playerLight.shadow.mapSize.height = 1024;
            this.playerLight.shadow.camera.near = 0.1;
            this.playerLight.shadow.camera.far = 14;
            this.scene.add(this.playerLight);
        }
        
        // Overhead lighting - Use compatibility layer for enhanced shadows
        const topLight = window.ThreeCompat ?
            window.ThreeCompat.createDirectionalLight(0x8888cc, 0.5) :
            new THREE.DirectionalLight(0x8888cc, 0.5);
        topLight.position.set(0, 10, 0);
        topLight.castShadow = false; // Keep performance good
        this.scene.add(topLight);
        
        // Atmospheric side lighting
        const sideLight1 = window.ThreeCompat ?
            window.ThreeCompat.createDirectionalLight(0x6666aa, 0.3) :
            new THREE.DirectionalLight(0x6666aa, 0.3);
        sideLight1.position.set(10, 5, 10);
        this.scene.add(sideLight1);
        
        const sideLight2 = window.ThreeCompat ?
            window.ThreeCompat.createDirectionalLight(0x6666aa, 0.3) :
            new THREE.DirectionalLight(0x6666aa, 0.3);
        sideLight2.position.set(-10, 5, -10);
        this.scene.add(sideLight2);
        
        // Enhanced goal light with more dramatic effect
        if (THREE.PointLight) {
            this.goalLight = new THREE.PointLight(0xff3333, 2.0, 15);
            this.goalLight.position.set(0, 3, 0);
            this.lights.push(this.goalLight);
        }
    }
    
    async createMaze(mazeData) {
        console.log('3D迷路作成開始...');
        
        // 既存の迷路オブジェクトを削除
        this.clearMaze();
        
        // Create procedural textures using compatibility layer
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
        
        console.log('Creating wall texture using compatibility layer...');
        
        // Use compatibility layer for texture creation
        let wallTexture;
        try {
            wallTexture = window.ThreeCompat ?
                window.ThreeCompat.createCanvasTexture(canvas) :
                new THREE.CanvasTexture(canvas);
            
            console.log('✅ Wall texture created successfully');
        } catch (error) {
            console.error('❌ Wall texture creation failed:', error);
            // Fallback texture
            wallTexture = {
                image: canvas,
                needsUpdate: true,
                wrapS: THREE.RepeatWrapping || 1000,
                wrapT: THREE.RepeatWrapping || 1000,
                repeat: { x: 1, y: 1, set: (x, y) => { this.x = x; this.y = y; } }
            };
        }
        
        if (wallTexture.wrapS !== undefined) {
            wallTexture.wrapS = THREE.RepeatWrapping;
            wallTexture.wrapT = THREE.RepeatWrapping;
            wallTexture.repeat.set(1, 1);
        }
        
        // Enhanced wall material using compatibility layer
        const wallGeometry = window.ThreeCompat ?
            window.ThreeCompat.createBoxGeometry(1, 3, 1) :
            new THREE.BoxGeometry(1, 3, 1);
            
        const wallMaterial = window.ThreeCompat ?
            window.ThreeCompat.createMaterial('MeshPhongMaterial', { 
                map: wallTexture,
                color: 0x888888,
                shininess: 30,
                transparent: false
            }) :
            new THREE.MeshPhongMaterial({ 
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
        
        console.log('Creating floor texture using compatibility layer...');
        let floorTexture;
        try {
            floorTexture = window.ThreeCompat ?
                window.ThreeCompat.createCanvasTexture(floorCanvas) :
                new THREE.CanvasTexture(floorCanvas);
            console.log('✅ Floor texture created successfully');
        } catch (floorTextureError) {
            console.error('❌ Floor texture creation failed:', floorTextureError);
            floorTexture = {
                image: floorCanvas,
                needsUpdate: true,
                wrapS: THREE.RepeatWrapping || 1000,
                wrapT: THREE.RepeatWrapping || 1000,
                repeat: { x: 1, y: 1, set: (x, y) => { this.x = x; this.y = y; } }
            };
        }
        
        if (floorTexture.wrapS !== undefined) {
            floorTexture.wrapS = THREE.RepeatWrapping;
            floorTexture.wrapT = THREE.RepeatWrapping;
            floorTexture.repeat.set(1, 1);
        }
        
        // Enhanced floor material using compatibility layer
        const floorGeometry = window.ThreeCompat ?
            window.ThreeCompat.createPlaneGeometry(1, 1) :
            new THREE.PlaneGeometry(1, 1);
            
        const floorMaterial = window.ThreeCompat ?
            window.ThreeCompat.createMaterial('MeshPhongMaterial', { 
                map: floorTexture,
                color: 0x333344,
                shininess: 10,
                transparent: false
            }) :
            new THREE.MeshPhongMaterial({ 
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
        
        console.log('Creating ceiling texture using compatibility layer...');
        let ceilingTexture;
        try {
            ceilingTexture = window.ThreeCompat ?
                window.ThreeCompat.createCanvasTexture(ceilingCanvas) :
                new THREE.CanvasTexture(ceilingCanvas);
            console.log('✅ Ceiling texture created successfully');
        } catch (ceilingTextureError) {
            console.error('❌ Ceiling texture creation failed:', ceilingTextureError);
            ceilingTexture = {
                image: ceilingCanvas,
                needsUpdate: true,
                wrapS: THREE.RepeatWrapping || 1000,
                wrapT: THREE.RepeatWrapping || 1000,
                repeat: { x: 1, y: 1, set: (x, y) => { this.x = x; this.y = y; } }
            };
        }
        
        if (ceilingTexture.wrapS !== undefined) {
            ceilingTexture.wrapS = THREE.RepeatWrapping;
            ceilingTexture.wrapT = THREE.RepeatWrapping;
        }
        
        // Add ceiling material using compatibility layer
        const ceilingGeometry = window.ThreeCompat ?
            window.ThreeCompat.createPlaneGeometry(1, 1) :
            new THREE.PlaneGeometry(1, 1);
            
        const ceilingMaterial = window.ThreeCompat ?
            window.ThreeCompat.createMaterial('MeshPhongMaterial', { 
                map: ceilingTexture,
                color: 0x222233,
                shininess: 5,
                transparent: false
            }) :
            new THREE.MeshPhongMaterial({ 
                map: ceilingTexture,
                color: 0x222233,
                shininess: 5,
                transparent: false
            });
        
        // 迷路の作成
        for (let y = 0; y < mazeData.length; y++) {
            for (let x = 0; x < mazeData[y].length; x++) {
                // デバッグ: 最初の数個の座標で配置確認
                if (y < 3 && x < 3) {
                    console.log(`🏗️ 配置確認: maze[${y}][${x}]=${mazeData[y][x]} → 3D座標(${x}, Y, ${y})`);
                }
                // 床の作成
                const floor = new THREE.Mesh(floorGeometry, floorMaterial);
                floor.rotation.x = -Math.PI / 2;
                floor.position.set(x, 0, y);
                floor.receiveShadow = true;
                floor.userData = { type: 'floor' };
                this.scene.add(floor);
                
                // 天井の作成 (add ceiling for enclosed feeling)
                const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
                ceiling.rotation.x = Math.PI / 2;
                ceiling.position.set(x, 3, y);
                ceiling.receiveShadow = true;
                this.scene.add(ceiling);
                
                // 壁の作成
                if (mazeData[y][x] === 1) {
                    // デバッグ: 壁配置確認
                    if (y < 3 && x < 3) {
                        console.log(`🧱 壁配置: maze[${y}][${x}]=1 → 3D壁座標(${x}, Y, ${y})`);
                    }
                    // Add some variation in wall heights for visual interest
                    const heightVariation = (Math.sin(x * 0.7) + Math.cos(y * 0.5)) * 0.3;
                    const wallHeight = 3 + heightVariation;
                    
                    const variableWallGeometry = window.ThreeCompat ?
                        window.ThreeCompat.createBoxGeometry(1, wallHeight, 1) :
                        new THREE.BoxGeometry(1, wallHeight, 1);
                    const wall = new THREE.Mesh(variableWallGeometry, wallMaterial);
                    wall.position.set(x, wallHeight / 2, y);
                    wall.castShadow = true;
                    wall.receiveShadow = true;
                    wall.userData = { type: 'wall' };
                    this.scene.add(wall);
                    this.walls.push(wall);
                }
            }
        }
        
        // ゴールの作成
        this.createGoal(mazeData[0].length - 2, mazeData.length - 2);
        
        // 3D描画デバッグ: スタート周辺の壁配置を確認
        console.log('🏗️ 3D迷路描画検証:');
        for (let checkY = 0; checkY < Math.min(3, mazeData.length); checkY++) {
            for (let checkX = 0; checkX < Math.min(3, mazeData[0].length); checkX++) {
                const isWall = mazeData[checkY][checkX] === 1;
                const pos3D = `(${checkX}, Y, ${checkY})`;
                console.log(`  maze[${checkY}][${checkX}] = ${mazeData[checkY][checkX]} → 3D${pos3D} ${isWall ? '壁配置' : '通路（壁なし）'}`);
            }
        }
        console.log('🏗️ プレイヤー位置(1.5, 1.5)から見える期待値:');
        console.log('  - 北(1,0): 壁があるはず');
        console.log('  - 西(0,1): 壁があるはず'); 
        console.log('  - 東(2,1): 通路で壁なしのはず');
        console.log('  - 南(1,2): 通路で壁なしのはず');
        
        // 【重要】座標系検証：迷路データと3D表現の完全な整合性チェック
        console.log('🎯 座標系整合性検証:');
        console.log('迷路配列maze[y][x] → 3D世界position.set(x, height, y)');
        console.log('プレイヤー座標(x,z) → 迷路チェックmaze[z][x]');
        
        // プレイヤーのスタート位置(1.5, 1.5)から4方向をチェック
        const playerStartX = 1.5;
        const playerStartZ = 1.5;
        const directions = [
            { name: '北', x: 1, z: 0, desc: 'maze[0][1]' },
            { name: '東', x: 2, z: 1, desc: 'maze[1][2]' },
            { name: '南', x: 1, z: 2, desc: 'maze[2][1]' },
            { name: '西', x: 0, z: 1, desc: 'maze[1][0]' }
        ];
        
        directions.forEach(dir => {
            const mazeValue = mazeData[dir.z] && mazeData[dir.z][dir.x] !== undefined ? mazeData[dir.z][dir.x] : 'undefined';
            const is3DWall = mazeValue === 1;
            const pos3D = `(${dir.x}, Y, ${dir.z})`;
            console.log(`  ${dir.name}方向: ${dir.desc} = ${mazeValue} → 3D${pos3D} ${is3DWall ? '壁あり' : '通路'}`);
        });
        
        // 3D表現の視覚的デバッグ：スタート地点周辺に色付きマーカー追加
        // デバッグマーカーは開発時のみ有効化
        // this.addVisualDebugMarkers(mazeData);
        console.log('3D迷路作成完了');
    }
    
    addVisualDebugMarkers(mazeData) {
        // スタート地点(1,1)周辺の4方向に色付きマーカーを追加
        const markerHeight = 2.0;  // 大幅に高くして見やすくする
        const markerSize = 0.8;    // 大きくして目立たせる
        
        // 方向マーカー（プレイヤー位置から見た方向）
        const markers = [
            { x: 1, z: 0, color: 0xff0000, name: '北' },   // 北（赤）
            { x: 2, z: 1, color: 0x00ff00, name: '東' },   // 東（緑）  
            { x: 1, z: 2, color: 0x0000ff, name: '南' },   // 南（青）
            { x: 0, z: 1, color: 0xffff00, name: '西' }    // 西（黄）
        ];
        
        markers.forEach(marker => {
            const markerGeometry = window.ThreeCompat ?
                window.ThreeCompat.createBoxGeometry(markerSize, markerHeight, markerSize) :
                new THREE.BoxGeometry(markerSize, markerHeight, markerSize);
                
            const markerMaterial = window.ThreeCompat ?
                window.ThreeCompat.createMaterial('MeshPhongMaterial', { 
                    color: marker.color,
                    emissive: marker.color,
                    emissiveIntensity: 0.8,  // 発光度を高くする
                    transparent: false
                }) :
                new THREE.MeshPhongMaterial({ 
                    color: marker.color,
                    emissive: marker.color,
                    transparent: false
                });
            
            const markerMesh = new THREE.Mesh(markerGeometry, markerMaterial);
            markerMesh.position.set(marker.x, markerHeight / 2, marker.z);
            markerMesh.userData = { type: 'marker' };
            this.scene.add(markerMesh);
            
            // 迷路データの値も確認
            const mazeValue = mazeData[marker.z] && mazeData[marker.z][marker.x] !== undefined ? 
                mazeData[marker.z][marker.x] : 'undefined';
            console.log(`🎯 ${marker.name}方向マーカー: 3D(${marker.x}, ${marker.z}) maze[${marker.z}][${marker.x}]=${mazeValue}`);
        });
        
        // プレイヤースタート位置にマーカー追加（大きくして目立たせる）
        const startMarkerGeometry = window.ThreeCompat ?
            window.ThreeCompat.createCylinderGeometry(0.4, 0.4, 0.3, 8) :
            new THREE.CylinderGeometry(0.4, 0.4, 0.3, 8);
            
        const startMarkerMaterial = window.ThreeCompat ?
            window.ThreeCompat.createMaterial('MeshPhongMaterial', { 
                color: 0xff00ff,
                emissive: 0xff00ff,
                transparent: false
            }) :
            new THREE.MeshPhongMaterial({ 
                color: 0xff00ff,
                emissive: 0xff00ff,
                transparent: false
            });
        
        const startMarker = new THREE.Mesh(startMarkerGeometry, startMarkerMaterial);
        startMarker.position.set(1.5, 0.15, 1.5);  // 少し高い位置に配置
        startMarker.userData = { type: 'marker' };
        this.scene.add(startMarker);
        console.log('🎯 プレイヤースタート位置マーカー: 3D(1.5, 1.5) - マゼンタ色');
        
        // デバッグ: 3D迷路の描画確認用
        console.log('📐 3D迷路描画状態確認:');
        console.log('  - シーン内オブジェクト数:', this.scene.children.length);
        console.log('  - カメラ位置:', this.camera.position);
        console.log('  - カメラ角度:', {
            x: (this.camera.rotation.x * 180 / Math.PI).toFixed(1) + '度',
            y: (this.camera.rotation.y * 180 / Math.PI).toFixed(1) + '度',
            z: (this.camera.rotation.z * 180 / Math.PI).toFixed(1) + '度'
        });
        
        // 壁の数をカウント + デバッグ強化
        let wallCount = 0;
        let floorCount = 0;
        let markerCount = 0;
        let totalMeshCount = 0;
        let unknownCount = 0;
        
        this.scene.traverse((object) => {
            if (object.isMesh) {
                totalMeshCount++;
                if (object.userData && object.userData.type === 'wall') {
                    wallCount++;
                } else if (object.userData && object.userData.type === 'floor') {
                    floorCount++;
                } else if (object.userData && object.userData.type === 'marker') {
                    markerCount++;
                } else {
                    unknownCount++;
                    // 最初の10個の不明オブジェクトをログ出力
                    if (unknownCount <= 10) {
                        console.log(`🔍 不明オブジェクト${unknownCount}:`, {
                            type: object.type,
                            userData: object.userData,
                            position: object.position,
                            geometry: object.geometry?.type
                        });
                    }
                }
            }
        });
        
        console.log(`  - 壁メッシュ: ${wallCount}個, 床メッシュ: ${floorCount}個, マーカー: ${markerCount}個`);
        console.log(`  - 総メッシュ数: ${totalMeshCount}個, 不明オブジェクト: ${unknownCount}個`);
    }
    
    createGoal(x, z) {
        // Enhanced goal object with glowing effect using compatibility layer
        const goalGeometry = window.ThreeCompat ?
            window.ThreeCompat.createCylinderGeometry(0.3, 0.3, 2, 16) :
            new THREE.CylinderGeometry(0.3, 0.3, 2, 16);
            
        const goalMaterial = window.ThreeCompat ?
            window.ThreeCompat.createMaterial('MeshPhongMaterial', { 
                color: 0xff6666,
                emissive: 0x441111,
                shininess: 100,
                transparent: false
            }) :
            new THREE.MeshPhongMaterial({ 
                color: 0xff6666,
                emissive: 0x441111,
                shininess: 100,
                transparent: false
            });
        
        this.goal = new THREE.Mesh(goalGeometry, goalMaterial);
        this.goal.position.set(x, 1, z);
        this.scene.add(this.goal);
        
        // Add a glowing ring around the goal for better visibility
        let ringGeometry;
        try {
            ringGeometry = (window.ThreeCompat && window.ThreeCompat.createRingGeometry) ?
                window.ThreeCompat.createRingGeometry(0.4, 0.6, 16) :
                new THREE.RingGeometry(0.4, 0.6, 16);
        } catch (ringError) {
            console.warn('RingGeometry creation failed, using PlaneGeometry fallback:', ringError);
            // Fallback to a simple plane geometry
            ringGeometry = window.ThreeCompat ?
                window.ThreeCompat.createPlaneGeometry(1.2, 1.2) :
                new THREE.PlaneGeometry(1.2, 1.2);
        }
            
        const ringMaterial = window.ThreeCompat ?
            window.ThreeCompat.createMaterial('MeshPhongMaterial', { 
                color: 0xff3333,
                emissive: 0x331111,
                transparent: true,
                opacity: 0.8,
                shininess: 50
            }) :
            new THREE.MeshPhongMaterial({ 
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
        const particleGeometry = window.ThreeCompat ?
            window.ThreeCompat.createSphereGeometry(0.05, 8, 8) :
            new THREE.SphereGeometry(0.05, 8, 8);
            
        const particleMaterial = window.ThreeCompat ?
            window.ThreeCompat.createMaterial('MeshPhongMaterial', {
                color: 0xff4444,
                emissive: 0x220000,
                transparent: true,
                opacity: 0.7
            }) :
            new THREE.MeshPhongMaterial({
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
        // グリッドセンターに強制配置
        const gridX = Math.floor(x);
        const gridZ = Math.floor(z);
        this.playerPosition.x = gridX + 0.5;
        this.playerPosition.z = gridZ + 0.5;
        
        console.log('プレイヤー位置設定 - グリッドセンター:', this.playerPosition.x, this.playerPosition.z);
        this.updateCameraPosition();
    }
    
    setPlayerRotation(rotation) {
        // 90度単位にスナップ（グリッド対応）
        const rotationStep = Math.PI / 2;
        const snapAngle = Math.round(rotation / rotationStep) * rotationStep;
        this.playerRotation = snapAngle;
        this.updateCameraPosition();
        console.log('プレイヤー角度設定:', (this.playerRotation * 180 / Math.PI).toFixed(0), '度');
    }
    
    updateCameraPosition() {
        if (!this.camera) return;

        this.camera.position.set(
            this.playerPosition.x,
            this.playerHeight,
            this.playerPosition.z
        );

        // 一人称視点: 水平方向を向く
        this.camera.rotation.y = this.playerRotation;
        
        // 水平視点（0度 = まっすぐ前を見る）
        this.camera.rotation.x = 0;

        if (this.playerLight) {
            this.playerLight.position.copy(this.camera.position);
            
            // オイラー角ベースでライト方向を計算
            const targetPosition = new THREE.Vector3(
                this.camera.position.x + Math.sin(this.playerRotation),
                this.camera.position.y,
                this.camera.position.z - Math.cos(this.playerRotation)
            );
            
            this.playerLight.target.position.copy(targetPosition);
            this.playerLight.target.updateMatrixWorld();
        }
    }
    
    // 強制レンダリング（キーボード移動の視覚的フィードバック改善）
    forceRender() {
        if (this.renderer && this.scene && this.camera) {
            console.log('🚀 強制レンダリング開始 - カメラ位置:', this.camera.position.x.toFixed(2), this.camera.position.y.toFixed(2), this.camera.position.z.toFixed(2));
            
            // 即座にレンダリング実行（requestAnimationFrameを使わない）
            try {
                this.renderer.render(this.scene, this.camera);
                console.log('🚀 強制レンダリング完了 - 成功');
            } catch (renderError) {
                console.error('🚀 強制レンダリングエラー:', renderError);
            }
            
            // 追加で次フレームでもレンダリング
            requestAnimationFrame(() => {
                try {
                    this.renderer.render(this.scene, this.camera);
                    console.log('🚀 追加レンダリング完了');
                } catch (renderError) {
                    console.error('🚀 追加レンダリングエラー:', renderError);
                }
            });
        } else {
            console.warn('⚠️ 強制レンダリング失敗 - コンポーネント不足:', {
                renderer: !!this.renderer,
                scene: !!this.scene, 
                camera: !!this.camera
            });
        }
    }
    
    // 移動時の視覚的フィードバック（軽微なカメラシェイク）
    addMovementFeedback() {
        if (!this.camera) return;
        
        const originalY = this.playerHeight;
        let shakeAmount = 0.02; // 基本の揺れ量
        let duration = 100; // 基本の持続時間
        
        // 移動タイプに応じてフィードバックを調整
        switch (this.movementType) {
            case 'normal':
                shakeAmount = 0.025; // 通常移動は少し大きめ
                break;
            case 'slide-x':
            case 'slide-z':
                shakeAmount = 0.015; // 壁滑り移動は小さめだが確実に感じられる
                duration = 150; // 少し長めの持続時間
                console.log('👆 壁滑り移動フィードバック:', this.movementType);
                break;
            case 'grid-move':
                shakeAmount = 0.03; // グリッド移動は明確なフィードバック
                duration = 120; // 少し長めの持続時間
                console.log('🎯 グリッド移動フィードバック');
                break;
            default:
                shakeAmount = 0.02;
        }
        
        // 短時間のシェイク効果
        this.camera.position.y = originalY + shakeAmount;
        
        setTimeout(() => {
            if (this.camera) {
                this.camera.position.y = originalY - shakeAmount * 0.5;
                setTimeout(() => {
                    if (this.camera) {
                        this.camera.position.y = originalY;
                    }
                }, duration / 2);
            }
        }, duration / 2);
        
        // 移動タイプをリセット
        this.movementType = null;
    }
    
    movePlayer(direction) {
        const moveStep = direction === 'forward' ? -1 : 1;  // 符号修正: forward/backwardの定義逆転
        const angle = this.playerRotation;

        // 完全修正済み移動ベクトル計算
        // Three.js座標系に合わせた正しい計算
        // 0度=北(Z-), 90度=東(X+), 180度=南(Z+), 270度=西(X-)
        const moveX = Math.round(Math.sin(angle));
        const moveZ = Math.round(-Math.cos(angle));
        
        console.log(`🔧 修正済み移動計算: ${direction}, 角度=${angle.toFixed(2)}, moveX=${moveX}, moveZ=${moveZ}`);

        // 現在のグリッド座標
        const currentGridX = Math.floor(this.playerPosition.x);
        const currentGridZ = Math.floor(this.playerPosition.z);

        // 移動先のグリッド座標を計算
        const targetGridX = currentGridX + (moveX * moveStep);
        const targetGridZ = currentGridZ + (moveZ * moveStep);

        // 移動先のワールド座標 (グリッドの中心)
        const targetWorldX = targetGridX + 0.5;
        const targetWorldZ = targetGridZ + 0.5;

        // 衝突判定
        if (this.canMoveTo(targetWorldX, targetWorldZ)) {
            this.playerPosition.x = targetWorldX;
            this.playerPosition.z = targetWorldZ;
            this.movementType = 'grid-move';

            this.updateCameraPosition();
            this.addMovementFeedback();
            this.checkGoal();
            return true;
        } else {
            // 移動できなかった場合でも、壁に向かってぶつかるフィードバックを追加
            this.addMovementFeedback();
            return false;
        }
    }
    
    rotatePlayer(direction) {
        if (this.isMoving) return;

        const rotationStep = Math.PI / 2; // 90度

        // 【最終修正点】左右の回転方向を正しくする
        // 左回転（反時計回り）は角度を増加させ、右回転（時計回り）は角度を減少させる
        if (direction === 'left') {
            this.playerRotation += rotationStep;
        } else if (direction === 'right') {
            this.playerRotation -= rotationStep;
        }

        // 角度を 0 ～ 2π の範囲に正規化
        this.playerRotation = (this.playerRotation + Math.PI * 4) % (Math.PI * 2);

        this.updateCameraPosition();
        console.log('🔄 プレイヤー回転:', (this.playerRotation * 180 / Math.PI).toFixed(0), '度');
    }
    
    canMoveTo(x, z) {
        if (!this.maze) {
            console.log('迷路データがありません');
            return false;
        }
        
        // 3D座標系に合わせた座標変換
        // 3D描画: maze[y][x] → Three.js(x, Y, y)
        // プレイヤー: (x, z) → maze座標では (x, z) → maze[z][x]
        const gridX = Math.floor(x);
        const gridY = Math.floor(z);  // zがmazeのy座標に対応
        
        console.log('🔧 修正済み座標チェック:', x.toFixed(2), z.toFixed(2), '-> グリッド:', gridX, gridY);
        
        // 境界チェック
        if (gridX < 0 || gridY < 0 || gridX >= this.maze.width || gridY >= this.maze.height) {
            console.log('境界外:', gridX, gridY);
            return false;
        }
        
        // 壁チェック - 正しい座標系
        console.log('🔍 修正済み座標系デバッグ:');
        console.log('  プレイヤー3D座標: (' + x + ', ' + z + ')');
        console.log('  計算グリッド座標: (x=' + gridX + ', y=' + gridY + ')');
        console.log('  迷路配列アクセス: maze[' + gridY + '][' + gridX + ']');
        
        const isWall = this.maze.isWall(gridX, gridY);
        console.log('グリッド(' + gridX + ',' + gridY + ')は壁か?', isWall);
        
        return !isWall;
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
        // ログを60フレームに1回だけ出力
        if ((this.frameCount || 0) % 60 === 0) {
            console.log('🎬 animate()関数 - フレーム:', this.frameCount || 0);
        }
        
        // 最初の呼び出しで必ずログ出力
        if (!this.animationStarted) {
            this.animationStarted = true;
            console.log('🎬 アニメーション初回開始!!! - 初期化完了');
            console.log('🎬 レンダラー存在確認:', !!this.renderer);
            console.log('🎬 シーン存在確認:', !!this.scene);
            console.log('🎬 カメラ存在確認:', !!this.camera);
        }
        
        requestAnimationFrame(() => this.animate());
        
        // FPS計算
        this.frameCount++;
        const currentTime = performance.now();
        
        // デバッグログは削減済み
        
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
            
            // FPS情報を30秒に1回出力
            if (this.frameCount % 1800 === 0) { // 30秒ごと（60fps想定）
                console.log('🎬 FPS:', this.fps, 'カメラ位置:', this.camera.position.x.toFixed(2), this.camera.position.y.toFixed(2), this.camera.position.z.toFixed(2));
            }
        } else {
            console.warn('⚠️ レンダリングコンポーネント不足:', {
                renderer: !!this.renderer,
                scene: !!this.scene, 
                camera: !!this.camera
            });
        }
        
        // UI更新
        if (window.uiManager) {
            window.uiManager.updateGameInfo({
                position: `${Math.round(this.playerPosition.x)}, ${Math.round(this.playerPosition.z)}`,
                direction: this.getDirectionName(),
                fps: this.fps
            });
        }
    }
    
    handleResize() {
        if (!this.camera || !this.renderer) return;
        
        const canvas = document.getElementById('gameCanvas3D');
        if (canvas) {
            const canvasWidth = window.innerWidth;
            const canvasHeight = window.innerHeight;
            
            this.camera.aspect = canvasWidth / canvasHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(canvasWidth, canvasHeight);
            console.log('Game engine resized to:', canvasWidth, 'x', canvasHeight);
        }
    }
    
    // 現在の回転角度に基づいて移動方向を取得
    getGridDirection() {
        const angle = this.playerRotation;
        // 角度を正規化して4方向にスナップ
        const normalizedAngle = ((angle + Math.PI / 4) % (Math.PI * 2)) / (Math.PI / 2);
        const direction = Math.floor(normalizedAngle);
        
        switch (direction) {
            case 0: return { x: 0, z: 1 };  // 北
            case 1: return { x: 1, z: 0 };  // 東
            case 2: return { x: 0, z: -1 }; // 南
            case 3: return { x: -1, z: 0 }; // 西
            default: return { x: 0, z: 1 }; // デフォルトは北
        }
    }

    newGame() {
        this.gameWon = false;
        // Don't reset position here - it should be set by caller with proper centering
        this.updateCameraPosition();
    }
    
    // ワイヤーフレームモードの切り替え
    toggleWireframeMode() {
        this.wireframeMode = !this.wireframeMode;
        console.log('ワイヤーフレームモード:', this.wireframeMode ? 'ON' : 'OFF');
        
        this.scene.traverse((object) => {
            if (object.isMesh && object.material) {
                if (this.wireframeMode) {
                    // 元のマテリアルを保存
                    if (!this.originalMaterials.has(object.uuid)) {
                        this.originalMaterials.set(object.uuid, object.material.clone());
                    }
                    // ワイヤーフレームモードに設定
                    object.material.wireframe = true;
                    object.material.color.setHex(0x00ff00);
                } else {
                    // 元のマテリアルに戻す
                    const originalMaterial = this.originalMaterials.get(object.uuid);
                    if (originalMaterial) {
                        object.material.wireframe = false;
                        object.material.color.copy(originalMaterial.color);
                        object.material.map = originalMaterial.map;
                    }
                }
            }
        });
        
        return this.wireframeMode;
    }
    
    // エラー状態シミュレーション
    simulateError(errorType) {
        console.log('エラーシミュレーション開始:', errorType);
        
        switch (errorType) {
            case 'rendering':
                // レンダリングエラーをシミュレート
                const originalClearColor = this.renderer.getClearColor().getHex();
                this.renderer.setClearColor(0xff0000); // 赤背景でエラー表示
                setTimeout(() => {
                    this.renderer.setClearColor(originalClearColor);
                }, 2000);
                break;
                
            case 'texture':
                // テクスチャエラーをシミュレート
                this.scene.traverse((object) => {
                    if (object.isMesh && object.material && object.material.map) {
                        const errorCanvas = document.createElement('canvas');
                        errorCanvas.width = 64;
                        errorCanvas.height = 64;
                        const ctx = errorCanvas.getContext('2d');
                        ctx.fillStyle = '#ff0000';
                        ctx.fillRect(0, 0, 64, 64);
                        ctx.fillStyle = '#ffffff';
                        ctx.font = '10px Arial';
                        ctx.fillText('ERROR', 10, 35);
                        
                        const errorTexture = new THREE.CanvasTexture(errorCanvas);
                        object.material.map = errorTexture;
                        object.material.needsUpdate = true;
                    }
                });
                break;
                
            case 'lighting':
                // ライティングエラーをシミュレート
                this.scene.traverse((object) => {
                    if (object.isLight) {
                        object.visible = false;
                    }
                });
                setTimeout(() => {
                    this.scene.traverse((object) => {
                        if (object.isLight) {
                            object.visible = true;
                        }
                    });
                }, 3000);
                break;
                
            case 'geometry':
                // ジオメトリエラーをシミュレート
                this.scene.traverse((object) => {
                    if (object.isMesh) {
                        object.scale.set(
                            0.5 + Math.random() * 1.5,
                            0.5 + Math.random() * 1.5,
                            0.5 + Math.random() * 1.5
                        );
                    }
                });
                break;
                
            default:
                console.warn('未知のエラータイプ:', errorType);
        }
    }
    
    // 検証スキーム実行
    runVerificationScheme() {
        console.log('検証スキーム実行開始...');
        const results = {
            timestamp: new Date().toISOString(),
            tests: []
        };
        
        // 基本レンダリング検証
        results.tests.push({
            name: 'レンダリング検証',
            status: this.renderer && this.scene && this.camera ? 'PASS' : 'FAIL',
            details: `レンダラー: ${!!this.renderer}, シーン: ${!!this.scene}, カメラ: ${!!this.camera}`
        });
        
        // シーンオブジェクト数検証
        let meshCount = 0;
        let lightCount = 0;
        this.scene.traverse((object) => {
            if (object.isMesh) meshCount++;
            if (object.isLight) lightCount++;
        });
        
        results.tests.push({
            name: 'シーンオブジェクト検証',
            status: meshCount > 0 && lightCount > 0 ? 'PASS' : 'FAIL',
            details: `メッシュ数: ${meshCount}, ライト数: ${lightCount}`
        });
        
        // メモリ使用量検証
        const memoryInfo = performance.memory ? {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        } : null;
        
        results.tests.push({
            name: 'メモリ使用量検証',
            status: memoryInfo && memoryInfo.used < memoryInfo.limit * 0.8 ? 'PASS' : 'WARNING',
            details: memoryInfo ? `使用量: ${memoryInfo.used}MB / ${memoryInfo.limit}MB` : 'メモリ情報なし'
        });
        
        // FPS検証
        results.tests.push({
            name: 'パフォーマンス検証',
            status: this.fps > 30 ? 'PASS' : this.fps > 15 ? 'WARNING' : 'FAIL',
            details: `FPS: ${this.fps}`
        });
        
        console.log('検証結果:', results);
        return results;
    }
}

// グローバルに公開
window.GameEngine = GameEngine;
}