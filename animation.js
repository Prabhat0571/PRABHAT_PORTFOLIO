// Three.js Animation - Modern Geometric Background
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg-canvas'),
    alpha: true,
    antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Camera position
camera.position.setZ(30);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xff6b6b, 2);
pointLight1.position.set(20, 20, 20);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x4a90e2, 2);
pointLight2.position.set(-20, -20, 20);
scene.add(pointLight2);

// Geometric Shapes Group
const shapesGroup = new THREE.Group();
scene.add(shapesGroup);

// Materials
const material1 = new THREE.MeshPhysicalMaterial({
    color: 0xff6b6b,
    metalness: 0.1,
    roughness: 0.1,
    transparent: true,
    opacity: 0.8,
    transmission: 0.5,
    side: THREE.DoubleSide
});

const material2 = new THREE.MeshPhysicalMaterial({
    color: 0x4a90e2,
    metalness: 0.1,
    roughness: 0.1,
    transparent: true,
    opacity: 0.8,
    transmission: 0.5,
    side: THREE.DoubleSide
});

const material3 = new THREE.MeshPhysicalMaterial({
    color: 0x50e3c2,
    metalness: 0.1,
    roughness: 0.1,
    transparent: true,
    opacity: 0.8,
    transmission: 0.5,
    side: THREE.DoubleSide
});

const materials = [material1, material2, material3];

// Geometries
const geometries = [
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.IcosahedronGeometry(0.8, 0),
    new THREE.TorusGeometry(0.6, 0.2, 16, 100),
    new THREE.OctahedronGeometry(0.8)
];

// Create random shapes
const shapes = [];
const particleCount = 60;

for (let i = 0; i < particleCount; i++) {
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const material = materials[Math.floor(Math.random() * materials.length)];
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Random position spread
    mesh.position.x = (Math.random() - 0.5) * 60;
    mesh.position.y = (Math.random() - 0.5) * 40;
    mesh.position.z = (Math.random() - 0.5) * 30;
    
    // Random rotation
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    
    // Random scale
    const scale = Math.random() * 0.5 + 0.5;
    mesh.scale.set(scale, scale, scale);
    
    // Store initial data for animation
    mesh.userData = {
        rotationSpeed: {
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02
        },
        floatSpeed: {
            x: (Math.random() - 0.5) * 0.01,
            y: (Math.random() - 0.5) * 0.01,
            z: (Math.random() - 0.5) * 0.01
        },
        initialScale: scale,
        hovered: false
    };
    
    shapes.push(mesh);
    shapesGroup.add(mesh);
}

// Mouse interaction
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

// Raycaster for hover effects
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;
    
    // Parallax effect for the group
    shapesGroup.rotation.y += 0.05 * (targetX - shapesGroup.rotation.y);
    shapesGroup.rotation.x += 0.05 * (targetY - shapesGroup.rotation.x);
    
    // Raycasting
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(shapesGroup.children);
    
    // Reset all shapes
    shapes.forEach(mesh => {
        if (!mesh.userData.hovered) {
            // Normal animation
            mesh.rotation.x += mesh.userData.rotationSpeed.x;
            mesh.rotation.y += mesh.userData.rotationSpeed.y;
            
            mesh.position.x += mesh.userData.floatSpeed.x;
            mesh.position.y += mesh.userData.floatSpeed.y;
            mesh.position.z += mesh.userData.floatSpeed.z;
            
            // Boundary checks to keep shapes in view
            if (Math.abs(mesh.position.x) > 35) mesh.userData.floatSpeed.x *= -1;
            if (Math.abs(mesh.position.y) > 25) mesh.userData.floatSpeed.y *= -1;
            if (Math.abs(mesh.position.z) > 20) mesh.userData.floatSpeed.z *= -1;
            
            // Smooth return to original scale
            mesh.scale.lerp(new THREE.Vector3(mesh.userData.initialScale, mesh.userData.initialScale, mesh.userData.initialScale), 0.1);
            
            // Pulse effect
            // mesh.position.y += Math.sin(elapsedTime + mesh.position.x) * 0.002;
        }
    });
    
    // Handle intersections
    if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object;
        hoveredMesh.userData.hovered = true;
        
        // Hover animation
        hoveredMesh.rotation.x += 0.05;
        hoveredMesh.rotation.y += 0.05;
        
        // Scale up
        const targetScale = hoveredMesh.userData.initialScale * 1.5;
        hoveredMesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        
        // Reset others
        shapes.forEach(mesh => {
            if (mesh !== hoveredMesh) {
                mesh.userData.hovered = false;
            }
        });
    } else {
        shapes.forEach(mesh => {
            mesh.userData.hovered = false;
        });
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