import { Addable, type Attachable } from './addable_trait';
import Field from './field';
import type GUIForP5 from '../gui';

export const ROW = 'row' as const;
export const COLUMN = 'column' as const;

export type Orientation = typeof ROW | typeof COLUMN;

class groupBase extends Field implements Attachable {
	gui: GUIForP5;

	constructor(gui: GUIForP5, name: string, orientation: Orientation) {
		super(gui, name, `button-group ${orientation}`);
		this.gui = gui;
	}

	//   /**
	//    * Adds a field (GUI element) to the GUI.
	//    * @param {Field} field
	//    * @returns {Field}
	//    */
	attachField<T extends Field>(field: T) {
		this.div.child(field.div);
	}
}

export class Group extends Addable(groupBase) {}
