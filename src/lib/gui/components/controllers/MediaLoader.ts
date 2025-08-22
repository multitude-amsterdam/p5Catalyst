import p5 from 'p5';
import type { setupCallback, valueCallback } from '../../../types';
import type GUIForP5 from '../../gui';
import FileLoader from './FileLoader';

/**
 * Loader that converts files to p5.Image instances.
 * @extends FileLoader
 */
export default class MediaLoader extends FileLoader {
	/**
	 * The loaded image.
	 * @type {p5.Element}
	 */
	media?: p5.MediaElement | p5.Element;

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
				if (file.type === 'video') {
					this.media = gui.p5Instance.createVideo(file.data);
					(this.media as p5.MediaElement).volume(0);
					(this.media as p5.MediaElement).loop();
				} else if (file.type === 'image') {
					this.media = gui.p5Instance.createImg(file.data, '');
				}
				this.media?.hide();
				this.file = this.media;
			},
			valueCallback,
			setupCallback
		);
		if (this.controllerElement)
			this.controllerElement.elt.accept =
				'.jpg,.png,.gif,.tif,.mp4,.webm,.webp';
	}
}
