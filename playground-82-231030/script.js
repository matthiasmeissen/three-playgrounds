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


class TextCanvasTexture {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.texture = new THREE.CanvasTexture(this.canvas);
        this.isBlinking = false;
        this.init();
    }

    init() {
        this.canvas.width = 1024;
        this.canvas.height = 1024;
        window.addEventListener('click', this.handleClick.bind(this));
    }

    drawText(text) {
        this.context.fillStyle = 'blue';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = 'white';
        this.context.font = '200px Arial';
        this.context.textAlign = 'center';
        this.context.fillText(text, this.canvas.width * 0.5, this.canvas.height * 0.5);
        this.texture.needsUpdate = true;
    }

    handleClick() {
        this.isBlinking = !this.isBlinking;
        this.drawText(this.isBlinking ? 'olo' : '-lo');
    }
}

const canvas1 = document.createElement('canvas');
const canvasTexture = new TextCanvasTexture(canvas1);
canvasTexture.drawText('olo');

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial({ map: canvasTexture.texture })
);

sphere.rotation.y = Math.PI * 0.5;

const sphereGroup = new THREE.Group();
sphereGroup.add(sphere);

scene.add(sphereGroup);

let target = new THREE.Vector3();

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

    target.set(-cursor.x, -cursor.y, 1.0).unproject(camera);
    sphereGroup.lookAt(target);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

animate();
