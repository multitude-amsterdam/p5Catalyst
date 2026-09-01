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
				void gui.sketch
					.loadImage(file.data)
					.then(img => {
						this.img = img;
						this.file = img;
						fileReadyCallback?.(img, this);
					})
					.catch((error: unknown) => {
						console.error('Failed to load image file.', error);
					});
			},
			setupCallback
		);
		if (this.controllerElement)
			(this.controllerElement.elt as HTMLInputElement).accept =
				'.jpg,.png,.gif,.tif';
	}
}
