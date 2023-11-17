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

            vec2 displacement = displace(p, 0.2);

            vec2 displacedPosition = vec2(p.x + displacement.x, p.y + displacement.y);

			vec4 inputTexture = texture2D( tDiffuse, displacedPosition);

            vec3 color = inputTexture.rgb;

            //color = vec3(displacedPosition.x);

			gl_FragColor = vec4( color, 1.0 );
		}`

};

export { DisplacementShader };
