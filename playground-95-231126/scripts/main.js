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


class TransparentMesh {
    constructor(input) {
        this.group = new THREE.Group();
        this.geometry = input.geometry;
        this.num = input.num;
        this.space = input.space;
        this.color = input.color;
        this.type = input.type;

        this.createGroup(this.type);
    }

    createMesh() {
        const mesh = new THREE.Mesh(
            this.geometry,
            new THREE.MeshBasicMaterial({ color: this.color, side: THREE.DoubleSide, opacity: 0.1, transparent: true })
        )
        return mesh;
    }

    createGroup(type) {
        switch (type) {
            case 'position':
                this.createPositions();
                break;
            case 'scale':
                this.createScale();
                break;
            default:
                this.createPositions();
                break;
        }
    }

    createPositions() {
        for (let i = 0; i < this.num; i++) {
            const mesh = this.createMesh();
            mesh.position.y = i * this.space;
            mesh.rotateX(Math.PI * -0.5);
            this.group.add(mesh);
        }
        scene.add(this.group);
    }

    createScale() {
        for (let i = 0; i < this.num; i++) {
            const mesh = this.createMesh();
            const s = i / this.num;
            mesh.scale.set(s, s, s);
            this.group.add(mesh);
        }
        scene.add(this.group);
    }

    setPosition(x, y, z) {
        this.group.position.set(x, y, z);
    }

    updateColor(time) {
        this.group.children.forEach((mesh, index) => {
            const i = index / this.num;
            mesh.material.opacity = ((-i + time * 0.8) % 1) * 0.2;
        });
    }
}



const sphere1 = new TransparentMesh({
    geometry: new THREE.SphereGeometry(2, 32, 32), 
    num: 20, 
    space: 0.5,
    color: 0xff0000,
    type: 'scale'
});

const sphere2 = new TransparentMesh({
    geometry: new THREE.SphereGeometry(2, 32, 32),
    num: 20, 
    space: 0.5,
    color: 0x0000ff,
    type: 'scale'
});

const randPos = () => {
    return (Math.random() - 0.5) * 4;   
}

sphere1.setPosition(randPos(), randPos(), randPos());
sphere2.setPosition(randPos(), randPos(), randPos());



const cubeGroup = new THREE.Group();
scene.add(cubeGroup);

const cubeSize = 2;
const gridSize = 20;
const geometry = new THREE.PlaneGeometry(cubeSize, cubeSize);
const material = shaderMaterial;
const occupiedPositions = new Set();

while (occupiedPositions.size < 20) {
    const x = Math.floor(Math.random() * gridSize) - gridSize * 0.5 + cubeSize * 0.5;
    const y = Math.floor(Math.random() * gridSize) - gridSize * 0.5 + cubeSize * 0.5;
    const z = Math.floor(Math.random() * gridSize) - gridSize * 0.5 + cubeSize * 0.5;
    const positionKey = `${x}_${y}_${z}`;

    if (!occupiedPositions.has(positionKey)) {
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x, y, z);
        cubeGroup.add(cube);
        occupiedPositions.add(positionKey);
    }
}

cubeGroup.scale.set(0.4, 0.4, 0.4);



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


    sphere1.updateColor(absTime);
    sphere2.updateColor(absTime);


    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

animate();
