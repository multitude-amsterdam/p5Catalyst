/**
 * Tabs at the top of the GUI.
 * @extends {GUIGroup}
 * @see {GUIForP5}
 */
class Tab extends GUIGroup {
	constructor(name) {
		super(name);
		this.div.addClass('tab');
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

/**
 * Helper class that manages randomization of controllers marked as randomizable.
 * Handles toggling, adding/removing controllers, and triggering randomization.
 */
class Randomizer {
	/**
	 * Constructs a new Randomizer instance.
	 */
	constructor() {
		/**
		 * @type {Controller[]}
		 */
		this.controllers = [];
	}

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
		this.controller = controller;

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
		// if (this.controller.doUpdateChangeSet()) changeSet.save(); // not working (yet)
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
