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


const createRandomPoints = function (num, scale) {
    const points = []

    const randomNumber = function () {
        const number = (Math.random() - 0.5) * 2.0 * scale
        return number
    }

    for (let i = 0; i < num; i++) {
        const point = new THREE.Vector3(randomNumber(), randomNumber(), randomNumber());
        points.push(point)
    }

    return points
}

const points = createRandomPoints(20, 0.8)

console.log(points)

const cubes = new THREE.Group()

points.forEach(point => {
    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({color: 'hsl(0, 0%, 100%)'})
    )

    cube.position.x = point.x
    cube.position.y = point.y
    cube.position.z = point.z

    cube.scale.setScalar(0.1)

    cubes.add(cube)
});

console.log(cubes)

scene.add(cubes)





const planeVector = new THREE.Vector3(1, 0, 0)
const plane1 = new THREE.Plane(planeVector, 1)


const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({color: 'hsl(0, 0%, 100%)'})
)

cube.geometry.computeBoundingBox()
let boundingBox = new THREE.Box3().setFromObject(cube)

scene.add(cube)


let intersects = false
let allowTrigger = true

const checkPlaneIntersection = function () {
    const position = (absTime * 0.4)%2 - 1

    plane1.set(planeVector, position)

    intersects = boundingBox.intersectsPlane(plane1)

    if (intersects && allowTrigger) {
        console.log('Trigger')
        allowTrigger = false
    }

    if (!intersects && !allowTrigger) {
        allowTrigger = true
    }
}


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

let currentPosition = 0

const updatePosition = function () {
    currentPosition = (absTime * 0.4)%2 - 1
}

const movePlane = function () {
    plane.position.x = currentPosition
}

let intersection = 0
let allowAdd = true

const addToIntersection = function () {
    if (allowAdd) {
        intersection += 1
        allowAdd = false
        setTimeout(function () {
            allowAdd = true
        }, 200)
    }
}

const checkIntersection = function () {
    points.forEach(point => {
        if (point.x > currentPosition - 0.01 && point.x < currentPosition + 0.01) {
            addToIntersection()
            console.log(intersection)
        }
    });
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
    checkPlaneIntersection()

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
