import type { ExtensibleP5, Config, Plugin } from '../types';
import type { CatalystGUI } from '../gui/CatalystGUI';

import {
	imageExportPlugin,
	videoExportPlugin,
	languagePlugin,
	resolutionPlugin,
	resolutionPresets,
	backdropPlugin,
} from '.';

export const defaultPlugins: Plugin[] = [
	{
		name: 'create-panels',
		beforeUserCreatesGui: (
			gui: CatalystGUI,
			sketch: ExtensibleP5,
			config: Config
		) => {
			const [appearanceTab, exportTab] = gui.addTabs(
				'appearance',
				'export'
			);
		},
	},
	languagePlugin('en'),

	// appearance tab
	resolutionPlugin(resolutionPresets),

	// gui creation for appearance in main.js goes inbetween here

	backdropPlugin(),

	// export tab
	imageExportPlugin('png'),
	videoExportPlugin(),
];
