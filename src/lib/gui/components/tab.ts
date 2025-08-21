import type p5 from 'p5';
import type GUIForP5 from '../gui';
import Field from './field';
import { Addable, type Attachable } from './addable_trait';

class TabBase implements Attachable {
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
	attachField<T extends Field>(field: T) {
		this.div.child(field.div);
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

export class Tab extends Addable(TabBase) {}
