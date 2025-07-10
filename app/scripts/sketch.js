let canvas;
let svgCanvas;
let canvWrapper;
let pw = 1,
	ph = 1;
let canvScale = 1;

let theShader;
let gui;
let generator;

let bodyFont, titleFont;

const maxImgResIncrease = 0.25;

const doRunRealTime = false;

let isCapturingFrames = false;
const doCaptureStartFromFrame0 = true;

let mouse = new Vec2D();

let isPlaying = true;
let progress = 0;
let time = 0;
let ptime = -1 / 60;
let speed = 1;
let dtime; // dt start at 60 fps

let ffmpegWaiter = 0;

let scrollScale = 1;

let changeSet;

// ------------------------------------------------------------ PRELOAD
function preload() {
	// theShader = loadShader('scripts/shader/shader.vert', 'scripts/shader/shader.frag');
}

// ------------------------------------------------------------ SETUP
function setup() {
	initUtils(10, ffmpegFR || 30);

	canvas =
		theShader === undefined
			? createCanvas(1, 1)
			: createCanvas(1, 1, WEBGL);
	// svgCanvas = new p5(theSvgCanvasSketch);
	createCanvasWrapper();

	lang.setup('en');

	generator = new Generator();

	createGUI();

	ffmpegSetup();

	containCanvasInWrapper();

	changeSet = new ChangeSet();

	generator.setup();

	// setTimeout(helpMe, 500);
}

// ------------------------------------------------------------ DRAW
function draw() {
	if (!isFfmpegInit && ffmpegWaiter < FR) {
		ffmpegWaiter++;
		return;
	}
	// if (!isPlaying) return;
	if (keyIsDown('-')) frameCount--;
	if (keyIsDown('=')) frameCount++;
	setTime();
	mouse.set(mouseX, mouseY); //.scale(1 / generator.canvScale);

	generator.draw();

	handleFrameCapture();
}

// ------------------------------------------------------------ SVG CANVAS
function theSvgCanvasSketch(sketch) {
	sketch.setup = () => {
		let canvas = sketch.createCanvas(1, 1, SVG);
		canvas.svg.style.display = 'none';
		sketch.pixelDensity(1);
		sketch.clear();
		sketch.noLoop();
	};

	sketch.draw = () => {};
}

// ------------------------------------------------------------ HELP ME
function helpMe() {
	alert(
		lang.process(`LANG_USE:\n`, true) +
			`Laat deze popup zien: ‘H’ toets\n` +
			`Pauzeren / afspelen animatie: spatiebalk\n` +
			lang.process(`LANG_UNDO/LANG_REDO: ‘CTRL’/‘CMD’ + ‘Z’\n`, true) +
			``
	);
}

// ------------------------------------------------------------ RESIZE
function resize(w, h) {
	if (w == pw && h == ph) return;
	if (w < 1 || h < 1) return;

	pw = w;
	ph = h;

	print(`Resizing to: ${w} x ${h}...`);
	pixelDensity(1);
	resizeCanvas(pw, ph);
	// generator.pg.pixelDensity(1);
	// generator.pg.resizeCanvas(pw, ph);
	if (svgCanvas) {
		svgCanvas.pixelDensity(1);
		svgCanvas.resizeCanvas(pw, ph);
	}

	containCanvasInWrapper();
	containCanvasInWrapper(); // needs a double call
}

// ------------------------------------------------------------ CONTAIN CANVAS
function createCanvasWrapper() {
	canvWrapper = createDiv();
	canvWrapper.id('canvas-workarea');
	canvas.parent(canvWrapper);
	if (svgCanvas) {
		canvWrapper.elt.append(svgCanvas.canvas.wrapper);
		svgCanvas.parent(canvWrapper);
	}
	document.querySelector('main').append(canvWrapper.elt);
}

function containCanvasInWrapper() {
	const canvAsp = pw / ph;

	const wrapperW = canvWrapper.elt.clientWidth;
	const wrapperH = canvWrapper.elt.clientHeight;
	const wrapperAsp = wrapperW / wrapperH;

	canvas.elt.style = '';
	if (canvAsp > wrapperAsp) {
		canvas.elt.style.height = '';
		canvas.elt.style.width = '100%';
	} else {
		canvas.elt.style.width = '';
		canvas.elt.style.height = 'calc(100vh - 2rem)';
	}

	if (svgCanvas) {
		svgCanvas.canvas.wrapper.style = '';
		svgCanvas.canvas.svg.removeAttribute('width');
		svgCanvas.canvas.svg.removeAttribute('height');
		svgCanvas.canvas.svg.style.width = pw;
		svgCanvas.canvas.svg.style.height = ph;
	}

	canvScale = sqrt((pw * ph) / (1920 * 1080));
}

