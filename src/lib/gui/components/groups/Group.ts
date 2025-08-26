import type { GUIForP5 } from '../../GUIForP5';
import { BaseGroup } from './BaseGroup';

export const ROW = 'row' as const;
export const COLUMN = 'column' as const;

export type Orientation = typeof ROW | typeof COLUMN;

export class Group extends BaseGroup {
	gui: GUIForP5;

	constructor(gui: GUIForP5, name: string, orientation: Orientation) {
		super(gui, name, `button-group ${orientation}`);
		this.gui = gui;
	}
}
