import type { SvgExportSettings } from './settings';
import { formatSvgNumber, resolutionToDpi } from './settings';
import type { SvgClassStyle } from './styleCapture';

const DRAWABLE_TAG_PATTERN =
	/<(path|line|rect|circle|ellipse|polyline|polygon|text)\b/i;
const CLOSED_SHAPE_PATTERN = /<(circle|ellipse|rect|polygon)\b([^>]*?)(\/?)>/gi;
const DRAWABLE_TAG_REWRITE_PATTERN =
	/<(circle|ellipse|line|path|polygon|polyline|rect|text)\b([^>]*?)(\/?)>/gi;

export function hasDrawableSvgContent(svgContent: string): boolean {
	return DRAWABLE_TAG_PATTERN.test(svgContent);
}

export function convertClosedShapeStrokesToFills(
	svgContent: string,
	defaultFillColor = 'black'
): string {
	return svgContent.replace(
		CLOSED_SHAPE_PATTERN,
		(
			match,
			tagName: string,
			rawAttributes: string,
			selfClosing: string
		) => {
			const styleMatch = rawAttributes.match(/\sstyle="([^"]*)"/i);
			const stroke = styleMatch?.[1]
				.match(/(?:^|;)\s*stroke\s*:\s*([^;]+)/i)?.[1]
				?.trim();
			const fill = stroke || defaultFillColor;
			if (!fill) return match;

			const remainingStyle = (styleMatch?.[1] || '')
				.split(';')
				.map(declaration => declaration.trim())
				.filter(
					declaration =>
						declaration && !/^(stroke|fill)\s*:/i.test(declaration)
				);
			const attributes = rawAttributes
				.replace(/\sstyle="[^"]*"/i, '')
				.replace(/\s(?:fill|stroke)="[^"]*"/gi, '');
			const style = [
				`fill:${fill}`,
				'stroke:none',
				...remainingStyle,
			].join('; ');
			return `<${tagName}${attributes} style="${style};"${selfClosing ? '/' : ''}>`;
		}
	);
}

export function rewriteSvgPhysicalSize(
	svgContent: string,
	widthPx: number,
	heightPx: number,
	physicalUnit: SvgExportSettings['physicalUnit'],
	dpi: number
): string {
	const safeDpi = Number.isFinite(dpi) && dpi > 0 ? dpi : 144;
	const unitScale = physicalUnit === 'mm' ? 25.4 : 1;
	const width = formatSvgNumber((widthPx / safeDpi) * unitScale);
	const height = formatSvgNumber((heightPx / safeDpi) * unitScale);
	return svgContent
		.replace(/\swidth="[^"]*"/i, ` width="${width}${physicalUnit}"`)
		.replace(/\sheight="[^"]*"/i, ` height="${height}${physicalUnit}"`);
}

const STYLE_PROPERTIES: Array<[keyof SvgClassStyle, string]> = [
	['fill', 'fill'],
	['stroke', 'stroke'],
	['strokeWidth', 'stroke-width'],
	['fontFamily', 'font-family'],
	['fontSize', 'font-size'],
	['fontStyle', 'font-style'],
	['fontWeight', 'font-weight'],
	['textAnchor', 'text-anchor'],
	['dominantBaseline', 'dominant-baseline'],
	['lineHeight', 'line-height'],
	['direction', 'direction'],
];

function canonicalizeStyle(style: SvgClassStyle): string {
	return STYLE_PROPERTIES.flatMap(([property, cssProperty]) => {
		const value = style[property];
		if (value == null) return [];
		return [
			`${cssProperty}:${typeof value === 'number' ? formatSvgNumber(value) : value}`,
		];
	}).join('; ');
}

function addClass(attributes: string, className: string): string {
	const classMatch = attributes.match(/\sclass="([^"]*)"/i);
	if (!classMatch) return `${attributes} class="${className}"`;
	const classes = [classMatch[1].trim(), className].filter(Boolean).join(' ');
	return attributes.replace(/\sclass="[^"]*"/i, ` class="${classes}"`);
}

function addStyleRules(svgContent: string, rules: string[]): string {
	if (rules.length === 0) return svgContent;
	const formatted = rules.map(rule => `    ${rule}`).join('\n');
	const stylePattern = /<style\b([^>]*)>([\s\S]*?)<\/style>/i;
	if (stylePattern.test(svgContent)) {
		return svgContent.replace(
			stylePattern,
			(_, attributes: string, content: string) => {
				const existing = content.replace(/\s*$/, '');
				return `<style${attributes}>${existing ? `${existing}\n` : '\n'}${formatted}\n  </style>`;
			}
		);
	}

	const styleBlock = `\n  <style>\n${formatted}\n  </style>`;
	return /<svg\b[^>]*>/i.test(svgContent) ?
			svgContent.replace(
				/<svg\b[^>]*>/i,
				match => `${match}${styleBlock}`
			)
		:	`${styleBlock}\n${svgContent}`;
}

export function applyStyleClassesToSvg(
	svgContent: string,
	capturedStyles: SvgClassStyle[]
): string {
	let styleIndex = 0;
	const classes = new Map<string, string>();
	const rules: string[] = [];
	const rewritten = svgContent.replace(
		DRAWABLE_TAG_REWRITE_PATTERN,
		(
			match,
			tagName: string,
			rawAttributes: string,
			selfClosing: string
		) => {
			const style = capturedStyles[styleIndex++];
			if (!style) return match;
			const css = canonicalizeStyle(style);
			if (!css) return match;

			let className = classes.get(css);
			if (!className) {
				className = `p5c-s${classes.size}`;
				classes.set(css, className);
				rules.push(`.${className}{${css};}`);
			}

			const attributes = rawAttributes.replace(
				/\s(?:style|fill|stroke|stroke-width|font-family|font-size|font-style|font-weight|text-anchor|dominant-baseline|line-height|direction)="[^"]*"/gi,
				''
			);
			return `<${tagName}${addClass(attributes, className)}${selfClosing ? '/' : ''}>`;
		}
	);
	return addStyleRules(rewritten, rules);
}

export function finalizeSvg(
	svgContent: string,
	width: number,
	height: number,
	settings: SvgExportSettings,
	capturedStyles: SvgClassStyle[],
	convertClosedShapes: boolean
): string {
	const withFills =
		convertClosedShapes ?
			convertClosedShapeStrokesToFills(svgContent)
		:	svgContent;
	const withSize = rewriteSvgPhysicalSize(
		withFills,
		width,
		height,
		settings.physicalUnit,
		resolutionToDpi(settings.resolution, settings.resolutionMetric)
	);
	return applyStyleClassesToSvg(withSize, capturedStyles);
}
