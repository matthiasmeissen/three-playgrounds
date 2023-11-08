import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import createLights from './lights.js';
import createCamera from './camera.js';
import TileGrid from './tileGrid.js';
import TextCanvasTexture from './textureCanvas.js';

// -----------------------
// Initial Setup
// -----------------------

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
const cursor = new THREE.Vector2();
const clock = new THREE.Clock();

// -----------------------
// Objects
// -----------------------

const planeGroup = new THREE.Group();
scene.add(planeGroup);

planeGroup.rotation.set(Math.PI / -2, 0, Math.PI * -0.25);

planeGroup.position.set(0, 0.2, 0);

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.MeshStandardMaterial({ color: 0x00ffff, side: THREE.DoubleSide })
);


plane.userData = {
    isHovered: false
}

planeGroup.add(plane);


const textCanvasTexture = new TextCanvasTexture();
textCanvasTexture.drawText('olo');
plane.material.map = textCanvasTexture.getTexture();


const changePlaneColor = () => {
    if (plane.userData.isHovered) {
        plane.material.color.setHSL(0.8, 1, 0.5);
    } else {
        plane.material.color.setHSL(0.8, 1, 0.8);
    }
}


const tileGrid = new TileGrid(30, scene);
const lights = createLights(scene);
const camera = createCamera();

// -----------------------
// Raycaster
// -----------------------

const raycaster = new THREE.Raycaster();

const checkIntersection = () => {
    raycaster.setFromCamera(cursor, camera);

    tileGrid.grid.children.forEach(tile => {
        tile.userData.isHovered = false;
    })

    plane.userData.isHovered = false;

    const intersects = raycaster.intersectObjects(tileGrid.grid.children);

    if (intersects.length > 0) {
        const tile = intersects[0].object;
        tile.material.color.setHSL(0.8, 1, 0.5);
        tile.userData.isHovered = true;
    }

    const intersects1 = raycaster.intersectObjects(planeGroup.children);

    if (intersects1.length > 0) {
        const tile = intersects1[0].object;
        tile.userData.isHovered = true;
    }
};

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

    checkIntersection();

    tileGrid.updateGrid(clock.getDelta());
    changePlaneColor()

    textCanvasTexture.updatePositionY((absTime * 0.5) % 1);
    textCanvasTexture.drawText(absTime.toString().slice(0, 3), (absTime * 0.25) % 1);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

animate();
