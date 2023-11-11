import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { CopyShader } from './shader.js';

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

const sphereGroup = new THREE.Group();
scene.add(sphereGroup);

sphereGroup.rotation.set(Math.PI / -2, 0, Math.PI * -0.25);

sphereGroup.position.set(0, 0.2, 0);

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.0, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
);

sphere.scale.set(1.0, 0.8, 1.0);



sphere.userData = {
    isHovered: false
}

sphereGroup.add(sphere);


const textCanvasTexture = new TextCanvasTexture();
textCanvasTexture.drawText('olo');
sphere.material.map = textCanvasTexture.getTexture();


const changesphereColor = () => {
    if (sphere.userData.isHovered) {
        sphere.material.color.setHSL(0.8, 1, 0.5);
    } else {
        sphere.material.color.setHSL(0.8, 1, 0.8);
    }
}

for (let i = 0; i < 20; i++) {
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(0.2, 4.0),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );

    plane.material.side = THREE.DoubleSide;
    plane.material.map = textCanvasTexture.getTexture();

    plane.rotation.set(i, 0, i);
    plane.scale.y = Math.random();

    sphereGroup.add(plane);
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

    sphere.userData.isHovered = false;

    const intersects = raycaster.intersectObjects(tileGrid.grid.children);

    if (intersects.length > 0) {
        const tile = intersects[0].object;
        tile.material.color.setHSL(0.8, 1, 0.5);
        tile.userData.isHovered = true;
    }

    const intersects1 = raycaster.intersectObjects(sphereGroup.children);

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


const orbitControls = new OrbitControls(camera, renderer.domElement);


// -----------------------
// Postprocessing
// -----------------------


const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const copyPass = new ShaderPass(CopyShader);
composer.addPass(copyPass);

const outputPass = new OutputPass();
composer.addPass(outputPass);

// -----------------------
// Animation
// -----------------------

const animate = () => {
    const absTime = clock.getElapsedTime();

    checkIntersection();

    tileGrid.updateGrid(clock.getDelta());
    changesphereColor()

    sphereGroup.position.set(0, 0.2 + Math.sin(absTime), 0);
    sphereGroup.rotation.y = absTime * 0.5;

    textCanvasTexture.updatePositionY((absTime * 0.5) % 1);
    textCanvasTexture.drawText(absTime.toString().slice(0, 3), (absTime * 0.25) % 1);

    composer.render();
    requestAnimationFrame(animate);
};

animate();
