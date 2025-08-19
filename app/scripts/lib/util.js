/**
 * @fileoverview Utility helper functions used throughout the project.
 */

// ----------------------------- DRAWING ------------------------------

/**
 * Execute a drawing function wrapped in push/pop calls. Can also operate on a
 * {@link p5.Graphics} instance if provided.
 * @param {...any} args Either (pg, fn) or (fn).
 */
function pushpop() {
	// pushpop(pg, () => { ... })
	if (arguments.length == 2) {
		const pg = arguments[0];
		const func = arguments[1];
		pg.push();
		func();
		pg.pop();
		return;
	}
	// pushpop(() => { ... })
	if (arguments.length == 1) {
		const func = arguments[0];
		push();
		func();
		pop();
		return;
	}
}

/**
 * Draw a bezier fillet between two points around a centre.
 * @param {Vec2D} filletStart
 * @param {Vec2D} filletEnd
 * @param {Vec2D} cen Centre of the fillet.
 */
function toxiFillet(filletStart, filletEnd, cen) {
	const cpts = bezierFilletControlPoints(filletStart, filletEnd, cen);
	toxiBezierVertex(cpts[0], cpts[1], filletEnd);
}

/**
 * Calculate control points for a fillet bezier curve.
 * @param {Vec2D} filletStart
 * @param {Vec2D} filletEnd
 * @param {Vec2D} cen
 * @returns {Vec2D[]}
 */
function bezierFilletControlPoints(filletStart, filletEnd, cen) {
	let a = filletStart.sub(cen);
	let b = filletEnd.sub(cen);
	let q1 = a.dot(a);
	let q2 = q1 + a.dot(b);
	let k2 = ((4 / 3) * (sqrt(2 * q1 * q2) - q2)) / (a.x * b.y - a.y * b.x);

	let x2 = cen.x + a.x - k2 * a.y;
	let y2 = cen.y + a.y + k2 * a.x;
	let x3 = cen.x + b.x + k2 * b.y;
	let y3 = cen.y + b.y - k2 * b.x;
	return [new Vec2D(x2, y2), new Vec2D(x3, y3)];
}

/**
 * Convenience wrapper returning the intersection of two {@link Line2D} lines.
 * @param {Line2D} lineA
 * @param {Line2D} lineB
 * @returns {Vec2D}
 */
function intersectionPoint(lineA, lineB) {
	let res = lineA.intersectLine(lineB);
	return res.pos;
}

/**
 * p5 wrapper for toxiclibs bezier vertex convenience.
 * @param {Vec2D} cp1 Control point 1
 * @param {Vec2D} cp2 Control point 2
 * @param {Vec2D} p2 End point
 */
function toxiBezierVertex(cp1, cp2, p2) {
	bezierVertex(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y);
}

/**
 * p5 vertex wrapper using a {@link Vec2D}.
 * @param {Vec2D} v
 */
function toxiVertex(v) {
	vertex(...vectorComponents(v));
}

/**
 * Convert a vector into an array of its numeric components.
 * @param {Vec2D|Vec3D} v
 * @returns {number[]}
 */
function vectorComponents(v) {
	return Object.values({ ...v });
}

/**
 * Draw an image fitted to the canvas centre.
 * @param {p5.Image} img Image to draw.
 * @param {boolean} doFill Fit or contain flag.
 */
function imageCentered(img, doFill) {
	image(
		img,
		0,
		0,
		width,
		height,
		0,
		0,
		img.width,
		img.height,
		doFill ? COVER : CONTAIN
	);
}

function imageCenteredXYScale(
	img,
	doFill,
	posX = 0,
	posY = 0,
	sc = 1,
	doFlipHorizontal = false
) {
	push();
	{
		resetMatrix();
		if (theShader !== undefined) translate(-width / 2, -height / 2);
		imageMode(CENTER);

		const am = width / height;
		const aimg = img.width / img.height;
		const doFitVertical = (am > aimg) ^ doFill;

		let imgFitW = doFitVertical ? height * aimg : width;
		let imgFitH = doFitVertical ? height : width / aimg;

		translate(width * 0.5, height * 0.5);

		let renderW = imgFitW * sc;
		let renderH = imgFitH * sc;
		let dx = (-posX * (renderW - width)) / 2;
		let dy = (-posY * (renderH - height)) / 2;
		translate(dx, dy);

		scale(sc);

		if (doFlipHorizontal) scale(-1, 1);

		image(img, 0, 0, imgFitW, imgFitH);
	}
	pop();
}

