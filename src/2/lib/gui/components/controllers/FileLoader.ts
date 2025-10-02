import type p5 from 'p5';
import type { setupCallback, fileReadyCallback } from '../../../types';
import type { CatalystGUI } from '../../CatalystGUI';
import { Button } from './Button';

export class FileLoader extends Button {
	fileType: string;
	file?: any;
	fileName?: string;

	constructor(
		gui: CatalystGUI,
		name: string,
		labelStr: string,
		fileType: string,
		fileReadyCallback?: fileReadyCallback,
		setupCallback?: setupCallback
	) {
		super(
			gui,
			name,
			labelStr,
			() => {
				this.controllerElement?.elt.click();
			},
			setupCallback
		);

		this.fileType = fileType;

		this.controllerElement = gui.sketch.createFileInput(file => {
			this.file = file;
			this.fileName = file.name;
			if (fileReadyCallback) fileReadyCallback(file, this);
		});
		this.controllerElement.parent(this.controllerWrapper);
		this.controllerElement.hide();
	}
}
