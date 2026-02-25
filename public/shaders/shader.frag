precision highp float;
precision highp int;

/* -------------------------------- CONSTANTS ------------------------------- */
#define PI             3.14159265358979323846264
#define TAU            6.28318530717958647692528
#define SQRT_2         1.41421356237309504880169
#define PHI            1.61803398874989484820459
#define E              2.71828182845904523536028

/* -------------------------------- VARYINGS -------------------------------- */
varying vec2 vTexCoord; // texture UV coordinate (per surface)

/* -------------------------------- UNIFORMS -------------------------------- */
uniform vec2 resolution;
uniform vec2 mousePosPx;
uniform bool isMouseDown;
uniform float progress;
uniform float time;
uniform float mouseWheelScale;

uniform bool doDrawBackdrop;
uniform sampler2D backdrop;
uniform vec2 backdropResolution;

uniform bool doDrawOverlay;
uniform sampler2D overlay;
uniform vec2 overlayResolution;

uniform float sessionHash;
uniform int K;
uniform int AA;

uniform bool doDebug;

#define nmc(x) (0.5-0.5*cos(x))

#define gamma(x) pow(x, vec3(2.2))
#define invGamma(x) pow(x, vec3(1.0/2.2))

/* ------------------------------ VECTOR MATHS ------------------------------ */
float dot2(vec2 v) {
	return dot(v, v);
}

float cross2d(vec2 a, vec2 b) {
	return a.x * b.y - a.y * b.x;
}

vec2 flipUVY(vec2 uv) {
	return vec2(uv.x, 1. - uv.y);
}

vec2 glslPixPos2ScreenPos(in vec2 glFrag) {
	// [0, width>, [0, height>, smallest dim maps to [-1, 1]
	return ((glFrag - resolution * 0.5) / (min(resolution.x, resolution.y) * 0.5));
}

vec2 p5PxPos2ScreenPos(in vec2 p5Pos) {
	return glslPixPos2ScreenPos(vec2(p5Pos.x, resolution.y - 1. - p5Pos.y));
}

float randomSin(in vec2 pos, in float seed) {
	return fract(sin(dot(pos, vec2(12.9898, (seed + 1.) * 78.233))) * 43758.5453123);
}

float randomSin(in vec2 pos) {
	return randomSin(pos, 0.);
}

/* ----------------------------- COMPUTE COLOUR ----------------------------- */
vec4 computeCol(in vec2 uv, in vec2 pos) {
	vec2 mouseUv = mousePosPx / resolution;
	vec2 mousePos = p5PxPos2ScreenPos(mousePosPx);

	vec3 col = vec3(0.);

	if (doDrawBackdrop) {
		vec4 backCol = texture2D(backdrop, flipUVY(uv));
		col = backCol.rgb;
	}

	col += vec3(uv, 0.5);

	if (doDrawOverlay) {
		vec4 overlayCol = texture2D(overlay, flipUVY(uv));
		col = mix(col, overlayCol.rgb, overlayCol.a);
	}

	if (doDebug) {
		col = vec3((0.5 + 0.5 * cos(uv * TAU)).xyy).brg;
	}

	return vec4(col, 1.);
}

/* ---------------------------------- MAIN ---------------------------------- */
void main() {
	vec4 totCol = vec4(0.);
	for (int nn = 0; nn < 5; nn++) {
		for (int mm = 0; mm < 5; mm++) {
			vec2 aa = vec2(float(nn), float(mm)) / float(AA);
			// vec2 uv = vTexCoord.xy;
			vec2 uv = (gl_FragCoord.xy + aa) / resolution;
			vec2 pos = glslPixPos2ScreenPos(gl_FragCoord.xy + aa);

			vec4 acol = computeCol(uv, pos);
			totCol += acol;

			if (mm == AA - 1)
				break;
		}
		if (nn == AA - 1)
			break;
	}
	totCol /= float(AA * AA);
	gl_FragColor = totCol;
}
