/**
 * @fileoverview Implementation of the GUI framework used by p5Catalyst.
 * @see GUIForP5
 * @see Randomizer
 * @see DieIcon
 * @see Field
 * @see Label
 * @see Title
 * @see Textfield
 * @see GUIImage
 * @see Divider
 */

/**
 * Main GUI wrapper that manages fields and controllers for p5Catalyst.
 * Handles layout, theming, controller management, and state persistence.
 */
class GUIForP5 {
	static verbose = !false;

	fields = [];
	controllers = [];

	/**
	 * Tracks whether typing is happening within the GUI.
	 * This is used to prevent `keyPressed()` actions (like randomization)
	 * while typing.
	 * @type {boolean}
	 */
	isTypingText = false;

	/**
	 * Constructs the GUI, creates the main div, and sets up theming and layout.
	 */
	constructor() {
		this.div = createDiv();
		this.div.id('gui');

		this.randomizer = new Randomizer();

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
		document.querySelector('main').prepend(this.div.elt);
		this.isOnLeftSide = true;
	}

	/**
	 * Moves the GUI to the right side of the main container.
	 */
	setRight() {
		document.querySelector('main').append(this.div.elt);
		this.isOnLeftSide = false;
	}

	/**
	 * Toggles the GUI between left and right sides.
	 */
	toggleSide() {
		this.isOnLeftSide ? this.setRight() : this.setLeft();
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
		this.darkMode = 'false';
		if (this.darkModeButton) this.darkModeButton.setLightMode();
	}

	/**
	 * Sets the GUI to dark mode.
	 */
	setDarkMode() {
		document.body.className = 'dark-mode';
		window.localStorage['isDarkMode'] = 'true';
		this.darkMode = 'true';
		if (this.darkModeButton) this.darkModeButton.setDarkMode();
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
		this.darkMode = 'auto';
		if (this.darkModeButton) this.darkModeButton.setAutoLightDarkMode();
	}

