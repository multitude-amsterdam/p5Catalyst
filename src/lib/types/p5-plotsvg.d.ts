declare module 'p5.plotsvg' {
	export type PlotSvgApi = {
		beginRecordSvg: (p5Instance: any, fileName?: string | null) => void;
		endRecordSvg: () => string;
		setSvgDocumentSize?: (width: number, height: number) => void;
		setSvgFlattenTransforms?: (flattenTransforms: boolean) => void;
		setSvgCoordinatePrecision?: (precision: number) => void;
		setSvgTransformPrecision?: (precision: number) => void;
	};

	const p5plotSvg: PlotSvgApi;
	export default p5plotSvg;
}
