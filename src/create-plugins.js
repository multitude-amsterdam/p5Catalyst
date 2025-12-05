import {
	appTitlePlugin,
	languagePlugin,
	resolutionPlugin,
	backdropPlugin,
	randomizerPlugin,
	imageExportPlugin,
	videoExportPlugin,
	storeSettingsPlugin,
	webglMode,
	sizedCanvas,
} from './lib/plugins';

export const plugins = [
	appTitlePlugin('CircleGen'), // set app name
	// webglMode(),
	// sizedCanvas(1080, 1080) // fixed-size canvas
	languagePlugin('en'),

	{
		// custom plugin to create tabs
		name: 'create-tabs',
		beforeUserCreatesGui: (gui, sketch, config) => {
			gui.addTabs('appearance', 'export');
		},
	},

	// appearance tab
	resolutionPlugin(), // variable-size canvas
	// (gui creation for appearance in main.js happens here)
	backdropPlugin(), // upload images to show behind and in front of canvas
	randomizerPlugin([
		// names of controllers to add to the randomizer
		'colorBoxesCircle',
		'sliderCircleDiameter',
		'colorBoxesBg',
		'sliderNBg',
	]),

	// export tab
	imageExportPlugin('png'), // download as png
	videoExportPlugin(), // record and download as video
	storeSettingsPlugin(), // download and load settings as json

	// template for custom plugin:
	// {
	// 	name: 'customPlugin',
	// 	beforeGuiExists(sketch, config) {
	// 		console.log('beforeGuiExists!');
	// 	},
	// 	beforeUserCreatesGui: (gui, sketch, config) => {
	// 		console.log('beforeUserCreatesGui!');
	// 	},
	// 	afterUserCreatesGui: (gui, sketch, config) => {
	// 		console.log('afterUserCreatesGui!');
	// 	},
	// },
];
