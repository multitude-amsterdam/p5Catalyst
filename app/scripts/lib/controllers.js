/**
 * @fileoverview Collection of controller classes used by the GUI.
 * @see Controller
 * @see ValuedController
 * @see Button
 * @see FileLoader
 * @see TextFileLoader
 * @see JSONFileLoader
 * @see ImageLoader
 * @see Toggle
 * @see Select
 * @see ResolutionSelect
 * @see Slider
 * @see RangeSlider
 * @see XYSlider
 * @see ColourTextArea
 * @see ColourBoxes
 * @see MultiColourBoxes
 */

/**
 * Base class for all GUI controllers.
 * @extends Field
 * @example
 * // For any Controller, the main callback function passed into it will trigger when the controller is triggered, like this:
 * const triggerButton = new Button(
 * 	gui,
 * 	'buttonTrigger',
 * 	'Do something!',
 * 	controller => {
 * 		doSomething();
 * 	}
 * );
 *
 * @example
 * // You can add an optional setupCallback function which calls after the GUI item is created:
 * const triggerButton = new Button(
 * 	gui,
 * 	'buttonTrigger',
 * 	'Do something!',
 * 	controller => {
 * 		doSomething();
 * 	},
 * 	controller => {
 * 		// simulate a click on loading the app
 * 		controller.click();
 * 	}
 * );
 */
class Controller extends Field {
	/**
	 * Static flag to control whether the change set should be updated.
	 * @type {boolean}
	 */
	static _doUpdateChangeSet = true;
	/**
	 * Flag to control whether the change set should be updated.
	 * @type {boolean}
	 */
	_doUpdateChangeSet = true;

	/**
	 * The HTML element representing the controller.
	 * @type {p5.Element|HTMLElement}
	 */
	controllerElement = null;

	/**
	 * Flag to control whether the controller should randomize its value.
	 * @type {boolean}
	 */
	doRandomize = undefined;

	/**
	 * The GUIForP5 instance this controller belongs to.
	 * @type {GUIForP5}
	 */
	gui;

	/**
	 * The name of the controller.
	 * @type {string}
	 */
	name;

	/**
	 * The label for the controller.
	 * @type {string}
	 */
	label;

	/**
	 * The wrapper div for the controller.
	 * @type {p5.Element}
	 */
	controllerWrapper;

	/**
	 * Optional setup callback.
	 * @type {function}
	 */
	setupCallback;

	/**
	 * The console div element for displaying messages.
	 * @type {p5.Element}
	 */
	console;

	/**
	 * The current console text.
	 * @type {string}
	 */
	consoleText;

	/**
	 * The die icon for randomization.
	 * @type {DieIcon}
	 */
	die;

	/**
	 * Constructor for the Controller class.
	 * @param {GUIForP5} gui - The GUI instance this controller belongs to.
	 * @param {string} name - The name of the controller.
	 * @param {string} labelStr - The label text for the controller.
	 * @param {function} [setupCallback] - Optional callback function for setup.
	 */
	constructor(gui, name, labelStr, setupCallback = undefined) {
		super(gui.div, name, 'gui-controller');
		this.gui = gui;
		this.name = name;

		if (labelStr !== undefined) {
			labelStr = lang.process(labelStr, true);
			this.label = new Label(this, labelStr);
		}

		this.controllerWrapper = createDiv();
		this.controllerWrapper.class('controller-wrapper');
		this.controllerWrapper.parent(this.div);

		this.setupCallback = setupCallback || (controller => {});
	}

	/**
	 * Setup for the controller.
	 */
	setup() {
		this.createConsole();
		this.setupCallback(this);
	}

	/**
	 * Disables the controller.
	 */
	disable() {
		if (this.controllerElement instanceof p5.Element)
			this.controllerElement.elt.disabled = true;
		else this.controllerElement.disabled = true;
	}

	/**
	 * Enables the controller.
	 */
	enable() {
		if (this.controllerElement instanceof p5.Element)
			this.controllerElement.elt.disabled = false;
		else this.controllerElement.disabled = false;
	}

	/**
	 * Checks if the controller is disabled.
	 * @returns {boolean} - True if the controller is disabled, false otherwise.
	 */
	isDisabled() {
		if (this.controllerElement instanceof p5.Element)
			return this.controllerElement.elt.disabled;
		else return this.controllerElement.disabled;
	}

	/**
	 * Sets the disabled state of the controller.
	 * @param {boolean} doSetDisabled - True to disable the controller, false to enable it.
	 */
	setDisabled(doSetDisabled) {
		doSetDisabled ? this.disable() : this.enable();
	}

	/**
	 * Creates the console element for the controller.
	 */
	createConsole() {
		this.console = createDiv();
		this.console.parent(this.div);
		this.console.class('gui-console');
		this.console.hide();
	}

