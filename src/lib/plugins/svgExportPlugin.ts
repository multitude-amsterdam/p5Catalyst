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
	setSvgResolutionDPI?: (dpi: number) => void;
	setSvgResolutionDPCM?: (dpcm: number) => void;
	_commands?: PlotSvgCommand[];
};

type PlotSvgCommand = {
	type: string;
	color?: string;
};

type StyleEmulationSession = {
	shouldConvertClosedShapeStrokeToFill: () => boolean;
};

type SvgPhysicalUnit = 'in' | 'mm';

type SvgExportSettings = {
	dpi: number;
	physicalUnit: SvgPhysicalUnit;
};

const plotSvg = p5plotSvg as unknown as PlotSvgApi;
const SVG_DRAWABLE_TAG_PATTERN =
	/<(path|line|rect|circle|ellipse|polyline|polygon|text)\b/i;
const CLOSED_SVG_SHAPE_TAG_PATTERN =
	/<(circle|ellipse|rect|polygon)\b([^>]*?)(\/?)>/gi;
const SVG_UNIT_OPTIONS = ['Inches (in)', 'Millimeters (mm)'] as const;
const DEFAULT_SVG_EXPORT_SETTINGS: SvgExportSettings = {
	dpi: 96,
	physicalUnit: 'in',
};

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

function clampByte(value: number): number {
	return Math.max(0, Math.min(255, Math.round(value)));
}

function componentToHex(value: number): string {
	return clampByte(value).toString(16).padStart(2, '0');
}

function normalizeHexColor(value: string): string | null {
	const trimmed = value.trim();
	const hexMatch = trimmed.match(
		/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i
	);
	if (!hexMatch) return null;

	const raw = hexMatch[1].toLowerCase();
	if (raw.length === 3 || raw.length === 4) {
		return (
			'#' +
			raw
				.split('')
				.map(part => `${part}${part}`)
				.join('')
		);
	}
	return `#${raw}`;
}

function colorArrayToHex(arrayValue: number[]): string | null {
	if (arrayValue.length < 3) return null;
	const rgbScale =
		arrayValue[0] <= 1 && arrayValue[1] <= 1 && arrayValue[2] <= 1 ?
			255
		:	1;
	const r = Number(arrayValue[0]) * rgbScale;
	const g = Number(arrayValue[1]) * rgbScale;
	const b = Number(arrayValue[2]) * rgbScale;
	if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
		return null;
	}

	const alphaRaw = Number(arrayValue[3] ?? (rgbScale === 255 ? 1 : 255));
	const alpha = rgbScale === 255 ? alphaRaw : alphaRaw / 255;
	const rgbHex =
		`#${componentToHex(r)}` +
		`${componentToHex(g)}` +
		`${componentToHex(b)}`;
	if (!Number.isFinite(alpha) || alpha >= 0.999) return rgbHex;
	return `${rgbHex}${componentToHex(alpha * 255)}`;
}

function colorLikeToHex(value: unknown): string | null {
	if (!value) return null;
	if (typeof value === 'string') return normalizeHexColor(value);
	if (Array.isArray(value)) {
		const numericArray = value.map(component => Number(component));
		return colorArrayToHex(numericArray);
	}

	const normalizedArray = (value as any)?._array;
	if (Array.isArray(normalizedArray)) {
		const numericArray = normalizedArray.map((component: unknown) =>
			Number(component)
		);
		return colorArrayToHex(numericArray);
	}

	const levels = (value as any)?.levels;
	if (Array.isArray(levels)) {
		const numericArray = levels.map((component: unknown) =>
			Number(component)
		);
		return colorArrayToHex(numericArray);
	}

	return null;
}

