import type p5 from 'p5';
import type {
	Config,
	ControllerValue,
	Serializable,
	LangCode,
	ExtensibleP5,
	valueCallback,
	setupCallback,
	fileReadyCallback,
	controllerCallback,
} from '../types';

import {
	Field,
	Controller,
	ValuedController,
	CommandBar,
	Tab,
} from './components';

import * as Components from './components';

import { Lang } from '../language';

import { ChangeSet } from './ChangeSet';
import { Randomizer } from './Randomizer';
import { Dialog } from './Dialog';

import type { Orientation } from './components/groups';

export class CatalystGUI {
	sketch: ExtensibleP5;

	div: p5.Element;

	fields: Field[] = [];
	controllers: Controller[] = [];

	tabs: Tab[] = [];
	tabBar?: p5.Element;
	activeTab?: Tab;

	randomizer?: Randomizer;
	lang: Lang;
	dialog: Dialog;
	isOnLeftSide: boolean = true;
	isTypingText: boolean = false;

	darkMode: 'true' | 'false' | 'auto';
	changeSet: ChangeSet;

	commandBar: CommandBar;

	constructor(sketch: ExtensibleP5, config: Config) {
		this.sketch = sketch;

		this.div = sketch.createDiv();
		this.div.id('gui');
		(document.querySelector('main') as HTMLElement).prepend(this.div.elt);

		window.addEventListener('keyup', (e: KeyboardEvent) => {
			this.handleKeyboardEvent(e);
		});

		this.lang = new Lang(config.userDictionary);
		this.lang.setup(config.defaultLanguage as LangCode);

		this.changeSet = new ChangeSet(this, false);

		this.darkMode = 'false';

		if (config.doCreateRandomizer) {
			this.randomizer = new Randomizer(sketch);
		}

		this.dialog = new Dialog(this);

		this.commandBar = new CommandBar(config, this);

		this.setLeft();
	}

	/**
	 * Calls setup on all controllers.
	 */
	finalize() {
		for (let controller of this.controllers) {
			controller.setup();
		}

		this.changeSet.save();

		if (localStorage.doShowHelpOnLoad === 'true' || undefined) {
			this.showHelp();
			localStorage.doShowHelpOnLoad = 'false';
		}
	}

	handleKeyboardEvent(event: KeyboardEvent) {
		if (event.key === 'h') {
			this.showHelp();
		}
	}

	showHelp() {
		this.dialog.alert('LANG_HELPME_MSG');
	}

	/**
	 * Moves the GUI to the left side of the main container.
	 */
	setLeft() {
		const main = document.querySelector('main');
		if (main) {
			main.className = 'gui-left';
		}
		this.isOnLeftSide = true;
	}

	/**
	 * Moves the GUI to the right side of the main container.
	 */
	setRight() {
		const main = document.querySelector('main');
		if (main) {
			main.className = 'gui-right';
		}
		this.isOnLeftSide = false;
	}

	addField<T extends Field>(field: T) {
		this.fields.push(field);
		return field;
	}

	addController<T extends Controller>(controller: T) {
		this.addField(controller);
		this.controllers.push(controller);
		return controller;
	}

	addTabs(...names: string[]): Tab[] {
		if (this.tabs.length === 0) {
			this.tabs = [];
			// this.activeTab = null;
			this.tabBar = this.sketch.createDiv();
			this.tabBar.addClass('tab-bar');
			this.div.child(this.tabBar);
		}

		let newTabs: Tab[] = [];

		for (const [index, name] of names.entries()) {
			const tab = new Tab(this, name);
			newTabs.push(tab);
			this.tabs.push(tab);

			this.div.child(tab.div);
			tab.hide();

			const tabBtn = this.sketch.createButton(
				tab.name.charAt(0).toUpperCase() + tab.name.slice(1)
			);

			if (index == 0) tabBtn.addClass('active');

			tabBtn.mousePressed(() => this.activateTab(tab.name));
			this.tabBar?.child(tabBtn);
		}

		if (this.tabs.length > 0) {
			this.activateTab(this.tabs[0].name);
		}

		return newTabs;
	}

	activateTab(tabName: string) {
		const tabToShow = this.getTab(tabName);
		if (!tabToShow) return;

		for (let tab of this.tabs) {
			tab.hide();
		}

		tabToShow.show();
		this.activeTab = tabToShow;

		const buttons = this.tabBar?.elt.querySelectorAll('button');
		for (let [i, button] of buttons.entries()) {
			button.classList.toggle('active', tabName === this.tabs[i].name);
		}
	}

