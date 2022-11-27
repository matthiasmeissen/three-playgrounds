import * as THREE from 'https://cdn.skypack.dev/three@0.132.2'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js'


const canvas = document.querySelector('canvas.webgl')


// Scene
const scene = new THREE.Scene()


/*
    Geometry
*/


const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 0.4),
    new THREE.MeshStandardMaterial({
        color: 'hsl(0, 0%, 20%)'
    })
)

cube.receiveShadow = true

scene.add(cube)


const group1 = new THREE.Group()
scene.add(group1)


for (let i = 0; i < 40; i++) {
    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshStandardMaterial({
            color: 'hsl(0, 0%, 40%)'
        })
    )

    const p = {
        x: (Math.random() - 0.5) * 0.9,
        y: (Math.random() - 0.5) * 1.9,
        z: Math.random() * 0.4 + 0.2
    }

    cube.material.color.setHSL((p.y + 2) / 8 + 0.4, 0.5, 0.4)

    cube.position.set(p.x, p.y, p.z)
    cube.scale.setScalar(0.1)

    cube.castShadow = true
    cube.receiveShadow = true

    group1.add(cube)
}




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

light1.castShadow = true

light1.shadow.mapSize.width = 1024
light1.shadow.mapSize.height = 1024

light1.shadow.camera.near = 3
light1.shadow.camera.far = 6

light1.shadow.camera.top = 1
light1.shadow.camera.right = 0.8
light1.shadow.camera.bottom = -1
light1.shadow.camera.left = -0.8



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