function resolveColorToHex(
	sketch: ExtensibleP5,
	args: unknown[]
): string | null {
	if (args.length === 0) return null;
	const firstArg = args[0];
	if (typeof firstArg === 'string') {
		const normalizedHex = normalizeHexColor(firstArg);
		if (normalizedHex) return normalizedHex;
	}

	try {
		const colorValue = (sketch as any).color?.(...args);
		return colorLikeToHex(colorValue);
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

			const remainingStyleDeclarations =
				styleMatch ? removePaintStyleDeclarations(styleMatch[1]) : [];
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

function sanitizeDpi(value: number): number {
	return Number.isFinite(value) && value > 0 ? value : 96;
}

function formatPhysicalSize(value: number): string {
	const rounded = Number(value.toFixed(4));
	return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

export function rewriteSvgPhysicalSize(
	svgContent: string,
	widthPx: number,
	heightPx: number,
	physicalUnit: SvgPhysicalUnit,
	dpi: number
): string {
	const safeDpi = sanitizeDpi(dpi);
	const widthInches = widthPx / safeDpi;
	const heightInches = heightPx / safeDpi;
	const widthPhysical =
		physicalUnit === 'mm' ? widthInches * 25.4 : widthInches;
	const heightPhysical =
		physicalUnit === 'mm' ? heightInches * 25.4 : heightInches;
	const output = svgContent
		.replace(
			/\swidth="[^"]*"/i,
			` width="${formatPhysicalSize(widthPhysical)}${physicalUnit}"`
		)
		.replace(
			/\sheight="[^"]*"/i,
			` height="${formatPhysicalSize(heightPhysical)}${physicalUnit}"`
		);
	return output;
}

function applyPhysicalSizeSettingsToRecorder(settings: SvgExportSettings) {
	const dpi = sanitizeDpi(settings.dpi);
	plotSvg.setSvgResolutionDPI?.(dpi);
	if (settings.physicalUnit === 'mm') {
		plotSvg.setSvgResolutionDPCM?.(dpi / 2.54);
	}
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
			colorLikeToHex(rendererStates?.fillColor) ||
			colorLikeToHex(renderer?.curFillColor),
		strokeColor:
			colorLikeToHex(rendererStates?.strokeColor) ||
			colorLikeToHex(renderer?.curStrokeColor),
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
		state.fillColor = resolveColorToHex(sketch, args) || state.fillColor;
	});
	wrapMethod('noFill', () => {
		state.hasFill = false;
	});
	wrapMethod('stroke', (...args: unknown[]) => {
		state.hasStroke = true;
		state.strokeColor =
			resolveColorToHex(sketch, args) || state.strokeColor;
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
	config: Config,
	exportSettings: SvgExportSettings
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
		applyPhysicalSizeSettingsToRecorder(exportSettings);
		// plotSvg.setSvgFlattenTransforms?.(true);
		plotSvg.setSvgCoordinatePrecision?.(4);
		plotSvg.setSvgTransformPrecision?.(6);

		await sketch.redraw(1);

		let svgContent = plotSvg.endRecordSvg();
		didBeginRecording = false;
		if (styleEmulationSession.shouldConvertClosedShapeStrokeToFill()) {
			svgContent = convertClosedShapeStrokesToFills(svgContent);
		}
		svgContent = rewriteSvgPhysicalSize(
			svgContent,
			sketch.width,
			sketch.height,
			exportSettings.physicalUnit,
			exportSettings.dpi
		);

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
			const settingsGroup = panel.addGroup('svgExportSettings', ROW);
			const buttonGroup = panel.addGroup('svgExportButtons', ROW);
			const exportSettings: SvgExportSettings = {
				...DEFAULT_SVG_EXPORT_SETTINGS,
			};

			settingsGroup.addSelect(
				'svgUnitSelect',
				'Units',
				[...SVG_UNIT_OPTIONS],
				0,
				(_, value) => {
					exportSettings.physicalUnit =
						value === SVG_UNIT_OPTIONS[1] ? 'mm' : 'in';
				}
			);
			settingsGroup.addTextbox(
				'svgDpiTextbox',
				'Resolution (DPI)',
				String(exportSettings.dpi),
				(_, value) => {
					const parsedDpi = parseFloat(value as string);
					if (!Number.isFinite(parsedDpi) || parsedDpi <= 0) return;
					exportSettings.dpi = parsedDpi;
				}
			);

			let isExporting = false;
			buttonGroup.addButton(
				'buttonDownloadSvg',
				'LANG_DOWNLOAD_SVG',
				async () => {
					if (isExporting) return;
					isExporting = true;
					try {
						await exportCurrentFrameToSvg(
							gui,
							sketch,
							config,
							exportSettings
						);
					} finally {
						isExporting = false;
					}
				}
			);

			panel.open();
		},
	};
}
