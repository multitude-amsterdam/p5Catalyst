import type { Plugin, Config, UserConfig } from '../types';

export function setConfigPlugin(userConfig: UserConfig): Plugin {
	return {
		name: 'setConfig',
		beforeInit: (config: Config) => {
			Object.assign(config, userConfig);
		},
	};
}