function pgImageCenteredXYScale(
	pg,
	img,
	doFill,
	posX = 0,
	posY = 0,
	sc = 1,
	doFlipHorizontal = false
) {
	pg.push();
	{
		pg.resetMatrix();
		if (theShader !== undefined) pg.translate(-width / 2, -height / 2);
		pg.imageMode(CENTER);

		const am = pg.width / pg.height;
		const aimg = img.width / img.height;
		const doFitVertical = (am > aimg) ^ doFill;

		let imgFitW = doFitVertical ? pg.height * aimg : pg.width;
		let imgFitH = doFitVertical ? pg.height : pg.width / aimg;

		pg.translate(width * 0.5, height * 0.5);

		let renderW = imgFitW * sc;
		let renderH = imgFitH * sc;
		let dx = (-posX * (renderW - pg.width)) / 2;
		let dy = (-posY * (renderH - pg.height)) / 2;
		pg.translate(dx, dy);

		pg.scale(sc);

		if (doFlipHorizontal) pg.scale(-1, 1);

		pg.image(img, 0, 0, imgFitW, imgFitH);
	}
	pg.pop();
}

function getMouseMappedToCenteredPg(pg, doFill) {
	// main aspect ratio, pg aspect ratio
	let am = width / height,
		apg = pg.width / pg.height;

	// pg is fitted to screen height
	let isPgFitVertical = am > apg;

	let pgSc = isPgFitVertical ? height / pg.height : width / pg.width;

	let pgMouse = isPgFitVertical
		? new Vec2D(
				map(
					(mouseX - width / 2) / ((pg.width * pgSc) / 2),
					-1,
					1,
					0,
					pg.width
				),
				map(mouseY, 0, height, 0, pg.height)
		  )
		: new Vec2D(
				map(mouseX, 0, width, 0, pg.width),
				map(
					(mouseY - height / 2) / ((pg.height * pgSc) / 2),
					-1,
					1,
					0,
					pg.height
				)
		  );
	return pgMouse;
}

// ----------------------------- COLOURS ------------------------------

/**
 * Generate a random RGB colour.
 * @returns {p5.Color}
 */
function randCol() {
	return color(random(255), random(255), random(255));
}

/**
 * Calculates the relative luminance of a color in sRGB color space.
 * The returned value is a number between 0 (black) and 1 (white), representing the perceived brightness.
 *
 * From: https://alvaromontoro.medium.com/building-a-color-contrast-checker-e62d53618318
 *
 * @param {p5.Color} color - The color value to compute luminance for. Must be compatible with p5.js color functions.
 * @returns {number} The relative luminance of the color (0 to 1).
 */
