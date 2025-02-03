import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, controls;

async function loadData() {
    try {
        const response = await fetch('./data/data5.json');
        const data = await response.json();
        console.log("Loaded JSON data:", data); 
        return data.points.map(p => p.elevation); 
    } catch (error) {
        console.error("Error loading terrain data:", error);
        return [];
    }
}

function smoothElevationData(elevationData, gridSize, kernelSize = 3) {
    const smoothedData = new Array(elevationData.length).fill(0);
    const halfKernel = Math.floor(kernelSize / 2);

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            let sum = 0;
            let count = 0;

            // Apply a moving average kernel
            for (let ky = -halfKernel; ky <= halfKernel; ky++) {
                for (let kx = -halfKernel; kx <= halfKernel; kx++) {
                    const nx = x + kx;
                    const ny = y + ky;

                    // Check bounds
                    if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
                        sum += elevationData[ny * gridSize + nx];
                        count++;
                    }
                }
            }

            smoothedData[y * gridSize + x] = sum / count;
        }
    }

    return smoothedData;
}

function calculateElevationScale(elevationData) {
    if (elevationData.length === 0) return 1; 
    let minElevation = Infinity;
    let maxElevation = -Infinity;

    for (let i = 0; i < elevationData.length; i++) {
        const elevation = elevationData[i];
        if (elevation < minElevation) minElevation = elevation;
        if (elevation > maxElevation) maxElevation = elevation;
    }

    const elevationRange = maxElevation - minElevation;
    const targetRange = 800; 
    const elevationScale = (targetRange / elevationRange);

    console.log("Elevation range is: ", elevationScale);

    return elevationScale;
}

function setupScene() {
    scene = new THREE.Scene();
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 100, 50);
    scene.add(directionalLight);
}

function setupCamera(terrainWidth, terrainHeight) {
    const aspectRatio = window.innerWidth / window.innerHeight;
    const fov = Math.min(75, Math.max(30, 100 - terrainWidth / 2)); 
    camera = new THREE.PerspectiveCamera(fov, aspectRatio, 0.1, terrainWidth * 10);

    const distance = Math.max(terrainWidth, terrainHeight) * 1.5;
    camera.position.set(0, distance, distance);
    camera.lookAt(0, 0, 0);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; 
    controls.dampingFactor = 0.05;
}

async function createTerrain() {
    const elevationData = await loadData();
    if (elevationData.length === 0) return;

    const gridSize = Math.sqrt(elevationData.length);
    if (!Number.isInteger(gridSize)) {
        console.error("Elevation data length is not a perfect square.");
        return;
    }

    // Smooth elevation data before terrain generation
    const smoothedElevationData = smoothElevationData(elevationData, gridSize, 5);

    console.log(`Grid size: ${gridSize}x${gridSize}`);

    const downsampleFactor = Math.floor(gridSize / 100); 
    const downsampledSize = Math.floor(gridSize / downsampleFactor);
    console.log(`Downsampled grid size: ${downsampledSize}x${downsampledSize}`);

    const spacing = 20; 
    const terrainWidth = downsampledSize * spacing;
    const terrainHeight = downsampledSize * spacing;

    setupCamera(terrainWidth, terrainHeight); 
    
    const geometry = new THREE.PlaneGeometry(terrainWidth, terrainHeight, downsampledSize - 1, downsampledSize - 1);
    const vertices = geometry.attributes.position.array;

    const elevationScale = calculateElevationScale(smoothedElevationData);

    for (let y = 0; y < downsampledSize; y++) {
        for (let x = 0; x < downsampledSize; x++) {
            const index = (y * downsampledSize + x) * 3;
            const originalIndex = (y * downsampleFactor * gridSize + x * downsampleFactor);
            vertices[index + 2] = smoothedElevationData[originalIndex] * elevationScale;
        }
    }

    geometry.computeVertexNormals(); 

    const material = new THREE.MeshStandardMaterial({ color: 0x88cc88, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2; 
    scene.add(mesh);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update(); 
    renderer.render(scene, camera);
}

window.addEventListener('resize', () =>{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

setupScene();

createTerrain().then(() => {
    animate(); 
});