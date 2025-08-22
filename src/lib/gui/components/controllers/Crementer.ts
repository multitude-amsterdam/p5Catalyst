import type p5 from 'p5';
import type { setupCallback, valueCallback } from '../../../types';
import type Controller from '../controller';
import type GUIForP5 from '../../gui';
import ValuedController from '../valued_controller';

/**
 * Side by side incrementer & decrementer button for a number
 * @extends ValuedController
 */
export default class Crementer extends ValuedController {
	minVal: number;
	maxVal: number;
	defaultVal: number;
	stepSize: number;
	valueDisplay: p5.Element;
	/**
	 * The value callback.
	 * @type {valueCallback}
	 */
	valueCallback: valueCallback;

	/**
	 * Crementer constructor
	 * @param {GUIForP5} gui
	 * @param {string} name
	 * @param {string} labelStr
	 * @param {number} minVal
	 * @param {number} maxVal
	 * @param {number} defaultVal
	 * @param {number} stepSize
	 * @param {ValueCallback} valueCallback
	 * @param {SetupCallback} [setupCallback]
	 */
	constructor(
		gui: GUIForP5,
		name: string,
		labelStr: string,
		minVal: number,
		maxVal: number,
		defaultVal: number,
		stepSize: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		super(gui, name, labelStr, setupCallback);
		this.minVal = minVal;
		this.maxVal = maxVal;
		this.defaultVal = defaultVal;
		this.stepSize = stepSize;
		this.valueCallback =
			valueCallback || ((controller: Controller, value: any) => {});

		this.controllerElement = gui.p5Instance.createDiv();
		this.controllerElement.class('crementer');
		this.controllerElement.parent(this.controllerWrapper);

		const minusButton = gui.p5Instance.createButton('&#x2190'); // left arrow
		minusButton.parent(this.controllerElement);
		minusButton.elt.onclick = () => this.decrement();

		this.valueDisplay = gui.p5Instance.createSpan(defaultVal.toString());
		this.valueDisplay.parent(this.controllerElement);

		const plusButton = gui.p5Instance.createButton('&#x2192'); // right arrow
		plusButton.parent(this.controllerElement);
		plusButton.elt.onclick = () => this.increment();

		this.value = defaultVal;
		this.valueCallback(this, this.value);
	}

	mod(value: number) {
		const modSize = this.maxVal - this.minVal + 1; // [min,max] inclusive
		return ((value - this.minVal + modSize) % modSize) + this.minVal;
	}

	increment() {
		this.setValue(this.mod(this.value + this.stepSize));
	}

	decrement() {
		this.setValue(this.mod(this.value - this.stepSize));
	}

	setValue(value: number) {
		this.value = this.gui.p5Instance.constrain(
			value,
			this.minVal,
			this.maxVal
		);
		this.valueDisplay.html(this.value);
		this.valueCallback(this, this.value);
		if (this.doUpdateChangeSet()) this.gui.changeSet.save();
	}

	randomize() {
		let randomValue = this.gui.p5Instance.random(this.minVal, this.maxVal);
		randomValue =
			this.gui.p5Instance.round(randomValue / this.stepSize) *
			this.stepSize;
		this.setValue(randomValue);
	}
}
