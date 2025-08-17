import { imageExportPlugin } from './imageExport_plugin';
import { videoExportPlugin } from './videoExport_plugin';
import { languagePlugin } from './language_plugin';
import { resolutionPlugin, resolutionPresets } from './resolution_plugin';
import { setConfigPlugin } from './setConfig_plugin';
import type { GUIControllerInterface, Plugin, State } from '../types';

export const defaultPlugin: Plugin = () => [
	setConfigPlugin({ fileName: 'p5Catalyst' }),
	{
		name: 'test',
		setup: (gui: GUIControllerInterface, state: State) => {
			const [appearanceTab, exportTab, settingsTab] = gui.addTabs(
				'appearance',
				'export',
				'settings'
			);
			const appearanceTitle = gui.addTitle(3, 'Appearance');
			const settingsTitle = gui.addTitle(3, 'Settings');
			appearanceTab.addFields(appearanceTitle);
			settingsTab.addFields(settingsTitle);
		},
	},
	languagePlugin('en'),
	resolutionPlugin(resolutionPresets),
	imageExportPlugin('jpg'),
	videoExportPlugin(),
	{
		name: 'changeSetButtons',
		setup: (gui: GUIControllerInterface, state: State) => {
			const undoRedoField = gui.addField('', 'button-group');
			const undoButton = gui.addButton(
				'undo',
				'LANG_UNDO',
				controller => {
					gui.undo();
				}
			);
			const redoButton = gui.addButton(
				'redo',
				'LANG_REDO',
				controller => {
					gui.redo();
				}
			);
			undoRedoField.div.child(undoButton.div);
			undoRedoField.div.child(redoButton.div);
		},
	},
];
