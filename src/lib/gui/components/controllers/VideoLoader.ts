import type p5 from 'p5';
import type { fileReadyCallback, setupCallback } from '../../../types';
import type { GUIForP5 } from '../../GUIForP5';
import { FileLoader } from './FileLoader';

export class VideoLoader extends FileLoader {
	video?: p5.MediaElement;

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
				this.video = gui.p5Instance.createVideo((file as p5.File).data);
				this.video.volume(0);
				this.video.hide();
				this.video.loop();
				this.file = this.video;

				fileReadyCallback(this.file);
			},
			setupCallback
		);
		if (this.controllerElement) this.controllerElement.elt.accept = '.mp4';
	}
}
