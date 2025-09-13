import p5 from 'p5';
import type { Container, sketchFunction, State } from './types';
import type { Config, imageFileType } from './types/plugin';
import { ffmpegCreateVideo, saveToLocalFFMPEG } from './ffmpeg';
import type { SketchHook } from './types/construction';
import { getTimestamp } from './utils/time';
import type { GUIForP5 } from './gui/GUIForP5';

export function createContainer(
	userSketch: sketchFunction,
	config?: Config
): Promise<Container> {
	const state: State = {
		width: 1080,
		height: 1080,
		time: 0,
		progress: 0,
		duration: 15,
		isPlaying: true,
		isRecording: false,
	};

	return new Promise(resolve => {
		const containerSketch = async (sketch: p5) => {
			await userSketch(sketch, state);

			const userSetup = sketch.setup || (() => {});
			const userDraw = sketch.draw || (() => {});

			// TODO: add all possible p5 event functions

			let canvas: p5.Renderer,
				canvasWorkArea: p5.Element,
				canvasWrapper: p5.Element;

			let isGuiTyping = false;
			let exportStage: 'idle' | 'recording' | 'exporting' = 'idle';

			const defaultFrameRate = 30;

			sketch.setup = async () => {
				canvas = sketch.createCanvas(state.width, state.height);
				createCanvasWrapper();
				containCanvasInWrapper();

				sketch.frameRate(defaultFrameRate);
				await Promise.resolve(userSetup());

				const sketchHook: SketchHook = {
					resizeCanvas: (width: number, height: number) => {
						resizeCanvas(width, height);
					},
					copyCanvasToClipboard: () => {
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
						state.isRecording = true;
						sketch.frameCount = 0;
						console.log('Recording started.');
					},
					stopRecording: () => {
						state.isRecording = false;
						console.log('Recording ended.');
						ffmpegCreateVideo(
							state.width,
							state.height,
							sketch.getTargetFrameRate()
						);
					},
					setDuration: (newDuration: number) => {
						state.duration = newDuration;
					},
					getTargetFrameRate: () => {
						return sketch.getTargetFrameRate();
					},
					setFrameRate: (fps: number) => {
						sketch.frameRate(fps);
					},
					getExportStatus: () => {
						return exportStage;
					},
				};

				resolve({ p5Instance, state, sketchHook });
			};

			sketch.draw = () => {
				if (!state.isPlaying) sketch.frameCount--;

				const NFramesToRender = Math.floor(
					state.duration * sketch.getTargetFrameRate()
				);
				state.progress = sketch.frameCount / NFramesToRender;
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
						sketch.COVER
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
						sketch.COVER
					);
				}

				if (state.isRecording) {
					if (sketch.frameCount < NFramesToRender) {
						exportStage = 'recording';
						saveToLocalFFMPEG(canvas);
					} else {
						state.isRecording = false;
						exportStage = 'exporting';
						ffmpegCreateVideo(
							state.width,
							state.height,
							sketch.getTargetFrameRate()
						).then(() => (exportStage = 'idle'));
					}
				}
			};

			const userMousePressed = sketch.mousePressed || (() => {});
			const userMouseReleased = sketch.mouseReleased || (() => {});
			const userMouseClicked = sketch.mouseClicked || (() => {});
			const userMouseWheel = sketch.mouseWheel || (() => {});
			const userMouseDragged = sketch.mouseDragged || (() => {});
			const userDoubleClicked = sketch.doubleClicked || (() => {});
			const userKeyPressed = sketch.keyPressed || (() => {});
			const userWindowResized = sketch.windowResized || (() => {});

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

			sketch.windowResized = (event: UIEvent) => {
				userWindowResized();
				containCanvasInWrapper();
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
				canvasWorkArea = sketch.createDiv();
				canvasWrapper = sketch.createDiv();
				canvasWorkArea.id('canvas-workarea');
				canvasWrapper.id('canvas-wrapper');

				canvas.parent(canvasWrapper);
				canvasWrapper.parent(canvasWorkArea);
				canvasWorkArea.parent(sketch.select('main') as p5.Element);
			}

			function containCanvasInWrapper() {
				const canvAsp = state.width / state.height;

				const wrapperW = canvasWrapper.elt.clientWidth;
				const wrapperH = canvasWrapper.elt.clientHeight;
				const wrapperAsp = wrapperW / wrapperH;

				canvas.elt.style = '';

				canvas.elt.style.maxWidth = `1px`;
				canvas.elt.style.maxHeight = `1px`;

				canvas.elt.style.aspectRatio = canvAsp.toString();
				if (canvAsp > wrapperAsp) {
					canvas.elt.style.width = '100%';
					canvas.elt.style.maxWidth = `calc(${wrapperW}px - 2rem)`;
					canvas.elt.style.height = '';
					canvas.elt.style.maxHeight = '';
				} else {
					canvas.elt.style.width = '';
					canvas.elt.style.maxWidth = '';
					canvas.elt.style.height = '100%';
					canvas.elt.style.maxHeight = `calc(${wrapperH}px - 2rem)`;
				}
			}

			function resizeCanvas(width: number, height: number) {
				if (width < 1 || height < 1) return;
				state.width = width;
				state.height = height;

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
				fileName = fileName || 'canvas';
				fileName =
					`${fileName.replaceAll(' ', '-')}` +
					`_${state.width}x${state.height}` +
					`_${getTimestamp().base64}`;
				sketch.save(canvas, fileName + '.' + fileType.toLowerCase());
			}
		};

		const p5Instance = new p5(containerSketch);
	});
}
