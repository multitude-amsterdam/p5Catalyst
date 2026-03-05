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
};

const plotSvg = p5plotSvg as unknown as PlotSvgApi;
const SVG_DRAWABLE_TAG_PATTERN =
	/<(path|line|rect|circle|ellipse|polyline|polygon|text)\b/i;

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

		plotSvg.setSvgDocumentSize?.(sketch.width, sketch.height);
		plotSvg.setSvgFlattenTransforms?.(true);
		plotSvg.setSvgCoordinatePrecision?.(4);
		plotSvg.setSvgTransformPrecision?.(6);

		await sketch.redraw(1);

		const svgContent = plotSvg.endRecordSvg();
		didBeginRecording = false;

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
