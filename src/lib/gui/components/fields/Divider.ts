import Field from '../field';
import type GUIForP5 from '../../gui';

/**
 * Horizontal rule used to divide sections.
 * @extends Field
 */
export default class Divider extends Field {
	/**
	 * Creates a new Divider instance.
	 * @param {p5.Element} parentDiv - The parent element to attach the divider to.
	 */
	constructor(gui: GUIForP5) {
		super(gui, '', 'gui-divider');
		this.div.html('<hr>');
	}
}
