import * as THREE from 'three';

class TileGrid {
    constructor(tiles = 30, scene) {
        this.tiles = tiles;
        this.scene = scene; 
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
        this.scene.add(this.grid);
    }

    updateGrid(delta) {
        this.grid.children.forEach(tile => {
            if (!tile.userData.isHovered && tile.material.color !== tile.userData.originalColor) {
                tile.material.color.lerp(tile.userData.originalColor, delta * 200)
            }
        });
    }
}

export default TileGrid;
