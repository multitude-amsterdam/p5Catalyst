import type {
	controllerCallback,
	setupCallback,
} from '../../../types/controller_types';
import { Controller } from '../../controller';
import type { GUIForP5 } from '../../gui';
/**
 * Simple push button controller.
 * @extends Controller
 */
export class Button extends Controller {
	/**
	 * Constructor for Button.
	 * @param {GUIForP5} gui
	 * @param {string} name
	 * @param {string} labelStr
	 * @param {function} callback
	 * @param {SetupCallback} [setupCallback]
	 * @example
	 * const button = new Button(
	 * 	gui,
	 * 	'buttonName',
	 * 	'Click me',
	 * 	controller => {
	 * 		print('Button clicked!');
	 * 	}
	 * );
	 */
	constructor(
		gui: GUIForP5,
		name: string,
		labelStr: string,
		callback?: controllerCallback,
		setupCallback?: setupCallback
	) {
		super(gui, name, labelStr, setupCallback);
		this.controllerElement = gui.p5Instance.createButton(labelStr);
		this.controllerElement.parent(this.controllerWrapper);
		this.controllerElement.elt.onclick = () => {
			if (callback) callback(this);
			// if (this.doUpdateChangeSet()) changeSet.save();
		};
	}

	/**
	 * Simulates a button click.
	 */
	click() {
		if (this.controllerElement) this.controllerElement.elt.onclick();
	}
}
