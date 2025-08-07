import p5 from 'p5';
import type { Controller } from '../gui/controller';

export type controllerElement = p5.Element | P5SelectElement | null;
export type controllerCallback = (value?: File) => void;
export type valueCallback = (controller: Controller, value: any) => void;
export type setupCallback = (controller: Controller) => void;
export type fileReadyCallback = (file: File) => void;

export interface P5SelectElement extends p5.Element {
	option(name: string, value?: string): p5.Element;
	selected(): string;
	selected(value: string): p5.Element;
}
