import { imageExportPlugin } from './imageExportPlugin';
import { videoExportPlugin } from './videoExportPlugin';
import { languagePlugin } from './languagePlugin';
import { resolutionPlugin, resolutionPresets } from './resolutionPlugin';
import { setConfigPlugin } from './setConfigPlugin';
import type { GUIControllerInterface, Plugin, State } from '../types';
import { ROW, COLUMN } from '../gui/components/groups/Group';
import { backdropPlugin } from './backdropPlugin';

export const defaultPlugin: Plugin = () => [
	setConfigPlugin({ fileName: 'p5Catalyst' }),
	{
		name: 'panel',
		setup: (gui: GUIControllerInterface, state: State) => {
			const [appearanceTab, exportTab, settingsTab] = gui.addTabs(
				'appearance',
				'export'
			);
		},
	},
	languagePlugin('en'), // empty userDictionary

	//appearance
	resolutionPlugin(resolutionPresets),
	// gui creation for appearance in main.js goes inbetween here
	backdropPlugin(),

	// export
	imageExportPlugin('png'),
	videoExportPlugin(),

	// settings
];
