import type { ExtensibleP5 } from './lib/Catalyst';
import type { CatalystGUI } from './lib/CatalystGUI';

export interface Plugin {
	name: string;
	beforeCreateGui?: (gui: CatalystGUI, sketch: ExtensibleP5) => void;
	afterCreateGui?: (gui: CatalystGUI, sketch: ExtensibleP5) => void;
}

export const plugins: Plugin[] = [
	{
		name: 'test',

		beforeCreateGui: () => {
			console.log('beforeCreateGui!');
		},

		afterCreateGui: () => {
			console.log('afterCreateGui!');
		},
	},
];
