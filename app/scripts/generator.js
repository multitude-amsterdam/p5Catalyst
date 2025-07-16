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