	getTab(name: string): Tab | undefined {
		const tab = this.tabs.find(tab => tab.name === name);
		return tab;
	}

	/**
	 * Checks if a controller with the given name exists.
	 * @param {string} name
	 * @returns {boolean}
	 */
	hasName(name: string): boolean {
		return this.controllers.some(controller => controller.name === name);
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
	 */
	getControllers(names: string[]): Controller[] {
		return this.controllers.filter(controller =>
			names.some(name => {
				if (!this.hasName(name)) {
					return false;
				}
				return controller.name === name;
			})
		);
	}

	/**
	 * Gets the current state of all controllers with values.
	 */
	getState(): Serializable[] {
		return this.controllers
			.filter(controller => controller instanceof ValuedController)
			.map(valuedController => {
				const serializable: Serializable = {
					name: valuedController.name,
					value: valuedController.getSerializedValue(),
				};
				if (valuedController.die !== undefined)
					serializable.isDieActive = valuedController.die.isActive;
				return serializable;
			});
	}

	/**
	 * Restores the state of controllers from a saved state.
	 */
	restoreState(serializedState: Serializable[]) {
		Controller._doUpdateChangeSet = false;
		for (let {
			name,
			value: serializedValue,
			isDieActive,
		} of serializedState) {
			if (serializedValue === undefined) continue;

			const controller = this.getController(name);
			if (controller instanceof ValuedController) {
				controller.restoreValueFromSerialized(serializedValue);
			}
			if (isDieActive === undefined) continue;
			controller?.die?.setActive(isDieActive);
		}
		Controller._doUpdateChangeSet = true;
	}

	resetToDefaults() {
		for (let controller of this.controllers) {
			if (!(controller instanceof ValuedController)) continue;
			if (controller.value === null) continue;
			controller.setValue(controller.defaultValue as ControllerValue);
		}
	}

	addPanel(name: string, isOpen: boolean) {
		const panel = new Components.Panel(gui, name, isOpen);

		return gui.addField(panel);
	}

	addGroup(name: string, orientation: Orientation) {
		const group = new Components.Group(gui, name, orientation);
		return gui.addField(group);
	}

	addTitle(headerSize: number, text: string) {
		const title = new Components.Title(gui, headerSize, text);
		return gui.addField(title);
	}

	addTextField(text: string, className: string, doAlignCenter = false) {
		const textField = new Components.TextField(
			gui,
			text,
			className,
			doAlignCenter
		);
		return gui.addField(textField);
	}
	addImageField(url: string, altText: string, doAlignCenter = false) {
		const imageField = new Components.ImageField(
			gui,
			url,
			altText,
			doAlignCenter
		);
		return gui.addField(imageField);
	}
	addDivider() {
		const divider = new Components.Divider(gui);
		return gui.addField(divider);
	}
	addButton(
		name: string,
		labelStr: string,
		controllerCallback?: controllerCallback,
		setupCallback?: setupCallback
	) {
		const button = new Components.Button(
			gui,
			name,
			labelStr,
			controllerCallback,
			setupCallback
		);
		return gui.addController(button);
	}
	addSelect(
		name: string,
		labelStr: string,
		options: string[],
		defaultIndex: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		const select = new Components.Select(
			gui,
			name,
			labelStr,
			options,
			defaultIndex,
			valueCallback,
			setupCallback
		);
		return gui.addController(select);
	}
	addResolutionSelect(
		labelStr: string,
		resolutionOptions: string[],
		defaultIndex: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		const resolutionSelect = new Components.ResolutionSelect(
			gui,
			labelStr,
			resolutionOptions,
			defaultIndex,
			valueCallback,
			setupCallback
		);
		return gui.addController(resolutionSelect);
	}
	addToggle(
		name: string,
		labelStr0: string,
		labelStr1: string,
		isToggled: boolean,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		const toggle = new Components.Toggle(
			gui,
			name,
			labelStr0,
			labelStr1,
			isToggled,
			valueCallback,
			setupCallback
		);
		return gui.addController(toggle);
	}
	addSlider(
		name: string,
		labelStr: string,
		minVal: number,
		maxVal: number,
		defaultVal: number,
		stepSize: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		const slider = new Components.Slider(
			gui,
			name,
			labelStr,
			minVal,
			maxVal,
			defaultVal,
			stepSize,
			valueCallback,
			setupCallback
		);
		return gui.addController(slider);
	}
	addXYSlider(
		name: string,
		labelStr: string,
		minValX: number,
		maxValX: number,
		defaultValX: number,
		stepSizeX: number,
		minValY: number,
		maxValY: number,
		defaultValY: number,
		stepSizeY: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		const xySlider = new Components.XYSlider(
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
			setupCallback
		);

		return gui.addController(xySlider);
	}
	addTextbox(
		name: string,
		labelStr: string,
		defaultVal: string,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		const textbox = new Components.Textbox(
			gui,
			name,
			labelStr,
			defaultVal,
			valueCallback,
			setupCallback
		);
		return gui.addController(textbox);
	}

	addResolutionTextBoxes(
		defaulWidth: number,
		defaultHeight: number,
		valueCallback: valueCallback
	) {
		const resbox = new Components.ResolutionTextBoxes(
			gui,
			defaulWidth,
			defaultHeight,
			valueCallback
		);
		return gui.addController(resbox);
	}

	addTextArea(
		name: string,
		labelStr: string,
		defaultVal: string,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		const textarea = new Components.TextArea(
			gui,
			name,
			labelStr,
			defaultVal,
			valueCallback,
			setupCallback
		);
		return gui.addController(textarea);
	}

	addCrementer(
		name: string,
		labelStr: string,
		minVal: number,
		maxVal: number,
		defaultVal: number,
		stepSize: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		const crementer = new Components.Crementer(
			gui,
			name,
			labelStr,
			minVal,
			maxVal,
			defaultVal,
			stepSize,
			valueCallback,
			setupCallback
		);
		return gui.addController(crementer);
	}

	addColorBoxes(
		name: string,
		labelStr: string,
		colors: string[],
		defaultIndex: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		const colourBoxes = new Components.ColorBoxes(
			gui,
			name,
			labelStr,
			colors,
			defaultIndex,
			valueCallback,
			setupCallback
		);
		return gui.addController(colourBoxes);
	}

	addMultiColorBoxes(
		name: string,
		labelStr: string,
		colors: string[],
		defaultIndices: number[],
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		const multiColourBoxes = new Components.MultiColorBoxes(
			gui,
			name,
			labelStr,
			colors,
			defaultIndices,
			valueCallback,
			setupCallback
		);

		return gui.addController(multiColourBoxes);
	}

	addTextLoader(
		name: string,
		labelStr: string,
		fileReadyCallback?: fileReadyCallback,
		setupCallback?: setupCallback
	) {
		const textLoader = new Components.TextFileLoader(
			gui,
			name,
			labelStr,
			fileReadyCallback,
			setupCallback
		);
		return gui.addController(textLoader);
	}

	addJSONLoader(
		name: string,
		labelStr: string,
		fileReadyCallback?: fileReadyCallback,
		setupCallback?: setupCallback
	) {
		const JSONLoader = new Components.JSONFileLoader(
			gui,
			name,
			labelStr,
			fileReadyCallback,
			setupCallback
		);
		return gui.addController(JSONLoader);
	}

	addImageLoader(
		name: string,
		labelStr: string,
		fileReadyCallback?: fileReadyCallback,
		setupCallback?: setupCallback
	) {
		const imageLoader = new Components.ImageLoader(
			gui,
			name,
			labelStr,
			fileReadyCallback,
			setupCallback
		);
		return gui.addController(imageLoader);
	}

	addVideoLoader(
		name: string,
		labelStr: string,
		fileReadyCallback?: fileReadyCallback,
		setupCallback?: setupCallback
	) {
		const videoLoader = new Components.VideoLoader(
			gui,
			name,
			labelStr,
			fileReadyCallback,
			setupCallback
		);
		return gui.addController(videoLoader);
	}

	addMediaLoader(
		name: string,
		labelStr: string,
		fileReadyCallback?: fileReadyCallback,
		setupCallback?: setupCallback
	) {
		const mediaLoader = new Components.MediaLoader(
			gui,
			name,
			labelStr,
			fileReadyCallback,
			setupCallback
		);
		return gui.addController(mediaLoader);
	}
}
