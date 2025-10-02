import type { Dictionary, Plugin } from '../types';

export function languagePlugin(
	lang: string,
	userDictionary: Dictionary = {}
): Plugin {
	return {
		name: 'language',
		beforeGuiExists: (sketch, config) => {
			config.defaultLanguage = lang;
			config.userDictionary = userDictionary;
		},
	};
}
