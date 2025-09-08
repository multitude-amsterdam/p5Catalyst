export type sketchFunction = (
	sketch: p5,
	state: any
) => Promise<{ state?: any }> | { state?: any } | void;

export interface State {
	width: number;
	height: number;
	time: number;
	progress: number;
	duration: number;
	isPlaying: boolean;
	isRecording: boolean;
	sketchHook?: SketchHook;
	[key: string]: any; // Allow other properties
}

export type GUISetupFunction = (
	gui: GUIControllerInterface,
	state: any
) => void;

export interface SketchHook {
	resizeCanvas: (width: number, height: number) => void;
	copyCanvasToClipboard: () => void;
	exportImage: (fileType: imageFileType, fileName?: string) => void;
	setTyping: (currentlyTyping: boolean) => void;
	startRecording: () => void;
	stopRecording: () => void;
	setDuration: (duration: number) => void;
	getTargetFrameRate: () => number;
	setFrameRate: (fps: number) => void;
}

export type Container = {
	p5Instance: p5;
	state: State;
	sketchHook: SketchHook;
};
