import p5 from 'p5';
import type { Container, SketchFunction, State } from './types';
import type { imageFileType } from './types/plugin';
import type { sketchHook } from './types/construction';

export const createContainer = (
	userSketch: SketchFunction
): Promise<Container> => {
	const state: State = { width: 1080, height: 1080 };
	const sketchHook: sketchHook = {
		resize: () => {},
		canvasToClipboard: () => {},
		exportImage: () => {},
		setTyping: () => {},
	};

	return new Promise(resolve => {
		const containerSketch = async (sketch: p5) => {
			await userSketch(sketch, state);

			const originalSetup = sketch.setup || (() => {});
			const originalDraw = sketch.draw || (() => {});
			const originalMouseMoved = sketch.mouseMoved || (() => {});
			const originalKeyPressed =
				sketch.keyPressed || ((event: KeyboardEvent) => {});

			let canvas: p5.Renderer,
				canvasWrapper: p5.Element,
				canvasScale: number;

			let GuiTyping = false;

			sketch.setup = async () => {
				canvas = sketch.createCanvas(state.width, state.height);
				createCanvasWrapper();
				containCanvasInWrapper();
				await Promise.resolve(originalSetup());
				sketchHook.resize = (width: number, height: number) => {
					resizeCatalyst(width, height);
				};
				sketchHook.canvasToClipboard = () => {
					copyCanvasToClipboard();
				};
				sketchHook.exportImage = (
					fileType: imageFileType,
					fileName?: string
				) => {
					exportImage(fileType, fileName);
				};
				sketchHook.setTyping = (currentlyTyping: boolean) => {
					setTyping(currentlyTyping);
				};

				resolve({
					p5Instance,
					state,
					sketchHook,
				});
			};

			sketch.draw = () => {
				originalDraw();
			};

			sketch.mouseMoved = () => {
				originalMouseMoved();
			};

			sketch.keyPressed = (event: KeyboardEvent) => {
				if (GuiTyping) return;
				originalKeyPressed(event);
			};

			function setTyping(currentlyTyping: boolean) {
				GuiTyping = currentlyTyping;
			}

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

			function resizeCatalyst(width: number, height: number) {
				if (width < 1 || height < 1) return;
				state.width = width;
				state.height = height;

				console.log(`Resizing to: ${width} x ${height}...`);
				sketch.pixelDensity(1);
				sketch.resizeCanvas(width, height);

				containCanvasInWrapper();
				containCanvasInWrapper(); // needs a double call
			}

			/**
			 * Copy the current canvas bitmap to the system clipboard.
			 */
			function copyCanvasToClipboard() {
				canvas.elt.toBlob((blob: Blob) => {
					navigator.clipboard.write([
						new ClipboardItem({ 'image/png': blob }),
					]);
				});
			}

			function exportImage(fileType: imageFileType, fileName?: string) {
				sketch.save(canvas, (fileName || 'canvas') + '.' + fileType);
			}
		};

		const p5Instance = new p5(containerSketch);
	});
};
