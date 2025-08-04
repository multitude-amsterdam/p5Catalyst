import type { GUIControllerInterface } from './types/gui_interface_type';
import type { State } from './types/state_type';
import p5 from 'p5';
import { GUIForP5 } from './gui/gui';
import * as components from './gui/gui';
import type { Config } from './types/plugin_types';

export const createGUI = (
	p5Instance: p5,
	state: State,
	config: Config,
	userGUI?: (gui: GUIControllerInterface, state: State) => void
): GUIForP5 => {
	const gui = new GUIForP5(p5Instance, state, config);

	const guiInterface: GUIControllerInterface = {
		addField: (id, className) => {
			const field = new components.Field(gui, id, className);
			return gui.addField(field);
		},
		addTitle: (hSize, text, doAlignCenter = true) => {
			const title = new components.Title(gui, hSize, text, doAlignCenter);
			return gui.addField(title);
		},
		addButton: (name, labelStr, callback?, setupCallback?) => {
			const button = new components.Button(
				gui,
				name,
				labelStr,
				callback,
				setupCallback
			);
			return gui.addController(button);
		},
		addSelect: (
			name,
			labelStr,
			options,
			defaultIndex,
			valueCallback?,
			setupCallback?
		) => {
			const select = new components.Select(
				gui,
				name,
				labelStr,
				options,
				defaultIndex,
				valueCallback,
				setupCallback
			);
			return gui.addController(select);
		},
		addResolutionSelect: (
			labelStr,
			resolutionOptions,
			defaultIndex,
			valueCallback,
			setupCallback
		) => {
			const resolutionSelect = new components.ResolutionSelect(
				gui,
				labelStr,
				resolutionOptions,
				defaultIndex,
				valueCallback,
				setupCallback
			);
			return gui.addController(resolutionSelect);
		},
	};

	userGUI?.(guiInterface, state);
	return gui;
};
