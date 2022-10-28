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
scene.add(group1)

group1.scale.setScalar(0.4)


const makeBox = function (p) {
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({color: 'hsl(0, 0%, 20%)', emissive: 'hsl(0, 0%, 0%)'})
    )
    box.position.set(p.x, p.y, p.z)
    group1.add(box)
}

makeBox({x: 0, y: 0, z: 0})


const raycaster = new THREE.Raycaster()

let intersects


const checkIntersection = function () {
    raycaster.setFromCamera(cursor, camera)
	intersects = raycaster.intersectObjects(group1.children)
}

const getIntersection = function (callback) {
    if (intersects.length == 0) {return}

    group1.children.forEach(target => {
        if (intersects[0].object == target) {
            callback(intersects[0])
        }
    });
}

const addMesh = function (target) {
    const p = {
        x: target.object.position.x + target.face.normal.x,
        y: target.object.position.y + target.face.normal.y,
        z: target.object.position.z + target.face.normal.z
    }

    makeBox(p)
}

const changeColor = function (target) {
    target.object.parent.children.forEach(box => {
        box.material.color.setHSL(0, 0, 0.1)
    });
    target.object.material.color.setHSL(0, 0, 0.8)
}

const deleteMesh = function (target) {
    target.object.geometry.dispose();
    target.object.material.dispose();
    group1.remove(target.object);
}

const highlightStep = function (target) {
    target.parent.children.forEach(box => {
        box.material.emissive.setHSL(0, 0, 0)
    });
    target.material.emissive.setHSL(0.7, 0.8, 0.2)

    setTimeout(function () {
        target.material.emissive.setHSL(0, 0, 0)
    }, 100)
}


let scale = Tonal.Scale.get('C2 major')
let initialNote = 'C2'


const createNote = function (pos) {
    let note = initialNote

    if (pos.x > 0) {
        note = scale.notes[pos.x]
    } else if (pos.x < 0) {
        let s = scale.notes.map(Tonal.Note.transposeBy("-8P"))
        s = s.reverse()
        note = s[Math.abs(pos.x + 1)]
    }

    if (pos.y > 0) {
        for (let i = 0; i < pos.y; i++) {
            note = Tonal.Note.transpose(note, "8P")          
        }
    } else if (pos.y < 0) {
        for (let i = 0; i < Math.abs(pos.y); i++) {
            note = Tonal.Note.transpose(note, "-8P")          
        }
    }

    const freq = Tonal.Note.freq(note)

    playNote(freq, 1)

    setTimeout(function () {
        playNote(freq, 0)
    }, 100)
}


let currentStep = 0


setInterval(function () {
    currentStep += 1

    if (currentStep > group1.children.length - 1) {
        currentStep = 0
    }

    createNote(group1.children[currentStep].position)

    highlightStep(group1.children[currentStep])

}, 200)




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

    checkIntersection()
    getIntersection(changeColor)
})


window.addEventListener('mousedown', function(e) {
    if (e.altKey) {
        getIntersection(deleteMesh)
    } else {
        getIntersection(addMesh)
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
