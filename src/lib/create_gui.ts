import p5 from 'p5';
import { GUIForP5 } from './gui/gui';
import * as components from './gui/components';

import type { GUIControllerInterface, State, Config, Container } from './types';

export const createGUI = (
	container: Container,
	config: Config,
	userGUI?: (gui: GUIControllerInterface, state: State) => void
): GUIForP5 => {
	const gui = new GUIForP5(container, config);

	const guiInterface: GUIControllerInterface = {
		addTabs: (...names) => {
			return gui.addTabs(...names);
		},
		getTab: name => {
			return gui.getTab(name);
		},
		addField: (id, className, parentDiv) => {
			const field = new components.Field(gui, id, className, parentDiv);
			return gui.addField(field);
		},
		addTitle: (hSize, text, doAlignCenter = false) => {
			const title = new components.Title(gui, hSize, text, doAlignCenter);
			return gui.addField(title);
		},
		addTextField: (text, className, doAlignCenter = false) => {
			const textField = new components.TextField(
				gui,
				text,
				className,
				doAlignCenter
			);
			return gui.addField(textField);
		},
		addImageField: (url, altText, doAlignCenter = false) => {
			const imageField = new components.ImageField(
				gui,
				url,
				altText,
				doAlignCenter
			);
			return gui.addField(imageField);
		},
		addDivider: () => {
			const divider = new components.Divider(gui);
			return gui.addField(divider);
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
		addXYSlider: (
			name,
			labelStr,
			minValX,
			maxValX,
			defaultValX,
			stepSizeX,
			minValY,
			maxValY,
			defaultValY,
			stepSizeY,
			valueCallback,
			setupCallback
		) => {
			const xySlider = new components.XYSlider(
				gui,
				name,
				labelStr,
				minValX,
				maxValX,
				defaultValX,
				stepSizeX,
				minValY,
				maxValY,
				defaultValY,
				stepSizeY,
				valueCallback,
				setupCallback
			);

			return gui.addController(xySlider);
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
		addResolutionTextBoxes: (defaulWidth, defaultHeight, valueCallback) => {
			const resbox = new components.ResolutionTextboxes(
				gui,
				defaulWidth,
				defaultHeight,
				valueCallback
			);
			return gui.addController(resbox);
		},
		addTextArea: (
			name,
			labelStr,
			defaultVal,
			valueCallback,
			setupCallback
		) => {
			const textarea = new components.Textarea(
				gui,
				name,
				labelStr,
				defaultVal,
				valueCallback,
				setupCallback
			);
			return gui.addController(textarea);
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
		addColourBoxes: (
			name,
			labelStr,
			colours,
			defaultIndex,
			valueCallback,
			setupCallback
		) => {
			const colourBoxes = new components.ColourBoxes(
				gui,
				name,
				labelStr,
				colours,
				defaultIndex,
				valueCallback,
				setupCallback
			);
			return gui.addController(colourBoxes);
		},
		addMultiColourBoxes: (
			name,
			labelStr,
			colours,
			defaultIndices,
			valueCallback,
			setupCallback
		) => {
			const multiColourBoxes = new components.MultiColourBoxes(
				gui,
				name,
				labelStr,
				colours,
				defaultIndices,
				valueCallback,
				setupCallback
			);

			return gui.addController(multiColourBoxes);
		},
		addTextLoader: (name, labelStr, valueCallback, setupCallback) => {
			const textLoader = new components.TextFileLoader(
				gui,
				name,
				labelStr,
				valueCallback,
				setupCallback
			);
			return gui.addController(textLoader);
		},
		addJSONLoader: (name, labelStr, valueCallback, setupCallback) => {
			const JSONLoader = new components.JSONFileLoader(
				gui,
				name,
				labelStr,
				valueCallback,
				setupCallback
			);
			return gui.addController(JSONLoader);
		},
		addImageLoader: (name, labelStr, valueCallback, setupCallback) => {
			const imageLoader = new components.ImageLoader(
				gui,
				name,
				labelStr,
				valueCallback,
				setupCallback
			);
			return gui.addController(imageLoader);
		},
		randomize: () => {
			gui.randomizer?.randomize();
		},
		undo: () => {
			gui.changeSet.undo();
		},
		redo: () => {
			gui.changeSet.redo();
		},
		getController: name => {
			return gui.getController(name);
		},
		startRecording: () => {
			container.sketchHook.startRecording();
		},
		stopRecording: () => {
			container.sketchHook.stopRecording();
		},
		setDuration: (duration: number) => {
			container.sketchHook.setDuration(duration);
		},
		setFrameRate: (frameRate: number) => {
			container.sketchHook.setFrameRate(frameRate);
		},
	};

	userGUI?.(guiInterface, container.state);
	return gui;
};
