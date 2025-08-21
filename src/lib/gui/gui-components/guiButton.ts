import type { P5Button } from 'src/lib/types/controller';
import type GUIForP5 from '../gui';

export class GUIButton {
	button: P5Button;
	gui: GUIForP5;
	constructor(gui: GUIForP5) {
		this.gui = gui;
		this.button = gui.p5Instance.createButton('') as P5Button;
	}
}
