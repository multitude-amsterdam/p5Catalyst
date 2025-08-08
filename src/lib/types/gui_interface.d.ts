import type { Field } from '../gui/field';
import type { Title } from '../gui/gui';
import { Controller } from '../gui/controller';
import type {
	controllerCallback,
	setupCallback,
	valueCallback,
} from './controller';

export interface GUIControllerInterface {
	addTitle: (hSize: number, text: string, doAlignCenter?: boolean) => Title;
	addTextField: (
		text: string,
		className?: string,
		doAlignCenter?: boolean
	) => Field;
	addImageField: (
		url: string,
		altText: string,
		doAlignCenter?: boolean
	) => Field;
	addDivider: () => Field;
	addButton: (
		name: string,
		labelStr: string,
		callback?: controllerCallback,
		setupCallback?: setupCallback
	) => Controller;
	addSelect: (
		name: string,
		labelStr: string,
		options: string[],
		defaultIndex: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => Controller;
	addResolutionSelect: (
		labelStr: string,
		resOptions: string[],
		defaultIndex: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => Controller;
	addToggle: (
		name: string,
		labelStr0: string,
		labelStr1: string,
		isToggled: boolean,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => Controller;
	addSlider: (
		name: string,
		labelStr: string,
		minVal: number,
		maxVal: number,
		defaultVal: number,
		stepSize: number,
		valueCallback?: valueCallback,
		setupCallback: setupCallback
	) => Controller;
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
	) => Controller;
	addTextbox: (
		name: string,
		labelStr: string,
		defaultVal: string,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => Controller;
	addResolutionTextBoxes: (
		defaultWidth: number,
		defaultHeight: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => Controller;
	addTextArea: (
		name: string,
		labelStr: string,
		defaultVal: string,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => Controller;
	addCrementer: (
		name: string,
		labelStr: string,
		minVal: number,
		maxVal: number,
		defaultVal: number,
		stepSize: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => Controller;
	addColourBoxes: (
		name: string,
		labelStr: string,
		colours: string[],
		defaultIndex: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => Controller;
	addMultiColourBoxes: (
		name: string,
		labelStr: string,
		colours: string[],
		defaultIndices: number[],
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => Controller;
	addTextLoader: (
		name: string,
		labelStr: string,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => Controller;
	addJSONLoader: (
		name: string,
		labelStr: string,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => Controller;
	addImageLoader: (
		name: string,
		labelStr: string,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) => Controller;
	getController: (name: string) => Controller | undefined;
}
