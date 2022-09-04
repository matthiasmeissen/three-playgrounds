import * as THREE from 'https://cdn.skypack.dev/three@0.132.2'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js'

import { cp, ctx, drawCanvas } from './canvas.js'


const canvas = document.querySelector('canvas.webgl')


// Audio 

if (typeof (WebAssembly) === "undefined") {
    alert("WebAssembly is not supported in this browser, the page will not work !")
}

var isWebKitAudio = (typeof (webkitAudioContext) !== "undefined");
var audio_context = (isWebKitAudio) ? new webkitAudioContext() : new AudioContext();
var sound_dsp = null;

const startSound = function () {
    var plugin = new Faustsound(audio_context, ".");
    plugin.load().then(node => {
        sound_dsp = node;
        console.log(sound_dsp.getParams());
        
        sound_dsp.setParamValue("/sound/gain", 0.4);
        sound_dsp.connect(audio_context.destination);
    });
}

window.addEventListener('load', startSound);

window.addEventListener('touchstart', function () {
    if (audio_context.state !== "suspended") return;
    var buffer = audio_context.createBuffer(1, 1, 22050);
    var source = audio_context.createBufferSource();
    source.buffer = buffer;
    source.connect(audio_context.destination);
    source.start();
    audio_context.resume().then(() => console.log("Audio resumed"));
}, false);


window.addEventListener("mousedown", () => {
    if (audio_context.state !== "suspended") return;
    audio_context.resume().then(() => console.log("Audio resumed"))
});

let playAudio = true;

const addButton = function () {
    const button = document.createElement('button')
    button.style.position = 'fixed'
    button.style.bottom = '20px'
    button.style.left = '20px'

    button.innerHTML = 'Play Audio'

    button.addEventListener('click', function () {
        if (playAudio) {
            sound_dsp.setParamValue("/sound/gain", 0.0)
            playAudio = false
        } else {
            sound_dsp.setParamValue("/sound/gain", 0.4)
            playAudio = true
        }
    })

    document.body.appendChild(button)
}

addButton()


// Scene
const scene = new THREE.Scene()


/*
    Geometry
*/


const points = [];

const createPoints = function (num, size) {
    for (let i = 0; i < num; i++) {
        points.push(new THREE.Vector3((Math.random() - 0.5) * size, (Math.random() - 0.5) * size, (Math.random() - 0.5) * size))
    }
}

createPoints(10, 2)


let distances = []

const measureDistances = function () {
    points.forEach((point, index) => {
        if (index < points.length - 1) {
            const distance = points[index].distanceTo(points[index + 1])
            distances.push(distance)
        }
    });

    distances.unshift(1.0)
}

measureDistances()

console.log(distances)


const group = new THREE.Group()

const geometry = new THREE.CylinderGeometry(0.04, 0.04, 0.2, 32)
const material = new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(ctx.canvas) })


points.forEach((point, index) => {
    
    const mesh = new THREE.Mesh(geometry, material)

    mesh.position.x = point.x
    mesh.position.y = point.y
    mesh.position.z = point.z

    group.add(mesh)
});

scene.add(group)

group.children[0].scale.setScalar(2.0)

const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 'hsl(0, 0%, 100%)' })
);

scene.add(line)

/*
    Lights
*/


// Parameters
const lightParameters = {
    rotate: true,
    speed: 0.2
}

// Construction
const lights = new THREE.Group()
scene.add(lights)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
scene.add(ambientLight)

const light1 = new THREE.DirectionalLight(0xffffff, 0.8)
light1.position.set(2, 2, 4)
lights.add(light1)

const light2 = new THREE.DirectionalLight(0xffffff, 0.8)
light2.position.set(-2, 2, -4)
lights.add(light2)

// Functions
const rotateLights = () => {
    lights.rotation.y = absTime * lightParameters.speed
    lights.rotation.x = absTime * lightParameters.speed
}


/*
    Camera
*/


// Construction
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight)
camera.position.set(0, 0, 4)
scene.add(camera)


/*
    Renderer
*/


// Construction
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)

// Functions
window.addEventListener('resize', onWindowResize);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

const orbitControls = new OrbitControls(camera, renderer.domElement)


// Fullscreen

window.addEventListener('dblclick', function () {

    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement

    if (!fullscreenElement) {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen()
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen()
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen()
        }
    }
})


// Mouse Position

const cursor = new THREE.Vector2()

window.addEventListener('mousemove', function (event) {
    cursor.x = (event.clientX / window.innerWidth) * 2 - 1
    cursor.y = - (event.clientY / window.innerHeight) * 2 + 1
})


// Clock

const clock = new THREE.Clock()
let absTime


// Animate

function animate() {
    absTime = clock.getElapsedTime()

    drawCanvas(absTime)
    material.map.needsUpdate = true

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
