import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { plotSvgMock } = vi.hoisted(() => ({
	plotSvgMock: {
		beginRecordSvg: vi.fn(),
		endRecordSvg: vi.fn(),
		setSvgDocumentSize: vi.fn(),
		setSvgCoordinatePrecision: vi.fn(),
		setSvgTransformPrecision: vi.fn(),
		setSvgResolutionDPI: vi.fn(),
		setSvgResolutionDPCM: vi.fn(),
	},
}));

vi.mock('p5.plotsvg', () => ({
	default: plotSvgMock,
}));

vi.mock('../src/lib/gui/components/groups/Group', () => ({
	ROW: 'row',
}));

vi.mock('../src/lib/utils/time', () => ({
	getTimestamp: () => ({ unix: '0', base64: 'fixed' }),
}));

import {
	applyStyleClassesToSvg,
	convertClosedShapeStrokesToFills,
	hasDrawableSvgContent,
	rewriteSvgPhysicalSize,
} from '../src/lib/plugins/svg/postprocess';
import {
	colorLikeToHex,
	normalizeHexColor,
	shimBackgroundToRectDuringRecording,
	shimCircleToEllipseDuringRecording,
} from '../src/lib/plugins/svg/styleCapture';
import { svgExportPlugin } from '../src/lib/plugins/svgExportPlugin';

