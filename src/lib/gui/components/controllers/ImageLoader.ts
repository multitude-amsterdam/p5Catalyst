import type p5 from 'p5';
import type { fileReadyCallback, setupCallback } from '../../../types';
import type { GUIForP5 } from '../../GUIForP5';
import { FileLoader } from './FileLoader';

/**
 * Loader that converts files to p5.Image instances.
 * @extends FileLoader
 */
export class ImageLoader extends FileLoader {
	img?: p5.Element;

	constructor(
		gui: GUIForP5,
		name: string,
		labelStr: string,
		fileReadyCallback: fileReadyCallback,
		setupCallback?: setupCallback
	) {
		super(
			gui,
			name,
			labelStr,
			'image',
			file => {
				file = file as p5.File;
				this.img = gui.p5Instance.createImg(file.data, '');
				this.img.hide();
				this.file = this.img;
			},
			setupCallback
		);
		if (this.controllerElement)
			this.controllerElement.elt.accept = '.jpg,.png,.gif,.tif';
	}
}
