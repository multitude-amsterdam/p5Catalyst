
class Generator {
	static name = 'p5Catalyst Generator';
	static supportEmail = '';

	palette = [
		color('#7685F7'),
		color('#BFFB50'),
		color('#000000'),
		color('#FFFFFF'),
	];


	// ------------------------------------------------------------ CONSTRUCTOR
	constructor() {
		this.col = undefined;
	}


	// ------------------------------------------------------------ SETUP
	setup() {}


	// ------------------------------------------------------------ DRAW
	draw(doSVGToo=false) {
		this.doSVGToo = doSVGToo;

		clear();

		if (theShader !== undefined) this.drawShader();

		// floating circle
		noStroke();
		fill(this.col);
		circle(pw / 2, ph / 2 + sin(time) * 200, min(pw, ph) / 10);
	}


	// ------------------------------------------------------------ SHADER
	drawShader() {
		theShader.setUniform("resolution", [width, height]);
		theShader.setUniform("progress", progress);
		theShader.setUniform("time", time);
		theShader.setUniform("mouse", [mouseX, mouseY, mouseIsPressed ? 1.0 : 0.0]);
		theShader.setUniform("SSIDHash", SSID / 1e8);
		theShader.setUniform("utilBools", utilBools);

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
		translate(-width/2, -height/2); 
	}


	// ------------------------------------------------------------ UTILITY
	getState() {
		return {
			...this,
			// add custom parameters here
			img: undefined
		};
	}

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

	static getOutputFileName(insertion='') {
		return Generator.name.replaceAll(' ', '-') + '_' + 
			(insertion != '' ? insertion.replaceAll(' ', '-') + '_' : '') +
			pw + 'x' + ph + '_' + getTimestamp();
	}
}

