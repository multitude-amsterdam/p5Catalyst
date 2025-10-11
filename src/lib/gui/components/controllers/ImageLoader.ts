import type p5 from 'p5';
import type { fileReadyCallback, setupCallback } from '../../../types';
import type { CatalystGUI } from '../../CatalystGUI';
import { FileLoader } from './FileLoader';
export class ImageLoader extends FileLoader {
	img?: p5.Image;

	constructor(
		gui: CatalystGUI,
		name: string,
		labelStr: string,
		fileReadyCallback?: fileReadyCallback,
		setupCallback?: setupCallback
	) {
		super(
			gui,
			name,
			labelStr,
			'image',
			file => {
				this.img = gui.sketch.loadImage(file.data, img => {
					fileReadyCallback?.(img, this);
				});
				this.file = this.img;
			},
			setupCallback
		);
		if (this.controllerElement)
			this.controllerElement.elt.accept = '.jpg,.png,.gif,.tif';
	}
}
