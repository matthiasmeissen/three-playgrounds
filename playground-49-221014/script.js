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
    constructor (a, b) {
        this.a = a,
        this.b = b
    }
}

class Box {
    constructor (size) {
        this.boxSize = {x: 0.2, y: 1, z: 1}
        this.trigSize = {x: 0.2, y: 0.2, z: 0.2}

        this.createBox(this.boxSize)
        this.createTrig(this.trigSize)
    }

    createBox (size) {
        const box = new THREE.Mesh(
            new THREE.BoxGeometry(size.x, size.y + this.trigSize.y, size.z + this.trigSize.z),
            new THREE.MeshBasicMaterial({color: 'hsl(0, 0%, 20%)', wireframe: true})
        )

        this.boxGroup = new THREE.Group()
        this.boxGroup.add(box)
        scene.add(this.boxGroup)
    }

    setBox (x) {
        this.boxGroup.position.x = this.boxSize.x * x
    }

    createTrig (size) {
        this.trig = new THREE.Mesh(
            new THREE.BoxGeometry(size.x, size.y, size.z),
            new THREE.MeshStandardMaterial({color: 'hsl(0, 0%, 50%)'})
        )

        this.boxGroup.add(this.trig)
    }

    setTrig (y, z) {
        this.trig.position.y = this.boxSize.y * -0.5 + y
        this.trig.position.z = this.boxSize.z * -0.5 + z
    }

    highlightTrig (state) {
        if (state) {
            this.trig.material.color.setHSL(0, 0, 1)
        } else {
            this.trig.material.color.setHSL(0, 0, 0.5)
        }
    }
}


const steps = []

for (let i = 0; i < 4; i++) {
    const step = {
        values: new Step(Math.random(), Math.random()),
        box: new Box()
    }

    step.box.setBox(i)
    step.box.setTrig(step.values.a, step.values.b)

    steps.push(step)
}

const setActiveBox = function (num) {
    steps.forEach(step => {
        step.box.highlightTrig(false)
    });

    steps[num].box.highlightTrig(true)
}

const playSound = function (val) {
    const freq = val * 100 + 200

    playNote(freq, 1)

    setTimeout(function () {
        playNote(freq, 0)
    }, 200)
}

let currentStep = 0

setInterval(function () {
    setActiveBox(currentStep)
    playSound(steps[currentStep].values.a)

    currentStep += 1

    if (currentStep > steps.length - 1) {
        currentStep = 0
    }
}, 400)



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
