import { ROW } from '../gui/components/groups/Group';
import type { Plugin } from '../types';

export function backdropPlugin(): Plugin {
	return {
		name: 'backdrop',

		beforeInit(config) {
			config.clearBackground = true;
			console.log(config);
		},

		setup: (gui, state) => {},

		afterInit: gui => {
			const appearanceTab = gui.getTab('appearance');

			const panel = appearanceTab?.addPanel('Backdrop & overlay');

			const group = panel?.addGroup('mediaLoad', ROW);
			const backdropLoader = group?.addMediaLoader(
				'backdropLoader',
				'Load backdrop',
				media => {
					gui.state.backdrop = media;
				}
			);
			const overlayLoader = group?.addMediaLoader(
				'overlayLoader',
				'Load overlay',
				media => {
					gui.state.overlay = media;
				}
			);

			panel?.addButton('clearMedia', 'Clear media', controller => {
				delete gui.state.backdrop;
				delete gui.state.overlay;
			});

			panel?.close();
		},
	};
}
