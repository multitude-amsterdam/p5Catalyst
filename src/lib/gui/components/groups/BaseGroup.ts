import type {
	controllerCallback,
	valueCallback,
	fileReadyCallback,
	setupCallback,
} from '../../../types';

import { Field } from '../Field';
import type { Orientation } from './Group';

import * as Components from '../index';

export class BaseGroup extends Field {
	fields: Field[] = [];
	controllers: Components.Controller[] = [];
	panels: Components.Panel[] = [];
	groups: Components.Group[] = [];

	attachField<T extends Field>(field: T) {
		this.div.child(field.div);
		this.fields.push(field);
	}

	addGroup(name: string, orientation: Orientation): Components.Group {
		const group = new Components.Group(this.gui, name, orientation);
		this.gui.addField(group);
		this.attachField(group);
		this.groups.push(group);
		return group;
	}

	addPanel(name: string, open?: boolean) {
		const panel = new Components.Panel(this.gui, name, open);
		this.gui.addField(panel);
		this.attachField(panel);
		this.panels.push(panel);
		return panel;
	}

	addTitle(headerSize: number, text: string) {
		const title = new Components.Title(this.gui, headerSize, text);
		this.gui.addField(title);
		this.attachField(title);
		return title;
	}

	addTextField(text: string, className?: string, doAlignCenter?: boolean) {
		const textField = new Components.TextField(
			this.gui,
			text,
			className,
			doAlignCenter
		);
		this.gui.addField(textField);
		this.attachField(textField);
		return textField;
	}

	addImageField(url: string, altText: string, doAlignCenter?: boolean) {
		const imageField = new Components.ImageField(
			this.gui,
			url,
			altText,
			doAlignCenter
		);
		this.gui.addField(imageField);
		this.attachField(imageField);
		return imageField;
	}

	addDivider() {
		const divider = new Components.Divider(this.gui);
		this.gui.addField(divider);
		this.attachField(divider);
		return divider;
	}

	addButton(
		name: string,
		labelStr: string,
		callback?: controllerCallback,
		setupCallback?: setupCallback
	) {
		const button = new Components.Button(
			this.gui,
			name,
			labelStr,
			callback,
			setupCallback
		);
		this.gui.addController(button);
		this.attachField(button);
		this.controllers.push(button);
		return button;
	}

	addSelect(
		name: string,
		labelStr: string,
		options: string[],
		defaultIndex: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		const select = new Components.Select(
			this.gui,
			name,
			labelStr,
			options,
			defaultIndex,
			valueCallback,
			setupCallback
		);
		this.gui.addController(select);
		this.attachField(select);
		this.controllers.push(select);
		return select;
	}

	addResolutionSelect(
		labelStr: string,
		resOptions: string[],
		defaultIndex: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		const resolutionSelect = new Components.ResolutionSelect(
			this.gui,
			labelStr,
			resOptions,
			defaultIndex,
			valueCallback,
			setupCallback
		);
		this.gui.addController(resolutionSelect);
		this.attachField(resolutionSelect);
		this.controllers.push(resolutionSelect);
		return resolutionSelect;
	}

	addToggle(
		name: string,
		labelStr0: string,
		labelStr1: string,
		isToggled: boolean,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		const toggle = new Components.Toggle(
			this.gui,
			name,
			labelStr0,
			labelStr1,
			isToggled,
			valueCallback,
			setupCallback
		);
		this.gui.addController(toggle);
		this.attachField(toggle);
		this.controllers.push(toggle);
		return toggle;
	}

	addSlider(
		name: string,
		labelStr: string,
		minVal: number,
		maxVal: number,
		defaultVal: number,
		stepSize: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		const slider = new Components.Slider(
			this.gui,
			name,
			labelStr,
			minVal,
			maxVal,
			defaultVal,
			stepSize,
			valueCallback,
			setupCallback
		);
		this.gui.addController(slider);
		this.attachField(slider);
		this.controllers.push(slider);
		return slider;
	}

