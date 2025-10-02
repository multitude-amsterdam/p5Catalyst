import type { Config, Dictionary, Plugin, ExtensibleP5 } from '../types';
import type { CatalystGUI } from '../gui/CatalystGUI';

export function languagePlugin(
	lang: string,
	userDictionary: Dictionary = {}
): Plugin {
	return {
		name: 'language',
		beforeGuiExists: (sketch: ExtensibleP5, config: Config) => {
			config.defaultLanguage = lang;
			config.userDictionary = userDictionary;
		},
	};
}
