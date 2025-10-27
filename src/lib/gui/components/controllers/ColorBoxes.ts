import p5 from 'p5';
import type { CatalystGUI } from '../../CatalystGUI';
import { ValuedController } from '../ValuedController';
import type { setupCallback, valueCallback } from '../../../types';
import type { Controller } from '../Controller';
import type { P5SelectElement } from '../../../types/controller';

/**
 * Radio buttons displaying colored options.
 * @extends ValuedController
 * @see {MultiColorBoxes}
 */
export class ColorBoxes extends ValuedController {
	valueCallback: valueCallback;

	colors!: p5.Color[]; // initialised in createRadioFromColors()

	constructor(
		gui: CatalystGUI,
		name: string,
		labelStr: string,
		colors: string[],
		defaultIndex: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		const defaultValue = gui.sketch.color(colors[defaultIndex]);
		super(gui, name, labelStr, defaultValue, setupCallback);
		this.valueCallback =
			valueCallback || ((controller: Controller, value: any) => {});
		this.createRadioFromColors(colors);
		this.valueCallback(this, this.value);
		this.setValue(defaultValue);
	}

	createRadioFromColors(colors: string[]) {
		const isInit = this.controllerElement === undefined;
		if (this.controllerElement) {
			this.controllerElement.elt.remove();
		}

		const radio = this.gui.sketch.createRadio(this.name) as P5SelectElement;
		radio.class('color-boxes');
		this.controllerWrapper.elt.prepend(radio.elt);

		for (let i = 0; i < colors.length; i++) {
			radio.option(i.toString());
		}

		// remove span labels from p5 structure
		for (const elt of radio.elt.querySelectorAll('span')) elt.remove();

		let i = 0;
		for (const elt of radio.elt.querySelectorAll('input')) {
			const hexCol = colors[i++];
			elt.style.backgroundColor = hexCol;
			elt.title = hexCol;
			elt.onclick = (event: InputEvent) => {
				this.setValue(this.colors[parseInt(elt.value)]);
			};
		}

		this.colors = colors.map(color => gui.sketch.color(color));

		this.controllerElement = radio;
	}

	setValue(color: p5.Color) {
		const index = this.colors.findIndex(
			col => col.toString() === color.toString()
		);
		if (index < 0) {
			throw new Error(color + ' can not be found in colors.');
		}

		this.value = this.gui.sketch.color(this.colors[index]);
		(this.controllerElement as P5SelectElement).selected('' + index);
		this.valueCallback(this, this.value);
		if (this.doUpdateChangeSet()) this.gui.changeSet.save();
	}

	randomize() {
		this.setValue(this.gui.sketch.random(this.colors));
	}
}
