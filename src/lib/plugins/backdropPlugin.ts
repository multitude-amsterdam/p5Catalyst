import type { ExtensibleP5, Config, Plugin } from '../types';
import type { CatalystGUI } from '../gui/CatalystGUI';
import type { Controller } from '../gui/components/Controller';

import { COLUMN, ROW } from '../gui/components/groups/Group';

export function backdropPlugin(): Plugin {
	return {
		name: 'backdrop',

		beforeUserCreatesGui(
			gui: CatalystGUI,
			sketch: ExtensibleP5,
			config: Config
		) {
			if (config) config.doClearBackground = true;
		},

		afterUserCreatesGui: (
			gui: CatalystGUI,
			sketch: ExtensibleP5,
			config: Config
		) => {
			const appearanceTab = gui.getTab('appearance');

			const panel = appearanceTab?.addPanel('Backdrop & overlay');

			const columnGroup = panel?.addGroup('backdropGroup', COLUMN);
			const loadGroup = columnGroup?.addGroup('mediaLoad', ROW);

			loadGroup?.addMediaLoader(
				'backdropLoader',
				'Load backdrop',
				(media: any) => {
					gui.sketch.backdrop = media;
				}
			);
			loadGroup?.addMediaLoader(
				'overlayLoader',
				'Load overlay',
				(media: any) => {
					gui.sketch.overlay = media;
				}
			);

			columnGroup?.addButton(
				'clearMedia',
				'Clear media',
				(controller: Controller) => {
					delete gui.sketch.backdrop;
					delete gui.sketch.overlay;
				}
			);
		},
	};
}
