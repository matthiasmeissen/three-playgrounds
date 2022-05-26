const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()

const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({color: 'hsl(160, 100%, 50%)'})
const mesh = new THREE.Mesh(geometry, material)

scene.add(mesh)

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight)
camera.position.z = 5
scene.add(camera)

const renderer = new THREE.WebGLRenderer({canvas})
renderer.setSize(window.innerWidth, window.innerHeight)

function animate () {
    requestAnimationFrame(animate)

    mesh.rotation.y += 0.01

    renderer.render(scene, camera)
}

animate()
