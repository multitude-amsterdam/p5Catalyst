import { ffmpegInit } from '../ffmpeg';
import type { GUIControllerInterface, Plugin, State } from '../types';
// Language plugin
export function videoExportPlugin(): Plugin {
	return {
		name: 'videoExport',
		setup: (gui: GUIControllerInterface, state: State) => {
			const exportField = gui.addField(
				'videoExportField',
				'button-group column'
			);

			const exportTab = gui.getTab('export');

			const timeField = gui.addField('timeField', 'button-group row');

			const title = gui.addTitle(3, 'Export Video');

			const durationInput = gui.addTextbox(
				'durationInput',
				'Duration',
				'10',
				(controller, value) => {
					const duration = parseFloat(value);
					if (!isNaN(duration)) {
						gui.setDuration(duration);
					}
				}
			);

			const frameRateInput = gui.addTextbox(
				'frameRateInput',
				'Framerate',
				'60',
				(controller, value) => {
					const frameRate = parseInt(value);
					if (!isNaN(frameRate)) {
						gui.setFrameRate(frameRate);
					}
				}
			);

			const startButton = gui.addButton(
				'startExport',
				'Start Export!',
				controller => {
					gui.startRecording();
				}
			);

			timeField.div.child(durationInput.div);
			timeField.div.child(frameRateInput.div);
			exportField.div.child(title.div);
			exportField.div.child(timeField.div);
			exportField.div.child(startButton.div);

			exportTab?.addFields(exportField);
		},

		afterInit: () => {
			ffmpegInit();
		},
	};
}
