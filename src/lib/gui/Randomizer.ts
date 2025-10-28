import type { ExtensibleP5 } from '../types';
import { Controller, ValuedController, Button, DieIcon } from './components';

/**
 * Helper class that manages randomization of controllers marked as randomizable.
 * Handles toggling, adding/removing controllers, and triggering randomization.
 */
export class Randomizer {
	controllers: Controller[];
	sketch: ExtensibleP5;
	/**
	 * Constructs a new Randomizer instance.
	 */
	constructor(sketch: ExtensibleP5) {
		/**
		 * @type {Controller[]}
		 */
		this.controllers = [];
		this.sketch = sketch;
	}

	/**
	 * Adds a controller to the randomizer and attaches a DieIcon.
	 * @param {Controller} controller - The controller to add.
	 */
	addController(controller: Controller) {
		this.controllers.push(controller);
		let die = new DieIcon(this, controller);
		controller.addDie(die);
	}

	/**
	 * Removes a controller from the randomizer.
	 * @param {Controller} controller - The controller to remove.
	 */
	removeController(controller: Controller) {
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
		const panels = gui.tabs.length > 0 ? gui.activeTab!.panels : gui.panels;
		const controllerPool =
			panels.length > 0
				? panels
						.filter(panel => panel.isOpen() && !panel.isHidden())
						.map(panel => panel.controllers)
						.flat()
				: gui.controllers;
		const controllersToRandomize = controllerPool.filter(
			controller =>
				controller.die?.isActive === true && !controller.isHidden()
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
	toggleDoRandomize(die: DieIcon) {
		die.toggle();
	}
}
