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


const vertices = []

for (let i = 0; i < 400; i++) {
    const c = Math.random() * Math.PI * 2

    const x = Math.sin(c)
    const y = Math.random() * 2 - 1
    const z = Math.cos(c)

    vertices.push(x, y, z)
}

const geometry = new THREE.BufferGeometry()
geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))


for (let i = 0; i < 20; i++) {
    const points = new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
            size: 0.01
        })
    )

    points.scale.set(1 - i / 40, i / 20, 1 - i / 40)

    group1.add(points)
}

const rotatePoints = function () {
    group1.rotation.x = absTime * 0.4
}

const scalePoints = function () {
    group1.scale.y = Math.abs(Math.sin(absTime * 0.4)) + 0.2
}


const changeColors = function (c) {
    group1.children.forEach((mesh, index) => {
        const r = index / group1.children.length
        mesh.material.color.setHSL(c, r, 0.5)
    });
}

changeColors(1)


setInterval(function () {
    changeColors(Math.random() * 0.4)
}, 2000)



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
