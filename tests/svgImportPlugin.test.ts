import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/gui/components/groups/Group', () => ({ ROW: 'row' }));

import { parseSvg } from '../src/lib/plugins/svg/importSvg';
import { parseSvgPath } from '../src/lib/plugins/svg/path';
import { svgImportPlugin } from '../src/lib/plugins/svgImportPlugin';

afterEach(() => {
	vi.restoreAllMocks();
});

function createDrawingSketch() {
	const color = vi.fn((value: string) => ({ value, setAlpha: vi.fn() }));
	return {
		CLOSE: 'close',
		CENTER: 'center',
		RIGHT: 'right',
		LEFT: 'left',
		TOP: 'top',
		BOTTOM: 'bottom',
		BASELINE: 'alphabetic',
		BOLDITALIC: 'bold italic',
		BOLD: 'bold',
		ITALIC: 'italic',
		NORMAL: 'normal',
		color,
		push: vi.fn(),
		pop: vi.fn(),
		translate: vi.fn(),
		scale: vi.fn(),
		applyMatrix: vi.fn(),
		fill: vi.fn(),
		noFill: vi.fn(),
		stroke: vi.fn(),
		noStroke: vi.fn(),
		strokeWeight: vi.fn(),
		strokeCap: vi.fn(),
		strokeJoin: vi.fn(),
		beginShape: vi.fn(),
		vertex: vi.fn(),
		bezierVertex: vi.fn(),
		endShape: vi.fn(),
		line: vi.fn(),
		rect: vi.fn(),
		ellipse: vi.fn(),
		textFont: vi.fn(),
		textSize: vi.fn(),
		textStyle: vi.fn(),
		textAlign: vi.fn(),
		text: vi.fn(),
	} as any;
}

function createGuiHarness() {
	let loaderCallback: ((file: unknown) => void | Promise<void>) | undefined;
	let clearCallback: (() => void | Promise<void>) | undefined;
	const input = document.createElement('input');
	const group = {
		addTextLoader: vi.fn(
			(
				_: string,
				__: string,
				callback: (file: unknown) => void | Promise<void>
			) => {
				loaderCallback = callback;
				return { controllerElement: { elt: input } };
			}
		),
		addButton: vi.fn(
			(_: string, __: string, callback: () => void | Promise<void>) => {
				clearCallback = callback;
			}
		),
	};
	const panel = { addGroup: vi.fn(() => group) };
	const appearanceTab = { addPanel: vi.fn(() => panel) };
	const gui = {
		getTab: vi.fn(() => appearanceTab),
		dialog: { alert: vi.fn() },
	} as any;
	return {
		gui,
		input,
		load: async (source: string) => {
			if (!loaderCallback)
				throw new Error('SVG loader was not registered.');
			await loaderCallback({ file: { text: async () => source } });
		},
		clear: async () => {
			if (!clearCallback)
				throw new Error('Clear button was not registered.');
			await clearCallback();
		},
	};
}

describe('SVG path parsing', () => {
	it('normalizes connected cubic and smooth curves', () => {
		const [path] = parseSvgPath('M 10 20 C 20 0 40 0 50 20 S 80 40 90 20');

		expect(path.startX).toBe(10);
		expect(path.segments).toHaveLength(2);
		expect(path.segments[1]).toEqual({
			type: 'cubic',
			control1X: 60,
			control1Y: 40,
			control2X: 80,
			control2Y: 40,
			x: 90,
			y: 20,
		});
	});

	it('normalizes relative commands and elliptical arcs', () => {
		const [path] = parseSvgPath('m 10 10 l 10 0 a 20 10 0 0 1 40 0 z');

		expect(path.closed).toBe(true);
		expect(path.segments[0]).toEqual({ type: 'line', x: 20, y: 10 });
		const lastSegment = path.segments.at(-1);
		expect(lastSegment?.type).toBe('cubic');
		expect(lastSegment?.x).toBeCloseTo(60);
		expect(lastSegment?.y).toBeCloseTo(10);
	});
});

describe('parseSvg', () => {
	it('draws styled, transformed SVG geometry through p5 methods', () => {
		const imported = parseSvg(`
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50">
				<style>.curve { fill:none; stroke:#336dff; stroke-width:4; }</style>
				<g transform="translate(5 3)">
					<path class="curve" d="M10 25 C25 0 40 0 50 25 S75 50 90 25"/>
				</g>
			</svg>
		`);
		const sketch = createDrawingSketch();

		imported.draw(sketch, 20, 30, 200, 100);

		expect(imported.viewBox).toEqual([0, 0, 100, 50]);
		expect(sketch.translate).toHaveBeenCalledWith(20, 30);
		expect(sketch.scale).toHaveBeenCalledWith(2, 2);
		expect(sketch.applyMatrix).toHaveBeenCalledWith(1, 0, 0, 1, 5, 3);
		expect(sketch.noFill).toHaveBeenCalled();
		expect(sketch.strokeWeight).toHaveBeenCalledWith(4);
		expect(sketch.vertex).toHaveBeenCalledWith(10, 25);
		expect(sketch.bezierVertex).toHaveBeenCalledTimes(6);
	});

	it('rejects malformed or non-SVG input', () => {
		expect(() => parseSvg('<svg><path></svg>')).toThrow('Invalid SVG');
		expect(() => parseSvg('<html/>')).toThrow('Expected an SVG root');
	});
});

describe('svgImportPlugin', () => {
	it('loads, exposes, auto-draws, and clears imported SVGs', async () => {
		const onLoad = vi.fn();
		const plugin = svgImportPlugin({ onLoad });
		const originalDraw = vi.fn();
		const sketch = Object.assign(createDrawingSketch(), {
			width: 320,
			height: 180,
			draw: originalDraw,
			isLooping: vi.fn(() => false),
			redraw: vi.fn(() => Promise.resolve()),
		});
		const { gui, input, load, clear } = createGuiHarness();

		plugin.beforeGuiExists?.(sketch, {});
		plugin.afterUserCreatesGui?.(gui, sketch, {});
		await load(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><line x1="0" y1="0" x2="10" y2="10"/></svg>'
		);

		expect(input.accept).toBe('.svg,image/svg+xml');
		expect(sketch.importedSvg).toBeDefined();
		expect(onLoad).toHaveBeenCalledWith(sketch.importedSvg, sketch);
		expect(sketch.redraw).toHaveBeenCalledWith(1);

		sketch.draw();
		expect(originalDraw).toHaveBeenCalled();
		expect(sketch.line).toHaveBeenCalledWith(0, 0, 10, 10);

		await clear();
		expect(sketch.importedSvg).toBeUndefined();
	});

	it('reports invalid uploads without replacing the current SVG', async () => {
		const consoleError = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {});
		const plugin = svgImportPlugin({ autoDraw: false });
		const sketch = Object.assign(createDrawingSketch(), {
			width: 100,
			height: 100,
			isLooping: vi.fn(() => true),
			redraw: vi.fn(),
		});
		const { gui, load } = createGuiHarness();
		plugin.afterUserCreatesGui?.(gui, sketch, {});
		const previous = sketch.importSvg(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"/>'
		);

		await load('<not-svg/>');

		expect(sketch.importedSvg).toBe(previous);
		expect(consoleError).toHaveBeenCalledOnce();
		expect(gui.dialog.alert).toHaveBeenCalledOnce();
	});
});
