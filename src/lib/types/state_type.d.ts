export interface State {
	width: number;
	height: number;
	[key: string]: any; // Allow other properties
}

export type Dimensions = { width: number; height: number };
