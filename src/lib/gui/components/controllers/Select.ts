import type { setupCallback, valueCallback } from '../../../types';
import type GUIForP5 from '../../gui';
import ValuedController from '../../valued_controller';

/**
 * Drop-down select controller.
 * @extends ValuedController
 */
export default class Select extends ValuedController {
	/**
	 * The options for the select.
	 * @type {Array}
	 */
	options: string[];

	/**
	 * The string representations of the options.
	 * @type {Array<string>}
	 */
	optionStrs: string[];

	/**
	 * The value callback.
	 * @type {valueCallback}
	 */
	valueCallback: valueCallback;

	/**
	 * Constructor for Select.
	 * @param {GUIForP5} gui
	 * @param {string} name
	 * @param {string} labelStr
	 * @param {Array} options
	 * @param {number} defaultIndex
	 * @param {ValueCallback} valueCallback
	 * @param {SetupCallback} [setupCallback]
	 */
	constructor(
		gui: GUIForP5,
		name: string,
		labelStr: string,
		options: string[],
		defaultIndex: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		super(gui, name, labelStr, setupCallback);

		this.controllerElement = gui.p5Instance.createSelect();
		this.options = options;
		this.optionStrs = options.map(option => option.toString());
		this.setOptions();

		const callback = (event: Event) => {
			const target = event.target as HTMLSelectElement;
			const valueStr = target.value;
			const ind = this.optionStrs.indexOf(valueStr);
			this.setValue(this.options[ind]);
			if (valueCallback) valueCallback(this, this.value);
		};
		this.controllerElement.elt.onchange = callback;
		this.valueCallback =
			valueCallback || ((controller: ValuedController, value: any) => {});
		this.value = options[defaultIndex];
		this.valueCallback(this, this.value);
	}

	/**
	 * Sets the options for the select.
	 */
	setOptions() {
		this.controllerElement?.elt.replaceChildren();
		this.controllerElement?.parent(this.controllerWrapper);
		for (const optionStr of this.optionStrs)
			(this.controllerElement as any).option(optionStr);
	}

	/**
	 * Checks if an option exists.
	 * @param {string} option
	 * @returns {boolean}
	 */
	hasOption(option: string): boolean {
		return this.options.some(o => o == option);
	}
	/**
	 * Checks if an option string exists.
	 * @param {string} optionStr
	 * @returns {boolean}
	 */
	hasOptionStr(optionStr: string): boolean {
		return this.optionStrs.some(os => os == optionStr);
	}

	/**
	 * Sets the value of the select.
	 * @param {string} option
	 */
	setValue(option: string) {
		if (!this.hasOption(option)) {
			throw new Error(option + ' was not found in options.');
		}
		this.value = option;
		const optStr = this.optionStrs[this.options.indexOf(option)];
		(this.controllerElement as any).selected(optStr);
		this.valueCallback(this, option);
		if (this.doUpdateChangeSet()) this.gui.changeSet.save();
	}

	/**
	 * Randomizes the select value.
	 */
	randomize() {
		this.setValue(this.gui.p5Instance.random(this.options));
	}
}
