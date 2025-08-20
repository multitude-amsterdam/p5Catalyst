import Field from '../../field';
import type GUIForP5 from '../../gui';

/**
 * Wrapper for <img> elements placed in the GUI.
 * @extends Field
 */
export default class ImageField extends Field {
	/**
	 * Creates a new GUI image element.
	 * @param {p5.Element} parentDiv - The parent element to attach the image to.
	 * @param {string} url - The URL of the image.
	 * @param {string} altText - The alt text for the image.
	 * @param {boolean} [doAlignCenter=true] - Whether to center the image in its container.
	 */
	constructor(
		gui: GUIForP5,
		url: string,
		altText: string,
		doAlignCenter?: boolean
	) {
		super(gui, '', 'gui-image');
		altText = gui.lang.process(altText, true);
		this.div.html(`<img src='${url}' alt='${altText}'>`);
		if (doAlignCenter) {
			this.div.style('text-align', 'center');
		}
	}
}
