import type { P5Button } from 'src/2/lib/types/controller';
import type { GUIForP5 } from '../GUIForP5';

export class GUIButton {
	button: P5Button;
	gui: GUIForP5;
	constructor(gui: GUIForP5, callback?: () => void) {
		this.gui = gui;
		this.button = gui.p5Instance.createButton('') as P5Button;
		if (callback) this.button.mousePressed(callback);
	}
}
