import type { setupCallback, valueCallback } from '../../../types';
import type { Controller } from '../../controller';
import type { GUIForP5 } from '../../gui';
import { ValuedController } from '../../valued_controller';

/**
 * On/off toggle represented by a button.
 * @extends ValuedController
 */
export class Toggle extends ValuedController {
	/**
	 * The value callback.
	 * @type {valueCallback}
	 */
	valueCallback: valueCallback;

	/**
	 * Constructor for Toggle.
	 * @param {GUIForP5} gui
	 * @param {string} name
	 * @param {string} labelStr0
	 * @param {string} labelStr1
	 * @param {boolean} isToggled
	 * @param {ValueCallback} valueCallback
	 * @param {SetupCallback} [setupCallback]
	 */
	constructor(
		gui: GUIForP5,
		name: string,
		labelStr0: string,
		labelStr1: string,
		isToggled: boolean,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		super(gui, name, '', setupCallback);
		this.controllerElement = gui.p5Instance.createButton('');
		this.controllerElement.parent(this.controllerWrapper);
		this.controllerElement.class('toggle');

		labelStr0 = gui.lang.process(labelStr0, true);
		labelStr1 = gui.lang.process(labelStr1, true);
		const span0 = gui.p5Instance.createSpan(labelStr0);
		const span1 = gui.p5Instance.createSpan(labelStr1);
		span0.parent(this.controllerElement);
		span1.parent(this.controllerElement);

		if (this.value) this.controllerElement.elt.toggleAttribute('toggled');

		this.controllerElement.elt.onclick = () => {
			this.setValue(!this.value);
		};
		this.valueCallback =
			valueCallback || ((controller: Controller, value: any) => {});

		this.value = isToggled ? true : false;
		this.valueCallback(this, this.value);
	}

	/**
	 * Simulates a toggle click.
	 */
	click() {
		this.controllerElement?.elt.onclick();
	}

	/**
	 * Sets the toggle value.
	 * @param {boolean} value
	 */
	setValue(value: boolean) {
		if (value != this.value)
			this.controllerElement?.elt.toggleAttribute('toggled');
		this.value = value;
		this.valueCallback(this, this.value);
		if (this.doUpdateChangeSet()) this.gui.changeSet.save();
	}

	/**
	 * Randomizes the toggle value.
	 */
	randomize() {
		this.setValue(this.gui.p5Instance.random(1) < 0.5);
	}
}
