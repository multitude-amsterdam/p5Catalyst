import { ffmpegInit } from '../ffmpeg';
import { Controller } from '../gui/controller';
import type { Config, GUIControllerInterface, Plugin, State } from '../types';
// Language plugin
export const videoExportPlugin: Plugin = () => ({
	name: 'videoExport',
	setup: (gui: GUIControllerInterface, state: State) => {
		const exportField = gui.addField('videoExportField', 'button-group');

		const startButton = gui.addButton(
			'startExport',
			'Start Export',
			controller => {
				gui.startRecording();
			}
		);
		const stopButton = gui.addButton(
			'stopExport',
			'Stop Export',
			controller => {
				gui.stopRecording();
			}
		);

		exportField.div.child(startButton.div);
		exportField.div.child(stopButton.div);
	},

	afterInit: () => {
		ffmpegInit();
	},
});
