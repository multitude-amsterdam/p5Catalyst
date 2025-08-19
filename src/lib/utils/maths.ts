import p5, { Vector } from 'p5';
// import p5 from 'p5';

/* -------------------------------- CONSTANTS ------------------------------- */

/**
 * TAU: The circle constant, equal to 2 * PI.
 */
export const TAU: number = Math.PI * 2;

/**
 * Golden ratio.
 */
export const PHI: number = (Math.sqrt(5) + 1) / 2;

/**
 * Euler's constant.
 */
export const E: number = Math.E;

/* --------------------------------- HASHING -------------------------------- */

/**
 * Simple deterministic hash from an integer to a float in [0,1].
 */
export function simpleIntToFloatHash(i: number): number {
	return Math.sin(i * 1097238.23492523 * 23479.23429237) % 1;
}

/**
 * Hash a string to a float in [0,1].
 */
export function stringToFloatHash(inputString: string): number {
	let hash = 0,
		chr: number;
	if (inputString.length === 0) return hash;
	for (let i = 0; i < inputString.length; i++) {
		chr = inputString.charCodeAt(i);
		hash = (hash << 5) - hash + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return Math.abs(hash / 2147483647);
}

/**
 * Combine three integers into a single hash value.
 */
export function hashThreeIntegers(a: number, b: number, c: number): number {
	const prime = 31; // A prime number to avoid common patterns

	let hash = 17; // Initial value, can be any prime number
	hash = hash * prime + a;
	hash = hash * prime + b;
	hash = hash * prime + c;
	return hash;
}

/* --------------------------------- MAPPING -------------------------------- */

/**
 * Returns the sign of a number as -1 or 1.
 */
export function sign(x: number): number {
	return x >= 0 ? 1 : -1;
}

/**
 * Normalised cosine mapping in range [0,1].
 */
export function nmc(x: number): number {
	return -Math.cos(x) * 0.5 + 0.5;
}

/**
 * Sigmoid curve.
 */
export function sigmoid(x: number): number {
	return 1 / (1 + Math.exp(-x));
}

/**
 * Hyperbolic tangent implemented via sigmoid.
 */
export function tanh(x: number): number {
	return sigmoid(2 * x) * 2 - 1;
}

/**
 * Standard gaussian export function e^(-x^2).
 */
export function gaussian(x: number): number {
	return Math.exp(-Math.pow(x, 2));
}

/**
 * Absolute value gaussian for a sharper peak.
 */
export function gaussianSharp(x: number): number {
	return Math.exp(-Math.abs(x));
}

function lerp(a: number, b: number, t: number): number {
	// linear interpolation
	return a + (b - a) * t;
}

/**
 * Mix between gaussian and gaussianSharp.
 */
export function gaussianAngular(x: number): number {
	return lerp(gaussian(x), gaussianSharp(x), 0.5);
}

/**
 * Highly peaked gaussian used for noise wobbles.
 */
export function gaussianWobble(x: number): number {
	return lerp(gaussian(x), gaussianSharp(x), 3);
}

/**
 * Convert a parameter t in [0,1] into an integer range [0,n).
 */
export function paramToIntSteps(t: number, n: number): number {
	return Math.floor(t * n * (1 - 1e-5));
}

/**
 * Wrap any angle to the range [0,TAU).
 */
export function simplifyAngle(angle: number): number {
	return ((angle % TAU) + TAU) % TAU;
}

/**
 * Calculate signed difference between two angles.
 */
export function signedAngleDiff(angle: number, anchorAngle: number): number {
	return Math.PI - simplifyAngle(angle + Math.PI - anchorAngle);
}

/**
 * Constrain an angle around an anchor by a maximum deviation.
 */
export function constrainAngle(
	angle: number,
	anchorAngle: number,
	constraint: number
): number {
	// constrain the angle to be within a certain range of the anchorAngle
	if (Math.abs(signedAngleDiff(angle, anchorAngle)) <= constraint) {
		return simplifyAngle(angle);
	}

	if (signedAngleDiff(angle, anchorAngle) > constraint) {
		return simplifyAngle(anchorAngle - constraint);
	}
	// <= constraint
	return simplifyAngle(anchorAngle + constraint);
}

/* ------------------------------- RANDOMNESS ------------------------------- */

/**
 * Generate a 2D vector with normally distributed components using the
 * Box–Muller method.
 */
export function randomGaussianBoxMueller2(
	mu: Vector = new Vector(),
	sigma: number = 1
): Vector {
	// outputs normally distributed 2d vector
	// x and y are individually normally distributed
	let u1 = Math.random();
	let u2 = Math.random();
	let r = Math.sqrt(-2 * Math.log(u1));
	let th = TAU * u2;
	return Vector.fromAngle(th)
		.mult(r * sigma)
		.add(mu);
}

/* -------------------------- L.ALGEBRA & GEOMETRY -------------------------- */

/**
 * Linear interpolation between two vectors.
 */
export function mix(va: Vector, vb: Vector, t: number): Vector {
	return vb.sub(va).mult(t).add(va);
}

/**
 * Midpoint between two vectors.
 */
export function midPoint(va: Vector, vb: Vector): Vector {
	return mix(va, vb, 0.5);
}

/**
 * Check whether a vector lies within rectangular bounds.
 */
export function isInBounds(
	v: Vector,
	x: number,
	y: number,
	w: number,
	h: number,
	offs: number = 0
): boolean {
	return (
		v.x >= x - offs && v.x < w + offs && v.y >= y - offs && v.y < h + offs
	);
}

/**
 * Check whether a vector lies within the canvas.
 */
export function isInCanvas(
	v: Vector,
	w: number,
	h: number,
	offs: number = 0
): boolean {
	return isInBounds(v, 0, 0, w, h, offs);
}

/**
 * Check whether a vector lies within the offscreen graphics buffer.
 */
export function inPg(v: Vector, pg: p5.Graphics, offs: number = 0): boolean {
	return isInBounds(v, 0, 0, pg.width, pg.height, offs);
}

/**
 * Check if a point lies inside the triangle defined by v1,v2,v3.
 */
export function isPointInTriangle(
	pt: Vector,
	v1: Vector,
	v2: Vector,
	v3: Vector
): boolean {
	function triangleSign(p1: Vector, p2: Vector, p3: Vector): number {
		return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
	}
	const d1 = triangleSign(pt, v1, v2);
	const d2 = triangleSign(pt, v2, v3);
	const d3 = triangleSign(pt, v3, v1);
	const has_neg = d1 < 0 || d2 < 0 || d3 < 0;
	const has_pos = d1 > 0 || d2 > 0 || d3 > 0;
	return !(has_neg && has_pos);
}

/**
 * Signed angle from vector v to vector w.
 */
export function signedAngleBetween(v: Vector, w: Vector): number {
	// angle measured from v to w
	return Math.atan2(v.x * w.y - v.y * w.x, v.x * w.x + v.y * w.y);
}

/* ------------------------------- STATISTICS ------------------------------- */

/**
 * Convert an array of numbers to rounded percentages that sum to 100.
 */
export function numsToRoundedPercentages(list: number[]): number[] | undefined {
	let listSum = list.reduce((acc, x) => acc + x, 0);
	if (listSum <= 0) return;

	type PercentageObj = { index: number; rounded: number; error: number };
	let percentages: PercentageObj[] = [];
	let index = 0;
	for (let num of list) {
		let percent = (num / listSum) * 100;
		let rounded = Math.round(percent);
		let error = percent - rounded;
		percentages.push({ index, rounded, error });
		index++;
	}

	while (true) {
		let sum = percentages
			.map(item => item.rounded)
			.reduce((acc, x) => acc + x, 0);
		if (sum == 100 || sum <= 0) break;

		percentages.sort((a, b) => Math.abs(b.error) - Math.abs(a.error));
		percentages[0].rounded += sign(percentages[0].error);
		percentages[0].error = 0;
	}
	percentages.sort((a, b) => a.index - b.index); // sort index

	return percentages.map(item => item.rounded);
}
