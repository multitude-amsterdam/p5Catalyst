import type { fileReadyCallback, setupCallback } from '../../../types';
import type { CatalystGUI } from '../../CatalystGUI';
import { FileLoader } from './FileLoader';

export class JSONFileLoader extends FileLoader {
	constructor(
		gui: CatalystGUI,
		name: string,
		labelStr: string,
		fileReadyCallback: fileReadyCallback,
		setupCallback?: setupCallback
	) {
		super(gui, name, labelStr, 'json', fileReadyCallback, setupCallback);
		if (this.controllerElement) this.controllerElement.elt.accept = '.json';
	}
}
