import Field from '../field';
import type GUIForP5 from '../../gui';
import type { Orientation } from './group';

import type {
	controllerCallback,
	valueCallback,
	setupCallback,
	GUIAddableInterface,
} from 'src/lib/types';
import * as components from '../index';

export class baseGroup extends Field implements GUIAddableInterface {
	gui: GUIForP5;

	constructor(gui: GUIForP5, id: string, className: string) {
		super(gui, id, className);
		this.gui = gui;
	}
	//   /**
	//    * Adds a field (GUI element) to the GUI.
	//    * @param {Field} field
	//    * @returns {Field}
	//    */
	attachField<T extends Field>(field: T) {
		this.div.child(field.div);
	}

	addGroup: GUIAddableInterface['addGroup'] = (
		name: string,
		orientation: Orientation
	) => {
		const group = new components.Group(this.gui, name, orientation);
		this.gui.addField(group);
		this.attachField(group);
		return group;
	};
	addPanel: GUIAddableInterface['addPanel'] = (name: string) => {
		const panel = new components.Panel(this.gui, name);
		this.gui.addField(panel);
		this.attachField(panel);
		return panel;
	};
	addTitle: GUIAddableInterface['addTitle'] = (
		hSize,
		text,
		doAlignCenter
	) => {
		const title = new components.Title(
			this.gui,
			hSize,
			text,
			doAlignCenter
		);
		this.gui.addField(title);
		this.attachField(title);
		return title;
	};

