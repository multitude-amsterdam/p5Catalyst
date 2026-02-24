import type { fileReadyCallback, setupCallback } from '../../../types';
import type { CatalystGUI } from '../../CatalystGUI';
import { FileLoader } from './FileLoader';

export class TextFileLoader extends FileLoader {
	constructor(
		gui: CatalystGUI,
		name: string,
		labelStr: string,
		fileReaderCallback?: fileReadyCallback,
		setupCallback?: setupCallback
	) {
		super(gui, name, labelStr, 'text', fileReaderCallback, setupCallback);
		if (this.controllerElement)
			(this.controllerElement.elt as HTMLInputElement).accept = '.txt';
	}
}