	/**
	 * Sets the console text and type.
	 * @param {string} text - The text to display in the console.
	 * @param {string} [type] - The type of message ('error', 'warning', etc.).
	 */
	setConsole(text, type) {
		if (text === undefined) {
			this.consoleText = undefined;
			this.console.hide();
			this.console.html('');
			this.console.class('gui-console');
			return;
		}

		if (type === undefined) text = '🔺 ' + text;

		this.consoleText = text;
		this.console.class('gui-console');
		this.console.addClass('gui-console-' + type);
		this.console.html(text);
		this.console.show();
	}

	/**
	 * Sets the error message in the console.
	 * @param {string} text - The error message to display.
	 */
	setError(text) {
		this.setConsole('❌ ' + text, 'error');
	}

	/**
	 * Sets the warning message in the console.
	 * @param {string} text - The warning message to display.
	 */
	setWarning(text) {
		this.setConsole('⚠️ ' + text, 'warning');
	}

	/**
	 * Adds this controller to a randomizer.
	 * @param {Randomizer} randomizer - The randomizer to add this controller to.
	 */
	addToRandomizer(randomizer) {
		randomizer.addController(this);
	}

	/**
	 * Adds a die to the controller.
	 * @param {DieIcon} die - The die to add.
	 */
	addDie(die) {
		die.img.parent(this.controllerWrapper);
		this.die = die;
	}

	/**
	 * Checks if the change set should be updated.
	 * @returns {boolean} - True if the change set should be updated, false otherwise.
	 */
	doUpdateChangeSet() {
		return (
			changeSet !== undefined &&
			this._doUpdateChangeSet &&
			Controller._doUpdateChangeSet
		);
	}
}

/**
 * Controller that holds a value which can be serialised.
 * @extends Controller
 * @example
 * // ValuedController gives back its value through a callback, that's where you tie it to the system.
 * // I usually link it to generator like so, also using data from generator to construct the controller:
 * const fgColBoxes = new ColourBoxes(
 * 	gui,
 * 	'colourBoxesFgCol',
 * 	'Foreground colour',
 * 	generator.palette,
 * 	0,
 * 	(controller, value) => {
 * 		generator.fgCol = value;
 * 	}
 * );
 */
class ValuedController extends Controller {
	/**
	 * The value of the controller.
	 * @type {*}
	 */
	value;

	/**
	 * Constructor for ValuedController.
	 * @param {GUIForP5} gui
	 * @param {string} name
	 * @param {string} labelStr
	 * @param {function} [setupCallback]
	 */
	constructor(gui, name, labelStr, setupCallback = undefined) {
		super(gui, name, labelStr, setupCallback);
	}

	/**
	 * Sets the value of the controller.
	 * @param {*} value - The value to set.
	 */
	setValue(value) {
		this.value = value;
		if (this.doUpdateChangeSet()) changeSet.save();
	}

	/**
	 * Randomizes the value of the controller.
	 */
	randomize() {
		console.error('No randomize() method.');
	}

	/**
	 * Gets the value for JSON serialization.
	 * @returns {*}
	 */
	getValueForJSON() {
		return this.value;
	}
}

/**
 * Simple push button controller.
 * @extends Controller
 */
class Button extends Controller {
	/**
	 * Constructor for Button.
	 * @param {GUIForP5} gui
	 * @param {string} name
	 * @param {string} labelStr
	 * @param {function} callback
	 * @param {function} [setupCallback]
	 * @example
	 * const button = new Button(
	 * 	gui,
	 * 	'buttonName',
	 * 	'Click me',
	 * 	controller => {
	 * 		print('Button clicked!');
	 * 	}
	 * );
	 */
	constructor(gui, name, labelStr, callback, setupCallback = undefined) {
		super(gui, name, undefined, setupCallback);
		labelStr = lang.process(labelStr, true);
		this.controllerElement = createButton(labelStr);
		this.controllerElement.parent(this.controllerWrapper);
		this.controllerElement.elt.onclick = () => {
			callback(this);
			if (this.doUpdateChangeSet()) changeSet.save();
		};
	}

	/**
	 * Simulates a button click.
	 */
	click() {
		this.controllerElement.elt.onclick();
	}
}

/**
 * Base class for file input controllers.
 * @extends Button
 */
class FileLoader extends Button {
	/**
	 * The file type accepted.
	 * @type {string}
	 */
	fileType;

	/**
	 * The file object.
	 * @type {File}
	 */
	file;

	/**
	 * The file name.
	 * @type {string}
	 */
	fileName;

