import { ffmpegInit } from '../ffmpeg';
import { COLUMN, ROW } from '../gui/components/groups/Group';
import type { Container, GUIControllerInterface, Plugin } from '../types';
import { setVideoFormatSettings, videoFormats } from '../ffmpeg';
import type { GUIForP5 } from '../gui/GUIForP5';

export function videoExportPlugin(): Plugin {
	return {
		name: 'videoExport',
		setup: (gui: GUIControllerInterface, container: Container) => {
			const exportTab = gui.getTab('export');

			const panel = exportTab?.addPanel('Export video');

			const columnGroup = panel?.addGroup('videoExport', COLUMN);

			columnGroup?.addSelect(
				'formatSelect',
				'Video format',
				Object.values(videoFormats).map(format => format.guiName),
				0,
				(controller, value) => {
					setVideoFormatSettings(value as string);
				}
			);

			const timeGroup = columnGroup?.addGroup('timeField', ROW);

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

			const buttonDisplayText = {
				idle: 'Start export',
				recording: 'Saving frames...',
				exporting: 'Exporting video...',
			};

			columnGroup?.addButton(
				'startExport',
				'Start export',
				controller => {
					if (!container.state.isRecording) {
						gui.startRecording();
						const interval = setInterval(() => {
							controller?.controllerElement?.html(
								buttonDisplayText[
									container.sketchHook.getExportStatus()
								]
							);
							if (
								container.sketchHook.getExportStatus() ===
								'idle'
							) {
								clearInterval(interval);
							}
						}, 200);
					}
				}
			);

			panel?.open();
		},

		afterInit: (gui: GUIForP5) => {
			ffmpegInit(gui);
		},
	};
}
