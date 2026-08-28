import type { CatalystGUI } from '../gui/CatalystGUI';
import { ROW } from '../gui/components/groups/Group';
import type { Config, ExtensibleP5, Plugin } from '../types';
import { getTimestamp } from '../utils/time';
import { beginSvgRecording, type SvgRecording } from './svg/plotSvgAdapter';
import { finalizeSvg, hasDrawableSvgContent } from './svg/postprocess';
import {
	DEFAULT_SVG_EXPORT_SETTINGS,
	dpiToResolutionMetricValue,
	formatSvgNumber,
	parseResolutionMetricOption,
	resolutionToDpi,
	SVG_RESOLUTION_METRIC_OPTIONS,
	SVG_UNIT_OPTIONS,
	type SvgExportSettings,
} from './svg/settings';
import { installRecordingShims } from './svg/styleCapture';

function downloadSvg(svgContent: string, fileName: string) {
	const url = URL.createObjectURL(
		new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
	);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = fileName;
	anchor.click();
	URL.revokeObjectURL(url);
}

function getSvgFileName(config: Config, sketch: ExtensibleP5): string {
	const baseName =
		(config.fileName || document.title || 'p5Catalyst')
			.trim()
			.replace(/\s+/g, '-')
			.replace(/[^a-zA-Z0-9._-]/g, '_') || 'p5Catalyst';
	return `${baseName}_${sketch.width}x${sketch.height}_${getTimestamp().base64}.svg`;
}

async function exportCurrentFrameToSvg(
	gui: CatalystGUI,
	sketch: ExtensibleP5,
	config: Config,
	settings: SvgExportSettings
) {
	if ((sketch as any)._renderer?.isP3D) {
		gui.dialog.alert(
			'<h1>SVG export unavailable</h1>' +
				'<p>SVG export currently supports only 2D sketches (P2D).</p>'
		);
		return;
	}

	const wasLooping = sketch.isLooping();
	let recording: SvgRecording | undefined;
	let shims: ReturnType<typeof installRecordingShims> | undefined;
	if (wasLooping) sketch.noLoop();

	try {
		recording = beginSvgRecording(sketch, settings);
		shims = installRecordingShims(sketch);
		await sketch.redraw(1);

		shims.restore();
		const capture = shims;
		shims = undefined;
		const rawSvg = recording.end();
		recording = undefined;
		if (!rawSvg) throw new Error('No SVG content was captured.');

		const svgContent = finalizeSvg(
			rawSvg,
			sketch.width,
			sketch.height,
			settings,
			capture.capturedStyles,
			capture.shouldConvertClosedShapeStrokeToFill()
		);
		if (!hasDrawableSvgContent(svgContent)) {
			throw new Error('SVG export captured no drawable vector geometry.');
		}

		downloadSvg(svgContent, getSvgFileName(config, sketch));
	} catch (error) {
		shims?.restore();
		recording?.cancel();
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
		afterUserCreatesGui: (gui, sketch, config) => {
			const exportTab = gui.getTab('export') || gui;
			const panel = exportTab.addPanel('Export SVG', true);
			const settingsGroup = panel.addGroup('svgExportSettings', ROW);
			const buttonGroup = panel.addGroup('svgExportButtons', ROW);
			const settings = { ...DEFAULT_SVG_EXPORT_SETTINGS };

			settingsGroup.addSelect(
				'svgUnitSelect',
				'Units',
				[...SVG_UNIT_OPTIONS],
				0,
				(_, value) => {
					settings.physicalUnit =
						value === SVG_UNIT_OPTIONS[1] ? 'mm' : 'in';
				}
			);
			const resolutionTextbox = settingsGroup.addTextbox(
				'svgResolutionTextbox',
				'Resolution',
				String(settings.resolution),
				(_, value) => {
					const resolution = Number.parseFloat(String(value));
					if (Number.isFinite(resolution) && resolution > 0) {
						settings.resolution = resolution;
					}
				}
			);
			settingsGroup.addSelect(
				'svgResolutionMetricSelect',
				'Resolution Unit',
				[...SVG_RESOLUTION_METRIC_OPTIONS],
				0,
				(_, value) => {
					const dpi = resolutionToDpi(
						settings.resolution,
						settings.resolutionMetric
					);
					settings.resolutionMetric = parseResolutionMetricOption(
						String(value)
					);
					settings.resolution = dpiToResolutionMetricValue(
						dpi,
						settings.resolutionMetric
					);
					resolutionTextbox.setValue(
						formatSvgNumber(settings.resolution)
					);
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
							settings
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
