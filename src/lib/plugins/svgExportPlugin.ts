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
	capturedStyles: SvgClassStyle[];
};

type SvgPhysicalUnit = 'in' | 'mm';

type SvgExportSettings = {
	dpi: number;
	physicalUnit: SvgPhysicalUnit;
};

type SvgClassStyle = {
	fill?: string;
	stroke?: string;
	strokeWidth?: number;
	fontFamily?: string;
	fontSize?: string;
	fontStyle?: string;
	fontWeight?: string;
	textAnchor?: string;
	dominantBaseline?: string;
	lineHeight?: string;
	direction?: string;
};

const plotSvg = p5plotSvg as unknown as PlotSvgApi;
const SVG_DRAWABLE_TAG_PATTERN =
	/<(path|line|rect|circle|ellipse|polyline|polygon|text)\b/i;
const CLOSED_SVG_SHAPE_TAG_PATTERN =
	/<(circle|ellipse|rect|polygon)\b([^>]*?)(\/?)>/gi;
const SVG_DRAWABLE_TAG_REWRITE_PATTERN =
	/<(circle|ellipse|line|path|polygon|polyline|rect|text)\b([^>]*?)(\/?)>/gi;
const SVG_UNIT_OPTIONS = ['Inches (in)', 'Millimeters (mm)'] as const;
const DEFAULT_SVG_EXPORT_SETTINGS: SvgExportSettings = {
	dpi: 96,
	physicalUnit: 'mm',
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
	'endShape',
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
	'endShape',
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

export function normalizeHexColor(value: string): string | null {
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

export function colorLikeToHex(value: unknown): string | null {
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

function cssNumber(value: number): string {
	const rounded = Number(value.toFixed(4));
	return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function normalizeFontFamily(value: string): string {
	const trimmed = value.trim();
	if (!trimmed) return 'sans-serif';
	if (/^['"].*['"]$/.test(trimmed)) return trimmed;
	if (/\s/.test(trimmed)) return `"${trimmed}"`;
	return trimmed;
}

function mapTextAlignToAnchor(align: string): string {
	switch (align) {
		case 'center':
			return 'middle';
		case 'right':
		case 'end':
			return 'end';
		case 'left':
		case 'start':
		default:
			return 'start';
	}
}

function mapTextBaselineToDominantBaseline(baseline: string): string {
	switch (baseline) {
		case 'top':
			return 'text-before-edge';
		case 'middle':
		case 'center':
			return 'middle';
		case 'bottom':
			return 'text-after-edge';
		case 'hanging':
			return 'hanging';
		case 'ideographic':
			return 'ideographic';
		case 'alphabetic':
		default:
			return 'alphabetic';
	}
}

function canonicalizeStyle(style: SvgClassStyle): string {
	const entries: Array<[string, string]> = [];
	if (style.fill) entries.push(['fill', style.fill]);
	if (style.stroke) entries.push(['stroke', style.stroke]);
	if (style.strokeWidth != null) {
		entries.push(['stroke-width', cssNumber(style.strokeWidth)]);
	}
	if (style.fontFamily) entries.push(['font-family', style.fontFamily]);
	if (style.fontSize) entries.push(['font-size', style.fontSize]);
	if (style.fontStyle) entries.push(['font-style', style.fontStyle]);
	if (style.fontWeight) entries.push(['font-weight', style.fontWeight]);
	if (style.textAnchor) entries.push(['text-anchor', style.textAnchor]);
	if (style.dominantBaseline) {
		entries.push(['dominant-baseline', style.dominantBaseline]);
	}
	if (style.lineHeight) entries.push(['line-height', style.lineHeight]);
	if (style.direction) entries.push(['direction', style.direction]);
	return entries.map(([key, value]) => `${key}:${value}`).join('; ');
}

function stripPaintAndTextPresentationAttributes(attributes: string): string {
	return attributes
		.replace(/\sstyle="[^"]*"/gi, '')
		.replace(/\sfill="[^"]*"/gi, '')
		.replace(/\sstroke="[^"]*"/gi, '')
		.replace(/\sstroke-width="[^"]*"/gi, '')
		.replace(/\sfont-family="[^"]*"/gi, '')
		.replace(/\sfont-size="[^"]*"/gi, '')
		.replace(/\sfont-style="[^"]*"/gi, '')
		.replace(/\sfont-weight="[^"]*"/gi, '')
		.replace(/\stext-anchor="[^"]*"/gi, '')
		.replace(/\sdominant-baseline="[^"]*"/gi, '')
		.replace(/\sline-height="[^"]*"/gi, '')
		.replace(/\sdirection="[^"]*"/gi, '');
}

function attachClassName(attributes: string, className: string): string {
	const classMatch = attributes.match(/\sclass="([^"]*)"/i);
	if (!classMatch) return `${attributes} class="${className}"`;
	const existing = classMatch[1].trim();
	const merged = existing ? `${existing} ${className}` : className;
	return attributes.replace(/\sclass="[^"]*"/i, ` class="${merged}"`);
}

function appendClassStyleBlock(svgContent: string, cssRules: string[]): string {
	if (cssRules.length === 0) return svgContent;
	const styleBlock =
		`  <style id="p5c-svg-style-classes">\n` +
		cssRules.map(rule => `    ${rule}`).join('\n') +
		`\n  </style>\n`;
	if (!/<\/svg>\s*$/i.test(svgContent)) return svgContent + styleBlock;
	return svgContent.replace(/<\/svg>\s*$/i, `${styleBlock}</svg>`);
}

export function applyStyleClassesToSvg(
	svgContent: string,
	capturedStyles: SvgClassStyle[]
): string {
	let styleIndex = 0;
	const styleToClassMap = new Map<string, string>();
	const cssRules: string[] = [];
	const rewritten = svgContent.replace(
		SVG_DRAWABLE_TAG_REWRITE_PATTERN,
		(
			match,
			tagName: string,
			rawAttributes: string,
			selfClosingSlash: string
		) => {
			const style = capturedStyles[styleIndex++];
			if (!style) return match;
			const canonicalStyle = canonicalizeStyle(style);
			if (!canonicalStyle) return match;

			let className = styleToClassMap.get(canonicalStyle);
			if (!className) {
				className = `p5c-s${styleToClassMap.size}`;
				styleToClassMap.set(canonicalStyle, className);
				cssRules.push(`.${className}{${canonicalStyle};}`);
			}

			const strippedAttributes = stripPaintAndTextPresentationAttributes(
				rawAttributes || ''
			);
			const attributesWithClass = attachClassName(
				strippedAttributes,
				className
			);
			return `<${tagName}${attributesWithClass}${selfClosingSlash ? '/' : ''}>`;
		}
	);
	return appendClassStyleBlock(rewritten, cssRules);
}

function emulateStyleAsStrokeDuringRecording(
	sketch: ExtensibleP5
): StyleEmulationSession {
	const renderer = (sketch as any)._renderer;
	const rendererStates = renderer?.states;
	const capturedStyles: SvgClassStyle[] = [];
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
		strokeWeight: Number(rendererStates?.strokeWeight ?? 1),
		fontFamily: normalizeFontFamily(
			String(rendererStates?.textFont?.family || 'sans-serif')
		),
		fontStyle: String(rendererStates?.fontStyle || 'normal'),
		fontWeight: String(rendererStates?.fontWeight || 'normal'),
		textAlign: String(rendererStates?.textAlign || 'left'),
		textBaseline: String(rendererStates?.textBaseline || 'alphabetic'),
		textSize: Number(rendererStates?.textSize ?? 12),
		lineHeight:
			rendererStates?.lineHeight != null ?
				String(rendererStates.lineHeight)
			:	undefined,
		direction:
			typeof rendererStates?.direction === 'string' ?
				String(rendererStates.direction)
			:	undefined,
	};
	let sawFillOnlyClosedShape = false;

	const syncStateFromRenderer = () => {
		state.hasFill = rendererStates?.fillColor != null;
		state.hasStroke = rendererStates?.strokeColor != null;
		state.fillColor =
			colorLikeToHex(rendererStates?.fillColor) || state.fillColor;
		state.strokeColor =
			colorLikeToHex(rendererStates?.strokeColor) || state.strokeColor;
		const strokeWeight = Number(rendererStates?.strokeWeight);
		if (Number.isFinite(strokeWeight)) {
			state.strokeWeight = strokeWeight;
		}
		const textSize = Number(rendererStates?.textSize);
		if (Number.isFinite(textSize)) state.textSize = textSize;
		if (typeof rendererStates?.fontStyle === 'string') {
			state.fontStyle = rendererStates.fontStyle;
		}
		if (typeof rendererStates?.fontWeight === 'string') {
			state.fontWeight = rendererStates.fontWeight;
		}
		if (typeof rendererStates?.textAlign === 'string') {
			state.textAlign = rendererStates.textAlign;
		}
		if (typeof rendererStates?.textBaseline === 'string') {
			state.textBaseline = rendererStates.textBaseline;
		}
		if (rendererStates?.textFont?.family) {
			state.fontFamily = normalizeFontFamily(
				String(rendererStates.textFont.family)
			);
		}
		if (rendererStates?.lineHeight != null) {
			state.lineHeight = String(rendererStates.lineHeight);
		}
		if (typeof rendererStates?.direction === 'string') {
			state.direction = rendererStates.direction;
		}
	};

	const pushStrokeCommand = (color: string | null) => {
		if (!color) return;
		const commands = plotSvg._commands;
		if (!Array.isArray(commands)) return;
		const previous = commands[commands.length - 1];
		if (previous?.type === 'stroke' && previous.color === color) return;
		commands.push({ type: 'stroke', color });
	};

	const extractTextFontFamily = (argument: unknown): string | null => {
		if (typeof argument === 'string') {
			return normalizeFontFamily(argument);
		}
		const family =
			(argument as any)?.family || (argument as any)?.font?.family;
		if (typeof family === 'string' && family.trim().length > 0) {
			return normalizeFontFamily(family);
		}
		return null;
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
	wrapMethod('strokeWeight', (...args: unknown[]) => {
		const value = Number(args[0]);
		if (Number.isFinite(value) && value >= 0) {
			state.strokeWeight = value;
		}
	});
	wrapMethod('textFont', (...args: unknown[]) => {
		const family = extractTextFontFamily(args[0]);
		if (family) state.fontFamily = family;
		const textSize = Number(args[1]);
		if (Number.isFinite(textSize) && textSize > 0) {
			state.textSize = textSize;
		}
	});
	wrapMethod('textSize', (...args: unknown[]) => {
		const value = Number(args[0]);
		if (Number.isFinite(value) && value > 0) {
			state.textSize = value;
		}
	});
	wrapMethod('textStyle', (...args: unknown[]) => {
		const styleValue = String(args[0] ?? '').toLowerCase();
		if (styleValue.includes('bold')) {
			state.fontWeight = 'bold';
		} else if (styleValue) {
			state.fontWeight = 'normal';
		}
		if (styleValue.includes('italic')) {
			state.fontStyle = 'italic';
		} else if (styleValue) {
			state.fontStyle = 'normal';
		}
	});
	wrapMethod('textAlign', (...args: unknown[]) => {
		const align = args[0];
		const baseline = args[1];
		if (typeof align === 'string' && align.length > 0) {
			state.textAlign = align.toLowerCase();
		}
		if (typeof baseline === 'string' && baseline.length > 0) {
			state.textBaseline = baseline.toLowerCase();
		}
	});
	wrapMethod('textLeading', (...args: unknown[]) => {
		const value = Number(args[0]);
		if (Number.isFinite(value) && value > 0) {
			state.lineHeight = `${cssNumber(value)}px`;
		}
	});

	for (const methodName of STYLE_CAPTURE_METHODS) {
		wrapMethod(methodName, () => {
			syncStateFromRenderer();
			const isClosedShape = CLOSED_STYLE_CAPTURE_METHODS.has(methodName);
			const isText = methodName === 'text';
			const style: SvgClassStyle = {};

			if (isClosedShape && state.hasFill && !state.hasStroke) {
				sawFillOnlyClosedShape = true;
			}

			if (isText || isClosedShape) {
				style.fill =
					state.hasFill && state.fillColor ? state.fillColor : 'none';
			} else {
				style.fill = 'none';
			}

			if (state.hasStroke && state.strokeColor) {
				style.stroke = state.strokeColor;
				if (
					Number.isFinite(state.strokeWeight) &&
					state.strokeWeight >= 0
				) {
					style.strokeWidth = state.strokeWeight;
				}
				pushStrokeCommand(state.strokeColor);
			} else {
				style.stroke = 'none';
			}

			if (
				!state.hasStroke &&
				isClosedShape &&
				state.hasFill &&
				state.fillColor
			) {
				pushStrokeCommand(state.fillColor);
			}

			if (isText) {
				style.fontFamily = state.fontFamily;
				style.fontSize = `${cssNumber(state.textSize)}px`;
				style.fontStyle = state.fontStyle || 'normal';
				style.fontWeight = state.fontWeight || 'normal';
				style.textAnchor = mapTextAlignToAnchor(state.textAlign);
				style.dominantBaseline = mapTextBaselineToDominantBaseline(
					state.textBaseline
				);
				if (state.lineHeight) style.lineHeight = state.lineHeight;
				if (state.direction) style.direction = state.direction;
			}

			capturedStyles.push(style);
		});
	}

	return {
		shouldConvertClosedShapeStrokeToFill: () => sawFillOnlyClosedShape,
		capturedStyles,
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
		svgContent = applyStyleClassesToSvg(
			svgContent,
			styleEmulationSession.capturedStyles
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
