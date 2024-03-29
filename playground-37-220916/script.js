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

class Point {
    pos = new THREE.Vector3(1.0, 1.0, 1.0)
    size = null
    cube = null
    boundingBox = null
    state = {
        prev: false,
        current: false
    }
    
    constructor(size = 1.0) {
        this.size = size * 0.1
    }

    randomPosition (scale = 1.0) {
        this.pos.x = (Math.random() - 0.5) * 2.0 * scale
        this.pos.y = (Math.random() - 0.5) * 2.0 * scale
        this.pos.z = (Math.random() - 0.5) * 2.0 * scale
    }

    createMesh () {
        this.cube = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial({color: 'hsl(0, 0%, 100%)'})
        )
    }

    setMeshSize () {
        this.cube.scale.setScalar(this.size)
    }
    
    setMeshPosition () {
        this.cube.position.x = this.pos.x
        this.cube.position.y = this.pos.y
        this.cube.position.y = this.pos.y
    }
    
    createBoundingBox () {
        this.boundingBox = new THREE.Box3().setFromObject(this.cube)
    }

    addToScene() {
        scene.add(this.cube)
        console.log(this.cube)
    }

    checkCollision (mesh) {
        this.state.current = this.boundingBox.intersectsPlane(mesh)

        if (this.state.prev == false && this.state.current == true) {
            playNote(400)
        }

        this.state.prev = this.state.current
    }

    showIntersection (mesh) {
        if (this.boundingBox.intersectsPlane(mesh)) {
            this.cube.material.color.setHSL(0, 0, 1)
        } else {
            this.cube.material.color.setHSL(0, 0, 0.5)
        }
    }

    create () {
        this.randomPosition()
        this.createMesh()
        this.setMeshPosition()
        this.setMeshSize()
        this.createBoundingBox()
        this.addToScene()
    }
}

const point = new Point()

point.create()

console.log(point)



// Create a plane and move it around

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshStandardMaterial({
        color: 'hsl(0, 0%, 80%)',
        side: THREE.DoubleSide
    })
)

plane.scale.setScalar(2.0)
plane.rotation.y = Math.PI * 0.5

scene.add(plane)


const planeVector = new THREE.Vector3(1, 0, 0)
const intersectPlane = new THREE.Plane(planeVector, 1)


let currentPosition = 0

const updatePosition = function () {
    currentPosition = (absTime * 0.4)%2 - 1
}

const movePlane = function () {
    plane.position.x = currentPosition
    intersectPlane.set(planeVector, -currentPosition)
}



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
    updatePosition()
    movePlane()

    point.checkCollision(intersectPlane)
    point.showIntersection(intersectPlane)

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
