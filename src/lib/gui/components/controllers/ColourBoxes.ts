import type p5 from 'p5';
import type { GUIForP5 } from '../../gui';
import { ValuedController } from '../../valued_controller';
import type { setupCallback, valueCallback } from '../../../types';
import type { Controller } from '../../controller';
import type { P5SelectElement } from '../../../types/controller';

/**
 * Radio buttons displaying coloured options.
 * @extends ValuedController
 * @see {MultiColourBoxes}
 */
export class ColourBoxes extends ValuedController {
	/**
	 * The value callback.
	 * @type {valueCallback}
	 */
	valueCallback: valueCallback;

	colours: string[];

	/**
	 * Constructor for ColourBoxes.
	 * @param {GUIForP5} gui
	 * @param {string} name
	 * @param {string} labelStr
	 * @param {Array<p5.Color>} colours - Array of p5.Color objects.
	 * @param {number} defaultIndex - Index of the default colour.
	 * @param {function} valueCallback - Callback function to handle value changes.
	 * @param {function} [setupCallback] - Optional setup callback function.
	 */
	constructor(
		gui: GUIForP5,
		name: string,
		labelStr: string,
		colours: string[],
		defaultIndex: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		super(gui, name, labelStr, setupCallback);
		this.valueCallback =
			valueCallback || ((controller: Controller, value: any) => {});
		this.createRadioFromColours(colours);
		this.setValue(colours[defaultIndex]);
		this.colours = colours;
	}

	/**
	 * Creates a radio button controller from an array of colours.
	 * @param {Array<p5.Color>} colours - Array of p5.Color objects.
	 * @returns {void}
	 */
	createRadioFromColours(colours: string[]) {
		const isInit = this.controllerElement === undefined;
		if (this.controllerElement) {
			this.controllerElement.elt.remove();
		}

		const radio = this.gui.p5Instance.createRadio(
			this.name
		) as P5SelectElement;
		radio.class('colour-boxes');
		this.controllerWrapper.elt.prepend(radio.elt);

		for (let i = 0; i < colours.length; i++) {
			radio.option(i.toString());
		}

		// remove span labels from p5 structure
		for (const elt of radio.elt.querySelectorAll('span')) elt.remove();

		let i = 0;
		for (const elt of radio.elt.querySelectorAll('input')) {
			const hexCol = colours[i++];
			elt.style.backgroundColor = hexCol;
			elt.title = hexCol;
			elt.onclick = (event: InputEvent) => {
				this.setValue(this.colours[parseInt(elt.value)]);
			};
		}

		this.colours = colours;
		this.controllerElement = radio;
	}

	setValue(colObj: string) {
		console.log(colObj);
		const index = this.colours.findIndex(col => col === colObj);
		if (index < 0) {
			throw new Error(colObj + ' can not be found in colours.');
		}

		this.value = this.gui.p5Instance.color(this.colours[index]);
		(this.controllerElement as P5SelectElement).selected('' + index);
		this.valueCallback(this, this.value);
		// if (this.doUpdateChangeSet()) changeSet.save();
	}

	randomize() {
		this.setValue(this.gui.p5Instance.random(this.colours));
	}
}
