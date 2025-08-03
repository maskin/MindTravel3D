/**
 * Three.js Compatibility Layer
 * 
 * This compatibility layer provides a smooth transition between the custom
 * Three.js implementation and the official Three.js library (r170).
 * 
 * Features:
 * - API compatibility for geometry classes
 * - Color space management for materials and textures
 * - Renderer configuration for new color space handling
 * - Backward compatibility checks
 */

if (typeof window.ThreeCompatibility === 'undefined') {
class ThreeCompatibility {
    constructor() {
        this.threeVersion = this.detectThreeVersion();
        this.isOfficial = this.isOfficialThree();
        
        console.log('Three.js Compatibility Layer initialized:', {
            version: this.threeVersion,
            isOfficial: this.isOfficial,
            features: this.getAvailableFeatures()
        });
    }
    
    /**
     * Detect Three.js version
     */
    detectThreeVersion() {
        if (typeof THREE === 'undefined') {
            return null;
        }
        
        // Check for official Three.js version property
        if (THREE.REVISION) {
            return `r${THREE.REVISION}`;
        }
        
        // Check for custom implementation version (from console log)
        if (typeof THREE.version === 'string') {
            return THREE.version;
        }
        
        return 'unknown';
    }
    
    /**
     * Check if using official Three.js library
     */
    isOfficialThree() {
        return typeof THREE !== 'undefined' && 
               typeof THREE.REVISION !== 'undefined' &&
               typeof THREE.WebGLRenderer === 'function';
    }
    
    /**
     * Get available Three.js features
     */
    getAvailableFeatures() {
        if (typeof THREE === 'undefined') return {};
        
        return {
            Scene: typeof THREE.Scene,
            PerspectiveCamera: typeof THREE.PerspectiveCamera,
            WebGLRenderer: typeof THREE.WebGLRenderer,
            BoxGeometry: typeof THREE.BoxGeometry,
            PlaneGeometry: typeof THREE.PlaneGeometry,
            CylinderGeometry: typeof THREE.CylinderGeometry,
            SphereGeometry: typeof THREE.SphereGeometry,
            MeshPhongMaterial: typeof THREE.MeshPhongMaterial,
            MeshBasicMaterial: typeof THREE.MeshBasicMaterial,
            CanvasTexture: typeof THREE.CanvasTexture,
            TextureLoader: typeof THREE.TextureLoader,
            AmbientLight: typeof THREE.AmbientLight,
            DirectionalLight: typeof THREE.DirectionalLight,
            Mesh: typeof THREE.Mesh,
            Vector3: typeof THREE.Vector3
        };
    }
    
    /**
     * Create compatible WebGL Renderer with proper color space handling
     */
    createRenderer(options = {}) {
        const defaultOptions = {
            antialias: true,
            alpha: true,
            premultipliedAlpha: false,
            preserveDrawingBuffer: false,
            ...options
        };
        
        const renderer = new THREE.WebGLRenderer(defaultOptions);
        
        // Handle color space configuration
        this.configureColorSpace(renderer);
        
        // Enable shadows if available
        if (renderer.shadowMap) {
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = this.getShadowMapType();
        }
        
        console.log('Compatible renderer created:', {
            colorSpace: this.getRendererColorSpace(renderer),
            shadowsEnabled: renderer.shadowMap ? renderer.shadowMap.enabled : false
        });
        
        return renderer;
    }
    
    /**
     * Configure color space for renderer
     */
    configureColorSpace(renderer) {
        if (this.isOfficial && typeof THREE.SRGBColorSpace !== 'undefined') {
            // Official Three.js r152+ approach
            renderer.outputColorSpace = THREE.SRGBColorSpace;
        } else if (typeof THREE.sRGBEncoding !== 'undefined') {
            // Fallback for older versions
            renderer.outputEncoding = THREE.sRGBEncoding;
        }
        // Custom implementation doesn't need specific color space config
    }
    
    /**
     * Get appropriate shadow map type
     */
    getShadowMapType() {
        if (typeof THREE.PCFSoftShadowMap !== 'undefined') {
            return THREE.PCFSoftShadowMap;
        } else if (typeof THREE.PCFShadowMap !== 'undefined') {
            return THREE.PCFShadowMap;
        }
        // Fallback for custom implementation
        return THREE.BasicShadowMap || 0;
    }
    
    /**
     * Get renderer color space setting
     */
    getRendererColorSpace(renderer) {
        if (renderer.outputColorSpace) {
            return renderer.outputColorSpace;
        } else if (renderer.outputEncoding) {
            return `encoding:${renderer.outputEncoding}`;
        }
        return 'default';
    }
    
    /**
     * Create compatible geometry with proper BufferGeometry handling
     */
    createBoxGeometry(width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1) {
        const geometry = new THREE.BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments);
        
        // Ensure we're working with BufferGeometry
        if (!geometry.isBufferGeometry && geometry.toBufferGeometry) {
            return geometry.toBufferGeometry();
        }
        
        return geometry;
    }
    
    /**
     * Create compatible plane geometry
     */
    createPlaneGeometry(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
        const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
        
        if (!geometry.isBufferGeometry && geometry.toBufferGeometry) {
            return geometry.toBufferGeometry();
        }
        
        return geometry;
    }
    
    /**
     * Create compatible cylinder geometry
     */
    createCylinderGeometry(radiusTop = 1, radiusBottom = 1, height = 1, radialSegments = 32, heightSegments = 1, openEnded = false, thetaStart = 0, thetaLength = Math.PI * 2) {
        const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength);
        
        if (!geometry.isBufferGeometry && geometry.toBufferGeometry) {
            return geometry.toBufferGeometry();
        }
        
        return geometry;
    }
    
    /**
     * Create compatible sphere geometry
     */
    createSphereGeometry(radius = 1, widthSegments = 32, heightSegments = 16, phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI) {
        const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength);
        
        if (!geometry.isBufferGeometry && geometry.toBufferGeometry) {
            return geometry.toBufferGeometry();
        }
        
        return geometry;
    }
    
    /**
     * Create compatible ring geometry
     */
    createRingGeometry(innerRadius = 0.5, outerRadius = 1, thetaSegments = 32, phiSegments = 1, thetaStart = 0, thetaLength = Math.PI * 2) {
        if (!THREE.RingGeometry) {
            // Fallback: create a simple circular plane
            console.warn('RingGeometry not available, using PlaneGeometry fallback');
            return this.createPlaneGeometry(outerRadius * 2, outerRadius * 2);
        }
        
        const geometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength);
        
        if (!geometry.isBufferGeometry && geometry.toBufferGeometry) {
            return geometry.toBufferGeometry();
        }
        
        return geometry;
    }
    
    /**
     * Create compatible material with color space handling
     */
    createMaterial(type, parameters = {}) {
        let material;
        
        switch (type) {
            case 'MeshPhongMaterial':
                material = new THREE.MeshPhongMaterial(parameters);
                break;
            case 'MeshBasicMaterial':
                material = new THREE.MeshBasicMaterial(parameters);
                break;
            case 'MeshStandardMaterial':
                if (THREE.MeshStandardMaterial) {
                    material = new THREE.MeshStandardMaterial(parameters);
                } else {
                    // Fallback to Phong for custom implementation
                    material = new THREE.MeshPhongMaterial(parameters);
                }
                break;
            default:
                material = new THREE.MeshBasicMaterial(parameters);
        }
        
        // Handle texture color space
        this.configureTextureColorSpace(material);
        
        return material;
    }
    
    /**
     * Configure texture color space for materials
     */
    configureTextureColorSpace(material) {
        const textureProperties = ['map', 'normalMap', 'bumpMap', 'displacementMap', 'emissiveMap', 'specularMap'];
        
        textureProperties.forEach(prop => {
            if (material[prop] && this.isOfficial) {
                // Set color space for diffuse textures
                if (prop === 'map' && typeof THREE.SRGBColorSpace !== 'undefined') {
                    material[prop].colorSpace = THREE.SRGBColorSpace;
                }
                // Other maps typically use linear color space
                else if (prop !== 'map' && typeof THREE.LinearSRGBColorSpace !== 'undefined') {
                    material[prop].colorSpace = THREE.LinearSRGBColorSpace;
                }
            }
        });
    }
    
    /**
     * Create compatible canvas texture
     */
    createCanvasTexture(canvas) {
        const texture = new THREE.CanvasTexture(canvas);
        
        // Configure color space for official Three.js
        if (this.isOfficial && typeof THREE.SRGBColorSpace !== 'undefined') {
            texture.colorSpace = THREE.SRGBColorSpace;
        }
        
        // Set appropriate wrap and filter modes
        if (texture.wrapS !== undefined) {
            texture.wrapS = THREE.ClampToEdgeWrapping || texture.wrapS;
            texture.wrapT = THREE.ClampToEdgeWrapping || texture.wrapT;
        }
        
        return texture;
    }
    
    /**
     * Create compatible directional light with enhanced shadow support
     */
    createDirectionalLight(color, intensity = 1) {
        const light = new THREE.DirectionalLight(color, intensity);
        
        // Configure shadows for official Three.js
        if (this.isOfficial && light.shadow) {
            light.castShadow = true;
            light.shadow.mapSize.width = 2048;
            light.shadow.mapSize.height = 2048;
            light.shadow.camera.near = 0.5;
            light.shadow.camera.far = 500;
            
            // Set shadow camera bounds for better shadow quality
            const d = 50;
            light.shadow.camera.left = -d;
            light.shadow.camera.right = d;
            light.shadow.camera.top = d;
            light.shadow.camera.bottom = -d;
        }
        
        return light;
    }
    
    /**
     * Create compatible ambient light
     */
    createAmbientLight(color, intensity = 1) {
        return new THREE.AmbientLight(color, intensity);
    }
    
    /**
     * Log compatibility information
     */
    logInfo() {
        console.log('Three.js Compatibility Layer Info:', {
            version: this.threeVersion,
            isOfficial: this.isOfficial,
            colorSpaceSupport: {
                SRGBColorSpace: typeof THREE.SRGBColorSpace !== 'undefined',
                LinearSRGBColorSpace: typeof THREE.LinearSRGBColorSpace !== 'undefined',
                sRGBEncoding: typeof THREE.sRGBEncoding !== 'undefined'
            },
            shadowSupport: {
                PCFSoftShadowMap: typeof THREE.PCFSoftShadowMap !== 'undefined',
                PCFShadowMap: typeof THREE.PCFShadowMap !== 'undefined',
                BasicShadowMap: typeof THREE.BasicShadowMap !== 'undefined'
            },
            geometrySupport: {
                BufferGeometry: typeof THREE.BufferGeometry !== 'undefined',
                Geometry: typeof THREE.Geometry !== 'undefined'
            }
        });
    }
}

// Global compatibility instance
window.ThreeCompatibility = ThreeCompatibility;
window.ThreeCompat = new ThreeCompatibility();
}

// Auto-log info when loaded
if (typeof THREE !== 'undefined') {
    window.ThreeCompat.logInfo();
}

console.log('Three.js Compatibility Layer loaded successfully');