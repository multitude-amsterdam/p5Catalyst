/**
 * Reference to the main p5 canvas.
 * @type {p5.Renderer}
 * @global
 */
let canvas;
/**
 * SVG version of the p5 canvas.
 * @type {p5}
 * @global
 */
let svgCanvas;
/**
 * Wrapper element containing the canvas.
 * @type {p5.Element}
 * @global
 */
let canvWrapper;
/**
 * Current canvas width.
 * @type {number}
 * @global
 */
let pw = 1,
        /** @type {number} @global */ ph = 1;
/**
 * Scale factor used when fitting the canvas to the window.
 * @type {number}
 * @global
 */
let canvScale = 1;

/**
 * Optional shader assigned to the sketch.
 * @type {?p5.Shader}
 * @global
 */
let theShader;
/** @type {?dat.GUI} @global */
let gui;
/** @type {?Generator} @global */
let generator;

/**
 * Loaded fonts used throughout the sketch.
 * @type {p5.Font}
 * @global
 */
let bodyFont,
        /** @type {p5.Font} @global */ titleFont;

/**
 * Maximum factor for increasing the rendering resolution.
 * @constant {number}
 * @global
 */
const maxImgResIncrease = 0.25;

/**
 * When true the timeline runs at real world time instead of frame based.
 * @constant {boolean}
 * @global
 */
const doRunRealTime = false;

/**
 * Indicates if frames are currently being captured for video export.
 * @type {boolean}
 * @global
 */
let isCapturingFrames = false;
/**
 * Capture frames starting at frame&nbsp;0 when true.
 * @constant {boolean}
 * @global
 */
const doCaptureStartFromFrame0 = true;

/**
 * Helper vector with the current mouse position.
 * @type {Vec2D}
 * @global
 */
let mouse = new Vec2D();

/**
 * Whether the animation loop is currently running.
 * @type {boolean}
 * @global
 */
let isPlaying = true;
/**
 * Current progress through the animation [0-1].
 * @type {number}
 * @global
 */
let progress = 0;
/**
 * Current animation time in seconds.
 * @type {number}
 * @global
 */
let time = 0;
/**
 * Previous animation time.
 * @type {number}
 * @global
 */
let ptime = -1 / 60;
/**
 * Speed multiplier for the animation.
 * @type {number}
 * @global
 */
let speed = 1;
/**
 * Delta time between frames.
 * @type {number}
 * @global
 */
let dtime;

/**
 * Frame counter used while waiting for ffmpeg initialisation.
 * @type {number}
 * @global
 */
let ffmpegWaiter = 0;

/**
 * Scaling factor applied when using the mouse wheel.
 * @type {number}
 * @global
 */
let scrollScale = 1;

/**
 * ChangeSet instance tracking undo/redo actions.
 * @type {ChangeSet}
 * @global
 */
let changeSet;

// ------------------------------------------------------------ PRELOAD
/**
 * p5 preload hook used for loading assets before setup.
 * @function preload
 * @global
 */
function preload() {
        // theShader = loadShader('scripts/shader/shader.vert', 'scripts/shader/shader.frag');
}

// ------------------------------------------------------------ SETUP
/**
 * Standard p5 setup function.
 * @function setup
 * @global
 */
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

	if (window.location.hostname !== 'localhost') {
		setTimeout(helpMe, 500);
	}
}

// ------------------------------------------------------------ DRAW
/**
 * Main draw loop executed every frame.
 * @function draw
 * @global
 */
function draw() {
	if (!isFfmpegInit && ffmpegWaiter < FR) {
		ffmpegWaiter++;
		return;
	}
	// if (!isPlaying) return;
	if (keyIsDown('-')) frameCount--;
	if (keyIsDown('=')) frameCount++;
	setTime();
	mouse.set(mouseX, mouseY); //.scaleSelf(1 / generator.canvScale);

	generator.draw();

	handleFrameCapture();
}

// ------------------------------------------------------------ SVG CANVAS
/**
 * Sketch used for creating an off-screen SVG renderer.
 * @param {p5} sketch The p5 instance.
 * @function theSvgCanvasSketch
 * @global
 */
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
/**
 * Display a help dialog with usage instructions.
 * @function helpMe
 * @global
 */
function helpMe() {
	dialog.alert(lang.process(`LANG_HELPME_MSG`, true));
}

// ------------------------------------------------------------ RESIZE
/**
 * Resize the renderer and contained canvases.
 * @param {number} w Width in pixels.
 * @param {number} h Height in pixels.
 * @function resize
 * @global
 */
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
/**
 * Create a container div and attach the p5 canvases to it.
 * @function createCanvasWrapper
 * @global
 */
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

/**
 * Fit the canvas inside the wrapper element while maintaining aspect ratio.
 * @function containCanvasInWrapper
 * @global
 */
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
/**
 * Saves each rendered frame when capturing video output.
 * @function handleFrameCapture
 * @global
 */
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
/**
 * Keyboard handler for various shortcuts.
 * @param {KeyboardEvent} e
 * @function keyPressed
 * @global
 */
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

	// set utilBools with keys 0 through 9
	if (keyCode >= 48 && keyCode <= 57) {
		let utilInd = keyCode - 48;
		utilBools[utilInd] = !utilBools[utilInd];
	}

	// case-sensitive keys
	switch (key) {
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

	// case-insensitive keys
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
	}
}

function mousePressed() {}

function mouseReleased() {}

// differential scrolling speed with Apple trackpad & mouse
/**
 * Relative scroll velocity used when mapping mouse wheel movement.
 * @constant {number}
 * @global
 */
const relScrollVel = (isMac() ? 0.1 : 1) * 0.06;
/**
 * Handle zooming when scrolling.
 * @param {WheelEvent} event
 * @function mouseWheel
 * @global
 */
function mouseWheel(event) {
	let wheelDist = getWheelDistance(event);
	const s = exp(wheelDist * relScrollVel);
	scrollScale *= s;
	// scrollScale = constrain(scrollScale, 0.2, 5);
}

/**
 * Resize callback from p5 whenever the window size changes.
 * @function windowResized
 * @global
 */
function windowResized() {
	containCanvasInWrapper();
}

// ------------------------------------------------------------ INIT UTILS

/** @type {number} @global */
let SSID;
/**
 * Utility constant controlled with up and down arrows.
 * @type {number}
 * @global
 */
let K = 0;
/**
 * Array of boolean flags for generic usage.
 * @type {boolean[]}
 * @global
 */
let utilBools = [];
/**
 * Frame rate and duration related variables.
 * @type {number}
 * @global
 */
let FR,
        /** @type {number} @global */ duration,
        /** @type {number} @global */ nFrames;
/**
 * Offset used for noise generation.
 * @type {number}
 * @global
 */
let noiseOffs;

/**
 * Initialise global timing and seeding utilities.
 * @param {number} _duration Duration in seconds.
 * @param {number} _frameRate Frame rate.
 * @function initUtils
 * @global
 */
function initUtils(_duration, _frameRate) {
	console.log('p5Catalyst initiated as ' + Generator.name);
	console.log(
		'Visit the project: https://github.com/multitude-amsterdam/p5Catalyst'
	);

	// SSID-based seed initialisation
	SSID = generateSSID();
	SSIDHash = SSID / 1e8;
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

/**
 * Generate a pseudo random session identifier.
 * @function generateSSID
 * @returns {number}
 * @global
 */
function generateSSID() {
	return Math.floor(Math.random() * 1e8);
}
