import type p5 from 'p5';
import type { GUIForP5 } from './gui';
import type { Field } from './field';

export default class Tab {
	gui: GUIForP5;
	name: string;
	div: p5.Element;

	constructor(gui: GUIForP5, name: string) {
		this.gui = gui;
		this.name = name;
		this.div = gui.p5Instance.createDiv();
		this.div.id('guiGroup-' + name.replaceAll(' ', '-').toLowerCase());
		this.div.addClass('tab');
	}

	//   /**
	//    * Adds a field (GUI element) to the GUI.
	//    * @param {Field} field
	//    * @returns {Field}
	//    */
	addFields<T extends Field>(fields: T | T[]) {
		fields = Array.isArray(fields) ? fields : [fields];
		for (const field of fields) {
			this.div.child(field.div);
		}
	}

	/**
	 * Show the div property.
	 * Doesn't invoke any `show` and `hide` methods of `Field`.
	 * @see show
	 */
	hide() {
		this.div.hide();
	}

	/**
	 * Show the div property.
	 * Doesn't invoke any `show` and `hide` methods of `Field`.
	 * @see hide
	 */
	show() {
		this.div.elt.style.display = ''; // more general than p5 .show()
	}
}
