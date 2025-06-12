
class GUIForP5 {
	static verbose = !false;

	fields = [];
	controllers = [];

	isTypingText = false;



	constructor() {
		this.div = createDiv();
		this.div.id('gui');

		this.randomizer = new Randomizer();

		this.loadLightDarkMode();

		this.setLeft();
	}



	setup() {
		for (let controller of this.controllers) {
			controller.setup();
		}
	}



	setLeft() {
		document.querySelector('main').prepend(this.div.elt);
		this.isOnLeftSide = true;
	}

	setRight() {
		document.querySelector('main').append(this.div.elt);
		this.isOnLeftSide = false;
	}

	toggleSide() {
		this.isOnLeftSide ? this.setRight() : this.setLeft();
	}



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

	setLightMode() {
		document.body.className = '';
		window.localStorage['isDarkMode'] = 'false';
		this.darkMode = 'false';
		if (this.darkModeButton)
			this.darkModeButton.setLightMode();
	}

	setDarkMode() {
		document.body.className = 'dark-mode';
		window.localStorage['isDarkMode'] = 'true';
		this.darkMode = 'true';
		if (this.darkModeButton)
			this.darkModeButton.setDarkMode();
	}

	setAutoLightDarkMode() {
		const isSystemDarkMode = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
		if (isSystemDarkMode()) {
			this.setDarkMode();
		} else {
			this.setLightMode();
		}
		window.localStorage['isDarkMode'] = 'auto';
		this.darkMode = 'auto';
		if (this.darkModeButton)
			this.darkModeButton.setAutoLightDarkMode();
	}

	toggleLightDarkMode() {
		// cycle modes
		print('dark mode', this.darkMode);
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
		print('dark mode set to:', this.darkMode);
	}

