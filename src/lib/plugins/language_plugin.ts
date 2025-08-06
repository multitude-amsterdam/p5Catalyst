import type { Config, Plugin } from '../types';
// Language plugin
export const languagePlugin: Plugin = (lang: string = 'en') => ({
	name: 'language',
	beforeInit: (config: Config) => {
		config.defaultLanguage = lang;
	},
});