function luminance(color) {
	// luminance as sRGB
	const a = [red(color), green(color), blue(color)].map(v => {
		v /= 255;
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	});
	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Calculate the contrast ratio between two colors.
 * The contrast ratio is calculated using the formula:
 * ( L1 + 0.05 ) / ( L2 + 0.05 )
 * where L1 is the luminance of the lighter color and L2 is the luminance of the darker color.
 * From: https://alvaromontoro.medium.com/building-a-color-contrast-checker-e62d53618318
 * @param {p5.Color} colA - The first color.
 * @param {p5.Color} colB - The second color.
 * @returns {number} The contrast ratio between the two colors.
 */
function colorContrast(colA, colB) {
	const lumA = luminance(colA);
	const lumB = luminance(colB);

	return lumA > lumB
		? (lumB + 0.05) / (lumA + 0.05)
		: (lumA + 0.05) / (lumB + 0.05);
}
/**
 * Check if two colors are WCAG compliant.
 * Returns an object with boolean values indicating compliance for different text sizes.
 * WCAG AA guidelines: https://www.w3.org/TR/WCAG21/#contrast-minimum
 * WCAG AAA guidelines: https://www.w3.org/TR/WCAG21/#contrast-enhanced
 * @param {p5.Color} colA - The first color.
 * @param {p5.Color} colB - The second color.
 * @return {Object} An object with boolean values indicating compliance for different text sizes.
 * @example
 * isWCAGCompliant(color(255, 255, 255), color(0, 0, 0));
 * // Returns:
 * // {
 * //   'AA-level large text': true,
 * //   'AA-level small text': true,
 * //   'AAA-level large text': true,
 * //   'AAA-level small text': true
 * // }
 */
function isWCAGCompliant(colA, colB) {
	const contrast = colorContrast(colA, colB);
	return {
		'AA-level large text': ratio < 1 / 3,
		'AA-level small text': ratio < 1 / 4.5,
		'AAA-level large text': ratio < 1 / 4.5,
		'AAA-level small text': ratio < 1 / 7,
	};
}

/**
 * Convert a p5 color to a hex string.
 * @param {p5.Color} col
 * @param {boolean} [doAlpha=false]
 * @returns {string}
 */
function colorToHexString(col, doAlpha = false) {
	let levels = col.levels;
	if (!doAlpha) levels = levels.slice(0, 3);
	return '#' + levels.map(l => l.toString(16).padStart(2, '0')).join('');
}

/**
 * Interpolate between two colours using the OKLab colour space.
 * @param {p5.Color} col1
 * @param {p5.Color} col2
 * @param {number} t Interpolation factor [0,1]
 * @returns {p5.Color}
 */
function lerpColorOKLab(col1, col2, t) {
	// OKLab colour interpolation
	// more info: https://bottosson.github.io/posts/oklab/
	const srgbToLinear = x => {
		return x <= 0.04045 ? x / 12.92 : pow((x + 0.055) / 1.055, 2.4);
	};
	const linearToSrgb = x => {
		return x <= 0.0031308 ? x * 12.92 : 1.055 * pow(x, 1 / 2.4) - 0.055;
	};

	function rgbToOKLab(r, g, b) {
		r = srgbToLinear(r);
		g = srgbToLinear(g);
		b = srgbToLinear(b);

		// RGB to LMS
		let l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
		let m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
		let s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

		let l_ = Math.cbrt(l);
		let m_ = Math.cbrt(m);
		let s_ = Math.cbrt(s);

		// LMS to OKLab
		return {
			L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
			A: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
			B: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
		};
	}

	function oklabToRGB(L, A, B) {
		let l_ = L + 0.3963377774 * A + 0.2158037573 * B;
		let m_ = L - 0.1055613458 * A - 0.0638541728 * B;
		let s_ = L - 0.0894841775 * A - 1.291485548 * B;

		l_ = l_ ** 3;
		m_ = m_ ** 3;
		s_ = s_ ** 3;

		let r = +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
		let g = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
		let b = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_;

		r = linearToSrgb(r);
		g = linearToSrgb(g);
		b = linearToSrgb(b);

		let col;
		// preserve current main color mode
		push();
		{
			colorMode(RGB);
			col = color(
				constrain(r * 255, 0, 255),
				constrain(g * 255, 0, 255),
				constrain(b * 255, 0, 255)
			);
		}
		pop();
		return col;
	}

	// p5.Color._array is [r, g, b, a] in range [0,1]
	const lab1 = rgbToOKLab(...col1._array.slice(0, 3));
	const lab2 = rgbToOKLab(...col2._array.slice(0, 3));

	const L = lerp(lab1.L, lab2.L, t);
	const A = lerp(lab1.A, lab2.A, t);
	const B = lerp(lab1.B, lab2.B, t);

	colorMode(RGB);
	return oklabToRGB(L, A, B);
}

// ----------------------------- TIME ------------------------------

/**
 * Configure the animation duration in seconds.
 * @param {number} _duration
 */
function setDuration(_duration) {
	nFrames = int(_duration * FR);
	duration = nFrames / float(FR); // seconds
}

/**
 * Update global time and progress variables.
 */
function setTime() {
	if (!isPlaying) frameCount--;

	ptime = time;

	if (doRunRealTime) {
		time = (millis() / 1000) * speed;
		progress = time / speed / nFrames;
	} else {
		progress =
			(isCapturingFrames && doCaptureStartFromFrame0
				? savedFrameCount
				: frameCount) / nFrames;
		time = progress * duration * speed;
	}

	dtime = time - ptime;
}

/**
 * Get the current UNIX timestamp in seconds.
 * @returns {number}
 */
function getUNIX() {
	return Math.floor(new Date().getTime() / 1000);
}

/**
 * Generate a compact base64 timestamp string.
 * @returns {string}
 */
function getTimestamp() {
	return toB64(new Date().getTime());
}

/**
 * Generate a random Date between two dates.
 * @param {string|Date} date1
 * @param {string|Date} date2
 * @returns {Date}
 */
function randomDate(date1, date2) {
	function randomValueBetween(min, max) {
		return Math.random() * (max - min) + min;
	}
	let d1 = date1 || '01-01-1970';
	let d2 = date2 || new Date().toLocaleDateString();
	d1 = new Date(d1).getTime();
	d2 = new Date(d2).getTime();
	if (d1 > d2) {
		return new Date(randomValueBetween(d2, d1));
	} else {
		return new Date(randomValueBetween(d1, d2));
	}
}

// ----------------------------- STRINGS UTIL ------------------------------

/**
 * Capitalise the first character of a string.
 * @param {string} inputString
 * @returns {string}
 */
function capitalizeFirstLetter(inputString) {
	return inputString.charAt(0).toUpperCase() + inputString.slice(1);
}

if (!String.prototype.format) {
	/**
	 * Basic string templating helper.
	 * Usage: "{0} {1}".format(a, b)
	 * @this {String}
	 * @param {...any} args Values to substitute
	 * @returns {string}
	 */
	String.prototype.format = function () {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function (match, number) {
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
}

// ----------------------------- MEMORY ------------------------------

/**
 * Roughly estimate the memory footprint of a JavaScript object.
 * @param {object} object
 * @returns {number} Size in bytes
 */
function computeRoughSizeOfObject(object) {
	const objectList = [];
	const stack = [object];
	let bytes = 0;
	while (stack.length) {
		const value = stack.pop();

		switch (typeof value) {
			case 'boolean':
				bytes += 4;
				break;
			case 'string':
				bytes += value.length * 2;
				break;
			case 'number':
				bytes += 8;
				break;
			case 'object':
				if (!objectList.includes(value)) {
					objectList.push(value);
					for (const prop in value) {
						if (value.hasOwnProperty(prop)) {
							stack.push(value[prop]);
						}
					}
				}
				break;
		}
	}
	return bytes;
}

// ----------------------------- SYSTEM ------------------------------

/**
 * Determine if the current platform is macOS.
 * @returns {boolean}
 */
function isMac() {
	return window.navigator.platform.toLowerCase().indexOf('mac') > -1;
}

/**
 * Cross-browser helper for retrieving wheel delta.
 * @param {WheelEvent} evt
 * @returns {number}
 */
function getWheelDistance(evt) {
	if (!evt) evt = event;
	let w = evt.wheelDelta,
		d = evt.detail;
	if (d) {
		if (w) return (w / d / 40) * d > 0 ? 1 : -1;
		// Opera
		else return -d / 3; // Firefox;         TODO: do not /3 for OS X
	} else return w / 120; // IE/Safari/Chrome TODO: /3 for Chrome OS X
}

// ----------------------------- DATA/IO ------------------------------

/**
 * Check if two arrays contain the same values in the same order.
 * @param {Array} a
 * @param {Array} b
 * @returns {boolean}
 */
function isArraysEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length !== b.length) return false;
	// If you don't care about the order of the elements inside
	// the array, you should sort both arrays here.
	// Please note that calling sort on an array will modify that array.
	// you might want to clone your array first.
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

/**
 * Copy the current canvas bitmap to the system clipboard.
 */
function copyCanvasToClipboard() {
	canvas.elt.toBlob(blob => {
		navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
	});
}

/**
 * Digits used for base64 style encoding.
 * @constant {string}
 * @global
 */
const b64Digits =
	'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
/**
 * Convert a number to a base64-like string.
 * @param {number} n
 * @returns {string}
 */
const toB64 = n =>
	n
		.toString(2)
		.split(/(?=(?:.{6})+(?!.))/g)
		.map(v => b64Digits[parseInt(v, 2)])
		.join('');
/**
 * Parse a base64-like string back into a number.
 * @param {string} s64
 * @returns {number}
 */
const fromB64 = s64 =>
	s64.split('').reduce((s, v) => s * 64 + b64Digits.indexOf(v), 0);