	/**
	 * Constructor for FileLoader.
	 * @param {GUIForP5} gui
	 * @param {string} name
	 * @param {string} fileType
	 * @param {string} labelStr
	 * @param {function} fileReadyCallback
	 * @param {function} valueCallback
	 * @param {function} [setupCallback]
	 */
	constructor(
		gui,
		name,
		fileType,
		labelStr,
		fileReadyCallback,
		valueCallback,
		setupCallback = undefined
	) {
		super(
			gui,
			name,
			labelStr,
			() => {
				this.controllerElement.elt.click();
			},
			setupCallback
		);
		this.fileType = fileType;

		this.callback = value => {
			valueCallback(this, value);
		};

		this.controllerElement = createFileInput(file => {
			this.file = file;
			this.fileName = file.file.name;
			fileReadyCallback(file);
			this.callback(this.file);
		});
		this.controllerElement.parent(this.controllerWrapper);
		this.controllerElement.hide();
	}
}

/**
 * Loader for plain text files.
 * @extends FileLoader
 */
class TextFileLoader extends FileLoader {
	/**
	 * Constructor for TextFileLoader.
	 * @param {GUIForP5} gui
	 * @param {string} name
	 * @param {string} labelStr
	 * @param {function} valueCallback
	 * @param {function} [setupCallback]
	 */
	constructor(gui, name, labelStr, valueCallback, setupCallback = undefined) {
		super(
			gui,
			name,
			'text',
			labelStr,
			file => {},
			valueCallback,
			setupCallback
		);
		this.controllerElement.elt.accept = '.txt';
	}
}

/**
 * Loader for JSON files.
 * @extends FileLoader
 */
class JSONFileLoader extends FileLoader {
	/**
	 * Constructor for JSONFileLoader.
	 * @param {GUIForP5} gui
	 * @param {string} name
	 * @param {string} labelStr
	 * @param {function} valueCallback
	 * @param {function} [setupCallback]
	 */
	constructor(gui, name, labelStr, valueCallback, setupCallback = undefined) {
		super(
			gui,
			name,
			'json',
			labelStr,
			file => {},
			valueCallback,
			setupCallback
		);
		this.controllerElement.elt.accept = '.json';
	}
}

/**
 * Loader that converts files to p5.Image instances.
 * @extends FileLoader
 */
class ImageLoader extends FileLoader {
	/**
	 * The loaded image.
	 * @type {p5.Element}
	 */
	img;

	/**
	 * Constructor for ImageLoader.
	 * @param {GUIForP5} gui
	 * @param {string} name
	 * @param {string} labelStr
	 * @param {function} valueCallback
	 * @param {function} [setupCallback]
	 */
	constructor(gui, name, labelStr, valueCallback, setupCallback = undefined) {
		super(
			gui,
			name,
			'image',
			labelStr,
			file => {
				this.img = createImg(file.data, '');
				this.img.hide();
				this.file = this.img;
			},
			valueCallback,
			setupCallback
		);
		this.controllerElement.elt.accept = '.jpg,.png,.gif,.tif';
	}
}

/**
 * On/off toggle represented by a button.
 * @extends ValuedController
 */
class Toggle extends ValuedController {
	/**
	 * The callback function for toggle.
	 * @type {function}
	 */
	callback;

	/**
	 * Constructor for Toggle.
	 * @param {GUIForP5} gui
	 * @param {string} name
	 * @param {string} labelStr0
	 * @param {string} labelStr1
	 * @param {boolean} isToggled
	 * @param {function} callback
	 * @param {function} [setupCallback]
	 */
	constructor(
		gui,
		name,
		labelStr0,
		labelStr1,
		isToggled,
		callback,
		setupCallback = undefined
	) {
		super(gui, name, undefined, setupCallback);
		this.controllerElement = createButton('');
		this.controllerElement.parent(this.controllerWrapper);
		this.controllerElement.class('toggle');
		this.controllerElement.elt.onmousedown = () => callback(this);

		labelStr0 = lang.process(labelStr0, true);
		labelStr1 = lang.process(labelStr1, true);
		const span0 = createSpan(labelStr0);
		const span1 = createSpan(labelStr1);
		span0.parent(this.controllerElement);
		span1.parent(this.controllerElement);

		this.value = isToggled ? true : false;

		this.controllerElement.elt.onmousedown = () => {
			this.setValue(!this.value);
		};
		this.callback = callback;
	}

	/**
	 * Simulates a toggle click.
	 */
	click() {
		this.controllerElement.elt.onmousedown();
	}

	/**
	 * Sets the toggle value.
	 * @param {boolean} value
	 */
	setValue(value) {
		if (value != this.value)
			this.controllerElement.elt.toggleAttribute('toggled');
		this.value = value;
		this.callback(this, this.value);
		if (this.doUpdateChangeSet()) changeSet.save();
	}

	/**
	 * Randomizes the toggle value.
	 */
	randomize() {
		this.setValue(random(1) < 0.5);
	}
}

/**
 * Drop-down select controller.
 * @extends ValuedController
 */
class Select extends ValuedController {
	/**
	 * The options for the select.
	 * @type {Array}
	 */
	options;

	/**
	 * The string representations of the options.
	 * @type {Array<string>}
	 */
	optionStrs;

