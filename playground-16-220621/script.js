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

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({
    color: 'hsl(0, 100%, 100%)',
    specular: 'hsl(0, 100%, 100%)',
    shininess: 0,
    flatShading: true
})

const mesh = new THREE.Mesh(geometry, material)
mesh.position.x = -1
scene.add(mesh)

const mesh2 = new THREE.Mesh(geometry, material)
mesh2.position.x = 1
scene.add(mesh2)


const raycaster = new THREE.Raycaster()

let Intersected

const checkIntersection = () => {
    raycaster.setFromCamera(cursor, camera)

    const intersects = raycaster.intersectObjects( scene.children, false );

	if ( intersects.length > 0 ) {

	    if ( Intersected != intersects[ 0 ].object ) {

			if ( Intersected ) Intersected.material.color.setHex( Intersected.currentHex )

			Intersected = intersects[ 0 ].object
			Intersected.currentHex = Intersected.material.color.getHex()
			Intersected.material.color.setHex( 0xff00ff )

			}

		} else {

			if ( Intersected ) Intersected.material.color.setHex( Intersected.currentHex )

			Intersected = null

	}

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
    checkIntersection()

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()
