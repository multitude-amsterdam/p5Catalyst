import type p5 from 'p5';
import Field from './field';
import type GUIForP5 from '../gui';

export class Panel extends Field {
	detailElement: p5.Element;

	constructor(gui: GUIForP5, name: string) {
		super(gui, name, 'panel');
		this.detailElement = gui.p5Instance.createElement(
			'details',
			`<summary>${name}</summary>`
		);
		this.div.child(this.detailElement);
	}

	//   /**
	//    * Adds a field (GUI element) to the GUI.
	//    * @param {Field} field
	//    * @returns {Field}
	//    */
	addFields<T extends Field>(fields: T | T[]) {
		fields = Array.isArray(fields) ? fields : [fields];
		for (const field of fields) {
			this.detailElement.child(field.div);
		}
	}
}
