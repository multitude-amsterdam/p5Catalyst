import type { CatalystGUI } from '../../CatalystGUI';
import { BaseGroup } from './BaseGroup';

export class Tab extends BaseGroup {
	gui: CatalystGUI;
	name: string;

	constructor(gui: CatalystGUI, name: string) {
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
