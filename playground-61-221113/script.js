import * as THREE from 'https://cdn.skypack.dev/three@0.132.2'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js'


const canvas = document.querySelector('canvas.webgl')


// Scene
const scene = new THREE.Scene()


/*
    Geometry
*/


const group1 = new THREE.Group()
group1.scale.setScalar(0.4)
scene.add(group1)


const geometry = new THREE.BoxGeometry(1, 1, 1)


const createCube = function (p = {x: 0, y: 0, z: 0}) {
    const box = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color: 'hsl(0, 0%, 80%)'}))
    box.position.set(p.x, p.y, p.z)
    group1.add(box)
}

createCube()


const getRandomPosition = function (p) {
    const direction = Math.random() < 0.5 ? -1.0 : 1.0
    const num = Math.floor(Math.random() * 3)

    let newPos

    if (num == 0) {
        newPos = {x: p.x + direction, y: p.y, z: p.z}
    } else if (num == 1) {
        newPos = {x: p.x, y: p.y + direction, z: p.z}
    } else {
        newPos = {x: p.x, y: p.y, z: p.z + direction}
    }

    return newPos
}


const createRandomCube = function () {
    const latestCube = group1.children[group1.children.length - 1]
    let newPos = getRandomPosition(latestCube.position)
    createCube(newPos)
}

let count = 0
const amount = 400

let color = Math.random()


setInterval(function () {
    if (count < amount) {
        createRandomCube()
        if (count == amount * 0.5) {
            color = Math.random()
        }
        group1.children[count].material.color.setHSL(color, count / amount, count / (amount * 2.0))
        count += 1
    }
}, 100)



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

const light2 = new THREE.DirectionalLight(0xffffff, 0.8)
light2.position.set(-2, 1, 4)
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


    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
