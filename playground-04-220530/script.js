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

const group = new THREE.Group()
scene.add(group)

const cube1 = makeCube(new THREE.Vector3(0, 0, 0))
const cube2 = makeCube(new THREE.Vector3(-1.5, 0, 0))
const cube3 = makeCube(new THREE.Vector3(1.5, 0, 0))

group.add(cube1)
group.add(cube2)
group.add(cube3)

for (let i = 0; i < 10; i++) {
    const cube = makeCube(new THREE.Vector3(0.8, 0, -0.5 + i * 0.1))
    cube.scale.set(0.02, 1.4, 0.02)

    group.add(cube)
}

for (let i = 0; i < 10; i++) {
    const cube = makeCube(new THREE.Vector3(-0.8, 0, -0.5 + i * 0.1))
    cube.scale.set(0.02, 1.4, 0.02)

    group.add(cube)
}


// Lights
const ambientLight = new THREE.AmbientLight( 0xffffff, 0.2)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
directionalLight.position.x = 2
directionalLight.position.y = 2
directionalLight.position.z = 4
scene.add(directionalLight)


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


// Functions

const rotateCubes = () => {
    cube1.rotation.y = absTime
    cube2.rotation.x = absTime
    cube3.rotation.x = absTime

    group.position.y = Math.sin(absTime)
    group.rotation.y = absTime
}

const changeColor = () => {
    const color = Math.random()

    cube1.material.specular.setHSL(color, 1.0, 0.5)
    cube2.material.specular.setHSL(color, 1.0, 0.5)
    cube3.material.specular.setHSL(color, 1.0, 0.5)
}

const moveCamera = () => {
    camera.position.x = Math.sin(absTime) * 2
    camera.lookAt(group.position)
}


// Clock
const clock = new THREE.Clock()
let absTime


// Animate
function animate () {
    absTime = clock.getElapsedTime()

    rotateCubes()
    changeColor()
    moveCamera()

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
