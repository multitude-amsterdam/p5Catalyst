import type p5 from 'p5';
import { Field } from './field';
import { Title } from './components/fields/Title';
import { Controller } from './controller';
import { Button } from './components/controllers/Button';
import { Select } from './components/controllers/Select';
import { ResolutionSelect } from './components/controllers/ResolutionSelect';
import { Lang } from '../language/lang';
import type { State } from '../types/state_type';

/**
 * Main GUI wrapper that manages fields and controllers for p5Catalyst.
 * Handles layout, theming, controller management, and state persistence.
 */
class GUIForP5 {
	/**
	 * Tracks whether typing is happening within the GUI.
	 * This is used to prevent `keyPressed()` actions (like randomization)
	 * while typing.
	 * @type {boolean}
	 */
	isTypingText = false;
	div: p5.Element;
	//   randomizer: Randomizer;
	p5Instance: p5;
	state: State;
	lang: Lang;
	isOnLeftSide: boolean = true;
	static verbose = !false;

	fields: Field[] = [];
	controllers: any[] = [];

	/**
	 * Constructs the GUI, creates the main div, and sets up theming and layout.
	 */
	constructor(p5Instance: p5, state: State) {
		this.div = p5Instance.createDiv();
		this.div.id('gui');
		this.p5Instance = p5Instance;
		this.lang = new Lang();
		this.state = state;

		// this.randomizer = new Randomizer();

		// this.loadLightDarkMode();

		this.setLeft();
	}

	//   /**
	//    * Calls setup on all controllers.
	//    */
	//   setup() {
	//     for (let controller of this.controllers) {
	//       controller.setup();
	//     }
	//   }

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

	//   /**
	//    * Loads the light/dark mode setting from localStorage and applies it.
	//    */
	//   loadLightDarkMode() {
	//     const setting = window.localStorage["isDarkMode"];
	//     switch (setting) {
	//       case "true":
	//         this.setDarkMode();
	//         break;
	//       case "false":
	//         this.setLightMode();
	//         break;
	//       default:
	//         this.setAutoLightDarkMode();
	//     }
	//   }

	//   /**
	//    * Sets the GUI to light mode.
	//    */
	//   setLightMode() {
	//     document.body.className = "";
	//     window.localStorage["isDarkMode"] = "false";
	//     this.darkMode = "false";
	//     if (this.darkModeButton) this.darkModeButton.setLightMode();
	//   }

	//   /**
	//    * Sets the GUI to dark mode.
	//    */
	//   setDarkMode() {
	//     document.body.className = "dark-mode";
	//     window.localStorage["isDarkMode"] = "true";
	//     this.darkMode = "true";
	//     if (this.darkModeButton) this.darkModeButton.setDarkMode();
	//   }

	//   /**
	//    * Sets the GUI to automatically match the system's light/dark mode.
	//    */
	//   setAutoLightDarkMode() {
	//     const isSystemDarkMode = () =>
	//       window.matchMedia &&
	//       window.matchMedia("(prefers-color-scheme: dark)").matches;
	//     if (isSystemDarkMode()) {
	//       this.setDarkMode();
	//     } else {
	//       this.setLightMode();
	//     }
	//     window.localStorage["isDarkMode"] = "auto";
	//     this.darkMode = "auto";
	//     if (this.darkModeButton) this.darkModeButton.setAutoLightDarkMode();
	//   }

	//   /**
	//    * Cycles between light, dark, and auto light/dark modes.
	//    */
	//   toggleLightDarkMode() {
	//     // cycle modes
	//     switch (this.darkMode) {
	//       case "false":
	//         this.setDarkMode();
	//         break;
	//       case "true":
	//         this.setAutoLightDarkMode();
	//         break;
	//       default:
	//         this.setLightMode();
	//     }
	//   }

	//   /**
	//    * Creates and adds a button for toggling light/dark mode.
	//    */
	//   createDarkModeButton() {
	//     this.darkModeButton = this.addController(
	//       new Button(this, "buttonDarkMode", "", (controller) => {
	//         this.toggleLightDarkMode();
	//       })
	//     );
	//     this.darkModeButton.controllerElement.id("dark-mode-button");
	//     this.darkModeButton.setLightMode = () => {
	//       this.darkModeButton.controllerElement.style(
	//         "background-image",
	//         'url("assets/dark-mode/light-mode-icon.svg")'
	//       );
	//       this.darkModeButton.controllerElement.elt.title = "Light mode";
	//     };
	//     this.darkModeButton.setDarkMode = () => {
	//       this.darkModeButton.controllerElement.style(
	//         "background-image",
	//         'url("assets/dark-mode/dark-mode-icon.svg")'
	//       );
	//       this.darkModeButton.controllerElement.elt.title = "Dark mode";
	//     };
	//     this.darkModeButton.setAutoLightDarkMode = () => {
	//       this.darkModeButton.controllerElement.style(
	//         "background-image",
	//         'url("assets/dark-mode/auto-mode-icon.svg")'
	//       );
	//       this.darkModeButton.controllerElement.elt.title = "Auto light/dark mode";
	//     };
	//     switch (this.darkMode) {
	//       case "false":
	//         this.darkModeButton.setLightMode();
	//         break;
	//       case "true":
	//         this.darkModeButton.setDarkMode();
	//         break;
	//       default:
	//         this.darkModeButton.setAutoLightDarkMode();
	//     }
	//   }

	//   /**
	//    * Adds a field (GUI element) to the GUI.
	//    * @param {Field} field
	//    * @returns {Field}
	//    */
	addField(field: Field) {
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
	addController(controller: Controller, doAddToRandomizerAs = undefined) {
		this.addField(controller);
		this.controllers.push(controller);
		// if (doAddToRandomizerAs !== undefined)
		//   this.randomizer.addController(controller, doAddToRandomizerAs);
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

	//   /**
	//    * Checks if a controller with the given name exists.
	//    * @param {string} name
	//    * @returns {boolean}
	//    */
	//   hasName(name) {
	//     return this.controllers.some((controller) => controller.name == name);
	//   }

	//   /**
	//    * Gets a controller by name.
	//    * @param {string} name
	//    * @returns {Controller|undefined}
	//    */
	//   getController(name) {
	//     if (!this.hasName(name)) {
	//       return undefined;
	//     }
	//     return this.controllers[
	//       this.controllers.map((controller) => controller.name).indexOf(name)
	//     ];
	//   }

	//   /**
	//    * Gets multiple controllers by an array of names.
	//    * @param {string[]} names
	//    * @returns {Controller[]}
	//    */
	//   getControllers(names) {
	//     return this.controllers.filter((controller) =>
	//       names.some((name) => {
	//         if (!this.hasName(name)) {
	//           return false;
	//         }
	//         return controller.name == name;
	//       })
	//     );
	//   }

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

export { GUIForP5, Field, Title, Button, Select, ResolutionSelect };
