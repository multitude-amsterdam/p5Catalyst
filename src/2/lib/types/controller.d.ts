import p5, { Image } from 'p5';
import type { Controller } from '../../../lib/gui/components/Controller';

export type ControllerElement = p5.Element | P5SelectElement | null;

export type controllerCallback = (controller: Controller) => void;
export type valueCallback = (
	controller: Controller,
	value: ControllerValue
) => void;
export type setupCallback = (controller: Controller) => void;
export type fileReadyCallback = (file: any, controller?: Controller) => void;

export interface P5SelectElement extends p5.Element {
	option(name: string, value?: string): p5.Element;
	selected(): string;
	selected(value: string): p5.Element;
}

export interface P5CheckboxElement extends p5.Element {
	checked(boolean?: boolean): boolean;
}

export interface P5Button extends p5.Element {
	click(): void;
}

export type ControllerValue =
	| number
	| string
	| string[]
	| boolean
	| p5.Color
	| p5.Color[]
	| p5.Vector;

export interface Serializable {
	name: string;
	value: SerializedValue;
	isDieActive?: boolean;
}

export interface SerializedValue {
	type: 'Vector' | 'Color' | 'Color[]' | 'Basic';
	value:
		| number
		| string
		| string[]
		| boolean
		| SerializedColor
		| SerializedColor[]
		| SerializedVector;
}

export interface SerializedColor {
	r: number;
	g: number;
	b: number;
	a: number;
}

export interface SerializedVector {
	x: number;
	y: number;
	z: number;
}
