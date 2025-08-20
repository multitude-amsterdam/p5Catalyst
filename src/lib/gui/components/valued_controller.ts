import p5 from 'p5';
import type {
	controllerValue,
	serializedColor,
	serializedValue,
	serializedVector,
	setupCallback,
	valueCallback,
} from '../../types';
import Controller from './controller';
import type GUIForP5 from '../gui';

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
export default class ValuedController extends Controller {
	/**
	 * The value of the controller.
	 * @type {any}
	 */
	value: any;

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
		setupCallback?: setupCallback
	) {
		super(gui, name, labelStr, setupCallback);
	}

	/**
	 * Sets the value of the controller.
	 * @param {any} value - The value to set.
	 */
	setValue(
		value:
			| number
			| number[]
			| string
			| string[]
			| boolean
			| p5.Color
			| p5.Vector
	) {
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
	 * @returns {*}
	 * @see serialize
	 */
	getSerializedValue(): serializedValue {
		return this.serialize(this.value);
	}

	/**
	 * Uses setValue with restored value from serialized form.
	 * @param {number|string|boolean|Object} serializedValue
	 * @returns {void}
	 * @see deserialize
	 */
	restoreValueFromSerialized(serializedValue: serializedValue) {
		const value = this.deserialize(serializedValue);
		if (value === this.value) {
			return;
		}
		this.setValue(value);
	}

	/**
	 * Transforms a value into a form for JSON serialization.
	 * @static
	 * @param {*} value
	 * @returns {*}
	 */
	serialize(value: controllerValue): serializedValue {
		if (value instanceof p5.Vector) return this.serializeVector(value);
		if (value instanceof p5.Color) return this.serializeColor(value);
		return { type: 'Basic', value };
	}

	/**
	 * Turns a deserialized JSON object into an instance of its original class.
	 * @static
	 * @param {serializedValue} serializedValue
	 * @returns {*}
	 */
	deserialize(
		serializedValue: serializedValue
	): p5.Color | p5.Vector | number | string | boolean {
		switch (serializedValue.type) {
			case 'Vector':
				return this.restoreSerializedVector(serializedValue);
			case 'Color':
				return this.restoreSerializedColor(serializedValue);
			case 'Basic':
				return serializedValue.value as number | string | boolean;
		}
	}

	serializeVector(vector: p5.Vector): serializedValue {
		const { x, y, z } = vector;
		return { type: 'Vector', value: { x, y, z } };
	}

	restoreSerializedVector(vector: serializedValue) {
		if (vector.type !== 'Vector') {
			throw new Error('Object is not a serialized Vector');
		}
		const { x, y, z } = vector.value as serializedVector;
		return new p5.Vector(x, y, z);
	}

	/**
	 * Preps a p5.Color for serialisation in JSON.
	 * Strips any unneeded information.
	 * @static
	 * @param {p5.Color} color
	 * @returns {Object}
	 * @see restoreSerializedColor
	 */
	serializeColor(color: p5.Color): serializedValue {
		const r = this.gui.p5Instance.red(color);
		const g = this.gui.p5Instance.green(color);
		const b = this.gui.p5Instance.blue(color);
		const a = this.gui.p5Instance.alpha(color);
		return { type: 'Color', value: { r, g, b, a } };
	}
	/**
	 * @static
	 * @param {Object} obj - The serialized object.
	 * @returns {p5.Color} - The restored p5.Color object or the original object if not a color.
	 * @see prepColorForSerialization
	 */
	restoreSerializedColor(color: serializedValue): p5.Color {
		if (color.type !== 'Color')
			throw new Error('Object is not a serialized p5.Color.');
		const { r, g, b, a } = color.value as serializedColor;
		this.gui.p5Instance.push();
		this.gui.p5Instance.colorMode(this.gui.p5Instance.RGB);
		const col = this.gui.p5Instance.color(r, g, b, a);
		this.gui.p5Instance.pop();
		console.log(col);
		return col;
	}
}
