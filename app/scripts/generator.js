/**
 * @fileoverview Default generator used by the p5Catalyst template.
 *
 * This module exposes the {@link Generator} class which encapsulates the
 * drawing logic for a sketch. It depends on a number of globals that are
 * provided elsewhere in the application (such as {@code pw}, {@code ph},
 * {@code time}, {@code progress} and {@code theShader}).
 */

/**
 * @class
 * @description Main generator responsible for drawing the sketch and
 * serialising its state.
 */
class Generator {
	/**
	 * @static
	 * @type {string}
	 * @description Name of the generator, used in the GUI.
	 */
	static name = 'p5Catalyst Generator';

	/**
	 * @static
	 * @type {string}
	 * @description Email address shown in the GUI for support
	 */
	static supportEmail = '';

	/**
	 * Default colour palette used by the example sketch.
	 * @type {p5.Color[]}
	 */
	palette = [
		color('#7685F7'),
		color('#BFFB50'),
		color('#000000'),
		color('#FFFFFF'),
	];

	// ------------------------------------------------------------ CONSTRUCTOR
	/**
	 * Creates a new Generator instance.
	 * The colour used for the floating circle is initialised here.
	 */
	constructor() {
		this.col = undefined;
	}

	// ------------------------------------------------------------ SETUP
	/**
	 * Called once from {@link setup} in `sketch.js` to prepare the sketch.
	 * Extend this method in your own generator to initialise resources.
	 */
	setup() {}

	// ------------------------------------------------------------ DRAW
	/**
	 * Main drawing routine called from {@link draw} in `sketch.js`.
	 *
	 * @param {boolean} [doSVGToo=false] when true an off screen SVG canvas
	 * is also rendered.
	 */
	draw(doSVGToo = false) {
		this.doSVGToo = doSVGToo;
		clear();
		if (theShader !== undefined) this.drawShader();

		// floating circle
		noStroke();
		fill(this.col);
		circle(pw / 2, ph / 2 + sin(time) * 200, min(pw, ph) / 10);
	}

	// ------------------------------------------------------------ SHADER
	/**
	 * Draws the active shader using the global uniforms.
	 * This is called automatically from {@link draw} when a shader is
	 * loaded.
	 */
	drawShader() {
		theShader.setUniform('resolution', [width, height]);
		theShader.setUniform('progress', progress);
		theShader.setUniform('time', time);
		theShader.setUniform('mouse', [
			mouseX,
			mouseY,
			mouseIsPressed ? 1.0 : 0.0,
		]);
		theShader.setUniform('SSIDHash', SSID / 1e8);
		theShader.setUniform('utilBools', utilBools);

		resetMatrix();
		push();
		{
			resetMatrix();
			shader(theShader);
			rectMode(CENTER);
			noStroke();
			blendMode(BLEND);
			rect(0, 0, width, height);
		}
		pop();
		// ensures 0–width and 0–height range in WEBGL mode
		translate(-width / 2, -height / 2);
	}

	// ------------------------------------------------------------ UTILITY
	/**
	 * Serialises the current generator state so it can be stored in a
	 * {@link ChangeSet}.
	 * @returns {Object}
	 */
	getState() {
		return {
			...this,
			// add custom parameters here
			img: undefined,
		};
	}

	/**
	 * Restores a previously serialised state.
	 * @param {Object} state data produced by {@link getState}
	 */
	restoreState(state) {
		Object.assign(this, state);

		for (let propKey of Object.keys(this)) {
			this[propKey] = restoreSerializedP5Color(this[propKey]);
			this[propKey] = restoreSerializedVec2D(this[propKey]);
		}

		let i = 0;
		for (let col of this.palette) {
			this.palette[i++] = restoreSerializedP5Color(col);
		}
	}

	/**
	 * Utility for building an output file name including resolution and
	 * a timestamp.
	 * @param {string} [insertion=''] optional text inserted into the name
	 * @returns {string}
	 */
	static getOutputFileName(insertion = '') {
		return (
			Generator.name.replaceAll(' ', '-') +
			'_' +
			(insertion != '' ? insertion.replaceAll(' ', '-') + '_' : '') +
			pw +
			'x' +
			ph +
			'_' +
			getTimestamp()
		);
	}
}