	/**
	 * The value callback.
	 * @type {function}
	 */
	valueCallback;

	/**
	 * Constructor for Select.
	 * @param {GUIForP5} gui
	 * @param {string} name
	 * @param {string} labelStr
	 * @param {Array} options
	 * @param {number} defaultIndex
	 * @param {function} valueCallback
	 * @param {function} [setupCallback]
	 */
	constructor(
		gui,
		name,
		labelStr,
		options,
		defaultIndex,
		valueCallback,
		setupCallback = undefined
	) {
		super(gui, name, labelStr, setupCallback);

		this.controllerElement = createSelect();
		this.setOptions(options);

		const callback = event => {
			const valueStr = event.srcElement.value;
			const ind = this.optionStrs.indexOf(valueStr);
			this.value = this.options[ind];
			valueCallback(this, this.value);
		};
		this.controllerElement.elt.onchange = callback;
		this.valueCallback = valueCallback;
		this.setValue(options[defaultIndex]);
	}

	/**
	 * Sets the options for the select.
	 * @param {Array} options
	 */
	setOptions(options) {
		this.controllerElement.elt.replaceChildren();
		this.controllerElement.parent(this.controllerWrapper);
		this.options = options;
		this.optionStrs = options.map(option => this.optionToString(option));
		for (const optionStr of this.optionStrs)
			this.controllerElement.option(optionStr);
		this.afterSetOptions();
	}

	/**
	 * Converts an option to a string.
	 * @param {*} option
	 * @returns {string}
	 */
	optionToString(option) {
		return option.toString();
	}

	/**
	 * Called after setting options.
	 */
	afterSetOptions() {}

	/**
	 * Checks if an option exists.
	 * @param {*} option
	 * @returns {boolean}
	 */
	hasOption(option) {
		return this.options.some(o => o == option);
	}
	/**
	 * Checks if an option string exists.
	 * @param {string} optionStr
	 * @returns {boolean}
	 */
	hasOptionStr(optionStr) {
		return this.optionStrs.some(os => os == optionStr);
	}

	/**
	 * Sets the value of the select.
	 * @param {*} option
	 */
	setValue(option) {
		if (!this.hasOption(option)) {
			throw new Error(option + ' was not found in options.');
		}
		this.value = option;
		const optStr = this.optionStrs[this.options.indexOf(option)];
		this.controllerElement.selected(optStr);
		this.valueCallback(this, option);
		if (this.doUpdateChangeSet()) changeSet.save();
	}

	/**
	 * Randomizes the select value.
	 */
	randomize() {
		this.setValue(random(this.options));
	}
}

/**
 * Specialised select for common resolutions.
 * @extends Select
 */
class ResolutionSelect extends Select {
	constructor(
		gui,
		labelStr,
		resOptions,
		defaultIndex,
		valueCallback,
		setupCallback = undefined
	) {
		super(
			gui,
			'resolutionSelect',
			labelStr,
			resOptions.map(s => lang.process(s, true)),
			defaultIndex,
			(controller, value) => {
				if (value.indexOf(' x ') >= 0) {
					const resStr = value.split(': ')[1];
					const wh = resStr.split(' x ');
					const w = parseInt(wh[0]);
					const h = parseInt(wh[1]);
					resize(w, h);
				}
				valueCallback(controller, value);
			},
			setupCallback
		);
	}
}

/**
 * One dimensional slider controller.
 * @extends ValuedController
 */
class Slider extends ValuedController {
	constructor(
		gui,
		name,
		labelStr,
		minVal,
		maxVal,
		defaultVal,
		stepSize,
		valueCallback,
		setupCallback = undefined
	) {
		super(gui, name, labelStr, setupCallback);
		this.controllerElement = createSlider(
			minVal,
			maxVal,
			defaultVal,
			stepSize
		);
		this.controllerElement.parent(this.controllerWrapper);
		this.minVal = minVal;
		this.maxVal = maxVal;
		this.defaultVal = defaultVal;
		this.stepSize = stepSize;

		const callback = event => {
			const value = parseFloat(event.srcElement.value);
			valueCallback(this, value);
		};
		this.controllerElement.elt.onchange = callback;
		this.controllerElement.elt.oninput = callback;
		valueCallback(this, defaultVal);
		this.valueCallback = valueCallback;
	}

	setValue(value) {
		this.value = value;
		this.valueCallback(this, value);
		this.controllerElement.value(value);
		if (this.doUpdateChangeSet()) changeSet.save();
	}

	randomize() {
		this.setValue(random(this.minVal, this.maxVal));
	}
}

/**
 * Two handled slider returning a min/max range.
 * @extends ValuedController
 */
