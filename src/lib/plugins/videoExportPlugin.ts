import type { Plugin } from '../types';

import { COLUMN, ROW } from '../gui/components/groups/Group';
import { ffmpegInit } from '../ffmpeg';
import { setVideoFormatSettings, videoFormats } from '../ffmpeg';

export function videoExportPlugin(): Plugin {
	return {
		name: 'videoExport',

		afterUserCreatesGui: (gui, sketch, config) => {
			const exportTab = gui.getTab('export') || gui;

			const panel = exportTab.addPanel('Export video', true);

			const columnGroup = panel.addGroup('videoExport', COLUMN);

			columnGroup.addSelect(
				'formatSelect',
				'Video format',
				Object.values(videoFormats).map(format => format.guiName),
				0,
				(controller, value) => {
					setVideoFormatSettings(value as string);
				}
			);

			const timeGroup = columnGroup.addGroup('timeGroup', ROW);

			timeGroup.addTextbox(
				'durationTextbox',
				'Duration (s)',
				sketch.catalyst?.duration.toString() || '10',
				(controller, value) => {
					const duration = parseFloat(value as string);
					if (!isNaN(duration)) {
						sketch.catalyst?.setDuration(duration);
					}
				}
			);

			timeGroup.addTextbox(
				'frameRateTextbox',
				'LANG_FRAME_RATE (fps)',
				sketch.catalyst?.fps.toString() || '30',
				(controller, value) => {
					const frameRate = parseInt(value as string);
					if (isNaN(frameRate)) return;
					sketch.catalyst?.setFrameRate(frameRate);
				}
			);

			const buttonDisplayText = {
				idle: 'Start export',
				recording: 'Saving frames...',
				exporting: 'Exporting video...',
			};
			columnGroup.addButton('startExport', 'Start export', controller => {
				if (sketch.isRecording) {
					sketch.catalyst?.cancelRecording();
				} else {
					sketch.catalyst?.startRecording();
					const interval = setInterval(() => {
						controller.controllerElement?.html(
							buttonDisplayText[
								sketch.catalyst?.exportStage || 'idle'
							]
						);
						if (sketch.catalyst?.exportStage === 'idle') {
							clearInterval(interval);
						}
					}, 200);
				}
			});

			panel.open();

			ffmpegInit(gui);
		},
	};
}
