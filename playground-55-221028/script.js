import * as THREE from 'https://cdn.skypack.dev/three@0.132.2'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js'


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


const group1 = new THREE.Group()
group1.scale.setScalar(0.4)
scene.add(group1)

const createBox = function (p) {
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({color: 'hsl(0, 0%, 20%)'})
    )
    box.position.set(p.x, p.y, p.z)
    group1.add(box)
}

createBox({x: 0, y: 0, z: 0})




const group2 = new THREE.Group()
group2.scale.setScalar(0.4)
scene.add(group2)

const previewCube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({color: 'hsl(0, 0%, 80%)'})
)

group2.add(previewCube)



const setMeshPosition = function (target, direction) {
    const p = {
        x: target.position.x + direction.x,
        y: target.position.y + direction.y,
        z: target.position.z + direction.z
    }

    target.position.set(p.x, p.y, p.z)
}

setMeshPosition(previewCube, {x: 0, y: 1, z: 0})


const viewDirection = function () {
    const d = camera.getWorldDirection(new THREE.Vector3())

    let direction = ''

    if (d.z < -0.5) {
        direction = 'Front'
    } else if (d.z > 0.5) {
        direction = 'Back'
    } else if (d.x < -0.5) {
        direction = 'Right'
    } else if (d.x > 0.5) {
        direction = 'Left'
    } else if (d.y < -0.5) {
        direction = 'Top'
    } else if (d.y > 0.5) {
        direction = 'Bottom'
    }

    return direction
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


window.addEventListener('keydown', function (n) {

    const v = viewDirection()

    if (n.key == 'ArrowUp') {
        if (v == 'Front' || v == 'Back' || v == 'Right' || v == 'Left') {
            setMeshPosition(previewCube, {x: 0, y: 1, z: 0})
        } else if (v == 'Top') {
            setMeshPosition(previewCube, {x: 0, y: 0, z: -1})
        } else if (v == 'Bottom') {
            setMeshPosition(previewCube, {x: 0, y: 0, z: 1})
        }
    } else if (n.key == 'ArrowDown') {
        if (v == 'Front' || v == 'Back' || v == 'Right' || v == 'Left') {
            setMeshPosition(previewCube, {x: 0, y: -1, z: 0})
        } else if (v == 'Top') {
            setMeshPosition(previewCube, {x: 0, y: 0, z: 1})
        } else if (v == 'Bottom') {
            setMeshPosition(previewCube, {x: 0, y: 0, z: -1})
        }
    } else if (n.key == 'ArrowRight') {
        if (v == 'Front' || v == 'Top') {
            setMeshPosition(previewCube, {x: 1, y: 0, z: 0})
        } else if (v == 'Back') {
            setMeshPosition(previewCube, {x: -1, y: 0, z: 0})
        } else if (v == 'Left' || v == 'Bottom') {
            setMeshPosition(previewCube, {x: 0, y: 0, z: 1})
        } else if (v == 'Right') {
            setMeshPosition(previewCube, {x: 0, y: 0, z: -1})
        }
    } else if (n.key == 'ArrowLeft') {
        if (v == 'Front' || v == 'Top') {
            setMeshPosition(previewCube, {x: -1, y: 0, z: 0})
        } else if (v == 'Back') {
            setMeshPosition(previewCube, {x: 1, y: 0, z: 0})
        } else if (v == 'Left' || v == 'Bottom') {
            setMeshPosition(previewCube, {x: 0, y: 0, z: -1})
        } else if (v == 'Right') {
            setMeshPosition(previewCube, {x: 0, y: 0, z: 1})
        }
    }

    if (n.code == 'Space') {
        createBox(previewCube.position)
    }
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
