import type { GUIControllerInterface } from './gui_interface';
import type { State } from './construction';
import type { Resolution } from '../plugins/resolution_plugin';
import type { GUIForP5 } from '../gui/gui';

export interface Plugin {
	name: string;
	setup?: (gui: GUIControllerInterface, state: State) => void;
	beforeInit?: (config: Config) => void;
	afterInit?: (gui: GUIForP5) => void;
}

export interface Config {
	defaultLanguage?: string;
	defaultResolution?: Resolution;
}
