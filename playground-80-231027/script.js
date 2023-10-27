import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// -----------------------
// Initial Setup
// -----------------------

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
const raycaster = new THREE.Raycaster();
const cursor = new THREE.Vector2();
const clock = new THREE.Clock();

// -----------------------
// Geometry
// -----------------------

class CubeSphere {
    constructor(radius, resolution, scene) {
        this.radius = radius;
        this.resolution = resolution;
        this.scene = scene;
        this.cubeSize = this.radius * 2 / this.resolution;
        this.cubes = [];
        this.createLayers();
    }

    createLayers() {
        for (let i = 0; i < this.resolution; i++) {
            const height = -this.radius + i * (this.radius * 2 / this.resolution);
            const layerRadius = Math.sqrt(this.radius * this.radius - height * height);
            this.createLayer(height, layerRadius);
        }
    }

    createLayer(height, layerRadius) {
        const numCubes = Math.ceil(layerRadius / this.cubeSize) * 2;
        const offset = -numCubes * this.cubeSize / 2 + this.cubeSize / 2;

        for (let x = 0; x < numCubes; x++) {
            for (let z = 0; z < numCubes; z++) {
                const cubeX = x * this.cubeSize + offset;
                const cubeZ = z * this.cubeSize + offset;
                const distanceToCenter = Math.sqrt(cubeX * cubeX + cubeZ * cubeZ);

                if (distanceToCenter <= layerRadius) {
                    const cube = new THREE.Mesh(
                        new THREE.BoxGeometry(this.cubeSize, this.cubeSize, this.cubeSize),
                        new THREE.MeshStandardMaterial({ color: 0xffffff })
                    );
                    cube.position.set(cubeX, height, cubeZ);
                    this.scene.add(cube);
                    this.cubes.push({ cube, position: cube.position });
                }
            }
        }
    }

    colorCubes(type) {
        this.cubes.forEach(({ cube, position }) => {
            this.colorCube(cube, position, type);
        });
    }

    colorCube(cube, position, type) {
        switch (type) {
            case 'gradient':
                const distanceToCenter = position.length();
                const normalizedDistance = distanceToCenter / this.radius;
                cube.material.color.setHSL(normalizedDistance, 1, 0.5);
                break;
            case 'height':
                const heightNormalized = (position.y + this.radius) / (2 * this.radius);
                cube.material.color.setHSL(heightNormalized, 1, 0.5);
                break;
            case 'checker':
                const checkerSize = 5;
                const x = Math.floor(position.x / this.cubeSize);
                const z = Math.floor(position.z / this.cubeSize);
                if ((x + z) % 2 === 0) {
                    cube.material.color.set(0x000000);
                } else {
                    cube.material.color.set(0xffffff);
                }
                break;
            case 'radial':
                const angle = Math.atan2(position.z, position.x);
                cube.material.color.setHSL((angle + Math.PI) / (2 * Math.PI), 1, 0.5);
                break;
            case 'waves':
                const waveFactor = Math.sin(position.y / this.radius * Math.PI * 5) * 0.5 + 0.5;
                cube.material.color.setHSL(waveFactor, 1, 0.5);
                break;
            default:
                cube.material.color.setHSL(0, 0, 0.5);
        }
    }
}

const cubeSphere = new CubeSphere(1, 10, scene);
cubeSphere.colorCubes('gradient');


// -----------------------
// Lights
// -----------------------

const createLights = () => {
    const lights = new THREE.Group();
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    lights.add(ambientLight);

    const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
    light1.position.set(-2, 1, 4);
    lights.add(light1);

    const light2 = new THREE.DirectionalLight(0xffffff, 0.8);
    light2.position.set(2, -1, -4);
    lights.add(light2);

    scene.add(lights);
    return lights;
};

const lights = createLights();

// -----------------------
// Camera and Controls
// -----------------------

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 4);
const orbitControls = new OrbitControls(camera, renderer.domElement);

// -----------------------
// Event Listeners
// -----------------------

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('dblclick', () => {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
    if (!fullscreenElement) {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
});

window.addEventListener('mousemove', (event) => {
    cursor.x = (event.clientX / window.innerWidth) * 2 - 1;
    cursor.y = - (event.clientY / window.innerHeight) * 2 + 1;
});

// -----------------------
// Animation
// -----------------------

const animate = () => {
    const absTime = clock.getElapsedTime();

    lights.rotation.y = absTime * 0.2;
    lights.rotation.x = Math.sin(absTime * 0.5) * 0.5;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

animate();
