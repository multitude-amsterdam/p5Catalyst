import type p5 from 'p5';
import { Field } from '../Field';
import { CatalystGUI } from '../../CatalystGUI';
import { BaseGroup } from './BaseGroup';

export class Panel extends BaseGroup {
	name: string;
	container: p5.Element;

	constructor(gui: CatalystGUI, name: string, isOpen?: boolean) {
		const id = name.toLowerCase().replace(/\s+/g, '-');
		super(gui, id, 'panel');
		this.name = gui.lang.process(name, true);
		const detailElement = gui.sketch.createElement(
			'details',
			`<summary>${this.name}</summary>`
		);
		detailElement.elt.open = isOpen;
		this.container = gui.sketch
			.createElement('div')
			.addClass('panel-container');
		detailElement.child(this.container);
		this.div.child(detailElement);
	}

	attachField<T extends Field>(field: T) {
		this.container.child(field.div);
		this.fields.push(field);
	}

	isOpen() {
		return (this.div.elt.firstChild as HTMLDetailsElement).open === true;
	}

	close() {
		(this.div.elt.firstChild as HTMLDetailsElement).open = false;
	}

	open() {
		(this.div.elt.firstChild as HTMLDetailsElement).open = true;
	}

	toggle() {
		if (this.isOpen()) {
			this.close();
		} else {
			this.open();
		}
	}
}
