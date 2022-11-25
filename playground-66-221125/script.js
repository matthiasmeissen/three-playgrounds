import * as THREE from 'https://cdn.skypack.dev/three@0.132.2'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js'


const canvas = document.querySelector('canvas.webgl')


// Scene
const scene = new THREE.Scene()


/*
    Geometry
*/

const group1 = new THREE.Group()
scene.add(group1)

const createPoints = function (s, c) {
    const points = new THREE.Points(
        new THREE.SphereGeometry(),
        new THREE.PointsMaterial({
            size: 0.02,
            color: 'hsl(0, 100%, 50%)'
        })
    )
    points.scale.setScalar(s)
    points.rotation.y = c
    points.rotation.z = c * 0.2
    points.material.color.setHSL(c, 1, 0.5)
    group1.add(points)
}

for (let i = 0; i < 80; i++) {
    createPoints(i * 0.1 + 2.0, i * 0.02)
}


const rotatePoints = function () {
    group1.rotation.x = Math.PI * 0.5
    group1.rotation.y = absTime * 0.1
    group1.rotation.z = absTime * 0.2
}


const scalePoints = function () {
    const s = Math.abs(Math.sin(absTime * 0.2)) * 0.8 + 0.2
    group1.scale.setScalar(s)
}



/*
    Lights
*/


// Construction
const lights = new THREE.Group()
scene.add(lights)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
lights.add(ambientLight)

const light1 = new THREE.DirectionalLight(0xffffff, 0.2)
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

    rotatePoints()
    scalePoints()

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
