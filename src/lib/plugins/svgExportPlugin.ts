import p5plotSvg from 'p5.plotsvg';
import type { CatalystGUI } from '../gui/CatalystGUI';
import { ROW } from '../gui/components/groups/Group';
import type { Config, ExtensibleP5, Plugin } from '../types';
import { getTimestamp } from '../utils/time';

type PlotSvgApi = {
	beginRecordSvg: (
		p5Instance: ExtensibleP5,
		fileName?: string | null
	) => void;
	endRecordSvg: () => string;
	setSvgDocumentSize?: (width: number, height: number) => void;
	setSvgFlattenTransforms?: (flattenTransforms: boolean) => void;
	setSvgCoordinatePrecision?: (precision: number) => void;
	setSvgTransformPrecision?: (precision: number) => void;
	_commands?: PlotSvgCommand[];
};

type PlotSvgCommand = {
	type: string;
	color?: string;
};

type StyleEmulationSession = {
	shouldConvertClosedShapeStrokeToFill: () => boolean;
};

const plotSvg = p5plotSvg as unknown as PlotSvgApi;
const SVG_DRAWABLE_TAG_PATTERN =
	/<(path|line|rect|circle|ellipse|polyline|polygon|text)\b/i;
const CLOSED_SVG_SHAPE_TAG_PATTERN =
	/<(circle|ellipse|rect|polygon)\b([^>]*?)(\/?)>/gi;

const PLOT_SVG_METHODS = [
	'arc',
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

const STYLE_CAPTURE_METHODS = [
	'arc',
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
	'beginShape',
	'text',
] as const;

const CLOSED_STYLE_CAPTURE_METHODS = new Set([
	'arc',
	'circle',
	'ellipse',
	'quad',
	'rect',
	'square',
	'triangle',
	'beginShape',
]);

function getPropertyDescriptorInPrototypeChain(
	object: object,
	propertyName: string
): PropertyDescriptor | undefined {
	let current: object | null = object;
	while (current) {
		const descriptor = Object.getOwnPropertyDescriptor(
			current,
			propertyName
		);
		if (descriptor) return descriptor;
		current = Object.getPrototypeOf(current);
	}
	return undefined;
}

function unlockP5MethodsForPlotSvg(sketch: ExtensibleP5) {
	for (const methodName of PLOT_SVG_METHODS) {
		const ownDescriptor = Object.getOwnPropertyDescriptor(
			sketch,
			methodName
		);
		if (ownDescriptor && 'value' in ownDescriptor) {
			if (typeof ownDescriptor.value !== 'function') continue;
			if (ownDescriptor.writable) continue;
			if (ownDescriptor.configurable !== true) continue;

			Object.defineProperty(sketch, methodName, {
				...ownDescriptor,
				writable: true,
			});
			continue;
		}

		const currentMethod = (sketch as any)[methodName];
		if (typeof currentMethod !== 'function') continue;

		const inheritedDescriptor = getPropertyDescriptorInPrototypeChain(
			Object.getPrototypeOf(sketch) || {},
			methodName
		);
		Object.defineProperty(sketch, methodName, {
			value: currentMethod,
			writable: true,
			configurable: true,
			enumerable: inheritedDescriptor?.enumerable ?? false,
		});
	}
}

export function shimCircleToEllipseDuringRecording(sketch: ExtensibleP5) {
	const ellipseMethod = (sketch as any).ellipse;
	if (typeof ellipseMethod !== 'function') return;

	(sketch as any).circle = function (x: number, y: number, diameter: number) {
		return ellipseMethod.call(this, x, y, diameter, diameter);
	};
}

function rendererColorToCssString(value: unknown): string | null {
	if (!Array.isArray(value) || value.length < 3) return null;
	const r = Number(value[0]);
	const g = Number(value[1]);
	const b = Number(value[2]);
	const alphaRaw = Number(value[3] ?? 255);
	if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
		return null;
	}
	if (!Number.isFinite(alphaRaw)) return `rgb(${r},${g},${b})`;

	const alpha = alphaRaw > 1 ? alphaRaw / 255 : alphaRaw;
	if (alpha >= 0.999) return `rgb(${r},${g},${b})`;
	return `rgba(${r},${g},${b},${alpha})`;
}

