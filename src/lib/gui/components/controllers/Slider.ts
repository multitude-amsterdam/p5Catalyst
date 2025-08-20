import type { setupCallback, valueCallback } from '../../../types';
import type GUIForP5 from '../../gui';
import ValuedController from '../../valued_controller';
/**
 * One dimensional slider controller.
 * @extends ValuedController
 */
export default class Slider extends ValuedController {
	minVal: number;
	maxVal: number;
	defaultVal: number;
	stepSize: number;
	/**
	 * The value callback.
	 * @type {valueCallback}
	 */
	valueCallback: valueCallback;
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
		this.controllerElement = gui.p5Instance.createSlider(
			minVal,
			maxVal,
			defaultVal,
			stepSize
		);
		this.controllerElement.parent(this.controllerWrapper);
		this.minVal = minVal;
		this.maxVal = maxVal;
		this.defaultVal = defaultVal;
		this.stepSize = stepSize;
		this.value = defaultVal;

		this.controllerElement.elt.oninput = (event: InputEvent) => {
			const target = event.target as HTMLInputElement;
			const value = parseFloat(target.value);
			if (valueCallback) valueCallback(this, value);
		};
		this.controllerElement.elt.onchange = (event: InputEvent) => {
			const target = event.target as HTMLInputElement;
			const value = parseFloat(target.value);
			this.setValue(value);
		};
		this.valueCallback =
			valueCallback || ((controller: ValuedController, value: any) => {});
		this.valueCallback(this, this.value);
	}

	setValue(value: number) {
		this.value =
			this.gui.p5Instance.round(value / this.stepSize) * this.stepSize;
		this.valueCallback(this, value);
		this.controllerElement?.value(value);
		if (this.doUpdateChangeSet()) this.gui.changeSet.save();
	}

	randomize() {
		this.setValue(this.gui.p5Instance.random(this.minVal, this.maxVal));
	}
}
