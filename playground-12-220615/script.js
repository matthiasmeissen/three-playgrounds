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


// Parameters
const geometryParameters = {
    scale: {
        x: 2,
        y: 0.6
    },
    textureRepeat: 1
}


// Texture
const ctx = document.createElement('canvas').getContext('2d')

const par = {
    width: 400,
    height: 400
}

ctx.canvas.width = par.width
ctx.canvas.height = par.height

ctx.fillStyle = 'hsl(0deg, 100%, 0%)'
ctx.fillRect(0, 0, par.width, par.height)

ctx.fillStyle = 'hsla(0deg, 100%, 100%, 20%)'

for (let i = 0; i < 10; i++) {
    const x = Math.random() * par.width
    const y = Math.random() * par.height
    const w = Math.random() * par.width
    const h = Math.random() * par.height
    ctx.fillRect(x, y, w, h) 
}


const texture = new THREE.CanvasTexture(ctx.canvas)


// Construction
const geometry = new THREE.BoxGeometry(1, 1, 1)

texture.repeat.x = geometryParameters.textureRepeat
texture.repeat.y = geometryParameters.textureRepeat

texture.wrapS = THREE.RepeatWrapping
texture.wrapT = THREE.RepeatWrapping

const material = new THREE.MeshPhongMaterial({
    color: 'hsl(0, 100%, 0%)',
    specular: 'hsl(0, 100%, 100%)',
    bumpMap: texture,
    shininess: 30,
    flatShading: true
})
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

mesh.scale.x = geometryParameters.scale.x
mesh.scale.y = geometryParameters.scale.y


// Debug
const geometryFolder = gui.addFolder('Geometry')

geometryFolder.add(geometryParameters, 'textureRepeat')
    .name('Texture Repeat')
    .min(0)
    .max(4)
    .step(0.1)
    .onChange(function () {
        texture.repeat.x = geometryParameters.textureRepeat
        texture.repeat.y = geometryParameters.textureRepeat
    })

geometryFolder.add(geometryParameters.scale, 'x')
    .name('Scale X')
    .min(0.1)
    .max(20)
    .step(0.1)
    .onChange(function () {
        mesh.scale.x = geometryParameters.scale.x
    })

geometryFolder.add(geometryParameters.scale, 'y')
    .name('Scale Y')
    .min(0.1)
    .max(20)
    .step(0.1)
    .onChange(function () {
        mesh.scale.y = geometryParameters.scale.y
    })

geometryFolder.addColor(mesh.material, 'color').name('Color')


/*
    Lights
*/


// Parameters
const lightParameters = {
    rotate: true,
    speed: 2
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
