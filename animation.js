// Three.js Animation
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg-canvas'),
    alpha: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Initial camera position (far away)
camera.position.setZ(150);

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// Device detection for performance optimization
const isMobile = window.innerWidth < 768;
const isLowEndDevice = navigator.hardwareConcurrency < 4;

// Galaxy parameters (optimized for device performance)
const parameters = {
    count: isMobile ? 10000 : (isLowEndDevice ? 15000 : 20000),    // Adaptive star count
    size: isMobile ? 0.06 : 0.08,      // Adaptive star size
    radius: 30,
    branches: 7,
    spin: 2,
    randomness: 0.5,
    randomnessPower: 2,
    insideColor: '#ff6030',
    outsideColor: '#1b3984'
};

// Galaxy geometry
const positions = new Float32Array(parameters.count * 3);
const colors = new Float32Array(parameters.count * 3);

const colorInside = new THREE.Color(parameters.insideColor);
const colorOutside = new THREE.Color(parameters.outsideColor);

for(let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    // Position
    const radius = Math.random() * parameters.radius;
    const spinAngle = radius * parameters.spin;
    const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

    const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
    const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
    const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);

    positions[i3    ] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    // Color
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);

    colors[i3    ] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
}

const galaxyGeometry = new THREE.BufferGeometry();
galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const galaxyMaterial = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
});

const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
scene.add(galaxy);

// Create orbital rings
class OrbitalRing {
    constructor(radius, color, opacity = 0.3) {
        const geometry = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 128);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: opacity,
            side: THREE.DoubleSide
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.x = Math.PI / 2;
        scene.add(this.mesh);
    }

    update(rotation) {
        this.mesh.rotation.z = rotation;
    }
}

// Create orbital rings
const orbitalRings = [
    new OrbitalRing(45, '#ff6b6b', 0.2),  // Red ring
    new OrbitalRing(65, '#4a90e2', 0.2),  // Blue ring
    new OrbitalRing(85, '#50e3c2', 0.2),  // Teal ring
    new OrbitalRing(105, '#f5a623', 0.2)  // Orange ring
];

// Create planets
class Planet {
    constructor(radius, distance, speed, color) {
        this.radius = radius;
        this.distance = distance;
        this.speed = speed * 0.5; // Reduced planet speed
        this.angle = Math.random() * Math.PI * 2;
        this.verticalOffset = (Math.random() - 0.5) * 5;
        
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshPhysicalMaterial({
            color: color,
            metalness: 0.3,
            roughness: 0.4,
            emissive: color,
            emissiveIntensity: 0.2
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.updatePosition();
        scene.add(this.mesh);

        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(radius * 1.2, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(this.glow);
    }

    updatePosition() {
        this.angle += this.speed;
        this.mesh.position.x = Math.cos(this.angle) * this.distance;
        this.mesh.position.z = Math.sin(this.angle) * this.distance;
        this.mesh.position.y = Math.sin(this.angle * 2) * this.verticalOffset;
        this.mesh.rotation.y += 0.005; // Reduced rotation speed
    }
}

// Create planets with adjusted distances for larger galaxy
const planets = [
    new Planet(1.2, 45, 0.002, '#ff6b6b'),   // Red planet
    new Planet(1.8, 65, 0.001, '#4a90e2'),   // Blue planet
    new Planet(0.8, 85, 0.003, '#50e3c2'),   // Teal planet
    new Planet(2.2, 105, 0.0005, '#f5a623')  // Orange planet
];

// Project section animations
class ProjectAnimation {
    constructor() {
        this.projectCards = document.querySelectorAll('.project-card');
        this.initialized = false;
        this.animationFrame = 0;
    }

    init() {
        if (this.initialized) return;
        
        this.projectCards.forEach((card, index) => {
            // Add 3D transform style
            card.style.transform = 'perspective(1000px)';
            card.style.transition = 'transform 0.5s ease-out';
            
            // Add hover effect
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'perspective(1000px) rotateX(10deg) rotateY(10deg) scale(1.05)';
                card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
                card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
            });
        });
        
        this.initialized = true;
    }

    update() {
        if (!this.initialized) return;
        
        this.animationFrame++;
        
        // Subtle floating animation for project cards
        this.projectCards.forEach((card, index) => {
            const offset = index * 0.5;
            const float = Math.sin(this.animationFrame * 0.02 + offset) * 5;
            card.style.transform = `perspective(1000px) translateY(${float}px)`;
        });
    }
}

const projectAnimation = new ProjectAnimation();

// Mouse movement effect
document.addEventListener('mousemove', animateParticles);

let mouseX = 0;
let mouseY = 0;

function animateParticles(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
}

// Scroll effect
let scrollY = 0;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
});

// Animation states
let animationState = 'initial';
let zoomProgress = 0;
const zoomDuration = 3000; // Increased duration to 3 seconds
const startTime = Date.now();

// Performance monitoring
let frameCount = 0;
let lastTime = performance.now();
let fps = 60;

// Animation loop
function animate() {
    const currentTime = performance.now();
    frameCount++;
    
    if (currentTime - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
        
        // Adaptive quality based on FPS
        if (fps < 30 && !isMobile) {
            parameters.count = Math.max(10000, parameters.count - 1000);
        } else if (fps > 55 && !isMobile && parameters.count < 20000) {
            parameters.count = Math.min(20000, parameters.count + 500);
        }
    }
    
    requestAnimationFrame(animate);

    // Handle animation states
    const animationCurrentTime = Date.now();
    
    if (animationState === 'initial') {
        zoomProgress = Math.min((animationCurrentTime - startTime) / zoomDuration, 1);
        
        // Ease out cubic function for smooth zoom
        const easedProgress = 1 - Math.pow(1 - zoomProgress, 3);
        
        // Zoom in from 150 to 20
        camera.position.z = 150 - (easedProgress * 130);
        
        if (zoomProgress >= 1) {
            animationState = 'complete';
        }
    }

    // Rotate galaxy (slower rotation)
    galaxy.rotation.y += 0.0005; // Reduced from 0.001
    galaxy.rotation.x += 0.0002; // Reduced from 0.0005

    // Update orbital rings (slower rotation)
    orbitalRings.forEach((ring, index) => {
        ring.update(ring.mesh.rotation.z + 0.0005 * (index + 1)); // Reduced from 0.001
    });

    // Update planets
    planets.forEach(planet => planet.updatePosition());

    // Mouse movement effect (reduced sensitivity)
    galaxy.rotation.x += mouseY * 0.000005; // Reduced from 0.00001
    galaxy.rotation.y += mouseX * 0.000005; // Reduced from 0.00001

    // Scroll effect - adjust camera position based on section
    const sections = document.querySelectorAll('section');
    const currentSection = Array.from(sections).find(section => {
        const rect = section.getBoundingClientRect();
        return rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2;
    });

    if (currentSection && animationState === 'complete') {
        const sectionId = currentSection.id;
        switch(sectionId) {
            case 'projects':
                camera.position.y = -scrollY * 0.01;
                camera.position.z = 20; // Keep zoomed in
                // Initialize and update project animations
                projectAnimation.init();
                projectAnimation.update();
                break;
            case 'skills':
                camera.position.y = -scrollY * 0.01;
                camera.position.z = 20; // Keep zoomed in
                break;
            case 'contact':
                camera.position.y = -scrollY * 0.01;
                camera.position.z = 20; // Keep zoomed in
                break;
            default:
                camera.position.y = -scrollY * 0.01;
                camera.position.z = 20; // Keep zoomed in
        }
    }

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate(); 