import type p5 from 'p5';
import type { setupCallback, fileReadyCallback } from '../../../types';
import type { GUIForP5 } from '../../GUIForP5';
import { Button } from './Button';

export class FileLoader extends Button {
	fileType: string;
	file?: p5.File | p5.Element;
	fileName?: string;

	constructor(
		gui: GUIForP5,
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

		this.controllerElement = gui.p5Instance.createFileInput(file => {
			this.file = file;
			this.fileName = file.name;
			if (fileReadyCallback) fileReadyCallback(file);
		});
		this.controllerElement.parent(this.controllerWrapper);
		this.controllerElement.hide();
	}
}
