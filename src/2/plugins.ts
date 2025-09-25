import type { ExtensibleP5 } from './lib/Catalyst';
import type { CatalystGUI } from './lib/CatalystGUI';

export interface Plugin {
	name: string;
	postCreateGui?: (gui: CatalystGUI, sketch: ExtensibleP5) => void;
	preCreateGui?: (gui: CatalystGUI, sketch: ExtensibleP5) => void;
}

export const plugins: Plugin[] = [
	{
		name: 'test',
		postCreateGui: () => {
			console.log('postCreateGui!');
		},
		preCreateGui: () => {
			console.log('preCreateGui!');
		},
	},
];
