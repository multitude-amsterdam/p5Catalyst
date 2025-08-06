import { createContainer } from './create_container';
import { createGUI } from './create_gui';
import '../style.css';
import type p5 from 'p5';
import type { GUIControllerInterface } from './types/gui_interface_type';
import type { Config } from './types/plugin_types';
import { languagePlugin, resolutionPlugin } from './plugins';
import { resolutionPresets } from './plugins/resolution_plugin';
import type { Plugin } from './types/plugin_types';

type SketchFunction = (
	sketch: p5,
	state: any
) => Promise<{ state?: any }> | { state?: any } | void;
type GUISetupFunction = (gui: GUIControllerInterface, state: any) => void;

const initialize = async (
	sketchFunction: SketchFunction,
	guiSetup?: GUISetupFunction,
	userPlugins?: Plugin[]
) => {
	const config: Config = {};
	userPlugins?.forEach(plugin => plugin.beforeInit?.(config));

	const container = await createContainer(sketchFunction);
	const gui = createGUI(
		container.p5Instance,
		container.state,
		config,
		(gui, state) => {
			userPlugins?.forEach(plugin => plugin.setup?.(gui, state));

			guiSetup?.(gui, state);
		}
	);

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
};
