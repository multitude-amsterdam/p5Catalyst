import type p5 from 'p5';
import { Field } from './field';
import { Controller } from './controller';
import { Lang } from '../language/lang';
import type { State, Config, LangCode } from '../types';
import type { P5Button } from '../types/controller';
import { Randomizer } from './randomizer';

/**
 * Main GUI wrapper that manages fields and controllers for p5Catalyst.
 * Handles layout, theming, controller management, and state persistence.
 */
export class GUIForP5 {
	/**
	 * Tracks whether typing is happening within the GUI.
	 * This is used to prevent `keyPressed()` actions (like randomization)
	 * while typing.
	 * @type {boolean}
	 */
	isTypingText: boolean = false;
	div: p5.Element;
	randomizer?: Randomizer;
	p5Instance: p5;
	state: State;
	lang: Lang;
	isOnLeftSide: boolean = true;
	static verbose = !false;

	fields: Field[] = [];
	controllers: any[] = [];

	darkMode: 'true' | 'false' | 'auto';

	/**
	 * Constructs the GUI, creates the main div, and sets up theming and layout.
	 */
	constructor(p5Instance: p5, state: State, config: Config) {
		this.div = p5Instance.createDiv();
		this.div.id('gui');
		this.p5Instance = p5Instance;
		this.lang = new Lang(config.userDictionary);
		this.lang.setup(config.defaultLanguage as LangCode);
		this.state = state;

		if (config.createRandomizer)
			this.randomizer = new Randomizer(p5Instance);

		this.darkMode = 'false';
		this.loadLightDarkMode();

		this.setLeft();
	}

	/**
	 * Calls setup on all controllers.
	 */
	setup() {
		for (let controller of this.controllers) {
			controller.setup();
		}
	}

	/**
	 * Moves the GUI to the left side of the main container.
	 */
	setLeft() {
		document.querySelector('main')?.prepend(this.div.elt);
		this.isOnLeftSide = true;
	}

	// /**
	//  * Moves the GUI to the right side of the main container.
	//  */
	// setRight() {
	// 	document.querySelector('main')?.append(this.div.elt);
	// 	this.isOnLeftSide = false;
	// }

	//   /**
	//    * Toggles the GUI between left and right sides.
	//    */
	//   toggleSide() {
	//     this.isOnLeftSide ? this.setRight() : this.setLeft();
	//   }

	/**
	 * Loads the light/dark mode setting from localStorage and applies it.
	 */
	loadLightDarkMode() {
		const setting = window.localStorage['isDarkMode'];
		const darkModeButton = this.createDarkModeButton();
		switch (setting) {
			case 'true':
				this.setDarkMode(darkModeButton);
				break;
			case 'false':
				this.setLightMode(darkModeButton);
				break;
			default:
				this.setAutoLightDarkMode(darkModeButton);
		}
	}

	/**
	 * Sets the GUI to light mode.
	 */
	setLightMode(darkModeButton: P5Button) {
		document.body.className = '';
		window.localStorage['isDarkMode'] = 'false';
		this.darkMode = 'false';
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
		this.darkMode = 'true';
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
		this.darkMode = 'auto';
		darkModeButton.class('dark-mode-button');
		darkModeButton.addClass('dark-mode-button' + '--auto');
		darkModeButton.elt.title = 'Auto light/dark mode';
	}

