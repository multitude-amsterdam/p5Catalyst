import type p5 from 'p5';
import Field from '../field';
import GUIForP5 from '../../gui';
import { baseGroup } from './baseGroup';

export class Panel extends baseGroup {
	container: p5.Element;
	gui: GUIForP5;

	constructor(gui: GUIForP5, name: string) {
		super(gui, name, 'panel');
		this.gui = gui;
		let detailElement = gui.p5Instance.createElement(
			'details',
			`<summary>${name}</summary>`
		);
		this.container = gui.p5Instance
			.createElement('div')
			.addClass('panel-container');
		detailElement.child(this.container);
		this.div.child(detailElement);
	}

	//   /**
	//    * Adds a field (GUI element) to the GUI.
	//    * @param {Field} field
	//    * @returns {Field}
	//    */
	attachField<T extends Field>(field: T) {
		this.container.child(field.div);
	}
}
