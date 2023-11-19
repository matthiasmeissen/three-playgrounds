/**
 * Full-screen textured quad shader
 */

const DisplacementShader = {

	name: 'DisplacementShader',

	uniforms: {

		'tDiffuse': { value: null },
		'opacity': { value: 1.0 }

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform float opacity;
		uniform sampler2D tDiffuse;
		varying vec2 vUv;


		vec4 boxBlur(sampler2D image, vec2 uv, vec2 texelSize, int blurSize) {
			vec4 color = vec4(0.0);
			vec2 blurSizeTexCoords = vec2(blurSize) * texelSize;
		
			for (float x = -blurSizeTexCoords.x; x <= blurSizeTexCoords.x; x += texelSize.x) {
				for (float y = -blurSizeTexCoords.y; y <= blurSizeTexCoords.y; y += texelSize.y) {
					color += texture2D(image, uv + vec2(x, y));
				}
			}
		
			color /= float((blurSize * 2 + 1) * (blurSize * 2 + 1));
		
			return color;
		}

		
		void main() {
            vec2 p = vUv;

			vec4 texture = texture2D( tDiffuse, p );

			vec4 blurTexture = boxBlur(tDiffuse, p, vec2(0.001, 0.001), 4);

			float d1 = step(0.2, blurTexture.r);

			vec3 color = vec3(d1);

			gl_FragColor = vec4( color, 1.0 );
		}`

};

export { DisplacementShader };
