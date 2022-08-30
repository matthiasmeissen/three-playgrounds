const canvas = document.querySelector('canvas.webgl')


// Scene
const scene = new THREE.Scene()


// Debug
var GUI = lil.GUI
const gui = new GUI()
gui.close(true)

/*
    Texture
*/

const cp = {
    w: 400,
    h: 400,
    s: 0.2,
}

const ctx = document.createElement('canvas').getContext('2d')
ctx.canvas.width = cp.w
ctx.canvas.height = cp.h

const drawCanvas = function () {
    ctx.fillStyle = 'hsl(0, 0%, 10%)'
    ctx.fillRect(0, 0, cp.w, cp.h)

    const gradient = ctx.createLinearGradient(Math.abs(Math.sin(absTime * 0.2)) * cp.w, 0, cp.w, Math.abs(Math.sin(absTime * 0.4)) * cp.h)

    gradient.addColorStop(0, 'hsl(' + Math.abs(Math.sin(absTime * 0.28) * 360) + ', 100%, 50%)')
    gradient.addColorStop(0.5, 'hsl(' + Math.abs(Math.sin(absTime * 0.48) * 360) + ', 100%, 50%)')
    gradient.addColorStop(1, 'hsl(' + Math.abs(Math.sin(absTime * 0.14) * 360) + ', 100%, 50%)')

    ctx.fillStyle = gradient
    ctx.fillRect(cp.w * (cp.s * 0.5), cp.h * (cp.s * 0.5), cp.w - (cp.w * cp.s), cp.h - (cp.h * cp.s))
}

const canvasTexture = new THREE.CanvasTexture(ctx.canvas)

/*
    Geometry
*/

const group = new THREE.Group()

const geometry = new THREE.CylinderGeometry(0.04, 0.04, 0.2, 32)
const material = new THREE.MeshStandardMaterial({map: canvasTexture})


for (let i = 0; i < 100; i++) {
    const mesh = new THREE.Mesh(geometry, material)

    mesh.position.x = (Math.random() - 0.5) * 4
    mesh.position.y = (Math.random() - 0.5) * 4
    mesh.position.z = (Math.random() - 0.5) * 4

    group.add(mesh)
}

scene.add(group)

const rotateTubes = function () {
    group.rotation.y = absTime * 0.1

    group.scale.y = 1 + (Math.sin(absTime) + 1) * 0.4
}

/*
    Lights
*/


// Parameters
const lightParameters = {
    rotate: true,
    speed: 0.2
}

// Construction
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

// Functions
const rotateLights = () => {
    lights.rotation.y = absTime * lightParameters.speed
    lights.rotation.x = absTime * lightParameters.speed
}

// Debug
const lightFolder = gui.addFolder('Light')
lightFolder.add(lightParameters, 'speed').name('Speed').min(0).max(8).step(0.1)
lightFolder.addColor(light1, 'color').name('Color 1')
lightFolder.addColor(light2, 'color').name('Color 2')


/*
    Camera
*/


// Construction
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight)
camera.position.set(0, 0, 4)
scene.add(camera)

// Functions
const moveCamera = () => {
    camera.position.x = Math.sin(cursor.x) * 3
    camera.position.z = Math.cos(cursor.y) * 3
    camera.position.y = cursor.y * 2

    camera.lookAt(new THREE.Vector3())
}


/*
    Renderer
*/


// Construction
const renderer = new THREE.WebGLRenderer({canvas})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)

// Functions
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

const cursor = new THREE.Vector2()

window.addEventListener('mousemove', function (event) {
    cursor.x = (event.clientX / window.innerWidth) * 2 - 1
    cursor.y = - (event.clientY / window.innerHeight) * 2 + 1
})


// Clock

const clock = new THREE.Clock()
let absTime


// Animate

function animate () {
    absTime = clock.getElapsedTime()

    moveCamera()
    rotateTubes()

    drawCanvas()
    material.map.needsUpdate = true

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
