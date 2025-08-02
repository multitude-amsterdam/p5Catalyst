import type { setupCallback } from '../types/controller_types';
import { Controller } from './controller';
import type { GUIForP5 } from './gui';

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
	setValue(value: any) {
		this.value = value;
		// if (this.doUpdateChangeSet()) changeSet.save();
	}

	// /**
	//  * Randomizes the value of the controller.
	//  */
	// randomize() {
	// 	console.error('No randomize() method.');
	// }

	// /**
	//  * Gets serialized form of the value property.
	//  * @returns {*}
	//  * @see serialize
	//  */
	// getSerializedValue() {
	// 	return ValuedController.serialize(this.value);
	// }

	// /**
	//  * Uses setValue with restored value from serialized form.
	//  * @param {number|string|boolean|Object} serializedValue
	//  * @returns {void}
	//  * @see deserialize
	//  */
	// restoreValueFromSerialized(serializedValue) {
	// 	const value = ValuedController.deserialize(serializedValue);
	// 	if (value === this.value) {
	// 		return;
	// 	}
	// 	this.setValue(value);
	// }

	// /**
	//  * Transforms a value into a form for JSON serialization.
	//  * @static
	//  * @param {*} value
	//  * @returns {*}
	//  */
	// static serialize(value) {
	// 	if (value instanceof Vec2D)
	// 		return ValuedController.prepVec2DForSerialization(value);
	// 	if (value instanceof Vec3D)
	// 		return ValuedController.prepVec3DForSerialization(value);
	// 	if (value instanceof p5.Color)
	// 		return ValuedController.prepColorForSerialization(value);
	// 	// default (including number, string & boolean)
	// 	return value;
	// }

	// /**
	//  * Turns a deserialized JSON object into an instance of its original class.
	//  * @static
	//  * @param {number|string|boolean|Object} serializedValue
	//  * @returns {*}
	//  */
	// static deserialize(serializedValue) {
	// 	if (serializedValue.type === undefined) return serializedValue;
	// 	switch (serializedValue.type) {
	// 		case 'Vec2D':
	// 			return this.restoreSerializedVec2D(serializedValue);
	// 		case 'Vec3D':
	// 			return this.restoreSerializedVec3D(serializedValue);
	// 		case 'p5.Color':
	// 			return this.restoreSerializedColor(serializedValue);
	// 	}
	// 	throw new Error(serializedValue + ' cannot be deserialized.');
	// }

	// /**
	//  * @static
	//  * @param {Vec2D} - Vec2D instance
	//  * @returns {Object}
	//  * @see restoreSerializedVec2D
	//  */
	// static prepVec2DForSerialization({ x, y }) {
	// 	return { type: 'Vec2D', x, y };
	// }
	// /**
	//  * @static
	//  * @param {Object} obj - serialized Vec2D
	//  * @returns {Vec2D}
	//  * @see prepVec2DForSerialization
	//  */
	// static restoreSerializedVec2D(obj) {
	// 	if (obj.type !== 'Vec2D')
	// 		throw new Error('Object is not a serialized Vec2D.');
	// 	return new Vec2D(obj.x, obj.y);
	// }

	// /**
	//  * @static
	//  * @param {Vec3D} - Vec3D instance
	//  * @returns {Object}
	//  * @see restoreSerializedVec3D
	//  */
	// static prepVec3DForSerialization({ x, y, z }) {
	// 	return { type: 'Vec3D', x, y, z };
	// }
	// /**
	//  * @param {Object} obj - serialized Vec3D
	//  * @returns {Vec3D}
	//  * @see prepVec3DForSerialization
	//  */
	// static restoreSerializedVec3D(obj) {
	// 	if (obj.type !== 'Vec3D')
	// 		throw new Error('Object is not a serialized Vec3D.');
	// 	return new Vec3D(obj.x, obj.y, obj.z);
	// }

	// /**
	//  * Preps a p5.Color for serialisation in JSON.
	//  * Strips any unneeded information.
	//  * @static
	//  * @param {p5.Color} color
	//  * @returns {Object}
	//  * @see restoreSerializedColor
	//  */
	// static prepColorForSerialization({ _array }) {
	// 	return { type: 'p5.Color', _array };
	// }
	// /**
	//  * @static
	//  * @param {Object} obj - The serialized object.
	//  * @returns {p5.Color} - The restored p5.Color object or the original object if not a color.
	//  * @see prepColorForSerialization
	//  */
	// static restoreSerializedColor(obj) {
	// 	if (obj.type !== 'p5.Color')
	// 		throw new Error('Object is not a serialized p5.Color.');
	// 	push();
	// 	colorMode(RGB);
	// 	const col = color(0);
	// 	col._array = obj._array;
	// 	col._calculateLevels();
	// 	pop();
	// 	return col;
	// }
}
