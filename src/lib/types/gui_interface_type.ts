import type { Field } from '../gui/field';
import type { Title } from '../gui/gui';
import { Controller } from '../gui/controller';

import type { controllerCallback, setupCallback } from './controller_types';

export interface GUIControllerInterface {
	addField: (id: string, className: string) => Field;
	addTitle: (hSize: number, text: string, doAlignCenter?: boolean) => Title;
	addButton: (
		name: string,
		labelStr: string,
		callback?: controllerCallback,
		setupCallback?: setupCallback
	) => Controller;
}
