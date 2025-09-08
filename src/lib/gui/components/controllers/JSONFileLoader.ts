import type { fileReadyCallback, setupCallback } from '../../../types';
import type { GUIForP5 } from '../../GUIForP5';
import { FileLoader } from './FileLoader';

export class JSONFileLoader extends FileLoader {
	constructor(
		gui: GUIForP5,
		name: string,
		labelStr: string,
		fileReadyCallback: fileReadyCallback,
		setupCallback?: setupCallback
	) {
		super(gui, name, labelStr, 'json', fileReadyCallback, setupCallback);
		if (this.controllerElement) this.controllerElement.elt.accept = '.json';
	}
}