	/**
	 * Cycles between light, dark, and auto light/dark modes.
	 */
	toggleLightDarkMode(darkModeButton: P5Button) {
		// cycle modes
		switch (this.darkMode) {
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
	 * Creates and adds a button for toggling light/dark mode.
	 */
	createDarkModeButton() {
		const darkModeButton = this.p5Instance.createButton('') as P5Button;
		darkModeButton.elt.onclick = () => {
			this.toggleLightDarkMode(darkModeButton);
		};
		return darkModeButton;
	}

	//   /**
	//    * Adds a field (GUI element) to the GUI.
	//    * @param {Field} field
	//    * @returns {Field}
	//    */
	addField<T extends Field>(field: T) {
		this.fields.push(field);
		return field;
	}

	//   /**
	//    * Adds an HTML string as a new field.
	//    * @param {string} html
	//    * @param {string} [className='']
	//    * @returns {Field}
	//    */
	//   addHTMLToNewField(html, className = "") {
	//     let field = this.addField(new Field(this.div, "", className));
	//     field.div.html(html);
	//     return field;
	//   }

	//   /**
	//    * Adds the p5Catalyst logo as a field.
	//    * @returns {Field}
	//    */
	//   addP5CatalystLogo() {
	//     let logo = this.addHTMLToNewField(
	//       `<a href="https://github.com/multitude-amsterdam/p5Catalyst" target="_blank">` +
	//         `<div class="p5catalyst-logo"></div>` +
	//         `</a>`,
	//       "footer-logo"
	//     );
	//     return logo;
	//   }

	//   /**
	//    * Adds a divider (horizontal rule) to the GUI.
	//    * @returns {Divider}
	//    */
	//   addDivider() {
	//     let divider = new Divider(this.div);
	//     this.addField(divider);
	//     return divider;
	//   }

	//   /**
	//    * Adds a controller to the GUI and optionally to the randomizer.
	//    * @param {Controller} controller
	//    * @param {boolean} [doAddToRandomizerAs]
	//    * @returns {Controller}
	//    */
	addController<T extends Controller>(
		controller: T,
		doAddToRandomizerAs?: boolean
	) {
		this.addField(controller);
		this.controllers.push(controller);
		if (doAddToRandomizerAs !== undefined)
			this.randomizer?.addController(controller, doAddToRandomizerAs);
		return controller;
	}

	//   /**
	//    * Adds a label to the GUI.
	//    * @param {string} labelText
	//    * @returns {Label}
	//    */
	//   addLabel(labelText) {
	//     let label = new Label(this.div, labelText);
	//     this.addField(label);
	//     return label;
	//   }

	//   /**
	//    * Adds a title (heading) to the GUI.
	//    * @param {number} hSize - Heading size (e.g., 1 for h1, 2 for h2).
	//    * @param {string} titleText
	//    * @param {boolean} [doAlignCenter=false]
	//    * @returns {Title}
	//    */
	//   addTitle(hSize, titleText, doAlignCenter = false) {
	//     let title = new Title(
	//       this.div,
	//       hSize,
	//       titleText,
	//       (doAlignCenter = doAlignCenter)
	//     );
	//     this.addField(title);
	//     return title;
	//   }

	//   /**
	//    * Adds an image to the GUI.
	//    * @param {string} url
	//    * @param {string} altText
	//    * @param {boolean} [doAlignCenter=true]
	//    * @returns {GUIImage}
	//    */
	//   addImage(url, altText, doAlignCenter = true) {
	//     let img = new GUIImage(
	//       this.div,
	//       url,
	//       altText,
	//       (doAlignCenter = doAlignCenter)
	//     );
	//     this.addField(img);
	//     return img;
	//   }

	/**
	 * Checks if a controller with the given name exists.
	 * @param {string} name
	 * @returns {boolean}
	 */
	hasName(name: string): boolean {
		return this.controllers.some(controller => controller.name == name);
	}

	/**
	 * Gets a controller by name.
	 * @param {string} name
	 * @returns {Controller|undefined}
	 */
	getController<T extends Controller>(name: string): T | undefined {
		if (!this.hasName(name)) {
			return undefined;
		}
		return this.controllers[
			this.controllers.map(controller => controller.name).indexOf(name)
		] as T;
	}

	/**
	 * Gets multiple controllers by an array of names.
	 * @param {string[]} names
	 * @returns {Controller[]}
	 */
	getControllers(names: string[]) {
		return this.controllers.filter(controller =>
			names.some(name => {
				if (!this.hasName(name)) {
					return false;
				}
				return controller.name == name;
			})
		);
	}

	//   /**
	//    * Gets the current state of all controllers with values.
	//    * @returns {Array<{name: string, value: any, isDieActive?: boolean}>}
	//    */
	//   getState() {
	//     return this.controllers
	//       .filter((controller) => controller.value !== undefined)
	//       .map((controller) => {
	//         const serializable = {
	//           name: controller.name,
	//           value: controller.getSerializedValue(),
	//         };
	//         if (controller.die !== undefined)
	//           serializable.isDieActive = controller.die.isActive;
	//         print(serializable);
	//         return serializable;
	//       });
	//   }

	//   /**
	//    * Restores the state of controllers from a saved state.
	//    * @param {Array<{name: string, value: any, isDieActive?: boolean}>} state
	//    */
	//   restoreState(state) {
	//     Controller._doUpdateChangeSet = false;
	//     for (let { name, value: serializedValue, isDieActive } of state) {
	//       if (serializedValue === undefined) continue;

	//       const controller = gui.getController(name);
	//       if (controller.setValue === undefined) continue;

	//       controller.restoreValueFromSerialized(serializedValue);

	//       if (isDieActive === undefined) continue;
	//       controller.die.setActive(isDieActive);
	//     }
	//     Controller._doUpdateChangeSet = true;
	//   }
}
