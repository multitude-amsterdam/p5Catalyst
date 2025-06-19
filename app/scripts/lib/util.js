
// ---------------------- RESTORING SERIALISED OBJS -----------------------

function restoreSerializedP5Color(obj) {
	if (!(obj.levels && obj.mode))
		return obj;
	push();
	colorMode(RGB);
	const col = color(obj.levels);
	pop();
	return col;
}



function restoreSerializedVec3D(obj) {
    // always use before Vec2D version when used in combination
    if ([obj.x, obj.y, obj.z].some(v => v === undefined))
        return obj;
    return new Vec3D(obj.x, obj.y, obj.z);
}

function restoreSerializedVec2D(obj) {
	if ([obj.x, obj.y].some(v => v === undefined))
        return obj;
    return new Vec2D(obj.x, obj.y);
}



// ----------------------------- DRAWING ------------------------------


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


// function toxiFillet(filletStart, filletEnd, cen) {
// 	const cpts = bezierFilletControlPoints(filletStart, filletEnd, cen);
// 	toxiBezierVertex(cpts[0], cpts[1], filletEnd);
// }


// function bezierFilletControlPoints(filletStart, filletEnd, cen) {
// 	let a = filletStart.sub(cen);
// 	let b = filletEnd.sub(cen)
// 	let q1 = a.dot(a);
// 	let q2 = q1 + a.dot(b);
// 	let k2 = (4/3) * (sqrt(2 * q1 * q2) - q2) / (a.x * b.y - a.y * b.x);

// 	let x2 = cen.x + a.x - k2 * a.y;
// 	let y2 = cen.y + a.y + k2 * a.x;
// 	let x3 = cen.x + b.x + k2 * b.y;
// 	let y3 = cen.y + b.y - k2 * b.x;
// 	return [new Vec2D(x2, y2), new Vec2D(x3, y3)];
// }


function intersectionPoint(lineA, lineB) {
	let res = lineA.intersectLine(lineB);
		// if (res.type != 3) return;
	return res.pos;
}


function toxiBezierVertex(cp1, cp2, p2) {
	bezierVertex(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y);
}


function toxiVertex(v) {
	vertex(...vectorComponents(v));
}


function vectorComponents(v) {
	return Object.values({...v});
}


function imageCentered(img, doFill) {
	image(img,
		0, 0, width, height, 
		0, 0, img.width, img.height, 
		doFill ? COVER : CONTAIN
		);
}


function imageCenteredXYScale(img, doFill, posX=0, posY=0, sc=1, doFlipHorizontal=false) {
	push();
	{
		resetMatrix();
		if (theShader !== undefined)
			translate(-width/2, -height/2);
		imageMode(CENTER);

		const am = width / height;
		const aimg = img.width / img.height;
		const doFitVertical = am > aimg ^ doFill;

		let imgFitW = doFitVertical ? (height * aimg) : width;
		let imgFitH = doFitVertical ? height : (width / aimg);
		
		translate(width * 0.5, height * 0.5);

		let renderW = imgFitW * sc;
		let renderH = imgFitH * sc;
		let dx = -posX * (renderW - width) / 2;
		let dy = -posY * (renderH - height) / 2;
		translate(dx, dy);
		
		scale(sc);

		if (doFlipHorizontal) scale(-1, 1);

		image(img, 0, 0, imgFitW, imgFitH);
	}
	pop();
}

function pgImageCenteredXYScale(pg, img, doFill, posX=0, posY=0, sc=1, doFlipHorizontal=false) {
	pg.push();
	{
		pg.resetMatrix();
		if (theShader !== undefined)
			pg.translate(-width/2, -height/2);
		pg.imageMode(CENTER);

		const am = pg.width / pg.height;
		const aimg = img.width / img.height;
		const doFitVertical = am > aimg ^ doFill;

		let imgFitW = doFitVertical ? (pg.height * aimg) : pg.width;
		let imgFitH = doFitVertical ? pg.height : (pg.width / aimg);
		
		pg.translate(width * 0.5, height * 0.5);

		let renderW = imgFitW * sc;
		let renderH = imgFitH * sc;
		let dx = -posX * (renderW - pg.width) / 2;
		let dy = -posY * (renderH - pg.height) / 2;
		pg.translate(dx, dy);
		
		pg.scale(sc);

		if (doFlipHorizontal) pg.scale(-1, 1);

		pg.image(img, 0, 0, imgFitW, imgFitH);
	}
	pg.pop();
}



function getMouseMappedToCenteredPg(pg, doFill) {
	// main aspect ratio, pg aspect ratio
	let am = width / height, apg = pg.width / pg.height;

	// pg is fitted to screen height
	let isPgFitVertical = am > apg;

	let pgSc = isPgFitVertical ?
	height / pg.height :
	width / pg.width;

	let pgMouse = isPgFitVertical ?
	new Vec2D(
		map((mouseX - width / 2) / (pg.width * pgSc / 2), -1, 1, 0, pg.width ),
		map(mouseY, 0, height, 0, pg.height)
		) :
	new Vec2D(
		map(mouseX, 0, width, 0, pg.width),
		map((mouseY - height / 2) / (pg.height * pgSc / 2), -1, 1, 0, pg.height )
		);
	return pgMouse;
}



// ----------------------------- COLOURS ------------------------------

function randCol() {
	return color(random(255), random(255), random(255));
}



function lum(col) {
	if (!col.levels) col = color(col);
	return 0.2125 * col.levels[0] / 255 +
	0.7154 * col.levels[1] / 255 + 
	0.0721 * col.levels[2] / 255;
}



function v(col) {
	if (!col.levels) col = color(col);
	return (col.levels[0] + col.levels[1] + col.levels[2]) / 3;
}



function colorToHexString(col, doAlpha=false) {
	let levels = col.levels;
	if (!doAlpha) levels = levels.slice(0, 3);
	return '#' + levels.map(l => l.toString(16).padStart(2, '0')).join('');
}



// ----------------------------- TIME ------------------------------

function setDuration(_duration) {
	nFrames = int(_duration * FR);
	duration = nFrames / float(FR); // seconds
}



function setTime() {
	if (!isPlaying) frameCount--;

	ptime = time;

	if (doRunRealTime) {
		time = millis() / 1000 * speed;
		progress = time / speed / nFrames;
	}
	else {
		progress = (isCapturingFrames && doCaptureStartFromFrame0 ? 
			savedFrameCount : frameCount) / nFrames;
		time = progress * duration * speed;
	}

	dtime = time - ptime;
}



function getUNIX() {
	return Math.floor(new Date().getTime() / 1000);
}



function getTimestamp() {
	return toB64(new Date().getTime());
}



function randomDate(date1, date2) {
	function randomValueBetween(min, max) {
		return Math.random() * (max - min) + min;
	}
	let d1 = date1 || "01-01-1970";
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

function capitalizeFirstLetter(inputString) {
	return inputString.charAt(0).toUpperCase() + inputString.slice(1);
}



// ----------------------------- MEMORY ------------------------------

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

function isMac() {
	return window.navigator.platform.toLowerCase().indexOf("mac") > -1;
}



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



function copyCanvasToClipboard() {
	canvas.elt.toBlob(blob => {
		navigator.clipboard.write([
			new ClipboardItem({ "image/png": blob })
		]);
	});
}



const b64Digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
const toB64 = n => n.toString(2).split(/(?=(?:.{6})+(?!.))/g).map(v => b64Digits[parseInt(v, 2)]).join('');
const fromB64 = s64 => s64.split('').reduce((s, v) => s * 64 + b64Digits.indexOf(v), 0);


