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
        uColor: { value: new THREE.Color(0xffffff)}
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
        uniform vec3 uColor;

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
            p = p * p * 4.0;

            p = rotate(p, uTime * 0.2);

            float param1 = mapToRange(uParam1, -1.0, 1.0, 0.1, 0.9);

            float d1 = distance(sin(p.x * 8.0 * p.y), sin(p.y * 8.0 * param1));

            float d2 = step(d1, 0.1) - step(d1, uParam2 * 0.08);

            vec3 color = vec3(uColor * d2);
            gl_FragColor = vec4(color, 1.0);
        }
    `
});


const group = new THREE.Group();
scene.add(group);

for (let i = 1; i < 10; i++) {
    const s = i / 10;
    const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(s * 2, 0.1 * s, 64, 64),
        shaderMaterial
    );

    mesh.rotation.x = s * Math.PI;
    mesh.rotation.y = s * 0.2;
    group.add(mesh);
}

group.rotation.y = Math.PI * 0.6;
group.rotation.x = Math.PI * -0.15;


group.position.y = 0.4;
group.position.x = 0.5;



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


    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

animate();
