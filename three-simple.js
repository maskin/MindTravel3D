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
        
        // Clear canvas
        ctx.fillStyle = `rgb(${Math.floor(this.clearColor.r * 255)}, ${Math.floor(this.clearColor.g * 255)}, ${Math.floor(this.clearColor.b * 255)})`;
        ctx.fillRect(0, 0, width, height);
        
        // Simple 3D to 2D projection
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = 15;
        
        // Camera info
        const camX = camera.position.x;
        const camZ = camera.position.z;
        const camY = camera.position.y;
        
        // Calculate view direction
        let viewAngle = 0;
        if (camera.lookDirection) {
            viewAngle = Math.atan2(camera.lookDirection.x, camera.lookDirection.z);
        }
        
        // Render objects
        const objectsToRender = [];
        scene.traverse((object) => {
            if (object.geometry && object.material && object.visible) {
                objectsToRender.push(object);
            }
        });
        
        // Sort by distance from camera
        objectsToRender.sort((a, b) => {
            const distA = Math.sqrt(Math.pow(a.position.x - camX, 2) + Math.pow(a.position.z - camZ, 2));
            const distB = Math.sqrt(Math.pow(b.position.x - camX, 2) + Math.pow(b.position.z - camZ, 2));
            return distB - distA; // Far to near
        });
        
        // Render each object
        objectsToRender.forEach((object) => {
            const dx = object.position.x - camX;
            const dz = object.position.z - camZ;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance > 20) return; // Skip distant objects
            
            // Simple perspective projection
            const relativeAngle = Math.atan2(dx, dz) - viewAngle;
            const projectedX = centerX + Math.sin(relativeAngle) * distance * scale;
            const projectedY = centerY - (object.position.y - camY) * scale / (1 + distance * 0.1);
            
            // Set color based on material
            let colorHex = 0xffffff;
            if (object.material && object.material.color) {
                colorHex = (Math.floor(object.material.color.r * 255) << 16) |
                          (Math.floor(object.material.color.g * 255) << 8) |
                          Math.floor(object.material.color.b * 255);
            }
            
            // Apply distance fog
            const fogFactor = Math.max(0, 1 - distance / 15);
            const r = Math.floor((colorHex >> 16) & 255);
            const g = Math.floor((colorHex >> 8) & 255);
            const b = Math.floor(colorHex & 255);
            
            const foggedR = Math.floor(r * fogFactor + this.clearColor.r * 255 * (1 - fogFactor));
            const foggedG = Math.floor(g * fogFactor + this.clearColor.g * 255 * (1 - fogFactor));
            const foggedB = Math.floor(b * fogFactor + this.clearColor.b * 255 * (1 - fogFactor));
            
            ctx.fillStyle = `rgb(${foggedR}, ${foggedG}, ${foggedB})`;
            
            // Render based on geometry type
            if (object.geometry.type === 'BoxGeometry') {
                const size = Math.max(5, 30 / (1 + distance * 0.3));
                ctx.fillRect(projectedX - size/2, projectedY - size, size, size * 2);
            } else if (object.geometry.type === 'PlaneGeometry') {
                const size = Math.max(3, 20 / (1 + distance * 0.2));
                ctx.fillRect(projectedX - size/2, projectedY - size/2, size, size);
            } else if (object.geometry.type === 'CylinderGeometry') {
                const size = Math.max(4, 25 / (1 + distance * 0.3));
                ctx.beginPath();
                ctx.arc(projectedX, projectedY, size/2, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // Draw crosshair
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - 10, centerY);
        ctx.lineTo(centerX + 10, centerY);
        ctx.moveTo(centerX, centerY - 10);
        ctx.lineTo(centerX, centerY + 10);
        ctx.stroke();
        
        // Draw position info
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.fillText(`Position: (${camX.toFixed(1)}, ${camZ.toFixed(1)})`, 10, 30);
        ctx.fillText(`Angle: ${(viewAngle * 180 / Math.PI).toFixed(0)}°`, 10, 50);
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