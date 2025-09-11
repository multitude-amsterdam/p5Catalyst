import { COLUMN, ROW } from '../gui/components/groups/Group';
import type { Plugin } from '../types';

export function backdropPlugin(): Plugin {
	return {
		name: 'backdrop',

		beforeInit(config) {
			config.clearBackground = true;
		},

		afterInit: gui => {
			const appearanceTab = gui.getTab('appearance');

			const panel = appearanceTab?.addPanel('Backdrop & overlay');

			const columnGroup = panel?.addGroup('backdropGroup', COLUMN);
			const loadGroup = columnGroup?.addGroup('mediaLoad', ROW);

			loadGroup?.addMediaLoader(
				'backdropLoader',
				'Load backdrop',
				media => {
					gui.state.backdrop = media;
				}
			);
			loadGroup?.addMediaLoader(
				'overlayLoader',
				'Load overlay',
				media => {
					gui.state.overlay = media;
				}
			);

			columnGroup?.addButton('clearMedia', 'Clear media', controller => {
				delete gui.state.backdrop;
				delete gui.state.overlay;
			});
		},
	};
}
