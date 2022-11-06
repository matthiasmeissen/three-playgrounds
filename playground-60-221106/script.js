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
    new THREE.MeshStandardMaterial({color: 'hsl(0, 0%, 80%)', side: THREE.DoubleSide})
)

plane.position.z = -0.2

plane.receiveShadow = true

scene.add(plane)

const group1 = new THREE.Group
scene.add(group1)


let currentColor = new THREE.Color()

const createCube = function (p, color) {
    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.2, 0.2),
        new THREE.MeshStandardMaterial({color: color})
    )
    
    cube.position.set(p.x, p.y, p.z)

    cube.castShadow = true
    cube.receiveShadow = true

    group1.add(cube)
}

createCube({x: 0, y: 0, z: 0}, currentColor)


const previewCube = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.2, 0.2),
    new THREE.MeshStandardMaterial({color: 'hsl(200, 80%, 40%)', transparent: true, opacity: 0.2})
)

scene.add(previewCube)



const raycaster = new THREE.Raycaster()


let allowAdd = false


const checkIntersection = function () {
    raycaster.setFromCamera(cursor, camera);
	const intersects = raycaster.intersectObject(plane);

    if (intersects.length > 0) {
        const p = intersects[0].point
        previewCube.visible = true

        const px = Math.floor(p.x * 5) / 5
        const py = Math.floor(p.y * 5) / 5

        previewCube.position.set(px, py, positionZ)

        allowAdd = true
        return
    }

    allowAdd = false
    previewCube.visible = false
}


let positionZ = 0


const checkColor = function () {
    raycaster.setFromCamera(cursor, camera);
	const intersects = raycaster.intersectObjects(colorGroup.children);

    if (intersects.length > 0) {
        currentColor = intersects[0].object.material.color

        previewCube.material.color = currentColor
    }
}


const colorGroup = new THREE.Group()
scene.add(colorGroup)


const colorPicker = function (steps, size) {
    for (let i = 0; i < steps; i++) {
        const colorCube = new THREE.Mesh(
            new THREE.BoxGeometry(size, size, size * 0.2),
            new THREE.MeshStandardMaterial({color: 'hsl(200, 80%, 40%)'})
        )

        colorCube.position.set(i * (size + 0.02) - steps * size * 0.5, -1.25, 0)
        colorCube.material.color.setHSL(i / steps, 0.6, 0.5)

        colorGroup.add(colorCube)
    }
}

colorPicker(8, 0.2)



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
light1.castShadow = true
lights.add(light1)

light1.shadow.mapSize.width = 1024
light1.shadow.mapSize.height = 1024
light1.shadow.camera.near = 4
light1.shadow.camera.far = 6

light1.shadow.camera.top = 1.0
light1.shadow.camera.right = 1.0
light1.shadow.camera.bottom = -1.0
light1.shadow.camera.left = -1.0


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

    checkIntersection()
    checkColor()
})


window.addEventListener('mousedown', function () {
    if (allowAdd) {
        const p = previewCube.position
        createCube(p, currentColor)
    }
})


window.addEventListener('keydown', function (n) {
    if (n.key == 'ArrowUp') {
        positionZ += 0.2
    } else if (n.key == 'ArrowDown') {
        positionZ -= 0.2
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
