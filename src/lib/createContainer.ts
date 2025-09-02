import p5 from 'p5';
import type { Container, SketchFunction, State } from './types';
import type { Config, imageFileType } from './types/plugin';
import { ffmpegCreateMP4, saveToLocalFFMPEG } from './ffmpeg';

export const createContainer = (
	userSketch: SketchFunction,
	config?: Config
): Promise<Container> => {
	const state: State = {
		width: 1080,
		height: 1080,
		time: 0,
		progress: 0,
		isPlaying: true,
	};

	return new Promise(resolve => {
		const containerSketch = async (sketch: p5) => {
			await userSketch(sketch, state);

			const userSetup = sketch.setup || (() => {});
			const userDraw = sketch.draw || (() => {});
			const userMousePressed = sketch.mousePressed || (() => {});
			const userMouseReleased = sketch.mouseReleased || (() => {});
			const userMouseClicked = sketch.mouseClicked || (() => {});
			const userMouseWheel = sketch.mouseWheel || (() => {});
			const userMouseDragged = sketch.mouseDragged || (() => {});
			const userDoubleClicked = sketch.doubleClicked || (() => {});
			const userKeyPressed =
				sketch.keyPressed || ((event: KeyboardEvent) => {});
			// TODO: add all possible p5 event functions

			let canvas: p5.Renderer, canvasWrapper: p5.Element;

			let isGuiTyping = false;
			let isRecording = false;

			let duration = 20; //seconds
			let fps = 60;
			let nFramesToRender = Math.floor(duration * fps);

			sketch.setup = async () => {
				canvas = sketch.createCanvas(state.width, state.height);
				createCanvasWrapper();
				containCanvasInWrapper();

				await Promise.resolve(userSetup());

				const sketchHook = {
					resize: (width: number, height: number) => {
						resizeCatalyst(width, height);
					},
					canvasToClipboard: () => {
						copyCanvasToClipboard();
					},
					exportImage: (
						fileType: imageFileType,
						fileName?: string
					) => {
						exportImage(fileType, fileName);
					},
					setTyping: (currentlyTyping: boolean) => {
						setTyping(currentlyTyping);
					},
					startRecording: () => {
						isRecording = true;
						nFramesToRender = Math.floor(
							duration * sketch.getTargetFrameRate()
						);
						sketch.frameCount = 0;
						state.progress = 0;
						console.log('recording started here!');
						console.log(duration, nFramesToRender, state.progress);
					},
					stopRecording: () => {
						isRecording = false;
						ffmpegCreateMP4(
							state.width,
							state.height,
							sketch.getTargetFrameRate()
						);
					},
					setDuration: (newDuration: number) => {
						duration = newDuration;
					},
					setFrameRate: (frameRate: number) => {
						sketch.frameRate(frameRate);
					},
				};

				resolve({ p5Instance, state, sketchHook });
			};

			sketch.draw = () => {
				if (!state.isPlaying) {
					sketch.frameCount--;
				}

				state.progress = sketch.frameCount / nFramesToRender;
				state.time = sketch.frameCount / sketch.getTargetFrameRate();

				if (config?.clearBackground) sketch.clear();

				if (state.backdrop) {
					sketch.image(
						state.backdrop,
						0,
						0,
						state.width,
						state.height,
						0,
						0,
						state.backdrop.width,
						state.backdrop.height,
						sketch.CONTAIN
					);
				}

				userDraw();

				if (state.overlay) {
					sketch.image(
						state.overlay,
						0,
						0,
						state.width,
						state.height,
						0,
						0,
						state.overlay.width,
						state.overlay.height,
						sketch.CONTAIN
					);
				}

				if (isRecording) {
					saveToLocalFFMPEG(canvas);
					if (state.progress >= 1) {
						isRecording = false;
						ffmpegCreateMP4(
							state.width,
							state.height,
							sketch.getTargetFrameRate()
						);
					}
				}
			};

			sketch.mousePressed = () => {
				userMousePressed();
			};
			sketch.mouseReleased = () => {
				userMouseReleased();
			};
			sketch.mouseClicked = () => {
				userMouseClicked();
			};
			sketch.mouseWheel = () => {
				userMouseWheel();
			};
			sketch.mouseDragged = () => {
				userMouseDragged();
			};
			sketch.doubleClicked = () => {
				userDoubleClicked();
			};

			sketch.keyPressed = (event: KeyboardEvent) => {
				if (isGuiTyping) return;

				switch (event.key) {
					case ' ':
						state.isPlaying = !state.isPlaying;
						return;
					default:
						userKeyPressed(event);
				}
			};

			function setTyping(isCurrentlyTyping: boolean) {
				isGuiTyping = isCurrentlyTyping;
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
