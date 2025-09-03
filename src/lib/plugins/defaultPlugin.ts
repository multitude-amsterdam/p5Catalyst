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
	backdropPlugin(),

	// export
	resolutionPlugin(resolutionPresets),
	imageExportPlugin('png'),
	videoExportPlugin(),
	// {
	// 	name: 'changetSetIO',
	// 	setup: (gui: GUIControllerInterface, state: State) => {
	// 		const exportTab = gui.getTab('export');
	// 		const panel = exportTab?.addPanel('Export settings');
	// 		panel?.addButton(
	// 			'buttonSaveSettings',
	// 			'Save settings',
	// 			controller => {
	// 				controller.gui.p5Instance.saveJSON(
	// 					controller.gui.getState(),
	// 					'settings.json'
	// 				);
	// 			}
	// 		);
	// 		panel?.addJSONLoader(
	// 			'buttonLoadSettings',
	// 			'Load settings',
	// 			// TODO: make fileReadyCallback take Controller as first argument
	// 			file => {
	// 				const reader = new FileReader();
	// 				reader.onload = event => {
	// 					if (event.target?.result) {
	// 						const loadedState = JSON.parse(
	// 							event.target.result as string
	// 						);
	// 						controller.gui.setState(loadedState);
	// 					}
	// 				};
	// 				reader.readAsText(file);
	// 			}
	// 		);
	// 	},
	// },

	// settings
];