	createDarkModeButton() {
		this.darkModeButton = this.addController(new Button(
			this, 'buttonDarkMode', '', 
			(controller) => {
				this.toggleLightDarkMode();
			}
		));
		this.darkModeButton.controllerElement.id('dark-mode-button');
		this.darkModeButton.setLightMode = () => {
			this.darkModeButton.controllerElement.style('background-image', 'url("assets/dark-mode/light-mode-icon.svg")');
			this.darkModeButton.controllerElement.elt.title = 'Light mode';
		};
		this.darkModeButton.setDarkMode = () => {
			this.darkModeButton.controllerElement.style('background-image', 'url("assets/dark-mode/dark-mode-icon.svg")');
			this.darkModeButton.controllerElement.elt.title = 'Dark mode';
		};
		this.darkModeButton.setAutoLightDarkMode = () => {
			this.darkModeButton.controllerElement.style('background-image', 'url("assets/dark-mode/auto-mode-icon.svg")');
			this.darkModeButton.controllerElement.elt.title = 'Auto light/dark mode';
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



	addField(field) {
		this.fields.push(field);
		return field;
	}

	addHTMLToNewField(html, className='') {
		let field = this.addField(new Field(this.div, '', className));
		field.div.html(html);
		return field;
	}

	addP5BrandLabLogo() {
		let logo = this.addHTMLToNewField(
			`powered by <a href="https://github.com/aidanwyber/p5BrandLab" target="_blank">` + 
				`<div class="p5brandlab-logo footer-logo"></div>` + 
			`</a>`,
			'powered-by-logo'
		);
		return logo;
	}

	addDivider() {
		let divider = new Divider(this.div);
		this.addField(divider);
		return divider;
	}

	addController(controller, doAddToRandomizerAs=undefined) {
		this.addField(controller);
		this.controllers.push(controller);
		if (doAddToRandomizerAs !== undefined)
			this.randomizer.addController(controller, doAddToRandomizerAs);
		return controller;
	}

	addLabel(labelText) {
		let label = new Label(this.div, labelText);
		this.addField(label);
		return label;
	}

	addTitle(hSize, titleText, doAlignCenter=false) {
		let title = new Title(this.div, hSize, titleText, doAlignCenter=doAlignCenter);
		this.addField(title);
		return title;
	}

	addImage(url, altText, doAlignCenter=true) {
		let img = new GUIImage(this.div, url, altText, doAlignCenter=doAlignCenter);
		this.addField(img);
		return img;
	}



 	hasName(name) {
		return this.controllers.some(controller =>
			controller.name == name
		);
	}

	getController(name) {
		if (!this.hasName(name)) {
			return undefined;
		}
		return this.controllers[
			this.controllers.map(controller => controller.name).indexOf(name)
		];
	}

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



	getState() {
		return this.controllers
			.filter(controller => 
				controller.value !== undefined
			)
			.map(controller => ({
				name: controller.name,
				value: controller.getValueForJSON()
			}))
			;
	}

	restoreState(state) {
		Controller._doUpdateChangeSet = false;
		for (let {name, value} of state) {
			print(name);
			const controller = gui.getController(name);
			print(controller, value)
			if (controller.setValue && value !== undefined) {
				value = restoreSerializedP5Color(value);
				value = restoreSerializedVec2D(value);
				controller.setValue(value);
			}
		}
		Controller._doUpdateChangeSet = true;
	}
}



class Randomizer {
	controllers = [];
	
	constructor() {}

	addController(controller, doRandomize) {
		this.controllers.push(controller);
		let die = new DieIcon(this, controller, doRandomize);
		controller.addDie(die);
		controller.doRandomize = doRandomize;
	}

	removeController(controller) {
		let index = this.controllers.indexOf(controller);
		if (index < 0) {
			console.error('Controller not in list.', controller);
			return;
		}
		this.controllers.splice(index, 1);
	}

	randomize() {
		const controllersToRandomize = this.controllers.filter(
			controller => controller.doRandomize === true && !controller.isHidden()
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

	toggleDoRandomize(die) {
		let index = this.controllers.map(c => c.die).indexOf(die);
		if (index < 0) {
			console.error('Die not in list.', controller);
			return;
		}
		this.controllers[index].doRandomize = this.controllers[index].doRandomize !== true;
		die.setActive(this.controllers[index].doRandomize);
	}
}



class DieIcon {
	static iconURLs = [
		'assets/dice/die (1).svg',
		'assets/dice/die (2).svg',
		'assets/dice/die (3).svg',
		'assets/dice/die (4).svg',
		'assets/dice/die (5).svg',
		'assets/dice/die (6).svg',
	];


	constructor(randomizer, controller, isActive) {
		this.randomizer = randomizer;

		this.img = createImg('', 'Randomizer die');
		this.img.class('die-icon');
		this.img.mouseClicked(() => this.click());
		this.rot = 0;
		this.randomizeIcon();

		this.setActive(isActive);
	}

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
		let angle = this.rot * TAU / 3;
		this.img.style('rotate', angle + 'rad');
	}

	click() {
		this.randomizer.toggleDoRandomize(this);
	}

	setActive(isActive) {
		this.isActive = isActive;
		this.setDisplay();
	}

	setDisplay() {
		// let isDisabled = this.img.hasClass('disabled');
		if (this.isActive) {
			this.img.removeClass('disabled');
			this.randomizeIcon();
		}
		else {
			this.img.addClass('disabled');
		}
	}

	remove() {
		this.img.remove();
	}
}



class Field {
	constructor(parentDiv, id, className) {
		this.div = createDiv();
		this.div.parent(parentDiv);
		if (id !== undefined && id !== null && id != '')
			this.div.id(id);
		this.div.class(className);
	}

	setTooltip(tooltip) {
		this.div.elt.title = tooltip;
	}

	hide() {
		this.div.hide();
	}

	show() {
		this.div.elt.style.display = null; // more general than p5 .show()
		if (this.setDisplay) this.setDisplay(); // XYSlider needs this for now
	}

	isHidden() {
		return this.div.elt.style.display == 'none';
	}
}


class Label extends Field {
	constructor(controller, text) {
		super(controller.div, null, 'gui-label');
		this.controller = controller;
		text = lang.process(text, true);
		this.setText(text);
	}

	setText(text) {
		this.text = text;
		this.div.elt.innerText = text;
	}
}


class Title extends Field {
	constructor(parentDiv, hSize, text, doAlignCenter=false) {
		super(parentDiv, null, 'gui-title');
		text = lang.process(text, true);
		this.div.html(`<h${hSize}>${text}</h${hSize}>`);
		if (doAlignCenter) {
			this.div.style('text-align', 'center');
		}
	} 
}


class Textfield extends Field {
	constructor(parentDiv, text, className=undefined, doAlignCenter=false) {
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


class GUIImage extends Field {
	constructor(parentDiv, url, altText, doAlignCenter=true) {
		super(parentDiv, null, 'gui-image');
		altText = lang.process(altText, true);
		this.div.html(`<img src='${url}' alt='${altText}'>`);
		if (doAlignCenter) {
			this.div.style('text-align', 'center');
		}
	}
}


class Divider extends Field {
	constructor(parentDiv) {
		super(parentDiv, null, 'gui-divider');
		this.div.html('<hr>');
	}
}

