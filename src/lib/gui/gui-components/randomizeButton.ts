import { DieIcon } from '../components';
import type GUIForP5 from '../gui';
import { GUIButton } from './guiButton';

export class RandomizeButton extends GUIButton {
	constructor(gui: GUIForP5) {
		super(gui);
		if (gui.randomizer) {
			this.button.class('dark-mode-button');
			this.button.elt.onclick = () => {
				gui.randomizer?.randomize();
			};
			const die = new DieIcon(gui.randomizer, undefined, () => {
				die.randomizeIcon();
			});
			this.button.child(die.imgContainer);
		}
	}
}
