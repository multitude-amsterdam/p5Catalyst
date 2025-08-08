import type { setupCallback, valueCallback } from '../../../types';
import type { Controller } from '../../controller';
import type { GUIForP5 } from '../../gui';
import { ValuedController } from '../../valued_controller';

/**
 * Multi line text area controller.
 * @extends ValuedController
 */
export class Textarea extends ValuedController {
	/**
	 * The value callback.
	 * @type {valueCallback}
	 */
	valueCallback: valueCallback;
	/**
	 * Constructor for Textarea.
	 * @param {GUIForP5} gui - The GUI instance.
	 * @param {string} name - The name of the controller.
	 * @param {string} labelStr - The label for the controller.
	 * @param {string} defaultVal - The default value for the textarea.
	 * @param {function} valueCallback - Callback function for value changes.
	 * @param {function} [setupCallback] - Optional setup callback.
	 */
	constructor(
		gui: GUIForP5,
		name: string,
		labelStr: string,
		defaultVal: string,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		super(gui, name, labelStr, setupCallback);
		this.controllerElement = gui.p5Instance.createElement('textarea');
		this.controllerElement.parent(this.controllerWrapper);
		this.value = defaultVal;
		this.controllerElement.html(this.value);

		this.controllerElement.elt.oninput = (event: InputEvent) => {
			const target = event.target as HTMLInputElement;
			const value = target.value;
			if (valueCallback) valueCallback(this, value);
		};
		this.valueCallback =
			valueCallback || ((controller: Controller, value: any) => {});

		this.controllerElement.elt.addEventListener(
			'focusin',
			(event: FocusEvent) => (gui.isTypingText = true)
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
		// if (this.doUpdateChangeSet()) changeSet.save();
	}

	randomize() {}
}
