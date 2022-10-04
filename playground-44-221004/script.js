import * as THREE from 'https://cdn.skypack.dev/three@0.132.2'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js'
import { RectAreaLightUniformsLib } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/lights/RectAreaLightUniformsLib.js';


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
        
        sound_dsp.setParamValue("/sound/Gain", 0.4);
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

let audioPlaying = true;

const addButton = function () {
    const button = document.createElement('button')
    button.style.position = 'fixed'
    button.style.bottom = '20px'
    button.style.left = '20px'

    button.innerHTML = 'Activate Audio'

    button.addEventListener('click', function () {
        if (audio_context.state !== "suspended") return;
        audio_context.resume().then(() => console.log("Audio resumed"))
    })

    document.body.appendChild(button)
}

addButton()


const playNote = function (freq, gate) {
    sound_dsp.setParamValue("/sound/Freq", freq)
    sound_dsp.setParamValue("/sound/Gate", gate)
}


// Scene
const scene = new THREE.Scene()


/*
    Geometry
*/

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 10),
    new THREE.MeshStandardMaterial({color: 'hsl(0, 0%, 2%)'})
)

floor.position.y = -1
floor.rotation.x = Math.PI * -0.5

scene.add(floor)


class movePlane {
    constructor (size) {
        this.size = size

        this.addObject()
    }

    addObject() {
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(this.size[0], this.size[1], this.size[2]),
            new THREE.MeshStandardMaterial({color: 'hsl(0, 0%, 50%)'})
        )
        scene.add(this.mesh)
    }
}

const planes = []

for (let i = 0; i < 40; i++) {
    const plane = new movePlane([0.01, 2, 2])
    planes.push(plane)
}

const movePlanes = function () {
    const speed = ((absTime * 0.2) % 1 - 0.5) * 2.0

    planes.forEach((plane, index) => {
        plane.mesh.position.x = speed * index
        plane.mesh.position.t = index
        plane.mesh.material.color.setHSL(index / planes.length, 1, 0.5)
    });
}


/*
    Lights
*/


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

    movePlanes()

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
