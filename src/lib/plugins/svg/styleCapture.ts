import type { ExtensibleP5 } from '../../types';
import { pushPlotSvgStroke } from './plotSvgAdapter';
import { formatSvgNumber } from './settings';

export type SvgClassStyle = {
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

const CLOSED_SHAPE_METHODS = new Set([
	'arc',
	'circle',
	'ellipse',
	'quad',
	'rect',
	'square',
	'triangle',
	'endShape',
]);

function replaceMethod(
	sketch: ExtensibleP5,
	name: string,
	replacement: Function
): () => void {
	const descriptor = Object.getOwnPropertyDescriptor(sketch, name);
	Object.defineProperty(sketch, name, {
		value: replacement,
		writable: true,
		configurable: descriptor?.configurable ?? true,
		enumerable: descriptor?.enumerable ?? false,
	});

	let restored = false;
	return () => {
		if (restored) return;
		restored = true;
		if (descriptor) Object.defineProperty(sketch, name, descriptor);
		else delete (sketch as any)[name];
	};
}

export function shimCircleToEllipseDuringRecording(sketch: ExtensibleP5) {
	const circle = (sketch as any).circle;
	const ellipse = (sketch as any).ellipse;
	if (typeof circle !== 'function' || typeof ellipse !== 'function') {
		return () => {};
	}

	return replaceMethod(
		sketch,
		'circle',
		function (this: ExtensibleP5, x: number, y: number, diameter: number) {
			return ellipse.call(this, x, y, diameter, diameter);
		}
	);
}

export function normalizeHexColor(value: string): string | null {
	const match = value
		.trim()
		.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
	if (!match) return null;
	const raw = match[1].toLowerCase();
	return raw.length <= 4 ?
			`#${[...raw].map(char => char.repeat(2)).join('')}`
		:	`#${raw}`;
}

function componentToHex(value: number): string {
	const byte = Math.max(0, Math.min(255, Math.round(value)));
	return byte.toString(16).padStart(2, '0');
}

function colorArrayToHex(values: number[]): string | null {
	if (values.length < 3) return null;
	const normalized = values.slice(0, 3).every(value => value <= 1);
	const scale = normalized ? 255 : 1;
	const [red, green, blue] = values.map(value => Number(value) * scale);
	if (![red, green, blue].every(Number.isFinite)) return null;

	const alphaValue = Number(values[3] ?? (normalized ? 1 : 255));
	const alpha = normalized ? alphaValue : alphaValue / 255;
	const rgb = `#${componentToHex(red)}${componentToHex(green)}${componentToHex(blue)}`;
	return Number.isFinite(alpha) && alpha < 0.999 ?
			`${rgb}${componentToHex(alpha * 255)}`
		:	rgb;
}

export function colorLikeToHex(value: unknown): string | null {
	if (!value) return null;
	if (typeof value === 'string') return normalizeHexColor(value);
	const candidate =
		Array.isArray(value) ? value
		: Array.isArray((value as any)?._array) ? (value as any)._array
		: Array.isArray((value as any)?.levels) ? (value as any).levels
		: null;
	return candidate ? colorArrayToHex(candidate.map(Number)) : null;
}

function resolveColor(sketch: ExtensibleP5, args: unknown[]): string | null {
	if (args.length === 0) return null;
	if (typeof args[0] === 'string') {
		const hex = normalizeHexColor(args[0]);
		if (hex) return hex;
	}
	try {
		return colorLikeToHex((sketch as any).color?.(...args));
	} catch {
		return null;
	}
}

export function shimBackgroundToRectDuringRecording(sketch: ExtensibleP5) {
	const background = (sketch as any).background;
	if (typeof background !== 'function') return () => {};

	return replaceMethod(
		sketch,
		'background',
		function (this: ExtensibleP5, ...args: unknown[]) {
			const color = resolveColor(this, args);
			const { rect, fill, noStroke, push, pop, resetMatrix, rectMode } =
				this as any;
			if (
				!color ||
				![rect, fill, noStroke, push, pop].every(
					method => typeof method === 'function'
				)
			) {
				return background.apply(this, args);
			}

			push.call(this);
			try {
				resetMatrix?.call(this);
				rectMode?.call(this, (this as any).CORNER || 'corner');
				noStroke.call(this);
				fill.call(this, color);
				return rect.call(this, 0, 0, this.width, this.height);
			} finally {
				pop.call(this);
			}
		}
	);
}

function normalizeFontFamily(value: string): string {
	const trimmed = value.trim();
	if (!trimmed) return 'sans-serif';
	if (/^['"].*['"]$/.test(trimmed)) return trimmed;
	return /\s/.test(trimmed) ? `"${trimmed}"` : trimmed;
}

function textAnchor(align: string): string {
	if (align === 'center') return 'middle';
	if (align === 'right' || align === 'end') return 'end';
	return 'start';
}

function dominantBaseline(baseline: string): string {
	if (baseline === 'top') return 'text-before-edge';
	if (baseline === 'middle' || baseline === 'center') return 'middle';
	if (baseline === 'bottom') return 'text-after-edge';
	if (baseline === 'hanging' || baseline === 'ideographic') return baseline;
	return 'alphabetic';
}

function captureStyles(sketch: ExtensibleP5) {
	const renderer = (sketch as any)._renderer;
	const rendererStates = renderer?.states;
	const capturedStyles: SvgClassStyle[] = [];
	const restorers: Array<() => void> = [];
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
			rendererStates?.lineHeight == null ?
				undefined
			:	String(rendererStates.lineHeight),
		direction:
			typeof rendererStates?.direction === 'string' ?
				rendererStates.direction
			:	undefined,
	};
	let sawFillOnlyClosedShape = false;

	const syncRendererState = () => {
		state.hasFill = rendererStates?.fillColor != null;
		state.hasStroke = rendererStates?.strokeColor != null;
		state.fillColor =
			colorLikeToHex(rendererStates?.fillColor) || state.fillColor;
		state.strokeColor =
			colorLikeToHex(rendererStates?.strokeColor) || state.strokeColor;
		const strokeWeight = Number(rendererStates?.strokeWeight);
		if (Number.isFinite(strokeWeight)) state.strokeWeight = strokeWeight;
		const textSize = Number(rendererStates?.textSize);
		if (Number.isFinite(textSize)) state.textSize = textSize;
		if (typeof rendererStates?.fontStyle === 'string')
			state.fontStyle = rendererStates.fontStyle;
		if (typeof rendererStates?.fontWeight === 'string')
			state.fontWeight = rendererStates.fontWeight;
		if (typeof rendererStates?.textAlign === 'string')
			state.textAlign = rendererStates.textAlign;
		if (typeof rendererStates?.textBaseline === 'string')
			state.textBaseline = rendererStates.textBaseline;
		if (rendererStates?.textFont?.family)
			state.fontFamily = normalizeFontFamily(
				String(rendererStates.textFont.family)
			);
		if (rendererStates?.lineHeight != null)
			state.lineHeight = String(rendererStates.lineHeight);
		if (typeof rendererStates?.direction === 'string')
			state.direction = rendererStates.direction;
	};

	const wrap = (name: string, before: (...args: unknown[]) => void) => {
		const original = (sketch as any)[name];
		if (typeof original !== 'function') return;
		restorers.push(
			replaceMethod(
				sketch,
				name,
				function (this: ExtensibleP5, ...args: unknown[]) {
					before(...args);
					return original.apply(this, args);
				}
			)
		);
	};

	const restore = () => {
		for (const restoreMethod of restorers.reverse()) restoreMethod();
	};

	try {
		wrap('fill', (...args) => {
			state.hasFill = true;
			state.fillColor = resolveColor(sketch, args) || state.fillColor;
		});
		wrap('noFill', () => {
			state.hasFill = false;
		});
		wrap('stroke', (...args) => {
			state.hasStroke = true;
			state.strokeColor = resolveColor(sketch, args) || state.strokeColor;
		});
		wrap('noStroke', () => {
			state.hasStroke = false;
		});
		wrap('strokeWeight', value => {
			const weight = Number(value);
			if (Number.isFinite(weight) && weight >= 0)
				state.strokeWeight = weight;
		});
		wrap('textFont', (font, size) => {
			const family =
				typeof font === 'string' ? font : (
					(font as any)?.family || (font as any)?.font?.family
				);
			if (typeof family === 'string' && family.trim())
				state.fontFamily = normalizeFontFamily(family);
			const textSize = Number(size);
			if (Number.isFinite(textSize) && textSize > 0)
				state.textSize = textSize;
		});
		wrap('textSize', value => {
			const size = Number(value);
			if (Number.isFinite(size) && size > 0) state.textSize = size;
		});
		wrap('textStyle', value => {
			const style = String(value ?? '').toLowerCase();
			if (style) {
				state.fontWeight = style.includes('bold') ? 'bold' : 'normal';
				state.fontStyle =
					style.includes('italic') ? 'italic' : 'normal';
			}
		});
		wrap('textAlign', (align, baseline) => {
			if (typeof align === 'string' && align)
				state.textAlign = align.toLowerCase();
			if (typeof baseline === 'string' && baseline)
				state.textBaseline = baseline.toLowerCase();
		});
		wrap('textLeading', value => {
			const leading = Number(value);
			if (Number.isFinite(leading) && leading > 0)
				state.lineHeight = `${formatSvgNumber(leading)}px`;
		});

		for (const methodName of STYLE_CAPTURE_METHODS) {
			wrap(methodName, () => {
				syncRendererState();
				const closed = CLOSED_SHAPE_METHODS.has(methodName);
				const text = methodName === 'text';
				const style: SvgClassStyle = {
					fill:
						text || closed ?
							state.hasFill && state.fillColor ?
								state.fillColor
							:	'none'
						:	'none',
					stroke:
						state.hasStroke && state.strokeColor ?
							state.strokeColor
						:	'none',
				};

				if (closed && state.hasFill && !state.hasStroke)
					sawFillOnlyClosedShape = true;
				if (state.hasStroke && state.strokeColor) {
					if (
						Number.isFinite(state.strokeWeight) &&
						state.strokeWeight >= 0
					)
						style.strokeWidth = state.strokeWeight;
					pushPlotSvgStroke(state.strokeColor);
				} else if (closed && state.hasFill && state.fillColor) {
					pushPlotSvgStroke(state.fillColor);
				}

				if (text) {
					Object.assign(style, {
						fontFamily: state.fontFamily,
						fontSize: `${formatSvgNumber(state.textSize)}px`,
						fontStyle: state.fontStyle || 'normal',
						fontWeight: state.fontWeight || 'normal',
						textAnchor: textAnchor(state.textAlign),
						dominantBaseline: dominantBaseline(state.textBaseline),
					});
					if (state.lineHeight) style.lineHeight = state.lineHeight;
					if (state.direction) style.direction = state.direction;
				}
				capturedStyles.push(style);
			});
		}
	} catch (error) {
		restore();
		throw error;
	}

	return {
		capturedStyles,
		shouldConvertClosedShapeStrokeToFill: () => sawFillOnlyClosedShape,
		restore,
	};
}

export function installRecordingShims(sketch: ExtensibleP5) {
	const restorers: Array<() => void> = [];
	try {
		restorers.push(shimCircleToEllipseDuringRecording(sketch));
		const styles = captureStyles(sketch);
		restorers.push(styles.restore);
		restorers.push(shimBackgroundToRectDuringRecording(sketch));
		let restored = false;
		return {
			capturedStyles: styles.capturedStyles,
			shouldConvertClosedShapeStrokeToFill:
				styles.shouldConvertClosedShapeStrokeToFill,
			restore: () => {
				if (restored) return;
				restored = true;
				for (const restore of restorers.reverse()) restore();
			},
		};
	} catch (error) {
		for (const restore of restorers.reverse()) restore();
		throw error;
	}
}
