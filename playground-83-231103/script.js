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
        this.positionY = 0;
        this.init();
    }

    init() {
        this.canvas.width = 1024;
        this.canvas.height = 1024;
    }

    drawText(text, color = 0.6) {
        this.context.fillStyle = `hsl(${color * 360}, 100%, 50%)`;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.fillStyle = 'white';
        this.context.font = '200px Arial';
        this.context.textAlign = 'center';
        this.context.fillText(text, this.canvas.width * 0.5, this.canvas.height * 0.5);

        this.context.fillStyle = 'white';
        this.context.fillRect(0, this.canvas.height * this.positionY, this.canvas.width, this.canvas.height * 0.02);

        this.texture.needsUpdate = true;
    }

    updatePositionY() {
        if (this.positionY < 1) {
            this.positionY += 0.004;
        } else {
            this.positionY = 0;
        }
    }
}

const canvas1 = document.createElement('canvas');
const canvasTexture = new TextCanvasTexture(canvas1);
canvasTexture.drawText('olo');

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial({ map: canvasTexture.texture })
);

sphere.rotation.y = Math.PI * -0.5;

const sphereGroup = new THREE.Group();
sphereGroup.add(sphere);
scene.add(sphereGroup);

let target = new THREE.Vector3();

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.2, 0.2),
    new THREE.MeshStandardMaterial()
);

cube.material.color.setHSL(0.0, 0.0, 0.5);
cube.position.set(target.x, target.y, target.z);
scene.add(cube);

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

    const col = new THREE.Color();

    target.set(cursor.x, cursor.y, 2.0);
    cube.position.set(target.x, target.y, target.z);
    sphereGroup.lookAt(target);

    canvasTexture.updatePositionY();
    canvasTexture.drawText('olo', Math.sin(absTime));

    cube.material.color.setHSL(1.0 - Math.sin(absTime), 1.0, 0.5);
    cube.scale.set(1 + Math.abs(cursor.x * 2.0), 1 + Math.abs(cursor.y * 2.0), 1);

    col.setHSL(1.0 - Math.sin(absTime * 0.5), 0.5, 0.1);

    scene.background = col;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

animate();
