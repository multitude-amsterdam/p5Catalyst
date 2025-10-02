import { Controller } from '../gui/components/Controller';
import { ValuedController } from '../gui/components/ValuedController';
import type { CatalystGUI } from '../gui/CatalystGUI';
import type { Plugin, Config, ExtensibleP5 } from '../types';

export function randomizerPlugin(controllerNames: string[]): Plugin {
	return {
		name: 'randomizer',

		beforeGuiExists: (sketch: ExtensibleP5, config: Config) => {
			config.doCreateRandomizer = true;
		},

		afterUserCreatesGui: (
			gui: CatalystGUI,
			sketch: ExtensibleP5,
			config: Config
		) => {
			for (let controller of gui.getControllers(controllerNames)) {
				gui.randomizer?.addController(controller);
			}
		},
	};
}
