import type { Plugin } from './lib/types';
import {
	appTitlePlugin,
	defaultPlugins,
	randomizerPlugin,
} from './lib/plugins';

export const plugins: Plugin[] = [
	appTitlePlugin('CircleGen'),

	...defaultPlugins,
	randomizerPlugin([
		'colorBoxesCircle',
		'sliderCircleDiameter',
		'colorBoxesBg',
		'sliderNBg',
	]),

	{
		name: 'customPlugin',
		beforeGuiExists(sketch, config) {
			console.log('beforeGuiExists!');
		},
		beforeUserCreatesGui: (gui, sketch, config) => {
			console.log('beforeUserCreatesGui!');
		},
		afterUserCreatesGui: (gui, sketch, config) => {
			console.log('afterUserCreatesGui!');
		},
	},
];
