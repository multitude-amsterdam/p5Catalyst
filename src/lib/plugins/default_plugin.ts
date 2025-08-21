import { imageExportPlugin } from './imageExport_plugin';
import { videoExportPlugin } from './videoExport_plugin';
import { languagePlugin } from './language_plugin';
import { resolutionPlugin, resolutionPresets } from './resolution_plugin';
import { setConfigPlugin } from './setConfig_plugin';
import type { GUIControllerInterface, Plugin, State } from '../types';
import { ROW, COLUMN } from '../gui/components/group';

export const defaultPlugin: Plugin = () => [
	setConfigPlugin({ fileName: 'p5Catalyst' }),
	{
		name: 'panel',
		setup: (gui: GUIControllerInterface, state: State) => {
			const [appearanceTab, exportTab, settingsTab] = gui.addTabs(
				'appearance',
				'export',
				'settings'
			);
			appearanceTab.addTitle(3, 'Appearance');
			settingsTab.addTitle(3, 'Settings');
		},
	},
	languagePlugin('en'), // empty userDictionary
	resolutionPlugin(resolutionPresets),
	imageExportPlugin('jpg'),
	videoExportPlugin(),
	{
		name: 'changeSetButtons',
		setup: (gui: GUIControllerInterface, state: State) => {
			const undoRedoGroup = gui.addGroup('undoRedo', ROW);
			undoRedoGroup.addButton('undo', 'LANG_UNDO', controller => {
				gui.undo();
			});
			undoRedoGroup.addButton('redo', 'LANG_REDO', controller => {
				gui.redo();
			});
		},
	},
];
