import { Field } from '../Field';
import type { CatalystGUI } from '../../CatalystGUI';

/**
 * Block of explanatory text.
 * @extends Field
 */
export class TextField extends Field {
	constructor(
		gui: CatalystGUI,
		text: string,
		className?: string,
		doAlignCenter?: boolean
	) {
		super(gui, '', 'gui-textfield');
		text = gui.lang.process(text, true);
		this.div.html(`<span>${text}</span>`);
		if (className) {
			this.div.addClass(className);
		}
		if (doAlignCenter) {
			this.div.style('text-align', 'center');
		}
	}
}
