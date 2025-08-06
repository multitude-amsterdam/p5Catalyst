export type SketchFunction = (
	sketch: p5,
	state: any
) => Promise<{ state?: any }> | { state?: any } | void;

export interface State {
	width: number;
	height: number;
	resize?: (width: number, height: number) => void;
	[key: string]: any; // Allow other properties
}

export type GUISetupFunction = (
	gui: GUIControllerInterface,
	state: any
) => void;

export type Container = { p5Instance: p5; state: State };
