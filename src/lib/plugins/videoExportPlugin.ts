import { ffmpegInit } from '../ffmpeg';
import { COLUMN, ROW } from '../gui/components/groups/Group';
import type { Container, GUIControllerInterface, Plugin } from '../types';
// Language plugin
export function videoExportPlugin(): Plugin {
	return {
		name: 'videoExport',
		setup: (gui: GUIControllerInterface, container: Container) => {
			const exportTab = gui.getTab('export');

			const panel = exportTab?.addPanel('Export video');

			const timeGroup = panel?.addGroup('timeField', ROW);

			timeGroup?.addTextbox(
				'durationInput',
				'Duration (s)',
				container.state.duration.toString(),
				(controller, value) => {
					const duration = parseFloat(value as string);
					if (!isNaN(duration)) {
						gui.setDuration(duration);
					}
				}
			);

			timeGroup?.addTextbox(
				'frameRateInput',
				'LANG_FRAME_RATE (fps)',
				container.sketchHook?.getTargetFrameRate().toString() || '30',
				(controller, value) => {
					const frameRate = parseInt(value as string);
					if (!isNaN(frameRate)) {
						gui.setFrameRate(frameRate);
					}
				}
			);

			panel?.addButton('startExport', 'Start export', controller => {
				if (container.state.isRecording) {
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
