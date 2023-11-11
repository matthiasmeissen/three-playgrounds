import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import createLights from './lights.js';
import createCamera from './camera.js';
import eventListeners from './eventListeners.js';

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

const lights = createLights(scene);
const camera = createCamera();
eventListeners(camera, renderer, canvas, cursor);
const orbitControls = new OrbitControls(camera, renderer.domElement);

// -----------------------
// Objects
// -----------------------

const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uParam1: { value: 0.5},
        uParam2: { value: 0.5},
    },

    vertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        uniform float uParam1;
        uniform float uParam2;

        float mapToRange(float value, float min1, float max1, float min2, float max2) {
            return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
        }

        vec2 rotate(vec2 v, float a) {
            float s = sin(a);
            float c = cos(a);
            mat2 m = mat2(c, -s, s, c);
            return m * v;
        }

        void main() {
            vec2 p = vUv - 0.5;
            p = p * p;

            p = rotate(p, uParam2);

            float param1 = mapToRange(uParam1, -1.0, 1.0, 0.1, 0.9);

            float d1 = fract(p.y * 8.0 + uTime * 0.8);
            d1 = step(param1, d1);

            vec3 color = vec3(d1);
            gl_FragColor = vec4(color, 1.0);
        }
    `
});

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    shaderMaterial
);
cube.position.x = -1;
scene.add(cube);


const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    shaderMaterial
);
sphere.position.x = 1;
scene.add(sphere);

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    shaderMaterial
);

plane.material.side = THREE.DoubleSide;
scene.add(plane);


// -----------------------
// Animation
// -----------------------

const animate = () => {
    const absTime = clock.getElapsedTime();

    shaderMaterial.uniforms.uTime.value = absTime;
    shaderMaterial.uniforms.uParam1.value = cursor.x;
    shaderMaterial.uniforms.uParam2.value = cursor.y;


    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

animate();
