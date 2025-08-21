import type { P5Button } from 'src/lib/types/controller';
import type GUIForP5 from '../gui';

export class LightModeToggle {
	button: P5Button;
	gui: GUIForP5;
	constructor(gui: GUIForP5) {
		this.button = gui.p5Instance.createButton('') as P5Button;
		this.gui = gui;
		this.button.elt.onclick = () => {
			this.toggleLightDarkMode(this.button);
		};
		this.loadLightDarkMode();
	}

	/**
	 * Cycles between light, dark, and auto light/dark modes.
	 */
	toggleLightDarkMode(darkModeButton: P5Button) {
		// cycle modes
		switch (this.gui.darkMode) {
			case 'false':
				this.setDarkMode(darkModeButton);
				break;
			case 'true':
				this.setAutoLightDarkMode(darkModeButton);

				break;
			default:
				this.setLightMode(darkModeButton);
		}
	}

	/**
	 * Loads the light/dark mode setting from localStorage and applies it.
	 */
	loadLightDarkMode() {
		const setting = window.localStorage['isDarkMode'];
		switch (setting) {
			case 'true':
				this.setDarkMode(this.button);
				break;
			case 'false':
				this.setLightMode(this.button);
				break;
			default:
				this.setAutoLightDarkMode(this.button);
		}
	}

	/**
	 * Sets the GUI to light mode.
	 */
	setLightMode(darkModeButton: P5Button) {
		document.body.className = '';
		window.localStorage['isDarkMode'] = 'false';
		this.gui.darkMode = 'false';
		darkModeButton.class('dark-mode-button');
		darkModeButton.addClass('dark-mode-button' + '--light');
		darkModeButton.elt.title = 'Light mode';
	}

	/**
	 * Sets the GUI to dark mode.
	 */
	setDarkMode(darkModeButton: P5Button) {
		document.body.className = 'dark-mode';
		window.localStorage['isDarkMode'] = 'true';
		this.gui.darkMode = 'true';
		darkModeButton.class('dark-mode-button');
		darkModeButton.addClass('dark-mode-button' + '--dark');
		darkModeButton.elt.title = 'Dark mode';
	}

	/**
	 * Sets the GUI to automatically match the system's light/dark mode.
	 */
	setAutoLightDarkMode(darkModeButton: P5Button) {
		const isSystemDarkMode = () =>
			window.matchMedia &&
			window.matchMedia('(prefers-color-scheme: dark)').matches;
		if (isSystemDarkMode()) {
			this.setDarkMode(darkModeButton);
		} else {
			this.setLightMode(darkModeButton);
		}
		window.localStorage['isDarkMode'] = 'auto';
		this.gui.darkMode = 'auto';
		darkModeButton.class('dark-mode-button');
		darkModeButton.addClass('dark-mode-button' + '--auto');
		darkModeButton.elt.title = 'Auto light/dark mode';
	}
}
