precision highp float;
precision highp int;

// ---------------------------------------------------------------- CONSTANTS
#define PI             3.14159265358979323846264
#define TAU            6.28318530717958647692528
#define SQRT_2         1.41421356237309504880169
#define PHI            1.61803398874989484820459
#define E              2.71828182845904523536028

// ---------------------------------------------------------------- VARYINGS
varying vec2 vTexCoord; // texture UV coordinate (per surface)

// ---------------------------------------------------------------- UNIFORMS
uniform vec2 resolution;
uniform vec3 mouse;
uniform float progress;
uniform float time;
uniform float scrollVal;

uniform float logoScale;

uniform bool doDrawBackdrop;
uniform sampler2D backdrop;
uniform vec2 backdropResolution;

uniform float SSIDHash;
uniform bool utilBools[10];
uniform int K;

uniform int AA;
uniform vec2 pan;
uniform float planeOffset;
uniform float infPlaneColorSet;

uniform bool debug;

#define nmc(x) (0.5-0.5*cos(x))

// ---------------------------------------------------------------- VECTOR MATHS
float dot2(vec2 v) {
	return dot(v, v);
}

vec2 glslPixPos2ScreenPos(in vec2 glFrag) {
	// [0, width>, [0, height>, smallest dim maps to [-1, 1]
	return ((glFrag - resolution * 0.5) / (min(resolution.x, resolution.y) * 0.5));
}

float randomSin(in vec2 pos, in float seed) {
	return fract(sin(dot(pos, vec2(12.9898, (seed + 1.) * 78.233))) * 43758.5453123);
}

float randomSin(in vec2 pos) {
	return randomSin(pos, 0.);
}

// ---------------------------------------------------------------- COMPUTE COLOUR
vec4 computeCol(in vec2 uv, in vec2 pos) {
	vec2 p = pos + pan;
	float t = time * (0.45 + logoScale * 0.2);
	float radial = length(p + vec2(0., planeOffset));
	float waveA = sin((p.x * 1.8 + p.y * 2.1) * (1. + infPlaneColorSet) + t * TAU);
	float waveB = cos(radial * (5. + float(K) * 0.15) - t * 5.);
	float gran = randomSin(floor((p + 4.) * 32.), SSIDHash);
	float blend = nmc(waveA + waveB * 0.55 + gran * 0.6 + progress * PI);

	vec3 paletteA = vec3(0.08, 0.18, 0.36);
	vec3 paletteB = vec3(0.96, 0.75, 0.28);
	vec3 col = mix(paletteA, paletteB, blend);

	float rim = smoothstep(0.95, 0.15, radial);
	col *= 0.55 + rim * 0.45;

	if (doDrawBackdrop) {
		vec4 backCol = texture2D(backdrop, uv);
		col = mix(col, backCol.rgb, 0.22 + 0.18 * blend);
	}

	if (debug || utilBools[0]) {
		col = mix(col, vec3(uv, 0.5 + 0.5 * sin(time * TAU)), 0.35);
	}

	if (utilBools[1]) {
		col += vec3(0.04, 0.02, 0.) * smoothstep(0.0, 1.0, scrollVal * 0.05);
	}

	col = clamp(col, 0., 1.);
	return vec4(col, 1.);
}

// ---------------------------------------------------------------- MAIN
void main() {
	vec4 totCol = vec4(0.);
	for (int nn = 0; nn < 5; nn++) {
		for (int mm = 0; mm < 5; mm++) {
			vec2 aa = vec2(float(nn), float(mm)) / float(AA);
			vec2 uv = vTexCoord.xy;
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
