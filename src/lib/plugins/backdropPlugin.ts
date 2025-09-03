import { ROW } from '../gui/components/groups/Group';
import type { Plugin } from '../types';

export function backdropPlugin(): Plugin {
	return {
		name: 'backdrop',
		beforeInit(config) {
			config.clearBackground = true;
			console.log(config);
		},
		setup: (gui, state) => {
			const settingsTab = gui.getTab('settings');
			const group = settingsTab?.addGroup('mediaLoad', ROW);
			const backdropLoader = group?.addMediaLoader(
				'backdropLoader',
				'Load Backdrop',
				media => {
					state.backdrop = media;
				}
			);
			const overlayLoader = group?.addMediaLoader(
				'overlayLoader',
				'Load Overlay',
				media => {
					state.overlay = media;
				}
			);
			settingsTab?.addButton('clearMedia', 'Clear Media', controller => {
				delete state.backdrop;
				delete state.overlay;
			});
		},
	};
}
