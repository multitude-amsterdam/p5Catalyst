import type p5 from 'p5';
import { Controller } from '../components/Controller';
import type { Randomizer } from '../Randomizer';

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
	p5Instance: p5;
	isActive: boolean = true;
	currentSvgIndex?: number;

	constructor(
		randomizer: Randomizer,
		controller?: Controller,
		callback?: () => void
	) {
		this.randomizer = randomizer;
		this.controller = controller;
		this.p5Instance = randomizer.p5Instance;

		this.imgContainer = randomizer.p5Instance.createDiv();
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
				this.p5Instance.random(DieIcon.dieIconSvgs.length)
			);
		while (svgIndex === this.currentSvgIndex);
		this.imgContainer.html(DieIcon.dieIconSvgs[svgIndex]);
		this.currentSvgIndex = svgIndex;

		// rotate die randomly
		let currentRotation;
		do currentRotation = this.p5Instance.int(this.p5Instance.random(4));
		while (currentRotation === this.rotation);
		let angle = (this.rotation * this.p5Instance.TAU) / 3;
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
