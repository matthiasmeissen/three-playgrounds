import * as THREE from 'https://cdn.skypack.dev/three@0.132.2'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js'


const canvas = document.querySelector('canvas.webgl')


// Scene
const scene = new THREE.Scene()


/*
    Geometry
*/


const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.MeshBasicMaterial({color: 'hsl(0, 0%, 20%)', side: THREE.DoubleSide})
)

scene.add(plane)


const points = []

points.push(new THREE.Vector3(-0.2, 0, 0))
points.push(new THREE.Vector3(0.2, 0.0, 0))


const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial()
)

scene.add(line)


const raycaster = new THREE.Raycaster()



let position = 0


const checkPosition = function () {
    raycaster.setFromCamera(cursor, camera)
	const intersects = raycaster.intersectObject(plane)

    if (intersects.length > 0) {
        const p = intersects[0].point

        points.push(p)

        const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial()
        )

        line.material.color.setHSL(position, 1, 0.5)

        position += 0.01

        line.position.x += position * 0.2
        line.position.z += position

        scene.add(line)
    }
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

const light2 = new THREE.DirectionalLight(0xffffff, 0.8)
light2.position.set(-2, 2, 4)
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

window.addEventListener('mousedown', function () {
    checkPosition()
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
