import p5 from 'p5';
import Field from '../field';
import Controller from '../controller';
import GUIForP5 from '../../gui';

/**
 * Text label associated with a controller.
 * @extends Field
 */
export default class Label extends Field {
	controller: Controller;
	text?: string;
	/**
	 * Creates a new Label instance.
	 * @param {Controller} controller - The controller this label is associated with.
	 * @param {string} text - The text content of the label.
	 */
	constructor(
		gui: GUIForP5,
		controller: Controller,
		text: string,
		parentDiv?: p5.Element
	) {
		super(gui, '', 'gui-label', parentDiv);
		this.controller = controller;
		text = gui.lang.process(text, true);
		this.setText(text);
	}

	/**
	 * Sets the text content of the label.
	 * @param {string} text - The new text content for the label.
	 */
	setText(text: string) {
		this.text = text;
		this.div.elt.innerText = text;
	}
}
