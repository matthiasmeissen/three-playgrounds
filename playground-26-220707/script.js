const canvas = document.querySelector('canvas.webgl')


// Scene
const scene = new THREE.Scene()


// Debug
var GUI = lil.GUI
const gui = new GUI()
gui.close(true)


/*
    Geometry
*/

const par = {
    size: 0.1,
    num: 20,
    gap: 0.4,
}

let mesh

const color = new THREE.Color()

const geometry = new THREE.BoxGeometry(par.size, par.size, par.size)
const material = new THREE.MeshStandardMaterial()

const count = Math.pow(par.num, 2)

mesh = new THREE.InstancedMesh(geometry, material, count)

const matrix = new THREE.Matrix4()

let pos = 0

for (let i = 0; i < par.num; i++) {
    for (let j = 0; j < par.num; j++) {
        matrix.setPosition(i / (par.num * (1 - par.gap)) , j / (par.num * (1 - par.gap)), 0)
        mesh.setMatrixAt(pos, matrix)
        mesh.setColorAt(pos, color.setHSL(0, 0, 1))

        pos += 1
    }
}

mesh.position.x = -0.8
mesh.position.y = -0.8

scene.add(mesh)

let colorPosition = 0
let colors = 0

const colorCubes = function () {
    mesh.setColorAt(colorPosition, color.setHSL(colors, 1.0, 0.5))
    mesh.instanceColor.needsUpdate = true

    if (colorPosition > count) {
        colorPosition = 0
    } else {
        colorPosition += 1
    }

    if (colors > 1) {
        colors = 0
    } else {
        colors += 0.0004
    }
    
    console.log(colorPosition)

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
renderer.localClippingEnabled = true;

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
    colorCubes()

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
