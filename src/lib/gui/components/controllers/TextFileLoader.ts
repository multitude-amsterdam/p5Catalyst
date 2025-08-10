import type { setupCallback, valueCallback } from '../../../types';
import type { GUIForP5 } from '../../gui';
import { FileLoader } from './FileLoader';

/**
 * Loader for plain text files.
 * @extends FileLoader
 */
export class TextFileLoader extends FileLoader {
	/**
	 * Constructor for TextFileLoader.
	 * @param {GUIForP5} gui
	 * @param {string} name
	 * @param {string} labelStr
	 * @param {ValueCallback} valueCallback
	 * @param {SetupCallback} [setupCallback]
	 */
	constructor(
		gui: GUIForP5,
		name: string,
		labelStr: string,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		super(
			gui,
			name,
			labelStr,
			'text',
			file => {},
			valueCallback,
			setupCallback
		);
		if (this.controllerElement) this.controllerElement.elt.accept = '.txt';
	}
}
