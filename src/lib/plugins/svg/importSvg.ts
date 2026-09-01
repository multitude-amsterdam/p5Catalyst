import type { ExtensibleP5 } from '../../types';
import { parseSvgPath, type SvgSubpath } from './path';

type Matrix = [number, number, number, number, number, number];

type SvgStyle = {
	fill: string;
	stroke: string;
	strokeWidth: number;
	opacity: number;
	fillOpacity: number;
	strokeOpacity: number;
	color: string;
	lineCap?: string;
	lineJoin?: string;
	fontFamily?: string;
	fontSize?: number;
	fontStyle?: string;
	fontWeight?: string;
	textAnchor?: string;
	dominantBaseline?: string;
	display?: string;
	visibility?: string;
};

type CssRule = { selectors: string[]; declarations: Record<string, string> };

export type ImportedSvg = {
	readonly width: number;
	readonly height: number;
	readonly viewBox: readonly [number, number, number, number];
	draw: (
		sketch: ExtensibleP5,
		x?: number,
		y?: number,
		width?: number,
		height?: number
	) => void;
};

const DEFAULT_STYLE: SvgStyle = {
	fill: 'black',
	stroke: 'none',
	strokeWidth: 1,
	opacity: 1,
	fillOpacity: 1,
	strokeOpacity: 1,
	color: 'black',
};

const STYLE_PROPERTIES = [
	'fill',
	'stroke',
	'stroke-width',
	'opacity',
	'fill-opacity',
	'stroke-opacity',
	'color',
	'stroke-linecap',
	'stroke-linejoin',
	'font-family',
	'font-size',
	'font-style',
	'font-weight',
	'text-anchor',
	'dominant-baseline',
	'display',
	'visibility',
] as const;

function numbers(value: string | null): number[] {
	return (
		value
			?.match(/[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g)
			?.map(Number)
			.filter(Number.isFinite) || []
	);
}

function svgLength(value: string | null, fallback = 0): number {
	if (!value) return fallback;
	const parsed = Number.parseFloat(value);
	if (!Number.isFinite(parsed)) return fallback;
	if (value.endsWith('mm')) return (parsed * 96) / 25.4;
	if (value.endsWith('cm')) return (parsed * 96) / 2.54;
	if (value.endsWith('in')) return parsed * 96;
	if (value.endsWith('pt')) return (parsed * 96) / 72;
	if (value.endsWith('pc')) return parsed * 16;
	return parsed;
}

function multiply(left: Matrix, right: Matrix): Matrix {
	const [a1, b1, c1, d1, e1, f1] = left;
	const [a2, b2, c2, d2, e2, f2] = right;
	return [
		a1 * a2 + c1 * b2,
		b1 * a2 + d1 * b2,
		a1 * c2 + c1 * d2,
		b1 * c2 + d1 * d2,
		a1 * e2 + c1 * f2 + e1,
		b1 * e2 + d1 * f2 + f1,
	];
}

function parseTransform(value: string | null): Matrix {
	let matrix: Matrix = [1, 0, 0, 1, 0, 0];
	for (const match of value?.matchAll(/([a-zA-Z]+)\s*\(([^)]*)\)/g) || []) {
		const name = match[1].toLowerCase();
		const values = numbers(match[2]);
		let next: Matrix;
		switch (name) {
			case 'matrix':
				if (values.length < 6) continue;
				next = values.slice(0, 6) as Matrix;
				break;
			case 'translate':
				next = [1, 0, 0, 1, values[0] || 0, values[1] || 0];
				break;
			case 'scale': {
				const scaleX = values[0] ?? 1;
				next = [scaleX, 0, 0, values[1] ?? scaleX, 0, 0];
				break;
			}
			case 'rotate': {
				const radians = ((values[0] || 0) * Math.PI) / 180;
				const rotation: Matrix = [
					Math.cos(radians),
					Math.sin(radians),
					-Math.sin(radians),
					Math.cos(radians),
					0,
					0,
				];
				if (values.length >= 3) {
					const [centerX, centerY] = values.slice(1);
					next = multiply(
						multiply([1, 0, 0, 1, centerX, centerY], rotation),
						[1, 0, 0, 1, -centerX, -centerY]
					);
				} else next = rotation;
				break;
			}
			case 'skewx':
				next = [1, 0, Math.tan(((values[0] || 0) * Math.PI) / 180), 1, 0, 0];
				break;
			case 'skewy':
				next = [1, Math.tan(((values[0] || 0) * Math.PI) / 180), 0, 1, 0, 0];
				break;
			default:
				continue;
		}
		matrix = multiply(matrix, next);
	}
	return matrix;
}

