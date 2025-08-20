import type p5 from 'p5';
import type { setupCallback, valueCallback } from '../../../types';
import type GUIForP5 from '../../gui';
import ValuedController from '../../valued_controller';
import type {
	P5CheckboxElement,
	P5SelectElement,
} from '../../../types/controller';

/**
 * Multiple selectable colour checkboxes.
 * @extends ValuedController
 * @see {ColourBoxes}
 */
export default class MultiColourBoxes extends ValuedController {
	/**
	 * The value callback.
	 * @type {valueCallback}
	 */
	valueCallback: valueCallback;
	colours: string[];
	checkboxes?: P5CheckboxElement[];
	valueIndices?: number[];

	/**
	 * Constructor for MultiColourBoxes.
	 * @param {GUIForP5} gui
	 * @param {string} name
	 * @param {string} labelStr
	 * @param {Array<p5.Color>} colours - Array of p5.Color objects.
	 * @param {Array<number>} defaultIndices - Indices of the default colours.
	 * @param {function} valueCallback - Callback function to handle value changes.
	 * @param {function} [setupCallback] - Optional setup callback function.
	 */
	constructor(
		gui: GUIForP5,
		name: string,
		labelStr: string,
		colours: string[],
		defaultIndices: number[],
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		super(gui, name, labelStr, setupCallback);

		this.colours = colours;
		this.valueCallback =
			valueCallback || ((controller: ValuedController, value: any) => {});

		this.setControllerColours();

		const defaultCols = defaultIndices.map(i => this.colours[i]);
		this.setValue(defaultCols);
	}

	/**
	 * Sets the controller colours and creates checkboxes for each colour.
	 * @returns {void}
	 */
	setControllerColours() {
		if (this.controllerElement) {
			this.controllerElement.remove();
		}

		const div = this.gui.p5Instance.createDiv();
		div.class('colour-boxes');
		this.controllerWrapper.elt.prepend(div.elt);
		this.checkboxes = [];
		for (let i = 0; i < this.colours.length; i++) {
			const cb =
				this.gui.p5Instance.createCheckbox() as P5CheckboxElement;
			cb.parent(div);
			cb.value('' + i);
			cb.elt.addEventListener('click', () => {
				const indices: number[] = [];
				this.checkboxes?.forEach((c, idx) => {
					if (c.checked()) indices.push(idx);
				});
				this.setValueFromIndices(indices);
			});
			this.checkboxes.push(cb);
		}

		div.elt.querySelectorAll('span').forEach((elt: HTMLElement) => {
			elt.remove();
		});
		div.elt
			.querySelectorAll('input')
			.forEach((elt: HTMLElement, i: number) => {
				const hexCol = this.colours[i].toUpperCase();
				elt.style.backgroundColor = hexCol;
				elt.title = hexCol;
			});

		this.controllerElement = div;
	}

	/**
	 * Sets the value from an array of indices.
	 * @param {Array<number>} indices - Array of indices corresponding to selected colours.
	 * @return {void}
	 */
	setValueFromIndices(indices: number[]) {
		this.valueIndices = indices;
		this.value = indices.map(i =>
			this.gui.p5Instance.color(this.colours[i])
		);
		this.checkboxes?.forEach((cb, i) => {
			cb.checked(indices.includes(i));
		});
		this.valueCallback(this, this.value);
		if (this.doUpdateChangeSet()) this.gui.changeSet.save();
	}

	setValue(colArray: string[]) {
		const indices = colArray.map(colObj => {
			return this.colours.findIndex(col => col === colObj);
		});
		this.setValueFromIndices(indices);
	}

	randomize() {
		const indices = [];
		for (let i = 0; i < this.colours.length; i++) {
			if (this.gui.p5Instance.random(1) < 0.5) indices.push(i);
		}
		if (indices.length === 0)
			indices.push(
				this.gui.p5Instance.floor(
					this.gui.p5Instance.random(this.colours.length)
				)
			);
		this.setValueFromIndices(indices);
	}
}
