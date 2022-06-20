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


// Construction

const createCubes = function (size, num) {
    const s = size * 0.01
    const group = new THREE.Group()

    for (let i = 1; i < num; i++) {
        const geometry = new THREE.BoxGeometry(s, Math.sin(i), s);
        const material = new THREE.MeshPhongMaterial({
            color: 'hsl(0, 100%, 100%)',
            specular: 'hsl(0, 100%, 100%)',
            shininess: 0,
            flatShading: true
        })

        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.x = i * s * 2
        mesh.rotation.x = i * 0.02
        group.add(mesh)
    }

    group.position.x = -s * num

    return group
}

const cubes = createCubes(0.5, 200)

const cubes1 = cubes.clone()
const cubes2 = cubes.clone()
cubes1.position.y = 0.04
cubes2.position.y = -0.04

scene.add(cubes)
scene.add(cubes1)
scene.add(cubes2)


const rotateCubes = function () {
    cubes.rotation.x = absTime
    cubes1.rotation.x = absTime * -0.25
    cubes2.rotation.x = absTime * 0.25
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
    camera.position.z = Math.cos(cursor.x) * 3
    camera.position.y = cursor.y * 5

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

const cursor = {
    x: 0,
    y: 0
}

window.addEventListener('mousemove', function (event) {
    cursor.x = event.clientX / window.innerWidth - 0.5
    cursor.y = - (event.clientY / window.innerHeight - 0.5)
})


// Clock

const clock = new THREE.Clock()
let absTime


// Animate

function animate () {
    absTime = clock.getElapsedTime()

    rotateCubes()
    moveCamera()
    rotateLights()

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
