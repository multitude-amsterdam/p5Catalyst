import { DieIcon } from '../components';
import type { GUIForP5 } from '../GUIForP5';
import { GUIButton } from './GUIButton';

export class RandomizeButton extends GUIButton {
	constructor(gui: GUIForP5, dieIconSvgs: string[]) {
		super(gui);

		if (!gui.randomizer) return;

		this.button.mousePressed(() => {
			gui.randomizer?.randomize();
		});

		DieIcon.dieIconSvgs = dieIconSvgs;

		const die = new DieIcon(gui.randomizer, undefined, () => {
			die.randomizeIcon();
		});
		die.imgContainer.parent(this.button);
	}
}
