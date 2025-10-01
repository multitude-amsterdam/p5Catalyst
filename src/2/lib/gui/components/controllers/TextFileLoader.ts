import type { fileReadyCallback, setupCallback } from '../../../types';
import type { GUIForP5 } from '../../GUIForP5';
import { FileLoader } from './FileLoader';

export class TextFileLoader extends FileLoader {
	constructor(
		gui: GUIForP5,
		name: string,
		labelStr: string,
		fileReaderCallback?: fileReadyCallback,
		setupCallback?: setupCallback
	) {
		super(gui, name, labelStr, 'text', fileReaderCallback, setupCallback);
		if (this.controllerElement) this.controllerElement.elt.accept = '.txt';
	}
}
