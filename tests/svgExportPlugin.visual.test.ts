import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCanvas, loadImage } from 'canvas';
import p5 from 'p5';

vi.mock('../src/lib/gui/components/groups/Group', () => ({
	ROW: 'row',
}));

import { svgExportPlugin } from '../src/lib/plugins/svgExportPlugin';

type PathCommand =
	| { type: 'moveTo'; args: [number, number] }
	| { type: 'lineTo'; args: [number, number] }
	| { type: 'closePath'; args: [] }
	| { type: 'quadraticCurveTo'; args: [number, number, number, number] }
	| {
			type: 'bezierCurveTo';
			args: [number, number, number, number, number, number];
	  };

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
				case 'quadraticCurveTo':
					context.quadraticCurveTo(...command.args);
					break;
				case 'bezierCurveTo':
					context.bezierCurveTo(...command.args);
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

installPath2DPolyfill();
(p5 as any).disableFriendlyErrors = true;

const VISUAL_ARTIFACTS_DIR = path.resolve(
	process.cwd(),
	'tests/visual-artifacts'
);
const MAX_AVERAGE_PIXEL_DIFFERENCE = 5;
const COLOR_SAMPLE_CHANNEL_TOLERANCE = 24;
const SVG_ARTIFACT_PATH = path.join(
	VISUAL_ARTIFACTS_DIR,
	'svg-export-visual-reference.svg'
);
const PNG_ARTIFACT_PATH = path.join(
	VISUAL_ARTIFACTS_DIR,
	'svg-export-visual-reference.png'
);
const SVG_RASTERIZED_PNG_ARTIFACT_PATH = path.join(
	VISUAL_ARTIFACTS_DIR,
	'svg-export-visual-reference.from-svg.png'
);
const EXPECTED_COLOR_SAMPLES = [
	{
		label: 'background',
		x: 20,
		y: 20,
		expectedRgba: [255, 255, 255, 255],
	},
	{
		label: 'navy line start',
		x: 70,
		y: 57,
		expectedRgba: [22, 33, 62, 255],
	},
	{
		label: 'navy line middle',
		x: 135,
		y: 84,
		expectedRgba: [22, 33, 62, 255],
	},
] as const;

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

type RasterImageData = {
	width: number;
	height: number;
	data: Uint8ClampedArray;
};

