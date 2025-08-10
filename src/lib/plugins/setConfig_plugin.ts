import type { Plugin, Config, UserConfig } from '../types';

export const setConfigPlugin: Plugin = (userConfig: UserConfig) => ({
	name: 'setConfig',
	beforeInit: (config: Config) => {
		Object.assign(config, userConfig);
	},
});
