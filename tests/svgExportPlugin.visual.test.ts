import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCanvas, loadImage } from 'canvas';
import p5 from 'p5';

vi.mock('../src/lib/gui/components/groups/Group', () => ({
	ROW: 'row',
}));

import { svgExportPlugin } from '../src/lib/plugins/svgExportPlugin';
import { svgImportPlugin } from '../src/lib/plugins/svgImportPlugin';

type PathCommand =
	| { type: 'moveTo'; args: [number, number] }
	| { type: 'lineTo'; args: [number, number] }
	| { type: 'closePath'; args: [] }
	| { type: 'arc'; args: [number, number, number, number, number, boolean?] }
	| {
			type: 'ellipse';
			args: [
				number,
				number,
				number,
				number,
				number,
				number,
				number,
				boolean?,
			];
	  }
	| { type: 'quadraticCurveTo'; args: [number, number, number, number] }
	| {
			type: 'bezierCurveTo';
			args: [number, number, number, number, number, number];
	  }
	| { type: 'rect'; args: [number, number, number, number] }
	| { type: 'roundRect'; args: [number, number, number, number, number[]] };

class Path2DPolyfill {
	commands: PathCommand[] = [];

	moveTo(x: number, y: number) {
		this.commands.push({ type: 'moveTo', args: [x, y] });
	}

	lineTo(x: number, y: number) {
		this.commands.push({ type: 'lineTo', args: [x, y] });
	}

	closePath() {
		this.commands.push({ type: 'closePath', args: [] });
	}

	arc(
		x: number,
		y: number,
		radius: number,
		startAngle: number,
		endAngle: number,
		counterclockwise?: boolean
	) {
		this.commands.push({
			type: 'arc',
			args: [x, y, radius, startAngle, endAngle, counterclockwise],
		});
	}

	ellipse(
		x: number,
		y: number,
		radiusX: number,
		radiusY: number,
		rotation: number,
		startAngle: number,
		endAngle: number,
		counterclockwise?: boolean
	) {
		this.commands.push({
			type: 'ellipse',
			args: [
				x,
				y,
				radiusX,
				radiusY,
				rotation,
				startAngle,
				endAngle,
				counterclockwise,
			],
		});
	}

	quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {
		this.commands.push({
			type: 'quadraticCurveTo',
			args: [cpx, cpy, x, y],
		});
	}

	bezierCurveTo(
		cp1x: number,
		cp1y: number,
		cp2x: number,
		cp2y: number,
		x: number,
		y: number
	) {
		this.commands.push({
			type: 'bezierCurveTo',
			args: [cp1x, cp1y, cp2x, cp2y, x, y],
		});
	}

	rect(x: number, y: number, width: number, height: number) {
		this.commands.push({ type: 'rect', args: [x, y, width, height] });
	}

	roundRect(
		x: number,
		y: number,
		width: number,
		height: number,
		radii: number | number[]
	) {
		const normalizedRadii = Array.isArray(radii) ? radii : [radii];
		this.commands.push({
			type: 'roundRect',
			args: [x, y, width, height, normalizedRadii],
		});
	}

	addPath(path: Path2DPolyfill) {
		this.commands.push(...path.commands);
	}
}

