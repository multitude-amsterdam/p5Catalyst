import type { GUIControllerInterface } from './gui_interface';
import type { State } from './construction';
import type { GUIForP5 } from '../gui/GUIForP5';
import type { Dictionary } from './lang';
import type { Config } from 'src/lib/types';
import { CatalystGUI } from '';

export interface Plugin {
	name: string;
	beforeCreateGui?: (
		gui: CatalystGUI,
		sketch: ExtensibleP5,
		config?: Config
	) => void;
	afterCreateGui?: (
		gui: CatalystGUI,
		sketch: ExtensibleP5,
		config?: Config
	) => void;
}
