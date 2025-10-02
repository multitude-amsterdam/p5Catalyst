import type { Plugin } from '../types';

export function randomizerPlugin(controllerNames: string[]): Plugin {
	return {
		name: 'randomizer',

		beforeGuiExists: (sketch, config) => {
			config.doCreateRandomizer = true;
		},

		afterUserCreatesGui: (gui, sketch, config) => {
			for (let controller of gui.getControllers(controllerNames)) {
				gui.randomizer?.addController(controller);
			}
		},
	};
}