	/**
	 * Cycles between light, dark, and auto light/dark modes.
	 */
	toggleLightDarkMode() {
		// cycle modes
		switch (this.darkMode) {
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
	 * Creates and adds a button for toggling light/dark mode.
	 */
	createDarkModeButton() {
		this.darkModeButton = this.addController(
			new Button(this, 'buttonDarkMode', '', controller => {
				this.toggleLightDarkMode();
			})
		);
		this.darkModeButton.controllerElement.id('dark-mode-button');
		this.darkModeButton.setLightMode = () => {
			this.darkModeButton.controllerElement.style(
				'background-image',
				'url("assets/dark-mode/light-mode-icon.svg")'
			);
			this.darkModeButton.controllerElement.elt.title = 'Light mode';
		};
		this.darkModeButton.setDarkMode = () => {
			this.darkModeButton.controllerElement.style(
				'background-image',
				'url("assets/dark-mode/dark-mode-icon.svg")'
			);
			this.darkModeButton.controllerElement.elt.title = 'Dark mode';
		};
		this.darkModeButton.setAutoLightDarkMode = () => {
			this.darkModeButton.controllerElement.style(
				'background-image',
				'url("assets/dark-mode/auto-mode-icon.svg")'
			);
			this.darkModeButton.controllerElement.elt.title =
				'Auto light/dark mode';
		};
		switch (this.darkMode) {
			case 'false':
				this.darkModeButton.setLightMode();
				break;
			case 'true':
				this.darkModeButton.setDarkMode();
				break;
			default:
				this.darkModeButton.setAutoLightDarkMode();
		}
	}

	/**
	 * Adds a field (GUI element) to the GUI.
	 * @param {Field} field
	 * @returns {Field}
	 */
	addField(field) {
		this.fields.push(field);
		return field;
	}

	/**
	 * Adds an HTML string as a new field.
	 * @param {string} html
	 * @param {string} [className='']
	 * @returns {Field}
	 */
	addHTMLToNewField(html, className = '') {
		let field = this.addField(new Field(this.div, '', className));
		field.div.html(html);
		return field;
	}

	/**
	 * Adds the p5Catalyst logo as a field.
	 * @returns {Field}
	 */
	addP5CatalystLogo() {
		let logo = this.addHTMLToNewField(
			`<a href="https://github.com/multitude-amsterdam/p5Catalyst" target="_blank">` +
				`<div class="p5catalyst-logo"></div>` +
				`</a>`,
			'footer-logo'
		);
		return logo;
	}

	/**
	 * Adds a divider (horizontal rule) to the GUI.
	 * @returns {Divider}
	 */
	addDivider() {
		let divider = new Divider(this.div);
		this.addField(divider);
		return divider;
	}

	/**
	 * Adds a controller to the GUI and optionally to the randomizer.
	 * @param {Controller} controller
	 * @param {boolean} [doAddToRandomizerAs]
	 * @returns {Controller}
	 */
	addController(controller, doAddToRandomizerAs = undefined) {
		this.addField(controller);
		this.controllers.push(controller);
		if (doAddToRandomizerAs !== undefined)
			this.randomizer.addController(controller, doAddToRandomizerAs);
		return controller;
	}

	/**
	 * Adds a label to the GUI.
	 * @param {string} labelText
	 * @returns {Label}
	 */
	addLabel(labelText) {
		let label = new Label(this.div, labelText);
		this.addField(label);
		return label;
	}

	/**
	 * Adds a title (heading) to the GUI.
	 * @param {number} hSize - Heading size (e.g., 1 for h1, 2 for h2).
	 * @param {string} titleText
	 * @param {boolean} [doAlignCenter=false]
	 * @returns {Title}
	 */
	addTitle(hSize, titleText, doAlignCenter = false) {
		let title = new Title(
			this.div,
			hSize,
			titleText,
			(doAlignCenter = doAlignCenter)
		);
		this.addField(title);
		return title;
	}

	/**
	 * Adds an image to the GUI.
	 * @param {string} url
	 * @param {string} altText
	 * @param {boolean} [doAlignCenter=true]
	 * @returns {GUIImage}
	 */
	addImage(url, altText, doAlignCenter = true) {
		let img = new GUIImage(
			this.div,
			url,
			altText,
			(doAlignCenter = doAlignCenter)
		);
		this.addField(img);
		return img;
	}

	/**
	 * Checks if a controller with the given name exists.
	 * @param {string} name
	 * @returns {boolean}
	 */
	hasName(name) {
		return this.controllers.some(controller => controller.name == name);
	}

	/**
	 * Gets a controller by name.
	 * @param {string} name
	 * @returns {Controller|undefined}
	 */
	getController(name) {
		if (!this.hasName(name)) {
			return undefined;
		}
		return this.controllers[
			this.controllers.map(controller => controller.name).indexOf(name)
		];
	}

	/**
	 * Gets multiple controllers by an array of names.
	 * @param {string[]} names
	 * @returns {Controller[]}
	 */
	getControllers(names) {
		return this.controllers.filter(controller =>
			names.some(name => {
				if (!this.hasName(name)) {
					return false;
				}
				return controller.name == name;
			})
		);
	}

	/**
	 * Gets the current state of all controllers with values.
	 * @returns {Array<{name: string, value: any}>}
	 */
	getState() {
		return this.controllers
			.filter(controller => controller.value !== undefined)
			.map(controller => {
				const serializable = {
					name: controller.name,
					value: controller.getValueForSerialization(),
				};
				// if (controller.die !== undefined)
				// 	serializable.isDieActive = controller.die.isActive;
				return serializable;
			});
	}

	/**
	 * Restores the state of controllers from a saved state.
	 * @param {Array<{name: string, value: any}>} state
	 */
	restoreState(state) {
		Controller._doUpdateChangeSet = false;
		for (let { name, value, isDieActive } of state) {
			const controller = gui.getController(name);
			if (controller.setValue && value !== undefined) {
				value = restoreSerializedP5Color(value);
				value = restoreSerializedVec2D(value);
				controller.setValue(value);
				// if (isDieActive !== undefined)
				// 	controller.die.setActive(isDieActive);
			}
		}
		Controller._doUpdateChangeSet = true;
	}
}

/**
 * Helper class that manages randomization of controllers marked as randomizable.
 * Handles toggling, adding/removing controllers, and triggering randomization.
 */
class Randomizer {
	/**
	 * @type {Controller[]}
	 */
	controllers = [];

	/**
	 * Constructs a new Randomizer instance.
	 */
	constructor() {}

	/**
	 * Adds a controller to the randomizer and attaches a DieIcon.
	 * @param {Controller} controller - The controller to add.
	 * @param {boolean} doRandomize - Whether this controller should be randomized.
	 */
	addController(controller, doRandomize) {
		this.controllers.push(controller);
		let die = new DieIcon(this, controller, doRandomize);
		controller.addDie(die);
		controller.doRandomize = doRandomize;
	}

	/**
	 * Removes a controller from the randomizer.
	 * @param {Controller} controller - The controller to remove.
	 */
	removeController(controller) {
		let index = this.controllers.indexOf(controller);
		if (index < 0) {
			console.error('Controller not in list.', controller);
			return;
		}
		this.controllers.splice(index, 1);
	}

	/**
	 * Randomizes all controllers marked as randomizable and not hidden.
	 */
	randomize() {
		const controllersToRandomize = this.controllers.filter(
			controller =>
				controller.doRandomize === true && !controller.isHidden()
		);
		for (let controller of controllersToRandomize) {
			if (controller instanceof ValuedController) {
				controller.randomize();
			}
			if (controller instanceof Button) {
				controller.click();
			}
		}
	}

	/**
	 * Toggles the randomization state for a controller via its DieIcon.
	 * @param {DieIcon} die - The DieIcon instance to toggle.
	 */
	toggleDoRandomize(die) {
		let index = this.controllers.map(c => c.die).indexOf(die);
		if (index < 0) {
			console.error('Die not in list.', controller);
			return;
		}
		this.controllers[index].doRandomize =
			this.controllers[index].doRandomize !== true;
		die.setActive(this.controllers[index].doRandomize);
	}
}

/**
 * Small dice icon indicating randomization state for a controller.
 * Handles icon display, rotation, and click interaction for toggling randomization.
 */
class DieIcon {
	/**
	 * List of SVG icon URLs for dice faces.
	 * @type {string[]}
	 * @static
	 */
	static iconURLs = [
		'assets/dice/die (1).svg',
		'assets/dice/die (2).svg',
		'assets/dice/die (3).svg',
		'assets/dice/die (4).svg',
		'assets/dice/die (5).svg',
		'assets/dice/die (6).svg',
	];

	/**
	 * Constructs a DieIcon.
	 * @param {Randomizer} randomizer - The parent Randomizer instance.
	 * @param {Controller} controller - The controller this die is attached to.
	 * @param {boolean} isActive - Whether the die is active (randomization enabled).
	 */
	constructor(randomizer, controller, isActive) {
		this.randomizer = randomizer;

		this.img = createImg('', 'Randomizer die');
		this.img.class('die-icon');
		this.img.mouseClicked(() => this.click());
		this.rot = 0;
		this.randomizeIcon();

		this.setActive(isActive);
	}

	/**
	 * Randomizes the die icon image URL and its rotation.
	 */
	randomizeIcon() {
		// random icon url
		let curURL = this.iconURL;
		do this.iconURL = random(DieIcon.iconURLs);
		while (curURL == this.iconURL);
		this.img.elt.src = this.iconURL;

		// rotate die randomly
		let curRot = this.rot;
		do this.rot = int(random(4));
		while (this.rot == curRot);
		let angle = (this.rot * TAU) / 3;
		this.img.style('rotate', angle + 'rad');
	}

	/**
	 * Handles click event to toggle randomization state.
	 */
	click() {
		this.randomizer.toggleDoRandomize(this);
	}

	/**
	 * Sets the active state of the die and updates its display.
	 * @param {boolean} isActive
	 */
	setActive(isActive) {
		this.isActive = isActive;
		this.setDisplay();
	}

	/**
	 * Updates the die's display based on its active state.
	 */
	setDisplay() {
		if (this.isActive) {
			this.img.removeClass('disabled');
			this.randomizeIcon();
		} else {
			this.img.addClass('disabled');
		}
	}

	/**
	 * Removes the die icon from the DOM.
	 */
	remove() {
		this.img.remove();
	}
}

/**
 * Base GUI element container used by controllers.
 */
class Field {
	/**
	 * Creates a new Field instance.
	 * @param {p5.Element} parentDiv - The parent element to attach the field to.
	 * @param {string} id - The ID to assign to the field (optional).
	 * @param {string} className - The CSS class to assign to the field (optional).
	 */
	constructor(parentDiv, id, className) {
		this.div = createDiv();
		this.div.parent(parentDiv);
		if (id !== undefined && id !== null && id != '') this.div.id(id);
		this.div.class(className);
	}

	/**
	 * Sets the tooltip text for this field.
	 * @param {string} tooltip - The tooltip text to set.
	 */
	setTooltip(tooltip) {
		this.div.elt.title = tooltip;
	}

	/**
	 * Sets the text content of this field.
	 * @param {string} text - The new text content for the field.
	 */
	setText(text) {
		this.div.elt.innerText = text;
	}

	/**
	 * Hides this field by setting its display to 'none'.
	 */
	hide() {
		this.div.hide();
	}

	/**
	 * Shows this field by setting its display to '' (default).
	 */
	show() {
		this.div.elt.style.display = ''; // more general than p5 .show()
		if (this.setDisplay) this.setDisplay(); // XYSlider needs this for now
	}

	/**
	 * Checks if this field is currently hidden.
	 * @returns {boolean} True if the field is hidden, false otherwise.
	 */
	isHidden() {
		return this.div.elt.style.display == 'none';
	}
}

/**
 * Text label associated with a controller.
 * @extends Field
 */
class Label extends Field {
	/**
	 * Creates a new Label instance.
	 * @param {Controller} controller - The controller this label is associated with.
	 * @param {string} text - The text content of the label.
	 */
	constructor(controller, text) {
		super(controller.div, null, 'gui-label');
		this.controller = controller;
		text = lang.process(text, true);
		this.setText(text);
	}

	/**
	 * Sets the text content of the label.
	 * @param {string} text - The new text content for the label.
	 */
	setText(text) {
		this.text = text;
		this.div.elt.innerText = text;
	}
}

/**
 * Heading element used as a section title.
 * @extends Field
 */
class Title extends Field {
	/**
	 * Creates a new Title instance.
	 * @param {p5.Element} parentDiv - The parent element to attach the title to.
	 * @param {number} hSize - The heading size (1-6).
	 * @param {string} text - The text content of the title.
	 * @param {boolean} [doAlignCenter=false] - Whether to center the title text.
	 */
	constructor(parentDiv, hSize, text, doAlignCenter = false) {
		super(parentDiv, null, 'gui-title');
		text = lang.process(text, true);
		this.div.html(`<h${hSize}>${text}</h${hSize}>`);
		if (doAlignCenter) {
			this.div.style('text-align', 'center');
		}
	}
}

/**
 * Block of explanatory text.
 * @extends Field
 */
class Textfield extends Field {
	constructor(parentDiv, text, className = undefined, doAlignCenter = false) {
		super(parentDiv, null, 'gui-textfield');
		text = lang.process(text, true);
		this.div.html(`<span>${text}</span>`);
		if (className) {
			this.div.addClass(className);
		}
		if (doAlignCenter) {
			this.div.style('text-align', 'center');
		}
	}
}

/**
 * Wrapper for <img> elements placed in the GUI.
 * @extends Field
 */
class GUIImage extends Field {
	/**
	 * Creates a new GUI image element.
	 * @param {p5.Element} parentDiv - The parent element to attach the image to.
	 * @param {string} url - The URL of the image.
	 * @param {string} altText - The alt text for the image.
	 * @param {boolean} [doAlignCenter=true] - Whether to center the image in its container.
	 */
	constructor(parentDiv, url, altText, doAlignCenter = true) {
		super(parentDiv, null, 'gui-image');
		altText = lang.process(altText, true);
		this.div.html(`<img src='${url}' alt='${altText}'>`);
		if (doAlignCenter) {
			this.div.style('text-align', 'center');
		}
	}
}

/**
 * Horizontal rule used to divide sections.
 * @extends Field
 */
class Divider extends Field {
	/**
	 * Creates a new Divider instance.
	 * @param {p5.Element} parentDiv - The parent element to attach the divider to.
	 */
	constructor(parentDiv) {
		super(parentDiv, null, 'gui-divider');
		this.div.html('<hr>');
	}
}
