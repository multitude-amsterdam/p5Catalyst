import p5 from 'p5';
import { CatalystGUI } from './CatalystGUI';
import type { Plugin } from '../plugins';

export type ExtensibleP5 = p5 & { [key: string]: any };
export type sketchSeedFunction = (sketch: ExtensibleP5) => void;

declare global {
	var sketch: ExtensibleP5;
	var gui: CatalystGUI;
}

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

			const {
				setup: userSetup,
				draw: userDraw,
				windowResized: userWindowResized,
				keyPressed: userKeyPressed,
			} = sketch;

			const defaultFrameRate = 30;

			sketch.isPlaying = true;

			sketch.setup = async () => {
				sketch.canvas = sketch.createCanvas(500, 500);
				sketch.createCanvasWrapper();
				sketch.containCanvasInWrapper();

				sketch.frameRate(defaultFrameRate);

				await userSetup?.(); // (user-defined)

				// 1 create GUI
				const gui = new CatalystGUI(sketch);

				// 2 plugins.preCreate(User)Gui
				userPlugins = userPlugins?.flat();
				userPlugins?.forEach(plugin =>
					plugin.preCreateGui?.(gui, sketch)
				);

				// 3 createUserGui
				createUserGui(gui, sketch);

				// 4 plugins.postCreate(User)Gui
				userPlugins?.forEach(plugin =>
					plugin.postCreateGui?.(gui, sketch)
				);

				// 5 gui finalize
				gui.finalize();

				this.gui = gui;

				globalThis.gui = gui;
				globalThis.sketch = sketch;
			};

			sketch.draw = () => {
				userDraw?.(); // (user-defined)
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
						userKeyPressed?.(event); // (user-defined)
				}
			};

			sketch.windowResized = (event: UIEvent) => {
				userWindowResized?.(event); // (user-defined)
				sketch.containCanvasInWrapper();
			};
		});
	}
}