function declarations(value: string | null): Record<string, string> {
	const output: Record<string, string> = {};
	for (const part of value?.split(';') || []) {
		const separator = part.indexOf(':');
		if (separator < 0) continue;
		const property = part.slice(0, separator).trim().toLowerCase();
		const declaration = part
			.slice(separator + 1)
			.replace(/\s*!important\s*$/, '')
			.trim();
		if (property && declaration) output[property] = declaration;
	}
	return output;
}

function parseCssRules(root: Element): CssRule[] {
	const rules: CssRule[] = [];
	for (const style of root.querySelectorAll('style')) {
		const css = (style.textContent || '').replace(/\/\*[\s\S]*?\*\//g, '');
		for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
			const selectors = match[1]
				.split(',')
				.map(selector => selector.trim())
				.filter(Boolean);
			if (selectors.length) {
				rules.push({ selectors, declarations: declarations(match[2]) });
			}
		}
	}
	return rules;
}

function ownStyle(element: Element, rules: CssRule[]): Record<string, string> {
	const output: Record<string, string> = {};
	for (const rule of rules) {
		if (
			rule.selectors.some(selector => {
				try {
					return element.matches(selector);
				} catch {
					return false;
				}
			})
		) {
			Object.assign(output, rule.declarations);
		}
	}
	for (const property of STYLE_PROPERTIES) {
		const value = element.getAttribute(property);
		if (value != null) output[property] = value;
	}
	return Object.assign(output, declarations(element.getAttribute('style')));
}

function clampOpacity(value: string | undefined, fallback: number): number {
	if (value == null) return fallback;
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) ? Math.max(0, Math.min(1, parsed)) : fallback;
}

function computedStyle(
	element: Element,
	parent: SvgStyle,
	rules: CssRule[]
): SvgStyle {
	const own = ownStyle(element, rules);
	return {
		fill: own.fill ?? parent.fill,
		stroke: own.stroke ?? parent.stroke,
		strokeWidth: svgLength(own['stroke-width'], parent.strokeWidth),
		opacity: parent.opacity * clampOpacity(own.opacity, 1),
		fillOpacity: clampOpacity(own['fill-opacity'], parent.fillOpacity),
		strokeOpacity: clampOpacity(own['stroke-opacity'], parent.strokeOpacity),
		color: own.color ?? parent.color,
		lineCap: own['stroke-linecap'] ?? parent.lineCap,
		lineJoin: own['stroke-linejoin'] ?? parent.lineJoin,
		fontFamily: own['font-family'] ?? parent.fontFamily,
		fontSize: svgLength(own['font-size'], parent.fontSize ?? 16),
		fontStyle: own['font-style'] ?? parent.fontStyle,
		fontWeight: own['font-weight'] ?? parent.fontWeight,
		textAnchor: own['text-anchor'] ?? parent.textAnchor,
		dominantBaseline: own['dominant-baseline'] ?? parent.dominantBaseline,
		display: own.display ?? parent.display,
		visibility: own.visibility ?? parent.visibility,
	};
}

function colorWithOpacity(
	sketch: ExtensibleP5,
	value: string,
	opacity: number
) {
	const color = sketch.color(value === 'currentColor' ? 'black' : value);
	color.setAlpha(opacity * 255);
	return color;
}

function applyStyle(sketch: ExtensibleP5, style: SvgStyle) {
	const fill = style.fill === 'currentColor' ? style.color : style.fill;
	const stroke = style.stroke === 'currentColor' ? style.color : style.stroke;
	if (fill === 'none') sketch.noFill();
	else sketch.fill(colorWithOpacity(sketch, fill, style.opacity * style.fillOpacity));
	if (stroke === 'none') sketch.noStroke();
	else {
		sketch.stroke(
			colorWithOpacity(sketch, stroke, style.opacity * style.strokeOpacity)
		);
		sketch.strokeWeight(style.strokeWidth);
	}
	if (style.lineCap) sketch.strokeCap(style.lineCap as any);
	if (style.lineJoin) sketch.strokeJoin(style.lineJoin as any);
}

