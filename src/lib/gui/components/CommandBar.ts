import p5 from 'p5';
import { GUIForP5 } from '../GUIForP5';
import { Field } from './Field';
import type { Config } from 'src/lib/types';
import { ThemeToggle } from '../gui-components/ThemeToggle';
import { RandomizeButton } from '../gui-components/RandomizeButton';
import { GUIButton } from '../gui-components/GUIButton';
import { SettingsButton } from '../gui-components/SettingsButton';

export class CommandBar extends Field {
	undoButton: GUIButton;
	redoButton: GUIButton;
	resetButton: GUIButton;
	helpButton: GUIButton;

	themeToggle: ThemeToggle;
	randomizeButton?: RandomizeButton;
	settingsButton: SettingsButton;

	filler: p5.Element;
	centerDiv: p5.Element;

	constructor(config: Config, gui: GUIForP5) {
		super(
			gui,
			'',
			'command-bar',
			gui.p5Instance.select('main') as p5.Element
		);

		this.div.class('command-bar');
		gui.p5Instance.select('#canvas-workarea')?.elt.prepend(this.div.elt);

		// randomizer button
		if (config.createRandomizer) {
			this.randomizeButton = new RandomizeButton(gui);
			this.randomizeButton.button.parent(this.div);
			this.randomizeButton.button.addClass('command-bar__button');
			this.randomizeButton.button.addClass(
				'command-bar__button--randomizer'
			);
			this.randomizeButton.button.elt.title = gui.lang.process(
				'LANG_RANDOMIZE',
				true
			);
		}

		// undo/redo buttons
		{
			this.undoButton = this.createButton('LANG_UNDO', () => {
				this.gui.changeSet.undo();
			});
			this.createIconDiv(this.undoButton, 'command-bar__icon--undo');

			this.redoButton = this.createButton('LANG_REDO', () => {
				this.gui.changeSet.redo();
			});
			this.createIconDiv(this.redoButton, 'command-bar__icon--redo');
		}

		// reset button
		{
			this.resetButton = this.createButton('LANG_RESET', () => {
				this.gui.resetToDefaults();
			});
			this.createIconDiv(this.resetButton, 'command-bar__icon--reset');
		}

		// middle filler
		// pushes buttons either sides
		this.filler = gui.p5Instance
			.createDiv()
			.parent(this.div)
			.class('command-bar__filler') as p5.Element;

		// help button
		{
			this.helpButton = this.createButton('LANG_HELP', () => {
				this.gui.dialog.alert('LANG_HELPME_MSG');
			});
			this.createIconDiv(this.helpButton, 'command-bar__icon--help');
		}

		// theme toggle
		{
			this.themeToggle = new ThemeToggle(gui, this);
			this.themeToggle.button.parent(this.div);
			this.themeToggle.button.addClass('command-bar__button');
		}

		// settings
		{
			this.settingsButton = new SettingsButton(gui, this);
			this.settingsButton.button.parent(this.div);
			this.settingsButton.button.addClass('command-bar__button');
		}

		// centered div on bar that hold logo or image
		this.centerDiv = gui.p5Instance
			.createDiv()
			.parent(this.div)
			.class('commandbar__center') as p5.Element;
	}

	createButton(label: string, callback: () => void): GUIButton {
		label = this.gui.lang.process(label, true);
		const button: GUIButton = new GUIButton(this.gui, callback);
		button.button
			.parent(this.div)
			.addClass('command-bar__button') as p5.Element;
		button.button.elt.title = label;
		return button;
	}

	createIconDiv(button: GUIButton, className: string): p5.Element {
		const icon: p5.Element = this.gui.p5Instance.createDiv() as p5.Element;
		button.button.elt.prepend(icon.elt);
		icon.addClass('command-bar__icon');
		icon.addClass(className);
		return icon;
	}
}
