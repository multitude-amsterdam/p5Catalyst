import type { ExtensibleP5 } from './lib/Catalyst';
import type { CatalystGUI } from './lib/CatalystGUI';

import type { Plugin } from './lib/types';

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
