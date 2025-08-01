import p5 from 'p5';
import type { Controller } from '../gui/controller';

export type controllerElement = p5.Element | HTMLElement | null;
export type setupCallback = ((controller: Controller) => any) | null;
