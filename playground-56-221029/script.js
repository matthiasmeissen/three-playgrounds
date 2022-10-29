import * as THREE from 'https://cdn.skypack.dev/three@0.132.2'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js'


const canvas = document.querySelector('canvas.webgl')


// Scene
const scene = new THREE.Scene()


/*
    Geometry
*/


const layers = []


const createLayer = function () {
    const group = new THREE.Group()
    group.scale.setScalar(0.4)
    scene.add(group)

    layers.push(group)
}

createLayer()

let currentLayer = 0


const setActiveLayer = function (n) {
    layers.forEach(layer => {
        layer.visible = false
    })

    layers[n].visible = true
}

let allowPlay = false


setInterval(function () {
    if (allowPlay) {
        currentLayer += 1

        if (currentLayer > layers.length - 1) {
            currentLayer = 0
        }

        setActiveLayer(currentLayer)
    }
}, 200)



const createBox = function (p, layer) {
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({color: 'hsl(0, 0%, 20%)'})
    )
    box.position.set(p.x, p.y, p.z)
    layers[layer].add(box)
}


const makePreviewCube = function () {
    const group = new THREE.Group()
    group.scale.setScalar(0.4)
    scene.add(group)

    const previewCube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({
            color: 'hsl(0, 0%, 80%)',
            transparent: true,
            opacity: 0.4
        })
    )

    group.add(previewCube)

    return previewCube
}

const previewCube = makePreviewCube()


const setMeshPosition = function (target, direction) {
    const p = {
        x: target.position.x + direction.x,
        y: target.position.y + direction.y,
        z: target.position.z + direction.z
    }

    target.position.set(p.x, p.y, p.z)
}

setMeshPosition(previewCube, {x: 0, y: 1, z: 0})


const checkForCubes = function (n) {
    const p = previewCube.position
    layers[n].children.forEach(target => {
        const t = target.position
        if (t.x == p.x && t.y == p.y && t.z == p.z) {
            target.geometry.dispose()
            target.material.dispose()
            layers[n].remove(target)
        }
    });
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

    if (n.key == 'ArrowUp') {
        if (n.altKey == true) {
            createLayer()
            currentLayer = layers.length - 1
            setActiveLayer(currentLayer)
            return
        }

        setMeshPosition(previewCube, {x: 0, y: 1, z: 0})

    } else if (n.key == 'ArrowDown') {
        setMeshPosition(previewCube, {x: 0, y: -1, z: 0})

    } else if (n.key == 'ArrowRight') {
        if (n.altKey == true) {
            currentLayer += 1
            if (currentLayer > layers.length - 1) {
                currentLayer = 0
            }
            setActiveLayer(currentLayer)
            return
        }

        setMeshPosition(previewCube, {x: 1, y: 0, z: 0})

    } else if (n.key == 'ArrowLeft') {
        if (n.altKey == true) {
            currentLayer -= 1
            if (currentLayer < 0) {
                currentLayer = layers.length - 1
            }
            setActiveLayer(currentLayer)
            return
        }

        setMeshPosition(previewCube, {x: -1, y: 0, z: 0})
    }

    if (n.key == 'p') {
        allowPlay = !allowPlay

        previewCube.visible = !allowPlay
    }

    if (n.key == 'd') {
        checkForCubes(currentLayer)
    }

    if (n.code == 'Space') {
        createBox(previewCube.position, currentLayer)
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
