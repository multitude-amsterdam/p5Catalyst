import p5 from 'p5';
import { GUIForP5 } from './gui/gui';
import * as components from './gui/gui';

import type { GUIControllerInterface, State, Config, Container } from './types';

export const createGUI = (
	container: Container,
	config: Config,
	userGUI?: (gui: GUIControllerInterface, state: State) => void
): GUIForP5 => {
	const gui = new GUIForP5(container.p5Instance, container.state, config);

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
		addToggle: (
			name,
			labelStr0,
			labelStr1,
			isToggled,
			valueCallback,
			setupCallback
		) => {
			const toggle = new components.Toggle(
				gui,
				name,
				labelStr0,
				labelStr1,
				isToggled,
				valueCallback,
				setupCallback
			);
			return gui.addController(toggle);
		},
		addSlider: (
			name,
			labelStr,
			minVal,
			maxVal,
			defaultVal,
			stepSize,
			valueCallback?,
			setupCallback?
		) => {
			const slider = new components.Slider(
				gui,
				name,
				labelStr,
				minVal,
				maxVal,
				defaultVal,
				stepSize,
				valueCallback,
				setupCallback
			);
			return gui.addController(slider);
		},
		addTextbox: (
			name,
			labelStr,
			defaultVal,
			valueCallback,
			setupCallback
		) => {
			const textbox = new components.Textbox(
				gui,
				name,
				labelStr,
				defaultVal,
				valueCallback,
				setupCallback
			);
			return gui.addController(textbox);
		},
		addCrementer: (
			name,
			labelStr,
			minVal,
			maxVal,
			defaultVal,
			stepSize,
			valueCallback,
			setupCallback
		) => {
			const crementer = new components.Crementer(
				gui,
				name,
				labelStr,
				minVal,
				maxVal,
				defaultVal,
				stepSize,
				valueCallback,
				setupCallback
			);
			return gui.addController(crementer);
		},
	};

	userGUI?.(guiInterface, container.state);
	return gui;
};
