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
// Geometries and Meshes
// -----------------------

const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
);

mesh.material.color.setHSL(0.5, 0.5, 0.5);
scene.add(mesh);


const lineGroup = new THREE.Group();
scene.add(lineGroup);

for (let i = 0; i < 100; i++) {
    const line = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffffff }));
    lineGroup.add(line);
}

const mesh2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.2, 0.2),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
);

scene.add(mesh2);

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
// Raycaster
// -----------------------

const raycasterUpdate = (callback) => {
    raycaster.setFromCamera(cursor, camera);
    const intersects = raycaster.intersectObject(mesh);
    let distanceToMesh = null;

    if (intersects.length > 0) {
        distanceToMesh = intersects[0].distance.toPrecision(4);

        mesh2.position.set(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z)

        setLinePoints(intersects[0].point);
    } else {
        setLinePoints(new THREE.Vector3(0, 0, 0));
    }

    callback(distanceToMesh);
}

const setLinePoints = (targetPoint) => {
    lineGroup.children.forEach((line, index) => {
        const points = [
            new THREE.Vector3((lineGroup.children.length / 2 - index) * 0.1, 2, Math.sin(index)),
            targetPoint
        ]
        line.geometry.setFromPoints(points);
    });
}

const setLineToMesh = (distance) => {
    if (distance !== null) {
        console.log(distance);
    } else {
        console.log('no intersection');
    }
}


// -----------------------
// Animation
// -----------------------

const animate = () => {
    const absTime = clock.getElapsedTime();

    raycasterUpdate(setLineToMesh);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

animate();
