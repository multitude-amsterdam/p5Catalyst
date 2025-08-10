import { createContainer } from './create_container';
import { createGUI } from './create_gui';
import '../style.css';
import {
	languagePlugin,
	resolutionPlugin,
	resolutionPresets,
	imageExportPlugin,
	setConfigPlugin,
	randomizerPlugin,
} from './plugins';

import type { Plugin, SketchFunction, Config, GUISetupFunction } from './types';

const initialize = async (
	sketchFunction: SketchFunction,
	guiSetup?: GUISetupFunction,
	userPlugins?: Plugin[]
) => {
	const config: Config = {};
	userPlugins?.forEach(plugin => plugin.beforeInit?.(config));

	const container = await createContainer(sketchFunction);
	const gui = createGUI(container, config, (gui, state) => {
		userPlugins?.forEach(plugin => plugin.setup?.(gui, state, config));

		guiSetup?.(gui, state);
	});

	userPlugins?.forEach(plugin => plugin.afterInit?.(gui));

	return { container, gui };
};

export const catalyst = {
	createContainer,
	createGUI,
	initialize,
	languagePlugin,
	resolutionPlugin,
	resolutionPresets,
	imageExportPlugin,
	setConfigPlugin,
	randomizerPlugin,
};
