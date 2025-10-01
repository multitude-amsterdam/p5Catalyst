import { Controller } from '../gui/components/Controller';
import { ValuedController } from '../gui/components/ValuedController';
import type { GUIForP5 } from '../gui/GUIForP5';
import type { Plugin, Config, GUIControllerInterface, State } from '../types';

export function randomizerPlugin(controllerNames: string[]): Plugin {
	return {
		name: 'randomizer',

		beforeInit: (config: Config) => {
			config.createRandomizer = true;
		},

		setup: (gui: GUIControllerInterface, state: State) => {},

		afterInit: (gui: GUIForP5) => {
			const controllers: Controller[] =
				gui.getControllers(controllerNames);
			controllers.forEach(controller => {
				gui.randomizer?.addController(controller);
			});
		},
	};
}
