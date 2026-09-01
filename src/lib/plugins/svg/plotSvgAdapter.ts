import p5plotSvg, { type PlotSvgApi } from 'p5.plotsvg';
import type { ExtensibleP5 } from '../../types';
import type { SvgExportSettings } from './settings';
import { resolutionToDpi } from './settings';

export type SvgRecording = {
	end: () => string;
	cancel: () => void;
};

const plotSvg: PlotSvgApi = p5plotSvg;

type PlotSvgSegment = {
	type: string;
	x?: number;
	y?: number;
	x2?: number;
	y2?: number;
	x3?: number;
	y3?: number;
	x4?: number;
	y4?: number;
};

function isPointBezier(segment: PlotSvgSegment): boolean {
	return (
		segment.type === 'bezier' &&
		Number.isFinite(segment.x2) &&
		Number.isFinite(segment.y2) &&
		!Number.isFinite(segment.x3) &&
		!Number.isFinite(segment.y3)
	);
}

/** Convert p5 2's three point vertices to p5.plotSvg's legacy cubic segment. */
function normalizePointBezierCommands(commands: unknown) {
	if (!Array.isArray(commands)) return;
	for (const command of commands) {
		if (command?.type !== 'path' || !Array.isArray(command.segments)) continue;
		const source = command.segments as PlotSvgSegment[];
		const segments: PlotSvgSegment[] = [];
		let index = 0;

		if (source[0] && isPointBezier(source[0])) {
			segments.push({ type: 'vertex', x: source[0].x2, y: source[0].y2 });
			index = 1;
		}

		while (index < source.length) {
			const first = source[index];
			const second = source[index + 1];
			const third = source[index + 2];
			if (
				isPointBezier(first) &&
				isPointBezier(second) &&
				isPointBezier(third)
			) {
				segments.push({
					type: 'bezier',
					x2: first.x2,
					y2: first.y2,
					x3: second.x2,
					y3: second.y2,
					x4: third.x2,
					y4: third.y2,
				});
				index += 3;
				continue;
			}

			segments.push(first);
			index++;
		}

		command.segments = segments;
	}
}

const PATCHED_METHODS = [
	'arc',
	'background',
	'bezier',
	'circle',
	'curve',
	'ellipse',
	'line',
	'point',
	'quad',
	'rect',
	'square',
	'triangle',
	'bezierDetail',
	'curveTightness',
	'beginShape',
	'vertex',
	'bezierVertex',
	'quadraticVertex',
	'curveVertex',
	'endShape',
	'describe',
	'push',
	'pop',
	'scale',
	'translate',
	'rotate',
	'shearX',
	'shearY',
	'text',
	'stroke',
	'colorMode',
] as const;

function makeMethodsWritable(sketch: ExtensibleP5): () => void {
	const descriptors = new Map<string, PropertyDescriptor | undefined>();

	for (const methodName of PATCHED_METHODS) {
		const ownDescriptor = Object.getOwnPropertyDescriptor(
			sketch,
			methodName
		);
		const method = (sketch as any)[methodName];
		if (typeof method !== 'function') continue;

		descriptors.set(methodName, ownDescriptor);
		if (ownDescriptor && 'value' in ownDescriptor) {
			if (!ownDescriptor.writable && ownDescriptor.configurable) {
				Object.defineProperty(sketch, methodName, {
					...ownDescriptor,
					writable: true,
				});
			}
			continue;
		}

		Object.defineProperty(sketch, methodName, {
			value: method,
			writable: true,
			configurable: true,
		});
	}

	let restored = false;
	return () => {
		if (restored) return;
		restored = true;
		for (const [methodName, descriptor] of descriptors) {
			if (descriptor)
				Object.defineProperty(sketch, methodName, descriptor);
			else delete (sketch as any)[methodName];
		}
	};
}

function configureResolution(settings: SvgExportSettings) {
	const dpi = resolutionToDpi(settings.resolution, settings.resolutionMetric);
	if (settings.resolutionMetric === 'dpi') {
		if (plotSvg.setSvgResolutionDPI) plotSvg.setSvgResolutionDPI(dpi);
		else plotSvg.setSvgResolutionDPCM?.(dpi / 2.54);
		return;
	}

	const dpcm = dpi / 2.54;
	if (plotSvg.setSvgResolutionDPCM) plotSvg.setSvgResolutionDPCM(dpcm);
	else plotSvg.setSvgResolutionDPI?.(dpi);
}

export function beginSvgRecording(
	sketch: ExtensibleP5,
	settings: SvgExportSettings
): SvgRecording {
	const restoreMethods = makeMethodsWritable(sketch);
	let active = false;

	try {
		plotSvg.beginRecordSvg(sketch, null);
		active = true;
		plotSvg.setSvgDocumentSize?.(sketch.width, sketch.height);
		configureResolution(settings);
		plotSvg.setSvgCoordinatePrecision?.(4);
		plotSvg.setSvgTransformPrecision?.(6);
	} catch (error) {
		if (active) {
			try {
				plotSvg.endRecordSvg();
			} catch {
				// Restore the sketch even if the vendor cleanup also fails.
			}
		}
		restoreMethods();
		throw error;
	}

	return {
		end: () => {
			if (!active) throw new Error('SVG recording has already ended.');
			active = false;
			try {
				normalizePointBezierCommands(plotSvg._commands);
				return plotSvg.endRecordSvg();
			} finally {
				restoreMethods();
			}
		},
		cancel: () => {
			if (!active) return;
			active = false;
			try {
				plotSvg.endRecordSvg();
			} catch {
				// Cleanup must not replace the original export error.
			} finally {
				restoreMethods();
			}
		},
	};
}

export function pushPlotSvgStroke(color: string | null) {
	if (!color || !Array.isArray(plotSvg._commands)) return;
	const previous = plotSvg._commands.at(-1);
	if (previous?.type !== 'stroke' || previous.color !== color) {
		plotSvg._commands.push({ type: 'stroke', color });
	}
}
