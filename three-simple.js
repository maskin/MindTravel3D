// Simple Three.js-compatible implementation for 3D maze game
(function() {
    'use strict';
    
    // Basic Vector3
    function Vector3(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    
    Vector3.prototype.set = function(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    };
    
    Vector3.prototype.copy = function(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    };
    
    Vector3.prototype.add = function(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    };
    
    Vector3.prototype.normalize = function() {
        const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        if (length > 0) {
            this.x /= length;
            this.y /= length;
            this.z /= length;
        }
        return this;
    };
    
    // Basic Color
    function Color(color = 0xffffff) {
        this.r = ((color >> 16) & 255) / 255;
        this.g = ((color >> 8) & 255) / 255;
        this.b = (color & 255) / 255;
    }
    
    // Object3D base
    function Object3D() {
        this.position = new Vector3();
        this.rotation = new Vector3();
        this.scale = new Vector3(1, 1, 1);
        this.children = [];
        this.parent = null;
        this.visible = true;
        this.castShadow = false;
        this.receiveShadow = false;
    }
    
    Object3D.prototype.add = function(object) {
        this.children.push(object);
        object.parent = this;
    };
    
    Object3D.prototype.remove = function(object) {
        const index = this.children.indexOf(object);
        if (index > -1) {
            this.children.splice(index, 1);
            object.parent = null;
        }
    };
    
    Object3D.prototype.traverse = function(callback) {
        callback(this);
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].traverse(callback);
        }
    };
    
    Object3D.prototype.updateMatrixWorld = function() {
        // Update world matrix (simplified implementation)
        // In real Three.js this would update the object's world transformation matrix
    };
    
    // Scene
    function Scene() {
        Object3D.call(this);
        this.fog = null;
    }
    Scene.prototype = Object.create(Object3D.prototype);
    Scene.prototype.constructor = Scene;
    
    // Camera
    function PerspectiveCamera(fov = 50, aspect = 1, near = 0.1, far = 2000) {
        Object3D.call(this);
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.lookDirection = new Vector3(0, 0, -1);
    }
    PerspectiveCamera.prototype = Object.create(Object3D.prototype);
    PerspectiveCamera.prototype.constructor = PerspectiveCamera;
    
    PerspectiveCamera.prototype.updateProjectionMatrix = function() {
        // Basic projection matrix update (simplified)
    };
    
    PerspectiveCamera.prototype.lookAt = function(x, y, z) {
        if (typeof x === 'object') {
            this.lookDirection.x = x.x - this.position.x;
            this.lookDirection.y = x.y - this.position.y;
            this.lookDirection.z = x.z - this.position.z;
        } else {
            this.lookDirection.x = x - this.position.x;
            this.lookDirection.y = y - this.position.y;
            this.lookDirection.z = z - this.position.z;
        }
        this.lookDirection.normalize();
    };
    
    // Materials
    function Material() {
        this.color = new Color();
        this.transparent = false;
        this.opacity = 1.0;
    }
    
    function MeshLambertMaterial(parameters = {}) {
        Material.call(this);
        if (parameters.color !== undefined) this.color = new Color(parameters.color);
        if (parameters.transparent !== undefined) this.transparent = parameters.transparent;
        if (parameters.emissive !== undefined) this.emissive = new Color(parameters.emissive);
    }
    MeshLambertMaterial.prototype = Object.create(Material.prototype);
    MeshLambertMaterial.prototype.constructor = MeshLambertMaterial;
    
    // Geometries
    function Geometry() {
        this.type = 'Geometry';
    }
    
    function BoxGeometry(width = 1, height = 1, depth = 1) {
        Geometry.call(this);
        this.type = 'BoxGeometry';
        this.width = width;
        this.height = height;
        this.depth = depth;
    }
    BoxGeometry.prototype = Object.create(Geometry.prototype);
    BoxGeometry.prototype.constructor = BoxGeometry;
    
    function PlaneGeometry(width = 1, height = 1) {
        Geometry.call(this);
        this.type = 'PlaneGeometry';
        this.width = width;
        this.height = height;
    }
    PlaneGeometry.prototype = Object.create(Geometry.prototype);
    PlaneGeometry.prototype.constructor = PlaneGeometry;
    
    function CylinderGeometry(radiusTop = 1, radiusBottom = 1, height = 1, radialSegments = 8) {
        Geometry.call(this);
        this.type = 'CylinderGeometry';
        this.radiusTop = radiusTop;
        this.radiusBottom = radiusBottom;
        this.height = height;
        this.radialSegments = radialSegments;
    }
    CylinderGeometry.prototype = Object.create(Geometry.prototype);
    CylinderGeometry.prototype.constructor = CylinderGeometry;
    
    // Mesh
    function Mesh(geometry, material) {
        Object3D.call(this);
        this.geometry = geometry;
        this.material = material;
    }
    Mesh.prototype = Object.create(Object3D.prototype);
    Mesh.prototype.constructor = Mesh;
    
    // Lights
    function Light(color = 0xffffff, intensity = 1) {
        Object3D.call(this);
        this.color = new Color(color);
        this.intensity = intensity;
    }
    Light.prototype = Object.create(Object3D.prototype);
    Light.prototype.constructor = Light;
    
    function AmbientLight(color = 0xffffff, intensity = 1) {
        Light.call(this, color, intensity);
    }
    AmbientLight.prototype = Object.create(Light.prototype);
    AmbientLight.prototype.constructor = AmbientLight;
    
    function DirectionalLight(color = 0xffffff, intensity = 1) {
        Light.call(this, color, intensity);
        this.target = new Object3D();
        this.shadow = {
            mapSize: { width: 512, height: 512 },
            camera: { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 500 }
        };
        this.castShadow = false;
    }
    DirectionalLight.prototype = Object.create(Light.prototype);
    DirectionalLight.prototype.constructor = DirectionalLight;
    
    function SpotLight(color = 0xffffff, intensity = 1, distance = 0, angle = Math.PI / 3, penumbra = 0) {
        Light.call(this, color, intensity);
        this.distance = distance;
        this.angle = angle;
        this.penumbra = penumbra;
        this.target = new Object3D();
        this.shadow = {
            mapSize: { width: 512, height: 512 },
            camera: { near: 0.5, far: 500 }
        };
        this.castShadow = false;
    }
    SpotLight.prototype = Object.create(Light.prototype);
    SpotLight.prototype.constructor = SpotLight;
    
    function PointLight(color = 0xffffff, intensity = 1, distance = 0) {
        Light.call(this, color, intensity);
        this.distance = distance;
    }
    PointLight.prototype = Object.create(Light.prototype);
    PointLight.prototype.constructor = PointLight;
    
    // Fog
    function Fog(color = 0xffffff, near = 1, far = 1000) {
        this.color = new Color(color);
        this.near = near;
        this.far = far;
    }
    
    // WebGL Renderer with 2D Canvas Fallback
    function WebGLRenderer(parameters = {}) {
        this.canvas = parameters.canvas;
        this.context = null;
        this.shadowMap = {
            enabled: false,
            type: 'PCFSoftShadowMap'
        };
        
        // Try WebGL, fallback to 2D
        this.isWebGL = false;
        try {
            this.context = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
            if (this.context) {
                this.isWebGL = true;
                console.log('Using WebGL renderer');
            }
        } catch (e) {
            console.log('WebGL not available');
        }
        
        if (!this.isWebGL) {
            this.context = this.canvas.getContext('2d');
            console.log('Using 2D Canvas fallback renderer');
        }
        
        this.clearColor = new Color(0x000000);
    }
    
    WebGLRenderer.prototype.setSize = function(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
    };
    
    WebGLRenderer.prototype.setPixelRatio = function(ratio) {
        // Store pixel ratio if needed
    };
    
    WebGLRenderer.prototype.setClearColor = function(color) {
        this.clearColor = new Color(color);
    };
    
    WebGLRenderer.prototype.render = function(scene, camera) {
        if (this.isWebGL) {
            this.renderWebGL(scene, camera);
        } else {
            this.render2D(scene, camera);
        }
    };
    
    WebGLRenderer.prototype.renderWebGL = function(scene, camera) {
        const gl = this.context;
        gl.clearColor(this.clearColor.r, this.clearColor.g, this.clearColor.b, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // Basic WebGL rendering would go here
        // For now, just clear the screen
    };
    
    WebGLRenderer.prototype.render2D = function(scene, camera) {
        const ctx = this.context;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear canvas with dark background
        ctx.fillStyle = `rgb(${Math.floor(this.clearColor.r * 255)}, ${Math.floor(this.clearColor.g * 255)}, ${Math.floor(this.clearColor.b * 255)})`;
        ctx.fillRect(0, 0, width, height);
        
        // Camera info
        const camX = camera.position.x;
        const camZ = camera.position.z;
        const camY = camera.position.y;
        
        // Calculate view direction
        let viewAngle = 0;
        if (camera.lookDirection) {
            viewAngle = Math.atan2(camera.lookDirection.x, camera.lookDirection.z);
        }
        
        // First-person perspective rendering
        const centerX = width / 2;
        const centerY = height / 2;
        const maxDistance = 8; // How far we can see
        const rayCount = width; // One ray per horizontal pixel for smooth walls
        
        // Cast rays for each column of pixels
        for (let x = 0; x < width; x++) {
            // Calculate ray angle for this column
            const rayAngle = viewAngle + (x - centerX) * (Math.PI / 3) / width; // 60-degree FOV
            
            // Ray direction
            const rayDx = Math.sin(rayAngle);
            const rayDz = Math.cos(rayAngle);
            
            // Cast ray to find wall
            let distance = 0;
            let hitWall = false;
            let isGoal = false;
            let wallColor = '#cccccc';
            
            for (let step = 0; step < maxDistance * 20; step++) {
                distance = step * 0.05;
                const testX = camX + rayDx * distance;
                const testZ = camZ + rayDz * distance;
                
                const gridX = Math.floor(testX);
                const gridZ = Math.floor(testZ);
                
                // Check if we hit a wall
                let hitObstacle = false;
                
                // Check maze walls
                scene.traverse((object) => {
                    if (object.geometry && object.geometry.type === 'BoxGeometry' && 
                        Math.floor(object.position.x) === gridX && 
                        Math.floor(object.position.z) === gridZ) {
                        hitObstacle = true;
                        if (object.material && object.material.color) {
                            const c = object.material.color;
                            wallColor = `rgb(${Math.floor(c.r * 255)}, ${Math.floor(c.g * 255)}, ${Math.floor(c.b * 255)})`;
                        }
                    }
                    
                    // Check if we hit the goal
                    if (object.geometry && object.geometry.type === 'CylinderGeometry' && 
                        Math.abs(object.position.x - testX) < 0.5 && 
                        Math.abs(object.position.z - testZ) < 0.5) {
                        hitObstacle = true;
                        isGoal = true;
                        wallColor = '#ff4444';
                    }
                });
                
                if (hitObstacle || distance >= maxDistance) {
                    hitWall = true;
                    break;
                }
            }
            
            // Calculate wall height based on distance
            const wallHeight = Math.min(height, height / (distance + 0.1));
            const wallTop = centerY - wallHeight / 2;
            const wallBottom = centerY + wallHeight / 2;
            
            // Apply distance fog
            const fogFactor = Math.max(0, 1 - distance / maxDistance);
            const baseColor = wallColor === '#ff4444' ? [255, 68, 68] : 
                             wallColor === '#cccccc' ? [204, 204, 204] : [68, 68, 68];
            
            const foggedR = Math.floor(baseColor[0] * fogFactor + this.clearColor.r * 255 * (1 - fogFactor));
            const foggedG = Math.floor(baseColor[1] * fogFactor + this.clearColor.g * 255 * (1 - fogFactor));
            const foggedB = Math.floor(baseColor[2] * fogFactor + this.clearColor.b * 255 * (1 - fogFactor));
            
            // Draw wall column
            ctx.fillStyle = `rgb(${foggedR}, ${foggedG}, ${foggedB})`;
            ctx.fillRect(x, wallTop, 1, wallBottom - wallTop);
            
            // Draw floor
            if (wallBottom < height) {
                const floorGradient = ctx.createLinearGradient(0, wallBottom, 0, height);
                floorGradient.addColorStop(0, '#004400');
                floorGradient.addColorStop(1, '#002200');
                ctx.fillStyle = floorGradient;
                ctx.fillRect(x, wallBottom, 1, height - wallBottom);
            }
            
            // Draw ceiling
            if (wallTop > 0) {
                const ceilingGradient = ctx.createLinearGradient(0, 0, 0, wallTop);
                ceilingGradient.addColorStop(0, '#222222');
                ceilingGradient.addColorStop(1, '#111111');
                ctx.fillStyle = ceilingGradient;
                ctx.fillRect(x, 0, 1, wallTop);
            }
        }
        
        // Draw crosshair
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - 10, centerY);
        ctx.lineTo(centerX + 10, centerY);
        ctx.moveTo(centerX, centerY - 10);
        ctx.lineTo(centerX, centerY + 10);
        ctx.stroke();
        
        // Draw mini-map in top-right corner
        this.drawMiniMap(ctx, scene, camera, width - 120, 10, 100, 100);
    };
    
    WebGLRenderer.prototype.drawMiniMap = function(ctx, scene, camera, x, y, w, h) {
        // Save context
        ctx.save();
        
        // Create clipping region for mini-map
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        
        // Fill background
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y, w, h);
        
        // Calculate map scale
        const mapScale = 2; // cells per pixel
        const centerX = x + w / 2;
        const centerY = y + h / 2;
        
        // Draw maze walls
        scene.traverse((object) => {
            if (object.geometry && object.geometry.type === 'BoxGeometry') {
                const mapX = centerX + (object.position.x - camera.position.x) / mapScale;
                const mapZ = centerY + (object.position.z - camera.position.z) / mapScale;
                
                if (mapX >= x && mapX <= x + w && mapZ >= y && mapZ <= y + h) {
                    ctx.fillStyle = '#888888';
                    ctx.fillRect(mapX - 1, mapZ - 1, 2, 2);
                }
            }
            
            // Draw goal
            if (object.geometry && object.geometry.type === 'CylinderGeometry') {
                const mapX = centerX + (object.position.x - camera.position.x) / mapScale;
                const mapZ = centerY + (object.position.z - camera.position.z) / mapScale;
                
                if (mapX >= x && mapX <= x + w && mapZ >= y && mapZ <= y + h) {
                    ctx.fillStyle = '#ff4444';
                    ctx.beginPath();
                    ctx.arc(mapX, mapZ, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });
        
        // Draw player position and direction
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw direction arrow
        const dirLength = 8;
        const dirAngle = Math.atan2(camera.lookDirection.x, camera.lookDirection.z);
        const dirEndX = centerX + Math.sin(dirAngle) * dirLength;
        const dirEndY = centerY + Math.cos(dirAngle) * dirLength;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(dirEndX, dirEndY);
        ctx.stroke();
        
        // Draw border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
        
        // Restore context
        ctx.restore();
    };
    
    // Constants
    const PCFSoftShadowMap = 'PCFSoftShadowMap';
    
    // Export to global THREE object
    window.THREE = {
        Vector3: Vector3,
        Color: Color,
        Object3D: Object3D,
        Scene: Scene,
        PerspectiveCamera: PerspectiveCamera,
        MeshLambertMaterial: MeshLambertMaterial,
        BoxGeometry: BoxGeometry,
        PlaneGeometry: PlaneGeometry,
        CylinderGeometry: CylinderGeometry,
        Mesh: Mesh,
        AmbientLight: AmbientLight,
        DirectionalLight: DirectionalLight,
        SpotLight: SpotLight,
        PointLight: PointLight,
        Fog: Fog,
        WebGLRenderer: WebGLRenderer,
        PCFSoftShadowMap: PCFSoftShadowMap
    };
    
    console.log('Three.js-compatible library loaded successfully');
})();