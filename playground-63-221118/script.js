import * as THREE from 'https://cdn.skypack.dev/three@0.132.2'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js'


const canvas = document.querySelector('canvas.webgl')


// Scene
const scene = new THREE.Scene()


/*
    Geometry
*/



class MeshGroup {
    constructor (num) {
        this.num = num

        this.createGroup()
        this.createMeshes()
        this.setMeshPosition()
    }

    createGroup () {
        this.group = new THREE.Group()
        this.group.scale.setScalar(0.4)
        scene.add(this.group)
    }

    setPosition (p) {
        this.group.position.set(p.x, p.y, p.z)
    }

    createCube () {
        const cube = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial()
        )
        return cube
    }

    createMeshes () {
        for (let i = 0; i < this.num; i++) {
            this.group.add(this.createCube())      
        }
    }

    createStructureInX () {
        this.group.children.forEach((mesh, index) => {
            mesh.position.set(index + index * 0.02, 0, 0)
        });
    }

    createStructureInZ () {
        let lastMove = 'moveX'
        let lastPos

        this.group.children.forEach((mesh, index) => {
            if (index == 0) {
                mesh.position.set(0, 0, 0)
                lastPos = mesh.position
                return
            } else {
                const pz = Math.random() < 0.5 ? -1 : 1
                if (lastMove == 'moveX') {
                    if (Math.random() < 0.5) {
                        mesh.position.set(lastPos.x + 1, 0, lastPos.z)
                        lastMove = 'moveX'
                    } else {
                        mesh.position.set(lastPos.x, 0, lastPos.z + pz)
                        lastMove = 'moveY'
                    }
                    lastPos = mesh.position
                } else {
                    mesh.position.set(lastPos.x + 1, 0, lastPos.z)
                    lastPos = mesh.position
                    lastMove = 'moveX'
                }
            }
        })
    }


    getRandomVector () {
        const randomDirection = Math.random() < 0.5 ? -1.0 : 1.0
        const randomSide = Math.floor(Math.random() * 3)

        let direction

        if (randomSide == 0) {
            direction = {x: randomDirection, y: 0, z: 0}
        } else if (randomSide == 1) {
            direction = {x: 0, y: randomDirection, z: 0}
        } else {
            direction = {x: 0, y: 0, z: randomDirection}
        }

        return direction
    }

    setMeshPosition () {
        this.group.children.forEach((mesh, index) => {
            if (index == 0) {
                const p = this.group.position
                mesh.position.set(p.x, p.y, p.z)
            } else {
                const prevPos = this.group.children[index - 1].position
                const randomVector = this.getRandomVector()
                const newPos = {
                    x: prevPos.x + randomVector.x,
                    y: prevPos.y + randomVector.y,
                    z: prevPos.z + randomVector.z
                }

                mesh.position.set(newPos.x, newPos.y, newPos.z)
            }
        });
    }
}

const group1 = new MeshGroup(20)
group1.createStructureInZ()


group1.group.position.y = -2


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


    group1.group.rotation.y = absTime
    group1.group.rotation.z = Math.PI * 0.5


    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
