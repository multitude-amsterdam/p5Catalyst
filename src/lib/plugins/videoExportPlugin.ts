import { ffmpegInit, type VideoFormatKey } from '../ffmpeg';
import { COLUMN, ROW } from '../gui/components/groups/Group';
import type { Container, GUIControllerInterface, Plugin } from '../types';
import { setVideoFormatSettings } from '../ffmpeg';

export function videoExportPlugin(): Plugin {
	return {
		name: 'videoExport',
		setup: (gui: GUIControllerInterface, container: Container) => {
			const exportTab = gui.getTab('export');

			const panel = exportTab?.addPanel('Export video');

			const columnGroup = panel?.addGroup('videoExport', COLUMN);

			columnGroup?.addSelect(
				'formatSelect',
				'Video Format',
				['MP4', 'WEBM_TRANSPARENT'],
				0,
				(controller, value) => {
					console.log('changing format');
					setVideoFormatSettings(value as VideoFormatKey);
				}
			);

			const timeGroup = columnGroup?.addGroup('timeField', ROW);

			timeGroup?.addTextbox(
				'durationInput',
				'Duration (s)',
				container.state.duration.toString(),
				(controller, value) => {
					console.log('duration changed');
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

			columnGroup?.addButton(
				'startExport',
				'Start export',
				controller => {
					if (container.state.isRecording) {
						gui.stopRecording();
						controller?.controllerElement?.html('Start export');
					} else {
						gui.startRecording();
						controller?.controllerElement?.html('Stop export');
					}
				}
			);

			panel?.open();
		},

		afterInit: () => {
			ffmpegInit();
		},
	};
}
