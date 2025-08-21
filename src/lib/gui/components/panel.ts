import type p5 from 'p5';
import Field from './field';
import type GUIForP5 from '../gui';
import { Addable, type Attachable } from './addable_trait';

class PanelBase extends Field implements Attachable {
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

export class Panel extends Addable(PanelBase) {}
