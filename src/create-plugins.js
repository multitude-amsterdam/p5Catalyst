import {
	appTitlePlugin,
	languagePlugin,
	resolutionPlugin,
	backdropPlugin,
	randomizerPlugin,
	imageExportPlugin,
	videoExportPlugin,
	storeSettingsPlugin,
	shaderTemplatePlugin,
} from './lib/plugins';

export const plugins = [
	// set app name
	appTitlePlugin('p5Catalyst Project'),

	// creates a glsl shader from a template
	shaderTemplatePlugin(),

	// set language for gui (option to add custom dictionary)
	languagePlugin('en'),

	/* ------------------------------- create tabs ------------------------------ */
	{
		// custom plugin to create tabs
		name: 'create-tabs',
		beforeUserCreatesGui: (gui, sketch, config) => {
			gui.addTabs('appearance', 'export');
		},
	},

	/* ----------------------------- appearance tab ----------------------------- */
	// (gui creation for appearance in main.js happens here)

	// variable-size canvas
	resolutionPlugin(),
	// fixed-size canvas with css scaling
	// sizedCanvasPlugin(),

	// upload images or videos to feed the shader or fallback sketch (backdrop & overlay)
	backdropPlugin(),

	// names of controllers to add to the randomizer
	randomizerPlugin([
		'colorBoxesCircle',
		'sliderCircleDiameter',
		'colorBoxesBg',
		'sliderNBg',
	]),

	/* ------------------------------- export tab ------------------------------- */
	// download as png
	imageExportPlugin('png'),

	// TODO: svg export plugin

	// record and download as video
	videoExportPlugin(),

	// download and load settings as json
	storeSettingsPlugin(),

	/* ----------------------- template for custom plugin ----------------------- */
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
