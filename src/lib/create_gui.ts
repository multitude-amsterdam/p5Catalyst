import p5 from 'p5';
import type { GUIControllerInterface } from './types/gui_interface_type';
import { GUIForP5 } from './gui/gui';
import * as components from './gui/gui';

export const createGUI = (
	p5Instance: p5,
	userGUI?: (gui: GUIControllerInterface) => void
): GUIForP5 => {
	const gui = new GUIForP5(p5Instance);

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
	};

	guiInterface.addTitle(20, 'Controls'); // Always added
	guiInterface.addButton('test', 'test', controller => {
		console.log('test');
	});

	userGUI?.(guiInterface);
	return gui;
};
