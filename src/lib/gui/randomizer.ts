import type p5 from 'p5';
import type { Controller } from './controller';
import { Button, DieIcon } from './components';
import { ValuedController } from './valued_controller';

/**
 * Helper class that manages randomization of controllers marked as randomizable.
 * Handles toggling, adding/removing controllers, and triggering randomization.
 */
export class Randomizer {
	controllers: Controller[];
	p5Instance: p5;
	/**
	 * Constructs a new Randomizer instance.
	 */
	constructor(p5Instance: p5) {
		/**
		 * @type {Controller[]}
		 */
		this.controllers = [];
		this.p5Instance = p5Instance;
	}

	/**
	 * Adds a controller to the randomizer and attaches a DieIcon.
	 * @param {Controller} controller - The controller to add.
	 * @param {boolean} doRandomize - Whether this controller should be randomized.
	 */
	addController(controller: Controller, doRandomize: boolean) {
		this.controllers.push(controller);
		let die = new DieIcon(this, controller, doRandomize);
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
		const controllersToRandomize = this.controllers.filter(
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
		// // todo: replace with .find()
		// let index = this.controllers.map(c => c.die).indexOf(die);
		// if (index < 0) {
		// 	console.error('Die not in list.', controller);
		// 	return;
		// }
		// this.controllers[index].die.isActive =
		// 	this.controllers[index].die.isActive !== true;
		// die.setActive(this.controllers[index].die.isActive);
		die.toggle();
	}
}
