import * as THREE from 'https://cdn.skypack.dev/three@0.132.2'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js'


const canvas = document.querySelector('canvas.webgl')


// Scene
const scene = new THREE.Scene()


/*
    Geometry
*/


let l = 10

let h = Math.random() * 360


const createCube = function (p, group) {
    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({color: 'hsl(' + h + ', 80%, ' + l +'%)'})
    )
    cube.position.set(p.x, p.y, p.z)
    group.add(cube)
}


const group1 = new THREE.Group()
group1.scale.setScalar(0.4)
scene.add(group1)


createCube({x: 0, y: 0, z: 0}, group1)

const changeLightness = function () {
    l += 1

    if (l > 90) {
        l = 10
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
})


window.addEventListener('keydown', function (n) {

    changeLightness()

    const p = group1.children[group1.children.length - 1].position

    if (n.key == 'ArrowRight') {
        createCube({x: p.x + 1, y: p.y, z: p.z}, group1); return
    }
    if (n.key == 'ArrowLeft') {
        createCube({x: p.x - 1, y: p.y, z: p.z}, group1); return
    }
    if (n.key == 'ArrowUp') {
        if (n.altKey == true) {
            createCube({x: p.x, y: p.y, z: p.z - 1}, group1); return
        }
        createCube({x: p.x, y: p.y + 1, z: p.z}, group1); return
    }
    if (n.key == 'ArrowDown') {
        if (n.altKey == true) {
            createCube({x: p.x, y: p.y, z: p.z + 1}, group1); return
        }
        createCube({x: p.x, y: p.y - 1, z: p.z}, group1); return
    }

    if (n.key == 'c') {
        h = Math.random() * 360
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
