const canvas = document.querySelector('canvas.webgl')


// Scene
const scene = new THREE.Scene()


// Geometry

const count = 100
const geometry = new THREE.BufferGeometry()
const vertices = new Float32Array(count * 3 * 3)

const createVertices = () => {
    for (let i = 0; i < count; i++) {
        vertices[i] = (Math.random() - 0.5) * 2
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
}

createVertices()

const material = new THREE.MeshPhongMaterial({
    color: 'hsl(0, 100%, 0%)',
    specular: 'hsl(0, 100%, 100%)',
    shininess: 30,
    flatShading: true
})
const mesh = new THREE.Mesh(geometry, material)

scene.add(mesh)


// Lights

const lights = new THREE.Group()
scene.add(lights)

const ambientLight = new THREE.AmbientLight( 0xffffff, 0.2)
scene.add(ambientLight)

const light1 = new THREE.DirectionalLight(0xffffff, 0.8)
light1.position.set(2, 2, 4)
lights.add(light1)

const light2 = new THREE.DirectionalLight(0xffffff, 0.8)
light2.position.set(-2, 2, -4)
lights.add(light2)


// Camera

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight)
camera.position.set(0, 0, 4)
scene.add(camera)


// Renderer

const renderer = new THREE.WebGLRenderer({canvas})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)

window.addEventListener( 'resize', onWindowResize );

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}


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

const cursor = {
    x: 0,
    y: 0
}

window.addEventListener('mousemove', function (event) {
    cursor.x = event.clientX / window.innerWidth - 0.5
    cursor.y = - (event.clientY / window.innerHeight - 0.5)
})

const moveCamera = () => {
    camera.position.x = Math.sin(cursor.x) * 3
    camera.position.z = Math.cos(cursor.x) * 3
    camera.position.y = cursor.y * 5

    camera.lookAt(new THREE.Vector3())
}


// Functions

const rotateLights = () => {
    lights.rotation.y = absTime * 2
    lights.rotation.x = absTime * 2
}

setInterval(function () {
    createVertices()
}, 400)


// Clock

const clock = new THREE.Clock()
let absTime


// Animate

function animate () {
    absTime = clock.getElapsedTime()

    moveCamera()
    rotateLights()

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
