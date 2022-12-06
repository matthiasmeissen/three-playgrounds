import * as THREE from 'https://cdn.skypack.dev/three@0.132.2'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js'


const canvas = document.querySelector('canvas.webgl')


// Scene
const scene = new THREE.Scene()


/*
    Geometry
*/



class Step {
    constructor(pos) {
        this.pos = pos

        this.createStep()
    }

    createStep() {
        this.step = new THREE.Mesh(
            new THREE.BoxGeometry(),
            new THREE.MeshStandardMaterial()
        )
        scene.add(this.step)
    }

    checkHover() {
        const intersects = raycaster.intersectObject(this.step)

        this.step.material.color.setHSL(0, 1, 1)

        if (intersects.length > 0) {
            this.step.material.color.setHSL(0.6, 0.8, 0.4)
        }
    }
}

const step = new Step()


class Helpers {
    constructor() {
        this.group = new THREE.Group()

        this.createHelpers()
    }

    createMesh() {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(),
            new THREE.MeshStandardMaterial()
        )
        return mesh
    }

    createHelpers() {
        const helperPositions = [
            {x:1, y:0, z:0},
            {x: -1, y:0, z:0},
            {x:0, y:1, z:0},
            {x:0, y:-1, z:0},
            {x:0, y:0, z:1},
            {x:0, y:0, z:-1},
        ]

        helperPositions.forEach(position => {
            const helper = this.createMesh()
            helper.position.set(position.x, position.y, position.z)
            helper.scale.setScalar(0.4)
            this.group.add(helper)
        })

        scene.add(this.group)
    }

    checkHover() {
        const intersects = raycaster.intersectObjects(this.group.children)

        this.group.children.forEach(mesh => {
            mesh.material.color.setHSL(0, 0, 0.2)
        });

        if (intersects.length > 0) {
            intersects[0].object.material.color.setHSL(0, 0, 1)
        }
    }

    setPosition(p = {x:0, y:0, z:0}) {
        this.group.position.set(p)
    }
}


const helpers = new Helpers()



const raycaster = new THREE.Raycaster()


const setRaycaster = function () {
    raycaster.setFromCamera(cursor, camera)
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

    setRaycaster()
    step.checkHover()
    helpers.checkHover()
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
