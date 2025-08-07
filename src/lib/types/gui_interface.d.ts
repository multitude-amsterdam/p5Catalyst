import type { Field } from '../gui/field';
import type { Title } from '../gui/gui';
import { Controller } from '../gui/controller';
import type {
	controllerCallback,
	setupCallback,
	valueCallback,
} from './controller';

export interface GUIControllerInterface {
	addField: (id: string, className: string) => Field;
	addTitle: (hSize: number, text: string, doAlignCenter?: boolean) => Title;
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
}
