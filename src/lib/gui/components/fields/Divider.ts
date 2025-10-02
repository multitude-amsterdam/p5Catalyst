import { Field } from '../Field';
import type { CatalystGUI } from '../../CatalystGUI';

/**
 * Horizontal rule used to divide sections.
 * @extends Field
 */
export class Divider extends Field {
	/**
	 * Creates a new Divider instance.
	 * @param {p5.Element} parentDiv - The parent element to attach the divider to.
	 */
	constructor(gui: CatalystGUI) {
		super(gui, '', 'gui-divider');
		this.div.html('<hr>');
	}
}
