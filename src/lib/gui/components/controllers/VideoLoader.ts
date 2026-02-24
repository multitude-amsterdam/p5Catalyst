import type p5 from 'p5';
import type { fileReadyCallback, setupCallback } from '../../../types';
import type { CatalystGUI } from '../../CatalystGUI';
import { FileLoader } from './FileLoader';

export class VideoLoader extends FileLoader {
	video?: p5.MediaElement;

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
				this.video = gui.sketch.createVideo((file as p5.File).data);
				this.video.volume(0);
				this.video.hide();
				this.video.loop();
				this.file = this.video;

				fileReadyCallback?.(this.file);
			},
			setupCallback
		);
		if (this.controllerElement)
			(this.controllerElement.elt as HTMLInputElement).accept = '.mp4';
	}
}
