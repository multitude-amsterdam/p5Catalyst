import type { GUIControllerInterface } from './gui_interface';
import type { State } from './construction';
import type { GUIForP5 } from '../gui/gui';
import type { Dictionary } from './lang';

export interface Plugin {
	name: string;
	setup?: (gui: GUIControllerInterface, state: State) => void;
	beforeInit?: (config: Config) => void;
	afterInit?: (gui: GUIForP5) => void;
}

export interface Config {
	defaultLanguage?: string;
	userDictionary?: Dictionary;
}
