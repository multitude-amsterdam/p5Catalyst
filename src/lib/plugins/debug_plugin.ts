import type GUIForP5 from '../gui/gui';
import type { Plugin } from '../types';

export const debugPlugin: Plugin = () => ({
	name: 'debug',
	afterInit: (gui: GUIForP5) => {
		(globalThis as any).gui = gui;
		(globalThis as any).state = gui.state;
	},
});
