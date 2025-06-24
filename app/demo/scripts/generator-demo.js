
class Generator {
	static name = 'p5Catalyst Demo';
	static supportEmail = 'aidan.wyber@multitude.nl';

	palette = [
		color('#F2EDEB'),
		color('#120D09'),
		color('#DDA702'),
	];
	white = this.palette.at(0);


	// ------------------------------------------------------------ CONSTRUCTOR
	constructor() {
		this.col = undefined;

		this.doShowImage = true;
		this.img = loadImage('demo/assets/felix.jpg', (img) => img.isLoaded = true);
		this.imageScale = 1;
		this.imagePosition = new Vec2D(0, 0);

		this.logoScale = 1;
		this.logo = loadImage('demo/assets/meowtrition.png');

		this.cat = {
			steerPos: new Vec2D(),
			shoulderT: 0.35,
			shoulderPos: new Vec2D(),
			hipPos: new Vec2D(),
			dir: new Vec2D(0, 1),
			speed: 0.1,
			paws: [new Vec2D(), new Vec2D(), new Vec2D(), new Vec2D()],
			shoulderHipLengthFac: 0.6,
			pawSizeFac: 0.1,
			minPawDistFac : 0.35,
			pawStepAngle: PI * 0.15,
			scaleAll: 1,
		};
	}


	// ------------------------------------------------------------ SETUP
	setup() {}


	// ------------------------------------------------------------ UPDATE
	update() {
		const minWH = min(width, height);

		let newSteerPos = new Vec2D(
			simplexNoise(time * this.cat.speed, PHI),
			simplexNoise(time * this.cat.speed + TAU * 10, PHI)
			)
			.scale(width * 0.5, height * 0.5)
			.add(width * 0.5, height * 0.5);

		this.cat.dir = newSteerPos.sub(this.cat.steerPos).getNormalized();
		this.cat.steerPos = newSteerPos;

		this.cat.shoulderPos = this.cat.steerPos.add(this.cat.dir.scale(
			this.cat.shoulderHipLengthFac * this.cat.shoulderT * minWH * this.cat.scaleAll));

		this.cat.hipPos = this.cat.shoulderPos.sub(this.cat.dir.scale(
			this.cat.shoulderHipLengthFac * minWH * this.cat.scaleAll));

		const isPawValid = (index) => {
			return this.cat.paws[index].distanceTo(
				index < 2 ? this.cat.shoulderPos : this.cat.hipPos
			) <= this.cat.minPawDistFac * minWH * this.cat.scaleAll;
		};
		if (!isPawValid(0)) {
			this.cat.paws[0] = this.cat.shoulderPos.add(
				this.cat.dir
					.getRotated(-this.cat.pawStepAngle)
					.scale(this.cat.minPawDistFac * minWH * this.cat.scaleAll)
			);
			this.cat.paws[0].age = 0;
			this.cat.paws[0].dir = this.cat.dir.copy();
		}
		if (!isPawValid(1)) {
			this.cat.paws[1] = this.cat.shoulderPos.add(
				this.cat.dir
					.getRotated(+this.cat.pawStepAngle)
					.scale(this.cat.minPawDistFac * minWH * this.cat.scaleAll)
			);
			this.cat.paws[1].age = 0;
			this.cat.paws[1].dir = this.cat.dir.copy();
		}
		if (!isPawValid(2)) {
			this.cat.paws[2] = this.cat.hipPos.add(
				this.cat.dir
					.getRotated(-this.cat.pawStepAngle)
					.scale(this.cat.minPawDistFac * minWH * this.cat.scaleAll)
			);
			this.cat.paws[2].age = 0;
			this.cat.paws[2].dir = this.cat.dir.copy();
		}
		if (!isPawValid(3)) {
			this.cat.paws[3] = this.cat.hipPos.add(
				this.cat.dir
					.getRotated(+this.cat.pawStepAngle)
					.scale(this.cat.minPawDistFac * minWH * this.cat.scaleAll)
			);
			this.cat.paws[3].age = 0;
			this.cat.paws[3].dir = this.cat.dir.copy();
		}

		for (let paw of this.cat.paws) {
			// add property to Vec2D
			if (paw.age === undefined) paw.age = 0;
			else paw.age += 0.02;
		}
	}


	// ------------------------------------------------------------ DRAW
	draw(doSVGToo=false) {
		this.doSVGToo = doSVGToo;
		clear();
		if (theShader !== undefined) this.drawShader();

		if (this.doShowImage) this.drawImg();

		this.update();

		// // debug
		// fill('red');
		// circle(this.cat.steerPos.x, this.cat.steerPos.y, 50);
		// circle(this.cat.shoulderPos.x, this.cat.shoulderPos.y, 30);
		// circle(this.cat.hipPos.x, this.cat.hipPos.y, 15);
		// circle(this.cat.paws[0].x, this.cat.paws[0].y, 5);
		// circle(this.cat.paws[1].x, this.cat.paws[1].y, 5);
		// circle(this.cat.paws[2].x, this.cat.paws[2].y, 5);
		// circle(this.cat.paws[3].x, this.cat.paws[3].y, 5);

		const minWH = min(width, height);
		const drawPaw = (paw) => {
			const pawAngle = paw.dir ? paw.dir.heading() + HALF_PI : 0;
			const t = constrain(paw.age, 0, 1);
			this.paw(paw.x, paw.y, 
				this.cat.pawSizeFac * minWH * this.cat.scaleAll, pawAngle, t);
		};
		noStroke();
		fill(this.col);
		drawPaw(this.cat.paws[0]);
		drawPaw(this.cat.paws[1]);
		drawPaw(this.cat.paws[2]);
		drawPaw(this.cat.paws[3]);

		push();
		{
			tint(this.white);
			const logoScale = this.logoScale * width / this.logo.width * 0.5;
			const lw = this.logo.width * logoScale;
			const lh = this.logo.height * logoScale;
			const loffs = lh / 4;
			image(this.logo, loffs, height - loffs - lh, lw, lh);
		}
		pop();

	}

	paw(x, y, size, angle, t) {
		const tToe1 = nmc(PI * nmc(PI * constrain(t * 10 - 0.5, 0, 1)));
		const tToe2 = nmc(PI * nmc(PI * constrain(t * 10 - 1, 0, 1)));
		const tPalm = nmc(PI * nmc(PI * constrain(t * 10 - 1.5, 0, 1)));
		push();
		{
			translate(x, y);
			rotate(angle);
			scale(size / 82);

			push();
			{
				translate(0, 45);
				scale(tPalm);
				translate(0, -45);
				beginShape();
				vertex(0, 0);
				bezierVertex(22, 0, 55, 40, 55, 63);
				bezierVertex(55, 86, 41, 90, 32, 90);
				bezierVertex(23, 90, 12, 83, 0, 83);
				bezierVertex(-12, 83, -23, 90, -32, 90);
				bezierVertex(-41, 90, -55, 86, -55, 63);
				bezierVertex(-55, 40, -22, 0, 0, 0);
				endShape(CLOSE);
			}
			pop();

			for (let mirror = -1; mirror <= 1; mirror += 2) {
				push();
				{
					translate(26 * mirror, -46);
					rotate(radians(10 * mirror));
					ellipse(0, 0, 44 * tToe1, 68 * tToe1);
				}
				pop();
				push();
				{
					translate(63 * mirror, -5);
					rotate(radians(35 * mirror));
					ellipse(0, 0, 40 * tToe2, 61 * tToe2);
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
			img: undefined,
			logo: undefined
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


