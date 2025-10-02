import type { Config } from '../types/config';
import type { CatalystGUI } from '../gui/CatalystGUI';
import type { ExtensibleP5 } from './p5-extension';

export interface Plugin {
	name: string;

	beforeGuiExists?: (sketch: ExtensibleP5, config: Config) => void;

	beforeUserCreatesGui?: (
		gui: CatalystGUI,
		sketch: ExtensibleP5,
		config: Config
	) => void;

	afterUserCreatesGui?: (
		gui: CatalystGUI,
		sketch: ExtensibleP5,
		config: Config
	) => void;
}
