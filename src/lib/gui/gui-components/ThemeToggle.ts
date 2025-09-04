import type { CommandBar } from '../components/CommandBar';
import type { GUIForP5 } from '../GUIForP5';
import { GUIButton } from './GUIButton';
import p5 from 'p5';

export class ThemeToggle extends GUIButton {
	icon: p5.Element;

	constructor(gui: GUIForP5, commandBar: CommandBar) {
		super(gui);
		this.button.mousePressed(() => {
			this.toggleLightDarkMode();
		});

		this.icon = commandBar.createIconDiv(this, 'command-bar__icon');
		this.icon.addClass('dark-mode-button');

		this.loadLightDarkMode();
	}

	/**
	 * Cycles between light, dark, and auto light/dark modes.
	 */
	toggleLightDarkMode() {
		if (this.gui.darkMode == 'true') {
			this.setLightMode();
		} else {
			this.setDarkMode();
		}
	}

	/**
	 * Loads the light/dark mode setting from localStorage and applies it.
	 */
	loadLightDarkMode() {
		const setting = window.localStorage['isDarkMode'];
		switch (setting) {
			case 'true':
				this.setDarkMode();
				break;
			case 'false':
				this.setLightMode();
				break;
			default:
				this.setAutoLightDarkMode();
		}
	}

	/**
	 * Sets the GUI to light mode.
	 */
	setLightMode() {
		document.body.classList.remove('dark-mode');
		window.localStorage['isDarkMode'] = this.gui.darkMode = 'false';
		this.button.elt.title = 'Light mode';
		this.icon.removeClass('dark-mode-button--dark');
		this.icon.addClass('dark-mode-button--light');
	}

	/**
	 * Sets the GUI to dark mode.
	 */
	setDarkMode() {
		document.body.classList.add('dark-mode');
		window.localStorage['isDarkMode'] = this.gui.darkMode = 'true';
		this.button.elt.title = 'Dark mode';
		this.icon.removeClass('dark-mode-button--light');
		this.icon.addClass('dark-mode-button--dark');
	}

	/**
	 * Returns true if the system is in dark mode.
	 */
	isSystemDarkMode() {
		return (
			window.matchMedia &&
			window.matchMedia('(prefers-color-scheme: dark)').matches
		);
	}

	/**
	 * Sets the GUI to automatically match the system's light/dark mode.
	 */
	setAutoLightDarkMode() {
		if (this.isSystemDarkMode()) {
			this.setDarkMode();
		} else {
			this.setLightMode();
		}
	}
}
