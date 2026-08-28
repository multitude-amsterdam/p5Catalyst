declare module 'p5.plotsvg' {
	export type PlotSvgApi = {
		beginRecordSvg: (p5Instance: any, fileName?: string | null) => void;
		endRecordSvg: () => string;
		setSvgDocumentSize?: (width: number, height: number) => void;
		setSvgCoordinatePrecision?: (precision: number) => void;
		setSvgTransformPrecision?: (precision: number) => void;
		setSvgResolutionDPI?: (dpi: number) => void;
		setSvgResolutionDPCM?: (dpcm: number) => void;
		_commands?: Array<{ type: string; color?: string }>;
	};

	const p5plotSvg: PlotSvgApi;
	export default p5plotSvg;
}
