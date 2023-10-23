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
// Sphere Geometry
// -----------------------

const sphereGroup = new THREE.Group();
scene.add(sphereGroup);

const createSphere = (position) => {
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        new THREE.MeshStandardMaterial()
    );
    sphere.material.color.setHSL(0, 0, 0.1);
    sphere.position.set(position.x, position.y, position.z);
    sphereGroup.add(sphere);
}

for (let i = 0; i < 20; i++) {
    const position = {
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4,
        z: (Math.random() - 0.5) * 4
    }
    createSphere(position);
}

const changeSphereColor = (index) => {
    if (index % 4 === 0) {
        sphereGroup.children.forEach(sphere => {
            sphere.material.color.setHSL(0, 0, 1);
        });
    } else {
        sphereGroup.children.forEach(sphere => {
            sphere.material.color.setHSL(0, 0, 0.1);
        });
    }
}

// -----------------------
// Line Geometry
// -----------------------

const linePoints = []
const lineGroup = new THREE.Group();
scene.add(lineGroup);

for (let i = 0; i < 40; i++) {
    const line = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffffff }));
    lineGroup.add(line);
    const originPoint = new THREE.Vector3((Math.random() - 0.5) * 4.0, Math.sin(i) * 4.0, (Math.random() - 0.5) * 10.0);
    const targetPoint = new THREE.Vector3(0, 0, 0);
    linePoints.push([ originPoint, targetPoint ]);
}

const setLinesToSpherePosition = (index) => {
    const targetPoint = sphereGroup.children[index % sphereGroup.children.length].position
    lineGroup.children.forEach((line, index) => {
        linePoints[index][1] = targetPoint;
        line.geometry.setFromPoints(linePoints[index]);
    });

    const lineColor = Math.random()
    lineGroup.children.forEach((line) => {
        line.material.color.setHSL(lineColor, 0.9, 0.5);
    });
}

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

    scene.add(lights);
};

createLights();

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
// Interval Counter
// -----------------------

class IntervalCounter {
    constructor() {
        this.counter = 0
        this.lastTime = 0
    }

    update(inputTime, duration, callback) {
        if (inputTime - this.lastTime >= duration) {
            this.counter += 1
            this.lastTime = inputTime
            callback(this.counter)
        }
    }
}

const intervalCounter1 = new IntervalCounter()
const intervalCounter2 = new IntervalCounter()


// -----------------------
// Animation
// -----------------------

const animate = () => {
    const absTime = clock.getElapsedTime();

    intervalCounter1.update(absTime, 0.4, setLinesToSpherePosition)
    intervalCounter2.update(absTime, 0.4, changeSphereColor)

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

animate();
