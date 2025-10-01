import type { Config, Dictionary, Plugin } from '../types';
// Language plugin
export function languagePlugin(
	lang: string,
	userDictionary: Dictionary = {}
): Plugin {
	return {
		name: 'language',
		beforeInit: (config: Config) => {
			config.defaultLanguage = lang;
			config.userDictionary = userDictionary;
		},
	};
}
