import { DieIcon } from '../components';
import type { GUIForP5 } from '../GUIForP5';
import { GUIButton } from './GUIButton';

export class RandomizeButton extends GUIButton {
	constructor(gui: GUIForP5) {
		super(gui);

		if (!gui.randomizer) return;

		this.button.class('dark-mode-button');
		this.button.mousePressed(() => {
			gui.randomizer?.randomize();
		});

		const die = new DieIcon(gui.randomizer, undefined, () => {
			die.randomizeIcon();
		});
		die.imgContainer.parent(this.button);
	}
}
