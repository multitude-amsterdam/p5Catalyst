import type Controller from '../gui/controller';
import type GUIForP5 from '../gui/gui';
import type { Plugin, Config, GUIControllerInterface, State } from '../types';

export const randomizerPlugin: Plugin = (controllerNames: string[]) => ({
	name: 'randomizer',
	beforeInit: (config: Config) => {
		config.createRandomizer = true;
	},
	setup: (gui: GUIControllerInterface, state: State) => {
		const randomizerButton = gui.addButton(
			'randomizer',
			'LANG_RANDOMIZE',
			controller => {
				gui.randomize();
			}
		);
	},
	afterInit: (gui: GUIForP5) => {
		const controllers: Controller[] = gui.getControllers(controllerNames);
		controllers.forEach(controller => {
			gui.randomizer?.addController(controller, true);
		});
	},
});
