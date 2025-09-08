import type { CommandBar } from '../components/CommandBar';
import type { GUIForP5 } from '../GUIForP5';
import { GUIButton } from './GUIButton';
import p5 from 'p5';

export class SettingsButton extends GUIButton {
	icon: p5.Element;

	constructor(gui: GUIForP5, commandBar: CommandBar) {
		super(gui, () => {});

		this.button.mousePressed(() => {
			gui.dialog.alert(gui.lang.process('LANG_SETTINGS_DIALOG'));
		});

		this.icon = commandBar.createIconDiv(this, 'command-bar__icon');
		this.icon.addClass('command-bar__icon--settings');
	}

	createHtml(): string {
		return '';
	}
}
