const canvas = document.querySelector('canvas.webgl')


// Scene
const scene = new THREE.Scene()


// Debug
var GUI = lil.GUI
const gui = new GUI()
gui.close(true)


/*
    Canvas Texture
*/

// Parameters
const canvasPar = {
    width: 512,
    height: 512,
    num: 100,
}


// Create Canvas
const ctx = document.createElement('canvas').getContext('2d')
ctx.canvas.width = canvasPar.width
ctx.canvas.height = canvasPar.height


const createRect = function (num) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasPar.width, canvasPar.height)



    ctx.fillStyle = '#000000'

    const p = canvasPar.width / num
    const s = canvasPar.width / (num * 2)

    for (let i = 0; i < num; i++) {
        for (let j = 0; j < num; j++) {
            ctx.fillRect(i * p, j * p, s, s)        
        }
    }

    for (let i = 0; i < num; i++) {
        for (let j = 0; j < num; j++) {
            ctx.fillRect((i * p) + s, (j * p) + s, s, s)        
        }
    }
}

createRect(canvasPar.num)



/*
    Geometry
*/


// Parameters
const geometryParameters = {
    scale: 1,
}

const texture = new THREE.CanvasTexture(ctx.canvas)
texture.minFilter = THREE.NearestFilter
texture.magFilter = THREE.NearestFilter

texture.wrapS = THREE.RepeatWrapping
texture.wrapT = THREE.RepeatWrapping


// Construction
const geometry = new THREE.BoxGeometry(1, 1, 1)

const material = new THREE.MeshPhongMaterial({
    color: 'hsl(0, 100%, 100%)',
    specular: 'hsl(0, 100%, 100%)',
    map: texture,
    shininess: 0,
    flatShading: true
})
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

mesh.scale.setScalar(geometryParameters.scale)

mesh.rotation.y = Math.PI * 0.25
mesh.rotation.x = Math.PI * 0.15


// Debug
const geometryFolder = gui.addFolder('Geometry')


geometryFolder.add(geometryParameters, 'scale')
    .name('Scale')
    .min(0.2)
    .max(4)
    .step(0.1)
    .onChange(function () {
        mesh.scale.setScalar(geometryParameters.scale)
    })

geometryFolder.addColor(mesh.material, 'color').name('Color')

geometryFolder.add(canvasPar, 'num').name('Count').min(10).max(400).onChange(function () {
    createRect(canvasPar.num)
    texture.needsUpdate = true
})


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

    moveCamera()
    rotateLights()

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
