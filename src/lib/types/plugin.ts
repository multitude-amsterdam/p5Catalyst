import type { GUIControllerInterface } from './gui_interface';
import type { State } from './construction';
import type { GUIForP5 } from '../gui/gui';
import type { Dictionary } from './lang';

export interface Plugin {
	name: string;
	beforeInit?: (config: Config) => void;
	setup?: (
		gui: GUIControllerInterface,
		state: State,
		config?: Config
	) => void;
	afterInit?: (gui: GUIForP5) => void;
}

export interface Config {
	defaultLanguage?: string;
	userDictionary?: Dictionary;
	fileName?: string;
	contactMail?: string;
}

export interface UserConfig extends Pick<Config, 'fileName' | 'contactMail'> {}

export type imageFileType = 'png' | 'jpg' | 'webp';
