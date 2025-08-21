import { ffmpegInit } from '../ffmpeg';
import { COLUMN, ROW } from '../gui/components/group';
import type { GUIControllerInterface, Plugin, State } from '../types';
// Language plugin
export function videoExportPlugin(): Plugin {
	return {
		name: 'videoExport',
		setup: (gui: GUIControllerInterface, state: State) => {
			const exportTab = gui.getTab('export');

			const exportGroup = exportTab?.addGroup('videoExportGroup', COLUMN);
			exportGroup?.addTitle(3, 'Export Video');

			exportGroup?.addButton(
				'startExport',
				'Start Export!',
				controller => {
					gui.startRecording();
				}
			);

			const timeGroup = exportGroup?.addGroup('timeField', ROW);

			timeGroup?.addTextbox(
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

			timeGroup?.addTextbox(
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
		},

		afterInit: () => {
			ffmpegInit();
		},
	};
}
