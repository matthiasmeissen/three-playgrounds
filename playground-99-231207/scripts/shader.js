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

		
		void main() {
            vec2 p = vUv;

			p = abs(p - 0.5) + 0.5;

			vec3 c1 = texture2D(tDiffuse, p + vec2(0.02, 0.0)).rgb;

			vec3 color = vec3(c1);

			gl_FragColor = vec4( color, 1.0 );
		}`

};

export { DisplacementShader };
