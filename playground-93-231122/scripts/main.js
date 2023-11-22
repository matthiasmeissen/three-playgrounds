import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { DisplacementShader } from './shader.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

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
    side: THREE.DoubleSide,

    uniforms: {
        uTime: { value: 0 },
        uParam1: { value: 0.5 },
        uParam2: { value: 0.5 },
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

            p = rotate(p, uTime * 0.2);

            float param1 = mapToRange(uParam1, -1.0, 1.0, 0.1, 0.9);

            float d1 = length(p * p) * p.x * param1;
            d1 = d1 / length(p) * sin(p.x * 20.0);

            float d2 = step(d1, 0.01) - step(d1, uParam2 * 0.008);

            vec3 color = vec3(d2);
            gl_FragColor = vec4(color, 1.0);
        }
    `
});


const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2, 32),
    shaderMaterial
);


scene.add(plane);


const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    shaderMaterial
);

scene.add(sphere);


// -----------------------
// Postprocessing
// -----------------------


const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const displacementPass = new ShaderPass(DisplacementShader);
composer.addPass(displacementPass);

const outputPass = new OutputPass();
composer.addPass(outputPass);


// -----------------------
// Animation
// -----------------------

const animate = () => {
    const absTime = clock.getElapsedTime();

    shaderMaterial.uniforms.uTime.value = absTime;
    shaderMaterial.uniforms.uParam1.value = cursor.x;
    shaderMaterial.uniforms.uParam2.value = cursor.y;


    composer.render();
    requestAnimationFrame(animate);
};

animate();
