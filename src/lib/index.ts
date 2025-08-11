import { createContainer } from './create_container';
import { createGUI } from './create_gui';
import '../style.css';
import {
	defaultPlugin,
	languagePlugin,
	resolutionPlugin,
	resolutionPresets,
	imageExportPlugin,
	setConfigPlugin,
	randomizerPlugin,
} from './plugins';

import type {
	Plugin,
	SketchFunction,
	Config,
	GUIControllerInterface,
	State,
} from './types';

const initialize = async (
	sketchFunction: SketchFunction,
	guiSetup?: (gui: GUIControllerInterface, state: State) => void,
	userPlugins?: (Plugin | Plugin[])[]
) => {
	const config: Config = {};
	userPlugins = userPlugins?.flat();
	userPlugins?.forEach(plugin => plugin.beforeInit?.(config));
	console.log(config);

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
	defaultPlugin,
	languagePlugin,
	resolutionPlugin,
	resolutionPresets,
	imageExportPlugin,
	setConfigPlugin,
	randomizerPlugin,
};
