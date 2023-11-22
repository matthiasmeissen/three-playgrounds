import * as THREE from 'three'

function createCamera() {
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(4, 4, 4);

    return camera;
}

export default createCamera;