class RangeSlider extends ValuedController {
	constructor(
		gui,
		name,
		labelStr,
		minVal,
		maxVal,
		defaultValMin,
		defaultValMax,
		stepSize,
		valueCallback,
		setupCallback = undefined
	) {
		super(gui, name, labelStr, setupCallback);
		this.controllerElement = createDiv()
			.class('dual-range-input')
			.parent(this.controllerWrapper);
		this.minSlider = createSlider(
			minVal,
			maxVal,
			defaultValMin,
			stepSize
		).parent(this.controllerElement);
		this.maxSlider = createSlider(
			minVal,
			maxVal,
			defaultValMax,
			stepSize
		).parent(this.controllerElement);
		new DualRangeInput(this.minSlider.elt, this.maxSlider.elt);

		this.minVal = minVal;
		this.maxVal = maxVal;
		this.defaultValMin = defaultValMin;
		this.defaultValMax = defaultValMax;
		this.stepSize = stepSize;

		const callback = event => {
			const minValue = parseFloat(this.minSlider.elt.value);
			const maxValue = parseFloat(this.maxSlider.elt.value);
			valueCallback(this, { min: minValue, max: maxValue });
		};

		this.minSlider.elt.onchange = callback;
		this.minSlider.elt.oninput = callback;
		this.maxSlider.elt.onchange = callback;
		this.maxSlider.elt.oninput = callback;
		this.valueCallback = valueCallback;
	}

	setValue(value) {
		this.value = value;
		this.valueCallback(this, value);
		this.minSlider.value(value.min);
		this.maxSlider.value(value.max);
		if (this.doUpdateChangeSet()) changeSet.save();
	}

	randomize() {
		const pivot = random(this.minVal, this.maxVal);
		this.setValue({
			min: random(this.minVal, pivot),
			max: random(pivot, this.maxVal),
		});
	}
}

/**
 * Two dimensional slider returning an {x,y} object.
 * @extends ValuedController
 */
class XYSlider extends ValuedController {
	constructor(
		gui,
		name,
		labelStr,
		minValX,
		maxValX,
		defaultValX,
		stepSizeX,
		minValY,
		maxValY,
		defaultValY,
		stepSizeY,
		valueCallback,
		setupCallback = undefined
	) {
		super(gui, name, labelStr, setupCallback);
		this.minValX = minValX;
		this.minValY = minValY;
		this.maxValX = maxValX;
		this.maxValY = maxValY;
		this.defaultValX = defaultValX;
		this.defaultValY = defaultValY;
		this.stepSizeX = stepSizeX;
		this.stepSizeY = stepSizeY;
		this.valueCallback = valueCallback;

		this.controllerElement = createDiv();
		this.controllerElement.class('xyslider');
		this.controllerElement.parent(this.controllerWrapper);
		const handle = createDiv();
		handle.class('handle');
		handle.parent(this.controllerElement);
		this.handle = handle;

		this.isDragging = false;
		this.controllerElement.elt.addEventListener('mousedown', e => {
			this.isDragging = true;
			this._doUpdateChangeSet = false;
		});
		handle.elt.addEventListener('mousedown', e => {
			this.isDragging = true;
			this._doUpdateChangeSet = false;
		});
		handle.elt.addEventListener('mouseup', e => {
			this.isDragging = false;
			this._doUpdateChangeSet = true;
			this.setValue(this.getValueFromHandlePosition(e));
		});
		document.addEventListener('mousemove', e => {
			if (!this.isDragging) return;
			this.setValue(this.getValueFromHandlePosition(e));
		});

		this.setValue({ x: this.defaultValX, y: this.defaultValY });
	}

	getValueFromHandlePosition(mouseEvent) {
		const compStyle = window.getComputedStyle(this.controllerElement.elt);
		const borderW = parseFloat(compStyle.borderWidth);

		const rect = this.controllerElement.elt.getBoundingClientRect();
		rect.width -= borderW * 2;
		rect.height -= borderW * 2;

		let x =
			mouseEvent.clientX - rect.left - this.handle.elt.offsetWidth / 2;
		let y =
			mouseEvent.clientY - rect.top - this.handle.elt.offsetHeight / 2;

		const handleW = this.handle.elt.offsetWidth;
		const handleH = this.handle.elt.offsetHeight;
		x = constrain(x, -handleW / 2, rect.width - handleW / 2);
		y = constrain(y, -handleH / 2, rect.height - handleH / 2);

		let normX = map(x, -handleW / 2, rect.width - handleW / 2, -1, 1);
		let normY = map(y, -handleH / 2, rect.height - handleH / 2, -1, 1);

		return this.mapSteppedFromNormedVec({ x: normX, y: normY });
	}

	mapSteppedFromNormedVec(normedVec) {
		// snap to axes
		if (abs(normedVec.x) < 0.033) normedVec.x = 0;
		if (abs(normedVec.y) < 0.033) normedVec.y = 0;

		const nStepsX = round((this.maxValX - this.minValX) / this.stepSizeX);
		const nStepsY = round((this.maxValY - this.minValY) / this.stepSizeY);
		return {
			x:
				this.minValX +
				(round((normedVec.x * 0.5 + 0.5) * nStepsX) / nStepsX) *
					(this.maxValX - this.minValX),
			y:
				this.minValY +
				(round((normedVec.y * 0.5 + 0.5) * nStepsY) / nStepsY) *
					(this.maxValY - this.minValY),
		};
	}

