import p5, { Image } from 'p5';
import type { Controller } from '../gui/controller';

export type controllerElement = p5.Element | P5SelectElement | null;
export type controllerCallback = (file?: p5.File | p5.Element) => void;
export type valueCallback = (controller: Controller, value: any) => void;
export type setupCallback = (controller: Controller) => void;
export type fileReadyCallback = (file: p5.File) => void;

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

export type controllerValue = string | number | p5.Color | p5.Vector;

export interface serializedValue {
	type: 'Vector' | 'Color' | 'Value';
	value: number | string | boolean | { x: number; y: number; z: number };
}

export interface Serializable {
	name: string;
	value: serializedValue;
	isDieActive?: boolean;
}