function stateColorToCssString(value: unknown): string | null {
	if (!value) return null;
	if (typeof value === 'string') return value;

	try {
		if (typeof (value as any).toString === 'function') {
			const asString = String((value as any).toString());
			if (asString && asString !== '[object Object]') return asString;
		}
	} catch {
		// Fall through and try array-based decoding.
	}

	const normalizedArray = (value as any)?._array;
	if (!Array.isArray(normalizedArray) || normalizedArray.length < 3)
		return null;
	const r = Number(normalizedArray[0]) * 255;
	const g = Number(normalizedArray[1]) * 255;
	const b = Number(normalizedArray[2]) * 255;
	const alpha = Number(normalizedArray[3] ?? 1);
	if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
		return null;
	}
	if (!Number.isFinite(alpha) || alpha >= 0.999) return `rgb(${r},${g},${b})`;
	return `rgba(${r},${g},${b},${alpha})`;
}

function resolveColorToCssString(
	sketch: ExtensibleP5,
	args: unknown[]
): string | null {
	if (args.length === 1 && typeof args[0] === 'string') {
		return args[0] as string;
	}
	try {
		const colorValue = (sketch as any).color?.(...args);
		if (!colorValue || typeof colorValue.toString !== 'function')
			return null;
		return String(colorValue.toString());
	} catch {
		return null;
	}
}

function extractStrokeColorFromStyle(styleValue: string): string | null {
	const match = styleValue.match(/(?:^|;)\s*stroke\s*:\s*([^;]+)/i);
	return match?.[1]?.trim() || null;
}

function removePaintStyleDeclarations(styleValue: string): string[] {
	return styleValue
		.split(';')
		.map(declaration => declaration.trim())
		.filter(Boolean)
		.filter(declaration => !/^(stroke|fill)\s*:/i.test(declaration));
}

export function convertClosedShapeStrokesToFills(
	svgContent: string,
	defaultFillColor = 'black'
): string {
	return svgContent.replace(
		CLOSED_SVG_SHAPE_TAG_PATTERN,
		(
			match,
			tagName: string,
			rawAttributes: string,
			selfClosingSlash: string
		) => {
			const attributes = rawAttributes || '';
			const styleMatch = attributes.match(/\sstyle="([^"]*)"/i);
			const styleStrokeColor =
				styleMatch ? extractStrokeColorFromStyle(styleMatch[1]) : null;
				const fillColor = styleStrokeColor || defaultFillColor;
				if (!fillColor) return match;

				const remainingStyleDeclarations = styleMatch ?
						removePaintStyleDeclarations(styleMatch[1])
					:	[];
				const cleanedStyleAttributes = attributes.replace(
					/\sstyle="([^"]*)"/i,
					''
				);
				const attributesWithoutPaint = cleanedStyleAttributes.replace(
					/\s(?:fill|stroke)="[^"]*"/gi,
					''
				);
				const mergedStyle = [
					`fill:${fillColor}`,
					'stroke:none',
					...remainingStyleDeclarations,
				].join('; ');

				return `<${tagName}${attributesWithoutPaint} style="${mergedStyle};"${selfClosingSlash ? '/' : ''}>`;
			}
	);
}

function emulateStyleAsStrokeDuringRecording(
	sketch: ExtensibleP5
): StyleEmulationSession {
	const renderer = (sketch as any)._renderer;
	const rendererStates = renderer?.states;
	const state = {
		hasFill:
			rendererStates?.fillColor != null ||
			(renderer?._doFill !== false && rendererStates?.fillColor !== null),
		hasStroke:
			rendererStates?.strokeColor != null ||
			(renderer?._doStroke === true &&
				rendererStates?.strokeColor !== null),
		fillColor:
			stateColorToCssString(rendererStates?.fillColor) ||
			rendererColorToCssString(renderer?.curFillColor),
		strokeColor:
			stateColorToCssString(rendererStates?.strokeColor) ||
			rendererColorToCssString(renderer?.curStrokeColor),
	};
	let sawFillOnlyClosedShape = false;

	const pushStrokeCommand = (color: string | null) => {
		if (!color) return;
		const commands = plotSvg._commands;
		if (!Array.isArray(commands)) return;
		const previous = commands[commands.length - 1];
		if (previous?.type === 'stroke' && previous.color === color) return;
		commands.push({ type: 'stroke', color });
	};

	const wrapMethod = (
		methodName: string,
		beforeCall: (...args: unknown[]) => void
	) => {
		const original = (sketch as any)[methodName];
		if (typeof original !== 'function') return;
		(sketch as any)[methodName] = function (...args: unknown[]) {
			beforeCall(...args);
			return original.apply(this, args);
		};
	};

	wrapMethod('fill', (...args: unknown[]) => {
		state.hasFill = true;
		state.fillColor =
			resolveColorToCssString(sketch, args) || state.fillColor;
	});
	wrapMethod('noFill', () => {
		state.hasFill = false;
	});
	wrapMethod('stroke', (...args: unknown[]) => {
		state.hasStroke = true;
		state.strokeColor =
			resolveColorToCssString(sketch, args) || state.strokeColor;
	});
	wrapMethod('noStroke', () => {
		state.hasStroke = false;
	});

	for (const methodName of STYLE_CAPTURE_METHODS) {
		wrapMethod(methodName, () => {
			const isClosedShape = CLOSED_STYLE_CAPTURE_METHODS.has(methodName);

			if (isClosedShape && state.hasFill && !state.hasStroke) {
				sawFillOnlyClosedShape = true;
			}

			if (isClosedShape && state.hasFill && state.fillColor) {
				pushStrokeCommand(state.fillColor);
				return;
			}
			if (state.hasStroke && state.strokeColor) {
				pushStrokeCommand(state.strokeColor);
				return;
			}
			if (state.hasFill && state.fillColor) {
				pushStrokeCommand(state.fillColor);
			}
		});
	}

	return {
		shouldConvertClosedShapeStrokeToFill: () => sawFillOnlyClosedShape,
	};
}

