import type { setupCallback, valueCallback } from '../../../types/controller';
import type { GUIForP5 } from '../../gui';
import { Select } from './Select';
/**
 * Specialised select for common resolutions.
 * @extends Select
 */
export class ResolutionSelect extends Select {
	/**
	 * Flag to control whether the change set should be updated.
	 * @type {boolean}
	 */
	_doUpdateChangeSet: boolean = false;
	constructor(
		gui: GUIForP5,
		labelStr: string,
		resOptions: string[],
		defaultIndex: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		super(
			gui,
			'resolutionSelect',
			labelStr,
			resOptions.map(s => gui.lang.process(s, true)),
			defaultIndex,
			(controller, value) => {
				if (value.indexOf(' x ') >= 0) {
					const resolutionStr = value.split(': ')[1];
					const wh = resolutionStr.split(' x ');
					const w = parseInt(wh[0]);
					const h = parseInt(wh[1]);
					gui.state.resize?.(w, h);
				}
				if (valueCallback) valueCallback(controller, value);
			},
			setupCallback
		);
	}
}
