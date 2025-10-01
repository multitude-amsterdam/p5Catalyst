import type { GUIForP5 } from '../../GUIForP5';
import { BaseGroup } from './BaseGroup';

export class Tab extends BaseGroup {
	gui: GUIForP5;
	name: string;

	constructor(gui: GUIForP5, name: string) {
		super(
			gui,
			'guiGroup-' + name.replaceAll(' ', '-').toLowerCase(),
			'tab'
		);
		this.gui = gui;
		this.name = name;
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
