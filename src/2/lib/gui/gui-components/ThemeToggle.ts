import type { CommandBar } from '../components/CommandBar';
import type { CatalystGUI } from '../CatalystGUI';
import { GUIButton } from './GUIButton';
import p5 from 'p5';

export class ThemeToggle extends GUIButton {
	iconLightSvg: string;
	iconDarkSvg: string;

	constructor(
		gui: CatalystGUI,
		commandBar: CommandBar,
		iconLightSvg: string,
		iconDarkSvg: string
	) {
		super(gui, () => {});
		this.iconLightSvg = iconLightSvg;
		this.iconDarkSvg = iconDarkSvg;

		this.button.mousePressed(() => {
			this.toggleLightDarkMode();
		});

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
		this.button.html(this.iconLightSvg);
	}

	/**
	 * Sets the GUI to dark mode.
	 */
	setDarkMode() {
		document.body.classList.add('dark-mode');
		window.localStorage['isDarkMode'] = this.gui.darkMode = 'true';
		this.button.elt.title = 'Dark mode';
		this.button.html(this.iconDarkSvg);
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
