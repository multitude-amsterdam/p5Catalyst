import type { P5Button } from 'src/lib/types/controller';
import type GUIForP5 from '../gui';
import { GUIButton } from './guiButton';

export class LightModeToggle extends GUIButton {
	constructor(gui: GUIForP5) {
		super(gui);
		this.button.elt.onclick = () => {
			this.toggleLightDarkMode();
		};
		this.loadLightDarkMode();
	}

	/**
	 * Cycles between light, dark, and auto light/dark modes.
	 */
	toggleLightDarkMode() {
		// cycle modes
		switch (this.gui.darkMode) {
			case 'false':
				this.setDarkMode();
				break;
			case 'true':
				this.setAutoLightDarkMode();

				break;
			default:
				this.setLightMode();
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
		document.body.className = '';
		window.localStorage['isDarkMode'] = 'false';
		this.gui.darkMode = 'false';
		this.button.class('dark-mode-button');
		this.button.addClass('dark-mode-button' + '--light');
		this.button.elt.title = 'Light mode';
	}

	/**
	 * Sets the GUI to dark mode.
	 */
	setDarkMode() {
		document.body.className = 'dark-mode';
		window.localStorage['isDarkMode'] = 'true';
		this.gui.darkMode = 'true';
		this.button.class('dark-mode-button');
		this.button.addClass('dark-mode-button' + '--dark');
		this.button.elt.title = 'Dark mode';
	}

	/**
	 * Sets the GUI to automatically match the system's light/dark mode.
	 */
	setAutoLightDarkMode() {
		const isSystemDarkMode = () =>
			window.matchMedia &&
			window.matchMedia('(prefers-color-scheme: dark)').matches;
		if (isSystemDarkMode()) {
			this.setDarkMode();
		} else {
			this.setLightMode();
		}
		window.localStorage['isDarkMode'] = 'auto';
		this.gui.darkMode = 'auto';
		this.button.class('dark-mode-button');
		this.button.addClass('dark-mode-button' + '--auto');
		this.button.elt.title = 'Auto light/dark mode';
	}
}