	setValue(vec) {
		if (vec.x === undefined || vec.y === undefined) {
			console.error(
				'Value must be a vector {x: X, y: Y}, not this: ',
				vec
			);
			return;
		}
		this.value = vec;
		this.setDisplay();
		this.valueCallback(this, this.value);
		if (this.doUpdateChangeSet()) changeSet.save();
	}

	setDisplay() {
		const compStyle = window.getComputedStyle(this.controllerElement.elt);
		const borderW = parseFloat(compStyle.borderWidth);
		const rect = this.controllerElement.elt.getBoundingClientRect();
		rect.width -= borderW * 2;
		rect.height -= borderW * 2;
		const handleW = this.handle.elt.offsetWidth;
		const handleH = this.handle.elt.offsetHeight;
		const feedbackX = map(
			this.value.x,
			this.minValX,
			this.maxValX,
			-handleW / 2,
			rect.width - handleW / 2
		);
		const feedbackY = map(
			this.value.y,
			this.minValY,
			this.maxValY,
			-handleH / 2,
			rect.height - handleH / 2
		);

		this.handle.elt.style.left = `${feedbackX}px`;
		this.handle.elt.style.top = `${feedbackY}px`;
	}

	randomize() {
		this.setValue(
			this.mapSteppedFromNormedVec({
				x: random(-1, 1),
				y: random(-1, 1),
			})
		);
	}
}

/**
 * Radio buttons displaying coloured options.
 * @extends ValuedController
 */
class ColourBoxes extends ValuedController {
	constructor(
		gui,
		name,
		labelStr,
		colours,
		defaultIndex,
		valueCallback,
		setupCallback = undefined
	) {
		super(gui, name, labelStr, setupCallback);

		this.valueCallback = valueCallback;

		this.createRadioFromColours(colours);

		this.setValue(colours[defaultIndex]);
	}

	createRadioFromColours(colours) {
		const isInit = this.controllerElement === undefined;
		if (this.controllerElement) {
			this.controllerElement.elt.remove();
		}

		const radio = createRadio(this.name);
		radio.class('colour-boxes');
		this.controllerWrapper.elt.prepend(radio.elt);

		for (let i = 0; i < colours.length; i++) {
			radio.option(i.toString());
		}

		// remove span labels from p5 structure
		for (const elt of radio.elt.querySelectorAll('span')) elt.remove();

		let i = 0;
		for (const elt of radio.elt.querySelectorAll('input')) {
			const hexCol = colorToHexString(colours[i++]).toUpperCase();
			elt.style.backgroundColor = hexCol;
			elt.title = hexCol;
			elt.onclick = evt => {
				this.setValue(this.colours[parseInt(elt.value)]);
			};
		}

		this.colours = colours;
		this.controllerElement = radio;
	}

	setValue(colObj) {
		if (!(colObj instanceof p5.Color))
			throw new Error(colObj + ' is not a p5.Color.');

		const index = this.colours.findIndex(col =>
			isArraysEqual(col.levels, colObj.levels)
		);

		this.value = this.colours[index];
		this.controllerElement.selected('' + index);
		this.valueCallback(this, this.value);
		if (this.doUpdateChangeSet()) changeSet.save();
	}

	randomize() {
		this.setValue(random(this.colours));
	}
}

/**
 * Multiple selectable colour checkboxes.
 * @extends ValuedController
 */
class MultiColourBoxes extends ValuedController {
	constructor(
		gui,
		name,
		labelStr,
		colours,
		defaultIndices,
		valueCallback,
		setupCallback = undefined
	) {
		super(gui, name, labelStr, setupCallback);

		this.colours = colours;
		this.valueCallback = valueCallback;

		this.setControllerColours();

		const defaultCols = defaultIndices.map(i => this.colours[i]);
		this.setValue(defaultCols);
	}

	setControllerColours() {
		if (this.controllerElement) {
			this.controllerElement.remove();
		}

		const div = createDiv();
		div.class('colour-boxes');
		div.parent(this.controllerWrapper);
		this.checkboxes = [];
		for (let i = 0; i < this.colours.length; i++) {
			const cb = createCheckbox();
			cb.parent(div);
			cb.value('' + i);
			cb.elt.addEventListener('click', () => {
				const indices = [];
				this.checkboxes.forEach((c, idx) => {
					if (c.checked()) indices.push(idx);
				});
				this.setValueFromIndices(indices);
			});
			this.checkboxes.push(cb);
		}

		div.elt.querySelectorAll('span').forEach(elt => {
			elt.remove();
		});
		div.elt.querySelectorAll('input').forEach((elt, i) => {
			const hexCol = colorToHexString(this.colours[i]).toUpperCase();
			elt.style.backgroundColor = hexCol;
			elt.title = hexCol;
		});

		this.controllerElement = div;
	}

