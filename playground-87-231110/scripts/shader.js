/**
 * Full-screen textured quad shader
 */

const CopyShader = {

	name: 'CopyShader',

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
        

		void main() {
            vec2 p = vUv;

            vec2 p1 = fract(p * p * 4.0);

			vec4 texture = texture2D( tDiffuse, p1);

            float d1 = length(vec2(p.x - 0.5, p1.y - 0.5));

            d1 = 1.0 - step(0.4, d1);

            vec3 col = texture.rgb * vec3(d1);

            vec3 color = col;
			gl_FragColor = vec4( color, 1.0 );


		}`

};

export { CopyShader };
