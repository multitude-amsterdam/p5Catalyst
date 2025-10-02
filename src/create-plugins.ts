import type { ExtensibleP5, Config, Plugin } from './lib/types';
import type { CatalystGUI } from './lib/gui/CatalystGUI';
import { defaultPlugins, setConfigPlugin } from './lib/plugins';

export const plugins: Plugin[] = [
	setConfigPlugin({}),

	...defaultPlugins,
	{
		name: 'test',

		beforeUserCreatesGui: (
			gui: CatalystGUI,
			sketch: ExtensibleP5,
			config?: Config
		) => {
			console.log('beforeUserCreatesGui!');
		},

		afterUserCreatesGui: (
			gui: CatalystGUI,
			sketch: ExtensibleP5,
			config?: Config
		) => {
			console.log('afterUserCreatesGui!');
		},
	},
];