	addTextField: GUIAddableInterface['addTextField'] = (
		text: string,
		className?: string,
		doAlignCenter?: boolean
	) => {
		const textField = new components.TextField(
			this.gui,
			text,
			className,
			doAlignCenter
		);
		this.gui.addField(textField);
		this.attachField(textField);
		return textField;
	};
	addImageField: GUIAddableInterface['addImageField'] = (
		url: string,
		altText: string,
		doAlignCenter?: boolean
	) => {
		const imageField = new components.ImageField(
			this.gui,
			url,
			altText,
			doAlignCenter
		);
		this.gui.addField(imageField);
		this.attachField(imageField);
		return imageField;
	};
	addDivider: GUIAddableInterface['addDivider'] = () => {
		const divider = new components.Divider(this.gui);
		this.gui.addField(divider);
		this.attachField(divider);
		return divider;
	};
	addButton: GUIAddableInterface['addButton'] = (
		name: string,
		labelStr: string,
		callback?: controllerCallback,
		setupCallback?: setupCallback
	) => {
		const button = new components.Button(
			this.gui,
			name,
			labelStr,
			callback,
			setupCallback
		);
		this.gui.addField(button);
		this.attachField(button);
		return button;
	};
	addSelect: GUIAddableInterface['addSelect'] = (
		name: string,
		labelStr: string,
		options: string[],
		defaultIndex: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => {
		const select = new components.Select(
			this.gui,
			name,
			labelStr,
			options,
			defaultIndex,
			valueCallback,
			setupCallback
		);
		this.gui.addField(select);
		this.attachField(select);
		return select;
	};
	addResolutionSelect: GUIAddableInterface['addResolutionSelect'] = (
		labelStr: string,
		resOptions: string[],
		defaultIndex: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => {
		const resolutionSelect = new components.ResolutionSelect(
			this.gui,
			labelStr,
			resOptions,
			defaultIndex,
			valueCallback,
			setupCallback
		);
		this.gui.addField(resolutionSelect);
		this.attachField(resolutionSelect);
		return resolutionSelect;
	};
	addToggle: GUIAddableInterface['addToggle'] = (
		name: string,
		labelStr0: string,
		labelStr1: string,
		isToggled: boolean,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => {
		const toggle = new components.Toggle(
			this.gui,
			name,
			labelStr0,
			labelStr1,
			isToggled,
			valueCallback,
			setupCallback
		);
		this.gui.addField(toggle);
		this.attachField(toggle);
		return toggle;
	};
	addSlider: GUIAddableInterface['addSlider'] = (
		name: string,
		labelStr: string,
		minVal: number,
		maxVal: number,
		defaultVal: number,
		stepSize: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => {
		const slider = new components.Slider(
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
		this.gui.addField(slider);
		this.attachField(slider);
		return slider;
	};
	addXYSlider: GUIAddableInterface['addXYSlider'] = (
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
	) => {
		const xySlider = new components.XYSlider(
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
		this.gui.addField(xySlider);
		this.attachField(xySlider);
		return xySlider;
	};
	addTextbox: GUIAddableInterface['addTextbox'] = (
		name: string,
		labelStr: string,
		defaultVal: string,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => {
		const textbox = new components.Textbox(
			this.gui,
			name,
			labelStr,
			defaultVal,
			valueCallback,
			setupCallback
		);
		this.gui.addField(textbox);
		this.attachField(textbox);
		return textbox;
	};
	addResolutionTextBoxes: GUIAddableInterface['addResolutionTextBoxes'] = (
		defaultWidth: number,
		defaultHeight: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => {
		const resolutionTextboxes = new components.ResolutionTextboxes(
			this.gui,
			defaultWidth,
			defaultHeight,
			valueCallback,
			setupCallback
		);
		this.gui.addField(resolutionTextboxes);
		this.attachField(resolutionTextboxes);
		return resolutionTextboxes;
	};
	addTextArea: GUIAddableInterface['addTextArea'] = (
		name: string,
		labelStr: string,
		defaultVal: string,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => {
		const textArea = new components.Textarea(
			this.gui,
			name,
			labelStr,
			defaultVal,
			valueCallback,
			setupCallback
		);
		this.gui.addField(textArea);
		this.attachField(textArea);
		return textArea;
	};
	addCrementer: GUIAddableInterface['addCrementer'] = (
		name: string,
		labelStr: string,
		minVal: number,
		maxVal: number,
		defaultVal: number,
		stepSize: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => {
		const crementer = new components.Crementer(
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
		this.gui.addField(crementer);
		this.attachField(crementer);
		return crementer;
	};
	addColourBoxes: GUIAddableInterface['addColourBoxes'] = (
		name: string,
		labelStr: string,
		colours: string[],
		defaultIndex: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => {
		const colourBoxes = new components.ColourBoxes(
			this.gui,
			name,
			labelStr,
			colours,
			defaultIndex,
			valueCallback,
			setupCallback
		);
		this.gui.addField(colourBoxes);
		this.attachField(colourBoxes);
		return colourBoxes;
	};
	addMultiColourBoxes: GUIAddableInterface['addMultiColourBoxes'] = (
		name: string,
		labelStr: string,
		colours: string[],
		defaultIndices: number[],
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => {
		const multiColourBoxes = new components.MultiColourBoxes(
			this.gui,
			name,
			labelStr,
			colours,
			defaultIndices,
			valueCallback,
			setupCallback
		);
		this.gui.addField(multiColourBoxes);
		this.attachField(multiColourBoxes);
		return multiColourBoxes;
	};
	addTextLoader: GUIAddableInterface['addTextLoader'] = (
		name: string,
		labelStr: string,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => {
		const textLoader = new components.TextFileLoader(
			this.gui,
			name,
			labelStr,
			valueCallback,
			setupCallback
		);
		this.gui.addField(textLoader);
		this.attachField(textLoader);
		return textLoader;
	};
	addJSONLoader: GUIAddableInterface['addJSONLoader'] = (
		name: string,
		labelStr: string,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => {
		const JSONLoader = new components.JSONFileLoader(
			this.gui,
			name,
			labelStr,
			valueCallback,
			setupCallback
		);
		this.gui.addField(JSONLoader);
		this.attachField(JSONLoader);
		return JSONLoader;
	};
	addImageLoader: GUIAddableInterface['addImageLoader'] = (
		name: string,
		labelStr: string,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => {
		const imageLoader = new components.ImageLoader(
			this.gui,
			name,
			labelStr,
			valueCallback,
			setupCallback
		);
		this.gui.addField(imageLoader);
		this.attachField(imageLoader);
		return imageLoader;
	};
}
