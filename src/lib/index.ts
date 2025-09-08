import { createContainer } from './createContainer';
import { createGUI } from './createGUI';
import '../style.css';
import {
	defaultPlugin,
	languagePlugin,
	resolutionPlugin,
	resolutionPresets,
	imageExportPlugin,
	setConfigPlugin,
	randomizerPlugin,
	debugPlugin,
	backdropPlugin,
} from './plugins';

import type {
	Plugin,
	sketchFunction,
	Config,
	GUIControllerInterface,
	State,
} from './types';

const initialize = async (
	sketchFunction: sketchFunction,
	guiSetup?: (gui: GUIControllerInterface, state: State) => void,
	userPlugins?: Plugin[]
) => {
	const config: Config = {};
	userPlugins = userPlugins?.flat();
	userPlugins?.forEach(plugin => plugin.beforeInit?.(config));

	const container = await createContainer(sketchFunction, config);
	const gui = createGUI(container, config, (gui, state) => {
		userPlugins?.forEach(plugin => plugin.setup?.(gui, state, config));

		guiSetup?.(gui, state);
	});

	userPlugins?.forEach(plugin => plugin.afterInit?.(gui));
	gui.setup();
	return { container, gui };
};

export const catalyst = {
	createContainer,
	createGUI,
	initialize,
	defaultPlugin,
	languagePlugin,
	resolutionPlugin,
	resolutionPresets,
	imageExportPlugin,
	setConfigPlugin,
	randomizerPlugin,
	debugPlugin,
	backdropPlugin,
};
