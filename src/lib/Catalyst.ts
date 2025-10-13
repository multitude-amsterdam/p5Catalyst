import type {
	Plugin,
	ExtensibleP5,
	sketchSeedFunction,
	Config,
	ImageFileType,
} from './types';

import p5 from 'p5';
import { CatalystGUI } from './gui/CatalystGUI';
import { getTimestamp } from './utils';
import { saveToLocalFFMPEG, ffmpegCreateVideo } from './ffmpeg';

declare global {
	var sketch: ExtensibleP5;
	var gui: CatalystGUI;
}

export class Catalyst {
	gui?: CatalystGUI;

	#isPlaying: boolean;
	#isRecording: boolean;
	#duration: number = 10;
	#fps: number = 30;
	#animationFrameCount: number = -1;
	#exportStage: 'idle' | 'recording' | 'exporting' = 'idle';
	#progress: number = 0;
	#time: number = 0;

	constructor(
		userSketchSeed: sketchSeedFunction,
		createUserGui: (gui: CatalystGUI, sketch: ExtensibleP5) => void,
		userPlugins?: Plugin[]
	) {
		this.#isPlaying = true;
		this.#isRecording = false;
		this.setNFrames();

		globalThis.sketch = new p5(async (sketch: ExtensibleP5) => {
			sketch.catalyst = this;

			// load user properties onto sketch
			await userSketchSeed(sketch);

			// extract relevant user properties
			const {
				setup: userSetup,
				draw: userDraw,
				windowResized: userWindowResized,
				keyPressed: userKeyPressed,
			} = sketch;

			sketch.setup = async () => {
				sketch.canvas = sketch.createCanvas(500, 500);
				this.createCanvasWrapper();
				this.containCanvasInWrapper();

				sketch.frameRate(this.#fps);

				await userSetup?.();

				const config: Config = {};

				userPlugins = userPlugins?.flat();

				// plugins: beforeGuiExists
				userPlugins?.forEach(plugin =>
					plugin.beforeGuiExists?.(sketch, config)
				);

				const gui = new CatalystGUI(sketch, config);
				this.gui = gui;
				globalThis.gui = gui;
				// gui can be globally accessed from now on

				// plugins: beforeUserCreatesGui
				userPlugins?.forEach(plugin =>
					plugin.beforeUserCreatesGui?.(gui, sketch, config)
				);

				createUserGui(gui, sketch);

				// plugins: afterUserCreatesGui
				userPlugins?.forEach(plugin =>
					plugin.afterUserCreatesGui?.(gui, sketch, config)
				);

				gui.finalize();
			};

			sketch.draw = () => {
				if (!this.#isRecording && !this.#isPlaying) {
					sketch.frameCount--;
				}

				this.#progress = sketch.frameCount / this.#animationFrameCount;
				this.#time = this.#progress * this.#duration; // duration-independent time

				userDraw?.();

				if (this.#isRecording) {
					if (sketch.frameCount < this.#animationFrameCount) {
						this.#exportStage = 'recording';
						saveToLocalFFMPEG(sketch.canvas);
					} else {
						this.#isRecording = false;
						this.#exportStage = 'exporting';
						ffmpegCreateVideo(
							sketch.width,
							sketch.height,
							this.#fps
						).then(() => {
							this.#exportStage = 'idle';
						});
					}
				}
			};

			sketch.keyPressed = (event: KeyboardEvent) => {
				if (this.gui?.isTypingText) return;

				switch (event.key) {
					case ' ':
						this.#isPlaying = !this.#isPlaying;
						return;
					default:
						userKeyPressed?.(event);
				}
			};

			sketch.windowResized = (event: UIEvent) => {
				userWindowResized?.(event);
				this.containCanvasInWrapper();
			};
		});
		// sketch can be globally accessed from now on
	}

	get isPlaying() {
		return this.#isPlaying;
	}
	get isRecording() {
		return this.#isRecording;
	}
	get duration() {
		return this.#duration;
	}
	get fps() {
		return this.#fps;
	}
	get animationFrameCount() {
		return this.#animationFrameCount;
	}
	get progress() {
		return this.#progress;
	}
	get time() {
		return this.#time;
	}

	attemptDrawBackdrop() {
		if (!sketch.backdrop) return;
		sketch.image(
			sketch.backdrop,
			0,
			0,
			sketch.width,
			sketch.height,
			0,
			0,
			sketch.backdrop.width,
			sketch.backdrop.height,
			sketch.COVER
		);
	}

	attemptDrawOverlay() {
		if (!sketch.overlay) return;
		sketch.image(
			sketch.overlay,
			0,
			0,
			sketch.width,
			sketch.height,
			0,
			0,
			sketch.overlay.width,
			sketch.overlay.height,
			sketch.COVER
		);
	}

	createCanvasWrapper() {
		sketch.canvasWorkArea = sketch.createDiv();
		sketch.canvasWrapper = sketch.createDiv();
		sketch.canvasWorkArea.id('canvas-workarea');
		sketch.canvasWrapper.id('canvas-wrapper');

		sketch.canvas.parent(sketch.canvasWrapper);
		sketch.canvasWrapper.parent(sketch.canvasWorkArea);
		sketch.canvasWorkArea.parent(sketch.select('main') as p5.Element);
	}

	containCanvasInWrapper() {
		const canvAsp = sketch.width / sketch.height;

		const wrapperW = sketch.canvasWrapper.elt.clientWidth;
		const wrapperH = sketch.canvasWrapper.elt.clientHeight;
		const wrapperAsp = wrapperW / wrapperH;

		sketch.canvas.elt.style = '';

		sketch.canvas.elt.style.maxWidth = `1px`;
		sketch.canvas.elt.style.maxHeight = `1px`;

		sketch.canvas.elt.style.aspectRatio = canvAsp.toString();
		if (canvAsp > wrapperAsp) {
			sketch.canvas.elt.style.width = '100%';
			sketch.canvas.elt.style.maxWidth = `calc(${wrapperW}px - 2rem)`;
			sketch.canvas.elt.style.height = '';
			sketch.canvas.elt.style.maxHeight = '';
		} else {
			sketch.canvas.elt.style.width = '';
			sketch.canvas.elt.style.maxWidth = '';
			sketch.canvas.elt.style.height = '100%';
			sketch.canvas.elt.style.maxHeight = `calc(${wrapperH}px - 2rem)`;
		}
	}

	resizeCanvas(width: number, height: number) {
		if (width < 1 || height < 1) return;

		sketch.pixelDensity(1);
		sketch.resizeCanvas(width, height);

		this.containCanvasInWrapper();
		this.containCanvasInWrapper(); // needs a double call
	}

	/**
	 * Copy the current canvas bitmap to the system clipboard.
	 */
	copyCanvasToClipboard() {
		sketch.canvas.elt.toBlob((blob: Blob) => {
			navigator.clipboard.write([
				new ClipboardItem({ 'image/png': blob }),
			]);
		});
	}

	exportImage(fileType: ImageFileType, fileName?: string) {
		fileName = fileName || document.title || 'canvas';
		fileName =
			`${fileName.replaceAll(' ', '-')}` +
			`_${sketch.width}x${sketch.height}` +
			`_${getTimestamp().base64}`;
		sketch.save(sketch.canvas, fileName + '.' + fileType.toLowerCase());
	}

	/**
	 * @param duration Set animiation duration in seconds.
	 */
	setDuration(duration: number) {
		this.#duration = duration;
		this.setNFrames();
	}

	setFrameRate(fps: number) {
		this.#fps = fps;
		this.setNFrames();

		sketch?.frameRate(fps);
	}

	setNFrames(duration?: number, fps?: number) {
		duration = duration || this.#duration;
		fps = fps || this.#fps;
		this.#animationFrameCount = Math.round(duration * fps);
	}

	startRecording() {
		this.#isRecording = true;
		this.#isPlaying = true;
		sketch.frameCount = 0;
		console.log('Recording started.');
	}

	stopRecording() {
		this.#isRecording = false;
		this.#isPlaying = false;
		console.log('Recording ended.');
		ffmpegCreateVideo(sketch.width, sketch.height, this.#fps, () => {
			this.#exportStage = 'idle';
		});
	}

	cancelRecording() {
		this.#isRecording = false;
		this.#isPlaying = false;
	}

	get exportStage() {
		return this.#exportStage;
	}
}
