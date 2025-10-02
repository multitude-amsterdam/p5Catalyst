import type { Plugin } from '../types';

import {
	imageExportPlugin,
	videoExportPlugin,
	languagePlugin,
	resolutionPlugin,
	backdropPlugin,
} from '.';

export const defaultPlugins: Plugin[] = [
	{
		name: 'create-panels',
		beforeUserCreatesGui: (gui, sketch, config) => {
			gui.addTabs('appearance', 'export');
		},
	},

	languagePlugin('en'),

	// appearance tab
	resolutionPlugin(),

	// gui creation for appearance in main.js goes inbetween here

	backdropPlugin(),

	// export tab
	imageExportPlugin('png'),
	videoExportPlugin(),
];
