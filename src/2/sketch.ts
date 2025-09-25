import type { ExtensibleP5 } from './lib/Catalyst';
import type { CatalystGUI } from './lib/CatalystGUI';

export const sketchSeedFunction = async (sketch: ExtensibleP5) => {
	// more info on instance mode:
	// https://github.com/processing/p5.js/wiki/Global-and-instance-mode

	sketch.setup = async () => {
		sketch.frameRate(3);
		sketch.q = 13;
	};

	sketch.draw = () => {
		sketch.clear();
		sketch.circle(
			sketch.width / 2 + ((sketch.frameCount % 5) - 2) * 100,
			sketch.height / 2,
			100
		);
	};
};
