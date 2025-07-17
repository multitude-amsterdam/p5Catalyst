/**
 * @fileoverview Mathematical helper utilities.
 */

// -------------------------------------- CONSTANTS

/**
 * Golden ratio.
 * @constant {number}
 */
const PHI = (Math.sqrt(5) + 1) / 2;

/**
 * Euler's constant.
 * @constant {number}
 */
const E = Math.E;

// -------------------------------------- HASHING

/**
 * Simple deterministic hash from an integer to a float in [0,1].
 * @param {number} i
 * @returns {number}
 */
function simpleIntToFloatHash(i) {
	return fract(sin(i * 1097238.23492523 * 23479.23429237));
}

/**
 * Hash a string to a float in [0,1].
 * @param {string} inputString
 * @returns {number}
 */
function stringToFloatHash(inputString) {
	let hash = 0,
		chr;
	if (inputString.length === 0) return hash;
	for (let i = 0; i < inputString.length; i++) {
		chr = inputString.charCodeAt(i);
		hash = (hash << 5) - hash + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return abs(hash / 2147483647);
}

/**
 * Combine three integers into a single hash value.
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @returns {number}
 */
function hashThreeIntegers(a, b, c) {
	const prime = 31; // A prime number to avoid common patterns

	let hash = 17; // Initial value, can be any prime number
	hash = hash * prime + a;
	hash = hash * prime + b;
	hash = hash * prime + c;
	return hash;
}

// -------------------------------------- MAPPING

/**
 * Returns the sign of a number as -1 or 1.
 * @param {number} x
 * @returns {number}
 */
function sign(x) {
	return x >= 0 ? 1 : -1;
}

/**
 * Normalised cosine mapping in range [0,1].
 * @param {number} x
 * @returns {number}
 */
function nmc(x) {
	return -cos(x) * 0.5 + 0.5;
}

/**
 * Sigmoid curve.
 * @param {number} x
 * @returns {number}
 */
function sigmoid(x) {
	return 1 / (1 + exp(-x));
}
/**
 * Hyperbolic tangent implemented via sigmoid.
 * @param {number} x
 * @returns {number}
 */
function tanh(x) {
	return sigmoid(2 * x) * 2 - 1;
}

/**
 * Standard gaussian function e^(-x^2).
 * @param {number} x
 * @returns {number}
 */
function gaussian(x) {
	return exp(-pow(x, 2));
}
/**
 * Absolute value gaussian for a sharper peak.
 * @param {number} x
 * @returns {number}
 */
function gaussianSharp(x) {
	return exp(-abs(x));
}
/**
 * Mix between gaussian and gaussianSharp.
 * @param {number} x
 * @returns {number}
 */
function gaussianAngular(x) {
	return lerp(gaussian(x), gaussianSharp(x), 0.5);
}
/**
 * Highly peaked gaussian used for noise wobbles.
 * @param {number} x
 * @returns {number}
 */
function gaussianWobble(x) {
	return lerp(gaussian(x), gaussianSharp(x), 3);
}

/**
 * Convert a parameter t in [0,1] into an integer range [0,n).
 * @param {number} t
 * @param {number} n
 * @returns {number}
 */
function paramToIntSteps(t, n) {
	return floor(t * n * (1 - 1e-5));
}

/**
 * Wrap any angle to the range [0,TAU).
 * @param {number} angle
 * @returns {number}
 */
function simplifyAngle(angle) {
	return ((angle % TAU) + TAU) % TAU;
}
/**
 * Calculate signed difference between two angles.
 * @param {number} angle
 * @param {number} anchorAngle
 * @returns {number}
 */
function signedAngleDiff(angle, anchorAngle) {
	return PI - simplifyAngle(angle + PI - anchorAngle);
}

/**
 * Constrain an angle around an anchor by a maximum deviation.
 * @param {number} angle
 * @param {number} anchorAngle
 * @param {number} constraint
 * @returns {number}
 */
function constrainAngle(angle, anchorAngle, constraint) {
	// constrain the angle to be within a certain range of the anchorAngle
	if (abs(signedAngleDiff(angle, anchorAngle)) <= constraint) {
		return simplifyAngle(angle);
	}

	if (signedAngleDiff(angle, anchorAngle) > constraint) {
		return simplifyAngle(anchorAngle - constraint);
	}
	// <= constraint
	return simplifyAngle(anchorAngle + constraint);
}

// -------------------------------------- RANDOMNESS

/**
 * Generate a 2D vector with normally distributed components using the
 * Box–Muller method.
 * @param {Vec2D} [mu=new Vec2D()] Mean vector
 * @param {number} [sigma=1] Standard deviation
 * @returns {Vec2D}
 */
function randomGaussianBoxMueller2(mu = new Vec2D(), sigma = 1) {
	// outputs normally distributed 2d vector
	// x and y are individually normally distributed
	let u1 = random(1);
	let u2 = random(1);
	let r = sqrt(-2 * log(u1));
	let th = TAU * u2;
	return new Vec2D(r * sigma, th).toCartesian().add(mu);
}

// -------------------------------------- L.ALGEBRA & GEOMETRY

/**
 * Linear interpolation between two vectors.
 * @param {Vec2D|Vec3D} va
 * @param {Vec2D|Vec3D} vb
 * @param {number} t
 * @returns {Vec2D|Vec3D}
 */
function mix(va, vb, t) {
	return vb.sub(va).scale(t).add(va);
}
Vec2D.prototype.mix = function (v, t) {
	return mix(this, v, t);
};
Vec3D.prototype.mix = function (v, t) {
	return mix(this, v, t);
};

/**
 * Midpoint between two vectors.
 * @param {Vec2D|Vec3D} va
 * @param {Vec2D|Vec3D} vb
 * @returns {Vec2D|Vec3D}
 */
function midPoint(va, vb) {
	return mix(va, vb, 0.5);
}
Vec2D.prototype.mix = function (v) {
	return midPoint(this, v);
};
Vec3D.prototype.mix = function (v) {
	return midPoint(this, v);
};

/**
 * Check whether a vector lies within rectangular bounds.
 * @param {Vec2D} v
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} [offs=0] Optional margin
 * @returns {boolean}
 */
function isInBounds(v, x, y, w, h, offs = 0) {
	return (
		v.x >= x - offs &&
		v.x < width + offs &&
		v.y >= y - offs &&
		v.y < height + offs
	);
}
/**
 * Check whether a vector lies within the main canvas.
 * @param {Vec2D} v
 * @param {number} [offs=0]
 * @returns {boolean}
 */
function isInCanvas(v, offs = 0) {
	return isInBounds(v, 0, 0, width, height, offs);
}

/**
 * Test if the mouse is inside a rectangle.
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} [offs=0]
 * @returns {boolean}
 */
function isMouseInside(x, y, w, h, offs = 0) {
	return isInBounds(new Vec2D(mouseX, mouseY), x, y, w, h, offs);
}

/**
 * Check whether a vector lies within the offscreen graphics buffer.
 * @param {Vec2D} v
 * @param {number} [offs=0]
 * @returns {boolean}
 */
function inPg(v, offs = 0) {
	return isInBounds(v, 0, 0, pg.width, pg.height, offs);
}

/**
 * Helper sign used in {@link isPointInTriangle}.
 */
function triangleSign(p1, p2, p3) {
	// see isPointInTriangle
	return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}
/**
 * Check if a point lies inside the triangle defined by v1,v2,v3.
 * @param {Vec2D} pt
 * @param {Vec2D} v1
 * @param {Vec2D} v2
 * @param {Vec2D} v3
 * @returns {boolean}
 */
function isPointInTriangle(pt, v1, v2, v3) {
	const d1 = triangleSign(pt, v1, v2);
	const d2 = triangleSign(pt, v2, v3);
	const d3 = triangleSign(pt, v3, v1);
	const has_neg = d1 < 0 || d2 < 0 || d3 < 0;
	const has_pos = d1 > 0 || d2 > 0 || d3 > 0;
	return !(has_neg && has_pos);
}

/**
 * Signed angle from vector v to vector w.
 * @param {Vec2D} v
 * @param {Vec2D} w
 * @returns {number}
 */
function signedAngleBetween(v, w) {
	// angle measured from v
	return atan2(v.x * w.y - v.y * w.x, v.x * w.x + v.y * w.y);
}

// -------------------------------------- STATISTICS

/**
 * Convert an array of numbers to rounded percentages that sum to 100.
 * @param {number[]} list
 * @returns {number[]}
 */
function numsToRoundedPercentages(list) {
	let listSum = list.reduce((acc, x) => acc + x, 0);
	if (listSum <= 0) return;

	let normalizedList = [...list];

	let percentages = [];
	let index = 0;
	for (let num of normalizedList) {
		let percent = (num / listSum) * 100;
		let rounded = round(percent);
		let error = percent - rounded;
		percentages.push([index, rounded, error]);
		index++;
	}

	while (true) {
		let sum = percentages
			.map(item => item[1])
			.reduce((acc, x) => acc + x, 0);
		if (sum == 100 || sum <= 0) break;

		percentages.sort((a, b) => abs(b[2]) - abs(a[2]));
		percentages[0][1] += sign(percentages[0][2]);
		percentages[0][2] = 0;
	}
	percentages.sort((a, b) => a[0] - b[0]); // sort index

	return percentages.map(item => item[1]);
}
