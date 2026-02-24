import p5 from 'p5';
import type { setupCallback, fileReadyCallback } from '../../../types';
import type { CatalystGUI } from '../../CatalystGUI';
import { FileLoader } from './FileLoader';

/**
 * Loader that converts files to p5.Image instances.
 * @extends FileLoader
 */
export class MediaLoader extends FileLoader {
	media?: p5.MediaElement | p5.Element;

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
				file = file as p5.File;
				if (file.type === 'video') {
					this.media = gui.sketch.createVideo(file.data);
					(this.media as p5.MediaElement).volume(0);
					(this.media as p5.MediaElement).loop();
				} else if (file.type === 'image') {
					this.media = gui.sketch.createImg(file.data, '');
				}
				this.media?.hide();
				this.file = this.media;

				fileReadyCallback?.(this.media as p5.Element);
			},
			setupCallback
		);
		if (this.controllerElement)
			(this.controllerElement.elt as HTMLInputElement).accept =
				'.jpg,.png,.gif,.tif,.mp4,.webm,.webp';
	}
}
