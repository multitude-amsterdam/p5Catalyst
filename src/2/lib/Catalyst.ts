import p5 from 'p5';
import { CatalystGUI } from './CatalystGUI';
import type { Plugin } from '../plugins';

export type ExtensibleP5 = p5 & { [key: string]: any };
export type sketchSeedFunction = (sketch: ExtensibleP5) => void;

export class Catalyst {
	sketch: ExtensibleP5;
	gui?: CatalystGUI;

	constructor(
		userSketchSeed: sketchSeedFunction,
		createUserGui: (gui: CatalystGUI, sketch: ExtensibleP5) => void,
		userPlugins?: Plugin[]
	) {
		this.sketch = new p5(async (sketch: ExtensibleP5) => {
			await userSketchSeed(sketch);

			const defaultFrameRate = 30;
			sketch.isPlaying = true;

			sketch.setup = async () => {
				sketch.canvas = sketch.createCanvas(
					sketch.width,
					sketch.height
				);
				sketch.createCanvasWrapper();
				sketch.containCanvasInWrapper();

				sketch.frameRate(defaultFrameRate);

				await sketch.setup?.(); // (user-defined)

				// 1 create GUI
				const gui = new CatalystGUI(sketch);

				// 2 plugin preCreateGui
				userPlugins = userPlugins?.flat();
				userPlugins?.forEach(plugin =>
					plugin.preCreateGui?.(gui, sketch)
				);

				// 3 createUserGui
				createUserGui(gui, sketch);

				// 4 plugin preCreateGui
				userPlugins?.forEach(plugin =>
					plugin.postCreateGui?.(gui, sketch)
				);

				// 5 gui finalize
				gui.finalize();
				this.gui = gui;
			};

			sketch.draw = async () => {
				sketch.draw?.(); // (user-defined)
			};

			sketch.createCanvasWrapper = () => {};
			sketch.containCanvasInWrapper = () => {};

			sketch.keyPressed = (event: KeyboardEvent) => {
				if (this.gui?.isTyping) return;

				switch (event.key) {
					case ' ':
						sketch.isPlaying = !sketch.isPlaying;
						return;
					default:
						sketch.keyPressed?.(event); // (user-defined)
				}
			};

			sketch.windowResized = (event: UIEvent) => {
				sketch.windowResized?.(event); // (user-defined)
				sketch.containCanvasInWrapper();
			};
		});
	}

	// createMasterSketchSeed(
	// 	userSketchSeed: sketchSeedFunction
	// ): sketchSeedFunction {
	// 	return async (sketch: ExtensibleP5) => {
	// 		await userSketchSeed(sketch);

	// 		const defaultFrameRate = 30;
	// 		sketch.isPlaying = true;

	// 		sketch.setup = async () => {
	// 			sketch.canvas = sketch.createCanvas(
	// 				sketch.width,
	// 				sketch.height
	// 			);
	// 			sketch.createCanvasWrapper();
	// 			sketch.containCanvasInWrapper();

	// 			sketch.frameRate(defaultFrameRate);

	// 			await sketch.setup?.(); // (user-defined)

	// 			this.gui = new CatalystGUI(sketch);
	// 			userGUI(this.gui, sketch);
	// 		};

	// 		sketch.draw = async () => {
	// 			sketch.draw?.(); // (user-defined)
	// 		};

	// 		sketch.createCanvasWrapper = () => {};
	// 		sketch.containCanvasInWrapper = () => {};

	// 		sketch.keyPressed = (event: KeyboardEvent) => {
	// 			if (this.gui?.isTyping) return;

	// 			switch (event.key) {
	// 				case ' ':
	// 					sketch.isPlaying = !sketch.isPlaying;
	// 					return;
	// 				default:
	// 					sketch.keyPressed?.(event); // (user-defined)
	// 			}
	// 		};

	// 		sketch.windowResized = (event: UIEvent) => {
	// 			sketch.windowResized?.(event); // (user-defined)
	// 			sketch.containCanvasInWrapper();
	// 		};
	// 	};
	// }
}
