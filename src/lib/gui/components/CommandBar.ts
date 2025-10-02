import type { Config } from 'src/lib/types';

import p5 from 'p5';
import { CatalystGUI } from '../CatalystGUI';
import { Field } from './Field';
import { ThemeToggle } from '../gui-components/ThemeToggle';
import { RandomizeButton } from '../gui-components/RandomizeButton';
import { GUIButton } from '../gui-components/GUIButton';

import dieIcon1Svg from '/assets/dice/die-1.svg?raw';
import dieIcon2Svg from '/assets/dice/die-2.svg?raw';
import dieIcon3Svg from '/assets/dice/die-3.svg?raw';
import dieIcon4Svg from '/assets/dice/die-4.svg?raw';
import dieIcon5Svg from '/assets/dice/die-5.svg?raw';
import dieIcon6Svg from '/assets/dice/die-6.svg?raw';
const dieIconSvgs = [
	dieIcon1Svg,
	dieIcon2Svg,
	dieIcon3Svg,
	dieIcon4Svg,
	dieIcon5Svg,
	dieIcon6Svg,
];
import themeToggleIconLightSvg from '/assets/theme-toggle/light-mode-icon.svg?raw';
import themeToggleIconDarkSvg from '/assets/theme-toggle/dark-mode-icon.svg?raw';
import undoIconSvg from '/assets/undo.svg?raw';
import redoIconSvg from '/assets/redo.svg?raw';
import resetIconSvg from '/assets/reset.svg?raw';
import helpIconSvg from '/assets/help.svg?raw';
import logoSvg from '/assets/generator-logo.svg?raw';

export class CommandBar extends Field {
	undoButton: GUIButton;
	redoButton: GUIButton;
	resetButton: GUIButton;
	helpButton: GUIButton;

	themeToggle: ThemeToggle;
	randomizeButton?: RandomizeButton;

	filler: p5.Element;
	centerDiv: p5.Element;

	constructor(config: Config, gui: CatalystGUI) {
		super(gui, '', 'command-bar', gui.sketch.select('main') as p5.Element);

		this.div.class('command-bar');
		gui.sketch.select('#canvas-workarea')?.elt.prepend(this.div.elt);

		// randomizer button
		if (config.doCreateRandomizer) {
			this.randomizeButton = new RandomizeButton(gui, dieIconSvgs);
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
			this.undoButton = this.createButton(
				undoIconSvg,
				'LANG_UNDO',
				() => {
					this.gui.changeSet.undo();
				}
			);
			this.undoButton.button.addClass('command-bar__button--undo');

			this.redoButton = this.createButton(
				redoIconSvg,
				'LANG_REDO',
				() => {
					this.gui.changeSet.redo();
				}
			);
			this.redoButton.button.addClass('command-bar__button--redo');
		}

		// middle filler
		// pushes buttons either sides
		this.filler = gui.sketch
			.createDiv()
			.parent(this.div)
			.class('command-bar__filler') as p5.Element;

		// reset button
		{
			this.resetButton = this.createButton(
				resetIconSvg,
				'LANG_RESET',
				() => {
					this.gui.resetToDefaults();
				}
			);
			this.resetButton.button.addClass('command-bar__button--reset');
		}

		// theme toggle
		{
			this.themeToggle = new ThemeToggle(
				gui,
				this,
				themeToggleIconLightSvg,
				themeToggleIconDarkSvg
			);
			this.themeToggle.button.parent(this.div);
			this.themeToggle.button.addClass('command-bar__button');
			this.themeToggle.button.addClass(
				'command-bar__button--theme-toggle'
			);
		}

		// help button
		{
			this.helpButton = this.createButton(
				helpIconSvg,
				'LANG_HELP',
				() => {
					this.gui.dialog.alert('LANG_HELPME_MSG');
				}
			);
			this.helpButton.button.addClass('command-bar__button--help');
		}

		// centered div on bar that hold logo or image
		this.centerDiv = gui.sketch
			.createDiv(logoSvg)
			.parent(this.div)
			.class('command-bar__center') as p5.Element;
	}

	createButton(
		content: string,
		tooltip: string,
		callback: () => void
	): GUIButton {
		const button: GUIButton = new GUIButton(this.gui, callback);
		button.button
			.parent(this.div)
			.addClass('command-bar__button')
			.html(content) as p5.Element;
		tooltip = this.gui.lang.process(tooltip, true);
		button.button.elt.title = tooltip;
		return button;
	}
}