function drawSubpath(sketch: ExtensibleP5, path: SvgSubpath) {
	sketch.beginShape();
	sketch.vertex(path.startX, path.startY);
	let currentX = path.startX;
	let currentY = path.startY;
	for (const segment of path.segments) {
		if (segment.type === 'line') sketch.vertex(segment.x, segment.y);
		else if (segment.type === 'cubic') {
			sketch.bezierVertex(segment.control1X, segment.control1Y);
			sketch.bezierVertex(segment.control2X, segment.control2Y);
			sketch.bezierVertex(segment.x, segment.y);
		} else {
			sketch.bezierVertex(
				currentX + (2 / 3) * (segment.controlX - currentX),
				currentY + (2 / 3) * (segment.controlY - currentY)
			);
			sketch.bezierVertex(
				segment.x + (2 / 3) * (segment.controlX - segment.x),
				segment.y + (2 / 3) * (segment.controlY - segment.y)
			);
			sketch.bezierVertex(segment.x, segment.y);
		}
		currentX = segment.x;
		currentY = segment.y;
	}
	if (path.closed) sketch.endShape(sketch.CLOSE);
	else sketch.endShape();
}

function drawPoints(sketch: ExtensibleP5, value: string | null, close: boolean) {
	const coordinates = numbers(value);
	if (coordinates.length < 2) return;
	sketch.beginShape();
	for (let index = 0; index + 1 < coordinates.length; index += 2) {
		sketch.vertex(coordinates[index], coordinates[index + 1]);
	}
	if (close) sketch.endShape(sketch.CLOSE);
	else sketch.endShape();
}

function drawText(sketch: ExtensibleP5, element: Element, style: SvgStyle) {
	if (style.fontFamily) sketch.textFont(style.fontFamily);
	if (style.fontSize) sketch.textSize(style.fontSize);
	const bold = style.fontWeight === 'bold' || Number(style.fontWeight) >= 600;
	const italic = style.fontStyle === 'italic' || style.fontStyle === 'oblique';
	if (bold && italic) sketch.textStyle(sketch.BOLDITALIC);
	else if (bold) sketch.textStyle(sketch.BOLD);
	else if (italic) sketch.textStyle(sketch.ITALIC);
	else sketch.textStyle(sketch.NORMAL);
	const horizontal =
		style.textAnchor === 'middle' ? sketch.CENTER
		: style.textAnchor === 'end' ? sketch.RIGHT
		: sketch.LEFT;
	const vertical =
		style.dominantBaseline === 'middle' ? sketch.CENTER
		: style.dominantBaseline === 'hanging' ||
			  style.dominantBaseline === 'text-before-edge' ?
			sketch.TOP
		: style.dominantBaseline === 'text-after-edge' ? sketch.BOTTOM
		: sketch.BASELINE;
	const x = numbers(element.getAttribute('x'))[0] || 0;
	const y = numbers(element.getAttribute('y'))[0] || 0;
	sketch.textAlign(horizontal, vertical);
	sketch.text(element.textContent || '', x, y);
}

function drawGeometry(sketch: ExtensibleP5, element: Element, style: SvgStyle) {
	const tag = element.localName.toLowerCase();
	switch (tag) {
		case 'line':
			sketch.line(
				svgLength(element.getAttribute('x1')),
				svgLength(element.getAttribute('y1')),
				svgLength(element.getAttribute('x2')),
				svgLength(element.getAttribute('y2'))
			);
			break;
		case 'rect': {
			const x = svgLength(element.getAttribute('x'));
			const y = svgLength(element.getAttribute('y'));
			const width = svgLength(element.getAttribute('width'));
			const height = svgLength(element.getAttribute('height'));
			const radius = Math.max(
				svgLength(element.getAttribute('rx')),
				svgLength(element.getAttribute('ry'))
			);
			if (radius > 0) sketch.rect(x, y, width, height, radius);
			else sketch.rect(x, y, width, height);
			break;
		}
		case 'circle':
			sketch.ellipse(
				svgLength(element.getAttribute('cx')),
				svgLength(element.getAttribute('cy')),
				svgLength(element.getAttribute('r')) * 2
			);
			break;
		case 'ellipse':
			sketch.ellipse(
				svgLength(element.getAttribute('cx')),
				svgLength(element.getAttribute('cy')),
				svgLength(element.getAttribute('rx')) * 2,
				svgLength(element.getAttribute('ry')) * 2
			);
			break;
		case 'polyline':
			drawPoints(sketch, element.getAttribute('points'), false);
			break;
		case 'polygon':
			drawPoints(sketch, element.getAttribute('points'), true);
			break;
		case 'path':
			for (const path of parseSvgPath(element.getAttribute('d') || '')) {
				drawSubpath(sketch, path);
			}
			break;
		case 'text':
			drawText(sketch, element, style);
			break;
	}
}

