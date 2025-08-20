import Field from '../../field';
import type GUIForP5 from '../../gui';

/**
 * Block of explanatory text.
 * @extends Field
 */
export default class TextField extends Field {
	constructor(
		gui: GUIForP5,
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
