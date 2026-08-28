export type SvgPhysicalUnit = 'in' | 'mm';
export type SvgResolutionMetric = 'dpi' | 'dpcm' | 'dpmm';

export type SvgExportSettings = {
	resolution: number;
	resolutionMetric: SvgResolutionMetric;
	physicalUnit: SvgPhysicalUnit;
};

export const SVG_UNIT_OPTIONS = ['Inches (in)', 'Millimeters (mm)'] as const;
export const SVG_RESOLUTION_METRIC_OPTIONS = ['DPI', 'DPCM', 'DPMM'] as const;

const DEFAULT_DPI = 144;

export const DEFAULT_SVG_EXPORT_SETTINGS: SvgExportSettings = {
	resolution: DEFAULT_DPI,
	resolutionMetric: 'dpi',
	physicalUnit: 'in',
};

export function formatSvgNumber(value: number): string {
	return String(Number(value.toFixed(4)));
}

export function resolutionToDpi(
	resolution: number,
	metric: SvgResolutionMetric
): number {
	const fallback =
		metric === 'dpcm' ? DEFAULT_DPI / 2.54
		: metric === 'dpmm' ? DEFAULT_DPI / 25.4
		: DEFAULT_DPI;
	const safeResolution =
		Number.isFinite(resolution) && resolution > 0 ? resolution : fallback;

	if (metric === 'dpcm') return safeResolution * 2.54;
	if (metric === 'dpmm') return safeResolution * 25.4;
	return safeResolution;
}

export function dpiToResolutionMetricValue(
	dpi: number,
	metric: SvgResolutionMetric
): number {
	const safeDpi = Number.isFinite(dpi) && dpi > 0 ? dpi : DEFAULT_DPI;
	if (metric === 'dpcm') return safeDpi / 2.54;
	if (metric === 'dpmm') return safeDpi / 25.4;
	return safeDpi;
}

export function parseResolutionMetricOption(
	value: string
): SvgResolutionMetric {
	if (value === SVG_RESOLUTION_METRIC_OPTIONS[1]) return 'dpcm';
	if (value === SVG_RESOLUTION_METRIC_OPTIONS[2]) return 'dpmm';
	return 'dpi';
}