function installPath2DPolyfill() {
	if (typeof globalThis.Path2D !== 'undefined') return;
	const probeCanvas = document.createElement('canvas');
	const probeContext = probeCanvas.getContext('2d');
	const contextCtor =
		probeContext?.constructor ||
		window.CanvasRenderingContext2D ||
		(globalThis as any).CanvasRenderingContext2D;
	if (!contextCtor) {
		throw new Error(
			'CanvasRenderingContext2D is unavailable in this test environment.'
		);
	}

	const originalFill = contextCtor.prototype.fill;
	const originalStroke = contextCtor.prototype.stroke;
	const originalClip = contextCtor.prototype.clip;

	const replayPath = (
		context: CanvasRenderingContext2D,
		path: Path2DPolyfill
	) => {
		context.beginPath();
		for (const command of path.commands) {
			switch (command.type) {
				case 'moveTo':
					context.moveTo(...command.args);
					break;
				case 'lineTo':
					context.lineTo(...command.args);
					break;
				case 'closePath':
					context.closePath();
					break;
				case 'arc':
					context.arc(...command.args);
					break;
				case 'ellipse':
					context.ellipse(...command.args);
					break;
				case 'quadraticCurveTo':
					context.quadraticCurveTo(...command.args);
					break;
				case 'bezierCurveTo':
					context.bezierCurveTo(...command.args);
					break;
				case 'rect':
					context.rect(...command.args);
					break;
				case 'roundRect':
					if (typeof context.roundRect === 'function') {
						context.roundRect(...command.args);
						break;
					}
					context.rect(
						command.args[0],
						command.args[1],
						command.args[2],
						command.args[3]
					);
					break;
			}
		}
	};

	contextCtor.prototype.fill = function (path?: CanvasFillRule | Path2D) {
		if (path instanceof Path2DPolyfill) {
			replayPath(this, path);
			return originalFill.call(this);
		}
		return originalFill.call(this, path as CanvasFillRule);
	};

	contextCtor.prototype.stroke = function (path?: Path2D) {
		if (path instanceof Path2DPolyfill) {
			replayPath(this, path);
			return originalStroke.call(this);
		}
		return originalStroke.call(this, path as Path2D);
	};

	contextCtor.prototype.clip = function (
		path?: Path2D,
		fillRule?: CanvasFillRule
	) {
		if (path instanceof Path2DPolyfill) {
			replayPath(this, path);
			return originalClip.call(this, fillRule);
		}
		return originalClip.call(this, path as Path2D, fillRule);
	};

	(globalThis as any).Path2D = Path2DPolyfill;
	(window as any).Path2D = Path2DPolyfill;
}

