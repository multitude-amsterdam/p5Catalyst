import type {
	Plugin,
	Container,
	GUIControllerInterface,
	Serializable,
} from '../types';
import { COLUMN, ROW } from '../gui/components/groups/Group';
import type { GUIForP5 } from '../gui/GUIForP5';

export function storeSettingsPlugin(): Plugin {
	return {
		name: 'storeSettings',
		afterInit: (gui: GUIForP5) => {
			const exportTab = gui.getTab('export');
			const panel = exportTab?.addPanel('Export settings');
			const buttonGroup = panel?.addGroup('settingsGroup', ROW);
			buttonGroup?.addButton(
				'buttonSaveSettings',
				'Save settings',
				async controller => {
					const name = await gui.dialog.prompt(
						'Filename:',
						'settings',
						'save'
					);
					controller.gui.p5Instance.saveJSON(
						controller.gui.getState(),
						name + '.json'
					);
				}
			);
			buttonGroup?.addJSONLoader(
				'buttonLoadSettings',
				'Load settings',
				(file, controller) => {
					controller?.gui.restoreState(file.data as Serializable[]);
				}
			);
		},
	};
}
