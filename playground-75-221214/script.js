import * as THREE from 'https://cdn.skypack.dev/three@0.132.2'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js'


const canvas = document.querySelector('canvas.webgl')


// Scene
const scene = new THREE.Scene()


/*
    Geometry
*/

const points = []

for (let i = 0; i < 101; i++) {
    const n = (i / 100) * Math.PI * 2
    const p = {
        x: Math.sin(n),
        y: Math.cos(n),
        z:0
    }
    points.push(new THREE.Vector3(p.x, p.y, p.z))
}

const geometry = new THREE.BufferGeometry().setFromPoints(points)


const group = new THREE.Group()
scene.add(group)


const createCircle = function () {
    const circle = new THREE.Line(geometry, new THREE.LineBasicMaterial())
    group.add(circle)
}


for (let i = 0; i < 40; i++) {
    createCircle()
}

group.children.forEach((mesh, index) => {
    const n = index / group.children.length
    mesh.scale.setScalar(1.0 - n)
    mesh.rotation.y = n * 8.0
    mesh.rotation.y = n * 4.0
});



/*
    Lights
*/


// Construction
const lights = new THREE.Group()
scene.add(lights)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
lights.add(ambientLight)

const light1 = new THREE.DirectionalLight(0xffffff, 0.8)
light1.position.set(-2, 1, 4)
lights.add(light1)



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
renderer.shadowMap.enabled = true

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

    group.rotation.y = absTime
    group.rotation.z = absTime * 0.4


    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
