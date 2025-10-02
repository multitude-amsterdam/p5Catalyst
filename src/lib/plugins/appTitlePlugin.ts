import type { ExtensibleP5, Config, Plugin } from '../types';
import type { CatalystGUI } from '../gui/CatalystGUI';
import type { Controller } from '../gui/components/Controller';

export function appTitlePlugin(appName: string): Plugin {
	return {
		name: 'apptitle',

		beforeGuiExists(sketch, config) {
			Object.assign(config, { appName, fileName: appName });
			document.title = appName;
		},
	};
}
