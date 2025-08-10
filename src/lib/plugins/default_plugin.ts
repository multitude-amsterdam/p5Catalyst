import { imageExportPlugin } from './imageExport_plugin';
import { languagePlugin } from './language_plugin';
import { resolutionPlugin, resolutionPresets } from './resolution_plugin';
import { setConfigPlugin } from './setConfig_plugin';
import type { Plugin } from '../types';

export const defaultPlugin: Plugin = () => [
	setConfigPlugin({ fileName: 'p5Catalyst' }),
	languagePlugin('en'),
	resolutionPlugin(resolutionPresets),
	imageExportPlugin('jpg'),
];
