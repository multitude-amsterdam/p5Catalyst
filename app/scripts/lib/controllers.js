
class Controller extends Field {
	static _doUpdateChangeSet = true;
	_doUpdateChangeSet = true;

	controllerElement = null;
	doRandomize = undefined;

	constructor(gui, name, labelStr, setupCallback=undefined) {
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

	setup() {
		this.createConsole();
		this.setupCallback(this);
	}


	disable() {
		if (this.controllerElement instanceof p5.Element)
			this.controllerElement.elt.disabled = true;
		else
			this.controllerElement.disabled = true;
	}

	enable() {
		if (this.controllerElement instanceof p5.Element)
			this.controllerElement.elt.disabled = false;
		else
			this.controllerElement.disabled = false;
	}

	isDisabled() {
		if (this.controllerElement instanceof p5.Element)
			return this.controllerElement.elt.disabled;
		else
			return this.controllerElement.disabled;
	}

	setDisabled(doSetDisabled) {
		doSetDisabled ? this.disable() : this.enable();
	}


	createConsole() {
		this.console = createDiv();
		this.console.parent(this.div);
		this.console.class('gui-console');
		this.console.hide();
	}

	setConsole(text, type) {
		if (text === undefined) {
			this.consoleText = undefined;
			this.console.hide();
			this.console.html('');
			this.console.class('gui-console');
			return;
		}

		if (type === undefined)
			text = '🔺 ' + text; 
		
		this.consoleText = text;
		this.console.class('gui-console');
		this.console.addClass('gui-console-' + type);
		this.console.html(text);
		this.console.show();
	}

	setError(text) {
		this.setConsole('❌ ' + text, 'error');
	}

	setWarning(text) {
		this.setConsole('⚠️ ' + text, 'warning');
	}


	addToRandomizer(randomizer) {
		randomizer.addController(this);
	}

	addDie(die) {
		die.img.parent(this.controllerWrapper);
		this.die = die;
	}


	doUpdateChangeSet() {
		return changeSet !== undefined 
			&& this._doUpdateChangeSet 
			&& Controller._doUpdateChangeSet;
	}
}



class ValuedController extends Controller {
	constructor(gui, name, labelStr, setupCallback=undefined) {
		super(gui, name, labelStr, setupCallback);
	}

	setValue(value) {
		this.value = value;
		if (this.doUpdateChangeSet()) changeSet.save();
	}

	randomize() {
		console.error('No randomize() method.');
	}

	getValueForJSON() {
		// if (this.value.mode && this.value.levels) {
		// 	// p5.Color
		// 	return {
		// 		mode: this.value.mode,
		// 		levels: this.value.levels
		// 	};
		// }
		return this.value;
	}
}



class Button extends Controller {
	constructor(gui, name, labelStr, callback, setupCallback=undefined) {
		super(gui, name, undefined, setupCallback);
		labelStr = lang.process(labelStr, true);
		this.controllerElement = createButton(labelStr);
		this.controllerElement.parent(this.controllerWrapper);
		this.controllerElement.elt.onclick = () => {
			callback(this);
			if (this.doUpdateChangeSet()) changeSet.save();
		};
	}

