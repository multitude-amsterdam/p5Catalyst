import type p5 from 'p5';
import type { Controller } from '../controller';
import type { Randomizer } from '../randomizer';

/**
 * Small dice icon indicating randomization state for a controller.
 * Handles icon display, rotation, and click interaction for toggling randomization.
 */
export class DieIcon {
	static iconClass = 'die-icon';
	static iconModifierClasses = [
		'die-icon--1',
		'die-icon--2',
		'die-icon--3',
		'die-icon--4',
		'die-icon--5',
		'die-icon--6',
	];

	randomizer: Randomizer;
	controller: Controller;
	imgContainer: p5.Element;
	rotation: number;
	p5Instance: p5;
	isActive?: boolean;
	currentModifierClass?: string;

	/**
	 * Constructs a DieIcon.
	 * @param {Randomizer} randomizer - The parent Randomizer instance.
	 * @param {Controller} controller - The controller this die is attached to.
	 * @param {boolean} isActive - Whether the die is active (randomization enabled).
	 */
	constructor(
		randomizer: Randomizer,
		controller: Controller,
		isActive: boolean
	) {
		this.randomizer = randomizer;
		this.controller = controller;
		this.p5Instance = randomizer.p5Instance;

		this.imgContainer = randomizer.p5Instance.createDiv();
		this.imgContainer.class(DieIcon.iconClass);
		this.imgContainer.mouseClicked(() => this.click());
		this.rotation = 0;

		this.setActive(isActive);
	}

	toggle() {
		this.setActive(!this.isActive);
	}

	/**
	 * Randomizes the die icon image URL and its rotationation.
	 */
	randomizeIcon() {
		// resets mofifier classes
		this.imgContainer.class(DieIcon.iconClass);

		let modifierClass;
		do modifierClass = this.p5Instance.random(DieIcon.iconModifierClasses);
		while (modifierClass === this.currentModifierClass);
		this.imgContainer.addClass(modifierClass);
		this.currentModifierClass = modifierClass;

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
		// this.randomizer.toggleDoRandomize(this);
		// if (this.controller.doUpdateChangeSet()) changeSet.save(); // not working (yet)
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
