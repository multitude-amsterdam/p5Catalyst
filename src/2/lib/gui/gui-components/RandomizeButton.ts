import { DieIcon } from '../components';
import type { CatalystGUI } from '../CatalystGUI';
import { GUIButton } from './GUIButton';

export class RandomizeButton extends GUIButton {
	constructor(gui: CatalystGUI, dieIconSvgs: string[]) {
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
