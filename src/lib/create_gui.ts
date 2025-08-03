import type { GUIControllerInterface } from './types/gui_interface_type';
import type { State } from './types/state_type';
import p5 from 'p5';
import { GUIForP5 } from './gui/gui';
import * as components from './gui/gui';

export const createGUI = (
	p5Instance: p5,
	state: State,
	userGUI?: (gui: GUIControllerInterface) => void
): GUIForP5 => {
	const gui = new GUIForP5(p5Instance, state);

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
			valueCallback?,
			setupCallback?
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

	guiInterface.addTitle(2, 'LANG_SUPPORT', false); // Always added
	guiInterface.addButton('test', 'test', controller => {
		console.log('test');
	});
	guiInterface.addResolutionSelect(
		'resolution',
		[
			'Full-HD (1080p) LANG_PORTRAIT: 1080 x 1920',
			'Full-HD (1080p) LANG_LANDSCAPE: 1920 x 1080',
			'4K-Ultra-HD (2160p): 3840 x 2160',
		],
		0
	);

	userGUI?.(guiInterface);
	return gui;
};
