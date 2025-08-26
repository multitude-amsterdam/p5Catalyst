import type p5 from 'p5';
import type { setupCallback, valueCallback } from '../../../types';
import type { GUIForP5 } from '../../GUIForP5';
import { FileLoader } from './FileLoader';

/**
 * Loader that converts files to p5.Image instances.
 * @extends FileLoader
 */
export class VideoLoader extends FileLoader {
	/**
	 * The loaded image.
	 * @type {p5.Element}
	 */
	video?: p5.MediaElement;

	/**
	 * Constructor for ImageLoader.
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
			'image',
			file => {
				this.video = gui.p5Instance.createVideo(file.data);
				this.video.volume(0);
				this.video.hide();
				this.video.loop();
				this.file = this.video;
			},
			valueCallback,
			setupCallback
		);
		if (this.controllerElement) this.controllerElement.elt.accept = '.mp4';
	}
}
