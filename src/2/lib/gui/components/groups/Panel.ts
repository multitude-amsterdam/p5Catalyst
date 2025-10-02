import type p5 from 'p5';
import { Field } from '../Field';
import { CatalystGUI } from '../../CatalystGUI';
import { BaseGroup } from './BaseGroup';

export class Panel extends BaseGroup {
	container: p5.Element;
	gui: CatalystGUI;

	constructor(gui: CatalystGUI, name: string, open?: boolean) {
		name = gui.lang.process(name, true);
		const id = name.toLowerCase().replace(/\s+/g, '-');
		super(gui, id, 'panel');

		this.gui = gui;

		let detailElement = gui.sketch.createElement(
			'details',
			`<summary>${name}</summary>`
		);
		detailElement.elt.open = open;
		this.container = gui.sketch
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
