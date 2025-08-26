import { Field } from '../Field';
import type { GUIForP5 } from '../../GUIForP5';

/**
 * Horizontal rule used to divide sections.
 * @extends Field
 */
export class Divider extends Field {
	/**
	 * Creates a new Divider instance.
	 * @param {p5.Element} parentDiv - The parent element to attach the divider to.
	 */
	constructor(gui: GUIForP5) {
		super(gui, '', 'gui-divider');
		this.div.html('<hr>');
	}
}
