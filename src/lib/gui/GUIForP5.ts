import type p5 from 'p5';

import { Field } from './components/Field';
import { Controller } from './components/Controller';
import { ValuedController } from './components/ValuedController';

import type { State, Config, LangCode } from '../types';
import type { ControllerValue, Serializable } from '../types/controller';
import type { Container, SketchHook } from '../types/construction';

import { Randomizer } from './Randomizer';
import { ChangeSet } from './ChangeSet';
import { Lang } from '../language/Lang';

import { Tab } from './components/groups/Tab';
import { Dialog } from './Dialog';

import { CommandBar } from './components/CommandBar';

/**
 * Main GUI wrapper that manages fields and controllers for p5Catalyst.
 * Handles layout, theming, controller management, and state persistence.
 */
export class GUIForP5 {
	p5Instance: p5;
	state: State;
	sketchHook: SketchHook;

	div: p5.Element;

	fields: Field[] = [];
	controllers: any[] = [];

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

	/**
	 * Constructs the GUI, creates the main div, and sets up theming and layout.
	 */
	constructor(container: Container, config: Config) {
		this.p5Instance = container.p5Instance;
		this.state = container.state;
		this.sketchHook = container.sketchHook;

		this.div = this.p5Instance.createDiv();
		this.div.id('gui');
		(document.querySelector('main') as HTMLElement).prepend(this.div.elt);

		window.addEventListener('keyup', (e: KeyboardEvent) => {
			this.handleKeyboardEvent(e);
		});

		this.lang = new Lang(config.userDictionary);
		this.lang.setup(config.defaultLanguage as LangCode);

		this.changeSet = new ChangeSet(this, false);

		this.darkMode = 'false';

		if (config.createRandomizer) {
			this.randomizer = new Randomizer(this.p5Instance);
		}

		this.dialog = new Dialog(this);

		this.commandBar = new CommandBar(config, this);

		this.setLeft();
	}

	/**
	 * Calls setup on all controllers.
	 */
	setup() {
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
			this.dialog.show();
		}
	}

	showHelp() {
		this.dialog.alert('HELP');
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
			this.tabBar = this.p5Instance.createDiv();
			this.tabBar.addClass('tab-bar');
			this.div.child(this.tabBar);
		}

		let newTabs: Tab[] = [];

		for (const name of names) {
			const tab = new Tab(this, name);
			newTabs.push(tab);
			this.tabs.push(tab);

			this.div.child(tab.div);
			tab.hide();

			const tabBtn = this.p5Instance.createButton(
				tab.name.charAt(0).toUpperCase() + tab.name.slice(1)
			);
			// tabBtn.attribute('data-tabname', tab.name);
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
			.filter(controller => controller.value !== undefined)
			.map(controller => {
				const serializable: Serializable = {
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
}
