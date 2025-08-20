import type GUIForP5 from './gui';
import type { controllerElement, setupCallback } from '../types';
import Field from './field';
import p5 from 'p5';
import type DieIcon from './components/DieIcon';
import type Randomizer from './randomizer';
import Label from './components/fields/Label';

/**
 * Base class for all GUI controllers.
 * @extends Field
 * @example
 * // For any Controller, the main callback function passed into it will trigger when the controller is triggered, like this:
 * const triggerButton = new Button(
 * 	gui,
 * 	'buttonTrigger',
 * 	'Do something!',
 * 	controller => {
 * 		doSomething();
 * 	}
 * );
 *
 * @example
 * // You can add an optional setupCallback function which calls after the GUI item is created:
 * const triggerButton = new Button(
 * 	gui,
 * 	'buttonTrigger',
 * 	'Do something!',
 * 	controller => {
 * 		doSomething();
 * 	},
 * 	controller => {
 * 		// simulate a click on loading the app
 * 		controller.click();
 * 	}
 * );
 */
export default class Controller extends Field {
	/**
	 * Static flag to control whether the change set should be updated.
	 * @type {boolean}
	 */
	static _doUpdateChangeSet: boolean = true;
	/**
	 * Flag to control whether the change set should be updated.
	 * @type {boolean}
	 */
	_doUpdateChangeSet: boolean = true;

	/**
	 * The HTML element representing the controller.
	 * @type {p5.Element}
	 */
	controllerElement?: p5.Element;

	/**
	 * The GUIForP5 instance this controller belongs to.
	 * @type {GUIForP5}
	 */
	gui: GUIForP5;

	/**
	 * The name of the controller.
	 * @type {string}
	 */
	name: string;

	/**
	 * The label for the controller.
	 * @type {Label}
	 */
	label?: Label;

	/**
	 * The wrapper div for the controller.
	 * @type {p5.Element}
	 */
	controllerWrapper: p5.Element;

	/**
	 * Optional setup callback.
	 * @type {setupCallback}
	 */
	setupCallback: setupCallback;

	/**
	 * The die icon for randomization.
	 * @type {DieIcon}
	 */
	die?: DieIcon;

	/**
	 * Constructor for the Controller class.
	 * @param {GUIForP5} gui - The GUI instance this controller belongs to.
	 * @param {string} name - The name of the controller.
	 * @param {string} labelStr - The label text for the controller.
	 * @param {SetupCallback} [setupCallback] - Optional callback function for setup.
	 */
	constructor(
		gui: GUIForP5,
		name: string,
		labelStr: string,
		setupCallback?: setupCallback
	) {
		super(gui, name, 'gui-controller');
		this.gui = gui;
		this.name = name;

		if (labelStr !== undefined && labelStr !== '') {
			labelStr = gui.lang.process(labelStr, true);
			this.label = new Label(gui, this, labelStr, this.div);
		}

		this.controllerWrapper = gui.p5Instance.createDiv();
		this.controllerWrapper.class('controller-wrapper');
		this.controllerWrapper.parent(this.div);

		this.setupCallback =
			setupCallback || ((controller: Controller) => ({}));
	}

	/**
	 * Setup for the controller.
	 */
	setup() {
		if (this.setupCallback) this.setupCallback(this);
	}

	/**
	 * Disables the controller.
	 */
	disable() {
		if (this.controllerElement) this.controllerElement.elt.disabled = true;
	}

	/**
	 * Enables the controller.
	 */
	enable() {
		if (this.controllerElement) this.controllerElement.elt.disabled = false;
	}

	/**
	 * Checks if the controller is disabled.
	 * @returns {boolean} - True if the controller is disabled, false otherwise.
	 */
	isDisabled(): boolean | undefined {
		if (this.controllerElement) return this.controllerElement.elt.disabled;
	}

	/**
	 * Sets the disabled state of the controller.
	 * @param {boolean} doSetDisabled - True to disable the controller, false to enable it.
	 */
	setDisabled(doSetDisabled: boolean) {
		doSetDisabled ? this.disable() : this.enable();
	}

	/**
	 * Adds this controller to a randomizer.
	 * @param {Randomizer} randomizer - The randomizer to add this controller to.
	 */
	addToRandomizer(randomizer: Randomizer) {
		randomizer.addController(this, true);
	}

	/**
	 * Adds a die to the controller.
	 * @param {DieIcon} die - The die to add.
	 */
	addDie(die: DieIcon) {
		die.imgContainer.parent(this.controllerWrapper);
		this.die = die;
	}

	/**
	 * Checks if the change set should be updated.
	 * @returns {boolean} - True if the change set should be updated, false otherwise.
	 */
	doUpdateChangeSet(): boolean {
		return (
			// changeSet !== undefined &&
			this._doUpdateChangeSet && Controller._doUpdateChangeSet
		);
	}
}