function sanitizeFileName(fileName: string): string {
	const safe = fileName
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^a-zA-Z0-9._-]/g, '_');
	return safe || 'p5Catalyst';
}

function downloadSvg(svgContent: string, fileName: string) {
	const blob = new Blob([svgContent], {
		type: 'image/svg+xml;charset=utf-8',
	});
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = fileName;
	anchor.click();
	URL.revokeObjectURL(url);
}

export function hasDrawableSvgContent(svgContent: string): boolean {
	return SVG_DRAWABLE_TAG_PATTERN.test(svgContent);
}

function getSvgFileName(config: Config, sketch: ExtensibleP5): string {
	const baseName = sanitizeFileName(
		config.fileName || document.title || 'p5Catalyst'
	);
	return (
		`${baseName}_${sketch.width}x${sketch.height}` +
		`_${getTimestamp().base64}.svg`
	);
}

async function exportCurrentFrameToSvg(
	gui: CatalystGUI,
	sketch: ExtensibleP5,
	config: Config
) {
	if ((sketch as any)._renderer?.isP3D) {
		gui.dialog.alert(
			'<h1>SVG export unavailable</h1>' +
				'<p>SVG export currently supports only 2D sketches (P2D).</p>'
		);
		return;
	}

	const wasLooping = sketch.isLooping();
	let didBeginRecording = false;

	if (wasLooping) sketch.noLoop();

	try {
		unlockP5MethodsForPlotSvg(sketch);
		plotSvg.beginRecordSvg(sketch, null);
		didBeginRecording = true;
		shimCircleToEllipseDuringRecording(sketch);
		const styleEmulationSession =
			emulateStyleAsStrokeDuringRecording(sketch);

		plotSvg.setSvgDocumentSize?.(sketch.width, sketch.height);
		plotSvg.setSvgFlattenTransforms?.(true);
		plotSvg.setSvgCoordinatePrecision?.(4);
		plotSvg.setSvgTransformPrecision?.(6);

		await sketch.redraw(1);

		let svgContent = plotSvg.endRecordSvg();
		didBeginRecording = false;
		if (styleEmulationSession.shouldConvertClosedShapeStrokeToFill()) {
			svgContent = convertClosedShapeStrokesToFills(svgContent);
		}

		if (!svgContent || typeof svgContent !== 'string') {
			throw new Error('No SVG content was captured.');
		}
		if (!hasDrawableSvgContent(svgContent)) {
			throw new Error('SVG export captured no drawable vector geometry.');
		}

		downloadSvg(svgContent, getSvgFileName(config, sketch));
	} catch (error) {
		if (didBeginRecording) {
			try {
				plotSvg.endRecordSvg();
			} catch {
				// Keep original export failure as the primary error.
			}
		}

		console.error('SVG export failed.', error);
		gui.dialog.alert(
			'<h1>SVG export failed</h1>' +
				'<p>The sketch could not be exported as SVG. Check the console for details.</p>'
		);
	} finally {
		if (wasLooping) sketch.loop();
	}
}

export function svgExportPlugin(): Plugin {
	return {
		name: 'svg_export',
		afterUserCreatesGui: (
			gui: CatalystGUI,
			sketch: ExtensibleP5,
			config: Config
		) => {
			const exportTab = gui.getTab('export') || gui;
			const panel = exportTab.addPanel('Export SVG', true);
			const buttonGroup = panel.addGroup('svgExportButtons', ROW);

			let isExporting = false;
			buttonGroup.addButton(
				'buttonDownloadSvg',
				'LANG_DOWNLOAD_SVG',
				async () => {
					if (isExporting) return;
					isExporting = true;
					try {
						await exportCurrentFrameToSvg(gui, sketch, config);
					} finally {
						isExporting = false;
					}
				}
			);

			panel.open();
		},
	};
}
