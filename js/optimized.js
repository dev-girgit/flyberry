/**
 * Optimized JavaScript for Flyberry website
 * Includes lazy loading, WebP support, and performance optimizations
 */

// WebP support detection
function supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('webp') !== -1;
}

// Lazy loading for images
class LazyImageLoader {
    constructor() {
        this.isWebPSupported = supportsWebP();
        this.observer = null;
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            this.setupLazyImages();
        } else {
            // Fallback for older browsers
            this.loadAllImages();
        }
    }

    setupLazyImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => this.observer.observe(img));
    }

    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        // Use WebP if supported
        if (this.isWebPSupported && img.dataset.webp) {
            img.src = img.dataset.webp;
        } else {
            img.src = src;
        }

        img.classList.add('loaded');
        img.removeAttribute('data-src');
        img.removeAttribute('data-webp');
    }

    loadAllImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => this.loadImage(img));
    }
}

// Optimized Fireworks System (reduced complexity)
class OptimizedFireworks {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.fireworks = [];
        this.animationId = null;
        this.isLowPowerMode = this.detectLowPowerMode();
    }

    detectLowPowerMode() {
        // Reduce effects on mobile or low-power devices
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               navigator.hardwareConcurrency < 4;
    }

    init() {
        if (!window.THREE) {
            console.log('Three.js not loaded, skipping fireworks');
            return;
        }

        try {
            // Scene setup
            this.scene = new THREE.Scene();
            
            // Camera with perspective for 3D depth
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.camera.position.z = 50;
            this.camera.position.y = -10;
            
            // Renderer with optimizations
            const canvas = document.getElementById('fireworks-canvas');
            this.renderer = new THREE.WebGLRenderer({ 
                canvas: canvas, 
                alpha: true, 
                antialias: !this.isLowPowerMode,
                powerPreference: this.isLowPowerMode ? 'low-power' : 'high-performance'
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setClearColor(0x000000, 0);
            
            // Start animation
            this.animate();
            
            // Reduce firework frequency on low-power devices
            const interval = this.isLowPowerMode ? 2000 : 1200;
            setInterval(() => this.createFirework(), interval);
            
            // Launch initial burst (reduced on mobile)
            setTimeout(() => {
                const count = this.isLowPowerMode ? 1 : 3;
                for(let i = 0; i < count; i++) {
                    setTimeout(() => this.createFirework(), i * 300);
                }
            }, 1000);

        } catch (error) {
            console.log('Fireworks initialization failed:', error);
        }
    }

    createFirework() {
        if (this.fireworks.length > (this.isLowPowerMode ? 2 : 5)) {
            return; // Limit concurrent fireworks
        }

        const firework = {
            particles: [],
            launched: false,
            exploded: false,
            rocket: null
        };
        
        // Launch position (bottom of screen, random X)
        const startX = (Math.random() - 0.5) * 80;
        const startY = -40;
        const startZ = (Math.random() - 0.5) * 60;
        
        // Target position (random in upper area)
        const targetX = startX + (Math.random() - 0.5) * 20;
        const targetY = Math.random() * 20 + 10;
        const targetZ = startZ + (Math.random() - 0.5) * 30;
        
        // Create rocket particle
        const rocketGeometry = new THREE.SphereGeometry(0.3, 8, 6);
        const rocketMaterial = new THREE.MeshBasicMaterial({ 
            color: new THREE.Color().setHSL(Math.random(), 0.8, 0.9),
            transparent: true,
            opacity: 0.9
        });
        const rocket = new THREE.Mesh(rocketGeometry, rocketMaterial);
        rocket.position.set(startX, startY, startZ);
        this.scene.add(rocket);
        
        firework.rocket = rocket;
        firework.startPos = { x: startX, y: startY, z: startZ };
        firework.targetPos = { x: targetX, y: targetY, z: targetZ };
        firework.launchTime = Date.now();
        
        this.fireworks.push(firework);
    }

    explodeFirework(firework) {
        if (firework.exploded) return;
        firework.exploded = true;
        
        // Remove rocket
        this.scene.remove(firework.rocket);
        
        // Create explosion particles (reduced count on mobile)
        const baseCount = this.isLowPowerMode ? 40 : 80;
        const particleCount = baseCount + Math.random() * (this.isLowPowerMode ? 20 : 40);
        
        // Brand colors palette
        const brandColors = [
            new THREE.Color(0xf1c608), // Golden yellow
            new THREE.Color(0xFFD700), // Gold
            new THREE.Color(0xff7e00), // Brand orange
            new THREE.Color(0xFFFFFF), // White
        ];
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.15 + Math.random() * 0.1, 6, 4);
            
            const color = brandColors[Math.floor(Math.random() * brandColors.length)];
            const material = new THREE.MeshBasicMaterial({ 
                color: color,
                transparent: true,
                opacity: 0.9
            });
            
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(firework.rocket.position);
            
            // 3D explosion velocity
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            const speed = 15 + Math.random() * 25;
            
            particle.velocity = {
                x: speed * Math.sin(theta) * Math.cos(phi),
                y: speed * Math.sin(theta) * Math.sin(phi),
                z: speed * Math.cos(theta)
            };
            
            particle.life = 1.0;
            particle.decay = 0.02 + Math.random() * 0.02;
            particle.gravity = -0.3 - Math.random() * 0.2;
            
            this.scene.add(particle);
            firework.particles.push(particle);
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        this.updateFireworks();
        
        // Gentle camera movement
        const time = Date.now() * 0.0005;
        this.camera.position.x = Math.sin(time) * 5;
        this.camera.lookAt(0, 0, 0);
        
        this.renderer.render(this.scene, this.camera);
    }

    updateFireworks() {
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const firework = this.fireworks[i];
            
            if (!firework.exploded && firework.rocket) {
                const elapsed = (Date.now() - firework.launchTime) / 1000;
                const progress = Math.min(elapsed * 2, 1);
                
                if (progress >= 1) {
                    this.explodeFirework(firework);
                } else {
                    const t = progress;
                    const arcHeight = 10;
                    
                    firework.rocket.position.x = THREE.MathUtils.lerp(firework.startPos.x, firework.targetPos.x, t);
                    firework.rocket.position.z = THREE.MathUtils.lerp(firework.startPos.z, firework.targetPos.z, t);
                    firework.rocket.position.y = THREE.MathUtils.lerp(firework.startPos.y, firework.targetPos.y, t) + 
                        Math.sin(t * Math.PI) * arcHeight;
                }
            }
            
            // Update explosion particles
            for (let j = firework.particles.length - 1; j >= 0; j--) {
                const particle = firework.particles[j];
                
                particle.velocity.y += particle.gravity * 0.016;
                particle.velocity.x *= 0.99;
                particle.velocity.z *= 0.99;
                
                particle.position.x += particle.velocity.x * 0.016;
                particle.position.y += particle.velocity.y * 0.016;
                particle.position.z += particle.velocity.z * 0.016;
                
                particle.life -= particle.decay;
                particle.material.opacity = particle.life * 0.9;
                
                const scaleLife = Math.max(0, (particle.life - 0.5) * 2);
                particle.scale.setScalar(0.5 + scaleLife * 1.5);
                
                if (particle.life <= 0) {
                    this.scene.remove(particle);
                    firework.particles.splice(j, 1);
                }
            }
            
            if (firework.exploded && firework.particles.length === 0) {
                this.fireworks.splice(i, 1);
            }
        }
    }

    cleanup() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize lazy loading
    const lazyLoader = new LazyImageLoader();

    // Initialize fireworks with delay
    let fireworks;
    setTimeout(() => {
        fireworks = new OptimizedFireworks();
        fireworks.init();
    }, 500);

    // Navigation function
    function goToSelection() {
        if (fireworks) {
            fireworks.cleanup();
        }
        window.location.href = 'selection.html';
    }

    // Make page clickable
    document.addEventListener('click', goToSelection);

    // Handle window resize
    function onWindowResize() {
        if (fireworks && fireworks.camera && fireworks.renderer) {
            fireworks.camera.aspect = window.innerWidth / window.innerHeight;
            fireworks.camera.updateProjectionMatrix();
            fireworks.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
    
    window.addEventListener('resize', onWindowResize);
});

// Preload critical resources
const preloadResources = () => {
    // Preload the selection page
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = 'selection.html';
    document.head.appendChild(link);

    // Preload critical CSS for next page
    const cssLink = document.createElement('link');
    cssLink.rel = 'preload';
    cssLink.href = 'css/component.css';
    cssLink.as = 'style';
    document.head.appendChild(cssLink);
};

// Run preloading after initial load
window.addEventListener('load', preloadResources);