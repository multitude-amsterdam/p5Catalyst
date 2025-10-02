import { Field } from '../Field';
import type { CatalystGUI } from '../../CatalystGUI';

/**
 * Heading element used as a section title.
 * @extends Field
 */
export class Title extends Field {
	/**
	 * Creates a new Title instance.
	 * @param {p5.Element} parentDiv - The parent element to attach the title to.
	 * @param {number} hSize - The heading size (1-6).
	 * @param {string} text - The text content of the title.
	 */
	constructor(gui: CatalystGUI, hSize: number, text: string) {
		super(gui, '', 'gui-title');
		text = gui.lang.process(text, true);
		this.div.html(`<h${hSize}>${text}</h${hSize}>`);
	}
}
