// -------------------------------------- CONSTANTS

const PHI = (Math.sqrt(5) + 1) / 2;

// -------------------------------------- HASHING

function simpleIntToFloatHash(i) {
	return fract(sin(i * 1097238.23492523 * 23479.23429237));
}

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

function hashThreeIntegers(a, b, c) {
	const prime = 31; // A prime number to avoid common patterns

	let hash = 17; // Initial value, can be any prime number
	hash = hash * prime + a;
	hash = hash * prime + b;
	hash = hash * prime + c;
	return hash;
}

// -------------------------------------- MAPPING

function sign(x) {
	return x >= 0 ? 1 : -1;
}

function nmc(x) {
	return -cos(x) * 0.5 + 0.5;
}

function sigmoid(x) {
	return 1 / (1 + exp(-x));
}
function tanh(x) {
	return sigmoid(2 * x) * 2 - 1;
}

const E = Math.E;
function gaussian(x) {
	return exp(-pow(x, 2));
}
function gaussianSharp(x) {
	return exp(-abs(x));
}
function gaussianAngular(x) {
	return lerp(gaussian(x), gaussianSharp(x), 0.5);
}
function gaussianWobble(x) {
	return lerp(gaussian(x), gaussianSharp(x), 3);
}

function paramToIntSteps(t, n) {
	return floor(t * n * (1 - 1e-5));
}

function simplifyAngle(angle) {
	return ((angle % TAU) + TAU) % TAU;
}
function signedAngleDiff(angle, anchorAngle) {
	return PI - simplifyAngle(angle + PI - anchorAngle);
}

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

function mix(va, vb, t) {
	return vb.sub(va).scale(t).add(va);
}
Vec2D.prototype.mix = function (v, t) {
	return mix(this, v, t);
};
Vec3D.prototype.mix = function (v, t) {
	return mix(this, v, t);
};

function midPoint(va, vb) {
	return mix(va, vb, 0.5);
}
Vec2D.prototype.mix = function (v) {
	return midPoint(this, v);
};
Vec3D.prototype.mix = function (v) {
	return midPoint(this, v);
};

function isInBounds(v, x, y, w, h, offs = 0) {
	return (
		v.x >= x - offs &&
		v.x < width + offs &&
		v.y >= y - offs &&
		v.y < height + offs
	);
}
function isInCanvas(v, offs = 0) {
	return isInBounds(v, 0, 0, width, height, offs);
}

function isMouseInside(x, y, w, h, offs = 0) {
	return isInBounds(new Vec2D(mouseX, mouseY), x, y, w, h, offs);
}

function inPg(v, offs = 0) {
	return isInBounds(v, 0, 0, pg.width, pg.height, offs);
}

function triangleSign(p1, p2, p3) {
	// see isPointInTriangle
	return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}
function isPointInTriangle(pt, v1, v2, v3) {
	const d1 = triangleSign(pt, v1, v2);
	const d2 = triangleSign(pt, v2, v3);
	const d3 = triangleSign(pt, v3, v1);
	const has_neg = d1 < 0 || d2 < 0 || d3 < 0;
	const has_pos = d1 > 0 || d2 > 0 || d3 > 0;
	return !(has_neg && has_pos);
}

function signedAngleBetween(v, w) {
	// angle measured from v
	return atan2(v.x * w.y - v.y * w.x, v.x * w.x + v.y * w.y);
}

// -------------------------------------- STATISTICS

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
