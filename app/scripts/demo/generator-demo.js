
class Generator {
	static name = 'p5Catalyst Demo';
	static supportEmail = 'aidan.wyber@multitude.nl';

	palette = [
		color('#DDA702'),
		color('#E06F71'),
		color('#1DB9AA'),
		color('#ffffff'),
	];


	// ------------------------------------------------------------ CONSTRUCTOR
	constructor() {
		this.col = undefined;

		this.doShowImage = false;
		this.img = loadImage('assets/felix.jpg', (img) => img.isLoaded = true);
		this.imageScale = 1;
		this.imagePosition = new Vec2D(0, 0);
	}


	// ------------------------------------------------------------ SETUP
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

		let nPaws = 12;
		let pawSize = height / nPaws * 0.5;
		noStroke();
		for (let i = 0; i < nPaws; i++) {
			let y = map(i / nPaws, 0, 1, -pawSize/2, height + pawSize/2);
			let x = width - (0.33 + i % 2) * pawSize * 2;
			
			if (fract(i / nPaws + time * 0.2) >= 1 / 4) {
				fill(this.col);
			} else {
				fill(255);
			}

			paw(x, y, pawSize, radians(noise(i*10) * 10 - 5));
		}

		fill(255);
		noStroke();
		textFont('Georgia');
		let ts = min(width, height) * 0.1;
		let offs = ts * 0.5;
		textSize(ts);
		textAlign(LEFT, BASELINE);
		text('Meowtrition', offs, ph - ts * 1);
		let ts2 = min(width, height) * 0.05;
		textSize(ts2);
		textAlign(LEFT, BASELINE);
		text('Good food. Great meows.', offs, ph - ts2 * 1);
	}

	paw(x, y, size, angle) {
		push();
		{
			translate(x, y);
			rotate(angle);
			scale(size / 82);

			beginShape();
			vertex(0, 0);
			bezierVertex(22, 0, 55, 40, 55, 63);
			bezierVertex(55, 86, 41, 90, 32, 90);
			bezierVertex(23, 90, 12, 83, 0, 83);
			bezierVertex(-12, 83, -23, 90, -32, 90);
			bezierVertex(-41, 90, -55, 86, -55, 63);
			bezierVertex(-55, 40, -22, 0, 0, 0);
			endShape(CLOSE);

			for (let m = -1; m <= 1; m += 2) {
				push();
				{
					translate(26 * m, -46);
					rotate(radians(10 * m));
					ellipse(0, 0, 44, 68);
				}
				pop();
				push();
				{
					translate(63 * m, -5);
					rotate(radians(35 * m));
					ellipse(0, 0, 40, 61);
				}
				pop();
			}
		}
		pop();
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


