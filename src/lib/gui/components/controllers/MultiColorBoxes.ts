import type p5 from 'p5';
import type { setupCallback, valueCallback } from '../../../types';
import type { CatalystGUI } from '../../CatalystGUI';
import { ValuedController } from '../ValuedController';
import { Controller } from '../Controller';
import type { P5CheckboxElement } from '../../../types/controller';

/**
 * Multiple selectable color checkboxes.
 * @extends ValuedController
 * @see {ColorBoxes}
 */
export class MultiColorBoxes extends ValuedController {
	valueCallback: valueCallback;
	colors!: string[];
	checkboxes!: P5CheckboxElement[];
	valueIndices!: number[];

	constructor(
		gui: CatalystGUI,
		name: string,
		labelStr: string,
		colors: string[],
		defaultIndices: number[],
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		const defaultCols = defaultIndices.map(i => colors[i]);
		super(gui, name, labelStr, defaultCols, setupCallback);
		this.valueCallback =
			valueCallback || ((controller: Controller, value: any) => {});
		this.setControllerColors(colors);
		this.setValue(defaultCols);
	}

	/**
	 * Sets the controller colors and creates checkboxes for each color.
	 * @returns {void}
	 */
	setControllerColors(colors: string[]) {
		if (this.controllerElement) {
			this.controllerElement.remove();
		}
		this.colors = colors;

		const div = this.gui.sketch.createDiv();
		div.class('color-boxes');
		this.controllerWrapper.elt.prepend(div.elt);
		this.checkboxes = [];
		for (let i = 0; i < this.colors.length; i++) {
			const cb = this.gui.sketch.createCheckbox() as P5CheckboxElement;
			cb.parent(div);
			cb.value('' + i);
			cb.elt.addEventListener('click', () => {
				const indices: number[] = [];
				this.checkboxes.forEach((checkbox, idx) => {
					if (checkbox.checked()) indices.push(idx);
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
				const hexCol = this.colors[i].toUpperCase();
				elt.style.backgroundColor = hexCol;
				elt.title = hexCol;
			});

		this.controllerElement = div;
	}

	/**
	 * Sets the value from an array of indices.
	 * @param {Array<number>} indices - Array of indices corresponding to selected colors.
	 */
	setValueFromIndices(indices: number[]) {
		this.valueIndices = indices;
		this.value = indices.map(i => this.gui.sketch.color(this.colors[i]));
		this.checkboxes.forEach((cb, i) => {
			cb.checked(indices.includes(i));
		});
		this.valueCallback(this, this.value);
		if (this.doUpdateChangeSet()) this.gui.changeSet.save();
	}

	setValue(colArray: string[]) {
		const indices = colArray.map(colObj => {
			return this.colors.findIndex(col => col === colObj);
		});
		this.setValueFromIndices(indices);
	}

	randomize() {
		const indices = [];
		for (let i = 0; i < this.colors.length; i++) {
			if (this.gui.sketch.random(1) < 0.5) indices.push(i);
		}
		if (indices.length === 0)
			indices.push(
				this.gui.sketch.floor(
					this.gui.sketch.random(this.colors.length)
				)
			);
		this.setValueFromIndices(indices);
	}
}