	addXYSlider(
		name: string,
		labelStr: string,
		minValX: number,
		maxValX: number,
		defaultValX: number,
		stepSizeX: number,
		minValY: number,
		maxValY: number,
		defaultValY: number,
		stepSizeY: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		const xySlider = new Components.XYSlider(
			this.gui,
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
		this.gui.addController(xySlider);
		this.attachField(xySlider);
		this.controllers.push(xySlider);
		return xySlider;
	}

	addTextbox(
		name: string,
		labelStr: string,
		defaultVal: string,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		const textbox = new Components.Textbox(
			this.gui,
			name,
			labelStr,
			defaultVal,
			valueCallback,
			setupCallback
		);
		this.gui.addController(textbox);
		this.attachField(textbox);
		this.controllers.push(textbox);
		return textbox;
	}

	addResolutionTextBoxes(
		defaultWidth: number,
		defaultHeight: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		const resolutionTextBoxes = new Components.ResolutionTextBoxes(
			this.gui,
			defaultWidth,
			defaultHeight,
			valueCallback,
			setupCallback
		);
		this.gui.addController(resolutionTextBoxes);
		this.attachField(resolutionTextBoxes);
		this.controllers.push(resolutionTextBoxes);
		return resolutionTextBoxes;
	}

	addTextArea(
		name: string,
		labelStr: string,
		defaultVal: string,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		const textArea = new Components.TextArea(
			this.gui,
			name,
			labelStr,
			defaultVal,
			valueCallback,
			setupCallback
		);
		this.gui.addController(textArea);
		this.attachField(textArea);
		this.controllers.push(textArea);
		return textArea;
	}

	addCrementer(
		name: string,
		labelStr: string,
		minVal: number,
		maxVal: number,
		defaultVal: number,
		stepSize: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		const crementer = new Components.Crementer(
			this.gui,
			name,
			labelStr,
			minVal,
			maxVal,
			defaultVal,
			stepSize,
			valueCallback,
			setupCallback
		);
		this.gui.addController(crementer);
		this.attachField(crementer);
		this.controllers.push(crementer);
		return crementer;
	}

	addColorBoxes(
		name: string,
		labelStr: string,
		colors: string[],
		defaultIndex: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		const colorBoxes = new Components.ColorBoxes(
			this.gui,
			name,
			labelStr,
			colors,
			defaultIndex,
			valueCallback,
			setupCallback
		);
		this.gui.addController(colorBoxes);
		this.attachField(colorBoxes);
		this.controllers.push(colorBoxes);
		return colorBoxes;
	}

	addMultiColorBoxes(
		name: string,
		labelStr: string,
		colors: string[],
		defaultIndices: number[],
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		const multiColorBoxes = new Components.MultiColorBoxes(
			this.gui,
			name,
			labelStr,
			colors,
			defaultIndices,
			valueCallback,
			setupCallback
		);
		this.gui.addController(multiColorBoxes);
		this.attachField(multiColorBoxes);
		this.controllers.push(multiColorBoxes);
		return multiColorBoxes;
	}

	addTextLoader(
		name: string,
		labelStr: string,
		fileReadyCallback?: fileReadyCallback,
		setupCallback?: setupCallback
	) {
		const textLoader = new Components.TextFileLoader(
			this.gui,
			name,
			labelStr,
			fileReadyCallback,
			setupCallback
		);
		this.gui.addController(textLoader);
		this.attachField(textLoader);
		this.controllers.push(textLoader);
		return textLoader;
	}

	addJSONLoader(
		name: string,
		labelStr: string,
		fileReadyCallback: fileReadyCallback,
		setupCallback?: setupCallback
	) {
		const jsonLoader = new Components.JSONFileLoader(
			this.gui,
			name,
			labelStr,
			fileReadyCallback,
			setupCallback
		);
		this.gui.addController(jsonLoader);
		this.attachField(jsonLoader);
		this.controllers.push(jsonLoader);
		return jsonLoader;
	}

	addImageLoader(
		name: string,
		labelStr: string,
		fileReadyCallback: fileReadyCallback,
		setupCallback?: setupCallback
	) {
		const imageLoader = new Components.ImageLoader(
			this.gui,
			name,
			labelStr,
			fileReadyCallback,
			setupCallback
		);
		this.gui.addController(imageLoader);
		this.attachField(imageLoader);
		this.controllers.push(imageLoader);
		return imageLoader;
	}

	addVideoLoader(
		name: string,
		labelStr: string,
		fileReadyCallback: fileReadyCallback,
		setupCallback: setupCallback
	) {
		const videoLoader = new Components.VideoLoader(
			this.gui,
			name,
			labelStr,
			fileReadyCallback,
			setupCallback
		);
		this.gui.addController(videoLoader);
		this.attachField(videoLoader);
		this.controllers.push(videoLoader);
		return videoLoader;
	}

	addMediaLoader(
		name: string,
		labelStr: string,
		fileReadyCallback: fileReadyCallback,
		setupCallback?: setupCallback
	) {
		const mediaLoader = new Components.MediaLoader(
			this.gui,
			name,
			labelStr,
			fileReadyCallback,
			setupCallback
		);
		this.gui.addController(mediaLoader);
		this.attachField(mediaLoader);
		this.controllers.push(mediaLoader);
		return mediaLoader;
	}
}
