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


const playNote = function (freq) {
    sound_dsp.setParamValue("/sound/freq", freq)
    sound_dsp.setParamValue("/sound/gate", 1.0)

    setTimeout(function () {
        sound_dsp.setParamValue("/sound/gate", 0.0)
    }, 200)
}


// Scene
const scene = new THREE.Scene()


/*
    Geometry
*/

class SequenceMesh {
    state = {
        prev: false,
        current: false
    }
    
    constructor(mesh) {
        this.mesh = mesh
        this.createBoundingBox()
        this.addToScene()
    }
    
    createBoundingBox () {
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh)
    }

    addToScene() {
        scene.add(this.mesh)
    }

    checkCollision (mesh) {
        this.state.current = this.boundingBox.intersectsPlane(mesh)

        if (this.state.prev == false && this.state.current == true) {
            playNote(setFreq(this.mesh.position.y))
        }

        this.state.prev = this.state.current
    }

    showIntersection (mesh) {
        if (this.boundingBox.intersectsPlane(mesh)) {
            this.mesh.material.color.setHSL(0, 0, 1)
        } else {
            this.mesh.material.color.setHSL(0, 0, 0.5)
        }
    }
}

const setFreq = function (val) {
    const freq = 400 + val * 100
    return freq
}

const randomNumber = function (scale = 1.0) {
    return (Math.random() - 0.5) * 2.0 * scale
}


class Sequencer {
    triggers = []
    currentPosition = 0

    constructor ({num = 10, speed = 0.4} = {}) {
        this.speed = speed
        this.createPlane()
        this.addTriggers(num)
    }

    createPlane () {
        this.plane = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1),
            new THREE.MeshStandardMaterial({
                color: 'hsl(0, 0%, 80%)',
                side: THREE.DoubleSide
            })
        )
        
        this.plane.scale.setScalar(2.0)
        this.plane.rotation.y = Math.PI * 0.5
        
        scene.add(this.plane)

        this.planeVector = new THREE.Vector3(1, 0, 0)
        this.intersectPlane = new THREE.Plane(this.planeVector, 1)
    }

    addTriggers (num) {
        for (let i = 0; i < num; i++) {
            const cube = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshStandardMaterial({color: 'hsl(0, 0%, 100%)'})
            )
            
            cube.position.set(randomNumber(), randomNumber(), randomNumber())
            cube.scale.setScalar(0.1)

            const sequenceMesh = new SequenceMesh(cube)
            this.triggers.push(sequenceMesh)
        }

        console.log(this.triggers)
    }

    movePlane () {
        this.currentPosition = (absTime * this.speed)%2 - 1

        this.plane.position.x = this.currentPosition
        this.intersectPlane.set(this.planeVector, -this.currentPosition)
    }

    checkCollisions () {
        this.triggers.forEach(trigger => {
            trigger.checkCollision(this.intersectPlane)
            trigger.showIntersection(this.intersectPlane)
        });
    }
}

const sequencer = new Sequencer()




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

    sequencer.movePlane()
    sequencer.checkCollisions()

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
