import type p5 from 'p5';
import type { setupCallback, valueCallback } from '../../../types';
import type { CatalystGUI } from '../../CatalystGUI';
import { ValuedController } from '../ValuedController';
import { Textbox } from './Textbox';

/**
 * Pair of textboxes for width and height values.
 * @extends ValuedController
 */
export class ResolutionTextBoxes extends ValuedController {
	wBox: Textbox;
	hBox: Textbox;

	constructor(
		gui: CatalystGUI,
		defaultWidth: number,
		defaultHeight: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		super(
			gui,
			'resolutionTextboxes',
			'',
			gui.sketch.createVector(defaultWidth, defaultHeight),
			setupCallback
		);
		this.wBox = new Textbox(
			gui,
			'resolutionTextBoxes-Width',
			gui.lang.process('LANG_WIDTH:', true),
			defaultWidth.toString(),
			(controller, textBoxValue) => {
				let value = this.value as p5.Vector;
				const pxDim = parseInt(textBoxValue as string);
				if (isNaN(pxDim)) return;
				value.x = pxDim;
				gui.sketch.catalyst?.resizeCanvas(value.x, value.y);
				if (valueCallback) valueCallback(this, this.value);
			}
		);
		this.hBox = new Textbox(
			gui,
			'resolutionTextBoxes-Height',
			gui.lang.process('LANG_HEIGHT:', true),
			defaultHeight.toString(),
			(controller, textBoxValue) => {
				let value = this.value as p5.Vector;
				const pxDim = parseInt(textBoxValue as string);
				if (isNaN(pxDim)) return;
				value.y = pxDim;
				gui.sketch.catalyst?.resizeCanvas(value.x, value.y);
				if (valueCallback) valueCallback(this, this.value);
			}
		);

		for (const tb of [this.wBox, this.hBox]) {
			tb.div.parent(this.controllerWrapper);
		}
	}

	setValue(vec: p5.Vector) {
		this.value = vec;
		this.wBox.setValue(vec.x.toString());
		this.hBox.setValue(vec.y.toString());
		if (this.doUpdateChangeSet()) this.gui.changeSet.save();
	}

	/**
	 * Sets the width and height values directly.
	 * @param {number} w - The width value.
	 * @param {number} h - The height value.
	 * @return {void}
	 */
	setValueOnlyDisplay(w: number, h: number) {
		this.wBox.controllerElement?.value(w);
		this.hBox.controllerElement?.value(h);
	}
}
