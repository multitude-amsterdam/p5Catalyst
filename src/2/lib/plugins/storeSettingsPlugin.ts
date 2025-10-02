import type { Plugin, Serializable } from '../types';
import { COLUMN, ROW } from '../gui/components/groups/Group';
import type { CatalystGUI } from '../gui/CatalystGUI';
import type { ExtensibleP5, Config } from '../types';

export function storeSettingsPlugin(): Plugin {
	return {
		name: 'storeSettings',
		afterUserCreatesGui(
			gui: CatalystGUI,
			sketch: ExtensibleP5,
			config: Config
		) {
			const exportTab = gui.getTab('export');
			const panel = exportTab?.addPanel('Save & open settings');
			const buttonGroup = panel?.addGroup('saveOpenGroup', ROW);
			buttonGroup?.addButton(
				'buttonSaveSettings',
				'Save as...',
				async controller => {
					let name = await gui.dialog.prompt(
						'<h1>Save app settings</h1>' +
							'<p>Save all of your settings as a file. You can use these files to open your current settings later or share them with others.</p>' +
							'<p><strong>Filename</strong></p>',
						'',
						'Save as JSON'
					);
					// now make it a valid file name
					// regex from: https://stackoverflow.com/questions/35511331/how-to-make-a-valid-filename-from-an-arbitrary-string-in-javascript
					name = name.replace(/[ &\/\\#,+()$~%.'":*?<>{}]/g, '');
					controller.gui.sketch.saveJSON(
						controller.gui.getState(),
						name + '.json'
					);
				}
			);
			buttonGroup?.addJSONLoader(
				'buttonOpenSettings',
				'Open...',
				(file, controller) => {
					const serializedState = file.data as Serializable[];
					controller?.gui.restoreState(serializedState);
					controller?.gui.changeSet.save();
				}
			);
			panel?.open();
		},
	};
}
