import * as THREE from 'https://cdn.skypack.dev/three@0.132.2'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js'


const canvas = document.querySelector('canvas.webgl')


// Scene
const scene = new THREE.Scene()


/*
    Geometry
*/


const group1 = new THREE.Group()
group1.position.y = -0.4
scene.add(group1)


const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 4),
    new THREE.MeshStandardMaterial({color: 'hsl(0, 0%, 20%)'})
)
floor.rotation.x = Math.PI * -0.5
floor.receiveShadow = true
group1.add(floor)


for (let i = 0; i < 20; i++) {
    const t = Math.random() * 2
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, t, 0.1),
        new THREE.MeshStandardMaterial({color: 'hsl(0, 0%, 20%)'})
    )
    const r = Math.random()
    const s = Math.random() + 0.8
    box.position.set(Math.sin(r * Math.PI * 2.0) * s, t * 0.5,  Math.cos(r * Math.PI * 2.0) * s)
    box.rotation.y = Math.random()

    box.castShadow = true
    box.receiveShadow = true

    group1.add(box)
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

light1.castShadow = true
light1.shadow.camera.near = 2
light1.shadow.camera.far = 8
light1.shadow.camera.top = 1
light1.shadow.camera.bottom = -1
light1.shadow.camera.left = -2
light1.shadow.camera.right = 2

lights.add(light1)

const pointLight1 = new THREE.PointLight('hsl(240, 80%, 50%)', 2)
pointLight1.castShadow = true
pointLight1.shadow.camera.far = 4
lights.add(pointLight1)

const pointLight2 = new THREE.PointLight('hsl(40, 20%, 50%)', 0.8)
pointLight2.castShadow = true
pointLight2.shadow.camera.far = 4
lights.add(pointLight2)



/*
    Camera
*/


// Construction
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight)
camera.position.set(0, 0, 4)
scene.add(camera)

scene.fog = new THREE.Fog('hsl(0, 0%, 0%)', 2, 8)


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

    pointLight1.position.set(Math.sin(absTime), 0, Math.cos(absTime))
    pointLight2.position.set(Math.sin(absTime * 0.2) * 1.4, 0, Math.cos(absTime * 0.2) * 1.4)

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
