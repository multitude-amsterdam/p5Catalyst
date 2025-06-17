precision highp float;
precision highp int;

// ---------------------------------------------------------------- CONSTANTS
#define PI             3.14159265358979323846264
#define TAU            6.28318530717958647692528
#define SQRT_2         1.41421356237309504880169
#define PHI            1.61803398874989484820459
#define E              2.71828182845904523536028


// ---------------------------------------------------------------- VARYINGS
varying vec2 vTexCoord; // UV coordinate from shader.vert


// ---------------------------------------------------------------- UNIFORMS
uniform vec2 resolution;
uniform vec3 mouse;
uniform float progress;
uniform float time;
// uniform sampler2D img;

uniform float SSIDHash;
uniform bool utilBools[10];


// ---------------------------------------------------------------- MAIN
void main() {
	vec2 uv = vTexCoord.xy;
	vec2 mouseUV = mouse.xy / resolution;

	vec3 col = vec3(uv.xyy - mouseUV.xyx + cos(uv.yxx - mouseUV.xyy + time) * 0.5 + 0.5);
	gl_FragColor = vec4(col, 1.);
}