function createGuiHarness() {
	let buttonHandler: (() => void | Promise<void>) | undefined;
	const selectCallbacks = new Map<
		string,
		(controller: unknown, value: string) => void
	>();
	const textboxCallbacks = new Map<
		string,
		(controller: unknown, value: string) => void
	>();
	const textboxControllers = new Map<
		string,
		{
			setValue: ReturnType<typeof vi.fn>;
		}
	>();

	const group = {
		addButton: vi.fn((_, __, callback: () => void | Promise<void>) => {
			buttonHandler = callback;
		}),
		addSelect: vi.fn(
			(
				name: string,
				_: string,
				__: string[],
				___: number,
				callback?: (controller: unknown, value: string) => void
			) => {
				if (callback) selectCallbacks.set(name, callback);
				return {
					setValue: vi.fn((value: string) => callback?.({}, value)),
				};
			}
		),
		addTextbox: vi.fn(
			(
				name: string,
				_: string,
				__: string,
				callback?: (controller: unknown, value: string) => void
			) => {
				if (callback) textboxCallbacks.set(name, callback);
				const controller = {
					setValue: vi.fn((value: string) => callback?.({}, value)),
				};
				textboxControllers.set(name, controller);
				return controller;
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

	const gui = {
		getTab: vi.fn(() => exportTab),
		dialog: {
			alert: vi.fn(),
		},
	} as any;

	return {
		gui,
		setSelect: (name: string, value: string) => {
			const callback = selectCallbacks.get(name);
			if (!callback) throw new Error(`Missing select callback: ${name}`);
			callback({}, value);
		},
		setTextbox: (name: string, value: string) => {
			const callback = textboxCallbacks.get(name);
			if (!callback) throw new Error(`Missing textbox callback: ${name}`);
			callback({}, value);
		},
		getTextboxController: (name: string) => textboxControllers.get(name),
		clickDownload: () => {
			if (!buttonHandler) {
				throw new Error(
					'Download SVG button handler was not registered.'
				);
			}
			return buttonHandler();
		},
	};
}

function createSketch(looping = true, lockOwnLine = true) {
	const sketch: any = {
		width: 1080,
		height: 1920,
		_renderer: { isP3D: false },
		isLooping: vi.fn(() => looping),
		noLoop: vi.fn(),
		loop: vi.fn(),
		redraw: vi.fn(() => Promise.resolve()),
		pixelDensity: vi.fn(() => 1),
	};

	if (lockOwnLine) {
		// Simulate one non-writable p5 v2 method so unlock logic is exercised.
		Object.defineProperty(sketch, 'line', {
			value: vi.fn(),
			writable: false,
			configurable: true,
			enumerable: true,
		});
	}

	return sketch;
}

async function getDownloadedSvgText(): Promise<string> {
	const createObjectURL = (globalThis.URL as any)
		.createObjectURL as ReturnType<typeof vi.fn>;
	const svgBlob = createObjectURL.mock.calls[0]?.[0] as Blob | undefined;
	if (!svgBlob) throw new Error('Expected one exported SVG blob.');
	return await svgBlob.text();
}

describe('svgExportPlugin', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.stubGlobal('URL', {
			createObjectURL: vi.fn(() => 'blob:mock-svg'),
			revokeObjectURL: vi.fn(),
		});
		vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
			() => {}
		);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it('detects whether exported SVG contains drawable geometry', () => {
		const emptySvg = `<svg><style>line{stroke:black;}</style></svg>`;
		const drawableSvg = `<svg><line x1="0" y1="0" x2="1" y2="1"/></svg>`;

		expect(hasDrawableSvgContent(emptySvg)).toBe(false);
		expect(hasDrawableSvgContent(drawableSvg)).toBe(true);
	});

	it('routes circle drawing through ellipse during recording', () => {
		const ellipse = vi.fn();
		const sketch: any = {
			ellipse,
			circle: vi.fn(),
		};

		shimCircleToEllipseDuringRecording(sketch);
		sketch.circle(10, 20, 30);

		expect(ellipse).toHaveBeenCalledWith(10, 20, 30, 30);
	});

	it('routes background drawing through a canvas-sized rect during recording', () => {
		const originalBackground = vi.fn();
		const push = vi.fn();
		const pop = vi.fn();
		const resetMatrix = vi.fn();
		const rectMode = vi.fn();
		const noStroke = vi.fn();
		const fill = vi.fn();
		const rect = vi.fn();
		const sketch: any = {
			width: 640,
			height: 480,
			CORNER: 'corner',
			background: originalBackground,
			push,
			pop,
			resetMatrix,
			rectMode,
			noStroke,
			fill,
			rect,
			color: vi.fn(() => ({ _array: [1, 1, 1, 1] })),
		};

		shimBackgroundToRectDuringRecording(sketch);
		sketch.background(255);

		expect(originalBackground).not.toHaveBeenCalled();
		expect(push).toHaveBeenCalledOnce();
		expect(resetMatrix).toHaveBeenCalledOnce();
		expect(rectMode).toHaveBeenCalledWith('corner');
		expect(noStroke).toHaveBeenCalledOnce();
		expect(fill).toHaveBeenCalledWith('#ffffff');
		expect(rect).toHaveBeenCalledWith(0, 0, 640, 480);
		expect(pop).toHaveBeenCalledOnce();
	});

	it('converts closed-shape stroke styling into fill styling', () => {
		const svg = `<svg><ellipse cx="10" cy="20" rx="5" ry="5" style="stroke:#ff0000;"/></svg>`;
		const result = convertClosedShapeStrokesToFills(svg);

		expect(result).toContain(
			`<ellipse cx="10" cy="20" rx="5" ry="5" style="fill:#ff0000; stroke:none;"/>`
		);
	});

	it('uses black fill fallback when closed shape has no stroke style', () => {
		const svg = `<svg><ellipse cx="10" cy="20" rx="5" ry="5"/></svg>`;
		const result = convertClosedShapeStrokesToFills(svg);

		expect(result).toContain(
			`<ellipse cx="10" cy="20" rx="5" ry="5" style="fill:black; stroke:none;"/>`
		);
	});

	it('rewrites SVG physical size in inches based on DPI', () => {
		const svg = `<svg width="1in" height="1in" viewBox="0 0 1080 1920"></svg>`;
		const result = rewriteSvgPhysicalSize(svg, 1080, 1920, 'in', 96);

		expect(result).toContain(`width="11.25in"`);
		expect(result).toContain(`height="20in"`);
	});

	it('rewrites SVG physical size in millimeters based on DPI', () => {
		const svg = `<svg width="1in" height="1in" viewBox="0 0 1080 1920"></svg>`;
		const result = rewriteSvgPhysicalSize(svg, 1080, 1920, 'mm', 96);

		expect(result).toContain(`width="285.75mm"`);
		expect(result).toContain(`height="508mm"`);
	});

	it('updates resolution value when switching resolution metric', () => {
		const plugin = svgExportPlugin();
		const { gui, getTextboxController, setSelect } = createGuiHarness();
		const sketch = createSketch(false);

		plugin.afterUserCreatesGui?.(gui, sketch, { fileName: 'p5Catalyst' });

		const resolutionTextbox = getTextboxController('svgResolutionTextbox');
		expect(resolutionTextbox).toBeDefined();

		setSelect('svgResolutionMetricSelect', 'DPCM');
		expect(
			Number((resolutionTextbox as any).setValue.mock.lastCall[0])
		).toBeCloseTo(144 / 2.54, 4);

		setSelect('svgResolutionMetricSelect', 'DPMM');
		expect(
			Number((resolutionTextbox as any).setValue.mock.lastCall[0])
		).toBeCloseTo(144 / 25.4, 4);

		setSelect('svgResolutionMetricSelect', 'DPI');
		expect(
			Number((resolutionTextbox as any).setValue.mock.lastCall[0])
		).toBeCloseTo(144, 2);
	});

	it('uses DPCM resolution for recorder settings and preserves export size math', async () => {
		plotSvgMock.endRecordSvg.mockReturnValue(
			`<svg xmlns="http://www.w3.org/2000/svg" width="1in" height="1in"><line x1="0" y1="0" x2="10" y2="10"/></svg>`
		);

		const plugin = svgExportPlugin();
		const { gui, setSelect, setTextbox, clickDownload } =
			createGuiHarness();
		const sketch = createSketch(false);

		plugin.afterUserCreatesGui?.(gui, sketch, { fileName: 'p5Catalyst' });
		setSelect('svgUnitSelect', 'Inches (in)');
		setSelect('svgResolutionMetricSelect', 'DPCM');
		setTextbox('svgResolutionTextbox', '37.7953');
		await clickDownload();

		expect(plotSvgMock.setSvgResolutionDPCM).toHaveBeenCalledWith(37.7953);
		expect(plotSvgMock.setSvgResolutionDPI).not.toHaveBeenCalled();
		const exportedSvg = await getDownloadedSvgText();
		const widthInches = Number(
			exportedSvg.match(/width="([0-9.]+)in"/)?.[1] || NaN
		);
		const heightInches = Number(
			exportedSvg.match(/height="([0-9.]+)in"/)?.[1] || NaN
		);
		expect(widthInches).toBeCloseTo(11.25, 3);
		expect(heightInches).toBeCloseTo(20, 3);
	});

	it('uses DPMM resolution for recorder settings via DPCM conversion', async () => {
		plotSvgMock.endRecordSvg.mockReturnValue(
			`<svg xmlns="http://www.w3.org/2000/svg" width="1in" height="1in"><line x1="0" y1="0" x2="10" y2="10"/></svg>`
		);

		const plugin = svgExportPlugin();
		const { gui, setSelect, setTextbox, clickDownload } =
			createGuiHarness();
		const sketch = createSketch(false);

		plugin.afterUserCreatesGui?.(gui, sketch, { fileName: 'p5Catalyst' });
		setSelect('svgUnitSelect', 'Inches (in)');
		setSelect('svgResolutionMetricSelect', 'DPMM');
		setTextbox('svgResolutionTextbox', '3.7795');
		await clickDownload();

		const dpcmValue = plotSvgMock.setSvgResolutionDPCM.mock.calls[0][0];
		expect(dpcmValue).toBeCloseTo(37.795, 3);
		expect(plotSvgMock.setSvgResolutionDPI).not.toHaveBeenCalled();
		const exportedSvg = await getDownloadedSvgText();
		const widthInches = Number(
			exportedSvg.match(/width="([0-9.]+)in"/)?.[1] || NaN
		);
		const heightInches = Number(
			exportedSvg.match(/height="([0-9.]+)in"/)?.[1] || NaN
		);
		expect(widthInches).toBeCloseTo(11.25, 3);
		expect(heightInches).toBeCloseTo(20, 3);
	});

	it('collects repeated styles into CSS classes', () => {
		const svg =
			`<svg><ellipse cx="0" cy="0" rx="1" ry="1"/>` +
			`<ellipse cx="1" cy="1" rx="1" ry="1"/></svg>`;
		const styles = [
			{ fill: '#ff2600', stroke: 'none' },
			{ fill: '#ff2600', stroke: 'none' },
		];

		const result = applyStyleClassesToSvg(svg, styles);

		expect(result).toContain(`class="p5c-s0"`);
		expect(result).toContain(`.p5c-s0{fill:#ff2600; stroke:none;}`);
	});

	it('merges generated p5c class rules into the first style tag', () => {
		const svg =
			`<svg xmlns="http://www.w3.org/2000/svg">` +
			`<style>line{stroke:black;}</style>` +
			`<line x1="0" y1="0" x2="1" y2="1"/>` +
			`</svg>`;
		const styles = [{ fill: 'none', stroke: '#112233', strokeWidth: 2 }];

		const result = applyStyleClassesToSvg(svg, styles);
		const styleMatches = [
			...result.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi),
		];

		expect(styleMatches).toHaveLength(1);
		expect(styleMatches[0][1]).toContain(`line{stroke:black;}`);
		expect(styleMatches[0][1]).toContain(
			`.p5c-s0{fill:none; stroke:#112233; stroke-width:2;}`
		);
	});

	it('includes stroke width and text style variables in generated class styles', () => {
		const svg = `<svg><line x1="0" y1="0" x2="1" y2="1"/><text x="0" y="0">hi</text></svg>`;
		const styles = [
			{ fill: 'none', stroke: '#112233', strokeWidth: 2 },
			{
				fill: '#ff2600',
				stroke: 'none',
				fontFamily: 'sans-serif',
				fontSize: '12px',
				fontStyle: 'normal',
				fontWeight: 'normal',
				textAnchor: 'start',
				dominantBaseline: 'alphabetic',
			},
		];

		const result = applyStyleClassesToSvg(svg, styles);

		expect(result).toContain(`stroke-width:2`);
		expect(result).toContain(`font-family:sans-serif`);
		expect(result).toContain(`font-size:12px`);
		expect(result).toContain(`text-anchor:start`);
		expect(result).toContain(`dominant-baseline:alphabetic`);
	});

	it('strips inline presentation attributes and captures full text styling in class rules', () => {
		const svg =
			`<svg><text x="5" y="8" class="label" style="fill:#111" fill="#000"` +
			` stroke="#fff" stroke-width="9">hello</text></svg>`;
		const styles = [
			{
				fill: '#ff2600',
				stroke: 'none',
				fontFamily: '"Fira Sans"',
				fontSize: '16px',
				fontStyle: 'italic',
				fontWeight: '700',
				textAnchor: 'middle',
				dominantBaseline: 'hanging',
				lineHeight: '20px',
				direction: 'rtl',
			},
		];

		const result = applyStyleClassesToSvg(svg, styles);

		expect(result).toContain(`class="label p5c-s0"`);
		expect(result).not.toContain(`style="fill:#111"`);
		expect(result).not.toContain(`fill="#000"`);
		expect(result).not.toContain(`stroke="#fff"`);
		expect(result).not.toContain(`stroke-width="9"`);
		expect(result).toContain(`.p5c-s0{`);
		expect(result).toContain(`line-height:20px`);
		expect(result).toContain(`direction:rtl`);
	});

	it('normalizes hex color strings', () => {
		expect(normalizeHexColor('#f60')).toBe('#ff6600');
		expect(normalizeHexColor('#AbCd')).toBe('#aabbccdd');
		expect(normalizeHexColor('#112233')).toBe('#112233');
		expect(normalizeHexColor('rgb(255,0,0)')).toBeNull();
	});

	it('converts color-like values to normalized hex output', () => {
		expect(colorLikeToHex([1, 0.14902, 0])).toBe('#ff2600');
		expect(colorLikeToHex([255, 38, 0, 128])).toBe('#ff260080');
		expect(colorLikeToHex({ _array: [0.2, 0.42745, 1, 1] })).toBe(
			'#336dff'
		);
		expect(colorLikeToHex({ levels: [20, 40, 60] })).toBe('#14283c');
		expect(colorLikeToHex('not-a-hex')).toBeNull();
	});

	it('shows an error and skips download when SVG has no drawable geometry', async () => {
		plotSvgMock.endRecordSvg.mockReturnValue(
			`<svg xmlns="http://www.w3.org/2000/svg"><style>line{stroke:black;}</style></svg>`
		);

		const plugin = svgExportPlugin();
		const { gui, clickDownload } = createGuiHarness();
		const sketch = createSketch(true);

		plugin.afterUserCreatesGui?.(gui, sketch, { fileName: 'p5Catalyst' });
		await clickDownload();

		expect(plotSvgMock.beginRecordSvg).toHaveBeenCalledWith(sketch, null);
		expect(sketch.redraw).toHaveBeenCalledWith(1);
		expect(gui.dialog.alert).toHaveBeenCalledOnce();
		expect((globalThis.URL as any).createObjectURL).not.toHaveBeenCalled();
		expect(sketch.noLoop).toHaveBeenCalledOnce();
		expect(sketch.loop).toHaveBeenCalledOnce();
	});

	it('downloads SVG when drawable geometry exists', async () => {
		plotSvgMock.endRecordSvg.mockReturnValue(
			`<svg xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="0" x2="10" y2="10"/></svg>`
		);

		const plugin = svgExportPlugin();
		const { gui, clickDownload } = createGuiHarness();
		const sketch = createSketch(false);

		plugin.afterUserCreatesGui?.(gui, sketch, { fileName: 'p5Catalyst' });
		await clickDownload();

		expect(gui.dialog.alert).not.toHaveBeenCalled();
		expect((globalThis.URL as any).createObjectURL).toHaveBeenCalledOnce();
		expect((globalThis.URL as any).revokeObjectURL).toHaveBeenCalledOnce();
		expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledOnce();
		expect(sketch.noLoop).not.toHaveBeenCalled();
		expect(sketch.loop).not.toHaveBeenCalled();
		expect(Object.getOwnPropertyDescriptor(sketch, 'line')?.writable).toBe(
			false
		);
	});

	it('waits for redraw to finish before ending SVG recording', async () => {
		let resolveRedraw: (() => void) | undefined;
		const redrawDone = new Promise<void>(resolve => {
			resolveRedraw = resolve;
		});

		plotSvgMock.endRecordSvg.mockReturnValue(
			`<svg xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="0" x2="10" y2="10"/></svg>`
		);

		const plugin = svgExportPlugin();
		const { gui, clickDownload } = createGuiHarness();
		const sketch = createSketch(false);
		sketch.redraw = vi.fn(() => redrawDone);

		plugin.afterUserCreatesGui?.(gui, sketch, { fileName: 'p5Catalyst' });
		const exportPromise = clickDownload();
		await Promise.resolve();

		expect(plotSvgMock.endRecordSvg).not.toHaveBeenCalled();

		resolveRedraw?.();
		await exportPromise;

		expect(plotSvgMock.endRecordSvg).toHaveBeenCalledOnce();
	});

	it('restores inherited drawing methods after temporarily unlocking them', async () => {
		plotSvgMock.endRecordSvg.mockReturnValue(
			`<svg xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="0" x2="10" y2="10"/></svg>`
		);

		const plugin = svgExportPlugin();
		const { gui, clickDownload } = createGuiHarness();
		const sketch = createSketch(false, false);
		const prototypeWithLockedLine = Object.create(
			Object.getPrototypeOf(sketch)
		);

		Object.defineProperty(prototypeWithLockedLine, 'line', {
			value: vi.fn(),
			writable: false,
			configurable: false,
			enumerable: true,
		});
		Object.setPrototypeOf(sketch, prototypeWithLockedLine);

		plugin.afterUserCreatesGui?.(gui, sketch, { fileName: 'p5Catalyst' });
		await clickDownload();

		expect(Object.hasOwn(sketch, 'line')).toBe(false);
		expect(sketch.line).toBe(prototypeWithLockedLine.line);
		expect(gui.dialog.alert).not.toHaveBeenCalled();
	});
});
