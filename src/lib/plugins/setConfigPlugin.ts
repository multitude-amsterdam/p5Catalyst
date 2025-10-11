import type { Plugin, UserConfig } from '../types';

export function setConfigPlugin(userConfig: UserConfig): Plugin {
	return {
		name: 'setConfig',
		beforeGuiExists: (sketch, config) => {
			Object.assign(config, userConfig);
		},
	};
}
