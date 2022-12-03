import * as THREE from 'https://cdn.skypack.dev/three@0.132.2'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js'


const canvas = document.querySelector('canvas.webgl')


// Scene
const scene = new THREE.Scene()


/*
    Geometry
*/



class Structure {
    constructor (num = 20) {
        this.num = num
        this.group = new THREE.Group()

        this.createMeshes()
    }

    createMeshes() {
        for (let i = 0; i < this.num; i++) {
            const box = new THREE.Mesh(
                new THREE.BoxGeometry(),
                new THREE.MeshStandardMaterial()
            )
            this.group.add(box)
        }
        scene.add(this.group)
    }

    setSize(s = 2, h = 0.1) {
        this.group.children.forEach((mesh, index) => {
            mesh.scale.x = s - (index / this.num) * s * 0.2
            mesh.scale.y = h
            mesh.scale.z = s - (index / this.num) * s

            if (index%2 == 1) {mesh.scale.x = mesh.scale.x * 1.2}
            if (index%4 == 1) {mesh.scale.setScalar(0)}

            mesh.position.y = index * h * 1.1
        })

        this.group.position.y = (this.num * h) * -0.5
    }

    rotate(t) {
        this.group.children.forEach((mesh, index) => {
            mesh.rotation.y = index * Math.sin(t * 0.1) * 0.2 + t
        });
    }

    changeColor(t) {
        this.group.children.forEach((mesh, index) => {
            const d = Math.sin(index * 0.8 + t)
            mesh.material.color.setHSL(index * 0.02 + 0.4, d, 0.4)
        });
    }
}

const structure1 = new Structure()
structure1.setSize()


class Box {
    constructor(num) {
        this.num = num
        this.group = new THREE.Group()

        this.createBox()
    }

    createBox() {
        for (let i = 0; i < this.num; i++) {    
            const box = new THREE.Mesh(
                new THREE.BoxGeometry(),
                new THREE.MeshStandardMaterial()
            )
            this.group.add(box)
        }

        scene.add(this.group)
    }

    setSize() {
        this.group.children.forEach(mesh => {
            mesh.scale.set(Math.random() * 0.2, Math.random() * 0.2, Math.random() * 0.2)
            mesh.rotation.set(Math.random() * Math.PI * 2.0, Math.random() * Math.PI * 2.0, Math.random() * Math.PI * 2.0)
            mesh.position.set((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4)
        });

    }
}

const box1 = new Box(20)

setInterval(function() {
    box1.setSize()
}, 400)



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

    structure1.rotate(absTime * 0.4)
    structure1.changeColor(absTime)

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
