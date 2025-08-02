import p5 from 'p5';
import type { State } from './types/state_type';

export const createContainer = (
	userSketch: (
		sketch: p5,
		state: any
	) => Promise<{ state?: any }> | { state?: any } | void
): { p5Instance: p5; state?: any } => {
	const state: State = { width: 1, height: 1 };
	const containerSketch = async (sketch: p5) => {
		await userSketch(sketch, state);

		const originalSetup = sketch.setup || (() => {});
		const originalDraw = sketch.draw || (() => {});
		const originalMouseMoved = sketch.mouseMoved || (() => {});

		let canvas: p5.Renderer, canvasWrapper: p5.Element, canvasScale: number;

		sketch.setup = async () => {
			canvas = sketch.createCanvas(1, 1);
			createCanvasWrapper();
			containCanvasInWrapper();
			resize(1920, 1080);
			await Promise.resolve(originalSetup());
		};

		sketch.draw = () => {
			originalDraw();
		};

		sketch.mouseMoved = () => {
			originalMouseMoved();
		};

		function createCanvasWrapper() {
			canvasWrapper = sketch.createDiv();
			canvasWrapper.id('canvas-workarea');
			canvas.parent(canvasWrapper);
			document.querySelector('main')?.append(canvasWrapper.elt);
		}

		function containCanvasInWrapper() {
			const canvAsp = state.width / state.height;

			const wrapperW = canvasWrapper.elt.clientWidth;
			const wrapperH = canvasWrapper.elt.clientHeight;
			const wrapperAsp = wrapperW / wrapperH;

			canvas.elt.style = '';
			if (canvAsp > wrapperAsp) {
				canvas.elt.style.height = '';
				canvas.elt.style.width = '100%';
			} else {
				canvas.elt.style.width = '';
				canvas.elt.style.height = 'calc(100vh - 2rem)';
			}

			canvasScale = sketch.sqrt(
				(state.width * state.height) / (1920 * 1080)
			);
		}

		function resize(width: number, height: number) {
			if (width == state.width && height == state.height) return;
			if (width < 1 || height < 1) return;

			state.width = width;
			state.height = height;

			sketch.print(`Resizing to: ${width} x ${height}...`);
			sketch.pixelDensity(1);
			sketch.resizeCanvas(state.width, state.height);

			containCanvasInWrapper();
			containCanvasInWrapper(); // needs a double call
		}
	};

	const p5Instance = new p5(containerSketch);
	return { p5Instance, state };
};
