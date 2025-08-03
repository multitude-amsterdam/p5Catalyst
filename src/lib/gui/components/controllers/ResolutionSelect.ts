import type {
	setupCallback,
	valueCallback,
} from '../../../types/controller_types';
import type { GUIForP5 } from '../../gui';
import { Select } from './Select';
/**
 * Specialised select for common resolutions.
 * @extends Select
 */
export class ResolutionSelect extends Select {
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
			async (controller, value) => {
				if (value.indexOf(' x ') >= 0) {
					const resolutionStr = value.split(': ')[1];
					const wh = resolutionStr.split(' x ');
					const w = parseInt(wh[0]);
					const h = parseInt(wh[1]);
					gui.state.width = w;
					gui.state.height = h;
				}
				if (valueCallback) valueCallback(controller, value);
			},
			setupCallback
		);
	}
}