	click() {
		this.controllerElement.elt.onclick();
	}
}



class FileLoader extends Button {
	constructor(gui, name, fileType, labelStr, fileReadyCallback, valueCallback, setupCallback=undefined) {
		super(gui, name, labelStr, () => {
				this.controllerElement.elt.click();
			},
			setupCallback
		);
		this.fileType = fileType;

		this.callback = (value) => {
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

class TextFileLoader extends FileLoader {
	constructor(gui, name, labelStr, valueCallback, setupCallback=undefined) {
		super(gui, name, 'text', labelStr, (file) => {}, valueCallback, setupCallback);
		this.controllerElement.elt.accept = '.txt';
	}
}

class JSONFileLoader extends FileLoader {
	constructor(gui, name, labelStr, valueCallback, setupCallback=undefined) {
		super(gui, name, 'json', labelStr, (file) => {}, valueCallback, setupCallback);
		this.controllerElement.elt.accept = '.json';
	}
}

class ImageLoader extends FileLoader {
	constructor(gui, name, labelStr, valueCallback, setupCallback=undefined) {
		super(
			gui, name, 'image', labelStr, 
			(file) => {
				this.img = createImg(file.data, '');
				this.img.hide();
				this.file = this.img;
			},
			valueCallback, setupCallback
		);
		this.controllerElement.elt.accept = '.jpg,.png,.gif,.tif';
	}
}



class Toggle extends ValuedController {
	constructor(gui, name, labelStr0, labelStr1, isToggled, callback, setupCallback=undefined) {
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

	click() {
		this.controllerElement.elt.onmousedown();
	}

	setValue(value) {
		if (value != this.value)
			this.controllerElement.elt.toggleAttribute('toggled');
		this.value = value;
		this.callback(this, this.value);
		if (this.doUpdateChangeSet()) changeSet.save();
	}

	randomize() {
		this.setValue(random(1) < 0.5);
	}
}



class Select extends ValuedController {
	constructor(gui, name, labelStr, options, defaultIndex, valueCallback, setupCallback=undefined) {
		super(gui, name, labelStr, setupCallback);
		
		this.controllerElement = createSelect(); // (add true for multiple selections)
		this.setOptions(options);

		const callback = (event) => {
			const valueStr = event.srcElement.value;
			const ind = this.optionStrs.indexOf(valueStr);
			this.value = this.options[ind];
			valueCallback(this, this.value);
		};
		this.controllerElement.elt.onchange = callback;
		this.valueCallback = valueCallback;
		this.setValue(options[defaultIndex]);
	}

	setOptions(options) {
		this.controllerElement.elt.replaceChildren();
		this.controllerElement.parent(this.controllerWrapper);
		this.options = options;
		this.optionStrs = options.map(option => this.optionToString(option));
		for (const optionStr of this.optionStrs) 
			this.controllerElement.option(optionStr);
		this.afterSetOptions();
	}

	optionToString(optionString) {
		return optionString;
	}

	afterSetOptions() {}

	hasOption(option) {
		return this.options.some(o => o == option);
	}
	hasOptionStr(optionStr) {
		return this.optionStrs.some(os => os == optionStr);
	}

	setValue(option) {
		if (!this.hasOption(option)) {
			throw new Error(option + ' was not found in options.');
			return;
		}
		this.value = option;
		const optStr = this.optionStrs[this.options.indexOf(option)];
		this.controllerElement.selected(optStr);
		this.valueCallback(this, option);
		if (this.doUpdateChangeSet()) changeSet.save();
	}

	randomize() {
		this.setValue(random(this.options));
	}
}



class ResolutionSelect extends Select {
	constructor(gui, labelStr, defaultIndex, valueCallback, setupCallback=undefined) {
		super(gui, 'resolutionSelect', labelStr, resolutionOptions, defaultIndex, 
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



class Slider extends ValuedController {
	constructor(gui, name, labelStr, minVal, maxVal, defaultVal, stepSize, 
		valueCallback, setupCallback=undefined) {
		super(gui, name, labelStr, setupCallback);
		this.controllerElement = createSlider(minVal, maxVal, defaultVal, stepSize);
		this.controllerElement.parent(this.controllerWrapper);
		this.minVal = minVal;
		this.maxVal = maxVal;
		this.defaultVal = defaultVal;
		this.stepSize = stepSize;

		const callback = (event) => {
			const value = parseFloat(event.srcElement.value);
			valueCallback(this, value);
		};
		this.controllerElement.elt.onchange = callback;
		this.controllerElement.elt.oninput = callback;
		valueCallback(this, defaultVal);
		this.valueCallback = valueCallback;
	}

        validateValue(v) {
                if (typeof v !== 'number' || Number.isNaN(v)) {
                        throw new Error(v + ' is not a number');
                }
                return v;
        }

	setValue(v) {
		// if (abs(v - this.defaultVal) < (this.maxVal - this.minVal) * 0.0167) 
		// 	v = this.defaultVal;
		v = round(v / this.stepSize) * this.stepSize;
		this.valueCallback(this, v);
		this.controllerElement.value(v);
		if (this.doUpdateChangeSet()) changeSet.save();
	}

	randomize() {
		this.setValue(random(this.minVal, this.maxVal));
	}
}



class XYSlider extends ValuedController {
	constructor(gui, name, labelStr, 
		minValX, maxValX, defaultValX, stepSizeX, 
		minValY, maxValY, defaultValY, stepSizeY, 
		valueCallback, setupCallback=undefined) {
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
		this.controllerElement.elt.addEventListener('mousedown', (e) => {
			this.isDragging = true;
			this._doUpdateChangeSet = false;
		});
		handle.elt.addEventListener('mousedown', (e) => {
			this.isDragging = true;
			this._doUpdateChangeSet = false;
		});
		handle.elt.addEventListener('mouseup', (e) => {
			this.isDragging = false;
			this._doUpdateChangeSet = true;
			this.setValue(this.getValueFromHandlePosition(e));
		});
		document.addEventListener('mousemove', (e) => {
			if (!this.isDragging) return;
			this.setValue(this.getValueFromHandlePosition(e));
		});

		this.setValue({x: this.defaultValX, y: this.defaultValY});
	}

	getValueFromHandlePosition(mouseEvent) {
		const compStyle = window.getComputedStyle(this.controllerElement.elt);
		const borderW = parseFloat(compStyle.borderWidth);

		const rect = this.controllerElement.elt.getBoundingClientRect();
		rect.width -= borderW * 2;
		rect.height -= borderW * 2;

		let x = mouseEvent.clientX - rect.left - this.handle.elt.offsetWidth / 2;
		let y = mouseEvent.clientY - rect.top - this.handle.elt.offsetHeight / 2;

		const handleW = this.handle.elt.offsetWidth;
		const handleH = this.handle.elt.offsetHeight;
		x = constrain(x, -handleW/2, rect.width - handleW/2);
		y = constrain(y, -handleH/2, rect.height - handleH/2);

		let normX = map(x, -handleW/2, rect.width - handleW/2, -1, 1);
		let normY = map(y, -handleH/2, rect.height - handleH/2, -1, 1);

		if (abs(normX) < 0.033) normX = 0;
		if (abs(normY) < 0.033) normY = 0;

		const nStepsX = round((this.maxValX - this.minValX) / this.stepSizeX);
		const valX = this.minValX + round((normX * 0.5 + 0.5) * nStepsX) / nStepsX * (this.maxValX - this.minValX);
		const nStepsY = round((this.maxValY - this.minValY) / this.stepSizeY);
		const valY = this.minValY + round((normY * 0.5 + 0.5) * nStepsY) / nStepsY * (this.maxValY - this.minValY);

		print(normX, normY)

		return {x: valX, y: valY};
	}

	setValue(vec) {
		if (vec.x === undefined || vec.y === undefined) {
			console.error('Value must be a vector {x: X, y: Y}, not this: ', vec);
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
		const feedbackX = map(this.value.x, this.minValX, this.maxValX, -handleW/2, rect.width - handleW/2);
		const feedbackY = map(this.value.y, this.minValY, this.maxValY, -handleH/2, rect.height - handleH/2);

		this.handle.elt.style.left = `${feedbackX}px`;
		this.handle.elt.style.top = `${feedbackY}px`;
	}
}



class ColourBoxes extends ValuedController {
	constructor(gui, name, labelStr, colours, defaultIndex, 
		valueCallback, setupCallback=undefined) {
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
			elt.onclick = (evt) => {
				this.setValue(this.colours[parseInt(elt.value)]);
			};
		};

		this.colours = colours;
		this.controllerElement = radio;
	}

    setValue(colObj) {
        if (!(colObj instanceof p5.Color))
            throw new Error(colObj + ' is not a p5.Color.');

		const index = this.colours.findIndex((col) =>
			isArraysEqual(col.levels, colObj.levels)
		);

		this.valueIndex = index;
		this.value = this.colours[index];
		this.controllerElement.selected('' + index);
		this.valueCallback(this, this.value);
		if (this.doUpdateChangeSet()) changeSet.save();
	}

	randomize() {
		this.setValue(random(this.colours));
	}
}



class Textbox extends ValuedController {
	constructor(gui, name, labelStr, defaultVal, valueCallback, setupCallback=undefined) {
		super(gui, name, labelStr, setupCallback);
		this.controllerElement = createInput();
		this.controllerElement.parent(this.controllerWrapper);

		this.controllerElement.elt.oninput = (event) => {
			const value = event.srcElement.value;
			valueCallback(this, value);
		};

		this.valueCallback = valueCallback;
		
		this.controllerElement.elt.addEventListener("focusin", (event) => gui.isTypingText = true);
		this.controllerElement.elt.addEventListener("focusout", (event) => gui.isTypingText = false);
	}

	setValue(v) {
		this.valueCallback(this, v);
		this.controllerElement.value(v);
		if (this.doUpdateChangeSet()) changeSet.save();
	}

	randomize() {}
}



class ResolutionTextboxes extends ValuedController {
	constructor(gui, defW, defH, valueCallback, setupCallback=undefined) {
		super(gui, 'resolutionTextboxes', undefined, setupCallback);
		this.w = defW;
		this.h = defH;
		this.wBox = new Textbox(gui,
			'resolutionTextBoxes-Width',
			// lang.process('↔️ LANG_WIDTH:', true), 
			lang.process('LANG_WIDTH:', true), 
			defW, 
			(controller, value) => {
				const pxDim = parseInt(value);
				if (isNaN(pxDim)) {
					return;
				}
				this.w = pxDim;
				resize(this.w, this.h);
				valueCallback(this, {w: this.w, h: this.h});
			}
		);
		this.hBox = new Textbox(gui,
			'resolutionTextBoxes-Height',
			// lang.process('↕️ LANG_HEIGHT:', true), 
			lang.process('LANG_HEIGHT:', true), 
			defH, 
			(controller, value) => {
				const pxDim = parseInt(value);
				if (isNaN(pxDim)) {
					return;
				}
				this.h = pxDim;
				resize(this.w, this.h);
				valueCallback(this, {w: this.w, h: this.h});
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



class Textarea extends ValuedController {
	constructor(gui, name, labelStr, defaultVal, valueCallback, setupCallback=undefined) {
	super(gui, name, labelStr, setupCallback);
	this.controllerElement = createElement('textarea');
	this.controllerElement.parent(this.controllerWrapper);
	this.controllerElement.html(defaultVal);

	this.controllerElement.elt.oninput = (event) => {
			const value = event.srcElement.value;
			valueCallback(this, value);
		};
		this.valueCallback = valueCallback;

	this.controllerElement.elt.addEventListener("focusin", (event) => gui.isTypingText = true);
		this.controllerElement.elt.addEventListener("focusout", (event) => gui.isTypingText = false);
	}

	setValue(v) {
		this.valueCallback(this, v);
		this.controllerElement.value(v);
	}

	randomize() {}
}



class ColourTextArea extends Textarea {
	constructor(gui, name, labelStr, colours, valueCallback, setupCallback=undefined) {
		const colourList = ColourTextArea.colourListToString(colours);
		super(gui, name, labelStr, colourList, valueCallback, setupCallback);

		this.controllerElement.elt.oninput = (event) => {
			const value = ColourTextArea.parseColourList(event.srcElement.value);
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
		return str.split(',')
			.map(cstr => cstr.trim())
			.filter(cstr => cstr.length == 7 && cstr[0] == '#')
			.map(cstr => color(cstr));
	}
}