	setValueFromIndices(indices) {
		this.valueIndices = indices;
		this.value = indices.map(i => this.colours[i]);
		this.checkboxes.forEach((cb, i) => {
			cb.checked(indices.includes(i));
		});
		this.valueCallback(this, this.value);
		if (this.doUpdateChangeSet()) changeSet.save();
	}

	setValue(colArray) {
		const indices = colArray.map(colObj => {
			if (!(colObj instanceof p5.Color))
				throw new Error(colObj + ' is not a p5.Color.');
			return this.colours.findIndex(col =>
				isArraysEqual(col.levels, colObj.levels)
			);
		});
		this.setValueFromIndices(indices);
	}

	randomize() {
		const indices = [];
		for (let i = 0; i < this.colours.length; i++) {
			if (random(1) < 0.5) indices.push(i);
		}
		if (indices.length === 0)
			indices.push(floor(random(this.colours.length)));
		this.setValueFromIndices(indices);
	}
}

/**
 * Single line text input controller.
 * @extends ValuedController
 */
class Textbox extends ValuedController {
	constructor(
		gui,
		name,
		labelStr,
		defaultVal,
		valueCallback,
		setupCallback = undefined
	) {
		super(gui, name, labelStr, setupCallback);
		this.controllerElement = createInput();
		this.controllerElement.parent(this.controllerWrapper);
		this.controllerElement.value(defaultVal);

		this.controllerElement.elt.oninput = event => {
			const value = event.srcElement.value;
			valueCallback(this, value);
		};

		this.valueCallback = valueCallback;

		this.controllerElement.elt.addEventListener(
			'focusin',
			event => (gui.isTypingText = true)
		);
		this.controllerElement.elt.addEventListener(
			'focusout',
			event => (gui.isTypingText = false)
		);
	}

	setValue(value) {
		this.value = value;
		this.valueCallback(this, value);
		this.controllerElement.value(value);
		if (this.doUpdateChangeSet()) changeSet.save();
	}

	randomize() {}
}

/**
 * Pair of textboxes for width and height values.
 * @extends ValuedController
 */
class ResolutionTextboxes extends ValuedController {
	constructor(gui, defW, defH, valueCallback, setupCallback = undefined) {
		super(gui, 'resolutionTextboxes', undefined, setupCallback);
		this.w = defW;
		this.h = defH;
		this.wBox = new Textbox(
			gui,
			'resolutionTextBoxes-Width',
			lang.process('LANG_WIDTH:', true),
			defW,
			(controller, value) => {
				const pxDim = parseInt(value);
				if (isNaN(pxDim)) {
					return;
				}
				this.w = pxDim;
				resize(this.w, this.h);
				valueCallback(this, { w: this.w, h: this.h });
			}
		);
		this.hBox = new Textbox(
			gui,
			'resolutionTextBoxes-Height',
			lang.process('LANG_HEIGHT:', true),
			defH,
			(controller, value) => {
				const pxDim = parseInt(value);
				if (isNaN(pxDim)) {
					return;
				}
				this.h = pxDim;
				resize(this.w, this.h);
				valueCallback(this, { w: this.w, h: this.h });
			}
		);

		for (const tb of [this.wBox, this.hBox]) {
			tb.div.parent(this.controllerWrapper);
		}
		this.div.style('display', 'flex');
		this.div.style('flex-direction', 'row');
		this.div.style('gap', '1em');
	}

	setValue(vec) {
		this.value = vec;
		this.wBox.setValue(vec.w);
		this.hBox.setValue(vec.h);
		if (this.doUpdateChangeSet()) changeSet.save();
	}

	setValueOnlyDisplay(w, h) {
		this.wBox.controllerElement.value(w);
		this.hBox.controllerElement.value(h);
	}
}

/**
 * Multi line text area controller.
 * @extends ValuedController
 */
class Textarea extends ValuedController {
	constructor(
		gui,
		name,
		labelStr,
		defaultVal,
		valueCallback,
		setupCallback = undefined
	) {
		super(gui, name, labelStr, setupCallback);
		this.controllerElement = createElement('textarea');
		this.controllerElement.parent(this.controllerWrapper);
		this.controllerElement.html(defaultVal);

		this.controllerElement.elt.oninput = event => {
			const value = event.srcElement.value;
			valueCallback(this, value);
		};
		this.valueCallback = valueCallback;

		this.controllerElement.elt.addEventListener(
			'focusin',
			event => (gui.isTypingText = true)
		);
		this.controllerElement.elt.addEventListener('focusout', event => {
			gui.isTypingText = false;
			const value = event.srcElement.value;
			this.setValue(value);
		});
	}