const CONTAINER_TAGS = new Set(['svg', 'g', 'a', 'symbol']);
const SKIPPED_TAGS = new Set([
	'defs',
	'style',
	'script',
	'clipPath',
	'mask',
	'pattern',
	'linearGradient',
	'radialGradient',
	'metadata',
	'title',
	'desc',
]);

function drawElement(
	sketch: ExtensibleP5,
	element: Element,
	parentStyle: SvgStyle,
	rules: CssRule[]
) {
	if (SKIPPED_TAGS.has(element.localName)) return;
	const style = computedStyle(element, parentStyle, rules);
	if (style.display === 'none' || style.visibility === 'hidden') return;

	sketch.push();
	try {
		const matrix = parseTransform(element.getAttribute('transform'));
		if (matrix.some((value, index) => value !== [1, 0, 0, 1, 0, 0][index])) {
			sketch.applyMatrix(...matrix);
		}
		applyStyle(sketch, style);
		if (!CONTAINER_TAGS.has(element.localName)) {
			drawGeometry(sketch, element, style);
		}
		for (const child of Array.from(element.children)) {
			drawElement(sketch, child, style, rules);
		}
	} finally {
		sketch.pop();
	}
}

export function parseSvg(svgContent: string): ImportedSvg {
	const document = new DOMParser().parseFromString(svgContent, 'image/svg+xml');
	const parserError = document.querySelector('parsererror');
	if (parserError) throw new Error(`Invalid SVG: ${parserError.textContent}`);
	const root = document.documentElement;
	if (root.localName !== 'svg') throw new Error('Expected an SVG root element.');

	const rawViewBox = numbers(root.getAttribute('viewBox'));
	const fallbackWidth = svgLength(root.getAttribute('width'), rawViewBox[2] || 300);
	const fallbackHeight = svgLength(
		root.getAttribute('height'),
		rawViewBox[3] || 150
	);
	const viewBox: [number, number, number, number] =
		rawViewBox.length >= 4 ?
			(rawViewBox.slice(0, 4) as [number, number, number, number])
		: [0, 0, fallbackWidth, fallbackHeight];
	const width = fallbackWidth || viewBox[2];
	const height = fallbackHeight || viewBox[3];
	const rules = parseCssRules(root);
	const preserveAspectRatio = root.getAttribute('preserveAspectRatio') || 'xMidYMid meet';

	return {
		width,
		height,
		viewBox,
		draw: (
			sketch: ExtensibleP5,
			x = 0,
			y = 0,
			drawWidth = width,
			drawHeight = height
		) => {
			const [viewX, viewY, viewWidth, viewHeight] = viewBox;
			const scaleX = drawWidth / viewWidth;
			const scaleY = drawHeight / viewHeight;
			const stretch = preserveAspectRatio.trim().startsWith('none');
			const scale = preserveAspectRatio.includes('slice')
				? Math.max(scaleX, scaleY)
				: Math.min(scaleX, scaleY);
			const appliedScaleX = stretch ? scaleX : scale;
			const appliedScaleY = stretch ? scaleY : scale;
			const offsetX = stretch ? 0 : (drawWidth - viewWidth * scale) / 2;
			const offsetY = stretch ? 0 : (drawHeight - viewHeight * scale) / 2;

			sketch.push();
			try {
				sketch.translate(x + offsetX, y + offsetY);
				sketch.scale(appliedScaleX, appliedScaleY);
				sketch.translate(-viewX, -viewY);
				drawElement(sketch, root, DEFAULT_STYLE, rules);
			} finally {
				sketch.pop();
			}
		},
	};
}
