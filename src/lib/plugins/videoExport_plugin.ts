import { ffmpegInit } from '../ffmpeg';
import { Controller } from '../gui/controller';
import type { Config, GUIControllerInterface, Plugin, State } from '../types';
// Language plugin
export const videoExportPlugin: Plugin = () => ({
	name: 'videoExport',
	setup: (gui: GUIControllerInterface, state: State) => {
		gui.addButton('startExport', 'Start Export', controller => {
			gui.startRecording();
		});
		gui.addButton('stopExport', 'Stop Export', controller => {
			gui.stopRecording();
		});
	},

	afterInit: () => {
		ffmpegInit();
	},
});
