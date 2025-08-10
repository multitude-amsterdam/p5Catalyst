import type { Field } from '../gui/field';
import type { Title } from '../gui/gui';
import { Controller } from '../gui/controller';
import type {
	controllerCallback,
	setupCallback,
	valueCallback,
} from './controller';
import type {
	Button,
	ColourBoxes,
	Crementer,
	ImageLoader,
	JSONFileLoader,
	MultiColourBoxes,
	ResolutionSelect,
	ResolutionTextboxes,
	Select,
	Slider,
	Textarea,
	Textbox,
	TextField,
	TextFileLoader,
	Toggle,
	XYSlider,
} from '../gui/components';

export interface GUIControllerInterface {
	addTitle: (hSize: number, text: string, doAlignCenter?: boolean) => Title;
	addTextField: (
		text: string,
		className?: string,
		doAlignCenter?: boolean
	) => TextField;
	addImageField: (
		url: string,
		altText: string,
		doAlignCenter?: boolean
	) => ImageField;
	addDivider: () => Field;
	addButton: (
		name: string,
		labelStr: string,
		callback?: controllerCallback,
		setupCallback?: setupCallback
	) => Button;
	addSelect: (
		name: string,
		labelStr: string,
		options: string[],
		defaultIndex: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => Select;
	addResolutionSelect: (
		labelStr: string,
		resOptions: string[],
		defaultIndex: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => ResolutionSelect;
	addToggle: (
		name: string,
		labelStr0: string,
		labelStr1: string,
		isToggled: boolean,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => Toggle;
	addSlider: (
		name: string,
		labelStr: string,
		minVal: number,
		maxVal: number,
		defaultVal: number,
		stepSize: number,
		valueCallback?: valueCallback,
		setupCallback: setupCallback
	) => Slider;
	addXYSlider: (
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
	) => XYSlider;
	addTextbox: (
		name: string,
		labelStr: string,
		defaultVal: string,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => Textbox;
	addResolutionTextBoxes: (
		defaultWidth: number,
		defaultHeight: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => ResolutionTextboxes;
	addTextArea: (
		name: string,
		labelStr: string,
		defaultVal: string,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => Textarea;
	addCrementer: (
		name: string,
		labelStr: string,
		minVal: number,
		maxVal: number,
		defaultVal: number,
		stepSize: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => Crementer;
	addColourBoxes: (
		name: string,
		labelStr: string,
		colours: string[],
		defaultIndex: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => ColourBoxes;
	addMultiColourBoxes: (
		name: string,
		labelStr: string,
		colours: string[],
		defaultIndices: number[],
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => MultiColourBoxes;
	addTextLoader: (
		name: string,
		labelStr: string,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => TextFileLoader;
	addJSONLoader: (
		name: string,
		labelStr: string,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => JSONFileLoader;
	addImageLoader: (
		name: string,
		labelStr: string,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => ImageLoader;
	randomize: () => void;
	getController: <T extends Controller>(name: string) => T | undefined;
}
