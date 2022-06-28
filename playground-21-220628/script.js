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

const canvasPar = {
    width: 512,
    height: 512,
    stroke: 0.4,
}

const ctx = document.createElement('canvas').getContext('2d')
ctx.canvas.width = canvasPar.width
ctx.canvas.height = canvasPar.height

ctx.fillStyle = '#000000'
ctx.fillRect(0, 0, canvasPar.width, canvasPar.height)

ctx.fillStyle = '#ffffff'
ctx.save()
ctx.translate(0, canvasPar.height * 0.5 - canvasPar.height * canvasPar.stroke * 0.5)
ctx.fillRect(0, 0, canvasPar. width, canvasPar.height * canvasPar.stroke)
ctx.restore()

const canvasTexture = new THREE.CanvasTexture(ctx.canvas)


/*
    Geometry
*/


// Construction

const spherePar = {
    size: 1,
    lines: 4,
}

const group = new THREE.Group()

const makePlane = function (pos) {
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 1),
        new THREE.MeshStandardMaterial({
            metalness: 1,
            roughness: 1,
            emissive: 'hsl(0, 0%, 50%)',
            alphaMap: canvasTexture,
            transparent: true,
            side: THREE.DoubleSide
        })
    )

    plane.position.z = pos

    group.add(plane)
}

for (let i = 0; i < 20; i++) {
    makePlane(i * -0.1)
}

scene.add(group)

group.children.forEach((item, index) => {
    item.material.emissive.setHSL(index / group.children.length, 1, 0.5)
});


canvasTexture.wrapT = THREE.RepeatWrapping
canvasTexture.repeat.set(1, spherePar.lines)


const geometryFolder = gui.addFolder('Geometry')
geometryFolder.add(spherePar, 'size').name('Size').min(0.1).max(2).step(0.1).onChange(function () {
    group.scale.setScalar(spherePar.size)
})
geometryFolder.add(spherePar, 'lines').name('Lines').min(1).max(200).step(1).onChange(function () {
    canvasTexture.repeat.set(1, spherePar.lines)
})

const moveTexture = function () {
    canvasTexture.offset.y = absTime;
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
    rotateLights()
    moveTexture()

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
