import type p5 from 'p5';
import type { ExtensibleP5 } from '../../types';
import type { Randomizer } from '../Randomizer';

import { Controller } from '../components/Controller';

/**
 * Small dice icon indicating randomization state for a controller.
 * Handles icon display, rotation, and click interaction for toggling randomization.
 */
export class DieIcon {
	static iconClass = 'die-icon';
	static dieIconSvgs: string[] | undefined = undefined;

	randomizer: Randomizer;
	controller?: Controller;
	imgContainer: p5.Element;
	rotation: number;
	sketch: ExtensibleP5;
	isActive: boolean = true;
	currentSvgIndex?: number;

	constructor(
		randomizer: Randomizer,
		controller?: Controller,
		callback?: () => void
	) {
		this.randomizer = randomizer;
		this.controller = controller;
		this.sketch = randomizer.sketch;

		this.imgContainer = randomizer.sketch.createDiv();
		this.imgContainer.class(DieIcon.iconClass);
		this.imgContainer.mouseClicked(callback || (() => this.click()));
		this.rotation = 0;

		this.setDisplay();
	}

	toggle() {
		this.setActive(!this.isActive);
	}

	randomizeIcon() {
		if (!DieIcon.dieIconSvgs) return;

		// resets mofifier classes
		this.imgContainer.class(DieIcon.iconClass);

		let svgIndex;
		do
			svgIndex = Math.floor(
				this.sketch.random(DieIcon.dieIconSvgs.length)
			);
		while (svgIndex === this.currentSvgIndex);
		this.imgContainer.html(DieIcon.dieIconSvgs[svgIndex]);
		this.currentSvgIndex = svgIndex;

		// rotate die randomly
		let currentRotation;
		do currentRotation = this.sketch.int(this.sketch.random(4));
		while (currentRotation === this.rotation);
		let angle = (this.rotation * this.sketch.TAU) / 3;
		this.imgContainer.style('rotate', angle + 'rad');
		this.rotation = currentRotation;
	}

	/**
	 * Handles click event to toggle randomization state.
	 */
	click() {
		this.toggle();
	}

	/**
	 * Sets the active state of the die and updates its display.
	 * @param {boolean} isActive
	 */
	setActive(isActive: boolean) {
		this.isActive = isActive;
		this.setDisplay();
	}

	/**
	 * Updates the die's display based on its active state.
	 */
	setDisplay() {
		if (this.isActive) {
			this.imgContainer.removeClass('die-icon--disabled');
			this.randomizeIcon();
		} else {
			this.imgContainer.addClass('die-icon--disabled');
		}
	}

	/**
	 * Removes the die icon from the DOM.
	 */
	remove() {
		this.imgContainer.remove();
	}
}
