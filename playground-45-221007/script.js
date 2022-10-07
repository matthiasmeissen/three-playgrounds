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


class Step {
    constructor (x, y, z, gx = 0) {
        this.stepSize = [x, y, z]
        this.stepGroup = new THREE.Group()
        this.groupPositionX = gx
        this.trigSize = 0.2

        this.addBox()
    }

    addBox () {
        this.box = new THREE.Mesh(
            new THREE.BoxGeometry(this.stepSize[0], this.stepSize[1] + this.trigSize, this.stepSize[2] + this.trigSize),
            new THREE.MeshBasicMaterial({color: 'hsl(0, 0%, 20%)', wireframe: true})
        )

        this.stepGroup.add(this.box)

        scene.add(this.stepGroup)
        this.stepGroup.position.x = this.groupPositionX
    }

    addTrig () {
        this.trig = new THREE.Mesh(
            new THREE.BoxGeometry(this.stepSize[0], this.trigSize, this.trigSize),
            new THREE.MeshStandardMaterial({color: 'hsl(0, 0%, 50%)'})
        )
        
        this.stepGroup.add(this.trig)
    }

    setTrig (y, z) {
        this.valueY = y
        this.valueZ = z

        y = -this.stepSize[1] * 0.5 + y
        z = -this.stepSize[2] * 0.5 + z

        this.trig.position.y = y
        this.trig.position.z = z
    }

    activeColor (state) {
        if (state) {
            this.box.material.color.setHSL(0, 0, 1)
            this.trig.material.color.setHSL(0, 0, 1)
        } else {
            this.box.material.color.setHSL(0, 0, 0.2)
            this.trig.material.color.setHSL(0, 0, 0.5)
        }
    }
}


class Sequencer {
    constructor (numSteps) {
        this.numSteps = numSteps
        this.currentStep = 0
        this.steps = []
        
        this.addSteps(this.numSteps)
    }

    addSteps (num) {
        const s = 1 / num

        for (let i = 0; i < num; i++) {
            const step = new Step(s, 1, 1, (i * s) + (s * 0.5) - 0.5)
            step.addTrig()
            step.setTrig(Math.random(), Math.random()) 

            this.steps.push(step)
        }
    }

    nextStep () {
        if (this.currentStep > this.numSteps - 1) {
            this.currentStep = 0
        }

        this.steps.forEach(step => {
            step.activeColor(false)
        });

        this.steps[this.currentStep].activeColor(true)

        this.playSound(this.steps[this.currentStep])

        this.currentStep += 1
    }

    playSound (target) {
        const freq = target.valueY * 100 + 200

        playNote(freq, 1)

        setTimeout(function () {
            playNote(freq, 0)
        }, 200)
    }
}

const sequencer = new Sequencer(4)

setInterval(function () {
    sequencer.nextStep()
}, 800)


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



    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
