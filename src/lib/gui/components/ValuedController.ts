import p5 from 'p5';
import type {
	ControllerValue,
	SerializedColor,
	SerializedValue,
	SerializedVector,
	setupCallback,
	valueCallback,
} from '../../types';
import { Controller } from './Controller';
import type { GUIForP5 } from '../GUIForP5';

/**
 * Controller that holds a value which can be serialized.
 * @extends Controller
 * @example
 * // ValuedController gives back its value through a callback, that's where you tie it to the system.
 * // I usually link it to generator like so, also using data from generator to construct the controller:
 * const fgColBoxes = new ColourBoxes(
 * 	gui,
 * 	'colourBoxesFgCol',
 * 	'Foreground colour',
 * 	generator.palette,
 * 	0,
 * 	(controller, value) => {
 * 		generator.fgCol = value;
 * 	}
 * );
 */

export class ValuedController extends Controller {
	/**
	 * The value of the controller.
	 * @type {any}
	 */
	value: ControllerValue;
	defaultValue: ControllerValue;

	/**
	 * Constructor for ValuedController.
	 * @param {GUIForP5} gui
	 * @param {string} name
	 * @param {string} labelStr
	 * @param {SetupCallback} [setupCallback]
	 */
	constructor(
		gui: GUIForP5,
		name: string,
		labelStr: string,
		defaultValue: ControllerValue,
		setupCallback?: setupCallback
	) {
		super(gui, name, labelStr, setupCallback);

		this.defaultValue = defaultValue;
		this.value = 'tmp';
		this.resetToDefault();
	}

	resetToDefault() {
		if (this.defaultValue instanceof p5.Color) {
			this.value = this.gui.p5Instance.color(this.defaultValue);
		} else if (this.defaultValue instanceof p5.Vector) {
			this.value = this.defaultValue.copy();
		} else {
			this.value = this.defaultValue;
		}
	}

	/**
	 * Sets the value of the controller.
	 */
	setValue(value: ControllerValue) {
		this.value = value;
		if (this.doUpdateChangeSet()) this.gui.changeSet.save();
	}

	/**
	 * Randomizes the value of the controller.
	 */
	randomize() {
		console.error('No randomize() method.');
	}

	/**
	 * Gets serialized form of the value property.
	 * @see serialize
	 */
	getSerializedValue(): SerializedValue {
		return this.serialize(this.value);
	}

	/**
	 * Uses setValue with restored value from serialized form.
	 * @see deserialize
	 */
	restoreValueFromSerialized(serializedValue: SerializedValue) {
		const value = this.deserialize(serializedValue);
		if (value === this.value) {
			return;
		}
		this.setValue(value);
	}

	/**
	 * Transforms a value into a form for JSON serialization.
	 * */
	serialize(value: ControllerValue): SerializedValue {
		if (value instanceof p5.Vector)
			return {
				type: 'Vector',
				value: this.serializeVector(value),
			};
		if (value instanceof p5.Color)
			return {
				type: 'Color',
				value: this.serializeColor(value),
			};
		if (Array.isArray(value) && value[0] instanceof p5.Color)
			return {
				type: 'Color[]',
				value: value.map(
					(col): SerializedColor =>
						this.serializeColor(col as p5.Color)
				),
			};
		return {
			type: 'Basic',
			value: value as string | number | boolean,
		};
	}

	/**
	 * Turns a deserialized JSON object into an instance of its original class.
	 */
	deserialize(serializedValue: SerializedValue): ControllerValue {
		switch (serializedValue.type) {
			case 'Vector':
				return this.restoreSerializedVector(
					serializedValue.value as SerializedVector
				);
			case 'Color':
				return this.restoreSerializedColor(
					serializedValue.value as SerializedColor
				);
			case 'Color[]':
				return (serializedValue.value as SerializedColor[]).map(
					(serCol: SerializedColor) =>
						this.restoreSerializedColor(serCol)
				);
			case 'Basic':
				return serializedValue.value as number | string | boolean;
		}
	}

	serializeVector(vector: p5.Vector): SerializedVector {
		const { x, y, z } = vector;
		return { x, y, z };
	}

	restoreSerializedVector(vector: SerializedVector) {
		const { x, y, z } = vector;
		return new p5.Vector(x, y, z);
	}

	/**
	 * Preps a p5.Color for serialisation in JSON.
	 * Strips any unneeded information.
	 * @see restoreSerializedColor
	 */
	serializeColor(color: p5.Color): SerializedColor {
		const r = this.gui.p5Instance.red(color);
		const g = this.gui.p5Instance.green(color);
		const b = this.gui.p5Instance.blue(color);
		const a = this.gui.p5Instance.alpha(color);
		return { r, g, b, a };
	}
	/**
	 * @see prepColorForSerialization
	 */
	restoreSerializedColor(color: SerializedColor): p5.Color {
		const { r, g, b, a } = color;
		this.gui.p5Instance.push();
		this.gui.p5Instance.colorMode(this.gui.p5Instance.RGB);
		const col = this.gui.p5Instance.color(r, g, b, a);
		this.gui.p5Instance.pop();
		return col;
	}
}
