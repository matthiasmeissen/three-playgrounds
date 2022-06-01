const canvas = document.querySelector('canvas.webgl')


// Scene
const scene = new THREE.Scene()


// Geometry

const makeCube = (pos) => {
    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshPhongMaterial({
            color: 'hsl(0, 100%, 0%)',
            specular: 'hsl(0, 100%, 100%)',
            shininess: 30,
            flatShading: true
        })
    )
    cube.position.set(pos.x, pos.y, pos.z)
    return cube
}

const group1 = new THREE.Group()
scene.add(group1)

for (let i = 0; i < 40; i++) {
    const cube = makeCube(new THREE.Vector3(-2 + i * 0.1, 0, -0.01))
    cube.scale.set(0.02, 10, 0.02)

    group1.add(cube)
}

const group2 = new THREE.Group()
scene.add(group2)

for (let i = 0; i < 40; i++) {
    const cube = makeCube(new THREE.Vector3(-2 + i * 0.1, 0, 0.01))
    cube.scale.set(0.02, 10, 0.02)

    group2.add(cube)
}


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
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)

window.addEventListener( 'resize', onWindowResize );

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}


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

    camera.lookAt(group1.position)
}


// Functions

const changeColor = () => {
    const color = Math.random()

    light1.color.setHSL(color, 1.0, 0.5)
    light2.color.setHSL(color, 1.0, 0.5)
}

const rotateLights = () => {
    lights.rotation.y = absTime * 2
    lights.rotation.x = absTime * 2
}

const rotateCubes = () => {
    group1.rotation.z = absTime * 0.5
    group2.rotation.z = - absTime * 0.5
}


// Clock
const clock = new THREE.Clock()
let absTime


// Animate
function animate () {
    absTime = clock.getElapsedTime()

    changeColor()
    moveCamera()
    rotateLights()
    rotateCubes()

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
