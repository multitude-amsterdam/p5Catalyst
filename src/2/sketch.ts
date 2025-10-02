import type { ExtensibleP5 } from './lib/types';

export const sketchSeedFunction = async (sketch: ExtensibleP5) => {
	sketch.q = 13;

	sketch.setup = async () => {};

	sketch.draw = () => {
		sketch.background(128);
		sketch.noStroke();
		sketch.fill(0);
		sketch.circle(
			sketch.width / 2 +
				(sketch.cos(sketch.millis() / 300) * (sketch.width - 100)) / 2,
			sketch.height / 2,
			100
		);
	};
};
