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
        this.color
    }

    createGroup () {
        this.group = new THREE.Group()
        this.group.scale.setScalar(0.2)
        this.group.rotation.y = Math.PI * -0.5
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

    createStructure () {
        let prevStepInX

        this.group.children.forEach(mesh => {
            if (prevStepInX) {
                if (Math.random() < 0.5) {
                    this.moveInDirection({x: 1, y: 0, z: 0}, mesh, this.getPrevMesh(mesh))
                } else {
                    if (Math.random() < 0.5) {
                        this.moveInDirection({x: 0, y: 0, z: 1}, mesh, this.getPrevMesh(mesh))
                    } else {
                        this.moveInDirection({x: 0, y: 1, z: 0}, mesh, this.getPrevMesh(mesh))
                    }
                    prevStepInX = false
                }
            } else {
                this.moveInDirection({x: 1, y: 0, z: 0}, mesh, this.getPrevMesh(mesh))
                prevStepInX = true
            }
        })
    }

    moveInDirection (direction, targetMesh, lastMesh) {
        const r = Math.random() < 0.5 ? -1 : 1

        const pos = {
            x: lastMesh.position.x + direction.x,
            y: lastMesh.position.y + direction.y * r,
            z: lastMesh.position.z + direction.z * r
        }

        targetMesh.position.set(pos.x, pos.y, pos.z)
    }

    getPrevMesh (currentMesh) {
        const meshIndex = currentMesh.parent.children.indexOf(currentMesh)
        const prevMeshIndex = (meshIndex - 1) < 0 ? 0 : meshIndex - 1
        return currentMesh.parent.children[prevMeshIndex]
    }

    cycleThroughMeshes () {
        this.group.children.push(this.group.children.shift())

        this.group.children.forEach((mesh, index) => {
            mesh.material.color.setHSL(this.color, 0.6, (1 / this.group.children.length) * index)
        });
    }
}


const group1 = new MeshGroup(20)
group1.createStructure()
group1.color = Math.random()

const group2 = new MeshGroup(20)
group2.createStructure()
group2.color = Math.random()


setInterval(function () {
    group1.cycleThroughMeshes()
    group2.cycleThroughMeshes()
}, 80)



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
