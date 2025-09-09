import { createContainer } from './createContainer';
import { createGUI } from './createGUI';
import '@fontsource-variable/inter';
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
	storeSettingsPlugin,
} from './plugins';

import type {
	Plugin,
	sketchFunction,
	Config,
	GUIControllerInterface,
	Container,
} from './types';

const initialize = async (
	sketchFunction: sketchFunction,
	guiSetup?: (gui: GUIControllerInterface, container: Container) => void,
	userPlugins?: Plugin[]
) => {
	const config: Config = {};
	userPlugins = userPlugins?.flat();
	userPlugins?.forEach(plugin => plugin.beforeInit?.(config));
	console.log('config:', config);

	const container = await createContainer(sketchFunction, config);
	const gui = createGUI(
		container,
		config,
		(guiControllerInterface, container) => {
			userPlugins?.forEach(plugin =>
				plugin.setup?.(guiControllerInterface, container, config)
			);

			if (guiSetup) guiSetup(guiControllerInterface, container);
		}
	);

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
	storeSettingsPlugin,
};
