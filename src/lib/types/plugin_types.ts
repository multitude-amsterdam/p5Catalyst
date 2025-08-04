import type { GUIControllerInterface } from './gui_interface_type';
import type { State } from './state_type';
import type { Resolution } from '../plugins/resolution_plugin';

export interface Plugin {
	name: string;
	setup?: (gui: GUIControllerInterface, state: State) => void;
	beforeInit?: (config: Config) => void;
	//   afterInit?: (container: Container) => void;
}

export interface Config {
	plugins: Plugin[];
	defaultLanguage?: string;
	defaultResolution?: Resolution;
}

export const defineConfig = (config: Config) => config;