async function decodePngBuffer(pngBuffer: Buffer): Promise<RasterImageData> {
	const image = await loadImage(pngBuffer);
	const canvas = createCanvas(image.width, image.height);
	const context = canvas.getContext('2d');
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

function expectSampledColorsToMatch(
	image: RasterImageData,
	imageLabel: string
) {
	for (const sample of EXPECTED_COLOR_SAMPLES) {
		const actualRgba = getPixelRgba(image, sample.x, sample.y);
		for (let channelIndex = 0; channelIndex < 4; channelIndex++) {
			expect(
				Math.abs(
					actualRgba[channelIndex] - sample.expectedRgba[channelIndex]
				),
				`${imageLabel} sample "${sample.label}" channel ${channelIndex} at ${sample.x},${sample.y}`
			).toBeLessThanOrEqual(COLOR_SAMPLE_CHANNEL_TOLERANCE);
		}
	}
}

function roundedRectPath(
	context: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number
) {
	const clampedRadius = Math.min(radius, width / 2, height / 2);
	context.beginPath();
	context.moveTo(x + clampedRadius, y);
	context.lineTo(x + width - clampedRadius, y);
	context.quadraticCurveTo(x + width, y, x + width, y + clampedRadius);
	context.lineTo(x + width, y + height - clampedRadius);
	context.quadraticCurveTo(
		x + width,
		y + height,
		x + width - clampedRadius,
		y + height
	);
	context.lineTo(x + clampedRadius, y + height);
	context.quadraticCurveTo(x, y + height, x, y + height - clampedRadius);
	context.lineTo(x, y + clampedRadius);
	context.quadraticCurveTo(x, y, x + clampedRadius, y);
	context.closePath();
}

function drawReferenceSceneToContext(
	context: CanvasRenderingContext2D,
	width: number,
	height: number
) {
	context.clearRect(0, 0, width, height);
	context.fillStyle = '#ffffff';
	context.fillRect(0, 0, width, height);

	context.strokeStyle = '#16213e';
	context.lineWidth = 6;
	context.lineCap = 'round';
	context.beginPath();
	context.moveTo(48, 48);
	context.lineTo(220, 120);
	context.stroke();

	context.fillStyle = '#e94560';
	context.beginPath();
	context.arc(260, 72, 5, 0, Math.PI * 2);
	context.fill();

	context.fillStyle = '#0f9d58';
	context.beginPath();
	context.arc(120, 220, 46, 0, Math.PI * 2);
	context.fill();

	context.fillStyle = '#4285f4';
	context.beginPath();
	context.ellipse(280, 220, 75, 45, 0, 0, Math.PI * 2);
	context.fill();

	context.fillStyle = '#f4b400';
	roundedRectPath(context, 360, 160, 120, 120, 18);
	context.fill();

	context.fillStyle = '#fb8c00';
	roundedRectPath(context, 520, 160, 110, 110, 16);
	context.fill();

	context.fillStyle = '#8e24aa';
	context.beginPath();
	context.moveTo(700, 260);
	context.lineTo(760, 150);
	context.lineTo(840, 280);
	context.closePath();
	context.fill();

	context.fillStyle = '#00acc1';
	context.beginPath();
	context.moveTo(60, 360);
	context.lineTo(180, 330);
	context.lineTo(220, 430);
	context.lineTo(90, 470);
	context.closePath();
	context.fill();

	context.fillStyle = '#ef6c00';
	context.beginPath();
	context.moveTo(330, 410);
	context.arc(330, 410, 75, 0, Math.PI + Math.PI / 4);
	context.closePath();
	context.fill();

	context.strokeStyle = '#6d4c41';
	context.lineWidth = 5;
	context.beginPath();
	context.moveTo(440, 320);
	context.bezierCurveTo(510, 450, 620, 290, 720, 430);
	context.stroke();

	context.fillStyle = '#43a047';
	context.beginPath();
	context.moveTo(470, 540);
	context.lineTo(560, 470);
	context.lineTo(700, 500);
	context.lineTo(820, 560);
	context.lineTo(640, 660);
	context.closePath();
	context.fill();

	context.strokeStyle = '#5e35b1';
	context.lineWidth = 4;
	context.beginPath();
	context.moveTo(120, 610);
	context.lineTo(160, 560);
	context.lineTo(230, 650);
	context.lineTo(320, 560);
	context.lineTo(390, 650);
	context.lineTo(430, 600);
	context.stroke();

	context.save();
	context.translate(860, 170);
	context.rotate((-18 * Math.PI) / 180);
	context.scale(1.15, 0.85);
	context.fillStyle = '#1e88e5';
	roundedRectPath(context, -48, -36, 96, 72, 14);
	context.fill();
	context.restore();

	context.fillStyle = '#111111';
	context.font = 'italic bold 28px sans-serif';
	context.textBaseline = 'top';
	context.fillText('SVG Export', 48, 700);
	context.fillText('Visual Test', 48, 730);
}

function createReferencePngBuffer(width: number, height: number): Buffer {
	const canvas = createCanvas(width, height);
	const context = canvas.getContext('2d');
	drawReferenceSceneToContext(context, width, height);
	return canvas.toBuffer('image/png');
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

async function computeAveragePixelDifference(
	pngBufferA: Buffer,
	pngBufferB: Buffer
): Promise<number> {
	const [imageA, imageB] = await Promise.all([
		decodePngBuffer(pngBufferA),
		decodePngBuffer(pngBufferB),
	]);
	if (imageA.width !== imageB.width || imageA.height !== imageB.height) {
		throw new Error(
			`Expected images with identical dimensions, received ${imageA.width}x${imageA.height} and ${imageB.width}x${imageB.height}.`
		);
	}

	let totalDifference = 0;
	for (let index = 0; index < imageA.data.length; index++) {
		totalDifference += Math.abs(imageA.data[index] - imageB.data[index]);
	}

	return totalDifference / imageA.data.length;
}

function drawReferenceScene(sketch: p5) {
	sketch.background('#ffffff');

	sketch.noStroke();
	sketch.fill('#ffffff');
	sketch.rect(0, 0, sketch.width, sketch.height);

	sketch.stroke('#16213e');
	sketch.strokeWeight(6);
	sketch.line(48, 48, 220, 120);

	sketch.stroke('#e94560');
	sketch.strokeWeight(10);
	sketch.point(260, 72);

	sketch.noStroke();
	sketch.fill('#0f9d58');
	sketch.circle(120, 220, 92);

	sketch.fill('#4285f4');
	sketch.ellipse(280, 220, 150, 90);

	sketch.fill('#f4b400');
	sketch.rect(360, 160, 120, 120, 18);

	sketch.fill('#fb8c00');
	sketch.square(520, 160, 110, 16);

	sketch.fill('#8e24aa');
	sketch.triangle(700, 260, 760, 150, 840, 280);

	sketch.fill('#00acc1');
	sketch.quad(60, 360, 180, 330, 220, 430, 90, 470);

	sketch.fill('#ef6c00');
	sketch.arc(
		330,
		410,
		150,
		150,
		0,
		sketch.PI + sketch.QUARTER_PI,
		sketch.PIE
	);

	sketch.noFill();
	sketch.stroke('#6d4c41');
	sketch.strokeWeight(5);
	sketch.bezier(440, 320, 510, 450, 620, 290, 720, 430);

	sketch.noStroke();
	sketch.fill('#43a047');
	sketch.beginShape();
	sketch.vertex(470, 540);
	sketch.vertex(560, 470);
	sketch.vertex(700, 500);
	sketch.vertex(820, 560);
	sketch.vertex(640, 660);
	sketch.endShape(sketch.CLOSE);

	sketch.noFill();
	sketch.stroke('#5e35b1');
	sketch.strokeWeight(4);
	sketch.beginShape();
	sketch.vertex(120, 610);
	sketch.vertex(160, 560);
	sketch.vertex(230, 650);
	sketch.vertex(320, 560);
	sketch.vertex(390, 650);
	sketch.vertex(430, 600);
	sketch.endShape();

	sketch.push();
	sketch.translate(860, 170);
	sketch.rotate(sketch.radians(-18));
	sketch.scale(1.15, 0.85);
	sketch.fill('#1e88e5');
	sketch.noStroke();
	sketch.rect(-48, -36, 96, 72, 14);
	sketch.pop();

	sketch.fill('#111111');
	sketch.textSize(28);
	sketch.textStyle(sketch.BOLDITALIC);
	sketch.textLeading(30);
	sketch.textAlign(sketch.LEFT, sketch.TOP);
	sketch.text('SVG Export\\nVisual Test', 48, 700);
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

async function writeVisualArtifacts(
	svgText: string,
	canvasPngBuffer: Buffer,
	svgRasterizedPngBuffer: Buffer
) {
	await mkdir(VISUAL_ARTIFACTS_DIR, { recursive: true });
	await writeFile(SVG_ARTIFACT_PATH, svgText, 'utf8');
	await writeFile(PNG_ARTIFACT_PATH, canvasPngBuffer);
	await writeFile(SVG_RASTERIZED_PNG_ARTIFACT_PATH, svgRasterizedPngBuffer);
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe('svgExportPlugin visual regression', () => {
	it('renders a broad p5 scene and writes matching SVG and PNG artifacts', async () => {
		const sketch = await createReferenceSketch();
		const { gui, clickDownload } = createGuiHarness();
		const downloadCapture = installDownloadCapture();
		const plugin = svgExportPlugin();

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
			expect(svgText).toMatch(
				/<(circle|ellipse|rect|line|path|polygon|polyline)\b/
			);

			const canvasPngBuffer = createReferencePngBuffer(
				sketch.width,
				sketch.height
			);
			const canvasRaster = await decodePngBuffer(canvasPngBuffer);
			const svgRasterizedPngBuffer = await rasterizeSvgToPngBuffer(
				svgText,
				canvasRaster.width,
				canvasRaster.height
			);
			await writeVisualArtifacts(
				svgText,
				canvasPngBuffer,
				svgRasterizedPngBuffer
			);

			const averagePixelDifference = await computeAveragePixelDifference(
				canvasPngBuffer,
				svgRasterizedPngBuffer
			);
			const [svgRaster] = await Promise.all([
				decodePngBuffer(svgRasterizedPngBuffer),
			]);
			expectSampledColorsToMatch(canvasRaster, 'canvas PNG');
			expectSampledColorsToMatch(svgRaster, 'SVG raster PNG');
			expect(averagePixelDifference).toBeLessThanOrEqual(
				MAX_AVERAGE_PIXEL_DIFFERENCE
			);
		} finally {
			downloadCapture.restore();
			sketch.remove();
		}
	}, 30000);
});
