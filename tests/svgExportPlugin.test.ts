import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { plotSvgMock } = vi.hoisted(() => ({
	plotSvgMock: {
		beginRecordSvg: vi.fn(),
		endRecordSvg: vi.fn(),
		setSvgDocumentSize: vi.fn(),
		setSvgFlattenTransforms: vi.fn(),
		setSvgCoordinatePrecision: vi.fn(),
		setSvgTransformPrecision: vi.fn(),
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
	convertClosedShapeStrokesToFills,
	hasDrawableSvgContent,
	shimCircleToEllipseDuringRecording,
	svgExportPlugin,
} from '../src/lib/plugins/svgExportPlugin';

function createGuiHarness() {
	let buttonHandler: (() => void | Promise<void>) | undefined;

	const buttonGroup = {
		addButton: vi.fn((_, __, callback: () => void | Promise<void>) => {
			buttonHandler = callback;
		}),
	};

	const panel = {
		addGroup: vi.fn(() => buttonGroup),
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

	it('creates writable own methods when drawing methods are locked on prototype', async () => {
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

		const descriptor = Object.getOwnPropertyDescriptor(sketch, 'line');
		expect(descriptor?.writable).toBe(true);
		expect(gui.dialog.alert).not.toHaveBeenCalled();
	});
});
