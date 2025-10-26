import type { Plugin } from '../types';

export function webglMode(doWebglMode = true): Plugin {
	return {
		name: 'webgl-mode',
		beforeGuiExists: (sketch, config) => {
			config.doWebglMode = doWebglMode;
		},
	};
}