function convertCssColor4RgbFunctionToLegacyRgba(style: string): string {
	const match = style.match(/^rgba?\((.+)\)$/i);
	if (!match) return style;

	const body = match[1].trim();
	if (body.includes(',')) return style;

	const [rgbPart, alphaPart] = body.split('/').map(part => part.trim());
	const components = rgbPart.split(/\s+/).filter(Boolean);
	if (components.length !== 3) return style;

	const rgb = components.map(component => {
		if (component.endsWith('%')) {
			const percent = Number.parseFloat(component.slice(0, -1));
			return Math.max(
				0,
				Math.min(255, Math.round((percent / 100) * 255))
			);
		}

		const value = Number.parseFloat(component);
		if (Number.isNaN(value)) return NaN;
		return Math.max(0, Math.min(255, Math.round(value)));
	});
	if (rgb.some(value => Number.isNaN(value))) return style;

	let alpha = 1;
	if (alphaPart) {
		alpha =
			alphaPart.endsWith('%') ?
				Number.parseFloat(alphaPart.slice(0, -1)) / 100
			:	Number.parseFloat(alphaPart);
		if (Number.isNaN(alpha)) return style;
		alpha = Math.max(0, Math.min(1, alpha));
	}

	return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

function getPrototypePropertyDescriptor(
	value: object,
	propertyName: string
): PropertyDescriptor | undefined {
	let prototype: object | null = value;
	while (prototype) {
		const descriptor = Object.getOwnPropertyDescriptor(
			prototype,
			propertyName
		);
		if (descriptor) return descriptor;
		prototype = Object.getPrototypeOf(prototype);
	}
	return undefined;
}

function installHeadlessCanvasColorStyleShim() {
	const probeContext = document.createElement('canvas').getContext('2d');
	if (!probeContext) {
		throw new Error(
			'CanvasRenderingContext2D is unavailable in this test environment.'
		);
	}

	const contextPrototype = probeContext.constructor
		.prototype as CanvasRenderingContext2D;
	const shimFlag = '__p5CatalystLegacyRgbaShimInstalled';
	if ((contextPrototype as any)[shimFlag]) return;

	for (const propertyName of ['fillStyle', 'strokeStyle'] as const) {
		const descriptor = getPrototypePropertyDescriptor(
			contextPrototype,
			propertyName
		);
		if (!descriptor?.get || !descriptor.set) {
			throw new Error(`Canvas ${propertyName} is unavailable.`);
		}

		Object.defineProperty(contextPrototype, propertyName, {
			configurable: true,
			enumerable: descriptor.enumerable ?? true,
			get: descriptor.get,
			set(value: string | CanvasGradient | CanvasPattern) {
				if (typeof value === 'string') {
					descriptor.set!.call(
						this,
						convertCssColor4RgbFunctionToLegacyRgba(value)
					);
					return;
				}
				descriptor.set!.call(this, value);
			},
		});
	}

	(contextPrototype as any)[shimFlag] = true;
}

installPath2DPolyfill();
installHeadlessCanvasColorStyleShim();
(p5 as any).disableFriendlyErrors = true;

const VISUAL_ARTIFACTS_DIR = path.resolve(
	process.cwd(),
	'tests/visual-artifacts'
);
const MAX_AVERAGE_INK_DIFFERENCE = 0.04;
const MAX_DIFFERING_PIXEL_RATIO = 0.03;
const DIFFERING_PIXEL_THRESHOLD = 16;
const INK_DETECTION_THRESHOLD = 24;
const SVG_ARTIFACT_PATH = path.join(
	VISUAL_ARTIFACTS_DIR,
	'svg-export-visual-reference.svg'
);
const PNG_ARTIFACT_PATH = path.join(
	VISUAL_ARTIFACTS_DIR,
	'svg-export-visual-reference.png'
);
const CANVAS_PNG_ARTIFACT_PATH = path.join(
	VISUAL_ARTIFACTS_DIR,
	'svg-export-visual-reference.canvas.png'
);
const SVG_RASTERIZED_PNG_ARTIFACT_PATH = path.join(
	VISUAL_ARTIFACTS_DIR,
	'svg-export-visual-reference.from-svg.png'
);
const DIFF_MAP_ARTIFACT_PATH = path.join(
	VISUAL_ARTIFACTS_DIR,
	'svg-export-visual-reference.diff.png'
);
const IMPORT_SOURCE_SVG_PATH = path.join(
	VISUAL_ARTIFACTS_DIR,
	'svg-import-visual-reference.svg'
);
const IMPORT_CANVAS_PNG_PATH = path.join(
	VISUAL_ARTIFACTS_DIR,
	'svg-import-visual-canvas.png'
);
const IMPORT_SOURCE_PNG_PATH = path.join(
	VISUAL_ARTIFACTS_DIR,
	'svg-import-visual-source.png'
);
const IMPORT_DIFF_PNG_PATH = path.join(
	VISUAL_ARTIFACTS_DIR,
	'svg-import-visual-diff.png'
);

const IMPORT_REFERENCE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="760" viewBox="0 0 960 760">
	<rect width="960" height="760" fill="#ffffff"/>
	<g fill="none" stroke-linecap="round" stroke-linejoin="round">
		<line x1="48" y1="48" x2="220" y2="120" stroke="#16213e" stroke-width="6"/>
		<polyline points="80,220 250,160 340,240" stroke="#0f9d58" stroke-width="4"/>
		<path d="M 90 430 C 180 300 270 560 360 430 S 540 300 630 430 C 700 540 790 330 880 430" stroke="#d81b60" stroke-width="5"/>
		<g transform="translate(780 620) rotate(-18) scale(1.15 .85)" stroke="#1e88e5" stroke-width="3">
			<line x1="-70" y1="-40" x2="70" y2="40"/>
			<line x1="-70" y1="40" x2="70" y2="-40"/>
		</g>
	</g>
	<rect x="90" y="590" width="180" height="90" rx="16" fill="#f4b400"/>
	<circle cx="430" cy="635" r="48" fill="#4285f4"/>
</svg>`;

type DownloadCapture = {
	blob: Blob | null;
	restore: () => void;
};

function createGuiHarness() {
	let buttonHandler: (() => void | Promise<void>) | undefined;

	const group = {
		addButton: vi.fn((_, __, callback: () => void | Promise<void>) => {
			buttonHandler = callback;
		}),
		addSelect: vi.fn(
			(
				_: string,
				__: string,
				___: string[],
				defaultIndex: number,
				callback?: (controller: unknown, value: string) => void
			) => {
				if (callback) {
					const defaultValue =
						defaultIndex === 1 ? 'Millimeters (mm)' : 'Inches (in)';
					callback({}, defaultValue);
				}
				return { setValue: vi.fn() };
			}
		),
		addTextbox: vi.fn(
			(
				_: string,
				__: string,
				defaultValue: string,
				callback?: (controller: unknown, value: string) => void
			) => {
				callback?.({}, defaultValue);
				return { setValue: vi.fn() };
			}
		),
	};

	const panel = {
		addGroup: vi.fn(() => group),
		open: vi.fn(),
	};

	const exportTab = {
		addPanel: vi.fn(() => panel),
	};

	return {
		gui: {
			getTab: vi.fn(() => exportTab),
			dialog: {
				alert: vi.fn(),
			},
		} as any,
		clickDownload: async () => {
			if (!buttonHandler) {
				throw new Error(
					'Download SVG button handler was not registered.'
				);
			}
			await buttonHandler();
		},
	};
}

function installDownloadCapture(): DownloadCapture {
	let blob: Blob | null = null;
	const originalUrl = globalThis.URL;
	const originalClick = HTMLAnchorElement.prototype.click;
	const patchedUrl = class extends originalUrl {
		static createObjectURL(object: Blob) {
			blob = object;
			return 'blob:svg-export-visual-test';
		}

		static revokeObjectURL() {}
	};

	vi.stubGlobal('URL', patchedUrl);
	HTMLAnchorElement.prototype.click = () => {};

	return {
		get blob() {
			return blob;
		},
		restore: () => {
			HTMLAnchorElement.prototype.click = originalClick;
			vi.unstubAllGlobals();
		},
	};
}

function dataUrlToBuffer(dataUrl: string): Buffer {
	const [, base64] = dataUrl.split(',');
	if (!base64) throw new Error('Expected a base64 canvas data URL.');
	return Buffer.from(base64, 'base64');
}

function clampByte(value: number): number {
	return Math.max(0, Math.min(255, Math.round(value)));
}

type RasterImageData = {
	width: number;
	height: number;
	data: Uint8ClampedArray;
};

async function decodePngBuffer(pngBuffer: Buffer): Promise<RasterImageData> {
	const image = await loadImage(pngBuffer);
	const canvas = createCanvas(image.width, image.height);
	const context = canvas.getContext('2d');
	context.fillStyle = '#ffffff';
	context.fillRect(0, 0, image.width, image.height);
	context.drawImage(image, 0, 0, image.width, image.height);
	const imageData = context.getImageData(0, 0, image.width, image.height);
	return {
		width: image.width,
		height: image.height,
		data: imageData.data,
	};
}

function getPixelRgba(
	image: RasterImageData,
	x: number,
	y: number
): [number, number, number, number] {
	if (x < 0 || y < 0 || x >= image.width || y >= image.height) {
		throw new Error(
			`Pixel coordinate ${x},${y} is outside image bounds ${image.width}x${image.height}.`
		);
	}
	const index = (y * image.width + x) * 4;
	return [
		image.data[index],
		image.data[index + 1],
		image.data[index + 2],
		image.data[index + 3],
	];
}

async function rasterizeSvgToPngBuffer(
	svgText: string,
	width: number,
	height: number
): Promise<Buffer> {
	const svgImage = await loadImage(Buffer.from(svgText, 'utf8'));
	const canvas = createCanvas(width, height);
	const context = canvas.getContext('2d');
	context.fillStyle = '#ffffff';
	context.fillRect(0, 0, width, height);
	context.drawImage(svgImage, 0, 0, width, height);
	return canvas.toBuffer('image/png');
}

type PixelDifferenceMap = {
	averageInkDifference: number;
	differingPixelCount: number;
	differingPixelRatio: number;
	diffPngBuffer: Buffer;
};

function getInkAmountAtIndex(
	imageData: Uint8ClampedArray,
	index: number
): number {
	const red = imageData[index];
	const green = imageData[index + 1];
	const blue = imageData[index + 2];
	const alpha = imageData[index + 3] / 255;
	const distanceFromWhite =
		Math.abs(255 - red) + Math.abs(255 - green) + Math.abs(255 - blue);
	if (distanceFromWhite <= INK_DETECTION_THRESHOLD) return 0;
	return alpha;
}

async function computePixelDifferenceMap(
	pngBufferA: Buffer,
	pngBufferB: Buffer
): Promise<PixelDifferenceMap> {
	const [imageA, imageB] = await Promise.all([
		decodePngBuffer(pngBufferA),
		decodePngBuffer(pngBufferB),
	]);
	if (imageA.width !== imageB.width || imageA.height !== imageB.height) {
		throw new Error(
			`Expected images with identical dimensions, received ${imageA.width}x${imageA.height} and ${imageB.width}x${imageB.height}.`
		);
	}

	const pixelCount = imageA.width * imageA.height;
	const diffCanvas = createCanvas(imageA.width, imageA.height);
	const diffContext = diffCanvas.getContext('2d');
	const diffImage = diffContext.createImageData(imageA.width, imageA.height);
	let totalInkDifference = 0;
	let differingPixelCount = 0;

	for (let index = 0; index < imageA.data.length; index += 4) {
		const redDifference = Math.abs(imageA.data[index] - imageB.data[index]);
		const greenDifference = Math.abs(
			imageA.data[index + 1] - imageB.data[index + 1]
		);
		const blueDifference = Math.abs(
			imageA.data[index + 2] - imageB.data[index + 2]
		);
		const inkAmountA = getInkAmountAtIndex(imageA.data, index);
		const inkAmountB = getInkAmountAtIndex(imageB.data, index);
		const inkDifference = Math.abs(inkAmountA - inkAmountB);
		totalInkDifference += inkDifference;

		if (inkDifference * 255 > DIFFERING_PIXEL_THRESHOLD) {
			differingPixelCount++;
		}

		diffImage.data[index] = redDifference;
		diffImage.data[index + 1] = greenDifference;
		diffImage.data[index + 2] = blueDifference;
		diffImage.data[index + 3] = 255;
	}
	diffContext.putImageData(diffImage, 0, 0);

	return {
		averageInkDifference: totalInkDifference / pixelCount,
		differingPixelCount,
		differingPixelRatio: differingPixelCount / pixelCount,
		diffPngBuffer: diffCanvas.toBuffer('image/png'),
	};
}

function getSketchCanvasPngBuffer(sketch: p5): Buffer {
	const rawCanvas =
		(sketch as any).canvas ||
		(sketch as any)._renderer?.canvas ||
		(sketch as any)._curElement?.elt;
	if (!rawCanvas) {
		throw new Error('Expected a rendered p5 canvas element.');
	}

	if (typeof rawCanvas.toBuffer === 'function') {
		return rawCanvas.toBuffer('image/png');
	}
	if (typeof rawCanvas.toDataURL === 'function') {
		return dataUrlToBuffer(rawCanvas.toDataURL('image/png'));
	}

	throw new Error('Expected a canvas that can be exported to PNG.');
}

function drawReferenceScene(sketch: p5) {
	sketch.background('#ffffff');
	sketch.noFill();

	sketch.stroke('#16213e');
	sketch.strokeWeight(6);
	sketch.line(48, 48, 220, 120);

	sketch.stroke('#0f9d58');
	sketch.strokeWeight(4);
	sketch.line(80, 220, 250, 160);

	sketch.stroke('#4285f4');
	sketch.line(300, 200, 560, 180);

	sketch.stroke('#f4b400');
	sketch.line(620, 130, 820, 250);

	sketch.stroke('#fb8c00');
	sketch.line(620, 280, 900, 320);

	sketch.stroke('#6d4c41');
	sketch.strokeWeight(5);
	sketch.line(100, 420, 260, 620);

	sketch.stroke('#5e35b1');
	sketch.strokeWeight(4);
	sketch.line(320, 500, 720, 560);

	sketch.stroke('#43a047');
	sketch.strokeWeight(4);
	sketch.line(760, 460, 900, 620);

	sketch.stroke('#8e24aa');
	sketch.strokeWeight(3);
	sketch.line(80, 680, 320, 700);

	sketch.stroke('#d81b60');
	sketch.strokeWeight(5);
	sketch.beginShape();
	sketch.vertex(90, 430);
	sketch.bezierVertex(180, 300);
	sketch.bezierVertex(270, 560);
	sketch.bezierVertex(360, 430);
	sketch.bezierVertex(450, 300);
	sketch.bezierVertex(540, 300);
	sketch.bezierVertex(630, 430);
	sketch.endShape();

	sketch.push();
	sketch.translate(840, 540);
	sketch.rotate(sketch.radians(-18));
	sketch.scale(1.15, 0.85);
	sketch.stroke('#1e88e5');
	sketch.line(-70, -40, 70, 40);
	sketch.line(-70, 40, 70, -40);
	sketch.pop();
}

async function createReferenceSketch(): Promise<p5> {
	return await new Promise((resolve, reject) => {
		let resolved = false;
		let instance: p5 | undefined;

		const finish = (value: p5) => {
			if (resolved) return;
			resolved = true;
			resolve(value);
		};

		const fail = (error: unknown) => {
			if (resolved) return;
			resolved = true;
			reject(error);
		};

		try {
			instance = new p5(sketch => {
				sketch.setup = () => {
					sketch.pixelDensity(1);
					sketch.createCanvas(960, 760);
					sketch.noLoop();
				};

				sketch.draw = () => {
					try {
						drawReferenceScene(sketch);
						finish(sketch);
					} catch (error) {
						fail(error);
					}
				};
			});
		} catch (error) {
			fail(error);
			return;
		}

		setTimeout(() => {
			if (!resolved && instance) {
				fail(new Error('Timed out waiting for p5 sketch to render.'));
			}
		}, 5000);
	});
}

async function createImportedReferenceSketch(): Promise<p5> {
	return await new Promise((resolve, reject) => {
		let resolved = false;
		let instance: p5 | undefined;
		const plugin = svgImportPlugin();
		const finish = (value: p5) => {
			if (resolved) return;
			resolved = true;
			resolve(value);
		};
		const fail = (error: unknown) => {
			if (resolved) return;
			resolved = true;
			reject(error);
		};

		try {
			instance = new p5(sketch => {
				sketch.setup = () => {
					try {
						sketch.pixelDensity(1);
						sketch.createCanvas(960, 760);
						sketch.noLoop();
						plugin.beforeGuiExists?.(sketch as any, {});
						(sketch as any).importSvg(IMPORT_REFERENCE_SVG);
					} catch (error) {
						fail(error);
					}
				};

				sketch.draw = () => {
					setTimeout(() => finish(sketch), 0);
				};
			});
		} catch (error) {
			fail(error);
			return;
		}

		setTimeout(() => {
			if (!resolved && instance) {
				fail(
					new Error('Timed out waiting for imported SVG to render.')
				);
			}
		}, 5000);
	});
}

async function writeVisualArtifacts(
	svgText: string,
	canvasPngBuffer: Buffer,
	svgRasterizedPngBuffer: Buffer,
	diffPngBuffer: Buffer
) {
	await mkdir(VISUAL_ARTIFACTS_DIR, { recursive: true });
	await writeFile(SVG_ARTIFACT_PATH, svgText, 'utf8');
	await writeFile(PNG_ARTIFACT_PATH, svgRasterizedPngBuffer);
	await writeFile(CANVAS_PNG_ARTIFACT_PATH, canvasPngBuffer);
	await writeFile(SVG_RASTERIZED_PNG_ARTIFACT_PATH, svgRasterizedPngBuffer);
	await writeFile(DIFF_MAP_ARTIFACT_PATH, diffPngBuffer);
}

async function writeImportVisualArtifacts(
	canvasPngBuffer: Buffer,
	sourcePngBuffer: Buffer,
	diffPngBuffer: Buffer
) {
	await mkdir(VISUAL_ARTIFACTS_DIR, { recursive: true });
	await writeFile(IMPORT_SOURCE_SVG_PATH, IMPORT_REFERENCE_SVG, 'utf8');
	await writeFile(IMPORT_CANVAS_PNG_PATH, canvasPngBuffer);
	await writeFile(IMPORT_SOURCE_PNG_PATH, sourcePngBuffer);
	await writeFile(IMPORT_DIFF_PNG_PATH, diffPngBuffer);
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe('svgExportPlugin visual regression', () => {
	it('compares the p5 canvas PNG to the rasterized SVG export and writes a diff map', async () => {
		const sketch = await createReferenceSketch();
		const { gui, clickDownload } = createGuiHarness();
		const downloadCapture = installDownloadCapture();
		const plugin = svgExportPlugin();
		const canvasPngBuffer = getSketchCanvasPngBuffer(sketch);

		try {
			plugin.afterUserCreatesGui?.(gui, sketch as any, {
				fileName: 'svg-export-visual-test',
			});

			await clickDownload();

			const svgBlob = downloadCapture.blob;
			expect(svgBlob).toBeTruthy();
			expect(gui.dialog.alert).not.toHaveBeenCalled();

			const svgText = await svgBlob!.text();
			expect(svgText).toContain('<svg');
			expect(svgText).toContain(
				`<rect x="0" y="0" width="${sketch.width}" height="${sketch.height}"`
			);
			const drawableTagMatches = svgText.match(
				/<(circle|ellipse|rect|line|path|polygon|polyline|text)\b/g
			);
			expect(drawableTagMatches?.length ?? 0).toBeGreaterThanOrEqual(8);

			const svgRasterizedPngBuffer = await rasterizeSvgToPngBuffer(
				svgText,
				sketch.width,
				sketch.height
			);
			const [canvasImage, svgImage] = await Promise.all([
				decodePngBuffer(canvasPngBuffer),
				decodePngBuffer(svgRasterizedPngBuffer),
			]);
			expect(getPixelRgba(canvasImage, 20, 20)).toEqual(
				getPixelRgba(svgImage, 20, 20)
			);
			expect(getPixelRgba(canvasImage, 134, 84)).toEqual(
				getPixelRgba(svgImage, 134, 84)
			);
			const differenceMap = await computePixelDifferenceMap(
				canvasPngBuffer,
				svgRasterizedPngBuffer
			);
			await writeVisualArtifacts(
				svgText,
				canvasPngBuffer,
				svgRasterizedPngBuffer,
				differenceMap.diffPngBuffer
			);

			expect(differenceMap.averageInkDifference).toBeLessThanOrEqual(
				MAX_AVERAGE_INK_DIFFERENCE
			);
			expect(differenceMap.differingPixelRatio).toBeLessThanOrEqual(
				MAX_DIFFERING_PIXEL_RATIO
			);
		} finally {
			downloadCapture.restore();
			sketch.remove();
		}
	}, 30000);
});

describe('svgImportPlugin visual regression', () => {
	it('compares imported p5 geometry to the rasterized source SVG', async () => {
		const sketch = await createImportedReferenceSketch();
		try {
			const canvasPngBuffer = getSketchCanvasPngBuffer(sketch);
			const sourcePngBuffer = await rasterizeSvgToPngBuffer(
				IMPORT_REFERENCE_SVG,
				sketch.width,
				sketch.height
			);
			const differenceMap = await computePixelDifferenceMap(
				canvasPngBuffer,
				sourcePngBuffer
			);
			await writeImportVisualArtifacts(
				canvasPngBuffer,
				sourcePngBuffer,
				differenceMap.diffPngBuffer
			);

			expect(differenceMap.averageInkDifference).toBeLessThanOrEqual(
				MAX_AVERAGE_INK_DIFFERENCE
			);
			expect(differenceMap.differingPixelRatio).toBeLessThanOrEqual(
				MAX_DIFFERING_PIXEL_RATIO
			);
		} finally {
			sketch.remove();
		}
	}, 30000);
});
