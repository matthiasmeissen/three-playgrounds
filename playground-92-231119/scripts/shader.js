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

        vec2 displace(vec2 p, float amount) {
            vec2 displacement = vec2(0.0);

            displacement.x = (sin(p.y * 20.0) * 0.5 + 0.5) * amount - amount * 0.5;
            displacement.y = 0.0;

            return displacement;
        }
        

		void main() {
            vec2 p = vUv;
			p = vec2(distance(p.x, p.y), length(p));

			float amount = 0.01;

            vec3 color;
			color.r = texture2D( tDiffuse, vec2(p.x * amount * p.y, p.y)).r;
			color.g = texture2D( tDiffuse, vec2(p.x / amount * p.y, p.y)).g;
			color.b = texture2D( tDiffuse, vec2(p.x + amount * p.y, p.y)).b;

			gl_FragColor = vec4( color, 1.0 );
		}`

};

export { DisplacementShader };
