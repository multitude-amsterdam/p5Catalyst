import Field from '../field';
import type GUIForP5 from '../../gui';

/**
 * Heading element used as a section title.
 * @extends Field
 */
export default class Title extends Field {
	/**
	 * Creates a new Title instance.
	 * @param {p5.Element} parentDiv - The parent element to attach the title to.
	 * @param {number} hSize - The heading size (1-6).
	 * @param {string} text - The text content of the title.
	 * @param {boolean} [doAlignCenter=false] - Whether to center the title text.
	 */
	constructor(
		gui: GUIForP5,
		hSize: number,
		text: string,
		doAlignCenter: boolean = false
	) {
		super(gui, '', 'gui-title');
		text = gui.lang.process(text, true);
		this.div.html(`<h${hSize}>${text}</h${hSize}>`);
		if (doAlignCenter) {
			this.div.style('text-align', 'center');
		}
	}
}
