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


class Step {
    constructor (p) {
        this.pos = new THREE.Vector3(p.x, p.y, p.z)
        this.np = new THREE.Vector3(0, 0, 0)

        this.createBox()
    }

    createBox () {
        this.box = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial({color: 'hsl(0, 0%, 20%)'})
        )
        this.box.position.set(this.pos.x, this.pos.y, this.pos.z)
        group1.add(this.box)
    }

    getSide () {
        this.intersects = raycaster.intersectObject(this.box)
        if (this.intersects.length > 0) {
            this.np = {
                x: this.pos.x + this.intersects[0].face.normal.x,
                y: this.pos.y + this.intersects[0].face.normal.y,
                z: this.pos.z + this.intersects[0].face.normal.z
            }
            setPreviewCube(this.np)
        }
    }
}



const group2 = new THREE.Group()
group2.scale.setScalar(0.4)
scene.add(group2)

const previewCube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({
        color: 'hsl(0, 100%, 50%)', 
        transparent: true,
        opacity: 0.2
    })
)

group2.add(previewCube)

const setPreviewCube = function (p) {
    previewCube.position.set(p.x, p.y, p.z)
}



const steps = []

const addStep = function (p) {
    const box = new Step(p)
    steps.push(box)
}

const getSides = function () {
    steps.forEach(step => {
        step.getSide()
    });
}

let allowAdd = true


addStep({x: 0, y: 0, z: 0})

const raycaster = new THREE.Raycaster()

let currentStep = 0

setInterval(function () {
    currentStep += 1

    if (currentStep > steps.length - 1) {
        currentStep = 0
    }

    const freq = notes.getNote(steps[currentStep].pos)

    playNote(freq, 1)

    setTimeout(function () {
        playNote(freq, 0)
    }, 100)

    steps.forEach(step => {
        step.box.material.color.setHSL(0, 0, 0.2)
    });

    steps[currentStep].box.material.color.setHSL(0, 1, 1)
}, 200)



class Notes {
    constructor (scale) {
        this.scale = Tonal.Scale.get(scale)
        this.initialNote = scale.slice(0, 2)
    }

    getNote (pos) {
        this.note = this.initialNote

        if (pos.x > 0) {
            this.note = this.scale.notes[pos.x]
        } else if (pos.x < 0) {
            let s = this.scale.notes.map(Tonal.Note.transposeBy("-8P"))
            s = s.reverse()
            this.note = s[Math.abs(pos.x + 1)]
        }

        if (pos.y > 0) {
            for (let i = 0; i < pos.y; i++) {
                this.note = Tonal.Note.transpose(this.note, "8P")          
            }
        } else if (pos.y < 0) {
            for (let i = 0; i < Math.abs(pos.y); i++) {
                this.note = Tonal.Note.transpose(this.note, "-8P")          
            }
        }

        this.freq = Tonal.Note.freq(this.note)

        return this.freq
    }
}

const notes = new Notes('C2 major')




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

    raycaster.setFromCamera( cursor, camera );

    getSides()
})


window.addEventListener('mousedown', function () {
    allowAdd = true
    steps.forEach(step => {
        if (step.intersects.length > 0 && allowAdd) {
            addStep(previewCube.position)
            allowAdd = false
        }
    });
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
