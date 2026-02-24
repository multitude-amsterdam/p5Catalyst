import type { controllerCallback, setupCallback } from '../../../types';
import { Controller } from '../Controller';
import type { CatalystGUI } from '../../CatalystGUI';
/**
 * Simple push button controller.
 * @extends Controller
 */
export class Button extends Controller {
	/**
	 * Constructor for Button.
	 * @param {CatalystGUI} gui
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
		gui: CatalystGUI,
		name: string,
		labelStr: string,
		callback?: controllerCallback,
		setupCallback?: setupCallback
	) {
		super(gui, name, '', setupCallback);
		labelStr = gui.lang.process(labelStr, true);
		this.controllerElement = gui.sketch.createButton(labelStr);
		this.controllerElement.parent(this.controllerWrapper);
		this.controllerElement.elt.onclick = () => {
			if (callback) callback(this);
			if (this.doUpdateChangeSet()) this.gui.changeSet.save();
		};
	}

	/**
	 * Simulates a button click.
	 */
	click() {
		(this.controllerElement?.elt as HTMLButtonElement | undefined)?.click();
	}
}
