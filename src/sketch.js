export const sketchSeed = async sketch => {
	sketch.setup = async () => {
		sketch.circleDiameter = 0.5;
		sketch.circleColor = sketch.color(0);
		sketch.bgColor = sketch.color(0);
		sketch.nBgElements = 5;

		sketch.noStroke();
	};

	sketch.draw = () => {
		sketch.clear();

		sketch.attemptDrawBackdrop();

		sketch.fill(sketch.bgColor);
		const sx = sketch.width / sketch.nBgElements;
		const sy = sketch.height / sketch.nBgElements;
		for (let x = 0; x < sketch.nBgElements; x++) {
			for (let y = 0; y < sketch.nBgElements; y++) {
				sketch.ellipse((x + 0.5) * sx, (y + 0.5) * sy, sx, sy);
			}
		}

		sketch.fill(sketch.circleColor);
		const diam =
			sketch.width *
			sketch.lerp(1 / sketch.nBgElements, 1, sketch.circleDiameter);
		const amp = (sketch.height - diam) / 2;
		sketch.circle(
			sketch.width / 2,
			sketch.height / 2 +
				sketch.sin(sketch.progress * sketch.TAU * 2) * amp,
			diam
		);

		sketch.attemptDrawOverlay();
	};
};
