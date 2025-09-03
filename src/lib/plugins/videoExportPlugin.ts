import { ffmpegInit } from '../ffmpeg';
import { COLUMN, ROW } from '../gui/components/groups/Group';
import type { GUIControllerInterface, Plugin, State } from '../types';
// Language plugin
export function videoExportPlugin(): Plugin {
	return {
		name: 'videoExport',
		setup: (gui: GUIControllerInterface, state: State) => {
			const exportTab = gui.getTab('export');

			const panel = exportTab?.addPanel('Export video');

			const timeGroup = panel?.addGroup('timeField', ROW);

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
				'LANG_FRAME_RATE',
				'60',
				(controller, value) => {
					const frameRate = parseInt(value as string);
					if (!isNaN(frameRate)) {
						gui.setFrameRate(frameRate);
					}
				}
			);

			panel?.addButton('startExport', 'Start export', controller => {
				if (state.isRecording) {
					gui.stopRecording();
					controller?.controllerElement?.html('Start export');
				} else {
					gui.startRecording();
					controller?.controllerElement?.html('Stop export');
				}
			});

			panel?.open();
		},

		afterInit: () => {
			ffmpegInit();
		},
	};
}
