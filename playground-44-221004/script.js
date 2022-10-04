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

class StaticObject {
    constructor (mesh, pos, size) {
        this.mesh = mesh
        this.pos = pos
        this.size = size

        this.addObject()
        this.createBoundingBox()
    }

    addObject() {
        this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z)
        this.mesh.scale.setScalar(this.size)
        scene.add(this.mesh)
    }

    createBoundingBox() {
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh)
    }
}

class CollissionBox {
    constructor (size) {
        this.size = size

        this.addObject()
        this.createBoundingBox()
    }

    addObject() {
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(this.size[0], this.size[1], this.size[2]),
            new THREE.MeshStandardMaterial({color: 'hsl(0, 0%, 50%)'})
        )
        scene.add(this.mesh)
    }

    createBoundingBox() {
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh)
    }

    moveObject(speed, direction) {
        speed = ((absTime * speed)%1 - 0.5) * 2.0
        this.mesh.position.set(speed * direction[0], speed * direction[1], speed * direction[2])
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh)
    }

    checkIntersection(target) {
        this.intersection = this.boundingBox.intersectsBox(target.boundingBox)
    }

    changeColor(target) {
        if (this.intersection && absTime > 1) {
            target.mesh.material.color.setHSL(0, 0, 1)
        } else if (!this.intersection && absTime > 1) {
            target.mesh.material.color.setHSL(0, 0, 0.5)
        }
    }

    changeSize(target) {
        if (this.intersection && absTime > 1) {
            target.mesh.material.emissive.setHSL(0, 1, 1)
        } else if (!this.intersection && absTime > 1) {
            target.mesh.material.emissive.setHSL(0, 1, 0)
        }
    }

    playNote() {
        if (this.intersection && absTime > 1) {
            playNote(200, 1.0)
        } else if (!this.intersection && absTime > 1) {
            playNote(200, 0.0)
        }
    }
}

const collissionBox1 = new CollissionBox([0.01, 2, 2])
const collissionBox2 = new CollissionBox([2, 0.01, 2])

const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({color: 'hsl(0, 0%, 50%)'})
)

const pos = new THREE.Vector3(0, 0, 0)

const staticObject1 = new StaticObject(mesh, pos, 0.2)

console.log(staticObject1)


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


    collissionBox1.moveObject(0.2, [1, 0, 0])
    collissionBox2.moveObject(0.1, [0, -1, 0])

    collissionBox1.checkIntersection(staticObject1)
    collissionBox1.changeColor(staticObject1)
    collissionBox1.playNote()

    collissionBox2.checkIntersection(staticObject1)
    collissionBox2.changeSize(staticObject1)

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
