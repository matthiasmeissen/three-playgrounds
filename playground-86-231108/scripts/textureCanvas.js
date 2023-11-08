import * as THREE from 'three';

class TextCanvasTexture {
    constructor() {
        this.positionY = 0;
        this.init();
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.texture = new THREE.CanvasTexture(this.canvas);
        this.canvas.width = 1024;
        this.canvas.height = 1024;
    }

    drawText(text, color = 0.6) {
        this.context.fillStyle = `hsl(${color * 360}, 100%, 50%)`;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.fillStyle = 'white';
        this.context.font = '200px Arial';
        this.context.textAlign = 'center';
        this.context.fillText(text, this.canvas.width * 0.5, this.canvas.height * 0.5);

        this.context.fillStyle = 'white';
        this.context.fillRect(0, this.canvas.height * this.positionY, this.canvas.width, this.canvas.height * 0.02);

        this.texture.needsUpdate = true;
    }

    updatePositionY(value) {
        this.positionY = value;
    }

    getTexture() {
        return this.texture;
    }
}

export default TextCanvasTexture;
