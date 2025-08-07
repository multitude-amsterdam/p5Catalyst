import type { Config, Dictionary, Plugin } from '../types';
// Language plugin
export const languagePlugin: Plugin = (
	lang: string = 'en',
	userDictionary: Dictionary
) => ({
	name: 'language',
	beforeInit: (config: Config) => {
		config.defaultLanguage = lang;
		config.userDictionary = userDictionary;
	},
});