// ------------------------------------------------------------ FRAME CAPTURING
function handleFrameCapture() {
	if (isCapturingFrames) {
		const vidButton = gui.getController(
			'buttonVidCapture' + ffmpegExportSettings.ext.toUpperCase()
		).controllerElement;
		if (savedFrameCount < nFrames) {
			saveToLocalFFMPEG(savedFrameCount);
			vidButton.elt.style.backgroundColor = 'var(--gui-hover-col)';
			savedFrameCount++;
		} else {
			vidButton.elt.style.backgroundColor = null;
			stopCapture();
			print('End of saving frames, making video...');
			ffmpegCreateMP4();
		}
	}
}

// ------------------------------------------------------------ EVENT HANDLERS
function keyPressed(e) {
	if (gui.isTypingText) return;

	// controls changeSet with CTRL/CMD + Z
	const evt = window.event ? event : e;
	const doChangeSet =
		evt.keyCode == 90 &&
		((evt.ctrlKey && !evt.metaKey) || (!evt.ctrlKey && evt.metaKey)) &&
		!evt.altKey;
	if (doChangeSet && !evt.shiftKey) changeSet.undo();
	else if (doChangeSet && evt.shiftKey) changeSet.redo();

	if (keyCode >= 48 && keyCode <= 57) {
		let utilInd = keyCode - 48;
		utilBools[utilInd] = !utilBools[utilInd];
	}

	const frameJump = 100;
	switch (key.toLowerCase()) {
		case ' ':
			isPlaying = !isPlaying;
			break;
		case 'h':
			helpMe();
			break;
		case '[':
			frameCount -= frameJump;
			break;
		case ']':
			frameCount += frameJump;
			break;
		case 's':
			save(Generator.getOutputFileName() + '.png');
			break;
		case 'f':
			let fs = fullscreen();
			fullscreen(!fs);
			break;
		case 'b':
			gui.toggleSide();
			break;
		case 'm':
			gui.toggleLightDarkMode();
			break;

		case 'ArrowRight':
			if (SSID == SSIDs[SSIDs.length - 1]) addNextSSID();
			else SSIDindex++;
			setup();
			break;
		case 'ArrowLeft':
			if (SSIDindex > 0) {
				SSIDindex--;
				setup();
			}
			break;

		case 'ArrowUp':
			K++;
			print('K: ' + K);
			break;
		case 'ArrowDown':
			if (K <= 0) break;
			K--;
			print('K: ' + K);
			break;
	}
}

function mousePressed() {}

function mouseReleased() {}

const relScrollVel = (isMac() ? 0.1 : 1) * 0.06;
function mouseWheel(event) {
	let wheelDist = getWheelDistance(event);
	const s = exp(wheelDist * relScrollVel);
	scrollScale *= s;
	// scrollScale = constrain(scrollScale, 0.2, 5);
}

function windowResized() {
	containCanvasInWrapper();
}

// ------------------------------------------------------------ INIT UTILS

let SSID,
	SSIDindex = 0;
let SSIDs = [generateSSID()];
let K = 0; // util constant
let utilBools = [];
let FR, duration, nFrames;
let noiseOffs;

function initUtils(_duration, _frameRate) {
	console.log('p5Catalyst initiated as ' + Generator.name);
	console.log(
		'Project page: https://github.com/multitude-amsterdam/p5Catalyst'
	);

	// SSID-based seed initialisation
	SSID = SSIDs[SSIDindex];
	SSIDHash = SSID / 1e8;
	randomSeed(SSID);
	noiseSeed(SSID);
	noiseOffs = SSIDHash * 1000;

	// set framerate and animation duration
	FR = _frameRate;
	ffmpegFR = FR;
	setDuration(_duration);
	frameRate(FR);

	document.title = Generator.name;

	for (let i = 0; i < 10; i++) utilBools.push(false);
}

function generateSSID() {
	return Math.floor(Math.random() * 1e8);
}

function addNextSSID() {
	SSIDs.push(generateSSID());
	SSIDindex = SSIDs.length - 1;
	SSID = SSIDs[SSIDindex];
	SSIDHash = SSID / 1e8;
}
