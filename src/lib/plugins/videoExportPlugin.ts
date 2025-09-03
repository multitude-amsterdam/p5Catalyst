import { ffmpegInit } from '../ffmpeg';
import { COLUMN, ROW } from '../gui/components/groups/Group';
import type { GUIControllerInterface, Plugin, State } from '../types';
// Language plugin
export function videoExportPlugin(): Plugin {
	return {
		name: 'videoExport',
		setup: (gui: GUIControllerInterface, state: State) => {
			const exportTab = gui.getTab('export');

			const exportGroup = exportTab?.addGroup('videoExportGroup', COLUMN);
			exportGroup?.addTitle(3, 'Export Video');

			const timeGroup = exportGroup?.addGroup('timeField', ROW);

			timeGroup?.addTextbox(
				'durationInput',
				'Duration',
				'10',
				(controller, value) => {
					const duration = parseFloat(value as string);
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
					const frameRate = parseInt(value as string);
					if (!isNaN(frameRate)) {
						gui.setFrameRate(frameRate);
					}
				}
			);

			exportGroup?.addButton(
				'startExport',
				'Start export',
				controller => {
					if (state.isRecording) {
						gui.stopRecording();
						controller?.setLabel('Start export');
					} else {
						gui.startRecording();
						controller?.setLabel('Stop export');
					}
				}
			);
		},

		afterInit: () => {
			ffmpegInit();
		},
	};
}
