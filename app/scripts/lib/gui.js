/**
 * @fileoverview Implementation of the GUI framework used by p5Catalyst.
 * @see GUIGroup
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

class GUIGroup {
	constructor(name) {
		this.name = name;
		this.div = createDiv();
		this.div.id('guiGroup-' + name.replaceAll(' ', '-').toLowerCase());
		this.fields = [];
		this.controllers = [];
		this.guiGroups = [];
		this.randomizer = new Randomizer();
		this.parent = null;
	}

	/**
	 * Show the div property.
	 * Doesn't invoke any `show` and `hide` methods of `Field`.
	 * @see show
	 */
	hide() {
		this.div.hide();
	}

	/**
	 * Show the div property.
	 * Doesn't invoke any `show` and `hide` methods of `Field`.
	 * @see hide
	 */
	show() {
		this.div.elt.style.display = ''; // more general than p5 .show()
	}

	/**
	 * Adds a field (GUI element) to the GUI.
	 * @param {Field} field
	 * @returns {Field}
	 */
	addField(field) {
		this.fields.push(field);
		this.div.child(field.div);
		return field;
	}

	/**
	 * Adds an HTML string as a new field.
	 * @param {string} html
	 * @param {string} [className='']
	 * @returns {Field}
	 */
	addHTMLAsNewField(html, className = '') {
		const field = this.addField(new Field(this.div, '', className));
		field.div.html(html);
		return field;
	}

	/**
	 * Adds a controller and optionally to the randomizer.
	 * @param {Controller} controller
	 * @param {boolean} [doAddToRandomizerAs]
	 * @returns {Controller}
	 */
	addController(controller, doAddToRandomizerAs = undefined) {
		this.addField(controller);
		this.controllers.push(controller);
		if (this.parent !== null) this.parent.controllers.push(controller);

		if (doAddToRandomizerAs !== undefined)
			this.randomizer.addController(controller, doAddToRandomizerAs);
		return controller;
	}

	/**
	 * Adds a GUIGroup and optionally to the randomizer.
	 * Makes sure controllers are distributes recursively.
	 * @param {GUIGroup} guiGroup
	 * @returns {GUIGroup}
	 */
	addGUIGroup(guiGroup) {
		guiGroup.parent = this;
		this.guiGroups.push(guiGroup);
		for (let controller of guiGroup.controllers) {
			// be sure to add only once
			if (this.controllers.indexOf(controller) > -1) continue;
			this.controllers.push(controller);
		}
		return guiGroup;
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
	 * Adds a divider (horizontal rule) to the GUI.
	 * @returns {Divider}
	 */
	addDivider() {
		let divider = new Divider(this.div);
		this.addField(divider);
		return divider;
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
	 * Adds two buttons to control `changeSet` in the GUI.
	 */
	createUndoRedoButtons() {
		const undoRedoField = this.addField(
			new Field(this.div, '', 'undoredo')
		);

		const buttonUndo = new Button(
			gui,
			'buttonUndo',
			'LANG_UNDO ←',
			controller => {
				changeSet.undo();
			},
			controller => {
				controller._doUpdateChangeSet = false;
				controller.setTooltip('CTRL/CMD + Z');
			}
		);
		const buttonRedo = new Button(
			gui,
			'buttonRedo',
			'LANG_REDO →',
			controller => {
				changeSet.redo();
			},
			controller => {
				controller._doUpdateChangeSet = false;
				controller.setTooltip('CTRL/CMD + SHIFT + Z');
			}
		);
		this.controllers.push(buttonUndo);
		this.controllers.push(buttonRedo);

		undoRedoField.div.child(buttonUndo.div);
		undoRedoField.div.child(buttonRedo.div);

		undoRedoField.div.style('display', 'flex');
		undoRedoField.div.style('flex-direction', 'row');
		undoRedoField.div.style('gap', '1em');
	}

	/**
	 * @param {string} name
	 * @returns {Controller|undefined}
	 */
	getController(name) {
		return this.controllers.find(c => c.name === name);
	}

	/**
	 * @param {string[]} names
	 * @returns {Array<Controller|undefined>}
	 */
	getControllers(names) {
		return this.controllers.filter(c => names.includes(c.name));
	}

	/**
	 *
	 * @param {string} name
	 * @returns {GUIGroup|undefined}
	 */
	getGUIGroup(name) {
		return this.guiGroups.find(gg => gg.name === name);
	}

	/**
	 * @param {string[]} names
	 * @returns {Array<GUIGroup|undefined>}
	 */
	getGUIGroups(names) {
		return this.guiGroups.filter(gg => names.includes(gg.name));
	}
}

/**
 * Main GUI wrapper that manages fields and controllers for p5Catalyst.
 * Handles layout, theming, controller management, and state persistence.
 */
class GUIForP5 extends GUIGroup {
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
		super('gui');
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
	 * @param  {...Tab} tabs
	 */
	addTabs(...tabs) {
		if (!this.tabs) {
			this.tabs = [];
			this.activeTab = null;
			this.tabBar = createDiv();
			this.tabBar.addClass('tab-bar');
			this.div.child(this.tabBar);
		}

		for (const tab of tabs) {
			this.addGUIGroup(tab);
			this.tabs.push(tab);

			this.div.child(tab.div);
			tab.hide();

			const tabBtn = createButton(tab.name);
			// tabBtn.attribute('data-tabname', tab.name);
			tabBtn.mousePressed(() => this.activateTab(tab.name));
			this.tabBar.child(tabBtn);
		}

		if (tabs.length > 0) {
			this.activateTab(tabs[0].name);
		}
	}

	activateTab(tabName) {
		const tabToShow = this.tabs.find(tab => tab.name === tabName);
		if (!tabToShow) return;

		for (let tab of this.tabs) {
			tab.hide();
		}

		tabToShow.show();
		this.activeTab = tabToShow;

		const buttons = this.tabBar.elt.querySelectorAll('button');
		for (let [i, button] of buttons.entries()) {
			button.classList.toggle('active', tabName === this.tabs[i].name);
		}
	}

	/**
	 * Adds the p5Catalyst logo as a field.
	 * @returns {Field}
	 */
	createP5CatalystLogo() {
		let logo = this.addHTMLAsNewField(
			`<a href="https://github.com/multitude-amsterdam/p5Catalyst" target="_blank">` +
				`<div class="p5catalyst-logo"></div>` +
				`</a>`,
			'footer-logo'
		);
		return logo;
	}

	/**
	 * Gets the current state of all controllers with values.
	 * @returns {Array<{name: string, value: any, isDieActive?: boolean}>}
	 */
	getState() {
		return this.controllers
			.filter(controller => controller.value !== undefined)
			.map(controller => {
				const serializable = {
					name: controller.name,
					value: controller.getSerializedValue(),
				};
				if (controller.die !== undefined)
					serializable.isDieActive = controller.die.isActive;
				return serializable;
			});
	}

	/**
	 * Restores the state of controllers from a saved state.
	 * @param {Array<{name: string, value: any, isDieActive?: boolean}>} state
	 */
	restoreState(state) {
		Controller._doUpdateChangeSet = false;
		for (let { name, value: serializedValue, isDieActive } of state) {
			if (serializedValue === undefined) continue;

			const controller = gui.getController(name);
			if (controller.setValue === undefined) continue;

			controller.restoreValueFromSerialized(serializedValue);

			if (isDieActive === undefined) continue;
			controller.die.setActive(isDieActive);
		}
		Controller._doUpdateChangeSet = true;
	}
}
