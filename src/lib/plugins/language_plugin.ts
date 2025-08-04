import type { Config } from '../types/plugin_types';
import type { Plugin } from '../types/plugin_types';
// Language plugin
export const languagePlugin: Plugin = (lang: string = 'en') => ({
	name: 'language',
	beforeInit: (config: Config) => {
		config.defaultLanguage = lang;
	},
});
