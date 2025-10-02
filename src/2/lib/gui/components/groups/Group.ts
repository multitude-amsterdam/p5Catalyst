import type { CatalystGUI } from '../../CatalystGUI';
import { BaseGroup } from './BaseGroup';

export const ROW = 'row' as const;
export const COLUMN = 'column' as const;

export type Orientation = typeof ROW | typeof COLUMN;

export class Group extends BaseGroup {
	gui: CatalystGUI;

	constructor(gui: CatalystGUI, name: string, orientation: Orientation) {
		super(gui, name, `button-group ${orientation}`);
		this.gui = gui;
	}
}
