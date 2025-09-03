import type p5 from 'p5';
import { Field } from '../Field';
import { GUIForP5 } from '../../GUIForP5';
import { BaseGroup } from './BaseGroup';

export class Panel extends BaseGroup {
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

	attachField<T extends Field>(field: T) {
		this.container.child(field.div);
	}

	isClosed() {
		return (this.div.elt.firstChild as HTMLDetailsElement).open === false;
	}

	close() {
		(this.div.elt.firstChild as HTMLDetailsElement).open = false;
	}

	open() {
		(this.div.elt.firstChild as HTMLDetailsElement).open = true;
	}

	toggle() {
		if (this.isClosed()) {
			this.open();
		} else {
			this.close();
		}
	}
}
