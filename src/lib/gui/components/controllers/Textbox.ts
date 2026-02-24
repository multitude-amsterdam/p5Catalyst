import type { setupCallback, valueCallback } from '../../../types';
import type { CatalystGUI } from '../../CatalystGUI';
import { ValuedController } from '../ValuedController';
import { Controller } from '../Controller';

/**
 * Single line text input controller.
 * @extends ValuedController
 */
export class Textbox extends ValuedController {
	/**
	 * The value callback.
	 * @type {valueCallback}
	 */
	valueCallback: valueCallback;

	/**
	 * Constructor for Textbox.
	 * @param {CatalystGUI} gui - The GUI instance.
	 * @param {string} name - The name of the controller.
	 * @param {string} labelStr - The label for the controller.
	 * @param {string} defaultVal - The default value for the textbox.
	 * @param {function} valueCallback - Callback function for value changes.
	 * @param {function} [setupCallback] - Optional setup callback.
	 */
	constructor(
		gui: CatalystGUI,
		name: string,
		labelStr: string,
		defaultVal: string,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		super(gui, name, labelStr, defaultVal, setupCallback);
		this.controllerElement = gui.sketch.createInput();
		this.controllerElement.parent(this.controllerWrapper);
		this.controllerElement.value(defaultVal);

		this.controllerElement.elt.oninput = (event: Event) => {
			const target = event.target as HTMLInputElement;
			const value = target.value;
			if (valueCallback) valueCallback(this, value);
		};

		this.valueCallback =
			valueCallback || ((controller: Controller, value: any) => {});
		this.valueCallback(this, this.value);

		this.controllerElement.elt.addEventListener(
			'focusin',
			(event: FocusEvent) => {
				gui.isTypingText = true;
			}
		);
		this.controllerElement.elt.addEventListener(
			'focusout',
			(event: FocusEvent) => {
				gui.isTypingText = false;
				const target = event.target as HTMLInputElement;
				const value = target.value;
				this.setValue(value);
			}
		);
	}

	setValue(value: string) {
		this.value = value;
		this.valueCallback(this, value);
		this.controllerElement?.value(value);
		if (this.doUpdateChangeSet()) this.gui.changeSet.save();
	}

	randomize() {}
}
