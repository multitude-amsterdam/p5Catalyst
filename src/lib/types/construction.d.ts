export type SketchFunction = (
	sketch: p5,
	state: any
) => Promise<{ state?: any }> | { state?: any } | void;

export interface State {
	width: number;
	height: number;
	[key: string]: any; // Allow other properties
}

export type GUISetupFunction = (
	gui: GUIControllerInterface,
	state: any
) => void;

export interface sketchHook {
	resize: (width: number, height: number) => void;
	canvasToClipboard: () => void;
	exportImage: (fileType: imageFileType, fileName?: string) => void;
	setTyping: (currentlyTyping: boolean) => void;
	startRecording: () => void;
	stopRecording: () => void;
}

export type Container = {
	p5Instance: p5;
	state: State;
	sketchHook: sketchHook;
};
