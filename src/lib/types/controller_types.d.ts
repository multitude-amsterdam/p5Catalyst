import p5 from 'p5';
import type { Controller } from '../gui/controller';

export type controllerElement = p5.Element | null;
export type controllerCallback = (controller: Controller) => void;
export type valueCallback = (controller: Controller, value: any) => void;
export type setupCallback = (controller: Controller) => void;
