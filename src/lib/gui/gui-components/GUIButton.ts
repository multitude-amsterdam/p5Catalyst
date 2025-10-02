import type { P5Button } from '../../types/controller';
import type { CatalystGUI } from '../CatalystGUI';

export class GUIButton {
	button: P5Button;
	gui: CatalystGUI;
	constructor(gui: CatalystGUI, callback?: () => void) {
		this.gui = gui;
		this.button = gui.sketch.createButton('') as P5Button;
		if (callback) this.button.mousePressed(callback);
	}
}
