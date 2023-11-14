import {
    HalfFloatType,
    MeshBasicMaterial,
    NearestFilter,
    ShaderMaterial,
    UniformsUtils,
    WebGLRenderTarget,
    BufferGeometry,
    Float32BufferAttribute,
    OrthographicCamera,
    Mesh
} from 'three';

// Shader
const AfterimageShader = {
    name: 'AfterimageShader',

    uniforms: {
        'intensity': { value: 0.98 }, // Control the feedback intensity
        'scale': { value: 1.0 }, // Control the feedback scale
        'tOld': { value: null },
        'tNew': { value: null }
    },

    vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,

    fragmentShader: /* glsl */`
        uniform float intensity;
        uniform float scale;
        uniform sampler2D tOld;
        uniform sampler2D tNew;
        varying vec2 vUv;

        void main() {
            vec2 p = vUv - 0.5;
            p = p * 0.998 + 0.5;

            vec4 texelOld = texture2D(tOld, p);
            vec4 texelNew = texture2D(tNew, p);

            // Apply the intensitying factor directly for a smooth fade
            texelOld *= intensity;

            // Combine the new frame with the faded old frame
            gl_FragColor = max(texelNew, texelOld);
        }`
};

// Pass
class Pass {
    constructor() {
        this.isPass = true;
        this.enabled = true;
        this.needsSwap = true;
        this.clear = false;
        this.renderToScreen = false;
    }

    setSize() { }

    render() {
        console.error('THREE.Pass: .render() must be implemented in derived pass.');
    }

    dispose() { }
}

// Fullscreen Triangle Geometry
class FullscreenTriangleGeometry extends BufferGeometry {
    constructor() {
        super();
        this.setAttribute('position', new Float32BufferAttribute([- 1, 3, 0, - 1, - 1, 0, 3, - 1, 0], 3));
        this.setAttribute('uv', new Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));
    }
}

// Fullscreen Quad
const _camera = new OrthographicCamera(- 1, 1, 1, - 1, 0, 1);
const _geometry = new FullscreenTriangleGeometry();

class FullScreenQuad {
    constructor(material) {
        this._mesh = new Mesh(_geometry, material);
    }

    dispose() {
        this._mesh.geometry.dispose();
    }

    render(renderer) {
        renderer.render(this._mesh, _camera);
    }

    get material() {
        return this._mesh.material;
    }

    set material(value) {
        this._mesh.material = value;
    }
}

// Feedback Pass
class FeedbackPass extends Pass {

    constructor(intensity = 0.96, scale = 1.0) {

        super();

        this.shader = AfterimageShader;

        this.uniforms = UniformsUtils.clone(this.shader.uniforms);

        this.uniforms['intensity'].value = intensity;
        this.uniforms['scale'].value = scale;

        this.textureComp = new WebGLRenderTarget(window.innerWidth, window.innerHeight, {
            magFilter: NearestFilter,
            type: HalfFloatType
        });

        this.textureOld = new WebGLRenderTarget(window.innerWidth, window.innerHeight, {
            magFilter: NearestFilter,
            type: HalfFloatType
        });

        this.compFsMaterial = new ShaderMaterial({

            uniforms: this.uniforms,
            vertexShader: this.shader.vertexShader,
            fragmentShader: this.shader.fragmentShader

        });

        this.compFsQuad = new FullScreenQuad(this.compFsMaterial);

        this.copyFsMaterial = new MeshBasicMaterial();
        this.copyFsQuad = new FullScreenQuad(this.copyFsMaterial);

    }

    render(renderer, writeBuffer, readBuffer/*, deltaTime, maskActive*/) {

        this.uniforms['tOld'].value = this.textureOld.texture;
        this.uniforms['tNew'].value = readBuffer.texture;

        renderer.setRenderTarget(this.textureComp);
        this.compFsQuad.render(renderer);

        this.copyFsQuad.material.map = this.textureComp.texture;

        if (this.renderToScreen) {

            renderer.setRenderTarget(null);
            this.copyFsQuad.render(renderer);

        } else {

            renderer.setRenderTarget(writeBuffer);

            if (this.clear) renderer.clear();

            this.copyFsQuad.render(renderer);

        }

        // Swap buffers.
        const temp = this.textureOld;
        this.textureOld = this.textureComp;
        this.textureComp = temp;
        // Now textureOld contains the latest image, ready for the next frame.

    }

    setSize(width, height) {

        this.textureComp.setSize(width, height);
        this.textureOld.setSize(width, height);

    }

    dispose() {

        this.textureComp.dispose();
        this.textureOld.dispose();

        this.compFsMaterial.dispose();
        this.copyFsMaterial.dispose();

        this.compFsQuad.dispose();
        this.copyFsQuad.dispose();

    }

}

export { FeedbackPass };