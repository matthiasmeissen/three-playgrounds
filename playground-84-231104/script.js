import * as THREE from 'three';

// -----------------------
// Initial Setup
// -----------------------

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
const raycaster = new THREE.Raycaster();
const cursor = new THREE.Vector2();
const clock = new THREE.Clock();

// -----------------------
// Geometry
// -----------------------

class TileGrid {
    constructor(tiles = 30) {
        this.tiles = tiles;
        this.tileGeometry = new THREE.PlaneGeometry(1, 1);
        this.grid = new THREE.Group();

        this.createGrid(0.04);
    }

    createTile(posX, posY) {
        const tile = new THREE.Mesh(
            this.tileGeometry,
            new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide })
        );
        tile.position.set(posX, posY, 0);
        tile.userData = {
            originalColor: new THREE.Color(0xffffff),
            isHovered: false,
        }
        this.grid.add(tile);
    }

    createGrid(gap) {
        const offset = (this.tiles - 1 + gap * (this.tiles - 1)) / 2;
        for (let x = 0; x < this.tiles; x++) {
            for (let y = 0; y < this.tiles; y++) {
                this.createTile(x + x * gap - offset, y + y * gap - offset);
            }
        }
        this.grid.rotation.set(Math.PI / 2, 0, Math.PI * 0.25);
        this.grid.scale.set(0.4, 0.4, 0.4)
        scene.add(this.grid);
    }

    updateGrid(delta) {
        this.grid.children.forEach(tile => {
            if (!tile.userData.isHovered && tile.material.color !== tile.userData.originalColor) {
                tile.material.color.lerp(tile.userData.originalColor, delta * 200)
            }
        });
    }
}


const tileGrid = new TileGrid();

// -----------------------
// Raycaster
// -----------------------

const raycaster1 = new THREE.Raycaster();

const checkIntersection = () => {
    raycaster1.setFromCamera(cursor, camera);

    tileGrid.grid.children.forEach(tile => {
        tile.userData.isHovered = false;
    })

    const intersects = raycaster1.intersectObjects(tileGrid.grid.children);

    if (intersects.length > 0) {
        const tile = intersects[0].object;
        tile.material.color.setHSL(0.8, 1, 0.5);
        tile.userData.isHovered = true;
    }
};


// -----------------------
// Lights
// -----------------------

const createLights = () => {
    const lights = new THREE.Group();
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    lights.add(ambientLight);

    const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
    light1.position.set(-2, 1, 4);
    lights.add(light1);

    const light2 = new THREE.DirectionalLight(0xffffff, 0.8);
    light2.position.set(2, -1, -4);
    lights.add(light2);

    scene.add(lights);
    return lights;
};

const lights = createLights();

// -----------------------
// Camera and Controls
// -----------------------

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 4, 4);
camera.lookAt(0, 0, 0);

// -----------------------
// Event Listeners
// -----------------------

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('dblclick', () => {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
    if (!fullscreenElement) {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
});

window.addEventListener('mousemove', (event) => {
    cursor.x = (event.clientX / window.innerWidth) * 2 - 1;
    cursor.y = - (event.clientY / window.innerHeight) * 2 + 1;
});

// -----------------------
// Animation
// -----------------------

const animate = () => {
    const absTime = clock.getElapsedTime();

    checkIntersection();

    tileGrid.updateGrid(clock.getDelta());

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

animate();
