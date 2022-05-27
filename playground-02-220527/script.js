const canvas = document.querySelector('canvas.webgl')


// Scene
const scene = new THREE.Scene()


// Geometry
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshPhongMaterial({ 
    color: 'hsl(0, 100%, 0%)', 
    specular: 'hsl(80, 100%, 50%)', 
    shininess: 30, 
    flatShading: true })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)


// Camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight)
camera.position.z = 5
scene.add(camera)


// Lights
const ambientLight = new THREE.AmbientLight( 0xffffff, 0.2)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
directionalLight.position.x = 2
directionalLight.position.y = 2
directionalLight.position.z = 4
scene.add(directionalLight)


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


function rotateMesh() {
    mesh.rotation.y += 0.01
    mesh.rotation.x += 0.02
}

function setColor() {
    const color = Math.random()

    material.specular.setHSL(color, 1.0, 0.5);
}


// Animation
function animate () {
    requestAnimationFrame(animate)

    rotateMesh()
    setColor()

    renderer.render(scene, camera)
}

animate()
