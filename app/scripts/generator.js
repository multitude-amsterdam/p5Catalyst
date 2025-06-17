
class Generator {
	static name = 'p5Catalyst';
	static supportEmail = '';

	palette = [
		color('#F1FD53'),
		color('#BFFB50'),
		color('#E95E2A'),
		color('#7685F7'),
		color('#A830F6'),
		color('#000000'),
		color('#FFFFFF'),
	];


	// ------------------------------------------------------------ CONSTRUCTOR

	constructor() {
		this.doShowImage = false;
		this.doDrawBackground = true;

		this.col = undefined;

		this.img = undefined;
		this.imageScale = 1;
		this.imagePosition = new Vec2D(0, 0);
	}



	// ------------------------------------------------------------ SETUP
	// runs after 

	setup() {}



	// ------------------------------------------------------------ DRAW
	draw(doSVGToo=false) {
		this.doSVGToo = doSVGToo;

		if (theShader !== undefined) {
			this.setShaderUniforms();
			this.drawShader();
			resetMatrix();
			translate(-width/2, -height/2);
		} else {
			clear();
		}

		if (this.doShowImage) this.drawImg();

		noStroke();
		fill(this.col);
		circle(pw / 2, ph / 2 + sin(time) * 200, min(pw, ph) / 10);
	}


	drawImg() {
		if (this.img === undefined) return;
		imageCenteredXYScale(this.img, true, this.imagePosition.x, this.imagePosition.y, this.imageScale);
	}



	// ------------------------------------------------------------ SHADER

	setShaderUniforms() {
		theShader.setUniform("resolution", [width, height]);
		theShader.setUniform("progress", progress);
		theShader.setUniform("time", time);
		theShader.setUniform("mouse", [mouseX, mouseY, mouseIsPressed ? 1.0 : 0.0]);
		theShader.setUniform("SSIDHash", SSID / 1e8);
		theShader.setUniform("utilBools", utilBools);
	}

	drawShader() {
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


