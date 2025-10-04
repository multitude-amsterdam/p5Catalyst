import {
	appTitlePlugin,
	defaultPlugins,
	randomizerPlugin,
} from '/src/lib/plugins';

export const plugins = [
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