	setValue(value) {
		this.value = value;
		this.valueCallback(this, value);
		this.controllerElement.value(value);
		if (this.doUpdateChangeSet()) changeSet.save();
	}

	randomize() {}
}

/**
 * Textarea that accepts and displays colour lists.
 * A list of hex colours, like: "`#ff0000, #00ff00, #0000ff`",
 * will output a `value` of an array of `p5.Color` objects.
 * @extends Textarea
 * @see ColourBoxes
 * @see MultiColourBoxes
 */
class ColourTextArea extends Textarea {
	/**
	 * ColourTextArea constructor.
	 * @param {GUIForP5} gui - The GUI instance.
	 * @param {string} name - The name of the controller.
	 * @param {string} labelStr - The label for the controller.
	 * @param {Array<p5.Color>} colours - The initial list of colours.
	 * @param {function} valueCallback - Callback function for value changes.
	 * @param {function} [setupCallback] - Optional setup callback.
	 * @example
	 * const colourTextArea = new ColourTextArea(
	 * 	gui,
	 * 	'colourTextArea',
	 * 	'Enter colours:',
	 * 	generator.volours,
	 * 	(controller, value) => {
	 * 		console.log('Colours changed:', value);
	 * 	}
	 * );
	 */
	constructor(
		gui,
		name,
		labelStr,
		colours,
		valueCallback,
		setupCallback = undefined
	) {
		const colourList = ColourTextArea.colourListToString(colours);
		super(gui, name, labelStr, colourList, valueCallback, setupCallback);

		this.controllerElement.elt.oninput = event => {
			const value = ColourTextArea.parseColourList(
				event.srcElement.value
			);
			this.valueCallback(this, value);

			this.displayColours(value);
		};

		this.displayColours(colours);
	}

	displayColours(colours) {
		if (this.disp) this.disp.elt.remove();

		this.disp = createDiv();
		this.disp.class('colour-text-area-display');
		this.disp.parent(this.div);
		for (let col of colours) {
			let colBlock = createDiv();
			colBlock.class('colour-text-area-block');
			colBlock.style('background-color', colorToHexString(col));
			colBlock.parent(this.disp);
		}
	}

	static colourListToString(colours) {
		return colours.map(c => colorToHexString(c).toUpperCase()).join(',');
	}

	static parseColourList(str) {
		return str
			.split(',')
			.map(cstr => cstr.trim())
			.filter(cstr => cstr.length == 7 && cstr[0] == '#')
			.map(cstr => color(cstr));
	}
}

/**
 * Side by side incrementer & decrementer button for a number
 * @extends ValuedController
 */
class Crementer extends ValuedController {
	/**
	 * Crementer constructor
	 * @param {GUIForP5} gui
	 * @param {string} name
	 * @param {string} labelStr
	 * @param {number} minVal
	 * @param {number} maxVal
	 * @param {number} defaultVal
	 * @param {number} stepSize
	 * @param {ValueCallback} valueCallback
	 * @param {SetupCallback} [setupCallback]
	 */
	constructor(
		gui,
		name,
		labelStr,
		minVal,
		maxVal,
		defaultVal,
		stepSize,
		valueCallback,
		setupCallback = undefined
	) {
		super(gui, name, labelStr, setupCallback);
		this.minVal = minVal;
		this.maxVal = maxVal;
		this.defaultVal = defaultVal;
		this.stepSize = stepSize;
		this.valueCallback = valueCallback;

		this.controllerElement = createDiv();
		this.controllerElement.class('crementer');
		this.controllerElement.parent(this.controllerWrapper);

		const minusButton = createButton('&#xE1D2'); // left arrow
		minusButton.parent(this.controllerElement);
		minusButton.elt.onclick = () => this.decrement();

		this.valueDisplay = createSpan(defaultVal);
		this.valueDisplay.parent(this.controllerElement);

		const plusButton = createButton('&#x2192'); // right arrow
		plusButton.parent(this.controllerElement);
		plusButton.elt.onclick = () => this.increment();

		this.setValue(defaultVal);
	}

	mod(value) {
		const modSize = this.maxVal - this.minVal + 1; // [min,max] inclusive
		return ((value - this.minVal + modSize) % modSize) + this.minVal;
	}

	increment() {
		this.setValue(this.mod(this.value + this.stepSize));
	}

	decrement() {
		this.setValue(this.mod(this.value - this.stepSize));
	}

	setValue(value) {
		this.value = constrain(value, this.minVal, this.maxVal);
		this.valueDisplay.html(this.value);
		this.valueCallback(this, this.value);
		if (this.doUpdateChangeSet()) changeSet.save();
	}

	randomize() {
		let randomValue = random(this.minVal, this.maxVal);
		randomValue = round(randomValue / this.stepSize) * this.stepSize;
		this.setValue(randomValue);
	}
}
