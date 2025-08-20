import type p5 from 'p5';
import type {
	setupCallback,
	valueCallback,
	controllerCallback,
	fileReadyCallback,
} from '../../../types';
import type GUIForP5 from '../../gui';
import Button from './Button';

/**
 * Base class for file input controllers.
 * @extends Button
 */
export default class FileLoader extends Button {
	/**
	 * The file type accepted.
	 * @type {string}
	 */
	fileType: string;

	/**
	 * The file object.
	 * @type {p5.File}
	 */
	file?: p5.File | p5.Element;

	/**
	 * The file name.
	 * @type {string}
	 */
	fileName?: string;

	callback: controllerCallback;

	/**
	 * Constructor for FileLoader.
	 * @param {GUIForP5} gui
	 * @param {string} name
	 * @param {string} fileType
	 * @param {string} labelStr
	 * @param {function} fileReadyCallback
	 * @param {ValueCallback} valueCallback
	 * @param {SetupCallback} [setupCallback]
	 */
	constructor(
		gui: GUIForP5,
		name: string,
		labelStr: string,
		fileType: string,
		fileReadyCallback?: fileReadyCallback,
		valueCallback?: valueCallback,
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

		this.callback = value => {
			if (valueCallback) valueCallback(this, value);
		};

		this.controllerElement = gui.p5Instance.createFileInput(file => {
			this.file = file;
			this.fileName = file.name;
			if (fileReadyCallback) fileReadyCallback(file);
			this.callback(this.file);
		});
		this.controllerElement.parent(this.controllerWrapper);
		this.controllerElement.hide();
	}
}
