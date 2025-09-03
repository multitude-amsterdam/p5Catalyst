import p5 from 'p5';
import { GUIForP5 } from '../GUIForP5';
import { Field } from './Field';

export class CommandBar extends Field {
	randomizerButton?: p5.Element;

	undoButton: p5.Element;
	redoButton: p5.Element;

	settingsButton: p5.Element;

	darkModeButton: p5.Element;

	helpButton: p5.Element;

	filler: p5.Element;

	centerDiv: p5.Element;

	constructor(gui: GUIForP5) {
		super(
			gui,
			'',
			'command-bar',
			gui.p5Instance.select('main') as p5.Element
		);

		this.div.class('command-bar');
		gui.p5Instance.select('#canvas-workarea')?.elt.prepend(this.div.elt);

		if (this.gui.randomizer) {
			this.randomizerButton = this.createButton('LANG_RANDOMIZE', () => {
				this.gui.randomizer?.randomize();
			});
			this.createIconDiv(
				this.randomizerButton,
				'command-bar__icon--randomizer'
			);
		}

		this.undoButton = this.createButton('LANG_UNDO', () => {
			this.gui.changeSet.undo();
		});
		this.createIconDiv(this.undoButton, 'command-bar__icon--undo');

		this.redoButton = this.createButton('LANG_REDO', () => {
			this.gui.changeSet.redo();
		});
		this.createIconDiv(this.redoButton, 'command-bar__icon--redo');

		this.redoButton = this.createButton('LANG_RESET', () => {
			this.gui.resetToDefaults();
		});
		this.createIconDiv(this.redoButton, 'command-bar__icon--reset');

		this.filler = gui.p5Instance
			.createDiv()
			.parent(this.div)
			.class('command-bar__filler') as p5.Element;

		this.helpButton = this.createButton('LANG_HELP', () => {});
		this.createIconDiv(this.helpButton, 'command-bar__icon--help');

		this.darkModeButton = this.createButton('LANG_DARK_MODE', () => {});
		this.createIconDiv(this.darkModeButton, 'command-bar__icon--dark-mode');

		this.settingsButton = this.createButton('LANG_SETTINGS', () => {});
		this.createIconDiv(this.settingsButton, 'command-bar__icon--settings');

		this.centerDiv = gui.p5Instance
			.createDiv()
			.parent(this.div)
			.class('commandbar__center') as p5.Element;
	}

	createButton(label: string, callback: () => void): p5.Element {
		label = this.gui.lang.process(label, true);
		const button: p5.Element = this.gui.p5Instance
			.createButton('')
			.parent(this.div)
			.addClass('command-bar__button')
			.mousePressed(callback) as p5.Element;
		button.elt.title = label;
		return button;
	}

	createIconDiv(button: p5.Element, className: string): p5.Element {
		const icon: p5.Element = this.gui.p5Instance.createDiv() as p5.Element;
		button.elt.prepend(icon.elt);
		icon.addClass('command-bar__icon');
		icon.addClass(className);
		return icon;
	}
}
