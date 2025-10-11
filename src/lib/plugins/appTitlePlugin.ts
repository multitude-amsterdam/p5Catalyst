import type { Plugin } from '../types';

export function appTitlePlugin(appName: string): Plugin {
	return {
		name: 'apptitle',

		beforeGuiExists(sketch, config) {
			Object.assign(config, { appName, fileName: appName });
			document.title = appName;
		},
	};
}
