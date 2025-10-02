import type { Plugin, Config, UserConfig, ExtensibleP5 } from '../types';

export function setConfigPlugin(userConfig: UserConfig): Plugin {
	return {
		name: 'setConfig',
		beforeGuiExists: (sketch: ExtensibleP5, config: Config) => {
			Object.assign(config, userConfig);
		},
	};
}
