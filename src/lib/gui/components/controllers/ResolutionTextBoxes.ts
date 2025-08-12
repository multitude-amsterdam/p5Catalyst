import type p5 from 'p5';
import type { setupCallback, valueCallback } from '../../../types';
import type { GUIForP5 } from '../../gui';
import { ValuedController } from '../../valued_controller';
import { Textbox } from './Textbox';

/**
 * Pair of textboxes for width and height values.
 * @extends ValuedController
 */
export class ResolutionTextboxes extends ValuedController {
	w: number;
	h: number;
	wBox: Textbox;
	hBox: Textbox;

	/**
	 * Constructor for ResolutionTextboxes.
	 * @param {GUIForP5} gui - The GUI instance.
	 * @param {number} defaultWidth - Default width value.
	 * @param {number} defaultHeight - Default height value.
	 * @param {function} valueCallback - Callback function for value changes.
	 * @param {function} [setupCallback] - Optional setup callback.
	 */
	constructor(
		gui: GUIForP5,
		defaultWidth: number,
		defaultHeight: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		super(gui, 'resolutionTextboxes', '', setupCallback);
		this.w = defaultWidth;
		this.h = defaultHeight;
		this.wBox = new Textbox(
			gui,
			'resolutionTextBoxes-Width',
			gui.lang.process('LANG_WIDTH:', true),
			defaultWidth.toString(),
			(controller, value) => {
				const pxDim = parseInt(value);
				if (isNaN(pxDim)) return;
				this.w = pxDim;
				gui.state.resize?.(this.w, this.h);
				if (valueCallback)
					valueCallback(this, { w: this.w, h: this.h });
			}
		);
		this.hBox = new Textbox(
			gui,
			'resolutionTextBoxes-Height',
			gui.lang.process('LANG_HEIGHT:', true),
			defaultHeight.toString(),
			(controller, value) => {
				const pxDim = parseInt(value);
				if (isNaN(pxDim)) return;
				this.h = pxDim;
				gui.state.resize?.(this.w, this.h);
				if (valueCallback)
					valueCallback(this, { w: this.w, h: this.h });
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
